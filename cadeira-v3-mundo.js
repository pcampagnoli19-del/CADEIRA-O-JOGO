/* =============================================================================
   CADEIRA v3 — Mundo: mapa interativo, ranking vivo, G7/G20, cúpulas,
   exigências a países mais fracos e notícias do exterior
   1. RANKING VIVO: PIB (US$) de ~34 países cresce mês a mês; o do Brasil vem
      da macroeconomia do jogo (PIB em R$ ÷ dólar). O Brasil pode subir até 1º.
   2. CLUBES: G7 e G20 seguem o ranking (entra quem fica entre os 7/20 maiores;
      o Brasil sai se cair para fora por 12 meses). BRICS e Mercosul são fixos.
   3. PODER RELATIVO: quanto maior o Brasil em relação ao outro país, mais ele
      cede na mesa (DIP3 usa forcaRel) e mais dá para EXIGIR (Itaipu, gás...).
      Vale também para quem foi ultrapassado pelo Brasil.
   4. CÚPULAS: Davos, G7, BRICS, Assembleia da ONU, COP, G20 e Mercosul, com
      sede e presidência rotativas; o Presidente vai, manda o chanceler ou falta.
   5. MAPA: a tela de Relações Exteriores vira um mapa-múndi clicável; clicar
      num país abre o painel e a preparação da reunião (formato, pauta,
      pública ou reservada).
   6. NOTÍCIAS DO EXTERIOR: aba própria na Mídia, manchetes no idioma do país
      com botão Traduzir; repercussão internacional da eleição para Presidente.
   Estado em M().v3mundo.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3MUNDO_API) return;
  var MU = (window.V3MUNDO_API = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function nf(v, d) { d = d == null ? 1 : d; return Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function D() { return ok(function () { return dt(); }, { ano: 2026, mes: 11 }); }
  function mesAbs() { var d = D(); return d.ano * 12 + d.mes; }
  function cid() { return ok(function () { return cargoAtualId(); }, ""); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function toast_(m, t) { ok(function () { toast(m, t || "ok"); }); }
  function fato(o) { var f = ok(function () { return window.V3NEWS && V3NEWS.fato(o); }, null); if (!f) ok(function () { manchete(o.tit, "diplomacia"); }); }
  var MES = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  /* ================================================================ 1) PAÍSES */
  // [chave, nome, bandeira, id geográfico (Natural Earth), PIB 2026 em US$ tri, crescimento nominal em US$ %/ano, idioma, id na diplomacia]
  var P0 = [
    ["eua", "Estados Unidos", "🇺🇸", "840", 31.0, 4.0, "en", "eua"], ["china", "China", "🇨🇳", "156", 20.0, 4.3, "zh", "china"],
    ["alemanha", "Alemanha", "🇩🇪", "276", 5.0, 2.6, "de", "alemanha"], ["india", "Índia", "🇮🇳", "356", 4.5, 9.5, "en", "india"],
    ["japao", "Japão", "🇯🇵", "392", 4.3, 1.6, "ja", "japao"], ["reino_unido", "Reino Unido", "🇬🇧", "826", 4.0, 3.0, "en", null],
    ["franca", "França", "🇫🇷", "250", 3.4, 2.6, "fr", "franca"], ["italia", "Itália", "🇮🇹", "380", 2.5, 2.2, "it", null],
    ["russia", "Rússia", "🇷🇺", "643", 2.3, 2.5, "ru", "russia"], ["canada", "Canadá", "🇨🇦", "124", 2.3, 3.2, "en", null],
    ["brasil", "Brasil", "🇧🇷", "076", 2.25, 0, "pt", null],
    ["coreia", "Coreia do Sul", "🇰🇷", "410", 1.95, 3.0, "en", null], ["australia", "Austrália", "🇦🇺", "036", 1.9, 3.5, "en", null],
    ["espanha", "Espanha", "🇪🇸", "724", 1.9, 3.6, "es", null], ["mexico", "México", "🇲🇽", "484", 1.9, 4.0, "es", "mexico"],
    ["indonesia", "Indonésia", "🇮🇩", "360", 1.5, 6.5, "en", null], ["turquia", "Turquia", "🇹🇷", "792", 1.5, 6.0, "tr", "turquia"],
    ["holanda", "Países Baixos", "🇳🇱", "528", 1.3, 3.0, "nl", null], ["arabia", "Arábia Saudita", "🇸🇦", "682", 1.1, 4.0, "ar", "arabia"],
    ["suica", "Suíça", "🇨🇭", "756", 1.0, 2.5, "de", null], ["polonia", "Polônia", "🇵🇱", "616", 1.0, 5.0, "en", null],
    ["argentina", "Argentina", "🇦🇷", "032", 0.68, 6.0, "es", "argentina"], ["africa_sul", "África do Sul", "🇿🇦", "710", 0.43, 4.0, "en", null],
    ["colombia", "Colômbia", "🇨🇴", "170", 0.43, 4.5, "es", "colombia"], ["ira", "Irã", "🇮🇷", "364", 0.4, 3.0, "en", null],
    ["chile", "Chile", "🇨🇱", "152", 0.36, 4.0, "es", "chile"], ["peru", "Peru", "🇵🇪", "604", 0.31, 4.5, "es", "peru"],
    ["equador", "Equador", "🇪🇨", "218", 0.13, 3.0, "es", "equador"], ["venezuela", "Venezuela", "🇻🇪", "862", 0.09, 4.0, "es", "venezuela"],
    ["uruguai", "Uruguai", "🇺🇾", "858", 0.085, 3.5, "es", "uruguai"], ["bolivia", "Bolívia", "🇧🇴", "068", 0.05, 2.0, "es", "bolivia"],
    ["paraguai", "Paraguai", "🇵🇾", "600", 0.046, 5.0, "es", "paraguai"], ["guiana", "Guiana", "🇬🇾", "328", 0.027, 16, "en", "guiana"],
    ["suriname", "Suriname", "🇸🇷", "740", 0.005, 4.0, "nl", "suriname"]
  ];
  var PAIS = {}; P0.forEach(function (r) { PAIS[r[0]] = { k: r[0], nome: r[1], flag: r[2], geo: r[3], pib0: r[4], g: r[5], lang: r[6], inst: r[7] }; });
  var POR_INST = {}; P0.forEach(function (r) { if (r[7]) POR_INST[r[7]] = r[0]; });
  var POR_GEO = {}; P0.forEach(function (r) { POR_GEO[r[3]] = r[0]; });
  var G7_0 = ["eua", "japao", "alemanha", "reino_unido", "franca", "italia", "canada"];
  var G20_0 = ["eua", "china", "alemanha", "india", "japao", "reino_unido", "franca", "italia", "russia", "canada", "brasil", "coreia", "australia", "mexico", "indonesia", "turquia", "arabia", "argentina", "africa_sul"];
  var BRICS = ["brasil", "russia", "india", "china", "africa_sul", "indonesia", "ira"];
  var MERCOSUL = ["brasil", "argentina", "paraguai", "uruguai", "bolivia"];

  function st() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3mundo) {
      var pib = {}; P0.forEach(function (r) { if (r[0] !== "brasil") pib[r[0]] = r[4]; });
      m.v3mundo = { pib: pib, mes: mesAbs(), rankBR: null, clubes: { g7: G7_0.slice(), g20: G20_0.slice() }, cont: {}, prest: 50, ev: {}, pend: null, exig: {}, news: [], seq: 0, feitosBR: {} };
    }
    var s = m.v3mundo; s.cont = s.cont || {}; s.exig = s.exig || {}; s.news = s.news || []; s.ev = s.ev || {};
    return s;
  }
  MU.st = st;
  function pibBR() {
    var dol = ok(function () { return M().mercado.dolar; }, 5.2) || 5.2;
    var mac = ok(function () { return M().v24.mac; }, null);
    return mac && mac.pib ? mac.pib / dol / 1e12 : 2.25;
  }
  function pibDe(k) { if (k === "brasil") return pibBR(); var s = st(); return (s && s.pib[k]) || (PAIS[k] && PAIS[k].pib0) || 0.01; }
  function ranking() {
    return P0.map(function (r) { return { k: r[0], pib: pibDe(r[0]) }; }).sort(function (a, b) { return b.pib - a.pib; }).map(function (x, i) { x.pos = i + 1; return x; });
  }
  MU.ranking = ranking;
  function posDe(k) { var r = ranking(); for (var i = 0; i < r.length; i++) if (r[i].k === k) return i + 1; return 99; }
  function membro(cl_, k) { var s = st(); if (cl_ === "brics") return BRICS.indexOf(k) >= 0; if (cl_ === "mercosul") return MERCOSUL.indexOf(k) >= 0; return !!(s && s.clubes[cl_] && s.clubes[cl_].indexOf(k) >= 0); }
  MU.membro = membro;
  // quanto o Brasil é maior que o outro (PIB): >1 Brasil maior
  MU.forcaRel = function (instId) { var k = POR_INST[instId]; if (!k) return null; return pibBR() / pibDe(k); };
  MU.ranks = function () {
    var r = ranking(), pos = posDe("brasil");
    var g20 = r.filter(function (x) { return membro("g20", x.k); }), g7 = r.filter(function (x) { return membro("g7", x.k) || x.k === "brasil"; }), br = r.filter(function (x) { return BRICS.indexOf(x.k) >= 0; });
    var ix = function (l) { for (var i = 0; i < l.length; i++) if (l[i].k === "brasil") return i + 1; return l.length + 1; };
    return { pib: pos, g20: ix(g20), nG20: g20.length + (membro("g20", "brasil") ? 0 : 1), g7: ix(g7), nG7: g7.length, brics: ix(br), nB: br.length };
  };
  function postura(f) {
    if (f == null) return null;
    if (f >= 8) return { t: "Deferente", d: "O Brasil é muito maior: eles evitam contrariar Brasília e cedem com facilidade.", c: "def" };
    if (f >= 2) return { t: "Cautelosa", d: "O Brasil pesa mais: tendem a ceder e a aceitar exigências razoáveis.", c: "cau" };
    if (f >= 0.6) return { t: "De igual para igual", d: "Economias de porte parecido: negociação equilibrada.", c: "igu" };
    if (f >= 0.2) return { t: "Altiva", d: "Economia maior que a nossa: cedem pouco.", c: "alt" };
    return { t: "Potência acima", d: "Peso muito maior que o do Brasil: quem precisa ceder somos nós.", c: "pot" };
  }
  MU.postura = postura;

  /* ================================================================ 2) TICK MENSAL */
  function tick() {
    var s = st(); if (!s) return; var mm = mesAbs(); if (s.mes === mm) return; var pulou = mm - s.mes; s.mes = mm;
    if (pulou <= 0 || pulou > 24) pulou = 1;
    var antes = s.rankBR || posDe("brasil");
    Object.keys(s.pib).forEach(function (k) {
      var p = PAIS[k]; if (!p) return;
      var g = p.g; if (k === "guiana") g = Math.max(4, 16 - (D().ano - 2026) * 2.5);
      s.pib[k] *= Math.pow(1 + (g + (Math.random() * 3 - 1.5)) / 100, pulou / 12);
    });
    var pos = posDe("brasil"); s.rankBR = pos;
    if (pos !== antes) mudouRank(antes, pos);
    clubes(s);
    cupulas(s);
    filler(s);
    if (s.news.length > 160) s.news.length = 160;
  }
  MU.tick = tick;
  function mudouRank(antes, pos) {
    var r = ranking(), sub = pos < antes;
    var outro = sub ? r[pos] : r[pos - 2]; // quem foi ultrapassado / quem passou o Brasil
    if (!outro) return;
    var p = PAIS[outro.k];
    var tit = sub ? "Brasil ultrapassa " + p.nome + " e vira a " + pos + "ª maior economia do mundo" : p.nome + " passa o Brasil, que cai para " + pos + "º no ranking das economias";
    fato({ tipo: "economia", sec: "Economia", kick: "Ranking mundial", tit: tit, lead: "PIB brasileiro estimado em US$ " + nf(pibBR(), 2) + " trilhões, contra US$ " + nf(outro.pib, 2) + " tri " + (p.nome.match(/^[AEIOU]/) ? "da " : "de ") + p.nome + ".", peso: 70, jog: cid() === "PRES" });
    noticiaExt(outro.k, sub ? "rank_perde" : "rank_ganha", { pos: pos });
    if (sub && p.inst) ok(function () { var rel = DIP.relacao(p.inst); rel.institucional = cl(rel.institucional + 3, 0, 100); });
    if (sub && pos === 1) fato({ tipo: "economia", sec: "Economia", kick: "Histórico", tit: "O Brasil é a maior economia do planeta", lead: "Pela primeira vez, o PIB brasileiro supera o dos Estados Unidos e o da China. Chancelarias do mundo inteiro recalculam a relação com Brasília.", peso: 95, jog: true });
  }
  // G7/G20 pelo ranking. Brasil: entra se ficar 6 meses entre os maiores; sai se ficar 12 meses fora.
  function clubes(s) {
    var r = ranking();
    [["g7", 7, G7_0], ["g20", 20, G20_0]].forEach(function (c) {
      var nomeC = c[0] === "g7" ? "G7" : "G20", lim = c[1];
      r.forEach(function (x) {
        var dentro = x.pos <= lim, m = s.clubes[c[0]].indexOf(x.k) >= 0, key = c[0] + "|" + x.k;
        if (x.k !== "brasil") return; // os demais membros são fixos; quem sobe e desce de clube é o Brasil
        var sair = !dentro;
        if (!m && dentro) { s.cont[key] = (s.cont[key] || 0) + 1; if (s.cont[key] >= 6) { s.clubes[c[0]].push(x.k); s.cont[key] = 0; entrouClube(x.k, nomeC); } }
        else if (m && sair) { s.cont[key] = (s.cont[key] || 0) + 1; if (s.cont[key] >= 12) { s.clubes[c[0]].splice(s.clubes[c[0]].indexOf(x.k), 1); s.cont[key] = 0; saiuClube(x.k, nomeC, x.pos); } }
        else s.cont[key] = 0;
      });
    });
  }
  function entrouClube(k, c) {
    var p = PAIS[k];
    if (k === "brasil") {
      fato({ tipo: "diplomacia", sec: "Mundo", kick: c, tit: "Brasil é admitido no " + c + " e passa a sentar à mesa das " + (c === "G7" ? "maiores economias do Ocidente" : "20 maiores economias"), lead: "A entrada coroa a escalada do PIB brasileiro, hoje o " + posDe("brasil") + "º do mundo.", peso: 90, jog: true });
      ok(function () { mudarAprovTodos(1.5); });
      noticiaExt("eua", "clube_br", { c: c });
    } else fato({ tipo: "diplomacia", sec: "Mundo", kick: c, tit: p.nome + " entra no " + c + " após subir no ranking das economias", lead: "", peso: 45 });
  }
  function saiuClube(k, c, pos) {
    var p = PAIS[k];
    if (k === "brasil") {
      fato({ tipo: "diplomacia", sec: "Mundo", kick: c, tit: "Brasil perde a cadeira no " + c + " depois de um ano fora das " + (c === "G7" ? "7" : "20") + " maiores economias", lead: "O país é hoje o " + pos + "º PIB do mundo. A oposição fala em vexame internacional.", peso: 90, jog: cid() === "PRES" });
      ok(function () { mudarAprovTodos(-1.5); });
      noticiaExt("eua", "clube_br_sai", { c: c });
    } else fato({ tipo: "diplomacia", sec: "Mundo", kick: c, tit: p.nome + " deixa o " + c + " após anos fora do topo do ranking", lead: "", peso: 40 });
  }

  /* ================================================================ 3) CÚPULAS */
  var G7_ROT = ["franca", "eua", "reino_unido", "alemanha", "japao", "italia", "canada"]; // 2026 = França (Évian)
  var CID = { franca: "Évian", eua: "Washington", reino_unido: "Londres", alemanha: "Berlim", japao: "Hiroshima", italia: "Roma", canada: "Kananaskis", brasil: "Rio de Janeiro", india: "Nova Délhi", china: "Pequim", africa_sul: "Joanesburgo", russia: "Kazan", coreia: "Seul", australia: "Sydney", arabia: "Riad", turquia: "Istambul", indonesia: "Jacarta", mexico: "Cidade do México", argentina: "Buenos Aires", paraguai: "Assunção", uruguai: "Montevidéu" };
  var BRICS_ROT = ["brasil", "india", "china", "africa_sul", "russia"]; // 2025 Brasil, 2026 Índia...
  var MERC_ROT = ["paraguai", "uruguai", "argentina", "brasil"]; // 2026-1 Paraguai, 2026-2 Uruguai...
  var COP = { 2026: ["COP31", "Antália (Turquia)", "turquia"], 2027: ["COP32", "Adis Abeba (Etiópia)", null] };
  function sedeG20(ano) { if (ano === 2026) return ["eua", "Miami"]; var l = st() ? st().clubes.g20.filter(function (k) { return k !== "eua"; }) : G20_0; var k = l[(ano - 2027) % l.length]; return [k, CID[k] || PAIS[k].nome]; }
  function eventosDoMes(ano, mes) {
    var L = [];
    if (mes === 1) L.push({ id: "davos", nome: "Fórum Econômico Mundial", ic: "🏔️", local: "Davos (Suíça)", tipo: "forum", conv: true });
    if (mes === 6) { var h = G7_ROT[(ano - 2026) % G7_ROT.length]; if (membro("g7", "brasil") && (ano - 2026) % (G7_ROT.length + 1) === G7_ROT.length) h = "brasil"; L.push({ id: "g7", nome: "Cúpula do G7", ic: "🏛️", local: CID[h] + " (" + PAIS[h].nome + ")", host: h, tipo: "clube", conv: membro("g7", "brasil") ? true : "convidado" }); }
    if (mes === 7) { var m1 = MERC_ROT[((ano - 2026) * 2) % 4]; L.push({ id: "merc", nome: "Cúpula do Mercosul", ic: "🤝", local: CID[m1] + " (" + PAIS[m1].nome + ")", host: m1, tipo: "regional", conv: true }); }
    if (mes === 12) { var m2 = MERC_ROT[((ano - 2026) * 2 + 1) % 4]; L.push({ id: "merc", nome: "Cúpula do Mercosul", ic: "🤝", local: CID[m2] + " (" + PAIS[m2].nome + ")", host: m2, tipo: "regional", conv: true }); }
    if (mes === 8) { var b = BRICS_ROT[(ano - 2025) % 5]; L.push({ id: "brics", nome: "Cúpula do BRICS", ic: "🌏", local: CID[b] + " (" + PAIS[b].nome + ")", host: b, tipo: "clube", conv: true }); }
    if (mes === 9) L.push({ id: "onu", nome: "Assembleia Geral da ONU", ic: "🇺🇳", local: "Nova York", tipo: "onu", conv: true, nota: "Por tradição, o Brasil abre o debate geral." });
    if (mes === 11) { var c = COP[ano] || ["COP" + (ano - 1995), "sede a definir pela ONU", null]; L.push({ id: "cop", nome: c[0] + " — Conferência do Clima", ic: "🌱", local: c[1], tipo: "clima", conv: true }); }
    if (mes === (ano === 2026 ? 12 : 11)) { var g = sedeG20(ano); L.push({ id: "g20", nome: "Cúpula do G20", ic: "🌐", local: g[1] + " (" + PAIS[g[0]].nome + ")", host: g[0], tipo: "clube", conv: membro("g20", "brasil") ? true : "convidado" }); }
    return L;
  }
  MU.eventosDoMes = eventosDoMes;
  function proximos(n) {
    var d = D(), out = [];
    for (var i = 0; i < 14 && out.length < n; i++) { var mes = (d.mes - 1 + i) % 12 + 1, ano = d.ano + Math.floor((d.mes - 1 + i) / 12); eventosDoMes(ano, mes).forEach(function (e) { e.ano = ano; e.mes = mes; out.push(e); }); }
    return out.slice(0, n);
  }
  MU.proximos = proximos;
  function cupulas(s) {
    var d = D(), evs = eventosDoMes(d.ano, d.mes), m0 = mesAbs();
    while (s.pend && s.pend.m !== m0) { if (s.ev[s.pend.key] === "aberto") s.ev[s.pend.key] = "chanceler"; s.pend = (s.fila || []).shift() || null; }
    evs.forEach(function (e) {
      var key = e.id + d.ano + "-" + d.mes; if (s.ev[key]) return; s.ev[key] = "aberto";
      var convidado = e.conv === true || (e.conv === "convidado" && (posDe("brasil") <= 12 || s.prest >= 60) && Math.random() < 0.7);
      noticiaExt(e.host || "eua", "cupula", { ev: e });
      if (cid() === "PRES" && convidado) { s.fila = s.fila || []; s.fila.push({ key: key, ev: e, convidado: e.conv === "convidado", m: mesAbs() }); if (!s.pend) s.pend = s.fila.shift(); toast_(e.ic + " " + e.nome + " em " + e.local + ": o Brasil está convidado. Abra Relações Exteriores.", "ok"); ok(function () { manchete(e.nome + " em " + e.local + " neste mês; Planalto decide a participação.", "diplomacia"); }); }
      else if (!convidado) { s.ev[key] = "sem_convite"; if (cid() === "PRES") fato({ tipo: "diplomacia", sec: "Mundo", kick: e.nome, tit: "Sem convite: Brasil fica de fora da " + e.nome + " em " + e.local, lead: "Fora do clube, o país depende de convite do anfitrião.", peso: 55, jog: true }); }
      else s.ev[key] = "npc";
    });
    // convite não respondido no mês: vai o chanceler
    var mm = mesAbs();
    while (s.pend && s.pend.m !== mm) { if (s.ev[s.pend.key] === "aberto") s.ev[s.pend.key] = "chanceler"; s.pend = (s.fila || []).shift() || null; }
  }
  var LINHAS = {
    clima: [["Amazônia e dinheiro do Norte", "Cobra os países ricos pelo fundo de florestas", { pop: 0.8, eixo: { ocidente: -2, sul_global: 4 }, prest: 4 }], ["Metas ambiciosas do Brasil", "Anuncia corte de emissões e desmatamento zero", { pop: 0.5, eixo: { ocidente: 4 }, prest: 5 }], ["Desenvolvimento antes da meta", "Defende petróleo e agro como direito dos emergentes", { pop: 0.2, eixo: { ocidente: -4, golfo: 3 }, prest: -2 }]],
    clube: [["Reforma da governança global", "ONU, FMI e Banco Mundial com mais voz do Sul", { pop: 0.4, eixo: { sul_global: 4, ocidente: -1 }, prest: 3 }], ["Comércio e investimentos", "Vende o Brasil como destino de capital", { pop: 0.5, eixo: { ocidente: 3, china: 2 }, prest: 3, dolar: -0.03 }], ["Combate à fome e desigualdade", "Propõe aliança global contra a fome", { pop: 0.7, eixo: { sul_global: 3 }, prest: 4 }], ["Soberania e críticas ao Norte", "Discurso duro contra sanções e tarifas", { pop: 0.6, eixo: { ocidente: -5, china: 3 }, prest: -1 }]],
    regional: [["Integração e livre comércio", "Acelera o acordo Mercosul-UE e corta tarifas", { pop: 0.3, eixo: { latam: 4, ocidente: 2 }, prest: 3 }], ["Liderança brasileira na região", "O Brasil puxa a agenda e cobra os vizinhos", { pop: 0.5, eixo: { latam: -2 }, prest: 4 }], ["Segurança na fronteira", "Pacto contra o crime organizado", { pop: 0.6, eixo: { latam: 3 }, prest: 2 }]],
    onu: [["Paz e multilateralismo", "Defende cessar-fogos e a reforma do Conselho de Segurança", { pop: 0.5, eixo: { sul_global: 3, ocidente: 1 }, prest: 4 }], ["Clima e Amazônia", "Abre a Assembleia falando da floresta", { pop: 0.6, eixo: { ocidente: 3 }, prest: 3 }], ["Ataque aos ricos", "Denuncia a desigualdade entre nações", { pop: 0.7, eixo: { ocidente: -4, sul_global: 4 }, prest: 0 }]],
    forum: [["Brasil aberto a negócios", "Agenda com CEOs e fundos", { pop: 0.3, dolar: -0.05, bolsa: 2, prest: 3 }], ["Transição energética", "Hidrogênio verde e minerais críticos", { pop: 0.3, eixo: { ocidente: 3 }, prest: 3 }], ["Crítica ao mercado financeiro", "Discurso contra a especulação", { pop: 0.5, dolar: 0.05, bolsa: -2, prest: -2 }]]
  };
  function participantes(e) {
    var ids = e.id === "g7" ? st().clubes.g7 : e.id === "g20" ? st().clubes.g20 : e.id === "brics" ? BRICS : e.id === "merc" ? MERCOSUL : ["eua", "china", "franca", "alemanha", "india", "japao", "argentina", "mexico"];
    return ids.filter(function (k) { return k !== "brasil" && PAIS[k] && PAIS[k].inst; }).map(function (k) { return PAIS[k].inst; });
  }
  function htmlCupula() {
    var s = st(), p = s && s.pend; if (!p) return "";
    var e = p.ev, L = LINHAS[e.tipo] || LINHAS.clube, sel = p.linha == null ? -1 : p.linha, bil = p.bil || null;
    var h = '<div class="mu-cup"><div class="mu-cup-h"><span class="mu-cup-ic">' + e.ic + "</span><div><b>" + esc_(e.nome) + "</b><small>" + esc_(e.local) + " · " + MES[D().mes] + (p.convidado ? " · Brasil como convidado" : "") + "</small></div></div>";
    if (e.nota) h += '<p class="mu-nota">' + esc_(e.nota) + "</p>";
    h += "<h4>Linha do discurso</h4><div class='mu-ops'>" + L.map(function (l, i) { return '<button type="button" class="mu-op' + (sel === i ? " on" : "") + '" data-mu="linha" data-i="' + i + '"><b>' + esc_(l[0]) + "</b><small>" + esc_(l[1]) + "</small></button>"; }).join("") + "</div>";
    var parts = participantes(e).slice(0, 10);
    h += "<h4>Encontro bilateral à margem (opcional)</h4><div class='mu-bil'>" + parts.map(function (id) { var oc = ok(function () { return DIP.ocupAtual(id); }, null); var inst = DIP.instPorId(id); return '<button type="button" class="' + (bil === id ? "on" : "") + '" data-mu="bil" data-id="' + id + '">' + ok(function () { return DIP.silhuetaHtml(oc, 30); }, "") + "<span>" + esc_(oc ? oc.nome : inst.nome) + "<small>" + esc_(inst.nome) + "</small></span></button>"; }).join("") + "</div>";
    h += '<div class="mu-bts"><button type="button" class="b confirma" data-mu="ir"' + (sel < 0 ? " disabled" : "") + ">Ir à cúpula (−1 agenda)</button><button type=\"button\" class=\"b branco\" data-mu=\"chanceler\">Mandar o chanceler</button></div></div>";
    return h;
  }
  function irCupula() {
    var s = st(), p = s && s.pend; if (!p || p.linha == null) return;
    if (!ok(function () { return DIP.gastarAgenda(1); }, true)) { toast_("Sem agenda internacional neste mês.", "err"); return; }
    var e = p.ev, l = (LINHAS[e.tipo] || LINHAS.clube)[p.linha], fx = l[2];
    ok(function () { mudarAprovTodos(fx.pop || 0); });
    if (fx.eixo) ok(function () { var d = DIP.estado(); Object.keys(fx.eixo).forEach(function (ex) { DIP.INSTITUICOES.forEach(function (inst) { if (inst.eixo === ex) { var r = DIP.relacao(inst.id); r.institucional = cl(r.institucional + fx.eixo[ex], 0, 100); } }); }); });
    if (fx.dolar) ok(function () { M().mercado.dolar = +(M().mercado.dolar + fx.dolar).toFixed(2); });
    if (fx.bolsa) ok(function () { M().mercado.bolsa = +(M().mercado.bolsa * (1 + fx.bolsa / 100)).toFixed(2); });
    s.prest = cl(s.prest + (fx.prest || 0), 0, 100);
    var bt = "";
    if (p.bil) ok(function () { var r = DIP.relacao(p.bil); r.pessoal = cl(r.pessoal + 6, 0, 100); r.conhecimento = cl((r.conhecimento || 0) + 8, 0, 100); bt = " e se reúne com " + DIP.ocupAtual(p.bil).nome; });
    var nome = ok(function () { return J().nome; }, "Presidente");
    fato({ tipo: "diplomacia", sec: "Mundo", kick: e.nome, tit: nome + " discursa na " + e.nome + " em " + e.local.replace(/ \(.*\)$/, "") + bt, lead: l[0] + ": " + l[1] + ".", peso: 66, jog: true });
    noticiaExt(e.host || (p.bil && POR_INST[p.bil]) || "eua", "cupula_br", { ev: e, linha: l[0] });
    s.ev[p.key] = "foi"; s.pend = (s.fila || []).shift() || null;
    toast_("Participação registrada: prestígio internacional " + Math.round(s.prest) + ".", "ok");
  }

  /* ================================================================ 4) EXIGÊNCIAS */
  var EXIGE = {
    paraguai: [["itaipu", "Rever a tarifa de Itaipu a favor do Brasil", "Conta de luz mais barata no Brasil", { pop: 1.2, orc: 0.04 }]],
    bolivia: [["gas", "Baixar o preço do gás natural vendido ao Brasil", "Gás mais barato para a indústria", { pop: 0.6, cresc: 0.05 }]],
    guiana: [["petro", "Prioridade a empresas brasileiras no petróleo", "Contratos para a Petrobras e fornecedores", { pop: 0.4, orc: 0.02 }]],
    venezuela: [["divida", "Pagar a dívida com o BNDES", "Volta de dinheiro ao Tesouro", { orc: 0.05, pop: 0.5 }]],
    argentina: [["auto", "Derrubar barreiras a carros brasileiros", "Exportação de automóveis", { cresc: 0.04, pop: 0.3 }]],
    _: [["mercado", "Abrir o mercado para produtos brasileiros", "Mais exportações", { cresc: 0.03, pop: 0.3 }], ["onu", "Votar com o Brasil na ONU", "Apoio à vaga no Conselho de Segurança", { prest: 4, pop: 0.2 }], ["fronteira", "Endurecer contra o crime na fronteira", "Operações conjuntas contra facções", { pop: 0.6 }]]
  };
  function exigencias(instId) { var k = POR_INST[instId]; return (EXIGE[k] || []).concat(EXIGE._); }
  function podeExigir(instId) { var f = MU.forcaRel(instId); return cid() === "PRES" && f != null && f >= 3; }
  MU.podeExigir = podeExigir;
  function exigir(instId, eid) {
    var s = st(), f = MU.forcaRel(instId); if (!podeExigir(instId)) return;
    var mm = mesAbs(); if (s.exig[instId] && mm - s.exig[instId] < 6) { toast_("Você já pressionou este país há pouco. Espere alguns meses.", "err"); return; }
    if (!ok(function () { return DIP.gastarAgenda(1); }, true)) { toast_("Sem agenda internacional neste mês.", "err"); return; }
    var ex = exigencias(instId).filter(function (x) { return x[0] === eid; })[0]; if (!ex) return;
    var rel = DIP.relacao(instId), oc = DIP.ocupAtual(instId), inst = DIP.instPorId(instId), arq = oc && oc.tracos || {};
    var p = cl(0.2 + 0.12 * Math.log(f) / Math.LN2 + (rel.pessoal - 50) / 150 - (rel.rancor || 0) / 200 - ((arq.rancor || 50) - 50) / 300, 0.08, 0.92);
    var aceitou = Math.random() < p, fx = ex[3];
    s.exig[instId] = mm;
    rel.rancor = cl((rel.rancor || 0) + (aceitou ? 6 : 14), 0, 100); rel.pessoal = cl(rel.pessoal - (aceitou ? 4 : 10), 0, 100);
    if (aceitou) {
      ok(function () { mudarAprovTodos(fx.pop || 0); });
      if (fx.orc) ok(function () { M().gab.orcamento_gasto -= Math.round(orcamentoLivre() * fx.orc); });
      if (fx.cresc) ok(function () { M().v24.mac.cresc += fx.cresc; });
      if (fx.prest) s.prest = cl(s.prest + fx.prest, 0, 100);
    } else ok(function () { mudarAprovTodos(-0.3); });
    // os vizinhos notam
    ok(function () { DIP.INSTITUICOES.forEach(function (i2) { if (i2.eixo === "latam" && i2.id !== instId) { var r2 = DIP.relacao(i2.id); r2.institucional = cl(r2.institucional - 2, 0, 100); } }); });
    var nm = ok(function () { return J().nome; }, "O Presidente");
    fato({ tipo: "diplomacia", sec: "Mundo", kick: "Pressão", tit: aceitou ? inst.nome + " cede à pressão do Brasil: " + ex[1].charAt(0).toLowerCase() + ex[1].slice(1) : inst.nome + " rejeita exigência do Brasil e " + oc.nome + " fala em soberania", lead: nm + " exigiu: " + ex[1].toLowerCase() + ". " + (aceitou ? "Ganho: " + ex[2].toLowerCase() + "." : "A relação esfriou."), peso: 70, jog: true });
    noticiaExt(POR_INST[instId], aceitou ? "exige_ok" : "exige_nao", { lider: oc.nome, ex: ex[1] });
    MU._ultExig = { instId: instId, aceitou: aceitou, ex: ex, p: p };
    toast_(aceitou ? inst.nome + " aceitou." : inst.nome + " recusou. Rancor em alta.", aceitou ? "ok" : "err");
  }

  /* ================================================================ 5) NOTÍCIAS DO EXTERIOR */
  var VEIC = { en: { eua: "The New York Times", reino_unido: "The Guardian", india: "The Times of India", guiana: "Stabroek News", _: "Reuters" }, es: { argentina: "Clarín", mexico: "El Universal", colombia: "El Tiempo", chile: "El Mercurio", peru: "El Comercio", equador: "El Universo", venezuela: "El Nacional", uruguai: "El País (Uruguai)", bolivia: "La Razón", paraguai: "ABC Color", _: "El País" }, fr: { _: "Le Monde" }, de: { _: "Der Spiegel" }, it: { _: "Corriere della Sera" }, zh: { _: "新华社 (Xinhua)" }, ru: { _: "ТАСС (TASS)" }, ja: { _: "日本経済新聞 (Nikkei)" }, ar: { _: "الشرق الأوسط (Asharq Al-Awsat)" }, tr: { _: "Hürriyet" }, nl: { _: "De Ware Tijd" } };
  var BR = { en: "Brazil", es: "Brasil", fr: "le Brésil", de: "Brasilien", it: "il Brasile", zh: "巴西", ru: "Бразилия", ja: "ブラジル", ar: "البرازيل", tr: "Brezilya", nl: "Brazilië" };
  var BRB = { en: "Brazil", es: "Brasil", fr: "Brésil", de: "Brasilien", it: "Brasile", zh: "巴西", ru: "Бразилии", ja: "ブラジル", ar: "البرازيل", tr: "Brezilya", nl: "Brazilië" };
  var NOMEL = { // nome do próprio país no idioma do jornal
    eua: "the U.S.", reino_unido: "the U.K.", india: "India", guiana: "Guyana", canada: "Canada", australia: "Australia", coreia: "South Korea", indonesia: "Indonesia", polonia: "Poland", africa_sul: "South Africa", ira: "Iran",
    argentina: "Argentina", mexico: "México", colombia: "Colombia", chile: "Chile", peru: "Perú", equador: "Ecuador", venezuela: "Venezuela", uruguai: "Uruguay", bolivia: "Bolivia", paraguai: "Paraguay", espanha: "España",
    franca: "France", alemanha: "Deutschland", suica: "Schweiz", italia: "Italia", china: "中国", russia: "Россия", japao: "日本", arabia: "السعودية", turquia: "Türkiye", holanda: "Nederland", suriname: "Suriname" };
  // modelos: [título, linha fina] no idioma; {L} líder, {N} número, {P} país, {B} Brasil, {X} extra
  var T = {
    eleicao: { en: ["{L} wins {P} election with {N}%", "Results confirm a new term at the helm; Brasília is watching closely."], es: ["{L} gana las elecciones en {P} con el {N}%", "El resultado define el rumbo del país; Brasilia sigue de cerca."], fr: ["{L} remporte l'élection en {P} avec {N} %", "Le résultat redessine la politique du pays."], de: ["{L} gewinnt die Wahl in {P} mit {N} Prozent", "Das Ergebnis verändert die politische Landschaft."], it: ["{L} vince le elezioni in {P} con il {N}%", "Il risultato ridisegna la politica del paese."], zh: ["{L}以{N}%的得票率赢得{P}选举", "选举结果将影响该国未来走向。"], ru: ["{L} побеждает на выборах ({P}) с {N}%", "Итоги голосования меняют политический курс."], ja: ["{L}氏が{P}の選挙で勝利、得票率{N}%", "結果は国の針路を左右する。"], ar: ["{L} يفوز في انتخابات {P} بنسبة {N}%", "النتيجة ترسم مسار البلاد في المرحلة المقبلة."], tr: ["{L}, {P}'deki seçimi %{N} oyla kazandı", "Sonuç ülkenin rotasını belirleyecek."], nl: ["{L} wint verkiezingen in {P} met {N} procent", "De uitslag bepaalt de koers van het land."],
      pt: ["{P}: {L} vence a eleição com {N}%", "O resultado define o rumo do país; Brasília acompanha de perto."] },
    posse: { en: ["{L} sworn in as leader of {P}", "The new government promises a fresh start with Latin America."], es: ["{L} asume el poder en {P}", "El nuevo gobierno promete una nueva etapa con la región."], fr: ["{L} prend ses fonctions en {P}", "Le nouveau gouvernement promet un nouveau départ."], de: ["{L} tritt Amt in {P} an", "Die neue Regierung verspricht einen Neuanfang."], it: ["{L} si insedia in {P}", "Il nuovo governo promette una nuova fase."], zh: ["{L}宣誓就任{P}领导人", "新政府承诺开启新阶段。"], ru: ["{L} вступает в должность ({P})", "Новое правительство обещает перемены."], ja: ["{L}氏が{P}の指導者に就任", "新政権は新たな出発を約束。"], ar: ["{L} يؤدي اليمين قائدا لـ{P}", "الحكومة الجديدة تعد ببداية جديدة."], tr: ["{L}, {P}'de göreve başladı", "Yeni hükümet yeni bir dönem vaat ediyor."], nl: ["{L} beëdigd als leider van {P}", "De nieuwe regering belooft een frisse start."],
      pt: ["{P}: {L} toma posse e assume o governo", "O novo governo promete uma nova fase, inclusive com a América Latina."] },
    saida: { en: ["{L} steps down in {P}; {X} takes over", "A sudden transition shakes the country's politics."], es: ["{L} deja el poder en {P}; asume {X}", "Una transición repentina sacude la política del país."], fr: ["{L} quitte le pouvoir en {P} ; {X} lui succède", "Une transition soudaine secoue le pays."], de: ["{L} tritt in {P} zurück, {X} übernimmt", "Ein plötzlicher Wechsel erschüttert das Land."], it: ["{L} lascia il potere in {P}; subentra {X}", "Una transizione improvvisa scuote il paese."], zh: ["{L}卸任{P}领导人，{X}接任", "突然的权力交接震动政坛。"], ru: ["{L} покидает пост ({P}); власть переходит к {X}", "Внезапная смена власти потрясла страну."], ja: ["{L}氏が{P}の指導者を退任、{X}氏が後任に", "突然の政権交代に国内が揺れる。"], ar: ["{L} يتنحى في {P} و{X} يتولى السلطة", "انتقال مفاجئ يهز المشهد السياسي."], tr: ["{L}, {P}'de görevi bıraktı; yerine {X} geçti", "Ani geçiş ülke siyasetini sarstı."], nl: ["{L} treedt af in {P}; {X} neemt over", "Een plotselinge machtswissel schudt het land op."],
      pt: ["{P}: {L} deixa o poder e {X} assume", "Uma transição repentina sacode a política do país."] },
    campanha: { en: ["{P} heads to the polls: {X} in the race", "Polls show a tight contest."], es: ["{P} va a las urnas: {X} en la disputa", "Las encuestas muestran una carrera reñida."], fr: ["{P} aux urnes : {X} en lice", "Les sondages annoncent une course serrée."], de: ["{P} vor der Wahl: {X} im Rennen", "Umfragen zeigen ein enges Rennen."], it: ["{P} al voto: in corsa {X}", "I sondaggi indicano una corsa serrata."], zh: ["{P}大选临近：{X}角逐", "民调显示竞争激烈。"], ru: ["{P} готовится к выборам: {X}", "Опросы показывают напряжённую борьбу."], ja: ["{P}で選挙戦：{X}が立候補", "世論調査は接戦を示す。"], ar: ["{P} تتجه إلى صناديق الاقتراع: {X} في السباق", "استطلاعات الرأي تظهر سباقا متقاربا."], tr: ["{P} sandığa gidiyor: {X} yarışta", "Anketler çekişmeli bir yarış gösteriyor."], nl: ["{P} naar de stembus: {X} in de race", "Peilingen tonen een nek-aan-nekrace."],
      pt: ["{P} vai às urnas: {X} na disputa", "As pesquisas mostram uma corrida apertada."] },
    rank_perde: { en: ["{B} overtakes {P} as the world's No. {N} economy", "Brazil's rise reshapes the global economic ranking."], es: ["{B} supera a {P} y se convierte en la {N}.ª economía del mundo", "El ascenso brasileño redibuja el ranking mundial."], fr: ["{B} dépasse la {P} et devient la {N}e économie mondiale", "L'ascension brésilienne redessine le classement."], de: ["{B} überholt {P} und wird zur Nummer {N} der Weltwirtschaft", "Brasiliens Aufstieg verändert die globale Rangliste."], it: ["{B} supera l'{P} e diventa la {N}ª economia mondiale", "L'ascesa brasiliana ridisegna la classifica."], zh: ["{B}超越{P}，成为全球第{N}大经济体", "巴西崛起改写全球经济排名。"], ru: ["{B} обогнала страну ({P}) и стала {N}-й экономикой мира", "Подъём Бразилии меняет мировой рейтинг."], ja: ["{B}が{P}を抜き世界{N}位の経済大国に", "ブラジルの台頭が世界順位を塗り替える。"], ar: ["{B} تتجاوز {P} وتصبح الاقتصاد رقم {N} عالميا", "صعود البرازيل يعيد رسم الترتيب العالمي."], tr: ["{B}, {P}'yi geçerek dünyanın {N}. büyük ekonomisi oldu", "Brezilya'nın yükselişi sıralamayı değiştiriyor."], nl: ["{B} haalt {P} in en is nu de {N}e economie ter wereld", "De opmars van Brazilië hertekent de ranglijst."],
      pt: ["Brasil supera {P} e vira a {N}ª economia do mundo", "A ascensão brasileira redesenha o ranking mundial."] },
    rank_ganha: { en: ["{P} overtakes {B} in global GDP ranking", "Brazil slips to No. {N}."], es: ["{P} supera a {B} en el ranking mundial del PIB", "Brasil cae al puesto {N}."], fr: ["La {P} dépasse le {B} au classement mondial", "Le Brésil recule à la {N}e place."], de: ["{P} überholt {B} im globalen BIP-Ranking", "Brasilien fällt auf Platz {N}."], it: ["L'{P} supera il {B} nella classifica del PIL", "Il Brasile scende al {N}° posto."], zh: ["{P}在全球GDP排名中超越{B}", "巴西降至第{N}位。"], ru: ["{P} обогнала {B} по ВВП", "Бразилия опустилась на {N}-е место."], ja: ["{P}がGDPで{B}を上回る", "ブラジルは{N}位に後退。"], ar: ["{P} تتجاوز {B} في ترتيب الناتج المحلي", "البرازيل تتراجع إلى المركز {N}."], tr: ["{P}, GSYH sıralamasında {B}'yı geçti", "Brezilya {N}. sıraya geriledi."], nl: ["{P} haalt {B} in op de bbp-ranglijst", "Brazilië zakt naar plek {N}."],
      pt: ["{P} supera o Brasil no ranking do PIB", "O Brasil cai para o {N}º lugar."] },
    cupula: { en: ["Leaders gather for the {X}", "Trade, climate and wars top the agenda."], es: ["Líderes se reúnen en la {X}", "Comercio, clima y guerras dominan la agenda."], fr: ["Les dirigeants se réunissent pour le {X}", "Commerce, climat et guerres au menu."], de: ["Staats- und Regierungschefs treffen sich zum {X}", "Handel, Klima und Kriege auf der Agenda."], it: ["I leader si riuniscono per il {X}", "Commercio, clima e guerre in agenda."], zh: ["各国领导人齐聚{X}", "贸易、气候与冲突成为焦点。"], ru: ["Лидеры собираются на {X}", "В повестке торговля, климат и войны."], ja: ["首脳らが{X}に集結", "貿易・気候・紛争が主要議題。"], ar: ["القادة يجتمعون في {X}", "التجارة والمناخ والحروب على رأس الأجندة."], tr: ["Liderler {X} için bir araya geliyor", "Ticaret, iklim ve savaşlar gündemde."], nl: ["Leiders komen bijeen voor de {X}", "Handel, klimaat en oorlogen op de agenda."],
      pt: ["Líderes se reúnem na {X}", "Comércio, clima e guerras dominam a pauta."] },
    cupula_br: { en: ["Brazil's president takes the stage at the {X}", "Brasília pushes its agenda: {Y}."], es: ["El presidente de Brasil toma la palabra en la {X}", "Brasilia empuja su agenda: {Y}."], fr: ["Le président brésilien s'exprime au {X}", "Brasília pousse son agenda : {Y}."], de: ["Brasiliens Präsident spricht beim {X}", "Brasília wirbt für seine Agenda: {Y}."], it: ["Il presidente brasiliano interviene al {X}", "Brasília spinge la sua agenda: {Y}."], zh: ["巴西总统在{X}上发表讲话", "巴西推动其议程：{Y}。"], ru: ["Президент Бразилии выступил на {X}", "Бразилиа продвигает повестку: {Y}."], ja: ["ブラジル大統領が{X}で演説", "ブラジルは議題を推進：{Y}。"], ar: ["رئيس البرازيل يلقي كلمة في {X}", "برازيليا تدفع بأجندتها: {Y}."], tr: ["Brezilya devlet başkanı {X}'de konuştu", "Brasília gündemini öne çıkarıyor: {Y}."], nl: ["Braziliaanse president spreekt op de {X}", "Brasília zet zijn agenda door: {Y}."],
      pt: ["Presidente do Brasil discursa na {X}", "Brasília empurra sua agenda: {Y}."] },
    encontro_ok: { en: ["{P} and {B} seal deal after talks with {L}", "The agreement covers {Y}."], es: ["{P} y {B} cierran acuerdo tras reunión con {L}", "El pacto abarca {Y}."], fr: ["{P} et {B} concluent un accord après une rencontre avec {L}", "L'accord porte sur {Y}."], de: ["{P} und {B} einigen sich nach Treffen mit {L}", "Die Vereinbarung betrifft {Y}."], it: ["{P} e {B} firmano un accordo dopo l'incontro con {L}", "L'intesa riguarda {Y}."], zh: ["{P}与{B}达成协议，{L}出席会谈", "协议涉及{Y}。"], ru: ["{P} и {B} заключили соглашение после встречи с {L}", "Соглашение касается: {Y}."], ja: ["{P}と{B}が合意、{L}氏と会談", "合意は{Y}に関するもの。"], ar: ["{P} و{B} يبرمان اتفاقا بعد لقاء مع {L}", "يشمل الاتفاق {Y}."], tr: ["{P} ve {B}, {L} ile görüşmenin ardından anlaştı", "Anlaşma {Y} konusunu kapsıyor."], nl: ["{P} en {B} sluiten akkoord na overleg met {L}", "Het akkoord gaat over {Y}."],
      pt: ["{P} e Brasil fecham acordo após conversa com {L}", "O pacto trata de {Y}."] },
    encontro_nao: { en: ["Talks between {L} and Brazil end without a deal", "Officials describe the meeting as tense."], es: ["Reunión entre {L} y Brasil termina sin acuerdo", "Fuentes describen un encuentro tenso."], fr: ["La rencontre entre {L} et le Brésil s'achève sans accord", "Des sources évoquent une réunion tendue."], de: ["Treffen zwischen {L} und Brasilien endet ohne Einigung", "Diplomaten sprechen von angespannter Stimmung."], it: ["L'incontro tra {L} e il Brasile si chiude senza accordo", "Fonti parlano di un clima teso."], zh: ["{L}与巴西会谈未达成协议", "消息人士称会谈气氛紧张。"], ru: ["Переговоры {L} с Бразилией завершились без соглашения", "Источники говорят о напряжённой встрече."], ja: ["{L}氏とブラジルの会談、合意に至らず", "関係者は緊迫した雰囲気だったと語る。"], ar: ["محادثات {L} مع البرازيل تنتهي دون اتفاق", "مصادر تصف اللقاء بالمتوتر."], tr: ["{L} ile Brezilya arasındaki görüşme anlaşmasız bitti", "Kaynaklar gergin bir toplantıdan söz ediyor."], nl: ["Overleg tussen {L} en Brazilië eindigt zonder akkoord", "Bronnen spreken van een gespannen ontmoeting."],
      pt: ["Conversa entre {L} e o Brasil termina sem acordo", "Fontes descrevem um encontro tenso."] },
    exige_ok: { en: ["{L} yields to Brazilian pressure", "Brasília demanded: {Y}."], es: ["{L} cede ante la presión de Brasil", "Brasilia exigió: {Y}."], nl: ["{L} zwicht voor Braziliaanse druk", "Brasília eiste: {Y}."], pt: ["{L} cede à pressão brasileira", "Brasília exigiu: {Y}."] },
    exige_nao: { en: ["{L} rejects Brazil's demands: 'We are a sovereign nation'", "Brasília had demanded: {Y}."], es: ["{L} rechaza las exigencias de Brasil: «Somos un país soberano»", "Brasilia había exigido: {Y}."], nl: ["{L} wijst Braziliaanse eisen af: 'Wij zijn soeverein'", "Brasília eiste: {Y}."], pt: ["{L} rejeita as exigências do Brasil: \"Somos um país soberano\"", "Brasília havia exigido: {Y}."] },
    clube_br: { en: ["Brazil joins the {X} as its economy climbs", "Diplomats call it a historic shift in global power."], pt: ["Brasil entra no {X} com a escalada da economia", "Diplomatas falam em virada histórica no poder global."] },
    clube_br_sai: { en: ["Brazil loses its seat at the {X}", "A year outside the top economies costs Brasília its place."], pt: ["Brasil perde a cadeira no {X}", "Um ano fora das maiores economias custou o lugar."] },
    eleicao_br: { en: ["{L} wins Brazil's presidential election", "{Y}"], es: ["{L} gana las elecciones presidenciales en Brasil", "{Y}"], fr: ["{L} remporte la présidentielle au Brésil", "{Y}"], de: ["{L} gewinnt Präsidentschaftswahl in Brasilien", "{Y}"], it: ["{L} vince le presidenziali in Brasile", "{Y}"], zh: ["{L}赢得巴西总统选举", "{Y}"], ru: ["{L} побеждает на президентских выборах в Бразилии", "{Y}"], ja: ["ブラジル大統領選で{L}氏が勝利", "{Y}"], ar: ["{L} يفوز بالانتخابات الرئاسية في البرازيل", "{Y}"], tr: ["Brezilya'da devlet başkanlığı seçimini {L} kazandı", "{Y}"], nl: ["{L} wint presidentsverkiezingen in Brazilië", "{Y}"],
      pt: ["{L} vence a eleição presidencial no Brasil", "{Y}"] },
    filler: { en: ["{P} and {X} sign trade and technology pact", "The deal includes semiconductors and critical minerals."], es: ["{P} anuncia plan contra la inflación y recorta gastos", "La oposición critica el ajuste."], fr: ["Grève nationale contre la réforme des retraites en {P}", "Les syndicats promettent de nouvelles mobilisations."], de: ["{P}: Regierung beschließt Milliardenpaket für Industrie", "Die Opposition kritisiert neue Schulden."], it: ["{P}, il governo approva la manovra tra le proteste", "Sindacati in piazza in diverse città."], zh: ["{P}发布新一轮稳增长政策", "重点支持高端制造业与消费。"], ru: ["{P} объявляет о новых соглашениях со странами БРИКС", "Москва ищет новые рынки сбыта."], ja: ["{P}政府、大型経済対策を閣議決定", "半導体と防衛に重点配分。"], ar: ["{P} تعلن عن استثمارات ضخمة في الطاقة المتجددة", "الخطة جزء من رؤية التنويع الاقتصادي."], tr: ["{P}'de merkez bankası faizi değiştirdi", "Piyasalar karara tepki verdi."], nl: ["{P} sluit nieuwe olie-overeenkomst", "De regering verwacht miljarden aan inkomsten."] },
    filler_pt: { en: ["assina pacto de comércio e tecnologia com o {X}", "O acordo inclui semicondutores e minerais críticos."], es: ["governo anuncia plano contra a inflação e corta gastos", "A oposição critica o ajuste."], fr: ["greve nacional contra a reforma da previdência", "Sindicatos prometem novas mobilizações."], de: ["governo aprova pacote bilionário para a indústria", "A oposição critica o novo endividamento."], it: ["governo aprova o orçamento sob protestos", "Sindicatos vão às ruas em várias cidades."], zh: ["governo lança nova rodada de estímulos ao crescimento", "Foco em indústria avançada e consumo."], ru: ["governo anuncia novos acordos com países do BRICS", "Moscou busca novos mercados."], ja: ["governo aprova grande pacote econômico", "Prioridade a semicondutores e defesa."], ar: ["governo anuncia investimentos bilionários em energia renovável", "O plano faz parte da diversificação econômica."], tr: ["banco central muda a taxa de juros", "Os mercados reagem à decisão."], nl: ["governo fecha novo contrato de petróleo", "O governo espera bilhões em receita."] }
  };
  var XP = { en: "China", es: "Estados Unidos", fr: "l'Inde", de: "", it: "", zh: "", ru: "", ja: "", ar: "", tr: "", nl: "" };
  var EVN = {
    onu: { en: "UN General Assembly", es: "Asamblea General de la ONU", fr: "Assemblée générale de l'ONU", de: "UN-Generalversammlung", it: "Assemblea generale dell'ONU", zh: "联合国大会", ru: "Генеральную Ассамблею ООН", ja: "国連総会", ar: "الجمعية العامة للأمم المتحدة", tr: "BM Genel Kurulu", nl: "VN-Algemene Vergadering" },
    davos: { en: "World Economic Forum in Davos", es: "Foro Económico Mundial de Davos", fr: "Forum économique mondial de Davos", de: "Weltwirtschaftsforum in Davos", it: "Forum economico mondiale di Davos", zh: "达沃斯世界经济论坛", ru: "Всемирный экономический форум в Давосе", ja: "ダボス会議", ar: "منتدى دافوس الاقتصادي", tr: "Davos Dünya Ekonomik Forumu", nl: "World Economic Forum in Davos" }
  };
  var CUMBRE = { en: "{b} summit", es: "cumbre del {b}", fr: "sommet du {b}", de: "{b}-Gipfel", it: "vertice del {b}", zh: "{b}峰会", ru: "саммит {b}", ja: "{b}首脳会議", ar: "قمة {b}", tr: "{b} zirvesi", nl: "{b}-top" };
  function evNome(ev, lang) {
    if (!ev) return "";
    if (EVN[ev.id]) return EVN[ev.id][lang] || EVN[ev.id].en;
    var b = ev.id === "g7" ? "G7" : ev.id === "g20" ? "G20" : ev.id === "brics" ? "BRICS" : ev.id === "merc" ? (lang === "es" || lang === "en" || lang === "fr" || lang === "it" ? "Mercosur" : "Mercosul") : ev.id === "cop" ? ev.nome.split(" ")[0] : ev.nome;
    if (ev.id === "cop") return lang === "en" ? b + " climate summit" : (CUMBRE[lang] || CUMBRE.en).replace("{b}", b);
    return (CUMBRE[lang] || CUMBRE.en).replace("{b}", b);
  }
  function preenche(s, v) { return String(s).replace(/\{(\w)\}/g, function (_, k) { return v[k] != null ? v[k] : ""; }); }
  function noticiaExt(pk, tipo, o) {
    var s = st(); if (!s || !PAIS[pk]) return null;
    var p = PAIS[pk], lang = p.lang === "pt" ? "en" : p.lang, md = T[tipo]; if (!md) return null;
    if (!md[lang]) lang = md.en ? "en" : "es";
    o = o || {};
    var ev = o.ev, v = { L: o.lider || o.nome || "", N: o.pct != null ? String(o.pct).replace(".", lang === "en" ? "." : ",") : o.pos || "", P: NOMEL[pk] || p.nome, B: BRB[lang] || "Brazil", X: o.x || (ev ? evNome(ev, lang) : "") || o.c || "", Y: o.y || o.linha || o.ex || "" };
    var vp = { L: v.L, N: o.pct != null ? String(o.pct).replace(".", ",") : o.pos || "", P: p.nome, B: "Brasil", X: o.xPt || (ev ? ev.nome : v.X), Y: o.yPt || v.Y };
    if (tipo === "rank_perde") v.N = o.pos;
    var nat = md[lang], pt = md.pt || ["", ""];
    var n = { id: "X" + (++s.seq), pk: pk, lang: lang, veic: (VEIC[lang] || {})[pk] || (VEIC[lang] || {})._ || "Reuters", t: preenche(nat[0], v).replace(/^the /, "The "), l: preenche(nat[1], v), tPt: preenche(pt[0], vp), lPt: preenche(pt[1], vp), ano: D().ano, mes: D().mes, tipo: tipo };
    if (o.tPt) n.tPt = o.tPt; if (o.lPt) n.lPt = o.lPt;
    if (s.news.slice(0, 8).some(function (x) { return x.t === n.t; })) return null;
    s.news.unshift(n);
    return n;
  }
  MU.noticiaExt = noticiaExt;
  function filler(s) {
    if (Math.random() < 0.55) {
      var ks = ["franca", "alemanha", "italia", "china", "russia", "japao", "arabia", "turquia", "argentina", "mexico", "eua", "holanda", "chile", "colombia"], k = rnd(ks), p = PAIS[k];
      var lang = p.lang, md = T.filler[lang] ? lang : "en", mpt = T.filler_pt[md];
      var x = md === "en" ? "Japan" : "";
      var tt = preenche(T.filler[md][0], { P: NOMEL[k] || p.nome, X: x });
      if (s.news.slice(0, 12).some(function (n) { return n.t === tt; })) return;
      s.news.unshift({ id: "X" + (++s.seq), pk: k, lang: md, veic: (VEIC[md] || {})[k] || (VEIC[md] || {})._ || "Reuters", t: preenche(T.filler[md][0], { P: NOMEL[k] || p.nome, X: x }), l: T.filler[md][1], tPt: p.nome + ": " + preenche(mpt[0], { X: "Japão" }), lPt: mpt[1], ano: D().ano, mes: D().mes, tipo: "filler" });
    }
  }
  // eventos vindos da diplomacia (eleições, posses, encontros)
  function onEvt(o) {
    var pk = POR_INST[o.inst]; if (!pk) return;
    if (o.t === "eleicao" && o.regra !== "partido" && o.regra !== "controle") noticiaExt(pk, "eleicao", { lider: o.nome, pct: o.pct });
    else if (o.t === "posse") noticiaExt(pk, "posse", { lider: o.nome });
    else if (o.t === "saida") noticiaExt(pk, "saida", { lider: o.nome, x: o.novo, xPt: o.novo });
    else if (o.t === "campanha") noticiaExt(pk, "campanha", { x: (o.cands || []).join(", "), xPt: (o.cands || []).join(", ") });
    else if (o.t === "encontro" && !o.gov) {
      var pub = o.transp === "aberta";
      if (o.res !== "falhou") noticiaExt(pk, "encontro_ok", { lider: o.lider, y: String(o.txt || "").toLowerCase(), yPt: String(o.txt || "").toLowerCase() });
      else if (pub || Math.random() < 0.5) noticiaExt(pk, "encontro_nao", { lider: o.lider });
      if (pub) { // reunião pública: mais repercussão, para o bem e para o mal
        var d = o.res === "assinado" ? 1 : o.res === "parcial" ? 0.3 : -0.8;
        ok(function () { mudarAprovTodos(d); });
        fato({ tipo: "diplomacia", sec: "Mundo", kick: "Coletiva", tit: (o.res === "falhou" ? "Diante das câmeras, encontro com " + o.lider + " expõe atrito com o Brasil" : "Em coletiva ao lado de " + o.lider + ", Presidente comemora acordo"), lead: "A reunião foi aberta à imprensa: o resultado repercutiu nos jornais daqui e de lá.", peso: 64, jog: true });
      }
    }
  }
  MU.onEvt = onEvt;
  // repercussão da eleição presidencial brasileira (só Presidente)
  function repercussao(venc) {
    var s = st(); if (!s || !venc) return; var d = D(), key = "pres" + d.ano; if (s.feitosBR[key]) return; s.feitosBR[key] = 1;
    var nome = venc.jogador ? ok(function () { return J().nome; }, "") : venc.npc ? venc.npc.nome : venc.nome;
    var partido = venc.jogador ? ok(function () { return J().partido_atual; }, "") : (venc.npc && venc.npc.partido) || "";
    var lado = ok(function () { return (PARTIDOS[partido] || {}).e; }, "C") || "C";
    var pct = venc.share != null ? Math.round(venc.share * 10) / 10 : null;
    var reac = [], quem = ["eua", "china", "argentina", "franca", "alemanha", "russia", "india", "venezuela", "chile", "paraguai", "uruguai", "colombia"];
    quem.forEach(function (pk) {
      var p = PAIS[pk], inst = p.inst, oc = ok(function () { return DIP.ocupAtual(inst); }, null); if (!oc) return;
      var lad = (oc.ideologia && oc.ideologia.economica) > 30 ? "D" : (oc.ideologia && oc.ideologia.economica) < -10 ? "E" : "C";
      var afin = lad === lado ? 1 : lad === "C" || lado === "C" ? 0 : -1;
      var frio = afin < 0 && ((oc.tracos && oc.tracos.ideologismo) || 50) > 70;
      var txtPt = frio ? oc.nome + " (" + p.nome + ") evita parabenizar e diz que vai \"observar\" o novo governo" : afin > 0 ? oc.nome + " (" + p.nome + ") comemora: \"vitória de quem pensa como nós\"" : oc.nome + " (" + p.nome + ") parabeniza " + nome + " e fala em parceria";
      reac.push(txtPt);
      var y = { en: frio ? oc.nome + " declined to congratulate the winner." : oc.nome + " congratulated " + nome + ".", es: frio ? oc.nome + " evitó felicitar al ganador." : oc.nome + " felicitó a " + nome + ".", fr: frio ? oc.nome + " n'a pas félicité le vainqueur." : oc.nome + " a félicité " + nome + ".", de: frio ? oc.nome + " gratulierte nicht." : oc.nome + " gratulierte " + nome + ".", zh: frio ? oc.nome + "未发贺电。" : oc.nome + "向" + nome + "表示祝贺。", ru: frio ? oc.nome + " не стал поздравлять победителя." : oc.nome + " поздравил(а) " + nome + "." };
      var lang = p.lang;
      if (["eua", "china", "argentina", "franca", "alemanha", "russia", "venezuela", "paraguai"].indexOf(pk) >= 0) noticiaExt(pk, "eleicao_br", { lider: nome, y: y[lang] || y.en, yPt: txtPt + "." });
      if (venc.jogador && inst) ok(function () { var r = DIP.relacao(inst); r.pessoal = cl(r.pessoal + afin * 6, 0, 100); });
    });
    fato({ tipo: "diplomacia", sec: "Mundo", kick: "Repercussão", tit: "Mundo reage à eleição de " + nome + (pct ? " (" + String(pct).replace(".", ",") + "%)" : ""), lead: reac.slice(0, 4).join("; ") + ".", peso: 74, jog: !!venc.jogador });
  }
  MU._repercussao = repercussao;

  /* ================================================================ 6) MAPA */
  var W = 1440, H = 720, K = 4;
  function px(lng, lat) { return [((lng + 180) * K), ((90 - lat) * K)]; }
  function parsePoly(str) {
    var off = 0, prev = null;
    return str.split(" ").map(function (p) { var a = p.split(","), lng = +a[0] + off; if (prev != null && Math.abs(lng - prev) > 180) { off += lng > prev ? -360 : 360; lng = +a[0] + off; } prev = lng; return [lng, +a[1]]; });
  }
  var PATHS = null;
  function paths() {
    if (PATHS) return PATHS; PATHS = {};
    var mu = window.V3MUNDO || {};
    Object.keys(mu).forEach(function (id) { PATHS[id] = mu[id][1].map(function (s) { return "M" + parsePoly(s).map(function (p) { var q = px(p[0], p[1]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join("L") + "Z"; }).join(""); });
    return PATHS;
  }
  var VIEWS_ = { mundo: [0, 90, 1440, 520], americas: [180, 40, 560, 600], sul: [360, 330, 300, 300], europa: [690, 60, 260, 200], asia: [920, 90, 520, 380] };
  function corRel(v) { return v >= 65 ? "#2f7de1" : v >= 50 ? "#5fa3e8" : v >= 35 ? "#e0a800" : "#d9534f"; }
  function htmlMapa() {
    var s = st(), sel = MU._sel || null, z = MU._zoom || "mundo", vb = VIEWS_[z];
    var P = paths(), ativos = {};
    DIP.INSTITUICOES.forEach(function (inst) { var k = POR_INST[inst.id]; if (k) ativos[PAIS[k].geo] = inst.id; });
    var h = '<svg class="mu-mapa z-' + z + '" viewBox="' + vb.join(" ") + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa-múndi: toque num país destacado">';
    h += '<rect x="0" y="0" width="' + W + '" height="' + H + '" class="mu-mar"/>';
    Object.keys(P).forEach(function (gid) {
      var inst = ativos[gid], br = gid === "076", nome = (window.V3MUNDO[gid] || [""])[0];
      if (inst) { var rel = ok(function () { return DIP.relacao(inst).pessoal; }, 50); h += '<path d="' + P[gid] + '" class="mu-p ativo' + (sel === inst ? " sel" : "") + '" style="fill:' + corRel(rel) + '" data-mu="pais" data-id="' + inst + '"><title>' + esc_(DIP.instPorId(inst).nome) + "</title></path>"; }
      else h += '<path d="' + P[gid] + '" class="mu-p' + (br ? " br" : "") + '"><title>' + esc_(br ? "Brasil" : nome) + "</title></path>";
    });
    // capitais dos países clicáveis
    DIP.INSTITUICOES.forEach(function (inst) { if (inst.tipo !== "pais") return; var c = DIP.CAPITAIS[inst.capital_id]; if (!c) return; var q = px(c.lng, c.lat); h += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (z === "mundo" ? 3.2 : 2) + '" class="mu-cap' + (sel === inst.id ? " sel" : "") + '" data-mu="pais" data-id="' + inst.id + '"/>'; });
    var bsb = px(-47.9, -15.8); h += '<circle cx="' + bsb[0] + '" cy="' + bsb[1] + '" r="' + (z === "mundo" ? 4 : 2.6) + '" class="mu-bsb"/>';
    return h + "</svg>";
  }
  function htmlPainel(instId) {
    var inst = DIP.instPorId(instId); if (!inst) return "";
    var oc = DIP.ocupAtual(instId), rel = DIP.relacao(instId), k = POR_INST[instId], p = k && PAIS[k], f = MU.forcaRel(instId), pos_ = postura(f);
    var v3 = ok(function () { return DIP.estado().v3; }, null), pr = v3 && v3.prox && v3.prox[instId];
    var h = '<div class="mu-painel"><div class="mu-ph">' + DIP.silhuetaHtml(oc, 64) + '<div class="mu-pn"><small>' + (p ? p.flag + " " : "") + esc_(inst.nome) + "</small><b>" + esc_(oc ? oc.nome : "—") + "</b><span>" + esc_((DIP.ARQUETIPOS[oc && oc.arquetipo] || {}).nome || "") + "</span></div></div>";
    if (oc && oc.biografia) h += '<p class="mu-bio">' + esc_(oc.biografia) + "</p>";
    h += '<div class="mu-kv">';
    if (p) h += "<span>PIB<b>US$ " + nf(pibDe(k), pibDe(k) < 0.1 ? 3 : 2) + " tri</b><i>" + posDe(k) + "º do mundo</i></span>";
    h += "<span>Relação pessoal<b style='color:" + corRel(rel.pessoal) + "'>" + Math.round(rel.pessoal) + "</b><i>rancor " + Math.round(rel.rancor || 0) + "</i></span>";
    if (pos_) h += '<span class="mu-pos ' + pos_.c + '">Postura diante do Brasil<b>' + pos_.t + "</b><i>" + (f >= 1 ? "Brasil " + nf(f, f < 10 ? 1 : 0) + "x maior" : "eles " + nf(1 / f, 1 / f < 10 ? 1 : 0) + "x maiores") + "</i></span>";
    if (pr) h += "<span>Próxima eleição<b>" + MES[pr.mesE] + "/" + pr.ano + "</b><i>posse em " + MES[pr.mesP] + "</i></span>";
    h += "</div>";
    if (pos_) h += '<p class="mu-nota">' + esc_(pos_.d) + "</p>";
    var pode = ok(function () { return DIP.podeDiplomacia(); }, false);
    h += '<div class="mu-bts">' + (pode ? '<button type="button" class="b confirma" data-mu="preparar" data-id="' + instId + '">Preparar reunião</button>' : "") +
      '<button type="button" class="b branco" data-dip-acao="ver-inst" data-dip-id="' + instId + '">Ficha completa</button>' +
      (podeExigir(instId) ? '<button type="button" class="b corrige" data-mu="exigir" data-id="' + instId + '">Fazer exigência</button>' : "") + "</div>";
    if (!pode) h += '<p class="mu-nota">Só Presidente e Governador têm agenda internacional.</p>';
    if (MU._exigindo === instId) {
      var ult = st().exig[instId], falta = ult ? 6 - (mesAbs() - ult) : 0;
      h += '<div class="mu-exig"><h4>O que o Brasil exige?</h4>' + (falta > 0 ? "<p class='mu-nota'>Você pressionou este país há pouco. Volte em " + falta + " mes(es).</p>" : exigencias(instId).map(function (x) { return '<button type="button" class="mu-op" data-mu="exige" data-id="' + instId + '" data-e="' + x[0] + '"><b>' + esc_(x[1]) + "</b><small>Ganho: " + esc_(x[2]) + "</small></button>"; }).join("")) + "<p class='mu-nota'>Exigir sempre azeda a relação e os vizinhos reparam. Quanto maior o Brasil em relação a eles, maior a chance de cederem.</p></div>";
    }
    return h + "</div>";
  }
  function htmlStatus() {
    var pos = posDe("brasil"), chip = function (n, on, t) { return '<span class="mu-chip' + (on ? " on" : "") + '" title="' + esc_(t) + '">' + n + (on ? " ✓" : " ✗") + "</span>"; };
    return '<div class="mu-status"><div class="mu-br"><span>🇧🇷</span><div><b>' + pos + "ª economia do mundo</b><small>PIB de US$ " + nf(pibBR(), 2) + " tri · prestígio " + Math.round(st().prest) + "</small></div></div><div class='mu-chips'>" +
      chip("G7", membro("g7", "brasil"), "Clube das 7 maiores economias: o Brasil entra se ficar 6 meses entre as 7 maiores.") + chip("G20", membro("g20", "brasil"), "Sai se ficar 12 meses fora das 20 maiores economias.") + chip("BRICS", true, "Membro fundador.") + chip("Mercosul", true, "Membro fundador.") + "</div></div>";
  }
  function htmlRanking() {
    var r = ranking(), br = posDe("brasil");
    var lin = r.filter(function (x) { return x.pos <= 12 || x.k === "brasil" || Math.abs(x.pos - br) <= 1; }).map(function (x) { var p = PAIS[x.k]; return '<li class="' + (x.k === "brasil" ? "br" : "") + '"><i>' + x.pos + "º</i>" + p.flag + " " + esc_(p.nome) + (membro("g7", x.k) ? ' <em>G7</em>' : "") + "<b>US$ " + nf(x.pib, 2) + " tri</b></li>"; }).join("");
    return '<details class="mu-rank"><summary>📊 Ranking mundial do PIB</summary><ol>' + lin + "</ol><p class='mu-nota'>O PIB brasileiro em dólar vem da economia do jogo: crescimento, inflação e câmbio. Dólar barato e crescimento alto aproximam o Brasil do topo.</p></details>";
  }
  function htmlAgenda() {
    var l = proximos(6);
    return '<details class="mu-ag" open><summary>📅 Agenda internacional</summary><ul>' + l.map(function (e) { return "<li><span>" + e.ic + "</span><div><b>" + esc_(e.nome) + "</b><small>" + MES[e.mes] + "/" + e.ano + " · " + esc_(e.local) + (e.conv === "convidado" ? " · Brasil só vai se for convidado" : "") + "</small></div></li>"; }).join("") + "</ul></details>";
  }
  function uiMapa() {
    var s = st(); if (!s) return "<p>Inicie uma carreira.</p>";
    var c = DIP._cena || {}; MU._sel = c.sel || MU._sel || null;
    var orgs = DIP.INSTITUICOES.filter(function (i) { return i.tipo === "organismo"; });
    var h = '<div class="mu-tela"><h2>🌍 Relações Exteriores</h2>' + htmlStatus();
    if (s.pend && cid() === "PRES") h += htmlCupula();
    h += '<div class="mu-zoom">' + [["mundo", "Mundo"], ["americas", "Américas"], ["sul", "América do Sul"], ["europa", "Europa"], ["asia", "Ásia"]].map(function (z) { return '<button type="button" class="' + ((MU._zoom || "mundo") === z[0] ? "on" : "") + '" data-mu="zoom" data-id="' + z[0] + '">' + z[1] + "</button>"; }).join("") + "</div>";
    h += '<div class="mu-mapa-w">' + htmlMapa() + '</div><div class="mu-leg"><i style="background:#2f7de1"></i>relação boa <i style="background:#e0a800"></i>morna <i style="background:#d9534f"></i>ruim <i class="br"></i>Brasil' + ((MU._zoom || "mundo") === "mundo" ? " · arraste para o lado" : "") + "</div>";
    h += MU._sel ? htmlPainel(MU._sel) : '<p class="mu-dica">Toque num país colorido para ver o líder e preparar a reunião.</p>';
    h += '<div class="mu-orgs"><h4>Organismos internacionais</h4><div>' + orgs.map(function (i) { var oc = DIP.ocupAtual(i.id); return '<button type="button" class="' + (MU._sel === i.id ? "on" : "") + '" data-mu="pais" data-id="' + i.id + '">' + DIP.silhuetaHtml(oc, 28) + "<span>" + esc_(i.nome) + "<small>" + esc_(oc ? oc.nome : "") + "</small></span></button>"; }).join("") + "</div></div>";
    var st0 = DIP.estado() || {}; if (!st0.convites || !st0.convites.length) ok(function () { st0.convites = DIP.gerarConvites(); });
    var conv = (st0.convites || []).map(function (cv, i) { return '<li><span>' + esc_(cv.texto) + '</span><button type="button" class="b mini confirma" data-dip-acao="aceitar-convite" data-dip-id="' + i + '">Preparar</button></li>'; }).join("");
    if (conv) h += '<details class="mu-ag"><summary>✉️ Convites e pedidos de reunião</summary><ul class="mu-conv">' + conv + "</ul></details>";
    h += htmlAgenda() + ok(function () { return window.DIP3 && DIP3.htmlCalendario ? DIP3.htmlCalendario() : ""; }, "") + htmlRanking();
    h += '<p class="mu-nota">Agenda do mês: <b>' + ok(function () { return DIP.agendaDisponivel() + "/" + DIP.pontosAgendaMes(); }, "—") + "</b></p></div>";
    return h;
  }
  MU.uiMapa = uiMapa;

  /* ---------------- briefing (formato, pauta, pública ou reservada) */
  var PAUTA = { acordo_comercial: ["Acordo comercial", "tarifas e cotas para exportar mais"], acesso_mercado_agro: ["Mercado para o agro", "carne, soja e frutas brasileiras"], barreira_ambiental: ["Barreiras ambientais", "exigências verdes contra produtos brasileiros"], credito_cambial_swap: ["Swap e crédito", "linha de dólares para segurar o câmbio"], emprestimo_multilateral: ["Empréstimo", "dinheiro para obras e programas"], condicionalidade_fiscal: ["Condições fiscais", "o que eles exigem das contas públicas"], transferencia_tecnologia: ["Transferência de tecnologia", "fábricas e conhecimento no Brasil"], cooperacao_defesa: ["Defesa", "equipamentos, treinamento e fronteira"], fertilizantes_insumos: ["Fertilizantes", "insumos para o agro"], energia_petroleo_gas: ["Energia, petróleo e gás", "preço, fornecimento e investimentos"], hidrogenio_verde_minerais_criticos: ["Minerais críticos e hidrogênio verde", "lítio, terras raras e energia limpa"], fundos_clima_amazonia: ["Clima e Amazônia", "dinheiro para a floresta"], "5g_tecnologia": ["5G e tecnologia", "redes, chips e dados"], reforma_onu_fmi: ["Reforma da ONU e do FMI", "mais voz para o Brasil"], sancoes_alinhamento: ["Sanções e alinhamento", "de que lado o Brasil fica"], fronteira_migracao: ["Fronteira e migração", "fluxo de pessoas e controle"], narcotrafico_garimpo: ["Narcotráfico e garimpo", "facções e crimes na fronteira"], mercosul_integracao: ["Mercosul", "integração e tarifa externa"], investimento_direto: ["Investimentos", "dinheiro novo no Brasil"], turismo_cultura: ["Turismo e cultura", "voos, vistos e eventos"], politica_nuclear_espacial: ["Nuclear e espacial", "Angra, Alcântara e satélites"], opep_combustiveis: ["OPEP e combustíveis", "preço do petróleo"], painel_omc_subsidios: ["Disputa na OMC", "subsídios e retaliações"], tributacao_importacao: ["Imposto de importação", "taxas sobre compras"], geopolitica_eua_china: ["EUA x China", "o Brasil no meio da disputa"], infraestrutura_investimento: ["Infraestrutura", "portos, ferrovias e estradas"] };
  function pautaTxt(id, instId) { if (instId === "paraguai" && id === "energia_petroleo_gas") return ["Itaipu e energia", "tarifa e uso da energia da usina"]; if (instId === "bolivia" && id === "energia_petroleo_gas") return ["Gás boliviano", "preço e volume do gás"]; return PAUTA[id] || [id.replace(/_/g, " "), ""]; }
  var MODOS = [["viagem", "✈️", "Viagem oficial", "Peso máximo, mais rodadas e foto com o líder. Gasta mais agenda."], ["video", "💻", "Videoconferência", "Rápida e barata; menos calor humano."], ["telefone", "☎️", "Telefonema", "Duas rodadas, direto ao ponto."]];
  function uiBriefing() {
    var c = DIP._cena, inst = DIP.instPorId(c.instId), oc = DIP.ocupAtual(c.instId), k = POR_INST[c.instId], p = k && PAIS[k], pos_ = postura(MU.forcaRel(c.instId));
    var h = '<div class="mu-brief"><button type="button" class="b mini branco" data-mu="voltar">← Mapa</button><div class="mu-ph">' + DIP.silhuetaHtml(oc, 72) + '<div class="mu-pn"><small>' + (p ? p.flag + " " : "") + esc_(inst.nome) + "</small><b>Reunião com " + esc_(oc.nome) + "</b>" + (pos_ ? '<span class="mu-pos ' + pos_.c + '">Postura: ' + pos_.t + "</span>" : "") + "</div></div>";
    h += "<h4>Formato</h4><div class='mu-ops tri'>" + MODOS.map(function (m) { return '<button type="button" class="mu-op' + (c.modo === m[0] ? " on" : "") + '" data-mu="modo" data-id="' + m[0] + '"><b>' + m[1] + " " + m[2] + "</b><small>" + m[3] + "</small></button>"; }).join("") + "</div>";
    h += "<h4>O que vai ser tratado</h4><div class='mu-ops'>" + (inst.interesses || []).map(function (id) { var t = pautaTxt(id, c.instId); return '<button type="button" class="mu-op' + (c.pauta === id ? " on" : "") + '" data-dip-acao="set-pauta" data-dip-id="' + esc_(id) + '"><b>' + esc_(t[0]) + "</b><small>" + esc_(t[1]) + "</small></button>"; }).join("") + "</div>";
    h += "<h4>Pública ou reservada?</h4><div class='mu-ops dua'>" +
      '<button type="button" class="mu-op' + (c.transparencia === "aberta" ? " on" : "") + '" data-dip-acao="set-transp" data-dip-id="aberta"><b>📸 Pública</b><small>Imprensa, foto e coletiva. Se der certo, a imagem sobe; se der errado, o atrito vira manchete aqui e lá fora.</small></button>' +
      '<button type="button" class="mu-op' + (c.transparencia !== "aberta" ? " on" : "") + '" data-dip-acao="set-transp" data-dip-id="fechada"><b>🔒 Reservada</b><small>Sem câmeras. Menos risco, menos ganho de imagem; só sai uma nota.</small></button></div>';
    h += "<h4>Preparação: " + Math.round(c.preparacao || 40) + "</h4><button type='button' class='b mini' data-dip-acao='prep-itamaraty'>Pré-negociar com o Itamaraty (−1 agenda)</button>";
    h += '<div class="mu-bts"><button type="button" class="b confirma grande" data-dip-acao="iniciar-voo">Iniciar ' + (c.modo === "viagem" ? "viagem" : c.modo === "video" ? "videoconferência" : "telefonema") + "</button></div></div>";
    return h;
  }

  /* ================================================================ 7) MÍDIA: aba Exterior */
  var LANGN = { en: "inglês", es: "espanhol", fr: "francês", de: "alemão", it: "italiano", zh: "chinês", ru: "russo", ja: "japonês", ar: "árabe", tr: "turco", nl: "holandês" };
  function viewExterior() {
    var s = st(); if (!s) return "";
    var f = MU._filtro || "todas", tr = MU._trad || {};
    var l = s.news.filter(function (n) { return f === "todas" || (f === "brasil" ? /_br|rank|exige|encontro|clube|eleicao_br/.test(n.tipo) : n.lang === f); }).slice(0, 40);
    var langs = {}; s.news.forEach(function (n) { langs[n.lang] = 1; });
    var h = '<section class="card mu-ext"><h3>🌐 Notícias do exterior</h3><p class="txt"><small>Manchetes da imprensa estrangeira no idioma original. Toque em <b>Traduzir</b> para ler em português.</small></p>';
    h += '<div class="mu-filt">' + [["todas", "Todas"], ["brasil", "Sobre o Brasil"]].concat(Object.keys(langs).map(function (k) { return [k, LANGN[k] || k]; })).map(function (x) { return '<button type="button" class="' + (f === x[0] ? "on" : "") + '" data-mu="filt" data-id="' + x[0] + '">' + esc_(x[1]) + "</button>"; }).join("") + '<button type="button" data-mu="tradtudo">Traduzir tudo</button></div>';
    if (!l.length) h += '<p class="txt">Nada ainda. As notícias de fora aparecem conforme os meses passam: eleições, posses, cúpulas, acordos e o ranking das economias.</p>';
    h += '<div class="mu-nlist">' + l.map(function (n) {
      var t = tr[n.id] || MU._tradTudo, p = PAIS[n.pk];
      return '<article class="mu-n' + (t ? " pt" : "") + '"' + (n.lang === "ar" && !t ? ' dir="rtl"' : "") + '><div class="mu-nh"><span>' + (p ? p.flag : "🌐") + " " + esc_(n.veic) + "</span><small>" + MES[n.mes] + "/" + n.ano + "</small></div><h4>" + esc_(t ? n.tPt : n.t) + "</h4><p>" + esc_(t ? n.lPt : n.l) + '</p><button type="button" class="mu-tr" data-mu="trad" data-id="' + n.id + '">' + (t ? "Ver original (" + (LANGN[n.lang] || n.lang) + ")" : "Traduzir") + "</button></article>";
    }).join("") + "</div></section>";
    return h;
  }
  MU.viewExterior = viewExterior;

  /* ================================================================ 8) CLIQUES */
  // no celular o mapa-múndi fica mais largo que a tela: centra nas Américas
  function centra() { var w = document.querySelector(".mu-mapa-w"); if (!w || w.__c) return; w.__c = 1; if (w.scrollWidth > w.clientWidth + 20) { var sv = w.querySelector("svg"); var keep = MU._scroll; w.scrollLeft = keep != null ? keep : sv.clientWidth * 0.18; } w.addEventListener("scroll", function () { MU._scroll = w.scrollLeft; }, { passive: true }); }
  setInterval(centra, 400);
  function refresh() { ok(function () { DIP.refreshUI(); }); setTimeout(centra, 0); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-mu]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var a = b.getAttribute("data-mu"), id = b.getAttribute("data-id"), s = st();
    if (a === "pais") { MU._sel = MU._sel === id ? null : id; MU._exigindo = null; DIP._cena = { fase: "mapa", sel: MU._sel }; refresh(); setTimeout(function () { var p = document.querySelector(".mu-painel"); if (p && p.scrollIntoView) p.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 30); return; }
    if (a === "zoom") { MU._zoom = id; refresh(); return; }
    if (a === "preparar") { var inst = DIP.instPorId(id); DIP._cena = { fase: "briefing", instId: id, modo: cid() === "PRES" ? "viagem" : "video", pauta: (inst.interesses || [])[0], preparacao: 40, transparencia: "fechada", comitiva: [] }; refresh(); return; }
    if (a === "modo") { if (DIP._cena) DIP._cena.modo = id; refresh(); return; }
    if (a === "voltar") { DIP._cena = { fase: "mapa", sel: MU._sel }; refresh(); return; }
    if (a === "exigir") { MU._exigindo = MU._exigindo === id ? null : id; refresh(); return; }
    if (a === "exige") { exigir(id, b.getAttribute("data-e")); MU._exigindo = null; refresh(); return; }
    if (a === "linha" && s && s.pend) { s.pend.linha = +b.getAttribute("data-i"); refresh(); return; }
    if (a === "bil" && s && s.pend) { s.pend.bil = s.pend.bil === id ? null : id; refresh(); return; }
    if (a === "ir") { irCupula(); refresh(); return; }
    if (a === "chanceler" && s && s.pend) { s.ev[s.pend.key] = "chanceler"; fato({ tipo: "diplomacia", sec: "Mundo", kick: s.pend.ev.nome, tit: "Presidente não vai à " + s.pend.ev.nome + " e manda o chanceler", lead: "A ausência é lida como desprestígio pela diplomacia.", peso: 50, jog: true }); s.prest = cl(s.prest - 2, 0, 100); s.pend = (s.fila || []).shift() || null; refresh(); return; }
    if (a === "filt") { MU._filtro = id; ok(function () { render(); }); return; }
    if (a === "trad") { MU._trad = MU._trad || {}; MU._trad[id] = !MU._trad[id]; ok(function () { render(); }); return; }
    if (a === "tradtudo") { MU._tradTudo = !MU._tradTudo; MU._trad = {}; ok(function () { render(); }); return; }
  }, true);

  /* ================================================================ 9) INSTALAÇÃO */
  function envolver(obj, nome, marca, fn) { var o = obj[nome]; if (typeof o !== "function" || o[marca]) return false; var n = fn(o); for (var k in o) { try { n[k] = o[k]; } catch (e) {} } n[marca] = true; obj[nome] = n; return true; }
  function instalar() {
    if (window.DIP && DIP.renderCena && !DIP.renderCena.__mu) {
      var r0 = DIP.renderCena;
      DIP.renderCena = function () { var c = DIP._cena; if (!c || c.fase === "mapa") return uiMapa(); if (c.fase === "briefing" && !c.v3) return uiBriefing(); return r0.apply(this, arguments); };
      DIP.renderCena.__mu = true;
    }
    if (window.DIP3 && !DIP3.onEvt) DIP3.onEvt = onEvt;
    if (window.DIP && DIP.cardRelacoes && !DIP.cardRelacoes.__mu) {
      var cr = DIP.cardRelacoes;
      DIP.cardRelacoes = function () { var h = cr.apply(this, arguments); if (!h) return h; var s = st(); var extra = s ? '<p class="txt"><small>🇧🇷 ' + posDe("brasil") + "ª economia · " + (membro("g7", "brasil") ? "G7 · " : "") + (membro("g20", "brasil") ? "G20 · " : "fora do G20 · ") + "BRICS · Mercosul" + (s.pend && cid() === "PRES" ? " · <b>" + esc_(s.pend.ev.nome) + " neste mês</b>" : "") + "</small></p>" : ""; return h.replace('Abrir Itamaraty</button>', 'Abrir mapa do mundo</button>').replace("</p>", "</p>" + extra); };
      DIP.cardRelacoes.__mu = true;
    }
    envolver(window, "iniciarTurno", "__mu", function (o) { return function () { var r = o.apply(this, arguments); ok(tick); return r; }; });
    if (typeof window.iniciarTurno === "function") ok(function () { iniciarTurno = window.iniciarTurno; });
    envolver(window, "finalizarMaj", "__mu", function (o) { return function (c, venc) { var r = o.apply(this, arguments); if (c === "PRES") ok(function () { repercussao(venc); }); return r; }; });
    if (typeof window.finalizarMaj === "function") ok(function () { finalizarMaj = window.finalizarMaj; });
    // aba "Notícias do exterior" na Mídia
    var N = window.NAVH;
    if (N && N.HUBS && !N.__mu) { var hm = N.HUBS.filter(function (x) { return x.id === "midia"; })[0]; if (hm) { N.__mu = true; hm.subs.splice(1, 0, ["exterior", "Notícias do exterior"]); } }
    if (typeof VIEWS !== "undefined" && !VIEWS.exterior) VIEWS.exterior = function () { return viewExterior(); };
    ok(function () { if (!TABS.some(function (t) { return t[0] === "exterior"; })) TABS.push(["exterior", "Exterior"]); });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 350); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
