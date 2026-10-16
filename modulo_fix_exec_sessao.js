/* =============================================================================
   CADEIRA — Cheats executivos + sessão plenário (clique/scroll/velocidade) + voo DIP
   ============================================================================= */
(function () {
  "use strict";

  var EXF = (window.EXF = window.EXF || {});
  EXF.versao = 1;

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

  /* ---------- P0: cheats Pref / Gov / Pres / Sen ---------- */
  function patchModalCheats() {
    if (typeof modalCheats !== "function" || modalCheats._exf) return;
    var _orig = modalCheats;
    window.modalCheats = function () {
      var h = _orig.apply(this, arguments);
      if (h.indexOf("data-exf-cargos") >= 0) return h;
      var bloco =
        '<div data-exf-cargos="1" style="margin:12px 0;padding:12px;border:2px solid #22d3ee;border-radius:10px;background:rgba(34,211,238,0.08)">' +
        "<b>⚡ Virar cargo (teste rápido)</b>" +
        '<p class="txt" style="margin:6px 0;font-size:12px">Atalho igual ao do senador — Prefeito, Governador, Presidente e o resto, com mandato coerente.</p>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap">' +
        '<button type="button" class="b mini branco" data-a="exfCargo" data-p=\'["VER"]\'>Vereador</button>' +
        '<button type="button" class="b mini confirma" data-a="exfCargo" data-p=\'["PREF"]\'>Prefeito</button>' +
        '<button type="button" class="b mini branco" data-a="exfCargo" data-p=\'["DEPE"]\'>Dep. Estadual</button>' +
        '<button type="button" class="b mini branco" data-a="exfCargo" data-p=\'["DEPF"]\'>Dep. Federal</button>' +
        '<button type="button" class="b mini branco" data-a="exfCargo" data-p=\'["SEN"]\'>Senador</button>' +
        '<button type="button" class="b mini corrige" data-a="exfCargo" data-p=\'["GOV"]\'>Governador</button>' +
        '<button type="button" class="b mini corrige" data-a="exfCargo" data-p=\'["PRES"]\'>Presidente</button>' +
        "</div></div>";
      // Sempre no topo, logo após o título — fácil de achar
      if (/<h2>Console do operador<\/h2>/.test(h)) {
        h = h.replace(/<h2>Console do operador<\/h2>/, "<h2>Console do operador</h2>" + bloco);
      } else if (/class="mbox"/.test(h)) {
        h = h.replace(/class="mbox">/, 'class="mbox">' + bloco);
      } else {
        h = bloco + h;
      }
      return h;
    };
    modalCheats._exf = true;
  }

  function registrarCheatsCargo() {
    if (typeof A === "undefined") return false;
    A.exfCargo = function (id) {
      try {
        if (window.cheats && typeof cheats.setCargo === "function") cheats.setCargo(id);
        else {
          var nm = typeof NOME_CARGO !== "undefined" ? NOME_CARGO[id] : null;
          if (!nm) {
            _toast("Cargo desconhecido: " + id, "err");
            return;
          }
          var j = J();
          j.cargo_atual = nm;
          j.mandato_inicio = dt().ano;
          j.mandato_fim = dt().ano + (id === "SEN" ? 8 : 4);
          if (typeof IDADE_MIN !== "undefined") j.idade = Math.max(j.idade, IDADE_MIN[id] || j.idade);
          if (typeof atualizarPopularidade === "function") atualizarPopularidade();
        }
        S.modal = null;
        _toast("Agora você é: " + (NOME_CARGO[id] || id), "ok");
        try {
          render();
        } catch (e) {}
      } catch (err) {
        _toast("Erro ao mudar cargo: " + err.message, "err");
      }
    };
    return true;
  }

  /* ---------- Scroll: preservar rolagem do modal do plenário entre ticks ---------- */
  function patchRenderScroll() {
    if (typeof render !== "function" || render._exfScroll) return;
    var _orig = render;
    window.render = function () {
      var emSessao = S.modal && S.modal.tipo === "sessao_leg";
      // Impede o render nativo de jogar a página pro topo
      if (emSessao) S._top = false;
      // O plenário é position:fixed — o scroll útil é o do .sessao-box / .sessao-modal
      var boxY = 0,
        modalY = 0;
      if (emSessao) {
        try {
          var b0 = document.querySelector(".sessao-box");
          var m0 = document.querySelector(".sessao-modal");
          if (b0) boxY = b0.scrollTop || 0;
          if (m0) modalY = m0.scrollTop || 0;
        } catch (e0) {}
      }
      var r = _orig.apply(this, arguments);
      if (emSessao) {
        try {
          EXF.injectSessaoExtras();
        } catch (e2) {}
        var restore = function () {
          try {
            var b1 = document.querySelector(".sessao-box");
            var m1 = document.querySelector(".sessao-modal");
            if (b1) b1.scrollTop = boxY;
            if (m1) m1.scrollTop = modalY;
          } catch (e1) {}
        };
        restore();
        // segundo passe: layout/foto pode ajustar altura depois do paint
        try {
          requestAnimationFrame(restore);
        } catch (e3) {
          setTimeout(restore, 0);
        }
      }
      return r;
    };
    render._exfScroll = true;
  }

  /* ---------- Voto com bias / animação lenta + velocidade ---------- */
  function votoComBias(npc, materia) {
    try {
      if (typeof simularVotoNPC === "function") {
        var v = simularVotoNPC(npc, materia);
        if (npc && npc._biasSessao) {
          var b = npc._biasSessao;
          if (b > 0.2 && Math.random() < Math.min(0.92, 0.35 + b)) return "S";
          if (b < -0.2 && Math.random() < Math.min(0.92, 0.35 - b)) return "N";
        }
        return v;
      }
    } catch (e) {}
    // fallback simples
    if (npc && npc._biasSessao > 0.2) return Math.random() < 0.75 ? "S" : "N";
    if (npc && npc._biasSessao < -0.2) return Math.random() < 0.75 ? "N" : "S";
    return Math.random() < 0.55 ? "S" : Math.random() < 0.7 ? "N" : "A";
  }

  function atualizarPlacarLocal() {
    var sl = S.sessaoLeg;
    if (!sl) return;
    var s = 0,
      n = 0,
      a = 0;
    Object.keys(sl.votos || {}).forEach(function (k) {
      var val = sl.votos[k];
      if (val === "S") s++;
      else if (val === "N") n++;
      else if (val === "A") a++;
    });
    sl.placar = { sim: s, nao: n, abst: a, total: s + n + a };
  }

  function intervaloVelocidade() {
    var v = S.sessaoVelocidade || 1;
    // base bem mais lenta que 110ms
    var base = 720;
    return Math.max(180, Math.round(base / v));
  }

  EXF.iniciarAnimacaoVotacao = function () {
    if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
    var sl = S.sessaoLeg;
    if (!sl) return;
    sl.emAndamento = true;
    sl.votandoAgora = null;
    S.sessaoVelocidade = S.sessaoVelocidade || 1;

    window._sessaoLegTimer = setInterval(function () {
      if (!S.sessaoLeg || !S.sessaoLeg.emAndamento || S.sessaoLeg.concluida) {
        clearInterval(window._sessaoLegTimer);
        return;
      }
      var s = S.sessaoLeg;
      var fila = s.ordemVotacao || [];
      // 1 voto por tick (mais legível); em casas enormes no máx 2 se 3x
      var step = S.sessaoVelocidade >= 3 && s.cap > 200 ? 2 : 1;
      var ultimo = null;
      for (var k = 0; k < step && s.proximoIdx < fila.length; k++) {
        var npcId = fila[s.proximoIdx++];
        var npc = s.membros.find(function (x) {
          return x.id === npcId;
        });
        if (npc) {
          s.votos[npcId] = votoComBias(npc, s.materia);
          ultimo = { npc: npc, voto: s.votos[npcId] };
          s.votandoAgora = ultimo;
        }
      }
      try {
        if (typeof somVoto === "function") somVoto();
      } catch (e) {}
      atualizarPlacarLocal();

      if (s.proximoIdx >= fila.length) {
        if (s.votoJogador) {
          clearInterval(window._sessaoLegTimer);
          s.emAndamento = false;
          // usa caminho nativo de fechamento
          if (typeof A !== "undefined" && A.sessaoRapida) A.sessaoRapida();
          else render();
        } else {
          s.emAndamento = false;
          clearInterval(window._sessaoLegTimer);
          render();
        }
      } else {
        render();
      }
    }, intervaloVelocidade());
  };

  function patchSessaoAnimacao() {
    if (typeof A === "undefined") return false;
    // A animação nativa vive num IIFE fechado (110ms) — só conseguimos
    // interceptar pelos handlers A.* (botões data-a).
    window._exfIniciarAnimacao = EXF.iniciarAnimacaoVotacao;

    A.sessaoIniciar = function () {
      if (!S.sessaoLeg || S.sessaoLeg.concluida) return;
      EXF.iniciarAnimacaoVotacao();
      render();
    };

    // Retomar após o próprio voto do jogador também precisa da versão lenta+bias
    A.sessaoVotar = function (voto) {
      if (!S.sessaoLeg || S.sessaoLeg.concluida) return;
      try {
        if (typeof somVoto === "function") somVoto();
      } catch (e) {}
      S.sessaoLeg.votoJogador = voto;
      S.sessaoLeg.votos["JOGADOR"] = voto;
      atualizarPlacarLocal();
      if (S.sessaoLeg.proximoIdx >= (S.sessaoLeg.ordemVotacao || []).length) {
        if (typeof A.sessaoRapida === "function") A.sessaoRapida();
        else render();
      } else if (!S.sessaoLeg.emAndamento) {
        EXF.iniciarAnimacaoVotacao();
        render();
      } else {
        render();
      }
    };

    A.sessaoVel = function (v) {
      S.sessaoVelocidade = Math.max(1, Math.min(3, Number(v) || 1));
      _toast("Velocidade da votação: " + S.sessaoVelocidade + "x", "ok");
      if (S.sessaoLeg && S.sessaoLeg.emAndamento) {
        EXF.iniciarAnimacaoVotacao();
      }
      render();
    };
    var _fechar = A.sessaoFechar;
    A.sessaoFechar = function () {
      if (_fechar) return _fechar.apply(this, arguments);
      if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
      S.modal = null;
      render();
    };
    return true;
  }

  /* ---------- P0: negociação visível e clicável de verdade ---------- */
  function garantirLideres() {
    var sl = S.sessaoLeg;
    if (!sl || !sl.membros) return;
    if (sl.lideresIds && Object.keys(sl.lideresIds).length) return;
    sl.lideresIds = {};
    var porPartido = {};
    sl.membros.forEach(function (n) {
      if (!n || n.jogador || n.id === "JOGADOR") return;
      var p = n.partidoBase || n.partido || "?";
      if (!porPartido[p]) porPartido[p] = n;
    });
    Object.keys(porPartido)
      .slice(0, 10)
      .forEach(function (p) {
        var n = porPartido[p];
        n._ehLiderBancada = true;
        n._bancadaLider = p;
        sl.lideresIds[n.id] = p;
      });
  }

  function patchIniciarSessao() {
    if (typeof iniciarSessaoLegislativa !== "function") return;
    if (iniciarSessaoLegislativa._exf) return;
    var _orig = iniciarSessaoLegislativa;
    window.iniciarSessaoLegislativa = function () {
      try {
        var L = M().leg;
        if (L) L.precisaPrepBancadas = false;
      } catch (e) {}
      S._sessaoScrollY = window.scrollY || 0;
      S.sessaoVelocidade = S.sessaoVelocidade || 1;
      var r = _orig.apply(this, arguments);
      try {
        garantirLideres();
      } catch (e2) {}
      return r;
    };
    iniciarSessaoLegislativa._exf = true;
  }

  function patchNegociar() {
    if (typeof A === "undefined") return false;
    A.sessaoInspecionar = function (id) {
      if (!S.sessaoLeg) return;
      garantirLideres();
      var sl = S.sessaoLeg;
      sl.parlamentarSelecionado = sl.parlamentarSelecionado === id ? null : id;
      // líder → abre painel + pausa a animação pra o clique não “sumir”
      if (sl.parlamentarSelecionado && sl.lideresIds && sl.lideresIds[sl.parlamentarSelecionado]) {
        sl.negociarAberto = sl.parlamentarSelecionado;
        if (sl.emAndamento) {
          sl.emAndamento = false;
          if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
          _toast("Votação pausada — negocie com o líder ou clique Iniciar/Continuar.", "ok");
        }
      } else if (!sl.parlamentarSelecionado) {
        sl.negociarAberto = null;
      }
      render();
    };

    A.sessaoNegociar = function (id, modo) {
      garantirLideres();
      var sl = S.sessaoLeg;
      if (!sl || sl.concluida) {
        _toast("Sessão indisponível.", "err");
        return;
      }
      var part = sl.lideresIds && sl.lideresIds[id];
      if (!part) {
        _toast("Escolha um líder de bancada (lista abaixo do plenário ou bolinha ciano).", "err");
        return;
      }
      sl._negoFeitas = sl._negoFeitas || {};
      var key = id + ":" + modo;
      if (sl._negoFeitas[key]) {
        _toast("Você já fez essa jogada com este líder nesta sessão.", "err");
        return;
      }

      var delta = 0.25;
      if (modo === "falar") {
        if (typeof gastarEnergia === "function" && !gastarEnergia(2)) return;
        delta = 0.3;
      } else if (modo === "caixa2") {
        var j = J();
        if ((j.caixa2 || 0) < 40000) {
          _toast("Caixa 2 insuficiente (precisa R$ 40 mil).", "err");
          return;
        }
        j.caixa2 -= 40000;
        delta = 0.55;
        try {
          if (typeof emitirFato === "function")
            emitirFato({
              tipo: "fato_oculto",
              categoria: "escandalo",
              gravidade: 2,
              valencia: -12,
              origem: "boato",
              dados: { texto: "Negociação no plenário" }
            });
        } catch (e) {}
      } else if (modo === "colar") {
        if (typeof gastarEnergia === "function" && !gastarEnergia(3)) return;
        delta = 0.4;
        var j2 = J();
        j2.atributos.influencia = Math.min(100, (j2.atributos.influencia || 0) + 0.4);
      } else {
        _toast("Ação inválida.", "err");
        return;
      }

      var afetados = 0;
      sl.membros.forEach(function (m) {
        if (!m || m.jogador || m.id === "JOGADOR") return;
        if ((m.partidoBase || m.partido) !== part) return;
        m._biasSessao = (m._biasSessao || 0) + delta;
        // se ainda não votou, chance de já fixar intenção visível no bias
        if (!sl.votos[m.id]) afetados++;
      });
      sl._negoFeitas[key] = true;
      sl.negociarAberto = id;
      sl.parlamentarSelecionado = id;

      // pausa votação para o jogador ver
      if (sl.emAndamento) {
        sl.emAndamento = false;
        if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
      }

      _toast(
        (modo === "caixa2" ? "Caixa 2 com " : modo === "colar" ? "Colou na bancada " : "Conversa com ") +
          part +
          " — ~" +
          afetados +
          " votos pendentes tendem a Sim.",
        modo === "caixa2" ? "err" : "ok"
      );
      render();
    };

    A.sessaoAbrirLider = function (id) {
      A.sessaoInspecionar(id);
    };
    return true;
  }

  EXF.barraLideresHtml = function () {
    var sl = S.sessaoLeg;
    if (!sl) return "";
    garantirLideres();
    var ids = Object.keys(sl.lideresIds || {});
    if (!ids.length) return "";
    var vel = S.sessaoVelocidade || 1;
    var html =
      '<div data-exf-lideres="1" style="margin:8px 0;padding:10px;border:1px solid #22d3ee;border-radius:10px;background:rgba(34,211,238,0.08)">' +
      "<div class=\"row\" style=\"flex-wrap:wrap;gap:8px;align-items:center\">" +
      "<b class=\"grow\">◆ Líderes de bancada — clique para negociar</b>" +
      '<span style="font-size:12px;opacity:.85">Velocidade:</span>' +
      '<button type="button" class="b mini ' +
      (vel === 1 ? "confirma" : "branco") +
      "\" data-a=\"sessaoVel\" data-p='[1]'>1x</button>" +
      '<button type="button" class="b mini ' +
      (vel === 2 ? "confirma" : "branco") +
      "\" data-a=\"sessaoVel\" data-p='[2]'>2x</button>" +
      '<button type="button" class="b mini ' +
      (vel === 3 ? "confirma" : "branco") +
      "\" data-a=\"sessaoVel\" data-p='[3]'>3x</button>" +
      "</div>" +
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">';
    ids.forEach(function (id) {
      var m = sl.membros.find(function (x) {
        return x.id === id;
      });
      var part = sl.lideresIds[id];
      var on = sl.negociarAberto === id || sl.parlamentarSelecionado === id;
      html +=
        '<button type="button" class="b mini ' +
        (on ? "confirma" : "branco") +
        "\" data-a=\"sessaoAbrirLider\" data-p='" +
        JSON.stringify([id]) +
        "'>" +
        _esc((m && m.nome) || id) +
        " · " +
        _esc(part) +
        "</button>";
    });
    html += "</div>";

    var aberto = sl.negociarAberto || (sl.lideresIds[sl.parlamentarSelecionado] ? sl.parlamentarSelecionado : null);
    if (aberto && sl.lideresIds[aberto]) {
      var part2 = sl.lideresIds[aberto];
      var nome =
        (sl.membros.find(function (x) {
          return x.id === aberto;
        }) || {}).nome || aberto;
      html +=
        '<div data-exf-nego="1" style="margin-top:10px;padding:10px;border-radius:8px;background:rgba(0,0,0,.25)">' +
        "<b>Negociar com " +
        _esc(nome) +
        " (" +
        _esc(part2) +
        ")</b>" +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">' +
        '<button type="button" class="b mini branco" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([aberto, "falar"]) +
        "'>Conversar</button>" +
        '<button type="button" class="b mini corrige" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([aberto, "caixa2"]) +
        "'>Caixa 2</button>" +
        '<button type="button" class="b mini confirma" data-a="sessaoNegociar" data-p=\'' +
        JSON.stringify([aberto, "colar"]) +
        "'>Colar na bancada</button>" +
        "</div></div>";
    }
    html += "</div>";
    return html;
  };

  EXF.rodapeVotoHtml = function () {
    var sl = S.sessaoLeg;
    if (!sl || !sl.votandoAgora || sl.concluida) return "";
    var info = sl.votandoAgora;
    var n = info.npc;
    var voto = info.voto;
    var part = n.partidoBase || n.partido || "";
    // orientação do partido do jogador (referência) + flag explícita no NPC se existir
    var oJog = "A";
    try {
      if (typeof orient === "function") oJog = orient(sl.materia) || "A";
    } catch (e) {}
    var oPart = n._orientPartido || null;
    var contra = false;
    if (oPart && oPart !== "A" && voto && voto !== oPart) contra = true;
    else if (!oPart && oJog && oJog !== "A" && voto && voto !== oJog && (part === (typeof J === "function" ? J().partido_atual : null)))
      contra = true;
    var foto = "";
    try {
      if (typeof renderFotoPolitico === "function") foto = renderFotoPolitico(n, 36);
      else if (typeof obterFotoPolitico === "function") {
        var src = obterFotoPolitico(n);
        if (src) foto = '<img src="' + src + '" width="36" height="36" style="border-radius:50%;object-fit:cover">';
      }
    } catch (e2) {}
    var rot = voto === "S" ? "🟢 SIM" : voto === "N" ? "🔴 NÃO" : "🟡 ABSTENÇÃO";
    return (
      '<div data-exf-rodape-voto="1" style="position:sticky;bottom:0;z-index:5;margin-top:8px;padding:10px 12px;border-radius:10px;background:#0b1220;border:1px solid #334155;display:flex;gap:10px;align-items:center">' +
      (foto || "") +
      '<div class="grow"><div style="font-weight:800;font-size:0.95rem">' +
      _esc(n.nome) +
      " está votando</div>" +
      '<div style="font-size:0.8rem;opacity:.85"><b>' +
      _esc(part) +
      "</b> · " +
      rot +
      (contra ? ' · <span style="color:#f59e0b">dissonante da bancada</span>' : "") +
      "</div></div>" +
      '<div style="font-size:12px;opacity:.75">' +
      (sl.placar ? sl.placar.total + "/" + sl.cap : "") +
      "</div></div>"
    );
  };

  EXF.injectSessaoExtras = function () {
    var box = document.querySelector(".sessao-box") || document.querySelector(".sessao-modal");
    if (!box) return;
    var barra = EXF.barraLideresHtml();
    if (!barra) return;
    var old = box.querySelector("[data-exf-lideres]");
    if (old) {
      var tmp = document.createElement("div");
      tmp.innerHTML = barra;
      if (tmp.firstChild) old.replaceWith(tmp.firstChild);
    } else {
      var anchor =
        box.querySelector(".sessao-pauta-card") ||
        box.querySelector(".sessao-painel-led") ||
        box.querySelector(".sessao-topbar") ||
        box.firstElementChild;
      var wrap = document.createElement("div");
      wrap.innerHTML = barra;
      if (wrap.firstChild) {
        if (anchor) anchor.insertAdjacentElement("afterend", wrap.firstChild);
        else box.insertBefore(wrap.firstChild, box.firstChild);
      }
    }
    // highlight leader circles
    var sl = S.sessaoLeg;
    if (sl && sl.lideresIds) {
      Object.keys(sl.lideresIds).forEach(function (id) {
        var el = box.querySelector('[data-a="sessaoInspecionar"][data-p=\'["' + id + "\"]']");
        if (el && el.tagName === "circle") {
          el.setAttribute("stroke", "#22d3ee");
          el.setAttribute("stroke-width", "2.8");
          el.classList.add("lider-dot");
        }
      });
    }
    // rodapé vivo
    var rod = EXF.rodapeVotoHtml();
    var prev = box.querySelector("[data-exf-rodape-voto]");
    if (prev) prev.remove();
    if (rod) {
      var w = document.createElement("div");
      w.innerHTML = rod;
      box.appendChild(w.firstChild);
    }
  };

  /* ---------- P1: voo diplomacia com zoom e origem por cargo ---------- */
  function origemVoo() {
    var cargo = typeof cargoAtualId === "function" ? cargoAtualId() : "";
    if (typeof DIP === "undefined" || !DIP.CAPITAIS) return { nome: "Brasília", lat: -15.79, lng: -47.88 };
    if (!DIP.CAPITAIS.sao_paulo) DIP.CAPITAIS.sao_paulo = { nome: "São Paulo", lat: -23.55, lng: -46.63 };
    if (!DIP.CAPITAIS.maua) DIP.CAPITAIS.maua = { nome: "Mauá", lat: -23.67, lng: -46.46 };
    if (cargo === "PRES") return DIP.CAPITAIS.brasilia;
    if (cargo === "GOV" || cargo === "DEPE" || cargo === "SEN" || cargo === "DEPF") return DIP.CAPITAIS.sao_paulo;
    if (cargo === "PREF" || cargo === "VER") return DIP.CAPITAIS.maua || DIP.CAPITAIS.sao_paulo;
    return DIP.CAPITAIS.brasilia;
  }

  function patchDipVoo() {
    if (typeof DIP === "undefined" || typeof DIP.animarVoo !== "function" || DIP.animarVoo._exf) return;
    var _orig = DIP.animarVoo;
    DIP.animarVoo = function (instId, onDone) {
      var inst = DIP.instPorId(instId);
      var cap = DIP.CAPITAIS[inst.capital_id] || DIP.CAPITAIS.washington;
      var origem = origemVoo();
      var reduce = false;
      try {
        reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (e) {}
      var lite = !!(DIP._cena && DIP._cena.modoLite);
      if (reduce || lite) {
        if (onDone) onDone();
        return function () {};
      }

      var gc = DIP.greatCircle([origem.lat, origem.lng], [cap.lat, cap.lng], 120);
      var host = document.querySelector("[data-dip-modal] .dip-flight");
      if (!host) {
        // fallback: cria host se UI voo existir
        host = document.querySelector(".dip-flight");
      }
      if (!host) return _orig.apply(this, arguments);

      var W = host.clientWidth || 640,
        H = 260;
      host.innerHTML =
        '<canvas class="dip-canvas" width="' +
        W +
        '" height="' +
        H +
        '"></canvas>' +
        '<div class="dip-flight-hud"><span id="dip-flight-info">Decolando de ' +
        _esc(origem.nome) +
        "…</span>" +
        '<button type="button" class="b mini branco" data-dip-acao="pular-voo">Pular</button>' +
        '<button type="button" class="b mini branco" data-dip-acao="vel-voo" data-dip-v="2">2x</button></div>';
      var canvas = host.querySelector("canvas");
      var ctx = canvas.getContext("2d");
      var speed = 1;
      var cancel = false;
      var t0 = performance.now();
      var dur = Math.max(4500, Math.min(12000, gc.km / 750 * 1000 + 1800));

      function project(latlng, zoom, focus) {
        // zoom: 1 = mundo, >1 aproxima no focus [lat,lng]
        var cx = focus ? focus[1] : 0;
        var cy = focus ? focus[0] : 0;
        var x = (latlng[1] - cx) * zoom;
        var y = (latlng[0] - cy) * zoom;
        return [W / 2 + (x / 360) * W, H / 2 - (y / 180) * H];
      }

      function frame(now) {
        if (cancel) return;
        var t = Math.min(1, ((now - t0) / dur) * speed);
        // fases: 0-0.18 zoom out origem, 0.18-0.82 voo, 0.82-1 zoom in destino
        var zoom = 1;
        var focus = null;
        if (t < 0.18) {
          var u = t / 0.18;
          zoom = 3.2 - u * 2.2;
          focus = [origem.lat, origem.lng];
        } else if (t > 0.82) {
          var u2 = (t - 0.82) / 0.18;
          zoom = 1 + u2 * 2.2;
          focus = [cap.lat, cap.lng];
        } else {
          zoom = 1;
          focus = null;
        }

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, W, H);
        // grade suave
        ctx.strokeStyle = "rgba(51,65,85,.5)";
        ctx.lineWidth = 1;
        for (var g = 0; g < 8; g++) {
          ctx.beginPath();
          ctx.moveTo((W / 8) * g, 0);
          ctx.lineTo((W / 8) * g, H);
          ctx.stroke();
        }

        ctx.strokeStyle = "rgba(148,163,184,.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        gc.pts.forEach(function (p, i) {
          var xy = project(p, zoom, focus);
          if (i === 0) ctx.moveTo(xy[0], xy[1]);
          else ctx.lineTo(xy[0], xy[1]);
        });
        ctx.stroke();

        var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var flightT = Math.min(1, Math.max(0, (t - 0.12) / 0.7));
        var idx = flightT * (gc.pts.length - 1),
          i = Math.floor(idx),
          f = idx - i;
        var p0 = project(gc.pts[i], zoom, focus);
        var p1 = project(gc.pts[Math.min(i + 1, gc.pts.length - 1)], zoom, focus);
        var x = p0[0] + (p1[0] - p0[0]) * f,
          y = p0[1] + (p1[1] - p0[1]) * f;

        // origem / destino
        var oxy = project([origem.lat, origem.lng], zoom, focus);
        var dxy = project([cap.lat, cap.lng], zoom, focus);
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(oxy[0], oxy[1], 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(dxy[0], dxy[1], 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "18px sans-serif";
        ctx.fillText("✈", x - 7, y - 9);

        var info = document.getElementById("dip-flight-info");
        if (info) {
          var fase = t < 0.18 ? "Afastando câmera…" : t > 0.82 ? "Aproximando de " + cap.nome + "…" : "Em voo";
          info.textContent =
            origem.nome + " → " + cap.nome + " · " + Math.round(gc.km) + " km · " + fase;
        }
        if (t < 1) requestAnimationFrame(frame);
        else if (onDone) onDone();
      }
      requestAnimationFrame(frame);

      host.onclick = function (ev) {
        var b = ev.target.closest && ev.target.closest("[data-dip-acao]");
        if (!b) return;
        var a = b.getAttribute("data-dip-acao");
        if (a === "pular-voo") {
          cancel = true;
          if (onDone) onDone();
        }
        if (a === "vel-voo") {
          speed = speed >= 4 ? 1 : speed * 2;
          b.textContent = speed + "x";
        }
      };
      return function () {
        cancel = true;
      };
    };
    DIP.animarVoo._exf = true;
  }

  function boot() {
    try {
      patchModalCheats();
      registrarCheatsCargo();
      patchRenderScroll();
      patchSessaoAnimacao();
      patchIniciarSessao();
      patchNegociar();
      patchDipVoo();
    } catch (e) {
      console.warn("EXF boot", e);
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

  EXF.resumo = function () {
    return { versao: EXF.versao, vel: S.sessaoVelocidade || 1 };
  };
})();
