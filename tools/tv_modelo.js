/* =============================================================================
   CADEIRA v3 — Noite eleitoral na TV (gerado por tools/gerar_tv.py)
   Camada de APRESENTAÇÃO por cima da apuração existente (#apurMapa):
   - não recalcula nada: lê window._apMapa (mesmo relógio AP.pct, mesmas
     listas nacionais/estaduais/municipais, mesmos eleitos e parciais);
   - a apuração clássica continua rodando por baixo e é quem grava o resultado;
   - o jogador escolhe a emissora (TV Globo, CNN Brasil, Band); cada uma tem
     estúdio, equipe, repórteres regionais, cores e organização próprios;
   - a TV tem ritmo próprio (1x ≈ 5 minutos de apuração);
   - um "diretor de TV" alterna cenas: abertura, disputa nacional, entradas ao
     vivo das regiões (o mapa real do Brasil aproxima a região e o repórter
     comenta estado por estado), Senado, governos, comentaristas e plantões;
   - cada estado apura no seu ritmo (fracUF): quando um governador ou senador
     fica matematicamente eleito (ou o 2º turno fica garantido), o mapa foca no
     estado e o repórter da região anuncia.
   Novas emissoras: CANAIS. Novos tipos de cena: CENAS + proximaCena().
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3TV) return;
  var IMG = __IMAGENS__;
  var TV = (window.V3TV = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function A() { return window._apMapa; }
  function fmtV(n) { return Math.round(n || 0).toLocaleString("pt-BR"); }
  function fmtP(x) { return (x || 0).toFixed(2).replace(".", ","); }
  function fmtP1(x) { return (x || 0).toFixed(1).replace(".", ","); }
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function img(k) { return IMG[k] || ok(function () { return window.V3DEB.IMG[k]; }, "") || ok(function () { return window.V3MARCAS.logo(k); }, ""); }
  function npcPorNome(n) { return ok(function () { return bancoDeNPCs.find(function (x) { return x.nome === n; }); }, null); }
  function npcPorId(id) { return ok(function () { return bancoDeNPCs.find(function (x) { return x.id === id; }); }, null); }
  function fotoNome(n) { var x = npcPorNome(n); return x ? ok(function () { return obterFotoPolitico(x); }, "") : ""; }
  function limpaNome(n) { return String(n || "").replace(/\s*\((vice|suplentes?):.*$/i, "").trim(); }
  function vice(n) { var m = /\((vice|suplentes?):\s*([^)]*)\)/i.exec(n || ""); return m ? (m[1].toLowerCase() === "vice" ? "vice: " : "suplentes: ") + m[2] : ""; }
  function fem(c) {
    if (!c) return false; if (c.jogador) return ok(function () { return J().sexo === "F"; }, false);
    var n = npcPorId(c.id); if (n && n.sexo) return n.sexo === "F";
    var p = limpaNome(c.nome).split(" ")[0]; return ok(function () { return FEM.includes(p); }, false);
  }
  function oa(c, m, f) { return fem(c) ? f : m; }

  /* ================================================================ emissoras */
  // equipe: personagens que já existem no jogo + repórteres regionais enviados pelo dono do jogo.
  // "img" aponta para imagem embutida; sem img, usa a foto do banco de políticos/figuras.
  var CANAIS = {
    globo: { nome: "TV Globo", programa: "ELEIÇÕES 2026 • APURAÇÃO AO VIVO", logo: "logo_globo", estudio: "estudio_globo", tema: "globo",
      ancoras: [{ nome: "César Tralli", img: "med_cesar_tralli", papel: "apresentador" }, { nome: "Renata Lo Prete", img: "med_renata_lo_prete", papel: "apresentadora" }],
      abertura: { nome: "William Bonner", papel: "abertura da cobertura" },
      comentaristas: [{ nome: "Andréia Sadi", papel: "bastidores da política" }, { nome: "Merval Pereira", papel: "comentarista político" }, { nome: "Miriam Leitão", papel: "economia" }, { nome: "Vera Magalhães", papel: "análise política" }, { nome: "Guga Chacra", papel: "repercussão internacional" }],
      reporteres: { n: { nome: "Breno Cabral", img: "rep_globo_n" }, ne: { nome: "Márcio Bonfim", img: "rep_globo_ne" }, co: { nome: "Ana Flor", img: "rep_globo_co" }, se: { nome: "Maju Coutinho", img: "rep_globo_se" }, s: { nome: "Eloi Zorzetto", img: "rep_globo_s" } } },
    cnn: { nome: "CNN Brasil", programa: "CNN ELEIÇÕES • CENTRAL DE APURAÇÃO", logo: "cnn", estudio: "estudio_cnn", tema: "cnn",
      ancoras: [{ nome: "William Waack", img: "med_william_waack", papel: "apresentador" }],
      comentaristas: [{ nome: "Gabriela Prioli", papel: "comentarista" }, { nome: "Caio Coppola", papel: "comentarista" }, { nome: "Alexandre Garcia", papel: "analista político" }],
      reporteres: { n: { nome: "Tayana Narcisa", img: "rep_cnn_n" }, ne: { nome: "Camila Tíssia", img: "rep_cnn_ne" }, co: { nome: "Tainá Falcão", img: "rep_cnn_co" }, se: { nome: "Márcio Gomes", img: "rep_cnn_se" }, s: { nome: "Elisa Veeck", img: "rep_cnn_s" } } },
    band: { nome: "Band", programa: "BAND ELEIÇÕES • APURAÇÃO", logo: "logo_band", estudio: "estudio_band", tema: "band",
      ancoras: [{ nome: "Adriana Araújo", img: "med_adriana_araujo", papel: "apresentadora" }, { nome: "Eduardo Oinegue", img: "med_eduardo_oinegue", papel: "apresentador" }],
      comentaristas: [{ nome: "Reinaldo Azevedo", papel: "comentarista da BandNews" }],
      reporteres: { n: { nome: "Brena Dianná", img: "rep_band_n" }, ne: { nome: "Maria Lorena Alves", img: "rep_band_ne" }, co: { nome: "Lana Canepa", img: "rep_band_co" }, se: { nome: "Cynthia Martins", img: "rep_band_se" }, s: { nome: "Sérgio Stock", img: "rep_band_s" } } }
  };
  TV.CANAIS = CANAIS;

  var REG = {
    se: { nome: "Sudeste", ufs: ["SP", "MG", "RJ", "ES"] },
    ne: { nome: "Nordeste", ufs: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "PI", "SE"] },
    s: { nome: "Sul", ufs: ["RS", "PR", "SC"] },
    n: { nome: "Norte", ufs: ["PA", "AM", "RO", "TO", "AC", "AP", "RR"] },
    co: { nome: "Centro-Oeste", ufs: ["GO", "DF", "MT", "MS"] }
  };
  var ORDEM_REG = ["se", "ne", "s", "n", "co"];
  function regDe(uf) { for (var k in REG) if (REG[k].ufs.indexOf(uf) >= 0) return k; return "se"; }
  TV.REG = REG;

  // ritmo da TV (AP.vel): 1x ≈ 5 min; "Rápido" = ritmo da tela clássica
  var VEL = [["1x", 0.12], ["2x", 0.25], ["4x", 0.5], ["Rápido", 1]];
  var VEL_TV = 0.12;
  // duração das cenas (ms de tempo real)
  var D = { abertura: 11000, nacional: 10000, porEstado: 4200, introReg: 3200, plantao: 7500, senado: 10000, governos: 10000, comentario: 10000, estado: 12000 };

  /* ================================================================ dados (somente leitura) */
  function municipal() { return ok(function () { return tipoEleicao(dt().ano) === "MUNICIPAL"; }, false); }
  function pct() { return ok(function () { return A().AP.pct; }, 0) || 0; }
  function turno2() { return ok(function () { return M().eleicao.noite.turno === 2; }, false) || ok(function () { return A().turno2Agora(); }, false); }
  function UFN(uf) { return ok(function () { return A().UF_NOME[uf]; }, uf) || uf; }
  function ordena(l) { return (l || []).slice().sort(function (a, b) { return (b.votos || 0) - (a.votos || 0); }); }
  // Cada corrida devolve {titulo, sub, lista (parcial), fin (final), f, status, run, vagas}
  function corridaPres() {
    var N = A().nac(), lista0 = N.pres || []; if (!lista0.length) return null;
    if (A().presEncerrado()) { var b = A().basePrimeiroPres(N); return { id: "pres", titulo: "Presidente da República", sub: "Brasil", lista: b, fin: b, f: 1, fim: true, run: false, eleito1: true }; }
    var f = pct() / 100, l = A().parcialCands(lista0, f);
    var run = !turno2() && (N.presRodada === "2" || (lista0.length > 1 && (ordena(lista0)[0].share || 0) <= 50));
    return { id: "pres", titulo: "Presidente da República", sub: "Brasil", lista: l, fin: lista0, f: f, fim: f >= 1, run: run };
  }
  function corridaGov(uf) {
    var p = A().painel(uf); if (!p || !(p.gov || []).length) return null;
    if (A().govEncerradoUF(uf)) { var b = A().basePrimeiroGov(p); return { id: "gov", uf: uf, titulo: "Governador", sub: UFN(uf), lista: b, fin: b, f: 1, fim: true, run: false, eleito1: true }; }
    var f = A().fracUF(uf), l = A().parcialCands(p.gov, f);
    var run = !turno2() && (p.rodadaGov === "2" || (p.gov.length > 1 && (ordena(p.gov)[0].share || 0) <= 50));
    return { id: "gov", uf: uf, titulo: "Governador", sub: UFN(uf), lista: l, fin: p.gov, f: f, fim: f >= 1, run: run };
  }
  function corridaSen(uf) {
    var p = A().painel(uf); if (!p || !(p.sen || []).length || turno2()) return null;
    var f = A().fracUF(uf); return { id: "sen", uf: uf, titulo: "Senado", sub: UFN(uf), lista: A().parcialCands(p.sen, f), fin: p.sen, f: f, fim: f >= 1, run: false, vagas: p.vagas || 1 };
  }
  function corridaPref() {
    var N = A().nac(), l0 = N.pref || []; if (!l0.length) return null;
    var f = pct() / 100, l = A().parcialCands(l0, f);
    var run = (N.prefRodada === "2" && f < 1) || (l0.length > 1 && (l0[0].share || 0) <= 50);
    return { id: "pref", titulo: "Prefeito de Mauá", sub: "Mauá", lista: l, fin: l0, f: f, fim: f >= 1, run: run };
  }
  function principal() { return municipal() ? corridaPref() : (corridaPres() || corridaGov("SP")); }
  function minhaDisputa() {
    return ok(function () { var d = dt(); return (CAR().eleicoes || []).filter(function (e) { return e.ano === d.ano; }).slice(-1)[0] || null; }, null);
  }

  /* -------- decisão matemática: o resultado não pode mais mudar com os votos que faltam.
     Usa as listas finais da própria apuração só para nunca anunciar algo diferente do resultado gravado. */
  function decisao(c) {
    if (!c || c.nodec || !c.lista || !c.lista.length) return null;
    if (c.eleito1) return { tipo: "eleito", quem: [c.lista[0]], hist: true };
    var fin = ordena(c.fin), T = fin.reduce(function (s, x) { return s + (x.votos || 0); }, 0); if (!T) return null;
    var l = c.lista, apur = l.reduce(function (s, x) { return s + (x.votos || 0); }, 0), rest = c.f >= 1 ? 0 : Math.max(0, T - apur, T * (1 - c.f));
    var v = function (x) { return (x && x.votos) || 0; };
    if (c.vagas) {
      var ok_ = l.slice(0, c.vagas).filter(function (x) { return fin.slice(0, c.vagas).some(function (y) { return y.id === x.id; }) && (c.f >= 1 || v(x) > v(l[c.vagas]) + rest); });
      return ok_.length ? { tipo: "eleito", quem: ok_ } : null;
    }
    if (!c.run) {
      if (l[0].id !== fin[0].id) return null;
      var venceu = c.f >= 1 || (turno2() ? v(l[0]) > v(l[1]) + rest : v(l[0]) > 0.5 * T);
      return venceu ? { tipo: "eleito", quem: [l[0]] } : null;
    }
    if (l.length < 2) return null;
    var dupla = [fin[0].id, fin[1] && fin[1].id];
    if (dupla.indexOf(l[0].id) < 0 || dupla.indexOf(l[1].id) < 0) return null;
    var garantido = c.f >= 1 || (v(l[0]) + rest < 0.5 * T && (!l[2] || v(l[2]) + rest < v(l[1])));
    return garantido ? { tipo: "segundo", quem: [l[0], l[1]] } : null;
  }
  function statusDe(c) {
    if (!c) return { txt: "", cls: "" };
    var d = decisao(c);
    if (d && d.tipo === "segundo") return { txt: "2º TURNO", cls: "segundo" };
    if (d && d.tipo === "eleito") return { txt: c.vagas ? (d.quem.length >= c.vagas ? "ELEITOS" : "ELEITO") : (d.hist ? "ELEITO NO 1º TURNO" : "ELEITO"), cls: "eleito" };
    if (c.f > 0.8 && !c.run && c.lista[0] && (c.lista[0].share || 0) > 50) return { txt: "TENDÊNCIA DE VITÓRIA", cls: "quase" };
    return { txt: "EM APURAÇÃO", cls: "apurando" };
  }
  function eleitoIds(c) { var d = decisao(c); return d ? d.quem.map(function (x) { return x.id; }) : []; }
  function reeleito(c, cargo, uf) { var n = npcPorId(c && c.id); return !!(n && n.cargo === cargo && (!uf || !n.uf || n.uf === uf)); }

  /* ================================================================ estado da sessão */
  var st = { canal: null, aberto: false, oculto: false, uf: null, cena: null, fila: [], senNovos: [], seguidos: 0, anunc: {}, regI: 0, rot: 0, quem: 0, vb: null, vbAlvo: null, tickT: 0 };
  function pref() { try { return localStorage.getItem("cadeira_tv_canal") || ""; } catch (e) { return ""; } }
  function agora() { return Date.now(); }

  /* ================================================================ diretor de TV */
  // Procura decisões novas (governo, Senado, Presidente) e põe na fila de plantões.
  function varrerDecisoes() {
    if (municipal()) return;
    var cp = corridaPres(), dp = cp && !cp.eleito1 ? decisao(cp) : null;
    if (dp && !st.anunc.pres) { st.anunc.pres = 1; st.fila.unshift({ tipo: "pres", d: dp, c: cp }); }
    Object.keys(A().UF_NOME || {}).forEach(function (uf) {
      var g = corridaGov(uf);
      if (g && !g.eleito1 && !st.anunc["gov" + uf]) { var d = decisao(g); if (d) { st.anunc["gov" + uf] = 1; st.fila.push({ tipo: "gov", uf: uf, d: d, c: g }); } }
      var s = corridaSen(uf);
      if (s) eleitoIds(s).forEach(function (id) {
        if (st.anunc["sen" + uf + id]) return; st.anunc["sen" + uf + id] = 1;
        var x = s.lista.filter(function (y) { return y.id === id; })[0];
        if (x && !st.senNovos.some(function (e) { return e.uf === uf && e.x.id === id; })) st.senNovos.push({ tipo: "sen", uf: uf, x: x, c: s });
      });
    });
  }
  function regioesAtivas() {
    return ORDEM_REG.filter(function (r) { return REG[r].ufs.some(function (uf) { var g = corridaGov(uf); return g && !g.eleito1; }); });
  }
  function novaCena(tipo, dados, dur) { st.cena = { tipo: tipo, ini: agora(), dur: dur, d: dados || {} }; st.quem++; }
  function proximaCena() {
    var p = pct();
    if (municipal()) {
      var ciclo = ["nacional", "comentario"];
      if (p >= 100) return novaCena("final", {}, 1e9);
      return novaCena(st.rot++ === 0 ? "abertura" : ciclo[st.rot % 2], {}, D.nacional);
    }
    if (!st.cena) return novaCena("abertura", {}, D.abertura);
    // 1) plantões (no máximo dois seguidos antes de voltar ao programa, até o fim da apuração)
    var pode = st.seguidos < 2 || p >= 100;
    if (st.fila.length && (pode || st.fila[0].tipo === "pres")) {
      st.seguidos++;
      var pri = st.fila.shift();
      if (pri.tipo === "pres") return novaCena("plantaoPres", pri, D.plantao + 2500);
      // governadores da mesma região entram juntos; senadores já eleitos nesses estados vão no mesmo plantão
      var r = regDe(pri.uf), grupo = [pri];
      st.fila = st.fila.filter(function (e) { if (e.tipo !== "pres" && regDe(e.uf) === r && grupo.length < 4) { grupo.push(e); return false; } return true; });
      var us = uniq(grupo);
      st.senNovos = st.senNovos.filter(function (e) { if (us.indexOf(e.uf) >= 0) { if (!grupo.some(function (g) { return g.tipo === "sen" && g.uf === e.uf && g.x.id === e.x.id; })) grupo.push(e); return false; } return true; });
      return novaCena("plantao", { reg: r, itens: grupo, ufs: us }, us.length * D.plantao);
    }
    // boletim do Senado: junta os senadores eleitos desde o último boletim
    if ((st.senNovos.length >= 4 || (p >= 100 && st.senNovos.length)) && pode) {
      st.seguidos++;
      var lote = st.senNovos.splice(0, 8);
      return novaCena("plantaoSen", { itens: lote }, D.plantao + lote.length * 900);
    }
    st.seguidos = 0;
    if (p >= 100) {
      if (st.cena.tipo === "final") return novaCena("final", {}, 1e9);
      return novaCena(st.cena.tipo === "governos" || turno2() ? "final" : "governos", {}, st.cena.tipo === "governos" || turno2() ? 1e9 : D.governos);
    }
    // 2) rotação do programa
    var ciclo2 = ["nacional", "regional", "comentario", "regional", "senado", "regional", "governos", "regional"];
    for (var t = 0; t < ciclo2.length; t++) {
      var tipo = ciclo2[st.rot++ % ciclo2.length];
      if (tipo === "regional") {
        if (p < 6) continue;
        var ativas = regioesAtivas(); if (!ativas.length) continue;
        var reg = ativas[st.regI++ % ativas.length];
        var ufs = REG[reg].ufs.filter(function (uf) { var g = corridaGov(uf); return g && !g.eleito1; });
        return novaCena("regional", { reg: reg, ufs: ufs }, D.introReg + ufs.length * D.porEstado);
      }
      if (tipo === "senado" && (turno2() || p < 15)) continue;
      if (tipo === "governos" && p < 20) continue;
      if (tipo === "comentario" && p < 25) continue;
      return novaCena(tipo, {}, D[tipo]);
    }
    return novaCena("nacional", {}, D.nacional);
  }
  function uniq(grupo) { var u = {}; grupo.forEach(function (e) { u[e.uf] = 1; }); return Object.keys(u); }
  function dirigir() {
    if (!st.canal) return;
    varrerDecisoes();
    var c = st.cena, t = agora();
    var urgente = st.fila.length && c && ["nacional", "senado", "governos", "comentario"].indexOf(c.tipo) >= 0 && t - c.ini > 3000;
    if (!c || t - c.ini > c.dur || urgente || (c.tipo === "final" && (st.fila.length || st.senNovos.length))) proximaCena();
  }
  TV.dirigir = dirigir;

  /* ================================================================ mapa real do Brasil (GEO.br) com zoom */
  var BB = null;
  function caixas() {
    if (BB) return BB; BB = {};
    var g = ok(function () { return GEO.br; }, null); if (!g) return BB;
    Object.keys(g.p).forEach(function (uf) {
      var nums = g.p[uf].match(/-?\d+\.?\d*/g) || [], a = [1e9, 1e9, -1e9, -1e9];
      for (var i = 0; i + 1 < nums.length; i += 2) { var x = +nums[i], y = +nums[i + 1]; a[0] = Math.min(a[0], x); a[1] = Math.min(a[1], y); a[2] = Math.max(a[2], x); a[3] = Math.max(a[3], y); }
      BB[uf] = a;
    });
    return BB;
  }
  function vbDe(ufs) {
    var g = GEO.br; if (!ufs || !ufs.length) return [0, 0, g.w, g.h];
    var b = caixas(), a = [1e9, 1e9, -1e9, -1e9];
    ufs.forEach(function (uf) { var x = b[uf]; if (!x) return; a[0] = Math.min(a[0], x[0]); a[1] = Math.min(a[1], x[1]); a[2] = Math.max(a[2], x[2]); a[3] = Math.max(a[3], x[3]); });
    var w = a[2] - a[0], h = a[3] - a[1], m = Math.max(w, h) * 0.14 + 6, cx = (a[0] + a[2]) / 2, cy = (a[1] + a[3]) / 2;
    w = Math.max(w + m * 2, ufs.length === 1 ? 125 : 90); h = Math.max(h + m * 2, ufs.length === 1 ? 125 : 90);
    var r = g.w / g.h; if (w / h < r) w = h * r; else h = w / r; // mantém a proporção da caixa
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function mapaBase() {
    var g = ok(function () { return GEO.br; }, null); if (!g) return '<p class="tv-nota">Mapa indisponível.</p>';
    var paths = Object.keys(g.p).map(function (uf) { return '<path data-tv="uf" data-id="' + uf + '" data-uf="' + uf + '" d="' + g.p[uf] + '" fill="#1c2c4a" vector-effect="non-scaling-stroke"><title>' + esc_(UFN(uf)) + "</title></path>"; }).join("");
    var lbl = Object.keys(g.c || {}).map(function (uf) { var c = g.c[uf]; return '<text data-l="' + uf + '" x="' + c[0] + '" y="' + c[1] + '">' + uf + "</text>"; }).join("");
    return '<svg class="tv-br" viewBox="0 0 ' + g.w + " " + g.h + '" preserveAspectRatio="xMidYMid meet"><g class="tv-br-p">' + paths + '</g><g class="tv-br-l">' + lbl + "</g></svg>";
  }
  function modoMapa() {
    var c = st.cena; if (!c) return { modo: "pres", foco: null };
    switch (c.tipo) {
      case "regional": var i = estadoDaVez(); return { modo: "gov", foco: i >= 0 ? [c.d.ufs[i]] : REG[c.d.reg].ufs, reg: REG[c.d.reg].ufs };
      case "plantao": var u = [c.d.ufs[plantaoDaVez()]]; return { modo: "gov", foco: u, reg: REG[c.d.reg].ufs, destaque: u };
      case "senado": return { modo: "sen", foco: null };
      case "plantaoSen": return { modo: "sen", foco: null, destaque: uniq(c.d.itens) };
      case "governos": case "final": return { modo: turno2() && c.tipo === "final" ? "pres" : (c.tipo === "final" ? "pres" : "gov"), foco: null };
      case "estado": return { modo: "gov", foco: [c.d.uf], destaque: [c.d.uf] };
      default: return { modo: "pres", foco: null };
    }
  }
  function corUF(modo, uf) {
    var f = ok(function () { return A().fracUF(uf); }, 0);
    if (modo === "gov" && ok(function () { return A().govEncerradoUF(uf); }, false)) return { cor: "#5c6578", op: 0.9, fim: true };
    if (modo === "sen" && turno2()) return { cor: "#334155", op: 0.6 };
    if (f <= 0.02) return { cor: "#1c2c4a", op: 1 };
    var l = ok(function () { return A().lider(modo, uf); }, null); if (!l) return { cor: "#2a3a5a", op: 1 };
    var cr = modo === "gov" ? corridaGov(uf) : modo === "sen" ? corridaSen(uf) : null, fim = cr ? !!decisao(cr) : f >= 1;
    return { cor: ok(function () { return A().corDe(l.partido, 0); }, "#64748b"), op: fim ? 1 : 0.38 + 0.5 * f, fim: fim };
  }
  function atualizaMapa(el) {
    var svg = el.querySelector(".tv-br"); if (!svg) return;
    var m = modoMapa(), reg = m.reg || null, dest = m.destaque || (m.foco && m.foco.length === 1 ? m.foco : []);
    Array.prototype.forEach.call(svg.querySelectorAll("path[data-uf]"), function (p) {
      var uf = p.getAttribute("data-uf"), c = corUF(m.modo, uf);
      p.setAttribute("fill", c.cor); p.setAttribute("fill-opacity", c.op.toFixed(2));
      p.setAttribute("class", (dest.indexOf(uf) >= 0 ? "dest " : "") + (reg && reg.indexOf(uf) < 0 ? "fora " : "") + (c.fim ? "fim" : ""));
    });
    var alvo = vbDe(m.foco), k = alvo.map(function (x) { return Math.round(x); }).join(",");
    if (st.vbK !== k) { st.vbK = k; animaVB(svg, alvo); }
    var leg = { pres: "Presidente • quem lidera em cada estado", gov: "Governadores • quem lidera em cada estado", sen: "Senado • quem lidera em cada estado" }[m.modo];
    var cap = el.querySelector(".tv-mapcap"); if (cap && cap.textContent !== leg) cap.textContent = leg;
  }
  function animaVB(svg, alvo) {
    var de = (svg.getAttribute("viewBox") || "").split(/\s+/).map(Number); if (de.length !== 4 || de.some(isNaN)) de = alvo;
    var t0 = performance.now(), dur = 1100, id = (st.anim = (st.anim || 0) + 1);
    function passo(t) {
      if (id !== st.anim) return;
      var x = Math.min(1, (t - t0) / dur), e = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      var v = de.map(function (a, i) { return a + (alvo[i] - a) * e; });
      svg.setAttribute("viewBox", v.map(function (n) { return n.toFixed(1); }).join(" "));
      svg.style.setProperty("--fs", (v[2] / 26).toFixed(2) + "px");
      if (x < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* ================================================================ peças visuais */
  function fotoCand(c) { var f = ok(function () { var n = c.id && c.id !== "JOGADOR" ? npcPorId(c.id) : null; return n ? obterFotoPolitico(n) : (c.jogador ? (J().foto || "") : ""); }, ""); return f ? '<img src="' + esc_(f) + '" alt="">' : '<span class="tv-ini">' + esc_(limpaNome(c.nome).charAt(0)) + "</span>"; }
  function barras(c, max, mini) {
    var ids = eleitoIds(c), d = decisao(c);
    return '<div class="tv-cands' + (mini ? " mini" : "") + '">' + c.lista.slice(0, max || 4).map(function (x, i) {
      var cor = ok(function () { return A().corDe(x.partido, i); }, "#64748b"), marca = ids.indexOf(x.id) >= 0 ? '<em class="tv-selo ' + (d.tipo === "segundo" ? "segundo" : "eleito") + '">' + (d.tipo === "segundo" ? "2º TURNO" : oa(x, "ELEITO", "ELEITA")) + "</em>" : "";
      return '<div class="tv-cand' + (x.jogador ? " eu" : "") + '"><div class="tv-cfoto" style="border-color:' + cor + '">' + fotoCand(x) + '</div><div class="tv-cinfo"><b>' + esc_(limpaNome(x.nome)) + "</b> " + marca + "<small>" + esc_(x.partido) + (!mini && vice(x.nome) ? " • " + esc_(vice(x.nome)) : "") + '</small><div class="tv-barra"><i style="width:' + Math.min(100, x.share || 0) + "%;background:" + cor + '"></i></div></div><div class="tv-cnum"><b>' + fmtP(x.share) + '%</b><small>' + fmtV(x.votos) + " votos</small></div></div>";
    }).join("") + "</div>";
  }
  function urnas(f, sub) { return '<div class="tv-urnas"><b>' + fmtP(f * 100) + '%</b><small>urnas apuradas' + (sub ? " • " + esc_(sub) : "") + '</small><div class="tv-urnas-b"><i style="width:' + Math.min(100, f * 100) + '%"></i></div></div>'; }
  function selo(c) { var s = statusDe(c); return '<em class="tv-selo ' + s.cls + '">' + s.txt + "</em>"; }
  function chipUF(uf, modo) {
    var c = modo === "sen" ? corridaSen(uf) : corridaGov(uf); if (!c || !c.lista[0]) return "";
    var top = c.vagas ? c.lista.slice(0, c.vagas) : c.lista.slice(0, 1), cor = ok(function () { return A().corDe(top[0].partido, 0); }, "#64748b");
    return '<button type="button" class="tv-chip" data-tv="uf" data-id="' + uf + '" style="--c:' + cor + '"><b>' + uf + "</b><span>" + top.map(function (x) { return esc_(limpaNome(x.nome)) + " <small>" + esc_(x.partido) + " " + fmtP1(x.share) + "%</small>"; }).join("<br>") + "</span>" + selo(c) + "</button>";
  }
  function suaDisputa() {
    var e = minhaDisputa(); if (!e) return "";
    if (pct() < 100) return '<div class="tv-sua"><b>Sua disputa</b><small>' + esc_(e.cargo) + " • resultado ao fim da apuração</small></div>";
    return '<div class="tv-sua ' + (/Eleit/.test(e.resultado) ? "ok" : "nao") + '"><b>Sua disputa: ' + esc_(e.resultado) + "</b><small>" + esc_(e.cargo) + (e.votos ? " • " + fmtV(e.votos) + " votos" : "") + "</small></div>";
  }
  function pessoa(p, papel) { return { nome: p.nome, papel: papel || p.papel, foto: p.img ? img(p.img) : fotoNome(p.nome) }; }
  function ancora(ch) { return pessoa(ch.ancoras[st.quem % ch.ancoras.length]); }
  function reporter(ch, reg, aoVivo) { var r = ch.reporteres[reg]; return pessoa(r, (aoVivo ? "ao vivo • " : "") + "Região " + REG[reg].nome); }
  function comentarista(ch) { return pessoa(ch.comentaristas[st.quem % ch.comentaristas.length]); }
  function quemHtml(p, txt, cls) {
    if (!p) return "";
    var foto = p.foto ? '<img src="' + esc_(p.foto) + '" alt="">' : '<span class="tv-ini">' + esc_(p.nome.charAt(0)) + "</span>";
    return '<div class="tv-quem ' + (cls || "") + '"><div class="tv-gc">' + foto + "<div><b>" + esc_(p.nome) + "</b><small>" + esc_(p.papel) + "</small></div></div><p>" + esc_(txt) + "</p></div>";
  }

  /* ================================================================ falas */
  function liderTxt(c) { var a = c.lista[0], b = c.lista[1]; return limpaNome(a.nome) + " (" + a.partido + ") lidera com " + fmtP1(a.share) + "%" + (b ? ", seguid" + oa(a, "o", "a") + " de " + limpaNome(b.nome) + " (" + b.partido + "), com " + fmtP1(b.share) + "%" : ""); }
  function falaEstado(uf) {
    var g = corridaGov(uf), s = corridaSen(uf), f = ok(function () { return A().fracUF(uf); }, 0), h = hash(uf + st.quem) % 3, t;
    if (!g || !g.lista[0]) return "Em " + UFN(uf) + ", ainda aguardamos os primeiros boletins.";
    if (f < 0.03) return "Em " + UFN(uf) + " a apuração mal começou: os primeiros boletins de urna estão chegando ao TRE.";
    var d = decisao(g);
    if (d && d.tipo === "eleito") t = "Em " + UFN(uf) + " a eleição para o governo já está definida: " + limpaNome(d.quem[0].nome) + " (" + d.quem[0].partido + ") venceu" + (d.hist ? " ainda no primeiro turno" : "") + ".";
    else if (d && d.tipo === "segundo") t = "Em " + UFN(uf) + " está confirmado o segundo turno entre " + limpaNome(d.quem[0].nome) + " e " + limpaNome(d.quem[1].nome) + ".";
    else t = [ "Em " + UFN(uf) + ", com " + fmtP1(f * 100) + "% das urnas apuradas, " + liderTxt(g) + ".",
      "Vamos a " + UFN(uf) + ": " + fmtP1(f * 100) + "% apurado. Na disputa pelo governo, " + liderTxt(g) + ".",
      UFN(uf) + " tem " + fmtP1(f * 100) + "% das urnas apuradas. " + liderTxt(g) + (g.run ? ". O cenário aponta para segundo turno." : ".") ][h];
    if (s && s.lista[0]) { var sd = eleitoIds(s); t += sd.length ? " No Senado, " + s.lista.filter(function (x) { return sd.indexOf(x.id) >= 0; }).map(function (x) { return limpaNome(x.nome); }).join(" e ") + " já " + (sd.length > 1 ? "estão eleitos" : "está eleit" + oa(s.lista[0], "o", "a")) + "." : " Para o Senado, " + limpaNome(s.lista[0].nome) + " (" + s.lista[0].partido + ") está na frente, com " + fmtP1(s.lista[0].share) + "%."; }
    return t;
  }
  function falaPlantao(e) {
    var uf = UFN(e.uf);
    if (e.tipo === "sen") return "No Senado, " + limpaNome(e.x.nome) + " (" + e.x.partido + ") está matematicamente eleit" + oa(e.x, "o", "a") + " por " + uf + ", com " + fmtP1(e.x.share) + "% dos votos.";
    var d = e.d, a = d.quem[0];
    if (d.tipo === "segundo") return "Está confirmado: " + uf + " terá segundo turno para o governo entre " + limpaNome(a.nome) + " (" + a.partido + ") e " + limpaNome(d.quem[1].nome) + " (" + d.quem[1].partido + ").";
    return "Acaba de ser confirmado: " + limpaNome(a.nome) + " (" + a.partido + ") é " + (reeleito(a, "Governador", e.uf) ? oa(a, "reeleito governador", "reeleita governadora") : oa(a, "o novo governador", "a nova governadora")) + " de " + uf + ", com " + fmtP1(a.share) + "% dos votos válidos" + (turno2() ? "" : ", já no primeiro turno") + ".";
  }
  function falaPres(c) {
    var d = decisao(c), a = c.lista[0], b = c.lista[1];
    if (d && d.tipo === "segundo") return "Atenção: está matematicamente confirmado o segundo turno para a Presidência entre " + limpaNome(d.quem[0].nome) + " (" + d.quem[0].partido + ") e " + limpaNome(d.quem[1].nome) + " (" + d.quem[1].partido + ").";
    if (d) return "É oficial: " + limpaNome(a.nome) + " (" + a.partido + ") está " + oa(a, "eleito", "eleita") + " " + oa(a, "presidente", "presidenta") + " da República" + (turno2() ? "" : " no primeiro turno") + ", com " + fmtP(a.share) + "% dos votos válidos.";
    return "";
  }
  function falaNacional(c, ch) {
    var a = c.lista[0], b = c.lista[1], p = pct();
    if (p < 1) return "Os primeiros boletins de urna começam a chegar ao TSE.";
    var tx = [ "Com " + fmtP1(p) + "% das urnas apuradas no país, " + liderTxt(c) + ".",
      b ? "A diferença entre " + limpaNome(a.nome) + " e " + limpaNome(b.nome) + " é de " + fmtP1(a.share - b.share) + " pontos, " + fmtV(a.votos - b.votos) + " votos, com " + fmtP1(p) + "% apurado." : liderTxt(c) + "." ][st.quem % 2];
    if (c.run && p > 60) tx += " Pelos números, a tendência é de segundo turno.";
    else if (!c.run && (a.share || 0) > 50 && p > 60) tx += " " + limpaNome(a.nome) + " tem mais da metade dos votos válidos.";
    return tx;
  }
  function falaComentario(c) {
    var a = c.lista[0], b = c.lista[1], t = st.quem % 4;
    if (t === 0 && b) return "Atenção para a distância de " + fmtP1(a.share - b.share) + " pontos: os estados que apuram mais tarde ainda podem mexer no placar.";
    if (t === 1) return c.run ? "Para o segundo turno, as alianças com quem ficou de fora vão decidir. " + limpaNome(a.nome) + " sai na frente, mas a eleição recomeça do zero." : limpaNome(a.nome) + " consolidou a vantagem. A oposição terá de se reorganizar.";
    if (t === 2) return "O mapa mostra onde cada campanha foi mais forte. Nos estados, os governadores eleitos vão definir boa parte da relação com o próximo governo.";
    return "Nas disputas estaduais, há surpresas: candidatos que vinham atrás nas pesquisas aparecem competitivos.";
  }

  /* ================================================================ cenas */
  function plantaoDaVez() { var c = st.cena; return Math.min(c.d.ufs.length - 1, Math.floor((agora() - c.ini) / D.plantao)); }
  function falaPlantaoUF(es) {
    var gv = es.filter(function (e) { return e.tipo === "gov"; })[0], sn = es.filter(function (e) { return e.tipo === "sen"; }), t = gv ? falaPlantao(gv) : "";
    if (sn.length) t += (t ? " " : "") + (sn.length > 1 ? "No Senado, " + sn.map(function (e) { return limpaNome(e.x.nome) + " (" + e.x.partido + ")"; }).join(" e ") + " estão eleitos por " + UFN(sn[0].uf) + "." : falaPlantao(sn[0]));
    return t;
  }
  function estadoDaVez() { var c = st.cena; if (!c || c.tipo !== "regional") return -1; var t = agora() - c.ini - D.introReg; return t < 0 ? -1 : Math.min(c.d.ufs.length - 1, Math.floor(t / D.porEstado)); }
  function cenaAtual(ch) {
    var c = st.cena || { tipo: "abertura", d: {} }, pr = principal(), out = { mom: "", painel: "", bancada: "" };
    if (!pr) { out.painel = '<p class="tv-nota">Aguardando os dados da apuração.</p>'; out.bancada = quemHtml(ancora(ch), "Boa noite. Estamos aguardando os primeiros boletins do Tribunal Superior Eleitoral."); return out; }
    var painelPr = "<h3>" + esc_(pr.titulo) + "</h3>" + barras(pr, 4) + '<p class="tv-st">' + selo(pr) + "</p>";
    switch (c.tipo) {
      case "abertura":
        out.mom = "Abertura";
        out.painel = "<h3>" + esc_(pr.titulo) + "</h3>" + barras(pr, 6);
        var ab = ch.abertura ? pessoa(ch.abertura) : ancora(ch);
        out.bancada = quemHtml(ab, "Boa noite. Começa agora a cobertura da " + ch.nome + " da apuração do " + (turno2() ? "segundo" : "primeiro") + " turno. " + (municipal() ? "Vamos acompanhar voto a voto a disputa em Mauá." : "Vamos acompanhar voto a voto a disputa pela Presidência, pelos governos estaduais e pelo Senado, com nossos repórteres em todas as regiões do país."));
        break;
      case "regional":
        var r = c.d.reg, i = estadoDaVez(), rep = reporter(ch, r, true);
        out.mom = "Ao vivo • Região " + REG[r].nome;
        if (i < 0) {
          out.painel = "<h3>Região " + esc_(REG[r].nome) + " • Governos</h3><div class='tv-chips'>" + c.d.ufs.map(function (u) { return chipUF(u, "gov"); }).join("") + "</div>";
          out.bancada = quemHtml(ancora(ch), "Vamos agora à Região " + REG[r].nome + ". " + rep.nome + " acompanha a apuração nos estados.") + quemHtml(rep, "Boa noite! Vamos estado por estado.", "rep");
        } else {
          var uf = c.d.ufs[i], g = corridaGov(uf), s = corridaSen(uf), f = ok(function () { return A().fracUF(uf); }, 0);
          out.painel = "<h3>" + esc_(UFN(uf)) + ' <small class="tv-pc">' + fmtP1(f * 100) + "% apurado</small></h3>" +
            (g ? '<h4>Governo ' + selo(g) + "</h4>" + barras(g, 3, true) : "") +
            (s ? "<h4>Senado • " + s.vagas + " vaga" + (s.vagas > 1 ? "s" : "") + " " + selo(s) + "</h4>" + barras(s, s.vagas + 1, true) : "") +
            '<div class="tv-passos">' + c.d.ufs.map(function (u, k) { return '<i class="' + (k === i ? "on" : k < i ? "ja" : "") + '">' + u + "</i>"; }).join("") + "</div>";
          out.bancada = quemHtml(rep, falaEstado(uf), "rep");
          st.senNovos = st.senNovos.filter(function (e) { return e.uf !== uf; }); // o repórter já anunciou
        }
        break;
      case "plantao":
        var k = plantaoDaVez(), u0 = c.d.ufs[k], es = c.d.itens.filter(function (e) { return e.uf === u0; }), rp = reporter(ch, c.d.reg, true);
        var gv = es.filter(function (e) { return e.tipo === "gov"; })[0], sn = es.filter(function (e) { return e.tipo === "sen"; });
        out.mom = "Plantão • " + (gv ? "Governo" : "Senado");
        out.painel = '<div class="tv-plantao" data-k="' + u0 + '"><div class="tv-pl-uf">' + esc_(UFN(u0)) + "</div>" +
          (gv ? (gv.d.tipo === "segundo" ? '<p class="tv-pl-t">2º turno para o governo</p>' + barras(corridaGov(u0), 2, true) : '<p class="tv-pl-t">' + oa(gv.d.quem[0], "Governador eleito", "Governadora eleita") + "</p>" + eleitoCard(gv.d.quem[0], corridaGov(u0))) : "") +
          (sn.length ? '<p class="tv-pl-t">Senado</p>' + sn.map(function (e) { return eleitoCard(e.x, e.c, true); }).join("") : "") + "</div>" +
          (c.d.ufs.length > 1 ? '<div class="tv-passos">' + c.d.ufs.map(function (u, j) { return '<i class="' + (j === k ? "on" : j < k ? "ja" : "") + '">' + u + "</i>"; }).join("") + "</div>" : "");
        out.bancada = quemHtml(rp, (k === 0 && c.d.ufs.length > 1 ? "Mais resultados definidos aqui na Região " + REG[c.d.reg].nome + ". " : "") + falaPlantaoUF(es), "rep");
        break;
      case "plantaoSen":
        var its = c.d.itens;
        out.mom = "Plantão • Senado";
        out.painel = "<h3>Novos senadores</h3>" + its.map(function (e) { return '<p class="tv-pl-t">' + esc_(UFN(e.uf)) + "</p>" + eleitoCard(e.x, e.c, true); }).join("");
        out.bancada = quemHtml(ancora(ch), (its.length > 1 ? its.length + " novos senadores estão matematicamente eleitos: " : "Mais um senador eleito: ") + its.map(function (e) { return limpaNome(e.x.nome) + " (" + e.x.partido + "-" + e.uf + ")"; }).join(", ") + ".");
        break;
      case "plantaoPres":
        out.mom = "Plantão • Presidência";
        out.painel = painelPr;
        out.bancada = quemHtml(ancora(ch), falaPres(c.d.c));
        break;
      case "senado":
        out.mom = "Senado";
        out.painel = "<h3>Senado • quem lidera em cada estado</h3><div class='tv-chips'>" + ufsOrd().map(function (u) { return chipUF(u, "sen"); }).join("") + "</div>";
        var nEl = ufsOrd().reduce(function (n, u) { return n + eleitoIds(corridaSen(u)).length; }, 0);
        out.bancada = quemHtml(ancora(ch), "Agora, o Senado. " + (nEl ? nEl + " senador" + (nEl > 1 ? "es já estão eleitos" : " já está eleito") + " até aqui." : "Nenhum senador está matematicamente eleito ainda.") + " Veja quem lidera em cada estado.");
        break;
      case "governos":
        out.mom = "Governos estaduais";
        var dec = ufsOrd().filter(function (u) { var g = corridaGov(u); return g && decisao(g); });
        out.painel = "<h3>Governadores • panorama</h3><div class='tv-chips'>" + ufsOrd().map(function (u) { return chipUF(u, "gov"); }).join("") + "</div>";
        out.bancada = quemHtml(ancora(ch), (dec.length ? dec.length + " estado" + (dec.length > 1 ? "s já têm" : " já tem") + " a disputa pelo governo definida (eleito ou segundo turno)." : "Nenhum governo estadual está definido ainda.") + " Toque em um estado para ver os números.");
        break;
      case "comentario":
        out.mom = "Análise";
        out.painel = pr.lista[1] ? "<h3>" + esc_(pr.titulo) + "</h3>" + barras(pr, 2) + '<p class="tv-dif">Diferença: <b>' + fmtV(pr.lista[0].votos - pr.lista[1].votos) + " votos</b> (" + fmtP(pr.lista[0].share - pr.lista[1].share) + " p.p.)</p>" : painelPr;
        out.bancada = quemHtml(comentarista(ch), falaComentario(pr), "coment");
        break;
      case "estado":
        var u2 = c.d.uf, g2 = corridaGov(u2), s2 = corridaSen(u2), pl = ok(function () { return A().parcialCands(A().presLocal(u2), A().fracUF(u2)); }, []);
        out.mom = "Estado • " + UFN(u2);
        out.painel = "<h3>" + esc_(UFN(u2)) + ' <small class="tv-pc">' + fmtP1(ok(function () { return A().fracUF(u2); }, 0) * 100) + "% apurado</small></h3>" +
          (g2 ? "<h4>Governo " + selo(g2) + "</h4>" + barras(g2, 3, true) : "") + (s2 ? "<h4>Senado " + selo(s2) + "</h4>" + barras(s2, s2.vagas + 1, true) : "") +
          (pl.length ? "<h4>Presidente no estado</h4>" + barras({ lista: pl, fin: pl, f: 0, nodec: true }, 2, true) : "");
        out.bancada = quemHtml(reporter(ch, regDe(u2)), falaEstado(u2), "rep");
        break;
      case "final":
        out.mom = "Resultado";
        out.painel = painelPr + (municipal() ? "" : resumoFinal());
        var fp = falaPres(pr) || (decisao(pr) ? "" : "Apuração concluída.");
        out.bancada = quemHtml(ancora(ch), fp + ok(function () { return " Daqui a pouco, a situação de " + J().nome + "."; }, "")) + quemHtml(comentarista(ch), "É um resultado que vai pautar a política nos próximos anos. Os primeiros discursos devem sair em instantes.", "coment");
        break;
      default:
        out.mom = "Presidência";
        out.painel = painelPr;
        out.bancada = quemHtml(ancora(ch), falaNacional(pr, ch));
    }
    return out;
  }
  function ufsOrd() { var u = []; ORDEM_REG.forEach(function (r) { u = u.concat(REG[r].ufs); }); return u; }
  function eleitoCard(x, c, mini) {
    var cor = ok(function () { return A().corDe(x.partido, 0); }, "#64748b");
    return '<div class="tv-eleito' + (mini ? " mini" : "") + '" style="--c:' + cor + '"><div class="tv-cfoto" style="border-color:' + cor + '">' + fotoCand(x) + "</div><div><b>" + esc_(limpaNome(x.nome)) + "</b><small>" + esc_(x.partido) + (vice(x.nome) ? " • " + esc_(vice(x.nome)) : "") + "</small></div><div class='tv-cnum'><b>" + fmtP1(x.share) + "%</b><small>" + fmtV(x.votos) + " votos</small></div></div>";
  }
  function resumoFinal() {
    var el = [], seg = [];
    ufsOrd().forEach(function (u) { var g = corridaGov(u), d = g && decisao(g); if (!d) return; (d.tipo === "segundo" ? seg : el).push(u); });
    return '<p class="tv-dif">Governos: <b>' + el.length + "</b> definidos" + (seg.length ? " • 2º turno em <b>" + seg.join(", ") + "</b>" : "") + "</p>" + suaDisputa();
  }

  /* ================================================================ tela */
  function ticker() {
    var it = [];
    if (!municipal()) ufsOrd().forEach(function (uf) { var g = corridaGov(uf); if (g && g.lista[0] && !g.eleito1) it.push("GOV " + uf + ": " + limpaNome(g.lista[0].nome) + " " + fmtP1(g.lista[0].share) + "%" + (decisao(g) ? " (" + statusDe(g).txt + ")" : "")); });
    var e = minhaDisputa(); if (e && pct() >= 100) it.unshift(e.cargo.toUpperCase() + ": " + e.resultado);
    it.push("ATUALIZADO ÀS " + ok(function () { return A().horaApuracao(); }, ""));
    return it.join("   •   ");
  }
  function telaCanal() {
    var ch = CANAIS[st.canal], pr = principal(), cn = cenaAtual(ch), AP_ = ok(function () { return A().AP; }, {});
    var h = '<div class="tv tv-' + ch.tema + (municipal() ? " tv-mun" : "") + '" style="--bg:url(' + img(ch.estudio) + ')"><div class="tv-fundo"></div><div class="tv-tela">';
    h += '<header class="tv-top"><img class="tv-logo" src="' + img(ch.logo) + '" alt=""><div class="tv-prog"><b>' + esc_(ch.programa) + "</b><small>" + (turno2() ? "2º turno" : "1º turno") + " • " + esc_(ok(function () { return A().horaApuracao(); }, "")) + '</small></div><span class="tv-vivo">● AO VIVO</span>' + urnas(pct() / 100, municipal() ? "Mauá" : "Brasil") + "</header>";
    h += '<div class="tv-meio"><section class="tv-palco">' + (municipal() ? "" : '<div class="tv-mapbox">' + mapaBase() + '</div><div class="tv-mapcap"></div>') + "</section>";
    h += '<section class="tv-telao"><div class="tv-mom">' + esc_(cn.mom) + "</div>" + cn.painel + (st.cena && (st.cena.tipo === "nacional" || st.cena.tipo === "abertura") ? suaDisputa() : "") + "</section>";
    h += '<aside class="tv-bancada">' + cn.bancada + "</aside></div>";
    h += '<div class="tv-ticker"><span class="tv-tk-rot">' + (st.canal === "cnn" ? "ÚLTIMAS" : "APURAÇÃO") + '</span><div class="tv-tk"><span>' + esc_(ticker()) + "</span></div></div>";
    h += '<nav class="tv-ctrl"><button type="button" data-tv="play">' + (AP_.play ? "⏸ Pausar" : "▶ Continuar") + "</button>" + VEL.map(function (v) { return '<button type="button" data-tv="vel" data-id="' + v[1] + '" class="' + (Math.abs((AP_.vel || 0) - v[1]) < 1e-6 ? "on" : "") + '">' + v[0] + "</button>"; }).join("") +
      '<button type="button" data-tv="trocar">📺 Trocar canal</button><button type="button" data-tv="classica">Tela clássica</button>' + (pct() >= 100 ? '<button type="button" class="fim" data-tv="encerrar">Encerrar apuração</button>' : "") + "</nav>";
    return h + "</div></div>";
  }
  function telaEscolha() {
    var ult = pref();
    return '<div class="tv-esc"><h2>Noite eleitoral</h2><p>Escolha por onde acompanhar a apuração. Os números são os mesmos em todos os canais.</p><div class="tv-esc-grade">' +
      Object.keys(CANAIS).map(function (k) { var ch = CANAIS[k]; return '<button type="button" class="tv-esc-c tv-' + ch.tema + (ult === k ? " ult" : "") + '" data-tv="canal" data-id="' + k + '" style="--bg:url(' + img(ch.estudio) + ')"><img src="' + img(ch.logo) + '" alt=""><b>' + esc_(ch.nome) + "</b><small>" + esc_(ch.ancoras.map(function (a) { return a.nome; }).join(" e ")) + "</small></button>"; }).join("") +
      '</div><button type="button" class="tv-classica" data-tv="classica">Ver só a tela de resultados (sem TV)</button></div>';
  }
  function desenhar() {
    var el = document.getElementById("v3tv");
    var ap = document.getElementById("apurMapa");
    if (!ap) { if (el) el.remove(); st.aberto = false; return; }
    if (!ap.querySelector(".tv-voltar")) { var b = document.createElement("button"); b.className = "tv-voltar"; b.type = "button"; b.setAttribute("data-tv", "voltar"); b.textContent = "📺 Ver na TV"; ap.appendChild(b); }
    if (st.oculto) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "v3tv"; document.body.appendChild(el); }
    dirigir();
    var html = st.canal ? telaCanal() : telaEscolha(), chave = (st.canal || "escolha") + (municipal() ? "m" : "");
    // primeira vez ou troca de canal: monta tudo; depois só troca as partes que mudaram (o mapa fica e só muda de cor/zoom)
    if (el.getAttribute("data-k") !== chave) { el.innerHTML = html; el.setAttribute("data-k", chave); st.tickT = Date.now(); st.vbK = null; if (st.canal) atualizaMapa(el); return; }
    if (!st.canal) { if (el.innerHTML !== html) el.innerHTML = html; return; }
    var tmp = document.createElement("div"); tmp.innerHTML = html;
    [".tv-top", ".tv-telao", ".tv-bancada", ".tv-ctrl"].forEach(function (sel) {
      var a = el.querySelector(sel), b2 = tmp.querySelector(sel);
      if (a && b2 && a.innerHTML !== b2.innerHTML) a.innerHTML = b2.innerHTML;
    });
    atualizaMapa(el);
    var tk = el.querySelector(".tv-tk span"), tk2 = tmp.querySelector(".tv-tk span");
    if (tk && tk2 && tk.textContent !== tk2.textContent && Date.now() - (st.tickT || 0) > 25000) { tk.textContent = tk2.textContent; st.tickT = Date.now(); }
  }
  TV.desenhar = desenhar;
  TV.st = st;
  function loop() {
    var ap = document.getElementById("apurMapa");
    if (ap && !st.aberto) {
      st.aberto = true; st.oculto = false; st.canal = null; st.uf = null; st.cena = null; st.fila = []; st.senNovos = []; st.seguidos = 0; st.anunc = {}; st.regI = 0; st.rot = 0; st.vbK = null;
      // segura a apuração enquanto o jogador escolhe o canal
      ok(function () { var AP_ = A().AP; if (AP_.pct < 1) AP_.play = false; });
    }
    if (ap || document.getElementById("v3tv")) desenhar();
  }
  setInterval(function () { try { loop(); } catch (e) { console.warn("v3tv", e); } }, 450);

  function retomar(vel) { ok(function () { var AP_ = A().AP; if (vel != null) AP_.vel = vel; if (AP_.pct < 100) AP_.play = true; AP_.last = performance.now(); }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-tv]"); if (!b) return;
    if (!b.closest("#v3tv") && !b.closest("#apurMapa")) return;
    var k = b.getAttribute("data-tv"), id = b.getAttribute("data-id"), AP_ = ok(function () { return A().AP; }, null);
    e.preventDefault(); e.stopPropagation();
    if (k === "canal") { var primeira = !st.canal && !st.cena; st.canal = id; try { localStorage.setItem("cadeira_tv_canal", id); } catch (er) {} if (primeira) retomar(VEL_TV); }
    else if (k === "trocar") st.canal = null;
    else if (k === "classica") { st.oculto = true; if (AP_ && !AP_.play && AP_.pct < 1) retomar(1); }
    else if (k === "voltar") st.oculto = false;
    else if (k === "play" && AP_) { AP_.play = !AP_.play; AP_.last = performance.now(); }
    else if (k === "vel" && AP_) { AP_.vel = +id; AP_.last = performance.now(); }
    else if (k === "uf") { if (st.canal) novaCena("estado", { uf: id }, D.estado); }
    else if (k === "encerrar") { var t = document.getElementById("v3tv"); if (t) t.remove(); st.aberto = false; ok(function () { A().fechar(); }); return; }
    desenhar();
  }, true);
})();
