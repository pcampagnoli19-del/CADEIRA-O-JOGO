/* =============================================================================
   CADEIRA — Fix sessão plenário + protocolar PL + temas + feed figuras reais
   ============================================================================= */
(function () {
  "use strict";

  var SESF = (window.SESF = window.SESF || {});
  SESF.versao = 1;

  function _toast(msg, tipo) {
    try {
      if (typeof toast === "function") toast(msg, tipo || "ok");
    } catch (e) {}
  }
  function _esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function _norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- P0: deduplicar temas (TEMAS_PL + PROJ) ---------- */
  SESF.deduplicarTemas = function () {
    try {
      // Canonical area names from Excel catalog (prefer accents)
      var canonByNorm = {};
      if (typeof BASE_CATALOGO_PROJETOS !== "undefined") {
        BASE_CATALOGO_PROJETOS.forEach(function (it) {
          var a = it.area;
          if (!a) return;
          var n = _norm(a);
          if (!canonByNorm[n] || a.length > canonByNorm[n].length) canonByNorm[n] = a;
        });
      }
      // Prefer accented legacy TEMAS_PL keys when present
      if (typeof TEMAS_PL === "object") {
        Object.keys(TEMAS_PL).forEach(function (k) {
          var n = _norm(k);
          if (!canonByNorm[n]) canonByNorm[n] = k;
          else {
            // keep the one with accents / longer readable form
            var cur = canonByNorm[n];
            if (/[áàâãéêíóôõúç]/i.test(k) && !/[áàâãéêíóôõúç]/i.test(cur)) canonByNorm[n] = k;
          }
        });
      }
      if (typeof TEMAS_PL_MAP === "object") {
        Object.keys(TEMAS_PL_MAP).forEach(function (k) {
          var n = _norm(k);
          if (!canonByNorm[n]) canonByNorm[n] = k;
        });
      }

      // Rebuild TEMAS_PL uniquely
      var novoTemas = {};
      Object.keys(canonByNorm).forEach(function (n) {
        var nome = canonByNorm[n];
        var pos = {};
        if (typeof TEMAS_PL === "object") {
          Object.keys(TEMAS_PL).forEach(function (k) {
            if (_norm(k) === n) Object.assign(pos, TEMAS_PL[k]);
          });
        }
        if (typeof TEMAS_PL_MAP === "object") {
          Object.keys(TEMAS_PL_MAP).forEach(function (k) {
            if (_norm(k) === n) Object.assign(pos, TEMAS_PL_MAP[k]);
          });
        }
        if (!Object.keys(pos).length) pos = { social: 0.5 };
        novoTemas[nome] = pos;
      });
      if (typeof TEMAS_PL === "object") {
        Object.keys(TEMAS_PL).forEach(function (k) {
          delete TEMAS_PL[k];
        });
        Object.keys(novoTemas).forEach(function (k) {
          TEMAS_PL[k] = novoTemas[k];
        });
      } else {
        window.TEMAS_PL = novoTemas;
      }

      // Merge PROJ area keys per casa
      if (typeof PROJ === "object") {
        Object.keys(PROJ).forEach(function (cod) {
          var house = PROJ[cod];
          if (!house || typeof house !== "object") return;
          var merged = {};
          Object.keys(house).forEach(function (area) {
            var canon = canonByNorm[_norm(area)] || area;
            merged[canon] = merged[canon] || [];
            var seen = {};
            merged[canon].forEach(function (t) {
              seen[_norm(t)] = true;
            });
            (house[area] || []).forEach(function (t) {
              var nt = _norm(t);
              if (!seen[nt]) {
                merged[canon].push(t);
                seen[nt] = true;
              }
            });
          });
          Object.keys(house).forEach(function (k) {
            delete house[k];
          });
          Object.keys(merged).forEach(function (k) {
            house[k] = merged[k];
          });
        });
      }
      return Object.keys(novoTemas).length;
    } catch (e) {
      console.warn("SESF.deduplicarTemas", e);
      return 0;
    }
  };

  /* ---------- P0: cardLegislativo mostra lista de PLs (cardProjetos) ---------- */
  function patchCardLegislativo() {
    if (typeof cardLegislativo !== "function" || cardLegislativo._sesf) return;
    var _orig = cardLegislativo;
    window.cardLegislativo = function () {
      try {
        if (typeof safeEnsurePautaProcedural === "function") safeEnsurePautaProcedural();
      } catch (e) {}
      var L = typeof M === "function" && M() ? M().leg : null;
      if (!L) return _orig.apply(this, arguments);

      // Pauta (com painel do plenário) — reaproveita trecho bom do wrap anterior via rebuild leve
      var pautaHtml =
        L.pauta && L.pauta.length
          ? L.pauta
              .map(function (m, i) {
                var tagVeto = m.veto
                  ? '<span class="tag bad">VETADO PELO EXECUTIVO</span>'
                  : m.vetoDerrubado
                    ? '<span class="tag ok">PROMULGADO (VETO DERRUBADO)</span>'
                    : typeof tag === "function"
                      ? tag(m.tipo)
                      : "";
                var autorTxt = m.autorNome
                  ? '<small style="display:block;opacity:0.8">Autor: <b>' +
                    _esc(m.autorNome) +
                    "</b> (" +
                    _esc(m.autorPartido || "") +
                    ")</small>"
                  : "";
                var botoes = "";
                if (!m.voto) {
                  botoes =
                    '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">' +
                    (typeof btn === "function"
                      ? btn("✅ Sim", "votMat", [i, "S"], "mini confirma") +
                        btn("❌ Não", "votMat", [i, "N"], "mini corrige") +
                        btn("⚪ Abstenção", "votMat", [i, "A"], "mini branco") +
                        btn("🏛️ Painel do Plenário", "abrirPlenarioMateria", [i], "mini corrige")
                      : "") +
                    "</div>";
                } else {
                  var rot = { S: "Sim", N: "Não", A: "Abstenção", O: "Obstrução" }[m.voto] || m.voto;
                  botoes =
                    '<p class="done" style="margin-top:6px">Seu voto: <b>' +
                    rot +
                    "</b> · Plenário: " +
                    (m.res && m.res.ok ? "Aprovado" : "Rejeitado") +
                    " (" +
                    (m.res ? m.res.sim : 0) +
                    "% a favor).</p>";
                }
                return (
                  '<div class="mat" style="background:rgba(255,255,255,0.04);border:1px solid var(--linha);border-radius:8px;padding:10px;margin-bottom:8px">' +
                  '<div class="row"><b class="grow">' +
                  _esc(m.nome) +
                  "</b>" +
                  tagVeto +
                  "</div>" +
                  autorTxt +
                  '<p class="txt" style="margin:4px 0"><small>' +
                  _esc(m.descr || "") +
                  "</small></p>" +
                  botoes +
                  "</div>"
                );
              })
              .join("")
          : "<p class='txt'>Nenhuma matéria na pauta do plenário no momento.</p>";

      var casa = typeof casaLegNome === "function" ? casaLegNome() : "Casa";
      var h =
        (typeof card === "function"
          ? card(
              "🏛️ Pauta da Ordem do Dia — " + casa,
              pautaHtml +
                "<p class=\"txt\"><small>Abra o <b>Painel do Plenário</b> para negociar com líderes de bancada nas bolinhas durante a votação.</small></p>"
            )
          : pautaHtml) +
        (typeof cardProjetos === "function" ? cardProjetos() : "") +
        (typeof cardMesa === "function" ? cardMesa() : "");
      return h;
    };
    cardLegislativo._sesf = true;
  }

  // Também corrige A.propPL legado (tema sem índice) — redireciona para abrir lista
  function patchPropPL() {
    try {
      if (typeof A === "undefined") return;
      A.propPL = function (tipo) {
        _toast("Escolha um projeto na lista abaixo (área temática → Protocolar).", "err");
        try {
          S.tab = "cong";
          if (S.cong) S.cong.sub = S.cong.sub || "leg";
          render();
        } catch (e) {}
        // scroll hint: marca tema
        try {
          var el = document.querySelector("[data-i='proj']");
          if (el) el.focus();
        } catch (e2) {}
      };
      // garante propPL2
      A.propPL2 = function (tema, tipo, idx) {
        if (typeof proporPL === "function") proporPL(tema, tipo, idx);
      };
    } catch (e) {}
  }

  /* ---------- P1: líderes no plenário + negociar na sessão ---------- */
  function marcarLideresNaSessao(sl) {
    if (!sl || !sl.membros) return;
    sl.lideresIds = sl.lideresIds || {};
    var porPartido = {};
    sl.membros.forEach(function (n, i) {
      if (!n || n.jogador || n.id === "JOGADOR") return;
      var p = n.partidoBase || n.partido || "?";
      if (!porPartido[p]) porPartido[p] = { id: n.id, idx: i, n: n };
    });
    // Até ~8 líderes (um por partido mais presente)
    Object.keys(porPartido)
      .slice(0, 10)
      .forEach(function (p) {
        var info = porPartido[p];
        info.n._ehLiderBancada = true;
        info.n._bancadaLider = p;
        sl.lideresIds[info.id] = p;
      });
  }

  function patchIniciarSessao() {
    if (typeof iniciarSessaoLegislativa !== "function") return;
    if (iniciarSessaoLegislativa._sesfLider) return;
    var _orig = iniciarSessaoLegislativa;
    window.iniciarSessaoLegislativa = function () {
      // Não bloquear por prep de Articulação
      try {
        var L = M().leg;
        if (L) L.precisaPrepBancadas = false;
      } catch (e) {}
      var r = _orig.apply(this, arguments);
      try {
        if (S.sessaoLeg) marcarLideresNaSessao(S.sessaoLeg);
      } catch (e2) {}
      return r;
    };
    iniciarSessaoLegislativa._sesfLider = true;
  }

  function enriquecerHtmlSessao(h) {
    var sl = S.sessaoLeg;
    if (!sl || !sl.lideresIds) return h;
    // Destacar bolinhas dos líderes (anel ciano) — atributos data-* vêm após fill/stroke
    Object.keys(sl.lideresIds).forEach(function (id) {
      var safeId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var re = new RegExp("<circle([^>]*data-p='\\[\"" + safeId + "\"\\]'[^>]*)>", "g");
      h = h.replace(re, function (full, attrs) {
        if (/lider-dot|stroke-width="2\.8"/.test(full)) return full;
        var a = attrs;
        a = a.replace(/class="sessao-cadeira"/, 'class="sessao-cadeira lider-dot"');
        if (/stroke="/.test(a)) a = a.replace(/stroke="[^"]*"/, 'stroke="#22d3ee"');
        else a += ' stroke="#22d3ee"';
        if (/stroke-width="/.test(a)) a = a.replace(/stroke-width="[^"]*"/, 'stroke-width="2.8"');
        else a += ' stroke-width="2.8"';
        return "<circle" + a + ">";
      });
    });

    // Legenda
    if (h.indexOf("data-sesf-legenda-lider") < 0 && h.indexOf("sessao-legenda-bar") >= 0) {
      h = h.replace(
        /(SUA CADEIRA<\/span>)/,
        '$1<span class="sessao-legenda-item" data-sesf-legenda-lider="1" style="color:#22d3ee;font-weight:800"><span class="sessao-legenda-dot" style="background:#22d3ee;box-shadow:0 0 6px #22d3ee"></span> ◆ LÍDER DE BANCADA (clique p/ negociar)</span>'
      );
    }

    // Painel de negociação no inspector
    var sel = sl.parlamentarSelecionado;
    if (sel && sl.lideresIds[sel] && h.indexOf("data-sesf-nego") < 0) {
      var part = sl.lideresIds[sel];
      var nego =
        '<div class="sessao-inspector-card" data-sesf-nego="1" style="margin-top:8px;border:1px solid #22d3ee;background:rgba(34,211,238,0.08)">' +
        "<b>Negociar com liderança (" +
        _esc(part) +
        ")</b>" +
        '<p class="txt" style="margin:6px 0;font-size:12px;opacity:.9">A conversa mexe nos votos desta bancada nesta matéria. Depois a votação continua.</p>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap">' +
        '<button type="button" class="b mini branco" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([sel, "falar"]) +
        "'>Conversar</button>" +
        '<button type="button" class="b mini corrige" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([sel, "caixa2"]) +
        "'>Caixa 2</button>" +
        '<button type="button" class="b mini confirma" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([sel, "colar"]) +
        "'>Colar na bancada</button>" +
        "</div></div>";
      // inserir após o primeiro sessao-inspector-card
      if (h.indexOf("sessao-inspector-card") >= 0) {
        h = h.replace(/(<\/div>\s*<\/div>\s*)(\s*<!-- 7\.|<!-- FLUXO|<\/div>\s*<div class="sessao-terminal")/, function (m, a, b) {
          return a + nego + b;
        });
        if (h.indexOf("data-sesf-nego") < 0) {
          h = h.replace(/(💡 Dica:[^<]*<\/div>)/, nego + "$1");
        }
        if (h.indexOf("data-sesf-nego") < 0) {
          h = h.replace(/(<div class="sessao-terminal")/, nego + "$1");
        }
      }
    }

    // Dica
    h = h.replace(
      /💡 Dica: Passe o mouse ou clique em qualquer cadeira[^<]*/,
      "💡 Clique nas bolinhas ciano (líderes) para negociar. Demais cadeiras: inspecionar voto."
    );
    return h;
  }

  function patchModaisSessao() {
    if (typeof modais !== "function" || modais._sesf) return;
    var _orig = modais;
    window.modais = function () {
      var h = _orig.apply(this, arguments);
      try {
        if (S.modal && S.modal.tipo === "sessao_leg") h = enriquecerHtmlSessao(h);
      } catch (e) {
        console.warn("SESF sessao enrich", e);
      }
      return h;
    };
    modais._sesf = true;
  }

  function aplicarInfluenciaBancada(partido, deltaSim, forcarImediato) {
    var sl = S.sessaoLeg;
    if (!sl) return 0;
    sl.votos = sl.votos || {};
    var n = 0;
    sl.membros.forEach(function (m) {
      if (!m || m.jogador || m.id === "JOGADOR") return;
      if ((m.partidoBase || m.partido) !== partido) return;
      m._biasSessao = (m._biasSessao || 0) + (deltaSim || 0) + (forcarImediato ? 1.0 : 0);
      if (sl.votos[m.id]) return; // já votou
      if (forcarImediato) {
        sl.votos[m.id] = deltaSim >= 0 ? "S" : "N";
      }
      n++;
    });
    return n;
  }

  function _sesfSaldoCaixa2() {
    try {
      var j = J();
      if (j && j.financas && j.financas.caixa2 != null) return Number(j.financas.caixa2) || 0;
      return Number(j && j.caixa2) || 0;
    } catch (e) {
      return 0;
    }
  }
  function _sesfDebitarCaixa2(v) {
    var j = J();
    if (!j) return false;
    j.financas = j.financas || {};
    var saldo = _sesfSaldoCaixa2();
    if (saldo < v) return false;
    j.financas.caixa2 = saldo - v;
    return true;
  }

  function patchSimularVoto() {
    if (typeof simularVotoNPC !== "function" || simularVotoNPC._sesf) return;
    var _orig = simularVotoNPC;
    window.simularVotoNPC = function (npc, materia) {
      var v = _orig.apply(this, arguments);
      try {
        if (npc && npc._biasSessao) {
          var b = npc._biasSessao;
          if (b > 0.15 && Math.random() < Math.min(0.85, 0.4 + b)) v = "S";
          else if (b < -0.15 && Math.random() < Math.min(0.85, 0.4 - b)) v = "N";
        }
      } catch (e) {}
      return v;
    };
    simularVotoNPC._sesf = true;
  }

  function registrarNegociacao() {
    if (typeof A === "undefined") return false;
    A.sessaoNegociar = function (id, modo) {
      var sl = S.sessaoLeg;
      if (!sl || sl.concluida) return;
      var part = sl.lideresIds && sl.lideresIds[id];
      if (!part) {
        _toast("Só dá para negociar com líderes de bancada (bolinhas destacadas).", "err");
        return;
      }
      if (sl._negoFeitas && sl._negoFeitas[id + ":" + modo]) {
        _toast("Você já fez essa jogada com este líder nesta sessão.", "err");
        return;
      }
      sl._negoFeitas = sl._negoFeitas || {};

      if (modo === "falar") {
        if (typeof gastarEnergia === "function" && !gastarEnergia(2)) return;
        var afetados = aplicarInfluenciaBancada(part, 0.25, true);
        sl._negoFeitas[id + ":" + modo] = true;
        _toast("Bancada " + part + ": +" + afetados + " votos para SIM", "ok");
      } else if (modo === "caixa2") {
        var custo = 40000;
        if (!_sesfDebitarCaixa2(custo)) {
          _toast("Caixa 2 insuficiente (precisa R$ 40 mil).", "err");
          return;
        }
        var nCx = aplicarInfluenciaBancada(part, 0.45, true);
        sl._negoFeitas[id + ":" + modo] = true;
        _toast("Bancada " + part + ": +" + nCx + " votos para SIM (Caixa 2)", "err");
        try {
          if (typeof emitirFato === "function")
            emitirFato({
              tipo: "fato_oculto",
              categoria: "escandalo",
              gravidade: 2,
              valencia: -12,
              origem: "boato",
              dados: { texto: "Negociação de bastidor no plenário" }
            });
        } catch (e) {}
      } else if (modo === "colar") {
        if (typeof gastarEnergia === "function" && !gastarEnergia(3)) return;
        var nCol = aplicarInfluenciaBancada(part, 0.35, true);
        try {
          var j2 = J();
          j2.atributos = j2.atributos || {};
          j2.atributos.influencia = Math.min(100, (j2.atributos.influencia || 0) + 0.4);
        } catch (eInf) {}
        sl._negoFeitas[id + ":" + modo] = true;
        _toast("Bancada " + part + ": +" + nCol + " votos para SIM", "ok");
      }
      // pausa votação para o jogador ver o efeito, depois pode retomar
      try {
        if (sl.emAndamento && typeof A.sessaoPausar === "function") A.sessaoPausar();
        else render();
      } catch (e) {
        try {
          render();
        } catch (e2) {}
      }
    };
    return true;
  }

  /* Desativar prep de Articulação (conceito errado) — manter só veto UI se útil */
  function desativarPrepArticulacao() {
    try {
      if (typeof LEGF !== "undefined" && LEGF.renderPrepBancadas) {
        LEGF.renderPrepBancadas = function () {
          return "";
        };
      }
    } catch (e) {}
  }

  /* ---------- P1: feed com figuras reais ---------- */
  var FIGURAS_FEED = [
    { nome: "Reinaldo Azevedo", handle: "@reinaldoazevedo", tipo: "influencer", tag: "Imprensa / Colunista" },
    { nome: "William Bonner", handle: "@bonner", tipo: "influencer", tag: "Telejornalismo" },
    { nome: "Vera Magalhães", handle: "@veramagalhaes", tipo: "influencer", tag: "Jornalismo político" },
    { nome: "Felipe Neto", handle: "@felipeneto", tipo: "influencer", tag: "Influenciador" },
    { nome: "José Luiz Datena", handle: "@datenaoficial", tipo: "influencer", tag: "TV / Opinião" },
    { nome: "Guga Chacra", handle: "@gugachacra", tipo: "influencer", tag: "Internacional" },
    { nome: "Augusto Nunes", handle: "@augustosnunes", tipo: "influencer", tag: "Colunista" },
    { nome: "Leonardo Sakamoto", handle: "@sakamoto", tipo: "influencer", tag: "Direitos humanos" }
  ];

  SESF.postsFigurasReais = function () {
    var posts = [];
    var j = typeof J === "function" ? J() : { nome: "Candidato", cargo_atual: "Parlamentar", partido_atual: "" };
    var fatos = [];
    try {
      var st = typeof IMPF !== "undefined" && IMPF.estado ? IMPF.estado() : null;
      fatos = (st && st.fatos) || [];
    } catch (e) {}
    var fato = fatos[0];
    var temaTxt =
      fato && fato.dados && (fato.dados.projeto || fato.dados.texto_legado)
        ? String(fato.dados.projeto || fato.dados.texto_legado).slice(0, 80)
        : fato
          ? String(fato.tipo || "pauta").replace(/_/g, " ")
          : "a movimentação política da semana";

    FIGURAS_FEED.forEach(function (fig, idx) {
      var npc =
        typeof bancoDeNPCs !== "undefined"
          ? bancoDeNPCs.find(function (n) {
              return n.vivo && n.nome && n.nome.indexOf(fig.nome.split(" ")[0]) === 0 && n.nome.indexOf(fig.nome.split(" ").slice(-1)[0]) >= 0;
            })
          : null;
      if (!npc && typeof bancoDeNPCs !== "undefined") {
        npc = bancoDeNPCs.find(function (n) {
          return n.vivo && n.nome === fig.nome;
        });
      }
      var nome = npc ? npc.nome : fig.nome;
      var textos = [
        "Atenção: a movimentação de " + j.nome + " (" + (j.partido_atual || "") + ") em torno de " + temaTxt + " não passa em branco. Quem articula mal, paga na urna.",
        "No ar: " + nome.split(" ")[0] + " comenta a repercussão de \"" + temaTxt + "\" e o papel de " + j.nome + " no tabuleiro.",
        "Bastidores: " + j.cargo_atual + " " + j.nome + " virou assunto nas redações por causa de " + temaTxt + ".",
        "Opinião: ou a base se organiza em torno de " + temaTxt + ", ou a narrativa engole o mandato de " + j.nome + "."
      ];
      var foto = "";
      try {
        if (npc && typeof obterFotoPolitico === "function") foto = obterFotoPolitico(npc) || npc.foto || "";
        else if (npc) foto = npc.foto || "";
      } catch (e) {}
      posts.push({
        id: "POST_REAL_" + idx + "_" + (fato && fato.id ? fato.id : "x"),
        autor: nome,
        handle: fig.handle,
        foto: foto,
        tipo: fig.tipo,
        selo: "✔️",
        tagTipo: fig.tag,
        alcance: (npc && npc.base_votos ? Math.round(npc.base_votos / 100) + "k" : "800k+") + " seguidores",
        tempo: "Há " + (5 + idx * 7) + " min",
        texto: textos[idx % textos.length],
        likes: 3000 + idx * 1100,
        rts: 400 + idx * 180,
        citouJogador: true,
        sentimento: fato && fato.valencia < -10 ? "ataque" : fato && fato.valencia > 10 ? "apoio" : "neutro",
        podeProcessar: false,
        _figuraReal: true
      });
    });

    // Políticos vivos relevantes (até 6)
    try {
      var pols = (bancoDeNPCs || [])
        .filter(function (n) {
          return n.vivo && !n.jogador && /Senador|Deputado|Governador|Prefeito|Ministro/.test(n.cargo || "");
        })
        .sort(function (a, b) {
          return (b.popularidade || 0) - (a.popularidade || 0);
        })
        .slice(0, 6);
      pols.forEach(function (n, i) {
        posts.push({
          id: "POST_POL_" + (n.id || i),
          autor: n.nome,
          handle: "@" + String(n.nome || "pol")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "")
            .slice(0, 14),
          foto: typeof obterFotoPolitico === "function" ? obterFotoPolitico(n) || n.foto || "" : n.foto || "",
          tipo: "politico",
          selo: n.real ? "✔️" : "",
          tagTipo: n.cargo || "Parlamentar",
          alcance: Math.round((n.base_votos || 50000) / 1000) + "k base",
          tempo: "Há " + (12 + i * 5) + " min",
          texto:
            (n.partido || n.partidoBase || "Partido") +
            ": acompanhamos de perto " +
            temaTxt +
            ". " +
            j.nome +
            " terá de se posicionar.",
          likes: 800 + i * 120,
          rts: 90 + i * 20,
          citouJogador: true,
          sentimento: "neutro",
          podeProcessar: false,
          _figuraReal: true
        });
      });
    } catch (e) {}
    return posts;
  };

  function patchFeedFiguras() {
    if (typeof IMPF === "undefined" || !IMPF.postsParaUI) return;
    if (IMPF.postsParaUI._sesf) return;
    var _orig = IMPF.postsParaUI;
    IMPF.postsParaUI = function () {
      var reais = SESF.postsFigurasReais();
      var bus = [];
      try {
        bus = _orig.apply(this, arguments) || [];
      } catch (e) {}
      // Preferir reais no topo; depois posts do barramento
      var seen = {};
      var out = [];
      reais.concat(bus || []).forEach(function (p) {
        var k = (p.handle || p.autor || "") + ":" + (p.texto || "").slice(0, 40);
        if (seen[k]) return;
        seen[k] = true;
        out.push(p);
      });
      return out.slice(0, 40);
    };
    IMPF.postsParaUI._sesf = true;
  }

  /* ---------- P2: pele real como default; botão Pele fora da aba do jogador ---------- */
  function patchPeleDefault() {
    try {
      if (typeof IMPF === "undefined" || !IMPF.estado) return;
      var st = IMPF.estado();
      if (st && !st._peleEscolhidaPeloUsuario) {
        st.usar_nomes_reais = true;
      }
      if (!IMPF.toggleNomesReais._sesf) {
        var _tog = IMPF.toggleNomesReais;
        IMPF.toggleNomesReais = function () {
          var s = IMPF.estado();
          if (s) s._peleEscolhidaPeloUsuario = true;
          return _tog.apply(this, arguments);
        };
        IMPF.toggleNomesReais._sesf = true;
      }
      // Remove botões de debug (Pele / Inspetor) se algum wrap antigo ainda injetar
      if (!IMPF.renderCapaDoDia._sesfStripDev) {
        var _capa = IMPF.renderCapaDoDia;
        IMPF.renderCapaDoDia = function () {
          var html = _capa.apply(this, arguments);
          html = html.replace(/<button[^>]*data-a="impfToggleNomes"[^>]*>[\s\S]*?<\/button>/gi, "");
          html = html.replace(/<button[^>]*data-a="impfInspetor"[^>]*>[\s\S]*?<\/button>/gi, "");
          return html;
        };
        IMPF.renderCapaDoDia._sesfStripDev = true;
      }
    } catch (e) {}
  }

  function boot() {
    try {
      SESF.deduplicarTemas();
      patchCardLegislativo();
      patchPropPL();
      patchIniciarSessao();
      patchModaisSessao();
      patchSimularVoto();
      registrarNegociacao();
      desativarPrepArticulacao();
      patchFeedFiguras();
      patchPeleDefault();
    } catch (e) {
      console.warn("SESF boot", e);
    }
  }

  boot();
  var n = 0;
  var t = setInterval(function () {
    boot();
    if (++n > 60) clearInterval(t);
  }, 200);
  ["DOMContentLoaded", "load"].forEach(function (ev) {
    document.addEventListener(ev, boot);
  });

  SESF.resumo = function () {
    return {
      versao: SESF.versao,
      temas: typeof TEMAS_PL !== "undefined" ? Object.keys(TEMAS_PL).length : 0,
      cardLeg: !!(typeof cardLegislativo === "function" && cardLegislativo._sesf)
    };
  };
})();
