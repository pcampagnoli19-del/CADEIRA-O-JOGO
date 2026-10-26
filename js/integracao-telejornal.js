/* TELEJORNAL_UI_V1
   Estúdio da noite. Não recalcula voto: só revela a corrida já apurada.
   O modo Simples continua sendo #apurMapa. */
(function () {
  "use strict";
  if (window.__TJ_UI) return;
  window.__TJ_UI = true;
  var TJ = window.Telejornal;
  if (!TJ) return;

  var S = {
    el: null,
    corridas: [],
    i: 0,
    cob: null,
    t: 0,
    play: false,
    vel: 1,
    canal: "V4",
    painel: "auto",
    audio: false,
    voz: false,
    dalt: false,
    reduz: false,
    raf: 0,
    last: 0,
    pip: null,
    cache: {},
    fatos: {},
    aviso: false
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function modoGuardado() {
    try { return sessionStorage.getItem("cadeira_noite_modo") || "cobertura"; } catch (e) { return "cobertura"; }
  }
  function guardarModo(m) {
    try { sessionStorage.setItem("cadeira_noite_modo", m); } catch (e) {}
  }

  function sementeNoite(cargoId, turno) {
    var base = 7;
    try {
      var m = M();
      if (!m.sementePartida) m.sementePartida = TJ.hash32((J().nome || "cadeira") + "|noite");
      base = m.sementePartida >>> 0;
    } catch (e) {}
    return (base ^ TJ.hash32(cargoId + "|" + turno + "|" + (function () { try { return dt().ano; } catch (e2) { return 2026; } })())) >>> 0;
  }

  function corDe(id) {
    var paleta = S.dalt
      ? ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9", "#D55E00", "#F0E442", "#999999"]
      : ["#3d8bfd", "#e39b2b", "#2fbf8a", "#d46aa6", "#7aa2ff", "#e07a4c", "#c9b458", "#8fb7c9", "#d98b8b", "#6fbfc4"];
    return paleta[TJ.hash32(id || "?") % paleta.length];
  }

  function nomeExib(id, cob) {
    if (cob.nomes && cob.nomes[id]) return cob.nomes[id];
    if (cob.partidosNome && cob.partidosNome[id]) return cob.partidosNome[id];
    return String(id || "").replace(/^FED:/, "");
  }

  function siglaCurta(txt) {
    var s = String(txt || "").replace(/^Federação\s+/i, "").trim();
    if (s.length <= 28) return s;
    return s.slice(0, 26) + "…";
  }

  function eleitoNaTela(sit) {
    if (!S.cob || !sit) return false;
    return TJ.chamadaEleito(sit, S.cob.total, { tipo: S.cob.tipo, maioria: S.cob.maioria, turno: S.cob.turno });
  }

  function horaDe(pct) {
    var mins = Math.round(17 * 60 + Math.max(0, Math.min(1, pct)) * 240);
    var hh = Math.floor(mins / 60), mm = mins % 60;
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function corridasDoJogo() {
    var E = M().eleicao;
    var N = (E && E._mapaNac) || {};
    var turno = (E.noite && E.noite.turno) || 1;
    var ano = 2026;
    try { ano = dt().ano; } catch (e) {}
    var lista = [];
    function maj(cands, id, titulo, eleitores) {
      var arr = (cands || []).filter(function (c) { return c && (c.nome || c.share); });
      if (turno === 2 && arr.length !== 2) return;
      if (arr.length < 2) return;
      var base = Math.max(1000, Math.round((eleitores || 1000000) * 0.72));
      var soma = arr.reduce(function (s, c) { return s + (c.share || 0); }, 0) || 1;
      var totais = {}, nomes = {}, partidosNome = {}, quem = [];
      arr.forEach(function (c, i) {
        var chave = (c.id && String(c.id)) || ("c" + i);
        var votos = Math.max(1, Math.round(base * (c.share || 0) / soma));
        totais[chave] = (totais[chave] || 0) + votos;
        nomes[chave] = c.nome || chave;
        partidosNome[chave] = c.partido || "";
        quem.push({ id: chave, nome: c.nome, partido: c.partido || "", votos: votos, jogador: !!c.jogador });
      });
      lista.push({
        id: id, tipo: "majoritaria", titulo: titulo, turno: turno, ano: ano,
        totais: totais, nomes: nomes, partidosNome: partidosNome, quem: quem,
        cargo: titulo, circunscricao: id === "PRES" ? "o Brasil" : "São Paulo", vagas: "1"
      });
    }
    maj(N.pres, "PRES", "Presidente", N.elBR);
    maj(N.spGov, "GOV", "Governador", N.elSP);
    if (turno !== 2 && N.spSen && N.spSen.length >= 2) maj(N.spSen, "SEN", "Senado", N.elSP);
    if (turno === 2) return lista;
    ["DEPF", "DEPE", "VER"].forEach(function (cargo) {
      var L = E._leg2 && E._leg2[cargo];
      if (!L || !L.qe || !L.qe.por_partido || L.sistema === "antigo") return;
      var totais = {}, nomes = {}, quem = [];
      var entrada = L.qe.entrada || [];
      entrada.forEach(function (p) {
        var votos = (L.qe.por_partido[p.id] && L.qe.por_partido[p.id].votos) || 0;
        if (votos <= 0) return;
        totais[p.id] = votos;
        nomes[p.id] = p.nome || String(p.id).replace(/^FED:/, "");
        (p.candidatos || []).forEach(function (c) {
          quem.push({ id: c.id, nome: c.nome || c.id, partido: nomes[p.id], votos: c.votos || 0, jogador: !!c.jogador, lista: p.id });
        });
      });
      if (Object.keys(totais).length < 2) return;
      var tit = cargo === "DEPF" ? "Deputado federal" : cargo === "DEPE" ? "Deputado estadual" : "Vereador";
      lista.push({
        id: cargo, tipo: "proporcional", titulo: tit, turno: turno, ano: ano,
        totais: totais, nomes: nomes, quem: quem, cargo: tit,
        circunscricao: cargo === "VER" ? "Mauá" : "São Paulo",
        vagas: String(L.N || (L.qe && L.eleitos && L.eleitos.length) || ""),
        qe: L.qe, metaPartidos: entrada
      });
    });
    return lista;
  }

  function montar(corrida) {
    var total = Object.keys(corrida.totais).reduce(function (s, k) { return s + corrida.totais[k]; }, 0);
    var seed = sementeNoite(corrida.id, corrida.turno);
    var vies = TJ.viesDeChaves(Object.keys(corrida.totais), seed);
    var modo = corrida.id === "PRES" ? "completo" : (corrida.id === "VER" ? "curto" : "padrao");
    var meta = null;
    if (corrida.tipo === "proporcional" && typeof apurarProporcional === "function") {
      meta = {
        vagas: Number(corrida.vagas) || 1,
        apurar: apurarProporcional,
        total: total,
        partidos: (corrida.metaPartidos || []).map(function (p) {
          return {
            id: p.id,
            votos_legenda: p.votos_legenda || 0,
            candidatos: (p.candidatos || []).map(function (c) {
              return { id: c.id, nome: c.nome, votos: c.votos || 0, idade: c.idade || 40, jogador: !!c.jogador };
            })
          };
        }),
        resultadoOficial: corrida.qe
      };
    }
    var passos = (corrida.qe && corrida.qe.passos || []).filter(function (p) { return p.fase === "sobra"; });
    var mediaTxt = "a maior média";
    if (passos[0] && passos[0].medias && passos[0].medias[0]) {
      mediaTxt = TJ.fmtInt(passos[0].medias[0].media) + " para " + (corrida.nomes[passos[0].medias[0].id] || passos[0].medias[0].id);
    }
    return TJ.montarCobertura({
      totais: corrida.totais,
      blocos: TJ.blocosDeTotal(total),
      vies: vies,
      seed: seed,
      canal: S.canal,
      modo: modo,
      cargoId: corrida.id,
      cargo: corrida.cargo,
      titulo: corrida.titulo,
      ano: corrida.ano,
      turno: corrida.turno,
      circunscricao: corrida.circunscricao,
      vagas: corrida.vagas || "1",
      nomes: Object.assign({}, corrida.nomes, (function () {
        var o = {};
        (corrida.quem || []).forEach(function (c) { o[c.id] = c.nome; });
        return o;
      })()),
      partidosNome: corrida.partidosNome || corrida.nomes,
      jogador: (function () { try { return J().nome; } catch (e) { return "o candidato"; } })(),
      tipo: corrida.tipo,
      maioria: corrida.id === "PRES" || corrida.id === "GOV" || corrida.id === "PREF",
      qeTexto: corrida.qe ? TJ.fmtInt(corrida.qe.QE) : "—",
      mediaTexto: mediaTxt,
      passosSobras: passos,
      meta: meta
    });
  }

  function css() {
    if (document.getElementById("tj-css")) return;
    var st = document.createElement("style");
    st.id = "tj-css";
    st.textContent = [
      "#telejornal{position:fixed;inset:0;z-index:100003;background:#071018;color:#f4efe4;font-family:var(--font-ui, 'DM Sans', system-ui, sans-serif);display:flex;flex-direction:column;overflow:hidden}",
      "#telejornal *{box-sizing:border-box}",
      "#telejornal button{font-family:inherit;cursor:pointer}",
      ".tj-aviso{flex:none;background:#1c1408;color:#f0d7a2;font-size:12px;padding:6px 12px;display:flex;gap:10px;align-items:center;justify-content:space-between}",
      ".tj-top{flex:none;display:flex;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(#102033,#0c1828);border-bottom:3px solid #c4552a}",
      ".tj-marca{font-family:var(--font-display, Fraunces, Georgia, serif);font-weight:700;letter-spacing:.02em;font-size:16px}",
      ".tj-live{background:#c62828;color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;padding:3px 7px;border-radius:2px}",
      ".tj-top .grow{flex:1;min-width:0;color:#c9d4e4;font-size:12px}",
      ".tj-urnas{font-variant-numeric:tabular-nums;font-weight:800;font-size:18px;color:#f2c14e}",
      ".tj-stage{flex:1;min-height:0;display:grid;grid-template-columns:minmax(280px,1.05fr) minmax(300px,1.2fr);gap:8px;padding:8px}",
      ".tj-studio{background:radial-gradient(120% 80% at 50% 100%, #1a3358 0%, #0c1a2e 55%, #081018 100%);border:1px solid #24344c;border-radius:10px;position:relative;overflow:hidden;min-height:180px;display:flex;flex-direction:column}",
      ".tj-cam{flex:1;position:relative;min-height:120px}",
      ".tj-sil{position:absolute;bottom:52px;width:108px;height:150px;display:block;padding:0;margin:0;border:0;box-shadow:none;background:transparent;min-height:0;line-height:normal}",
      ".tj-sil.tj-ancora{left:12%}.tj-sil.tj-coancora{left:46%}",
      ".tj-sil i{display:block;margin:0 auto}",
      ".tj-sil .cabeca{width:58px;height:58px;border-radius:50%;border:3px solid #071018}",
      ".tj-sil.quadrado .cabeca{border-radius:8px}",
      ".tj-sil.gota .cabeca{border-radius:50% 50% 46% 46%}",
      ".tj-sil .corpo{width:70px;height:64px;margin-top:-6px;border-radius:40px 40px 8px 8px;opacity:.95}",
      ".tj-sil.fala .cabeca{box-shadow:0 0 0 3px #f2c14e}",
      ".tj-desk{position:absolute;left:0;right:0;bottom:0;height:36px;background:linear-gradient(#3b2a22,#241812)}",
      ".tj-lower{position:absolute;left:10px;right:10px;bottom:42px;background:#101820;border-left:4px solid #f2c14e;padding:6px 8px;display:flex;flex-direction:column}",
      ".tj-lower b{font-size:14px}.tj-lower span{color:#c9d4e4;font-size:11px}",
      ".tj-fala{margin:0;padding:8px 10px 10px;font-size:14.5px;line-height:1.35;background:#0b1524}",
      ".tj-telao{background:#0b1522;border:1px solid #24344c;border-radius:10px;padding:10px;overflow:auto;min-height:0}",
      ".tj-telao h3{margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#f2c14e}",
      ".tj-bar{display:grid;grid-template-columns:minmax(120px,34%) 1fr auto;gap:6px;align-items:center;margin:5px 0;font-size:13px}",
      ".tj-bar span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".tj-bar .trilha{height:14px;background:#16263b;border-radius:7px;overflow:hidden}",
      ".tj-bar .trilha i{display:block;height:100%;width:0;transition:width .35s linear}",
      ".tj-selo{font-size:10px;font-weight:800;letter-spacing:.04em;padding:2px 5px;border-radius:3px;background:#1d3b2a;color:#b6f5cf}",
      ".tj-selo.proj{background:#3a2f12;color:#f2c14e}",
      ".tj-selo.fora{background:#241820;color:#e7b4c0}",
      ".tj-vinheta{height:100%;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px}",
      ".tj-vinheta b{font-family:var(--font-display, Fraunces, Georgia, serif);font-size:28px}",
      ".tj-chamada{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px}",
      ".tj-chamada .grande{font-family:var(--font-display, Fraunces, Georgia, serif);font-size:34px;line-height:1}",
      ".tj-zona{display:flex;align-items:center;gap:8px;margin:6px 0}",
      ".tj-zona .bloco{height:28px;flex:1;border-radius:4px;background:#16263b;position:relative;overflow:hidden}",
      ".tj-zona .bloco i{position:absolute;inset:0 auto 0 0}",
      ".tj-hemi{width:100%;height:auto}",
      ".tj-split{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 8px 6px}",
      ".tj-rep{background:#101a2a;border:1px solid #24344c;border-radius:8px;padding:6px 8px;font-size:12px;min-height:44px}",
      ".tj-tick{flex:none;background:#081018;border-top:1px solid #24344c;overflow:hidden;height:28px;display:flex;align-items:center}",
      ".tj-tick p{margin:0;white-space:nowrap;padding-left:100%;animation:tj-marq 28s linear infinite;font-size:13px;color:#d5deea}",
      "@keyframes tj-marq{from{transform:translateX(0)}to{transform:translateX(-100%)}}",
      ".tj-ctl{flex:none;display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#0c1828;border-top:1px solid #24344c}",
      ".tj-ctl button,.tj-tabs button,.tj-canais button{border:1px solid #31445f;background:#152238;color:#f4efe4;border-radius:6px;padding:7px 10px;font-size:12px;font-weight:700}",
      ".tj-ctl button.on,.tj-tabs button.on,.tj-canais button.on{background:#c4552a;border-color:#c4552a;color:#fff}",
      ".tj-tabs,.tj-canais{flex:none;display:flex;gap:6px;overflow:auto;padding:6px 8px;background:#0a1422}",
      ".tj-pip{position:absolute;right:8px;top:8px;width:min(220px,40%);background:#061018;border:1px solid #f2c14e;border-radius:8px;padding:6px;font-size:11px;z-index:2}",
      ".tj-insp{position:absolute;left:8px;bottom:8px;right:8px;max-height:40%;overflow:auto;background:#071018ee;border:1px solid #31445f;border-radius:8px;padding:8px;font-size:12px;z-index:3}",
      ".tj-dec{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
      "#apurMapa.tj-sob-mapa{visibility:hidden !important;pointer-events:none !important}",
      "#tj-voltar-simples{position:fixed;z-index:100001;top:8px;right:8px;background:#c4552a;color:#fff;border:0;border-radius:8px;padding:8px 10px;font-weight:800}",
      "@media (max-width:800px){",
      "#telejornal{overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}",
      "#telejornal .tj-stage{flex:none;min-height:0;display:flex;flex-direction:column;grid-template-columns:1fr}",
      "#telejornal .tj-studio{flex:none;min-height:0;overflow:visible}",
      "#telejornal .tj-cam{flex:none;height:214px;min-height:214px;overflow:hidden}",
      "#telejornal .tj-sil{bottom:34px;height:156px;z-index:1}",
      "#telejornal .tj-sil.tj-ancora{left:20px}",
      "#telejornal .tj-sil.tj-coancora{left:138px}",
      "#telejornal .tj-lower{bottom:8px;z-index:2}",
      "#telejornal .tj-desk{height:28px}",
      "#telejornal .tj-telao{flex:none;width:100%;min-height:220px;overflow:visible}",
      "#telejornal .tj-vinheta{height:auto;min-height:210px;padding:12px}",
      "#telejornal .tj-vinheta b{font-size:26px;line-height:1.15;max-width:100%}",
      "#telejornal .tj-chamada{min-height:210px}",
      "#telejornal .tj-tick{height:auto;min-height:32px;overflow:visible;align-items:flex-start;padding:6px 0}",
      "#telejornal .tj-tick p{animation:none;transform:none;padding:0 10px;white-space:normal;line-height:1.35}",
      "#telejornal .tj-bar{grid-template-columns:minmax(84px,36%) minmax(0,1fr) auto;font-size:13px}",
      "#telejornal .tj-fala{font-size:15px}",
      "#telejornal .tj-tabs,#telejornal .tj-canais{flex-wrap:wrap;overflow:visible}",
      "#telejornal .tj-tabs button,#telejornal .tj-canais button,#telejornal .tj-ctl button{flex:0 0 auto;max-width:100%;white-space:nowrap;overflow:visible;text-overflow:clip}",
      "#telejornal .tj-ctl button{padding:9px 12px}",
      "#telejornal .tj-pip{display:none}",
      "#telejornal .tj-split{grid-template-columns:1fr}",
      "}",
      "@media (prefers-reduced-motion: reduce){#telejornal .tj-tick p{animation:none;padding-left:8px;white-space:normal}#telejornal .tj-sil{transform:none !important}#telejornal .tj-bar .trilha i{transition:none}}",
      "#telejornal.tj-quiet .tj-tick p{animation:none;padding-left:8px}",
      "#telejornal.tj-quiet .tj-live{animation:none}"
    ].join("");
    document.head.appendChild(st);
  }

  function esconderMapa() {
    var mapa = document.getElementById("apurMapa");
    if (!mapa && window._apMapa && window._apMapa.abrir) {
      try { window._apMapa.abrir(); } catch (e) {}
      mapa = document.getElementById("apurMapa");
    }
    if (!mapa) return;
    if (!mapa.getAttribute("data-tj-turno")) mapa.setAttribute("data-tj-turno", turnoNoite());
    mapa.classList.add("tj-sob-mapa");
    var pausa = mapa.querySelector("[data-ap='pausa']");
    if (pausa && /Pausar/.test(pausa.textContent || "")) {
      pausa.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    }
  }

  function turnoNoite() {
    try { return String((M().eleicao.noite && M().eleicao.noite.turno) || 1); } catch (e) { return "1"; }
  }

  function mostrarMapa() {
    var mapa = document.getElementById("apurMapa");
    var turno = turnoNoite();
    if (mapa && mapa.getAttribute("data-tj-turno") && mapa.getAttribute("data-tj-turno") !== turno) {
      mapa.remove();
      mapa = null;
    }
    if (!mapa && window._apMapa && window._apMapa.abrir) {
      try { window._apMapa.abrir(); } catch (e) {}
      mapa = document.getElementById("apurMapa");
    }
    if (mapa) mapa.setAttribute("data-tj-turno", turno);
    if (!mapa) return;
    mapa.classList.remove("tj-sob-mapa");
    if (!document.getElementById("tj-voltar-simples")) {
      var b = document.createElement("button");
      b.id = "tj-voltar-simples";
      b.type = "button";
      b.textContent = "Voltar ao telejornal";
      b.onclick = function () {
        guardarModo("cobertura");
        b.remove();
        abrir();
      };
      document.body.appendChild(b);
    }
  }

  function garantirMapa() {
    if (!document.getElementById("apurMapa") && window._apMapa && window._apMapa.abrir) {
      try { window._apMapa.abrir(); } catch (e) {}
    }
  }

  function pessoa(cob, id) {
    return (cob.elenco || []).filter(function (p) { return p.id === id; })[0] || (cob.elenco || [])[0] || { nome: "Bancada", papel: "Estúdio", silhueta: { cor: "#d7deea", forma: "redondo" } };
  }

  function estado() {
    if (!S.cob) return null;
    return TJ.estadoNoTempo(S.cob, S.t);
  }

  function hemiciclo(itens) {
    var n = Math.max(1, Math.min(96, itens.length));
    var partes = [];
    for (var i = 0; i < n; i++) {
      var ang = Math.PI + (Math.PI * (i + 0.5)) / n;
      var x = 160 + Math.cos(ang) * 120;
      var y = 132 + Math.sin(ang) * 88;
      var cor = itens[i] && itens[i].cor ? itens[i].cor : "#3a4a60";
      partes.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5.2" fill="' + cor + '"></circle>');
    }
    return '<svg class="tj-hemi" viewBox="0 0 320 160" role="img" aria-label="Hemiciclo projetado">' + partes.join("") + "</svg>";
  }

  function desenharTelao(est) {
    var cob = S.cob;
    var box = S.el.querySelector(".tj-telao");
    if (!box || !est) return;
    var graf = S.painel === "auto" ? ((est.segmento && est.segmento.grafico) || "placar") : S.painel;
    var chaves = Object.keys(est.snap.parcial).sort(function (a, b) { return est.snap.parcial[b] - est.snap.parcial[a]; });
    var ap = chaves.reduce(function (s, k) { return s + est.snap.parcial[k]; }, 0) || 1;
    var topo = chaves[0];
    var html = "";
    if (graf === "vinheta") {
      html = '<div class="tj-vinheta"><small>SIMULAÇÃO SATÍRICA</small><b>Eleições ' + esc(cob.titulo) + '</b><div>' + esc(S.corridas[S.i].ano) + (S.corridas[S.i].turno === 2 ? " · 2º turno" : " · 1º turno") + '</div><div>' + esc(cob.canal.pele) + '</div></div>';
    } else if (graf === "chamada" || (est.sit.matematico && graf === "chamada")) {
      var pode = eleitoNaTela(est.sit);
      html = '<div class="tj-chamada"><small>' + (pode ? "CHAMADA MATEMÁTICA" : "PROJEÇÃO") + '</small><div class="grande">' + esc(nomeExib(est.sit.lider, cob)) + '</div><div>' + (pode ? '<span class="tj-selo">ELEITO</span> Vantagem maior do que os votos restantes.' : "Ainda não há selo. Tendência de " + TJ.fmtPct(est.sit.pVitoria * 100, 0) + "%.") + '</div></div>';
    } else if (graf === "pesquisa") {
      var boca = cob.boca.partes;
      var ks = Object.keys(boca).sort(function (a, b) { return boca[b] - boca[a]; }).slice(0, 6);
      html = "<h3>Pesquisa de saída · margem 2 p.p.</h3>" + ks.map(function (k) {
        return '<div class="tj-bar"><span>' + esc(siglaCurta(nomeExib(k, cob))) + '</span><div class="trilha"><i style="width:' + (boca[k] * 100).toFixed(1) + '%;background:' + corDe(k) + '"></i></div><b>' + TJ.fmtPct(boca[k] * 100) + '%</b></div>';
      }).join("") + '<p>Não é urna. É retrato de saída.</p>';
    } else if (graf === "mapa") {
      var fr = TJ.fracaoBlocos(cob.blocos, est.snap.t, 6);
      html = "<h3>Zonas de apuração</h3>" + cob.blocos.map(function (b, i) {
        var row = cob.matriz.M[i];
        var lider = null, best = -1;
        cob.matriz.P.forEach(function (p, j) { if (row[j] > best) { best = row[j]; lider = p; } });
        var chegou = fr[i] > 0;
        return '<div class="tj-zona"><span style="width:132px">' + esc(b.nome) + '</span><div class="bloco"><i style="width:' + Math.round(fr[i] * 100) + '%;background:' + (chegou ? corDe(lider) : "#16263b") + '"></i></div><small>' + (chegou ? esc(siglaCurta(nomeExib(lider, cob))) : "aguardando") + "</small></div>";
      }).join("") + '<p>O mapa do Brasil por estado continua no modo Simples.</p>';
    } else if (graf === "hemiciclo" || graf === "sobras" || graf === "qe") {
      html = desenharProporcional(est, graf);
    } else if (graf === "candidatos" || graf === "duelo") {
      html = desenharCandidatos(est, graf === "duelo");
    } else {
      var max = Math.max.apply(null, chaves.map(function (k) { return est.snap.parcial[k]; }).concat([1]));
      html = "<h3>Placar · " + TJ.fmtPct(est.pct * 100) + "% das urnas</h3>" + chaves.slice(0, 8).map(function (k) {
        var selo = "";
        if (S.corridas[S.i].tipo === "majoritaria" && k === topo && eleitoNaTela(est.sit)) selo = ' <span class="tj-selo">ELEITO</span>';
        else if (S.corridas[S.i].tipo === "majoritaria" && k === topo && est.sit.pVitoria >= 0.9) selo = ' <span class="tj-selo proj">TENDÊNCIA</span>';
        return '<div class="tj-bar"><span>' + esc(siglaCurta(nomeExib(k, cob))) + "</span><div class=\"trilha\"><i style=\"width:" + (est.snap.parcial[k] / max * 100).toFixed(1) + "%;background:" + corDe(k) + '"></i></div><b>' + TJ.fmtPct(est.snap.parcial[k] / ap * 100) + "%</b>" + selo + "</div>";
      }).join("") + '<p>Vantagem ' + TJ.fmtInt(est.sit.vantagem) + " votos · faltam " + TJ.fmtInt(est.sit.restante) + ".</p>";
    }
    if (box.getAttribute("data-k") !== graf + "|" + Math.round(est.pct * 200) + "|" + (est.segmento && est.segmento.tipo)) {
      box.setAttribute("data-k", graf + "|" + Math.round(est.pct * 200) + "|" + (est.segmento && est.segmento.tipo));
      box.innerHTML = html;
    }
  }

  function projCache(est) {
    var meta = S.cob.meta;
    if (!meta) return null;
    var degrau = Math.round(est.pct * 10);
    if (S.cache.degrau === degrau && S.cache.proj) return S.cache.proj;
    var proj = TJ.projetarCadeiras(est.snap, meta);
    S.cache = { degrau: degrau, proj: proj, conf: {} };
    return proj;
  }

  function confirmado(id, est) {
    var meta = S.cob.meta;
    if (!meta) return false;
    if (est.pct >= 0.999) {
      return (meta.resultadoOficial.eleitos || []).some(function (e) { return e.candidato === id; });
    }
    var degrau = Math.round(est.pct * 10);
    var chave = id + "@" + degrau;
    if (S.cache.conf && S.cache.conf[chave] != null) return S.cache.conf[chave];
    var ok = false;
    try { ok = TJ.confirmavel(id, est.snap, meta); } catch (e) { ok = false; }
    S.cache.conf = S.cache.conf || {};
    S.cache.conf[chave] = ok;
    return ok;
  }

  function desenharProporcional(est, graf) {
    var cob = S.cob;
    var corrida = S.corridas[S.i];
    if (corrida.tipo !== "proporcional") {
      return "<h3>Majoritária</h3><p>Hemiciclo e quociente ficam nas corridas proporcionais. Esta chave é de " + esc(corrida.titulo) + ".</p>";
    }
    var proj = projCache(est);
    var por = (proj && proj.por_partido) || {};
    var cadeiras = [];
    Object.keys(por).forEach(function (id) {
      var n = por[id].total || 0;
      for (var i = 0; i < n; i++) cadeiras.push({ cor: corDe(id), id: id });
    });
    var vagas = Number(corrida.vagas) || cadeiras.length;
    while (cadeiras.length < vagas) cadeiras.push({ cor: "#3a4a60" });
    var qe = corrida.qe ? corrida.qe.QE : 0;
    var ap = Object.keys(est.snap.parcial).reduce(function (s, k) { return s + est.snap.parcial[k]; }, 0) || 1;
    var fator = est.pct > 0.02 ? 1 / est.pct : 0;
    var barras = Object.keys(est.snap.parcial).sort(function (a, b) { return est.snap.parcial[b] - est.snap.parcial[a]; }).slice(0, 8).map(function (id) {
      var projetado = est.snap.parcial[id] * (fator || 1);
      var pctQe = qe ? Math.min(140, projetado / qe * 100) : 0;
      var cade = por[id] ? por[id].total : 0;
      return '<div class="tj-bar"><span>' + esc(siglaCurta(nomeExib(id, cob))) + '</span><div class="trilha"><i style="width:' + pctQe.toFixed(1) + '%;background:' + corDe(id) + '"></i></div><b>' + (est.pct < 0.02 ? "—" : cade + " cad.") + "</b></div>";
    }).join("");
    var titulo = graf === "qe" ? "Régua do quociente · projeção" : graf === "sobras" ? "Sobras e hemiciclo" : "Hemiciclo projetado";
    return "<h3>" + titulo + "</h3>" + (qe ? "<p>QE " + TJ.fmtInt(qe) + " · a barra passa de 100% da régua quando a projeção atravessa o quociente.</p>" : "") + barras + hemiciclo(cadeiras.slice(0, vagas)) + "<p>Cadeira cinza ainda não está na projeção. Selo de eleito só no pior caso.</p>";
  }

  function desenharCandidatos(est, duelo) {
    var cob = S.cob;
    var corrida = S.corridas[S.i];
    if (corrida.tipo === "majoritaria" || duelo) {
      var chaves = Object.keys(est.snap.parcial).sort(function (a, b) { return est.snap.parcial[b] - est.snap.parcial[a]; }).slice(0, duelo ? 2 : 6);
      var ap = Object.keys(est.snap.parcial).reduce(function (s, k) { return s + est.snap.parcial[k]; }, 0) || 1;
      return "<h3>" + (duelo ? "Duelo" : "Nomes") + "</h3>" + chaves.map(function (k) {
        var eleito = corrida.tipo === "majoritaria" && k === est.sit.lider && eleitoNaTela(est.sit);
        return '<div class="tj-bar"><span>' + esc(siglaCurta(nomeExib(k, cob))) + '</span><div class="trilha"><i style="width:' + (est.snap.parcial[k] / ap * 100).toFixed(1) + '%;background:' + corDe(k) + '"></i></div><b>' + TJ.fmtPct(est.snap.parcial[k] / ap * 100) + "%</b> " + (eleito ? '<span class="tj-selo">ELEITO</span>' : "") + "</div>";
      }).join("");
    }
    var quem = (corrida.quem || []).slice().sort(function (a, b) { return b.votos - a.votos; }).slice(0, 8);
    var linhas = quem.map(function (c, idx) {
      var parcialPartido = est.snap.parcial[c.lista] || 0;
      var fimPartido = corrida.totais[c.lista] || 1;
      var mostrado = Math.round(c.votos * (parcialPartido / fimPartido));
      var conf = confirmado(c.id, est);
      var proj = projCache(est);
      var naLista = proj && (proj.eleitos || []).some(function (e) { return e.candidato === c.id; });
      var fase = proj && (proj.eleitos || []).filter(function (e) { return e.candidato === c.id; })[0];
      var selo = conf ? '<span class="tj-selo">ELEITO</span>' : naLista ? '<span class="tj-selo proj">' + (fase && fase.fase === "sobra" ? "SOBRA" : "DENTRO") + "</span>" : '<span class="tj-selo fora">FORA</span>';
      if (est.pct < 0.08) selo = '<span class="tj-selo fora">CEDO</span>';
      return '<div class="tj-bar"><span>' + (idx + 1) + ". " + esc(siglaCurta(c.nome)) + '</span><div class="trilha"><i style="width:' + Math.min(100, mostrado / Math.max(1, quem[0] && Math.round(quem[0].votos * ((est.snap.parcial[quem[0].lista] || 0) / (corrida.totais[quem[0].lista] || 1))) || 1) * 100) + '%;background:' + corDe(c.lista || c.partido) + '"></i></div><b>' + TJ.fmtInt(mostrado) + "</b> " + selo + "</div>";
    }).join("");
    return "<h3>Mais votados na parcial</h3>" + linhas;
  }

  function emitir(tipo, dados) {
    if (S.fatos[tipo]) return;
    S.fatos[tipo] = 1;
    try {
      if (typeof window.emitirFato === "function") {
        window.emitirFato({
          tipo: tipo,
          categoria: "eleicao",
          gravidade: 2,
          novidade: 70,
          pauta: ["eleicao_calendario"],
          origem: "apuracao",
          dados: dados || {}
        });
      }
    } catch (e) {}
  }

  function pintar() {
    var est = estado();
    if (!S.el || !est || !S.cob) return;
    var seg = est.segmento || {};
    var quem = pessoa(S.cob, seg.personagem_id);
    var marca = S.el.querySelector(".tj-marca");
    if (marca) marca.textContent = S.cob.canal.pele;
    var urnas = S.el.querySelector(".tj-urnas");
    if (urnas) urnas.textContent = TJ.fmtPct(est.pct * 100) + "%";
    var rel = S.el.querySelector(".tj-relogio");
    if (rel) rel.textContent = horaDe(est.pct);
    var fala = S.el.querySelector(".tj-fala");
    if (fala && fala.getAttribute("data-i") !== String(S.cob.roteiro.indexOf(seg))) {
      fala.setAttribute("data-i", String(S.cob.roteiro.indexOf(seg)));
      fala.textContent = seg.texto || "";
      var aria = S.el.querySelector(".tj-aria");
      if (aria) aria.textContent = (quem.nome || "") + ". " + (seg.texto || "");
      if (S.voz && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(seg.texto || "");
          u.lang = "pt-BR";
          u.rate = (quem.voz && quem.voz.rate) || 1;
          u.pitch = (quem.voz && quem.voz.pitch) || 1;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
      if (S.audio && seg.tarja) bip();
    }
    var lower = S.el.querySelector(".tj-lower");
    if (lower) {
      lower.querySelector("b").textContent = quem.nome || "";
      var onde = seg.tipo === "ao_vivo_qg" ? "AO VIVO — comitê" : (quem.papel || "");
      lower.querySelector("span").textContent = onde + (seg.tarja ? " · " + seg.tarja : "");
    }
    S.el.querySelectorAll(".tj-sil").forEach(function (sil) {
      sil.classList.toggle("fala", sil.getAttribute("data-papel") === (quem.id || "ancora"));
    });
    var tick = S.el.querySelector(".tj-tick p");
    if (tick) {
      var pedacos = (S.cob.roteiro || []).filter(function (r) { return r.t_ini <= S.t; }).slice(-4).map(function (r) { return r.texto; });
      pedacos.unshift("Urnas " + TJ.fmtPct(est.pct * 100) + "%");
      pedacos.push("#Apuracao");
      var tx = pedacos.join("   ·   ");
      if (tick.getAttribute("data-t") !== tx) { tick.setAttribute("data-t", tx); tick.textContent = tx; }
    }
    desenharTelao(est);
    var rep = S.el.querySelectorAll(".tj-rep");
    if (rep[0]) rep[0].textContent = "Comitê — " + (pessoa(S.cob, "reporter").nome || "") + ": a parcial acompanha " + nomeExib(est.sit.lider, S.cob) + ".";
    if (rep[1]) rep[1].textContent = "Praça — " + (pessoa(S.cob, "rua").nome || "") + ": " + (est.snap.regiao || "as zonas") + " entram na conta.";
    if (S.pip && S.el.querySelector(".tj-pip")) {
      var outro = TJ.estadoNoTempo(S.pip, S.t);
      var oseg = outro.segmento || {};
      S.el.querySelector(".tj-pip").innerHTML = "<b>" + esc(S.pip.canal.pele) + "</b><div>" + esc(oseg.texto || "") + "</div>";
    }
    if (est.sit.matematico) emitir("apuracao_chamada", { lider: nomeExib(est.sit.lider, S.cob), cargo: S.corridas[S.i].titulo });
    if (est.pct >= 0.999) emitir("apuracao_fim", { cargo: S.corridas[S.i].titulo });
    var fimBox = S.el.querySelector(".tj-dec");
    if (fimBox) fimBox.style.display = est.pct >= 0.999 ? "flex" : "none";
  }

  function bip() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!S._actx) S._actx = new Ctx();
      var o = S._actx.createOscillator();
      var g = S._actx.createGain();
      o.frequency.value = 660;
      g.gain.value = 0.04;
      o.connect(g); g.connect(S._actx.destination);
      o.start();
      o.stop(S._actx.currentTime + 0.12);
    } catch (e) {}
  }

  function quadro() {
    if (!S.el) return;
    var agora = performance.now();
    var dt = Math.min(0.08, (agora - (S.last || agora)) / 1000);
    S.last = agora;
    if (S.play && S.cob) {
      S.t = Math.min(S.cob.duracao_s, S.t + dt * S.vel);
      if (S.t >= S.cob.duracao_s) S.play = false;
    }
    pintar();
    S.raf = requestAnimationFrame(quadro);
  }

  function pular(dir) {
    if (!S.cob) return;
    var lista = S.cob.roteiro;
    if (dir > 0) {
      for (var i = 0; i < lista.length; i++) if (lista[i].t_ini > S.t + 0.4) { S.t = lista[i].t_ini; return; }
      S.t = S.cob.duracao_s;
    } else {
      for (var j = lista.length - 1; j >= 0; j--) if (lista[j].t_ini < S.t - 0.8) { S.t = lista[j].t_ini; return; }
      S.t = 0;
    }
  }

  function irResultado() {
    if (!S.cob) return;
    var achou = null;
    S.cob.roteiro.forEach(function (seg) { if (seg.tipo === "chamada" && seg.confirmado) achou = seg; });
    S.t = achou ? achou.t_ini : S.cob.duracao_s * 0.92;
    S.play = true;
  }

  function trocarCanal(id) {
    S.canal = id;
    S.cache = {};
    var t = S.t;
    S.cob = montar(S.corridas[S.i]);
    S.t = Math.min(t, S.cob.duracao_s);
    S.pip = null;
    if (S.el) preencherControles();
    pintar();
  }

  function ligarPip() {
    var ids = TJ.CANAIS.map(function (c) { return c.id; });
    var idx = ids.indexOf(S.canal);
    var outro = ids[(idx + 1) % ids.length];
    var atual = S.canal;
    S.canal = outro;
    S.pip = montar(S.corridas[S.i]);
    S.canal = atual;
    S.cob = montar(S.corridas[S.i]);
  }

  function skeleton() {
    var el = document.createElement("div");
    el.id = "telejornal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cobertura ao vivo da apuração");
    if (S.reduz) el.classList.add("tj-quiet");
    el.innerHTML = '<div class="tj-aviso"><span>Simulação satírica. Tarja de última hora sem flash contínuo. Áudio desligado.</span><button type="button" data-tj="aviso">Entendi</button></div>' +
      '<header class="tj-top"><span class="tj-live">AO VIVO</span><div class="tj-marca"></div><div class="grow"><span class="tj-relogio">17:00</span> · Brasília</div><div class="tj-urnas">0,0%</div></header>' +
      '<div class="tj-tabs" data-tj-corridas></div>' +
      '<div class="tj-stage"><section class="tj-studio"><div class="tj-cam"><div class="tj-sil tj-ancora" data-papel="ancora"><i class="cabeca"></i><i class="corpo"></i></div><div class="tj-sil tj-coancora" data-papel="coancora"><i class="cabeca"></i><i class="corpo"></i></div><div class="tj-desk"></div><div class="tj-lower"><b></b><span></span></div><div class="tj-pip" hidden></div></div><p class="tj-fala"></p></section><section class="tj-telao" aria-label="Telão"></section></div>' +
      '<div class="tj-tabs" data-tj-paineis></div>' +
      '<div class="tj-split"><div class="tj-rep"></div><div class="tj-rep"></div></div>' +
      '<div class="tj-tick"><p></p></div>' +
      '<div class="tj-canais" data-tj-canais></div>' +
      '<footer class="tj-ctl"></footer>' +
      '<div class="tj-aria" aria-live="polite" style="position:absolute;left:-9999px"></div>';
    document.body.appendChild(el);
    S.el = el;
  }

  function preencherControles() {
    var tabs = S.el.querySelector("[data-tj-corridas]");
    tabs.innerHTML = S.corridas.map(function (c, i) {
      return '<button type="button" data-tj="corrida" data-i="' + i + '"' + (i === S.i ? ' class="on"' : "") + ">" + esc(c.titulo) + (c.turno === 2 ? " · 2º" : "") + "</button>";
    }).join("");
    var pai = S.el.querySelector("[data-tj-paineis]");
    pai.innerHTML = [["auto", "Ao vivo"], ["placar", "Placar"], ["hemiciclo", "Hemiciclo"], ["candidatos", "Candidatos"], ["mapa", "Mapa"], ["qe", "Quociente"]].map(function (p) {
      return '<button type="button" data-tj="painel" data-i="' + p[0] + '"' + (S.painel === p[0] ? ' class="on"' : "") + ">" + p[1] + "</button>";
    }).join("");
    var can = S.el.querySelector("[data-tj-canais]");
    can.innerHTML = TJ.CANAIS.map(function (c) {
      return '<button type="button" data-tj="canal" data-i="' + c.id + '"' + (S.canal === c.id ? ' class="on"' : "") + ">" + esc(c.pele) + "</button>";
    }).join("");
    var ctl = S.el.querySelector(".tj-ctl");
    ctl.innerHTML = '<button type="button" data-tj="pausa">' + (S.play ? "Pausar" : "Continuar") + '</button>' +
      [1, 2, 4].map(function (v) { return '<button type="button" data-tj="vel" data-i="' + v + '"' + (S.vel === v ? ' class="on"' : "") + ">" + v + "×</button>"; }).join("") +
      '<button type="button" data-tj="pular" data-i="-1">Bloco anterior</button>' +
      '<button type="button" data-tj="pular" data-i="1">Pular</button>' +
      '<button type="button" data-tj="resultado">Ver só o resultado</button>' +
      '<button type="button" data-tj="pip">PiP</button>' +
      '<button type="button" data-tj="audio"' + (S.audio ? ' class="on"' : "") + ">Áudio</button>" +
      '<button type="button" data-tj="voz"' + (S.voz ? ' class="on"' : "") + ">Voz</button>" +
      '<button type="button" data-tj="dalt"' + (S.dalt ? ' class="on"' : "") + ">Daltonismo</button>" +
      '<button type="button" data-tj="insp">Inspetor</button>' +
      '<button type="button" data-tj="conta">Entenda a conta</button>' +
      '<button type="button" data-tj="simples">Modo Simples</button>' +
      '<button type="button" data-tj="fechar">Concluir</button>' +
      '<div class="tj-dec" style="display:none"><button type="button" data-tj="dec" data-i="agradecer">Agradecer</button><button type="button" data-tj="dec" data-i="conceder">Conceder</button><button type="button" data-tj="dec" data-i="contestar">Contestar</button></div>';
    var a = pessoa(S.cob, "ancora");
    var b = pessoa(S.cob, "coancora");
    var sa = S.el.querySelector(".tj-sil.tj-ancora");
    var sb = S.el.querySelector(".tj-sil.tj-coancora");
    if (sa && a.silhueta) { sa.querySelector(".cabeca").style.background = a.silhueta.cor; sa.querySelector(".corpo").style.background = a.silhueta.cor; sa.classList.toggle("quadrado", a.silhueta.forma === "quadrado"); }
    if (sb && b.silhueta) { sb.querySelector(".cabeca").style.background = b.silhueta.cor; sb.querySelector(".corpo").style.background = b.silhueta.cor; }
  }

  function clique(ev) {
    var b = ev.target.closest("[data-tj]");
    if (!b || !S.el.contains(b)) return;
    var a = b.getAttribute("data-tj");
    if (a === "aviso") { var av = S.el.querySelector(".tj-aviso"); if (av) av.remove(); S.aviso = true; }
    else if (a === "pausa") { S.play = !S.play; S.last = performance.now(); preencherControles(); }
    else if (a === "vel") { S.vel = Number(b.getAttribute("data-i")) || 1; S.play = true; preencherControles(); }
    else if (a === "pular") pular(Number(b.getAttribute("data-i")) || 1);
    else if (a === "resultado") irResultado();
    else if (a === "canal") trocarCanal(b.getAttribute("data-i"));
    else if (a === "corrida") { S.i = Number(b.getAttribute("data-i")) || 0; S.cache = {}; S.cob = montar(S.corridas[S.i]); S.t = 0; preencherControles(); }
    else if (a === "painel") { S.painel = b.getAttribute("data-i"); preencherControles(); pintar(); }
    else if (a === "pip") { if (S.pip) { S.pip = null; S.el.querySelector(".tj-pip").hidden = true; } else { ligarPip(); var p = S.el.querySelector(".tj-pip"); p.hidden = false; } }
    else if (a === "audio") { S.audio = !S.audio; if (S.audio) bip(); preencherControles(); }
    else if (a === "voz") { S.voz = !S.voz; if (!S.voz && window.speechSynthesis) window.speechSynthesis.cancel(); preencherControles(); }
    else if (a === "dalt") { S.dalt = !S.dalt; S.cache = {}; preencherControles(); pintar(); }
    else if (a === "simples") { modoSimples(); }
    else if (a === "fechar") { concluir(); }
    else if (a === "conta") { abrirConta(); }
    else if (a === "insp") { abrirInspetor(); }
    else if (a === "dec") { decidir(b.getAttribute("data-i")); }
    else if (a === "ir-virada") {
      var v = (S.cob.roteiro || []).filter(function (s) { return s.tipo === "virada"; })[0];
      if (v) S.t = v.t_ini;
    }
  }

  function decidir(tom) {
    var fala = S.el.querySelector(".tj-fala");
    var nome = "a candidatura";
    try { nome = J().nome; } catch (e) {}
    var txt = tom === "conceder"
      ? nome + " reconhece o resultado e cumprimenta quem levou a cadeira. Os votos não mudam."
      : tom === "contestar"
        ? nome + " pede recontagem. A soma oficial permanece. O pedido vira fato, não vira voto."
        : nome + " agradece quem votou e fala de " + (S.corridas[S.i] ? S.corridas[S.i].titulo : "a cadeira") + " sem reabrir a urna.";
    if (fala) fala.textContent = txt;
    emitir(tom === "contestar" ? "contestacao" : tom === "conceder" ? "concessao" : "discurso_vitoria", { tom: tom });
  }

  function abrirConta() {
    var corrida = S.corridas[S.i];
    var qe = corrida && corrida.qe;
    var txt = qe
      ? "O quociente eleitoral desta chave é " + TJ.fmtInt(qe.QE) + " votos válidos por cadeira. Cada partido divide os próprios votos por esse número e fica com a parte inteira. O que sobra de cadeira vai para as maiores médias. O candidato precisa de 10% do quociente para sentar na vaga direta do partido."
      : "Nesta chave majoritária, a chamada só sai quando a vantagem de quem lidera é maior do que todos os votos que ainda faltam. Antes disso, o máximo é tendência.";
    var fala = S.el.querySelector(".tj-fala");
    if (fala) fala.textContent = txt;
    S.painel = qe ? "qe" : "placar";
    pintar();
  }

  function abrirInspetor() {
    var antigo = S.el.querySelector(".tj-insp");
    if (antigo) { antigo.remove(); return; }
    var est = estado();
    var seg = est && est.segmento;
    var box = document.createElement("div");
    box.className = "tj-insp";
    var linhas = (S.cob.roteiro || []).slice(0, 18).map(function (s) {
      return "<div>" + Math.round(s.t_ini) + "s · " + esc(s.tipo) + " · " + esc(s.tom) + " · prioridade " + s.prioridade + (s.canal_chamou_errado ? " · chamada errada" : "") + "</div>";
    }).join("");
    var pq = seg && seg.porque ? ("Esta fala: " + seg.tipo + ", tom " + seg.tom + ", canal " + seg.porque.canal + ", prioridade " + seg.prioridade + ".") : "";
    box.innerHTML = "<b>Inspetor</b><p>" + esc(pq) + '</p><button type="button" data-tj="ir-virada">Ir à virada, se houve</button>' + linhas;
    S.el.querySelector(".tj-studio").appendChild(box);
  }

  function modoSimples() {
    guardarModo("simples");
    parar();
    if (S.el) { S.el.remove(); S.el = null; }
    mostrarMapa();
  }

  function concluir() {
    try {
      var E = M().eleicao;
      E._cobertura = {
        semente: S.cob && S.cob.seed,
        canal: S.canal,
        modo: "cobertura",
        momentos: (S.cob && S.cob.roteiro || []).filter(function (s) { return s.prioridade >= 85; }).slice(0, 8).map(function (s) {
          return { t: s.t_curva, tipo: s.tipo, resumo: s.texto };
        })
      };
    } catch (e) {}
    parar();
    if (S.el) { S.el.remove(); S.el = null; }
    var voltar = document.getElementById("tj-voltar-simples");
    if (voltar) voltar.remove();
    var fechar = document.querySelector("#apurMapa [data-ap='fechar']");
    if (fechar) fechar.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    else {
      try { M().eleicao.noiteVista = true; M().eleicao.pendenteModal = false; } catch (e2) {}
      try { render(); } catch (e3) {}
    }
  }

  function parar() {
    if (S.raf) cancelAnimationFrame(S.raf);
    S.raf = 0;
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function abrir() {
    if (modoGuardado() === "simples") { mostrarMapa(); return; }
    css();
    S.reduz = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    garantirMapa();
    esconderMapa();
    var voltar = document.getElementById("tj-voltar-simples");
    if (voltar) voltar.remove();
    S.corridas = corridasDoJogo();
    if (S.el) { parar(); S.el.remove(); S.el = null; }
    if (!S.corridas.length) {
      mostrarMapa();
      return;
    }
    var pref = "PRES";
    try {
      var cargo = typeof cargoAtualId === "function" ? cargoAtualId() : "";
      if (cargo === "DEPF" || cargo === "DEPE" || cargo === "VER" || cargo === "GOV" || cargo === "PRES") pref = cargo;
    } catch (e) {}
    var idx = S.corridas.findIndex(function (c) { return c.id === pref; });
    S.i = idx >= 0 ? idx : 0;
    S.t = 0;
    S.play = true;
    S.vel = 1;
    S.cache = {};
    S.fatos = {};
    S.cob = montar(S.corridas[S.i]);
    skeleton();
    preencherControles();
    emitir("apuracao_inicio", { cargo: S.corridas[S.i].titulo, canal: S.canal });
    S.last = performance.now();
    S.raf = requestAnimationFrame(quadro);
  }

  function tecla(ev) {
    if (!S.el) return;
    var tag = (ev.target && ev.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (ev.code === "Space") { ev.preventDefault(); S.play = !S.play; preencherControles(); }
    else if (ev.key === "ArrowRight") pular(1);
    else if (ev.key === "ArrowLeft") pular(-1);
    else if (ev.key === "s" || ev.key === "S") irResultado();
    else if (ev.key === "c" || ev.key === "C") {
      var ids = TJ.CANAIS.map(function (c) { return c.id; });
      trocarCanal(ids[(ids.indexOf(S.canal) + 1) % ids.length]);
      preencherControles();
    }
  }
  document.addEventListener("keydown", tecla);
  document.addEventListener("click", function (ev) {
    if (!S.el) return;
    clique(ev);
  }, true);

  var renderAnterior = window.render;
  window.render = function () {
    var out = renderAnterior ? renderAnterior.apply(this, arguments) : undefined;
    try {
      var E = (typeof gameState !== "undefined" && gameState && M() && M().eleicao) || null;
      var quer = E && E.noite && E.noite.v2 && !E.noiteVista && E.pendenteModal;
      if (quer && !document.getElementById("telejornal") && modoGuardado() !== "simples") abrir();
      if (!quer && document.getElementById("telejornal")) {
        parar();
        var el = document.getElementById("telejornal");
        if (el) el.remove();
        S.el = null;
      }
    } catch (e) {}
    return out;
  };

  var modalAnterior = window.modalNoite;
  window.modalNoite = function () {
    if (modoGuardado() === "simples") {
      return modalAnterior ? modalAnterior.apply(this, arguments) : "";
    }
    try { abrir(); return ""; }
    catch (e) { return modalAnterior ? modalAnterior.apply(this, arguments) : ""; }
  };

  window.__tj = {
    abrir: abrir,
    simples: modoSimples,
    estado: function () { return { t: S.t, play: S.play, canal: S.canal, i: S.i, corridas: S.corridas.map(function (c) { return c.id; }) }; },
    ir: function (t) { S.t = t; S.play = false; pintar(); },
    pausar: function () { S.play = false; },
    seguir: function () { S.play = true; },
    corrida: function (id) {
      var i = S.corridas.findIndex(function (c) { return c.id === id; });
      if (i >= 0) { S.i = i; S.cache = {}; S.cob = montar(S.corridas[S.i]); S.t = 0; preencherControles(); pintar(); }
      return i;
    },
    resultado: irResultado
  };
})();
