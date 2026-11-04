/* =============================================================================
   CADEIRA v3 — Marcas: veículos de imprensa e órgãos de controle
   (gerado por tools/gerar_marcas.py a partir de dados/marcas/*.webp)
   1. Logos dos veículos no jornal e no feed (cadeira-v3-midia usa V3MARCAS.logo).
   2. Agenda de mídia (aba Imprensa): entrevistas e podcasts em veículos com
      público e linha editorial próprios. Rende ou custa popularidade conforme
      a afinidade com o seu campo, a retórica e o alcance. Cada veículo só
      recebe você de novo depois de 6 meses.
   3. Órgãos de controle (aba Jurídico): MPF, MP-SP, GAECO, Polícia Federal,
      Receita Federal, STF e Justiça Eleitoral, com o nível de atenção de cada
      um sobre você, calculado do seu histórico.
   4. Logos ao lado dos títulos que citam esses órgãos e veículos.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3MARCAS) return;
  var LOGOS = __LOGOS__;
  var MK = (window.V3MARCAS = {});
  MK.logo = function (id) { return LOGOS[id] || ""; };
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function img(id, cls) { var l = LOGOS[id]; return l ? '<img class="' + (cls || "v3k-logo") + '" src="' + l + '" alt="">' : '<span class="' + (cls || "v3k-logo") + ' v3k-sem">🛡️</span>'; }
  function idx() { var d = ok(function () { return dt(); }, { ano: 2026, mes: 1 }); return d.ano * 12 + d.mes - 1; }
  function toast_(m, t) { try { toast(m, t || "ok"); } catch (e) {} }

  /* ---------------------------------------------------------------- agenda de mídia */
  // lado: E/C/D (público), alc: alcance 0-100, fmt: formato
  var AGENDA = [
    { id: "dgabc", nome: "Diário do Grande ABC", fmt: "Entrevista", lado: "C", alc: 35, local: true, desc: "Jornal da região: pesa muito para quem disputa voto no ABC." },
    { id: "cnn", nome: "CNN Brasil", fmt: "Entrevista ao vivo", lado: "C", alc: 78, desc: "Bancada de comentaristas faz perguntas duras, mas dá vitrine nacional." },
    { id: "g1", nome: "g1 / GloboNews", fmt: "Entrevista", lado: "C", alc: 88, desc: "Maior audiência do país; qualquer escorregão vira manchete." },
    { id: "record", nome: "Record", fmt: "Programa popular", lado: "C", alc: 82, desc: "Público popular e evangélico; linguagem simples rende mais." },
    { id: "folha", nome: "Folha de S.Paulo", fmt: "Sabatina", lado: "E", alc: 66, desc: "Sabatina longa com jornalistas e leitores; ótimo para formadores de opinião." },
    { id: "estadao", nome: "Estadão", fmt: "Entrevista", lado: "D", alc: 60, desc: "Leitor de classe média e mercado; cobra responsabilidade fiscal." },
    { id: "veja", nome: "Veja", fmt: "Páginas amarelas", lado: "D", alc: 58, desc: "Entrevista de capa: prestígio alto, perguntas incômodas." },
    { id: "oeste", nome: "Revista Oeste", fmt: "Entrevista", lado: "D", alc: 45, desc: "Público conservador fiel. Para quem é de esquerda, é campo minado." },
    { id: "icl", nome: "ICL Notícias", fmt: "Entrevista", lado: "E", alc: 42, desc: "Público progressista engajado. Para quem é de direita, é campo minado." },
    { id: "piaui", nome: "piauí", fmt: "Perfil", lado: "E", alc: 30, desc: "Perfil de fôlego: cresce o prestígio, mas o repórter acha tudo." },
    { id: "valor", nome: "Valor Econômico", fmt: "Entrevista", lado: "D", alc: 28, mercado: true, desc: "Fala com o mercado: rende influência e confiança dos investidores." },
    { id: "forbes", nome: "Forbes Brasil", fmt: "Perfil", lado: "D", alc: 25, mercado: true, desc: "Empresários e bilionários leem. Rende influência, quase nada de voto." },
    { id: "flow", nome: "Flow", fmt: "Podcast", lado: "D", alc: 70, podcast: true, desc: "Horas de conversa sem corte: alcance enorme entre jovens, risco de fala polêmica." },
    { id: "podpah", nome: "Podpah", fmt: "Podcast", lado: "C", alc: 84, podcast: true, desc: "O podcast mais ouvido do país: carisma conta mais que proposta." },
    { id: "uol", nome: "UOL", fmt: "Entrevista", lado: "C", alc: 55, desc: "Entrevista em vídeo no portal; repercussão rápida nas redes." }
  ];
  function estadoAgenda() { var m = ok(function () { return M(); }, null); if (!m) return null; if (!m.v3agenda) m.v3agenda = { ult: {}, mes: -1, n: 0, hist: [] }; return m.v3agenda; }
  function ladoJogador() { return ok(function () { return (PARTIDOS[J().partido_atual] || {}).e; }, "C") || "C"; }
  function escopo() { var c = ok(function () { return cargoAtualId(); }, ""); return /PRES|GOV|SEN|MIN|DEPF/.test(c) ? "nac" : /DEPE|SEC/.test(c) ? "est" : "loc"; }
  function afinidade(v) { var l = ladoJogador(); if (v.lado === "C" || l === "C") return 0.6; return v.lado === l ? 1 : -0.4; }
  function previa(v) {
    var j = J(), a = afinidade(v), ret = (j.atributos && j.atributos.retorica) || 50, car = (j.atributos && j.atributos.carisma) || 50;
    var esc = escopo(), peso = v.local ? (esc === "loc" ? 1.6 : 0.6) : (esc === "loc" ? 0.6 : esc === "est" ? 0.9 : 1.2);
    var base = (v.alc / 100) * (v.podcast ? 1.6 + car / 60 : 1.2 + ret / 70) * peso;
    var ganho = a > 0 ? base * a * 2.2 : base * 0.6;
    var risco = clamp(0.1 + (a < 0 ? 0.25 : 0) + (v.podcast ? 0.08 : 0) + (v.id === "piaui" || v.id === "veja" ? 0.08 : 0) - ret / 450, 0.04, 0.6);
    return { ganho: ganho, risco: risco };
  }
  function participar(id) {
    var v = AGENDA.filter(function (x) { return x.id === id; })[0]; if (!v) return;
    var st = estadoAgenda(), i = idx(), j = J();
    if (st.ult[id] != null && i - st.ult[id] < 6) { toast_("O " + v.nome + " só volta a te chamar em " + (6 - (i - st.ult[id])) + " meses.", "err"); return; }
    if (st.mes === i && st.n >= 2) { toast_("Já foram duas entrevistas este mês. A assessoria pede para não superexpor.", "err"); return; }
    if (typeof gastarEnergia === "function" && !gastarEnergia(12)) return;
    if (st.mes !== i) { st.mes = i; st.n = 0; } st.n++; st.ult[id] = i;
    var p = previa(v), gafe = Math.random() < p.risco;
    var TEMAS = ["segurança pública", "saúde", "custo de vida", "emprego", "educação", "transporte", "combate à corrupção", "as eleições", "o futuro do partido"];
    var tema = TEMAS[Math.floor(Math.random() * TEMAS.length)], antes = j.popularidade, txt;
    if (gafe) {
      var perda = Math.round((1.5 + Math.random() * 2.5) * (v.alc / 60) * 10) / 10;
      j.popularidade = clamp(j.popularidade - perda, 0, 100);
      try { addEscandalo(Math.round(2 + v.alc / 30)); } catch (e) {}
      txt = (v.podcast ? "Fala de " + j.nome + " no " + v.nome : "Entrevista de " + j.nome + " ao " + v.nome) + " sobre " + tema + " repercute mal e vira alvo de críticas.";
      toast_("Deu ruim: a fala viralizou do jeito errado (−" + perda.toFixed(1) + " de popularidade).", "err");
    } else {
      var g = Math.round((p.ganho * (0.7 + Math.random() * 0.6)) * 10) / 10;
      j.popularidade = clamp(j.popularidade + g, 0, 100);
      if (v.mercado && j.atributos) j.atributos.influencia = clamp((j.atributos.influencia || 0) + 2, 0, 100);
      txt = v.podcast ? j.nome + " vai ao " + v.nome + ", fala de " + tema + " e o corte viraliza." : "Em entrevista ao " + v.nome + ", " + j.nome + " fala sobre " + tema + ".";
      toast_("Boa entrevista: +" + g.toFixed(1) + " de popularidade" + (v.mercado ? " e +2 de influência" : "") + ".", "ok");
    }
    try { manchete(txt, "midia"); } catch (e) {}
    st.hist.unshift({ i: i, id: id, gafe: gafe, d: Math.round((j.popularidade - antes) * 10) / 10 }); st.hist = st.hist.slice(0, 8);
    try { render(); } catch (e) {}
  }
  MK.participar = participar;
  function cardAgenda() {
    var st = estadoAgenda(); if (!st) return "";
    var i = idx(), l = ladoJogador();
    var h = '<section class="card v3k-agenda"><h3>🎙️ Agenda de mídia</h3><p class="txt">Escolha onde aparecer. Veículos do seu campo rendem mais; os do campo oposto dão vitrine, mas o risco de deslize é maior. Custa 12 de energia, no máximo 2 por mês, e cada veículo só te chama de novo depois de 6 meses.</p><div class="v3k-grade">';
    AGENDA.forEach(function (v) {
      var p = previa(v), espera = st.ult[v.id] != null ? 6 - (i - st.ult[v.id]) : 0;
      var lado = { E: "público de esquerda", C: "público amplo", D: "público de direita" }[v.lado];
      h += '<div class="v3k-veic">' + img(v.id) + '<div class="v3k-info"><b>' + esc_(v.nome) + "</b><small>" + esc_(v.fmt) + " · " + lado + " · alcance " + v.alc + "</small><p>" + esc_(v.desc) + "</p>" +
        '<div class="v3k-prev"><span class="ok">até +' + (p.ganho * 1.3).toFixed(1) + ' pop.</span><span class="ri">risco ' + Math.round(p.risco * 100) + "%</span></div>" +
        (espera > 0 ? '<button type="button" class="b mini" disabled>Volta em ' + espera + " meses</button>" : '<button type="button" class="b mini confirma" data-v3k-agenda="' + v.id + '">' + (v.podcast ? "Ir ao podcast" : "Dar entrevista") + "</button>") + "</div></div>";
    });
    h += "</div>";
    if (st.hist.length) h += '<details><summary>Últimas aparições</summary>' + st.hist.map(function (x) { var v = AGENDA.filter(function (a) { return a.id === x.id; })[0] || {}; return '<p class="txt">' + (x.gafe ? "❌" : "✅") + " " + esc_(v.nome) + " · " + (x.d >= 0 ? "+" : "") + x.d + " pop.</p>"; }).join("") + "</details>";
    return h + "</section>";
  }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-v3k-agenda]"); if (b) participar(b.getAttribute("data-v3k-agenda")); });

  /* ---------------------------------------------------------------- órgãos de controle */
  function nivel(v) { return v >= 70 ? ["Alvo", "alto"] : v >= 40 ? ["Monitorando", "medio"] : v >= 15 ? ["Atento", "baixo"] : ["Tranquilo", "nada"]; }
  function cardOrgaos() {
    var j = ok(function () { return J(); }, null); if (!j) return "";
    var jur = j.juridico || {}, f = j.financas || {}, m = ok(function () { return M(); }, {}) || {};
    var ieo = jur.ieo_risco || 0, proc = (jur.processos_ativos || []).length, aud = (jur.audio_comprometedor || []).length, c2 = f.caixa2 || 0, esc = j.escandalo || 0;
    var op = m.operacao && !m.operacao.resolvida ? m.operacao.agencia : "";
    var federal = /PRES|GOV|SEN|MIN|DEPF/.test(ok(function () { return cargoAtualId(); }, ""));
    var O = [
      { id: "mpsp", nome: "Ministério Público de SP", v: ieo * 0.7 + aud * 8 + (op === "MP-SP" ? 60 : 0), papel: "Investiga crimes e improbidade de agentes estaduais e municipais." },
      { id: "gaeco", nome: "GAECO", v: ieo * 0.6 + aud * 10 + (op === "GAECO" ? 60 : 0) + (c2 > 1e6 ? 10 : 0), papel: "Braço do MP contra o crime organizado: grampos e operações." },
      { id: "mpf", nome: "Ministério Público Federal", v: (federal ? ieo * 0.8 : ieo * 0.3) + proc * 6, papel: "Atua quando há dinheiro ou cargo federal envolvido." },
      { id: "pf", nome: "Polícia Federal", v: (federal ? ieo * 0.7 : ieo * 0.35) + (op === "Polícia Federal" ? 70 : 0), papel: "Cumpre mandados em operações sobre verba federal e crimes eleitorais." },
      { id: "receita", nome: "Receita Federal", v: Math.min(60, c2 / 1e5) + (f.offshore ? 20 : 0) + (op === "Receita Federal" ? 60 : 0), papel: "Cruza patrimônio com renda declarada; caixa 2 e offshore acendem o alerta." },
      { id: "stf", nome: "Supremo Tribunal Federal", v: federal ? proc * 10 + ieo * 0.3 : 0, papel: "Foro de quem tem mandato federal: inquéritos e denúncias passam por lá." },
      { id: federal ? "tse" : "tre", nome: federal ? "Tribunal Superior Eleitoral" : "TRE-SP", v: (jur.inelegivel_ate > ok(function () { return dt().ano; }, 0) ? 80 : 0) + esc * 0.3 + (jur.contas_pend_ate ? 25 : 0), papel: "Registra candidaturas, julga contas de campanha e cassa mandatos." }
    ];
    var h = '<section class="card v3k-orgaos"><h3>⚖️ Órgãos de controle</h3><p class="txt">Quem está de olho em você, a partir do seu risco jurídico, dos processos, dos áudios na gaveta e do dinheiro não declarado.</p><div class="v3k-olist">';
    O.forEach(function (o) {
      var v = clamp(Math.round(o.v), 0, 100), nv = nivel(v);
      h += '<div class="v3k-org">' + img(o.id) + '<div class="v3k-info"><b>' + esc_(o.nome) + '</b><small>' + esc_(o.papel) + '</small><div class="v3k-bar ' + nv[1] + '"><i style="width:' + Math.max(4, v) + '%"></i></div></div><span class="v3k-tag ' + nv[1] + '">' + nv[0] + "</span></div>";
    });
    return h + "</div></section>";
  }

  /* ---------------------------------------------------------------- logos nos títulos */
  var CITA = [[/\bSTF\b|Supremo/, "stf"], [/\bTSE\b|Tribunal Superior Eleitoral/, "tse"], [/\bTRE\b/, "tre"], [/Receita Federal/, "receita"], [/GAECO/, "gaeco"], [/Polícia Federal/, "pf"],
    [/MP-SP|MPSP|Ministério Público de S/, "mpsp"], [/\bMPF\b|Ministério Público Federal/, "mpf"], [/Diário do Grande ABC/, "dgabc"], [/Folha/, "folha"], [/Estadão/, "estadao"], [/CNN/, "cnn"]];
  function decorar() {
    var main = document.getElementById("main"); if (!main) return;
    Array.prototype.forEach.call(main.querySelectorAll("h3"), function (h) {
      if (h.__v3k || h.querySelector("img")) return; h.__v3k = true;
      var t = h.textContent;
      for (var i = 0; i < CITA.length; i++) if (CITA[i][0].test(t) && LOGOS[CITA[i][1]]) { h.insertAdjacentHTML("afterbegin", img(CITA[i][1], "v3k-h3logo")); break; }
    });
    // modal de operação: logo do órgão
    Array.prototype.forEach.call(document.querySelectorAll("#app .modal h3, #app .sbox h3, #app .mbox h3"), function (h) {
      if (h.__v3k) return; h.__v3k = true;
      var t = h.textContent, id = /Polícia Federal/.test(t) ? "pf" : /GAECO/.test(t) ? "gaeco" : /MP-SP/.test(t) ? "mpsp" : /Receita/.test(t) ? "receita" : null;
      if (id && LOGOS[id]) h.insertAdjacentHTML("afterbegin", img(id, "v3k-h3logo"));
    });
  }

  function aposRender() {
    try {
      var jogo = ok(function () { return !!gameState; }, false); if (!jogo) return;
      var main = document.getElementById("main"); if (!main) return;
      var tab = ok(function () { return S.tab; }, "");
      if (tab === "imp" && !main.querySelector(".v3k-agenda")) main.insertAdjacentHTML("afterbegin", cardAgenda());
      if (tab === "jur" && !main.querySelector(".v3k-orgaos")) main.insertAdjacentHTML("afterbegin", cardOrgaos());
      decorar();
    } catch (e) { console.warn("v3marcas", e); }
  }
  function instalar() {
    if (typeof window.render === "function" && !window.render.__v3marcas) {
      var o = window.render;
      var n = function () { var r = o.apply(this, arguments); aposRender(); return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3marcas = true; window.render = n; try { render = n; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
