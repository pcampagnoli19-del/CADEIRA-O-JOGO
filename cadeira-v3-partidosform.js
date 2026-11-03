/* =============================================================================
   CADEIRA v3 — Partidos em formação (rito da Lei 9.096/95 e Res. TSE 23.571/2018)
   Antes: todo janeiro, 18% de chance de um partido do catálogo "nascer" na hora.
   Agora cada partido percorre o processo real, mês a mês:
     1. Fundação: 101 fundadores com domicílio em 1/3 dos estados (9 UFs),
        programa e estatuto no Diário Oficial, registro civil em cartório.
     2. Apoiamento: assinaturas de eleitores NÃO filiados = 0,5% dos votos
        válidos da última eleição para a Câmara, em 9+ estados (mín. 0,1% do
        eleitorado de cada um), dentro do prazo de 2 anos.
     3. Conferência das assinaturas pelos cartórios eleitorais (parte é rejeitada).
     4. Registro dos órgãos de direção estaduais nos TREs (mín. 9 estados).
     5. Pedido de registro no TSE: parecer do Ministério Público Eleitoral e
        julgamento em plenário. Para disputar uma eleição, o registro precisa
        sair até 6 meses antes do pleito (início de abril).
   A chance de abrir processos novos subiu um pouco: a média de registros por
   ano fica um pouco acima da regra antiga.
   Estado em M().v3pf.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3PF) return;
  var PF = (window.V3PF = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ri(a, b) { return Math.floor(rnd(a, b + 1)); }
  function data() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function idx() { var d = data(); return d.ano * 12 + d.mes - 1; }
  function mesAno(i) { var M_ = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]; return M_[i % 12] + "/" + Math.floor(i / 12); }
  function fmtN(n) { return Math.round(n).toLocaleString("pt-BR"); }
  function nota(t, tipo) { try { manchete(t, tipo || "partido"); } catch (e) {} }

  // 0,5% dos votos válidos para deputado federal na última eleição geral
  function meta() { var a = data().ano; return a >= 2027 ? 560000 : 547000; }
  var FASES = ["Fundação", "Coleta de apoiamento", "Conferência nos cartórios", "Diretórios nos TREs", "Julgamento no TSE"];

  function st() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3pf) m.v3pf = { lista: [], hist: [], ini: false, ultimo: -1 };
    return m.v3pf;
  }
  function catalogo() { return ok(function () { return CATALOGO_PARTIDOS_FORMACAO; }, []); }
  function existe(t) { return ok(function () { return !!(PARTIDOS[t.sigla] || PARTIDOS[t.nome]); }, false); }
  function livres(s) {
    return catalogo().filter(function (t) { return !existe(t) && !s.lista.some(function (p) { return p.sigla === t.sigla; }); });
  }

  function novoProcesso(s, faseInicial) {
    var op = livres(s); if (!op.length) return null;
    var t = op[Math.floor(Math.random() * op.length)], i = idx();
    var p = {
      sigla: t.sigla, nome: t.nome, e: t.e, band: t.band || null, numero: t.numero,
      forca: rnd(0.55, 1.25) * (t.band ? 1.15 : 1), fase: 0, desde: i,
      fund: 0, ufsFund: 0, assin: 0, validas: 0, ufs: 0, dirs: 0, coletaIni: null, sub: "", ate: i + ri(2, 4), sit: "Reunindo fundadores"
    };
    s.lista.push(p);
    if (faseInicial) avancoRapido(p, faseInicial);
    else nota("Grupo político lança o " + p.nome + " (" + p.sigla + ") e começa a reunir fundadores para registrar o partido.");
    return p;
  }
  // para o começo do jogo: partidos que já estavam no meio do caminho
  function avancoRapido(p, f) {
    var i = idx();
    p.fund = 101; p.ufsFund = ri(9, 14);
    if (f >= 1) { p.fase = 1; p.coletaIni = i - ri(2, 16); p.assin = meta() * rnd(0.15, 0.85); p.ufs = ri(4, 12); p.sit = "Coletando assinaturas"; }
    if (f >= 3) { p.fase = 3; p.assin = meta() * 1.25; p.validas = meta() * rnd(1.0, 1.08); p.ufs = ri(9, 18); p.dirs = ri(2, 7); p.sit = "Registrando diretórios nos TREs"; }
  }

  function concluir(p) {
    var t = { nome: p.nome, sigla: p.sigla, e: p.e, band: p.band, numero: p.numero };
    try {
      var num = t.numero != null ? t.numero : proximoNumero();
      PARTIDOS[t.sigla] = { e: t.e, fundo: 0.2, numero: num, sigla: t.sigla, nome: t.nome, band: t.band || null, fundado: { ano: data().ano, mes: data().mes } };
      if (!PARTIDOS_JOGAVEIS.includes(t.sigla)) PARTIDOS_JOGAVEIS.push(t.sigla);
      var c = gerarPoliticoProcedural("Liderança / Ex-Titular", "FEDERAL", t.sigla, { arquetipo: "Operador de Bastidor (Caciquinho)", idade: R.i(40, 66), uf: "SP" });
      c.papel = "Presidente Nacional do " + t.sigla; bancoDeNPCs.push(c);
      var tr = gerarPoliticoProcedural("Liderança / Ex-Titular", "FEDERAL", t.sigla, { arquetipo: "Operador de Bastidor (Caciquinho)", uf: "SP" });
      tr.papel = "Tesoureiro do " + t.sigla; bancoDeNPCs.push(tr);
      M().partidos[t.sigla] = { cacique_id: c.id, tesoureiro_id: tr.id, guerra: false, fundo_bloqueado_ate: null, candidatos_sucessao: [], aposta_jogador: null, delegados_comprados: 0 };
      bancoDeNPCs.filter(function (n) { return n.vivo && !n.real && ehLegislativo(n) && n.fidelidade_partidaria < 45; }).slice(0, 8).forEach(function (n) { n.partidoBase = t.sigla; n.partido = t.sigla; });
      var d = data(), eleicao = d.ano % 2 === 0, aTempo = d.mes <= 3;
      nota("TSE aprova o registro do " + t.nome + " (" + t.sigla + ", nº " + num + "). " + (eleicao ? (aTempo ? "O partido chega a tempo de disputar as eleições de " + d.ano + "." : "Registrado depois de abril, só disputa a partir de " + (d.ano + 2) + ".") : "Parlamentares insatisfeitos já negociam filiação."));
    } catch (e) { console.warn("v3pf concluir", e); }
  }
  function encerrar(s, p, motivo, ok_) {
    s.lista = s.lista.filter(function (x) { return x !== p; });
    s.hist.unshift({ sigla: p.sigla, nome: p.nome, quando: idx(), ok: !!ok_, motivo: motivo });
    s.hist = s.hist.slice(0, 12);
  }

  function iniciar(s) {
    if (s.ini) return; s.ini = true;
    [3, 1].forEach(function (f) { novoProcesso(s, f); }); novoProcesso(s, 0);
  }
  PF.mensal = function () {
    var s = st(); if (!s) return;
    var i = idx(); if (s.ultimo === i) return; s.ultimo = i;
    iniciar(s);
    var M_ = meta();
    s.lista.slice().forEach(function (p) {
      if (p.fase === 0) {
        p.fund = Math.min(101, p.fund + ri(25, 60)); p.ufsFund = Math.min(15, p.ufsFund + ri(2, 5));
        if (p.fund >= 101 && p.ufsFund >= 9 && i >= p.ate) { p.fase = 1; p.coletaIni = i; p.sit = "Coletando assinaturas"; nota("O " + p.nome + " publica estatuto no Diário Oficial e inicia a coleta de assinaturas de apoiamento."); }
        else p.sit = "Reunindo fundadores (" + p.fund + "/101, " + p.ufsFund + "/9 estados)";
      } else if (p.fase === 1) {
        p.assin += M_ * p.forca * rnd(0.04, 0.09);
        if (p.ufs < 27 && Math.random() < 0.55) p.ufs += ri(1, 2);
        var restam = 24 - (i - p.coletaIni);
        if (p.assin >= M_ * 1.25 && p.ufs >= 9) { p.fase = 2; p.ate = i + ri(2, 4); p.sit = "Cartórios eleitorais conferindo " + fmtN(p.assin) + " assinaturas"; }
        else if (restam <= 0) { encerrar(s, p, "prazo de 2 anos esgotado com " + fmtN(p.assin) + " assinaturas", false); nota("O " + p.nome + " perde o prazo de dois anos e as assinaturas de apoiamento caducam."); }
        else p.sit = "Coletando assinaturas · faltam " + restam + " meses do prazo";
      } else if (p.fase === 2) {
        if (i >= p.ate) {
          p.validas = p.assin * rnd(0.78, 0.92);
          if (p.validas >= M_) { p.fase = 3; p.sit = "Registrando diretórios nos TREs"; nota("Cartórios validam " + fmtN(p.validas) + " assinaturas do " + p.nome + ": apoiamento mínimo atingido."); }
          else { p.fase = 1; p.assin = p.validas; p.sit = "Cartórios rejeitaram parte das assinaturas: coleta retomada"; nota("Cartórios rejeitam assinaturas do " + p.nome + " (filiados, duplicadas ou irregulares); o partido volta às ruas."); }
        }
      } else if (p.fase === 3) {
        if (Math.random() < 0.8) p.dirs = Math.min(27, p.dirs + ri(1, 3));
        if (p.dirs >= 9) { p.fase = 4; p.sub = "mpe"; p.ate = i + ri(1, 3); p.sit = "Pedido protocolado no TSE · aguardando parecer do Ministério Público Eleitoral"; nota("O " + p.nome + " protocola o pedido de registro no TSE."); }
        else p.sit = "Diretórios estaduais registrados: " + p.dirs + "/9";
      } else if (p.fase === 4 && i >= p.ate) {
        if (p.sub === "mpe") { p.sub = "julg"; p.ate = i + ri(1, 4); p.sit = "Parecer favorável do MPE · em pauta para julgamento no plenário do TSE"; }
        else if (Math.random() < 0.85) { encerrar(s, p, "registro aprovado pelo TSE", true); concluir(p); }
        else { encerrar(s, p, "registro negado pelo TSE (irregularidades no apoiamento)", false); nota("TSE nega o registro do " + p.nome + " por irregularidades nas listas de apoiamento."); }
      }
    });
    // novos processos: um pouco mais frequentes que o antigo sorteio de 18%/ano
    var d = data();
    if (d.mes === 1 && Math.random() < 0.12 && s.lista.length < 7) novoProcesso(s, 0);
  };

  /* ---------------------------------------------------------------- janela */
  function barra(v, max) { var p = Math.max(0, Math.min(100, v / max * 100)); return '<span class="v3pf-bar"><i style="width:' + p.toFixed(1) + '%"></i></span>'; }
  function card() {
    var s = st(); if (!s) return "";
    iniciar(s);
    var i = idx(), M_ = meta(), ESP = { E: "Esquerda", C: "Centro", D: "Direita" };
    var h = '<section class="card v3pf"><h3>🏛️ Partidos em formação</h3><p class="txt">Pela Lei dos Partidos (9.096/95), um partido novo precisa de <b>101 fundadores</b> em 9 estados, <b>' + fmtN(M_) + ' assinaturas</b> de eleitores não filiados (0,5% dos votos válidos para a Câmara) em pelo menos 9 estados, em até <b>2 anos</b>; depois, conferência nos cartórios, diretórios em 9 TREs e julgamento no TSE. Para disputar uma eleição, o registro tem de sair até abril do ano eleitoral.</p>';
    if (!s.lista.length) h += '<p class="txt">Nenhum processo em andamento no TSE.</p>';
    s.lista.forEach(function (p) {
      h += '<div class="v3pf-item"><div class="v3pf-top"><b>' + esc_(p.nome) + '</b> <small>' + esc_(p.sigla) + " · " + (ESP[p.e] || "") + (p.band ? " · " + esc_(p.band.split(" (")[0]) : "") + "</small></div>";
      h += '<ol class="v3pf-fases">' + FASES.map(function (f, k) { return '<li class="' + (k < p.fase ? "ok" : k === p.fase ? "on" : "") + '">' + f + "</li>"; }).join("") + "</ol>";
      if (p.fase === 0) h += '<div class="v3pf-l">Fundadores ' + p.fund + "/101 " + barra(p.fund, 101) + "</div>";
      if (p.fase >= 1) {
        var assin = p.fase >= 3 ? p.validas : p.assin;
        h += '<div class="v3pf-l">' + (p.fase >= 3 ? "Assinaturas validadas " : "Assinaturas ") + fmtN(assin) + " / " + fmtN(M_) + " " + barra(assin, M_) + "</div>";
        h += '<div class="v3pf-l">Estados com apoiamento mínimo ' + Math.min(p.ufs, 27) + "/9 " + barra(Math.min(p.ufs, 9), 9) + "</div>";
        if (p.fase === 1) { var r = 24 - (i - p.coletaIni); h += '<div class="v3pf-l">Prazo: ' + r + " meses (até " + mesAno(p.coletaIni + 24) + ") " + barra(r, 24) + "</div>"; }
      }
      if (p.fase >= 3) h += '<div class="v3pf-l">Diretórios estaduais ' + Math.min(p.dirs, 27) + "/9 " + barra(Math.min(p.dirs, 9), 9) + "</div>";
      h += '<p class="v3pf-sit">' + esc_(p.sit) + "</p></div>";
    });
    if (s.hist.length) h += '<details class="v3pf-hist"><summary>Processos encerrados (' + s.hist.length + ")</summary>" + s.hist.map(function (x) { return '<p class="txt">' + (x.ok ? "✅" : "❌") + " <b>" + esc_(x.nome) + "</b> · " + mesAno(x.quando) + " · " + esc_(x.motivo) + "</p>"; }).join("") + "</details>";
    return h + "</section>";
  }
  PF.card = card;

  function instalar() {
    // o sorteio antigo (18%/ano, criação instantânea) passa a abrir um processo
    if (typeof nascePartido === "function" && !nascePartido.__v3pf) {
      var n = function () { var s = st(); if (s && s.lista.length < 7) novoProcesso(s, 0); };
      n.__v3pf = true; window.nascePartido = n; try { nascePartido = n; } catch (e) {}
    }
    try {
      if (typeof VIEWS === "object" && VIEWS.partido && !VIEWS.partido.__v3pf) {
        var v = VIEWS.partido; var nv = function () { var out = v.apply(this, arguments); try { out += card(); } catch (e) {} return out; };
        nv.__v3pf = true; VIEWS.partido = nv;
      }
    } catch (e) {}
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3pf) {
      var a = window.avancarMes;
      var na = function () { var r = a.apply(this, arguments); try { PF.mensal(); } catch (e) { console.warn("v3pf", e); } return r; };
      for (var k in a) { try { na[k] = a[k]; } catch (e) {} } na.__v3pf = true; window.avancarMes = na; try { avancarMes = na; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
