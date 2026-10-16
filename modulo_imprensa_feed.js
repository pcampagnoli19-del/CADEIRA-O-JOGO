/* =============================================================================
   CADEIRA — IMPRENSA E FEED (barramento de fatos → conteúdo)
   Spec: CADEIRA_Spec_Imprensa_e_Feed.md

   MODULO ADITIVO. Nao remove aba Imprensa / CadeiraFeed / vinculo com PLs.
   Substitui o motor de conteudo: sem fato nao ha manchete nova nem tweet novo.
   Expoe window.IMPF. Preserva EMP / DIP / INF.
   ============================================================================= */
(function () {
  "use strict";

  var IMPF = (window.IMPF = window.IMPF || {});
  IMPF.versao = 1;
  IMPF.SCHEMA = "schema_imprensa_v2";

  function _clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _rnd(a, b) { return a + Math.random() * (b - a); }
  function _hash(s) {
    var h = 2166136261 >>> 0;
    s = String(s || "");
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }
  function _toast(m, t) { try { if (typeof toast === "function") toast(m, t || "ok"); } catch (e) {} }
  function _mancheteLegada(t, k) {
    try { if (typeof manchete === "function" && !manchete._impfWrapped) manchete(t, k); } catch (e) {}
  }
  function _agora() {
    try {
      if (typeof dt === "function") {
        var d = dt();
        return { ano: d.ano, mes: d.mes, dia: d.dia || 1, turno: d.turno_total || 0 };
      }
    } catch (e) {}
    return { ano: 2024, mes: 1, dia: 1, turno: 0 };
  }
  function _seeded() {
    var st = IMPF.estado();
    if (!st) return Math.random();
    st._rng = (st._rng * 1664525 + 1013904223) >>> 0;
    return (st._rng % 10000) / 10000;
  }
  function _seedPick(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(_seeded() * arr.length)];
  }

  /* ---------- 2.4 Pautas ---------- */
  IMPF.PAUTAS = [
    "saude_publica", "educacao", "seguranca_publica", "emprego_renda", "inflacao_custo_vida",
    "corrupcao", "meio_ambiente", "politica_externa", "costumes_valores", "previdencia",
    "funcionalismo", "transporte", "moradia", "tecnologia_redes", "pesquisa_eleitoral",
    "eleicao_calendario", "justica_stf", "forcas_armadas", "agro_clima", "energia_combustiveis",
    "legislativo", "economia", "diplomacia", "rede"
  ];

  IMPF.FRAMES = ["escandalo", "incompetencia", "conquista", "conflito", "economia_no_bolso", "legalidade", "humano", "moral", "geopolitico", "tecnico"];
  IMPF.TOMS = ["neutro", "favoravel", "critico", "alarmista", "ironico", "tecnico"];
  IMPF.TONS_DIP = ["elogioso", "firme", "conciliador", "transacional", "desafiador", "tecnico", "evasivo", "solidario"];

  /* ---------- 3.1 Veiculos (arquetipos + pele) ---------- */
  IMPF.ARQ_VEICULOS = {
    V1: { id: "V1", arquetipo: "jornal_liberal_economico", pele_real: "Estadão", pele_parodica: "O Estandarte Paulista",
      formato: "jornal", escopo: "nacional", linha: { economica: 55, costumes: 10 },
      redacao: { agressividade: 40, rigor: 85, sensacionalismo: 20 }, credibilidade: 85, alcance: 65,
      dono_ref: "frias_mesquita", dependencia_publicidade: 45,
      pautas_favoritas: ["economia", "inflacao_custo_vida", "justica_stf"], pautas_evitadas: ["costumes_valores"],
      portal_legado: "estadao",
      frames: { escandalo: 2, incompetencia: 3, conquista: 1, conflito: 1, economia_no_bolso: 3, legalidade: 3, humano: 0, moral: 1, geopolitico: 2, tecnico: 3 } },
    V2: { id: "V2", arquetipo: "jornal_centro_progressista", pele_real: "Folha de S.Paulo", pele_parodica: "Folha do Planalto",
      formato: "jornal", escopo: "nacional", linha: { economica: -15, costumes: -45 },
      redacao: { agressividade: 55, rigor: 80, sensacionalismo: 35 }, credibilidade: 80, alcance: 80,
      dono_ref: "frias_mesquita", dependencia_publicidade: 50,
      pautas_favoritas: ["corrupcao", "saude_publica", "pesquisa_eleitoral"], pautas_evitadas: [],
      portal_legado: "folha",
      frames: { escandalo: 3, incompetencia: 2, conquista: 1, conflito: 2, economia_no_bolso: 2, legalidade: 3, humano: 3, moral: 2, geopolitico: 2, tecnico: 1 } },
    V3: { id: "V3", arquetipo: "tv_cabo_24h", pele_real: "CNN Brasil", pele_parodica: "Canal 24h Brasil",
      formato: "tv_cabo", escopo: "nacional", linha: { economica: 10, costumes: 0 },
      redacao: { agressividade: 60, rigor: 65, sensacionalismo: 55 }, credibilidade: 70, alcance: 60,
      dono_ref: null, dependencia_publicidade: 55,
      pautas_favoritas: ["legislativo", "politica_externa", "economia"], pautas_evitadas: [],
      portal_legado: "cnn",
      frames: { escandalo: 3, incompetencia: 2, conquista: 1, conflito: 3, economia_no_bolso: 1, legalidade: 2, humano: 1, moral: 1, geopolitico: 2, tecnico: 1 } },
    V4: { id: "V4", arquetipo: "tv_aberta_lider", pele_real: "Globo", pele_parodica: "Rede Horizonte",
      formato: "tv_aberta", escopo: "nacional", linha: { economica: 20, costumes: -5 },
      redacao: { agressividade: 45, rigor: 70, sensacionalismo: 45 }, credibilidade: 75, alcance: 95,
      dono_ref: "marinho", dependencia_publicidade: 40,
      pautas_favoritas: ["inflacao_custo_vida", "saude_publica", "eleicao_calendario"], pautas_evitadas: [],
      portal_legado: "g1",
      frames: { escandalo: 2, incompetencia: 2, conquista: 2, conflito: 2, economia_no_bolso: 3, legalidade: 2, humano: 3, moral: 2, geopolitico: 1, tecnico: 1 } },
    V5: { id: "V5", arquetipo: "tv_popular_religiosa", pele_real: "Record", pele_parodica: "TV Aliança",
      formato: "tv_aberta", escopo: "nacional", linha: { economica: 25, costumes: 70 },
      redacao: { agressividade: 60, rigor: 50, sensacionalismo: 70 }, credibilidade: 55, alcance: 85,
      dono_ref: "macedo", dependencia_publicidade: 35,
      pautas_favoritas: ["costumes_valores", "seguranca_publica", "emprego_renda"], pautas_evitadas: ["meio_ambiente"],
      portal_legado: null,
      frames: { escandalo: 3, incompetencia: 1, conquista: 2, conflito: 3, economia_no_bolso: 2, legalidade: 1, humano: 3, moral: 3, geopolitico: 0, tecnico: 0 } },
    V6: { id: "V6", arquetipo: "agencia_factual", pele_real: null, pele_parodica: "Agência Fato Brasil",
      formato: "agencia", escopo: "nacional", linha: { economica: 0, costumes: 0 },
      redacao: { agressividade: 25, rigor: 90, sensacionalismo: 15 }, credibilidade: 88, alcance: 55,
      dono_ref: null, dependencia_publicidade: 20,
      pautas_favoritas: ["legislativo", "economia"], pautas_evitadas: [],
      portal_legado: null,
      frames: { escandalo: 1, incompetencia: 1, conquista: 1, conflito: 1, economia_no_bolso: 2, legalidade: 2, humano: 0, moral: 0, geopolitico: 1, tecnico: 3 } },
    V7: { id: "V7", arquetipo: "portal_direita", pele_real: null, pele_parodica: "Portal Direita Livre",
      formato: "portal", escopo: "nacional", linha: { economica: 65, costumes: 60 },
      redacao: { agressividade: 80, rigor: 50, sensacionalismo: 70 }, credibilidade: 50, alcance: 50,
      dono_ref: null, dependencia_publicidade: 60,
      pautas_favoritas: ["corrupcao", "costumes_valores", "seguranca_publica"], pautas_evitadas: [],
      portal_legado: null,
      frames: { escandalo: 3, incompetencia: 3, conquista: 0, conflito: 3, economia_no_bolso: 2, legalidade: 1, humano: 1, moral: 3, geopolitico: 1, tecnico: 1 } },
    V8: { id: "V8", arquetipo: "independente_esquerda", pele_real: null, pele_parodica: "Independente Investigativo",
      formato: "portal", escopo: "nacional", linha: { economica: -65, costumes: -65 },
      redacao: { agressividade: 75, rigor: 70, sensacionalismo: 55 }, credibilidade: 60, alcance: 35,
      dono_ref: null, dependencia_publicidade: 25,
      pautas_favoritas: ["corrupcao", "meio_ambiente", "saude_publica"], pautas_evitadas: [],
      portal_legado: null,
      frames: { escandalo: 3, incompetencia: 2, conquista: 0, conflito: 3, economia_no_bolso: 1, legalidade: 3, humano: 3, moral: 2, geopolitico: 1, tecnico: 1 } },
    V9: { id: "V9", arquetipo: "jornal_local", pele_real: "Diário do Grande ABC", pele_parodica: "Gazeta do ABC",
      formato: "local", escopo: "regional", linha: { economica: 5, costumes: 0 },
      redacao: { agressividade: 40, rigor: 55, sensacionalismo: 40 }, credibilidade: 60, alcance: 25,
      dono_ref: null, dependencia_publicidade: 70,
      pautas_favoritas: ["transporte", "moradia", "saude_publica"], pautas_evitadas: ["geopolitico"],
      portal_legado: null, veiculo_legado: "diario",
      frames: { escandalo: 1, incompetencia: 2, conquista: 2, conflito: 1, economia_no_bolso: 2, legalidade: 1, humano: 3, moral: 2, geopolitico: 0, tecnico: 1 } },
    V10: { id: "V10", arquetipo: "imprensa_internacional", pele_real: null, pele_parodica: "Global Markets Desk",
      formato: "internacional", escopo: "internacional", linha: { economica: 40, costumes: -10 },
      redacao: { agressividade: 30, rigor: 90, sensacionalismo: 25 }, credibilidade: 90, alcance: 70,
      dono_ref: null, dependencia_publicidade: 15,
      pautas_favoritas: ["economia", "politica_externa", "diplomacia"], pautas_evitadas: ["costumes_valores"],
      portal_legado: null,
      frames: { escandalo: 1, incompetencia: 2, conquista: 1, conflito: 1, economia_no_bolso: 3, legalidade: 2, humano: 0, moral: 0, geopolitico: 3, tecnico: 3 } }
  };

  IMPF.TRIBOS_FEED = {
    esquerda_radical: { nome: "Esquerda radical", tom: "desafiador", tags: ["#Fora", "#Luta"] },
    esquerda_moderada: { nome: "Esquerda moderada", tom: "firme", tags: ["#Democracia", "#Direitos"] },
    centro: { nome: "Centro", tom: "tecnico", tags: ["#Equilibrio", "#Instituições"] },
    direita_liberal: { nome: "Direita liberal", tom: "transacional", tags: ["#Liberdade", "#Mercado"] },
    direita_conservadora: { nome: "Direita conservadora", tom: "firme", tags: ["#Ordem", "#Família"] },
    direita_radical: { nome: "Direita radical", tom: "desafiador", tags: ["#Chega"] },
    entretenimento_apolitico: { nome: "Entretenimento", tom: "conciliador", tags: ["#Trend"] },
    religioso: { nome: "Religioso", tom: "solidario", tags: ["#Fé"] },
    agro: { nome: "Agro", tom: "transacional", tags: ["#Agro"] },
    periferia: { nome: "Periferia", tom: "firme", tags: ["#Quebrada"] },
    universitario: { nome: "Universitário", tom: "tecnico", tags: ["#Campus"] },
    aposentado: { nome: "Aposentado", tom: "conciliador", tags: ["#Previdência"] }
  };

  /* ---------- Estado / migracao ---------- */
  IMPF._migrando = false;

  IMPF.estado = function () {
    if (typeof gameState === "undefined" || !gameState) return null;
    if (IMPF._migrando) return gameState.imprensa_feed || null;
    if (!gameState.imprensa_feed || gameState.imprensa_feed.schema !== IMPF.SCHEMA) {
      IMPF.migrarSave();
    }
    return gameState.imprensa_feed;
  };

  IMPF.migrarSave = function () {
    if (typeof gameState === "undefined" || !gameState) return;
    if (IMPF._migrando) return gameState.imprensa_feed;
    IMPF._migrando = true;
    var j = typeof J === "function" ? J() : null;
    var relOld = (j && j.relacao_imprensa) || {};
    var st = {
      schema: IMPF.SCHEMA,
      versao: IMPF.versao,
      usar_nomes_reais: true,
      semente: (gameState.imprensa_feed && gameState.imprensa_feed.semente) || (Math.floor(Math.random() * 1e9) + 1),
      _rng: 0,
      fatos: [],
      fatos_mes: 0,
      mes_contador: null,
      publicacoes: [],
      posts: [],
      trending: [],
      historias: [],
      campanhas: [],
      institutos: [],
      veiculos: {},
      jornalistas: [],
      contas: [],
      agenda_publica: {},
      equipe: { qualidade: 45, assessor_imprensa: true, social_media: true, marqueteiro: false, custo_mensal: 0, rede_apoio_digital: 0 },
      memoria: { global: [], porConta: {}, cooldown: {}, porVeiculo: {} },
      saturacao: {},
      inspetor: { ultimo: [], taxa_repeticao: 0 },
      clipping: []
    };
    st._rng = st.semente >>> 0;
    // Expose early to avoid re-entrancy in nomeVeiculo / gerarContas
    gameState.imprensa_feed = st;

    Object.keys(IMPF.ARQ_VEICULOS).forEach(function (vid) {
      var a = IMPF.ARQ_VEICULOS[vid];
      var afin = 50;
      if (a.portal_legado === "estadao" && relOld.portais != null) afin = _clamp(50 + relOld.portais / 2, 0, 100);
      if (a.portal_legado === "folha" && relOld.portais != null) afin = _clamp(50 + relOld.portais / 2, 0, 100);
      if (a.portal_legado === "cnn" && relOld.portais != null) afin = _clamp(48 + relOld.portais / 2, 0, 100);
      if (a.portal_legado === "g1" && relOld.jn != null) afin = _clamp(50 + relOld.jn / 2, 0, 100);
      if (a.veiculo_legado === "diario" && relOld.diario != null) afin = _clamp(50 + relOld.diario / 2, 0, 100);
      st.veiculos[vid] = {
        id: vid,
        arquetipo: a.arquetipo,
        pele_real: a.pele_real,
        pele_parodica: a.pele_parodica,
        formato: a.formato,
        escopo: a.escopo,
        linha: Object.assign({}, a.linha),
        redacao: Object.assign({}, a.redacao),
        credibilidade: a.credibilidade,
        alcance: a.alcance,
        dono_ref: a.dono_ref,
        dependencia_publicidade: a.dependencia_publicidade,
        pautas_favoritas: a.pautas_favoritas.slice(),
        pautas_evitadas: a.pautas_evitadas.slice(),
        campanhas: [],
        relacao_jogador: { afinidade: afin, confianca: 50, acesso: 20, favor: 0 },
        editorias: ["politica", "economia", "cidades", "mundo", "opiniao"],
        portal_legado: a.portal_legado,
        veiculo_legado: a.veiculo_legado || null,
        frames: a.frames
      };
    });

    // Campanhas iniciais
    [["V1", "economia", "a_favor"], ["V2", "corrupcao", "contra"], ["V7", "costumes_valores", "a_favor"],
      ["V8", "meio_ambiente", "a_favor"], ["V5", "costumes_valores", "a_favor"]].forEach(function (c, i) {
      var camp = {
        id: "CAMP_" + (i + 1),
        veiculo_id: c[0],
        pauta: c[1],
        posicao: c[2],
        alvo_ref: "jogador",
        intensidade: 2,
        inicio: _agora().turno,
        fim_previsto: _agora().turno + 6,
        gatilho: "ideologia",
        resultado: null
      };
      st.campanhas.push(camp);
      if (st.veiculos[c[0]]) st.veiculos[c[0]].campanhas.push(camp.id);
    });

    st.institutos = [
      { id: "INST_RIG", arquetipo: "metodologia_rigorosa", vies: 0, margem_erro: 2.5, periodicidade_meses: 3, credibilidade: 90, nome: "Instituto Rigor" },
      { id: "INST_TEL", arquetipo: "telefone_rapido", vies: 1, margem_erro: 3.5, periodicidade_meses: 1, credibilidade: 65, nome: "Pulse Phone" },
      { id: "INST_ON", arquetipo: "online_painel", vies: -1, margem_erro: 4, periodicidade_meses: 1, credibilidade: 55, nome: "Painel Digital" }
    ];

    try {
      IMPF._gerarContasBase(st);
    } finally {
      IMPF._migrando = false;
    }
    return st;
  };

  IMPF._gerarContasBase = function (st) {
    var tribos = Object.keys(IMPF.TRIBOS_FEED);
    var arqs = [
      ["MotoristaApp", "periferia"], ["Professora", "universitario"], ["ProdutorRural", "agro"],
      ["Evangelico", "religioso"], ["Aposentado", "aposentado"], ["Universitario", "universitario"],
      ["Microempreendedor", "direita_liberal"], ["JovemPeriferia", "periferia"]
    ];
    arqs.forEach(function (a, i) {
      st.contas.push({
        id: "CTA_ELE_" + i,
        tipo: "eleitor_arquetipo",
        nome: a[0].replace(/([A-Z])/g, " $1").trim(),
        handle: "@" + a[0].toLowerCase(),
        tribo: a[1],
        tom_base: IMPF.TRIBOS_FEED[a[1]].tom,
        alcance: 20 + i * 3,
        seguidores: 500 + i * 200,
        credibilidade: 40,
        agressividade: 30 + i * 5,
        polarizacao: 40,
        volume_dia: 2,
        formatos: ["texto", "resposta"],
        gatilhos: [{ pauta: "emprego_renda", peso: 2 }, { pauta: "inflacao_custo_vida", peso: 3 }],
        rivais: [],
        aliados: [],
        plataforma_principal: "microblog",
        memoria_templates: []
      });
    });
    // Contas de veiculos
    Object.keys(st.veiculos).forEach(function (vid) {
      var v = st.veiculos[vid];
      st.contas.push({
        id: "CTA_" + vid,
        tipo: "veiculo",
        nome: v.pele_parodica || v.pele_real || vid,
        handle: "@" + vid.toLowerCase() + "_news",
        tribo: v.linha.economica > 20 ? "direita_liberal" : (v.linha.economica < -20 ? "esquerda_moderada" : "centro"),
        tom_base: "tecnico",
        alcance: v.alcance,
        seguidores: Math.round(v.alcance * 80000),
        credibilidade: v.credibilidade,
        agressividade: v.redacao.agressividade,
        polarizacao: Math.abs(v.linha.economica),
        volume_dia: 4,
        formatos: ["texto", "thread"],
        gatilhos: (v.pautas_favoritas || []).map(function (p) { return { pauta: p, peso: 3 }; }),
        rivais: [],
        aliados: [],
        plataforma_principal: "microblog",
        memoria_templates: [],
        veiculo_id: vid
      });
    });
    // Contas genericas tribo
    tribos.slice(0, 6).forEach(function (t, i) {
      st.contas.push({
        id: "CTA_TRIB_" + i,
        tipo: "anonimo",
        nome: "Voz " + IMPF.TRIBOS_FEED[t].nome,
        handle: "@voz_" + t.slice(0, 8),
        tribo: t,
        tom_base: IMPF.TRIBOS_FEED[t].tom,
        alcance: 35,
        seguidores: 12000 + i * 3000,
        credibilidade: 35,
        agressividade: 50,
        polarizacao: 60,
        volume_dia: 3,
        formatos: ["texto", "meme", "quote"],
        gatilhos: [{ pauta: "rede", peso: 2 }, { fato_tipo: "escandalo_vazado", peso: 3 }],
        rivais: [],
        aliados: [],
        plataforma_principal: "microblog",
        memoria_templates: []
      });
    });
  };

  IMPF.nomeVeiculo = function (v) {
    if (!v) return "Veículo";
    var st = (typeof gameState !== "undefined" && gameState && gameState.imprensa_feed) || null;
    var usar = st && st.usar_nomes_reais;
    if (usar && v.pele_real) return v.pele_real;
    return v.pele_parodica || v.pele_real || v.id;
  };

  /* ---------- Barramento de fatos ---------- */
  IMPF.emitirFato = function (parcial) {
    var st = IMPF.estado();
    if (!st) return null;
    var ag = _agora();
    if (st.mes_contador !== ag.ano + "-" + ag.mes) {
      st.mes_contador = ag.ano + "-" + ag.mes;
      st.fatos_mes = 0;
    }
    if (st.fatos_mes >= 120 && (parcial.gravidade || 1) < 4) return null;

    var fato = {
      id: parcial.id || ("FATO_" + ag.turno + "_" + _hash(JSON.stringify(parcial.tipo) + Math.random()).slice(0, 6)),
      mes: ag.mes,
      dia: ag.dia,
      hora: parcial.hora != null ? parcial.hora : 12,
      tipo: parcial.tipo || "gafe_publica",
      categoria: parcial.categoria || "pessoal",
      escopo: parcial.escopo || "nacional",
      atores: parcial.atores || [{ papel: "protagonista", ref: "jogador" }],
      pauta: parcial.pauta || ["legislativo"],
      gravidade: _clamp(parcial.gravidade != null ? parcial.gravidade : 2, 1, 5),
      valencia: _clamp(parcial.valencia != null ? parcial.valencia : 0, -100, 100),
      novidade: _clamp(parcial.novidade != null ? parcial.novidade : 80, 0, 100),
      verificado: parcial.verificado !== false,
      origem: parcial.origem || "oficial",
      oculto_ate: parcial.oculto_ate || null,
      tags: parcial.tags || [],
      dados: parcial.dados || {},
      semente: st.semente,
      processado: false,
      turno: ag.turno
    };

    // Dedup mesmo tipo+atores no mesmo dia
    var chave = fato.tipo + "|" + fato.atores.map(function (a) { return a.ref; }).join(",") + "|" + ag.ano + "-" + ag.mes + "-" + ag.dia;
    var dup = st.fatos.find(function (f) {
      return !f.processado && f._chave === chave;
    });
    if (dup) {
      dup.gravidade = Math.max(dup.gravidade, fato.gravidade);
      dup.novidade = Math.max(dup.novidade, fato.novidade);
      dup.dados = Object.assign({}, dup.dados, fato.dados);
      dup._agregado = (dup._agregado || 1) + 1;
      return dup;
    }
    fato._chave = chave;
    st.fatos.unshift(fato);
    st.fatos_mes++;
    if (st.fatos.length > 200) st.fatos.length = 200;
    st.inspetor.ultimo.unshift({ id: fato.id, tipo: fato.tipo, gravidade: fato.gravidade, quando: ag });
    if (st.inspetor.ultimo.length > 80) st.inspetor.ultimo.pop();
    return fato;
  };

  window.emitirFato = IMPF.emitirFato;

  /* Inferir fato a partir de manchete legada (ponte) */
  IMPF.inferirTipoDeManchete = function (txt, tipo) {
    var t = String(txt || "").toLowerCase();
    var tip = String(tipo || "").toLowerCase();
    if (/aprov/.test(t) && /projeto|pl |vot/.test(t)) return { tipo: "votacao_aprovada", categoria: "legislativo", gravidade: 3, valencia: 10, pauta: ["legislativo"] };
    if (/rejeit/.test(t) && /projeto|pl |vot/.test(t)) return { tipo: "votacao_rejeitada", categoria: "legislativo", gravidade: 3, valencia: -5, pauta: ["legislativo"] };
    if (/cpi/.test(t) || tip === "cpi") return { tipo: "cpi_instalada", categoria: "legislativo", gravidade: 4, valencia: -20, pauta: ["corrupcao"] };
    if (/pris[aã]o|preso/.test(t) || tip === "prisao") return { tipo: "prisao", categoria: "justica", gravidade: 5, valencia: -40, pauta: ["justica_stf"] };
    if (/infla/.test(t)) return { tipo: "inflacao_sobe", categoria: "economia", gravidade: 3, valencia: -15, pauta: ["inflacao_custo_vida"] };
    if (/pesquisa/.test(t)) return { tipo: "pesquisa_instituto", categoria: "eleicao", gravidade: 2, valencia: 0, pauta: ["pesquisa_eleitoral"] };
    if (/acordo|diplom|viagem/.test(t) || tip === "diplomacia") return { tipo: "acordo_assinado", categoria: "diplomacia", gravidade: 3, valencia: 8, pauta: ["politica_externa", "diplomacia"] };
    if (/esc[aâ]ndalo|vazamento|vazou/.test(t) || tip === "vazamento" || tip === "escandalo") return { tipo: "escandalo_vazado", categoria: "escandalo", gravidade: 4, valencia: -30, pauta: ["corrupcao"] };
    if (/viral|meme|rede|cancel/.test(t) || tip === "redes") return { tipo: "rede_viral", categoria: "rede", gravidade: 2, valencia: 0, pauta: ["tecnologia_redes", "rede"] };
    if (/elei|candidato|urna/.test(t)) return { tipo: "candidatura_lancada", categoria: "eleicao", gravidade: 3, valencia: 5, pauta: ["eleicao_calendario"] };
    if (/obra|inaugur/.test(t)) return { tipo: "obra_inaugurada", categoria: "executivo", gravidade: 2, valencia: 12, pauta: ["moradia"] };
    return { tipo: "gafe_publica", categoria: tip || "pessoal", gravidade: 2, valencia: -5, pauta: ["legislativo"] };
  };

  /* ---------- Templates de manchete (blocos recombinaveis) ---------- */
  IMPF.TMPL_MANCHETE = {
    votacao_aprovada: {
      conquista: {
        favoravel: ["{ator} celebra aprovação de {projeto} no Congresso", "Vitória: {projeto} passa com {votos_a_favor} votos"],
        neutro: ["Câmara aprova {projeto} após sessão longa", "{projeto} é aprovado; texto segue adiante"],
        critico: ["Governo empurra {projeto} com placar apertado de {votos_a_favor}"]
      },
      conflito: {
        critico: ["Câmara aprova {projeto} em meio a críticas da oposição", "{projeto} passa por {votos_a_favor} votos; oposição promete recorrer"],
        alarmista: ["Aprovado {projeto}: bancadas se digladiam e clima emperra o Congresso"],
        neutro: ["Placar de {votos_a_favor} a {votos_contra} decide destino de {projeto}"]
      },
      tecnico: {
        tecnico: ["Análise: o que muda com a aprovação de {projeto}", "{projeto} alterará regras de {pauta_humana}"]
      },
      economia_no_bolso: {
        neutro: ["{projeto} aprovado: impacto no bolso do brasileiro", "Famílias acompanham efeitos de {projeto} após votação"]
      }
    },
    votacao_rejeitada: {
      conflito: {
        critico: ["Derrota: Congresso rejeita {projeto}", "{projeto} cai no plenário; governo recua"],
        neutro: ["Projeto {projeto} é rejeitado por {votos_contra} votos"]
      },
      incompetencia: {
        critico: ["Articulação falha e {projeto} naufraga no Congresso"]
      }
    },
    inflacao_sobe: {
      economia_no_bolso: {
        alarmista: ["Inflação acelera e aperta o orçamento das famílias", "Feira mais cara: custo de vida sobe de novo"],
        critico: ["Preço da comida sobe e pressiona a popularidade de {ator}", "Governo perde o controle dos preços, dizem analistas"],
        tecnico: ["Inflação reacelera e mercado cobra ajuste fiscal", "Brazil's inflation reaccelerates, raising fiscal doubts"],
        neutro: ["Índice de preços sobe; o que muda no seu orçamento"]
      }
    },
    escandalo_vazado: {
      escandalo: {
        alarmista: ["Vazamento: {ator} no centro de denúncias", "Documento explosivo atinge {ator}"],
        critico: ["Mais um escândalo: {ator} precisa explicar", "Imprensa investiga ligação de {ator} com esquema"]
      },
      legalidade: {
        tecnico: ["Apuração em curso sobre denúncias envolvendo {ator}"]
      }
    },
    cpi_instalada: {
      conflito: {
        critico: ["CPI instalada para investigar {ator}", "Congresso abre CPI; pressão sobe sobre {ator}"],
        neutro: ["Comissão parlamentar de inquérito começa trabalhos"]
      }
    },
    acordo_assinado: {
      geopolitico: {
        favoravel: ["{ator} assina acordo e amplia agenda externa", "Diplomacia: acordo fecha frente internacional"],
        tecnico: ["Acordo diplomático detalha cooperação em {pauta_humana}"],
        neutro: ["Brasil firma entendimento internacional sob governo de {ator}"]
      },
      conquista: {
        favoravel: ["Vitória diplomática: {ator} celebra acordo"]
      }
    },
    pesquisa_instituto: {
      tecnico: {
        neutro: ["Pesquisa: {ator} com {percentual}% de aprovação", "Números novos: popularidade de {ator} em {percentual}%"],
        favoravel: ["Recuperação: {ator} sobe nas pesquisas"],
        critico: ["Queda: {ator} perde pontos na pesquisa"]
      }
    },
    rede_viral: {
      conflito: {
        ironico: ["Nas redes, {ator} vira meme do dia", "Assunto bomba: {ator} domina o trending"],
        neutro: ["Hashtag ligada a {ator} sobe no CadeiraFeed"]
      }
    },
    obra_inaugurada: {
      conquista: {
        favoravel: ["{ator} inaugura obra e colhe aplausos na base", "Obra entregue: {ator} celebra resultado"],
        neutro: ["Inauguração marca agenda de {ator}"]
      },
      humano: {
        favoravel: ["Moradores celebram entrega de obra sob {ator}"]
      }
    },
    gafe_publica: {
      incompetencia: {
        ironico: ["Gafe de {ator} viraliza e vira assunto nacional", "{ator} tropeça em fala e redes não perdoam"],
        critico: ["Declaração de {ator} gera constrangimento"]
      },
      humano: {
        neutro: ["{ator} gera repercussão após declaração polêmica"]
      }
    },
    pl_apresentado: {
      tecnico: {
        tecnico: ["Explicador: o que muda se {projeto} virar lei", "{projeto} chega ao Congresso; quem ganha e quem perde"]
      },
      conflito: {
        critico: ["{projeto} divide bancadas já na apresentação"]
      }
    },
    pl_votacao_plenario: {
      conflito: {
        neutro: ["Plenário decide destino de {projeto}", "Votação de {projeto}: placar em aberto"]
      }
    }
  };

  IMPF.LINHA_FINA = [
    "Texto repercute nas bancadas e nas redes.",
    "Analistas acompanham o desdobramento nas próximas horas.",
    "A pauta deve voltar à capa se houver fato novo.",
    "Oposição e base disputam a narrativa."
  ];

  /* ---------- Blocos de feed ---------- */
  IMPF.BLOCOS = {
    abertura: {
      direita_liberal: ["Aprovado.", "Passou.", "Recado dado:", "Boa notícia pro país:", "Olha o placar:"],
      direita_conservadora: ["Mais um capítulo.", "Precisa explicar.", "Atenção:", "Sem enrolação:"],
      esquerda_moderada: ["Investigação já!", "Quem errou paga.", "Fica o registro:", "Importante:"],
      esquerda_radical: ["Não passa!", "Fora!", "O povo vê:", "Vergonha:"],
      centro: ["Sem fato novo, nada a concluir.", "Aguardo a apuração.", "Dado concreto:", "Resumo:"],
      entretenimento_apolitico: ["Gente,", "Acabei de ver:", "Não é possível:", "Plot twist:"],
      periferia: ["Alô poder!", "Enquanto isso na quebrada:", "Prioridade é essa?", "Fala sério:"],
      religioso: ["Oremos.", "Temos de orar e agir.", "Atenção, irmãos:"],
      agro: ["No campo a gente sente.", "Produtor acompanha:", "Agenda do agro:"],
      universitario: ["Thread rápida:", "Contexto:", "Leitura:"],
      aposentado: ["Na minha época…", "Penso no aposentado:", "Alguém lembra da fila?"]
    },
    corpo: {
      votacao_aprovada: [
        "{projeto} foi aprovado com {votos_a_favor} votos.",
        "Placar de {votos_a_favor} a {votos_contra} para {projeto}.",
        "{projeto} virou realidade depois de meses de enrolação."
      ],
      votacao_rejeitada: [
        "{projeto} caiu no plenário.",
        "Derrota: {votos_contra} votos contra {projeto}."
      ],
      inflacao_sobe: [
        "Inflação sobe e o bolso sente.",
        "Preço da comida aperta de novo.",
        "{ator} precisa explicar o custo de vida."
      ],
      escandalo_vazado: [
        "Vaza denúncia envolvendo {ator}.",
        "{ator} no centro do vazamento do dia.",
        "Documento circula e {ator} ainda não se pronunciou."
      ],
      cpi_instalada: ["CPI instalada mira {ator}.", "Comissão começa a pressionar {ator}."],
      acordo_assinado: ["Acordo diplomático fechado sob {ator}.", "{ator} assina entendimento internacional."],
      pesquisa_instituto: ["Pesquisa coloca {ator} com {percentual}%.", "Números novos: {percentual}% para {ator}."],
      rede_viral: ["{ator} bomba nas redes.", "Trending: assunto ligado a {ator}."],
      obra_inaugurada: ["Obra inaugurada sob {ator}.", "{ator} entrega obra e colhe foto."],
      gafe_publica: ["Gafe de {ator} não para de circular.", "{ator} tropeça e vira assunto."],
      default: ["Assunto do dia envolve {ator}.", "{ator} está no centro da pauta {pauta_humana}."]
    },
    fecho: {
      direita_liberal: ["Quem apostou contra fica com a conta.", "Agora é cobrar a execução.", "Menos Estado, mais liberdade."],
      direita_conservadora: ["Chega de trama.", "Ordem e consequência.", "O Brasil cansa."],
      esquerda_moderada: ["Transparência já.", "Direitos não se negociam.", "Vamos acompanhar."],
      esquerda_radical: ["Rua é o caminho.", "Não perdoamos.", "Organizar a luta."],
      centro: ["Instituições acima de pessoas.", "Espero fatos, não gritaria.", "Moderação."],
      entretenimento_apolitico: ["💀", "Só sei que nada sei.", "Pipoca pronta."],
      periferia: ["Cadê o ônibus?", "UBS lotada, viu?", "Vem pra cá fora de eleição."],
      religioso: ["Deus no comando.", "Fé e trabalho."],
      agro: ["Agro é pop, agro é tech.", "Safra não espera discurso."],
      universitario: ["Fontes no fio.", "Leiam o projeto inteiro."],
      aposentado: ["Respeito a quem construiu o país.", "Olho no reajuste."]
    }
  };

  IMPF.slotsDeFato = function (fato) {
    var j = typeof J === "function" ? J() : { nome: "o governo" };
    var d = fato.dados || {};
    var projeto = d.projeto || d.nome || d.titulo || fato.tipo.replace(/_/g, " ");
    var pauta = (fato.pauta && fato.pauta[0]) || "pauta pública";
    return {
      ator: j.nome || "o governante",
      alvo: d.alvo || "a oposição",
      projeto: projeto,
      projeto_hash: String(projeto).replace(/\s+/g, "").slice(0, 18),
      valor: d.valor != null ? d.valor : "—",
      percentual: d.percentual != null ? d.percentual : Math.round((j.popularidade != null ? j.popularidade : 50)),
      votos_a_favor: d.votos_a_favor != null ? d.votos_a_favor : 280,
      votos_contra: d.votos_contra != null ? d.votos_contra : 180,
      cidade: d.cidade || "Mauá",
      numero: d.numero != null ? d.numero : 1,
      oposicao: d.oposicao || "a oposição",
      adjetivo: d.adjetivo || "polêmico",
      pauta_humana: String(pauta).replace(/_/g, " ")
    };
  };

  IMPF.preencher = function (tmpl, slots) {
    return String(tmpl).replace(/\{(\w+)\}/g, function (_, k) {
      return slots[k] != null ? slots[k] : "{" + k + "}";
    });
  };

  /* ---------- Interesse / pipeline imprensa ---------- */
  IMPF.pesoPauta = function (v, pautaArr) {
    var p = (pautaArr && pautaArr[0]) || "";
    if ((v.pautas_favoritas || []).indexOf(p) >= 0) return 20;
    if ((v.pautas_evitadas || []).indexOf(p) >= 0) return -15;
    return 0;
  };

  IMPF.calcInteresse = function (v, fato, st) {
    var satKey = v.id + "|" + ((fato.pauta && fato.pauta[0]) || "x");
    var sat = (st.saturacao[satKey] || 0);
    var alinh = 0;
    var linhaEco = (v.linha && v.linha.economica) || 0;
    // se fato ajuda inimigo editorial (+interesse), se ajuda aliado minimiza
    if (fato.valencia < -10 && linhaEco > 20) alinh += 8;
    if (fato.valencia > 10 && linhaEco < -20) alinh += 8;
    if (fato.valencia > 10 && linhaEco > 20) alinh -= 6;
    if (fato.valencia < -10 && linhaEco < -20) alinh -= 6;
    var escopoOk = 0;
    if (v.escopo === "internacional" && fato.escopo !== "internacional" && fato.categoria !== "diplomacia" && fato.gravidade < 3) escopoOk = -30;
    if (v.escopo === "regional" && fato.escopo === "internacional") escopoOk = -20;
    var campBonus = 0;
    (st.campanhas || []).forEach(function (c) {
      if (c.veiculo_id === v.id && fato.pauta && fato.pauta.indexOf(c.pauta) >= 0 && !c.resultado) campBonus = 25;
    });
    return IMPF.pesoPauta(v, fato.pauta) + fato.gravidade * 10 + fato.novidade * 0.2 + alinh + escopoOk - sat + campBonus
      + ((v.relacao_jogador && fato.valencia < 0) ? (50 - v.relacao_jogador.afinidade) * 0.15 : 0);
  };

  IMPF.escolherFrame = function (v, fato) {
    var prefs = v.frames || {};
    var scores = IMPF.FRAMES.map(function (fr) {
      var base = prefs[fr] || 0;
      if (fato.tipo.indexOf("escandalo") >= 0 && fr === "escandalo") base += 2;
      if (fato.tipo.indexOf("inflacao") >= 0 && fr === "economia_no_bolso") base += 2;
      if (fato.categoria === "diplomacia" && fr === "geopolitico") base += 2;
      if (fato.tipo.indexOf("votacao") >= 0 && fr === "conflito") base += 1;
      if ((v.redacao.sensacionalismo || 0) > 50 && (fr === "escandalo" || fr === "conflito" || fr === "moral")) base += 1;
      return { fr: fr, s: base };
    }).sort(function (a, b) { return b.s - a.s; });
    var top = scores.slice(0, 3);
    var soma = top.reduce(function (a, b) { return a + Math.max(1, b.s); }, 0);
    var r = _seeded() * soma;
    for (var i = 0; i < top.length; i++) {
      r -= Math.max(1, top[i].s);
      if (r <= 0) return top[i].fr;
    }
    return top[0].fr;
  };

  IMPF.tomBase = function (v, fato) {
    var rel = (v.relacao_jogador || {}).afinidade || 50;
    var rigor = (v.redacao && v.redacao.rigor) || 50;
    if (rigor >= 80) return fato.valencia < -20 ? "neutro" : "tecnico";
    if (rel < 35 && fato.valencia <= 0) return (v.redacao.sensacionalismo > 55) ? "alarmista" : "critico";
    if (rel > 65 && fato.valencia >= 0) return "favoravel";
    if (fato.valencia < -25) return "critico";
    if (fato.tipo.indexOf("rede") >= 0) return "ironico";
    return "neutro";
  };

  IMPF.escolherTemplate = function (fato, frame, tom, arqId, st) {
    var porTipo = IMPF.TMPL_MANCHETE[fato.tipo] || IMPF.TMPL_MANCHETE.gafe_publica;
    var porFrame = porTipo[frame] || porTipo[Object.keys(porTipo)[0]];
    var lista = (porFrame && (porFrame[tom] || porFrame.neutro || porFrame.critico || porFrame.tecnico)) || null;
    if (!lista) {
      var fk = Object.keys(porFrame || {})[0];
      lista = porFrame[fk];
    }
    if (!lista || !lista.length) lista = ["{ator} repercute fato sobre {pauta_humana}"];
    // anti-repeticao: tenta variantes
    var tent = 0;
    var escolha = null;
    while (tent < 5) {
      escolha = lista[Math.floor(_seeded() * lista.length)];
      var h = _hash(escolha + "|" + frame + "|" + tom);
      var cd = st.memoria.cooldown[h];
      var ag = _agora();
      if (!cd || cd <= ag.turno) {
        st.memoria.cooldown[h] = ag.turno + 21;
        break;
      }
      tent++;
    }
    return { id: "mc_" + fato.tipo + "_" + frame + "_" + tom + "_" + arqId, titulo: escolha, frame: frame, tom: tom };
  };

  IMPF.publicar = function (v, genero, texto, fato, meta) {
    var st = IMPF.estado();
    var pub = {
      id: "PUB_" + _hash(texto + v.id + fato.id).slice(0, 8),
      veiculo_id: v.id,
      genero: genero,
      titulo: texto,
      linha_fina: IMPF.preencher(_seedPick(IMPF.LINHA_FINA), IMPF.slotsDeFato(fato)),
      fato_id: fato.id,
      frame: meta.frame,
      tom: meta.tom,
      template_id: meta.template_id,
      semente: st.semente,
      turno: _agora().turno,
      impacto: meta.impacto || 0
    };
    st.publicacoes.unshift(pub);
    if (st.publicacoes.length > 90) {
      // arquivar antigo como resumo
      st.publicacoes.length = 90;
    }
    var satKey = v.id + "|" + ((fato.pauta && fato.pauta[0]) || "x");
    st.saturacao[satKey] = (st.saturacao[satKey] || 0) + 12;
    // ponte com manchetes legadas (sem loop: flag)
    try {
      if (typeof manchete === "function") {
        manchete._impfSkipInfer = true;
        manchete(IMPF.nomeVeiculo(v) + ": " + texto, "imprensa");
        manchete._impfSkipInfer = false;
      }
    } catch (e) { manchete._impfSkipInfer = false; }
    return pub;
  };

  IMPF.aplicarImpacto = function (v, fato, genero, tom, st) {
    var fadiga = 0;
    var mesmas = st.publicacoes.filter(function (p) { return p.fato_id === fato.id; }).length;
    if (mesmas > 1) fadiga = Math.min(0.6, (mesmas - 1) * 0.2);
    var valN = fato.valencia / 100;
    var multTom = ({ neutro: 1, critico: 1.2, alarmista: 1.4, favoravel: 0.85, ironico: 1.1, tecnico: 0.9 })[tom] || 1;
    var impacto = fato.gravidade * Math.abs(valN) * (v.credibilidade / 100) * (v.alcance / 100) * (1 - fadiga) * multTom * 10;
    if (tom === "alarmista") v.credibilidade = _clamp(v.credibilidade - 1, 20, 100);
    // agenda publica
    (fato.pauta || []).forEach(function (p) {
      st.agenda_publica[p] = _clamp((st.agenda_publica[p] || 30) + impacto * 0.8, 0, 100);
    });
    // popularidade leve
    try {
      if (typeof mudarAprovTodos === "function" && impacto >= 4) {
        var dir = fato.valencia >= 0 ? 1 : -1;
        mudarAprovTodos(dir * Math.min(1.5, impacto / 20));
      }
    } catch (e) {}
    if (impacto >= 12) {
      IMPF.emitirFato({
        tipo: "rede_repercussao",
        categoria: "rede",
        gravidade: Math.min(4, fato.gravidade),
        valencia: fato.valencia * 0.5,
        pauta: fato.pauta,
        origem: "rede",
        dados: { origem_fato: fato.id, veiculo: v.id }
      });
    }
    return impacto;
  };

  IMPF.agendarArco = function (fato, st) {
    if (fato.gravidade < 3) return;
    var tema = (fato.pauta && fato.pauta[0]) || fato.tipo;
    var existente = st.historias.find(function (h) { return h.tema === tema && h.estado !== "Desfecho"; });
    if (existente) {
      existente.fatos.push(fato.id);
      existente.energia = _clamp(existente.energia + 15 + fato.gravidade * 5, 0, 100);
      if (existente.estado === "Faísca") existente.estado = "Denúncia";
      else if (existente.estado === "Denúncia") existente.estado = "Repercussão";
      return existente;
    }
    var h = {
      id: "HIST_" + fato.id,
      tema: tema,
      pauta: tema,
      fatos: [fato.id],
      estado: fato.origem === "boato" || !fato.verificado ? "Faísca" : "Denúncia",
      energia: 40 + fato.gravidade * 10,
      veiculos_envolvidos: [],
      proximo_desdobramento_dia: _agora().turno + 1,
      desfecho: null
    };
    st.historias.unshift(h);
    if (st.historias.length > 20) st.historias.length = 20;
    return h;
  };

  IMPF.processarFatoImprensa = function (fato, st) {
    var pubs = [];
    Object.keys(st.veiculos).forEach(function (vid) {
      var v = st.veiculos[vid];
      // V10 so grav>=3 ou diplomacia
      if (vid === "V10" && fato.categoria !== "diplomacia" && fato.gravidade < 3) return;
      var interesse = IMPF.calcInteresse(v, fato, st);
      var limiar = (fato.gravidade >= 4) ? 40 : 55;
      var diag = { veiculo: vid, interesse: Math.round(interesse), limiar: limiar, publicou: false };
      if (interesse >= limiar) {
        var genero = fato.gravidade >= 4 ? "manchete_capa" : (fato.gravidade >= 3 ? "noticia" : "nota_curta");
        if (fato.tipo.indexOf("pl_") === 0 && fato.gravidade >= 2) genero = "explicador";
        var frame = IMPF.escolherFrame(v, fato);
        var tom = IMPF.tomBase(v, fato);
        var tmpl = IMPF.escolherTemplate(fato, frame, tom, vid, st);
        var slots = IMPF.slotsDeFato(fato);
        var texto = IMPF.preencher(tmpl.titulo, slots);
        var impacto = IMPF.aplicarImpacto(v, fato, genero, tom, st);
        var pub = IMPF.publicar(v, genero, texto, fato, {
          frame: frame, tom: tom, template_id: tmpl.id, impacto: impacto
        });
        pubs.push(pub);
        diag.publicou = true;
        diag.genero = genero;
        diag.frame = frame;
        diag.tom = tom;
        diag.template_id = tmpl.id;
        var hist = st.historias.find(function (h) { return h.fatos.indexOf(fato.id) >= 0; });
        if (hist && hist.veiculos_envolvidos.indexOf(vid) < 0) hist.veiculos_envolvidos.push(vid);
      }
      st.inspetor.ultimo[0] = st.inspetor.ultimo[0] || {};
      if (!fato._diag) fato._diag = [];
      fato._diag.push(diag);
    });
    IMPF.agendarArco(fato, st);
    return pubs;
  };

  /* ---------- Feed por blocos ---------- */
  IMPF.montarPost = function (conta, fato, st) {
    var tribo = conta.tribo || "centro";
    var slots = IMPF.slotsDeFato(fato);
    var aberturas = IMPF.BLOCOS.abertura[tribo] || IMPF.BLOCOS.abertura.centro;
    var corpos = IMPF.BLOCOS.corpo[fato.tipo] || IMPF.BLOCOS.corpo.default;
    var fechos = IMPF.BLOCOS.fecho[tribo] || IMPF.BLOCOS.fecho.centro;
    var tags = (IMPF.TRIBOS_FEED[tribo] && IMPF.TRIBOS_FEED[tribo].tags) || ["#Cadeira"];
    var tent = 0;
    var texto = "";
    var hash = "";
    while (tent < 5) {
      var a = aberturas[Math.floor(_seeded() * aberturas.length)];
      var c = corpos[Math.floor(_seeded() * corpos.length)];
      var f = fechos[Math.floor(_seeded() * fechos.length)];
      var h = tags[Math.floor(_seeded() * tags.length)];
      if (fato.dados && fato.dados.projeto) h = "#" + String(fato.dados.projeto).replace(/\s+/g, "").slice(0, 16);
      texto = IMPF.preencher(a + " " + c + " " + f + " " + h, slots);
      hash = _hash(texto);
      if (st.memoria.global.indexOf(hash) < 0 && (conta.memoria_templates || []).indexOf(hash) < 0) break;
      tent++;
    }
    st.memoria.global.unshift(hash);
    if (st.memoria.global.length > 200) st.memoria.global.pop();
    conta.memoria_templates = conta.memoria_templates || [];
    conta.memoria_templates.unshift(hash);
    if (conta.memoria_templates.length > 30) conta.memoria_templates.pop();

    var eng = Math.round((conta.alcance || 30) * (1 + fato.gravidade * 0.15) * (0.8 + _seeded() * 0.6) * 40);
    return {
      id: "POST_" + hash.slice(0, 8),
      conta_id: conta.id,
      autor: conta.nome,
      handle: conta.handle,
      tipo: conta.tipo === "veiculo" ? "midia" : (conta.tipo === "influenciador_nucleo" ? "influencer" : (conta.tipo === "eleitor_arquetipo" ? "popular" : "politico")),
      tribo: tribo,
      texto: texto,
      fato_id: fato.id,
      semente: st.semente,
      template_hash: hash,
      likes: eng,
      rts: Math.round(eng * 0.25),
      citouJogador: /jogador|ator/i.test(JSON.stringify(fato.atores)) || true,
      sentimento: fato.valencia >= 10 ? "apoio" : (fato.valencia <= -10 ? "ataque" : "neutro"),
      podeProcessar: fato.valencia < -15 && conta.tipo !== "veiculo",
      turno: _agora().turno,
      selo: conta.tipo === "veiculo" || conta.credibilidade > 70 ? "✔️" : "",
      tagTipo: (IMPF.TRIBOS_FEED[tribo] || {}).nome || conta.tipo,
      alcance: (conta.seguidores || 1000) + " seguidores",
      tempo: "Há " + (1 + Math.floor(_seeded() * 50)) + " min",
      foto: ""
    };
  };

  IMPF.processarFatoFeed = function (fatos, st) {
    var orcamento = 60;
    var posts = [];
    var contas = st.contas.slice().sort(function (a, b) {
      return (b.volume_dia || 1) - (a.volume_dia || 1);
    });
    // amostrar
    var amostra = [];
    for (var i = 0; i < contas.length && amostra.length < Math.min(orcamento, contas.length); i++) {
      if (_seeded() < (contas[i].volume_dia || 1) / 6) amostra.push(contas[i]);
    }
    if (!amostra.length) amostra = contas.slice(0, 12);

    amostra.forEach(function (conta) {
      if (posts.length >= orcamento) return;
      var melhor = null;
      var melhorScore = -1;
      fatos.forEach(function (f) {
        var sc = f.gravidade * 10 + f.novidade * 0.2;
        (conta.gatilhos || []).forEach(function (g) {
          if (g.pauta && f.pauta && f.pauta.indexOf(g.pauta) >= 0) sc += (g.peso || 1) * 8;
          if (g.fato_tipo && g.fato_tipo === f.tipo) sc += (g.peso || 1) * 10;
        });
        if (sc > melhorScore) { melhorScore = sc; melhor = f; }
      });
      if (!melhor) return;
      var post = IMPF.montarPost(conta, melhor, st);
      posts.push(post);
      st.posts.unshift(post);
      // viral
      if (post.likes > 8000) {
        IMPF.emitirFato({
          tipo: "rede_viral",
          categoria: "rede",
          gravidade: 2,
          valencia: melhor.valencia * 0.3,
          pauta: ["tecnologia_redes", "rede"].concat(melhor.pauta || []),
          origem: "rede",
          dados: { post_id: post.id, conta: conta.id }
        });
        var tag = "#" + String((melhor.dados && melhor.dados.projeto) || melhor.tipo).replace(/\s+/g, "").slice(0, 16);
        var tr = st.trending.find(function (t) { return t.tag === tag; });
        if (tr) tr.score += post.likes;
        else st.trending.unshift({ tag: tag, score: post.likes, fato_id: melhor.id, idade: 0 });
      }
    });
    if (st.posts.length > 200) st.posts.length = 200;
    st.trending.sort(function (a, b) { return b.score - a.score; });
    if (st.trending.length > 10) st.trending.length = 10;

    // taxa de repeticao
    var recentes = st.posts.slice(0, 80);
    var seen = {};
    var reps = 0;
    recentes.forEach(function (p) {
      if (seen[p.texto]) reps++;
      else seen[p.texto] = 1;
    });
    st.inspetor.taxa_repeticao = recentes.length ? Math.round((reps / recentes.length) * 1000) / 10 : 0;
    return posts;
  };

  /* ---------- Tick diario / mensal ---------- */
  IMPF.decair = function (st) {
    Object.keys(st.saturacao).forEach(function (k) {
      st.saturacao[k] = Math.max(0, (st.saturacao[k] || 0) * 0.92);
    });
    Object.keys(st.agenda_publica).forEach(function (k) {
      st.agenda_publica[k] = Math.max(0, (st.agenda_publica[k] || 0) * 0.95);
    });
    st.historias.forEach(function (h) {
      if (h.estado === "Desfecho") return;
      h.energia = _clamp(h.energia - (4 + _seeded() * 6), 0, 100);
      if (h.energia < 15) {
        h.estado = "Desfecho";
        h.desfecho = "esquecido";
      } else if (h.energia >= 70 && h.estado === "Repercussão") {
        h.estado = "Resposta";
      } else if (h.estado === "Resposta" && h.energia > 40) {
        h.estado = "Investigação";
      } else if (h.estado === "Investigação" && h.energia < 35) {
        h.estado = "Desfecho";
        h.desfecho = _seeded() > 0.5 ? "confirmado" : "desmentido";
      }
    });
    st.trending.forEach(function (t) { t.idade = (t.idade || 0) + 1; t.score *= 0.85; });
    st.trending = st.trending.filter(function (t) { return t.idade < 8 && t.score > 100; });
  };

  IMPF.garantirFatosDoMundo = function (st) {
    // Se nao houver fatos novos no turno, cria a partir de estado do jogo
    var ag = _agora();
    var recentes = st.fatos.filter(function (f) { return f.turno === ag.turno; });
    if (recentes.length >= 2) return;
    try {
      var j = J();
      IMPF.emitirFato({
        tipo: "pesquisa_instituto",
        categoria: "eleicao",
        gravidade: 2,
        valencia: (j.popularidade || 50) - 50,
        pauta: ["pesquisa_eleitoral"],
        dados: { percentual: Math.round(j.popularidade || 50) }
      });
      if ((j.escandalo || 0) > 40) {
        IMPF.emitirFato({
          tipo: "escandalo_surge",
          categoria: "escandalo",
          gravidade: 3,
          valencia: -20,
          pauta: ["corrupcao"],
          origem: "investigado",
          dados: {}
        });
      }
      // PL em pauta
      var m = typeof M === "function" ? M() : null;
      if (m && m.leg && m.leg.pauta) {
        var ult = m.leg.pauta.find(function (x) { return x.voto; }) || m.leg.pauta[0];
        if (ult) {
          IMPF.emitirFato({
            tipo: ult.res && ult.res.ok ? "votacao_aprovada" : (ult.voto ? "votacao_rejeitada" : "pl_plenario_pauta"),
            categoria: "legislativo",
            gravidade: 3,
            valencia: ult.res && ult.res.ok ? 8 : -4,
            pauta: ["legislativo"],
            dados: { projeto: ult.nome || "projeto", votos_a_favor: 280, votos_contra: 200 }
          });
        }
      }
    } catch (e) {}
  };

  IMPF.sincronizarContasInfluenciadores = function (st) {
    try {
      if (!gameState || !gameState.influencia || !Array.isArray(gameState.influencia.figuras)) return;
      var midia = gameState.influencia.figuras.filter(function (f) {
        if (window.INF && typeof INF.ehMidia === "function") return INF.ehMidia(f);
        return f && String(f.id || "").indexOf("FIG_") === 0;
      });
      midia.forEach(function (f) {
        var id = "CTA_INF_" + f.id;
        if (st.contas.some(function (c) { return c.id === id; })) return;
        var triboMap = {
          esquerda_militante: "esquerda_radical",
          direita: "direita_conservadora",
          liberais: "direita_liberal",
          progressista: "esquerda_moderada",
          entretenimento: "entretenimento_apolitico",
          institucional: "centro"
        };
        st.contas.push({
          id: id,
          tipo: "influenciador_nucleo",
          nome: f.pele_nome || f.nome,
          handle: "@" + String(f.nome || "influ").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16),
          tribo: triboMap[f.tribo] || "centro",
          tom_base: "firme",
          alcance: f.alcance || 60,
          seguidores: Math.round((f.alcance || 50) * 100000),
          credibilidade: f.credibilidade || 55,
          agressividade: f.polarizacao || 40,
          polarizacao: f.polarizacao || 40,
          volume_dia: 3,
          formatos: ["texto", "thread", "video"],
          gatilhos: [{ pauta: "rede", peso: 2 }, { pauta: "eleicao_calendario", peso: 2 }],
          rivais: [],
          aliados: [],
          plataforma_principal: "microblog",
          memoria_templates: [],
          figura_id: f.id
        });
      });
    } catch (e) {}
  };

  IMPF.tick = function () {
    var st = IMPF.estado();
    if (!st) return;
    try {
      IMPF.sincronizarContasInfluenciadores(st);
      IMPF.garantirFatosDoMundo(st);
      var fila = st.fatos.filter(function (f) { return !f.processado && !f.oculto_ate; });
      fila.sort(function (a, b) {
        var pa = a.gravidade * a.novidade * (a.escopo === "nacional" ? 1.2 : 1);
        var pb = b.gravidade * b.novidade * (b.escopo === "nacional" ? 1.2 : 1);
        return pb - pa;
      });
      var processar = fila.slice(0, 25);
      processar.forEach(function (fato) {
        IMPF.processarFatoImprensa(fato, st);
        fato.processado = true;
        fato.novidade = Math.max(10, fato.novidade * 0.7);
      });
      IMPF.processarFatoFeed(processar.length ? processar : st.fatos.slice(0, 5), st);
      IMPF.decair(st);
      // clipping
      st.clipping = (st.publicacoes || []).slice(0, 8).map(function (p) {
        return { titulo: p.titulo, veiculo: p.veiculo_id, tom: p.tom, fato_id: p.fato_id };
      });
    } catch (e) {
      console.warn("IMPF.tick", e);
    }
  };

  window.processarCicloImprensaFeed = IMPF.tick;

  /* ---------- Acoes do jogador ---------- */
  IMPF.notaOficial = function () {
    var st = IMPF.estado();
    if (!st) return;
    var fato = st.fatos[0];
    if (!fato) { _toast("Sem fato recente para notar.", "warn"); return; }
    fato.valencia = _clamp(fato.valencia + 10, -100, 100);
    IMPF.emitirFato({
      tipo: "rede_checagem",
      categoria: "rede",
      gravidade: 2,
      valencia: 5,
      pauta: fato.pauta,
      origem: "oficial",
      dados: { resposta: "nota_oficial", fato_ref: fato.id }
    });
    _toast("Nota oficial publicada: versão do Palácio fixada (−10% dano).", "ok");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.alinharCampanha = function (campId) {
    var st = IMPF.estado();
    var c = st.campanhas.find(function (x) { return x.id === campId; });
    if (!c) return;
    var v = st.veiculos[c.veiculo_id];
    if (v) {
      v.relacao_jogador.afinidade = _clamp(v.relacao_jogador.afinidade + 12, 0, 100);
      v.relacao_jogador.favor = _clamp(v.relacao_jogador.favor + 1, 0, 10);
    }
    _toast("Você se alinhou à campanha editorial de " + IMPF.nomeVeiculo(v) + " sobre " + c.pauta + ".", "ok");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.contrariarCampanha = function (campId) {
    var st = IMPF.estado();
    var c = st.campanhas.find(function (x) { return x.id === campId; });
    if (!c) return;
    var v = st.veiculos[c.veiculo_id];
    if (v) v.relacao_jogador.afinidade = _clamp(v.relacao_jogador.afinidade - 15, 0, 100);
    c.intensidade = Math.min(3, (c.intensidade || 1) + 1);
    _toast("Fricção com " + IMPF.nomeVeiculo(v) + ": campanha editorial intensifica.", "warn");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.silencioEstrategico = function () {
    var st = IMPF.estado();
    var ativas = st.historias.filter(function (h) { return h.estado !== "Desfecho"; });
    ativas.forEach(function (h) {
      if (h.energia < 40) h.energia = Math.max(0, h.energia - 12);
      else h.energia = _clamp(h.energia + 5, 0, 100);
    });
    _toast(ativas.some(function (h) { return h.energia >= 40; })
      ? "Silêncio com arco quente: a narrativa cresce contra você."
      : "Silêncio estratégico: arcos frios esfriam mais.", ativas.some(function (h) { return h.energia >= 40; }) ? "warn" : "ok");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.jogadorPosta = function (tom, temaTipo) {
    var st = IMPF.estado();
    var j = typeof J === "function" ? J() : null;
    if (!j) return;
    if (typeof gastarEnergia === "function" && !gastarEnergia(4)) return;
    tom = tom || "conciliador";
    var fato = st.fatos.find(function (f) { return !temaTipo || f.tipo === temaTipo; }) || st.fatos[0];
    if (!fato) {
      fato = IMPF.emitirFato({ tipo: "gafe_publica", categoria: "pessoal", gravidade: 1, valencia: 0, pauta: ["rede"] });
    }
    var conta = {
      id: "CTA_JOGADOR",
      tipo: "conta_jogador",
      nome: j.nome,
      handle: "@" + String(j.nome || "eu").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14),
      tribo: "centro",
      tom_base: tom,
      alcance: 55,
      seguidores: 50000,
      credibilidade: 50,
      volume_dia: 1,
      memoria_templates: []
    };
    var qualidade = (st.equipe.qualidade / 100) * (0.7 + _seeded() * 0.4);
    var gafe = tom === "desafiador" && st.equipe.qualidade < 55 && _seeded() < 0.25;
    var post = IMPF.montarPost(conta, fato, st);
    post.tipo = "politico";
    post.tagTipo = "Conta oficial";
    post.selo = "✔️";
    if (gafe) {
      post.texto = "… (post apagado, mas o print circula)";
      post.sentimento = "ataque";
      IMPF.emitirFato({
        tipo: "rede_post_apagado",
        categoria: "rede",
        gravidade: 3,
        valencia: -15,
        pauta: ["tecnologia_redes"],
        origem: "rede",
        dados: { tom: tom }
      });
      _toast("Gafe: post apagado virou print.", "err");
      try { if (typeof addEscandalo === "function") addEscandalo(3); } catch (e) {}
    } else {
      post.likes = Math.round(post.likes * (1 + qualidade));
      st.posts.unshift(post);
      _toast("Post (" + tom + ") publicado no CadeiraFeed. Engajamento ~" + post.likes + ".", "ok");
      try { if (typeof mudarAprovTodos === "function") mudarAprovTodos(tom === "desafiador" ? 0.6 : 0.3); } catch (e) {}
    }
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.forcarFato = function (tipo) {
    var f = IMPF.emitirFato({
      tipo: tipo || "inflacao_sobe",
      categoria: tipo && tipo.indexOf("pl_") === 0 ? "legislativo" : "economia",
      gravidade: 4,
      valencia: -15,
      pauta: tipo === "inflacao_sobe" ? ["inflacao_custo_vida"] : ["legislativo"],
      dados: { projeto: "PL Teste", votos_a_favor: 290, votos_contra: 170, percentual: 42 }
    });
    IMPF.tick();
    _toast("Inspetor: fato forçado " + (f && f.tipo), "ok");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  IMPF.toggleNomesReais = function () {
    var st = IMPF.estado();
    st.usar_nomes_reais = !st.usar_nomes_reais;
    _toast("Nomes reais de veículos: " + (st.usar_nomes_reais ? "ligados (uso privado)" : "desligados / pele paródica"), "ok");
    try { if (typeof render === "function") render(); } catch (e) {}
  };

  /* ---------- UI ---------- */
  IMPF.renderCapaDoDia = function () {
    var st = IMPF.estado();
    if (!st) return "";
    var vids = ["V1", "V2", "V3", "V4"];
    var html = '<div class="card" data-impf-capa="1" style="margin:0 0 12px;padding:12px;border:1px solid var(--linha,#333)">';
    html += "<div class=\"row\" style=\"margin-bottom:8px\"><b class=\"grow\">Como cada jornal contou</b>";
    html += '<button type="button" class="b mini branco" data-a="impfToggleNomes">Pele: ' + (st.usar_nomes_reais ? "real" : "paródica") + "</button>";
    html += '<button type="button" class="b mini branco" data-a="impfInspetor">Inspetor</button></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">';
    vids.forEach(function (vid) {
      var v = st.veiculos[vid];
      var pubs = st.publicacoes.filter(function (p) { return p.veiculo_id === vid; }).slice(0, 2);
      html += '<div style="border:1px solid var(--linha,#444);border-radius:10px;padding:10px;background:rgba(0,0,0,.2)">';
      html += "<div style=\"font-size:11px;opacity:.75;margin-bottom:4px\">" + _esc(IMPF.nomeVeiculo(v)) + " · " + _esc(v.arquetipo) + "</div>";
      if (!pubs.length) html += "<p class=\"txt\" style=\"opacity:.7\">Sem capa gerada neste ciclo — avance o mês ou force um fato.</p>";
      else pubs.forEach(function (p) {
        html += "<div style=\"margin-bottom:8px\"><b style=\"font-size:13px;line-height:1.3;display:block\">" + _esc(p.titulo) + "</b>";
        html += "<small style=\"opacity:.75\">" + _esc(p.frame) + " · " + _esc(p.tom) + " · impacto " + Math.round(p.impacto || 0) + "</small></div>";
      });
      html += "</div>";
    });
    html += "</div></div>";
    return html;
  };

  IMPF.renderArcos = function () {
    var st = IMPF.estado();
    var ativas = (st.historias || []).filter(function (h) { return h.estado !== "Desfecho"; }).slice(0, 5);
    if (!ativas.length) return "";
    var html = '<div class="card" data-impf-arcos="1" style="margin:0 0 12px;padding:12px"><b>Em desenvolvimento</b> — arcos de notícia';
    ativas.forEach(function (h) {
      html += '<div style="margin-top:8px;padding:8px;border:1px solid var(--linha,#333);border-radius:8px">';
      html += "<div class=\"row\"><span class=\"grow\">" + _esc(h.tema.replace(/_/g, " ")) + " · <b>" + _esc(h.estado) + "</b></span><b>" + Math.round(h.energia) + "</b></div>";
      html += '<div style="height:6px;background:#222;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.round(h.energia) + "%;background:" + (h.energia > 70 ? "#ef4444" : "#3b82f6") + '"></div></div>';
      html += '<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">';
      html += '<button type="button" class="b mini branco" data-a="impfNota">Nota oficial</button>';
      html += '<button type="button" class="b mini branco" data-a="impfSilencio">Silêncio estratégico</button>';
      html += "</div></div>";
    });
    html += "</div>";
    return html;
  };

  IMPF.renderCampanhas = function () {
    var st = IMPF.estado();
    var camps = (st.campanhas || []).filter(function (c) { return !c.resultado; }).slice(0, 6);
    if (!camps.length) return "";
    var html = '<div class="card" data-impf-camp="1" style="margin:0 0 12px;padding:12px"><b>Campanhas editoriais</b>';
    camps.forEach(function (c) {
      var v = st.veiculos[c.veiculo_id];
      html += '<div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">';
      html += "<span class=\"grow\">" + _esc(IMPF.nomeVeiculo(v)) + " — " + _esc(c.pauta.replace(/_/g, " ")) + " (" + _esc(c.posicao) + ") · int. " + c.intensidade + "</span>";
      html += '<button type="button" class="b mini confirma" data-a="impfAlinharCamp" data-p=\'' + JSON.stringify([c.id]) + "'>Alinhar</button>";
      html += '<button type="button" class="b mini corrige" data-a="impfContrariarCamp" data-p=\'' + JSON.stringify([c.id]) + "'>Contrariar</button>";
      html += "</div>";
    });
    html += "</div>";
    return html;
  };

  IMPF.renderAgenda = function () {
    var st = IMPF.estado();
    var keys = Object.keys(st.agenda_publica || {}).sort(function (a, b) {
      return (st.agenda_publica[b] || 0) - (st.agenda_publica[a] || 0);
    }).slice(0, 6);
    if (!keys.length) return "";
    var html = '<div class="card" style="margin:0 0 12px;padding:12px"><b>Agenda pública</b><div class="grid2" style="margin-top:8px">';
    keys.forEach(function (k) {
      html += "<div class=\"row\"><span class=\"grow\">" + _esc(k.replace(/_/g, " ")) + "</span><b>" + Math.round(st.agenda_publica[k]) + "</b></div>";
    });
    html += "</div></div>";
    return html;
  };

  IMPF.renderInspetor = function () {
    var st = IMPF.estado();
    if (!S.impfInspetor) return "";
    var html = '<div class="card" style="margin:0 0 12px;padding:12px;border:1px dashed #f59e0b" data-impf-inspetor="1">';
    html += "<b>Inspetor de conteúdo</b> <small>semente " + st.semente + " · repetição " + st.inspetor.taxa_repeticao + "%</small>";
    html += '<div class="row" style="margin:8px 0;gap:6px;flex-wrap:wrap">';
    html += '<button type="button" class="b mini confirma" data-a="impfForcarFato" data-p=\'["inflacao_sobe"]\'>Forçar inflação</button>';
    html += '<button type="button" class="b mini confirma" data-a="impfForcarFato" data-p=\'["votacao_aprovada"]\'>Forçar votação</button>';
    html += '<button type="button" class="b mini confirma" data-a="impfForcarFato" data-p=\'["escandalo_vazado"]\'>Forçar escândalo</button>';
    html += '<button type="button" class="b mini branco" data-a="impfTick">Rodar tick agora</button>';
    html += "</div>";
    html += "<p class=\"txt\">Últimos fatos:</p><ul style=\"margin:0;padding-left:18px;font-size:12px\">";
    (st.inspetor.ultimo || []).slice(0, 10).forEach(function (f) {
      html += "<li>" + _esc(f.id) + " · " + _esc(f.tipo) + " · grav " + f.gravidade + "</li>";
    });
    html += "</ul>";
    var fato = st.fatos[0];
    if (fato && fato._diag) {
      html += "<p class=\"txt\">Diagnóstico do fato " + _esc(fato.id) + ":</p>";
      fato._diag.slice(0, 6).forEach(function (d) {
        html += "<div style=\"font-size:11px\">" + _esc(d.veiculo) + ": interesse " + d.interesse + "/" + d.limiar
          + (d.publicou ? (" → " + d.genero + "/" + d.frame + "/" + d.tom) : " (não publicou)") + "</div>";
      });
    }
    html += "</div>";
    return html;
  };

  IMPF.renderTermometro = function () {
    var st = IMPF.estado();
    var porTribo = {};
    (st.posts || []).slice(0, 40).forEach(function (p) {
      porTribo[p.tribo] = porTribo[p.tribo] || { n: 0, s: 0 };
      porTribo[p.tribo].n++;
      porTribo[p.tribo].s += p.sentimento === "apoio" ? 1 : (p.sentimento === "ataque" ? -1 : 0);
    });
    var keys = Object.keys(porTribo);
    if (!keys.length) return "";
    var html = '<div style="margin:10px 0;padding:10px;border-radius:10px;border:1px solid #38444d;background:#15202b;color:#fff" data-impf-termo="1">';
    html += "<b>Termômetro digital</b> <small style=\"opacity:.8\">(bolha ≠ rua)</small><div style=\"display:flex;flex-wrap:wrap;gap:8px;margin-top:8px\">";
    keys.forEach(function (t) {
      var avg = porTribo[t].s / porTribo[t].n;
      var cor = avg > 0.2 ? "#22c55e" : (avg < -0.2 ? "#ef4444" : "#94a3b8");
      html += "<span style=\"background:rgba(255,255,255,.08);padding:4px 8px;border-radius:8px;font-size:11px;border-left:3px solid " + cor + "\">"
        + _esc((IMPF.TRIBOS_FEED[t] || {}).nome || t) + ": " + (avg > 0 ? "+" : "") + avg.toFixed(1) + "</span>";
    });
    html += "</div></div>";
    return html;
  };

  IMPF.postsParaUI = function () {
    var st = IMPF.estado();
    if (!st || !st.posts.length) return null;
    return st.posts.slice(0, 30).map(function (p) {
      return {
        id: p.id,
        autor: p.autor,
        handle: p.handle,
        foto: p.foto || "",
        tipo: p.tipo,
        selo: p.selo || "",
        tagTipo: p.tagTipo,
        alcance: p.alcance,
        tempo: p.tempo,
        texto: p.texto,
        likes: p.likes,
        rts: p.rts,
        citouJogador: p.citouJogador,
        sentimento: p.sentimento,
        podeProcessar: !!p.podeProcessar
      };
    });
  };

  /* ---------- Patches / hooks ---------- */
  function wrapManchete() {
    if (typeof manchete !== "function" || manchete._impfWrapped) return;
    var _orig = manchete;
    window.manchete = function (txt, tipo) {
      var r = _orig.apply(this, arguments);
      try {
        if (!manchete._impfSkipInfer) {
          var inf = IMPF.inferirTipoDeManchete(txt, tipo);
          IMPF.emitirFato(Object.assign({ dados: { texto_legado: String(txt).slice(0, 120) } }, inf));
        }
      } catch (e) {}
      return r;
    };
    manchete._impfWrapped = true;
    manchete._impfSkipInfer = false;
  }

  var FRAME_PT = {
    escandalo: "Escândalo",
    incompetencia: "Incompetência",
    conquista: "Conquista",
    conflito: "Conflito",
    economia_no_bolso: "Bolso",
    legalidade: "Legalidade",
    humano: "Humano",
    moral: "Moral",
    geopolitico: "Geopolítico",
    tecnico: "Técnico"
  };

  IMPF._framePt = function (f) {
    return FRAME_PT[f] || f || "—";
  };

  /** Matérias só do barramento — UI de portal reaproveitada, motor legado desligado. */
  IMPF.noticiasParaPortal = function (portalId) {
    var st = IMPF.estado();
    if (!st) return [];
    var map = { g1: "V4", cnn: "V3", estadao: "V1", folha: "V2" };
    var vid = map[portalId];
    if (!vid) return [];
    var pubs = st.publicacoes.filter(function (p) { return p.veiculo_id === vid; });
    if (!pubs.length) {
      try {
        if ((!st.publicacoes || !st.publicacoes.length) && typeof IMPF.tick === "function") IMPF.tick();
      } catch (e) {}
      pubs = st.publicacoes.filter(function (p) { return p.veiculo_id === vid; });
    }
    return pubs.slice(0, 8).map(function (p) {
      var framePt = IMPF._framePt(p.frame);
      return {
        portal: portalId,
        cat: framePt.toUpperCase(),
        hora: "Fato · ciclo " + (p.turno || 0),
        tit: p.titulo,
        lead: p.linha_fina || ("Enquadramento: " + framePt + " · tom " + (p.tom || "neutro")),
        corpo: (p.linha_fina ? "" : "") + "Este texto nasceu do barramento de fatos (id " + (p.fato_id || "?")
          + "). Frame " + framePt + ", tom " + (p.tom || "neutro")
          + ", template " + (p.template_id || "—") + ". Não é lista fixa de manchetes.",
        _impf: true,
        frame: p.frame,
        tom: p.tom,
        veiculo_id: p.veiculo_id
      };
    });
  };

  function wrapGerarFeed() {
    if (typeof gerarFeedDeNoticias !== "function") return;
    // Re-wrap sempre que o legado voltar a sobrescrever
    if (gerarFeedDeNoticias._impfMotor === true && gerarFeedDeNoticias._impfVersao === 2) return;
    var _orig = gerarFeedDeNoticias._impfOrig || gerarFeedDeNoticias;
    window.gerarFeedDeNoticias = function () {
      try {
        var st = IMPF.estado();
        if (st && st.publicacoes && st.publicacoes.length) {
          var soBarramento = [];
          ["g1", "cnn", "estadao", "folha"].forEach(function (p) {
            soBarramento = soBarramento.concat(IMPF.noticiasParaPortal(p));
          });
          if (soBarramento.length) return soBarramento;
        }
      } catch (e) {}
      // Fallback legado só se o barramento ainda estiver vazio
      return _orig.apply(this, arguments) || [];
    };
    gerarFeedDeNoticias._impf = true;
    gerarFeedDeNoticias._impfMotor = true;
    gerarFeedDeNoticias._impfVersao = 2;
    gerarFeedDeNoticias._impfOrig = _orig;
  }

  function wrapGerarPosts() {
    if (typeof gerarPostsSociaisDinamicos !== "function") return;
    if (gerarPostsSociaisDinamicos._impfMotor === true && gerarPostsSociaisDinamicos._impfVersao === 2) return;
    var _orig = gerarPostsSociaisDinamicos._impfOrig || gerarPostsSociaisDinamicos;
    window.gerarPostsSociaisDinamicos = function () {
      try {
        var st = IMPF.estado();
        if (st && (!st.posts || !st.posts.length) && typeof IMPF.tick === "function") {
          try { IMPF.tick(); } catch (e2) {}
        }
        var fromBus = IMPF.postsParaUI();
        if (fromBus && fromBus.length) return fromBus;
      } catch (e) {}
      return _orig.apply(this, arguments);
    };
    gerarPostsSociaisDinamicos._impf = true;
    gerarPostsSociaisDinamicos._impfMotor = true;
    gerarPostsSociaisDinamicos._impfVersao = 2;
    gerarPostsSociaisDinamicos._impfOrig = _orig;
  }

  IMPF.renderPortalBarramento = function (pId) {
    var st = IMPF.estado();
    var map = { g1: "V4", cnn: "V3", estadao: "V1", folha: "V2" };
    var vid = map[pId];
    var v = vid && st.veiculos[vid];
    var nome = v ? IMPF.nomeVeiculo(v) : pId;
    var arq = v ? v.arquetipo : "";
    var feed = IMPF.noticiasParaPortal(pId);
    var cor = (typeof PORTAIS_INFO !== "undefined" && PORTAIS_INFO[pId] && PORTAIS_INFO[pId].cor) || "#1d4ed8";
    var html = "";
    html += '<div data-impf-portal="1" style="background:' + cor + ';color:#fff;padding:12px 16px;border-radius:10px;margin-bottom:14px">';
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center\"><div>";
    html += "<span style=\"font-size:1.25rem;font-weight:900\">" + _esc(nome) + "</span>";
    html += "<small style=\"display:block;opacity:.9;margin-top:2px\">Arquétipo " + _esc(arq) + " · motor IMPF (fatos → capa)</small>";
    html += "</div><span style=\"font-size:.75rem;background:rgba(0,0,0,.25);padding:4px 8px;border-radius:6px\">barramento</span></div></div>";
    if (!feed.length) {
      html += "<p class=\"txt\">Sem publicação deste veículo neste ciclo. Avance o mês ou use o Inspetor para forçar um fato.</p>";
      return html;
    }
    feed.forEach(function (art) {
      html += '<article data-impf-art="1" style="background:rgba(255,255,255,0.04);border:1px solid var(--linha);border-radius:10px;padding:14px;margin-bottom:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;margin-bottom:6px">';
      html += "<span style=\"color:" + cor + ";font-weight:800;letter-spacing:.4px\">" + _esc(art.cat) + "</span>";
      html += "<span style=\"opacity:.7\">" + _esc(art.hora) + "</span></div>";
      html += "<h3 style=\"margin:0 0 8px;font-size:1.12rem;line-height:1.3\">" + _esc(art.tit) + "</h3>";
      html += "<p style=\"font-size:.9rem;margin:0 0 8px;opacity:.95\"><b>" + _esc(art.lead) + "</b></p>";
      html += "<p style=\"font-size:.85rem;margin:0;opacity:.8\">" + _esc(art.corpo) + "</p></article>";
    });
    return html;
  };

  function wrapRenderHub() {
    if (typeof renderHubNoticias !== "function") return;
    if (renderHubNoticias._impfMotor === true && renderHubNoticias._impfVersao === 2) return;
    var _orig = renderHubNoticias._impfOrig || renderHubNoticias;
    window.renderHubNoticias = function () {
      IMPF.estado();
      var pId = (typeof S !== "undefined" && S.portalAtivo) || "g1";
      var bloco = IMPF.renderInspetor() + IMPF.renderCapaDoDia() + IMPF.renderArcos() + IMPF.renderCampanhas() + IMPF.renderAgenda();

      // Nav compartilhada (reaproveita UI)
      var nav = function (ativo) {
        var b = function (id, label, extra) {
          var on = ativo === id;
          return '<button type="button" class="btn ' + (on ? "confirma" : "branco") + ' mini" data-a="trocarPortalNoticias" data-p=\'' + JSON.stringify([id]) + "' " + (extra || "") + ">" + label + "</button>";
        };
        return '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:14px;border-bottom:1px solid var(--linha)" data-impf-nav="1">'
          + b("g1", "🔴 Portal TV aberta")
          + b("cnn", "📺 Cabo 24h")
          + b("estadao", "🏛️ Jornal liberal")
          + b("folha", "📰 Centro-progressista")
          + b("redes", "💬 CadeiraFeed", 'style="background:#1d9bf0;color:#fff;border-color:#1d9bf0"')
          + b("veiculos", "💼 Relações & Dossiês")
          + "</div>";
      };

      try {
        if (pId === "redes") {
          var hRedes = _orig.apply(this, arguments);
          var termo = IMPF.renderTermometro();
          var st = IMPF.estado();
          var trendExtra = "";
          if (st.trending && st.trending.length) {
            trendExtra = '<div style="margin:8px 0;font-size:12px" data-impf-trend="1"><b>Trending (fatos)</b>: '
              + st.trending.slice(0, 6).map(function (t) { return _esc(t.tag) + " (" + Math.round(t.score) + ")"; }).join(" · ")
              + "</div>";
          }
          var compor = '<div class="row" style="margin:8px 0;gap:6px;flex-wrap:wrap" data-impf-compor="1">'
            + '<button type="button" class="b mini azul" data-a="impfPostar" data-p=\'["conciliador"]\'>Postar · conciliador</button>'
            + '<button type="button" class="b mini branco" data-a="impfPostar" data-p=\'["firme"]\'>Postar · firme</button>'
            + '<button type="button" class="b mini corrige" data-a="impfPostar" data-p=\'["desafiador"]\'>Postar · desafiador</button>'
            + '<button type="button" class="b mini branco" data-a="impfPostar" data-p=\'["tecnico"]\'>Postar · técnico</button>'
            + '<button type="button" class="b mini branco" data-a="impfVerBolha">Ver outra bolha</button>'
            + "</div>";
          var banner = '<div data-impf-feed-banner="1" style="margin:0 0 10px;padding:10px;border-radius:10px;background:#15202b;color:#fff;border:1px solid #38444d">'
            + "<b>CadeiraFeed</b> · posts gerados a partir do barramento de fatos (não é lista fixa)."
            + "</div>";
          if (hRedes.indexOf("data-impf-termo") < 0) hRedes = banner + termo + trendExtra + compor + hRedes;
          return hRedes;
        }

        if (pId === "veiculos") {
          var hV = _orig.apply(this, arguments);
          if (hV.indexOf("data-impf-capa") < 0) hV = (typeof card === "function" ? card("Central de Imprensa e Inteligência", nav(pId) + bloco) : nav(pId) + bloco) + hV;
          else if (hV.indexOf("data-impf-capa") < 0) hV = bloco + hV;
          return hV;
        }

        // Portais: UI nova do barramento (capa + matérias IMPF). Legado não aparece.
        var corpo = bloco + IMPF.renderPortalBarramento(pId);
        if (typeof card === "function") return card("Central de Imprensa — barramento de fatos", nav(pId) + corpo);
        return nav(pId) + corpo;
      } catch (e) {
        console.warn("IMPF hub v2", e);
        return _orig.apply(this, arguments);
      }
    };
    renderHubNoticias._impf = true;
    renderHubNoticias._impfMotor = true;
    renderHubNoticias._impfVersao = 2;
    renderHubNoticias._impfOrig = _orig;
  }

  function wrapAvancarMes() {
    if (typeof avancarMes !== "function" || avancarMes._impf) return;
    var _orig = avancarMes;
    window.avancarMes = function () {
      var r = _orig.apply(this, arguments);
      try { IMPF.tick(); } catch (e) { console.warn(e); }
      return r;
    };
    avancarMes._impf = true;
  }

  function wrapTrendingLista() {
    try {
      if (typeof TRENDING_TOPICS_LISTA !== "undefined" && Array.isArray(TRENDING_TOPICS_LISTA)) {
        // nao remove; so enriquecer via render
      }
    } catch (e) {}
  }

  function registrarA() {
    if (typeof A === "undefined") return false;
    A.impfNota = function () { IMPF.notaOficial(); };
    A.impfSilencio = function () { IMPF.silencioEstrategico(); };
    A.impfAlinharCamp = function (id) { IMPF.alinharCampanha(id); };
    A.impfContrariarCamp = function (id) { IMPF.contrariarCampanha(id); };
    A.impfPostar = function (tom) { IMPF.jogadorPosta(tom); };
    A.impfForcarFato = function (tipo) { IMPF.forcarFato(tipo); };
    A.impfTick = function () { IMPF.tick(); _toast("Tick Imprensa/Feed executado.", "ok"); try { render(); } catch (e) {} };
    A.impfToggleNomes = function () { IMPF.toggleNomesReais(); };
    A.impfInspetor = function () {
      S.impfInspetor = !S.impfInspetor;
      try { render(); } catch (e) {}
    };
    A.impfVerBolha = function () {
      S.impfBolhaAlt = !S.impfBolhaAlt;
      _toast(S.impfBolhaAlt ? "Vendo outra bolha (30% da sua)." : "De volta à sua bolha (70/30).", "ok");
      try { render(); } catch (e) {}
    };
    return true;
  }

  function boot() {
    try {
      wrapManchete();
      wrapGerarFeed();
      wrapGerarPosts();
      wrapRenderHub();
      wrapAvancarMes();
      wrapTrendingLista();
      registrarA();
      if (typeof gameState !== "undefined" && gameState) IMPF.estado();
    } catch (e) { console.warn("IMPF boot", e); }
  }

  boot();
  var n = 0;
  var t = setInterval(function () { boot(); if (++n > 50) clearInterval(t); }, 200);
  ["DOMContentLoaded", "load"].forEach(function (ev) {
    document.addEventListener(ev, boot);
  });

  IMPF.resumo = function () {
    var st = IMPF.estado();
    if (!st) return { ok: false };
    return {
      versao: IMPF.versao,
      schema: st.schema,
      fatos: st.fatos.length,
      publicacoes: st.publicacoes.length,
      posts: st.posts.length,
      historias: st.historias.length,
      campanhas: st.campanhas.length,
      repeticao_pct: st.inspetor.taxa_repeticao
    };
  };
  window.impf = IMPF;
  window.impfResumo = IMPF.resumo;
})();
