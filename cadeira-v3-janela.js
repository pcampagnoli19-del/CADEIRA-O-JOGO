/* =============================================================================
   CADEIRA v3 — Deadline Day da janela partidária (estilo mercado da bola)
   - Mostra só as trocas da janela do ano (antes acumulava janelas antigas e
     exibia sempre as mais velhas), da mais recente para a mais antiga.
   - Motivo de cada troca montado a partir dos dados do político e dos dois
     partidos (ideologia, fundo eleitoral, cargo que pretende disputar, briga
     com a direção, base regional...), em vez de um texto fixo para todos.
   - Balanço por partido calculado só com a janela do ano. Passar o mouse num
     partido mostra quem entrou e quem saiu; tocar abre a janela do partido
     com entradas, saídas, saldo por Casa, maior reforço e maior perda.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3JANELA) return;
  var JN = (window.V3JANELA = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pj(a) { return esc_(JSON.stringify(a)); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function P(p) { return ok(function () { return PARTIDOS[p]; }, null) || {}; }
  function npc(t) { return ok(function () { return bancoDeNPCs.find(function (x) { return x && (x.id === t.npcId || x.nome === t.nome); }); }, null); }
  function de(t) { return t.dePartido || t.de || t.origem || ""; }
  function para(t) { return t.paraPartido || t.para || t.destino || ""; }
  var ESP = { E: "esquerda", D: "direita", C: "centro" };
  var GENERICOS = /^Alinhamento program[aá]tico e estrutura eleitoral$/i;

  /* ---------------- motivo contextual (determinístico por pessoa e ano) */
  function motivo(t) {
    var n = npc(t) || {}, a = de(t), b = para(t), pa = P(a), pb = P(b), h = hash(t.nome + t.ano + b), L = [];
    var cargo = n.cargo || t.cargo || "", fa = pa.fundo || 0, fb = pb.fundo || 0;
    if (pa.e && pb.e && pa.e !== pb.e) L.push("Afastado do " + a + " nas votações recentes, migra para um campo mais à " + (ESP[pb.e] || "centro") + ", onde se sente representado(a).", "Deixa o " + a + " em rota de colisão com a bancada e encontra no " + b + " afinidade com as pautas que defende.");
    if (fb > fa * 1.4 && fb > 0) L.push("Vai atrás de estrutura: o " + b + " tem fundo eleitoral bem maior que o do " + a + " e prometeu prioridade na campanha.", "Troca o " + a + " pelo " + b + " de olho no tempo de TV e na fatia maior do fundo eleitoral.");
    if (fa > fb * 1.4) L.push("Abre mão da estrutura do " + a + " em troca de protagonismo: no " + b + " deve ser cabeça de chapa na sua região.");
    if (/Deputado Estadual|Vereador/.test(cargo)) L.push("Quer subir de cargo em outubro e o " + b + " ofereceu legenda para a disputa.", "O " + b + " garantiu espaço na nominata e apoio dos prefeitos da sua base.");
    if (/Deputado Federal/.test(cargo)) L.push("Busca uma nominata mais favorável: no " + b + " a conta do quociente fica mais confortável.", "Leva a base eleitoral para o " + b + " após convite direto da presidência nacional do partido.");
    if (/Senador/.test(cargo)) L.push("Prepara voo para o governo do estado e precisava de um partido que bancasse a candidatura.");
    if ((n.lealdade_base || 50) < 35) L.push("Rompeu com a direção do " + a + " depois de perder o controle do diretório estadual.", "Saída barulhenta: acusou a cúpula do " + a + " de traição na divisão de recursos.");
    if ((n.relacao_com_jogador || 0) > 40) L.push("Aliado próximo do seu grupo, a mudança redesenha as alianças para a eleição.");
    L.push("Saída negociada: o " + a + " liberou o mandato sem briga e o " + b + " recebe um nome com voto próprio.", "Convite pessoal da presidência do " + b + ", com promessa de autonomia regional e cargo na executiva.", "Disputa por espaço no " + a + " ficou insustentável; no " + b + " chega sem concorrência interna.");
    return L[h % L.length];
  }
  function anoJanela() { var d = ok(function () { return dt(); }, { ano: 2026, mes: 5 }); return d.ano; }
  function trocas(ano) {
    var l = ok(function () { return M().janelaTransferencias; }, []) || [];
    var vistos = {};
    return l.filter(function (t) { return t && t.ano === ano; }).map(function (t) { if (!t.motivo || GENERICOS.test(t.motivo)) t.motivo = motivo(t); return t; })
      .sort(function (x, y) { return (y.mes || 0) - (x.mes || 0); })
      .filter(function (t) { var k = t.nome + "|" + de(t) + "|" + para(t); if (vistos[k]) return false; vistos[k] = 1; return true; });
  }
  JN.trocas = trocas;
  function balanco(lista) {
    var b = {};
    lista.forEach(function (t) { var x = de(t), y = para(t); (b[x] = b[x] || { ent: [], sai: [] }).sai.push(t); (b[y] = b[y] || { ent: [], sai: [] }).ent.push(t); });
    return b;
  }
  function logo(p, s) { return ok(function () { return renderLogoPartido(p, s || 18); }, ""); }
  function badge(p) { return ok(function () { return window.badgePartido(p, "mini"); }, esc_(p)); }
  function foto(t, w, h) { var n = npc(t); return ok(function () { return window.fotoTag({ nome: t.nome, foto: t.foto || (n && obterFotoPolitico(n)) || "" }, w, h); }, ""); }
  function casa(c) { c = c || ""; return /Senador/.test(c) ? "Senado" : /Deputado Federal/.test(c) ? "Câmara dos Deputados" : /Deputado Estadual/.test(c) ? "Alesp e Assembleias" : /Vereador/.test(c) ? "Câmaras Municipais" : "Outros"; }

  function cardTroca(t, foco) {
    var x = de(t), y = para(t), sentido = foco ? (y === foco ? "chega" : "sai") : "";
    return '<div class="jn-card ' + sentido + '"><div class="jn-foto">' + foto(t, 46, 58) + '</div><div class="jn-info"><div class="jn-l1"><span><b>' + esc_(t.nome) + "</b><small>" + esc_(t.cargo || (npc(t) || {}).cargo || "Parlamentar") + (t.mes ? " · " + ok(function () { return MESES[t.mes].slice(0, 3); }, "") : "") + '</small></span><span class="jn-seta">' + badge(x) + "<i>➜</i>" + badge(y) + "</span></div><p>" + esc_(t.motivo) + "</p></div></div>";
  }

  /* ---------------- tela principal e tela do partido */
  JN.modal = function () {
    var ano = anoJanela(), lista = trocas(ano), bal = balanco(lista), foco = ok(function () { return S.janelaPartido; }, null);
    if (!lista.length) ok(function () { if (typeof processarJanelaPartidariaDinamica === "function" && !(M().janelaTransferencias || []).length) processarJanelaPartidariaDinamica(); });
    var h = '<div class="modal"><div class="mbox jn-box"><div class="jn-top"><span class="jn-raio">⚡</span><div><h2>DEADLINE DAY: Fim da Janela Partidária</h2><small>Janela de ' + ano + " · encerramento do prazo de troca de partido sem perda de mandato</small></div></div>";
    if (foco && bal[foco]) {
      var b = bal[foco], saldo = b.ent.length - b.sai.length, porCasa = {};
      b.ent.forEach(function (t) { var c = casa(t.cargo); (porCasa[c] = porCasa[c] || [0, 0])[0]++; });
      b.sai.forEach(function (t) { var c = casa(t.cargo); (porCasa[c] = porCasa[c] || [0, 0])[1]++; });
      var peso = function (t) { var n = npc(t) || {}; return (n.popularidade || 0) + (n.base_votos || 0) / 20000 + (/Senador/.test(t.cargo) ? 30 : /Federal/.test(t.cargo) ? 15 : 0); };
      var reforco = b.ent.slice().sort(function (x, y) { return peso(y) - peso(x); })[0], perda = b.sai.slice().sort(function (x, y) { return peso(y) - peso(x); })[0];
      var pp = P(foco);
      h += '<div class="jn-part"><button type="button" class="b mini" data-a="janelaVerPartido" data-p="' + pj([null]) + '">‹ Voltar ao balanço</button><div class="jn-ph">' + logo(foco, 34) + "<div><h3>" + esc_(foco) + '</h3><small>' + esc_(pp.nome || "") + (pp.e ? " · " + ESP[pp.e] : "") + '</small></div><b class="jn-saldo ' + (saldo > 0 ? "pos" : saldo < 0 ? "neg" : "") + '">' + (saldo > 0 ? "+" : "") + saldo + "</b></div>" +
        '<div class="jn-res"><div><small>Entraram</small><b class="pos">' + b.ent.length + '</b></div><div><small>Saíram</small><b class="neg">' + b.sai.length + "</b></div>" + Object.keys(porCasa).map(function (c) { var v = porCasa[c]; return "<div><small>" + esc_(c) + "</small><b>" + (v[0] - v[1] > 0 ? "+" : "") + (v[0] - v[1]) + "</b><em>+" + v[0] + " / −" + v[1] + "</em></div>"; }).join("") + "</div>" +
        (reforco || perda ? '<div class="jn-dest">' + (reforco ? "<div><small>⭐ Maior reforço</small><b>" + esc_(reforco.nome) + "</b><em>vem do " + esc_(de(reforco)) + "</em></div>" : "") + (perda ? "<div><small>💔 Maior perda</small><b>" + esc_(perda.nome) + "</b><em>vai para o " + esc_(para(perda)) + "</em></div>" : "") + "</div>" : "") +
        '<h4 class="jn-h4 pos">Chegadas (' + b.ent.length + ')</h4><div class="jn-lista">' + (b.ent.map(function (t) { return cardTroca(t, foco); }).join("") || "<p class='txt'>Ninguém chegou.</p>") + "</div>" +
        '<h4 class="jn-h4 neg">Saídas (' + b.sai.length + ')</h4><div class="jn-lista">' + (b.sai.map(function (t) { return cardTroca(t, foco); }).join("") || "<p class='txt'>Ninguém saiu.</p>") + "</div></div>";
    } else {
      var ord = Object.keys(bal).sort(function (x, y) { var a = bal[x], c = bal[y]; return (c.ent.length - c.sai.length) - (a.ent.length - a.sai.length) || (c.ent.length + c.sai.length) - (a.ent.length + a.sai.length); });
      h += '<h4 class="jn-h4">Balanço final de bancadas <small>(passe o mouse para ver quem entrou e saiu; toque para abrir o partido)</small></h4><div class="jn-bal">' + (ord.map(function (p) {
        var b = bal[p], s = b.ent.length - b.sai.length;
        var tip = '<span class="jn-tip"><b>' + esc_(p) + "</b>" + (b.ent.length ? '<em class="pos">Entraram</em>' + b.ent.slice(0, 6).map(function (t) { return "<i>+ " + esc_(t.nome) + " <small>(" + esc_(de(t)) + ")</small></i>"; }).join("") + (b.ent.length > 6 ? "<i>… e mais " + (b.ent.length - 6) + "</i>" : "") : "") + (b.sai.length ? '<em class="neg">Saíram</em>' + b.sai.slice(0, 6).map(function (t) { return "<i>− " + esc_(t.nome) + " <small>(→ " + esc_(para(t)) + ")</small></i>"; }).join("") + (b.sai.length > 6 ? "<i>… e mais " + (b.sai.length - 6) + "</i>" : "") : "") + "</span>";
        return '<button type="button" class="jn-chip" data-a="janelaVerPartido" data-p="' + pj([p]) + '"><span class="jn-cn">' + logo(p) + "<b>" + esc_(p) + '</b></span><b class="jn-s ' + (s > 0 ? "pos" : s < 0 ? "neg" : "") + '">' + (s > 0 ? "+" : "") + s + '</b><small class="jn-es">+' + b.ent.length + " / −" + b.sai.length + "</small>" + tip + "</button>";
      }).join("") || "<small>Sem movimentações nesta janela.</small>") + "</div>" +
        '<h4 class="jn-h4">Transferências homologadas (' + lista.length + ')</h4><div class="jn-lista">' + (lista.map(function (t) { return cardTroca(t); }).join("") || "<p class='txt'>Nenhum parlamentar trocou de partido nesta janela.</p>") + "</div>";
    }
    h += '<div class="stack" style="margin-top:14px">' + ok(function () { return btn("Concluir e fechar cobertura da janela", "janelaFecharModal", [], "confirma grande"); }, "") + "</div></div></div>";
    return h;
  };
  // dica (quem entrou e saiu) presa na tela, sem ser cortada pela borda da janela
  document.addEventListener("mouseover", function (e) {
    var c = e.target.closest && e.target.closest(".jn-chip"); if (!c) return;
    var t = c.querySelector(".jn-tip"); if (!t) return;
    var r = c.getBoundingClientRect(), w = 236;
    t.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
    t.style.top = (r.bottom + 6) + "px"; t.style.bottom = "auto";
    requestAnimationFrame(function () { var h = t.offsetHeight; if (r.bottom + 6 + h > window.innerHeight - 8) { t.style.top = Math.max(8, r.top - h - 6) + "px"; } });
  });
  function instalar() {
    if (typeof window.modalDeadlineJanela === "function" && !window.modalDeadlineJanela.__v3jn) {
      var f = function () { try { return JN.modal(); } catch (e) { console.warn("janela", e); return ""; } };
      f.__v3jn = true; window.modalDeadlineJanela = f; try { modalDeadlineJanela = f; } catch (e2) {}
    }
    ok(function () {
      if (!A.janelaVerPartido) A.janelaVerPartido = function (p) { S.janelaPartido = p || null; render(); var b = document.querySelector(".jn-box"); if (b) b.scrollTop = 0; };
      if (A.janelaFecharModal && !A.janelaFecharModal.__v3jn) { var o = A.janelaFecharModal; A.janelaFecharModal = function () { S.janelaPartido = null; return o.apply(this, arguments); }; A.janelaFecharModal.__v3jn = true; }
    });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 150); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
