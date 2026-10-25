/* QUOCIENTE_ELEITORAL_V1 integração
   Não substitui o arquivo do motor. Roda depois dele, no jogo. */
(function () {
  if (typeof apurarProporcional !== "function" || typeof REGRAS_ELEITORAIS === "undefined") return;

  function hash32(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function sementePartida() {
    var m = M();
    if (!m.sementePartida) m.sementePartida = hash32((J().nome || "cadeira") + "|" + (bancoDeNPCs ? bancoDeNPCs.length : 0) + "|qe");
    return m.sementePartida >>> 0;
  }
  function comSemente(seed, fn) {
    var rnd = (typeof mulberry32 === "function") ? mulberry32(seed >>> 0) : Math.random;
    var prev = Math.random;
    Math.random = function () { return rnd(); };
    try { return fn(); } finally { Math.random = prev; }
  }
  function regrasDoModo(modo) {
    var R = REGRAS_ELEITORAIS;
    var m = modo || R.modo_sobras;
    if (m === "lei14211_80_20") {
      return { modo_sobras: m, barreira_candidato_qp: R.barreira_candidato_qp, barreira_partido_sobras: 0.8, barreira_candidato_sobras: 0.2, regra_sem_qe: R.regra_sem_qe };
    }
    return { modo_sobras: "stf2024", barreira_candidato_qp: R.barreira_candidato_qp, barreira_partido_sobras: R.barreira_partido_sobras, barreira_candidato_sobras: R.barreira_candidato_sobras, regra_sem_qe: R.regra_sem_qe };
  }
  function siglaDe(n) {
    if (!n) return null;
    var s = n.partidoBase || n.partido;
    if (!s || (typeof ehSemPartido === "function" && ehSemPartido(n))) return null;
    return s;
  }
  function fedKey(sigla) {
    try {
      if (REGRAS_ELEITORAIS.coligacao_proporcional) return sigla;
      var f = (typeof fedDe === "function") ? fedDe(sigla) : null;
      return f ? ("FED:" + f.id) : sigla;
    } catch (e) { return sigla; }
  }
  function nomeFed(key) {
    if (String(key).indexOf("FED:") !== 0) return key;
    try {
      var id = key.slice(4);
      var f = (typeof fedsInit === "function") ? fedsInit().find(function (x) { return x.id === id; }) : null;
      return f ? f.nome : key;
    } catch (e) { return key; }
  }
  function cmpId(a, b) { return (a < b ? -1 : 1); }

  function sortearSigla(rnd) {
    var ps = (typeof PARTIDOS_JOGAVEIS !== "undefined" ? PARTIDOS_JOGAVEIS : ["MDB"]).filter(function (p) { return p !== "Sem Partido"; });
    var tot = 0;
    ps.forEach(function (p) { tot += (PARTIDOS[p] && PARTIDOS[p].fundo) || 0.4; });
    var r = rnd() * (tot || 1), acc = 0, i;
    for (i = 0; i < ps.length; i++) {
      acc += (PARTIDOS[ps[i]] && PARTIDOS[ps[i]].fundo) || 0.4;
      if (r <= acc) return ps[i];
    }
    return ps[0] || "MDB";
  }
  function fatiaLegenda(sigla) {
    var G = REGRAS_ELEITORAIS.geracao;
    var fundo = (PARTIDOS[sigla] && PARTIDOS[sigla].fundo) || 1;
    var ident = Math.max(0, Math.min(1, fundo / 18));
    var t = G.legenda_min + (G.legenda_max - G.legenda_min) * (0.3 + 0.7 * ident);
    try {
      if (sigla === J().partido_atual) {
        var esf = J().campanha && J().campanha.legenda_esforco;
        if (esf == null) esf = 0;
        t = G.legenda_min + (G.legenda_max - G.legenda_min) * (0.35 * ident + 0.65 * esf);
      }
    } catch (e) {}
    return Math.max(G.legenda_min, Math.min(G.legenda_max, t));
  }
  function aplicarEstrategia(c, sigla) {
    var G = REGRAS_ELEITORAIS.geracao;
    var camp = J().campanha || {};
    var meu = sigla === J().partido_atual;
    if (camp.puxador_id && c.id === camp.puxador_id) c.votos = Math.round(c.votos * G.puxador_multiplicador);
    if (!meu) return;
    var modo = camp.fundo_modo || "eu";
    if (c.jogador && modo === "eu") c.votos = Math.round(c.votos * G.fundo_eu);
    if (c.jogador && modo === "puxador") c.votos = Math.round(c.votos * G.fundo_puxador_no_eu);
    if (c.id === camp.puxador_id && modo === "puxador") c.votos = Math.round(c.votos * G.fundo_no_puxador);
    if (modo === "chapa") c.votos = Math.round(c.votos * G.fundo_chapa);
  }
  function separarLegenda(p, fatia) {
    var soma = p.candidatos.reduce(function (s, c) { return s + c.votos; }, 0);
    if (soma <= 0) return;
    var leg = Math.round(soma * fatia);
    var fica = soma - leg;
    p.candidatos.forEach(function (c) { c.votos = Math.floor(c.votos * fica / soma); });
    var resto = fica - p.candidatos.reduce(function (s, c) { return s + c.votos; }, 0);
    p.candidatos.sort(function (a, b) { return b.votos - a.votos; });
    for (var i = 0; i < resto; i++) p.candidatos[i % p.candidatos.length].votos++;
    p.votos_legenda += leg;
  }
  function equilibrarGenero(cands) {
    var min = REGRAS_ELEITORAIS.cota_genero_min;
    function conta() {
      var f = 0, m = 0;
      cands.forEach(function (c) { if ((c.genero || "M") === "F") f++; else m++; });
      return { f: f, m: m, n: f + m };
    }
    var guard = 0;
    while (guard++ < 40) {
      var k = conta();
      if (!k.n || cotaGeneroOk(cands)) return true;
      var faltaF = k.f / k.n < min;
      var alvo = faltaF ? "M" : "F";
      var troca = null;
      cands.forEach(function (c) {
        if (c.jogador) return;
        if ((c.genero || "M") !== alvo) return;
        if (!troca || c.votos < troca.votos) troca = c;
      });
      if (!troca) return cotaGeneroOk(cands);
      troca.genero = faltaF ? "F" : "M";
      troca._generoTrocado = true;
    }
    return cotaGeneroOk(cands);
  }

  function montarEntrada(cargoId, lista, uf, vagas) {
    var rnd = Math.random;
    var grupos = {};
    var porSigla = {};
    function bucket(sigla) {
      if (!grupos[sigla]) grupos[sigla] = { id: sigla, votos_legenda: 0, candidatos: [] };
      return grupos[sigla];
    }
    lista.forEach(function (x, i) {
      var sigla, id, nome, idade, genero;
      if (x.jogador) {
        sigla = J().partido_atual;
        if (!sigla || sigla === "Sem Partido") return;
        id = "JOGADOR"; nome = J().nome; idade = J().idade || 40; genero = J().sexo || "M";
      } else if (x.npc && siglaDe(x.npc)) {
        sigla = siglaDe(x.npc);
        id = x.npc.id; nome = x.npc.nome; idade = x.npc.idade || 40; genero = x.npc.sexo || "M";
      } else if (x.n && siglaDe(x.n)) {
        sigla = siglaDe(x.n);
        id = x.n.id; nome = x.n.nome; idade = x.n.idade || 40; genero = x.n.sexo || "M";
        x.npc = x.n;
      } else {
        sigla = sortearSigla(rnd);
        id = "TMP|" + cargoId + "|" + (uf || "SP") + "|" + i;
        nome = null; idade = 35 + Math.floor(rnd() * 30); genero = rnd() < 0.45 ? "F" : "M";
        x._sigla = sigla; x._idade = idade; x._genero = genero;
      }
      x._qid = id;
      var c = { id: id, nome: nome, idade: idade, genero: genero, votos: Math.max(0, Math.round(x.votos || x.v || 0)), partido: sigla, jogador: !!x.jogador };
      aplicarEstrategia(c, sigla);
      bucket(sigla).candidatos.push(c);
    });
    var lim = limiteCandidatos(vagas);
    Object.keys(grupos).forEach(function (sigla) {
      var p = grupos[sigla];
      equilibrarGenero(p.candidatos);
      p.candidatos.forEach(function (c) {
        if (!c._generoTrocado) return;
        var x = lista.find(function (it) { return it._qid === c.id; });
        if (x && x.npc) x.npc.sexo = c.genero;
      });
      separarLegenda(p, fatiaLegenda(sigla));
      p.candidatos.sort(function (a, b) { return b.votos - a.votos || (b.idade || 0) - (a.idade || 0) || cmpId(a.id, b.id); });
      if (p.candidatos.length > lim) {
        var corte = p.candidatos.slice(lim);
        p.votos_legenda += corte.reduce(function (s, c) { return s + c.votos; }, 0);
        p.candidatos = p.candidatos.slice(0, lim);
      }
      porSigla[sigla] = p.votos_legenda + p.candidatos.reduce(function (s, c) { return s + c.votos; }, 0);
    });
    var porChave = {};
    Object.keys(grupos).forEach(function (sigla) {
      var key = fedKey(sigla);
      if (!porChave[key]) porChave[key] = { id: key, nome: nomeFed(key), votos_legenda: 0, candidatos: [], membros: [] };
      var g = porChave[key];
      g.votos_legenda += grupos[sigla].votos_legenda;
      g.candidatos = g.candidatos.concat(grupos[sigla].candidatos);
      g.membros.push(sigla);
    });
    return { partidos: Object.keys(porChave).map(function (k) { return porChave[k]; }), porSigla: porSigla, bruto: grupos };
  }

  function nomeItem(id, lista) {
    if (id === "JOGADOR") return J().nome;
    var x = (lista || []).find(function (it) { return it._qid === id; });
    if (x && x.jogador) return J().nome;
    if (x && x.npc) return x.npc.nome;
    if (x && x.n) return x.n.nome;
    var n = (typeof npcPorId === "function") ? npcPorId(id) : null;
    return n ? n.nome : "Candidato de legenda";
  }

  function gravarLeg(cargoId, lista, res, entrada, uf) {
    var E = M().eleicao;
    E._leg2 = E._leg2 || {};
    var named = [];
    var anon = [];
    (lista || []).forEach(function (x) {
      var nome = x.jogador ? J().nome : (x.npc ? x.npc.nome : (x.n ? x.n.nome : null));
      if (!nome) { anon.push(x.votos || x.v || 0); return; }
      named.push({
        id: x.jogador ? "JOGADOR" : (x.npc ? x.npc.id : x.n.id),
        nome: nome,
        partido: x.jogador ? (J().partido_atual || "") : ((x.npc || x.n).partidoBase || (x.npc || x.n).partido || ""),
        jogador: !!x.jogador,
        v: x.votos || x.v || 0
      });
    });
    named.sort(function (a, b) { return b.v - a.v; });
    var eleitos = res.eleitos.map(function (e) {
      var x = (lista || []).find(function (it) { return it._qid === e.candidato; });
      var n = x && (x.npc || x.n);
      return {
        nome: e.candidato === "JOGADOR" ? J().nome : (n ? n.nome : nomeItem(e.candidato, lista)),
        partido: (e.partido_origem && String(e.partido_origem).indexOf("FED:") !== 0) ? e.partido_origem : (n ? (n.partidoBase || n.partido || "") : (e.partido || "")),
        id: e.candidato === "JOGADOR" ? "JOGADOR" : (n ? n.id : e.candidato),
        votos: e.votos,
        jogador: e.candidato === "JOGADOR" || !!e.jogador,
        fase: e.fase,
        lista: e.partido
      };
    });
    var barreira = res.QE * REGRAS_ELEITORAIS.barreira_candidato_qp;
    var barrados = [];
    (entrada.partidos || []).forEach(function (p) {
      p.candidatos.forEach(function (c) {
        if (c.votos >= barreira) return;
        if (res.eleitos.some(function (e) { return e.candidato === c.id; })) return;
        barrados.push({ id: c.id, nome: c.nome || nomeItem(c.id, lista), partido: c.partido || p.id, votos: c.votos, lista: p.nome || nomeFed(p.id) });
      });
    });
    barrados.sort(function (a, b) { return b.votos - a.votos; });
    var eleitoSet = {};
    res.eleitos.forEach(function (e) { eleitoSet[e.candidato] = 1; });
    var rank = named.slice().sort(function (a, b) { return b.v - a.v; });
    var campeaoFora = rank.filter(function (x) { return !eleitoSet[x.id]; })[0] || null;
    E._leg2[cargoId] = {
      N: CADEIRAS[cargoId] || res.eleitos.length,
      named: named.slice(0, 90),
      anon: anon.slice(0, 200),
      eleitos: eleitos,
      sistema: "quociente",
      qe: {
        QE: res.QE,
        validos: res.validos,
        por_partido: res.por_partido,
        por_sigla: entrada.porSigla,
        eleitos: res.eleitos,
        suplentes: res.suplentes,
        passos: res.passos,
        regras_usadas: res.regras_usadas,
        barrados: barrados.slice(0, 8),
        campeaoFora: campeaoFora,
        ano: dt().ano,
        uf: uf || "SP",
        vagas_nao_preenchidas: res.vagas_nao_preenchidas || 0,
        entrada: (entrada.partidos || []).map(function (p) {
          return {
            id: p.id,
            nome: p.nome,
            votos_legenda: p.votos_legenda,
            candidatos: (p.candidatos || []).map(function (c) {
              return { id: c.id, nome: c.nome, votos: c.votos, idade: c.idade, genero: c.genero, partido: c.partido, jogador: !!c.jogador };
            })
          };
        })
      }
    };
  }

  function aplicarCadeiras(cargoId, lista, res) {
    var nome = NOME_CARGO[cargoId];
    var esfera = cargoId === "VER" ? "MUNICIPAL" : cargoId === "DEPE" ? "ESTADUAL" : "FEDERAL";
    var pred = cargoId === "VER" ? function (n) { return n.cargo && n.cargo.indexOf("Vereador") >= 0; }
      : cargoId === "DEPE" ? function (n) { return n.cargo && n.cargo.indexOf("Deputado Estadual") >= 0; }
      : function (n) { return n.cargo && n.cargo.indexOf("Deputado Federal") >= 0 && n.uf === "SP"; };
    var byId = {};
    lista.forEach(function (x) { if (x._qid) byId[x._qid] = x; });
    var winNpc = new Set();
    res.eleitos.forEach(function (e) {
      if (e.candidato === "JOGADOR") return;
      var x = byId[e.candidato];
      if (x && (x.npc || x.n)) winNpc.add(x.npc || x.n);
    });
    var vagos = bancoDeNPCs.filter(function (n) { return n.vivo && !n.jogador && pred(n) && !winNpc.has(n); });
    vagos.forEach(function (n) { n.cargo = "Liderança / Ex-Titular"; n.papel = n.papel && n.real ? n.papel : "Ex-parlamentar"; });
    var novos = 0;
    res.eleitos.forEach(function (e) {
      if (e.candidato === "JOGADOR") return;
      var x = byId[e.candidato];
      var n = x && (x.npc || x.n);
      if (n) {
        if (!pred(n)) assumirCargoEleito(n, nome, esfera);
        n.base_votos = Math.round(((n.base_votos || 0) * 0.6) + e.votos * 0.4);
        n.mandato_fim = dt().ano + 4;
        n.eleito_por = e.fase === "sobra" ? "sobra" : (e.fase === "direta" ? "qp" : e.fase);
        if (n.carisma > 75 && e.votos > n.base_votos * 1.12) n.ambicao_alta = true;
      } else {
        var sigla = (e.partido_origem && String(e.partido_origem).indexOf("FED:") !== 0) ? e.partido_origem : ((x && x._sigla) || "MDB");
        var g = gerarPoliticoProcedural(nome, esfera, sigla, { uf: "SP", mandato_fim: dt().ano + 4 });
        g.base_votos = e.votos; g.partido = sigla; g.partidoBase = sigla;
        g.eleito_por = e.fase === "sobra" ? "sobra" : "qp";
        if (cargoId === "VER") g.municipio_domicilio = "Mauá";
        if (x && x._genero) g.sexo = x._genero;
        g.popularidade = (typeof R !== "undefined") ? R.c((g.popularidade || 40) + 8, 0, 95) : (g.popularidade || 40);
        bancoDeNPCs.push(g); novos++;
        if (x) x.npc = g;
      }
    });
    return { novos: novos, perderam: vagos.length };
  }

  function textoJogador(cargoId, lista, res, jv, posDada) {
    var j = J();
    var nome = NOME_CARGO[cargoId];
    var eu = res.eleitos.find(function (e) { return e.candidato === "JOGADOR"; });
    var rank = lista.slice().sort(function (a, b) { return (b.votos || 0) - (a.votos || 0); });
    var pos = posDada || (rank.findIndex(function (x) { return x.jogador; }) + 1);
    if (!(jv > 0)) {
      resultadoTexto(nome + ": quociente eleitoral " + fmtV(res.QE) + " (" + fmtV(res.validos) + " votos válidos).");
      return;
    }
    var fase = eu ? (eu.fase === "sobra" ? "eleito(a) pelas sobras" : eu.fase === "direta" ? "eleito(a) pelo quociente partidário" : "eleito(a)") : "não eleito(a)";
    var bar = Math.round(res.QE * REGRAS_ELEITORAIS.barreira_candidato_qp);
    resultadoTexto(nome + ": você teve " + fmtV(jv) + " votos (" + pos + "º em votos nominais). Quociente " + fmtV(res.QE) + ", barreira de 10% em " + fmtV(bar) + ". " + (eu ? "ELEITO(A) — " + fase + "." : "Não foi dessa vez."));
    if (eu) {
      j.campanha.eleito = cargoId;
      j.stats.eleicoes_vencidas = (j.stats.eleicoes_vencidas || 0) + 1;
      manchete(j.nome + " é " + fase + " " + nome + " com " + fmtV(jv) + " votos.", "eleicao");
      if (eu.fase === "sobra") manchete(j.nome + " entra pelas sobras, não por ser o mais votado.", "eleicao");
    } else {
      manchete(j.nome + " não se elege " + nome + " (" + fmtV(jv) + " votos). O quociente não é linha de corte.", "eleicao");
    }
    var L = M().eleicao._leg2 && M().eleicao._leg2[cargoId];
    var fora = L && L.qe && L.qe.campeaoFora;
    if (fora && rank[0] && !rank[0].jogador && fora.id === rank[0].id) {
      manchete("O mais votado (" + fora.nome + ") não leva cadeira. O quociente entregou a vaga a outra legenda.", "eleicao");
    }
  }

  window.apurarCargoProporcional = function (cargoId, ativo, alvo) {
    var seed = (sementePartida() ^ hash32(cargoId + "|" + dt().ano)) >>> 0;
    comSemente(seed, function () {
      var lista = projetarLegislativo(cargoId);
      var jv = 0;
      if (ativo && alvo === cargoId && J().partido_atual && J().partido_atual !== "Sem Partido") {
        jv = Math.round(votosLegislativoJogador(cargoId) * R.f(0.94, 1.06));
        if (jv < 1) jv = 1;
        lista.push({ jogador: true, votos: jv });
      }
      var vagas = CADEIRAS[cargoId];
      var entrada = montarEntrada(cargoId, lista, cargoId === "VER" ? "MAUA" : "SP", vagas);
      var res = apurarProporcional({ vagas: vagas, partidos: entrada.partidos, regras: regrasDoModo() });
      res.por_sigla = entrada.porSigla;
      aplicarCadeiras(cargoId, lista, res);
      gravarLeg(cargoId, lista, res, entrada, cargoId === "VER" ? "MAUA" : "SP");
      var nominais = [];
      (entrada.partidos || []).forEach(function (p) { (p.candidatos || []).forEach(function (c) { nominais.push(c); }); });
      nominais.sort(function (a, b) { return b.votos - a.votos; });
      var jogNom = nominais.find(function (c) { return c.id === "JOGADOR"; });
      var posNom = jogNom ? nominais.findIndex(function (c) { return c.id === "JOGADOR"; }) + 1 : 0;
      textoJogador(cargoId, lista, res, jogNom ? jogNom.votos : jv, posNom);
      lista._qe = res;
    });
  };

  window.elegerDepFedQuociente = function (uf, lista, seats) {
    var seed = (sementePartida() ^ hash32("DEPF|" + uf + "|" + dt().ano)) >>> 0;
    return comSemente(seed, function () {
      lista.forEach(function (x) { x.votos = x.v; });
      var entrada = montarEntrada("DEPF", lista, uf, seats);
      var res = apurarProporcional({ vagas: seats, partidos: entrada.partidos, regras: regrasDoModo() });
      var byId = {};
      lista.forEach(function (x) { if (x._qid) byId[x._qid] = x; });
      var win = [];
      res.eleitos.forEach(function (e) {
        var x = byId[e.candidato];
        if (x) win.push(x);
      });
      lista._qeResumo = { QE: res.QE, validos: res.validos, porSigla: entrada.porSigla, total: res.eleitos.length };
      return win;
    });
  };

  function clausulaCortada(sigla) {
    var m = M();
    var c = m.clausula;
    if (!c || !c.ok || c.ano == null) return false;
    if (!(REGRAS_ELEITORAIS.clausula_efeitos || []).length) return false;
    try {
      var f = (typeof fedDe === "function") ? fedDe(sigla) : null;
      var key = f ? ("FED:" + f.id) : sigla;
      if (c.ok[key] == null && c.ok[sigla] == null) return false;
      return c.ok[key] === false || c.ok[sigla] === false;
    } catch (e) { return false; }
  }
  window.clausulaCortada = clausulaCortada;

  function avaliarClausulaDesempenho() {
    if (typeof tipoEleicao !== "function" || tipoEleicao(dt().ano) !== "GERAL") return;
    var E = M().eleicao;
    if (!E || !E._leg2 || !E._leg2.DEPF || !E._leg2.DEPF.qe) return;
    if (M().clausula && M().clausula.ano === dt().ano) return;
    var ufs = {};
    function somaUF(uf, porSigla, validos) {
      if (!porSigla) return;
      ufs[uf] = { validos: validos || 0, por: porSigla };
    }
    var sp = E._leg2.DEPF.qe;
    somaUF("SP", sp.por_sigla, sp.validos);
    (E.depfed || []).forEach(function (x) {
      if (x.qe && x.qe.porSigla) somaUF(x.uf, x.qe.porSigla, x.qe.validos);
    });
    var chaves = {};
    function add(key, votos, uf) {
      if (!chaves[key]) chaves[key] = { votos: 0, deps: 0, ufsDep: {}, ufsPct: {} };
      chaves[key].votos += votos || 0;
    }
    Object.keys(ufs).forEach(function (uf) {
      var bloco = ufs[uf];
      Object.keys(bloco.por).forEach(function (sigla) {
        add(fedKey(sigla), bloco.por[sigla], uf);
      });
    });
    (E._leg2.DEPF.eleitos || []).forEach(function (e) {
      var key = e.lista || fedKey(e.partido);
      if (!chaves[key]) chaves[key] = { votos: 0, deps: 0, ufsDep: {}, ufsPct: {} };
      chaves[key].deps++;
      chaves[key].ufsDep.SP = 1;
    });
    (E.depfed || []).forEach(function (x) {
      Object.keys(x.part || {}).forEach(function (sigla) {
        var key = fedKey(sigla);
        if (!chaves[key]) chaves[key] = { votos: 0, deps: 0, ufsDep: {}, ufsPct: {} };
        chaves[key].deps += x.part[sigla] || 0;
        if (x.part[sigla]) chaves[key].ufsDep[x.uf] = 1;
      });
    });
    var validos = Object.keys(ufs).reduce(function (s, uf) { return s + (ufs[uf].validos || 0); }, 0) || 1;
    var okMap = {};
    var detalhes = {};
    Object.keys(chaves).forEach(function (key) {
      var info = chaves[key];
      var ufsMin = 0;
      Object.keys(ufs).forEach(function (uf) {
        var bloco = ufs[uf];
        var votosAqui = 0;
        Object.keys(bloco.por).forEach(function (sigla) { if (fedKey(sigla) === key) votosAqui += bloco.por[sigla]; });
        var pctUF = bloco.validos ? (votosAqui / bloco.validos) * 100 : 0;
        var regra = faixaClausula(dt().ano);
        if (pctUF >= regra.min_pct_por_uf) ufsMin++;
      });
      var r = clausulaOk({
        pct_nacional: info.votos / validos * 100,
        ufs_com_minimo: ufsMin,
        deputados: info.deps,
        ufs_com_deputado: Object.keys(info.ufsDep).length
      }, dt().ano);
      okMap[key] = r.ok;
      detalhes[key] = { pct: +(info.votos / validos * 100).toFixed(2), deps: info.deps, ok: r.ok, nome: nomeFed(key) };
    });
    M().clausula = { ano: dt().ano, ok: okMap, detalhes: detalhes };
    try {
      var partes = M().partidos || {};
      Object.keys(partes).forEach(function (sigla) {
        var key = fedKey(sigla);
        if (okMap[key] == null && okMap[sigla] == null) return;
        partes[sigla].clausula_ok = okMap[key] !== false && okMap[sigla] !== false;
      });
    } catch (e) {}
    var cortados = Object.keys(detalhes).filter(function (k) { return !detalhes[k].ok; }).map(function (k) { return detalhes[k].nome; });
    if (cortados.length) manchete("Cláusula de desempenho: " + cortados.slice(0, 6).join(", ") + " ficam sem fundo partidário e sem tempo de TV até a próxima eleição geral.", "eleicao");
    try {
      var meu = fedKey(J().partido_atual);
      if (okMap[meu] === false) manchete("O " + (nomeFed(meu) || J().partido_atual) + " não passou na cláusula de desempenho. O fundão e o horário gratuito secam.", "eleicao");
    } catch (e) {}
  }

  function migrarQuociente() {
    try {
      if (!gameState || typeof M !== "function") return;
      var m = M();
      m.schema_eleicoes_v2 = true;
      sementePartida();
      var c = J().campanha;
      if (c) {
        if (c.puxador_id === undefined) c.puxador_id = null;
        if (c.legenda_esforco == null) c.legenda_esforco = 0;
        if (!c.fundo_modo) c.fundo_modo = "eu";
      }
      var E = m.eleicao;
      if (E && E._leg2) {
        Object.keys(E._leg2).forEach(function (k) {
          var L = E._leg2[k];
          if (L && !L.qe) L.sistema = L.sistema || "antigo";
        });
      }
      if (!m.clausula) m.clausula = { ano: 0, ok: {} };
      var partes = m.partidos || {};
      Object.keys(partes).forEach(function (sigla) {
        if (!partes[sigla]) return;
        if (partes[sigla].clausula_ok == null) partes[sigla].clausula_ok = true;
        if (partes[sigla].federacao_id === undefined) partes[sigla].federacao_id = null;
      });
      if (typeof bancoDeNPCs !== "undefined" && bancoDeNPCs) {
        bancoDeNPCs.forEach(function (n) {
          if (!n || n.forca != null) return;
          n.forca = Math.round(((n.popularidade || 40) * 0.6) + Math.min(40, (n.base_votos || 0) / 5000));
          if (n.puxador == null) n.puxador = false;
        });
      }
    } catch (e) { console.error("migrar quociente", e); }
  }
  window.migrarQuociente = migrarQuociente;

  if (typeof carregarStr === "function" && !carregarStr._qe) {
    var _cs = carregarStr;
    carregarStr = function (s) {
      var r = _cs.apply(this, arguments);
      if (r) migrarQuociente();
      return r;
    };
    carregarStr._qe = true;
    window.carregarStr = carregarStr;
  }
  if (typeof novoJogo === "function" && !novoJogo._qe) {
    var _nj = novoJogo;
    novoJogo = function (cfg) {
      var g = _nj.apply(this, arguments);
      try { migrarQuociente(); } catch (e) {}
      return g;
    };
    novoJogo._qe = true;
    window.novoJogo = novoJogo;
  }
  if (typeof fundoDoPartido === "function" && !fundoDoPartido._qe) {
    var _fd = fundoDoPartido;
    fundoDoPartido = function (p) {
      var base = _fd.apply(this, arguments);
      try {
        if ((REGRAS_ELEITORAIS.clausula_efeitos || []).indexOf("fundo_partidario") >= 0 && clausulaCortada(p)) return 0;
      } catch (e) {}
      return base;
    };
    fundoDoPartido._qe = true;
  }
  if (typeof mult_tv === "function" && !mult_tv._qe) {
    var _tv = mult_tv;
    mult_tv = function () {
      var m = _tv.apply(this, arguments);
      try {
        if ((REGRAS_ELEITORAIS.clausula_efeitos || []).indexOf("tempo_tv_radio") >= 0 && clausulaCortada(J().partido_atual)) return 1;
      } catch (e) {}
      return m;
    };
    mult_tv._qe = true;
  }
  if (typeof apurarEleicao === "function" && !apurarEleicao._qe) {
    var _apq = apurarEleicao;
    apurarEleicao = function () {
      var r = _apq.apply(this, arguments);
      try { avaliarClausulaDesempenho(); } catch (e) { console.error("cláusula", e); }
      return r;
    };
    apurarEleicao._qe = true;
    window.apurarEleicao = apurarEleicao;
  }
  if (typeof assembleiaUF === "function" && !assembleiaUF._qe) {
    var _au = assembleiaUF;
    assembleiaUF = function (uf) {
      if (uf === "SP") return _au.apply(this, arguments);
      try {
        var seats = (typeof UF_ALESP !== "undefined" && UF_ALESP[uf]) || vagasAssembleia((typeof UF_SEATS !== "undefined" && UF_SEATS[uf]) || 8);
        var gov = bancoDeNPCs.find(function (n) { return n.vivo && n.cargo === "Governador" && n.uf === uf; });
        var ps = PARTIDOS_JOGAVEIS.map(function (p) {
          var w = ((PARTIDOS[p] && PARTIDOS[p].fundo) || 0.4) * (gov && (gov.partidoBase === p) ? 1.6 : 1);
          return { id: p, votos_legenda: Math.round(w * 800), candidatos: [
            { id: uf + "|" + p + "|1", votos: Math.round(w * 5000), idade: 50, partido: p },
            { id: uf + "|" + p + "|2", votos: Math.round(w * 2200), idade: 45, partido: p },
            { id: uf + "|" + p + "|3", votos: Math.round(w * 900), idade: 40, partido: p }
          ] };
        });
        var res = apurarProporcional({ vagas: seats, partidos: ps, regras: regrasDoModo() });
        var part = {};
        Object.keys(res.por_partido).forEach(function (id) {
          var n = res.por_partido[id].total;
          if (n > 0) part[id] = n;
        });
        return { uf: uf, seats: seats, part: part, qe: res.QE };
      } catch (e) { return _au.apply(this, arguments); }
    };
    assembleiaUF._qe = true;
  }

  function estimar(cargoId) {
    var N = CADEIRAS[cargoId];
    var validos = cargoId === "VER" ? 190000 : cargoId === "DEPE" ? 24000000 : 28000000;
    var totF = PARTIDOS_JOGAVEIS.reduce(function (s, p) { return s + ((PARTIDOS[p] && PARTIDOS[p].fundo) || 0); }, 0) || 1;
    var partidos = PARTIDOS_JOGAVEIS.map(function (p) {
      var votos = Math.round(validos * ((PARTIDOS[p] && PARTIDOS[p].fundo) || 0) / totF);
      var leg = Math.round(votos * fatiaLegenda(p));
      var nominal = Math.max(0, votos - leg);
      var pesos = [0.42, 0.22, 0.14, 0.09, 0.06, 0.04, 0.03];
      var cands = pesos.map(function (w, i) {
        return { id: p + "|e" + i, votos: Math.round(nominal * w), idade: 55 - i, partido: p, genero: i % 3 === 0 ? "F" : "M" };
      });
      return { id: p, votos_legenda: leg, candidatos: cands };
    });
    var j = J();
    var alvo = (typeof cargoIdPorNome === "function") ? cargoIdPorNome(j.campanha.cargo_alvo) : null;
    var jv = 0;
    if (j.campanha && j.campanha.candidatura_ativa && alvo === cargoId && j.partido_atual && j.partido_atual !== "Sem Partido") {
      try { jv = votosLegislativoJogador(cargoId); } catch (e) { jv = 0; }
      var meu = partidos.find(function (p) { return p.id === j.partido_atual; });
      if (meu) {
        meu.candidatos.push({ id: "JOGADOR", votos: Math.max(1, jv), idade: j.idade || 40, partido: j.partido_atual, jogador: true, genero: j.sexo || "M" });
        if (j.campanha.puxador_id) {
          var px = meu.candidatos[0];
          if (px && px.id !== "JOGADOR") px.votos = Math.round(px.votos * REGRAS_ELEITORAIS.geracao.puxador_multiplicador);
        }
      }
    }
    var fundidos = [];
    var map = {};
    partidos.forEach(function (p) {
      var key = fedKey(p.id);
      if (!map[key]) { map[key] = { id: key, nome: nomeFed(key), votos_legenda: 0, candidatos: [] }; fundidos.push(map[key]); }
      map[key].votos_legenda += p.votos_legenda;
      map[key].candidatos = map[key].candidatos.concat(p.candidatos);
    });
    var res = apurarProporcional({ vagas: N, partidos: fundidos, regras: regrasDoModo() });
    var eu = res.eleitos.find(function (e) { return e.candidato === "JOGADOR"; });
    var bar = Math.round(res.QE * REGRAS_ELEITORAIS.barreira_candidato_qp);
    var chave = j.partido_atual ? fedKey(j.partido_atual) : null;
    var qp = chave && res.por_partido[chave] ? res.por_partido[chave] : null;
    return { res: res, jv: jv, barreira: bar, eu: eu, qp: qp, nomeLista: chave ? nomeFed(chave) : "" };
  }

  if (typeof atualizarPesquisa === "function" && !atualizarPesquisa._qe) {
    var _apes = atualizarPesquisa;
    atualizarPesquisa = function () {
      var r = _apes.apply(this, arguments);
      try {
        var P = M().pesquisaAtual;
        var alvo = cargoIdPorNome(J().campanha.cargo_alvo);
        if (P && P.tipo === "LEG" && ["VER", "DEPE", "DEPF"].indexOf(alvo) >= 0) {
          var est = estimar(alvo);
          P.qe = est.res.QE;
          P.barreira = est.barreira;
          P.vence = !!est.eu;
          var como = est.eu ? (est.eu.fase === "sobra" ? "entraria pelas sobras" : "ocuparia cadeira direta") : "ficaria de fora";
          P.qeLinha = "Quociente estimado " + fmtV(est.res.QE) + ". Barreira de 10%: " + fmtV(est.barreira) + " votos. " + (est.nomeLista || "Sua legenda") + (est.qp ? " fica com cerca de " + est.qp.total + " cadeira(s)." : " ainda não fecha cadeira.") + " Você " + como + ".";
          P.qeDica = P.qeLinha;
        }
      } catch (e) { console.error("pesquisa qe", e); }
      return r;
    };
    atualizarPesquisa._qe = true;
  }

  function cardQuociente() {
    var j = J();
    var alvo = cargoIdPorNome(j.campanha.cargo_alvo);
    if (!["VER", "DEPE", "DEPF"].includes(alvo)) {
      return card("Quociente eleitoral", "<p class=\"txt\">Prefeito, governador, presidente e senador continuam no voto majoritário. Vereador e deputado é que usam quociente, sobras e voto de legenda.</p>");
    }
    var est = null;
    try { est = estimar(alvo); } catch (e) { est = null; }
    var camp = j.campanha || {};
    var colegas = bancoDeNPCs.filter(function (n) {
      return n.vivo && !n.jogador && siglaDe(n) && (siglaDe(n) === j.partido_atual || fedKey(siglaDe(n)) === fedKey(j.partido_atual));
    }).sort(function (a, b) { return (b.base_votos || 0) - (a.base_votos || 0); }).slice(0, 6);
    var px = camp.puxador_id ? (npcPorId(camp.puxador_id) || null) : null;
    var h = "<p class=\"txt\">A cadeira não vai para os " + CADEIRAS[alvo] + " mais votados. O partido (ou a federação) ganha cadeiras pelo quociente e pelas sobras. Candidato com menos de 10% do quociente não ocupa vaga direta.</p>";
    if (est) h += "<p class=\"txt\">" + (M().pesquisaAtual && M().pesquisaAtual.qeLinha ? M().pesquisaAtual.qeLinha : ("Quociente estimado " + fmtV(est.res.QE) + ".")) + "</p>";
    var fed = null;
    try { fed = fedDe(j.partido_atual); } catch (e) {}
    h += "<p class=\"txt\"><small>" + (fed ? "Federação: <b>" + esc(fed.nome) + "</b> (" + fed.partidos.join(" + ") + "). Na proporcional ela conta como um partido só, até " + fed.ate + "." : "Seu partido está sem federação. Coligação não vale para vereador nem deputado.") + "</small></p>";
    h += "<h4>Puxador de legenda</h4><p class=\"txt\"><small>" + (px ? "Puxador: <b>" + esc(px.nome) + "</b>. Os votos dele sobem o quociente e podem eleger quem tem menos voto, desde que passe da barreira." : "Sem puxador. Um nome muito votado puxa a legenda inteira.") + "</small></p>";
    h += "<div class=\"row\">" + btn("Sem puxador", "qePux", [""], "mini") + colegas.map(function (n) { return btn(n.nome, "qePux", [n.id], "mini" + (camp.puxador_id === n.id ? " confirma" : "")); }).join("") + "</div>";
    h += "<h4>Voto de legenda</h4><div class=\"row\">" + btn("Pouca", "qeLeg", [0], "mini" + (camp.legenda_esforco === 0 ? " confirma" : "")) + btn("Média", "qeLeg", [0.5], "mini" + (camp.legenda_esforco === 0.5 ? " confirma" : "")) + btn("Campanha forte", "qeLeg", [1], "mini" + (camp.legenda_esforco === 1 ? " confirma" : "")) + "</div>";
    h += "<h4>Fundo eleitoral da lista</h4><div class=\"row\">" + btn("Concentrar em mim", "qeFundo", ["eu"], "mini" + ((camp.fundo_modo || "eu") === "eu" ? " confirma" : "")) + btn("Turbinar o puxador", "qeFundo", ["puxador"], "mini" + (camp.fundo_modo === "puxador" ? " confirma" : "")) + btn("Espalhar na chapa", "qeFundo", ["chapa"], "mini" + (camp.fundo_modo === "chapa" ? " confirma" : "")) + "</div>";
    h += "<p class=\"txt\"><small>Cota de gênero: no mínimo 30% de cada gênero na lista. O diretório equilibra os nomes mais fracos se a conta não fecha. Limite de candidaturas: vagas + 1.</small></p>";
    h += btn("Federações do partido", "tab", ["partido"], "mini branco");
    var L = M().eleicao && M().eleicao._leg2 && M().eleicao._leg2[alvo];
    if (L && L.qe) {
      h += "<h4>Como foi a última apuração</h4>";
      h += htmlExplicador(L);
      if (L.sistema !== "antigo") h += "<div class=\"row\">" + btn("Ver as sobras pela regra antiga (80/20)", "qePreview", [alvo], "mini") + btn("Cassar um eleito e recalcular", "qeCassar", [alvo], "mini corrige") + "</div>";
    } else if (L && L.sistema === "antigo") {
      h += "<p class=\"txt\"><small>Esta eleição já foi apurada pelo sistema antigo e não é recalculada.</small></p>";
    }
    return card("Quociente, puxador e legenda", h);
  }
  function htmlExplicador(L) {
    var qe = L.qe;
    if (!qe) return "";
    var linhas = Object.keys(qe.por_partido || {}).map(function (id) {
      var p = qe.por_partido[id];
      return "<div class=\"row\"><span class=\"grow\">" + esc(nomeFed(id)) + "</span><b>" + p.total + "</b><small>" + p.diretas + " direta(s) · " + p.sobras + " sobra(s)</small></div>";
    }).sort(function (a, b) { return b.length - a.length; }).join("");
    var sobras = (qe.passos || []).filter(function (p) { return p.fase === "sobra"; }).slice(0, 6).map(function (p) {
      return "<p class=\"txt\"><small>Sobra " + p.rodada + ": " + esc(nomeFed(p.vencedor)) + " com média " + fmtV(Math.round(p.medias && p.medias[0] ? p.medias[0].media : 0)) + ".</small></p>";
    }).join("");
    return "<p class=\"txt\">Votos válidos " + fmtV(qe.validos) + " · quociente " + fmtV(qe.QE) + " · regra " + esc((qe.regras_usadas && qe.regras_usadas.modo_sobras) || "") + ".</p>" + linhas + sobras;
  }
  function predCargo(cargoId) {
    if (cargoId === "VER") return function (n) { return n.cargo && n.cargo.indexOf("Vereador") >= 0; };
    if (cargoId === "DEPE") return function (n) { return n.cargo && n.cargo.indexOf("Deputado Estadual") >= 0; };
    return function (n) { return n.cargo && n.cargo.indexOf("Deputado Federal") >= 0 && n.uf === "SP"; };
  }
  function aplicarRecalculo(cargoId, novo) {
    var L = M().eleicao._leg2[cargoId];
    var nomes = {};
    (L.qe.entrada || []).forEach(function (p) {
      (p.candidatos || []).forEach(function (c) { nomes[c.id] = c; });
    });
    var antes = (L.eleitos || []).map(function (e) { return e.id; });
    L.qe.QE = novo.QE;
    L.qe.validos = novo.validos;
    L.qe.por_partido = novo.por_partido;
    L.qe.eleitos = novo.eleitos;
    L.qe.passos = novo.passos;
    L.qe.suplentes = novo.suplentes;
    L.qe.regras_usadas = novo.regras_usadas;
    L.qe.vagas_nao_preenchidas = novo.vagas_nao_preenchidas || 0;
    var eleitoSet = {};
    novo.eleitos.forEach(function (e) { eleitoSet[e.candidato] = 1; });
    L.eleitos = novo.eleitos.map(function (e) {
      var c = nomes[e.candidato] || {};
      return {
        nome: e.candidato === "JOGADOR" ? J().nome : (c.nome || "Candidato de legenda"),
        partido: c.partido || (e.partido_origem && String(e.partido_origem).indexOf("FED:") !== 0 ? e.partido_origem : ""),
        id: e.candidato,
        votos: e.votos,
        jogador: e.candidato === "JOGADOR" || !!e.jogador,
        fase: e.fase,
        lista: e.partido
      };
    });
    var rank = (L.named || []).slice().sort(function (a, b) { return b.v - a.v; });
    L.qe.campeaoFora = rank.filter(function (x) { return !eleitoSet[x.id]; })[0] || null;
    var pred = predCargo(cargoId);
    var esfera = cargoId === "VER" ? "MUNICIPAL" : cargoId === "DEPE" ? "ESTADUAL" : "FEDERAL";
    antes.forEach(function (id) {
      if (!id || eleitoSet[id] || id === "JOGADOR") return;
      var n = (typeof npcPorId === "function") ? npcPorId(id) : null;
      if (n && pred(n)) { n.cargo = "Liderança / Ex-Titular"; n.papel = "Ex-parlamentar"; n.eleito_por = null; }
    });
    novo.eleitos.forEach(function (e) {
      if (!e.candidato || e.candidato === "JOGADOR" || String(e.candidato).indexOf("TMP|") === 0) return;
      var n = npcPorId(e.candidato);
      if (n && !pred(n)) {
        assumirCargoEleito(n, NOME_CARGO[cargoId], esfera);
        n.mandato_fim = dt().ano + 4;
        n.eleito_por = e.fase === "sobra" ? "sobra" : "qp";
      }
    });
    if (J().campanha && J().campanha.eleito === cargoId && !eleitoSet.JOGADOR) {
      J().campanha.eleito = null;
      if (J().cargo_atual === NOME_CARGO[cargoId]) J().cargo_atual = "Cidadão Comum";
    }
  }
  window.recalcularCadeira = function (cargoId, candidatoId) {
    var E = M().eleicao;
    var L = E && E._leg2 && E._leg2[cargoId];
    if (!L || !L.qe || L.sistema === "antigo" || !L.qe.entrada) { toast("Essa eleição está no sistema antigo e não entra de novo na urna.", "err"); return null; }
    (L.qe.entrada || []).forEach(function (p) {
      (p.candidatos || []).forEach(function (c) { if (c.id === candidatoId) c.votos = 0; });
    });
    var novo = recalcular({ vagas: L.N, partidos: L.qe.entrada, regras: regrasDoModo() }, { cassado: candidatoId });
    aplicarRecalculo(cargoId, novo);
    var quem = (L.named || []).concat(L.eleitos || []).find(function (x) { return x.id === candidatoId; });
    manchete("TSE cassa " + (quem && quem.nome ? quem.nome : "um eleito") + " e redistribui a cadeira pelo quociente.", "eleicao");
    toast("Cadeira recalculada. O voto cassado saiu da conta e as sobras rodaram de novo.", "ok");
    return novo;
  };

  if (typeof A === "object") {
    A.qePux = function (id) { J().campanha.puxador_id = id || null; var n = id && npcPorId(id); toast(n ? (n.nome + " vira puxador de legenda.") : "Puxador removido.", "ok"); try { atualizarPesquisa(); } catch (e) {} };
    A.qeLeg = function (n) { J().campanha.legenda_esforco = Number(n) || 0; toast(J().campanha.legenda_esforco >= 1 ? "A campanha pede voto na legenda." : "A campanha volta a ser mais personalista.", "ok"); try { atualizarPesquisa(); } catch (e) {} };
    A.qeFundo = function (modo) { J().campanha.fundo_modo = modo || "eu"; toast("Fundo da lista: " + (modo === "puxador" ? "puxador" : modo === "chapa" ? "chapa" : "você") + ".", "ok"); try { atualizarPesquisa(); } catch (e) {} };
    A.qePreview = function (cargo) {
      var L = M().eleicao && M().eleicao._leg2 && M().eleicao._leg2[cargo];
      if (!L || !L.qe || !L.qe.entrada) { toast("Ainda não há apuração proporcional deste cargo.", "err"); return; }
      var alt = apurarProporcional({ vagas: L.N, partidos: L.qe.entrada, regras: regrasDoModo("lei14211_80_20") });
      var agora = {};
      Object.keys(L.qe.por_partido || {}).forEach(function (id) { agora[id] = L.qe.por_partido[id].total; });
      var deltas = [];
      Object.keys(alt.por_partido || {}).forEach(function (id) {
        var d = alt.por_partido[id].total - (agora[id] || 0);
        if (d) deltas.push(nomeFed(id) + (d > 0 ? " +" : " ") + d);
      });
      toast(deltas.length ? ("Pela regra 80/20 mudaria: " + deltas.slice(0, 5).join(", ") + ". O resultado oficial não muda.") : "Pela regra 80/20 as cadeiras ficariam iguais. O resultado oficial não muda.", "ok");
    };
    A.qeCassar = function (cargo) {
      var L = M().eleicao && M().eleicao._leg2 && M().eleicao._leg2[cargo];
      if (!L || !L.eleitos) { toast("Não há eleitos para cassar.", "err"); return; }
      var alvo = L.eleitos.find(function (e) { return e.id && e.id !== "JOGADOR" && String(e.id).indexOf("TMP|") !== 0; }) || L.eleitos[0];
      if (!alvo) { toast("Não há eleitos para cassar.", "err"); return; }
      window.recalcularCadeira(cargo, alvo.id);
    };
  }

  if (typeof VIEWS === "object") {
    if (VIEWS.camp && !VIEWS.camp._qe) {
      var _vc = VIEWS.camp;
      VIEWS.camp = function () { var h = _vc.apply(this, arguments); try { h += cardQuociente(); } catch (e) { console.error(e); } return h; };
      VIEWS.camp._qe = true;
    }
    if (VIEWS.ele && !VIEWS.ele._qe) {
      var _ve = VIEWS.ele;
      VIEWS.ele = function () {
        var h = _ve.apply(this, arguments);
        try {
          var E = M().eleicao;
          var blocos = ["VER", "DEPE", "DEPF"].map(function (c) {
            var L = E && E._leg2 && E._leg2[c];
            if (!L || !L.qe || L.sistema === "antigo") return "";
            return "<h4>" + esc(NOME_CARGO[c]) + "</h4>" + htmlExplicador(L);
          }).join("");
          if (blocos) h = card("Como as cadeiras foram preenchidas", blocos) + h;
        } catch (e) {}
        return h;
      };
      VIEWS.ele._qe = true;
    }
  }

  window.telaDepQuociente = function (opts) {
    try {
      opts = opts || {};
      var subs = opts.subs || "";
      var nomes = opts.nomes || { DEPF: "Deputados federais", DEPE: "Deputados estaduais", VER: "Vereadores" };
      var subtitulos = opts.subtitulos || { DEPF: "São Paulo · Câmara dos Deputados", DEPE: "São Paulo · Assembleia Legislativa", VER: "Mauá · Câmara Municipal" };
      var E = M().eleicao;
      var cargo = opts.cargo || "DEPF";
      var L = E && E._leg2 && E._leg2[cargo];
      if (!L || !L.qe || L.sistema === "antigo") return null;
      var qe = L.qe;
      var pct = opts.pct || 0;
      var ato = pct < 34 ? 1 : pct < 67 ? 2 : 3;
      var atoNome = ato === 1 ? "Ato 1 — Quociente" : ato === 2 ? "Ato 2 — Cadeiras diretas" : "Ato 3 — Sobras";
      var partes = Object.keys(qe.por_partido || {}).map(function (id) {
        return { id: id, nome: nomeFed(id), info: qe.por_partido[id] };
      }).sort(function (a, b) { return b.info.votos - a.info.votos; });
      var lider = partes.length ? partes[0].info.votos : 1;
      var barras = partes.slice(0, 8).map(function (p) {
        var w = Math.max(2, Math.round(p.info.votos / lider * 100));
        var marca = qe.QE > 0 ? Math.max(0, Math.min(100, Math.round(qe.QE / lider * 100))) : 0;
        var txt = ato === 1 ? fmtV(p.info.votos) : (p.info.diretas + " direta(s)" + (ato === 3 ? " · " + p.info.sobras + " sobra(s)" : ""));
        return '<div class="ap-mini"><span class="g"><b>' + esc(p.nome) + '</b><br><small>' + txt + '</small></span><span class="pc" style="min-width:46%"><span style="position:relative;display:block;height:8px;background:#1c2b45;border-radius:6px"><i style="position:absolute;left:' + marca + '%;top:-2px;width:2px;height:12px;background:#f5c542"></i><i style="display:block;height:8px;width:' + w + '%;background:#2f6fe0;border-radius:6px"></i></span></span></div>';
      }).join("");
      var lista = (L.eleitos || []).filter(function (c) {
        if (ato === 1) return false;
        if (ato === 2) return c.fase === "direta";
        return true;
      });
      var eu = (L.eleitos || []).find(function (c) { return c.jogador; }) || (L.named || []).find(function (c) { return c.jogador; });
      var euHtml = "";
      if (eu) {
        var fase = eu.fase === "sobra" ? "Sobra" : eu.fase === "direta" ? "Direta" : (eu.fase ? eu.fase : "Na urna");
        euHtml = '<div class="ap-card"><div><div class="nm">' + esc(eu.nome) + ' (você)</div><div class="sub">' + esc(eu.partido || "") + " · " + fmtV(eu.votos || eu.v || 0) + " votos · " + fase + "</div></div>" + (eu.fase ? '<span class="ap-badge' + (eu.fase === "sobra" ? " t2" : "") + '">' + (eu.fase === "sobra" ? "Sobra" : "Eleito") + "</span>" : "") + "</div>";
      }
      var diretas = lista.filter(function (c) { return c.fase !== "sobra"; });
      var sobrasL = lista.filter(function (c) { return c.fase === "sobra"; });
      var amostra = (ato === 3 && pct >= 100) ? diretas.slice(0, 8).concat(sobrasL.slice(0, 4)) : lista.slice(0, 12);
      var rows = amostra.map(function (c, i) {
        var tag = c.fase === "sobra" ? "Sobra" : "Direta";
        return '<div class="ap-leg ap-eleito"><span>' + (i + 1) + '</span><div class="mid"><div class="l1">' + esc(c.nome) + (c.jogador ? " (você)" : "") + '</div><div class="l2">' + esc(c.partido || "") + " · " + fmtV(c.votos || 0) + " votos</div></div><b>" + tag + "</b></div>";
      }).join("");
      var restoLista = lista.length > amostra.length ? '<p class="ap-sec">' + lista.length + " eleitos no total. A amostra mostra cadeiras diretas e sobras.</p>" : "";
      var barra = (qe.barrados || []).slice(0, 3).map(function (b) {
        return esc(b.nome) + " (" + fmtV(b.votos) + ")";
      }).join(", ");
      var fora = qe.campeaoFora && !(L.eleitos || []).some(function (c) { return c.id === qe.campeaoFora.id; })
        ? '<p class="ap-sec">Mais votado que não leva cadeira: <b>' + esc(qe.campeaoFora.nome) + "</b>.</p>" : "";
      return "<h2>" + esc(nomes[cargo] || cargo) + "</h2><p class=\"ap-sec\">" + esc(subtitulos[cargo] || "") + " · " + atoNome + "</p>" +
        '<p class="ap-el">Votos válidos ' + fmtV(Math.round(qe.validos * Math.max(0.08, pct / 100))) + " · QE " + fmtV(qe.QE) + " · " + (L.N || 0) + " cadeiras · marca amarela = 1 quociente</p>" +
        '<div class="ap-sec"><b>' + (pct >= 100 ? "100%" : (Math.round(pct) + "%")) + '</b> das urnas</div>' +
        '<div class="ap-subtabs">' + (subs || "") + "</div>" + euHtml + barras + fora +
        (barra && ato > 1 ? '<p class="ap-sec">Barrados nos 10% do quociente: ' + barra + ".</p>" : "") +
        '<div data-leg-qe="1">' + rows + "</div>" + restoLista;
    } catch (e) { console.error("tela qe", e); return null; }
  };

  if (typeof legPainel === "function" && !legPainel._qe) {
    var _lp = legPainel;
    legPainel = function (cargo, titulo, chip, regs, kind) {
      var p = _lp.apply(this, arguments);
      try {
        var L = (E_()._leg2 || {})[cargo];
        if (p && L && L.qe && L.sistema !== "antigo") p.qe = L.qe;
      } catch (e) {}
      return p;
    };
    legPainel._qe = true;
  }
  if (typeof desenharLeg === "function" && !desenharLeg._qe) {
    var _dleg = desenharLeg;
    desenharLeg = function (P, corpo) {
      if (!(P && P.qe)) return _dleg.apply(this, arguments);
      var qe = P.qe;
      corpo.innerHTML = "<h3>" + esc(P.titulo) + "</h3><div class=\"n-prog\"><span>Urnas apuradas</span><div class=\"bar\"><i id=\"n-pb\"></i></div><b id=\"n-pp\">0%</b></div>" +
        "<div class=\"n-info\" id=\"n-ato\">Ato 1 — o quociente ainda está se formando.</div>" +
        "<div class=\"n-sec\">Legendas e a régua do quociente</div><div id=\"n-seats\"></div>" +
        "<div class=\"n-sec\">Cadeiras</div><div id=\"n-top\"></div><div id=\"n-stat\"></div>";
      NOITE.refs = { pb: corpo.querySelector("#n-pb"), pp: corpo.querySelector("#n-pp"), seats: corpo.querySelector("#n-seats"), top: corpo.querySelector("#n-top"), stat: corpo.querySelector("#n-stat"), ato: corpo.querySelector("#n-ato") };
    };
    desenharLeg._qe = true;
  }
  if (typeof atualizarLeg === "function" && !atualizarLeg._qe) {
    var _aleg = atualizarLeg;
    atualizarLeg = function (P) {
      if (!(P && P.qe && NOITE.refs && NOITE.refs.ato)) return _aleg.apply(this, arguments);
      var t = NOITE.t || 0;
      var ato = t < 0.34 ? 1 : t < 0.67 ? 2 : 3;
      var R = NOITE.refs;
      R.pb.style.width = (t * 100) + "%";
      R.pp.textContent = (t * 100).toFixed(0) + "%";
      R.ato.textContent = ato === 1 ? "Ato 1 — Quociente eleitoral " + fmtV(P.qe.QE) + "." : ato === 2 ? "Ato 2 — cadeiras diretas, só quem passa de 10% do quociente." : "Ato 3 — sobras pelas maiores médias.";
      var partes = Object.keys(P.qe.por_partido || {}).map(function (id) { return { id: id, info: P.qe.por_partido[id] }; }).sort(function (a, b) { return b.info.votos - a.info.votos; }).slice(0, 8);
      var lider = partes.length ? partes[0].info.votos : 1;
      R.seats.innerHTML = partes.map(function (p) {
        var n = ato === 1 ? 0 : ato === 2 ? p.info.diretas : p.info.total;
        return '<div class="n-seat"><span class="pn">' + esc(nomeFed(p.id)) + '</span><div class="sb"><i style="width:' + Math.round(p.info.votos / lider * 100) + '%;background:' + (typeof corDe === "function" ? corDe(p.id, 0) : "#2f6fe0") + '"></i></div><b>' + n + "</b></div>";
      }).join("");
      var eleitos = (P.qe.eleitos || []).filter(function (e) { return ato === 3 ? true : ato === 2 ? e.fase === "direta" : false; }).slice(0, 8);
      R.top.innerHTML = eleitos.map(function (e) {
        return '<div class="n-leg"><div class="mid"><div class="l1">' + esc(e.nome || e.candidato) + '</div><div class="l2">' + (e.fase === "sobra" ? "sobra" : "direta") + "</div></div><div class=\"pc\"><b>" + fmtV(e.votos || 0) + "</b></div></div>";
      }).join("");
      R.stat.innerHTML = t >= 1 ? '<div class="n-stat ok"><b>Quociente fechado.</b> ' + (P.qe.campeaoFora ? ("O mais votado sem cadeira: " + esc(P.qe.campeaoFora.nome) + ".") : "") + "</div>" : "";
    };
    atualizarLeg._qe = true;
  }

  try {
    if (location.search.indexOf("qeDebug") >= 0 && typeof window.__qeBoot === "undefined") {
      window.__qeBoot = true;
      var b = apurarProporcional({ vagas: 10, partidos: [{ id: "A", votos_legenda: 42000, candidatos: [{ id: "a", votos: 378000, idade: 40 }] }] });
      if (b.QE !== 100000) console.error("quociente debug", b.QE);
    }
  } catch (e) {}
  try { migrarQuociente(); } catch (e) {}
})();
