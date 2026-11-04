/* =============================================================================
   CADEIRA v3 — Noite eleitoral municipal: cobertura especial do Diário do Grande ABC
   (gerado por tools/gerar_dgabc.py)
   Camada de APRESENTAÇÃO por cima da apuração existente (#apurMapa) nos anos de
   eleição municipal. Não calcula resultado nenhum por conta própria:
   - Prefeitura: window._apMapa.prefAtual() + parcialCands (mesmo relógio AP.pct);
   - bairros de Mauá: a distribuição por bairro que o motor da noite já gravou em
     M().eleicao.noite.v2 (painel PREF, calibrado para bater com o total oficial),
     com as mesmas fórmulas de avanço e parcial daquele painel;
   - Câmara: M().eleicao._leg2.VER.qe (quociente oficial). Durante a apuração a
     projeção "se a apuração terminasse agora" roda o mesmo apurarProporcional()
     do jogo com os votos apurados até o momento; a 100% é o resultado oficial;
   - Panorama de SP: M().eleicao.municipais (vencedores que o jogo registrou em
     cada cidade). Sem placar detalhado nessas cidades, porque o jogo não guarda.
   Equipe: Inácio Siqueira (mediador do Diário nos debates) e os jornalistas
   enviados pelo dono do jogo.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3DGABC) return;
  var IMG = __IMAGENS__;
  var DG = (window.V3DGABC = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function A() { return window._apMapa; }
  function fmtV(n) { return Math.round(n || 0).toLocaleString("pt-BR"); }
  function fmtP(x) { return (x || 0).toFixed(2).replace(".", ","); }
  function fmtP1(x) { return (x || 0).toFixed(1).replace(".", ","); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function h01(s) { return (hash(s) % 10000) / 10000; }
  function img(k) { return IMG[k] || ok(function () { return window.V3DEB.IMG[k]; }, "") || ok(function () { return window.V3MARCAS.logo(k); }, ""); }
  function npcPorId(id) { return ok(function () { return bancoDeNPCs.find(function (x) { return x.id === id; }); }, null); }
  function limpaNome(n) { return String(n || "").replace(/\s*\((vice|suplentes?):.*$/i, "").trim(); }
  function vice(n) { var m = /\(vice:\s*([^)]*)\)/i.exec(n || ""); return m ? m[1] : ""; }
  function sigla(p) { var x = ok(function () { return normPartido(p); }, p) || p; return x === "Sem Partido" ? "sem partido" : x; }
  function fem(c) {
    if (!c) return false; if (c.jogador || c.id === "JOGADOR") return ok(function () { return J().sexo === "F"; }, false);
    var n = npcPorId(c.id); if (n && n.sexo) return n.sexo === "F"; if (c.genero) return c.genero === "F";
    var p = limpaNome(c.nome).split(" ")[0]; return ok(function () { return FEM.includes(p); }, false);
  }
  function oa(c, m, f) { return fem(c) ? f : m; }
  function cor(p, i) { return ok(function () { return A().corDe(p, i || 0); }, "#64748b"); }

  /* ================================================================ redação */
  var EQ = {
    ancora: { nome: "Inácio Siqueira", img: "med_inacio_siqueira", papel: "apresentador" },
    analista: { nome: "Nilton Valentim", img: "nilton", papel: "comentarista de política" },
    panorama: { nome: "Evaldo Novelini", img: "evaldo", papel: "Panorama Eleitoral de SP" },
    camara: { nome: "Marcela Vasconcelos", img: "marcela", papel: "repórter • Câmara de Mauá" },
    bairros: { nome: "Mariana Gutierrez", img: "mariana", papel: "repórter • bairros de Mauá" }
  };
  DG.EQ = EQ; DG.IMG = IMG;
  var VEL = [["1x", 0.12], ["2x", 0.25], ["4x", 0.5], ["Rápido", 1]];
  var D = { abertura: 11000, candidatos: 11000, prefeitura: 10000, introBairro: 3200, porBairro: 4600, regioes: 11000, camaraPasso: 7000, introPan: 3500, porCidade: 6500, plantao: 9000 };

  /* ================================================================ dados (somente leitura) */
  function municipal() { return ok(function () { return tipoEleicao(dt().ano) === "MUNICIPAL"; }, false); }
  function pct() { return ok(function () { return A().AP.pct; }, 0) || 0; }
  function turno2() { return ok(function () { return M().eleicao.noite.turno === 2; }, false); }
  function ano() { return ok(function () { return dt().ano; }, ""); }
  function ordena(l) { return (l || []).slice().sort(function (a, b) { return (b.votos || 0) - (a.votos || 0); }); }

  function corridaPref() {
    var P = ok(function () { return A().prefAtual(); }, null); if (!P || !P.lista || !P.lista.length) return null;
    if (P.fechado1) return { lista: P.base, fin: P.base, f: 1, run: false, eleito1: true };
    var f = pct() / 100;
    return { lista: A().parcialCands(P.lista, f), fin: P.lista, f: f, run: P.run };
  }
  // decisão matemática (mesma regra da TV nacional): só anuncia o que os votos restantes não mudam mais
  function decisao(c) {
    if (!c || !c.lista || !c.lista.length) return null;
    if (c.eleito1) return { tipo: "eleito", quem: [c.lista[0]], hist: true };
    var fin = ordena(c.fin), T = fin.reduce(function (s, x) { return s + (x.votos || 0); }, 0); if (!T) return null;
    var l = c.lista, apur = l.reduce(function (s, x) { return s + (x.votos || 0); }, 0), rest = c.f >= 1 ? 0 : Math.max(0, T - apur, T * (1 - c.f));
    var v = function (x) { return (x && x.votos) || 0; };
    if (!c.run) {
      if (l[0].id !== fin[0].id) return null;
      var venceu = c.f >= 1 || (turno2() ? v(l[0]) > v(l[1]) + rest : v(l[0]) > 0.5 * T);
      return venceu ? { tipo: "eleito", quem: [l[0]] } : null;
    }
    if (l.length < 2) return null;
    var dupla = [fin[0].id, fin[1] && fin[1].id];
    if (dupla.indexOf(l[0].id) < 0 || dupla.indexOf(l[1].id) < 0) return null;
    return (c.f >= 1 || (v(l[0]) + rest < 0.5 * T && (!l[2] || v(l[2]) + rest < v(l[1])))) ? { tipo: "segundo", quem: [l[0], l[1]] } : null;
  }
  function statusDe(c) {
    var d = decisao(c);
    if (d && d.tipo === "segundo") return { txt: "2º TURNO CONFIRMADO", cls: "segundo" };
    if (d) return { txt: d.hist ? "ELEITO NO 1º TURNO" : oa(d.quem[0], "ELEITO", "ELEITA"), cls: "eleito" };
    if (c && c.f > 0.8 && !c.run && c.lista[0] && (c.lista[0].share || 0) > 50) return { txt: "TENDÊNCIA DE VITÓRIA", cls: "quase" };
    return { txt: "EM APURAÇÃO", cls: "apurando" };
  }

  /* -------- bairros: painel PREF da noite (M().eleicao.noite.v2), o mesmo que a apuração gravou */
  function painelBairros() {
    var v = ok(function () { return M().eleicao.noite.v2; }, null); if (!v || !v.abas) return null;
    var P = null; v.abas.forEach(function (a) { (a.subs || []).forEach(function (s) { if (s.id === "PREF" && s.kind === "MAUA") P = s; }); });
    if (!P || !P.regs || !P.regs.length || !P.regs[0].m) return null;
    var c = corridaPref(); if (!c) return null;
    // só usa se os candidatos do painel forem os mesmos da disputa em curso
    var fin = ordena(c.fin), ids = P.cands.map(function (x) { return x.id || x.nome; });
    if (fin.slice(0, 2).some(function (x) { return ids.indexOf(x.id || x.nome) < 0; })) return null;
    return P;
  }
  function pReg(r, t) { var x = (t - r.s) / r.d; if (x <= 0) return 0; if (x >= 1) return 1; return 1 - Math.pow(1 - x, 2); }
  function parcialReg(r, p) { var raw = r.m.map(function (s, i) { return Math.max(0.01, s * (1 + r.b[i] * (1 - p))); }), t = raw.reduce(function (a, b) { return a + b; }, 0); return raw.map(function (x) { return x / t * 100; }); }
  function bairro(id) {
    var P = painelBairros(); if (!P) return null;
    var r = P.regs.filter(function (x) { return x.id === id; })[0]; if (!r) return null;
    var p = pct() >= 100 ? 1 : pReg(r, pct() / 100), sh = p > 0 ? (p >= 1 ? r.m : parcialReg(r, p)) : null;
    var lista = sh ? P.cands.map(function (c, i) { return { id: c.id, nome: c.nome, partido: c.partido, jogador: c.jogador, share: sh[i] }; }).sort(function (a, b) { return b.share - a.share; }) : [];
    return { id: id, nome: r.nome, p: p, lista: lista, vv: r.vv };
  }
  function bairros() { var P = painelBairros(); return P ? P.regs.map(function (r) { return bairro(r.id); }) : []; }
  function nomeCurto(n) { return String(n || "").replace("Jardim ", "Jd. ").replace("Vila ", "V. ").replace("Centro de Mauá", "Centro"); }

  /* -------- Câmara: quociente oficial do jogo */
  function legVER() { return ok(function () { var L = M().eleicao._leg2.VER; return L && L.qe && L.qe.entrada && L.sistema !== "antigo" ? L : null; }, null); }
  var cacheCam = { k: null, r: null };
  function camara() {
    var L = legVER(); if (!L) return null;
    var f = pct() / 100;
    if (f >= 0.995 || typeof window.apurarProporcional !== "function") return { r: L.qe, L: L, f: 1, oficial: true };
    var k = Math.round(f * 400); if (cacheCam.k === k && cacheCam.r) return { r: cacheCam.r, L: L, f: f, oficial: false };
    // votos apurados até agora: mesma oscilação que a apuração usa nas parciais, fechando em 100%
    var osc = Math.pow(1 - Math.max(0.008, f), 1.25) * 0.28, fa = Math.max(0.008, f);
    var ent = L.qe.entrada.map(function (p) {
      var sp = ((hash(p.id + "|leg") % 200) - 100) / 100;
      return Object.assign({}, p, {
        votos_legenda: Math.round((p.votos_legenda || 0) * fa * (1 + sp * osc)),
        candidatos: (p.candidatos || []).map(function (c) { var s = ((hash((c.id || c.nome) + "|parcial_v3") % 200) - 100) / 100; return Object.assign({}, c, { votos: Math.round((c.votos || 0) * fa * (1 + s * osc)) }); })
      });
    });
    var r = ok(function () { return window.apurarProporcional({ vagas: L.N, partidos: ent, regras: L.qe.regras_usadas }); }, null);
    if (r) r.entrada = ent;
    cacheCam = { k: k, r: r };
    return r ? { r: r, L: L, f: f, oficial: false } : null;
  }
  function candInfo(L, id) {
    var out = null; (L.qe.entrada || []).some(function (p) { return (p.candidatos || []).some(function (c) { if (c.id === id) { out = { id: c.id, nome: c.nome || (c.jogador || c.id === "JOGADOR" ? ok(function () { return J().nome; }, "Você") : "Candidato de legenda"), partido: c.partido || p.id, lista: p.nome || p.id, genero: c.genero, jogador: !!c.jogador || c.id === "JOGADOR" }; return true; } }); });
    return out || { id: id, nome: "?", partido: "", lista: "" };
  }
  function nomeLista(L, id) { var p = (L.qe.entrada || []).filter(function (x) { return x.id === id; })[0]; return p ? (p.nome || p.id) : id; }
  function eleitosCam(C) {
    return (C.r.eleitos || []).map(function (e) { var i = candInfo(C.L, e.candidato); return Object.assign({}, i, { votos: e.votos, fase: e.fase, listaId: e.partido }); });
  }
  function bancadas(C) {
    var b = {}; eleitosCam(C).forEach(function (e) { var s = sigla(e.partido); b[s] = (b[s] || 0) + 1; });
    return Object.keys(b).map(function (k) { return { p: k, n: b[k] }; }).sort(function (a, b2) { return b2.n - a.n || (espDe(a.p) - espDe(b2.p)); });
  }
  function espDe(p) { var e = ok(function () { return (PARTIDOS[normPartido(p)] || PARTIDOS[p] || {}).e; }, "C"); return e === "E" ? -1 : e === "D" ? 1 : 0; }
  function anterior() { var a = ok(function () { return M().v3dgAnt; }, null); return a && a.ano === ano() ? a : null; }
  function destaques(C) {
    var L = C.L, r = C.r, QE = r.QE || 1, el = eleitosCam(C), out = [];
    // puxador de votos
    var pux = el.filter(function (e) { return e.votos >= QE; }).sort(function (a, b) { return b.votos - a.votos; })[0];
    if (pux) { var tot = (r.por_partido[pux.listaId] || {}).total || 1; out.push({ tipo: "puxador", txt: limpaNome(pux.nome) + " (" + sigla(pux.partido) + ") teve " + fmtV(pux.votos) + " votos, mais que o quociente eleitoral sozinh" + oa(pux, "o", "a") + ", e ajudou " + (/^Federa/.test(nomeLista(L, pux.listaId)) ? "a " : "o ") + nomeLista(L, pux.listaId) + " a somar " + tot + " cadeira" + (tot > 1 ? "s" : "") + "." }); }
    // bem votado que ficou de fora
    var ids = {}; el.forEach(function (e) { ids[e.id] = 1; });
    var todos = []; (r.entrada || L.qe.entrada || []).forEach(function (p) { (p.candidatos || []).forEach(function (c) { if (c.nome && !/legenda/i.test(c.nome)) todos.push({ id: c.id, nome: c.nome, partido: c.partido || p.id, votos: c.votos, genero: c.genero, listaId: p.id }); }); });
    todos.sort(function (a, b) { return b.votos - a.votos; });
    var nomeado = function (x) { return x.nome && !/legenda/i.test(x.nome) && String(x.id).indexOf("TMP|") !== 0; };
    var fora = todos.filter(function (c) { return !ids[c.id] && nomeado(c); })[0], ultimo = el.filter(nomeado).sort(function (a, b) { return a.votos - b.votos; })[0];
    if (fora && ultimo && fora.votos > ultimo.votos) out.push({ tipo: "fora", txt: limpaNome(fora.nome) + " (" + sigla(fora.partido) + ") fez " + fmtV(fora.votos) + " votos e " + (C.oficial ? "ficou" : "está ficando") + " de fora: a lista dele não alcançou votos para mais uma cadeira, enquanto " + limpaNome(ultimo.nome) + " (" + sigla(ultimo.partido) + ") " + (C.oficial ? "entrou" : "entra") + " com " + fmtV(ultimo.votos) + "." });
    // disputa pelas últimas vagas (rodadas de sobra)
    var sob = (r.passos || []).filter(function (p) { return p.fase === "sobra"; }), ult = sob[sob.length - 1];
    if (ult && ult.medias && ult.medias[1]) out.push({ tipo: "sobra", txt: "A última cadeira saiu na " + ult.rodada + "ª rodada das sobras: " + nomeLista(L, ult.vencedor) + " teve média de " + fmtV(ult.medias[0].media) + " votos por cadeira, contra " + fmtV(ult.medias[1].media) + " de " + nomeLista(L, ult.medias[1].id) + "." });
    // partido que cresce (comparado à Câmara que termina o mandato)
    var ant = anterior();
    if (ant) {
      var dif = bancadas(C).map(function (b) { return { p: b.p, n: b.n, d: b.n - (ant.por[b.p] || 0) }; }).sort(function (a, b) { return b.d - a.d; });
      if (dif[0] && dif[0].d > 0) out.push({ tipo: "cresce", txt: "O " + dif[0].p + " " + (C.oficial ? "sai" : "caminha para sair") + " de " + (ant.por[dif[0].p] || 0) + " para " + dif[0].n + " vereadores: é quem mais cresce na Câmara." });
      var perde = Object.keys(ant.por).map(function (p) { var agora = (bancadas(C).filter(function (b) { return b.p === p; })[0] || { n: 0 }).n; return { p: p, d: agora - ant.por[p], n: agora }; }).sort(function (a, b) { return a.d - b.d; })[0];
      if (perde && perde.d < 0) out.push({ tipo: "perde", txt: "Já o " + perde.p + " " + (C.oficial ? "encolhe" : "pode encolher") + ": tinha " + ant.por[perde.p] + " cadeira" + (ant.por[perde.p] > 1 ? "s" : "") + " e fica com " + perde.n + "." });
    }
    if (r.barrados && r.barrados.length && C.oficial) { var bb = r.barrados.filter(function (x) { return x.nome && !/legenda/i.test(x.nome); })[0]; if (bb) out.push({ tipo: "barrado", txt: limpaNome(bb.nome) + " (" + sigla(bb.partido) + ") teve " + fmtV(bb.votos) + " votos, mas não atingiu os 10% do quociente exigidos para ocupar a vaga da lista." }); }
    return out;
  }

  /* -------- Panorama: vencedores registrados pelo jogo em outras cidades paulistas */
  var ABC = ["Santo André", "São Bernardo do Campo", "São Caetano do Sul", "Diadema", "Ribeirão Pires", "Rio Grande da Serra"];
  var SP_CIDADES = ["São Paulo", "Guarulhos", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto", "Osasco", "São José dos Campos", "Jundiaí", "Piracicaba", "Bauru", "São José do Rio Preto", "Hortolândia", "Praia Grande", "São Vicente", "Guarujá",
    "Barueri", "Carapicuíba", "Itaquaquecetuba", "Suzano", "Taubaté", "Limeira", "Americana", "Indaiatuba", "Sumaré", "Cotia", "São Carlos", "Marília", "Jacareí", "Araraquara", "Rio Claro", "Bragança Paulista", "Santa Bárbara d'Oeste", "Santana de Parnaíba", "Sertãozinho", "Jaú", "Botucatu", "Mogi Guaçu", "Ferraz de Vasconcelos", "Várzea Paulista"];
  var GSP_ID = { "São Paulo": "capital", "Santo André": "sa", "São Bernardo do Campo": "sbc", "São Caetano do Sul": "scs", "Diadema": "dia", "Ribeirão Pires": "rp", "Rio Grande da Serra": "rgs" };
  var cachePan = { k: null, l: null };
  function panoramaCidades() {
    var M_ = ok(function () { return M().eleicao.municipais; }, null); if (!M_ || !M_.length) return [];
    var k = M_.length + "|" + ano(); if (cachePan.k === k) return cachePan.l;
    var cont = {}; ok(function () { bancoDeNPCs.forEach(function (n) { if (n.vivo && n.municipio_domicilio) cont[n.municipio_domicilio] = (cont[n.municipio_domicilio] || 0) + 1; }); });
    var porNome = {}; M_.forEach(function (x) { porNome[x.mun] = x; });
    var abc = ABC.filter(function (c) { return porNome[c]; }), cap = porNome["São Paulo"] ? ["São Paulo"] : [];
    var outras = SP_CIDADES.filter(function (c) { return c !== "São Paulo" && porNome[c]; }).sort(function (a, b) { return (cont[b] || 0) - (cont[a] || 0); }).slice(0, 8);
    var l = abc.concat(cap, outras).map(function (c, i) {
      var x = porNome[c], grupo = ABC.indexOf(c) >= 0 ? "Grande ABC" : c === "São Paulo" ? "Capital" : "Interior e litoral";
      // momento em que o resultado da cidade é divulgado na transmissão (o resultado é o que o jogo já registrou)
      var em = grupo === "Grande ABC" ? 0.2 + 0.55 * h01(c) : grupo === "Capital" ? 0.45 + 0.35 * h01(c) : 0.3 + 0.6 * h01(c);
      return { cidade: c, grupo: grupo, x: x, em: em, gsp: GSP_ID[c] || null, npcs: cont[c] || 0 };
    });
    cachePan = { k: k, l: l }; return l;
  }
  function cidadeVisivel(c) {
    if (turno2()) return true; // 2º turno: os resultados das outras cidades já foram registrados
    return pct() / 100 >= c.em;
  }
  function npcCidade(nome, cid) { return ok(function () { return bancoDeNPCs.find(function (n) { return n.nome === nome && (!cid || n.municipio_domicilio === cid || /Prefeit/.test(n.cargo || "")); }); }, null); }

  /* ================================================================ estado da sessão */
  var st = { aberto: false, oculto: false, cena: null, rot: 0, quem: 0, anunc: {}, fila: [], panVistas: {}, vbK: null };
  DG.st = st;
  function agora() { return Date.now(); }
  function novaCena(tipo, d, dur) { st.cena = { tipo: tipo, ini: agora(), dur: dur, d: d || {} }; st.quem++; }
  function varrer() {
    var c = corridaPref(); if (!c || c.eleito1) return;
    var d = decisao(c); if (d && !st.anunc.pref) { st.anunc.pref = 1; st.fila.push({ tipo: "pref", d: d }); }
    if (pct() >= 100 && legVER() && !turno2() && !st.anunc.cam) { st.anunc.cam = 1; st.fila.push({ tipo: "camara" }); }
  }
  function panPendentes() { return panoramaCidades().filter(function (c) { return cidadeVisivel(c) && !st.panVistas[c.cidade]; }); }
  function proximaCena() {
    var p = pct(), temB = !!painelBairros(), temC = !!legVER();
    if (!st.cena) return novaCena("abertura", {}, D.abertura);
    if (st.fila.length) {
      var e = st.fila.shift();
      if (e.tipo === "pref") return novaCena("plantaoPref", e, D.plantao);
      return novaCena("camara", { passos: ["nova", "conta", "eleitos", "destaques"], plantao: true }, 4 * D.camaraPasso);
    }
    if (p >= 100) {
      if (!st.pos) { st.pos = [{ tipo: "posEleito", dur: 12000 }]; var apm = ok(function () { return V3COB.apoiosDe("PREF"); }, []); if (apm.length) st.pos.push({ tipo: "posApoios", dur: 7000 + Math.min(5, apm.length) * 2500, d: { lista: apm.slice(0, 5) } }); if (ok(function () { return V3COB.perguntasPos(); }, null)) st.pos.push({ tipo: "posJogador", dur: 60000 }); }
      if (st.pos.length && st.cena.tipo !== "final") { var ps = st.pos.shift(); return novaCena(ps.tipo, ps.d || {}, ps.dur); }
      var pend = panPendentes();
      if (pend.length && !st.panFinal) { st.panFinal = 1; var lp = pend.slice(0, 3); lp.forEach(function (c) { st.panVistas[c.cidade] = 1; }); return novaCena("panorama", { cidades: lp }, D.introPan + lp.length * D.porCidade); }
      return novaCena("final", {}, 1e9);
    }
    if (st.cena.tipo === "abertura" && !turno2()) return novaCena("candidatos", {}, D.candidatos);
    var ciclo = ["prefeitura", "bairros", "camara", "panorama", "regioes", "prefeitura", "camara", "panorama", "bairros"];
    for (var t = 0; t < ciclo.length; t++) {
      var tipo = ciclo[st.rot++ % ciclo.length];
      if (tipo === "bairros") { if (!temB || p < 5) continue; var ids = painelBairros().regs.map(function (r) { return r.id; }); return novaCena("bairros", { ids: ids }, D.introBairro + ids.length * D.porBairro); }
      if (tipo === "regioes" && (!temB || p < 25)) continue;
      if (tipo === "camara") { if (!temC || turno2() || p < 12) continue; return novaCena("camara", { passos: ["nova", "conta", "destaques"] }, 3 * D.camaraPasso); }
      if (tipo === "panorama") { var pd = panPendentes(); if (!pd.length) continue; var l = pd.slice(0, 3); l.forEach(function (c) { st.panVistas[c.cidade] = 1; }); return novaCena("panorama", { cidades: l }, D.introPan + l.length * D.porCidade); }
      return novaCena(tipo, {}, D[tipo] || 10000);
    }
    return novaCena("prefeitura", {}, D.prefeitura);
  }
  var PRE = [["Boa noite", "16h30"], ["A eleição em Mauá", "16h38"], ["Pesquisa", "16h45"], ["Como funciona", "16h52"], ["Contagem regressiva", "16h58"]];
  function fimPre() { st.pre = false; novaCena("urnas", {}, 6500); ok(function () { var AP_ = A().AP; AP_.vel = VEL[0][1]; AP_.play = true; AP_.last = performance.now(); }); }
  function dirigir() {
    if (st.cena && st.cena.tipo === "pre") { if (agora() - st.cena.ini > st.cena.dur) { var k = st.cena.d.k + 1; if (k < PRE.length) novaCena("pre", { k: k }, k === PRE.length - 1 ? 7000 : 9500); else fimPre(); } return; }
    if (st.cena && st.cena.tipo === "posJogador" && st.entAberta) return;
    varrer();
    var c = st.cena, t = agora();
    var urgente = st.fila.length && c && ["prefeitura", "regioes", "candidatos"].indexOf(c.tipo) >= 0 && t - c.ini > 3000;
    if (!c || t - c.ini > c.dur || urgente || (c.tipo === "final" && st.fila.length)) proximaCena();
  }
  function passoDe(n, dur, intro) { var c = st.cena, t = agora() - c.ini - (intro || 0); return t < 0 ? -1 : Math.min(n - 1, Math.floor(t / dur)); }

  /* ================================================================ mapas (GEO.maua e GEO.gsp) */
  var BBX = {};
  function caixas(g, k) {
    if (BBX[k]) return BBX[k]; var o = {};
    Object.keys(g.p).forEach(function (id) { var nums = g.p[id].match(/-?\d+\.?\d*/g) || [], a = [1e9, 1e9, -1e9, -1e9]; for (var i = 0; i + 1 < nums.length; i += 2) { var x = +nums[i], y = +nums[i + 1]; a[0] = Math.min(a[0], x); a[1] = Math.min(a[1], y); a[2] = Math.max(a[2], x); a[3] = Math.max(a[3], y); } o[id] = a; });
    return (BBX[k] = o);
  }
  function vbDe(g, k, ids, minimo) {
    if (!ids || !ids.length) return [0, 0, g.w, g.h];
    var b = caixas(g, k), a = [1e9, 1e9, -1e9, -1e9];
    ids.forEach(function (id) { var x = b[id]; if (!x) return; a[0] = Math.min(a[0], x[0]); a[1] = Math.min(a[1], x[1]); a[2] = Math.max(a[2], x[2]); a[3] = Math.max(a[3], x[3]); });
    if (a[0] > a[2]) return [0, 0, g.w, g.h];
    var w = a[2] - a[0], h = a[3] - a[1], m = Math.max(w, h) * 0.18 + 6, cx = (a[0] + a[2]) / 2, cy = (a[1] + a[3]) / 2;
    w = Math.max(w + m * 2, minimo); h = Math.max(h + m * 2, minimo);
    var r = g.w / g.h; if (w / h < r) w = h * r; else h = w / r;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function svgMapa(k) {
    var g = ok(function () { return GEO[k]; }, null); if (!g) return "";
    var ids = k === "gsp" ? ["capital", "sa", "sbc", "scs", "dia", "rp", "rgs", "maua"] : Object.keys(g.p);
    var nome = function (id) { if (k === "maua") return nomeCurto(ok(function () { return TERRITORIOS.find(function (t) { return t.id === id; }).nome; }, id)); return { capital: "São Paulo", sa: "Santo André", sbc: "S. Bernardo", scs: "S. Caetano", dia: "Diadema", rp: "Rib. Pires", rgs: "R. G. da Serra", maua: "Mauá" }[id] || id; };
    return '<svg class="dg-map dg-map-' + k + '" viewBox="0 0 ' + g.w + " " + g.h + '" preserveAspectRatio="xMidYMid meet"><g>' + ids.filter(function (id) { return g.p[id]; }).map(function (id) { return '<path data-dg="' + (k === "maua" ? "bairro" : "") + '" data-id="' + id + '" data-r="' + id + '" d="' + g.p[id] + '" fill="#cfd8e6" vector-effect="non-scaling-stroke"></path>'; }).join("") + "</g><g class='dg-lbl'>" +
      ids.filter(function (id) { return g.c && g.c[id]; }).map(function (id) { var c = g.c[id]; return '<text data-l="' + id + '" x="' + c[0] + '" y="' + (c[1] - 2) + '">' + esc_(nome(id)) + '</text><text class="dg-lv" data-v="' + id + '" x="' + c[0] + '" y="' + (c[1] + 9) + '"></text>'; }).join("") + "</g></svg>";
  }
  function focoMapa() {
    var c = st.cena || { tipo: "abertura", d: {} };
    if (c.tipo === "bairros") { var i = passoDe(c.d.ids.length, D.porBairro, D.introBairro); return { k: "maua", ids: i >= 0 ? [c.d.ids[i]] : null, dest: i >= 0 ? [c.d.ids[i]] : [] }; }
    if (c.tipo === "panorama") { var j = passoDe(c.d.cidades.length, D.porCidade, D.introPan), cc = j >= 0 ? c.d.cidades[j] : null; return { k: "gsp", ids: cc && cc.gsp ? [cc.gsp, "maua"] : null, dest: cc && cc.gsp ? [cc.gsp] : [] }; }
    if (c.tipo === "estado") return { k: "maua", ids: [c.d.id], dest: [c.d.id] };
    return { k: "maua", ids: null, dest: [] };
  }
  function atualizaMapas(el) {
    var f = focoMapa(), palco = el.querySelector(".dg-palco"); if (!palco) return;
    palco.setAttribute("data-mapa", f.k);
    var svg = palco.querySelector(".dg-map-" + f.k); if (!svg) return;
    if (f.k === "maua") {
      var bs = {}; bairros().forEach(function (b) { if (b) bs[b.id] = b; });
      Array.prototype.forEach.call(svg.querySelectorAll("path[data-r]"), function (p) {
        var id = p.getAttribute("data-r"), b = bs[id], l = b && b.lista[0];
        p.setAttribute("fill", l ? cor(l.partido) : (painelBairros() ? "#dbe3ef" : "#cfd8e6")); p.setAttribute("fill-opacity", l ? (0.4 + 0.6 * b.p).toFixed(2) : "1");
        p.setAttribute("class", (f.dest.indexOf(id) >= 0 ? "dest " : "") + (b && b.p >= 1 ? "fim" : ""));
        var tv = svg.querySelector('text[data-v="' + id + '"]'); if (tv) tv.textContent = b ? (b.p > 0 ? Math.round(b.p * 100) + "% apurado" : "aguardando") : "";
      });
    } else {
      var vis = {}; panoramaCidades().forEach(function (c) { if (c.gsp && cidadeVisivel(c)) vis[c.gsp] = c; });
      Array.prototype.forEach.call(svg.querySelectorAll("path[data-r]"), function (p) {
        var id = p.getAttribute("data-r"), c = vis[id], pa = c && c.x && !(!turno2() && c.x.turno2) ? sigla(c.x.partido) : null;
        p.setAttribute("fill", id === "maua" ? "#0d2c5e" : pa ? cor(pa) : "#cfd8e6"); p.setAttribute("fill-opacity", id === "maua" ? "0.35" : "1");
        p.setAttribute("class", f.dest.indexOf(id) >= 0 ? "dest" : "");
      });
    }
    var g = GEO[f.k], alvo = vbDe(g, f.k, f.ids, f.k === "maua" ? 150 : 120), key = f.k + alvo.map(function (x) { return Math.round(x); }).join(",");
    if (st.vbK !== key) { st.vbK = key; anima(svg, alvo); }
  }
  function anima(svg, alvo) {
    var de = (svg.getAttribute("viewBox") || "").split(/\s+/).map(Number); if (de.length !== 4 || de.some(isNaN)) de = alvo;
    var t0 = performance.now(), id = (st.anim = (st.anim || 0) + 1);
    function passo(t) {
      if (id !== st.anim) return;
      var x = Math.min(1, (t - t0) / 1000), e = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2, v = de.map(function (a, i) { return a + (alvo[i] - a) * e; });
      svg.setAttribute("viewBox", v.map(function (n) { return n.toFixed(1); }).join(" ")); svg.style.setProperty("--fs", (v[2] / 24).toFixed(2) + "px");
      if (x < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* ================================================================ peças visuais */
  function fotoDe(c) {
    var f = ok(function () { if (c.jogador || c.id === "JOGADOR") return J().foto || ""; var n = c.id ? npcPorId(c.id) : null; return n ? obterFotoPolitico(n) : ""; }, "");
    return f ? '<img src="' + esc_(f) + '" alt="">' : '<span class="dg-ini">' + esc_(limpaNome(c.nome).charAt(0)) + "</span>";
  }
  function histDe(c) {
    if (c.jogador) return "você";
    var n = npcPorId(c.id); if (!n) return "";
    var cg = n.cargo && n.cargo !== "Liderança / Ex-Titular" ? n.cargo : (n.papel || "");
    return String(cg).replace(/\s*\(.*$/, "").slice(0, 42);
  }
  function placar(c, max, mini) {
    var d = decisao(c), ids = d ? d.quem.map(function (x) { return x.id; }) : [];
    return '<div class="dg-placar' + (mini ? " mini" : "") + '">' + c.lista.slice(0, max).map(function (x, i) {
      var k = cor(x.partido, i), selo = ids.indexOf(x.id) >= 0 ? '<em class="dg-selo ' + (d.tipo === "segundo" ? "segundo" : "eleito") + '">' + (d.tipo === "segundo" ? "2º TURNO" : oa(x, "ELEITO", "ELEITA")) + "</em>" : "";
      return '<div class="dg-cand' + (x.jogador ? " eu" : "") + '" style="--c:' + k + '"><div class="dg-foto">' + fotoDe(x) + '</div><div class="dg-ci"><b>' + esc_(limpaNome(x.nome)) + "</b> " + selo + "<small>" + esc_(sigla(x.partido)) + (vice(x.nome) && !mini ? " • vice: " + esc_(vice(x.nome)) : "") + '</small><div class="dg-bar"><i style="width:' + Math.min(100, x.share || 0) + '%"></i></div></div><div class="dg-num"><b>' + fmtP(x.share) + "%</b><small>" + fmtV(x.votos) + " votos</small></div></div>";
    }).join("") + "</div>";
  }
  function selo(c) { var s = statusDe(c); return '<em class="dg-selo ' + s.cls + '">' + s.txt + "</em>"; }
  function hemiciclo(C) {
    var el = eleitosCam(C).sort(function (a, b) { return espDe(a.partido) - espDe(b.partido) || sigla(a.partido).localeCompare(sigla(b.partido)) || b.votos - a.votos; });
    var N = C.L.N || el.length, rows = N > 30 ? 4 : 3, rads = [], tot = 0, i;
    for (i = 0; i < rows; i++) { rads.push(46 + i * 17); tot += 46 + i * 17; }
    var per = rads.map(function (r) { return Math.round(N * r / tot); }), s = per.reduce(function (a, b) { return a + b; }, 0); per[rows - 1] += N - s;
    var pos = []; rads.forEach(function (r, ri) { var n = per[ri]; for (var k = 0; k < n; k++) { var ang = Math.PI - (n === 1 ? Math.PI / 2 : k * Math.PI / (n - 1)); pos.push({ x: 110 + r * Math.cos(ang), y: 108 - r * Math.sin(ang), a: ang }); } });
    pos.sort(function (a, b) { return b.a - a.a; });
    var h = '<svg class="dg-hemi" viewBox="0 0 220 116">' + pos.map(function (p, k) { var e = el[k]; return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="6.4" fill="' + (e ? cor(e.partido) : "#d5dbe6") + '"' + (e && e.jogador ? ' stroke="#facc15" stroke-width="2"' : "") + "><title>" + (e ? esc_(limpaNome(e.nome) + " (" + sigla(e.partido) + ")") : "vaga em aberto") + "</title></circle>"; }).join("") +
      '<text x="110" y="100" text-anchor="middle" class="dg-hemi-n">' + N + "</text><text x=\"110\" y=\"111\" text-anchor=\"middle\" class=\"dg-hemi-s\">vereadores</text></svg>";
    return h;
  }
  function legendaBancadas(C) {
    var ant = anterior();
    return '<div class="dg-banc">' + bancadas(C).map(function (b) { var d = ant ? b.n - (ant.por[b.p] || 0) : null; return '<span style="--c:' + cor(b.p) + '"><i></i>' + esc_(b.p) + " <b>" + b.n + "</b>" + (d ? '<small class="' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "</small>" : "") + "</span>"; }).join("") + "</div>";
  }
  function contaQE(C) {
    var r = C.r, linhas = Object.keys(r.por_partido).map(function (id) { var x = r.por_partido[id]; return { id: id, nome: nomeLista(C.L, id), v: x.votos, qp: Math.floor(x.votos / (r.QE || 1)), d: x.diretas, s: x.sobras, t: x.total }; }).filter(function (x) { return x.t > 0 || x.v >= (r.QE || 1) * 0.5; }).sort(function (a, b) { return b.v - a.v; });
    return '<div class="dg-qe"><div><small>Votos válidos</small><b>' + fmtV(r.validos) + '</b></div><div><small>Vagas</small><b>' + (C.L.N || 0) + '</b></div><div><small>Quociente eleitoral</small><b>' + fmtV(r.QE) + "</b></div></div>" +
      '<table class="dg-tab"><thead><tr><th>Partido / federação</th><th>Votos</th><th>QP</th><th>Diretas</th><th>Sobras</th><th>Total</th></tr></thead><tbody>' +
      linhas.map(function (x) { return "<tr><td>" + esc_(x.nome) + "</td><td>" + fmtV(x.v) + "</td><td>" + x.qp + "</td><td>" + x.d + "</td><td>" + x.s + "</td><td><b>" + x.t + "</b></td></tr>"; }).join("") + "</tbody></table>";
  }
  function listaEleitos(C) {
    var el = eleitosCam(C), g = {};
    el.forEach(function (e) { var s = sigla(e.partido); (g[s] = g[s] || []).push(e); });
    return '<div class="dg-eleitos">' + Object.keys(g).sort(function (a, b) { return g[b].length - g[a].length; }).map(function (p) {
      return '<div class="dg-eg" style="--c:' + cor(p) + '"><h5>' + esc_(p) + " <small>" + g[p].length + "</small></h5>" + g[p].sort(function (a, b) { return b.votos - a.votos; }).map(function (e) { return '<span class="' + (e.jogador ? "eu" : "") + '">' + esc_(limpaNome(e.nome)) + " <small>" + fmtV(e.votos) + (e.fase === "sobra" ? " • sobra" : "") + "</small></span>"; }).join("") + "</div>";
    }).join("") + "</div>";
  }
  function pessoa(k) { var p = EQ[k]; return { nome: p.nome, papel: p.papel, foto: img(p.img) }; }
  function fala(k, txt, cls) {
    var p = pessoa(k), foto = p.foto ? '<img src="' + esc_(p.foto) + '" alt="">' : '<span class="dg-ini">' + esc_(p.nome.charAt(0)) + "</span>";
    return '<div class="dg-fala ' + (cls || "") + '"><div class="dg-gc">' + foto + "<div><b>" + esc_(p.nome) + "</b><small>" + esc_(p.papel) + "</small></div></div><p>" + esc_(txt) + "</p></div>";
  }
  function suaDisputa() {
    var e = ok(function () { var d = dt(); return (CAR().eleicoes || []).filter(function (x) { return x.ano === d.ano; }).slice(-1)[0] || null; }, null); if (!e) return "";
    if (pct() < 100) return '<div class="dg-sua"><b>Sua disputa</b><small>' + esc_(e.cargo) + " • resultado ao fim da apuração</small></div>";
    return '<div class="dg-sua ' + (/Eleit/.test(e.resultado) ? "ok" : "nao") + '"><b>Sua disputa: ' + esc_(e.resultado) + "</b><small>" + esc_(e.cargo) + (e.votos ? " • " + fmtV(e.votos) + " votos" : "") + "</small></div>";
  }

  /* ================================================================ falas (a partir dos dados) */
  function incumbente() { return ok(function () { return bancoDeNPCs.find(function (n) { return n.vivo && n.cargo === "Prefeito de Mauá"; }); }, null); }
  function falaPrefeitura(c) {
    var a = c.lista[0], b = c.lista[1], p = pct(), inc = incumbente(), t;
    if (p < 1) return "As urnas de Mauá acabaram de fechar. Os primeiros boletins chegam ao cartório eleitoral em instantes.";
    t = "Com " + fmtP1(p) + "% das seções apuradas em Mauá, " + limpaNome(a.nome) + " (" + sigla(a.partido) + ") tem " + fmtP1(a.share) + "% dos votos válidos" + (b ? ", contra " + fmtP1(b.share) + "% de " + limpaNome(b.nome) + " (" + sigla(b.partido) + ")" : "") + ".";
    if (b) t += " A diferença é de " + fmtV(a.votos - b.votos) + " votos.";
    var inCorrida = inc && c.lista.filter(function (x) { return x.id === inc.id; })[0];
    if (inCorrida) t += inCorrida === a ? " O prefeito " + limpaNome(inc.nome) + " lidera a própria reeleição." : " O prefeito " + limpaNome(inc.nome) + ", candidato à reeleição, aparece em " + (c.lista.indexOf(inCorrida) + 1) + "º lugar.";
    if (!turno2() && p > 50 && !decisao(c)) t += (a.share || 0) <= 50 ? " Do jeito que está, ninguém chega à metade dos votos válidos: o cenário aponta para segundo turno." : " Se o ritmo se mantiver, a eleição se resolve já no primeiro turno.";
    return t;
  }
  function falaAnalise(c) {
    var a = c.lista[0], b = c.lista[1], k = st.quem % 3;
    if (k === 0 && b) return "O que pesa aqui é onde cada um é forte. " + limpaNome(a.nome) + " precisa segurar a vantagem nos bairros que ainda não fecharam; " + limpaNome(b.nome) + " depende de virar nas regiões mais populosas.";
    var dd = decisao(c), vaiA2 = dd ? dd.tipo === "segundo" : (!turno2() && (a.share || 0) <= 50);
    if (k === 1) return vaiA2 ? (dd ? "Mauá vai ao segundo turno" : "Se ninguém passar de 50%, Mauá vai ao segundo turno") + ", e aí a conversa muda: quem ficou de fora vira cabo eleitoral disputado. Os apoios na Câmara vão pesar." : limpaNome(a.nome) + (dd ? " construiu uma vitória larga." : " caminha para uma vitória larga.") + " O próximo desafio é a governabilidade com a nova Câmara.";
    return "A Câmara que sai das urnas hoje vai dizer se o próximo prefeito governa com folga ou se vai depender de acordo a cada votação.";
  }
  function falaBairro(b, i, n) {
    if (!b) return "";
    if (b.p <= 0) return "Aqui em " + b.nome + " as seções ainda não começaram a ser apuradas.";
    var a = b.lista[0], s = b.lista[1], pre = i === 0 ? "Boa noite! Começo por " + b.nome + ". " : ["Seguindo para " + b.nome + ". ", "Em " + b.nome + ", ", "Agora, " + b.nome + ": "][i % 3];
    return pre + (i > 0 && i % 3 === 1 ? "com " : "Com ") + Math.round(b.p * 100) + "% das seções apuradas, " + limpaNome(a.nome) + " (" + sigla(a.partido) + ") tem " + fmtP1(a.share) + "%" + (s ? " e " + limpaNome(s.nome) + " (" + sigla(s.partido) + ") " + fmtP1(s.share) + "%" : "") + "." + (b.p >= 1 ? " O bairro já está totalmente apurado." : "");
  }
  function melhores() {
    var c = corridaPref(), bs = bairros().filter(function (b) { return b && b.p > 0; }); if (!c || !bs.length) return [];
    return c.lista.slice(0, 2).map(function (x) {
      var best = null; bs.forEach(function (b) { var y = b.lista.filter(function (z) { return z.id === x.id || z.nome === x.nome; })[0]; if (y && (!best || y.share > best.s)) best = { b: b, s: y.share }; });
      return best ? { c: x, b: best.b, s: best.s } : null;
    }).filter(Boolean);
  }

  /* ================================================================ cenas */
  function cena() {
    var c = st.cena || { tipo: "abertura", d: {} }, pr = corridaPref(), out = { tag: "", h: "", banc: "" };
    if (!pr) { out.tag = "Apuração"; out.h = "<p>Aguardando os dados da apuração de Mauá.</p>"; out.banc = fala("ancora", "Boa noite. Estamos aguardando os primeiros boletins do cartório eleitoral."); return out; }
    var tit = '<h3>Prefeitura de Mauá ' + selo(pr) + "</h3>";
    switch (c.tipo) {
      case "pre":
        var k = c.d.k;
        out.tag = "Antes das urnas fecharem • " + PRE[k][0];
        if (k === 0) {
          out.h = '<div class="dg-capa"><small>Cobertura especial</small><h2>Noite eleitoral no ABC</h2><p>A redação do Diário acompanha a apuração de Mauá e das cidades da região.</p></div><div class="dg-equipe">' + Object.keys(EQ).map(function (kk) { var q = pessoa(kk); return "<span>" + (q.foto ? '<img src="' + esc_(q.foto) + '" alt="">' : "") + "<b>" + esc_(q.nome) + "</b><small>" + esc_(q.papel) + "</small></span>"; }).join("") + "</div>";
          out.banc = fala("ancora", "Boa noite! Começa a cobertura especial do Diário do Grande ABC " + (turno2() ? "do segundo turno em Mauá" : "da eleição municipal de " + ano()) + ". Comigo, Nilton Valentim e Evaldo Novelini nos comentários, Marcela Vasconcelos na Câmara e Mariana Gutierrez nos bairros.");
        } else if (k === 1) {
          var el = ok(function () { return A().nac().elMaua; }, 0);
          out.h = "<h3>O que está em jogo em Mauá</h3><ul class='dg-dest'><li><b>Prefeitura</b>: " + (pr ? ordena(pr.fin).length : "") + (turno2() ? " finalistas no 2º turno" : " candidaturas") + "</li>" + (turno2() ? "" : "<li><b>Câmara Municipal</b>: " + ((legVER() || {}).N || 23) + " cadeiras pelo quociente eleitoral</li>") + (el ? "<li><b>" + fmtV(el) + "</b> eleitores aptos</li>" : "") + "</ul>";
          out.banc = fala("ancora", turno2() ? "Mauá volta às urnas para escolher o prefeito entre os dois mais votados do primeiro turno." : "Mauá escolhe hoje o prefeito e os vereadores. Com mais de 200 mil eleitores, a cidade pode ter segundo turno.");
        } else if (k === 2) {
          var q = pr ? ok(function () { return V3COB.pesquisa("PREF", turno2() ? pr.fin : (ok(function () { return A().prefAtual().base; }, pr.fin)), "dg" + ano()); }, null) : null;
          out.h = "<h3>Última pesquisa • Prefeitura</h3>" + (q ? "<small class='dg-pc'>" + esc_(q.instituto) + " • margem ±" + q.margem + " pontos</small>" + q.itens.slice(0, 5).map(function (x, i2) { return '<div class="dg-cand" style="--c:' + cor(x.partido, i2) + '"><div class="dg-foto"><span class="dg-ini">' + esc_(x.nome.charAt(0)) + '</span></div><div class="dg-ci"><b>' + esc_(x.nome) + "</b><small>" + esc_(sigla(x.partido)) + '</small><div class="dg-bar"><i style="width:' + Math.min(100, x.pct * 1.6) + '%"></i></div></div><div class="dg-num"><b>' + fmtP1(x.pct) + "%</b></div></div>"; }).join("") : "<p>Sem pesquisa registrada.</p>");
          out.banc = fala("analista", q && q.itens[0] ? q.itens[0].nome + " chegou à reta final na frente, mas a diferença para " + (q.itens[1] ? q.itens[1].nome : "o segundo colocado") + " está perto da margem de erro. Em Mauá, a periferia decide." : "A eleição chega aberta.", "coment");
        } else if (k === 3) {
          out.h = "<h3>Como funciona a apuração</h3><ol class='dg-dest'><li>As urnas fecham às <b>17h</b>.</li><li>Os boletins de cada seção chegam ao cartório eleitoral e ao TSE.</li><li>Prefeito: mais de <b>50% dos votos válidos</b> vence no 1º turno.</li>" + (turno2() ? "" : "<li>Vereadores: os votos de cada partido ou federação definem as cadeiras pelo <b>quociente eleitoral</b>; as que sobram vão pela maior média.</li>") + "</ol>";
          out.banc = fala("camara", turno2() ? "Hoje a apuração é só da Prefeitura." : "Na Câmara, não basta ser bem votado: o partido precisa alcançar o quociente. Vou explicar cada cadeira ao longo da noite.", "rep");
        } else {
          out.h = "<div class='dg-relogio'><small>Horário de Brasília</small><b>16:58</b><span>As urnas fecham às 17h</span></div>" + suaDisputa();
          out.banc = fala("bairros", "Aqui nos bairros os últimos eleitores ainda estão nas filas. Faltam dois minutos.", "rep");
        }
        break;
      case "urnas":
        out.tag = "17h00 • Urnas fechadas";
        out.h = "<div class='dg-relogio fim'><small>Horário de Brasília</small><b>17:00</b><span>URNAS FECHADAS</span></div>";
        out.banc = fala("ancora", "São 17 horas: as urnas estão fechadas em Mauá. Começa a apuração.");
        break;
      case "posEleito":
        var dpe = decisao(pr);
        out.tag = "Pós-apuração • Prefeitura";
        out.h = tit + placar(pr, dpe && dpe.tipo === "segundo" ? 2 : 1);
        out.banc = (dpe ? dpe.quem.filter(function (x) { return !x.jogador; }).map(function (x) { return '<div class="dg-fala rep"><div class="dg-gc"><span class="dg-ini">' + esc_(limpaNome(x.nome).charAt(0)) + "</span><div><b>" + esc_(limpaNome(x.nome)) + "</b><small>" + esc_(sigla(x.partido)) + " • ao vivo</small></div></div><p>" + esc_(ok(function () { return V3COB.falaNpc(x, dpe.tipo === "segundo" ? "segundo" : "eleito"); }, "")) + "</p></div>"; }).join("") : "") + fala("bairros", "Estamos no comitê, com a militância. A primeira fala depois do resultado.", "rep");
        break;
      case "posApoios":
        var la = c.d.lista || [];
        out.tag = "Pós-apuração • Apoios no 2º turno";
        out.h = "<h3>Quem apoia quem no 2º turno</h3><ul class='dg-dest'>" + la.map(function (r) { return "<li><b>" + esc_(r.jogador ? "Você" : r.quem.nome) + "</b> (" + esc_(sigla(r.quem.partido)) + "): " + esc_(r.decisao === "apoia" ? "apoia " + r.para.nome : ok(function () { return V3COB.ROT[r.decisao]; }, r.decisao)) + "</li>"; }).join("") + "</ul>";
        out.banc = fala("analista", "Os apoios vão pesar: quem ficou de fora tem voto em bairros que os finalistas não alcançaram.", "coment");
        break;
      case "posJogador":
        out.tag = "Pós-apuração • Entrevista";
        out.h = "<h3>Ao vivo com " + esc_(ok(function () { return J().nome; }, "")) + "</h3>" + suaDisputa();
        out.banc = fala("bairros", "Estamos com " + ok(function () { return J().nome; }, "") + ", que fala ao Diário sobre o resultado.", "rep");
        if (!st.entFeita) { st.entFeita = true; st.entAberta = true; var Pq = ok(function () { return V3COB.perguntasPos(); }, null), rq = pessoa("bairros");
          setTimeout(function () { ok(function () { V3COB.abrirEntrevista(Pq, { titulo: "Diário do Grande ABC • entrevista", sub: Pq ? Pq.cargo : "", logo: img("dgabc"), tema: "dg", reporter: { nome: rq.nome, foto: rq.foto, papel: rq.papel }, aoFechar: function () { st.entAberta = false; st.cena.dur = 0; } }); }); }, 50); }
        break;
      case "abertura":
        out.tag = "Especial Eleições " + ano();
        out.h = '<div class="dg-capa"><small>Cobertura especial</small><h2>Mauá decide</h2><p>Prefeitura, Câmara Municipal e o resultado nas outras cidades do Grande ABC e do Estado, ao vivo da redação do Diário.</p></div>' + placar(pr, 4, true);
        out.banc = fala("ancora", "Boa noite. Está no ar a cobertura especial do Diário do Grande ABC " + (turno2() ? "do segundo turno" : "da eleição municipal") + " em Mauá. Vamos acompanhar a disputa pela Prefeitura, a formação da nova Câmara e os resultados em toda a região.");
        break;
      case "candidatos":
        out.tag = "Os candidatos";
        out.h = '<h3>Quem disputa a Prefeitura</h3><div class="dg-grade">' + ordena(pr.fin).filter(function (x) { return (x.share || 0) >= 1 || x.jogador; }).slice(0, 8).map(function (x, i) { return '<div class="dg-ficha" style="--c:' + cor(x.partido, i) + '"><div class="dg-foto">' + fotoDe(x) + "</div><b>" + esc_(limpaNome(x.nome)) + "</b><small>" + esc_(sigla(x.partido)) + (vice(x.nome) ? " • vice: " + esc_(vice(x.nome)) : "") + "</small>" + (histDe(x) ? "<em>" + esc_(histDe(x)) + "</em>" : "") + "</div>"; }).join("") + "</div>";
        out.banc = fala("ancora", pr.fin.length + " chapas disputam a Prefeitura de Mauá. " + (incumbente() && pr.fin.some(function (x) { return x.id === incumbente().id; }) ? "O prefeito " + limpaNome(incumbente().nome) + " tenta a reeleição." : "Mauá terá um novo prefeito: o atual não está na disputa.") + " Na Câmara, " + ((legVER() || {}).N || 23) + " cadeiras estão em jogo.");
        break;
      case "prefeitura":
        out.tag = "Prefeitura";
        out.h = tit + placar(pr, 4) + (pr.lista[1] ? '<p class="dg-dif">Diferença: <b>' + fmtV(pr.lista[0].votos - pr.lista[1].votos) + " votos</b> (" + fmtP(pr.lista[0].share - pr.lista[1].share) + " p.p.)</p>" : "") + suaDisputa();
        out.banc = fala("ancora", falaPrefeitura(pr));
        break;
      case "bairros":
        var i = passoDe(c.d.ids.length, D.porBairro, D.introBairro);
        out.tag = "Ao vivo • Bairros";
        if (i < 0) { out.h = tit + placar(pr, 3, true); out.banc = fala("ancora", "Vamos aos bairros. Mariana Gutierrez acompanha a apuração região por região.") + fala("bairros", "Boa noite, Inácio! Vamos bairro por bairro.", "rep"); break; }
        var b = bairro(c.d.ids[i]);
        out.h = "<h3>" + esc_(b.nome) + ' <small class="dg-pc">' + (b.p > 0 ? Math.round(b.p * 100) + "% das seções" : "aguardando") + "</small></h3>" +
          (b.lista.length ? '<div class="dg-placar mini">' + b.lista.slice(0, 3).map(function (x, k) { return '<div class="dg-cand" style="--c:' + cor(x.partido, k) + '"><div class="dg-foto">' + fotoDe(x) + '</div><div class="dg-ci"><b>' + esc_(limpaNome(x.nome)) + "</b><small>" + esc_(sigla(x.partido)) + '</small><div class="dg-bar"><i style="width:' + x.share + '%"></i></div></div><div class="dg-num"><b>' + fmtP1(x.share) + "%</b></div></div>"; }).join("") + "</div>" : '<p class="dg-nota">As seções deste bairro ainda não foram apuradas.</p>') +
          '<div class="dg-passos">' + c.d.ids.map(function (id, k) { return '<i class="' + (k === i ? "on" : k < i ? "ja" : "") + '">' + esc_(nomeCurto(ok(function () { return TERRITORIOS.find(function (t) { return t.id === id; }).nome; }, id))) + "</i>"; }).join("") + "</div>";
        out.banc = fala("bairros", falaBairro(b, i, c.d.ids.length), "rep");
        break;
      case "regioes":
        out.tag = "Análise • Regiões";
        var bs = bairros(), top = pr.lista.slice(0, 2);
        out.h = "<h3>Mauá por região</h3><table class='dg-tab'><thead><tr><th>Bairro</th><th>Apurado</th>" + top.map(function (x) { return "<th>" + esc_(limpaNome(x.nome).split(" ")[0]) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          bs.map(function (b) { return "<tr><td>" + esc_(nomeCurto(b.nome)) + "</td><td>" + (b.p >= 1 ? "<b>100%</b>" : Math.round(b.p * 100) + "%") + "</td>" + top.map(function (x) { var y = b.lista.filter(function (z) { return z.id === x.id || z.nome === x.nome; })[0]; var lid = b.lista[0] && y && b.lista[0] === y; return "<td" + (lid ? ' class="lid"' : "") + ">" + (y ? fmtP1(y.share) + "%" : "—") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
        var mb = melhores();
        out.banc = fala("analista", (mb.length ? mb.map(function (m) { return limpaNome(m.c.nome) + " tem o melhor desempenho em " + m.b.nome + " (" + fmtP1(m.s) + "%)"; }).join("; ") + ". " : "") + falaAnalise(pr), "coment");
        break;
      case "plantaoPref":
        var d = c.d.d, a = d.quem[0];
        out.tag = "Plantão • Prefeitura";
        out.h = tit + (d.tipo === "segundo" ? placar(pr, 2) : '<div class="dg-eleito" style="--c:' + cor(a.partido) + '"><div class="dg-foto">' + fotoDe(a) + "</div><div><small>" + oa(a, "Prefeito eleito", "Prefeita eleita") + " de Mauá</small><b>" + esc_(limpaNome(a.nome)) + "</b><em>" + esc_(sigla(a.partido)) + (vice(a.nome) ? " • vice: " + esc_(vice(a.nome)) : "") + "</em></div><div class='dg-num'><b>" + fmtP(a.share) + "%</b><small>" + fmtV(a.votos) + " votos</small></div></div>");
        var inc = incumbente();
        out.banc = fala("ancora", d.tipo === "segundo" ? "Está confirmado: Mauá terá segundo turno entre " + limpaNome(a.nome) + " (" + sigla(a.partido) + ") e " + limpaNome(d.quem[1].nome) + " (" + sigla(d.quem[1].partido) + ")." : "É oficial: " + limpaNome(a.nome) + " (" + sigla(a.partido) + ") está " + oa(a, "eleito", "eleita") + " " + oa(a, "prefeito", "prefeita") + " de Mauá" + (turno2() ? "" : " já no primeiro turno") + ", com " + fmtP1(a.share) + "% dos votos válidos." + (inc && inc.id === a.id ? " É a reeleição do atual prefeito." : inc && pr.fin.some(function (x) { return x.id === inc.id; }) ? " O prefeito " + limpaNome(inc.nome) + " não conseguiu se reeleger." : ""));
        break;
      case "camara":
        var C = camara(); if (!C || !C.r) { out.tag = "Câmara"; out.h = "<p>A apuração proporcional ainda não começou.</p>"; out.banc = fala("camara", "Assim que os votos para vereador começarem a entrar, mostramos a projeção da nova Câmara.", "rep"); break; }
        var ps = c.d.passos, k2 = passoDe(ps.length, D.camaraPasso, 0), passo = ps[Math.max(0, k2)], proj = C.oficial ? "Resultado oficial" : "Projeção com " + fmtP1(C.f * 100) + "% apurado";
        out.tag = c.d.plantao ? "Plantão • Câmara definida" : "A nova Câmara de Mauá";
        if (passo === "nova") {
          out.h = '<h3>A nova Câmara de Mauá <small class="dg-pc">' + proj + "</small></h3>" + hemiciclo(C) + legendaBancadas(C);
          var bb = bancadas(C);
          out.banc = fala("camara", (C.oficial ? "Está definida a nova Câmara de Mauá. " : "Se a apuração terminasse agora, a Câmara ficaria assim. ") + (bb[0] ? "A maior bancada é a do " + bb[0].p + ", com " + bb[0].n + " vereador" + (bb[0].n > 1 ? "es" : "") + (bb[1] ? "; depois vem o " + bb[1].p + ", com " + bb[1].n : "") + ". " : "") + bb.length + " partidos terão cadeira.", "rep");
        } else if (passo === "conta") {
          out.h = '<h3>Como as cadeiras são distribuídas <small class="dg-pc">' + proj + "</small></h3>" + contaQE(C);
          var nd = 0, ns = 0; (C.r.eleitos || []).forEach(function (e) { if (e.fase === "sobra") ns++; else nd++; });
          out.banc = fala("camara", "A conta começa pelo quociente eleitoral: " + fmtV(C.r.validos) + " votos válidos divididos por " + C.L.N + " vagas dá " + fmtV(C.r.QE) + " votos. Cada partido ou federação leva uma cadeira a cada quociente que atinge: são " + nd + " cadeiras diretas. As outras " + ns + " saem nas sobras, pela maior média.", "rep");
        } else if (passo === "eleitos") {
          out.h = '<h3>Vereadores ' + (C.oficial ? "eleitos" : "que entrariam agora") + ' <small class="dg-pc">' + proj + "</small></h3>" + listaEleitos(C);
          var top1 = eleitosCam(C).filter(function (x) { return !/legenda/i.test(x.nome); }).sort(function (a2, b2) { return b2.votos - a2.votos; })[0];
          out.banc = fala("camara", (top1 ? limpaNome(top1.nome) + " (" + sigla(top1.partido) + ") é " + oa(top1, "o vereador", "a vereadora") + " mais votad" + oa(top1, "o", "a") + ", com " + fmtV(top1.votos) + " votos. " : "") + "Aqui está a lista por partido, com quem entrou pelas sobras.", "rep");
        } else {
          var ds = destaques(C), dd = ds.length ? ds[st.quem % ds.length] : null, d2 = ds.length > 1 ? ds[(st.quem + 1) % ds.length] : null;
          out.h = '<h3>Destaques da Câmara <small class="dg-pc">' + proj + "</small></h3>" + hemiciclo(C) + '<ul class="dg-dest">' + ds.slice(0, 4).map(function (x) { return "<li>" + esc_(x.txt) + "</li>"; }).join("") + "</ul>";
          out.banc = fala("camara", dd ? dd.txt : "A disputa pelas últimas cadeiras segue aberta.", "rep") + (d2 ? fala("analista", d2.txt, "coment") : "");
        }
        break;
      case "panorama":
        var cs = c.d.cidades, j = passoDe(cs.length, D.porCidade, D.introPan);
        out.tag = "Panorama Eleitoral de São Paulo";
        if (j < 0) { out.h = '<div class="dg-pan-capa"><b>Panorama Eleitoral</b><span>de São Paulo</span></div>' + '<div class="dg-pan-lista">' + cs.map(function (x) { return "<i>" + esc_(x.cidade) + "</i>"; }).join("") + "</div>"; out.banc = fala("ancora", "Enquanto Mauá apura, vamos ao Panorama Eleitoral de São Paulo com Evaldo Novelini.") + fala("panorama", "Boa noite! Temos resultados em " + cs.map(function (x) { return x.cidade; }).join(", ").replace(/, ([^,]*)$/, " e $1") + ".", "rep"); break; }
        var cd = cs[j], x = cd.x, segundo = !turno2() && x.turno2, n = npcCidade(x.nome, cd.cidade);
        var foto = n ? ok(function () { return obterFotoPolitico(n); }, "") : "";
        out.h = '<div class="dg-pan"><small>' + esc_(cd.grupo) + "</small><h3>" + esc_(cd.cidade) + "</h3>" +
          '<div class="dg-eleito" style="--c:' + cor(sigla(x.partido)) + '"><div class="dg-foto">' + (foto ? '<img src="' + esc_(foto) + '" alt="">' : '<span class="dg-ini">' + esc_(x.nome.charAt(0)) + "</span>") + "</div><div><small>" + (segundo ? "Vai ao 2º turno" : (turno2() && x.turno2 ? "Eleito no 2º turno" : "Eleito no 1º turno")) + "</small><b>" + esc_(x.nome) + "</b><em>" + esc_(sigla(x.partido)) + (x.reeleito && !segundo ? " • reeleito" : "") + "</em></div></div>" +
          (x.anterior && !segundo ? '<p class="dg-nota">Prefeito anterior: ' + esc_(x.anterior) + "</p>" : "") + '<p class="dg-nota">O jogo registra o vencedor de cada cidade, sem o placar detalhado.</p></div>' +
          '<div class="dg-passos">' + cs.map(function (y, k) { return '<i class="' + (k === j ? "on" : k < j ? "ja" : "") + '">' + esc_(y.cidade) + "</i>"; }).join("") + "</div>";
        var tx = segundo ? "Em " + cd.cidade + ", a decisão fica para o segundo turno. " + x.nome + " (" + sigla(x.partido) + ") está na disputa." :
          "Em " + cd.cidade + ", " + x.nome + " (" + sigla(x.partido) + ") " + (x.reeleito ? "foi reeleito" : "venceu") + (turno2() && x.turno2 ? " no segundo turno" : x.turno2 ? "" : " já no primeiro turno") + "." + (x.anterior ? " Sucede " + x.anterior + "." : "");
        if (cd.grupo === "Capital") tx = "Na capital paulista: " + tx.replace("Em São Paulo, ", "");
        out.banc = fala("panorama", tx, "rep");
        break;
      case "final":
        out.tag = "Resultado final";
        var C2 = camara(), dp = decisao(pr);
        out.h = tit + placar(pr, turno2() ? 2 : 3, true) + (C2 && C2.r && !turno2() ? '<h4>A nova Câmara de Mauá</h4>' + hemiciclo(C2) + legendaBancadas(C2) : "") + suaDisputa();
        var w = dp && dp.quem[0];
        out.banc = fala("ancora", (dp && dp.tipo === "eleito" ? limpaNome(w.nome) + " (" + sigla(w.partido) + ") é " + oa(w, "o prefeito eleito", "a prefeita eleita") + " de Mauá. " : dp && dp.tipo === "segundo" ? "Mauá volta às urnas no segundo turno entre " + limpaNome(dp.quem[0].nome) + " e " + limpaNome(dp.quem[1].nome) + ". " : "") + "A apuração está encerrada. Obrigado pela companhia; a cobertura continua no site e na edição de amanhã do Diário.") + fala("analista", "A partir de agora, a pergunta é como o novo governo vai se relacionar com essa Câmara. Isso vai definir os primeiros anos da gestão.", "coment");
        break;
      case "estado":
        var be = bairro(c.d.id);
        out.tag = "Bairro";
        out.h = be ? "<h3>" + esc_(be.nome) + ' <small class="dg-pc">' + Math.round(be.p * 100) + "% das seções</small></h3>" + (be.lista.length ? placar({ lista: be.lista.map(function (x) { return Object.assign({ votos: Math.round(be.vv * be.p * x.share / 100) }, x); }), fin: [], f: 0 }, 4, true) : '<p class="dg-nota">Ainda sem seções apuradas.</p>') : "<p>Sem dados por bairro nesta eleição.</p>";
        out.banc = fala("bairros", be ? falaBairro(be, 1, 1) : "O motor do jogo não registrou a votação por bairro nesta apuração.", "rep");
        break;
    }
    return out;
  }

  /* ================================================================ tela */
  function ticker() {
    var it = [], pr = corridaPref();
    if (pr && pr.lista[0]) it.push("PREFEITURA DE MAUÁ: " + pr.lista.slice(0, 3).map(function (x) { return limpaNome(x.nome) + " " + fmtP1(x.share) + "%"; }).join(" • "));
    panoramaCidades().filter(cidadeVisivel).forEach(function (c) { it.push(c.cidade.toUpperCase() + ": " + (!turno2() && c.x.turno2 ? "2º TURNO" : c.x.nome + " (" + sigla(c.x.partido) + ")")); });
    var e = ok(function () { var d = dt(); return (CAR().eleicoes || []).filter(function (x) { return x.ano === d.ano; }).slice(-1)[0]; }, null); if (e && pct() >= 100) it.unshift(e.cargo.toUpperCase() + ": " + e.resultado);
    it.push("ATUALIZADO ÀS " + ok(function () { return A().horaApuracao(); }, ""));
    return it.join("   ■   ");
  }
  function tela() {
    var cn = cena(), AP_ = ok(function () { return A().AP; }, {}), p = pct();
    var h = '<div class="dg" style="--bg:url(' + img("estudio") + ')"><div class="dg-fundo"></div><div class="dg-tela">';
    h += '<header class="dg-top"><div class="dg-marca"><img src="' + img("dgabc") + '" alt="Diário do Grande ABC"><div><b>Especial Eleições ' + ano() + "</b><small>" + (turno2() ? "2º turno" : "1º turno") + " • Mauá • " + esc_(st.cena && st.cena.tipo === "pre" ? PRE[st.cena.d.k][1] : st.cena && st.cena.tipo === "urnas" ? "17h00" : ok(function () { return A().horaApuracao(); }, "")) + '</small></div></div><span class="dg-vivo">AO VIVO</span><div class="dg-urnas"><b>' + fmtP(p) + '%</b><small>seções apuradas em Mauá</small><div class="dg-urnas-b"><i style="width:' + Math.min(100, p) + '%"></i></div></div></header>';
    h += '<div class="dg-meio"><section class="dg-palco" data-mapa="maua"><div class="dg-mapbox">' + svgMapa("maua") + svgMapa("gsp") + '</div><div class="dg-mapcap"></div></section>';
    h += '<section class="dg-telao"><div class="dg-tag">' + esc_(cn.tag) + "</div>" + cn.h + "</section>";
    h += '<aside class="dg-bancada">' + cn.banc + "</aside></div>";
    h += '<div class="dg-ticker"><span class="dg-tk-rot">ÚLTIMAS DO DIÁRIO</span><div class="dg-tk"><span>' + esc_(ticker()) + "</span></div></div>";
    if (st.cena && st.cena.tipo === "pre") { h += '<nav class="dg-ctrl"><button type="button" data-dg="preprox">Próximo ›</button><button type="button" data-dg="prepular">Pular abertura</button><button type="button" data-dg="classica">Tela clássica</button></nav>'; return h + "</div></div>"; }
    h += '<nav class="dg-ctrl"><button type="button" data-dg="play">' + (AP_.play ? "⏸ Pausar" : "▶ Continuar") + "</button>" + VEL.map(function (v) { return '<button type="button" data-dg="vel" data-id="' + v[1] + '" class="' + (Math.abs((AP_.vel || 0) - v[1]) < 1e-6 ? "on" : "") + '">' + v[0] + "</button>"; }).join("") +
      '<button type="button" data-dg="classica">Tela clássica</button>' + (p >= 100 ? '<button type="button" class="fim" data-dg="encerrar">Encerrar apuração</button>' : "") + "</nav>";
    return h + "</div></div>";
  }
  function legendaMapa() {
    var f = focoMapa();
    if (f.k === "gsp") return "Grande São Paulo e ABC • cor do partido do eleito";
    return painelBairros() ? "Mauá por bairro • cor de quem lidera, mais forte onde já fechou" : "Mauá • sem votação por bairro registrada nesta eleição";
  }
  function desenhar() {
    var el = document.getElementById("v3dg"), ap = document.getElementById("apurMapa");
    if (!ap || !municipal()) { if (el) el.remove(); if (!ap) st.aberto = false; return; }
    if (!ap.querySelector(".dg-voltar")) { var b = document.createElement("button"); b.className = "dg-voltar"; b.type = "button"; b.setAttribute("data-dg", "voltar"); b.textContent = "📰 Ver no Diário"; ap.appendChild(b); }
    if (st.oculto) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "v3dg"; document.body.appendChild(el); }
    dirigir();
    var html = tela();
    if (el.getAttribute("data-k") !== "dg") { el.innerHTML = html; el.setAttribute("data-k", "dg"); st.tickT = Date.now(); st.vbK = null; atualizaMapas(el); return; }
    var tmp = document.createElement("div"); tmp.innerHTML = html;
    [".dg-top", ".dg-telao", ".dg-bancada", ".dg-ctrl"].forEach(function (sel) { var a = el.querySelector(sel), b2 = tmp.querySelector(sel); if (a && b2 && a.innerHTML !== b2.innerHTML) a.innerHTML = b2.innerHTML; });
    var cap = el.querySelector(".dg-mapcap"), lg = legendaMapa(); if (cap && cap.textContent !== lg) cap.textContent = lg;
    atualizaMapas(el);
    var tk = el.querySelector(".dg-tk span"), tk2 = tmp.querySelector(".dg-tk span");
    if (tk && tk2 && tk.textContent !== tk2.textContent && Date.now() - (st.tickT || 0) > 25000) { tk.textContent = tk2.textContent; st.tickT = Date.now(); }
  }
  DG.desenhar = desenhar;
  DG.camara = camara; DG.bairros = bairros; DG.panorama = panoramaCidades; DG.destaques = function () { var C = camara(); return C ? destaques(C) : []; };

  // retrato da Câmara que termina o mandato (para comparar bancadas na noite da eleição)
  function retratoCamara() {
    try {
      if (!municipal() || dt().mes >= 10) return;
      var vs = bancoDeNPCs.filter(function (n) { return n.vivo && /Vereador/.test(n.cargo || "") && (/Mauá/.test(n.cargo || "") || n.municipio_domicilio === "Mauá"); }), por = {};
      vs.forEach(function (n) { var s = sigla(n.partidoBase || n.partido); por[s] = (por[s] || 0) + 1; });
      try { if (/Vereador/.test(J().cargo_atual || "")) { var s = sigla(J().partido_atual); por[s] = (por[s] || 0) + 1; } } catch (e) {}
      M().v3dgAnt = { ano: dt().ano, por: por, n: vs.length };
    } catch (e) {}
  }
  function instalarRetrato() {
    var o = window.avancarMes; if (typeof o !== "function" || o.__v3dg) return;
    var n = function () { retratoCamara(); return o.apply(this, arguments); };
    for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
    n.__v3dg = true; window.avancarMes = n; try { avancarMes = n; } catch (e) {}
  }
  instalarRetrato(); window.addEventListener("load", function () { setTimeout(instalarRetrato, 0); });

  function loop() {
    var ap = document.getElementById("apurMapa");
    if (ap && municipal() && !st.aberto) {
      st.aberto = true; st.oculto = false; st.cena = null; st.rot = 0; st.anunc = {}; st.fila = []; st.panVistas = {}; st.panFinal = 0; st.vbK = null; cacheCam = { k: null, r: null }; st.pos = null; st.entFeita = false; st.entAberta = false;
      ok(function () { var AP_ = A().AP; if (AP_.pct < 1) { AP_.play = false; st.pre = true; novaCena("pre", { k: 0 }, 9500); } });
    }
    if (ap || document.getElementById("v3dg")) desenhar();
  }
  setInterval(function () { try { loop(); } catch (e) { console.warn("v3dg", e); } }, 450);

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-dg]"); if (!b) return;
    if (!b.closest("#v3dg") && !b.closest("#apurMapa")) return;
    var k = b.getAttribute("data-dg"), id = b.getAttribute("data-id"), AP_ = ok(function () { return A().AP; }, null);
    if (k === "" || (k === "bairro" && !painelBairros())) return;
    e.preventDefault(); e.stopPropagation();
    if (k === "classica") { st.oculto = true; if (st.pre) fimPre(); }
    else if (k === "voltar") st.oculto = false;
    else if (k === "play" && AP_) { AP_.play = !AP_.play; AP_.last = performance.now(); }
    else if (k === "vel" && AP_) { AP_.vel = +id; AP_.last = performance.now(); }
    else if (k === "bairro") novaCena("estado", { id: id }, 12000);
    else if (k === "preprox") { if (st.cena && st.cena.tipo === "pre") st.cena.dur = 0; dirigir(); }
    else if (k === "prepular") { fimPre(); }
    else if (k === "encerrar") { var t = document.getElementById("v3dg"); if (t) t.remove(); st.aberto = false; ok(function () { A().fechar(); }); return; }
    desenhar();
  }, true);
})();
