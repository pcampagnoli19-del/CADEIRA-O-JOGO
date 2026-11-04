/* =============================================================================
   CADEIRA v3 — Cobertura eleitoral: pesquisas da abertura, entrevistas e apoios
   Peças usadas pelas transmissões (debates, TV nacional e Diário do Grande ABC):
   - pesquisas para as aberturas (as publicadas no jogo quando é a corrida do
     jogador; senão, a pesquisa de véspera de um instituto, próxima do 1º turno);
   - apoios no 2º turno: ao fim do 1º turno, cada candidato eliminado decide
     (apoia um finalista, vai conversar com o partido, anuncia depois, fica
     neutro ou libera os eleitores). O apoio soma pontos ao finalista no 2º
     turno (pontuação que o motor usa em apurarSegundoTurno). Decisões
     pendentes se resolvem nas semanas seguintes. O jogador eliminado decide o
     próprio apoio; o jogador finalista pode pedir apoio (card na Campanha);
   - entrevistas: perguntas contextualizadas ao jogador (debate e pós-apuração)
     com consequências em popularidade, escândalo, relações, partido e notícias;
     falas dos NPCs coerentes com partido, estilo e resultado.
   Dados: M().v3apoio = { lista: [...] }
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3COB) return;
  var CB = (window.V3COB = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(a, seed) { return a[(seed == null ? Math.floor(Math.random() * a.length) : hash(seed) % a.length)]; }
  function npc(id) { return ok(function () { return bancoDeNPCs.find(function (n) { return n.id === id; }); }, null); }
  function npcNome(nome) { return ok(function () { return bancoDeNPCs.find(function (n) { return n.nome === nome; }); }, null); }
  function limpa(n) { return String(n || "").replace(/\s*\((vice|suplentes?):.*$/i, "").trim(); }
  function lado(p) { var e = ok(function () { return (PARTIDOS[normPartido(p)] || PARTIDOS[p] || {}).e; }, "C"); return e || "C"; }
  function sigla(p) { var x = ok(function () { return normPartido(p); }, p) || p; return x === "Sem Partido" ? "sem partido" : x; }
  function nota(t, tipo) { ok(function () { manchete(t, tipo || "eleicao"); }); }
  function fem(o) { if (!o) return false; if (o.jogador || o.id === "JOGADOR") return ok(function () { return J().sexo === "F"; }, false); var n = npc(o.id) || npcNome(o.nome); return !!(n && n.sexo === "F"); }
  function oa(o, m, f) { return fem(o) ? f : m; }
  var NOME_C = { PRES: "Presidência da República", GOV: "Governo de São Paulo", PREF: "Prefeitura de Mauá", SEN: "Senado", DEPF: "Câmara dos Deputados", DEPE: "Assembleia Legislativa", VER: "Câmara de Mauá" };
  CB.NOME_C = NOME_C;

  /* ================================================================ pesquisas para as aberturas */
  var INST = ["Datafolha", "Quaest", "AtlasIntel", "Ipec", "Paraná Pesquisas"];
  // lista: [{id, nome, partido, share}] (1º turno). Devolve { instituto, margem, itens:[{nome, partido, pct}] }
  CB.pesquisa = function (cargo, lista, chave) {
    var meu = ok(function () { return cargoIdPorNome(J().campanha.cargo_alvo); }, null);
    if (meu === cargo) {
      var pub = ok(function () { return pesquisasPublicas(); }, []);
      if (pub && pub[0] && pub[0].lista) return { instituto: pub[0].ins.nome, margem: pub[0].ins.margem, itens: pub[0].lista.slice(0, 6).map(function (y) { return { nome: y.jogador ? ok(function () { return J().nome; }, y.nome) : limpa(y.nome), partido: y.partido, pct: y.share || y.pct || 0, jogador: !!y.jogador }; }) };
    }
    var ins = pick(INST, (chave || cargo) + "|ins"), mg = 2 + (hash(ins) % 3);
    var it = (lista || []).slice().sort(function (a, b) { return (b.share || 0) - (a.share || 0); }).slice(0, 6).map(function (c) {
      var r = ((hash(c.id + "|" + chave) % 1000) / 1000 - 0.5) * 2 * (mg + 1.5);
      return { nome: limpa(c.nome), partido: c.partido, pct: Math.max(0.5, (c.share || 0) + r), jogador: !!c.jogador || c.id === "JOGADOR" };
    });
    var tot = it.reduce(function (s, x) { return s + x.pct; }, 0) || 1, br = 100 - (6 + hash(chave + "br") % 6);
    it.forEach(function (x) { x.pct = x.pct / tot * br; });
    return { instituto: ins, margem: mg, itens: it.sort(function (a, b) { return b.pct - a.pct; }), brancos: 100 - br };
  };

  /* ================================================================ apoios no 2º turno */
  function st() { var m = ok(function () { return M(); }, null); if (!m) return null; if (!m.v3apoio) m.v3apoio = { lista: [] }; return m.v3apoio; }
  function ano() { return ok(function () { return dt().ano; }, 0); }
  function segundos() { return ok(function () { var E = M().eleicao; return (E.segundos && E.segundos.length ? E.segundos : (E.segundo_turno ? [E.segundo_turno] : [])); }, []); }
  CB.segundos = segundos;
  var ROT = { apoia: "declarou apoio a", conversar: "vai conversar com o partido antes de decidir", depois: "vai anunciar a posição nos próximos dias", neutro: "ficou neutro", libera: "liberou os eleitores", nenhum: "não apoia nenhum dos dois", pendente: "ainda não se posicionou" };
  CB.ROT = ROT;
  function bonusDe(rec) { return rec.decisao === "apoia" ? Math.max(0.6, (rec.share || 3) * 0.14) : 0; }
  function aplicar(rec, stt) {
    if (rec.decisao !== "apoia" || rec.aplicado) return;
    rec.aplicado = true;
    var c = (stt.candidatos || []).filter(function (x) { return (x.id && x.id === rec.para.id) || x.nome === rec.para.nome; })[0];
    if (c && !c.jogador) c.score = (c.score || 0) + bonusDe(rec);
    var n = npc(rec.quem.id); if (n && rec.para.id) n.apoia_id = rec.para.id;
  }
  // decisão de um NPC eliminado, coerente com ideologia, partido e relação com o jogador
  function decidir(el, stt, forcar) {
    var a = stt.candidatos[0], b = stt.candidatos[1]; if (!a || !b) return { decisao: "neutro" };
    var le = lado(el.partido), pa = a.jogador ? ok(function () { return J().partido_atual; }, "") : a.partido || ok(function () { return (npc(a.id) || {}).partidoBase; }, ""), pb = b.jogador ? ok(function () { return J().partido_atual; }, "") : b.partido || ok(function () { return (npc(b.id) || {}).partidoBase; }, "");
    var la = lado(pa), lb = lado(pb), n = npc(el.id), rel = n ? (n.relacao_com_jogador || 0) : 0;
    var sa = (la === le ? 3 : la === "C" || le === "C" ? 1 : -2) + (sigla(pa) === sigla(el.partido) ? 4 : 0) + (a.jogador ? rel / 25 : 0);
    var sb = (lb === le ? 3 : lb === "C" || le === "C" ? 1 : -2) + (sigla(pb) === sigla(el.partido) ? 4 : 0) + (b.jogador ? rel / 25 : 0);
    var best = sa >= sb ? a : b, dif = Math.abs(sa - sb), r = Math.random();
    if (forcar) return dif >= 2 ? (r < 0.75 ? { decisao: "apoia", para: best } : { decisao: "libera" }) : r < 0.4 ? { decisao: "apoia", para: best } : r < 0.75 ? { decisao: "neutro" } : { decisao: "libera" };
    if (dif >= 3) return r < 0.62 ? { decisao: "apoia", para: best } : r < 0.82 ? { decisao: "conversar" } : { decisao: "depois" };
    if (dif >= 1) return r < 0.4 ? { decisao: "apoia", para: best } : r < 0.65 ? { decisao: "conversar" } : r < 0.85 ? { decisao: "depois" } : { decisao: "libera" };
    return r < 0.3 ? { decisao: "neutro" } : r < 0.55 ? { decisao: "libera" } : r < 0.8 ? { decisao: "conversar" } : { decisao: "nenhum" };
  }
  function registrar(stt, el, d, onde) {
    var S_ = st(); if (!S_) return null;
    var rec = { ano: ano(), cargo: stt.cargo, quem: { id: el.id, nome: limpa(el.nome), partido: el.partido || "", share: el.share || 0 }, share: el.share || 0, decisao: d.decisao,
      para: d.para ? { id: d.para.id || (d.para.jogador ? "JOGADOR" : null), nome: d.para.jogador ? ok(function () { return J().nome; }, "") : limpa(d.para.nome) } : null, onde: onde || "noite", m: ok(function () { return agoraM(); }, 0), jogador: !!el.jogador };
    S_.lista = S_.lista.filter(function (x) { return !(x.ano === rec.ano && x.cargo === rec.cargo && x.quem.nome === rec.quem.nome); });
    S_.lista.push(rec); aplicar(rec, stt);
    return rec;
  }
  // gera as declarações da noite do 1º turno para todas as disputas que vão ao 2º turno
  CB.gerarApoios = function () {
    var S_ = st(); if (!S_) return [];
    var out = [];
    segundos().forEach(function (stt) {
      (stt.elim || []).slice().sort(function (a, b) { return (b.share || 0) - (a.share || 0); }).slice(0, 5).forEach(function (el) {
        if ((el.share || 0) < 1.5) return;
        if (S_.lista.some(function (x) { return x.ano === ano() && x.cargo === stt.cargo && x.quem.nome === limpa(el.nome); })) return;
        if (el.jogador) { out.push(registrar(stt, el, { decisao: "pendente" })); return; }
        var d = decidir(el, stt); out.push(registrar(stt, el, d));
      });
    });
    return out.filter(Boolean);
  };
  CB.apoiosDe = function (cargo) { var S_ = st(); return S_ ? S_.lista.filter(function (x) { return x.ano === ano() && (!cargo || x.cargo === cargo); }) : []; };
  CB.fraseApoio = function (rec) {
    if (rec.decisao === "apoia") return rec.quem.nome + " (" + sigla(rec.quem.partido) + ") " + ROT.apoia + " " + rec.para.nome + ".";
    return rec.quem.nome + " (" + sigla(rec.quem.partido) + ") " + ROT[rec.decisao] + ".";
  };
  // decisões pendentes se resolvem nas semanas seguintes
  function resolverPendentes() {
    var S_ = st(); if (!S_) return;
    var sts = segundos(); if (!sts.length) return;
    S_.lista.forEach(function (rec) {
      if (rec.ano !== ano() || rec.jogador || ["conversar", "depois"].indexOf(rec.decisao) < 0) return;
      if (rec.m >= ok(function () { return agoraM(); }, 0) - 0 && !rec.semana1) { rec.semana1 = true; return; } // espera ao menos uma rodada
      if (Math.random() > 0.45) return;
      var stt = sts.filter(function (x) { return x.cargo === rec.cargo; })[0]; if (!stt) return;
      var el = (stt.elim || []).filter(function (x) { return limpa(x.nome) === rec.quem.nome; })[0] || { id: rec.quem.id, nome: rec.quem.nome, partido: rec.quem.partido, share: rec.share };
      var d = decidir(el, stt, true), antes = rec.decisao;
      rec.decisao = d.decisao; rec.para = d.para ? { id: d.para.id || (d.para.jogador ? "JOGADOR" : null), nome: d.para.jogador ? ok(function () { return J().nome; }, "") : limpa(d.para.nome) } : null; rec.m = ok(function () { return agoraM(); }, 0);
      aplicar(rec, stt);
      nota((antes === "conversar" ? "Depois de ouvir o partido, " : "") + CB.fraseApoio(rec) + " (2º turno: " + (NOME_C[rec.cargo] || rec.cargo) + ")");
    });
  }
  // o jogador finalista recebe o bônus dos apoios na pontuação do 2º turno
  function instalarScore() {
    if (typeof window.scoreJogadorMaj !== "function" || window.scoreJogadorMaj.__v3cob) return;
    var o = window.scoreJogadorMaj;
    var n = function (cargo) { var v = o.apply(this, arguments); try { CB.apoiosDe(cargo).forEach(function (r) { if (r.decisao === "apoia" && r.para && r.para.id === "JOGADOR") v += bonusDe(r); }); } catch (e) {} return v; };
    for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
    n.__v3cob = true; window.scoreJogadorMaj = n; try { scoreJogadorMaj = n; } catch (e) {}
  }
  // decisão do jogador eliminado
  CB.decidirJogador = function (cargo, decisao, paraId) {
    var stt = segundos().filter(function (x) { return x.cargo === cargo; })[0]; if (!stt) return null;
    var el = (stt.elim || []).filter(function (x) { return x.jogador; })[0] || { id: "JOGADOR", nome: ok(function () { return J().nome; }, ""), partido: ok(function () { return J().partido_atual; }, ""), share: 5, jogador: true };
    var para = paraId ? stt.candidatos.filter(function (c) { return c.id === paraId || c.nome === paraId; })[0] : null;
    var rec = registrar(stt, el, { decisao: decisao, para: para }, "jogador");
    var nome = ok(function () { return J().nome; }, "");
    if (decisao === "apoia" && para) {
      var n = npc(para.id); if (n) n.relacao_com_jogador = clamp((n.relacao_com_jogador || 0) + 15, -100, 100);
      var mesmo = lado(J().partido_atual) === lado(para.partido || (n && n.partidoBase));
      ok(function () { J().relacao_partido = clamp((J().relacao_partido || 50) + (mesmo ? 3 : -5), 0, 100); });
      if (!mesmo) ok(function () { addEscandalo(1); });
      nota(nome + " declara apoio a " + limpa(para.nome) + " no 2º turno" + (mesmo ? "." : ", e parte da base critica a escolha."));
    } else nota(nome + " " + ROT[decisao] + " no 2º turno (" + (NOME_C[cargo] || cargo) + ").");
    return rec;
  };
  // jogador finalista pede apoio a um eliminado
  CB.pedirApoio = function (cargo, nomeEl) {
    var stt = segundos().filter(function (x) { return x.cargo === cargo; })[0]; if (!stt) return;
    var rec = CB.apoiosDe(cargo).filter(function (r) { return r.quem.nome === nomeEl; })[0]; if (!rec || rec.decisao === "apoia") return;
    if (rec.pedido) { ok(function () { toast("Você já pediu esse apoio.", "err"); }); return; }
    if (!ok(function () { return gastarEnergia(10); }, true)) return;
    rec.pedido = true;
    var jog = stt.candidatos.filter(function (c) { return c.jogador; })[0]; if (!jog) return;
    var n = npc(rec.quem.id), rel = n ? (n.relacao_com_jogador || 0) : 0, mesmo = lado(rec.quem.partido) === lado(ok(function () { return J().partido_atual; }, ""));
    var p = clamp(0.22 + rel / 160 + (mesmo ? 0.25 : lado(rec.quem.partido) === "C" ? 0.08 : -0.15) + (rec.decisao === "conversar" || rec.decisao === "depois" ? 0.1 : 0), 0.05, 0.85);
    if (Math.random() < p) { rec.decisao = "apoia"; rec.para = { id: "JOGADOR", nome: ok(function () { return J().nome; }, "") }; rec.aplicado = false; aplicar(rec, stt); if (n) n.relacao_com_jogador = clamp(rel + 5, -100, 100); nota(rec.quem.nome + " aceita o convite e declara apoio a " + rec.para.nome + " no 2º turno."); ok(function () { toast("Apoio conquistado!", "ok"); }); }
    else { if (n) n.relacao_com_jogador = clamp(rel - 2, -100, 100); nota(rec.quem.nome + " recusa o pedido de apoio de " + ok(function () { return J().nome; }, "") + " e mantém distância no 2º turno."); ok(function () { toast("Pedido recusado.", "err"); }); }
    ok(function () { render(); });
  };
  function cardApoios() {
    var sts = segundos(); if (!sts.length) return "";
    var h = "";
    sts.forEach(function (stt) {
      var recs = CB.apoiosDe(stt.cargo); if (!recs.length) return;
      var jogFin = stt.candidatos.some(function (c) { return c.jogador; }), jogEl = recs.filter(function (r) { return r.jogador && r.decisao === "pendente"; })[0];
      h += "<h4>" + esc_(NOME_C[stt.cargo] || stt.cargo) + ": " + stt.candidatos.map(function (c) { return esc_(c.jogador ? "você" : limpa(c.nome)); }).join(" × ") + "</h4>";
      h += recs.map(function (r) {
        var bt = jogFin && !r.jogador && r.decisao !== "apoia" && !r.pedido && typeof btn === "function" ? btn("Pedir apoio (−10 energia)", "v3cobPedir", [stt.cargo, r.quem.nome], "mini confirma") : (r.pedido && r.decisao !== "apoia" ? "<small>pedido feito</small>" : "");
        return '<div class="row" style="gap:8px;align-items:center;margin:4px 0"><span class="grow"><b>' + esc_(r.jogador ? "Você" : r.quem.nome) + "</b> <small>(" + esc_(sigla(r.quem.partido)) + ", " + (r.share || 0).toFixed(1).replace(".", ",") + "% no 1º turno)</small><br><small>" + esc_(r.decisao === "apoia" ? "apoia " + r.para.nome : ROT[r.decisao]) + "</small></span>" + bt + "</div>";
      }).join("");
      if (jogEl && typeof btn === "function") h += '<p class="txt">Sua posição no 2º turno:</p><div class="row" style="gap:6px;flex-wrap:wrap">' + stt.candidatos.map(function (c) { return btn("Apoiar " + limpa(c.nome), "v3cobDecidir", [stt.cargo, "apoia", c.id || c.nome], "mini confirma"); }).join("") + btn("Liberar eleitores", "v3cobDecidir", [stt.cargo, "libera", ""], "mini") + btn("Neutralidade", "v3cobDecidir", [stt.cargo, "neutro", ""], "mini") + btn("Nenhum dos dois", "v3cobDecidir", [stt.cargo, "nenhum", ""], "mini branco") + "</div>";
    });
    return h ? (typeof card === "function" ? card("Apoios no 2º turno", "<p class='txt'><small>Declarações dos candidatos eliminados. Cada apoio soma força ao finalista na disputa do 2º turno.</small></p>" + h) : "") : "";
  }
  CB.cardApoios = cardApoios;

  /* ================================================================ entrevistas */
  // situação do jogador na eleição do ano
  CB.minhaDisputa = function () { return ok(function () { var d = dt(); return (CAR().eleicoes || []).filter(function (e) { return e.ano === d.ano; }).slice(-1)[0] || null; }, null); };
  // perguntas pré-debate ao jogador, a partir do contexto real da campanha
  CB.perguntasPreDebate = function (ctx) {
    var j = ok(function () { return J(); }, {}), Q = [], pos = ctx.pos, lider = ctx.lider, esc = j.escandalo || 0, cargo = ctx.cargoTxt;
    if (pos === 1) Q.push({ id: "lider", q: "Você chega ao debate liderando a pesquisa" + (ctx.pct ? " com " + ctx.pct.toFixed(0) + "%" : "") + ". Vai jogar parado, só para não errar?", ops: [
      { id: "humilde", rot: "Humildade", fala: "Pesquisa é fotografia. Vim aqui para conversar com quem ainda não decidiu.", ef: { pop: 0.6, imp: 1 } },
      { id: "confiante", rot: "Confiança", fala: "O eleitor já percebeu quem tem projeto. Hoje vou mostrar de novo.", ef: { pop: 0.3, base: 1, risco: 0.15 } },
      { id: "ataque", rot: "Ataque", fala: "Quem está atrás vai partir para a baixaria. Eu vou responder com resultados.", ef: { pop: -0.2, base: 1.5, rival: -4 } }] });
    else Q.push({ id: "atras", q: "As pesquisas mostram você em " + pos + "º lugar" + (lider ? ", atrás de " + lider : "") + ". O que muda hoje?", ops: [
      { id: "virada", rot: "Prometer virada", fala: "Já virei eleição antes. A campanha começa de verdade agora.", ef: { pop: 0.4, base: 1, risco: 0.2 } },
      { id: "propostas", rot: "Focar em propostas", fala: "Vou apresentar três propostas concretas que ninguém aqui tem coragem de fazer.", ef: { pop: 0.7, imp: 1 } },
      { id: "pesquisa", rot: "Desacreditar a pesquisa", fala: "Essas pesquisas erram toda eleição. O sentimento da rua é outro.", ef: { pop: -0.3, base: 1.2, imp: -1 } }] });
    if (esc >= 25) Q.push({ id: "polemica", q: "Seu nome apareceu no noticiário pelos casos que estão sendo investigados. Vai ser cobrado hoje. Qual a resposta?", ops: [
      { id: "transparencia", rot: "Transparência", fala: "Estou à disposição da Justiça e já entreguei todos os documentos. Não tenho o que esconder.", ef: { pop: 0.5, esc: -1, imp: 1 } },
      { id: "perseguicao", rot: "Perseguição política", fala: "Isso é perseguição de quem tem medo da minha candidatura.", ef: { pop: -0.2, base: 1.5, esc: 1, imp: -1 } },
      { id: "desviar", rot: "Mudar de assunto", fala: "O eleitor quer saber de emprego e saúde, não de fofoca.", ef: { pop: 0.1, risco: 0.25 } }] });
    else if (ctx.temAliados) Q.push({ id: "aliancas", q: "Sua aliança com " + ctx.temAliados + " é criticada pelos adversários. Ela atrapalha?", ops: [
      { id: "defende", rot: "Defender a aliança", fala: "Governar exige maioria. Quem não sabe fazer aliança não governa.", ef: { pop: 0.2, part: 2 } },
      { id: "distancia", rot: "Tomar distância", fala: "Quem manda na minha candidatura sou eu, não os partidos.", ef: { pop: 0.4, part: -3 } },
      { id: "programa", rot: "Falar do programa", fala: "A aliança é em torno de um programa, e eu vou apresentá-lo hoje.", ef: { pop: 0.4 } }] });
    else Q.push({ id: "trajetoria", q: "Por que alguém com a sua trajetória está preparado para " + cargo + "?", ops: [
      { id: "experiencia", rot: "Experiência", fala: (j.cargo_atual && !/Cidad/.test(j.cargo_atual) ? "Já fui " + j.cargo_atual + " e entreguei resultado." : "Conheço a vida real das pessoas, e isso nenhum gabinete ensina."), ef: { pop: 0.5 } },
      { id: "renovacao", rot: "Renovação", fala: "Justamente por não ser mais do mesmo. O eleitor está cansado dos mesmos nomes.", ef: { pop: 0.4, base: 0.5 } },
      { id: "equipe", rot: "Equipe", fala: "Ninguém governa sozinho: tenho a melhor equipe técnica desta disputa.", ef: { pop: 0.3, imp: 1 } }] });
    return Q;
  };
  // aplica as consequências de uma resposta (entrevista)
  CB.aplicarResposta = function (op, ctx) {
    var j = ok(function () { return J(); }, null); if (!j) return { txt: "" };
    var ef = op.ef || {}, r = Math.random(), azar = ef.risco && r < ef.risco, d = (ef.pop || 0) * (0.7 + Math.random() * 0.6) - (azar ? 1.2 : 0);
    j.popularidade = clamp((j.popularidade || 0) + d, 0, 100);
    if (ef.esc) ok(function () { addEscandalo(ef.esc); });
    if (ef.part) j.relacao_partido = clamp((j.relacao_partido || 50) + ef.part, 0, 100);
    if (ef.base) ok(function () { if (typeof perfilMexe === "function") perfilMexe("rb", ef.base * 0.5); });
    if (ef.rival && ctx && ctx.rivalId) { var n = npc(ctx.rivalId); if (n) n.relacao_com_jogador = clamp((n.relacao_com_jogador || 0) + ef.rival, -100, 100); }
    var veic = (ctx && ctx.canal) || "TV";
    var txt = azar ? "Frase de " + j.nome + " na entrevista à " + veic + " (\"" + op.fala + "\") repercute mal e vira munição dos adversários." : (ef.imp || 0) > 0 ? j.nome + " em entrevista à " + veic + ": \"" + op.fala + "\" A resposta é bem recebida por analistas." : (ef.imp || 0) < 0 ? j.nome + " à " + veic + ": \"" + op.fala + "\" Comentaristas criticam o tom." : j.nome + " à " + veic + ": \"" + op.fala + "\"";
    nota(txt, azar || (ef.imp || 0) < 0 ? "imprensa" : "eleicao");
    return { txt: txt, delta: d, azar: azar };
  };
  // falas de NPC (pré-debate e pós-apuração), coerentes com estilo, cargo e situação
  CB.falaNpc = function (c, momento, ctx) {
    var n = npc(c.id) || npcNome(limpa(c.nome)) || {}, nome = limpa(c.nome), le = lado(c.partido || n.partidoBase), inc = /Prefeito de Mauá|Governador de SP|Presidente da República/.test(n.cargo || "");
    var est = (n.retorica || 50) > (n.carisma || 50) + 8 ? "agressivo" : (n.inteligencia || 50) > (n.carisma || 50) ? "tecnico" : "popular", s = nome + momento;
    if (momento === "chegada") return pick([
      nome + " chega acompanhad" + oa(c, "o", "a") + " de lideranças do " + sigla(c.partido) + " e acena para a militância.",
      nome + " desembarca em silêncio, revisando anotações com a assessoria.",
      nome + " chega sorrindo e posa para fotos com apoiadores na porta do estúdio."], s);
    if (momento === "pre") {
      if (inc) return "Venho mostrar o que entregamos. Quem quer mudar tudo precisa explicar o que vai colocar no lugar.";
      if (est === "agressivo") return pick(["Hoje o eleitor vai conhecer a verdade sobre quem governa e sobre quem quer governar.", "Vou cobrar cada promessa não cumprida. Quem tem medo de debate não deveria ser candidato."], s);
      if (est === "tecnico") return pick(["Trouxe números. O debate tem que ser sobre gestão, não sobre gritaria.", "Vou apresentar um plano com começo, meio e fim, e quanto custa cada proposta."], s);
      return pick(["Vim falar com quem acorda cedo e pega dois ônibus para trabalhar.", "O povo quer resposta simples para problema real. É isso que eu vou dar."], s);
    }
    if (momento === "eleito") return pick(["Agradeço a cada eleitor. A partir de amanhã governo para todos, inclusive para quem não votou em mim.", "Foi uma vitória do trabalho de rua. Agora é arregaçar as mangas.", "Essa vitória é de quem acreditou num projeto. Vamos honrar cada voto."], s);
    if (momento === "segundo") return pick(["Começa agora uma nova eleição. Vamos conversar com todos que querem mudar o rumo.", "O segundo turno é a hora de comparar projetos. Estou pront" + oa(c, "o", "a") + ".", "Agradeço os " + (c.share ? Math.round(c.share) + "% de " : "") + "votos de hoje. A partir de amanhã, vamos atrás de cada apoio.", "Ninguém ganha sozinho. Minha porta está aberta para quem ficou pelo caminho."], s);
    if (momento === "derrota") return est === "agressivo" ? pick(["A máquina pesou. Mas vamos fiscalizar cada passo de quem ganhou.", "Perdemos a eleição, não a convicção. A oposição começa hoje."], s) : pick(["Respeito o resultado e cumprimento o vencedor. Seguimos na luta.", "O eleitor falou e a democracia venceu. Vou continuar servindo de outra forma."], s);
    return "";
  };
  // perguntas ao jogador depois do resultado
  CB.perguntasPos = function () {
    var e = CB.minhaDisputa(); if (!e) return null;
    var res = String(e.resultado || ""), cargo = e.cargo || "";
    var stt = segundos().filter(function (s) { return (s.candidatos || []).some(function (c) { return c.jogador; }); })[0];
    var elim = CB.apoiosDe().filter(function (r) { return r.jogador && r.decisao === "pendente"; })[0];
    if (elim) {
      var s2 = segundos().filter(function (s) { return s.cargo === elim.cargo; })[0];
      return { tipo: "apoio", cargo: elim.cargo, q: "Você ficou fora do 2º turno. Vai apoiar alguém na disputa entre " + s2.candidatos.map(function (c) { return limpa(c.nome); }).join(" e ") + "?", ops: s2.candidatos.map(function (c) { return { id: "apoia|" + (c.id || c.nome), rot: "Apoiar " + limpa(c.nome), fala: "Meu apoio no segundo turno é de " + limpa(c.nome) + ". É o projeto mais próximo do que defendi." }; }).concat([
        { id: "conversar", rot: "Conversar com o partido", fala: "Vou ouvir o partido e a militância antes de qualquer decisão." },
        { id: "depois", rot: "Anunciar depois", fala: "Ainda é cedo. Anuncio minha posição nos próximos dias." },
        { id: "libera", rot: "Liberar os eleitores", fala: "Meus eleitores são livres e vão decidir com a própria consciência." },
        { id: "nenhum", rot: "Nenhum dos dois", fala: "Nenhum dos dois representa o que defendemos nesta campanha." }]) };
    }
    if (stt) return { tipo: "segundo", cargo: stt.cargo, q: "Você está no 2º turno. Qual é o recado para quem votou nos outros candidatos?", ops: [
      { id: "pontes", rot: "Construir pontes", fala: "Meu convite é para todos que querem mudar. Vou procurar cada candidato derrotado ainda esta semana.", ef: { pop: 0.6, imp: 1 } },
      { id: "proprio", rot: "Seguir com o próprio projeto", fala: "Quem votou em mim votou num projeto. Não vou mudar de lado para ganhar apoio.", ef: { pop: 0.3, base: 1 } },
      { id: "ataque", rot: "Atacar o adversário", fala: "O segundo turno vai mostrar quem é quem. Meu adversário vai ter que explicar muita coisa.", ef: { pop: -0.2, base: 1.5, risco: 0.2 } }] };
    if (/Eleit/.test(res)) return { tipo: "vitoria", cargo: cargo, q: "Você foi " + oa({ jogador: true }, "eleito", "eleita") + " " + cargo.toLowerCase() + ". Qual é a primeira mensagem?", ops: [
      { id: "humilde", rot: "Agradecer e trabalhar", fala: "Obrigado a cada eleitor. A partir de amanhã governo para todos.", ef: { pop: 0.8, imp: 1 } },
      { id: "aliados", rot: "Dividir com aliados", fala: "Essa vitória é do partido e dos aliados que caminharam comigo.", ef: { pop: 0.4, part: 4 } },
      { id: "provocar", rot: "Provocar os adversários", fala: "Disseram que eu não chegava. Cheguei, e com voto.", ef: { pop: -0.2, base: 1.5, risco: 0.25 } }] };
    return { tipo: "derrota", cargo: cargo, q: "O resultado não veio. O que você diz aos seus eleitores?", ops: [
      { id: "reconhece", rot: "Reconhecer a derrota", fala: "Respeito o resultado e cumprimento os eleitos. Seguimos juntos.", ef: { pop: 0.6, imp: 1 } },
      { id: "luta", rot: "Anunciar próximos passos", fala: "Perdemos uma eleição, não a causa. Vou continuar organizando nosso grupo.", ef: { pop: 0.3, base: 1 } },
      { id: "culpa", rot: "Culpar a máquina e as fake news", fala: "Enfrentamos a máquina e uma enxurrada de mentiras.", ef: { pop: -0.3, base: 1.5, esc: 1, imp: -1 } }] };
  };
  CB.responderPos = function (P, opId) {
    var op = P.ops.filter(function (o) { return o.id === opId; })[0]; if (!op) return "";
    if (P.tipo === "apoio") {
      var parts = opId.split("|"), dec = parts[0], para = parts[1] || null;
      CB.decidirJogador(P.cargo, dec, para);
      return "Você: \"" + op.fala + "\"";
    }
    var r = CB.aplicarResposta(op, { canal: "TV" });
    if (P.tipo === "segundo" && opId === "pontes") ok(function () { var top = CB.apoiosDe(P.cargo).filter(function (x) { return x.decisao !== "apoia"; }).sort(function (a, b) { return b.share - a.share; })[0]; if (top) top.pontes = true; });
    return r.txt;
  };

  /* ================================================================ overlay de entrevista ao vivo (usado na TV e no Diário) */
  var ent = null;
  CB.abrirEntrevista = function (P, cfg) {
    if (!P) return;
    // com IA configurada, a entrevista vira conversa livre (exceto a decisão de apoio no 2º turno, que é mecânica)
    if (P.tipo !== "apoio" && window.V3ENT && window.V3ENT.disponivel()) {
      var c0 = cfg || {}, e = CB.minhaDisputa() || {};
      window.V3ENT.abrir({ modo: "pos-eleicao", veiculo: String(c0.titulo || "TV").split(" •")[0], titulo: c0.titulo, logo: c0.logo, tema: c0.tema, reporter: c0.reporter ? { nome: c0.reporter.nome, foto: c0.reporter.foto, papel: (c0.reporter.papel || "repórter") } : null,
        rodadas: 3, assunto: { vitoria: "a vitória e os primeiros passos no cargo", derrota: "a derrota e o futuro político", segundo: "a ida ao 2º turno e as alianças" }[P.tipo] || "o resultado da eleição",
        dados: { situacao: P.tipo, cargo_disputado: P.cargo || e.cargo, resultado: e.resultado, votos: e.votos, percentual: e.pct || e.share, apoios_2turno: CB.apoiosDe().filter(function (r) { return r.decisao === "apoia"; }).slice(0, 5).map(function (r) { return r.quem.nome + " → " + r.para.nome; }) },
        aoFechar: function () { if (c0.aoFechar) ok(c0.aoFechar); } });
      return;
    }
    ent = { P: P, cfg: cfg || {}, resp: null };
    desenharEnt();
  };
  function desenharEnt() {
    var el = document.getElementById("v3cob-ent");
    if (!ent) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "v3cob-ent"; document.body.appendChild(el); }
    var c = ent.cfg, P = ent.P;
    el.innerHTML = '<div class="v3cob-ov"><div class="v3cob-box ' + esc_(c.tema || "") + '"><div class="v3cob-top">' + (c.logo ? '<img src="' + esc_(c.logo) + '" alt="">' : "") + "<div><b>" + esc_(c.titulo || "Entrevista ao vivo") + "</b><small>" + esc_(c.sub || "") + '</small></div><span class="v3cob-vivo">AO VIVO</span></div>' +
      (c.reporter ? '<div class="v3cob-rep">' + (c.reporter.foto ? '<img src="' + esc_(c.reporter.foto) + '" alt="">' : "") + "<div><b>" + esc_(c.reporter.nome) + "</b><small>" + esc_(c.reporter.papel || "repórter") + "</small></div></div>" : "") +
      '<p class="v3cob-q">' + esc_(P.q) + "</p>" +
      (ent.resp ? '<p class="v3cob-r">' + esc_(ent.resp) + '</p><button type="button" class="v3cob-ok" data-v3cob="fechar">Encerrar entrevista</button>' :
        '<div class="v3cob-ops">' + P.ops.map(function (o) { return '<button type="button" data-v3cob="op" data-id="' + esc_(o.id) + '"><b>' + esc_(o.rot) + '</b><small>"' + esc_(o.fala) + '"</small></button>'; }).join("") + '</div><button type="button" class="v3cob-sem" data-v3cob="fechar">Recusar a entrevista</button>') + "</div></div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3cob]"); if (!b || !ent) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.getAttribute("data-v3cob");
    if (k === "op") { ent.resp = CB.responderPos(ent.P, b.getAttribute("data-id")); ent.feito = true; desenharEnt(); if (ent.cfg.aoResponder) ok(ent.cfg.aoResponder); return; }
    if (k === "fechar") { var cfg = ent.cfg, feito = ent.feito; ent = null; desenharEnt(); if (!feito) nota(ok(function () { return J().nome; }, "") + " evita a imprensa na noite da apuração.", "imprensa"); if (cfg.aoFechar) ok(cfg.aoFechar); }
  }, true);

  /* ================================================================ instalação */
  function instalar() {
    instalarScore();
    if (typeof window.A === "object" || typeof A === "object") ok(function () {
      if (!A.v3cobPedir) A.v3cobPedir = function (cargo, nome) { CB.pedirApoio(cargo, nome); };
      if (!A.v3cobDecidir) A.v3cobDecidir = function (cargo, dec, para) { CB.decidirJogador(cargo, dec, para || null); render(); };
    });
    // as declarações nascem junto com o resultado do 1º turno
    if (typeof window.apurarEleicao === "function" && !window.apurarEleicao.__v3cob) {
      var o = window.apurarEleicao;
      var n = function () { var r = o.apply(this, arguments); try { CB.gerarApoios(); } catch (e) { console.warn("v3cob apoios", e); } return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3cob = true; window.apurarEleicao = n; try { apurarEleicao = n; } catch (e) {}
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3cob) {
      var a = window.avancarMes;
      var m = function () { var r = a.apply(this, arguments); try { resolverPendentes(); } catch (e) {} return r; };
      for (var k2 in a) { try { m[k2] = a[k2]; } catch (e) {} }
      m.__v3cob = true; window.avancarMes = m; try { avancarMes = m; } catch (e) {}
    }
    if (typeof VIEWS !== "undefined" && typeof VIEWS.camp === "function" && !VIEWS.camp.__v3cob) {
      var vc = VIEWS.camp;
      var w = function () { var h = vc.apply(this, arguments); try { var c = cardApoios(); if (c && String(h).indexOf("Apoios no 2º turno") < 0) h = c + h; } catch (e) {} return h; };
      for (var k3 in vc) { try { w[k3] = vc[k3]; } catch (e) {} }
      w.__v3cob = true; VIEWS.camp = w;
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 90); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
