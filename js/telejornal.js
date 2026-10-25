/* TELEJORNAL_V1
   Cobertura de noite de eleição: curva de urnas, eventos, narração.
   Sem DOM. A matemática do Anexo A é reproduzida abaixo, sem desvio.
   A cobertura só revela um resultado já calculado. */
(function (root) {
  "use strict";

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function hash32(str) {
    var h = 2166136261;
    var s = String(str);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function fmtInt(n) {
    var s = String(Math.max(0, Math.round(Number(n) || 0)));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function fmtPct(x, casas) {
    var c = casas == null ? 1 : casas;
    var n = Number(x);
    if (!isFinite(n)) n = 0;
    return n.toFixed(c).replace(".", ",");
  }

  function erf(x) {
    var s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
    return s * y;
  }

  /* Anexo A — matriz bloco × partido, IPF, linha do tempo, chamada majoritária. */
  function gerarMatrizBlocos(opts) {
    var totais = opts.totais;
    var blocos = opts.blocos;
    var vies = opts.vies || {};
    var ruido = opts.ruido == null ? 0.15 : opts.ruido;
    var seed = opts.seed == null ? 1 : opts.seed;
    var iter = opts.iter == null ? 50 : opts.iter;
    var r = rng(seed);
    var P = Object.keys(totais);
    var somaBlocos = blocos.reduce(function (s, b) { return s + b.votos; }, 0);
    var somaTot = P.reduce(function (s, p) { return s + totais[p]; }, 0);
    var k = somaTot / somaBlocos;
    var linhas = blocos.map(function (b) { return b.votos * k; });
    var M = blocos.map(function (b) {
      return P.map(function (p) {
        var v = 0;
        if (vies[p]) {
          v = Object.entries(b.perfil || {}).reduce(function (s, par) {
            return s + par[1] * (vies[p][par[0]] || 0);
          }, 0);
        }
        return (totais[p] / somaTot) * Math.exp(v + (r() - 0.5) * 2 * ruido);
      });
    });
    for (var it = 0; it < iter; it++) {
      M.forEach(function (row, i) {
        var s = row.reduce(function (a, b) { return a + b; }, 0);
        row.forEach(function (_, j) { row[j] = row[j] / s * linhas[i]; });
      });
      P.forEach(function (p, j) {
        var s = M.reduce(function (a, row) { return a + row[j]; }, 0);
        M.forEach(function (row) { row[j] = row[j] / s * totais[p]; });
      });
    }
    return { P: P, M: M, linhas: linhas };
  }

  function linhaDoTempo(opts) {
    var passos = opts.passos == null ? 6 : opts.passos;
    var gerado = gerarMatrizBlocos(opts);
    var P = gerado.P;
    var M = gerado.M;
    var blocos = opts.blocos;
    var totais = opts.totais;
    var eventos = [];
    blocos.forEach(function (b, i) {
      for (var c = 1; c <= passos; c++) {
        eventos.push({
          t: b.chegada + (c - 1) * b.duracao / passos,
          bloco: b.id,
          nome: b.nome || b.id,
          frac: 1 / passos,
          votos: P.map(function (p, j) { return M[i][j] / passos; })
        });
      }
    });
    eventos.sort(function (a, b) { return a.t - b.t; });
    var acum = P.map(function () { return 0; });
    var totalFinal = P.reduce(function (s, p) { return s + totais[p]; }, 0);
    var anterior = null;
    var snaps = [];
    eventos.forEach(function (e) {
      e.votos.forEach(function (v, j) { acum[j] += v; });
      var apurado = acum.reduce(function (a, b) { return a + b; }, 0);
      var lider = P[acum.indexOf(Math.max.apply(null, acum))];
      snaps.push({
        t: e.t,
        bloco: e.bloco,
        regiao: e.nome,
        pct_apurado: apurado / totalFinal,
        parcial: Object.fromEntries(P.map(function (p, j) { return [p, acum[j]]; })),
        lider: lider,
        virada: !!(anterior && anterior !== lider)
      });
      anterior = lider;
    });
    return snaps;
  }

  function situacaoMajoritaria(snap, totalEsperado) {
    var arr = Object.entries(snap.parcial).sort(function (a, b) { return b[1] - a[1]; });
    var apurado = arr.reduce(function (s, par) { return s + par[1]; }, 0);
    var restante = Math.max(0, totalEsperado - apurado);
    var lider = arr[0];
    var seg = arr[1] || ["", 0];
    var matematico = lider[1] - seg[1] > restante;
    var z = (lider[1] - seg[1]) / Math.max(1, restante * 0.35);
    var p = 0.5 * (1 + erf(z / Math.SQRT2));
    if (restante <= 1e-6) p = 1;
    return {
      lider: lider[0],
      segundo: seg[0],
      vantagem: lider[1] - seg[1],
      restante: restante,
      matematico: matematico,
      pVitoria: p,
      apurado: apurado,
      liderVotos: lider[1]
    };
  }

  function blocosAnexoB() {
    return [
      { id: "capital_centro", nome: "Capital — centro", votos: 200000, perfil: { urbano: 1 }, chegada: 0, duracao: 20 },
      { id: "capital_periferia", nome: "Capital — periferia", votos: 250000, perfil: { urbano: 0.6, periferia: 1 }, chegada: 5, duracao: 30 },
      { id: "regiao_metro", nome: "Região metropolitana", votos: 220000, perfil: { urbano: 0.7, periferia: 0.5 }, chegada: 15, duracao: 35 },
      { id: "interior_a", nome: "Interior", votos: 180000, perfil: { rural: 1 }, chegada: 30, duracao: 40 },
      { id: "interior_b", nome: "Interior distante", votos: 150000, perfil: { rural: 1 }, chegada: 40, duracao: 40 }
    ];
  }

  function viesAnexoB() {
    return {
      A: { urbano: 0.35, periferia: -0.20, rural: -0.40 },
      B: { urbano: -0.30, periferia: 0.25, rural: 0.45 },
      C: { urbano: 0.10, periferia: 0, rural: -0.10 }
    };
  }

  function cenarioAnexoB(qual) {
    return {
      totais: qual === "B2" ? { A: 450000, B: 470000, C: 80000 } : { A: 480000, B: 440000, C: 80000 },
      blocos: blocosAnexoB(),
      vies: viesAnexoB(),
      seed: 7,
      ruido: 0.15,
      passos: 6
    };
  }

  function somasMatriz(opts) {
    var g = gerarMatrizBlocos(opts);
    var col = {};
    g.P.forEach(function (p, j) {
      col[p] = g.M.reduce(function (s, row) { return s + row[j]; }, 0);
    });
    var linhas = g.M.map(function (row) { return row.reduce(function (s, v) { return s + v; }, 0); });
    return { P: g.P, colunas: col, linhas: linhas, M: g.M };
  }

  function snapNoPct(snaps, alvo) {
    for (var i = 0; i < snaps.length; i++) {
      if (snaps[i].pct_apurado + 1e-12 >= alvo) return snaps[i];
    }
    return snaps[snaps.length - 1];
  }

  function sharesDe(snap) {
    var ap = Object.keys(snap.parcial).reduce(function (s, k) { return s + snap.parcial[k]; }, 0) || 1;
    var o = {};
    Object.keys(snap.parcial).forEach(function (k) { o[k] = snap.parcial[k] / ap; });
    return o;
  }

  function marcoPct(snaps, alvo, total) {
    var snap = snapNoPct(snaps, alvo);
    var sit = situacaoMajoritaria(snap, total);
    var sh = sharesDe(snap);
    return {
      pct: alvo,
      t: snap.t,
      lider: snap.lider,
      A: sh.A,
      B: sh.B,
      C: sh.C,
      pVitoria: sit.pVitoria,
      matematico: sit.matematico,
      vantagem: sit.vantagem,
      restante: sit.restante
    };
  }

  function primeiraVirada(snaps) {
    for (var i = 0; i < snaps.length; i++) if (snaps[i].virada) return snaps[i];
    return null;
  }

  function blocosDeTotal(total, nomes) {
    var base = blocosAnexoB();
    var soma = base.reduce(function (s, b) { return s + b.votos; }, 0);
    var acc = 0;
    return base.map(function (b, i) {
      var v = i === base.length - 1 ? Math.round(total - acc) : Math.round(total * b.votos / soma);
      acc += v;
      var copia = {
        id: b.id,
        nome: (nomes && nomes[i]) || b.nome,
        votos: v,
        perfil: b.perfil,
        chegada: b.chegada,
        duracao: b.duracao
      };
      return copia;
    });
  }

  function viesDeChaves(chaves, seed) {
    var vies = {};
    chaves.forEach(function (id, i) {
      var r = rng((hash32(id) ^ seed ^ (i * 997)) >>> 0);
      vies[id] = {
        urbano: (r() - 0.5) * 0.9,
        periferia: (r() - 0.5) * 0.6,
        rural: (r() - 0.5) * 1.0
      };
    });
    return vies;
  }

  /* Distribui o voto do partido no bloco entre candidatos, proporcional ao total final, com ruído. */
  function matrizCandidatos(opts, gerado) {
    var partidos = opts.partidos || [];
    var r = rng((opts.seed || 1) ^ 0x5eed);
    var porPartido = {};
    partidos.forEach(function (p) {
      var cands = (p.candidatos || []).filter(function (c) { return (c.votos || 0) > 0; });
      if (!cands.length) return;
      var j = gerado.P.indexOf(p.id);
      if (j < 0) return;
      var pesos = cands.map(function (c) {
        return Math.max(1e-9, (c.votos || 0) * Math.exp((r() - 0.5) * 0.35));
      });
      var ps = pesos.reduce(function (s, v) { return s + v; }, 0);
      porPartido[p.id] = opts.blocos.map(function (_, i) {
        var fatia = gerado.M[i][j];
        return cands.map(function (c, k) {
          return { id: c.id, nome: c.nome, partido: p.id, votos: fatia * pesos[k] / ps };
        });
      });
    });
    return porPartido;
  }

  function parcialCandidatos(porPartido, ateBlocoFracao) {
    var acc = {};
    Object.keys(porPartido).forEach(function (pid) {
      porPartido[pid].forEach(function (lista, i) {
        var usado = ateBlocoFracao[i] || 0;
        lista.forEach(function (c) {
          if (!acc[c.id]) acc[c.id] = { id: c.id, nome: c.nome, partido: c.partido, votos: 0 };
          acc[c.id].votos += c.votos * usado;
        });
      });
    });
    return acc;
  }

  /* Fração de cada bloco já contada quando o relógio da curva está em t. */
  function fracaoBlocos(blocos, t, passos) {
    passos = passos || 6;
    return blocos.map(function (b) {
      if (t < b.chegada) return 0;
      var andou = Math.min(b.duracao, t - b.chegada);
      var fatias = Math.floor(andou / b.duracao * passos + 1e-9);
      if (t >= b.chegada + b.duracao - 1e-9) return 1;
      return Math.max(0, Math.min(1, fatias / passos));
    });
  }

  function qeArredondadoLocal(validos, vagas) {
    if (typeof root.qeArredondado === "function") return root.qeArredondado(validos, vagas);
    var q = validos / vagas, f = Math.floor(q), frac = q - f;
    return frac > 0.5 ? f + 1 : f;
  }

  function entradaProporcional(partidos, vagas) {
    return {
      vagas: vagas,
      partidos: partidos.map(function (p) {
        return {
          id: p.id,
          votos_legenda: p.votos_legenda || 0,
          candidatos: (p.candidatos || []).map(function (c) {
            return { id: c.id, nome: c.nome, votos: Math.max(0, Math.round(c.votos || 0)), idade: c.idade || 40, partido: c.partido || p.id, jogador: !!c.jogador };
          })
        };
      })
    };
  }

  function projetarCadeiras(snap, meta) {
    if (!meta || !meta.vagas || !meta.apurar || snap.pct_apurado < 0.02) return null;
    var fator = 1 / snap.pct_apurado;
    var partidos = (meta.partidos || []).map(function (p) {
      var base = snap.parcial[p.id] || 0;
      var projetado = base * fator;
      var legenda = p.votos_legenda || 0;
      var somaCand = (p.candidatos || []).reduce(function (s, c) { return s + (c.votos || 0); }, 0) || 1;
      var cands = (p.candidatos || []).map(function (c) {
        var nominal = Math.max(0, projetado - legenda * (projetado / Math.max(1, (snap._totais && snap._totais[p.id]) || projetado)));
        /* Reparte o projetado do partido na mesma proporção do resultado final. */
        var fatia = (p._total || (somaCand + legenda)) > 0 ? (c.votos || 0) / (somaCand + legenda) : 0;
        return { id: c.id, nome: c.nome, votos: Math.max(0, Math.round(projetado * ((c.votos || 0) / (somaCand || 1)))), idade: c.idade || 40, partido: c.partido || p.id, jogador: !!c.jogador, _fatia: fatia };
      });
      var somaAgora = cands.reduce(function (s, c) { return s + c.votos; }, 0);
      var legendProj = Math.max(0, Math.round(projetado - somaAgora));
      return { id: p.id, votos_legenda: legendProj, candidatos: cands, _projetado: projetado };
    });
    try {
      return meta.apurar({ vagas: meta.vagas, partidos: partidos });
    } catch (e) {
      return null;
    }
  }

  /* confirmavel: mínimo do candidato, máximo de cada rival com os votos que faltam. */
  function confirmavel(candId, snap, meta) {
    if (!meta || !meta.apurar || !meta.vagas) return false;
    var total = meta.total || 0;
    var apurado = Object.keys(snap.parcial).reduce(function (s, k) { return s + snap.parcial[k]; }, 0);
    var restante = Math.max(0, total - apurado);
    if (restante <= 1) {
      var oficial = meta.resultadoOficial;
      if (!oficial) return false;
      return (oficial.eleitos || []).some(function (e) { return e.candidato === candId || e.id === candId; });
    }
    var partidos = meta.partidos || [];
    var dono = null;
    partidos.forEach(function (p) {
      (p.candidatos || []).forEach(function (c) { if (c.id === candId) dono = p.id; });
    });
    if (!dono) return false;
    function montar(alvoRestante) {
      return {
        vagas: meta.vagas,
        partidos: partidos.map(function (p) {
          var atual = snap.parcial[p.id] || 0;
          var extra = p.id === alvoRestante ? restante : 0;
          var cheio = atual + extra;
          var somaCand = (p.candidatos || []).reduce(function (s, c) { return s + (c.votos || 0); }, 0) || 1;
          var cands = (p.candidatos || []).map(function (c) {
            var base = atual * ((c.votos || 0) / somaCand);
            var mais = 0;
            if (p.id === alvoRestante) mais = extra * ((c.votos || 0) / somaCand);
            if (c.id === candId) mais = 0;
            return { id: c.id, nome: c.nome, votos: Math.max(0, Math.round(base + (c.id === candId ? 0 : mais))), idade: c.idade || 40, jogador: !!c.jogador };
          });
          if (p.id === alvoRestante) {
            var soma = cands.reduce(function (s, c) { return s + c.votos; }, 0);
            var folga = Math.round(cheio - soma);
            if (folga > 0) {
              var rival = cands.filter(function (c) { return c.id !== candId; }).sort(function (a, b) { return b.votos - a.votos; })[0];
              if (rival) rival.votos += folga;
              else return { id: p.id, votos_legenda: folga, candidatos: cands };
            }
          }
          var soma2 = cands.reduce(function (s, c) { return s + c.votos; }, 0);
          return { id: p.id, votos_legenda: Math.max(0, Math.round(cheio - soma2)), candidatos: cands };
        })
      };
    }
    var rivais = partidos.map(function (p) { return p.id; }).filter(function (id) { return id !== dono; });
    if (!rivais.length) rivais = [dono];
    for (var i = 0; i < rivais.length; i++) {
      var entradaPior = montar(rivais[i]);
      var res;
      try { res = meta.apurar(entradaPior); } catch (e) { return false; }
      var segue = (res.eleitos || []).some(function (e) { return e.candidato === candId; });
      if (!segue) return false;
    }
    var resZero;
    try { resZero = meta.apurar(montar(null)); } catch (e2) { return false; }
    return (resZero.eleitos || []).some(function (e) { return e.candidato === candId; });
  }

  function chamadaEleito(sit, total, opts) {
    opts = opts || {};
    if (!sit) return false;
    if (opts.tipo === "proporcional") return false;
    if (opts.maioria && opts.turno !== 2) return sit.liderVotos > total / 2;
    return !!sit.matematico;
  }

  function detectarEventos(snaps, opts) {
    opts = opts || {};
    var total = opts.total;
    var eventos = [];
    var marcos = [0.01, 0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99, 1];
    var viuMarco = {};
    var liderAnt = null;
    var maxVant = 0;
    var foto = false;
    var empate = false;
    var matematico = false;
    var projetado = false;
    var vantagemAnt = 0;
    snaps.forEach(function (snap) {
      var sit = situacaoMajoritaria(snap, total);
      var ap = sit.apurado || 1;
      var vantPp = ap > 0 ? (sit.vantagem / ap) * 100 : 0;
      marcos.forEach(function (m) {
        var id = "urnas_" + Math.round(m * 100) + "pct";
        if (!viuMarco[id] && snap.pct_apurado + 1e-9 >= m) {
          viuMarco[id] = 1;
          eventos.push({
            id: id, tipo: id, t: snap.t, prioridade: 30 + Math.round(m * 20),
            dados: { pct_apurado: snap.pct_apurado, lider: sit.lider, regiao: snap.regiao }
          });
        }
      });
      if (!liderAnt) {
        eventos.push({ id: "primeiro_lider", tipo: "primeiro_lider", t: snap.t, prioridade: 45, dados: { lider: sit.lider, regiao: snap.regiao } });
      } else if (sit.lider !== liderAnt) {
        var foiVirada = maxVant >= 10;
        eventos.push({
          id: foiVirada ? "virada" : "mudanca_lideranca",
          tipo: foiVirada ? "virada" : "mudanca_lideranca",
          t: snap.t,
          prioridade: foiVirada ? 90 : 80,
          dados: { lider: sit.lider, anterior: liderAnt, pct_apurado: snap.pct_apurado, regiao: snap.regiao, vantagem_pp: vantPp }
        });
        maxVant = 0;
      }
      if (vantPp > maxVant) maxVant = vantPp;
      if (!foto && vantPp < 0.3 && snap.pct_apurado >= 0.9) {
        foto = true;
        eventos.push({ id: "foto_finish", tipo: "foto_finish", t: snap.t, prioridade: 92, dados: { vantagem_pp: vantPp, lider: sit.lider, segundo: sit.segundo } });
      }
      if (!empate && vantPp < 1 && snap.pct_apurado >= 0.15 && snap.pct_apurado < 0.9) {
        empate = true;
        eventos.push({ id: "empate_tecnico", tipo: "empate_tecnico", t: snap.t, prioridade: 70, dados: { vantagem_pp: vantPp, lider: sit.lider } });
      }
      if (vantagemAnt - vantPp > 8 && snap.pct_apurado > 0.2) {
        eventos.push({ id: "vantagem_encolhe", tipo: "vantagem_encolhe", t: snap.t, prioridade: 55, dados: { lider: sit.lider, vantagem_pp: vantPp } });
      }
      if (!matematico && sit.matematico && chamadaEleito(sit, total, opts)) {
        matematico = true;
        eventos.push({
          id: "vitoria_matematica", tipo: "vitoria_matematica", t: snap.t, prioridade: 95,
          dados: { lider: sit.lider, segundo: sit.segundo, vantagem: sit.vantagem, restante: sit.restante, pVitoria: sit.pVitoria, confirmado: true }
        });
      }
      if (!projetado && sit.pVitoria >= 0.97 && !sit.matematico) {
        projetado = true;
        eventos.push({
          id: "projecao_eleito", tipo: "projecao_eleito", t: snap.t, prioridade: 84,
          dados: { lider: sit.lider, pVitoria: sit.pVitoria, confirmado: false }
        });
      }
      liderAnt = sit.lider;
      vantagemAnt = vantPp;
    });
    eventos.sort(function (a, b) { return a.t - b.t || b.prioridade - a.prioridade; });
    return eventos;
  }

  var CANAIS = [
    { id: "V4", pele: "Rede Horizonte", arquetipo: "TV Nacional", estilo: "solene", ritmo: 1, rigor: 70, sensacionalismo: 45, vies: "centro", grafico: "sobrio" },
    { id: "V3", pele: "Canal 24h Brasil", arquetipo: "Cabo 24h", estilo: "plantao", ritmo: 0.82, rigor: 65, sensacionalismo: 55, vies: "neutro", grafico: "dados" },
    { id: "V5", pele: "TV Aliança", arquetipo: "Canal Popular", estilo: "popular", ritmo: 1, rigor: 50, sensacionalismo: 70, vies: "popular", grafico: "quente" },
    { id: "V8", pele: "Independente Investigativo", arquetipo: "Independente", estilo: "analitico", ritmo: 1.08, rigor: 70, sensacionalismo: 55, vies: "esquerda", grafico: "contexto" },
    { id: "V7", pele: "Portal Direita Livre", arquetipo: "Opinião+", estilo: "combativo", ritmo: 0.8, rigor: 50, sensacionalismo: 70, vies: "direita", grafico: "provocativo" },
    { id: "V6", pele: "Agência Fato Brasil", arquetipo: "Agência", estilo: "seco", ritmo: 1, rigor: 90, sensacionalismo: 15, vies: "neutro", grafico: "tabela" },
    { id: "V10", pele: "Global Markets Desk", arquetipo: "Internacional", estilo: "mercado", ritmo: 1.15, rigor: 90, sensacionalismo: 25, vies: "financeiro", grafico: "minimo" }
  ];

  function canalPorId(id) {
    return CANAIS.filter(function (c) { return c.id === id; })[0] || CANAIS[0];
  }

  var NOMES_A = ["Helena", "Caio", "Nara", "Davi", "Lívia", "Otto", "Clara", "Heitor", "Bia", "Renan", "Tereza", "Igor", "Luma", "Iara", "Selma", "Nina"];
  var NOMES_B = ["Vasques", "Leme", "Pacheco", "Queiroz", "Bentes", "Ramalho", "Vidal", "Lanhas", "Cunha", "Foques", "Prates", "Dutra", "Kessel", "Linhares", "Bastos", "Mol"];

  function nomeGerado(r) {
    return NOMES_A[Math.floor(r() * NOMES_A.length)] + " " + NOMES_B[Math.floor(r() * NOMES_B.length)];
  }

  function elenco(seed, canalId) {
    var r = rng((seed || 1) ^ hash32(canalId || "V4") ^ 0xC0C0);
    var usados = {};
    function unico() {
      var n = nomeGerado(r);
      var g = 0;
      while (usados[n] && g < 20) { n = nomeGerado(r); g++; }
      usados[n] = 1;
      return n;
    }
    var papeis = [
      ["ancora", "Âncora"],
      ["coancora", "Co-âncora"],
      ["analista", "Analista de dados"],
      ["professor", "Especialista eleitoral"],
      ["comentarista", "Comentarista"],
      ["comentarista2", "Comentarista"],
      ["reporter", "Repórter de comitê"],
      ["rua", "Repórter de praça"],
      ["mundo", "Correspondente"]
    ];
    return papeis.map(function (p, i) {
      var cor = ["#8ec5ff", "#f0c27a", "#9ad7c2", "#d7b4f3", "#f3b4c4", "#c9d4e8", "#f2d39a", "#b7d99a", "#e7e2d8"][i];
      return {
        id: p[0],
        nome: unico(),
        papel: p[1],
        voz: { pitch: 0.85 + r() * 0.4, rate: 0.92 + r() * 0.16 },
        rigor: 40 + Math.floor(r() * 50),
        sensacionalismo: Math.floor(r() * 80),
        bordoes: r() < 0.5 ? [] : [r() < 0.5 ? "vamos aos números" : "cabe na conta"],
        silhueta: { cor: cor, forma: ["redondo", "quadrado", "gota"][i % 3] }
      };
    });
  }

  function bagDe(snap, opts, sit) {
    var sh = sharesDe(snap);
    var lider = sit.lider;
    var segundo = sit.segundo;
    var nomes = opts.nomes || {};
    function nome(id) { return nomes[id] || id; }
    var t = snap.t;
    function slot(v) { return { v: v, t: t }; }
    var ap = sit.apurado || 1;
    var vantPp = (sit.vantagem / ap) * 100;
    return {
      circunscricao: slot(opts.circunscricao || "o país"),
      ano: slot(String(opts.ano || "")),
      cargo: slot(opts.cargo || "a disputa"),
      vagas: slot(String(opts.vagas || "")),
      pct_apurado: slot(fmtPct(snap.pct_apurado * 100)),
      partido: slot(nome(lider)),
      partido_ant: slot(nome(opts._liderAnt || segundo)),
      candidato: slot(nome(lider)),
      candidato2: slot(nome(segundo)),
      pct: slot(fmtPct((sh[lider] || 0) * 100)),
      pct2: slot(fmtPct((sh[segundo] || 0) * 100)),
      vantagem: slot(fmtPct(vantPp)),
      votos: slot(fmtInt(sit.vantagem)),
      restante: slot(fmtInt(sit.restante)),
      regiao: slot(snap.regiao || "as primeiras zonas"),
      cidade: slot(snap.regiao || "a capital"),
      projecao: slot(fmtPct(sit.pVitoria * 100, 0)),
      qe: slot(opts.qeTexto || "—"),
      cadeiras: slot(opts.cadeirasTexto || "—"),
      media: slot(opts.mediaTexto || "—"),
      jogador: slot(opts.jogador || "o candidato"),
      pauta: slot(opts.pauta || "o custo de vida"),
      grupo: slot(opts.grupo || "quem foi às urnas"),
      minutos: slot("alguns minutos")
    };
  }

  function preencher(template, bag, tFala) {
    var ok = true;
    var slots = [];
    var texto = String(template).replace(/\{([a-z0-9_]+)\}/gi, function (_, k) {
      var slot = bag[k];
      if (!slot || slot.t > tFala + 1e-6) { ok = false; return ""; }
      slots.push({ nome: k, t_dado: slot.t });
      return slot.v;
    });
    if (!ok) return null;
    return { texto: texto.replace(/\s+/g, " ").trim(), slots: slots };
  }

  function pecas() {
    return root.TelejornalFalas || (typeof TelejornalFalas !== "undefined" ? TelejornalFalas : null);
  }

  function escolherPeca(lista, memoria, r, chave) {
    if (!lista || !lista.length) return "";
    var i, id, g;
    for (g = 0; g < 6; g++) {
      i = Math.floor(r() * lista.length);
      id = chave + "#" + i;
      if (memoria.blocos.indexOf(id) >= 0) continue;
      memoria.blocos.push(id);
      if (memoria.blocos.length > 30) memoria.blocos.shift();
      return { texto: lista[i], id: id };
    }
    i = Math.floor(r() * lista.length);
    return { texto: lista[i], id: chave + "#f" + i };
  }

  function narrar(tipo, estilo, tom, bag, tFala, memoria, r, permiteEleito) {
    var banco = pecas();
    if (!banco) return { texto: "", slots: [], peca_ids: [] };
    var est = banco[tipo] && (banco[tipo][estilo] || banco[tipo].solene);
    if (!est) est = banco.marco && banco.marco.solene;
    if (!est) return { texto: "", slots: [], peca_ids: [] };
    var partes = ["abertura", "corpo", "fecho"];
    var saida = [];
    var slots = [];
    var ids = [];
    for (var p = 0; p < partes.length; p++) {
      var lista = (est[partes[p]] || []).slice();
      if (!permiteEleito) {
        lista = lista.filter(function (linha) { return !/\beleitos?\b|\beleitas?\b/i.test(linha); });
      }
      if (!lista.length) continue;
      var peca = null;
      var cheio = null;
      var tent;
      for (tent = 0; tent < 8; tent++) {
        peca = escolherPeca(lista, memoria, r, tipo + ":" + estilo + ":" + partes[p] + ":" + tom);
        cheio = preencher(peca.texto, bag, tFala);
        if (cheio && memoria.hashes.indexOf(cheio.texto) < 0) break;
        cheio = null;
      }
      if (!cheio) {
        peca = { texto: lista[0], id: tipo + ":queda" };
        cheio = preencher(peca.texto, bag, tFala);
      }
      if (!cheio) continue;
      saida.push(cheio.texto);
      slots = slots.concat(cheio.slots);
      ids.push(peca.id);
      memoria.hashes.push(cheio.texto);
      if (memoria.hashes.length > 300) memoria.hashes.shift();
    }
    var texto = saida.join(" ");
    if (memoria.bordao && memoria.ultimoBordao !== texto && (memoria.tBordao == null || tFala - memoria.tBordao > 90)) {
      memoria.bordaoConta = memoria.bordaoConta || 0;
      if (memoria.bordaoConta < 4 && r() < 0.25) {
        texto = texto + " " + memoria.bordao.charAt(0).toUpperCase() + memoria.bordao.slice(1) + ".";
        memoria.bordaoConta++;
        memoria.tBordao = tFala;
      }
    }
    return { texto: texto, slots: slots, peca_ids: ids, tom: tom };
  }

  var TIPO_SEGMENTO = {
    urnas_1pct: "marco", urnas_5pct: "marco", urnas_10pct: "explicador_regras", urnas_25pct: "analise_telao",
    urnas_50pct: "marco", urnas_75pct: "analise_telao", urnas_90pct: "disputa_ultima_vaga", urnas_95pct: "analise_telao",
    urnas_99pct: "projecao", urnas_100pct: "encerramento",
    primeiro_lider: "marco", mudanca_lideranca: "virada", virada: "virada", foto_finish: "disputa_ultima_vaga",
    empate_tecnico: "analise_telao", vantagem_encolhe: "analise_telao",
    projecao_eleito: "projecao", vitoria_matematica: "chamada"
  };

  var GRAFICO = {
    abertura: "vinheta", boca_de_urna: "pesquisa", marco: "placar", analise_telao: "placar",
    explicador_regras: "qe", virada: "curva", disputa_ultima_vaga: "duelo", projecao: "placar",
    chamada: "chamada", encerramento: "hemiciclo", ao_vivo_qg: "candidatos", curiosidade: "mapa",
    sobras_passo_a_passo: "sobras", destaque_candidato: "candidatos", intervalo: "vinheta"
  };

  function tomDe(tipo, canal) {
    if (tipo === "virada" || tipo === "foto_finish" || tipo === "chamada") {
      if (canal.estilo === "combativo" || canal.estilo === "popular") return "emotivo";
      if (canal.estilo === "analitico" || canal.estilo === "mercado") return "analitico";
      return "tenso";
    }
    if (tipo === "explicador_regras" || tipo === "sobras_passo_a_passo") return "didatico";
    if (canal.estilo === "seco") return "informativo";
    if (canal.estilo === "popular") return "emotivo";
    if (canal.estilo === "combativo") return "ironico";
    if (canal.estilo === "analitico" || canal.estilo === "mercado") return "analitico";
    return "informativo";
  }

  function pessoaDe(tipo, elencoLista) {
    var papel = "ancora";
    if (tipo === "explicador_regras" || tipo === "sobras_passo_a_passo") papel = "professor";
    else if (tipo === "analise_telao" || tipo === "projecao") papel = "analista";
    else if (tipo === "comentarista_debate") papel = "comentarista";
    else if (tipo === "ao_vivo_qg" || tipo === "destaque_candidato") papel = "reporter";
    else if (tipo === "curiosidade") papel = "rua";
    var achou = elencoLista.filter(function (p) { return p.id === papel; })[0];
    return achou || elencoLista[0];
  }

  function curvaTela(u) {
    if (u <= 0.08) return 0;
    var x = (u - 0.08) / 0.92;
    if (x < 0.18) return (x / 0.18) * 0.10;
    if (x < 0.72) return 0.10 + ((x - 0.18) / 0.54) * 0.72;
    return 0.82 + ((x - 0.72) / 0.28) * 0.18;
  }

  function duracaoModo(modo, cargo) {
    if (modo === "flash") return 70;
    if (modo === "curto") return 150;
    if (modo === "completo") return 780;
    if (modo === "madrugada") return 1500;
    if (modo === "padrao") return 420;
    if (cargo === "VER" || cargo === "PREF") return 150;
    if (cargo === "PRES") return 780;
    return 420;
  }

  function roteirizar(snaps, eventos, opts) {
    var canal = canalPorId(opts.canal || "V4");
    var dur = opts.duracao_s || duracaoModo(opts.modo, opts.cargoId);
    var gap = 40 * (dur / 420);
    var elencoLista = opts.elenco || elenco(opts.seed || 1, canal.id);
    var memoria = { blocos: (opts.memoriaNoites || []).slice(), hashes: [], bordao: (elencoLista[0].bordoes || [])[0] || "" };
    var r = rng(((opts.seed || 1) ^ hash32(canal.id) ^ 0xA11A) >>> 0);
    var tMax = snaps[snaps.length - 1].t || 1;
    var total = opts.total;
    var finalSit = situacaoMajoritaria(snaps[snaps.length - 1], total);
    var itens = [];
    function empurrar(item) { itens.push(item); }

    function falarEm(tipoSeg, tCurva, prioridade, extra) {
      extra = extra || {};
      var snap = snapNoPct(snaps, Math.max(0, (function () {
        var melhor = snaps[0];
        for (var i = 0; i < snaps.length; i++) if (snaps[i].t <= tCurva + 1e-6) melhor = snaps[i];
        return melhor.pct_apurado;
      })()));
      var sit = situacaoMajoritaria(snap, total);
      if (opts._liderPorT) opts._liderAnt = opts._liderPorT(snap.t);
      var bag = bagDe(snap, opts, sit);
      if (extra.bag) Object.keys(extra.bag).forEach(function (k) { bag[k] = extra.bag[k]; });
      var tom = extra.tom || tomDe(tipoSeg, canal);
      var permite = !!extra.permiteEleito && (sit.matematico || extra.confirmado);
      var fala = narrar(tipoSeg, canal.estilo, tom, bag, snap.t, memoria, r, permite);
      var quem = extra.pessoa || pessoaDe(tipoSeg, elencoLista);
      return {
        t_curva: snap.t,
        tipo: tipoSeg,
        prioridade: prioridade,
        personagem_id: quem.id,
        personagem: quem.nome,
        papel: quem.papel,
        texto: fala.texto,
        slots: fala.slots,
        tom: tom,
        canal: canal.id,
        tarja: extra.tarja || (prioridade >= 85 ? "ÚLTIMA HORA" : ""),
        grafico: extra.grafico || GRAFICO[tipoSeg] || "placar",
        confirmado: !!(extra.confirmado && sit.matematico),
        canal_chamou_errado: !!extra.errado,
        porque: { prioridade: prioridade, tom: tom, canal: canal.pele, cooldown: gap, estilo: canal.estilo }
      };
    }

    empurrar(falarEm("abertura", 0, 40, { tarja: "", grafico: "vinheta", pessoa: elencoLista[0] }));
    var extraBoca = { grafico: "pesquisa", pessoa: elencoLista[2] };
    if (opts.boca && opts.boca.partes) {
      var partesB = opts.boca.partes;
      var ordemB = Object.keys(partesB).sort(function (a, b) { return partesB[b] - partesB[a]; });
      var nomeB = function (id) { return (opts.nomes && opts.nomes[id]) || id; };
      extraBoca.bag = {
        partido: { v: nomeB(ordemB[0]), t: 0 },
        candidato: { v: nomeB(ordemB[0]), t: 0 },
        candidato2: { v: nomeB(ordemB[1] || ordemB[0]), t: 0 },
        pct: { v: fmtPct(partesB[ordemB[0]] * 100), t: 0 },
        pct2: { v: fmtPct((partesB[ordemB[1] || ordemB[0]] || 0) * 100), t: 0 },
        pct_apurado: { v: "0,0", t: 0 }
      };
    }
    empurrar(falarEm("boca_de_urna", 0, 42, extraBoca));

    var ultimoTipo = {};
    eventos.forEach(function (ev) {
      var tipo = TIPO_SEGMENTO[ev.tipo] || "marco";
      if (ev.prioridade >= 70 && !TIPO_SEGMENTO[ev.tipo]) tipo = "analise_telao";
      var interrompe = ev.prioridade >= 85;
      if (!interrompe && ultimoTipo[tipo] != null && ev.t - ultimoTipo[tipo] < (gap / dur) * tMax) return;
      ultimoTipo[tipo] = ev.t;
      var extra = {};
      if (ev.tipo === "vitoria_matematica") {
        extra.permiteEleito = true;
        extra.confirmado = true;
        extra.tarja = "CHAMADA";
        extra.grafico = "chamada";
      }
      if (ev.tipo === "projecao_eleito") extra.grafico = "placar";
      if (ev.tipo === "virada") extra.tarja = "ÚLTIMA HORA";
      empurrar(falarEm(tipo, ev.t, ev.prioridade, extra));
      if (ev.prioridade >= 80 && tipo !== "comentarista_debate" && dur >= 150) {
        empurrar(falarEm("comentarista_debate", ev.t, ev.prioridade - 5, { pessoa: elencoLista[4] }));
      }
    });

    if (canal.sensacionalismo >= 70 && canal.rigor <= 50) {
      var cedo = null;
      for (var s = 0; s < snaps.length; s++) {
        var sitS = situacaoMajoritaria(snaps[s], total);
        if (sitS.pVitoria >= 0.97 && !sitS.matematico && sitS.lider !== finalSit.lider) { cedo = snaps[s]; break; }
      }
      if (cedo && r() < 0.85) {
        var errada = falarEm("chamada", cedo.t, 96, { permiteEleito: true, confirmado: false, errado: true, tarja: "CHAMADA", grafico: "chamada" });
        errada.confirmado = false;
        errada.canal_chamou_errado = true;
        empurrar(errada);
      }
    }

    if (opts.passosSobras && opts.passosSobras.length && dur >= 150) {
      empurrar(falarEm("sobras_passo_a_passo", tMax, 82, {
        grafico: "sobras",
        bag: { media: { v: opts.mediaTexto || "a maior média", t: tMax }, qe: { v: opts.qeTexto || "—", t: tMax } }
      }));
    }
    empurrar(falarEm("encerramento", tMax, 40, { grafico: "hemiciclo" }));

    function ordemPrograma(it) {
      if (it.tipo === "abertura") return 0;
      if (it.tipo === "boca_de_urna") return 1;
      if (it.tipo === "encerramento") return 3;
      return 2;
    }
    itens.sort(function (a, b) {
      var oa = ordemPrograma(a), ob = ordemPrograma(b);
      if (oa !== ob) return oa - ob;
      return a.t_curva - b.t_curva || b.prioridade - a.prioridade;
    });
    var roteiro = [];
    var cursor = 0;
    var fatia = dur / Math.max(1, itens.length);
    itens.forEach(function (it, idx) {
      var u = it.t_curva / tMax;
      var preferido = u * dur * 0.86;
      var ini = Math.max(cursor, preferido);
      if (idx === 0) ini = 0;
      var fim = Math.min(dur, ini + Math.max(8, fatia * (canal.ritmo || 1)));
      if (idx === itens.length - 1) fim = dur;
      it.t_ini = ini;
      it.t_fim = Math.max(ini + 4, fim);
      cursor = it.t_fim;
      roteiro.push(it);
    });
    if (roteiro.length) roteiro[roteiro.length - 1].t_fim = dur;
    return { roteiro: roteiro, elenco: elencoLista, canal: canal, duracao_s: dur, memoria: memoria.hashes.slice() };
  }

  function enriquecer(snaps, total) {
    var ant = null;
    return snaps.map(function (snap) {
      var sit = situacaoMajoritaria(snap, total);
      var copia = Object.assign({}, snap, { sit: sit });
      if (ant && ant !== sit.lider) copia.virada = true;
      ant = sit.lider;
      return copia;
    });
  }

  function montarCobertura(opts) {
    opts = Object.assign({}, opts);
    var totais = opts.totais;
    var total = Object.keys(totais).reduce(function (s, k) { return s + totais[k]; }, 0);
    opts.total = total;
    var snaps = linhaDoTempo({
      totais: totais,
      blocos: opts.blocos,
      vies: opts.vies || viesDeChaves(Object.keys(totais), opts.seed || 1),
      seed: opts.seed == null ? 1 : opts.seed,
      ruido: opts.ruido == null ? 0.15 : opts.ruido,
      passos: opts.passos || 6
    });
    snaps.forEach(function (s) { s._totais = totais; });
    var eventos = detectarEventos(snaps, {
      total: total,
      tipo: opts.tipo || "majoritaria",
      maioria: !!opts.maioria,
      turno: opts.turno || 1
    });
    var liderAte = {};
    var corr = null;
    snaps.forEach(function (s) {
      liderAte[s.t] = corr;
      corr = s.lider;
    });
    opts._liderPorT = function (t) {
      var nome = null;
      for (var i = 0; i < snaps.length; i++) {
        if (snaps[i].t < t - 1e-6) nome = snaps[i].lider;
      }
      return nome;
    };
    opts.boca = bocaDeUrna(totais, opts.seed || 1);
    var script = roteirizar(snaps, eventos, opts);
    var boca = opts.boca;
    var matriz = gerarMatrizBlocos({
      totais: totais,
      blocos: opts.blocos,
      vies: opts.vies || viesDeChaves(Object.keys(totais), opts.seed || 1),
      seed: opts.seed == null ? 1 : opts.seed,
      ruido: opts.ruido == null ? 0.15 : opts.ruido
    });
    return {
      snaps: snaps,
      eventos: eventos,
      roteiro: script.roteiro,
      elenco: script.elenco,
      canal: script.canal,
      duracao_s: script.duracao_s,
      total: total,
      totais: totais,
      boca: boca,
      seed: opts.seed || 1,
      final: situacaoMajoritaria(snaps[snaps.length - 1], total),
      blocos: opts.blocos,
      matriz: matriz,
      nomes: opts.nomes || {},
      partidosNome: opts.partidosNome || {},
      meta: opts.meta || null,
      cargoId: opts.cargoId || "",
      titulo: opts.titulo || opts.cargo || "Apuração",
      turno: opts.turno || 1,
      tipo: opts.tipo || "majoritaria",
      maioria: !!opts.maioria
    };
  }

  function bocaDeUrna(totais, seed) {
    var r = rng((seed || 1) ^ 0xB0CA);
    var chaves = Object.keys(totais);
    var raw = chaves.map(function (k) { return Math.max(0.01, totais[k] * (1 + (r() - 0.5) * 0.18)); });
    var soma = raw.reduce(function (s, v) { return s + v; }, 0);
    var partes = {};
    chaves.forEach(function (k, i) { partes[k] = raw[i] / soma; });
    return { margem_pp: 2, partes: partes, rotulo: "pesquisa de saída" };
  }

  function estadoNoTempo(cob, tTela) {
    var dur = cob.duracao_s || 420;
    var u = Math.max(0, Math.min(1, tTela / dur));
    var seg = cob.roteiro[0];
    for (var j = 0; j < cob.roteiro.length; j++) {
      if (cob.roteiro[j].t_ini <= tTela + 1e-6) seg = cob.roteiro[j];
    }
    var snap = cob.snaps[0];
    var tRef = seg ? seg.t_curva : 0;
    if (u >= 0.999) tRef = cob.snaps[cob.snaps.length - 1].t;
    for (var i = 0; i < cob.snaps.length; i++) {
      if (cob.snaps[i].t <= tRef + 1e-6) snap = cob.snaps[i];
    }
    var sit = situacaoMajoritaria(snap, cob.total);
    return { t: tTela, u: u, pct: snap.pct_apurado, snap: snap, segmento: seg, sit: sit };
  }

  function auditarSpoilers(cob) {
    var falhas = [];
    (cob.roteiro || []).forEach(function (seg, i) {
      (seg.slots || []).forEach(function (sl) {
        if (sl.t_dado > seg.t_curva + 1e-6) falhas.push({ i: i, slot: sl.nome, t_dado: sl.t_dado, t: seg.t_curva });
      });
      var dizEleito = /\beleitos?\b|\beleitas?\b/i.test(seg.texto || "");
      if (dizEleito && !seg.confirmado && !seg.canal_chamou_errado) falhas.push({ i: i, eleito: true, tipo: seg.tipo });
    });
    return falhas;
  }

  function repeticao(cob) {
    var textos = (cob.roteiro || []).map(function (s) { return s.texto; }).filter(Boolean);
    var vistos = {};
    var iguais = 0;
    textos.forEach(function (t) {
      if (vistos[t]) iguais++;
      vistos[t] = 1;
    });
    return { total: textos.length, iguais: iguais, taxa: textos.length ? iguais / textos.length : 0 };
  }

  var api = {
    rng: rng,
    hash32: hash32,
    erf: erf,
    fmtInt: fmtInt,
    fmtPct: fmtPct,
    gerarMatrizBlocos: gerarMatrizBlocos,
    linhaDoTempo: linhaDoTempo,
    situacaoMajoritaria: situacaoMajoritaria,
    chamadaEleito: chamadaEleito,
    blocosAnexoB: blocosAnexoB,
    viesAnexoB: viesAnexoB,
    cenarioAnexoB: cenarioAnexoB,
    somasMatriz: somasMatriz,
    snapNoPct: snapNoPct,
    marcoPct: marcoPct,
    primeiraVirada: primeiraVirada,
    blocosDeTotal: blocosDeTotal,
    viesDeChaves: viesDeChaves,
    detectarEventos: detectarEventos,
    confirmavel: confirmavel,
    projetarCadeiras: projetarCadeiras,
    CANAIS: CANAIS,
    canalPorId: canalPorId,
    elenco: elenco,
    narrar: narrar,
    roteirizar: roteirizar,
    montarCobertura: montarCobertura,
    estadoNoTempo: estadoNoTempo,
    auditarSpoilers: auditarSpoilers,
    repeticao: repeticao,
    bocaDeUrna: bocaDeUrna,
    curvaTela: curvaTela,
    fracaoBlocos: fracaoBlocos,
    duracaoModo: duracaoModo,
    qeArredondadoLocal: qeArredondadoLocal,
    entradaProporcional: entradaProporcional
  };

  root.Telejornal = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
