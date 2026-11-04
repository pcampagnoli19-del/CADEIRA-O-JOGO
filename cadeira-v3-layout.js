/* =============================================================================
   CADEIRA v3 — Layout das telas longas (sem esconder nada)
   - O modo compacto (blocos recolhidos com "Abrir detalhes") passa a começar
     desligado; o botão para ligar continua e a escolha fica salva.
   - Telas com muitos blocos (Campanha, Partido, Executivo, Jurídico,
     Submundo) são organizadas em seções com título, em grade de duas colunas
     no computador. O índice "Nesta tela" passa a listar as seções e só rola
     até elas: nenhum bloco é escondido.
   Roda depois dos outros módulos (embrulha o render por fora deles).
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3LAYOUT) return;
  var L = (window.V3LAYOUT = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // Seções por tela: [nome, descrição, regex do título do bloco]. A ordem define a ordem na tela.
  var SECOES = {
    camp: [
      ["Panorama", "Onde você está na corrida", /Cargo-alvo|número na urna|Diagnóstico|Corrida|Candidatura|Debate|Calendário|Pesquisa de intenção|Pesquisas publicadas|Rua|Semana/i],
      ["Dinheiro e marketing", "Caixas, doações e quem cuida da sua imagem", /caixa|Fontes|Agência|Marqueteiro|tráfego|Doaç|Gasto/i],
      ["Eleitorado", "Quem vota em você e por quê", /Eleitorado|Segmentação|perfil|Aprovação/i],
      ["Alianças e regras do jogo", "Dobradinhas, padrinhos e o cálculo das vagas", /Dobradinha|Padrinho|Janela|Quociente|Coligaç|Federa/i]
    ],
    partido: [
      ["Seu partido", "Comando, convenção e prévias", /nº|Painel do Partido|Convenção|Prévias|Diretório|Meu partido/i],
      ["Dinheiro e alianças", "Fundão, federações e coligação", /Fundão|Federaç|Coligação|federação/i],
      ["Novos partidos", "Criação, registro e números", /Fundar|formação|Números/i]
    ],
    poder: [
      ["Seu mandato", "O que está nas suas mãos", /cargo|Minhas leis|Gabinete pessoal|Articular uma pasta|Pasta|Despacho/i],
      ["Obras e programas", "Entregas para a população e memória das gestões", /Obras|Programas|Mobilidade|Memória|Rede metropolitana/i],
      ["Brasil e mundo", "Economia, estatais, Congresso e diplomacia", /Exteriores|macroecon|estatais|Anatomia|Congresso|Diplomac/i]
    ],
    jur: [
      ["Sua situação", "Quem investiga e o tamanho do risco", /Órgãos|Situação|Exposição|Processos|inquérito/i],
      ["Contas e provas", "Prestação de contas, gravações e CPIs", /Contas|Gaveta|CPI|gravaç/i],
      ["Tribunais", "STF e os atalhos no Judiciário", /Judiciário|Supremo|STF|Tribunal/i]
    ],
    sub: [
      ["Dinheiro por fora", "Cofres, esquemas e lavagem", /Cofres|Esquemas|Lavagem|Caixa 2|Offshore/i],
      ["Território", "Acordos nas ruas e nas quebradas", /Vans|Pacto|território|transporte/i]
    ]
  };
  L.SECOES = SECOES;

  // compacto desligado por padrão (respeita a escolha salva do jogador)
  function prefCompacto() { try { var v = localStorage.getItem("cadeira_compacto"); return v === null ? false : v === "1"; } catch (e) { return false; } }
  function aplicarPref() { try { if (typeof S !== "undefined" && S && !S.__v3compPref) { S.compacto = prefCompacto(); S.__v3compPref = true; } } catch (e) {} }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest('[data-a="pfCompacto"]'); if (!b) return;
    setTimeout(function () { try { localStorage.setItem("cadeira_compacto", S.compacto ? "1" : "0"); } catch (er) {} }, 0);
  }, true);

  function titulo(card) { var h = card.querySelector(":scope > h3, :scope > h2, :scope > summary"); return h ? h.textContent.replace(/\s+/g, " ").trim() : ""; }
  function larga(card) { return !!card.querySelector("table, .tb, svg, canvas, .mapa, .v3pf-item, .v3k-grade, .v3d-cal"); }

  function agrupar() {
    var tab; try { tab = S.tab; } catch (e) { return; }
    var conf = SECOES[tab]; if (!conf) return;
    var main = document.getElementById("main"); if (!main || main.querySelector(".v3l-sec")) return;
    var cards = Array.prototype.filter.call(main.children, function (el) { return el.classList && el.classList.contains("card") && titulo(el); });
    if (cards.length < 4) return;
    var grupos = conf.map(function () { return []; }), sobra = [];
    cards.forEach(function (c) {
      var t = titulo(c), k = -1;
      for (var i = 0; i < conf.length; i++) if (conf[i][2].test(t)) { k = i; break; }
      if (k < 0) sobra.push(c); else grupos[k].push(c);
    });
    if (sobra.length) { conf = conf.concat([["Mais nesta tela", "Outros blocos", null]]); grupos.push(sobra); }
    var ancora = cards[0];
    var frag = document.createDocumentFragment(), secs = [];
    conf.forEach(function (s, i) {
      if (!grupos[i].length) return;
      var sec = document.createElement("section");
      sec.className = "v3l-sec"; sec.setAttribute("data-v3l", String(secs.length));
      sec.innerHTML = '<header class="v3l-cab"><h2>' + esc_(s[0]) + "</h2><small>" + esc_(s[1]) + "</small></header>";
      var grid = document.createElement("div"); grid.className = "v3l-grid";
      grupos[i].forEach(function (c) { if (larga(c)) c.classList.add("v3l-larga"); grid.appendChild(c); });
      sec.appendChild(grid); frag.appendChild(sec); secs.push(s[0]);
    });
    main.insertBefore(frag, ancora && ancora.parentNode === main ? ancora : null);
    // índice: lista as seções (só rola, não esconde)
    var ind = main.querySelector(".v3-indice");
    if (ind) {
      var tr = ind.querySelector(".v3-indice-trilho");
      if (tr) tr.innerHTML = secs.map(function (n, i) { return '<button type="button" class="v3-ind" data-v3l-ir="' + i + '">' + esc_(n) + "</button>"; }).join("");
      Array.prototype.forEach.call(ind.querySelectorAll('[data-a="secCols"]'), function (b) { b.remove(); });
    }
    try { window.__v3Cards = Array.prototype.slice.call(main.querySelectorAll(".v3l-sec")); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3l-ir]"); if (!b) return;
    e.stopPropagation();
    var sec = document.querySelector('.v3l-sec[data-v3l="' + b.getAttribute("data-v3l-ir") + '"]'); if (!sec) return;
    var bar = document.querySelector(".v3-indice"), off = bar ? bar.getBoundingClientRect().bottom + 12 : 90;
    window.scrollTo({ top: Math.max(0, sec.getBoundingClientRect().top + window.scrollY - off), behavior: "smooth" });
  }, true);

  function instalar() {
    aplicarPref();
    var o = window.render; if (typeof o !== "function" || o.__v3layout) return;
    var n = function () { aplicarPref(); var r = o.apply(this, arguments); try { agrupar(); } catch (e) { console.warn("v3layout", e); } return r; };
    for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
    n.__v3layout = true; window.render = n; try { render = n; } catch (e) {}
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
