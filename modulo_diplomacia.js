/* =============================================================================
   CADEIRA — MODULO DE DIPLOMACIA (Lideres Globais, Cupulas, Sucessao)
   Spec: CADEIRA_Spec_Diplomacia.md

   MODULO ADITIVO. Reaproveita o esqueleto existente (extInit / BLOCOS /
   viagemOficial / acordoComercial / cardPresidente) sem remover nada.
   Expoe window.DIP. Sem fotos de pessoas reais — apenas silhuetas.
   ============================================================================= */
(function () {
  "use strict";

  var DIP = (window.DIP = window.DIP || {});
  DIP.versao = 1;
  DIP.fase = 2; // dados + mecanica + UI + animacao basica pulavel

  function _clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function _rnd(a, b) { return a + Math.random() * (b - a); }
  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _toast(msg, tipo) { try { if (typeof toast === "function") toast(msg, tipo || "ok"); } catch (e) {} }
  function _manchete(t, k) { try { if (typeof manchete === "function") manchete(t, k || "diplomacia"); } catch (e) {} }

  /* ---------- 2.5 Pautas diplomaticas ---------- */
  DIP.PAUTAS = [
    "acordo_comercial", "acesso_mercado_agro", "barreira_ambiental", "credito_cambial_swap",
    "emprestimo_multilateral", "condicionalidade_fiscal", "transferencia_tecnologia",
    "cooperacao_defesa", "fertilizantes_insumos", "energia_petroleo_gas",
    "hidrogenio_verde_minerais_criticos", "fundos_clima_amazonia", "5g_tecnologia",
    "reforma_onu_fmi", "sancoes_alinhamento", "fronteira_migracao", "narcotrafico_garimpo",
    "mercosul_integracao", "investimento_direto", "turismo_cultura",
    "politica_nuclear_espacial", "opep_combustiveis", "painel_omc_subsidios",
    "tributacao_importacao", "geopolitica_eua_china"
  ];

  DIP.EIXOS = {
    ocidente: { id: "ocidente", nome: "Ocidente", cor: "#3b82f6" },
    china: { id: "china", nome: "China / Eurásia", cor: "#ef4444" },
    golfo: { id: "golfo", nome: "Golfo", cor: "#f59e0b" },
    sul_global: { id: "sul_global", nome: "Sul Global", cor: "#10b981" },
    latam: { id: "latam", nome: "América Latina", cor: "#8b5cf6" },
    multilateral: { id: "multilateral", nome: "Multilateral", cor: "#64748b" }
  };

  /* ---------- 3.2 Arquétipos ---------- */
  DIP.ARQUETIPOS = {
    A1: { id: "A1", nome: "Transacional-Imprevisível",
      tracos: { vaidade:85, imprevisibilidade:85, transacionalismo:90, pragmatismo:60, paciencia:25, rancor:70, ideologismo:50, formalidade:30, sensibilidade_publica:85 } },
    A2: { id: "A2", nome: "Estrategista-Paciente",
      tracos: { vaidade:55, imprevisibilidade:15, transacionalismo:65, pragmatismo:75, paciencia:95, rancor:65, ideologismo:60, formalidade:90, sensibilidade_publica:65 } },
    A3: { id: "A3", nome: "Soberanista-Cerimonial",
      tracos: { vaidade:70, imprevisibilidade:40, transacionalismo:55, pragmatismo:60, paciencia:60, rancor:50, ideologismo:55, formalidade:85, sensibilidade_publica:60 } },
    A4: { id: "A4", nome: "Técnico-Institucional",
      tracos: { vaidade:35, imprevisibilidade:15, transacionalismo:40, pragmatismo:80, paciencia:80, rancor:30, ideologismo:55, formalidade:85, sensibilidade_publica:40 } },
    A5: { id: "A5", nome: "Ideólogo-Disruptivo",
      tracos: { vaidade:70, imprevisibilidade:75, transacionalismo:35, pragmatismo:35, paciencia:35, rancor:80, ideologismo:95, formalidade:30, sensibilidade_publica:80 } },
    A6: { id: "A6", nome: "Pragmático-Oscilante",
      tracos: { vaidade:65, imprevisibilidade:60, transacionalismo:90, pragmatismo:85, paciencia:55, rancor:65, ideologismo:45, formalidade:55, sensibilidade_publica:60 } },
    A7: { id: "A7", nome: "Burocrata-Multilateral",
      tracos: { vaidade:30, imprevisibilidade:10, transacionalismo:20, pragmatismo:55, paciencia:85, rancor:20, ideologismo:65, formalidade:85, sensibilidade_publica:35 } },
    A8: { id: "A8", nome: "Guardião-da-Condicionalidade",
      tracos: { vaidade:25, imprevisibilidade:10, transacionalismo:50, pragmatismo:80, paciencia:75, rancor:30, ideologismo:30, formalidade:90, sensibilidade_publica:30 } }
  };

  /* ---------- 3.5 Matriz tom x traco (-3..+3) ---------- */
  DIP.TOMS = ["elogioso","firme","conciliador","transacional","desafiador","tecnico","evasivo","solidario"];
  DIP.MATRIZ_TOM = {
    elogioso:      { vaidade:3, imprevisibilidade:0, transacionalismo:1, pragmatismo:-1, paciencia:0, rancor:0, ideologismo:-1, formalidade:0, sensibilidade_publica:1 },
    firme:         { vaidade:-1, imprevisibilidade:-2, transacionalismo:1, pragmatismo:1, paciencia:0, rancor:-1, ideologismo:0, formalidade:1, sensibilidade_publica:-2 },
    conciliador:   { vaidade:0, imprevisibilidade:1, transacionalismo:-1, pragmatismo:1, paciencia:2, rancor:1, ideologismo:0, formalidade:2, sensibilidade_publica:1 },
    transacional:  { vaidade:0, imprevisibilidade:1, transacionalismo:3, pragmatismo:2, paciencia:0, rancor:0, ideologismo:-2, formalidade:-1, sensibilidade_publica:0 },
    desafiador:    { vaidade:-3, imprevisibilidade:-2, transacionalismo:-1, pragmatismo:-1, paciencia:-1, rancor:-3, ideologismo:-2, formalidade:-2, sensibilidade_publica:-3 },
    tecnico:       { vaidade:-1, imprevisibilidade:-1, transacionalismo:0, pragmatismo:2, paciencia:2, rancor:0, ideologismo:-1, formalidade:3, sensibilidade_publica:0 },
    evasivo:       { vaidade:-1, imprevisibilidade:0, transacionalismo:-1, pragmatismo:0, paciencia:-3, rancor:-1, ideologismo:0, formalidade:1, sensibilidade_publica:0 },
    solidario:     { vaidade:0, imprevisibilidade:0, transacionalismo:-2, pragmatismo:-1, paciencia:1, rancor:0, ideologismo:3, formalidade:1, sensibilidade_publica:1 }
  };
  DIP.TOM_LABEL = {
    elogioso: "Elogioso", firme: "Firme", conciliador: "Conciliador", transacional: "Transacional",
    desafiador: "Desafiador", tecnico: "Técnico", evasivo: "Evasivo", solidario: "Solidário"
  };

  /* ---------- 9.12 Capitais ---------- */
  DIP.CAPITAIS = {
    brasilia: { nome: "Brasília", lat: -15.79, lng: -47.88 },
    washington: { nome: "Washington", lat: 38.90, lng: -77.04 },
    nova_york: { nome: "Nova York", lat: 40.75, lng: -73.97 },
    pequim: { nome: "Pequim", lat: 39.90, lng: 116.40 },
    moscou: { nome: "Moscou", lat: 55.76, lng: 37.62 },
    bruxelas: { nome: "Bruxelas", lat: 50.85, lng: 4.35 },
    paris: { nome: "Paris", lat: 48.86, lng: 2.35 },
    berlim: { nome: "Berlim", lat: 52.52, lng: 13.40 },
    delhi: { nome: "Nova Délhi", lat: 28.61, lng: 77.21 },
    buenos_aires: { nome: "Buenos Aires", lat: -34.60, lng: -58.38 },
    cdmx: { nome: "Cidade do México", lat: 19.43, lng: -99.13 },
    bogota: { nome: "Bogotá", lat: 4.71, lng: -74.07 },
    caracas: { nome: "Caracas", lat: 10.48, lng: -66.90 },
    riad: { nome: "Riad", lat: 24.71, lng: 46.68 },
    ankara: { nome: "Ancara", lat: 39.93, lng: 32.86 },
    toquio: { nome: "Tóquio", lat: 35.68, lng: 139.69 },
    genebra: { nome: "Genebra", lat: 46.20, lng: 6.14 }
  };

  /* ---------- 18 instituicoes + ocupantes (secao 4 / Apendice A) ---------- */
  function mkOcup(o) {
    var arq = DIP.ARQUETIPOS[o.arquetipo] || DIP.ARQUETIPOS.A4;
    var tr = Object.assign({}, arq.tracos);
    if (o.tracos) Object.keys(o.tracos).forEach(function (k) { tr[k] = o.tracos[k]; });
    return {
      id: o.id, nome: o.nome, origem: o.origem || "real", instituicao_id: o.instituicao_id,
      cargo: o.cargo || "Chefe de Estado", nascimento_ano: o.nascimento_ano || 1960,
      inicio_ano: o.inicio_ano || 2022, fim_previsto_ano: o.fim_previsto_ano || 2028,
      ideologia: o.ideologia || { economica: 0, costumes: 0, soberania: 0 },
      arquetipo: o.arquetipo, tracos: tr, rasgos: o.rasgos || [],
      popularidade: o.popularidade || 55, capital_politico: o.capital_politico || 55, saude: o.saude || 80,
      status: o.status || "ativo",
      biografia: o.biografia || "Líder em exercício. (Perfil satírico de jogo.)",
      icone: o.icone || { cor: "#64748b", iniciais: (o.nome || "?").split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase(), silhueta: "statista" },
      conhecimento_inicial: o.conhecimento_inicial || ["pragmatismo", "formalidade", "vaidade"]
    };
  }

  DIP.INSTITUICOES = [
    { id: "eua", nome: "Estados Unidos da América", tipo: "pais", eixo: "ocidente", regime: "presidencialista",
      capital_id: "washington", peso: { economico: 95, militar: 98, diplomatico: 90 },
      interesses: ["tributacao_importacao","geopolitica_eua_china","hidrogenio_verde_minerais_criticos","5g_tecnologia","investimento_direto"],
      sucessao: { regra: "eleicao", mandato_anos: 4, limite_mandatos: 2, proxima_transicao_ano: 2028, hazard_base: 0.02 },
      ocupante_id: "trump_djt", vetor_politico: { economica: 70, costumes: 40, soberania: 80 },
      cor: "#1d4ed8", gosta: ["elogio","investir_eua","minerais"], gatilhos: ["critica_publica","moeda_alternativa"] },
    { id: "china", nome: "China", tipo: "pais", eixo: "china", regime: "autocracia",
      capital_id: "pequim", peso: { economico: 92, militar: 85, diplomatico: 80 },
      interesses: ["geopolitica_eua_china","5g_tecnologia","investimento_direto","acesso_mercado_agro","energia_petroleo_gas"],
      sucessao: { regra: "partido", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2027, hazard_base: 0.01 },
      ocupante_id: "xi_jp", vetor_politico: { economica: -20, costumes: -30, soberania: 90 },
      cor: "#dc2626", gosta: ["protocolo","longo_prazo","neutralidade_taiwan"], gatilhos: ["alinhar_washington","perder_face"] },
    { id: "russia", nome: "Rússia", tipo: "pais", eixo: "china", eixo_secundario: "brics", regime: "autocracia",
      capital_id: "moscou", peso: { economico: 55, militar: 88, diplomatico: 70 },
      interesses: ["fertilizantes_insumos","energia_petroleo_gas","sancoes_alinhamento","reforma_onu_fmi"],
      sucessao: { regra: "controle", mandato_anos: 6, limite_mandatos: 0, proxima_transicao_ano: 2030, hazard_base: 0.03 },
      ocupante_id: "putin_vv", vetor_politico: { economica: -10, costumes: 50, soberania: 95 },
      cor: "#b91c1c", gosta: ["soberania","brics","comercio_energia"], gatilhos: ["sancoes","critica_publica"] },
    { id: "ue", nome: "União Europeia (Comissão)", tipo: "organismo", eixo: "ocidente", regime: "organismo",
      capital_id: "bruxelas", peso: { economico: 88, militar: 40, diplomatico: 85 },
      interesses: ["fundos_clima_amazonia","barreira_ambiental","acordo_comercial","acesso_mercado_agro"],
      sucessao: { regra: "nomeacao", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2029, hazard_base: 0.01 },
      ocupante_id: "vonderleyen", vetor_politico: { economica: 20, costumes: 40, soberania: -40 },
      cor: "#2563eb", gosta: ["clima","rastreabilidade"], gatilhos: ["desmatamento","ataque_ambiental"] },
    { id: "franca", nome: "França", tipo: "pais", eixo: "ocidente", regime: "semipresidencialista",
      capital_id: "paris", peso: { economico: 70, militar: 65, diplomatico: 75 },
      interesses: ["fundos_clima_amazonia","cooperacao_defesa","turismo_cultura","acordo_comercial"],
      sucessao: { regra: "eleicao", mandato_anos: 5, limite_mandatos: 2, proxima_transicao_ano: 2027, hazard_base: 0.02 },
      ocupante_id: "macron_em", vetor_politico: { economica: 10, costumes: 30, soberania: 20 },
      cor: "#1e3a8a", gosta: ["gesto_cultural","defesa","nuclear"], gatilhos: ["mercosul_sem_salvaguarda"] },
    { id: "alemanha", nome: "Alemanha", tipo: "pais", eixo: "ocidente", regime: "parlamentarista",
      capital_id: "berlim", peso: { economico: 80, militar: 50, diplomatico: 70 },
      interesses: ["investimento_direto","hidrogenio_verde_minerais_criticos","acordo_comercial"],
      sucessao: { regra: "eleicao", mandato_anos: 4, limite_mandatos: 0, proxima_transicao_ano: 2029, hazard_base: 0.02 },
      ocupante_id: "merz_f", vetor_politico: { economica: 40, costumes: 10, soberania: 10 },
      cor: "#111827", gosta: ["industria","seguranca_juridica"], gatilhos: ["descumprir_contratos"] },
    { id: "india", nome: "Índia", tipo: "pais", eixo: "sul_global", regime: "parlamentarista",
      capital_id: "delhi", peso: { economico: 70, militar: 70, diplomatico: 65 },
      interesses: ["reforma_onu_fmi","transferencia_tecnologia","acordo_comercial","investimento_direto"],
      sucessao: { regra: "eleicao", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2029, hazard_base: 0.02 },
      ocupante_id: "modi_n", vetor_politico: { economica: 30, costumes: 40, soberania: 60 },
      cor: "#ea580c", gosta: ["sul_global","onu"], gatilhos: ["agro_desleal"] },
    { id: "argentina", nome: "Argentina", tipo: "pais", eixo: "latam", regime: "presidencialista",
      capital_id: "buenos_aires", peso: { economico: 45, militar: 30, diplomatico: 40 },
      interesses: ["mercosul_integracao","acordo_comercial","credito_cambial_swap","fronteira_migracao"],
      sucessao: { regra: "eleicao", mandato_anos: 4, limite_mandatos: 1, proxima_transicao_ano: 2027, hazard_base: 0.04 },
      ocupante_id: "milei_j", vetor_politico: { economica: 90, costumes: -20, soberania: 40 },
      cor: "#75aadb", gosta: ["abertura","liberalizacao"], gatilhos: ["tarifas","critica_modelo"] },
    { id: "mexico", nome: "México", tipo: "pais", eixo: "latam", regime: "presidencialista",
      capital_id: "cdmx", peso: { economico: 55, militar: 35, diplomatico: 50 },
      interesses: ["investimento_direto","energia_petroleo_gas","fronteira_migracao","transferencia_tecnologia"],
      sucessao: { regra: "eleicao", mandato_anos: 6, limite_mandatos: 1, proxima_transicao_ano: 2030, hazard_base: 0.02 },
      ocupante_id: "sheinbaum_c", vetor_politico: { economica: -20, costumes: 50, soberania: 30 },
      cor: "#15803d", gosta: ["ciencia","frente_latam"], gatilhos: ["concorrencia_montadoras"] },
    { id: "colombia", nome: "Colômbia", tipo: "pais", eixo: "latam", regime: "presidencialista",
      capital_id: "bogota", peso: { economico: 40, militar: 40, diplomatico: 35 },
      interesses: ["narcotrafico_garimpo","fronteira_migracao","cooperacao_defesa"],
      sucessao: { regra: "eleicao", mandato_anos: 4, limite_mandatos: 1, proxima_transicao_ano: 2026, hazard_base: 0.05 },
      ocupante_id: "espriella_a", vetor_politico: { economica: 40, costumes: 30, soberania: 50 },
      cor: "#fbbf24", gosta: ["seguranca","carteis"], gatilhos: ["leniencia_narco"] },
    { id: "venezuela", nome: "Venezuela", tipo: "pais", eixo: "latam", regime: "autocracia",
      capital_id: "caracas", peso: { economico: 30, militar: 35, diplomatico: 30 },
      interesses: ["energia_petroleo_gas","sancoes_alinhamento","fronteira_migracao"],
      sucessao: { regra: "controle", mandato_anos: 6, limite_mandatos: 0, proxima_transicao_ano: 2030, hazard_base: 0.06 },
      ocupante_id: "rodriguez_d", vetor_politico: { economica: -40, costumes: 20, soberania: 70 },
      cor: "#b45309", gosta: ["energia","fim_isolamento"], gatilhos: ["exigencia_democratica"] },
    { id: "arabia", nome: "Arábia Saudita", tipo: "pais", eixo: "golfo", regime: "monarquia",
      capital_id: "riad", peso: { economico: 75, militar: 60, diplomatico: 55 },
      interesses: ["investimento_direto","energia_petroleo_gas","opep_combustiveis","acesso_mercado_agro"],
      sucessao: { regra: "monarquia", mandato_anos: 0, limite_mandatos: 0, proxima_transicao_ano: 2040, hazard_base: 0.02 },
      ocupante_id: "mbs", vetor_politico: { economica: 50, costumes: -40, soberania: 60 },
      cor: "#166534", gosta: ["investimento","silencio_dh"], gatilhos: ["criticas_publicas"] },
    { id: "turquia", nome: "Turquia", tipo: "pais", eixo: "sul_global", regime: "presidencialista",
      capital_id: "ankara", peso: { economico: 50, militar: 55, diplomatico: 55 },
      interesses: ["cooperacao_defesa","investimento_direto","acordo_comercial"],
      sucessao: { regra: "eleicao", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2028, hazard_base: 0.03 },
      ocupante_id: "erdogan_rt", vetor_politico: { economica: 20, costumes: 40, soberania: 70 },
      cor: "#e11d48", gosta: ["defesa","mediador"], gatilhos: ["ponte_secundaria"] },
    { id: "japao", nome: "Japão", tipo: "pais", eixo: "ocidente", regime: "parlamentarista",
      capital_id: "toquio", peso: { economico: 78, militar: 55, diplomatico: 65 },
      interesses: ["investimento_direto","transferencia_tecnologia","infraestrutura_investimento","5g_tecnologia"],
      sucessao: { regra: "eleicao", mandato_anos: 4, limite_mandatos: 0, proxima_transicao_ano: 2028, hazard_base: 0.03 },
      ocupante_id: "takaichi_s", vetor_politico: { economica: 30, costumes: 20, soberania: 40 },
      cor: "#be123c", gosta: ["garantias","infra","semiconductores"], gatilhos: ["informalidade","instabilidade"] },
    { id: "onu", nome: "ONU", tipo: "organismo", eixo: "multilateral", regime: "organismo",
      capital_id: "nova_york", peso: { economico: 20, militar: 10, diplomatico: 90 },
      interesses: ["fundos_clima_amazonia","reforma_onu_fmi","fronteira_migracao","sancoes_alinhamento"],
      sucessao: { regra: "nomeacao", mandato_anos: 5, limite_mandatos: 2, proxima_transicao_ano: 2027, hazard_base: 0.01 },
      ocupante_id: "guterres_a", vetor_politico: { economica: 0, costumes: 50, soberania: -60 },
      cor: "#0ea5e9", gosta: ["clima","dh","multilateralismo"], gatilhos: ["unilateralismo"] },
    { id: "fmi", nome: "FMI", tipo: "organismo", eixo: "multilateral", regime: "organismo",
      capital_id: "washington", peso: { economico: 85, militar: 0, diplomatico: 70 },
      interesses: ["condicionalidade_fiscal","emprestimo_multilateral","credito_cambial_swap","meta_fiscal"],
      sucessao: { regra: "nomeacao", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2029, hazard_base: 0.01 },
      ocupante_id: "georgieva_k", vetor_politico: { economica: 60, costumes: 0, soberania: -30 },
      cor: "#0f766e", gosta: ["disciplina_fiscal","metas"], gatilhos: ["pedalada","gasto_sem_lastro"] },
    { id: "omc", nome: "OMC", tipo: "organismo", eixo: "multilateral", regime: "organismo",
      capital_id: "genebra", peso: { economico: 60, militar: 0, diplomatico: 65 },
      interesses: ["painel_omc_subsidios","acordo_comercial","acesso_mercado_agro","tributacao_importacao"],
      sucessao: { regra: "nomeacao", mandato_anos: 4, limite_mandatos: 0, proxima_transicao_ano: 2028, hazard_base: 0.01 },
      ocupante_id: "okonjo_n", vetor_politico: { economica: 40, costumes: 20, soberania: -40 },
      cor: "#0369a1", gosta: ["livre_comercio","regras"], gatilhos: ["protecionismo"] },
    { id: "bm", nome: "Banco Mundial", tipo: "organismo", eixo: "multilateral", regime: "organismo",
      capital_id: "washington", peso: { economico: 75, militar: 0, diplomatico: 60 },
      interesses: ["emprestimo_multilateral","investimento_direto","infraestrutura_investimento","fundos_clima_amazonia"],
      sucessao: { regra: "nomeacao", mandato_anos: 5, limite_mandatos: 0, proxima_transicao_ano: 2028, hazard_base: 0.01 },
      ocupante_id: "banga_a", vetor_politico: { economica: 45, costumes: 10, soberania: -20 },
      cor: "#065f46", gosta: ["transparencia","cronograma"], gatilhos: ["atraso_obra","licitacao_suspeita"] }
  ];

  DIP.OCUPANTES = [
    mkOcup({ id: "trump_djt", nome: "Donald Trump", instituicao_id: "eua", arquetipo: "A1",
      tracos: { imprevisibilidade: 90, transacionalismo: 95, vaidade: 90, paciencia: 25 },
      rasgos: ["fala_demais_em_publico","afeito_a_midia"], ideologia: { economica: 70, costumes: 40, soberania: 85 },
      inicio_ano: 2025, fim_previsto_ano: 2029, icone: { cor: "#1d4ed8", iniciais: "DT", silhueta: "statista" },
      biografia: "Negociador imprevisível, centrado em barganhas e imagem pública." }),
    mkOcup({ id: "xi_jp", nome: "Xi Jinping", instituicao_id: "china", arquetipo: "A2",
      tracos: { paciencia: 95, formalidade: 90, imprevisibilidade: 15 },
      rasgos: ["desconfiado"], ideologia: { economica: -20, costumes: -30, soberania: 90 },
      icone: { cor: "#dc2626", iniciais: "XJ", silhueta: "statista" },
      biografia: "Estrategista de longo prazo; protocolo e face importam." }),
    mkOcup({ id: "putin_vv", nome: "Vladimir Putin", instituicao_id: "russia", arquetipo: "A2",
      tracos: { rancor: 85, ideologismo: 70, paciencia: 75 },
      rasgos: ["ressentido_com_o_brasil"], ideologia: { economica: -10, costumes: 50, soberania: 95 },
      icone: { cor: "#b91c1c", iniciais: "VP", silhueta: "statista" } }),
    mkOcup({ id: "vonderleyen", nome: "Ursula von der Leyen", instituicao_id: "ue", arquetipo: "A4",
      tracos: { formalidade: 85, paciencia: 80, ideologismo: 60 },
      rasgos: ["obcecado_clima"], ideologia: { economica: 20, costumes: 40, soberania: -40 },
      icone: { cor: "#2563eb", iniciais: "UL", silhueta: "statista" } }),
    mkOcup({ id: "macron_em", nome: "Emmanuel Macron", instituicao_id: "franca", arquetipo: "A3",
      tracos: { vaidade: 75, formalidade: 85 },
      rasgos: ["sentimental_com_historia","afeito_a_midia"], ideologia: { economica: 10, costumes: 30, soberania: 20 },
      icone: { cor: "#1e3a8a", iniciais: "EM", silhueta: "statista" } }),
    mkOcup({ id: "merz_f", nome: "Friedrich Merz", instituicao_id: "alemanha", arquetipo: "A4",
      tracos: { pragmatismo: 80, formalidade: 80 },
      rasgos: [], ideologia: { economica: 40, costumes: 10, soberania: 10 },
      icone: { cor: "#111827", iniciais: "FM", silhueta: "statista" } }),
    mkOcup({ id: "modi_n", nome: "Narendra Modi", instituicao_id: "india", arquetipo: "A3",
      tracos: { formalidade: 70, paciencia: 70, ideologismo: 70 },
      rasgos: ["admirador_do_brasil"], ideologia: { economica: 30, costumes: 40, soberania: 60 },
      icone: { cor: "#ea580c", iniciais: "NM", silhueta: "statista" } }),
    mkOcup({ id: "milei_j", nome: "Javier Milei", instituicao_id: "argentina", arquetipo: "A5",
      tracos: { ideologismo: 95, imprevisibilidade: 80, rancor: 80 },
      rasgos: ["fala_demais_em_publico","afeito_a_midia"], ideologia: { economica: 95, costumes: -30, soberania: 40 },
      icone: { cor: "#75aadb", iniciais: "JM", silhueta: "statista" } }),
    mkOcup({ id: "sheinbaum_c", nome: "Claudia Sheinbaum", instituicao_id: "mexico", arquetipo: "A4",
      tracos: { paciencia: 75, pragmatismo: 75 },
      rasgos: ["obcecado_clima"], ideologia: { economica: -20, costumes: 50, soberania: 30 },
      icone: { cor: "#15803d", iniciais: "CS", silhueta: "statista" } }),
    mkOcup({ id: "espriella_a", nome: "Abelardo de la Espriella", instituicao_id: "colombia", arquetipo: "A5",
      tracos: { ideologismo: 85, imprevisibilidade: 60 },
      rasgos: ["obcecado_seguranca"], ideologia: { economica: 40, costumes: 30, soberania: 50 },
      inicio_ano: 2026, icone: { cor: "#fbbf24", iniciais: "AE", silhueta: "statista" } }),
    mkOcup({ id: "rodriguez_d", nome: "Delcy Rodríguez", instituicao_id: "venezuela", arquetipo: "A6",
      tracos: { transacionalismo: 85, pragmatismo: 85 }, status: "interino",
      rasgos: [], ideologia: { economica: -40, costumes: 20, soberania: 70 },
      icone: { cor: "#b45309", iniciais: "DR", silhueta: "statista" } }),
    mkOcup({ id: "mbs", nome: "Mohammed bin Salman", instituicao_id: "arabia", arquetipo: "A6",
      tracos: { pragmatismo: 85, transacionalismo: 85, formalidade: 70 },
      rasgos: ["desconfiado"], ideologia: { economica: 50, costumes: -40, soberania: 60 },
      icone: { cor: "#166534", iniciais: "MB", silhueta: "statista" } }),
    mkOcup({ id: "erdogan_rt", nome: "Recep T. Erdoğan", instituicao_id: "turquia", arquetipo: "A6",
      tracos: { transacionalismo: 90, imprevisibilidade: 65, vaidade: 70 },
      rasgos: ["afeito_a_midia"], ideologia: { economica: 20, costumes: 40, soberania: 70 },
      icone: { cor: "#e11d48", iniciais: "RE", silhueta: "statista" } }),
    mkOcup({ id: "takaichi_s", nome: "Sanae Takaichi", instituicao_id: "japao", arquetipo: "A3",
      tracos: { formalidade: 90, paciencia: 70, pragmatismo: 65 },
      rasgos: ["workaholic"], ideologia: { economica: 30, costumes: 20, soberania: 40 },
      icone: { cor: "#be123c", iniciais: "ST", silhueta: "statista" } }),
    mkOcup({ id: "guterres_a", nome: "António Guterres", instituicao_id: "onu", arquetipo: "A7",
      tracos: { paciencia: 85, formalidade: 85, ideologismo: 65 },
      rasgos: ["obcecado_clima"], ideologia: { economica: 0, costumes: 50, soberania: -60 },
      fim_previsto_ano: 2026, icone: { cor: "#0ea5e9", iniciais: "AG", silhueta: "statista" } }),
    mkOcup({ id: "georgieva_k", nome: "Kristalina Georgieva", instituicao_id: "fmi", arquetipo: "A8",
      tracos: { formalidade: 90, pragmatismo: 80, imprevisibilidade: 10 },
      rasgos: [], ideologia: { economica: 60, costumes: 0, soberania: -30 },
      icone: { cor: "#0f766e", iniciais: "KG", silhueta: "statista" } }),
    mkOcup({ id: "okonjo_n", nome: "Ngozi Okonjo-Iweala", instituicao_id: "omc", arquetipo: "A7",
      tracos: { paciencia: 85, ideologismo: 60 },
      rasgos: [], ideologia: { economica: 40, costumes: 20, soberania: -40 },
      icone: { cor: "#0369a1", iniciais: "NO", silhueta: "statista" } }),
    mkOcup({ id: "banga_a", nome: "Ajay Banga", instituicao_id: "bm", arquetipo: "A8",
      tracos: { pragmatismo: 80, transacionalismo: 55 },
      rasgos: [], ideologia: { economica: 45, costumes: 10, soberania: -20 },
      icone: { cor: "#065f46", iniciais: "AB", silhueta: "statista" } })
  ];

  DIP.instPorId = function (id) {
    for (var i = 0; i < DIP.INSTITUICOES.length; i++) if (DIP.INSTITUICOES[i].id === id) return DIP.INSTITUICOES[i];
    return null;
  };
  DIP.ocupPorId = function (id) {
    for (var i = 0; i < DIP.OCUPANTES.length; i++) if (DIP.OCUPANTES[i].id === id) return DIP.OCUPANTES[i];
    return null;
  };
  DIP.ocupAtual = function (instId) {
    var st = DIP.estado();
    var live = st && st.ocupantes && st.ocupantes[instId];
    if (live) return live;
    var inst = DIP.instPorId(instId);
    return inst ? DIP.ocupPorId(inst.ocupante_id) : null;
  };

  /* ---------- Estado (save leve) ---------- */
  DIP.estado = function () {
    if (typeof gameState === "undefined" || !gameState) return null;
    if (!gameState.diplomacia) {
      gameState.diplomacia = {
        versao: DIP.versao,
        modo_substitutos: "mistura",
        realismo: 0.6,
        mortes_de_reais: false,
        agenda_mes: -1,
        agenda_usada: 0,
        tensao_eixos: { ocidente: 40, china: 45, golfo: 30, sul_global: 35, latam: 30, multilateral: 25 },
        relacoes: {},
        acordos: [],
        diario: [],
        ocupantes: {},
        historico_mundial: [],
        convites: []
      };
    }
    var d = gameState.diplomacia;
    if (!d.relacoes) d.relacoes = {};
    if (!d.acordos) d.acordos = [];
    if (!d.diario) d.diario = [];
    if (!d.ocupantes) d.ocupantes = {};
    if (!d.tensao_eixos) d.tensao_eixos = { ocidente: 40, china: 45, golfo: 30, sul_global: 35, latam: 30, multilateral: 25 };
    // seed ocupantes vivos (copia, nao referencia catalogo)
    DIP.INSTITUICOES.forEach(function (inst) {
      if (!d.ocupantes[inst.id]) {
        var o = DIP.ocupPorId(inst.ocupante_id);
        if (o) d.ocupantes[inst.id] = JSON.parse(JSON.stringify(o));
      }
    });
    return d;
  };

  DIP.relacao = function (instId) {
    var st = DIP.estado();
    if (!st) return null;
    if (!st.relacoes[instId]) {
      var ext = null;
      try { if (typeof extInit === "function") ext = extInit(); } catch (e) {}
      var base = 50;
      if (ext) {
        if (instId === "eua" || instId === "fmi" || instId === "bm") base = ext.eua || 55;
        else if (instId === "china" || instId === "russia") base = ext.china || 55;
        else if (instId === "ue" || instId === "franca" || instId === "alemanha" || instId === "japao") base = ext.ue || 50;
        else if (instId === "argentina" || instId === "mexico" || instId === "colombia" || instId === "venezuela") base = ext.latam || 55;
        else if (instId === "india" || instId === "arabia" || instId === "turquia" || instId === "onu" || instId === "omc") base = ext.brics || 50;
      }
      st.relacoes[instId] = {
        institucional: base, pessoal: base, confianca: 40, rancor: 10, conhecimento: 15,
        promessas: [], acordos_ativos: [], ultimo_encontro_mes: -999, historico: [],
        tracos_revelados: []
      };
      var oc = DIP.ocupAtual(instId);
      if (oc && oc.conhecimento_inicial) {
        st.relacoes[instId].tracos_revelados = oc.conhecimento_inicial.slice();
        st.relacoes[instId].conhecimento = 25;
      }
    }
    return st.relacoes[instId];
  };

  DIP.mesAtual = function () {
    try {
      if (typeof agoraM === "function") return agoraM();
      if (typeof dt === "function") { var d = dt(); return (d.ano || 2026) * 12 + (d.mes || 0); }
    } catch (e) {}
    return 2026 * 12;
  };

  DIP.cargoJogador = function () {
    try {
      if (typeof cargoAtualId === "function") return cargoAtualId();
      if (typeof J === "function") {
        var c = (J().cargo_atual || "").toLowerCase();
        if (/presid/.test(c)) return "PRES";
        if (/senador/.test(c)) return "SEN";
        if (/deputado federal/.test(c)) return "DEPF";
        if (/governador/.test(c)) return "GOV";
      }
    } catch (e) {}
    return "CID";
  };

  DIP.podeDiplomacia = function () {
    var c = DIP.cargoJogador();
    return c === "PRES" || c === "SEN" || c === "DEPF" || c === "GOV" || c === "DEP";
  };

  DIP.pontosAgendaMes = function () {
    var c = DIP.cargoJogador();
    if (c === "PRES") return 6;
    if (c === "SEN" || c === "GOV") return 3;
    if (c === "DEPF" || c === "DEP") return 2;
    return 0;
  };

  DIP.agendaDisponivel = function () {
    var st = DIP.estado();
    if (!st) return 0;
    var mes = DIP.mesAtual();
    if (st.agenda_mes !== mes) { st.agenda_mes = mes; st.agenda_usada = 0; }
    return Math.max(0, DIP.pontosAgendaMes() - (st.agenda_usada || 0));
  };

  DIP.gastarAgenda = function (n) {
    var st = DIP.estado();
    if (!st) return false;
    if (DIP.agendaDisponivel() < n) return false;
    st.agenda_usada = (st.agenda_usada || 0) + n;
    return true;
  };

  /* ---------- Silhueta (sem foto real) ---------- */
  DIP.silhuetaHtml = function (ocup, size) {
    size = size || 48;
    var cor = (ocup && ocup.icone && ocup.icone.cor) || "#64748b";
    var ini = (ocup && ocup.icone && ocup.icone.iniciais) || "?";
    return '<div class="dip-sil" style="width:' + size + "px;height:" + size + "px;background:" + _esc(cor) +
      ';border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:' +
      Math.round(size * 0.34) + 'px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.15)" title="Silhueta procedural (sem foto real)">' +
      _esc(ini) + "</div>";
  };

  /* ---------- Matriz tom → clima ---------- */
  DIP.deltaClimaTom = function (tom, tracos, alinhamentoTema) {
    var pesos = DIP.MATRIZ_TOM[tom] || DIP.MATRIZ_TOM.conciliador;
    var sum = 0;
    Object.keys(pesos).forEach(function (k) {
      var p = pesos[k];
      if (tom === "solidario" && k === "ideologismo") p = p * (alinhamentoTema == null ? 0.5 : alinhamentoTema);
      sum += p * ((tracos[k] || 50) - 50) / 50;
    });
    return Math.round(sum * 3);
  };

  /* ---------- Nós de diálogo (por arquétipo + pauta) — textos genericos ---------- */
  DIP.gerarNo = function (rodada, pauta, arquetipo) {
    var falas = {
      A1: {
        abertura: "Vamos direto ao ponto. O que vocês têm a oferecer — e o que vão comprar de nós?",
        exigencia: "Vocês vendem demais pra nós e compram de menos. Isso vai ter que mudar. E rápido.",
        oferta: "Eu fecho acordo bom se o pacote for claro. Sem enrolação.",
        impasse: "Estamos rodando em círculo. Me dê um número ou eu encerro.",
        ultimato: "Ou aceitam esses termos hoje, ou a janela fecha.",
        gesto: "Gostei do gesto. Agora vamos ver se o papel acompanha.",
        fechamento: "Se fecharmos agora, ambos saímos com uma vitória para vender em casa."
      },
      A2: {
        abertura: "Nossas parcerias são de longo prazo e de benefício mútuo. Esperamos o mesmo da sua parte.",
        exigencia: "Precisamos de previsibilidade jurídica e um horizonte de dez anos.",
        oferta: "Há espaço para cooperação estrutural — com marcos claros.",
        impasse: "A pressa é inimiga do acordo duradouro. Recalibremos.",
        ultimato: "Sem salvaguardas mínimas, não avançamos.",
        gesto: "O protocolo foi observado. Isso facilita o diálogo.",
        fechamento: "Registremos o entendimento com precisão. Ambiguidade gera crise."
      },
      A5: {
        abertura: "O modelo antigo acabou. Ou inovamos de verdade, ou cada um segue sozinho.",
        exigencia: "O bloco está obsoleto. Abrimos de verdade — ou eu negocio por fora.",
        oferta: "Posso apoiar se houver ruptura com o fisiologismo do passado.",
        impasse: "Meio-termo é derrota disfarçada.",
        ultimato: "Aceitem a ruptura ou preparem-se para o isolamento.",
        gesto: "Belo teatro. Agora quero substância.",
        fechamento: "Se for para fingir consenso, eu não assino."
      }
    };
    var base = falas[arquetipo] || falas.A2;
    var defaultFalas = {
      abertura: "Bem-vindos. Há interesses convergentes e divergentes sobre a mesa.",
      exigencia: "Temos condições claras para avançar nesta pauta.",
      oferta: "Podemos oferecer cooperação em troca de compromisso recíproco.",
      impasse: "Há um hiato entre as posições. Como propõem reduzi-lo?",
      ultimato: "Sem movimento substantivo, interrompemos a rodada.",
      gesto: "O gesto foi registrado. Continuemos.",
      fechamento: "É hora de consolidar o que for possível e deixar o resto para a técnica."
    };
    var fala = (base && base[rodada]) || defaultFalas[rodada] || defaultFalas.abertura;
    var pautaLabel = String(pauta || "acordo").replace(/_/g, " ");
    return {
      id: rodada + "_" + pauta + "_" + arquetipo,
      rodada: rodada,
      pauta: pauta,
      arquetipos: [arquetipo],
      fala: fala + " (Pauta: " + pautaLabel + ".)",
      opcoes: [
        { id: "a", texto: "Equilibrar com compras e tecnologia, sem barreira nova.", tom: "firme", tipo: "contraproposta", custo_margem: 2, efeitos: { clausula: 1, respeito: 3 } },
        { id: "b", texto: "Pacote: mais acesso em troca de redução de barreiras.", tom: "transacional", tipo: "concessao", custo_margem: 0, efeitos: { clausula: 1, onus: 1 } },
        { id: "c", texto: "Valorizar a relação e buscar parceria soberana.", tom: "conciliador", tipo: "gesto", custo_margem: 1, efeitos: { clima: 2 } },
        { id: "d", texto: "Proposta técnica com cronograma e arbitragem.", tom: "tecnico", tipo: "contraproposta", custo_margem: 1, efeitos: { clausula: 1, respeito: 2 } },
        { id: "e", texto: "Levar à equipe e responder na próxima rodada.", tom: "evasivo", tipo: "adiar", custo_margem: 0, efeitos: { pressao: 5 } }
      ]
    };
  };

  DIP.sequenciaRodadas = function (modo) {
    if (modo === "telefone") return ["abertura", "exigencia", "fechamento"];
    if (modo === "video") return ["abertura", "exigencia", "oferta", "fechamento"];
    if (modo === "cupula") return ["abertura", "exigencia", "oferta", "gesto", "fechamento"];
    return ["abertura", "exigencia", "oferta", "impasse", "gesto", "fechamento"]; // viagem / visita
  };

  /* ---------- Motor de reuniao ---------- */
  DIP._cena = null; // estado da cena ativa (fora do save pesado; re-hidratavel)

  DIP.iniciarEncontro = function (opts) {
    opts = opts || {};
    var st = DIP.estado();
    if (!st) { _toast("Inicie uma carreira para usar a diplomacia.", "err"); return false; }
    if (!DIP.podeDiplomacia()) { _toast("Seu cargo atual tem acesso limitado à diplomacia.", "err"); return false; }
    var instId = opts.instId;
    var inst = DIP.instPorId(instId);
    if (!inst) { _toast("Instituição inválida.", "err"); return false; }
    var modo = opts.modo || "viagem";
    var custo = { viagem: 3, visita: 2, video: 1, telefone: 1, cupula: 4, posse: 2 }[modo] || 3;
    if (DIP.cargoJogador() !== "PRES" && (modo === "viagem" || modo === "cupula")) {
      modo = "video"; custo = 1;
      _toast("Com este cargo, o encontro sobe como videoconferência / missão curta.", "warn");
    }
    if (!DIP.gastarAgenda(custo)) { _toast("Agenda diplomática insuficiente este mês.", "err"); return false; }
    try {
      if (typeof gastarEnergia === "function") {
        var en = modo === "telefone" ? 6 : modo === "video" ? 10 : 15;
        if (!gastarEnergia(en)) { st.agenda_usada -= custo; return false; }
      }
    } catch (e) {}

    var rel = DIP.relacao(instId);
    var oc = DIP.ocupAtual(instId);
    var clima = Math.round(rel.pessoal * 0.6 + rel.institucional * 0.2 + 10 - rel.rancor * 0.15);
    clima = _clamp(clima + (opts.prepBonus || 0), 5, 95);

    DIP._cena = {
      fase: "briefing",
      instId: instId,
      modo: modo,
      pauta: opts.pauta || (inst.interesses && inst.interesses[0]) || "acordo_comercial",
      pauta2: (inst.interesses && inst.interesses[1]) || "investimento_direto",
      preparacao: opts.preparacao || 40,
      transparencia: opts.transparencia || "fechada",
      comitiva: opts.comitiva || [],
      gesto: opts.gesto || null,
      clima: clima,
      respeito: _clamp(40 + rel.confianca * 0.3, 10, 90),
      pressao: _clamp(20 + rel.rancor * 0.2, 0, 90),
      margem: 12,
      clausulas: 0,
      onus: 0,
      tons_usados: [],
      rodadas: DIP.sequenciaRodadas(modo),
      idx: 0,
      surpresas: 0,
      diario: []
    };
    DIP.abrirUI();
    return true;
  };

  DIP.aplicarOpcao = function (op) {
    var c = DIP._cena;
    if (!c || !op) return;
    var oc = DIP.ocupAtual(c.instId);
    var tr = (oc && oc.tracos) || DIP.ARQUETIPOS.A4.tracos;
    var dClima = DIP.deltaClimaTom(op.tom, tr, 0.5);
    // penalidade de repeticao de tom
    var reps = c.tons_usados.filter(function (t) { return t === op.tom; }).length;
    if (reps >= 2) dClima -= 3;
    c.tons_usados.push(op.tom);
    c.clima = _clamp(c.clima + dClima + (op.efeitos && op.efeitos.clima || 0), 0, 100);
    c.respeito = _clamp(c.respeito + (op.efeitos && op.efeitos.respeito || 0), 0, 100);
    c.pressao = _clamp(c.pressao + (op.efeitos && op.efeitos.pressao || 0), 0, 100);
    c.margem = Math.max(0, c.margem - (op.custo_margem || 0));
    if (op.efeitos && op.efeitos.clausula) c.clausulas += op.efeitos.clausula;
    if (op.efeitos && op.efeitos.onus) c.onus += op.efeitos.onus;
    c.diario.push({ rodada: c.rodadas[c.idx], tom: op.tom, delta: dClima, texto: op.texto });

    // surpresa
    var P = ((tr.imprevisibilidade || 50) / 100) * 0.35;
    if (Math.random() < P) {
      c.surpresas++;
      var surp = _pick(["muda_posicao", "elogio", "ameaca", "convite", "exigencia_nova"]);
      if (surp === "muda_posicao") { c.clausulas = Math.max(0, c.clausulas - 1); c.pressao += 8; c.diario.push({ surpresa: "O líder muda de posição sobre uma cláusula." }); }
      else if (surp === "elogio") { c.clima += 6; c.diario.push({ surpresa: "Elogio inesperado — espera retribuição." }); }
      else if (surp === "ameaca") { c.pressao += 20; c.diario.push({ surpresa: "Ameaça pública: a imprensa observa." }); }
      else if (surp === "convite") { c.clima += 10; c.diario.push({ surpresa: "Convite improvisado a um gesto social." }); }
      else { c.pressao += 10; c.onus += 1; c.diario.push({ surpresa: "Exigência nova entra na mesa." }); }
    }

    // revelar traco
    var rel = DIP.relacao(c.instId);
    var keys = Object.keys(tr);
    var hidden = keys.filter(function (k) { return (rel.tracos_revelados || []).indexOf(k) < 0; });
    if (hidden.length && Math.random() < 0.45) {
      var rev = _pick(hidden);
      rel.tracos_revelados = rel.tracos_revelados || [];
      rel.tracos_revelados.push(rev);
      rel.conhecimento = _clamp((rel.conhecimento || 0) + 3, 0, 100);
    }

    if (c.clima < 10) {
      c.fase = "incidente";
      DIP.resolverIncidente();
      return;
    }
    c.idx++;
    if (c.idx >= c.rodadas.length) {
      c.fase = "acordo";
      DIP.resolverAcordo();
    } else {
      c.fase = "reuniao";
    }
  };

  DIP.qualidadeDeScore = function (score) {
    if (score < 25) return { id: "ruim", nome: "Ruim", multPos: 0.5, multOnus: 1.4 };
    if (score < 50) return { id: "padrao", nome: "Padrão", multPos: 1.0, multOnus: 1.0 };
    if (score < 75) return { id: "bom", nome: "Bom", multPos: 1.3, multOnus: 0.8 };
    return { id: "excelente", nome: "Excelente", multPos: 1.6, multOnus: 0.6 };
  };

  DIP.resolverIncidente = function () {
    var c = DIP._cena; if (!c) return;
    var rel = DIP.relacao(c.instId);
    rel.rancor = _clamp(rel.rancor + 20, 0, 100);
    rel.pessoal = _clamp(rel.pessoal - 15, 0, 100);
    rel.historico.push({ mes: DIP.mesAtual(), tipo: "incidente", resumo: "Reunião azedou (clima < 10)." });
    if (rel.historico.length > 20) rel.historico.shift();
    _manchete("Incidente diplomático: conversa com " + (DIP.instPorId(c.instId) || {}).nome + " desanda.", "diplomacia");
    c.resultado = { qualidade: "falha", score: 0 };
    c.fase = "coletiva";
  };

  DIP.resolverAcordo = function () {
    var c = DIP._cena; if (!c) return;
    var inst = DIP.instPorId(c.instId);
    var oc = DIP.ocupAtual(c.instId);
    var poder = ((inst.peso && inst.peso.diplomatico) || 50) - 50;
    var score = c.clima * 0.30 + c.respeito * 0.20 + c.margem * 1.5 - c.pressao * 0.15 + c.preparacao * 0.15 + poder * 0.10 + c.clausulas * 4;
    var q = DIP.qualidadeDeScore(score);
    var rel = DIP.relacao(c.instId);
    rel.pessoal = _clamp(rel.pessoal + (q.id === "excelente" ? 12 : q.id === "bom" ? 8 : q.id === "padrao" ? 3 : -6), 0, 100);
    rel.institucional = _clamp(rel.institucional + (q.id === "ruim" ? -2 : 2), 0, 100);
    rel.confianca = _clamp(rel.confianca + (c.onus > 2 ? -4 : 3), 0, 100);
    rel.ultimo_encontro_mes = DIP.mesAtual();
    rel.conhecimento = _clamp(rel.conhecimento + 10, 0, 100);
    rel.historico.push({ mes: DIP.mesAtual(), tipo: "acordo", resumo: q.nome + " · " + c.pauta });
    if (rel.historico.length > 20) rel.historico.shift();

    var exigeRat = /comercial|politico_multilateral|mercosul|omc/.test(c.pauta);
    var acordo = {
      id: "ac_" + c.instId + "_" + DIP.mesAtual(),
      instId: c.instId,
      ocupanteId_signatario: oc && oc.id,
      tipo: c.pauta,
      qualidade: q.id,
      clausulas: c.clausulas,
      onus: Math.round(c.onus * q.multOnus),
      efeitos_mult: q.multPos,
      exige_ratificacao: !!exigeRat,
      ratificado: !exigeRat,
      status: exigeRat ? "suspenso" : "ativo",
      inicio_mes: DIP.mesAtual(),
      duracao_meses: 12
    };
    var st = DIP.estado();
    st.acordos.push(acordo);
    if (st.acordos.length > 24) st.acordos.shift();
    rel.acordos_ativos.push(acordo.id);

    // spillover eixos
    var eixo = inst.eixo;
    if (q.id === "bom" || q.id === "excelente") {
      st.tensao_eixos[eixo] = _clamp((st.tensao_eixos[eixo] || 40) - 4, 0, 100);
      Object.keys(st.tensao_eixos).forEach(function (ex) {
        if (ex !== eixo && (ex === "ocidente" || ex === "china") && (eixo === "ocidente" || eixo === "china")) {
          st.tensao_eixos[ex] = _clamp((st.tensao_eixos[ex] || 40) + 5, 0, 100);
          // afinidade rival
          DIP.INSTITUICOES.forEach(function (ou) {
            if (ou.eixo === ex) {
              var r2 = DIP.relacao(ou.id);
              r2.pessoal = _clamp(r2.pessoal - _rnd(5, 10), 0, 100);
            }
          });
        }
      });
      // sync esqueleto extInit
      try {
        var x = typeof extInit === "function" ? extInit() : null;
        if (x) {
          var map = { eua: "eua", china: "china", russia: "china", ue: "ue", franca: "ue", alemanha: "ue", japao: "ue",
            argentina: "latam", mexico: "latam", colombia: "latam", venezuela: "latam",
            india: "brics", arabia: "brics", turquia: "brics", onu: "brics", omc: "brics", fmi: "eua", bm: "eua" };
          var k = map[c.instId];
          if (k && typeof x[k] === "number") x[k] = _clamp(x[k] + 6 * q.multPos, 0, 100);
          if (typeof x.commod === "number") x.commod = _clamp(x.commod + 3 * q.multPos, 50, 190);
        }
      } catch (e) {}
    }

    // comitiva → favor empresarios do mesmo eixo
    try {
      if (window.EMP && EMP.relacao && c.comitiva && c.comitiva.length) {
        c.comitiva.forEach(function (eid) {
          var r = EMP.relacao(eid);
          if (r) r.afinidade = _clamp((r.afinidade || 40) + 6 * q.multPos, 0, 100);
        });
      }
    } catch (e) {}

    c.resultado = { qualidade: q, score: Math.round(score), acordo: acordo };
    c.fase = "coletiva";
    _manchete("Acordo " + q.nome.toLowerCase() + " com " + inst.nome + " sobre " + c.pauta.replace(/_/g, " ") + ".", "diplomacia");
  };

  DIP.finalizarColetiva = function (mensagem) {
    var c = DIP._cena; if (!c) return;
    var oc = DIP.ocupAtual(c.instId);
    var risco = (oc && oc.rasgos && oc.rasgos.indexOf("afeito_a_midia") >= 0) ? 0.35 : 0.15;
    if (c.transparencia === "aberta") risco += 0.15;
    if (mensagem === "firme" && Math.random() < risco) {
      _manchete("Líder estrangeiro contradiz a leitura brasileira da reunião.", "imprensa");
      var rel = DIP.relacao(c.instId);
      rel.pessoal = _clamp(rel.pessoal - 4, 0, 100);
    } else {
      try { if (typeof J === "function") { var j = J(); j.popularidade = _clamp((j.popularidade || 50) + (mensagem === "otimista" ? 2 : 1), 0, 100); } } catch (e) {}
    }
    c.fase = "retorno";
    DIP.registrarDiario(mensagem);
  };

  DIP.registrarDiario = function (mensagem) {
    var c = DIP._cena; if (!c) return;
    var st = DIP.estado();
    var inst = DIP.instPorId(c.instId);
    var oc = DIP.ocupAtual(c.instId);
    var card = {
      mes: DIP.mesAtual(),
      instId: c.instId,
      modo: c.modo,
      destino: (DIP.CAPITAIS[inst.capital_id] || {}).nome || inst.nome,
      lider: oc && oc.nome,
      qualidade: (c.resultado && c.resultado.qualidade && c.resultado.qualidade.nome) || c.resultado && c.resultado.qualidade || "—",
      pauta: c.pauta,
      mensagem: mensagem,
      score: c.resultado && c.resultado.score
    };
    st.diario.unshift(card);
    if (st.diario.length > 30) st.diario.pop();
    c.fase = "resumo";
  };

  /* ---------- Sucessao basica (tick mensal) ---------- */
  DIP.tickMensal = function () {
    var st = DIP.estado();
    if (!st) return;
    var ano = 2026;
    try { if (typeof dt === "function") ano = dt().ano || ano; } catch (e) {}
    DIP.INSTITUICOES.forEach(function (inst) {
      var oc = st.ocupantes[inst.id];
      if (!oc) return;
      var haz = (inst.sucessao && inst.sucessao.hazard_base) || 0.02;
      if (oc.fim_previsto_ano && ano >= oc.fim_previsto_ano && Math.random() < 0.35) {
        DIP.trocarOcupante(inst.id, "calendario");
      } else if (Math.random() < haz / 12) {
        var motivo = st.mortes_de_reais ? "saude" : "aposentadoria";
        DIP.trocarOcupante(inst.id, motivo);
      }
    });
    // regenera convites
    st.convites = DIP.gerarConvites();
  };

  DIP.gerarConvites = function () {
    var list = [];
    var pool = DIP.INSTITUICOES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    pool.forEach(function (inst) {
      list.push({
        instId: inst.id,
        modo: _pick(["viagem", "video", "visita", "telefone"]),
        pauta: _pick(inst.interesses || DIP.PAUTAS),
        texto: "Convite: diálogo com " + inst.nome + " sobre " + (inst.interesses[0] || "cooperação").replace(/_/g, " ") + "."
      });
    });
    return list;
  };

  DIP.NOMES_FICT = [
    ["Helena","Costa"],["Marcus","Almeida"],["Sofia","Nakamura"],["Ibrahim","Hassan"],
    ["Wei","Chen"],["Laura","Moreau"],["Andrei","Volkov"],["Priya","Sharma"]
  ];

  DIP.gerarOcupante = function (inst) {
    var arqId = _pick(Object.keys(DIP.ARQUETIPOS));
    var nm = _pick(DIP.NOMES_FICT);
    var nome = nm[0] + " " + nm[1];
    return mkOcup({
      id: "gen_" + inst.id + "_" + Date.now().toString(36),
      nome: nome, origem: "gerado", instituicao_id: inst.id, arquetipo: arqId,
      status: "ativo", icone: { cor: inst.cor || "#64748b", iniciais: (nm[0][0] + nm[1][0]).toUpperCase(), silhueta: "statista" },
      biografia: "Ocupante gerado proceduralmente a partir do arquétipo " + arqId + "."
    });
  };

  DIP.trocarOcupante = function (instId, motivo) {
    var st = DIP.estado();
    var inst = DIP.instPorId(instId);
    if (!st || !inst) return;
    var antigo = st.ocupantes[instId];
    var novo = DIP.gerarOcupante(inst);
    // acordos persistem na instituicao; relacao pessoal recalcula
    var rel = DIP.relacao(instId);
    rel.pessoal = Math.round(rel.institucional * 0.5 + 25);
    rel.rancor = Math.round(rel.rancor * 0.4);
    rel.tracos_revelados = (novo.conhecimento_inicial || []).slice();
    rel.historico.push({ mes: DIP.mesAtual(), tipo: "sucessao", resumo: (antigo && antigo.nome) + " → " + novo.nome + " (" + motivo + ")" });
    st.ocupantes[instId] = novo;
    st.historico_mundial.push({ mes: DIP.mesAtual(), instId: instId, de: antigo && antigo.nome, para: novo.nome, motivo: motivo });
    _manchete("Sucessão em " + inst.nome + ": " + (antigo && antigo.nome) + " deixa o cargo; " + novo.nome + " assume.", "mundo");
  };

  /* ---------- Animacao de voo (pulavel, reduced-motion, lite) ---------- */
  DIP.greatCircle = function (a, b, n) {
    n = n || 80;
    var D2R = Math.PI / 180, R2D = 180 / Math.PI;
    function toVec(lat, lng) {
      var f = lat * D2R, l = lng * D2R;
      return [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)];
    }
    function toLatLng(v) { return [Math.asin(v[2]) * R2D, Math.atan2(v[1], v[0]) * R2D]; }
    var A = toVec(a[0], a[1]), B = toVec(b[0], b[1]);
    var dot = Math.min(1, Math.max(-1, A[0]*B[0]+A[1]*B[1]+A[2]*B[2]));
    var w = Math.acos(dot), s = Math.sin(w), pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, k1 = s ? Math.sin((1 - t) * w) / s : 1 - t, k2 = s ? Math.sin(t * w) / s : t;
      pts.push(toLatLng([A[0]*k1+B[0]*k2, A[1]*k1+B[1]*k2, A[2]*k1+B[2]*k2]));
    }
    return { pts: pts, km: w * 6371 };
  };

  DIP.animarVoo = function (instId, onDone) {
    var inst = DIP.instPorId(instId);
    var cap = DIP.CAPITAIS[inst.capital_id] || DIP.CAPITAIS.washington;
    var br = DIP.CAPITAIS.brasilia;
    var reduce = false;
    try { reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var lite = !!(DIP._cena && DIP._cena.modoLite);
    if (reduce || lite) { if (onDone) onDone(); return function () {}; }

    var gc = DIP.greatCircle([br.lat, br.lng], [cap.lat, cap.lng], 100);
    var host = document.querySelector("[data-dip-modal] .dip-flight");
    if (!host) { if (onDone) onDone(); return function () {}; }
    var W = host.clientWidth || 640, H = 220;
    host.innerHTML = '<canvas class="dip-canvas" width="' + W + '" height="' + H + '"></canvas>' +
      '<div class="dip-flight-hud"><span id="dip-flight-info">Decolando de Brasília…</span>' +
      '<button type="button" class="b mini branco" data-dip-acao="pular-voo">Pular</button>' +
      '<button type="button" class="b mini branco" data-dip-acao="vel-voo" data-dip-v="2">2x</button></div>';
    var canvas = host.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var speed = 1;
    var cancel = false;
    var t0 = performance.now();
    var dur = Math.max(3500, Math.min(9000, gc.km / 880 * 1000 + 1200));

    function project(latlng) {
      return [(latlng[1] + 180) / 360 * W, (90 - latlng[0]) / 180 * H];
    }
    function frame(now) {
      if (cancel) return;
      var t = Math.min(1, ((now - t0) / dur) * speed);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      ctx.clearRect(0, 0, W, H);
      // fundo mapa simples
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(148,163,184,.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      gc.pts.forEach(function (p, i) {
        var xy = project(p);
        if (i === 0) ctx.moveTo(xy[0], xy[1]); else ctx.lineTo(xy[0], xy[1]);
      });
      ctx.stroke();
      var idx = e * (gc.pts.length - 1), i = Math.floor(idx), f = idx - i;
      var p0 = project(gc.pts[i]), p1 = project(gc.pts[Math.min(i + 1, gc.pts.length - 1)]);
      var x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f;
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = "16px sans-serif";
      ctx.fillText("✈", x - 6, y - 8);
      var info = document.getElementById("dip-flight-info");
      if (info) info.textContent = "Brasília → " + cap.nome + " · " + Math.round(gc.km) + " km · " + Math.round((gc.km / 880 + 1.2) * (1 - e)) + " h restantes";
      if (t < 1) requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    requestAnimationFrame(frame);

    host.onclick = function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-dip-acao]");
      if (!b) return;
      var a = b.getAttribute("data-dip-acao");
      if (a === "pular-voo") { cancel = true; if (onDone) onDone(); }
      if (a === "vel-voo") { speed = Number(b.getAttribute("data-dip-v") || 2); b.textContent = speed + "x"; speed = speed >= 4 ? 1 : speed * 2; }
    };
    return function () { cancel = true; };
  };

  /* ---------- UI ---------- */
  function _injectCSS() {
    if (document.getElementById("dip-css")) return;
    var st = document.createElement("style");
    st.id = "dip-css";
    st.textContent = [
      ".dip-modal{position:fixed;inset:0;background:rgba(2,6,23,.72);z-index:12000;display:flex;align-items:flex-start;justify-content:center;padding:24px 12px;overflow:auto}",
      ".dip-mbox{width:min(920px,100%);background:var(--superficie,#0f172a);color:var(--tinta,#e2e8f0);border:1px solid var(--linha,#334155);border-radius:14px;padding:16px 16px 20px;box-shadow:0 20px 50px rgba(0,0,0,.45)}",
      ".dip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}",
      ".dip-card{border:1px solid var(--linha,#334155);border-radius:12px;padding:10px;background:var(--superficie2,#111827);cursor:pointer}",
      ".dip-card:hover{border-color:#3b82f6}",
      ".dip-card-top{display:flex;gap:10px;align-items:center}",
      ".dip-meters{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin:8px 0}",
      ".dip-bar{height:7px;background:#1e293b;border-radius:99px;overflow:hidden}",
      ".dip-bar>i{display:block;height:100%;background:#3b82f6}",
      ".dip-bar.bad>i{background:#ef4444}.dip-bar.ok>i{background:#10b981}",
      ".dip-ops{display:flex;flex-direction:column;gap:8px;margin-top:10px}",
      ".dip-op{text-align:left;padding:10px 12px;border-radius:10px;border:1px solid var(--linha,#334155);background:#0b1220;color:inherit;cursor:pointer}",
      ".dip-op:hover{border-color:#3b82f6}",
      ".dip-op small{display:block;opacity:.7;margin-top:3px}",
      ".dip-flight{position:relative;margin:10px 0;border-radius:12px;overflow:hidden;border:1px solid #334155}",
      ".dip-flight-hud{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 10px;background:#020617;font-size:12px;flex-wrap:wrap}",
      ".dip-entry{margin:8px 0 12px}",
      ".dip-tracos{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
      ".dip-chip{font-size:11px;padding:3px 8px;border-radius:99px;background:#1e293b;border:1px solid #334155}",
      ".dip-chip.fog{opacity:.45;font-style:italic}",
      "@media (max-width:640px){.dip-mbox{padding:12px}.dip-meters{grid-template-columns:1fr}}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  }

  DIP.abrirUI = function () {
    _injectCSS();
    var antigo = document.querySelector("[data-dip-modal]");
    if (antigo) antigo.remove();
    var wrap = document.createElement("div");
    wrap.className = "dip-modal";
    wrap.setAttribute("data-dip-modal", "1");
    wrap.innerHTML = '<div class="dip-mbox"><button type="button" class="x" data-dip-acao="fechar">Fechar</button><div class="dip-corpo">' + DIP.renderCena() + "</div></div>";
    wrap.addEventListener("click", function (ev) {
      if (ev.target === wrap) return;
      var b = ev.target.closest && ev.target.closest("[data-dip-acao]");
      if (!b) return;
      DIP.handleAcao(b);
    });
    document.body.appendChild(wrap);
  };

  DIP.refreshUI = function () {
    var corpo = document.querySelector("[data-dip-modal] .dip-corpo");
    if (!corpo) { DIP.abrirUI(); return; }
    corpo.innerHTML = DIP.renderCena();
  };

  DIP.handleAcao = function (b) {
    var a = b.getAttribute("data-dip-acao");
    var id = b.getAttribute("data-dip-id");
    var c = DIP._cena;
    if (a === "fechar") {
      var m = document.querySelector("[data-dip-modal]");
      if (m) m.remove();
      DIP._cena = null;
      try { if (typeof render === "function") render(); } catch (e) {}
      return;
    }
    if (a === "filtro-eixo") {
      DIP._cena = DIP._cena || { fase: "mapa" };
      DIP._cena.fase = "mapa";
      DIP._cena.filtroEixo = id;
      DIP.refreshUI();
      return;
    }
    if (a === "abrir-mapa") {
      var fe = DIP._cena && DIP._cena.filtroEixo;
      DIP._cena = { fase: "mapa", filtroEixo: fe || "todos" };
      DIP.refreshUI();
      return;
    }
    if (a === "ver-inst") { DIP._cena = { fase: "ficha", instId: id }; DIP.refreshUI(); return; }
    if (a === "briefing") {
      DIP._cena = {
        fase: "briefing", instId: id, modo: b.getAttribute("data-dip-modo") || "viagem",
        pauta: b.getAttribute("data-dip-pauta") || (DIP.instPorId(id).interesses || [])[0],
        preparacao: 40, transparencia: "fechada", comitiva: [], margem: 12
      };
      DIP.refreshUI(); return;
    }
    if (a === "set-modo") { if (c) { c.modo = id; DIP.refreshUI(); } return; }
    if (a === "set-transp") { if (c) { c.transparencia = id; DIP.refreshUI(); } return; }
    if (a === "set-pauta") { if (c) { c.pauta = id; DIP.refreshUI(); } return; }
    if (a === "prep-itamaraty") {
      if (c && DIP.gastarAgenda(1)) {
        c.preparacao = _clamp(c.preparacao + 12, 0, 100);
        var rel = DIP.relacao(c.instId);
        rel.conhecimento = _clamp(rel.conhecimento + 5, 0, 100);
        var oc = DIP.ocupAtual(c.instId);
        if (oc) {
          var hid = Object.keys(oc.tracos).filter(function (k) { return (rel.tracos_revelados || []).indexOf(k) < 0; });
          if (hid.length) rel.tracos_revelados.push(_pick(hid));
        }
        _toast("Pré-negociação do Itamaraty: +preparação e traço revelado.", "ok");
        DIP.refreshUI();
      } else _toast("Sem pontos de agenda.", "err");
      return;
    }
    if (a === "iniciar-voo") {
      if (!c) return;
      // re-inicia com custos se ainda nao gastou (briefing path)
      if (!c._custosOk) {
        var ok = DIP.iniciarEncontro({
          instId: c.instId, modo: c.modo, pauta: c.pauta,
          preparacao: c.preparacao, transparencia: c.transparencia, comitiva: c.comitiva,
          prepBonus: Math.round((c.preparacao - 40) / 5)
        });
        if (!ok) return;
        c = DIP._cena;
        c._custosOk = true;
      }
      // telefone/video: sem animacao de aviao
      if (c.modo === "telefone" || c.modo === "video") {
        c.fase = c.modo === "telefone" ? "reuniao" : "protocolo";
        if (c.modo === "telefone") c.idx = 0;
        DIP.refreshUI();
        return;
      }
      c.fase = "voo";
      DIP.refreshUI();
      DIP.animarVoo(c.instId, function () {
        if (!DIP._cena) return;
        DIP._cena.fase = "protocolo";
        DIP.refreshUI();
      });
      return;
    }
    if (a === "protocolo") {
      if (!c) return;
      var oc = DIP.ocupAtual(c.instId);
      var form = (oc && oc.tracos && oc.tracos.formalidade) || 50;
      var vaid = (oc && oc.tracos && oc.tracos.vaidade) || 50;
      if (id === "formal") c.clima += form > 60 ? 6 : 2;
      else if (id === "caloroso") c.clima += vaid > 60 ? 5 : (form > 70 ? -2 : 3);
      else if (id === "gesto") c.clima += 4;
      c.fase = "reuniao";
      c.idx = c.idx || 0;
      DIP.refreshUI();
      return;
    }
    if (a === "responder") {
      if (!c) return;
      var no = DIP.gerarNo(c.rodadas[c.idx], c.pauta, (DIP.ocupAtual(c.instId) || {}).arquetipo || "A4");
      var op = no.opcoes.filter(function (o) { return o.id === id; })[0];
      DIP.aplicarOpcao(op || no.opcoes[0]);
      DIP.refreshUI();
      return;
    }
    if (a === "coletiva") {
      DIP.finalizarColetiva(id || "cautelosa");
      DIP.refreshUI();
      return;
    }
    if (a === "lite") {
      if (c) c.modoLite = !c.modoLite;
      _toast(c && c.modoLite ? "Modo lite ligado." : "Modo lite desligado.", "ok");
      return;
    }
    if (a === "aceitar-convite") {
      var st = DIP.estado();
      var conv = (st.convites || [])[Number(id)];
      if (conv) {
        DIP._cena = { fase: "briefing", instId: conv.instId, modo: conv.modo, pauta: conv.pauta, preparacao: 40, transparencia: "fechada", comitiva: [] };
        DIP.refreshUI();
      }
      return;
    }
  };

  DIP.renderCena = function () {
    var c = DIP._cena || { fase: "mapa" };
    if (c.fase === "mapa") return DIP.uiMapa();
    if (c.fase === "ficha") return DIP.uiFicha(c.instId);
    if (c.fase === "briefing") return DIP.uiBriefing();
    if (c.fase === "voo") return DIP.uiVoo();
    if (c.fase === "protocolo") return DIP.uiProtocolo();
    if (c.fase === "reuniao") return DIP.uiReuniao();
    if (c.fase === "acordo" || c.fase === "incidente") return DIP.uiAcordo();
    if (c.fase === "coletiva") return DIP.uiColetiva();
    if (c.fase === "retorno" || c.fase === "resumo") return DIP.uiResumo();
    return DIP.uiMapa();
  };

  DIP.uiMapa = function () {
    var st = DIP.estado() || { convites: [], tensao_eixos: {}, diario: [] };
    if (!st.convites || !st.convites.length) st.convites = DIP.gerarConvites();
    var filtro = (DIP._cena && DIP._cena.filtroEixo) || "todos";
    var cards = DIP.INSTITUICOES.filter(function (inst) {
      return filtro === "todos" || inst.eixo === filtro;
    }).map(function (inst) {
      var rel = DIP.relacao(inst.id) || { pessoal: 50 };
      var oc = DIP.ocupAtual(inst.id);
      var corP = rel.pessoal >= 60 ? "#10b981" : rel.pessoal < 35 ? "#ef4444" : "#f59e0b";
      return '<div class="dip-card" data-dip-acao="ver-inst" data-dip-id="' + _esc(inst.id) + '">' +
        '<div class="dip-card-top">' + DIP.silhuetaHtml(oc, 42) +
        '<div><b>' + _esc(inst.nome) + "</b><small style=\"display:block;opacity:.7\">" +
        _esc((oc && oc.nome) || "?") + " · " + _esc((DIP.EIXOS[inst.eixo] || {}).nome || inst.eixo) +
        "</small></div></div>" +
        '<div class="dip-meters"><div>Pessoal <b>' + Math.round(rel.pessoal) + "</b>" +
        '<div class="dip-bar" style="margin-top:3px"><i style="width:' + rel.pessoal + "%;background:" + corP + '"></i></div></div>' +
        "<div>Tensão eixo <b>" + Math.round((st.tensao_eixos[inst.eixo] || 40)) + "</b></div></div></div>";
    }).join("");

    var eixos = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px">' +
      '<button type="button" class="b mini ' + (filtro === "todos" ? "confirma" : "branco") + '" data-dip-acao="filtro-eixo" data-dip-id="todos">Todos</button>' +
      Object.keys(DIP.EIXOS).map(function (ex) {
        return '<button type="button" class="b mini ' + (filtro === ex ? "confirma" : "branco") + '" data-dip-acao="filtro-eixo" data-dip-id="' + ex + '">' + _esc(DIP.EIXOS[ex].nome) + "</button>";
      }).join("") + "</div>";

    var conv = (st.convites || []).map(function (cv, i) {
      return '<div class="row" style="gap:8px;margin:6px 0;align-items:center"><span class="grow" style="font-size:13px">' +
        _esc(cv.texto) + '</span><button type="button" class="b mini confirma" data-dip-acao="aceitar-convite" data-dip-id="' + i + '">Preparar</button></div>';
    }).join("");

    return "<h2>🌍 Relações Exteriores</h2>" +
      '<p class="txt">Instituição ≠ ocupante. Traços revelam-se com o tempo. Sem fotos reais — só silhuetas. Agenda: <b>' +
      DIP.agendaDisponivel() + "/" + DIP.pontosAgendaMes() + "</b>.</p>" +
      eixos + '<div class="dip-grid">' + cards + "</div>" +
      '<h3 style="margin-top:16px">Agenda diplomática do mês</h3>' + (conv || "<p class='txt'>Sem convites.</p>") +
      (st.diario && st.diario.length ? '<h3 style="margin-top:16px">Diário de Viagem</h3>' + st.diario.slice(0, 3).map(function (d) {
        return '<div class="dip-card" style="cursor:default"><b>' + _esc(d.destino) + "</b> · " + _esc(d.qualidade) +
          "<small style=\"display:block\">" + _esc(d.lider) + " · " + _esc((d.pauta || "").replace(/_/g, " ")) + "</small></div>";
      }).join("") : "");
  };

  DIP.uiFicha = function (instId) {
    var inst = DIP.instPorId(instId);
    var oc = DIP.ocupAtual(instId);
    var rel = DIP.relacao(instId);
    var arq = DIP.ARQUETIPOS[oc.arquetipo] || {};
    var tracosHtml = Object.keys(oc.tracos || {}).map(function (k) {
      var rev = (rel.tracos_revelados || []).indexOf(k) >= 0;
      return '<span class="dip-chip' + (rev ? "" : " fog") + '">' + (rev ? (k + ": " + Math.round(oc.tracos[k])) : "???") + "</span>";
    }).join("");
    return '<button type="button" class="b mini branco" data-dip-acao="abrir-mapa">← Mapa</button>' +
      '<div class="dip-card-top" style="margin:12px 0">' + DIP.silhuetaHtml(oc, 64) +
      "<div><h2 style=\"margin:0\">" + _esc(inst.nome) + "</h2>" +
      "<div style=\"opacity:.8\">" + _esc(oc.nome) + " · " + _esc(arq.nome || oc.arquetipo) +
      (oc.status === "interino" ? " (interino)" : "") + "</div>" +
      '<div style="font-size:12px;margin-top:4px">' + _esc(oc.biografia) + "</div></div></div>" +
      '<div class="dip-meters">' +
      "<div>Institucional <b>" + Math.round(rel.institucional) + "</b><div class=\"dip-bar\"><i style=\"width:" + rel.institucional + '%"></i></div></div>' +
      "<div>Pessoal <b>" + Math.round(rel.pessoal) + "</b><div class=\"dip-bar\"><i style=\"width:" + rel.pessoal + '%"></i></div></div>' +
      "<div>Confiança <b>" + Math.round(rel.confianca) + "</b><div class=\"dip-bar ok\"><i style=\"width:" + rel.confianca + '%"></i></div></div>' +
      "<div>Rancor <b>" + Math.round(rel.rancor) + "</b><div class=\"dip-bar bad\"><i style=\"width:" + rel.rancor + '%"></i></div></div>' +
      "</div>" +
      "<h4>Névoa de personalidade</h4><div class=\"dip-tracos\">" + tracosHtml + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
      '<button type="button" class="b confirma" data-dip-acao="briefing" data-dip-id="' + _esc(instId) + '" data-dip-modo="viagem">✈ Solicitar viagem</button>' +
      '<button type="button" class="b azul" data-dip-acao="briefing" data-dip-id="' + _esc(instId) + '" data-dip-modo="video">💻 Videoconferência</button>' +
      '<button type="button" class="b branco" data-dip-acao="briefing" data-dip-id="' + _esc(instId) + '" data-dip-modo="telefone">☎ Telefonema</button>' +
      "</div>";
  };

  DIP.uiBriefing = function () {
    var c = DIP._cena;
    var inst = DIP.instPorId(c.instId);
    var oc = DIP.ocupAtual(c.instId);
    var pautOpts = (inst.interesses || []).map(function (p) {
      return '<button type="button" class="b mini ' + (c.pauta === p ? "confirma" : "branco") + '" data-dip-acao="set-pauta" data-dip-id="' + _esc(p) + '">' + _esc(p.replace(/_/g, " ")) + "</button>";
    }).join("");
    return "<h2>Briefing — " + _esc(inst.nome) + "</h2>" +
      "<p class=\"txt\">Com " + DIP.silhuetaHtml(oc, 28) + " <b>" + _esc(oc.nome) + "</b>. Modo: <b>" + _esc(c.modo) + "</b>.</p>" +
      "<h4>Pauta</h4><div style=\"display:flex;gap:6px;flex-wrap:wrap\">" + pautOpts + "</div>" +
      "<h4 style=\"margin-top:12px\">Transparência</h4>" +
      '<button type="button" class="b mini ' + (c.transparencia === "fechada" ? "confirma" : "branco") + '" data-dip-acao="set-transp" data-dip-id="fechada">Reunião fechada</button> ' +
      '<button type="button" class="b mini ' + (c.transparencia === "aberta" ? "confirma" : "branco") + '" data-dip-acao="set-transp" data-dip-id="aberta">Aberta (mais repercussão)</button>' +
      "<h4 style=\"margin-top:12px\">Preparação: " + Math.round(c.preparacao) + "</h4>" +
      '<button type="button" class="b mini" data-dip-acao="prep-itamaraty">Pré-negociar com Itamaraty (−1 agenda)</button> ' +
      '<button type="button" class="b mini branco" data-dip-acao="lite">Modo lite / reduced motion</button>' +
      '<div style="margin-top:16px"><button type="button" class="b confirma" data-dip-acao="iniciar-voo">Iniciar encontro</button> ' +
      '<button type="button" class="b branco" data-dip-acao="ver-inst" data-dip-id="' + _esc(c.instId) + '">Voltar</button></div>';
  };

  DIP.uiVoo = function () {
    var c = DIP._cena;
    var inst = DIP.instPorId(c.instId);
    return "<h2>Viagem a " + _esc((DIP.CAPITAIS[inst.capital_id] || {}).nome || inst.nome) + "</h2>" +
      '<div class="dip-flight"></div><p class="txt">Animação pulável · velocidades · respeita prefers-reduced-motion.</p>';
  };

  DIP.uiProtocolo = function () {
    var c = DIP._cena;
    var oc = DIP.ocupAtual(c.instId);
    return "<h2>Protocolo de chegada</h2>" +
      "<p class=\"txt\">Cerimônia com " + _esc(oc.nome) + ". Escolha o tom de recepção (formalidade/vaidade pesam).</p>" +
      '<div class="dip-ops">' +
      '<button type="button" class="dip-op" data-dip-acao="protocolo" data-dip-id="formal"><b>Traje e aperto formais</b><small>Favorece alta formalidade</small></button>' +
      '<button type="button" class="dip-op" data-dip-acao="protocolo" data-dip-id="caloroso"><b>Saudação calorosa e discurso curto</b><small>Favorece vaidade; risco se for rígido</small></button>' +
      '<button type="button" class="dip-op" data-dip-acao="protocolo" data-dip-id="gesto"><b>Gesto cultural / histórico</b><small>Presente simbólico</small></button>' +
      "</div>";
  };

  DIP.uiReuniao = function () {
    var c = DIP._cena;
    var oc = DIP.ocupAtual(c.instId);
    var inst = DIP.instPorId(c.instId);
    var tipo = c.rodadas[c.idx];
    var no = DIP.gerarNo(tipo, c.pauta, oc.arquetipo || "A4");
    var ops = no.opcoes.map(function (o) {
      return '<button type="button" class="dip-op" data-dip-acao="responder" data-dip-id="' + _esc(o.id) + '"><b>' +
        _esc(DIP.TOM_LABEL[o.tom] || o.tom) + "</b> — " + _esc(o.texto) +
        "<small>Margem −" + (o.custo_margem || 0) + "</small></button>";
    }).join("");
    return '<div class="dip-card-top">' + DIP.silhuetaHtml(oc, 52) + "<div><h2 style=\"margin:0\">Reunião · " +
      _esc(tipo) + " (" + (c.idx + 1) + "/" + c.rodadas.length + ")</h2>" +
      "<small>" + _esc(inst.nome) + " · " + _esc(oc.nome) + "</small></div></div>" +
      '<div class="dip-meters">' +
      "<div>Clima <b>" + Math.round(c.clima) + "</b><div class=\"dip-bar " + (c.clima < 25 ? "bad" : c.clima > 65 ? "ok" : "") + "\"><i style=\"width:" + c.clima + '%"></i></div></div>' +
      "<div>Respeito <b>" + Math.round(c.respeito) + "</b><div class=\"dip-bar\"><i style=\"width:" + c.respeito + '%"></i></div></div>' +
      "<div>Pressão <b>" + Math.round(c.pressao) + "</b><div class=\"dip-bar bad\"><i style=\"width:" + c.pressao + '%"></i></div></div>' +
      "<div>Margem <b>" + c.margem + "</b></div></div>" +
      '<div class="card" style="padding:12px;margin:10px 0;background:#0b1220;border-radius:10px;border:1px solid #334155"><i>“' + _esc(no.fala) + '”</i></div>' +
      '<div class="dip-ops">' + ops + "</div>";
  };

  DIP.uiAcordo = function () {
    var c = DIP._cena;
    var r = c.resultado || {};
    var q = r.qualidade;
    var nome = typeof q === "object" ? q.nome : q;
    return "<h2>Resultado</h2><p class=\"txt\">Qualidade: <b>" + _esc(nome) + "</b> · score " + (r.score || 0) +
      "<br>Cláusulas: " + c.clausulas + " · Ônus: " + c.onus + " · Surpresas: " + c.surpresas + "</p>" +
      '<button type="button" class="b confirma" data-dip-acao="coletiva" data-dip-id="cautelosa">Ir à coletiva</button>';
  };

  DIP.uiColetiva = function () {
    return "<h2>Coletiva de imprensa</h2><p class=\"txt\">Escolha a mensagem pública.</p><div class=\"dip-ops\">" +
      ['otimista','cautelosa','firme','tecnica'].map(function (m) {
        return '<button type="button" class="dip-op" data-dip-acao="coletiva" data-dip-id="' + m + '"><b>' + m.charAt(0).toUpperCase() + m.slice(1) + "</b></button>";
      }).join("") + "</div>";
  };

  DIP.uiResumo = function () {
    var c = DIP._cena;
    var st = DIP.estado();
    var d = st.diario[0] || {};
    return "<h2>Diário de Viagem</h2>" +
      '<div class="dip-card" style="cursor:default">' +
      "<b>" + _esc(d.destino || "") + "</b> com " + _esc(d.lider || "") +
      "<div>Qualidade: <b>" + _esc(String(d.qualidade || "")) + "</b> · Pauta: " + _esc(String(d.pauta || "").replace(/_/g, " ")) + "</div>" +
      "<small>Card compartilhável do encontro (satírico de jogo).</small></div>" +
      '<button type="button" class="b confirma" data-dip-acao="abrir-mapa">Voltar ao mapa</button> ' +
      '<button type="button" class="b branco" data-dip-acao="fechar">Fechar</button>';
  };

  /* ---------- Integracao com esqueleto existente ---------- */
  DIP.cardRelacoes = function () {
    // Entrada visivel no Poder sempre que houver jogo; encontros continuam gated por cargo.
    if (typeof gameState === "undefined" || !gameState) return "";
    var st = DIP.estado();
    var nAc = (st && st.acordos || []).filter(function (a) { return a.status === "ativo" || a.status === "suspenso"; }).length;
    return '<section class="card dip-entry"><h3>🌍 Relações Exteriores</h3>' +
      '<p class="txt">Mapa de instituições e ocupantes, agenda mensal, viagens com diálogo por arquétipo e acordos com qualidade. ' +
      "Agenda: <b>" + DIP.agendaDisponivel() + "/" + DIP.pontosAgendaMes() + "</b> · Acordos: <b>" + nAc + "</b>.</p>" +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="b confirma" data-a="dipAbrir">Abrir Itamaraty</button>' +
      '<button type="button" class="b branco mini" data-a="dipAgenda">Ver convites</button>' +
      "</div></section>";
  };

  function registrarA() {
    if (typeof A === "undefined") return false;
    A.dipAbrir = function () { DIP._cena = { fase: "mapa" }; DIP.abrirUI(); };
    A.dipAgenda = function () { DIP.estado(); DIP._cena = { fase: "mapa" }; DIP.abrirUI(); };
    A.dipViajar = function (instId) {
      DIP._cena = { fase: "briefing", instId: instId || "eua", modo: "viagem", pauta: "acordo_comercial", preparacao: 40, transparencia: "fechada", comitiva: [] };
      DIP.abrirUI();
    };
    return true;
  }

  function wrapCardPresidente() {
    if (typeof cardPresidente !== "function" || cardPresidente._dip) return false;
    var _orig = cardPresidente;
    cardPresidente = function () {
      return DIP.cardRelacoes() + _orig.apply(this, arguments);
    };
    cardPresidente._dip = true;
    return true;
  }

  function wrapViewsPoder() {
    if (typeof VIEWS === "undefined" || typeof VIEWS.poder !== "function" || VIEWS.poder._dipEntry) return false;
    var _vp = VIEWS.poder;
    VIEWS.poder = function () {
      var h = "";
      try {
        h = _vp.apply(this, arguments);
      } catch (e) {
        console.warn("DIP VIEWS.poder", e);
        h = '<section class="card"><h3>Poder</h3><p class="txt">Falha parcial ao montar a aba.</p></section>';
      }
      // Se cardPresidente nao rodou (nao-presidente), ainda assim mostra entrada
      try {
        if (h.indexOf("dip-entry") < 0) h = DIP.cardRelacoes() + h;
      } catch (e2) {}
      return h;
    };
    VIEWS.poder._dipEntry = true;
    if (_vp._legfPrep) VIEWS.poder._legfPrep = true;
    return true;
  }

  function wrapViagem() {
    if (typeof viagemOficial !== "function" || viagemOficial._dip) return false;
    var _v = viagemOficial;
    viagemOficial = function (k) {
      // mapeia BLOCOS antigos -> instituicao
      var map = { eua: "eua", china: "china", ue: "ue", latam: "argentina", brics: "india" };
      var instId = map[k] || "eua";
      if (DIP.cargoJogador() !== "PRES") { _toast("Só o Presidente faz viagens oficiais.", "err"); return; }
      DIP._cena = { fase: "briefing", instId: instId, modo: "viagem", pauta: (DIP.instPorId(instId).interesses || [])[0], preparacao: 45, transparencia: "fechada", comitiva: [] };
      DIP.abrirUI();
      // nao remove o esqueleto: se UI falhar, fallback
      if (!document.querySelector("[data-dip-modal]")) _v(k);
    };
    viagemOficial._dip = true;
    return true;
  }

  function wrapAvancar() {
    // hook ciclo mensal se existir processarCicloInfluencia pattern — wrap iniciarTurno or similar
    if (typeof window.__dipTickHooked) return;
    window.__dipTickHooked = true;
    var names = ["processarCicloInfluencia", "iniciarTurno", "avancarMes"];
    // also listen via A.avancar wrap
    if (typeof A !== "undefined" && A.avancar && !A.avancar._dip) {
      var _av = A.avancar;
      A.avancar = function () {
        var r = _av.apply(this, arguments);
        try { DIP.tickMensal(); } catch (e) { console.warn(e); }
        return r;
      };
      A.avancar._dip = true;
    }
  }

  function boot() {
    _injectCSS();
    registrarA();
    wrapCardPresidente();
    wrapViewsPoder();
    wrapViagem();
    wrapAvancar();
    try { DIP.estado(); } catch (e) {}
  }
  boot();
  var n = 0;
  var t = setInterval(function () {
    boot();
    n++;
    if (n > 40) clearInterval(t);
  }, 200);
  ["DOMContentLoaded", "load"].forEach(function (evt) {
    document.addEventListener(evt, boot);
  });

  // Expor diagnostico
  DIP.resumo = function () {
    return {
      versao: DIP.versao,
      instituicoes: DIP.INSTITUICOES.length,
      ocupantes: DIP.OCUPANTES.length,
      fase: DIP.fase
    };
  };
  window.dip = DIP;
  window.dipResumo = DIP.resumo;
})();
