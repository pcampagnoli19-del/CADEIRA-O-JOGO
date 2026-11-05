/* =============================================================================
   CADEIRA v3 — Modo foco (telas curtas, nada removido)
   Pós-processamento do DOM depois do render() (como a navegação v3):
   1. ABAS DA TELA: quando a tela tem várias seções e é longa, vira abas no
      topo e mostra uma seção por vez (a escolha fica salva por tela).
   2. SANFONAS: dentro da seção, blocos (cards) viram cabeçalhos recolhidos;
      toque no título para abrir. Blocos enormes sem cards internos são
      divididos pelos subtítulos.
   3. ATALHOS DO CARGO: no topo do "Mês" (e no Menu), botões diretos para o
      que o seu cargo mais usa (Obras e programas, Diário Oficial, Atos,
      Plenário, Campanha...).
   "Ver tudo" volta ao formato antigo (rolagem completa). Tudo continua
   acessível; nenhuma função foi removida.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3FOCO) return;
  var FO = (window.V3FOCO = {});
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function ligado() { return ls("cadeira_ui_foco") !== "0"; }
  function tab() { return ok(function () { return S.tab; }, "") || ""; }
  function jogo() { return ok(function () { return !!gameState; }, false); }
  var SEM_ABAS = { mes: 1, atos: 1, transicao: 1, cela: 1 };
  var abertos = ok(function () { return JSON.parse(ls("cadeira_ui_foco_ab") || "{}"); }, {}) || {};
  function salvarAb() { ls("cadeira_ui_foco_ab", JSON.stringify(abertos)); }
  var selec = ok(function () { return JSON.parse(ls("cadeira_ui_foco_sel") || "{}"); }, {}) || {};
  function salvarSel() { ls("cadeira_ui_foco_sel", JSON.stringify(selec)); }
  function limpa(t) { return String(t || "").replace(/\s+/g, " ").replace(/^[^\wÀ-ú]+\s*/, "").trim(); }
  function tituloDe(el) { var h = el.querySelector(":scope > h2, :scope > h3, :scope > summary, :scope > header h2, :scope > header h3, :scope > div > h2, :scope > div > h3, h2, h3, h4"); return limpa(h ? h.textContent : "").slice(0, 34) || "Seção"; }

  /* ---------------- 1) atalhos do cargo */
  function atalhos() {
    var c = ok(function () { return cargoAtualId(); }, "CIDADAO"), j = ok(function () { return J(); }, {}) || {}, l = [];
    var camp = ok(function () { return !!(j.campanha && j.campanha.cargo_alvo); }, false), t = ok(function () { return M().v3trans; }, null);
    if (/PREF|GOV|PRES/.test(c)) {
      l.push(["obras", "🏗️", "Obras e programas"], ["poder", "🗂️", "Diário Oficial"], ["atos", "✍️", "Atos oficiais"]);
      if (c !== "PRES") l.push(["mob", "🚇", "Mobilidade"]);
      if (c === "PRES") l.push(["poder", "🌎", "Diplomacia"]);
    } else if (/VER|DEPE|DEPF|SEN/.test(c)) l.push(["cong", "📜", "Plenário e projetos"], ["artic", "🤝", "Articulação"], ["atos", "✍️", "Discurso / projeto"]);
    else if (j.pasta) l.push(["pasta", "📁", "Minha pasta"]);
    if (t && t.fase === "aberta") l.unshift(["transicao", "🏛️", "Transição"]);
    if (camp || c === "CIDADAO") l.push(["camp", "🗳️", "Campanha"], ["ele", "📊", "Pesquisas"]);
    l.push(["jornal", "📰", "Jornal"], ["eu", "👤", "Meu perfil"]);
    var vis = {}; l = l.filter(function (x) { var k = x[0] + x[2]; if (vis[k]) return false; vis[k] = 1; return true; });
    return '<nav class="v3f-atalhos" aria-label="Atalhos do seu cargo">' + l.map(function (x) { return '<button type="button" data-a="tab" data-p="' + esc(JSON.stringify([x[0]])) + '"><i>' + x[1] + "</i><span>" + esc(x[2]) + "</span></button>"; }).join("") + "</nav>";
  }
  FO.atalhos = atalhos;

  /* ---------------- 2) sanfonas: cards viram cabeçalhos recolhidos */
  function chave(card) { return tab() + "|" + tituloDe(card); }
  function sanfona(card, abrirPadrao) {
    if (card.__v3f) return; card.__v3f = true;
    var h = card.querySelector(":scope > h3, :scope > h2, :scope > header, :scope > summary");
    if (!h || card.tagName === "DETAILS") return;
    card.classList.add("v3f-sf");
    var k = chave(card), ab = abertos[k] != null ? abertos[k] : abrirPadrao;
    card.classList.toggle("v3f-fechado", !ab);
    h.classList.add("v3f-cab"); h.setAttribute("role", "button"); h.setAttribute("tabindex", "0"); h.setAttribute("aria-expanded", ab ? "true" : "false");
    function alterna(e) { if (e && e.target.closest && e.target.closest("button,a,input,select,label") && e.target.closest("button,a,input,select,label") !== h) return; var f = !card.classList.contains("v3f-fechado"); card.classList.toggle("v3f-fechado", f); h.setAttribute("aria-expanded", f ? "false" : "true"); abertos[k] = !f; salvarAb(); }
    h.addEventListener("click", alterna);
    h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alterna(); } });
  }
  // divide um bloco enorme pelos subtítulos (h3/h4 diretos)
  function dividir(bloco) {
    if (bloco.__v3fd) return; bloco.__v3fd = true;
    var alvo = bloco, filhos = Array.prototype.slice.call(alvo.children);
    var heads = filhos.filter(function (x) { return /^H[34]$/.test(x.tagName); });
    if (heads.length < 2) {
      // tenta um nível abaixo (card único com conteúdo dentro de um div)
      var maior = filhos.filter(function (x) { return x.children && x.children.length > 4; }).sort(function (a, b) { return b.offsetHeight - a.offsetHeight; })[0];
      if (!maior) return; alvo = maior; filhos = Array.prototype.slice.call(alvo.children); heads = filhos.filter(function (x) { return /^H[34]$/.test(x.tagName); });
      if (heads.length < 2) return;
    }
    var grupo = null, primeira = true;
    filhos.forEach(function (n) {
      if (/^H[34]$/.test(n.tagName)) {
        grupo = document.createElement("details"); grupo.className = "v3f-grupo";
        var k = tab() + "|g|" + limpa(n.textContent).slice(0, 40);
        if (abertos[k] != null ? abertos[k] : primeira) grupo.open = true; primeira = false;
        var sm = document.createElement("summary"); sm.innerHTML = n.innerHTML; grupo.appendChild(sm);
        grupo.addEventListener("toggle", function () { abertos[k] = grupo.open; salvarAb(); });
        alvo.insertBefore(grupo, n); n.remove(); return;
      }
      if (grupo) grupo.appendChild(n);
    });
  }
  function compactarBloco(bloco, alt) {
    var cards = bloco.querySelectorAll(":scope > .card, :scope > section, :scope > div > .card");
    cards = Array.prototype.filter.call(cards, function (c) { return c.querySelector(":scope > h3, :scope > h2, :scope > header"); });
    if (cards.length >= 2) { cards.forEach(function (c, i) { sanfona(c, i === 0); if (c.offsetHeight > alt * 2.5) dividir(c); }); return; }
    if (bloco.offsetHeight > alt * 2.5) dividir(bloco);
  }

  /* ---------------- 2b) listas longas: primeiros 8, "mostrar mais" e busca */
  var mostrar = {};
  function listasLongas(main) {
    var achadas = [];
    Array.prototype.forEach.call(main.querySelectorAll("div, ul, ol, section"), function (el) {
      if (el.__v3fl || el.closest(".v3f-oculto")) return;
      var kids = Array.prototype.filter.call(el.children, function (c) { return c.offsetHeight > 0; });
      if (kids.length < 14) return;
      var sig = function (c) { return c.tagName + "." + String(c.className || "").split(" ")[0]; }, s0 = sig(kids[0]);
      var iguais = kids.filter(function (c) { return sig(c) === s0; });
      if (iguais.length < 14 || /^(TR|OPTION|SPAN|I|B|BUTTON|SVG|PATH)$/.test(kids[0].tagName)) return;
      achadas.push([el, iguais]);
    });
    achadas.forEach(function (par, n) {
      var el = par[0], itens = par[1], k = tab() + "|l" + n, lim = mostrar[k] || 8;
      el.__v3fl = true;
      var barra = document.createElement("div"); barra.className = "v3f-lbar";
      barra.innerHTML = '<input type="search" placeholder="Buscar nesta lista (' + itens.length + ' itens)…" aria-label="Buscar nesta lista">';
      var dono = el.closest(".card, section") || el.parentNode, jaBusca = dono && dono.querySelector('input[type="search"], input[placeholder*="uscar"]');
      if (!jaBusca) el.parentNode.insertBefore(barra, el);
      var mais = document.createElement("button"); mais.type = "button"; mais.className = "v3f-mais";
      el.parentNode.insertBefore(mais, el.nextSibling);
      function aplicarLim(q) {
        var vis = 0;
        itens.forEach(function (c) { var bate = !q || c.textContent.toLowerCase().indexOf(q) >= 0; var mostra = bate && (q ? true : vis < lim); if (bate && !q) vis++; c.classList.toggle("v3f-oculto", !mostra); });
        var resto = itens.length - Math.min(lim, itens.length);
        mais.style.display = q || resto <= 0 ? "none" : "";
        mais.textContent = "Mostrar mais " + Math.min(8, resto) + " (faltam " + resto + ")";
      }
      aplicarLim("");
      var inp = barra.querySelector("input");
      inp.addEventListener("input", function () { aplicarLim(inp.value.trim().toLowerCase()); });
      mais.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); lim += 8; mostrar[k] = lim; aplicarLim(""); });
    });
  }

  /* ---------------- 3) abas da tela */
  function blocosDe(main) {
    return Array.prototype.filter.call(main.children, function (el) {
      if (/^(NAV|SCRIPT|STYLE)$/.test(el.tagName) || el.classList.contains("secbar") || el.classList.contains("v3f-abas") || el.classList.contains("v3f-atalhos") || el.classList.contains("v3-pagina")) return false;
      return el.offsetHeight > 30 && !!el.querySelector("h2, h3, summary");
    });
  }
  function aplicar() {
    var main = document.getElementById("main"); if (!main || !jogo()) return;
    Array.prototype.forEach.call(main.querySelectorAll(":scope > .v3f-abas, :scope > .v3f-atalhos"), function (x) { x.remove(); });
    var t = tab(), alt = window.innerHeight || 800;
    if (t === "mes") main.insertAdjacentHTML("afterbegin", atalhos());
    if (!ligado()) { document.body.classList.remove("v3f-on"); if (!SEM_ABAS[t] && blocosDe(main).length >= 2) main.insertAdjacentHTML("afterbegin", '<div class="v3f-abas v3f-off"><button type="button" class="v3f-modo" data-v3f="modo">Modo foco: telas curtas</button></div>'); return; }
    document.body.classList.add("v3f-on");
    var bl = blocosDe(main), total = bl.reduce(function (s, b) { return s + b.offsetHeight; }, 0);
    // tela curta: só compacta blocos internos longos
    if (SEM_ABAS[t] || bl.length < 2 || total < alt * 1.8) { bl.forEach(function (b) { if (b.offsetHeight > alt * 1.6) compactarBloco(b, alt); }); listasLongas(main); return; }
    var idx = selec[t] != null && selec[t] < bl.length ? selec[t] : 0;
    var h = '<div class="v3f-abas" role="tablist">' + bl.map(function (b, i) { return '<button type="button" role="tab" aria-selected="' + (i === idx) + '" class="' + (i === idx ? "on" : "") + '" data-v3f="aba" data-i="' + i + '">' + esc(tituloDe(b)) + "</button>"; }).join("") + '<button type="button" class="v3f-modo" data-v3f="modo" title="Mostrar a tela inteira, como antes">Ver tudo</button></div>';
    bl[0].insertAdjacentHTML("beforebegin", h);
    bl.forEach(function (b, i) { b.classList.toggle("v3f-oculto", i !== idx); });
    var vis = bl[idx];
    if (vis.offsetHeight > alt * 1.4) compactarBloco(vis, alt);
    // índice antigo da navegação vira redundante com as abas
    var ind = main.querySelector(":scope > .v3-indice"); if (ind) ind.classList.add("v3f-oculto");
    // navegação: anterior / próxima seção
    var nav = document.createElement("div"); nav.className = "v3f-pe";
    nav.innerHTML = (idx > 0 ? '<button type="button" data-v3f="aba" data-i="' + (idx - 1) + '">‹ ' + esc(tituloDe(bl[idx - 1])) + "</button>" : "<span></span>") + (idx < bl.length - 1 ? '<button type="button" data-v3f="aba" data-i="' + (idx + 1) + '">' + esc(tituloDe(bl[idx + 1])) + " ›</button>" : "<span></span>");
    vis.insertAdjacentElement("afterend", nav);
    listasLongas(main);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3f]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.getAttribute("data-v3f");
    if (k === "aba") { selec[tab()] = +b.getAttribute("data-i") || 0; salvarSel(); }
    else if (k === "modo") ls("cadeira_ui_foco", ligado() ? "0" : "1");
    ok(function () { render(); });
    var m = document.getElementById("main"); if (m && k === "aba") window.scrollTo({ top: Math.max(0, m.getBoundingClientRect().top + window.scrollY - 70), behavior: "smooth" });
  }, true);
  // folha "Menu" ganha os atalhos no topo
  function menuComAtalhos() {
    var f = window.sheetMais; if (typeof f !== "function" || f.__v3f) return;
    var n = function () { var h = f.apply(this, arguments); try { return String(h).replace(/(<h3>Mapa do jogo<\/h3>)/, '<h3>Atalhos do seu cargo</h3>' + atalhos() + "$1"); } catch (e) { return h; } };
    for (var k in f) { try { n[k] = f[k]; } catch (e) {} }
    n.__v3f = true; window.sheetMais = n; try { sheetMais = n; } catch (e2) {}
  }
  function instalar() {
    menuComAtalhos();
    var o = window.render; if (typeof o !== "function" || o.__v3foco) return;
    var n = function () { var r = o.apply(this, arguments); try { aplicar(); } catch (e) { console.warn("v3 foco", e); } return r; };
    for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
    n.__v3foco = true; window.render = n; try { render = n; } catch (e2) {}
  }
  FO.aplicar = aplicar;
  window.addEventListener("load", function () { setTimeout(function () { instalar(); try { if (jogo()) render(); } catch (e) {} }, 300); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 40) clearInterval(t0); }, 600);
})();
