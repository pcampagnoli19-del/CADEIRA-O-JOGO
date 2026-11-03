/* =============================================================================
   CADEIRA v3 — Pré-candidaturas: a corrida dentro dos partidos
   Durante o ciclo inteiro (não só no ano da eleição), cada partido tem nomes
   disputando a indicação para Presidente, Governador, Senador e Prefeito.
   A FORÇA de cada nome muda todo mês: aprovação, cargo, bastidores (apoio do
   cacique, evento com prefeitos, pesquisa interna, polêmica, investigação),
   entradas e desistências. Os lances mais fortes viram manchete.
   No ano da eleição, os grupos das prévias (M().previas.atual) são montados a
   partir dessa corrida e a força acumulada pesa no resultado.
   Estado salvo em M().v3pre.
   ============================================================================= */
(function () {
  "use strict";
  if (window.PRE3) return;
  var PRE = (window.PRE3 = {});

  var CARGOS = ["PRES", "GOV", "SEN", "PREF"];
  var NOME = { PRES: "Presidente da República", GOV: "Governador de SP", SEN: "Senador da República", PREF: "Prefeito de Mauá" };
  var CURTO = { PRES: "Presidente", GOV: "Governador", SEN: "Senador", PREF: "Prefeito" };
  var DISPUTAR = { PRES: "a Presidência", GOV: "o governo de SP", SEN: "o Senado", PREF: "a prefeitura de Mauá" };
  var PELA = { PRES: "pela Presidência", GOV: "pelo governo de SP", SEN: "pelo Senado", PREF: "pela prefeitura de Mauá" };
  var TITULAR = { PRES: "Presidente da República", GOV: "Governador de SP", PREF: "Prefeito de Mauá" };

  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pj(a) { return esc_(JSON.stringify(a)); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) * 1.4; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function dataJ() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function mesIdx(a, m) { return a * 12 + m - 1; }
  function nomeMes(m) { return ok(function () { return MESES[m]; }, String(m)); }
  function partOf(n) { return n.partidoBase || n.partido || "?"; }
  function niv(n) { return ok(function () { return CARGO_NIVEL[n.cargo]; }, 2) || 2; }
  function fundo(p) { return ok(function () { return PARTIDOS[p].fundo; }, 0) || 0; }
  function manchete_(t) { try { manchete(t, "pre"); } catch (e) {} }
  function toast_(m, t) { try { toast(m, t || "ok"); } catch (e) {} }

  function alvoAno(c, d) {
    var resto = c === "PREF" ? 0 : 2;
    var a = d.ano;
    while (a % 4 !== resto) a++;
    if (a === d.ano && d.mes > 8) a += 4; // prévias deste ano já passaram
    return a;
  }
  function elegivel(c, n) {
    if (!n || !n.vivo || n.jogador || n.inelegivel || n.status_judicial === "CONDENADO") return false;
    var p = partOf(n); if (!p || p === "Sem Partido" || p === "?") return false;
    if (c === "PRES") return niv(n) >= 5 && n.idade <= 78 && n.cargo !== "Vice-Presidente";
    if (c === "GOV" || c === "SEN") return n.uf === "SP" && niv(n) >= 3 && n.idade <= 76;
    if (c === "PREF") return n.municipio_domicilio === "Mauá" && n.idade >= 25 && n.idade <= 80;
    return false;
  }
  function base(c, n) {
    var inc = TITULAR[c] && n.cargo === TITULAR[c];
    return clamp((n.popularidade || 30) * 0.9 + niv(n) * 2.5 + ((n.carisma || 50) - 50) / 6 + (n.ambicao_alta ? 6 : 0) + (inc ? 12 : 0) + fundo(partOf(n)) * 0.2, 5, 95);
  }
  function estado() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3pre || m.v3pre.v !== 1) m.v3pre = { v: 1, corridas: {}, ultimoTick: null, acoesMes: {} };
    return m.v3pre;
  }
  function chave(c, ano) { return c + "-" + ano; }

  /* ---------------------------------------------------------------- jogador */
  function jogadorNa(c) {
    var j = ok(function () { return J(); }, null); if (!j) return false;
    var alvo = ok(function () { return cargoIdPorNome(j.campanha.cargo_alvo); }, null);
    return alvo === c && j.partido_atual && j.partido_atual !== "Sem Partido";
  }
  function baseJ() {
    var j = J(), a = j.atributos || {};
    return clamp(j.popularidade * 0.9 + (ok(function () { return CARGO_NIVEL[j.cargo_atual]; }, 2) || 2) * 2.5 + (a.influencia || 30) / 8 + (j.relacao_partido || 0) / 6 + ((a.carisma || 50) - 50) / 6 + (j.padrinho_id ? 5 : 0), 5, 95);
  }

  /* ---------------------------------------------------------------- corrida */
  function novaCorrida(c, ano) {
    var cor = { c: c, ano: ano, partidos: {}, inicio: mesIdx(dataJ().ano, dataJ().mes), formada: false };
    var por = {};
    ok(function () { return bancoDeNPCs; }, []).forEach(function (n) { if (elegivel(c, n)) (por[partOf(n)] = por[partOf(n)] || []).push(n); });
    Object.keys(por).forEach(function (p) {
      var l = por[p].map(function (n) { return { n: n, b: base(c, n) }; }).sort(function (a, b) { return b.b - a.b; }).slice(0, 5);
      cor.partidos[p] = { nomes: l.map(function (x) { return { id: x.n.id, f: Math.round(x.b), h: [Math.round(x.b)], fato: "", pop: x.n.popularidade || 30, cargo: x.n.cargo, baixo: 0 }; }), saiu: [] };
    });
    return cor;
  }
  function corrida(c) {
    var st = estado(); if (!st) return null;
    var ano = alvoAno(c, dataJ()), k = chave(c, ano);
    if (!st.corridas[k]) st.corridas[k] = novaCorrida(c, ano);
    return st.corridas[k];
  }
  function share(lista) {
    var w = lista.map(function (x) { return Math.exp(x.f / 11); }), t = w.reduce(function (a, b) { return a + b; }, 0) || 1;
    return w.map(function (v) { return Math.round(v / t * 1000) / 10; });
  }
  function nomeDe(id) { if (id === "JOGADOR") return ok(function () { return J().nome; }, "Você"); var n = ok(function () { return npcPorId(id); }, null); return n ? n.nome : "?"; }

  var FATOS = [
    { t: "ganha o apoio do cacique do partido", d: 7, peso: 2 },
    { t: "reúne prefeitos e vereadores num evento lotado", d: 4, peso: 3 },
    { t: "aparece na frente em pesquisa interna", d: 5, peso: 3 },
    { t: "fecha acordo com a bancada evangélica", d: 4, peso: 1 },
    { t: "fecha acordo com a bancada do agro", d: 4, peso: 1 },
    { t: "é aclamado(a) em encontro estadual da sigla", d: 5, peso: 2 },
    { t: "viraliza com discurso no plenário", d: 4, peso: 2 },
    { t: "se desgasta com uma declaração polêmica", d: -5, peso: 3 },
    { t: "vira alvo de investigação", d: -7, peso: 1 },
    { t: "briga com a direção do partido", d: -6, peso: 2 },
    { t: "perde um aliado importante para o rival interno", d: -4, peso: 2 },
    { t: "some do noticiário e esfria", d: -3, peso: 3 }
  ];
  function sorteiaFato() {
    var tot = FATOS.reduce(function (s, f) { return s + f.peso; }, 0), r = Math.random() * tot;
    for (var i = 0; i < FATOS.length; i++) { r -= FATOS[i].peso; if (r <= 0) return FATOS[i]; }
    return FATOS[0];
  }

  function tickCorrida(cor, destaques) {
    var c = cor.c, d = dataJ();
    var mesesAte = mesIdx(cor.ano, 8) - mesIdx(d.ano, d.mes);
    var vistos = {};
    Object.keys(cor.partidos).forEach(function (p) { cor.partidos[p].nomes.forEach(function (x) { vistos[x.id] = p; }); });
    // atualiza quem já está
    Object.keys(cor.partidos).forEach(function (p) {
      var g = cor.partidos[p];
      g.nomes = g.nomes.filter(function (x) {
        if (x.id === "JOGADOR") return jogadorNa(c) && ok(function () { return J().partido_atual; }, "") === p;
        var n = ok(function () { return npcPorId(x.id); }, null);
        if (!n || !n.vivo || n.inelegivel || n.status_judicial === "CONDENADO") { g.saiu.push({ id: x.id, motivo: "saiu do páreo" }); return false; }
        if (partOf(n) !== p) { g.saiu.push({ id: x.id, motivo: "trocou de partido" }); return false; }
        return true;
      });
      g.nomes.forEach(function (x) {
        var alvoBase, dp = 0;
        if (x.id === "JOGADOR") { alvoBase = baseJ(); }
        else {
          var n = npcPorId(x.id);
          alvoBase = base(c, n);
          dp = ((n.popularidade || 30) - (x.pop || 30)) * 1.2;
          if (n.cargo !== x.cargo) dp += (niv(n) > (CARGO_NIVEL[x.cargo] || 2)) ? 6 : -5;
          x.pop = n.popularidade || 30; x.cargo = n.cargo;
        }
        var df = 0.12 * (alvoBase - x.f) + dp + gauss() * 1.6;
        if (x.id !== "JOGADOR" && Math.random() < 0.11) {
          var ft = sorteiaFato();
          df += ft.d; x.fato = ft.t; x.fatoMes = mesIdx(d.ano, d.mes);
          destaques.push({ c: c, p: p, x: x, ft: ft });
        }
        x.f = Math.round(clamp(x.f + df, 1, 99) * 10) / 10;
        x.h.push(Math.round(x.f)); if (x.h.length > 12) x.h.shift();
      });
      // desistência antes do ano da eleição: nome sem chance há meses
      if (mesesAte > 4 && g.nomes.length > 2) {
        var sh = share(g.nomes);
        g.nomes.forEach(function (x, i) { x.baixo = sh[i] < 7 ? (x.baixo || 0) + 1 : 0; });
        var fraco = g.nomes.filter(function (x) { return x.id !== "JOGADOR" && x.baixo >= 6; })[0];
        if (fraco && Math.random() < 0.35) {
          var lider = g.nomes.slice().sort(function (a, b) { return b.f - a.f; })[0];
          g.nomes = g.nomes.filter(function (x) { return x !== fraco; });
          g.saiu.push({ id: fraco.id, motivo: "desistiu e apoia " + nomeDe(lider.id) });
          lider.f = clamp(lider.f + 2, 1, 99);
          if (c !== "PREF" && fundo(p) >= 6) destaques.push({ c: c, p: p, x: fraco, ft: { t: "desiste da pré-candidatura e passa a apoiar " + nomeDe(lider.id), d: 0 }, desist: true });
        }
      }
    });
    // novos nomes que despontam (cargo novo, popularidade em alta)
    if (Math.random() < 0.35) {
      var novos = ok(function () { return bancoDeNPCs; }, []).filter(function (n) { return elegivel(c, n) && !vistos[n.id] && (n.ambicao_alta || (n.popularidade || 0) >= 45); });
      if (novos.length) {
        var n = pick(novos), p = partOf(n);
        cor.partidos[p] = cor.partidos[p] || { nomes: [], saiu: [] };
        if (cor.partidos[p].nomes.length < 5) {
          var x = { id: n.id, f: Math.round(base(c, n) * 0.8), h: [], fato: "se lança como pré-candidato(a)", pop: n.popularidade || 30, cargo: n.cargo, baixo: 0, fatoMes: mesIdx(d.ano, d.mes) };
          x.h.push(Math.round(x.f));
          cor.partidos[p].nomes.push(x);
          if (fundo(p) >= 6) destaques.push({ c: c, p: p, x: x, ft: { t: "se lança como pré-candidato(a)", d: 0 }, novo: true });
        }
      }
    }
    // o jogador entra quando o cargo-alvo bate
    var pj_ = ok(function () { return J().partido_atual; }, "");
    if (jogadorNa(c) && pj_) {
      cor.partidos[pj_] = cor.partidos[pj_] || { nomes: [], saiu: [] };
      if (!cor.partidos[pj_].nomes.some(function (x) { return x.id === "JOGADOR"; })) {
        var bj = Math.round(baseJ());
        cor.partidos[pj_].nomes.push({ id: "JOGADOR", f: bj, h: [bj], fato: "entra na disputa interna", baixo: 0 });
      }
    }
  }

  PRE.tick = function () {
    var st = estado(); if (!st) return;
    var d = dataJ(), agora = mesIdx(d.ano, d.mes);
    if (st.ultimoTick === agora) return;
    st.ultimoTick = agora;
    var destaques = [];
    var doAno = [];
    CARGOS.forEach(function (c) {
      var cor = corrida(c);
      if (!cor) return;
      if (d.ano < cor.ano || d.mes <= 8) tickCorrida(cor, destaques);
      if (cor.ano === d.ano) doAno.push(cor);
    });
    // quem aparece em mais de uma corrida vai às prévias do cargo em que é mais forte
    var destino = {};
    doAno.forEach(function (cor) {
      Object.keys(cor.partidos).forEach(function (p) {
        var l = cor.partidos[p].nomes, sh = share(l);
        l.forEach(function (x, i) { var atual = destino[x.id]; var v = sh[i] + (CARGOS.length - CARGOS.indexOf(cor.c)) * 2; if (!atual || v > atual.v) destino[x.id] = { c: cor.c, v: v }; });
      });
    });
    doAno.forEach(function (cor) { sincronizarPrevias(cor, destino); });
    // corridas antigas: guarda o desfecho e limpa
    Object.keys(st.corridas).forEach(function (k) { var cr = st.corridas[k]; if (mesIdx(cr.ano, 12) < agora - 24) delete st.corridas[k]; });
    // manchetes: os lances mais relevantes do mês (partidos grandes e o do jogador)
    var pjog = ok(function () { return J().partido_atual; }, "");
    destaques.sort(function (a, b) { return (b.p === pjog) - (a.p === pjog) || fundo(b.p) - fundo(a.p) || Math.abs(b.ft.d) - Math.abs(a.ft.d); });
    // no máximo um lance do partido do jogador e um dos demais
    var sel = [], doJog = destaques.filter(function (z) { return z.p === pjog; })[0], fora = destaques.filter(function (z) { return z.p !== pjog; })[0];
    if (fora) sel.push(fora); if (doJog) sel.push(doJog);
    sel.forEach(function (z) {
      var nm = nomeDe(z.x.id), alvo = DISPUTAR[z.c];
      var t = z.desist || z.novo ? nm + " " + z.ft.t + " na corrida " + PELA[z.c] + " (" + z.p + ")." :
        z.ft.d > 0 ? "Bastidores: " + nm + " " + z.ft.t + " e ganha força para disputar " + alvo + " pelo " + z.p + "." :
          "Bastidores: " + nm + " " + z.ft.t + " e perde terreno na disputa interna do " + z.p + " " + PELA[z.c] + ".";
      manchete_(t);
    });
  };

  /* ---------------------------------------------------------------- prévias */
  // No ano da eleição, monta os grupos das prévias a partir da corrida (antes
  // de o jogo montar os dele) e mantém a força refletida no apoio interno.
  function sincronizarPrevias(cor, destino) {
    var d = dataJ(); if (cor.ano !== d.ano || d.mes > 8) return;
    var m = M();
    m.previas = m.previas || {}; m.previas.hist = m.previas.hist || [];
    var P = m.previas.atual;
    if (!P || P.ano !== d.ano) {
      if (P && P.formado) { m.previas.hist.push(P); if (m.previas.hist.length > 12) m.previas.hist.shift(); }
      P = m.previas.atual = { ano: d.ano, grupos: {}, apoios: {}, formado: true, resolvida: false, debMes: -1, dirMes: -1, v3: true, v3bonus: {} };
    }
    if (!P.v3) {
      // prévias montadas pelo motor antigo: converte enquanto ninguém venceu ainda
      var algumVenc = Object.keys(P.grupos || {}).some(function (cg) { return Object.keys(P.grupos[cg]).some(function (p) { return P.grupos[cg][p].venc; }); });
      if (P.resolvida || algumVenc || d.mes > 7) return;
      P.v3 = true; P.v3bonus = {}; P.grupos = {}; P.formado = true;
      Object.keys(estado().corridas).forEach(function (k) { var cr = estado().corridas[k]; if (cr.ano === d.ano) cr.formada = false; });
    }
    P.v3bonus = P.v3bonus || {};
    var usados = {};
    Object.keys(P.grupos).forEach(function (cg) { if (cg !== cor.c) Object.keys(P.grupos[cg]).forEach(function (p) { P.grupos[cg][p].ids.forEach(function (id) { usados[id] = cg; }); }); });
    P.grupos[cor.c] = P.grupos[cor.c] || {};
    Object.keys(cor.partidos).forEach(function (p) {
      var g = cor.partidos[p];
      var lista = g.nomes.filter(function (x) { return x.id !== "JOGADOR" && !usados[x.id] && (!destino || !destino[x.id] || destino[x.id].c === cor.c); }).sort(function (a, b) { return b.f - a.f; });
      // titular com direito à reeleição é candidato natural do partido
      var tit = lista.filter(function (x) { var n = npcPorId(x.id); return n && TITULAR[cor.c] && n.cargo === TITULAR[cor.c] && (n.mandatosSeguidos || 1) < 2; })[0];
      if (tit) lista = [tit];
      var e = P.grupos[cor.c][p];
      if (!e) e = P.grupos[cor.c][p] = { ids: [], ret: [], venc: null, votos: null, final: null };
      if (e.venc) return;
      if (!cor.formada) e.ids = lista.slice(0, 4).map(function (x) { return x.id; });
      g.nomes.forEach(function (x) {
        var k = x.id, novo = (x.f - 50) / 3, velho = P.v3bonus[k] || 0;
        P.apoios[k] = (P.apoios[k] || 0) + (novo - velho);
        P.v3bonus[k] = novo;
      });
    });
    cor.formada = true;
  }

  /* ---------------------------------------------------------------- ações do jogador */
  function meuGrupo(c) {
    var cor = corrida(c), p = ok(function () { return J().partido_atual; }, "");
    if (!cor || !jogadorNa(c) || !cor.partidos[p]) return null;
    var x = cor.partidos[p].nomes.filter(function (y) { return y.id === "JOGADOR"; })[0];
    return x ? { cor: cor, p: p, x: x } : null;
  }
  function usouNoMes(tipo) { var st = estado(), d = dataJ(), k = tipo + "|" + mesIdx(d.ano, d.mes); if (st.acoesMes[k]) return true; st.acoesMes = {}; st.acoesMes[k] = 1; return false; }
  function instalarAcoes() {
    if (typeof A === "undefined" || A.preAgenda) return;
    A.preCargo = function (c) { S.preCargo = c; };
    A.preAgenda = function (c) {
      var g = meuGrupo(c); if (!g) { toast_("Defina este cargo como seu cargo-alvo para entrar na disputa.", "err"); return; }
      if (!gastarEnergia(8)) return;
      var v = 2 + (J().atributos.carisma || 50) / 35 + rnd(-1, 1.5);
      g.x.f = clamp(g.x.f + v, 1, 99); g.x.fato = "rodou o estado em agenda de pré-campanha";
      toast_("Agenda de pré-campanha: +" + v.toFixed(1) + " de força na disputa interna.", "ok");
    };
    A.preCacique = function (c) {
      var g = meuGrupo(c); if (!g) { toast_("Defina este cargo como seu cargo-alvo para entrar na disputa.", "err"); return; }
      if (usouNoMes("cacique")) { toast_("Você já esteve com a direção do partido neste mês.", "err"); return; }
      if (!gastarEnergia(6)) return;
      var v = clamp((J().relacao_partido || 0) / 12 + rnd(-2, 3), -4, 8);
      g.x.f = clamp(g.x.f + v, 1, 99); g.x.fato = v >= 0 ? "ganhou simpatia da direção do partido" : "saiu mal da conversa com a direção";
      toast_(v >= 0 ? "A direção sinaliza apoio (+" + v.toFixed(1) + ")." : "A direção torceu o nariz (" + v.toFixed(1) + ").", v >= 0 ? "ok" : "err");
    };
    A.preLancar = function (c) {
      var g = meuGrupo(c); if (!g) { toast_("Defina este cargo como seu cargo-alvo para entrar na disputa.", "err"); return; }
      if (g.x.lancado) { toast_("Sua pré-candidatura já foi lançada.", "err"); return; }
      if (!gastarEnergia(10)) return;
      g.x.lancado = true; g.x.f = clamp(g.x.f + 5, 1, 99); g.x.fato = "lançou a pré-candidatura publicamente";
      manchete_(J().nome + " lança pré-candidatura e entra na disputa do " + g.p + " por " + DISPUTAR[c] + ".");
      // os rivais internos reagem
      g.cor.partidos[g.p].nomes.forEach(function (y) { if (y.id !== "JOGADOR" && y.f > g.x.f - 10) y.f = clamp(y.f + 1.5, 1, 99); });
      toast_("Pré-candidatura lançada: +5 de força, mas os rivais internos se mexem.", "ok");
    };
  }

  /* ---------------------------------------------------------------- tela */
  function spark(h) {
    if (!h || h.length < 2) return "";
    var mn = Math.min.apply(null, h), mx = Math.max.apply(null, h), w = 64, ht = 20, rg = Math.max(1, mx - mn);
    var pts = h.map(function (v, i) { return (i / (h.length - 1) * w).toFixed(1) + "," + (ht - (v - mn) / rg * (ht - 2) - 1).toFixed(1); }).join(" ");
    var sobe = h[h.length - 1] >= h[0];
    return '<svg class="pr-sp" viewBox="0 0 ' + w + " " + ht + '" width="' + w + '" height="' + ht + '"><polyline points="' + pts + '" fill="none" stroke="' + (sobe ? "var(--v3-verde2)" : "var(--v3-rubro)") + '" stroke-width="1.6"/></svg>';
  }
  function fase(meses) {
    if (meses <= 0) return { t: "Prévias", d: "a decisão está nas mãos do partido" };
    if (meses <= 7) return { t: "Reta final", d: "convenções e prévias se aproximam" };
    if (meses <= 18) return { t: "Pré-campanha", d: "os nomes se apresentam e buscam apoio" };
    return { t: "Especulação", d: "bastidores e balões de ensaio" };
  }
  function view() {
    var d = dataJ();
    var c = ok(function () { return S.preCargo; }, null) || (ok(function () { return cargoIdPorNome(J().campanha.cargo_alvo); }, null));
    if (CARGOS.indexOf(c) < 0) c = "GOV";
    var cor = corrida(c); if (!cor) return "";
    var meses = mesIdx(cor.ano, 8) - mesIdx(d.ano, d.mes);
    var fz = fase(meses);
    var pjog = ok(function () { return J().partido_atual; }, "");
    var h = '<div class="pr">';
    h += '<div class="pr-cargos">' + CARGOS.map(function (k) { var a = alvoAno(k, d); return '<button type="button" class="' + (k === c ? "on" : "") + '" data-a="preCargo" data-p="' + pj([k]) + '"><b>' + CURTO[k] + "</b><small>" + a + "</small></button>"; }).join("") + "</div>";
    h += '<div class="pr-topo"><div><span class="pr-fase">' + fz.t + "</span><h2>Quem vai ser candidato(a) a " + esc_(CURTO[c].toLowerCase()) + " em " + cor.ano + "?</h2><p>" + esc_(fz.d) + ". " + (meses > 0 ? "Prévias em <b>agosto/" + cor.ano + "</b>, daqui a <b>" + meses + " " + (meses === 1 ? "mês" : "meses") + "</b>." : "As prévias estão abertas na aba Partido.") + "</p></div></div>";
    // jogador
    var g = meuGrupo(c);
    if (g) {
      var lista = g.cor.partidos[g.p].nomes.slice().sort(function (a, b) { return b.f - a.f; }), shs = share(lista), pos = lista.indexOf(g.x);
      h += '<div class="pr-eu"><div><small>Sua posição no ' + esc_(g.p) + "</small><b>" + (pos + 1) + "º de " + lista.length + " · " + shs[pos] + "% de chance</b><span>" + esc_(g.x.fato || "") + "</span></div>" +
        '<div class="pr-eu-b"><button type="button" class="b mini" data-a="preAgenda" data-p="' + pj([c]) + '">Agenda de pré-campanha (−8)</button><button type="button" class="b mini" data-a="preCacique" data-p="' + pj([c]) + '">Conversar com a direção (−6)</button>' +
        (g.x.lancado ? "" : '<button type="button" class="b mini confirma" data-a="preLancar" data-p="' + pj([c]) + '">Lançar pré-candidatura (−10)</button>') + "</div></div>";
    } else {
      h += '<div class="pr-eu fora"><div><small>Você</small><b>Fora desta disputa</b><span>Para entrar, defina ' + esc_(CURTO[c].toLowerCase()) + " como seu cargo-alvo na Campanha (você precisa ter partido).</span></div></div>";
    }
    // partidos
    var parts = Object.keys(cor.partidos).filter(function (p) { return cor.partidos[p].nomes.length; }).sort(function (a, b) {
      var fa = Math.max.apply(null, cor.partidos[a].nomes.map(function (x) { return x.f; })), fb = Math.max.apply(null, cor.partidos[b].nomes.map(function (x) { return x.f; }));
      return (b === pjog) - (a === pjog) || fb - fa;
    }).slice(0, 10);
    h += '<div class="pr-fav">' + parts.slice(0, 6).map(function (p) { var l = cor.partidos[p].nomes.slice().sort(function (a, b) { return b.f - a.f; }); var s = share(l); return '<span><small>' + esc_(p) + "</small><b>" + esc_(nomeDe(l[0].id)) + "</b><i>" + s[0] + "%</i></span>"; }).join("") + "</div>";
    h += '<div class="pr-grid">';
    parts.forEach(function (p) {
      var l = cor.partidos[p].nomes.slice().sort(function (a, b) { return b.f - a.f; }), s = share(l);
      h += '<section class="pr-p' + (p === pjog ? " meu" : "") + '"><header><b>' + esc_(p) + "</b>" + (p === pjog ? "<small>seu partido</small>" : "") + "<em>" + l.length + " nome" + (l.length > 1 ? "s" : "") + "</em></header>";
      l.forEach(function (x, i) {
        var n = x.id === "JOGADOR" ? null : ok(function () { return npcPorId(x.id); }, null);
        var tr = x.h.length >= 4 ? x.h[x.h.length - 1] - x.h[x.h.length - 4] : 0;
        var foto = x.id === "JOGADOR" ? ok(function () { return window.fotoTag(J(), 34, 34); }, "") : n ? ok(function () { return window.fotoTag(n, 34, 34); }, "") : "";
        var novo = x.fatoMes != null && mesIdx(d.ano, d.mes) - x.fatoMes <= 1;
        h += '<div class="pr-n' + (x.id === "JOGADOR" ? " eu" : "") + '"><div class="pr-av">' + foto + '</div><div class="pr-nm"><b>' + esc_(nomeDe(x.id)) + (x.id === "JOGADOR" ? " (você)" : "") + "</b>" + (i === 0 ? '<span class="pr-tag">favorito(a)</span>' : "") +
          "<small>" + esc_(n ? n.cargo : ok(function () { return J().cargo_atual; }, "")) + "</small>" +
          (x.fato ? '<small class="pr-fato' + (novo ? " novo" : "") + '">' + esc_(x.fato) + "</small>" : "") +
          '<div class="pr-bar"><i style="width:' + s[i] + '%"></i></div></div><div class="pr-num"><b>' + s[i] + '%</b><span class="' + (tr > 0 ? "up" : tr < 0 ? "down" : "") + '">' + (tr > 0 ? "▲ " + tr : tr < 0 ? "▼ " + (-tr) : "=") + "</span>" + spark(x.h) + "</div></div>";
      });
      var saiu = (cor.partidos[p].saiu || []).slice(-2);
      if (saiu.length) h += '<p class="pr-saiu">' + saiu.map(function (z) { return esc_(nomeDe(z.id)) + " " + esc_(z.motivo); }).join(" · ") + "</p>";
      h += "</section>";
    });
    h += "</div><p class=\"pr-nota\">A chance é dentro do partido. No ano da eleição, os mais fortes de cada partido vão às prévias, e a força acumulada pesa no resultado.</p></div>";
    return h;
  }

  /* ---------------------------------------------------------------- instalação */
  function instalar() {
    instalarAcoes();
    if (typeof VIEWS !== "undefined" && !VIEWS.pre) VIEWS.pre = function () { return view(); };
    try { if (!TABS.some(function (t) { return t[0] === "pre"; })) TABS.push(["pre", "Pré-candidaturas"]); } catch (e) {}
    var N = window.NAVH;
    if (N && N.HUBS && !N.__v3pre) {
      N.__v3pre = true;
      N.HUBS.forEach(function (h) { if (h.id === "partido" && !h.subs.some(function (s) { return s[0] === "pre"; })) h.subs.push(["pre", "Pré-candidaturas"]); });
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3pre) {
      var o = window.avancarMes;
      var nv = function () { var r = o.apply(this, arguments); try { PRE.tick(); } catch (e) { console.warn("pre tick", e); } return r; };
      for (var k in o) { try { nv[k] = o[k]; } catch (e) {} }
      nv.__v3pre = true; window.avancarMes = nv; try { avancarMes = nv; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
