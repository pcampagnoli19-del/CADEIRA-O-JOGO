/* =============================================================================
   CADEIRA v3 — Estado da tela entre redesenhos
   Toda ação redesenha a tela inteira. Isso fazia a página "subir" e fechava
   o que estava aberto. Esta camada envolve o render (por fora de todas as
   outras) e, a cada redesenho na mesma aba:
   - mantém o elemento que você tocou (ou o bloco que estava na tela) no
     mesmo lugar, mesmo que blocos acima mudem de tamanho;
   - reabre os <details> que estavam abertos;
   - devolve a rolagem de modais, listas e tabelas com rolagem própria.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3ESTADO) return;
  var V = (window.V3ESTADO = {});
  var MEUS = typeof WeakSet === "function" ? new WeakSet() : null;
  var profundidade = 0, ultimoToque = null;

  function norm(s) { return String(s || "").replace(/[\d.,%()+\-–—:R$]/g, "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 60); }
  function chaveCard(el) {
    var c = el && el.closest && el.closest("section.card, .sbox, .modal, .card"); if (!c) return "";
    var h = c.querySelector("h3, h2, h4"); return (c.className.split(" ")[0] || "") + "|" + norm(h ? h.textContent : "");
  }
  function seletorDe(el) {
    if (!el || !el.getAttribute) return null;
    var a = el.getAttribute("data-a");
    if (a) { var p = el.getAttribute("data-p"); return '[data-a="' + cssEsc(a) + '"]' + (p != null ? '[data-p="' + cssEsc(p) + '"]' : ""); }
    if (el.id) return "#" + cssEsc(el.id);
    var at = ["data-k", "data-v3f", "data-v3fj", "data-v3nasc", "data-v3nd", "name"];
    for (var i = 0; i < at.length; i++) { var v = el.getAttribute(at[i]); if (v) return el.tagName.toLowerCase() + "[" + at[i] + '="' + cssEsc(v) + '"]'; }
    return null;
  }
  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, "\\$&"); }

  // lembra o último toque (fase de captura, antes do handler que chama render)
  function marcar(e) {
    var t = e.target; if (!t || !t.closest) return;
    var el = t.closest("[data-a], button, select, input, summary, a, [data-v3-passo]") || t;
    var r = el.getBoundingClientRect();
    ultimoToque = { t: Date.now(), sel: seletorDe(el), card: chaveCard(el), top: r.top, tab: tabAtual() };
  }
  document.addEventListener("click", marcar, true);
  document.addEventListener("change", marcar, true);

  function modalAberto() { try { return !!(S.modal || S.sheet); } catch (e) { return false; } }
  function tabAtual() { try { return (gameState ? "j:" : "i:") + S.tab + "|" + (S.subtab || "") + "|" + (window.__v3Passo || 0); } catch (e) { return ""; } }

  function capturar() {
    var app = document.getElementById("app"); if (!app) return null;
    var agora = tabAtual();
    var st = { y: window.scrollY, tab: V.ultimaTab || agora, topo: !!(window.S && S._top), modal: modalAberto(), det: {}, rol: [], ancora: null };
    if (ultimoToque && ultimoToque.tab !== agora) st.tab = ultimoToque.tab;
    // âncora: o elemento tocado há pouco, senão o primeiro bloco visível
    if (ultimoToque && Date.now() - ultimoToque.t < 1500 && ultimoToque.tab === st.tab) st.ancora = ultimoToque;
    else {
      var cards = app.querySelectorAll("#main > section.card, #main > .card, #main section.card");
      for (var i = 0; i < cards.length; i++) { var r = cards[i].getBoundingClientRect(); if (r.bottom > 80) { st.ancora = { sel: null, card: chaveCard(cards[i]), top: r.top }; break; } }
    }
    // details abertos
    Array.prototype.forEach.call(app.querySelectorAll("details"), function (d, i) {
      var s = d.querySelector("summary"); var k = chaveCard(d) + "#" + norm(s ? s.textContent : "") ;
      st.det[k] = d.open;
    });
    // rolagens internas
    var cont = {};
    Array.prototype.forEach.call(app.querySelectorAll("*"), function (el) {
      if (el.scrollTop > 0 || el.scrollLeft > 0) {
        var k = chaveCard(el) + "|" + el.tagName + "." + (typeof el.className === "string" ? el.className : "");
        cont[k] = (cont[k] || 0) + 1;
        st.rol.push({ k: k, n: cont[k], t: el.scrollTop, l: el.scrollLeft });
      }
    });
    return st;
  }

  function achar(an) {
    if (!an) return null;
    if (an.sel) { try { var el = document.querySelector("#app " + an.sel); if (el && el.offsetParent !== null) return el; } catch (e) {} }
    if (an.card) {
      var cs = document.querySelectorAll("#app section.card, #app .card, #app .sbox, #app .modal");
      for (var i = 0; i < cs.length; i++) if (chaveCard(cs[i].querySelector("h3,h2,h4") || cs[i]) === an.card && cs[i].offsetParent !== null) return cs[i];
    }
    return null;
  }

  function restaurar(st) {
    if (!st) return;
    var app = document.getElementById("app"); if (!app) return;
    var mesma = st.tab === tabAtual();
    if (!mesma) return; // trocou de aba/passo: o jogo decide (vai para o topo)
    // details
    Array.prototype.forEach.call(app.querySelectorAll("details"), function (d) {
      var s = d.querySelector("summary"); var k = chaveCard(d) + "#" + norm(s ? s.textContent : "");
      if (st.det[k] === true && !d.open) d.open = true;
    });
    // rolagens internas
    var cont = {};
    var mapa = {}; st.rol.forEach(function (r) { mapa[r.k + "#" + r.n] = r; });
    if (st.rol.length) Array.prototype.forEach.call(app.querySelectorAll("*"), function (el) {
      if (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth) return;
      var k = chaveCard(el) + "|" + el.tagName + "." + (typeof el.className === "string" ? el.className : "");
      cont[k] = (cont[k] || 0) + 1;
      var r = mapa[k + "#" + cont[k]]; if (r) { el.scrollTop = r.t; el.scrollLeft = r.l; }
    });
    if (st.topo || st.modal !== modalAberto()) return;
    // janela: mantém a âncora no mesmo ponto da tela
    var el = achar(st.ancora);
    if (el) { var d = el.getBoundingClientRect().top - st.ancora.top; if (Math.abs(d) > 2) window.scrollBy(0, d); }
    else if (Math.abs(window.scrollY - st.y) > 2) window.scrollTo(0, st.y);
  }

  function embrulhar() {
    var o = window.render; if (typeof o !== "function" || (MEUS && MEUS.has(o)) || o.__v3estadoSelf === o) return;
    var n = function () {
      if (profundidade > 0) return o.apply(this, arguments);
      var st = null; try { st = capturar(); } catch (e) {}
      profundidade++;
      var r; try { r = o.apply(this, arguments); } finally { profundidade--; }
      try { restaurar(st); } catch (e) {}
      V.ultimaTab = tabAtual();
      if (st && !st.topo && st.tab === tabAtual() && st.modal === modalAberto()) requestAnimationFrame(function () { try { var el = achar(st.ancora); if (el && st.tab === tabAtual()) { var d = el.getBoundingClientRect().top - st.ancora.top; if (Math.abs(d) > 2) window.scrollBy(0, d); } } catch (e) {} });
      ultimoToque = null;
      return r;
    };
    for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
    n.__v3estadoSelf = n; if (MEUS) MEUS.add(n);
    window.render = n; try { render = n; } catch (e) {}
  }
  V.embrulhar = embrulhar;
  // fica sempre por fora: confere de tempos em tempos se outra camada embrulhou depois
  embrulhar();
  setInterval(function () { try { embrulhar(); } catch (e) {} }, 1000);
  document.addEventListener("DOMContentLoaded", function () { setTimeout(embrulhar, 50); });
  window.addEventListener("load", function () { setTimeout(embrulhar, 50); });
})();
