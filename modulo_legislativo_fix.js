/* =============================================================================
   CADEIRA — Fix Legislativo + catálogo Excel (266 PLs)
   P0: mapa Campanário / pathG sem crash ao virar senador
   P1: PL do jogador entra em L.pauta (votação real) + derrubar veto
   P1: plenário mensal com pool do Excel + arco de bancadas pré-sessão
   ============================================================================= */
(function () {
  "use strict";

  var LEGF = (window.LEGF = window.LEGF || {});
  LEGF.versao = 1;

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

  /* ---------- P0: pathG / centros de mapa seguros ---------- */
  function patchPathG() {
    if (typeof pathG !== "function" || pathG._legf) return;
    var _orig = pathG;
    window.pathG = function (g, id, fill, label, valor, sel, small) {
      try {
        if (!g || !g.p || !g.p[id]) return "";
        var c = (g.c && g.c[id]) || [0, 0];
        if (!Array.isArray(c) || c.length < 2) c = [0, 0];
        var d = g.p[id];
        var lab = label == null ? id : label;
        var val = valor == null ? "" : valor;
        return (
          '<g data-a="mapsel" data-p=\'["' +
          id +
          '"]\' class="mt ' +
          (sel === id ? "sel" : "") +
          '" tabindex="0" role="button" aria-label="' +
          (typeof esc === "function" ? esc(lab) : _esc(lab)) +
          '"><path d="' +
          d +
          '" style="' +
          (fill || "") +
          '"/>' +
          (small
            ? ""
            : '<text x="' +
              c[0] +
              '" y="' +
              (c[1] - 1) +
              '" text-anchor="middle" class="ml">' +
              (typeof esc === "function" ? esc(lab) : _esc(lab)) +
              "</text>" +
              (val
                ? '<text x="' +
                  c[0] +
                  '" y="' +
                  (c[1] + 11) +
                  '" text-anchor="middle" class="mv">' +
                  (typeof esc === "function" ? esc(val) : _esc(val)) +
                  "</text>"
                : "")) +
          "</g>"
        );
      } catch (e) {
        console.warn("pathG safe", id, e);
        return "";
      }
    };
    pathG._legf = true;
  }

  function patchSvgSP() {
    if (typeof svgSP !== "function" || svgSP._legf) return;
    var _orig = svgSP;
    window.svgSP = function (modoF) {
      try {
        var g = typeof GEO !== "undefined" ? GEO.sp : null;
        if (!g || !g.p) return _orig.apply(this, arguments);
        var sel = S.map && S.map.sel;
        var modo = modoF || (S.map && S.map.modo) || "aprov";
        var j = J();
        var peq = { capital: "Grande SP", baixada: "Baixada" };
        return (
          '<svg viewBox="0 0 ' +
          g.w +
          " " +
          g.h +
          '" class="mapa" role="group" aria-label="Mapa do estado de São Paulo por região">' +
          Object.keys(g.p)
            .map(function (id) {
              var t = TERRITORIOS.find(function (a) {
                return a.id === id;
              });
              if (!t) return "";
              var val =
                modo === "aprov"
                  ? Math.round((j.aprovacao && j.aprovacao[id]) || 0) + "%"
                  : modo === "traf"
                    ? typeof fmtK === "function"
                      ? fmtK((j.campanha && j.campanha.trafego && j.campanha.trafego[id]) || 0)
                      : "0"
                    : (typeof fmtV === "function" ? fmtV(t.el) : t.el) + " mil";
              var small = !!peq[id];
              var fill =
                typeof corTerr === "function"
                  ? (function () {
                      var m0 = S.map.modo;
                      S.map.modo = modo;
                      var r = corTerr(id);
                      S.map.modo = m0;
                      return r;
                    })()
                  : "";
              var label = t.nome.replace(" e região", "").replace("Presidente", "Pres.");
              var base = pathG(g, id, fill, label, val, sel, small);
              if (!small) return base;
              var c = (g.c && g.c[id]) || [0, 0];
              var ox = id === "baixada" ? 14 : 0;
              var oy = id === "baixada" ? 12 : 0;
              return (
                base +
                '<text x="' +
                (c[0] + ox) +
                '" y="' +
                (c[1] + oy) +
                '" text-anchor="middle" class="mv" style="pointer-events:none">' +
                peq[id] +
                " " +
                val +
                "</text>"
              );
            })
            .join("") +
          "</svg>"
        );
      } catch (e) {
        console.warn("svgSP safe", e);
        try {
          return _orig.apply(this, arguments);
        } catch (e2) {
          return "<p class='txt'>Mapa SP indisponível.</p>";
        }
      }
    };
    svgSP._legf = true;
  }

  function garantirAprovacaoTodosTerritorios() {
    try {
      var j = typeof J === "function" ? J() : null;
      if (!j) return;
      j.aprovacao = j.aprovacao || {};
      j.campanha = j.campanha || {};
      j.campanha.trafego = j.campanha.trafego || {};
      (TERRITORIOS || []).forEach(function (t) {
        if (j.aprovacao[t.id] == null || isNaN(j.aprovacao[t.id])) {
          j.aprovacao[t.id] = 40 + Math.random() * 15;
        }
        if (j.campanha.trafego[t.id] == null) j.campanha.trafego[t.id] = 0;
      });
    } catch (e) {}
  }

  function patchCheatsSetCargo() {
    try {
      if (!window.cheats || typeof cheats.setCargo !== "function" || cheats.setCargo._legf) return;
      var _orig = cheats.setCargo;
      cheats.setCargo = function () {
        var r = _orig.apply(this, arguments);
        garantirAprovacaoTodosTerritorios();
        try {
          if (S && S.map) {
            var cid = typeof cargoAtualId === "function" ? cargoAtualId() : "";
            if (cid === "SEN" || cid === "DEPF" || cid === "PRES") S.map.vista = S.map.vista || "br";
            else if (cid === "DEPE" || cid === "GOV") S.map.vista = S.map.vista === "maua" ? "sp" : S.map.vista;
          }
        } catch (e) {}
        return r;
      };
      cheats.setCargo._legf = true;
    } catch (e) {}
  }

  /* ---------- Catálogo Excel → MATERIAS / DB / pauta ---------- */
  function posDeArea(area) {
    var map =
      typeof TEMAS_PL_MAP !== "undefined"
        ? TEMAS_PL_MAP
        : typeof TEMAS_PL !== "undefined"
          ? TEMAS_PL
          : {};
    var keys = Object.keys(map);
    var hit = keys.find(function (k) {
      return k.toLowerCase() === String(area || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    });
    if (!hit) {
      hit = keys.find(function (k) {
        return (
          String(area || "")
            .toLowerCase()
            .indexOf(k.toLowerCase().slice(0, 5)) >= 0 ||
          k.toLowerCase().indexOf(String(area || "").toLowerCase().slice(0, 5)) >= 0
        );
      });
    }
    return Object.assign({}, (hit && map[hit]) || { social: 0.5 });
  }

  function casaCodDeItem(item) {
    if (item.casaCod) return item.casaCod === "C" || item.casaCod === "S" ? item.casaCod : item.casaCod;
    var c = item.casa || "";
    if (/Senado/i.test(c)) return "S";
    if (/Deputados|Câmara dos/i.test(c)) return "C";
    if (/ALESP/i.test(c)) return "E";
    return "M";
  }

  function itemParaMateria(item) {
    var cod = casaCodDeItem(item);
    var casaPool = cod === "C" || cod === "S" ? "F" : cod;
    return {
      id: item.id,
      nome: item.titulo,
      tipo: item.tipo || "PL",
      ementa: item.ementa || "",
      descr: item.ementa || "",
      tema: item.area || "Gestão Pública",
      pos: posDeArea(item.area),
      casa: casaPool,
      casaCod: cod,
      polemica: item.polemica || 2,
      nivel: item.nivel || "Dividido",
      catalogo: true
    };
  }

  LEGF.expandirMateriasDoCatalogo = function () {
    if (typeof BASE_CATALOGO_PROJETOS === "undefined" || !BASE_CATALOGO_PROJETOS.length) return 0;
    var novos = BASE_CATALOGO_PROJETOS.map(itemParaMateria);
    if (typeof MATERIAS !== "undefined" && Array.isArray(MATERIAS)) {
      var have = {};
      MATERIAS.forEach(function (m) {
        if (m.id) have[m.id] = true;
        if (m.nome) have[m.nome] = true;
      });
      novos.forEach(function (m) {
        if (!have[m.id] && !have[m.nome]) MATERIAS.push(m);
      });
    } else {
      window.MATERIAS = novos.slice();
    }
    // DB legado (usado em iniciarSessaoLegislativa)
    if (typeof DB === "undefined" || !Array.isArray(DB)) window.DB = [];
    var haveDb = {};
    DB.forEach(function (d) {
      if (d.id) haveDb[d.id] = true;
      if (d.nome) haveDb[d.nome] = true;
    });
    novos.forEach(function (m) {
      var esf = m.casaCod === "M" ? "M" : m.casaCod === "E" ? "E" : m.casaCod === "S" ? "S" : "C";
      if (haveDb[m.id] || haveDb[m.nome]) return;
      var row = {
        id: m.id,
        nome: m.nome,
        tipo: m.tipo,
        ementa: m.ementa,
        tema: m.tema || "Gestão Pública",
        pos: m.pos || { social: 0.5 },
        esf: esf,
        polemica: m.polemica,
        fiscal: 0,
        imp: {}
      };
      DB.push(row);
      haveDb[m.id] = true;
      // DBI é o índice usado por pick()/painelMat — sem isso a aba Poder quebra
      try {
        if (typeof DBI === "undefined" || !DBI) window.DBI = {};
        DBI[row.id] = row;
      } catch (e) {}
    });
    LEGF.syncDBI();
    return novos.length;
  };

  /** Garante DBI[id] para todo item de DB (catálogo Excel + banco legado). */
  LEGF.syncDBI = function () {
    try {
      if (typeof DB === "undefined" || !Array.isArray(DB)) return 0;
      if (typeof DBI === "undefined" || !DBI || typeof DBI !== "object") window.DBI = {};
      var n = 0;
      DB.forEach(function (d) {
        if (!d || d.id == null) return;
        if (!d.tema) d.tema = d.area || d.nome || "Gestão Pública";
        if (!d.pos) d.pos = { social: 0.5 };
        if (!d.imp || typeof d.imp !== "object") d.imp = {};
        if (d.fiscal == null) d.fiscal = 0;
        DBI[d.id] = d;
        n++;
      });
      // Limpa filas de pauta com ids órfãos (evita pick() → d.tema em undefined)
      try {
        var lg = null;
        if (typeof V === "function" && V() && V().leg) lg = V().leg;
        else if (typeof M === "function" && M().v24 && M().v24.leg) lg = M().v24.leg;
        if (lg && lg.fila) {
          Object.keys(lg.fila).forEach(function (esf) {
            var f = lg.fila[esf];
            if (f && Array.isArray(f.ids)) {
              f.ids = f.ids.filter(function (id) {
                return id != null && !!DBI[id];
              });
            }
          });
        }
      } catch (eFila) {}
      return n;
    } catch (e) {
      console.warn("LEGF.syncDBI", e);
      return 0;
    }
  };;

  function poolCatalogoParaCasa() {
    var cod = typeof casaLegCod === "function" ? casaLegCod() : typeof casaCodAtual === "function" ? casaCodAtual() : "M";
    var list = (typeof BASE_CATALOGO_PROJETOS !== "undefined" ? BASE_CATALOGO_PROJETOS : []).filter(function (it) {
      var c = casaCodDeItem(it);
      if (cod === "F" || cod === "C") return c === "C" || c === "S" || c === "C";
      if (cod === "S") return c === "S";
      if (cod === "E") return c === "E";
      return c === "M";
    });
    if (!list.length && typeof MATERIAS !== "undefined") {
      return MATERIAS.filter(function (m) {
        return m.casa === cod || m.casa === "F" || m.casaCod === cod;
      });
    }
    return list.map(itemParaMateria);
  }

  /* ---------- P1: tramitarPLs → pauta (não sanciona no escuro) ---------- */
  function plParaPauta(pl) {
    return {
      nome: pl.titulo || pl.nome,
      tipo: pl.tipo || "PL",
      descr: pl.ementa || pl.descr || ("Projeto sobre " + (pl.tema || "pauta legislativa")),
      pos: Object.assign({}, pl.pos || {}),
      casa: typeof casaLegCod === "function" ? casaLegCod() : "F",
      gov: 0,
      voto: null,
      res: null,
      tema: pl.tema || pl.area || "Legislativo",
      polemica: pl.polemica || 2,
      autorJogador: true,
      plId: pl.id,
      doJogador: true
    };
  }

  function patchTramitarPLs() {
    if (typeof tramitarPLs !== "function" || tramitarPLs._legf) return;
    window.tramitarPLs = function () {
      var L = M().leg;
      if (!L) return;
      var j = J();
      L.pauta = L.pauta || [];
      for (var i = 0; i < L.pls.length; i++) {
        var pl = L.pls[i];
        if (pl.fim) continue;
        var p =
          Math.max(
            0.08,
            Math.min(
              0.85,
              0.28 +
                (j.atributos.influencia || 0) / 300 +
                (j.comissoes || 0) * 0.06 +
                (pl.relator ? 0.14 : 0) +
                (pl.urgencia ? 0.2 : 0) +
                (j.mesa ? 0.15 : 0) +
                (pl.audiencia || 0) * 0.04 +
                (pl.ex ? 0.2 : 0)
            )
          ) * (pl.tipo === "PEC" ? 0.65 : 1);

        if (pl.estagio < 2) {
          if (Math.random() < p) {
            pl.estagio++;
            if (pl.estagio === 1) {
              if (typeof manchete === "function")
                manchete('"' + (pl.titulo || pl.nome) + '" de ' + j.nome + " começa a tramitar em comissão.", "leg");
            } else {
              if (typeof manchete === "function")
                manchete('"' + (pl.titulo || pl.nome) + '" de ' + j.nome + " fica pronto para o plenário.", "leg");
            }
          }
          continue;
        }

        // estagio >= 2: entra na pauta se ainda não estiver
        if (pl.estagio === 2 && !pl.naPauta) {
          var ja = L.pauta.some(function (m) {
            return m.plId === pl.id || m.nome === (pl.titulo || pl.nome);
          });
          if (!ja) {
            L.pauta.unshift(plParaPauta(pl));
            pl.naPauta = true;
            pl.aguardandoPlenario = true;
            if (typeof manchete === "function")
              manchete('Pauta: "' + (pl.titulo || pl.nome) + '" de ' + j.nome + " entra na ordem do dia.", "leg");
            _toast('Seu PL entrou na pauta do plenário.', "ok");
          }
          continue;
        }

        // Após votação registrada no plenário (ver sync abaixo)
        if (pl.estagio >= 3 && pl.aprovadoPlenario && !pl.fim) {
          if (Math.random() < 0.88) {
            pl.fim = "SANCIONADO";
            if (typeof mudarAprovTodos === "function") mudarAprovTodos(1.2);
            j.atributos.influencia = Math.min(100, (j.atributos.influencia || 0) + 2);
            if (typeof manchete === "function")
              manchete('O ' + pl.tipo + ' "' + (pl.titulo || pl.nome) + '" de ' + j.nome + " é sancionado.", "leg");
          } else {
            pl.fim = "VETADO";
            pl.vetoPendente = true;
            if (typeof manchete === "function")
              manchete('O Executivo veta "' + (pl.titulo || pl.nome) + '" de ' + j.nome + ". A Casa pode tentar derrubar o veto.", "leg");
            _toast("Veto! Você pode tentar derrubar na Casa.", "err");
          }
        }
      }
      L.pls = L.pls.filter(function (p) {
        return !p.fim || agoraM() - p.mes < 30;
      });
    };
    tramitarPLs._legf = true;
  }

  function syncVotoPautaComPL(materia, resultado) {
    try {
      if (!materia || !materia.doJogador) return;
      var L = M().leg;
      if (!L || !L.pls) return;
      var pl = L.pls.find(function (p) {
        return p.id === materia.plId || (p.titulo || p.nome) === materia.nome;
      });
      if (!pl || pl.fim) return;
      if (resultado && resultado.aprovado) {
        pl.estagio = 3;
        pl.aprovadoPlenario = true;
        pl.voto = resultado.sim;
        pl.aguardandoPlenario = false;
      } else if (resultado) {
        pl.fim = "ARQUIVADO";
        pl.aguardandoPlenario = false;
        if (typeof manchete === "function")
          manchete('Plenário rejeita "' + materia.nome + '" de ' + J().nome + ".", "leg");
      }
    } catch (e) {}
  }

  function patchResultadoSessao() {
    // Hook ao fechar sessão legislativa
    if (typeof A === "undefined") return;
    var keys = ["fecharSessaoLeg", "encerrarSessao", "concluirSessaoLeg", "aplicarResultadoSessao"];
    // Wrap finalizar se existir no fluxo de sessao
    if (typeof finalizarSessaoLegislativa === "function" && !finalizarSessaoLegislativa._legf) {
      var _f = finalizarSessaoLegislativa;
      window.finalizarSessaoLegislativa = function () {
        try {
          var sess = S.sessaoLeg;
          if (sess && sess.materia && sess.resultado) {
            syncVotoPautaComPL(sess.materia, {
              aprovado: !!sess.resultado.aprovado || sess.resultado === "APROVADO" || (sess.placar && sess.placar.sim > sess.placar.nao),
              sim: sess.placar ? Math.round((sess.placar.sim / Math.max(1, sess.placar.total)) * 1000) / 10 : null
            });
          }
        } catch (e) {}
        return _f.apply(this, arguments);
      };
      finalizarSessaoLegislativa._legf = true;
    }
  }

  /* ---------- Derrubar veto ---------- */
  LEGF.derrubarVeto = function (plId) {
    var L = M().leg;
    if (!L) return;
    var pl = (L.pls || []).find(function (p) {
      return p.id === plId || (p.titulo || p.nome) === plId;
    });
    if (!pl || pl.fim !== "VETADO") {
      _toast("Não há veto pendente neste projeto.", "err");
      return;
    }
    if (!gastarEnergia || !gastarEnergia(8)) return;
    var chance = 0.35 + (J().atributos.influencia || 0) / 200 + (J().mesa ? 0.1 : 0);
    if (Math.random() < chance) {
      pl.fim = "SANCIONADO";
      pl.vetoDerrubado = true;
      pl.vetoPendente = false;
      if (typeof manchete === "function")
        manchete('Casa derruba veto e promulga "' + (pl.titulo || pl.nome) + '".', "leg");
      _toast("Veto derrubado! Lei promulgada.", "ok");
      try {
        if (typeof emitirFato === "function")
          emitirFato({ tipo: "veto_derrubado", categoria: "legislativo", gravidade: 3, valencia: 40, dados: { projeto: pl.titulo || pl.nome } });
      } catch (e) {}
    } else {
      pl.vetoPendente = false;
      if (typeof manchete === "function")
        manchete('Tentativa de derrubar veto de "' + (pl.titulo || pl.nome) + '" fracassa.', "leg");
      _toast("Não alcançou quórum para derrubar o veto.", "err");
    }
    try {
      render();
    } catch (e) {}
  };

  /* ---------- Plenário mensal + arco bancadas ---------- */
  function patchLegislativoMensal() {
    if (typeof legislativoMensal !== "function" || legislativoMensal._legf) return;
    var _orig = legislativoMensal;
    window.legislativoMensal = function () {
      try {
        if (typeof mundoEleitoralMensal === "function") mundoEleitoralMensal();
        if (typeof compromissosMensal === "function") compromissosMensal();
      } catch (e) {}
      var L = M().leg;
      if (!L) return;
      if (typeof tramitarPLs === "function") tramitarPLs();
      if (!ehLegislador() || preso()) {
        L.pauta = [];
        return;
      }
      if (typeof mesaMensal === "function") mesaMensal();
      (L.pauta || []).forEach(function (m) {
        if (!m.voto && typeof mudarAprovTodos === "function") mudarAprovTodos(-0.4);
      });

      // Nova pauta: PLs do jogador prontos + catálogo Excel + procedural
      var nova = [];
      (L.pls || []).forEach(function (pl) {
        if (pl.fim || pl.estagio < 2) return;
        if (pl.naPauta && !pl.aprovadoPlenario) {
          nova.push(plParaPauta(pl));
        }
      });
      var pool = poolCatalogoParaCasa();
      if (typeof R !== "undefined" && R.shuffle) pool = R.shuffle(pool.slice());
      else pool = pool.slice().sort(function () {
        return Math.random() - 0.5;
      });
      var nExtra = typeof R !== "undefined" && R.i ? R.i(2, 4) : 2 + Math.floor(Math.random() * 3);
      pool.slice(0, nExtra).forEach(function (m) {
        nova.push({
          nome: m.nome,
          tipo: m.tipo,
          descr: m.ementa || m.descr,
          pos: Object.assign({}, m.pos),
          casa: m.casa || (typeof casaLegCod === "function" ? casaLegCod() : "F"),
          gov: typeof R !== "undefined" && R.p ? R.p([-1, 0, 1, 1]) : 0,
          voto: null,
          res: null,
          tema: m.tema,
          polemica: m.polemica,
          catalogoId: m.id
        });
      });
      L.pauta = nova;
      L.prepBancadas = L.prepBancadas || null;
      // Dispara arco pré-sessão no próximo acesso ao Congresso
      L.precisaPrepBancadas = true;

      var j = J();
      if (agoraM() - (L.relatoriaMes || 0) > 5 && Math.random() < 0.07 + j.atributos.influencia / 700 + (j.comissoes || 0) * 0.04) {
        M().fila = M().fila || [];
        M().fila.push({ tipo: "RELATORIA" });
        L.relatoriaMes = agoraM();
      }
    };
    legislativoMensal._legf = true;
  }

  LEGF.estimativaAprovacao = function (materia) {
    try {
      if (typeof votoPL === "function" && materia.pos) {
        var fake = {
          pos: materia.pos,
          tipo: materia.tipo,
          polemica: materia.polemica || 2,
          band: {},
          relator: false,
          gov: materia.gov,
          urgencia: false,
          audiencia: 0,
          ex: false
        };
        return Math.round(votoPL(fake) * 1000) / 10;
      }
    } catch (e) {}
    return 48 + Math.round(Math.random() * 20);
  };

  LEGF.renderPrepBancadas = function () {
    var L = M().leg;
    if (!L || !L.precisaPrepBancadas || !L.pauta || !L.pauta.length) return "";
    var m = L.pauta.find(function (x) {
      return !x.voto;
    }) || L.pauta[0];
    var est = LEGF.estimativaAprovacao(m);
    var html =
      '<div class="card" data-legf-prep="1" style="margin:0 0 12px;padding:12px;border:1px solid var(--linha,#444)">';
    html += "<b>Antes da sessão</b> — articulação com lideranças";
    html +=
      '<p class="txt">Próxima matéria: <b>' +
      _esc(m.nome) +
      "</b>. Estimativa de aprovação: <b>" +
      est +
      "%</b>.</p>";
    html += '<div class="row" style="gap:6px;flex-wrap:wrap">';
    html += '<button type="button" class="b mini branco" data-a="legfFalarLider">Conversar com líder</button>';
    html += '<button type="button" class="b mini corrige" data-a="legfCaixa2">Oferecer Caixa 2</button>';
    html += '<button type="button" class="b mini confirma" data-a="legfColar">Colar na bancada aliada</button>';
    html += '<button type="button" class="b mini azul" data-a="legfAbrirSessao">Abrir plenário</button>';
    html += "</div></div>";
    return html;
  };

  function bumpPautaFavor(delta) {
    var L = M().leg;
    if (!L || !L.pauta) return;
    L.pauta.forEach(function (m) {
      if (m.voto) return;
      m._articulacao = (m._articulacao || 0) + delta;
      if (m.doJogador) m.gov = (m.gov || 0) + (delta > 0 ? 1 : 0);
    });
  }

  function registrarAcoes() {
    if (typeof A === "undefined") return false;
    A.legfFalarLider = function () {
      if (typeof gastarEnergia === "function" && !gastarEnergia(3)) return;
      bumpPautaFavor(0.04);
      _toast("Líder ouviu. Estimativa sobe um pouco.", "ok");
      try {
        render();
      } catch (e) {}
    };
    A.legfCaixa2 = function () {
      var j = J();
      var custo = 50000;
      if ((j.caixa2 || 0) < custo) {
        _toast("Caixa 2 insuficiente.", "err");
        return;
      }
      j.caixa2 -= custo;
      bumpPautaFavor(0.1);
      _toast("Acordo cinza com a bancada. Risco sobe.", "err");
      try {
        if (typeof emitirFato === "function")
          emitirFato({ tipo: "fato_oculto", categoria: "escandalo", gravidade: 2, valencia: -10, origem: "boato", oculto_ate: null, dados: { texto: "Articulação sob suspeita" } });
      } catch (e) {}
      try {
        render();
      } catch (e) {}
    };
    A.legfColar = function () {
      if (typeof gastarEnergia === "function" && !gastarEnergia(4)) return;
      bumpPautaFavor(0.06);
      var j = J();
      j.atributos.influencia = Math.min(100, (j.atributos.influencia || 0) + 0.5);
      _toast("Você colou na liderança aliada.", "ok");
      try {
        render();
      } catch (e) {}
    };
    A.legfAbrirSessao = function () {
      var L = M().leg;
      if (L) L.precisaPrepBancadas = false;
      if (typeof iniciarSessaoLegislativa === "function") iniciarSessaoLegislativa();
      else _toast("Sessão indisponível neste momento.", "err");
    };
    A.legfDerrubarVeto = function (id) {
      LEGF.derrubarVeto(id);
    };
    return true;
  }

  function patchCongressoUI() {
    // Injeta prep + botão derrubar veto nas views de congresso se existirem
    try {
      if (typeof VIEWS === "undefined") return;
      ["congresso", "poder", "legislativo"].forEach(function (k) {
        if (typeof VIEWS[k] !== "function" || VIEWS[k]._legfPrep) return;
        var _o = VIEWS[k];
        VIEWS[k] = function () {
          try {
            LEGF.syncDBI();
          } catch (e0) {}
          var h = "";
          try {
            h = _o.apply(this, arguments);
          } catch (eView) {
            console.warn("LEGF VIEWS." + k, eView);
            h =
              '<section class="card"><h3>Poder</h3><p class="txt">Parte da aba falhou ao montar, mas o restante segue disponível. (' +
              String(eView && eView.message ? eView.message : eView) +
              ")</p></section>";
          }
          try {
            var prep = LEGF.renderPrepBancadas();
            if (prep && h.indexOf("data-legf-prep") < 0) h = prep + h;
            var L = M().leg;
            if (L && L.pls) {
              var vetados = L.pls.filter(function (p) {
                return p.fim === "VETADO" && p.vetoPendente !== false;
              });
              if (vetados.length && h.indexOf("data-legf-veto") < 0) {
                var bloco =
                  '<div class="card" data-legf-veto="1" style="margin:0 0 12px;padding:12px"><b>Vetos do Executivo</b>';
                vetados.forEach(function (p) {
                  bloco +=
                    '<div class="row" style="margin-top:8px"><span class="grow">' +
                    _esc(p.titulo || p.nome) +
                    '</span><button type="button" class="b mini corrige" data-a="legfDerrubarVeto" data-p=\'' +
                    JSON.stringify([p.id || p.titulo || p.nome]) +
                    "'>Derrubar veto</button></div>";
                });
                bloco += "</div>";
                h = bloco + h;
              }
            }
          } catch (e) {}
          return h;
        };
        VIEWS[k]._legfPrep = true;
        // preservar flags de outros wraps (DIP etc.) para não re-embrulhar em loop
        if (_o._dipEntry) VIEWS[k]._dipEntry = true;
        if (_o._exf) VIEWS[k]._exf = true;
      });
    } catch (e) {}
  }

  /** pick()/ensurePauta/painelMat quebram se DBI não tem o id — guarda + sync. */
  function patchEnsurePautaSafe() {
    if (typeof window.ensurePauta !== "function" || window.ensurePauta._legfSafe) return;
    var _orig = window.ensurePauta;
    window.ensurePauta = function () {
      try {
        LEGF.syncDBI();
      } catch (e0) {}
      try {
        return _orig.apply(this, arguments);
      } catch (e) {
        console.warn("ensurePauta safe", e);
        try {
          var L = M().leg;
          if (L) {
            L.pauta = (L.pauta || []).filter(function (m) {
              return m && (m.nome || m.titulo);
            });
          }
        } catch (e2) {}
      }
    };
    window.ensurePauta._legfSafe = true;

    if (typeof window.cardVotacao === "function" && !window.cardVotacao._legfSafe) {
      var _cv = window.cardVotacao;
      window.cardVotacao = function () {
        try {
          LEGF.syncDBI();
        } catch (e0) {}
        try {
          return _cv.apply(this, arguments);
        } catch (e) {
          console.warn("cardVotacao safe", e);
          return (
            '<section class="card"><h3>Painel de votação</h3><p class="txt">Pauta indisponível no momento. Avance o mês ou protocolar um PL.</p></section>'
          );
        }
      };
      window.cardVotacao._legfSafe = true;
    }
  }

  function patchIniciarSessao() {
    if (typeof iniciarSessaoLegislativa !== "function" || iniciarSessaoLegislativa._legf) return;
    var _orig = iniciarSessaoLegislativa;
    window.iniciarSessaoLegislativa = function () {
      var L = M().leg;
      if (L && L.precisaPrepBancadas && !(arguments[1] === true)) {
        // Se ainda não fez prep, abre UI de prep via modal leve
        L.precisaPrepBancadas = true;
        try {
          S.tab = S.tab || "cong";
          if (typeof render === "function") render();
        } catch (e) {}
      }
      var r = _orig.apply(this, arguments);
      // Animação: matéria ativa marcada
      try {
        if (S.sessaoLeg && S.sessaoLeg.materia) {
          S.sessaoLeg.materia._ativaPlenario = true;
        }
      } catch (e) {}
      return r;
    };
    iniciarSessaoLegislativa._legf = true;
  }

  function patchGerarPLProcedural() {
    if (typeof gerarPLProcedural !== "function" || gerarPLProcedural._legf) return;
    var _orig = gerarPLProcedural;
    window.gerarPLProcedural = function (autor, esfera) {
      try {
        var pool = poolCatalogoParaCasa();
        if (pool.length) {
          var m = pool[Math.floor(Math.random() * pool.length)];
          var autorObj = autor || (typeof membrosDaCasa === "function" ? (typeof R !== "undefined" && R.p ? R.p(membrosDaCasa(esfera || casaLegCod())) : membrosDaCasa(esfera || "C")[0]) : null) || {
            nome: "Comissão Diretora",
            partidoBase: "MDB"
          };
          return {
            id: "PL_CAT_" + m.id + "_" + Date.now().toString(36),
            numero: (m.tipo || "PL") + " " + (typeof R !== "undefined" && R.i ? R.i(101, 9890) : 100 + Math.floor(Math.random() * 800)) + "/" + (typeof dt === "function" ? dt().ano : 2026),
            nome: (m.tipo || "PL") + ": " + m.nome,
            titulo: m.nome,
            ementa: m.ementa || m.descr,
            tema: m.tema,
            tipo: m.tipo || "PL",
            esfera: esfera || (typeof casaLegCod === "function" ? casaLegCod() : "C"),
            pos: Object.assign({}, m.pos),
            autorId: autorObj.id || null,
            autorNome: autorObj.nome || "Parlamentar",
            autorPartido: autorObj.partidoBase || autorObj.partido || "CENTRO",
            etapa: "COMISSAO",
            polemica: m.polemica,
            catalogoId: m.id,
            votoJogador: null,
            mesProtocolo: typeof agoraM === "function" ? agoraM() : 0,
            resultadoVotacao: null,
            emendas: 0,
            vetoExecutivo: null,
            sessaoDerrubadaVeto: false
          };
        }
      } catch (e) {}
      return _orig.apply(this, arguments);
    };
    gerarPLProcedural._legf = true;
  }

  function boot() {
    try {
      patchPathG();
      patchSvgSP();
      patchCheatsSetCargo();
      garantirAprovacaoTodosTerritorios();
      LEGF.expandirMateriasDoCatalogo();
      LEGF.syncDBI();
      patchEnsurePautaSafe();
      patchTramitarPLs();
      patchLegislativoMensal();
      patchResultadoSessao();
      patchIniciarSessao();
      patchGerarPLProcedural();
      registrarAcoes();
      patchCongressoUI();
    } catch (e) {
      console.warn("LEGF boot", e);
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

  LEGF.resumo = function () {
    return {
      versao: LEGF.versao,
      catalogo: typeof BASE_CATALOGO_PROJETOS !== "undefined" ? BASE_CATALOGO_PROJETOS.length : 0,
      materias: typeof MATERIAS !== "undefined" ? MATERIAS.length : 0,
      db: typeof DB !== "undefined" ? DB.length : 0
    };
  };
})();
