/* QUOCIENTE_ELEITORAL_V1
   Motor puro da apuração proporcional. Sem DOM, sem estado do jogo.
   O Anexo A é a referência: este arquivo reproduz aquele algoritmo
   e acrescenta o ramo regra_sem_qe = "mais_votados". */
(function (root) {
  var REGRAS_ELEITORAIS = {
    quociente: {
      votos_validos: "nominais+legenda",
      arredondamento_QE: "ce_art106",
      arredondamento_QP: "floor"
    },
    barreira_candidato_qp: 0.10,
    modo_sobras: "stf2024",
    barreira_partido_sobras: 0.0,
    barreira_candidato_sobras: 0.0,
    regra_sem_qe: "dhondt_todos",
    desempate: "mais_idoso",
    max_candidatos_por_vaga: 1.0,
    cota_genero_min: 0.30,
    coligacao_proporcional: false,
    federacao_duracao_minima_anos: 4,
    clausula_desempenho: {
      2026: { pct_votos_validos: 2.5, min_pct_por_uf: 1.5, ufs: 9, ou_deputados: 13 },
      2030: { pct_votos_validos: 3.0, min_pct_por_uf: 2.0, ufs: 9, ou_deputados: 15 }
    },
    clausula_efeitos: ["fundo_partidario", "tempo_tv_radio"],
    calendario: { janela_partidaria_dias: 30, convencoes: [-76, -60], registro_ate: -50, campanha_inicio: -49, eleicao: 0, segundo_turno: 21 },
    prefeito_segundo_turno_eleitores_min: 200000,
    senado: { renovacao: ["1/3", "2/3"], mandato_anos: 8 },
    geracao: {
      legenda_min: 0.05,
      legenda_max: 0.25,
      puxador_multiplicador: 2.4,
      fundo_eu: 1.18,
      fundo_puxador_no_eu: 0.92,
      fundo_no_puxador: 1.35,
      fundo_chapa: 1.06
    },
    camara_federal: { AC: 8, AL: 9, AP: 8, AM: 8, BA: 39, CE: 22, DF: 8, ES: 10, GO: 17, MA: 18, MT: 8, MS: 8, MG: 53, PA: 17, PB: 12, PR: 30, PE: 25, PI: 10, RJ: 46, RN: 8, RS: 31, RO: 8, RR: 8, SC: 16, SP: 70, SE: 8, TO: 8 },
    camara_municipal: [
      [15000, 9], [30000, 11], [50000, 13], [80000, 15], [120000, 17], [160000, 19],
      [300000, 21], [450000, 23], [600000, 25], [750000, 27], [900000, 29], [1050000, 31],
      [1200000, 33], [1350000, 35], [1500000, 37], [1800000, 39], [2400000, 41], [3000000, 43],
      [4000000, 45], [5000000, 47], [6000000, 49], [7000000, 51], [8000000, 53], [Infinity, 55]
    ]
  };

  function qeArredondado(validos, vagas) {
    var q = validos / vagas, f = Math.floor(q), frac = q - f;
    return frac > 0.5 ? f + 1 : f;
  }

  function cmpCand(a, b) {
    return b.votos - a.votos || (b.idade || 0) - (a.idade || 0) || (a.id < b.id ? -1 : 1);
  }

  function regrasEfetivas(regras) {
    var base = {
      barreira_candidato_qp: REGRAS_ELEITORAIS.barreira_candidato_qp,
      barreira_candidato_sobras: REGRAS_ELEITORAIS.barreira_candidato_sobras,
      barreira_partido_sobras: REGRAS_ELEITORAIS.barreira_partido_sobras,
      regra_sem_qe: REGRAS_ELEITORAIS.regra_sem_qe,
      modo_sobras: REGRAS_ELEITORAIS.modo_sobras
    };
    var R = Object.assign(base, regras || {});
    if (!regras || regras.barreira_partido_sobras == null) {
      if (R.modo_sobras === "lei14211_80_20") {
        R.barreira_partido_sobras = 0.8;
        R.barreira_candidato_sobras = 0.2;
      }
    }
    return R;
  }

  function apurarProporcional(entrada) {
    var vagas = entrada.vagas;
    var partidos = entrada.partidos || [];
    var R = regrasEfetivas(entrada.regras);
    var passos = [];
    var P = partidos.map(function (p) {
      var cands = p.candidatos.slice().sort(cmpCand);
      var votos = (p.votos_legenda || 0) + cands.reduce(function (s, c) { return s + c.votos; }, 0);
      return { id: p.id, votos: votos, cands: cands, eleitos: [], cadeiras: 0, diretas: 0, sobras: 0 };
    });
    var validos = P.reduce(function (s, p) { return s + p.votos; }, 0);
    var QE = vagas > 0 ? qeArredondado(validos, vagas) : 0;
    passos.push({ fase: "QE", validos: validos, vagas: vagas, QE: QE });

    var preenchidas = 0;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      var qp = QE > 0 ? Math.floor(p.votos / QE) : 0;
      var aptos = p.cands.filter(function (c) { return c.votos >= R.barreira_candidato_qp * QE; });
      var n = Math.min(qp, aptos.length, vagas - preenchidas);
      for (var k = 0; k < n; k++) p.eleitos.push(Object.assign({}, aptos[k], { fase: "direta" }));
      p.cadeiras = n;
      p.diretas = n;
      preenchidas += n;
      passos.push({ fase: "QP", partido: p.id, qp: qp, aptos: aptos.length, cadeiras: n });
    }

    var ninguemQE = P.every(function (p) { return (QE > 0 ? Math.floor(p.votos / QE) : 0) === 0; });
    if (ninguemQE && R.regra_sem_qe === "mais_votados") {
      var todos = [];
      P.forEach(function (p) { p.cands.forEach(function (c) { todos.push({ p: p, c: c }); }); });
      todos.sort(function (a, b) { return cmpCand(a.c, b.c); });
      for (var t = 0; t < todos.length && preenchidas < vagas; t++) {
        var item = todos[t];
        item.p.eleitos.push(Object.assign({}, item.c, { fase: "mais_votados" }));
        item.p.cadeiras++;
        item.p.sobras++;
        preenchidas++;
        passos.push({ fase: "mais_votados", partido: item.p.id, candidato: item.c.id });
      }
    } else {
      var rodada = 0;
      while (preenchidas < vagas) {
        rodada++;
        var elegiveis = P.filter(function (p) {
          return p.votos >= R.barreira_partido_sobras * QE &&
            p.cands.some(function (c) {
              return !p.eleitos.find(function (e) { return e.id === c.id; }) && c.votos >= R.barreira_candidato_sobras * QE;
            });
        });
        if (!elegiveis.length) break;
        var medias = elegiveis.map(function (p) { return { id: p.id, media: p.votos / (p.cadeiras + 1), votos: p.votos }; });
        medias.sort(function (a, b) { return b.media - a.media || b.votos - a.votos || (a.id < b.id ? -1 : 1); });
        var venc = P.find(function (p) { return p.id === medias[0].id; });
        var prox = venc.cands.find(function (c) {
          return !venc.eleitos.find(function (e) { return e.id === c.id; }) && c.votos >= R.barreira_candidato_sobras * QE;
        });
        venc.eleitos.push(Object.assign({}, prox, { fase: "sobra" }));
        venc.cadeiras++;
        venc.sobras++;
        preenchidas++;
        passos.push({ fase: "sobra", rodada: rodada, medias: medias, vencedor: venc.id, candidato: prox.id });
      }
    }

    var suplentes = P.map(function (p) {
      return {
        partido: p.id,
        ordem: p.cands.filter(function (c) { return !p.eleitos.find(function (e) { return e.id === c.id; }); }).map(function (c) { return c.id; })
      };
    });
    return {
      QE: QE,
      validos: validos,
      passos: passos,
      suplentes: suplentes,
      vagas_nao_preenchidas: Math.max(0, vagas - preenchidas),
      regras_usadas: {
        modo_sobras: R.modo_sobras,
        barreira_candidato_qp: R.barreira_candidato_qp,
        barreira_partido_sobras: R.barreira_partido_sobras,
        barreira_candidato_sobras: R.barreira_candidato_sobras,
        regra_sem_qe: R.regra_sem_qe
      },
      por_partido: Object.fromEntries(P.map(function (p) {
        return [p.id, { votos: p.votos, diretas: p.diretas, sobras: p.sobras, total: p.cadeiras }];
      })),
      eleitos: P.reduce(function (arr, p) {
        return arr.concat(p.eleitos.map(function (e) {
          return { partido: p.id, candidato: e.id, votos: e.votos, fase: e.fase, nome: e.nome || null, partido_origem: e.partido || p.id, jogador: !!e.jogador };
        }));
      }, [])
    };
  }

  function recalcular(eleicao, motivo) {
    var copia = JSON.parse(JSON.stringify(eleicao));
    var id = motivo && (motivo.candidato || motivo.cassado);
    if (id) {
      (copia.partidos || []).forEach(function (p) {
        (p.candidatos || []).forEach(function (c) { if (c.id === id) c.votos = 0; });
      });
    }
    var r = apurarProporcional(copia);
    r.motivo = motivo || null;
    return r;
  }

  function vagasAssembleia(federais) {
    federais = federais || 0;
    if (federais <= 12) return 3 * federais;
    return 36 + (federais - 12);
  }

  function vagasCamaraMunicipal(populacao) {
    var faixas = REGRAS_ELEITORAIS.camara_municipal;
    for (var i = 0; i < faixas.length; i++) if (populacao <= faixas[i][0]) return faixas[i][1];
    return 55;
  }

  function cotaGeneroOk(candidatos, regras) {
    var min = (regras && regras.cota_genero_min != null) ? regras.cota_genero_min : REGRAS_ELEITORAIS.cota_genero_min;
    var lista = candidatos || [];
    if (!lista.length) return true;
    var f = 0, m = 0;
    lista.forEach(function (c) {
      var g = (c.genero || c.sexo || "").toUpperCase();
      if (g === "F") f++; else m++;
    });
    var n = f + m;
    return f / n >= min - 1e-9 && m / n >= min - 1e-9 && f / n <= (1 - min) + 1e-9 && m / n <= (1 - min) + 1e-9;
  }

  function limiteCandidatos(vagas, regras) {
    var m = (regras && regras.max_candidatos_por_vaga != null) ? regras.max_candidatos_por_vaga : REGRAS_ELEITORAIS.max_candidatos_por_vaga;
    return Math.floor(vagas * m) + 1;
  }

  function faixaClausula(ano) {
    var tab = REGRAS_ELEITORAIS.clausula_desempenho;
    var chaves = Object.keys(tab).map(Number).sort(function (a, b) { return a - b; });
    var uso = chaves[0];
    chaves.forEach(function (y) { if (ano >= y) uso = y; });
    return tab[uso];
  }

  function clausulaOk(info, ano) {
    var regra = faixaClausula(ano);
    info = info || {};
    var porVoto = (info.pct_nacional || 0) >= regra.pct_votos_validos && (info.ufs_com_minimo || 0) >= regra.ufs;
    var porCadeira = (info.deputados || 0) >= regra.ou_deputados && (info.ufs_com_deputado || 0) >= regra.ufs;
    return { ok: !!(porVoto || porCadeira), regra: regra, por_voto: !!porVoto, por_cadeira: !!porCadeira };
  }

  var api = {
    REGRAS_ELEITORAIS: REGRAS_ELEITORAIS,
    qeArredondado: qeArredondado,
    apurarProporcional: apurarProporcional,
    recalcular: recalcular,
    regrasEfetivas: regrasEfetivas,
    vagasAssembleia: vagasAssembleia,
    vagasCamaraMunicipal: vagasCamaraMunicipal,
    cotaGeneroOk: cotaGeneroOk,
    limiteCandidatos: limiteCandidatos,
    faixaClausula: faixaClausula,
    clausulaOk: clausulaOk
  };
  Object.keys(api).forEach(function (k) { root[k] = api[k]; });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
