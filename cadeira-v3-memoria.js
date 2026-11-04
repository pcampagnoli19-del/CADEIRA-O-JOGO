/* =============================================================================
   CADEIRA v3 — Memória administrativa (obras, programas e gestões)
   As obras e programas pertencem à ADMINISTRAÇÃO PÚBLICA (Prefeitura de Mauá,
   Governo de SP, Governo Federal), não ao personagem. Este módulo:
   - carimba cada obra (M().obrasSys.instancias) com a administração executora,
     quem iniciou, em qual gestão, e um diário de eventos (início, atrasos,
     paralisações, retomadas, inauguração, abandono);
   - registra as gestões de cada administração (jogador ou NPC, início e fim);
   - corrige o crédito da inauguração: inaugura quem chefia a administração na
     hora (o jogador só leva a popularidade cheia se for ele; se ele iniciou e
     já saiu, leva metade);
   - continuidade: obras seguem avançando depois da troca de governante; uma
     nova gestão pode suspender para revisar contratos e um governo NPC pode
     retomar obra parada;
   - a aba de Obras/Mobilidade passa a mostrar só a administração atual; o
     resto fica no card "Memória administrativa" (nada é apagado).
   Dados: M().v3mem = { gestoes: [...], seq }  +  inst.mem em cada obra.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3MEM) return;
  var MEM = (window.V3MEM = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function agora() { return ok(function () { return agoraM(); }, 0); }
  function cid() { return ok(function () { return cargoAtualId(); }, "CIDADAO"); }
  function O() { return window.OBRAS; }

  var ADM = {
    PREF: { nome: "Prefeitura de Mauá", curto: "Mauá", cargo: "Prefeito(a) de Mauá" },
    GOV: { nome: "Governo do Estado de São Paulo", curto: "Estado de SP", cargo: "Governador(a) de SP" },
    PRES: { nome: "Governo Federal", curto: "União", cargo: "Presidente da República" }
  };
  MEM.ADM = ADM;
  var ORDEM = ["PREF", "GOV", "PRES"];

  /* ---------------------------------------------------------------- tempo */
  function mesAno(m) {
    var d = ok(function () { return dt(); }, null), a = agora(); if (!d) return { ano: "", mes: 1 };
    var tot = d.ano * 12 + ((d.mes || 1) - 1) - (a - m);
    return { ano: Math.floor(tot / 12), mes: (tot % 12 + 12) % 12 + 1 };
  }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function quando(m) { var x = mesAno(m); return MESES[x.mes - 1] + "/" + x.ano; }
  function ano(m) { return mesAno(m).ano; }

  /* ---------------------------------------------------------------- estado salvo */
  function st() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3mem) m.v3mem = { gestoes: [], seq: 0 };
    return m.v3mem;
  }
  function titular(adm) {
    if (cid() === adm) return ok(function () { return { jogador: true, id: "JOGADOR", nome: J().nome, partido: J().partido_atual }; }, null);
    var n = ok(function () {
      return bancoDeNPCs.find(function (x) {
        if (!x.vivo) return false;
        if (adm === "PREF") return x.cargo === "Prefeito de Mauá";
        if (adm === "GOV") return x.cargo === "Governador de SP" || (x.cargo === "Governador" && x.uf === "SP");
        return x.cargo === "Presidente da República" || x.cargo === "Presidente";
      });
    }, null);
    return n ? { jogador: false, id: n.id, nome: n.nome, partido: n.partidoBase || n.partido } : null;
  }
  function gestaoAtual(adm) {
    var s = st(); if (!s) return null;
    for (var i = s.gestoes.length - 1; i >= 0; i--) if (s.gestoes[i].adm === adm && s.gestoes[i].fim == null) return s.gestoes[i];
    return null;
  }
  MEM.gestaoAtual = gestaoAtual;
  // abre/fecha gestões quando o titular de uma administração muda
  function atualizarGestoes() {
    var s = st(); if (!s) return;
    ORDEM.forEach(function (adm) {
      var t = titular(adm), g = gestaoAtual(adm);
      var mesmo = g && t && g.tid === t.id;
      if (mesmo || (!t && !g)) return;
      if (g) g.fim = agora();
      if (t) {
        var nova = { id: "G" + (++s.seq), adm: adm, tid: t.id, nome: t.nome, partido: t.partido || "", jogador: t.jogador, ini: agora(), fim: null, primeira: !s.gestoes.some(function (x) { return x.adm === adm; }) };
        s.gestoes.push(nova);
        if (g) transicao(adm, g, nova);
      }
    });
  }
  MEM.atualizarGestoes = atualizarGestoes;

  /* ---------------------------------------------------------------- obras */
  function sys() { return ok(function () { return O().garantir(); }, null); }
  function insts() { var s = sys(); return s ? Object.keys(s.instancias).map(function (k) { return s.instancias[k]; }) : []; }
  function item(inst) { return ok(function () { return O().item(inst.catalogoId); }, null); }
  function ev(inst, txt) { inst.mem.ev = inst.mem.ev || []; inst.mem.ev.push({ m: agora(), t: txt }); if (inst.mem.ev.length > 40) inst.mem.ev.splice(0, inst.mem.ev.length - 40); }
  function carimbar(inst) {
    if (inst.mem) return inst.mem;
    var adm = inst.esferaExec || "PREF", seed = String(inst.id).indexOf("OM_") === 0;
    var g = gestaoAtual(adm), jog = !seed;
    var solic = inst.solicitanteCargo || adm, gs = gestaoAtual(solic);
    inst.mem = {
      adm: adm, gIni: g ? g.id : null, rede: seed,
      autor: seed ? "rede existente" : ok(function () { return J().nome; }, "Executivo"),
      autorJogador: jog, autorCargo: solic, gSol: gs ? gs.id : null,
      ultEstado: inst.estado, ev: []
    };
    if (!seed) ev(inst, (adm === solic ? "Iniciada" : "Pedida pelo " + (ADM[solic] ? ADM[solic].nome : solic)) + " por " + inst.mem.autor);
    else inst.mem.ev.push({ m: inst.mesInicio || agora(), t: "Parte da rede que a administração já mantinha" });
    return inst.mem;
  }
  var TXT_ESTADO = { "Em execução": "Obras em execução", "Atrasada": "Atrasou", "Paralisada": "Paralisada", "Em manutenção": "Concluída e entregue", "Abandonada": "Abandonada", "Recusada": "Pedido recusado", "Aprovada": "Aprovada", "Em negociação": "Em negociação" };
  function registrarEstados() {
    insts().forEach(function (inst) {
      var m = carimbar(inst);
      if (m.ultEstado === inst.estado) return;
      var t = titular(m.adm);
      if (inst.estado === "Em manutenção" && !m.rede) {
        m.gFim = (gestaoAtual(m.adm) || {}).id || null; m.mFim = agora();
        ev(inst, "Inaugurada por " + (inst.inauguradorNome || (t ? t.nome : "gestão")));
      } else ev(inst, (TXT_ESTADO[inst.estado] || inst.estado) + (t ? " (gestão " + t.nome + ")" : ""));
      if (inst.estado === "Abandonada" || inst.estado === "Recusada") m.mFim = agora();
      m.ultEstado = inst.estado;
    });
  }
  MEM.registrar = function () { atualizarGestoes(); registrarEstados(); carimbarProgramas(); };

  // nova gestão: pode suspender obras para revisar contratos (governo NPC)
  function transicao(adm, velha, nova) {
    insts().forEach(function (inst) {
      var m = carimbar(inst); if (m.adm !== adm) return;
      if (inst.estado === "Em execução" && !nova.jogador && Math.random() < 0.12) {
        inst.estado = "Paralisada"; m.ultEstado = inst.estado;
        ev(inst, "A nova gestão (" + nova.nome + ") suspende a obra para revisar contratos");
        ok(function () { manchete('Nova gestão de ' + ADM[adm].curto + ' suspende "' + item(inst).nome + '" para revisar contratos.', "obras"); });
      }
    });
  }
  // governo NPC retoma obras paradas da sua administração
  function continuidadeNPC() {
    insts().forEach(function (inst) {
      var m = carimbar(inst); if (m.adm === cid() || inst.estado !== "Paralisada") return;
      var t = titular(m.adm); if (!t || t.jogador) return;
      if (Math.random() < 0.05) { inst.estado = "Em execução"; m.ultEstado = inst.estado; ev(inst, "Retomada pela gestão " + t.nome); ok(function () { manchete('Gestão ' + t.nome + ' retoma "' + item(inst).nome + '".', "obras"); }); }
    });
  }

  /* ---------------------------------------------------------------- programas (PROG) */
  function progs() { return ok(function () { return Object.values(M().prog.lista); }, []); }
  function carimbarProgramas() {
    progs().forEach(function (p) {
      if (p.mem) return;
      var g = gestaoAtual(p.esf);
      p.mem = p.custom ? { autor: ok(function () { return J().nome; }, ""), autorJogador: true, m: agora(), gIni: g ? g.id : null } : { autor: "programa da administração", autorJogador: false, m: null, gIni: null };
    });
  }

  /* ---------------------------------------------------------------- ganchos no motor de obras */
  function instalar() {
    var OB = O(); if (!OB || OB.__v3mem) return !!(OB && OB.__v3mem);
    OB.__v3mem = true;
    // 1) tick mensal: gestões antes, eventos e continuidade depois
    var _tick = OB.tickMensal;
    OB.tickMensal = function () { atualizarGestoes(); insts().forEach(carimbar); var r = _tick.apply(this, arguments); try { continuidadeNPC(); MEM.registrar(); } catch (e) { console.warn("v3mem tick", e); } return r; };
    // 2) inauguração: crédito para quem chefia a administração naquele momento
    var _av = OB._avancarExecucao;
    OB._avancarExecucao = function (inst) {
      var antes = inst && inst.estado; OB._memCtx = inst;
      var r; try { r = _av.apply(this, arguments); } finally { OB._memCtx = null; }
      try {
        if (inst && antes !== "Em manutenção" && inst.estado === "Em manutenção") {
          var m = carimbar(inst), t = titular(m.adm);
          if (t) { inst.inauguradorNome = t.nome; inst.inauguradorId = t.jogador ? "JOGADOR" : t.id; }
        }
      } catch (e) {}
      return r;
    };
    // 3) popularidade: cheia para quem chefia a administração; metade para quem iniciou e já saiu
    var _pop = OB._popularidadeObra;
    OB._popularidadeObra = function (it, conclusao) {
      var inst = OB._memCtx, f = 1;
      if (inst) { var m = carimbar(inst); if (m.adm !== cid()) f = m.autorJogador ? 0.5 : 0; }
      if (f === 1) return _pop.apply(this, arguments);
      if (f === 0) return;
      var base = conclusao ? 1.2 : 0.25, vis = it.categoria === "Obra" ? 1.2 : 0.7, pol = it.polemica || 2;
      ok(function () { mudarAprovTodos(base * vis * (pol <= 1 ? 1.3 : pol >= 3 ? 0.4 : 1) * f); });
    };
    // 4) a aba de obras mostra só a administração atual (o resto fica na memória)
    var _ia = OB.instanciasAtivas;
    OB.instanciasAtivas = function () {
      var l = _ia.apply(this, arguments), c = OB._memFiltro; if (!c) return l;
      var gj = gestaoAtual(c);
      return l.filter(function (i) { var m = carimbar(i); return m.adm === c || (i.solicitanteCargo === c && (!gj || m.gSol === gj.id)); });
    };
    var _cc = OB._cardCatalogo;
    OB._cardCatalogo = function (mob) {
      MEM.registrar(); OB._memFiltro = ["PREF", "GOV", "PRES"].indexOf(cid()) >= 0 ? cid() : null;
      var h; try { h = _cc.apply(this, arguments); } finally { OB._memFiltro = null; }
      var c = cid(); if (ADM[c]) h = String(h).replace(/ — (Prefeito|Governador|Presidente)<\/b>/, " — " + ADM[c].nome + '</b> <small class="v3m-nota">gestão atual · realizações de outras administrações e gestões ficam na <b>Memória administrativa</b></small>');
      return h;
    };
    return true;
  }

  /* ---------------------------------------------------------------- tela */
  var ui = { adm: null, aberto: {} };
  function fmtR(n) { var v = (Number(n) || 0) / 1e6; return v >= 1000 ? "R$ " + (v / 1000).toFixed(1).replace(".", ",") + " bi" : "R$ " + Math.round(v).toLocaleString("pt-BR") + " mi"; }
  function grupoDe(inst) {
    var e = inst.estado;
    if (inst.mem && inst.mem.rede) return "rede";
    if (e === "Em manutenção") return "concluida";
    if (e === "Abandonada" || e === "Recusada") return "interrompida";
    if (e === "Paralisada") return "parada";
    if (e === "Em negociação" || e === "Aprovada") return "planejada";
    return "andamento";
  }
  function linhaObra(inst) {
    var it = item(inst) || { nome: inst.catalogoId, categoria: "" }, m = inst.mem || {}, g = grupoDe(inst), evs = (m.ev || []).slice(-4).reverse();
    var tag = { concluida: ["Concluída", "ok"], andamento: [inst.estado + " · " + Math.round(inst.progresso || 0) + "%", "and"], parada: ["Paralisada · " + Math.round(inst.progresso || 0) + "%", "par"], planejada: [inst.estado, "pla"], interrompida: [inst.estado, "int"] }[g] || [inst.estado, ""];
    return '<details class="v3m-obra"><summary><span class="v3m-t"><b>' + esc_(it.nome) + "</b><small>" + esc_(it.categoria || "") + (it.area ? " · " + esc_(it.area) : "") + " · iniciada por " + esc_(m.autor || "—") + (inst.mesInicio != null ? " em " + quando(inst.mesInicio) : "") + (g === "concluida" && inst.inauguradorNome ? " · inaugurada por " + esc_(inst.inauguradorNome) + (m.mFim != null ? " em " + quando(m.mFim) : "") : "") + '</small></span><em class="v3m-st ' + tag[1] + '">' + esc_(tag[0]) + "</em></summary>" +
      (g === "andamento" || g === "parada" ? '<div class="v3m-bar"><i style="width:' + Math.round(inst.progresso || 0) + '%"></i></div>' : "") +
      '<p class="v3m-meta">Investido: ' + fmtR(inst.custoPago) + " de " + fmtR(inst.custoTotal) + (inst.solicitanteCargo && inst.solicitanteCargo !== m.adm ? " · pedida pelo " + esc_((ADM[inst.solicitanteCargo] || {}).nome || inst.solicitanteCargo) : "") + "</p>" +
      (evs.length ? '<ul class="v3m-ev">' + evs.map(function (e) { return "<li><span>" + quando(e.m) + "</span>" + esc_(e.t) + "</li>"; }).join("") + "</ul>" : "") + "</details>";
  }
  function blocoAdm(adm) {
    var todas = insts().filter(function (i) { return carimbar(i).adm === adm; });
    var gr = { andamento: [], parada: [], planejada: [], concluida: [], interrompida: [], rede: [] };
    todas.forEach(function (i) { gr[grupoDe(i)].push(i); });
    var invest = todas.filter(function (i) { return !i.mem.rede; }).reduce(function (s, i) { return s + (i.custoPago || 0); }, 0);
    var gs = (st() || { gestoes: [] }).gestoes.filter(function (g) { return g.adm === adm; }).slice().reverse();
    var ps = progs().filter(function (p) { return p.esf === adm; });
    var proprios = ps.filter(function (p) { return p.custom; }), susp = ps.filter(function (p) { return !p.custom && !p.ativo; });
    var t = titular(adm);
    var h = '<div class="v3m-cab"><div><b>' + esc_(ADM[adm].nome) + "</b><small>" + (t ? (t.jogador ? "Você chefia esta administração" : "Hoje: " + esc_(t.nome) + (t.partido ? " (" + esc_(t.partido) + ")" : "")) : "Titular não identificado") + "</small></div></div>";
    h += '<div class="v3m-kpi"><div><b>' + gr.concluida.length + "</b><small>concluídas</small></div><div><b>" + (gr.andamento.length + gr.parada.length) + "</b><small>em andamento</small></div><div><b>" + gr.planejada.length + "</b><small>em aprovação</small></div><div><b>" + gr.interrompida.length + "</b><small>interrompidas</small></div><div><b>" + fmtR(invest) + "</b><small>investido em obras</small></div></div>";
    if (gs.length) h += "<h4>Gestões</h4><ul class='v3m-gest'>" + gs.map(function (g) {
      var ini = todas.filter(function (i) { return i.mem.gIni === g.id && !i.mem.rede; }).length, inau = todas.filter(function (i) { return i.mem.gFim === g.id; }).length;
      return "<li class='" + (g.jogador ? "eu" : "") + "'><span>" + (g.primeira ? "até " : ano(g.ini) + "–") + (g.fim == null ? "hoje" : ano(g.fim)) + "</span><b>" + esc_(g.jogador ? g.nome + " (você)" : g.nome) + "</b><small>" + ini + " obra" + (ini === 1 ? "" : "s") + " iniciada" + (ini === 1 ? "" : "s") + " · " + inau + " inaugurada" + (inau === 1 ? "" : "s") + "</small></li>";
    }).join("") + "</ul><p class='v3m-nota'>O registro de gestões começa quando a memória administrativa entrou no jogo.</p>";
    function lista(titulo, arr, aberto) { return arr.length ? "<h4>" + titulo + " <small>(" + arr.length + ")</small></h4>" + arr.sort(function (a, b) { return (b.mesInicio || 0) - (a.mesInicio || 0); }).map(linhaObra).join("") : ""; }
    h += lista("Em andamento", gr.andamento.concat(gr.parada)) + lista("Em aprovação ou negociação", gr.planejada) + lista("Concluídas", gr.concluida) + lista("Interrompidas ou canceladas", gr.interrompida);
    if (!todas.filter(function (i) { return !i.mem.rede; }).length) h += "<p class='v3m-nota'>Nenhuma obra registrada nesta administração ainda.</p>";
    h += "<h4>Programas <small>(" + ps.length + ")</small></h4>" + (proprios.length ? "<ul class='v3m-prog'>" + proprios.map(function (p) { return "<li><b>" + esc_(p.nome) + "</b> " + (p.ativo ? "<em class='v3m-st ok'>ativo</em>" : "<em class='v3m-st int'>suspenso</em>") + "<small>criado por " + esc_((p.mem || {}).autor || "—") + ((p.mem || {}).m != null ? " em " + quando(p.mem.m) : "") + " · " + esc_(p.foco || "") + "</small></li>"; }).join("") + "</ul>" : "") +
      "<p class='v3m-nota'>" + (ps.length - proprios.length) + " programas permanentes da administração" + (susp.length ? ", " + susp.length + " suspenso" + (susp.length > 1 ? "s" : "") + " hoje (" + susp.map(function (p) { return esc_(p.nome); }).join(", ") + ")" : "") + ".</p>";
    if (gr.rede.length) h += "<p class='v3m-nota'>Rede mantida pela administração: " + gr.rede.length + " contratos de manutenção.</p>";
    return h;
  }
  function trajetoria() {
    var minhas = insts().filter(function (i) { var m = carimbar(i); return m.autorJogador; });
    var porAdm = ORDEM.map(function (adm) {
      var l = minhas.filter(function (i) { return i.mem.adm === adm || i.mem.autorCargo === adm; });
      var inau = insts().filter(function (i) { return i.mem.adm === adm && i.inauguradorId === "JOGADOR"; });
      var pr = progs().filter(function (p) { return p.esf === adm && p.custom; });
      return { adm: adm, ini: l.length, conc: l.filter(function (i) { return grupoDe(i) === "concluida"; }).length, inau: inau.length, pr: pr.length };
    }).filter(function (x) { return x.ini || x.inau || x.pr; });
    if (!porAdm.length) return "";
    return "<h4>Na sua trajetória</h4><div class='v3m-traj'>" + porAdm.map(function (x) { return "<div><b>" + esc_(ADM[x.adm].nome) + "</b><small>" + x.ini + " obra" + (x.ini === 1 ? "" : "s") + " iniciada" + (x.ini === 1 ? "" : "s") + " (" + x.conc + " já concluída" + (x.conc === 1 ? "" : "s") + ") · " + x.inau + " inaugurada" + (x.inau === 1 ? "" : "s") + " por você · " + x.pr + " programa" + (x.pr === 1 ? "" : "s") + " criado" + (x.pr === 1 ? "" : "s") + "</small></div>"; }).join("") + "</div>";
  }
  function corpo() {
    var c = cid(); if (!ui.adm) ui.adm = ADM[c] ? c : "PREF";
    return '<div class="v3m-tabs">' + ORDEM.map(function (a) { return '<button type="button" data-v3m-adm="' + a + '" class="' + (ui.adm === a ? "on" : "") + '">' + esc_(ADM[a].nome.replace("Governo do Estado de São Paulo", "Governo de SP")) + (a === c ? " •" : "") + "</button>"; }).join("") + "</div>" + blocoAdm(ui.adm) + trajetoria();
  }
  function cardMemoria() {
    MEM.registrar();
    var txt = "<p class='txt'><small>Obras e programas pertencem à administração pública, não ao governante. Quando você troca de cargo, eles continuam existindo e avançando aqui, e voltam a aparecer na sua aba se você reassumir a administração.</small></p>";
    return typeof card === "function" ? card("Memória administrativa", txt + '<div class="v3m" data-v3m="1">' + corpo() + "</div>") : "";
  }
  MEM.card = cardMemoria;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3m-adm]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    ui.adm = b.getAttribute("data-v3m-adm");
    var box = document.querySelector('.v3m[data-v3m="1"]'); if (box) box.innerHTML = corpo();
  }, true);

  function instalarTela() {
    if (typeof VIEWS === "undefined" || typeof VIEWS.poder !== "function" || VIEWS.poder.__v3mem) return;
    var _vp = VIEWS.poder;
    var n = function () { var h = _vp.apply(this, arguments); try { if (String(h).indexOf('data-v3m="1"') < 0) h += cardMemoria(); } catch (e) { console.warn("v3mem card", e); } return h; };
    for (var k in _vp) { try { n[k] = _vp[k]; } catch (e) {} }
    n.__v3mem = true; VIEWS.poder = n;
  }
  function boot() { try { instalar(); instalarTela(); } catch (e) { console.warn("v3mem boot", e); } }
  boot();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  window.addEventListener("load", function () { setTimeout(boot, 50); });
  var tentativas = 0, t = setInterval(function () { boot(); if (++tentativas > 20) clearInterval(t); }, 500);
})();
