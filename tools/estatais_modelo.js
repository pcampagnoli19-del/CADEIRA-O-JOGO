/* =============================================================================
   CADEIRA v3 — Estatais (federais, estaduais de SP e municipais de Mauá)
   - Nomes reais e logos (dados/estatais/*.webp, embutidas por gerar_estatais.py)
   - Abas Federais / Estaduais / Municipais; quem manda é o cargo da esfera
     (Presidente, Governador de SP, Prefeito de Mauá)
   - Privatizar, reestatizar (compra do controle em 24 parcelas) e criar nova
     estatal com a IA (ou com o modelo de texto, sem IA)
   Estado em M().v3est. As federais continuam no motor antigo (M().v24.est,
   dividendos e escândalos do Presidente): a lista federal é sincronizada lá.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3EST) return;
  var X = (window.V3EST = {});
  var LOGOS = __LOGOS__;
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function nf(v, d) { d = d == null ? 1 : d; return Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function D() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function mesAbs() { var d = D(); return d.ano * 12 + d.mes; }
  function cid() { return ok(function () { return cargoAtualId(); }, ""); }
  var CMD = { F: "PRES", E: "GOV", M: "PREF" };
  var NOME_ESF = { F: "Federais", E: "Estaduais (SP)", M: "Municipais (Mauá)" };
  var DONO = { F: "União", E: "Estado de SP", M: "Prefeitura" };
  var QUEM = { F: "o Presidente", E: "o Governador de SP", M: "o Prefeito de Mauá" };
  // [id, nome, setor, ícone, controle %, lucro base (R$ bi/mês), eficiência, risco, descrição, extras]
  var BASE = {
    F: [
      ["petrobras", "Petrobras", "Petróleo & Gás", "🛢️", 50.3, 9, 62, 42, "Maior empresa do país: pré-sal, refino e combustíveis."],
      ["bb", "Banco do Brasil", "Banco público", "🏦", 50, 2.6, 60, 35, "Crédito rural, Plano Safra e folha dos servidores."],
      ["caixa", "Caixa Econômica Federal", "Banco público", "🏦", 100, 1.1, 55, 45, "Habitação, FGTS, loterias e programas sociais."],
      ["bndes", "BNDES", "Banco de fomento", "🏗️", 100, 1.5, 62, 35, "Financia infraestrutura, indústria e exportação."],
      ["correios", "Correios", "Logística", "📦", 100, -0.35, 38, 55, "Presente em todos os municípios; prejuízo recorrente."],
      ["serpro", "Serpro", "Tecnologia", "💻", 100, 0.05, 60, 25, "TI do governo federal: Receita, CNH e bases de dados."],
      ["dataprev", "Dataprev", "Tecnologia", "🖥️", 100, 0.03, 58, 25, "Sistemas do INSS e da Previdência."],
      ["infra", "Infra S.A.", "Ferrovias e logística", "🚆", 100, -0.12, 44, 50, "Planeja e toca obras de ferrovias e rodovias."],
      ["embrapa", "Embrapa", "Pesquisa agropecuária", "🌱", 100, -0.3, 72, 18, "A pesquisa por trás do agro brasileiro. Depende do Tesouro."],
      ["eletronuclear", "Eletronuclear", "Energia nuclear", "⚛️", 100, -0.06, 45, 45, "Angra 1 e 2 e a eterna obra de Angra 3."],
      ["itaipu", "Itaipu Binacional", "Energia (com o Paraguai)", "⚡", 50, 0.2, 62, 40, "Hidrelétrica dividida meio a meio com o Paraguai."],
      ["ppsa", "PPSA (Pré-Sal Petróleo)", "Petróleo & Gás", "🛢️", 100, 0.3, 66, 20, "Vende a parte da União no óleo do pré-sal."],
      ["ebserh", "Ebserh", "Saúde", "🏥", 100, -0.6, 55, 35, "Administra os hospitais universitários federais."],
      ["casamoeda", "Casa da Moeda", "Indústria", "🪙", 100, 0.02, 50, 30, "Cédulas, moedas e passaportes."],
      ["telebras", "Telebras", "Telecomunicações", "📡", 90, -0.03, 40, 40, "Satélite geoestacionário e internet em escolas."],
      ["bnb", "Banco do Nordeste", "Banco de fomento", "🏦", 91, 0.2, 55, 45, "Crédito para o Nordeste e o norte de MG e ES."],
      ["basa", "Banco da Amazônia", "Banco de fomento", "🏦", 97, 0.08, 52, 45, "Crédito para a região Norte."],
      ["codevasf", "Codevasf", "Desenvolvimento regional", "🚜", 100, -0.25, 40, 72, "Irrigação e obras; vitrine das emendas parlamentares."],
      ["hemobras", "Hemobrás", "Saúde e biotecnologia", "🩸", 100, -0.05, 42, 40, "Remédios feitos a partir do plasma do sangue."],
      ["ebc", "EBC", "Comunicação pública", "📺", 100, -0.08, 45, 40, "TV Brasil, Agência Brasil e rádios públicas."],
      ["ceitec", "CEITEC", "Semicondutores", "🔬", 100, -0.02, 35, 35, "A fábrica de chips estatal que quase foi extinta em 2021."],
      ["axia", "Axia Energia (antiga Eletrobras)", "Eletricidade", "🔌", 40, 0.9, 64, 30, "Privatizada em 2022. A União tem cerca de 40% das ações, mas o voto é limitado a 10%.", { priv: 2022, reNome: "Eletrobras", reLogo: "eletrobras" }],
      ["vale", "Vale", "Mineração", "⛏️", 0, 2.5, 66, 30, "Privatizada em 1997. Gigante do minério de ferro.", { priv: 1997, reNome: "Vale (estatal)" }],
      ["embraer", "Embraer", "Aviação e defesa", "✈️", 0, 0.15, 70, 20, "Privatizada em 1994. A União mantém a golden share (veto em decisões estratégicas).", { priv: 1994 }]
    ],
    E: [
      ["metro", "Metrô de São Paulo", "Transporte sobre trilhos", "🚇", 97, -0.08, 60, 40, "Opera as linhas estatais do metrô da capital."],
      ["cptm", "CPTM", "Trens metropolitanos", "🚆", 100, -0.12, 48, 45, "Trens da Grande SP, inclusive a Linha 10 que passa por Mauá."],
      ["cdhu", "CDHU", "Habitação popular", "🏘️", 100, -0.05, 45, 50, "Constrói moradia popular no estado."],
      ["desenvolvesp", "Desenvolve SP", "Banco de fomento", "🏦", 100, 0.01, 55, 30, "Crédito para empresas e prefeituras paulistas."],
      ["prodesp", "Prodesp", "Tecnologia", "💻", 100, 0.01, 55, 25, "TI do governo de SP: Poupatempo e sistemas do estado."],
      ["sabesp", "Sabesp", "Saneamento", "💧", 18, 0.45, 65, 30, "Privatizada em 2024. O Estado ficou com 18% e uma ação especial (golden share).", { priv: 2024 }],
      ["emae", "EMAE", "Energia e represas", "🌊", 0, 0.02, 55, 30, "Privatizada em 2024. Cuida das represas Billings e Guarapiranga.", { priv: 2024 }]
    ],
    M: []
  };
  var ORGAOS = [
    ["bcb", "Banco Central do Brasil", "Autarquia com autonomia desde 2021: presidente com mandato fixo, não é demitido pelo Presidente da República."],
    ["abin", "ABIN", "Agência Brasileira de Inteligência, ligada à Casa Civil. Não é empresa: não dá lucro nem pode ser vendida."]
  ];
  var ANTIGO = { petro: "petrobras", bb: "bb", caixa: "caixa", ferro: "infra", tech: "serpro", eletro: "axia" };

  function novo(esf, r) {
    var x = r[9] || {};
    return { id: r[0], nome: r[1], setor: r[2], ic: r[3], ctrl: r[4], lb: r[5], efic: r[6], risco: r[7], pay: 45, desc: r[8], esf: esf, logo: LOGOS[r[0]] ? r[0] : null,
      status: x.priv ? "privatizada" : "ativa", priv: x.priv || null, reNome: x.reNome || null, reLogo: x.reLogo || null };
  }
  function st() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3est) {
      var l = [];
      ["F", "E", "M"].forEach(function (e) { BASE[e].forEach(function (r) { l.push(novo(e, r)); }); });
      // aproveita o estado do motor antigo (controle, eficiência, risco, payout)
      var old = m.v24 && m.v24.est;
      if (old && old.length) old.forEach(function (o) { var id = ANTIGO[o.id]; var e = id && l.find(function (y) { return y.id === id; }); if (e) { e.efic = o.efic; e.risco = o.risco; e.pay = o.pay; if (id !== "axia") e.ctrl = o.ctrl; } });
      m.v3est = { lista: l, tes: 0, mes: mesAbs(), ultCria: -99, aba: null, log: [] };
    }
    return m.v3est;
  }
  // as federais ficam no motor antigo (dividendos, escândalos e mercado do Presidente)
  function sync() {
    var s = st(), m = ok(function () { return M(); }, null); if (!s || !m) return;
    if (!m.v24) return;
    m.v24.est = s.lista.filter(function (e) { return e.esf === "F"; });
  }
  X.sync = sync; X.st = st;
  var lucro = function (e) { return e.lb * (0.4 + e.efic / 100 * 0.9); };
  var divid = function (e) { var l = lucro(e); return l < 0 ? l * e.ctrl / 100 : l * e.pay / 100 * e.ctrl / 100; };
  var ORC = { F: 400e6, E: 80e6, M: 6e6 }, REF = { F: 15e9, E: 3e9, M: 20e6 }, PISO = { F: 0.06, E: 0.02, M: 0.0005 }; // REF: gasto livre real de um mês
  function jogo(reaisBi, esf) { return reaisBi * 1e9 / REF[esf] * ORC[esf]; } // R$ bi reais -> moeda do orçamento do jogo
  var valor = function (e) { return jogo(Math.max(lucro(e), PISO[e.esf]) * 96, e.esf); }; // valor de mercado (8x o lucro anual)
  function manda(esf) { return cid() === CMD[esf]; }
  function orc() { return ok(function () { return orcamentoLivre() - M().gab.orcamento_gasto; }, 0); }
  function gasta(v) { ok(function () { M().gab.orcamento_gasto += v; }); ok(function () { UI.atualizarPainel(); }); }
  function money(v) { var a = Math.abs(v); return (v < 0 ? "−" : "") + "R$ " + (a >= 1e9 ? nf(a / 1e9, 2) + " bi" : a >= 1e6 ? nf(a / 1e6, 1) + " mi" : nf(a / 1e3, 0) + " mil"); }
  function bi(v) { var a = Math.abs(v); return (v < 0 ? "−" : "") + "R$ " + (a >= 1 ? nf(a, 2) + " bi" : nf(a * 1000, 0) + " mi"); }
  function noticia(tit, sec) {
    var f = ok(function () { return window.V3NEWS && V3NEWS.fato({ tit: tit, sec: sec || "Economia", jog: true, peso: 62 }); }, null);
    if (!f) ok(function () { manchete(tit, "governo"); });
  }
  function mercado(db, dd) { ok(function () { var x = M().mercado; x.bolsa = +(x.bolsa * (1 + db / 100)).toFixed(2); x.dolar = +(x.dolar + dd).toFixed(2); }); }
  function acha(id) { var s = st(); return s && s.lista.find(function (e) { return e.id === id; }); }
  X.logo = function (id) { var e = acha(id); var k = (e && e.logo) || id; return LOGOS[k] || null; };
  X.LOGOS = LOGOS;

  /* ---------------- ações */
  function dir(e, t) {
    if (!manda(e.esf) || e.ctrl < 50 || e.status !== "ativa") return;
    if (!ok(function () { return gastarEnergia(6); }, false)) return;
    if (t === "t") { e.efic = cl(e.efic + 5, 10, 98); e.risco = cl(e.risco - 8, 5, 95); ok(function () { toast(e.nome + ": diretoria técnica nomeada.", "ok"); }); }
    else { e.efic = cl(e.efic - 4, 10, 98); e.risco = cl(e.risco + 10, 5, 95); ok(function () { relPartido(1); }); ok(function () { toast(e.nome + ": diretoria loteada. O Centrão agradece.", "ok"); }); }
  }
  function payout(e, d) { if (!manda(e.esf) || e.status !== "ativa") return; e.pay = cl(e.pay + d, 0, 100); if (d > 0) e.efic = cl(e.efic - 1.5, 10, 98); }
  function acoes(e, d) {
    if (!manda(e.esf) || e.status !== "ativa") return;
    var n = cl(e.ctrl + d, 0, 100) - e.ctrl; if (!n) return;
    var v = valor(e) * Math.abs(n) / 100;
    if (n > 0) { if (orc() < v) { ok(function () { toast("Orçamento livre insuficiente para comprar ações (" + money(v) + ").", "err"); }); return; } gasta(v); e.efic = cl(e.efic - 1, 10, 98); }
    else { gasta(-v); e.efic = cl(e.efic + 3, 10, 98); ok(function () { mudarAprovTodos(-0.3); }); }
    e.ctrl = +(e.ctrl + n).toFixed(1);
    if (e.ctrl < 50) { e.status = "privatizada"; e.priv = D().ano; noticia(e.nome + " deixa de ser controlada pelo governo após venda de ações"); }
    ok(function () { toast(e.nome + ": " + DONO[e.esf] + " com " + nf(e.ctrl) + "%.", "ok"); });
  }
  function privatizar(e) {
    if (!manda(e.esf) || e.status !== "ativa" || e.ctrl < 50) return;
    if (!ok(function () { return gastarEnergia(15); }, false)) return;
    var fica = e.esf === "F" ? 20 : 15, rec = valor(e) * (e.ctrl - fica) / 100 * 1.1;
    gasta(-rec); e.ctrl = fica; e.status = "privatizada"; e.priv = D().ano; e.risco = cl(e.risco - 15, 5, 95); e.efic = cl(e.efic + 6, 10, 98);
    ok(function () { mudarAprovTodos(-0.9); }); mercado(2.5, -0.08);
    noticia("Governo privatiza " + e.nome + " e arrecada " + money(rec) + "; sindicatos prometem greve");
    ok(function () { toast(e.nome + " privatizada: " + money(rec) + " entram no caixa deste mês.", "ok"); });
  }
  function custoReest(e) { return valor(e) * Math.max(1, 51 - e.ctrl) / 100 * 1.3; }
  function reestatizar(e) {
    if (!manda(e.esf) || e.status !== "privatizada") return;
    var c = custoReest(e), parc = c / 24;
    if (orc() < parc) { ok(function () { toast("Falta orçamento até para a primeira parcela (" + money(parc) + "/mês).", "err"); }); return; }
    if (!ok(function () { return gastarEnergia(18); }, false)) return;
    gasta(parc); e.parc = { n: 23, v: parc, tipo: "Recompra do controle" };
    e.ctrl = 51; e.status = "ativa"; e.reest = D().ano; e.efic = cl(e.efic - 6, 10, 98); e.risco = cl(e.risco + 8, 5, 95);
    if (e.reNome) e.nome = e.reNome; if (e.reLogo && LOGOS[e.reLogo]) e.logo = e.reLogo;
    ok(function () { mudarAprovTodos(0.4); }); mercado(-3.5, 0.12);
    noticia("Governo reestatiza " + e.nome + ": compra do controle custará " + money(c) + " em 24 parcelas; mercado reage mal");
    ok(function () { toast(e.nome + " voltou ao controle " + ({ F: "da União", E: "do Estado", M: "da Prefeitura" })[e.esf] + ". Parcela: " + money(parc) + "/mês por 24 meses.", "ok"); });
  }

  /* ---------------- criação (IA ou modelo) */
  var MODELO = "Nome: Companhia Brasileira de Chips\nSetor: Semicondutores\nO que vai fazer: fabricar chips para carros e celulares\nSede: Campinas (SP)\nCapital inicial: R$ 2 bilhões\nPor que o Estado: reduzir a dependência de importação";
  var SCHEMA = { type: "object", properties: {
    nome: { type: "string" }, sigla: { type: "string" }, setor: { type: "string" }, emoji: { type: "string" }, descricao: { type: "string" },
    capital_reais: { type: "number" }, lucro_mensal_maduro_reais: { type: "number" }, meses_para_maturar: { type: "number" },
    eficiencia_inicial: { type: "number" }, risco_corrupcao: { type: "number" }, empregos: { type: "number" },
    viavel: { type: "boolean" }, motivo_inviavel: { type: "string" }, reacao_aprovacao: { type: "number" }, reacao_mercado: { type: "number" }, manchete: { type: "string" }
  }, required: ["nome", "setor", "descricao", "capital_reais", "lucro_mensal_maduro_reais", "meses_para_maturar", "eficiencia_inicial", "risco_corrupcao", "viavel", "manchete"] };
  function campo(t, k) { var m = new RegExp("^\\s*" + k + "\\s*:\\s*(.+)$", "im").exec(t); return m ? m[1].trim() : ""; }
  function reais(s) {
    s = String(s || "").toLowerCase(); var m = /([\d.,]+)\s*(tri|bi|mi|mil)?/.exec(s); if (!m) return 0;
    var n = parseFloat(m[1].replace(/\./g, "").replace(",", ".")) || 0; var u = m[2] || "";
    return n * (u === "tri" ? 1e12 : u === "bi" ? 1e9 : u === "mi" ? 1e6 : u === "mil" ? 1e3 : 1);
  }
  function offline(t, esf) {
    var nome = campo(t, "Nome") || (t.split("\n")[0] || "").slice(0, 60) || "Nova estatal", setor = campo(t, "Setor") || "Serviços públicos";
    var cap = reais(campo(t, "Capital inicial") || campo(t, "Capital")) || REF[esf] * 0.15;
    var dif = /chip|semicondutor|avi[aã]o|aero|sat[eé]lite|nuclear|f[aá]rmac|vacina/i.test(t) ? 1 : 0;
    return { nome: nome, sigla: "", setor: setor, emoji: "🏢", descricao: campo(t, "O que vai fazer") || t.slice(0, 160),
      capital_reais: cap, lucro_mensal_maduro_reais: cap * (dif ? 0.004 : 0.006) * (Math.random() * 1.2 + 0.2) - cap * 0.002, meses_para_maturar: dif ? 48 : 24,
      eficiencia_inicial: 40 + Math.random() * 15, risco_corrupcao: 35 + Math.random() * 25, empregos: Math.round(cap / (dif ? 2e6 : 8e5)), viavel: true,
      reacao_aprovacao: 0.4, reacao_mercado: -1, manchete: "Governo cria a estatal " + nome + " com capital de " + money(cap).replace("R$ ", "R$ ") };
  }
  function prompt(t, esf) {
    var ctx = ok(function () { return JSON.stringify(V3ATOS.contexto()); }, "{}");
    return "Você é o motor de um jogo de simulação política brasileira (realista, ano " + D().ano + "). O jogador, " + QUEM[esf] + ", quer criar uma nova empresa estatal " +
      (esf === "F" ? "federal" : esf === "E" ? "do Estado de São Paulo" : "do município de Mauá (SP, ~420 mil habitantes)") + ".\n" +
      "Pedido do jogador (pode seguir o modelo Nome/Setor/O que vai fazer/Sede/Capital inicial/Por que o Estado):\n\"\"\"" + t + "\"\"\"\n" +
      "Contexto do jogo: " + ctx + "\n" +
      "Avalie com realismo econômico, em valores REAIS de reais (R$): capital_reais (o aporte inicial necessário, coerente com a esfera; prefeitura de Mauá tem orçamento anual de ~R$ 1,5 bi, SP ~R$ 330 bi, União ~R$ 2,4 tri), " +
      "lucro_mensal_maduro_reais (pode ser NEGATIVO para empresa dependente do Tesouro), meses_para_maturar (6 a 72), eficiencia_inicial (10 a 80), risco_corrupcao (5 a 95), empregos diretos, " +
      "viavel=false só se for ilegal, absurdo ou fora da competência da esfera (então explique em motivo_inviavel), reacao_aprovacao (-3 a 3), reacao_mercado (-5 a 5, em % da bolsa), " +
      "nome (corrija/complete; sem usar marca de empresa privada existente), sigla, setor curto, emoji, descricao (1-2 frases) e manchete jornalística em português. Responda só o JSON.";
  }
  function criar(txt) {
    var s = st(), esf = (s && s.aba) || "F";
    if (!manda(esf)) return;
    if (!txt || txt.trim().length < 12) { ok(function () { toast("Descreva a estatal (use o modelo).", "err"); }); return; }
    if (s.ultCria === mesAbs()) { ok(function () { toast("Só dá para criar uma estatal por mês.", "err"); }); return; }
    if (s.criando) return;
    s.criando = { esf: esf, txt: txt }; s.erro = null; rr();
    var temIA = ok(function () { return V3ATOS.temIA(); }, false);
    var p = temIA ? V3ATOS.iaJSON(prompt(txt, esf), SCHEMA, 0.6).catch(function (e) { s.aviso = "IA indisponível (" + ((e && e.amigavel) || "erro") + "): usei o modelo offline."; return offline(txt, esf); }) : Promise.resolve(offline(txt, esf));
    p.then(function (j) { s.criando = null; s.proposta = normaliza(j, esf, txt); rr(); }, function () { s.criando = null; s.erro = "Não foi possível avaliar o pedido."; rr(); });
  }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function normaliza(j, esf, txt) {
    j = j || {}; var o = offline(txt, esf);
    var cap = Math.max(REF[esf] * 0.005, num(j.capital_reais, o.capital_reais));
    var custo = cl(cap / REF[esf] * ok(function () { return govCfg().orc; }, 1e8), 0, ok(function () { return govCfg().orc * 4; }, 4e8));
    return { esf: esf, nome: String(j.nome || o.nome).slice(0, 70), sigla: String(j.sigla || "").slice(0, 14), setor: String(j.setor || o.setor).slice(0, 40), ic: (String(j.emoji || "🏢").match(/\p{Extended_Pictographic}\uFE0F?/u) || ["🏢"])[0],
      desc: String(j.descricao || o.descricao).slice(0, 260), cap: cap, custo: custo, lbAlvo: num(j.lucro_mensal_maduro_reais, o.lucro_mensal_maduro_reais) / 1e9,
      mat: cl(Math.round(num(j.meses_para_maturar, 24)), 6, 72), efic: cl(num(j.eficiencia_inicial, 45), 10, 85), risco: cl(num(j.risco_corrupcao, 40), 5, 95), emp: Math.max(0, Math.round(num(j.empregos, 0))),
      viavel: j.viavel !== false, motivo: String(j.motivo_inviavel || ""), ap: cl(num(j.reacao_aprovacao, 0), -3, 3), mk: cl(num(j.reacao_mercado, 0), -5, 5),
      manchete: String(j.manchete || ("Nasce a estatal " + (j.nome || o.nome))).slice(0, 160), ia: j._ia || null };
  }
  function confirmar() {
    var s = st(), p = s && s.proposta; if (!p || !p.viavel || !manda(p.esf)) return;
    var parc = p.custo / 12;
    if (orc() < parc) { ok(function () { toast("Orçamento livre insuficiente para a 1ª parcela do aporte (" + money(parc) + ").", "err"); }); return; }
    if (!ok(function () { return gastarEnergia(20); }, false)) return;
    gasta(parc);
    var id = "nova_" + mesAbs() + "_" + Math.floor(Math.random() * 1e4);
    s.lista.push({ id: id, nome: p.nome + (p.sigla && p.nome.indexOf(p.sigla) < 0 ? " (" + p.sigla + ")" : ""), setor: p.setor, ic: p.ic, ctrl: 100, lb: -Math.abs(p.lbAlvo) * 0.3 - p.cap / 1e9 * 0.002,
      lbAlvo: p.lbAlvo, mat: p.mat, efic: p.efic, risco: p.risco, pay: 0, desc: p.desc, esf: p.esf, logo: null, status: "ativa", criada: D().ano, emp: p.emp, parc: { n: 11, v: parc, tipo: "Aporte de capital" } });
    s.ultCria = mesAbs(); s.proposta = null;
    ok(function () { mudarAprovTodos(p.ap); }); if (p.esf !== "M") mercado(p.mk, p.mk < 0 ? 0.03 : 0);
    if (p.emp && p.esf === "F") ok(function () { var mc = M().v24 && M().v24.mac; if (mc) mc.desemp = cl(mc.desemp - p.emp / 1e6 * 0.9, 3, 16); });
    noticia(p.manchete);
    ok(function () { toast(p.nome + " criada! Aporte: " + money(parc) + "/mês por 12 meses.", "ok"); });
  }

  /* ---------------- mês */
  function tick() {
    var s = st(); if (!s) return; var mm = mesAbs(); if (s.mes === mm) return; s.mes = mm; s.tes = 0;
    var c = cid();
    s.lista.forEach(function (e) {
      if (e.parc && e.parc.n > 0) { if (CMD[e.esf] === c) gasta(e.parc.v); e.parc.n--; if (e.parc.n <= 0) delete e.parc; }
      if (e.lbAlvo != null && e.mat > 0) { e.lb += (e.lbAlvo - e.lb) / e.mat; e.mat--; if (e.mat === 0) { e.lb = e.lbAlvo; if (e.pay === 0 && e.lbAlvo > 0) e.pay = 25; } }
      if (e.esf === "F") return; // federais: o motor antigo cuida (eficiência, risco, dividendos, escândalos)
      e.efic = cl(e.efic + (65 - e.risco / 3 - e.efic) * 0.05 + (Math.random() * 1.2 - 0.6) - (e.pay > 60 ? 0.25 : 0), 10, 98);
      e.risco = cl(e.risco + (Math.random() * 1.6 - 0.8) + (e.efic < 45 ? 0.3 : 0), 5, 95);
      if (CMD[e.esf] === c) {
        s.tes += jogo(divid(e), e.esf);
        if (e.ctrl >= 50 && Math.random() < e.risco / 100 * 0.03) { e.risco = cl(e.risco - 15, 5, 95); e.efic = cl(e.efic - 4, 10, 98); ok(function () { mudarAprovTodos(-0.5); }); noticia("Escândalo de loteamento político na " + e.nome + ": diretoria investigada", "Política"); }
      }
    });
  }

  /* ---------------- tela */
  function logoHtml(e) { var k = e.logo, src = k && LOGOS[k]; return '<div class="es-logo' + (src ? "" : " es-ic") + '">' + (src ? '<img alt="" src="' + src + '">' : esc_(e.ic || "🏢")) + "</div>"; }
  function bar(v, neg) { return '<span class="es-bar' + (neg ? " neg" : "") + '"><i style="width:' + cl(v, 0, 100) + '%"></i></span>'; }
  function b(txt, act, id, cls, dis) { return '<button type="button" class="b mini ' + (cls || "") + '" data-est="' + act + '" data-id="' + esc_(id) + '"' + (dis ? " disabled" : "") + ">" + txt + "</button>"; }
  function linha(e, pode) {
    var l = lucro(e), dv = divid(e);
    var tag = e.status === "privatizada" ? '<span class="es-tag priv">privatizada' + (e.priv ? " em " + e.priv : "") + "</span>" : e.criada ? '<span class="es-tag nova">criada em ' + e.criada + "</span>" : e.reest ? '<span class="es-tag re">reestatizada em ' + e.reest + "</span>" : "";
    var h = '<details class="es-item ' + e.status + '"><summary>' + logoHtml(e) + '<div class="es-nm"><b>' + esc_(e.nome) + "</b>" + tag + "<small>" + esc_(e.setor) + " · " + DONO[e.esf] + " " + nf(e.ctrl, e.ctrl % 1 ? 1 : 0) + "%</small></div>" +
      '<div class="es-num' + (l < 0 ? " neg" : "") + '"><b>' + bi(l) + "</b><small>" + (l < 0 ? "prejuízo/mês" : "lucro/mês") + "</small></div></summary>";
    h += '<div class="es-det"><p>' + esc_(e.desc || "") + "</p>";
    h += '<div class="es-kv"><span>' + (dv < 0 ? "Aporte do Tesouro" : "Dividendos ao governo") + "<b>" + bi(Math.abs(dv)) + "/mês</b></span><span>Payout<b>" + nf(e.pay, 0) + "%</b></span>" +
      (e.emp ? "<span>Empregos<b>" + nf(e.emp, 0) + "</b></span>" : "") + (e.lbAlvo != null && e.mat > 0 ? "<span>Maturação<b>" + e.mat + " meses</b></span>" : "") +
      (e.parc ? "<span>" + esc_(e.parc.tipo) + "<b>" + money(e.parc.v) + " × " + e.parc.n + "</b></span>" : "") + "</div>";
    h += '<div class="es-sc"><span>Eficiência</span>' + bar(e.efic) + "<b>" + Math.round(e.efic) + '</b></div><div class="es-sc"><span>Loteamento</span>' + bar(e.risco, 1) + "<b>" + Math.round(e.risco) + "</b></div>";
    if (pode) {
      if (e.status === "ativa") {
        h += '<div class="es-bts">' + b("Diretoria técnica", "dirT", e.id, "", e.ctrl < 50) + b("Lotear diretoria", "dirP", e.id, "corrige", e.ctrl < 50) + b("Payout +10", "pay+", e.id) + b("Payout −10", "pay-", e.id) +
          b("Comprar 2% das ações", "c+", e.id) + b("Vender 2%", "c-", e.id, "branco") + (e.ctrl >= 50 ? b("Privatizar", "priv", e.id, "branco") : "") + "</div>";
      } else {
        var c = custoReest(e);
        h += '<div class="es-re"><p>Reestatizar: comprar o controle (51%) por <b>' + money(c) + "</b> em 24 parcelas de <b>" + money(c / 24) + "</b>. O mercado reage mal; a esquerda e os sindicatos aplaudem.</p>" + b("Reestatizar", "reest", e.id, "confirma") + "</div>";
      }
    }
    return h + "</div></details>";
  }
  function criarHtml(s, esf) {
    var aberto = s.criando || (s.proposta && s.proposta.esf === esf) || s.erro || s.criarAberto;
    var h = '<details class="es-criar"' + (aberto ? " open" : "") + '><summary data-est="tgl">➕ Criar nova estatal</summary>';
    if (s.criando) return h + '<p class="es-esp">A equipe econômica está avaliando o projeto…</p></details>';
    var p = s.proposta;
    if (p && p.esf === esf) {
      h += '<div class="es-prop' + (p.viavel ? "" : " inv") + '"><div class="es-ph"><span class="es-ic2">' + esc_(p.ic) + "</span><div><b>" + esc_(p.nome) + (p.sigla ? " (" + esc_(p.sigla) + ")" : "") + "</b><small>" + esc_(p.setor) + "</small></div></div><p>" + esc_(p.desc) + "</p>";
      if (!p.viavel) h += '<p class="es-err">Projeto barrado: ' + esc_(p.motivo || "fora da competência ou inviável.") + "</p>";
      else h += '<div class="es-kv"><span>Capital (real)<b>R$ ' + (p.cap >= 1e9 ? nf(p.cap / 1e9, 2) + " bi" : nf(p.cap / 1e6, 1) + " mi") + "</b></span><span>Custo no orçamento<b>" + money(p.custo) + "</b></span><span>Parcela<b>" + money(p.custo / 12) + " × 12</b></span><span>Resultado maduro<b>" + bi(p.lbAlvo) + "/mês</b></span><span>Maturação<b>" + p.mat + " meses</b></span>" + (p.emp ? "<span>Empregos<b>" + nf(p.emp, 0) + "</b></span>" : "") + "</div>";
      h += "<small class='es-ia'>" + (p.ia ? "Avaliado por " + esc_(p.ia) : "Avaliação offline (sem IA)") + (s.aviso ? " · " + esc_(s.aviso) : "") + "</small>";
      h += '<div class="es-bts">' + (p.viavel ? '<button type="button" class="b confirma" data-est="ok">Criar a empresa (20 de energia)</button>' : "") + '<button type="button" class="b branco" data-est="desc">Descartar</button></div></div>';
      return h + "</details>";
    }
    if (s.erro) h += '<p class="es-err">' + esc_(s.erro) + "</p>";
    var ja = s.ultCria === mesAbs();
    h += '<p class="txt"><small>Descreva a empresa seguindo o modelo (pode apagar e escrever do seu jeito). ' + (ok(function () { return V3ATOS.temIA(); }, false) ? "A IA calcula custo, lucro, empregos e a reação." : "Sem IA configurada: o jogo estima pelos campos do modelo.") + " Uma por mês.</small></p>" +
      '<textarea id="es-txt" rows="6" placeholder="' + esc_(MODELO) + '"></textarea><div class="es-bts"><button type="button" class="b mini branco" data-est="modelo">Usar o modelo</button><button type="button" class="b confirma" data-est="criar"' + (ja ? " disabled" : "") + ">" + (ja ? "Já criou uma este mês" : "Avaliar projeto") + "</button></div>";
    return h + "</details>";
  }
  X.card = function () {
    var s = st(); if (!s) return ""; sync();
    var c = cid(), minha = c === "PRES" ? "F" : c === "GOV" ? "E" : c === "PREF" ? "M" : "F";
    var aba = s.aba || minha; s.aba = aba;
    var pode = manda(aba), L = s.lista.filter(function (e) { return e.esf === aba; });
    var at = L.filter(function (e) { return e.status === "ativa"; }), pv = L.filter(function (e) { return e.status !== "ativa"; });
    var tot = at.concat(pv).reduce(function (a, e) { return a + divid(e); }, 0);
    var h = '<section class="card v3-est"><h3>Empresas estatais</h3><div class="es-tabs">' + ["F", "E", "M"].map(function (k) {
      var n = s.lista.filter(function (e) { return e.esf === k && e.status === "ativa"; }).length;
      return '<button type="button" class="' + (k === aba ? "on" : "") + '" data-est="aba" data-id="' + k + '">' + NOME_ESF[k] + " <i>" + n + "</i></button>"; }).join("") + "</div>";
    h += '<p class="txt es-res">' + (tot < 0 ? "Aportes do Tesouro" : "Dividendos") + ": <b>" + bi(Math.abs(tot)) + "/mês</b> · " + at.length + " ativas · " + pv.length + " privatizadas. " +
      (pode ? "<span class='es-ok'>Você comanda estas empresas.</span>" : "<small>Só " + QUEM[aba] + " comanda estas empresas.</small>") + "</p>";
    if (!at.length && !pv.length) h += '<p class="txt es-vazio">' + (aba === "M" ? "Mauá não tem empresa municipal hoje. Como prefeito, você pode criar a primeira (ônibus, saneamento, habitação, tecnologia…)." : "Nenhuma empresa nesta esfera.") + "</p>";
    if (pode) h += criarHtml(s, aba);
    if (at.length) h += '<h4 class="es-h">Ativas</h4><div class="es-lista">' + at.map(function (e) { return linha(e, pode); }).join("") + "</div>";
    if (pv.length) h += '<h4 class="es-h">Privatizadas' + (pode ? " (dá para reestatizar)" : "") + '</h4><div class="es-lista">' + pv.map(function (e) { return linha(e, pode); }).join("") + "</div>";
    if (aba === "F") h += '<h4 class="es-h">Órgãos que não são empresas</h4><div class="es-org">' + ORGAOS.map(function (o) { return '<div>' + (LOGOS[o[0]] ? '<img alt="" src="' + LOGOS[o[0]] + '">' : "") + "<p><b>" + esc_(o[1]) + "</b><small>" + esc_(o[2]) + "</small></p></div>"; }).join("") + "</div>";
    return h + "</section>";
  };
  function rr() { ok(function () { render(); }); }
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest && ev.target.closest("[data-est]"); if (!t) return;
    ev.preventDefault(); ev.stopPropagation();
    var k = t.getAttribute("data-est"), id = t.getAttribute("data-id"), s = st(); if (!s) return;
    var e = id ? acha(id) : null;
    if (k === "tgl") { s.criarAberto = !t.parentElement.open; t.parentElement.open = s.criarAberto; return; }
    if (k === "aba") s.aba = id;
    else if (k === "dirT" && e) dir(e, "t"); else if (k === "dirP" && e) dir(e, "p");
    else if (k === "pay+" && e) payout(e, 10); else if (k === "pay-" && e) payout(e, -10);
    else if (k === "c+" && e) acoes(e, 2); else if (k === "c-" && e) acoes(e, -2);
    else if (k === "priv" && e) { if (window.confirm("Privatizar " + e.nome + "? O governo fica com uma fatia minoritária.")) privatizar(e); }
    else if (k === "reest" && e) reestatizar(e);
    else if (k === "modelo") { var ta = document.getElementById("es-txt"); if (ta) { ta.value = MODELO; ta.focus(); } return; }
    else if (k === "criar") { var tx = document.getElementById("es-txt"); criar(tx ? tx.value : ""); return; }
    else if (k === "ok") confirmar(); else if (k === "desc") { s.proposta = null; s.aviso = null; }
    // mantém aberto o item clicado
    var aberto = e ? e.id : null; rr();
    if (aberto) setTimeout(function () { var d = document.querySelector('.v3-est [data-id="' + aberto + '"]'); var det = d && d.closest("details"); if (det) det.open = true; }, 0);
  }, true);
  X.criarOffline = function (txt) { var s = st(); s.proposta = normaliza(offline(txt, s.aba || "F"), s.aba || "F", txt); };
  X.confirmar = confirmar; X.reestatizar = function (id) { var e = acha(id); if (e) reestatizar(e); }; X.privatizar = function (id) { var e = acha(id); if (e) privatizar(e); };
  X.tick = tick;

  function trocaAntigo() {
    var hs = document.querySelectorAll("section h3"); for (var i = 0; i < hs.length; i++) {
      var h = hs[i]; if (h.textContent !== "Empresas estatais" || h.closest(".v3-est")) continue;
      var sec = h.closest("section"); if (!sec) continue; var w = document.createElement("div"); w.innerHTML = X.card(); if (w.firstChild) sec.replaceWith(w.firstChild);
    }
  }
  X.trocaAntigo = trocaAntigo;
  function instalar() {
    window.cardEstatais = X.card;
    // atalho próprio no menu Poder
    try { if (typeof VIEWS !== "undefined" && !VIEWS.estatais) VIEWS.estatais = function () { return X.card(); }; } catch (e) {}
    try { var N = window.NAVH; if (N && N.HUBS && !N.__v3est) { var hp = N.HUBS.filter(function (x) { return x.id === "poder"; })[0]; if (hp) { N.__v3est = true; if (!hp.subs.some(function (x) { return x[0] === "estatais"; })) hp.subs.splice(Math.min(2, hp.subs.length), 0, ["estatais", "Estatais"]); } } } catch (e) {}
    try { if (!TABS.some(function (t) { return t[0] === "estatais"; })) TABS.push(["estatais", "Estatais"]); } catch (e) {}
    if (typeof window.render === "function" && !window.render.__v3est) {
      var orr = window.render;
      var nr = function () { var r = orr.apply(this, arguments); ok(trocaAntigo); return r; };
      for (var k0 in orr) { try { nr[k0] = orr[k0]; } catch (e0) {} }
      nr.__v3est = true; window.render = nr; try { render = nr; } catch (e1) {}
    }
    if (typeof window.iniciarTurno === "function" && !window.iniciarTurno.__v3est) {
      var o = window.iniciarTurno;
      var n = function () { ok(sync); var r = o.apply(this, arguments); ok(tick); return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3est = true; window.iniciarTurno = n; try { iniciarTurno = n; } catch (e2) {}
    }
    if (typeof window.orcamentoLivre === "function" && !window.orcamentoLivre.__v3est) {
      var ol = window.orcamentoLivre;
      var n2 = function () { var r = ol.apply(this, arguments); var c = cid(); if (c === "GOV" || c === "PREF") { var s = ok(st, null); if (s) r += Math.round(s.tes || 0); } return r; };
      n2.__v3est = true; window.orcamentoLivre = n2; try { orcamentoLivre = n2; } catch (e3) {}
    }
    ok(sync);
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 300); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
