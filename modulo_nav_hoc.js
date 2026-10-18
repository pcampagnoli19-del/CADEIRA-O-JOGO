/* =============================================================================
   CADEIRA — Navegação agrupada (House of Cards)
   ~6 hubs no topo + submenus. Não remove conteúdo; só reorganiza onde aparece.
   ============================================================================= */
(function () {
  "use strict";

  var NAVH = (window.NAVH = window.NAVH || {});
  NAVH.versao = 1;

  /** Hubs do topo. Cada sub aponta para um id real de VIEWS/TABS. */
  var HUBS = [
    {
      id: "gabinete",
      nome: "Gabinete",
      subs: [
        ["mes", "Cenário"],
        ["eu", "Perfil"],
        ["mang", "Manchetes"],
        ["cela", "Cela"]
      ]
    },
    {
      id: "campanha",
      nome: "Campanha",
      subs: [
        ["camp", "Campanha"],
        ["mapa", "Mapa"],
        ["ele", "Eleições"]
      ]
    },
    {
      id: "partido",
      nome: "Partido",
      subs: [["partido", "Partido"]]
    },
    {
      id: "poder",
      nome: "Poder",
      subs: [["poder", "Executivo & pastas"]]
    },
    {
      id: "congresso",
      nome: "Congresso",
      subs: [
        ["cong", "Plenário"],
        ["artic", "Articulação"],
        ["jur", "Jurídico"]
      ]
    },
    {
      id: "influencia",
      nome: "Influência",
      subs: [
        ["inf", "Rede & figuras"],
        ["todos", "Elenco"],
        ["imp", "Imprensa"],
        ["sub", "Submundo"]
      ]
    }
  ];

  NAVH.HUBS = HUBS;

  function hubOfTab(tabId) {
    for (var i = 0; i < HUBS.length; i++) {
      var h = HUBS[i];
      for (var j = 0; j < h.subs.length; j++) {
        if (h.subs[j][0] === tabId) return h;
      }
    }
    return null;
  }

  function knownTabIds() {
    var set = {};
    HUBS.forEach(function (h) {
      h.subs.forEach(function (s) {
        set[s[0]] = true;
      });
    });
    return set;
  }

  function orphanTabs() {
    var known = knownTabIds();
    if (typeof TABS === "undefined") return [];
    return TABS.filter(function (t) {
      return t && t[0] && !known[t[0]];
    });
  }

  function escSafe(s) {
    if (typeof esc === "function") return esc(s);
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureState() {
    if (typeof S === "undefined") return;
    S.hubSub = S.hubSub || {};
  }

  function pickSub(hub) {
    ensureState();
    var remembered = S.hubSub[hub.id];
    if (remembered) {
      for (var i = 0; i < hub.subs.length; i++) {
        if (hub.subs[i][0] === remembered) return remembered;
      }
    }
    // Cela só como default se preso
    if (hub.id === "gabinete") {
      try {
        if (typeof preso === "function" && preso()) return "cela";
      } catch (e) {}
    }
    return hub.subs[0][0];
  }

  function subnavHtml() {
    if (typeof S === "undefined" || !S.tab) return "";
    var hub = hubOfTab(S.tab);
    if (!hub || hub.subs.length <= 1) return "";
    var html =
      '<nav class="subtabs" role="tablist" aria-label="Seções de ' +
      escSafe(hub.nome) +
      '">';
    hub.subs.forEach(function (pair) {
      var id = pair[0];
      var label = pair[1];
      // Esconde Cela se não estiver preso (ainda acessível via orfãos se necessário)
      if (id === "cela") {
        try {
          if (!(typeof preso === "function" && preso()) && !(J() && J().juridico && J().juridico.status === "PRISAO_DOMICILIAR")) {
            return;
          }
        } catch (e) {}
      }
      var on = S.tab === id;
      html +=
        '<button type="button" role="tab" aria-selected="' +
        on +
        '" class="subtab' +
        (on ? " on" : "") +
        '" data-a="tab" data-p=\'' +
        JSON.stringify([id]) +
        "'>" +
        escSafe(label) +
        "</button>";
    });
    html += "</nav>";
    return html;
  }

  function tabsBarHub() {
    ensureState();
    var curHub = hubOfTab(S.tab);
    var html = '<nav class="tabs tabs-hub" role="tablist" aria-label="Menu principal">';
    HUBS.forEach(function (h) {
      var on = curHub && curHub.id === h.id;
      var alerta = false;
      if (h.id === "gabinete") {
        try {
          alerta = typeof preso === "function" && (preso() || (J() && J().juridico && J().juridico.status === "PRISAO_DOMICILIAR"));
        } catch (e) {}
      }
      html +=
        '<button type="button" role="tab" aria-selected="' +
        !!on +
        '" class="tab' +
        (on ? " on" : "") +
        (alerta ? " alerta" : "") +
        '" data-a="hub" data-p=\'' +
        JSON.stringify([h.id]) +
        "'>" +
        escSafe(h.nome) +
        "</button>";
    });
    // Orfãos (Editor etc.) — botão Mais se houver
    var orfs = orphanTabs();
    if (orfs.length) {
      html +=
        '<button type="button" class="tab' +
        (S.sheet ? " on" : "") +
        '" data-a="sheet" data-p=\'[]\'>Mais</button>';
    }
    html += "</nav>";
    html += subnavHtml();
    return html;
  }

  function patchTabAction() {
    if (typeof A === "undefined") return false;
    if (!A.tab || A.tab._navh) {
      // still register hub
    } else {
      var _tab = A.tab;
      A.tab = function (id) {
        ensureState();
        var h = hubOfTab(id);
        if (h) S.hubSub[h.id] = id;
        S.sheet = false;
        return _tab.apply(this, arguments);
      };
      A.tab._navh = true;
    }

    A.hub = function (hubId) {
      ensureState();
      var hub = null;
      for (var i = 0; i < HUBS.length; i++) {
        if (HUBS[i].id === hubId) {
          hub = HUBS[i];
          break;
        }
      }
      if (!hub) return;
      var sub = pickSub(hub);
      S.hubSub[hub.id] = sub;
      if (typeof A.tab === "function") A.tab(sub);
      else {
        S.tab = sub;
        S._top = true;
      }
      // Garante remount mesmo se o handler de clique não chamar render
      try {
        if (typeof render === "function") render();
      } catch (e) {}
    };
    return true;
  }

  /** Sanitiza estado que quebrava a aba Mês/Gabinete (reading '0'). */
  function sanitizeMesState() {
    try {
      if (typeof M !== "function" || !gameState) return;
      var m = M();
      if (!m) return;
      if (m.relatorio && Array.isArray(m.relatorio.linhas)) {
        m.relatorio.linhas.forEach(function (l) {
          if (l && !Array.isArray(l.itens)) l.itens = [];
        });
      }
      if (Array.isArray(m.feedMes)) {
        m.feedMes.forEach(function (x) {
          if (x && (x.mes == null || !(typeof MESES !== "undefined" && MESES[x.mes]))) x.mes = (typeof dt === "function" && dt().mes) || 1;
        });
      }
    } catch (e) {}
  }

  function patchMesView() {
    if (typeof VIEWS === "undefined" || typeof VIEWS.mes !== "function" || VIEWS.mes._navhGuard) return false;
    var _vm = VIEWS.mes;
    VIEWS.mes = function () {
      sanitizeMesState();
      try {
        return _vm.apply(this, arguments);
      } catch (e) {
        console.error("NAVH mes guard", e);
        try {
          return (
            '<section class="card"><h3>Cenário</h3><p class="txt">Houve um erro ao montar o mês (' +
            (typeof esc === "function" ? esc(e.message) : String(e.message || e)) +
            "). Tente outra subaba ou avance o mês.</p></section>"
          );
        } catch (e2) {
          return "<section class=\"card\"><h3>Cenário</h3><p class=\"txt\">Erro ao montar o mês.</p></section>";
        }
      }
    };
    VIEWS.mes._navhGuard = true;
    return true;
  }

  function patchTabsBar() {
    if (typeof tabsBar !== "function" || tabsBar._navh) return false;
    window.tabsBar = function () {
      return tabsBarHub();
    };
    tabsBar._navh = true;
    return true;
  }

  function patchBottomNav() {
    // Atualiza NAV_PRINC para os hubs (mobile) se existir
    try {
      if (typeof NAV_PRINC !== "undefined" && Array.isArray(NAV_PRINC)) {
        // Mantém 4 slots + Mais no footer legado: Gabinete, Campanha, Congresso, Influência
        NAV_PRINC.length = 0;
        NAV_PRINC.push("mes", "camp", "cong", "inf");
      }
    } catch (e) {}

    if (typeof footerBar !== "function" || footerBar._navh) return !!footerBar;
    var _fb = footerBar;
    window.footerBar = function () {
      var h = _fb.apply(this, arguments);
      // Troca sheetMais para listar órfãos + atalho aos hubs se sheet aberto
      try {
        if (S.sheet && typeof sheetMais === "function") {
          // reforça grid com órfãos
        }
      } catch (e) {}
      return h;
    };
    footerBar._navh = true;

    if (typeof sheetMais === "function" && !sheetMais._navh) {
      var _sm = sheetMais;
      window.sheetMais = function () {
        var orfs = orphanTabs();
        var extra = "";
        if (orfs.length) {
          extra =
            '<h3 class="hoc-mais-h">Outras seções</h3><div class="sgrid">' +
            orfs
              .map(function (t) {
                return (
                  '<button type="button" class="b branco' +
                  (S.tab === t[0] ? " sel" : "") +
                  "\" data-a=\"tab\" data-p='" +
                  JSON.stringify([t[0]]) +
                  "'>" +
                  escSafe(t[1]) +
                  "</button>"
                );
              })
              .join("") +
            "</div>";
        }
        var h = _sm.apply(this, arguments);
        if (extra && h.indexOf("hoc-mais-h") < 0) {
          h = h.replace(/<h3>Mais seções<\/h3>/, "<h3>Mais seções</h3>" + extra);
        }
        return h;
      };
      sheetMais._navh = true;
    }
    return true;
  }

  function remapperDeepLinks() {
    // A.arAbrir etc. já setam S.tab="artic" — hubOf cuida do highlight
    return true;
  }

  function boot() {
    try {
      patchTabAction();
      patchTabsBar();
      patchBottomNav();
      patchMesView();
      remapperDeepLinks();
      // Se tab atual for órfã ok; se for desconhecida, manda pro Gabinete
      if (typeof S !== "undefined" && S.tab && !hubOfTab(S.tab)) {
        var known = knownTabIds();
        if (!known[S.tab] && orphanTabs().every(function (t) { return t[0] !== S.tab; })) {
          S.tab = "mes";
        }
      }
    } catch (e) {
      console.warn("NAVH boot", e);
    }
  }

  boot();
  var n = 0;
  var t = setInterval(function () {
    boot();
    if (++n > 80) clearInterval(t);
  }, 200);
  ["DOMContentLoaded", "load"].forEach(function (ev) {
    document.addEventListener(ev, boot);
  });

  NAVH.resumo = function () {
    return {
      versao: NAVH.versao,
      hubs: HUBS.map(function (h) {
        return { id: h.id, nome: h.nome, subs: h.subs.map(function (s) { return s[0]; }) };
      })
    };
  };
})();
