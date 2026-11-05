/* =============================================================================
   CADEIRA v3 — Transição de governo
   Ao vencer para Prefeito, Governador ou Presidente, começa a transição
   (do resultado até a posse):
   1. ESTRUTURA: o jogador escolhe quais secretarias/ministérios existem no
      primeiro dia. As pastas essenciais (Governo/Casa Civil e Fazenda) e as
      estatais ficam sempre. As demais vão para a reserva e podem ser criadas
      depois, a qualquer momento do mandato.
   2. INDICAÇÕES: os partidos da coligação (e quem apoiou no 2º turno) indicam
      nomes para as pastas, todo mês. O jogador aceita, recusa, nomeia outro
      ou deixa a pasta para decidir depois da posse.
   3. POSSE: no dia da posse, a estrutura e os nomes acertados entram no
      Diário Oficial automaticamente (nomear() do jogo).
   Aceitar/recusar mexe na relação com o indicado e com a liderança do
   partido; tudo vira notícia (V3NEWS). Estado em M().v3trans e M().v3estrutura.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3TRANS) return;
  var TR = (window.V3TRANS = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function agora() { return ok(function () { return agoraM(); }, 0); }
  function D() { return ok(function () { return dt(); }, { ano: 2026, mes: 10 }); }
  function J_() { return ok(function () { return J(); }, null); }
  function npc(id) { return ok(function () { return npcPorId(id); }, null); }
  function rel(n, d) { if (!n) return; if (typeof window.relNPC === "function") { try { relNPC(n, d); return; } catch (e) {} } n.relacao_com_jogador = clamp((n.relacao_com_jogador || 0) + d, -100, 100); }
  function nomeC(c) { return ok(function () { return NOME_CARGO[c]; }, c); }
  function fato(f) { ok(function () { window.V3NEWS.fato(f); }); }
  var EXEC = { PREF: 1, GOV: 1, PRES: 1 };
  var ESSENCIAIS = { PREF: ["gov", "fazenda"], GOV: ["casacivil", "fazenda", "gov"], PRES: ["casacivil", "fazenda"] };
  var TIPO = { PREF: "secretarias", GOV: "secretarias", PRES: "ministérios" };

  /* ---------------- cópia das pastas originais (antes de qualquer save) */
  var BASE = {};
  function copiarBase() { if (BASE.PREF) return; ok(function () { Object.keys(PASTAS).forEach(function (c) { BASE[c] = PASTAS[c].filter(function (p) { return !p.custom; }).map(function (p) { return Object.assign({}, p); }); }); }); }
  copiarBase();
  function escolhiveis(c) { return (BASE[c] || []).filter(function (p) { return !p.estatal && !p.stf && !p.pgr; }); }
  function essencial(c, id) { return (ESSENCIAIS[c] || []).indexOf(id) >= 0; }

  function st() { var m = ok(function () { return M(); }, null); return m ? m.v3trans || null : null; }
  TR.estado = st;

  /* ---------------- estrutura do governo em vigor (pastas inativas ficam na reserva) */
  function aplicarEstrutura() {
    var m = ok(function () { return M(); }, null); if (!m || !BASE.PREF) return;
    var cid = ok(function () { return cargoAtualId(); }, ""), E = m.v3estrutura; if (!BASE[cid]) return;
    var inat = E && E.cargo === cid ? E.inativas || [] : [];
    var atual = PASTAS[cid] || [], custom = atual.filter(function (p) { return p.custom; });
    var alvo = BASE[cid].filter(function (p) { return inat.indexOf(p.id) < 0; }).concat(custom);
    if (alvo.map(function (p) { return p.id; }).join("|") !== atual.map(function (p) { return p.id; }).join("|")) PASTAS[cid] = alvo;
  }
  TR.aplicarEstrutura = aplicarEstrutura;

  /* ---------------- início da transição */
  function partidosAliados(c) {
    var j = J_(); if (!j) return [];
    var l = [j.partido_atual].concat(ok(function () { return j.campanha.coligacao || []; }, []));
    ok(function () { window.V3COB.apoiosDe(c).forEach(function (r) { if (r.decisao === "apoia" && r.para && r.para.id === "JOGADOR" && r.quem && r.quem.partido) l.push(r.quem.partido); }); });
    var vistos = {}; return l.filter(function (p) { if (!p || p === "Sem Partido" || vistos[p]) return false; vistos[p] = 1; return true; });
  }
  TR.iniciar = function (c) {
    var m = ok(function () { return M(); }, null); if (!m || !EXEC[c]) return;
    var d = D();
    var at = {}; escolhiveis(c).forEach(function (p) { at[p.id] = true; });
    m.v3trans = { cargo: c, anoPosse: d.ano + 1, inicio: agora(), ativas: at, definida: false, indic: [], escolhas: {}, fase: "aberta", partidos: partidosAliados(c), ultMes: null, seq: 0 };
    gerarIndicacoes(true);
    var j = J_();
    fato({ tipo: "transicao", sec: c === "PREF" ? "Grande ABC" : "Política", kick: "Transição", tit: j.nome + " abre a transição e começa a desenhar " + (c === "PRES" ? "o ministério" : "o secretariado"), lead: "Partidos aliados já começaram a levar nomes. A estrutura do novo governo será definida até a posse.", jog: true, peso: 55, veic: c === "PREF" ? "dgabc" : "folha", atores: [j.nome], thread: "transicao-" + (d.ano + 1) + "-" + c, tipoM: "agenda", dados: { partidos_aliados: m.v3trans.partidos.join(", "), pastas_possiveis: escolhiveis(c).length } });
    ok(function () { toast("🏛️ Começou a transição de governo. Defina a estrutura e analise as indicações em Gabinete › Transição.", "ok"); });
  };

  /* ---------------- indicações dos partidos */
  function lider(p) { return ok(function () { return bancoDeNPCs.filter(function (n) { return n.vivo && !n.jogador && n.partido === p; }).sort(function (a, b) { return ((b.forca || 0) + (b.popularidade || 0)) - ((a.forca || 0) + (a.popularidade || 0)); })[0]; }, null); }
  function usados(T) { var u = {}; T.indic.forEach(function (x) { if (x.status !== "recusada") u[x.npcId] = 1; }); Object.keys(T.escolhas).forEach(function (k) { u[T.escolhas[k].npcId] = 1; }); return u; }
  function candidatoDo(p, c, u) {
    var l = ok(function () { return bancoDeNPCs.filter(function (n) {
      if (!n || !n.vivo || n.jogador || n.partido !== p || u[n.id] || n.status_judicial === "CONDENADO" || /Presidente da República|Governador|Prefeito de Mauá|Ministro do STF/.test(n.cargo || "")) return false;
      if (c === "PREF") return n.municipio_domicilio === "Mauá" || /Vereador de Mauá|Deputad/.test(n.cargo || "") || /ABC|Mauá/.test(n.base || "");
      if (c === "GOV") return n.uf === "SP";
      return true;
    }); }, []);
    l.sort(function (a, b) { return (b.popularidade || 0) + (b.forca || 0) / 2 - (a.popularidade || 0) - (a.forca || 0) / 2; });
    return l.slice(0, 8)[Math.floor(Math.random() * Math.min(8, l.length))] || null;
  }
  function porque(n, pasta) {
    var L = [(n.cargo && !/Liderança/.test(n.cargo) ? n.cargo : "Quadro do partido") + (n.profissao ? ", " + String(n.profissao).toLowerCase() : "") + ".", "Nome de confiança da direção" + (n.partido ? " do " + n.partido : "") + ".", "Tem base eleitoral e trânsito na área de " + String(pasta.nome).replace(/^(Secretaria|Ministério)( da| de| do| das| dos)? /, "").toLowerCase() + "."];
    return L[hash(n.id + pasta.id) % L.length];
  }
  function gerarIndicacoes(inicial) {
    var T = st(); if (!T || T.fase !== "aberta") return;
    var m = agora(); if (!inicial && T.ultMes === m) return; T.ultMes = m;
    var c = T.cargo, ativas = escolhiveis(c).filter(function (p) { return T.ativas[p.id]; }), u = usados(T);
    T.partidos.forEach(function (p, i) {
      var qtd = inicial ? (i === 0 ? 3 : 1) : (i === 0 ? 2 : 1 + (Math.random() < 0.4 ? 1 : 0));
      var livres = ativas.filter(function (pa) { return !T.escolhas[pa.id] && !T.indic.some(function (x) { return x.pasta === pa.id && x.partido === p && x.status === "pendente"; }); })
        .sort(function (a, b) { return (b.peso + hash(p + a.id) % 7) - (a.peso + hash(p + b.id) % 7); });
      for (var q = 0; q < qtd && livres.length; q++) {
        var pa = livres.shift(), n = candidatoDo(p, c, u); if (!n) break;
        u[n.id] = 1; var ld = lider(p);
        T.indic.push({ id: "I" + (++T.seq), pasta: pa.id, npcId: n.id, partido: p, por: ld && ld.id !== n.id ? ld.id : null, mes: m, status: "pendente", motivo: porque(n, pa) });
      }
    });
    var novas = T.indic.filter(function (x) { return x.mes === m && x.status === "pendente"; }).length;
    if (novas && !inicial) ok(function () { toast("🏛️ " + novas + " nova(s) indicação(ões) dos partidos para o seu governo.", "ok"); });
  }
  TR.gerarIndicacoes = gerarIndicacoes;
  function pastaDe(c, id) { return (BASE[c] || []).filter(function (p) { return p.id === id; })[0] || { id: id, nome: id }; }
  function aceitar(id) {
    var T = st(); if (!T) return; var x = T.indic.filter(function (i) { return i.id === id; })[0]; if (!x || x.status !== "pendente") return;
    x.status = "aceita"; T.escolhas[x.pasta] = { npcId: x.npcId, origem: "indicacao", partido: x.partido };
    var n = npc(x.npcId), ld = npc(x.por); rel(n, 8); rel(ld, 6);
    T.indic.forEach(function (o) { if (o !== x && o.pasta === x.pasta && o.status === "pendente") { o.status = "preterida"; rel(npc(o.por), -2); } });
    var pa = pastaDe(T.cargo, x.pasta);
    if (n) fato({ tipo: "transicao", sec: T.cargo === "PREF" ? "Grande ABC" : "Política", kick: "Transição", tit: (n.nome) + " é confirmado(a) para " + pa.nome + " no governo de " + J_().nome, lead: "Indicação do " + x.partido + ". " + x.motivo, jog: true, peso: 46, veic: T.cargo === "PREF" ? "dgabc" : "metropoles", atores: [J_().nome, n.nome], thread: "transicao-" + T.anoPosse + "-" + T.cargo, tipoM: "agenda", dados: { pasta: pa.nome, partido_que_indicou: x.partido, posse_prevista: "janeiro de " + T.anoPosse } });
  }
  function recusar(id) {
    var T = st(); if (!T) return; var x = T.indic.filter(function (i) { return i.id === id; })[0]; if (!x || x.status !== "pendente") return;
    x.status = "recusada"; var ld = npc(x.por), n = npc(x.npcId); rel(ld, -5); rel(n, -6);
    var pa = pastaDe(T.cargo, x.pasta);
    if (Math.random() < 0.5 && n) fato({ tipo: "transicao", sec: "Bastidores", kick: "Transição", tit: x.partido + " reclama de veto a " + n.nome + " para " + pa.nome, lead: "O partido esperava emplacar o nome na nova gestão de " + J_().nome + ".", jog: true, peso: 38, veic: "metropoles", atores: [J_().nome, n.nome], thread: "transicao-" + T.anoPosse + "-" + T.cargo, tipoM: "agenda" });
  }
  function escolherProprio(pasta, npcId) {
    var T = st(); if (!T || !npcId) return; var n = npc(npcId); if (!n) return;
    T.escolhas[pasta] = { npcId: n.id, origem: "jogador", partido: n.partido };
    T.indic.forEach(function (o) { if (o.pasta === pasta && o.status === "pendente") { o.status = "preterida"; rel(npc(o.por), -3); } });
    rel(n, 10);
  }
  function desfazer(pasta) { var T = st(); if (T) delete T.escolhas[pasta]; }
  function alternarPasta(id) {
    var T = st(); if (!T || essencial(T.cargo, id)) return;
    T.ativas[id] = !T.ativas[id];
    if (!T.ativas[id]) { delete T.escolhas[id]; T.indic.forEach(function (o) { if (o.pasta === id && o.status === "pendente") o.status = "sem pasta"; }); }
  }
  function sugestoes(c, pasta) {
    var T = st(), u = T ? usados(T) : {}, j = J_();
    return ok(function () { return bancoDeNPCs.filter(function (n) { return n.vivo && !n.jogador && !u[n.id] && n.status_judicial !== "CONDENADO" && ((n.relacao_com_jogador || 0) >= 20 || n.partido === j.partido_atual) && !/Presidente da República|Governador|Ministro do STF/.test(n.cargo || "") && (c !== "PREF" || n.uf === "SP") && (c !== "GOV" || n.uf === "SP"); })
      .sort(function (a, b) { return (b.relacao_com_jogador || 0) - (a.relacao_com_jogador || 0); }).slice(0, 25); }, []);
  }

  /* ---------------- posse: estrutura e nomes entram no Diário Oficial */
  function aplicarNaPosse() {
    var T = st(), m = ok(function () { return M(); }, null); if (!T || !m || T.fase !== "aberta") return;
    var cid = ok(function () { return cargoAtualId(); }, ""); if (cid !== T.cargo) return;
    var inat = escolhiveis(cid).filter(function (p) { return !T.ativas[p.id]; }).map(function (p) { return p.id; });
    m.v3estrutura = { cargo: cid, inativas: inat, desde: agora() };
    aplicarEstrutura();
    var n0 = 0;
    Object.keys(T.escolhas).forEach(function (pid) { var e = T.escolhas[pid], n = npc(e.npcId); if (!n || !n.vivo || !(PASTAS[cid] || []).some(function (p) { return p.id === pid; })) return; ok(function () { nomear(pid, "npc", n.id); n0++; }); });
    T.fase = "aplicada";
    var tot = escolhiveis(cid).length, at = tot - inat.length, j = J_();
    if (inat.length / tot >= 0.25) ok(function () { j.popularidade = clamp((j.popularidade || 0) + 0.8, 0, 100); });
    fato({ tipo: "transicao", sec: cid === "PREF" ? "Grande ABC" : "Política", kick: "Novo governo", tit: "Governo " + j.nome + " começa com " + at + " " + TIPO[cid] + (inat.length ? " e deixa " + inat.length + " na reserva" : "") + "; " + n0 + " nomes já nomeados", lead: inat.length / tot >= 0.25 ? "O enxugamento da máquina foi bem recebido por parte da opinião pública; aliados cobram espaço." : "A estrutura mantém o desenho herdado.", jog: true, peso: 60, veic: cid === "PREF" ? "dgabc" : "estadao", atores: [j.nome], thread: "transicao-" + T.anoPosse + "-" + cid, tipoM: "posse", dados: { pastas_ativas: at, pastas_na_reserva: inat.map(function (id) { return pastaDe(cid, id).nome; }).join(", ") || "nenhuma", nomeacoes_feitas_na_posse: n0, pastas_para_decidir_depois: at - n0 } });
  }
  TR.aplicarNaPosse = aplicarNaPosse;
  function reativar(id) {
    var m = ok(function () { return M(); }, null), E = m && m.v3estrutura; if (!E) return;
    if (!ok(function () { return gastarEnergia(5); }, true)) return;
    E.inativas = (E.inativas || []).filter(function (x) { return x !== id; }); aplicarEstrutura();
    var pa = pastaDe(E.cargo, id);
    ok(function () { diario("Criou: " + pa.nome + "."); toast(pa.nome + " criada. Nomeie o titular no Diário Oficial.", "ok"); });
    fato({ tipo: "estrutura", sec: E.cargo === "PREF" ? "Grande ABC" : "Política", kick: "Diário Oficial", tit: J_().nome + " cria " + pa.nome, lead: "A pasta estava na reserva desde o início do mandato.", jog: true, peso: 40, veic: E.cargo === "PREF" ? "dgabc" : "folha", atores: [J_().nome], tipoM: "diario" });
  }

  /* ---------------- tela */
  function fotoN(n) { return ok(function () { return window.fotoTag(n, 40, 48); }, ""); }
  function view() {
    var T = st(), m = ok(function () { return M(); }, null), cid = ok(function () { return cargoAtualId(); }, ""), E = m && m.v3estrutura;
    var h = '<div class="v3t">';
    if (T && T.fase === "aberta") {
      var c = T.cargo, ps = escolhiveis(c), at = ps.filter(function (p) { return T.ativas[p.id]; }), pend = T.indic.filter(function (x) { return x.status === "pendente"; });
      h += '<section class="v3t-hero"><small>Transição de governo</small><h2>' + esc_(nomeC(c)) + " · posse em janeiro de " + T.anoPosse + "</h2><p>Defina quantas " + TIPO[c] + " o governo terá no primeiro dia e escolha os nomes. O que ficar em aberto você decide depois da posse.</p>" +
        '<div class="v3t-kpi"><div><b>' + at.length + "/" + ps.length + "</b><small>" + TIPO[c] + " ativas</small></div><div><b>" + Object.keys(T.escolhas).length + "</b><small>nomes definidos</small></div><div><b>" + pend.length + "</b><small>indicações a analisar</small></div><div><b>" + esc_(T.partidos.join(", ")) + "</b><small>partidos aliados</small></div></div></section>";
      h += '<section class="v3t-sec"><h3>1. Estrutura do governo</h3><p class="v3t-nota">Toque para ligar ou desligar. As essenciais não saem. As desligadas vão para a reserva e podem ser criadas depois.</p><div class="v3t-estr">' + ps.map(function (p) {
        var es = essencial(c, p.id), on = T.ativas[p.id];
        return '<button type="button" class="' + (on ? "on" : "off") + (es ? " ess" : "") + '" data-tr="alternar" data-id="' + esc_(p.id) + '"' + (es ? " disabled" : "") + "><b>" + esc_(p.nome) + "</b><small>" + (es ? "essencial" : on ? "ativa" : "reserva") + " · peso " + p.peso + "</small></button>";
      }).join("") + "</div></section>";
      h += '<section class="v3t-sec"><h3>2. Nomes por pasta</h3>' + at.map(function (p) {
        var e = T.escolhas[p.id], n = e && npc(e.npcId), ind = T.indic.filter(function (x) { return x.pasta === p.id && x.status === "pendente"; });
        var s = '<div class="v3t-pasta"><div class="v3t-ph"><b>' + esc_(p.nome) + "</b><small>" + esc_(p.efeito || "") + "</small></div>";
        if (n) s += '<div class="v3t-ok">' + fotoN(n) + "<span><b>" + esc_(n.nome) + "</b><small>" + esc_(n.partido + " · " + (n.cargo || "")) + " · " + (e.origem === "indicacao" ? "indicação do " + esc_(e.partido) : "escolha sua") + '</small></span><button type="button" class="b mini branco" data-tr="desfazer" data-id="' + esc_(p.id) + '">Trocar</button></div>';
        else {
          s += ind.map(function (x) { var ni = npc(x.npcId); if (!ni) return ""; return '<div class="v3t-ind">' + fotoN(ni) + "<span><b>" + esc_(ni.nome) + "</b><small>" + esc_(x.partido) + " indica · " + esc_(ni.cargo || "") + "</small><em>" + esc_(x.motivo) + '</em></span><div class="v3t-bts"><button type="button" class="b mini confirma" data-tr="aceitar" data-id="' + x.id + '">Aceitar</button><button type="button" class="b mini" data-tr="recusar" data-id="' + x.id + '">Recusar</button></div></div>'; }).join("");
          var sug = sugestoes(c, p.id);
          s += '<div class="v3t-prop"><select data-tr-sel="' + esc_(p.id) + '"><option value="">Nomear outro nome…</option>' + sug.map(function (k) { return '<option value="' + esc_(k.id) + '">' + esc_(k.nome + " (" + k.partido + ", relação " + Math.round(k.relacao_com_jogador || 0) + ")") + "</option>"; }).join("") + '</select><button type="button" class="b mini" data-tr="proprio" data-id="' + esc_(p.id) + '">Nomear</button><small>' + (ind.length ? "ou deixe para depois da posse" : "sem indicação ainda · pode decidir depois da posse") + "</small></div>";
        }
        return s + "</div>";
      }).join("") + "</section>";
      return h + "</div>";
    }
    if (E && E.cargo === cid && (E.inativas || []).length) {
      h += '<section class="v3t-hero"><small>Estrutura do governo</small><h2>Pastas na reserva</h2><p>Foram deixadas de fora na transição. Criar uma pasta custa 5 de energia; depois nomeie o titular no Diário Oficial.</p></section><section class="v3t-sec"><div class="v3t-res">' +
        E.inativas.map(function (id) { var p = pastaDe(cid, id); return '<div><b>' + esc_(p.nome) + "</b><small>" + esc_(p.efeito || "") + '</small><button type="button" class="b mini confirma" data-tr="reativar" data-id="' + esc_(id) + '">Criar agora</button></div>'; }).join("") + "</div></section>";
      return h + "</div>";
    }
    return h + '<section class="v3t-hero"><small>Transição de governo</small><h2>Nenhuma transição em andamento</h2><p>Ao vencer uma eleição para prefeito, governador ou presidente, a transição começa aqui: você monta a estrutura do governo e analisa as indicações dos partidos aliados até a posse.</p></section></div>';
  }
  TR.view = view;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-tr]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.getAttribute("data-tr"), id = b.getAttribute("data-id");
    if (k === "alternar") alternarPasta(id);
    else if (k === "aceitar") aceitar(id);
    else if (k === "recusar") recusar(id);
    else if (k === "desfazer") desfazer(id);
    else if (k === "reativar") reativar(id);
    else if (k === "proprio") { var s = document.querySelector('[data-tr-sel="' + id + '"]'); if (!s || !s.value) { ok(function () { toast("Escolha um nome na lista.", "err"); }); return; } escolherProprio(id, s.value); }
    else if (k === "abrir") { ok(function () { S.tab = "transicao"; }); }
    ok(function () { render(); });
  }, true);
  function chip() {
    var T = st(), el = document.getElementById("v3t-chip"), aqui = ok(function () { return S.tab === "transicao"; }, false);
    if (!T || T.fase !== "aberta" || aqui) { if (el) el.remove(); return; }
    var pend = T.indic.filter(function (x) { return x.status === "pendente"; }).length;
    if (!el) { el = document.createElement("div"); el.id = "v3t-chip"; document.body.appendChild(el); }
    var html = '<button type="button" data-tr="abrir">🏛️ <span><b>Transição de governo</b><small>' + pend + " indicação(ões) · posse em " + T.anoPosse + "</small></span></button>";
    if (el.innerHTML !== html) el.innerHTML = html;
  }

  /* ---------------- instalação */
  function envolver(nome, marca, fn) { var o = window[nome]; if (typeof o !== "function" || o[marca]) return; var n = fn(o); for (var k in o) { try { n[k] = o[k]; } catch (e) {} } n[marca] = true; window[nome] = n; }
  function instalar() {
    copiarBase();
    if (typeof VIEWS !== "undefined" && !VIEWS.transicao) VIEWS.transicao = function () { return view(); };
    ok(function () { if (!TABS.some(function (t) { return t[0] === "transicao"; })) TABS.push(["transicao", "Transição"]); });
    var N = window.NAVH;
    if (N && N.HUBS) N.HUBS.forEach(function (h) { if (h.id === "gabinete" && !h.subs.some(function (s) { return s[0] === "transicao"; })) h.subs.push(["transicao", "Transição"]); });
    envolver("finalizarMaj", "__v3trans", function (o) { return function (c, v) { var r = o.apply(this, arguments); try { if (v && v.jogador && EXEC[c]) TR.iniciar(c); } catch (x) { console.warn("transição", x); } return r; }; });
    envolver("empossar", "__v3trans", function (o) { return function () { var r = o.apply(this, arguments); try { aplicarNaPosse(); } catch (x) { console.warn("transição posse", x); } return r; }; });
    envolver("avancarMes", "__v3trans", function (o) { return function () { var r = o.apply(this, arguments); try { gerarIndicacoes(false); } catch (x) {} return r; }; });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 160); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
  setInterval(function () { try { if (ok(function () { return !!gameState; }, false)) { aplicarEstrutura(); chip(); } } catch (e) {} }, 1000);
})();
