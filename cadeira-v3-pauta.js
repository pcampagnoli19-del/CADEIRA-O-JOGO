/* =============================================================================
   CADEIRA v3 — Pauta do mês no Legislativo
   Antes: todo mês abria o plenário animado (bolinhas de cada parlamentar)
   para UM projeto. Agora:
   - Mês comum: painel simples "Pauta do mês" com até 3 projetos votados em
     sequência (acabou um, começa o outro). O jogador vota Sim, Não ou se
     abstém; o placar sai na hora, com a mesma lógica do jogo (votos dos NPCs,
     orientação do governo, efeitos e arquivo). Quem quiser pode abrir o
     plenário animado de qualquer projeto pelo botão.
   - Votações importantes: no máximo 3 por ano (abril, agosto e novembro), o
     plenário animado abre como antes, com destaque.
   Estado da sessão em S.pautaMes; contador anual em M().v3pauta.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3PAUTA) return;
  var PM = (window.V3PAUTA = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  var MESES_IMPORTANTES = { 4: 1, 8: 1, 11: 1 };
  var POR_MES = 3;
  function D() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function st() { var m = ok(function () { return M(); }, null); if (!m) return null; var d = D(); if (!m.v3pauta || m.v3pauta.ano !== d.ano) m.v3pauta = { ano: d.ano, animadas: [] }; return m.v3pauta; }
  // votação importante deste mês? (no máximo 3 no ano)
  PM.importante = function () {
    var s = st(), d = D(); if (!s) return true;
    if (!MESES_IMPORTANTES[d.mes] || s.animadas.length >= 3 || s.animadas.indexOf(d.mes) >= 0) return false;
    s.animadas.push(d.mes); return true;
  };
  var CASA = { M: "Câmara Municipal de Mauá", E: "Assembleia Legislativa de SP", F: "Câmara dos Deputados", C: "Câmara dos Deputados", S: "Senado Federal" };
  PM.abrir = function () {
    if (!ok(function () { return ehLegislador() && !preso(); }, false)) return;
    S.pautaMes = { itens: [], fim: false, casa: CASA[ok(function () { return casaLegCod(); }, "F")] || "Plenário" };
    proximo();
    S.modal = { tipo: "pauta_mes" };
    ok(function () { render(); });
  };
  // carrega o próximo projeto pela mesma porta do plenário (respeita prioridade dos PLs do jogador)
  function proximo() {
    var P = S.pautaMes; if (!P) return;
    if (P.itens.length >= POR_MES) { P.fim = true; return; }
    var antes = S.modal;
    ok(function () { window.iniciarSessaoLegislativa(0, true); });
    var sl = S.sessaoLeg;
    S.modal = antes && antes.tipo === "pauta_mes" ? antes : { tipo: "pauta_mes" };
    if (!sl || !sl.materia || sl.concluida) { P.fim = true; return; }
    if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
    var m = sl.materia;
    P.itens.push({ nome: m.nome, tipo: m.tipo || "PL", descr: m.descr || "", tema: m.tema || "", gov: m.gov, meu: !!m.doJogador, res: null, voto: null });
  }
  function votar(v) {
    var P = S.pautaMes, sl = S.sessaoLeg; if (!P || !sl || sl.concluida) return;
    var it = P.itens[P.itens.length - 1]; if (!it || it.res) return;
    ok(function () { A.sessaoRapida(); });
    ok(function () { A.sessaoVotar(v); });
    if (window._sessaoLegTimer) clearInterval(window._sessaoLegTimer);
    sl = S.sessaoLeg;
    if (sl && !sl.concluida) ok(function () { A.sessaoRapida(); });
    var r = S.sessaoLeg && S.sessaoLeg.resultado;
    it.voto = v; it.res = r ? { ok: r.ok, sim: r.votosSim, nao: r.votosNao, abst: r.votosAbst, pct: r.sim } : { ok: false, sim: 0, nao: 0, abst: 0, pct: 0 };
    S.modal = { tipo: "pauta_mes" };
  }
  function plenario() {
    // abre o plenário animado do projeto da vez (opcional)
    var sl = S.sessaoLeg; if (!sl || sl.concluida) return;
    S.pautaVoltar = true; S.modal = { tipo: "sessao_leg" };
  }
  var GOVTXT = function (g) { return g === 1 || g === true ? "governo orienta SIM" : g === -1 ? "governo orienta NÃO" : g === 0 ? "governo libera a bancada" : ""; };
  function html() {
    var P = S.pautaMes; if (!P) return "";
    var atual = P.itens[P.itens.length - 1], d = D();
    var h = '<div class="modal"><div class="mbox pm-box"><div class="pm-top"><span>🏛️</span><div><h2>Pauta do mês</h2><small>' + esc_(P.casa) + " · " + ok(function () { return MESES[d.mes]; }, "") + " de " + d.ano + " · até " + POR_MES + " projetos, um depois do outro</small></div></div>";
    h += '<ol class="pm-lista">' + P.itens.map(function (it, i) {
      var vez = !it.res && i === P.itens.length - 1;
      return '<li class="' + (it.res ? (it.res.ok ? "apr" : "rej") : vez ? "vez" : "") + '"><div class="pm-h"><span class="pm-tipo">' + esc_(it.tipo) + "</span><b>" + esc_(it.nome) + "</b>" + (it.meu ? '<span class="pm-meu">seu projeto</span>' : "") + "</div>" +
        (it.descr ? "<p>" + esc_(it.descr) + "</p>" : "") + '<small class="pm-meta">' + esc_([it.tema, GOVTXT(it.gov)].filter(Boolean).join(" · ")) + "</small>" +
        (it.res ? '<div class="pm-res"><b>' + (it.res.ok ? "APROVADO" : "REJEITADO") + "</b><span>" + it.res.sim + " sim · " + it.res.nao + " não · " + it.res.abst + " abst.</span><em>seu voto: " + ({ S: "Sim", N: "Não", A: "Abstenção" }[it.voto] || "—") + "</em></div>" :
          vez ? '<div class="pm-bts"><button type="button" class="b confirma" data-pm="S">Sim</button><button type="button" class="b" data-pm="N">Não</button><button type="button" class="b branco" data-pm="A">Abster</button><button type="button" class="b mini branco" data-pm="plen">Ver no plenário</button></div>' : "") + "</li>";
    }).join("") + "</ol>";
    var podeMais = atual && atual.res && !P.fim && P.itens.length < POR_MES;
    if (podeMais) h += '<button type="button" class="b confirma grande" data-pm="prox">Próximo projeto da pauta (' + (P.itens.length + 1) + "/" + POR_MES + ")</button>";
    if (P.fim || (atual && atual.res && P.itens.length >= POR_MES)) h += '<p class="txt">Pauta do mês encerrada. Votações importantes abrem o plenário completo em abril, agosto e novembro.</p>';
    h += '<div class="pm-rod"><button type="button" class="b branco" data-pm="sair">' + (atual && !atual.res ? "Sair sem votar (falta registrada)" : "Encerrar sessão") + "</button></div></div></div>";
    return h;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-pm]"); if (!b || !S.pautaMes) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.getAttribute("data-pm");
    if (k === "S" || k === "N" || k === "A") votar(k);
    else if (k === "prox") proximo();
    else if (k === "plen") { plenario(); }
    else if (k === "sair") { var atual = S.pautaMes.itens[S.pautaMes.itens.length - 1]; if (atual && !atual.res) votar("A"); S.pautaMes = null; S.modal = null; }
    ok(function () { render(); });
  }, true);
  function instalar() {
    if (typeof window.modais === "function" && !window.modais.__v3pm) {
      var o = window.modais;
      var n = function () { if (S.modal && S.modal.tipo === "pauta_mes") return html(); return o.apply(this, arguments); };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3pm = true; window.modais = n; try { modais = n; } catch (e2) {}
    }
    // ao fechar o plenário aberto a partir da pauta, volta para a pauta
    ok(function () {
      if (A.sessaoFechar && !A.sessaoFechar.__v3pm) {
        var f = A.sessaoFechar;
        A.sessaoFechar = function () { var r = f.apply(this, arguments); if (S.pautaVoltar && S.pautaMes) { S.pautaVoltar = false; var it = S.pautaMes.itens[S.pautaMes.itens.length - 1], sl = S.sessaoLeg; if (it && !it.res && sl && sl.concluida && sl.resultado) { var rr = sl.resultado; it.voto = sl.votoJogador; it.res = { ok: rr.ok, sim: rr.votosSim, nao: rr.votosNao, abst: rr.votosAbst, pct: rr.sim }; } S.modal = { tipo: "pauta_mes" }; try { render(); } catch (e) {} } return r; };
        A.sessaoFechar.__v3pm = true;
      }
    });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 200); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
