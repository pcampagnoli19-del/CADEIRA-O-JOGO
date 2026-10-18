/* =============================================================================
   CADEIRA — NUCLEO DE INFLUENCIADORES (jornalistas / influencers / comentaristas)
   Spec: CADEIRA_Nucleo_Influenciadores.md

   MODULO ADITIVO. Troca probabilidade fixa por trajetoria dinamica.
   NAO altera fluxo de categoria Empresario (modulo_empresarios.js).
   Expoe window.INF. Define processarCicloInfluencia (hook mensal ja chamado).
   ============================================================================= */
(function () {
  "use strict";

  var INF = (window.INF = window.INF || {});
  INF.versao = 1;
  INF.VERSAO_FIGURA = 1;

  function _clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _rnd(a, b) { return a + Math.random() * (b - a); }
  function _toast(m, t) { try { if (typeof toast === "function") toast(m, t || "ok"); } catch (e) {} }
  function _manchete(t, k) { try { if (typeof manchete === "function") manchete(t, k || "influencia"); } catch (e) {} }
  function _R() { return (typeof R !== "undefined" && R) ? R : { i: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }, c: _clamp }; }

  /* ---------- Tribos / coalizoes ---------- */
  INF.TRIBOS = {
    esquerda_militante: { id: "esquerda_militante", nome: "Esquerda militante", cor: "#ef4444" },
    direita: { id: "direita", nome: "Direita", cor: "#3b82f6" },
    liberais: { id: "liberais", nome: "Liberais", cor: "#f59e0b" },
    institucional: { id: "institucional", nome: "Institucional / TV", cor: "#64748b" },
    entretenimento: { id: "entretenimento", nome: "Entretenimento", cor: "#a855f7" },
    progressista: { id: "progressista", nome: "Progressista digital", cor: "#10b981" }
  };

  INF.ESTAGIOS = [
    "influencer", "cogitado", "sondado", "pre_candidato", "filiado",
    "candidato", "eleito", "derrotado", "mandato", "aliado", "rival", "ex"
  ];
  INF.ESTAGIO_LABEL = {
    influencer: "Influenciador / figura de mídia",
    cogitado: "Cogitado (pesquisa & boato)",
    sondado: "Sondado (recebeu convite)",
    pre_candidato: "Pré-candidato",
    filiado: "Filiado",
    candidato: "Candidato",
    eleito: "Eleito",
    derrotado: "Derrotado",
    mandato: "Em mandato",
    aliado: "Aliado político",
    rival: "Rival",
    ex: "Ex-político / retorno à mídia"
  };

  INF.PAPEIS = {
    nenhum: "Nenhum papel ativo",
    cabo_eleitoral: "Cabo eleitoral",
    puxador_legenda: "Puxador de legenda",
    rosto_partido: "Rosto / porta-voz do partido",
    secretario: "Secretário / ministro (Kassab)",
    assessor: "Assessor de gabinete",
    adversario: "Adversário outsider",
    mediador: "Mediador de debate",
    denunciante: "Denunciante",
    socio_campanha: "Sócio de campanha"
  };

  /* Arquétipos por ficha (ambicao/aversao por ARQUETIPO, nao palpite biografico) */
  INF.ARQUETIPOS_FIGURA = {
    FIG_HUCK: { arquetipo: "comunicador_popular", tribo: "entretenimento", plataforma: "TV aberta", ambicao: 62, aversao: 55 },
    FIG_REINALDO: { arquetipo: "comentarista_institucional", tribo: "institucional", plataforma: "Rádio / coluna", ambicao: 12, aversao: 85 },
    FIG_BONNER: { arquetipo: "ancora_institucional", tribo: "institucional", plataforma: "TV aberta", ambicao: 5, aversao: 95 },
    FIG_NETO: { arquetipo: "influencer_progressista", tribo: "progressista", plataforma: "YouTube / redes", ambicao: 48, aversao: 40 },
    FIG_MONARK: { arquetipo: "outsider_polarizado", tribo: "liberais", plataforma: "Podcast / X", ambicao: 40, aversao: 35 },
    FIG_KIM_PAIM: { arquetipo: "youtuber_direita", tribo: "direita", plataforma: "YouTube", ambicao: 28, aversao: 50 },
    FIG_IAN_NEVES: { arquetipo: "youtuber_esquerda", tribo: "esquerda_militante", plataforma: "YouTube", ambicao: 35, aversao: 45 },
    FIG_LUIDE: { arquetipo: "streamer_entretenimento", tribo: "entretenimento", plataforma: "Twitch / lives", ambicao: 18, aversao: 60 },
    FIG_CHAVOSO: { arquetipo: "intelectual_militante", tribo: "esquerda_militante", plataforma: "Redes / ensaios", ambicao: 55, aversao: 40 },
    FIG_SADI: { arquetipo: "reporter_politico", tribo: "institucional", plataforma: "TV / portais", ambicao: 10, aversao: 90 },
    FIG_COPPOLA: { arquetipo: "comentarista_direita", tribo: "direita", plataforma: "TV / podcast", ambicao: 50, aversao: 35 },
    FIG_GLENN: { arquetipo: "jornalista_investigativo", tribo: "progressista", plataforma: "Substack / X", ambicao: 22, aversao: 70 },
    FIG_PRIOLI: { arquetipo: "comunicadora_juridica", tribo: "progressista", plataforma: "TV / podcast", ambicao: 45, aversao: 50 },
    FIG_VERA: { arquetipo: "entrevistadora_institucional", tribo: "institucional", plataforma: "TV / rádio", ambicao: 8, aversao: 92 },
    FIG_GENTILI: { arquetipo: "humorista_polarizado", tribo: "direita", plataforma: "TV / YouTube", ambicao: 42, aversao: 48 },
    FIG_JONES: { arquetipo: "intelectual_militante", tribo: "esquerda_militante", plataforma: "YouTube / livros", ambicao: 58, aversao: 38 }
  };

  INF.ehMidia = function (f) {
    if (!f) return false;
    if (f.empresario_id || f.categoria === "Empresario" || f.categoria === "Empresário") return false;
    if (f.id && String(f.id).indexOf("EMP_") === 0) return false;
    if (f.id && String(f.id).indexOf("FIG_") === 0) return true;
    var cats = ["Jornalista", "Apresentador", "Influencer", "Youtuber", "Comentarista", "Intelectual", "Comunicador", "Streamer"];
    return cats.indexOf(f.categoria) >= 0;
  };

  INF.estado = function () {
    if (typeof gameState === "undefined" || !gameState) return null;
    if (!gameState.nucleo_influenciadores) {
      gameState.nucleo_influenciadores = {
        versao: INF.versao,
        usar_nomes_reais: true,
        eventos_negativos_so_gerados: true,
        tribos: {},
        historico: [],
        gerados: 0
      };
      Object.keys(INF.TRIBOS).forEach(function (t) {
        gameState.nucleo_influenciadores.tribos[t] = { apoio: 50 };
      });
    }
    var n = gameState.nucleo_influenciadores;
    if (!n.tribos) n.tribos = {};
    Object.keys(INF.TRIBOS).forEach(function (t) {
      if (!n.tribos[t]) n.tribos[t] = { apoio: 50 };
    });
    return n;
  };

  INF.enriquecerFigura = function (f) {
    if (!f || !INF.ehMidia(f)) return f;
    if (f._inf_v === INF.VERSAO_FIGURA && f.trajetoria) return f;

    var meta = INF.ARQUETIPOS_FIGURA[f.id] || {
      arquetipo: "generico_midia",
      tribo: "institucional",
      plataforma: "Redes",
      ambicao: Math.round(_clamp((f.probabilidade_de_entrar_na_politica || 15), 5, 70)),
      aversao: Math.round(_clamp(100 - (f.probabilidade_de_entrar_na_politica || 15), 20, 95))
    };

    f.arquetipo_midia = f.arquetipo_midia || meta.arquetipo;
    f.tribo = f.tribo || meta.tribo;
    f.plataforma = f.plataforma || meta.plataforma;
    f.ambicao_politica = (typeof f.ambicao_politica === "number") ? f.ambicao_politica : meta.ambicao;
    f.aversao_risco = (typeof f.aversao_risco === "number") ? f.aversao_risco : meta.aversao;
    f.polarizacao = (typeof f.polarizacao === "number") ? f.polarizacao : _clamp(Math.abs((f.posicionamento_ideologico || {}).social || 0) + 30, 10, 95);
    f.pauta_bandeira = f.pauta_bandeira || ((f.temas_de_interesse && f.temas_de_interesse[0]) || "debate_publico");
    f.temperatura = (typeof f.temperatura === "number") ? f.temperatura : 40; // 0 frio … 100 cancelado/aquecido
    f.patrocinadores = f.patrocinadores || [];
    f.pele_nome = f.pele_nome || f.nome; // nome exibido (trocavel)
    f.origem_ficha = f.origem_ficha || (f.id && INF.ARQUETIPOS_FIGURA[f.id] ? "real_pele" : "gerado");

    if (!f.trajetoria) {
      var est = "influencer";
      if (f.candidato_ativo) est = "candidato";
      else if (f.filiado) est = "filiado";
      f.trajetoria = {
        estagio: est,
        papel: "nenhum",
        cargo_alvo: null,
        meses_no_estagio: 0,
        convites: 0,
        cortejos: 0,
        ultimo_evento: null
      };
    }
    f._inf_v = INF.VERSAO_FIGURA;
    // probabilidade fixa vira espelho derivado (compat UI antiga)
    f.probabilidade_de_entrar_na_politica = INF.chanceSubir(f);
    return f;
  };

  INF.chanceSubir = function (f) {
    if (!f || !INF.ehMidia(f)) return 0;
    // Nao chamar enriquecerFigura aqui (evita recursao). Garante campos minimos.
    if (!f.trajetoria) {
      f.trajetoria = { estagio: "influencer", papel: "nenhum", meses_no_estagio: 0, convites: 0, cortejos: 0 };
    }
    if (typeof f.ambicao_politica !== "number") f.ambicao_politica = 20;
    if (typeof f.aversao_risco !== "number") f.aversao_risco = 50;
    if (typeof f.temperatura !== "number") f.temperatura = 40;
    var base = (f.ambicao_politica || 20) * 0.65;
    base -= (f.aversao_risco || 50) * 0.25;
    // audiência grande demais para arriscar (penalidade suave)
    if ((f.alcance || 50) > 90) base -= 6;
    else if ((f.alcance || 50) > 80) base -= 3;
    // temperatura (cancelamento pode empurrar para foro/politica OU afastar)
    if ((f.temperatura || 40) > 70) base += 6;
    if ((f.temperatura || 40) > 85) base -= 4;

    try {
      var j = typeof J === "function" ? J() : null;
      if (j) {
        var pJog = j.partido_atual || j.partido || "";
        var af = (f.afinidades_partidarias && pJog) ? (f.afinidades_partidarias[pJog] || 0) : 0;
        base += af * 0.12;
        base += ((j.popularidade || 50) - 50) * 0.08;
      }
      if (typeof dt === "function") {
        var d = dt();
        var eleitoral = (d.ano % 2 === 0); // simplificado
        if (eleitoral) base += 10;
        if (d.mes === 2 || d.mes === 3) base += 8; // janela partidaria
      }
    } catch (e) {}

    var est = (f.trajetoria && f.trajetoria.estagio) || "influencer";
    if (est === "sondado") base += 8;
    if (est === "cogitado") base += 5;
    if (est === "pre_candidato") base += 12;
    if (f.trajetoria && f.trajetoria.convites > 0) base += f.trajetoria.convites * 4;

    return Math.round(_clamp(base, 2, 88));
  };

  INF.garantirTodas = function () {
    try {
      if (typeof garantirSistemaInfluencia === "function") garantirSistemaInfluencia();
    } catch (e) {}
    if (!gameState || !gameState.influencia || !Array.isArray(gameState.influencia.figuras)) return;
    gameState.influencia.figuras.forEach(INF.enriquecerFigura);
    INF.estado();
  };

  /* ---------- Avanco de trajetoria ---------- */
  INF.avancarEstagio = function (f, motivo) {
    var ordem = ["influencer", "cogitado", "sondado", "pre_candidato", "filiado", "candidato"];
    var est = f.trajetoria.estagio;
    var i = ordem.indexOf(est);
    if (i < 0 || i >= ordem.length - 1) return false;
    f.trajetoria.estagio = ordem[i + 1];
    f.trajetoria.meses_no_estagio = 0;
    f.trajetoria.ultimo_evento = motivo || "avanço";
    if (f.trajetoria.estagio === "filiado") {
      f.filiado = true;
      try {
        var j = J();
        f.partido_atual = f.partido_atual || j.partido_atual || j.partido || "Independente";
      } catch (e) {}
    }
    if (f.trajetoria.estagio === "candidato") {
      f.candidato_ativo = true;
      f.tipo_ator = "POLITICO";
    }
    f.probabilidade_de_entrar_na_politica = INF.chanceSubir(f);
    _manchete(f.pele_nome + " entra na fase «" + INF.ESTAGIO_LABEL[f.trajetoria.estagio] + "» (" + (motivo || "trajetória") + ").", "influencia");
    return true;
  };

  INF.tickFigura = function (f) {
    if (!INF.ehMidia(f)) return;
    INF.enriquecerFigura(f);
    f.trajetoria.meses_no_estagio = (f.trajetoria.meses_no_estagio || 0) + 1;
    // decai temperatura
    f.temperatura = _clamp((f.temperatura || 40) - 1.5, 0, 100);

    var chance = INF.chanceSubir(f) / 100;
    var est = f.trajetoria.estagio;
    if (est === "influencer" && Math.random() < chance * 0.08) {
      f.trajetoria.estagio = "cogitado";
      f.trajetoria.meses_no_estagio = 0;
      f.trajetoria.ultimo_evento = "boato_pesquisa";
      _manchete("Boato: " + f.pele_nome + " aparece cotado(a) em pesquisa qualitative.", "influencia");
    } else if (est === "cogitado" && Math.random() < chance * 0.10) {
      INF.avancarEstagio(f, "momentum");
    } else if (est === "sondado" && f.trajetoria.meses_no_estagio > 2 && Math.random() < chance * 0.12) {
      INF.avancarEstagio(f, "negociação");
    } else if (est === "pre_candidato" && Math.random() < chance * 0.15) {
      INF.avancarEstagio(f, "janela");
    }

    // papel cabo: efeito leve em popularidade do jogador
    if (f.trajetoria.papel === "cabo_eleitoral") {
      try {
        var j = J();
        if (j && typeof j.popularidade === "number") {
          j.popularidade = _clamp(j.popularidade + (f.capacidade_de_mobilizacao || 40) * 0.01, 0, 100);
        }
      } catch (e) {}
      if (f.trajetoria.meses_papel != null) {
        f.trajetoria.meses_papel--;
        if (f.trajetoria.meses_papel <= 0) f.trajetoria.papel = "nenhum";
      }
    }
  };

  /* ---------- Eventos (negativos so em gerados se flag) ---------- */
  INF.podeEventoNegativo = function (f) {
    var st = INF.estado();
    if (!st || !st.eventos_negativos_so_gerados) return true;
    return f.origem_ficha === "gerado" || f.origem_ficha === "parodia";
  };

  INF.eventoAleatorio = function () {
    var st = INF.estado();
    if (!st || !gameState.influencia) return;
    var figs = gameState.influencia.figuras.filter(INF.ehMidia);
    if (!figs.length) return;
    var tipo = _pick(["viral", "treta", "live", "algoritmo", "vaquinha", "cancelamento", "fogo_amigo"]);
    var a = _pick(figs);
    INF.enriquecerFigura(a);

    if (tipo === "viral") {
      a.alcance = _clamp((a.alcance || 50) + _R().i(2, 6), 0, 100);
      a.temperatura = _clamp(a.temperatura + 8, 0, 100);
      _manchete(a.pele_nome + " viraliza com conteúdo sobre " + String(a.pauta_bandeira).replace(/_/g, " ") + ".", "redes");
    } else if (tipo === "treta") {
      var b = _pick(figs.filter(function (x) { return x.id !== a.id && x.tribo !== a.tribo; })) || _pick(figs);
      if (b) {
        INF.enriquecerFigura(b);
        a.temperatura = _clamp(a.temperatura + 12, 0, 100);
        b.temperatura = _clamp(b.temperatura + 12, 0, 100);
        st.tribos[a.tribo].apoio = _clamp(st.tribos[a.tribo].apoio + 2, 0, 100);
        st.tribos[b.tribo].apoio = _clamp(st.tribos[b.tribo].apoio - 1, 0, 100);
        _manchete("Treta: " + a.pele_nome + " × " + b.pele_nome + " — coalizões de tribo se agitam.", "redes");
      }
    } else if (tipo === "live") {
      _manchete("Convite de live: " + a.pele_nome + " abre espaço para entrevista política.", "influencia");
      a.trajetoria.ultimo_evento = "convite_live";
    } else if (tipo === "algoritmo") {
      a.alcance = _clamp((a.alcance || 50) - _R().i(3, 8), 10, 100);
      _manchete("Algoritmo/plataforma muda o alcance de " + a.pele_nome + " (eco big tech).", "economia");
    } else if (tipo === "vaquinha") {
      if (a.trajetoria.estagio === "pre_candidato" || a.trajetoria.estagio === "candidato") {
        _manchete("Vaquinha digital impulsiona " + a.pele_nome + ".", "campanha");
        a.ambicao_politica = _clamp(a.ambicao_politica + 3, 0, 100);
      }
    } else if (tipo === "cancelamento") {
      if (!INF.podeEventoNegativo(a)) {
        // reais: so evento neutro/positivo
        a.credibilidade = _clamp((a.credibilidade || 60) + 2, 0, 100);
        _manchete(a.pele_nome + " ganha selo de verificação em nova plataforma.", "redes");
      } else {
        a.temperatura = _clamp(a.temperatura + 25, 0, 100);
        a.credibilidade = _clamp((a.credibilidade || 60) - 6, 0, 100);
        _manchete("Campanha de cancelamento atinge " + a.pele_nome + ".", "escandalo");
      }
    } else if (tipo === "fogo_amigo") {
      var aliado = figs.filter(function (x) { return x.tribo === a.tribo && x.id !== a.id; })[0];
      if (aliado) {
        _manchete("Fogo amigo na tribo " + (INF.TRIBOS[a.tribo] || {}).nome + ": " + a.pele_nome + " critica " + aliado.pele_nome + ".", "redes");
        st.tribos[a.tribo].apoio = _clamp(st.tribos[a.tribo].apoio - 3, 0, 100);
      }
    }
    st.historico.unshift({ mes: (typeof agoraM === "function" ? agoraM() : 0), tipo: tipo, id: a.id });
    if (st.historico.length > 40) st.historico.pop();
  };

  /* ---------- Gerador / substituicao ---------- */
  INF.NOMES_GERADOS = [
    ["Lia", "Rocha"], ["Theo", "Campos"], ["Nina", "Vargas"], ["Omar", "Freitas"],
    ["Bia", "Salles"], ["Caio", "Mendes"], ["Duda", "Pires"], ["Ravi", "Souza"]
  ];

  INF.gerarInfluencer = function (nicho) {
    var st = INF.estado();
    var tribo = nicho || _pick(Object.keys(INF.TRIBOS));
    var nm = _pick(INF.NOMES_GERADOS);
    var nome = nm[0] + " " + nm[1];
    st.gerados = (st.gerados || 0) + 1;
    var id = "FIG_GEN_" + st.gerados + "_" + Date.now().toString(36);
    var f = {
      id: id,
      nome: nome,
      pele_nome: nome,
      profissao: "Influenciador(a) digital",
      categoria: "Influencer",
      alcance: _R().i(35, 70),
      popularidade: _R().i(40, 75),
      credibilidade: _R().i(35, 70),
      influencia_politica: _R().i(20, 55),
      capacidade_de_mobilizacao: _R().i(40, 80),
      audiencia: "Redes · nicho " + ((INF.TRIBOS[tribo] || {}).nome || tribo),
      regiao_de_influencia: "Nacional / digital",
      posicionamento_ideologico: { economico: _R().i(-40, 40), social: _R().i(-40, 40), estado: 0, institucional: 20, ambiental: 20, seguranca: 0 },
      temas_de_interesse: ["redes", "cultura", "politica_digital"],
      afinidades_partidarias: {},
      relacoes_com_partidos: {},
      probabilidade_de_entrar_na_politica: 15,
      filiado: false,
      partido_atual: null,
      candidato_ativo: false,
      tipo_ator: "FIGURA_PUBLICA",
      biografia: "Surgiu viral no ecossistema digital (personagem gerado).",
      origem_ficha: "gerado",
      tribo: tribo,
      plataforma: "YouTube / TikTok",
      arquetipo_midia: "viral_novo"
    };
    INF.enriquecerFigura(f);
    return f;
  };

  INF.tickSubstituicao = function () {
    // 1 viral novo por ano (aprox: 1/12 chance ao mes)
    if (Math.random() > 1 / 12) return;
    if (!gameState || !gameState.influencia) return;
    var f = INF.gerarInfluencer();
    gameState.influencia.figuras.push(f);
    _manchete("Novo nome no radar: " + f.pele_nome + " explode nas redes (" + (INF.TRIBOS[f.tribo] || {}).nome + ").", "redes");
    // envelhecimento: figuras com alcance baixo podem sair do radar
    gameState.influencia.figuras = gameState.influencia.figuras.filter(function (x) {
      if (!INF.ehMidia(x)) return true;
      if (x.origem_ficha === "gerado" && (x.alcance || 0) < 25 && Math.random() < 0.3) return false;
      return true;
    });
  };

  /* ---------- Ciclo mensal (hook existente) ---------- */
  window.processarCicloInfluencia = function processarCicloInfluencia() {
    try {
      INF.garantirTodas();
      if (!gameState || !gameState.influencia) return;
      gameState.influencia.figuras.forEach(INF.tickFigura);
      if (Math.random() < 0.45) INF.eventoAleatorio();
      INF.tickSubstituicao();
      // sync apoio de tribos no radar textual leve
    } catch (e) { console.warn("INF ciclo", e); }
  };

  /* ---------- Acoes do jogador ---------- */
  INF.cortejar = function (figId, tom) {
    INF.garantirTodas();
    if (!gameState || !gameState.influencia) { _toast("Sem sistema de influência.", "err"); return; }
    var f = gameState.influencia.figuras.find(function (x) { return x.id === figId; });
    if (!f || !INF.ehMidia(f)) { _toast("Figura inválida.", "err"); return; }
    INF.enriquecerFigura(f);
    var j = typeof J === "function" ? J() : null;
    if (!j) { _toast("Sem jogador.", "err"); return; }
    if ((j.energia || 0) < 5) { _toast("Energia insuficiente (5).", "err"); return; }
    j.energia -= 5;
    tom = tom || "conciliador";
    // reusa matriz DIP se existir; senao efeito simples
    var delta = 4;
    try {
      if (window.DIP && typeof DIP.deltaClimaTom === "function") {
        var tr = {
          vaidade: f.polarizacao || 50,
          imprevisibilidade: f.temperatura || 40,
          transacionalismo: 50,
          pragmatismo: 55,
          paciencia: 50,
          rancor: Math.max(0, (f.temperatura || 40) - 40),
          ideologismo: f.polarizacao || 50,
          formalidade: f.categoria === "Jornalista" ? 70 : 40,
          sensibilidade_publica: 70
        };
        delta = DIP.deltaClimaTom(tom, tr, 0.4);
      }
    } catch (e) { delta = 4; }
    var pJog = j.partido_atual || j.partido || "Independente";
    f.afinidades_partidarias = f.afinidades_partidarias || {};
    f.afinidades_partidarias[pJog] = _clamp((f.afinidades_partidarias[pJog] || 0) + delta + 3, -100, 100);
    f.trajetoria.cortejos = (f.trajetoria.cortejos || 0) + 1;
    if (f.trajetoria.estagio === "influencer" && f.trajetoria.cortejos >= 2) {
      f.trajetoria.estagio = "cogitado";
      f.trajetoria.meses_no_estagio = 0;
    }
    _toast("Cortejo (" + tom + ") com " + (f.pele_nome || f.nome) + ": afinidade " + (delta >= 0 ? "+" : "") + delta + ".", delta >= 0 ? "ok" : "warn");
  };

  INF.convidarFiliacao = function (figId) {
    INF.garantirTodas();
    if (!gameState || !gameState.influencia) return;
    var f = gameState.influencia.figuras.find(function (x) { return x.id === figId; });
    if (!f || !INF.ehMidia(f)) return;
    INF.enriquecerFigura(f);
    var j = typeof J === "function" ? J() : null;
    if (!j) return;
    if ((j.energia || 0) < 6) { _toast("Energia insuficiente (6).", "err"); return; }
    j.energia -= 6;
    f.trajetoria.convites = (f.trajetoria.convites || 0) + 1;
    if (f.trajetoria.estagio === "influencer" || f.trajetoria.estagio === "cogitado") {
      f.trajetoria.estagio = "sondado";
      f.trajetoria.meses_no_estagio = 0;
    }
    var chance = INF.chanceSubir(f);
    f.probabilidade_de_entrar_na_politica = chance;
    if (chance >= 55 && Math.random() < chance / 100) {
      INF.avancarEstagio(f, "convite do jogador");
      if (f.trajetoria.estagio === "sondado") INF.avancarEstagio(f, "aceite");
      _toast(f.pele_nome + " responde bem ao convite. Trajetória: " + INF.ESTAGIO_LABEL[f.trajetoria.estagio] + ".", "ok");
    } else if (chance >= 35) {
      _toast(f.pele_nome + " fica na dúvida — continua sondado(a), sem filiação ainda.", "warn");
    } else {
      _toast(f.pele_nome + " recua: aversão a risco / audiência pesam mais que a oferta.", "warn");
      f.aversao_risco = _clamp(f.aversao_risco + 3, 0, 100);
    }
  };

  INF.nomearCabo = function (figId) {
    INF.garantirTodas();
    var f = gameState.influencia.figuras.find(function (x) { return x.id === figId; });
    if (!f || !INF.ehMidia(f)) return;
    var j = J();
    if (j.energia < 4) { _toast("Energia insuficiente.", "err"); return; }
    j.energia -= 4;
    f.trajetoria.papel = "cabo_eleitoral";
    f.trajetoria.meses_papel = 3;
    _toast(f.pele_nome + " atua como cabo eleitoral do seu nicho por 3 meses.", "ok");
    _manchete(f.pele_nome + " puxa engajamento para a campanha de " + j.nome + ".", "campanha");
  };

  INF.patrocinar = function (figId) {
    INF.garantirTodas();
    var f = gameState.influencia.figuras.find(function (x) { return x.id === figId; });
    if (!f || !INF.ehMidia(f)) return;
    var j = J();
    var custo = 80000;
    try {
      if (typeof gastar === "function") {
        if (!gastar(custo, 1)) return;
      } else if (j.financas && j.financas.caixa1 < custo) {
        _toast("Caixa insuficiente.", "err"); return;
      } else if (j.financas) j.financas.caixa1 -= custo;
    } catch (e) { _toast(String(e.message || e), "err"); return; }
    f.alcance = _clamp((f.alcance || 50) + 3, 0, 100);
    var pJog = j.partido_atual || j.partido || "Independente";
    f.afinidades_partidarias = f.afinidades_partidarias || {};
    f.afinidades_partidarias[pJog] = _clamp((f.afinidades_partidarias[pJog] || 0) + 8, -100, 100);
    f.temperatura = _clamp(f.temperatura + 5, 0, 100); // exposição
    try { if (typeof addIEO === "function") addIEO(1.2); } catch (e) {}
    _toast("Patrocínio/publicidade com " + f.pele_nome + " (canal cinza: +exposição/+IEO leve).", "warn");
  };

  INF.usarComoCombustivel = function (figId) {
    INF.garantirTodas();
    var f = gameState.influencia.figuras.find(function (x) { return x.id === figId; });
    if (!f || !INF.ehMidia(f)) return;
    var j = J();
    if (j.energia < 3) { _toast("Energia insuficiente.", "err"); return; }
    j.energia -= 3;
    f.temperatura = _clamp(f.temperatura + 15, 0, 100);
    var pJog = j.partido_atual || j.partido || "Independente";
    f.afinidades_partidarias = f.afinidades_partidarias || {};
    f.afinidades_partidarias[pJog] = _clamp((f.afinidades_partidarias[pJog] || 0) - 10, -100, 100);
    j.popularidade = _clamp((j.popularidade || 50) + 2, 0, 100);
    _toast("Ataque a " + f.pele_nome + " rende engajamento — e inimizade.", "warn");
    _manchete(j.nome + " transforma treta com " + f.pele_nome + " em combustível de redes.", "redes");
  };

  /* ---------- UI: patch modal + VIEWS.inf para midia ---------- */
  function acoesMidiaHtml(f) {
    var id = f.id;
    var chance = INF.chanceSubir(f);
    return '' +
      '<div style="margin:10px 0;padding:10px;border-radius:10px;border:1px solid var(--linha,#333);background:rgba(0,0,0,.25)" data-inf-ficha="1">' +
        "<div style=\"font-size:12px;display:grid;grid-template-columns:1fr 1fr;gap:6px\">" +
          "<div>Trajetória: <b>" + _esc(INF.ESTAGIO_LABEL[f.trajetoria.estagio] || f.trajetoria.estagio) + "</b></div>" +
          "<div>Papel: <b>" + _esc(INF.PAPEIS[f.trajetoria.papel] || f.trajetoria.papel) + "</b></div>" +
          "<div>Ambição: <b>" + Math.round(f.ambicao_politica) + "</b></div>" +
          "<div>Aversão a risco: <b>" + Math.round(f.aversao_risco) + "</b></div>" +
          "<div>Tribo: <b>" + _esc((INF.TRIBOS[f.tribo] || {}).nome || f.tribo) + "</b></div>" +
          "<div>Chance dinâmica: <b>" + chance + "%</b></div>" +
          "<div>Plataforma: <b>" + _esc(f.plataforma) + "</b></div>" +
          "<div>Temperatura: <b>" + Math.round(f.temperatura) + "</b></div>" +
        "</div></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap" data-inf-acoes="1">' +
        '<button type="button" class="b azul grow" data-a="infConcederEntrevista" data-p=\'' + JSON.stringify([id, "figura"]) + '\'>Conceder Entrevista / Gravação (6 energia)</button>' +
        '<button type="button" class="b branco grow" data-a="infCortejar" data-p=\'' + JSON.stringify([id, "conciliador"]) + '\'>🎙 Cortejar (podcast/live · tom conciliador)</button>' +
        '<button type="button" class="b branco grow" data-a="infCortejar" data-p=\'' + JSON.stringify([id, "transacional"]) + '\'>🎙 Cortejar (tom transacional)</button>' +
        '<button type="button" class="b confirma grow" data-a="infConvidarTrilha" data-p=\'' + JSON.stringify([id]) + '\'>Oferecer filiação / sondagem</button>' +
        '<button type="button" class="b branco grow" data-a="infNomearCabo" data-p=\'' + JSON.stringify([id]) + '\'>Cabo eleitoral (3 meses)</button>' +
        '<button type="button" class="b branco grow" data-a="infPatrocinar" data-p=\'' + JSON.stringify([id]) + '\'>Patrocinar / publicidade</button>' +
        '<button type="button" class="b corrige grow" data-a="infCombustivel" data-p=\'' + JSON.stringify([id]) + '\'>Usar como combustível (treta)</button>' +
      "</div>";
  }

  function patchModal() {
    if (typeof modalInfluencia !== "function") return false;
    if (modalInfluencia._infPatched) return true;
    var _orig = modalInfluencia;
    modalInfluencia = function () {
      var h = _orig.apply(this, arguments);
      try {
        var m = (typeof S !== "undefined") ? S.modal : null;
        if (!m || m.tipo !== "influencia" || m.subTipo !== "figura") return h;
        var figs = (gameState && gameState.influencia && gameState.influencia.figuras) || [];
        var f = null;
        for (var i = 0; i < figs.length; i++) if (figs[i] && figs[i].id === m.id) { f = figs[i]; break; }
        // Empresario: nao mexer (EMP ja tratou)
        if (!f || !INF.ehMidia(f)) return h;
        INF.enriquecerFigura(f);
        var bloco = acoesMidiaHtml(f);
        // substitui o bloco de acoes de jornalista (entrevista…)
        var replaced = h.replace(
          /<div style="display:flex;gap:8px;flex-wrap:wrap">\s*<button class="b azul grow" data-a="infConcederEntrevista"[\s\S]*?<\/div>/,
          bloco
        );
        if (replaced === h) {
          replaced = h.replace(
            /<div style="display:flex;gap:8px;flex-wrap:wrap">[\s\S]*?Conceder Entrevista[\s\S]*?<\/div>/,
            bloco
          );
        }
        h = replaced;
      } catch (e) { console.warn("INF modal", e); }
      return h;
    };
    modalInfluencia._infPatched = true;
    return true;
  }

  function patchViewsInf() {
    if (typeof VIEWS === "undefined" || typeof VIEWS.inf !== "function") return false;
    if (VIEWS.inf._infNucleo) return true;
    var _orig = VIEWS.inf;
    VIEWS.inf = function () {
      INF.garantirTodas();
      var h = _orig.apply(this, arguments);
      try {
        var st = INF.estado();
        var sub = (typeof S !== "undefined" && (S.infSubtab || (gameState.influencia && gameState.influencia.subtab))) || "figuras";
        if (sub !== "figuras") return h;
        var bar = '<div class="card" style="margin:0 0 12px;padding:10px 12px;border:1px solid #334155" data-inf-tribos="1">' +
          "<b>Núcleo de Influenciadores</b> — trajetória dinâmica (sem dado fixo). " +
          "<small>Tribos: " + Object.keys(INF.TRIBOS).map(function (t) {
            return _esc(INF.TRIBOS[t].nome) + " " + Math.round((st.tribos[t] || {}).apoio || 50);
          }).join(" · ") + "</small></div>";
        if (h.indexOf("data-inf-tribos") < 0) {
          // apos emp-inf-entry se existir, senao antes do grid 280px
          if (h.indexOf("emp-inf-entry") >= 0) {
            h = h.replace(/(class="card emp-inf-entry"[\s\S]*?<\/div>)/, "$1" + bar);
          } else {
            h = h.replace(
              '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">',
              bar + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">'
            );
          }
        }
        // badge de estagio nos cards: injeta via replace leve no botao ver perfil — opcional skip
      } catch (e) {}
      return h;
    };
    VIEWS.inf._infNucleo = true;
    // preserve EMP patch flag chain: if EMP already patched, we wrap the patched version — good
    return true;
  }

  function registrarA() {
    if (typeof A === "undefined") return false;
    A.infCortejar = function (id, tom) { INF.cortejar(id, tom); };
    A.infConvidarTrilha = function (id) { INF.convidarFiliacao(id); };
    A.infNomearCabo = function (id) { INF.nomearCabo(id); };
    A.infPatrocinar = function (id) { INF.patrocinar(id); };
    A.infCombustivel = function (id) { INF.usarComoCombustivel(id); };
    // override convite antigo para usar trajetoria
    A.infConvidarPolitica = function (id) {
      var f = gameState && gameState.influencia && gameState.influencia.figuras.find(function (x) { return x.id === id; });
      if (f && INF.ehMidia(f)) return INF.convidarFiliacao(id);
      // fallback generico (nao deveria atingir empresario — EMP nao usa este botao)
      if (f && (f.empresario_id || f.categoria === "Empresario")) {
        _toast("Empresários seguem o fluxo de negociação próprio.", "warn");
        return;
      }
    };
    return true;
  }

  function boot() {
    registrarA();
    patchViewsInf();
    patchModal();
    try { INF.garantirTodas(); } catch (e) {}
  }
  boot();
  var n = 0;
  var t = setInterval(function () { boot(); if (++n > 40) clearInterval(t); }, 200);
  ["DOMContentLoaded", "load"].forEach(function (ev) { document.addEventListener(ev, boot); });

  INF.resumo = function () {
    INF.garantirTodas();
    var figs = (gameState && gameState.influencia && gameState.influencia.figuras || []).filter(INF.ehMidia);
    return { versao: INF.versao, midia: figs.length, gerados: (INF.estado() || {}).gerados || 0 };
  };
  window.inf = INF;
  window.infResumo = INF.resumo;
})();
