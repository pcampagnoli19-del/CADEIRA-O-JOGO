/* =============================================================================
   CADEIRA — Áudio procedural (domínio público / original)
   - Landing: hino nacional BR instrumental (melodia de F. M. da Silva = DP)
   - Jogo: ambiente thriller político (composição procedural original)
   - Plenário: murmúrio abafado (ruído filtrado, sem voz real)
   - Apuração: tensão acelerada (procedural original)
   Controle mudo no canto; preferência em localStorage.
   ============================================================================= */
(function () {
  "use strict";

  var AUD = (window.AUD = window.AUD || {});
  AUD.versao = 1;

  var LS_KEY = "cadeira_som_mutado";
  var ctx = null;
  var master = null;
  var muted = false;
  var mode = "off"; // off | hino | jogo | plenario | apuracao
  var nodes = []; // active nodes to stop
  var timers = [];
  var btnEl = null;
  var started = false;

  function loadMute() {
    try {
      muted = localStorage.getItem(LS_KEY) === "1";
    } catch (e) {
      muted = false;
    }
  }
  function saveMute() {
    try {
      localStorage.setItem(LS_KEY, muted ? "1" : "0");
    } catch (e) {}
  }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.22;
    master.connect(ctx.destination);
    return ctx;
  }

  function clearAll() {
    timers.forEach(function (id) {
      try {
        clearTimeout(id);
        clearInterval(id);
      } catch (e) {}
    });
    timers = [];
    nodes.forEach(function (n) {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    nodes = [];
    mode = "off";
  }

  function setMasterMute(m) {
    muted = !!m;
    saveMute();
    if (master) {
      var t = ctx ? ctx.currentTime : 0;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(muted ? 0 : 0.22, t, 0.05);
    }
    updateBtn();
  }

  function toggleMute() {
    ensureCtx();
    if (ctx && ctx.state === "suspended") ctx.resume();
    setMasterMute(!muted);
    if (!muted && mode === "off") {
      // retoma modo apropriado
      AUD.syncFromGame();
    }
  }

  function updateBtn() {
    if (!btnEl) return;
    btnEl.setAttribute("data-muted", muted ? "1" : "0");
    btnEl.title = muted ? "Som desligado — clique para ligar" : "Som ligado — clique para mutar";
    btnEl.setAttribute("aria-label", btnEl.title);
    btnEl.textContent = muted ? "🔇" : "🔊";
  }

  function ensureBtn() {
    if (btnEl && document.body.contains(btnEl)) return;
    btnEl = document.getElementById("cadeira-som-btn");
    if (!btnEl) {
      btnEl = document.createElement("button");
      btnEl.id = "cadeira-som-btn";
      btnEl.type = "button";
      document.body.appendChild(btnEl);
    }
    btnEl.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMute();
    };
    updateBtn();
  }

  /** Notas do trecho inicial do Hino Nacional (aproximação melódica, DP). */
  // Frequências relativas à frase "Ouviram do Ipiranga..." (simplificada)
  var HINO_PHRASE = [
    // grau aproximado em Hz (dó4=261.6 base transp. para grave)
    [392.0, 0.45],
    [440.0, 0.3],
    [493.88, 0.3],
    [523.25, 0.55],
    [493.88, 0.25],
    [440.0, 0.35],
    [392.0, 0.5],
    [349.23, 0.35],
    [392.0, 0.35],
    [440.0, 0.7],
    [0, 0.25],
    [523.25, 0.4],
    [587.33, 0.35],
    [659.25, 0.55],
    [587.33, 0.3],
    [523.25, 0.35],
    [493.88, 0.45],
    [440.0, 0.35],
    [392.0, 0.8],
    [0, 0.6]
  ];

  function playTone(freq, when, dur, type, gainVal) {
    if (!ctx || !master || !freq) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "triangle";
    o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g);
    g.connect(master);
    var a = when;
    var d = Math.max(0.05, dur);
    g.gain.setValueAtTime(0, a);
    g.gain.linearRampToValueAtTime(gainVal || 0.08, a + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, a + d);
    o.start(a);
    o.stop(a + d + 0.02);
    nodes.push(o, g);
  }

  function startHino() {
    if (!ensureCtx()) return;
    clearAll();
    mode = "hino";
    if (ctx.state === "suspended") ctx.resume();

    function loopPhrase() {
      if (mode !== "hino") return;
      var t0 = ctx.currentTime + 0.05;
      var cursor = t0;
      HINO_PHRASE.forEach(function (pair) {
        var f = pair[0];
        var d = pair[1];
        if (f > 0) {
          playTone(f, cursor, d * 0.92, "triangle", 0.07);
          playTone(f * 0.5, cursor, d * 0.92, "sine", 0.035); // oitava grave
        }
        cursor += d;
      });
      var waitMs = Math.max(500, (cursor - ctx.currentTime) * 1000 + 400);
      timers.push(
        setTimeout(function () {
          if (mode === "hino") loopPhrase();
        }, waitMs)
      );
    }
    loopPhrase();
  }

  function startJogo() {
    if (!ensureCtx()) return;
    clearAll();
    mode = "jogo";
    if (ctx.state === "suspended") ctx.resume();

    // Drone frio
    var drone = ctx.createOscillator();
    var droneG = ctx.createGain();
    drone.type = "sine";
    drone.frequency.value = 55;
    droneG.gain.value = 0.045;
    drone.connect(droneG);
    droneG.connect(master);
    drone.start();
    nodes.push(drone, droneG);

    var drone2 = ctx.createOscillator();
    var drone2G = ctx.createGain();
    drone2.type = "sine";
    drone2.frequency.value = 82.4;
    drone2G.gain.value = 0.025;
    drone2.connect(drone2G);
    drone2G.connect(master);
    drone2.start();
    nodes.push(drone2, drone2G);

    // Pulso lento
    function pulse() {
      if (mode !== "jogo") return;
      var t = ctx.currentTime;
      playTone(110, t, 0.35, "sine", 0.04);
      playTone(164.8, t + 0.02, 0.25, "triangle", 0.02);
      timers.push(setTimeout(pulse, 2200));
    }
    pulse();

    // Notas esparsas de "piano" grave
    function sparse() {
      if (mode !== "jogo") return;
      var notes = [130.81, 146.83, 164.81, 196.0, 220.0];
      var f = notes[Math.floor(Math.random() * notes.length)];
      playTone(f, ctx.currentTime, 1.4, "triangle", 0.035);
      timers.push(setTimeout(sparse, 2800 + Math.random() * 3200));
    }
    timers.push(setTimeout(sparse, 1200));
  }

  function startPlenario() {
    if (!ensureCtx()) return;
    // Mantém drone de jogo por baixo + murmúrio
    if (mode !== "jogo") startJogo();
    mode = "plenario";

    // Ruído branco filtrado = murmúrio de plenário (sem voz real)
    var bufferSize = 2 * ctx.sampleRate;
    var noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    var g = ctx.createGain();
    g.gain.value = 0.028;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
    nodes.push(src, filter, g);

    // Modulação leve do filtro (ondas de conversa)
    function wobble() {
      if (mode !== "plenario") return;
      var t = ctx.currentTime;
      filter.frequency.cancelScheduledValues(t);
      filter.frequency.linearRampToValueAtTime(700 + Math.random() * 500, t + 1.5);
      timers.push(setTimeout(wobble, 1600));
    }
    wobble();
  }

  function startApuracao() {
    if (!ensureCtx()) return;
    clearAll();
    mode = "apuracao";
    if (ctx.state === "suspended") ctx.resume();

    var beat = 0;
    function tick() {
      if (mode !== "apuracao") return;
      var t = ctx.currentTime;
      var base = 98 + (beat % 4) * 12;
      playTone(base, t, 0.18, "square", 0.04);
      playTone(base * 1.5, t, 0.12, "sawtooth", 0.018);
      if (beat % 8 === 0) playTone(49, t, 0.4, "sine", 0.05);
      beat++;
      timers.push(setTimeout(tick, 380));
    }
    tick();
  }

  AUD.mute = function () {
    setMasterMute(true);
  };
  AUD.unmute = function () {
    setMasterMute(false);
  };
  AUD.toggle = toggleMute;
  AUD.isMuted = function () {
    return muted;
  };
  AUD.mode = function () {
    return mode;
  };

  AUD.playHino = function () {
    ensureBtn();
    startHino();
  };
  AUD.playJogo = function () {
    ensureBtn();
    startJogo();
  };
  AUD.playPlenario = function () {
    ensureBtn();
    startPlenario();
  };
  AUD.playApuracao = function () {
    ensureBtn();
    startApuracao();
  };
  AUD.stop = function () {
    clearAll();
  };

  /** Escolhe trilha conforme estado do jogo. */
  AUD.syncFromGame = function () {
    ensureBtn();
    try {
      if (!ensureCtx()) return;
      // Landing / criação
      if (typeof gameState === "undefined" || !gameState) {
        if (mode !== "hino") startHino();
        return;
      }
      // Apuração / noite eleitoral
      try {
        if (typeof NOITE !== "undefined" && NOITE && (NOITE.fase || NOITE.ativa)) {
          if (mode !== "apuracao") startApuracao();
          return;
        }
      } catch (eN) {}
      try {
        if (S && S.modal && S.modal.tipo === "sessao_leg") {
          if (mode !== "plenario") startPlenario();
          return;
        }
        if (S && S.sessaoLeg && S.sessaoLeg.emAndamento) {
          if (mode !== "plenario") startPlenario();
          return;
        }
      } catch (eS) {}
      // Jogo normal
      if (mode !== "jogo" && mode !== "plenario") startJogo();
      else if (mode === "plenario" && !(S && S.modal && S.modal.tipo === "sessao_leg")) startJogo();
      else if (mode === "hino" || mode === "apuracao") startJogo();
    } catch (e) {
      console.warn("AUD.sync", e);
    }
  };

  function unlockOnGesture() {
    if (started) return;
    started = true;
    ensureCtx();
    if (ctx && ctx.state === "suspended") ctx.resume();
    AUD.syncFromGame();
  }

  function patchRender() {
    if (typeof render !== "function" || render._aud) return;
    var _r = render;
    window.render = function () {
      var out = _r.apply(this, arguments);
      try {
        ensureBtn();
        AUD.syncFromGame();
      } catch (e) {}
      return out;
    };
    render._aud = true;
  }

  function boot() {
    loadMute();
    ensureBtn();
    patchRender();
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, unlockOnGesture, { once: true, passive: true });
    });
  }

  boot();
  var n = 0;
  var iv = setInterval(function () {
    patchRender();
    ensureBtn();
    if (++n > 60) clearInterval(iv);
  }, 250);
  document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", boot);

  AUD.resumo = function () {
    return { versao: AUD.versao, muted: muted, mode: mode, licenca: "hino DP (melodia); trilhas procedurais originais" };
  };
})();
