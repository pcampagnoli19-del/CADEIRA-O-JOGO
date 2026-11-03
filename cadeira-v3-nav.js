/* =============================================================================
   CADEIRA v3 — Navegação "Mapa do jogo"
   Reorganiza ONDE as coisas aparecem, sem remover nada:
   - menu lateral fixo (desktop) com todas as áreas e seções, cada área com
     uma linha dizendo para que serve;
   - cabeçalho de página (onde estou) + índice "Nesta tela" numa linha só,
     no lugar do paredão de filtros e da barra de modo compacto;
   - blocos recolhidos viram sanfona (clica no título);
   - folha "Menu" no celular com o mapa completo;
   - criação de personagem em 4 passos.
   Tudo é pós-processamento do DOM depois do render() original; as ações
   continuam usando os mesmos data-a do jogo.
   ============================================================================= */
(function () {
  "use strict";
  if (window.__V3NAV) return;
  window.__V3NAV = true;

  var LARG_SIDE = 1080; // a partir desta largura o menu lateral aparece

  var AREAS = {
    gabinete:   { ico: "🏛️", desc: "Seu mês, notícias e perfil" },
    campanha:   { ico: "🗳️", desc: "Votos, pesquisas e eleição" },
    partido:    { ico: "🚩", desc: "Sigla, fundo e alianças" },
    poder:      { ico: "⚙️", desc: "Governo, pastas e obras" },
    congresso:  { ico: "📜", desc: "Leis, votações e justiça" },
    influencia: { ico: "🤝", desc: "Rede, figuras e bastidores" },
    midia:      { ico: "📰", desc: "Jornal, rede social e repercussão" }
  };
  var DESC_SECAO = {
    mes: "O que decidir agora", eu: "Sua ficha e trajetória", mang: "O que saiu na imprensa", cela: "Você está preso",
    camp: "Cargo-alvo, caixa e pesquisas", marqueteiro: "Estratégia e propaganda", mapa: "Territórios e tráfego", ele: "Disputas e resultados",
    partido: "Painel do partido", poder: "Executivo e pastas",
    cong: "Plenário e votações", artic: "Bancadas e acordos", jur: "Processos e defesa",
    inf: "Figuras e movimentos", todos: "Todos os personagens", imp: "Relações com veículos, notas e campanhas editoriais", sub: "O lado sombrio",
    jornal: "O que a imprensa publicou sobre você e o país", feed: "O que estão dizendo e o que você responde"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function p(arr) { return esc(JSON.stringify(arr)); }
  function hubs() { return (window.NAVH && window.NAVH.HUBS) || []; }
  function estado() { try { return typeof S !== "undefined" ? S : null; } catch (e) { return null; } }
  function jogo() { try { return typeof gameState !== "undefined" && !!gameState; } catch (e) { return false; } }
  function preso() {
    try {
      return (typeof window.preso === "function" && window.preso()) ||
        !!(typeof J === "function" && J() && J().juridico && J().juridico.status === "PRISAO_DOMICILIAR");
    } catch (e) { return false; }
  }
  function hubDaAba(id) {
    var hs = hubs();
    for (var i = 0; i < hs.length; i++) for (var j = 0; j < hs[i].subs.length; j++) if (hs[i].subs[j][0] === id) return hs[i];
    return null;
  }
  function nomeSecao(id) {
    var hs = hubs();
    for (var i = 0; i < hs.length; i++) for (var j = 0; j < hs[i].subs.length; j++) if (hs[i].subs[j][0] === id) return hs[i].subs[j][1];
    try { var t = (TABS || []).filter(function (x) { return x[0] === id; })[0]; if (t) return t[1].replace(/^[^\wÀ-ú]+\s*/, ""); } catch (e) {}
    return id;
  }
  function orfas() {
    try {
      return (TABS || []).filter(function (t) { return !hubDaAba(t[0]); });
    } catch (e) { return []; }
  }
  function secoesVisiveis(h) {
    return h.subs.filter(function (s) { return s[0] !== "cela" || preso(); });
  }
  function temaAtual() { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }

  /* ---------------------------------------------------------------- menu lateral */
  function htmlMapa(modo) {
    var st = estado() || {};
    var atual = st.tab;
    var hubAtual = hubDaAba(atual);
    var h = "";
    hubs().forEach(function (hub) {
      var info = AREAS[hub.id] || { ico: "•", desc: "" };
      var aberto = modo === "folha" || (hubAtual && hubAtual.id === hub.id);
      var subs = secoesVisiveis(hub);
      var alerta = (hub.id === "gabinete" && preso()) || (hub.id === "midia" && !!(window.MIDIA3 && window.MIDIA3.novidade && window.MIDIA3.novidade()));
      h += '<div class="v3-area' + (aberto ? " aberta" : "") + (hubAtual && hubAtual.id === hub.id ? " atual" : "") + '">';
      h += '<button type="button" class="v3-area-btn' + (alerta ? " alerta" : "") + '" data-a="hub" data-p="' + p([hub.id]) + '">' +
        '<span class="v3-ico" aria-hidden="true">' + info.ico + "</span>" +
        '<span class="v3-area-txt"><b>' + esc(hub.nome) + "</b><small>" + esc(info.desc) + "</small></span></button>";
      if (aberto && subs.length > 1) {
        h += '<div class="v3-secoes">';
        subs.forEach(function (s) {
          h += '<button type="button" class="v3-secao' + (s[0] === atual ? " on" : "") + '" data-a="tab" data-p="' + p([s[0]]) + '">' +
            esc(s[1]) + (s[0] === "cela" ? ' <i class="v3-ponto"></i>' : "") + "</button>";
        });
        h += "</div>";
      }
      h += "</div>";
    });
    return h;
  }

  function htmlFerramentas(modo) {
    var claro = temaAtual() === "light";
    var h = '<div class="v3-ferr">';
    h += '<button type="button" class="v3-ferr-btn" data-a="pfPalette"><span aria-hidden="true">⌕</span>Buscar ação<kbd>Ctrl K</kbd></button>';
    h += '<button type="button" class="v3-ferr-btn" data-a="guia"><span aria-hidden="true">?</span>Guia rápido</button>';
    h += '<button type="button" class="v3-ferr-btn" data-a="salvar"><span aria-hidden="true">↓</span>Salvar carreira</button>';
    orfas().forEach(function (t) {
      h += '<button type="button" class="v3-ferr-btn' + ((estado() || {}).tab === t[0] ? " on" : "") + '" data-a="tab" data-p="' + p([t[0]]) + '"><span aria-hidden="true">✎</span>' + esc(nomeSecao(t[0])) + "</button>";
    });
    h += '<button type="button" class="v3-ferr-btn" data-a="toggleTema"><span aria-hidden="true">' + (claro ? "☾" : "☀") + "</span>" + (claro ? "Modo noturno" : "Modo claro") + "</button>";
    h += '<button type="button" class="v3-ferr-btn v3-cheat" data-a="cheatpanel"><span aria-hidden="true">⚑</span>Console do operador</button>';
    if (modo === "folha") h += '<button type="button" class="v3-ferr-btn" data-a="sheet"><span aria-hidden="true">✕</span>Fechar</button>';
    h += "</div>";
    return h;
  }

  function montarLateral(app) {
    var aside = document.createElement("aside");
    aside.className = "v3-side";
    aside.setAttribute("aria-label", "Mapa do jogo");
    aside.innerHTML =
      '<div class="v3-marca"><span>CADEIRA</span><small>simulador de poder</small></div>' +
      '<nav class="v3-mapa">' + htmlMapa("lateral") + "</nav>" +
      htmlFerramentas("lateral");
    app.insertBefore(aside, app.firstChild);
    var salvo = window.__v3SideScroll || 0;
    var mapa = aside.querySelector(".v3-mapa");
    if (mapa) {
      mapa.scrollTop = salvo;
      mapa.addEventListener("scroll", function () { window.__v3SideScroll = mapa.scrollTop; }, { passive: true });
    }
  }

  /* ---------------------------------------------------------------- cabeçalho de página */
  function montarCabecalhoPagina(app) {
    var st = estado(); if (!st) return;
    var main = document.getElementById("main"); if (!main) return;
    var hub = hubDaAba(st.tab);
    var info = hub ? (AREAS[hub.id] || {}) : {};
    var titulo = nomeSecao(st.tab);
    var area = hub ? hub.nome : "Ferramentas";
    var desc = DESC_SECAO[st.tab] || info.desc || "";
    var div = document.createElement("div");
    div.className = "v3-pagina";
    div.innerHTML = '<div class="v3-migalha"><span>' + esc(info.ico || "") + " " + esc(area) + "</span>" +
      (hub && hub.subs.length > 1 && titulo.toLowerCase() !== area.toLowerCase() ? '<span class="v3-sep">›</span><span>' + esc(titulo) + "</span>" : "") + "</div>" +
      (st.tab === "mes" ? "" : '<h1 class="v3-titulo">' + esc(titulo) + "</h1>" + (desc ? '<p class="v3-desc">' + esc(desc) + "</p>" : ""));
    var sub = app.querySelector(":scope > nav.subtabs");
    app.insertBefore(div, sub || main);
    if (st.tab === "mes") div.classList.add("v3-pagina-mes");
  }

  /* ---------------------------------------------------------------- índice "Nesta tela" */
  function tituloDe(card) {
    var h = card.querySelector(":scope > h3, :scope > summary, :scope > h2");
    return h ? h.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function abrirCard(card) {
    if (card.classList.contains("pf-cc") && !card.classList.contains("pf-cc-open")) {
      var t = card.querySelector(":scope > .pf-cc-toggle");
      if (t) t.click();
    }
  }
  function irPara(card) {
    abrirCard(card);
    var bar = window.__v3Indice, off = 90;
    if (bar && document.body.contains(bar)) off = (parseInt(getComputedStyle(bar).top, 10) || 0) + bar.offsetHeight + 14;
    var y = card.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    card.classList.remove("v3-pisca"); void card.offsetWidth; card.classList.add("v3-pisca");
  }

  function montarIndice(app) {
    var st = estado(); if (!st) return;
    var main = document.getElementById("main"); if (!main) return;
    var cards = Array.prototype.filter.call(main.children, function (el) {
      return (el.tagName === "SECTION" || el.tagName === "DETAILS") && el.classList.contains("card") && el.style.display !== "none" && tituloDe(el);
    });
    var filtro = "";
    try { filtro = (st.sec && st.sec[st.tab]) || ""; } catch (e) {}
    if (cards.length < 3 && !filtro) return;

    var bar = document.createElement("nav");
    bar.className = "v3-indice";
    bar.setAttribute("aria-label", "Nesta tela");
    var h = '<span class="v3-indice-rot">Nesta tela</span><div class="v3-indice-trilho">';
    if (filtro) {
      var nomeF = "";
      Array.prototype.forEach.call(main.querySelectorAll(":scope > .card"), function (c) { if (c.dataset.k === filtro) nomeF = tituloDe(c); });
      h += '<button type="button" class="v3-ind v3-ind-filtro" data-a="secTodos">Só: ' + esc(nomeF || "um bloco") + " ✕</button>";
    }
    cards.forEach(function (c, i) {
      h += '<button type="button" class="v3-ind" data-v3-ir="' + i + '">' + esc(tituloDe(c).replace(/^[^\wÀ-ú]+\s*/, "")) + "</button>";
    });
    h += "</div>";
    var temCC = !!main.querySelector(":scope > .pf-cc");
    var acoes = "";
    if (temCC || st.compacto === false) acoes += '<button type="button" class="v3-ind-acao" data-a="pfCompacto">' + (st.compacto ? "Abrir tudo" : "Recolher") + "</button>";
    if (window.innerWidth >= 980 && cards.length > 2) {
      var cols = true; try { cols = localStorage.getItem("cadeira_ui_cols") !== "0"; } catch (e) {}
      acoes += '<button type="button" class="v3-ind-acao" data-a="secCols">' + (cols ? "1 coluna" : "2 colunas") + "</button>";
    }
    if (acoes) h += '<div class="v3-indice-acoes">' + acoes + "</div>";
    bar.innerHTML = h;
    main.insertBefore(bar, main.firstChild);

    var trilho = bar.querySelector(".v3-indice-trilho");
    trilho.scrollLeft = window.__v3IndScroll && window.__v3IndScroll[st.tab] || 0;
    trilho.addEventListener("scroll", function () {
      window.__v3IndScroll = window.__v3IndScroll || {};
      window.__v3IndScroll[st.tab] = trilho.scrollLeft;
    }, { passive: true });
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v3-ir]"); if (!b) return;
      var c = cards[+b.getAttribute("data-v3-ir")]; if (c) irPara(c);
      Array.prototype.forEach.call(bar.querySelectorAll(".v3-ind.on"), function (x) { x.classList.remove("on"); });
      b.classList.add("on");
    });
    window.__v3Cards = cards;
    window.__v3Indice = bar;
  }

  // Destaca no índice o bloco que está na tela
  var rafSpy = 0;
  function espiar() {
    rafSpy = 0;
    var cards = window.__v3Cards, bar = window.__v3Indice;
    if (!cards || !bar || !document.body.contains(bar)) return;
    var lim = (parseInt(getComputedStyle(bar).top, 10) || 0) + bar.offsetHeight + 40;
    var ativo = -1;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getBoundingClientRect().top <= lim) ativo = i; else break;
    }
    var bts = bar.querySelectorAll("[data-v3-ir]");
    for (var k = 0; k < bts.length; k++) {
      var on = +bts[k].getAttribute("data-v3-ir") === ativo;
      if (on !== bts[k].classList.contains("on")) {
        bts[k].classList.toggle("on", on);
        if (on) {
          var tr = bar.querySelector(".v3-indice-trilho");
          var bx = bts[k].offsetLeft - tr.clientWidth / 2 + bts[k].clientWidth / 2;
          tr.scrollTo({ left: Math.max(0, bx), behavior: "smooth" });
        }
      }
    }
  }
  window.addEventListener("scroll", function () { if (!rafSpy) rafSpy = requestAnimationFrame(espiar); }, { passive: true });

  /* ---------------------------------------------------------------- sanfonas */
  function montarSanfonas() {
    var main = document.getElementById("main"); if (!main) return;
    Array.prototype.forEach.call(main.querySelectorAll(":scope > .pf-cc"), function (card) {
      var h3 = card.querySelector(":scope > h3");
      var tg = card.querySelector(":scope > .pf-cc-toggle");
      if (!h3 || !tg || h3.__v3) return;
      h3.__v3 = true;
      h3.setAttribute("role", "button");
      h3.setAttribute("tabindex", "0");
      h3.addEventListener("click", function (e) { if (e.target.closest("button,a,input,select")) return; tg.click(); });
      h3.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg.click(); } });
    });
  }

  /* ---------------------------------------------------------------- folha "Menu" (celular) */
  function folhaMapa() {
    return '<div class="sheet v3-folha" data-a="sheet"><div class="sbox" data-stop="1"><div class="grip"></div>' +
      '<h3>Mapa do jogo</h3><p class="v3-folha-sub">Tudo o que dá para fazer, organizado por área.</p>' +
      '<nav class="v3-mapa">' + htmlMapa("folha") + "</nav>" + htmlFerramentas("folha") + "</div></div>";
  }

  /* ---------------------------------------------------------------- criação de personagem em passos */
  var PASSOS = ["Origem", "Identidade", "Retrato", "Inspiração"];
  window.__v3Passo = window.__v3Passo || 0;
  function resumoFicha(ini) {
    function txt(k) {
      var s = ini.querySelector('select[data-k="' + k + '"]');
      if (!s || s.selectedIndex < 0) return "";
      return s.options[s.selectedIndex].text.replace(/\s*\(.*?\)\s*/g, " ").trim();
    }
    var nome = (ini.querySelector("#cfg-nome") || {}).value || "";
    var itens = [nome || "Sem nome ainda", txt("municipio"), txt("partido"), txt("alvo"), txt("profissao")].filter(Boolean);
    return itens.map(function (x, i) { return '<span class="v3-ficha-item' + (i === 0 ? " nome" : "") + '">' + esc(x) + "</span>"; }).join("");
  }
  function montarPassos() {
    var ini = document.querySelector("#app .inicio"); if (!ini) return;
    var secs = Array.prototype.filter.call(ini.children, function (el) { return el.tagName === "SECTION" && el.classList.contains("card"); });
    if (secs.length < 2) return;
    var go = ini.querySelector('[data-a="novo"]');
    var goBox = go ? go.closest(".inicio > *") : null;
    var n = secs.length;
    var at = Math.min(Math.max(0, window.__v3Passo | 0), n - 1);
    ini.classList.add("v3-passos-on");

    var topo = document.createElement("div");
    topo.className = "v3-passos";
    var h = '<ol class="v3-passos-lista">';
    for (var i = 0; i < n; i++) {
      h += '<li><button type="button" data-v3-passo="' + i + '" class="' + (i === at ? "on" : i < at ? "feito" : "") + '"><i>' + (i < at ? "✓" : i + 1) + "</i><span>" + esc(PASSOS[i] || "Passo " + (i + 1)) + "</span></button></li>";
    }
    h += '</ol><div class="v3-ficha">' + resumoFicha(ini) + "</div>";
    topo.innerHTML = h;
    var antes = secs[0];
    ini.insertBefore(topo, antes);

    secs.forEach(function (s, i) {
      s.classList.toggle("v3-passo-oculto", i !== at);
      var t = s.querySelector(":scope > h3");
      if (t && !t.__v3) { t.__v3 = true; t.innerHTML = t.innerHTML.replace(/^\s*\d+\.\s*/, ""); }
    });
    if (goBox) goBox.classList.toggle("v3-passo-oculto", at !== n - 1);

    var pe = document.createElement("div");
    pe.className = "v3-passos-pe";
    pe.innerHTML = (at > 0 ? '<button type="button" class="b branco" data-v3-passo="' + (at - 1) + '">← Voltar</button>' : "<span></span>") +
      '<span class="v3-passos-cont">Passo ' + (at + 1) + " de " + n + "</span>" +
      (at < n - 1 ? '<button type="button" class="b confirma" data-v3-passo="' + (at + 1) + '">Continuar →</button>' : "<span></span>");
    secs[n - 1].insertAdjacentElement("afterend", pe);
    if (goBox && at === n - 1) pe.insertAdjacentElement("afterend", goBox);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3-passo]"); if (!b) return;
    window.__v3Passo = +b.getAttribute("data-v3-passo") || 0;
    try { render(); } catch (err) {}
    var alvo = document.querySelector(".v3-passos");
    if (alvo) window.scrollTo({ top: Math.max(0, alvo.getBoundingClientRect().top + window.scrollY - 16), behavior: "smooth" });
  });
  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "cfg-nome") {
      var ini = document.querySelector("#app .inicio"), f = document.querySelector(".v3-ficha");
      if (ini && f) f.innerHTML = resumoFicha(ini);
    }
  });

  /* ---------------------------------------------------------------- pós-render */
  function aposRender() {
    var app = document.getElementById("app"); if (!app) return;
    // Idempotente: se render() for embrulhado de novo, não duplica nada.
    Array.prototype.forEach.call(app.querySelectorAll(".v3-side, .v3-pagina, .v3-indice, .v3-passos, .v3-passos-pe"), function (el) { el.remove(); });
    document.body.classList.toggle("v3-em-jogo", jogo());
    if (!jogo()) { try { montarPassos(); } catch (e) { console.warn("v3 passos", e); } return; }
    var lateral = window.innerWidth >= LARG_SIDE;
    document.body.classList.toggle("v3-shell", lateral);
    try { if (lateral) montarLateral(app); } catch (e) { console.warn("v3 lateral", e); }
    try { montarCabecalhoPagina(app); } catch (e) { console.warn("v3 pagina", e); }
    try { montarSanfonas(); } catch (e) { console.warn("v3 sanfona", e); }
    try { montarIndice(app); } catch (e) { console.warn("v3 indice", e); }
    if (rafSpy) cancelAnimationFrame(rafSpy);
    rafSpy = requestAnimationFrame(espiar);
  }

  function instalar() {
    if (typeof window.render !== "function" || window.render.__v3) return;
    var orig = window.render;
    var novo = function () {
      var r = orig.apply(this, arguments);
      try { aposRender(); } catch (e) { console.warn("v3 nav", e); }
      return r;
    };
    novo.__v3 = true;
    window.render = novo;
    try { render = novo; } catch (e) {}
    if (typeof window.sheetMais === "function" && !window.sheetMais.__v3) {
      var folha = function () { return folhaMapa(); };
      folha.__v3 = true; folha._navh = true;
      window.sheetMais = folha;
      try { sheetMais = folha; } catch (e) {}
    }
  }

  var larguraAnt = window.innerWidth;
  window.addEventListener("resize", function () {
    var a = larguraAnt >= LARG_SIDE, b = window.innerWidth >= LARG_SIDE;
    larguraAnt = window.innerWidth;
    if (a !== b) { try { render(); } catch (e) {} }
  });

  // Outras camadas embrulham render() no DOMContentLoaded/load: instala por último.
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(function () { instalar(); try { render(); } catch (e) {} }, 0); });
  window.addEventListener("load", function () { setTimeout(function () { if (!window.render.__v3) { instalar(); try { render(); } catch (e) {} } }, 0); });
})();
