/* =============================================================================
   CADEIRA v3 — Jornalismo: fatos com memória, matéria completa e Brasil vivo
   Integra-se ao jornal existente (cadeira-v3-midia.js: "O Plenário", veículos
   e rede social) e ao arquivo de manchetes; não substitui nada.
   1. FATOS: qualquer módulo registra um acontecimento estruturado com
      V3NEWS.fato({...}) (dados, atores, declarações, fio). O fato vira
      manchete do jogo e fica no histórico da simulação (M().v3news).
   2. MATÉRIA COMPLETA: clicar numa manchete (jornal ou arquivo) abre a
      notícia com título, linha fina, veículo, data, local, texto, números,
      personagens, declarações e desdobramentos. Com IA (Gemini/Groq, mesma
      configuração dos Atos), a matéria é redigida SÓ a partir dos dados do
      jogo; números e aspas que não estão nos dados são descartados. A matéria
      gerada fica em cache e não é recriada a cada tela. Sem IA, o texto é
      montado a partir dos mesmos dados.
   3. BRASIL VIVO: todo mês a pauta nacional é tirada dos dados da simulação
      (Selic, inflação, dólar, bolsa, aprovação de governos) e entra no jornal,
      mesmo sem o jogador envolvido.
   4. CONTINUIDADE: matérias mostram a cronologia dos fatos ligados (mesmas
      pessoas, mesma obra, mesmo fio) e módulos podem agendar desdobramentos.
   5. FILTRO: notas pessoais triviais (aniversário, férias, almoço em família)
      saem do jornal, a menos que tenham peso político (ficam no diário).
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3NEWS) return;
  var NW = (window.V3NEWS = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function agora() { return ok(function () { return agoraM(); }, 0); }
  function D() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function nomeMes(m) { return ok(function () { return MESES[m]; }, String(m)); }
  function IA() { return window.V3ATOS && window.V3ATOS.temIA && window.V3ATOS.temIA() ? window.V3ATOS : null; }
  function st() {
    var m = ok(function () { return M(); }, null); if (!m) return null;
    if (!m.v3news || m.v3news.v !== 1) m.v3news = { v: 1, fatos: [], art: {}, artOrd: [], snap: null, ultMes: null, agenda: [], seq: 0, govVisto: {} };
    return m.v3news;
  }
  NW.estado = st;

  /* ---------------- veículos: identidade editorial (usa o cadastro do jornal) */
  var LINHA = {
    folha: "jornal de referência, cobertura política e de poder, tom crítico a qualquer governo",
    estadao: "jornal tradicional, liberal na economia, foco institucional e em contas públicas",
    g1: "portal de notícias factual, linguagem de serviço, explica o que muda para o leitor",
    cnn: "TV de notícias 24h, bastidores e repercussão imediata",
    dgabc: "jornal regional do Grande ABC, foco em Mauá, serviços públicos e política local",
    uol: "portal de grande audiência, factual com análise",
    metropoles: "bastidores de Brasília, furos e articulações",
    valor: "imprensa econômica, foco em mercado, juros, empresas e efeito fiscal",
    piaui: "revista de reportagem aprofundada, contexto e personagens",
    veja: "revista semanal, bastidores e tom crítico",
    oeste: "veículo de direita, crítico a governos e pautas de esquerda",
    icl: "veículo progressista, crítico à direita e ao mercado financeiro",
    forbes: "negócios e empreendedorismo",
    record: "TV popular, cotidiano, segurança e serviço",
    band: "jornalismo de TV, factual",
    sbt: "TV popular, linguagem simples",
    globo: "TV aberta de grande audiência, factual e didática",
    flow: "podcast de entrevistas, tom informal",
    podpah: "podcast de humor e entrevistas, tom informal"
  };
  NW.LINHA = LINHA;
  function VEIC() { return window.V3M_VEIC || {}; }
  function veicId(v) {
    if (!v) return "";
    var V = VEIC(); if (V[v]) return v;
    var s = slug(v);
    for (var k in V) if (slug(V[k].nome) === s || s.indexOf(slug(V[k].nome)) === 0) return k;
    return "";
  }
  function veicNome(v) { var id = veicId(v); return id ? VEIC()[id].nome : (v || "Redação"); }
  function logo(v) { var id = veicId(v); return id ? ok(function () { return window.V3MARCAS.logo(id); }, "") : ""; }

  /* ---------------- 1) FATOS */
  function snapshot() {
    var j = ok(function () { return J(); }, {}) || {}, d = D();
    return { data: (d.mes || 1) + "/" + d.ano, cargo: j.cargo_atual, partido: j.partido_atual, pop: Math.round(j.popularidade || 0), esc: Math.round(j.escandalo || 0), mercado: ok(function () { var x = M().mercado; return { dolar: x.dolar, bolsa: x.bolsa, inflacao: x.inflacao, selic: x.selic }; }, null) };
  }
  NW.fato = function (f) {
    var S_ = st(); if (!S_ || !f || !f.tit) return null;
    var d = D();
    f.id = "F" + (++S_.seq) + "_" + agora(); f.m = agora(); f.ano = d.ano; f.mes = d.mes; f.semana = d.semana || 0;
    f.sec = f.sec || "Política"; f.jog = !!f.jog; f.peso = f.peso || (f.jog ? 60 : 40);
    f.chave = slug(f.tit).slice(0, 70); f.ctx = snapshot();
    S_.fatos.unshift(f); if (S_.fatos.length > 300) S_.fatos.length = 300;
    if (f.manchete !== false) ok(function () { manchete(f.tit, f.tipoM || (f.jog ? "agenda" : "imprensa")); });
    if (f.diario) ok(function () { diario(f.diario); });
    return f;
  };
  // agenda de desdobramentos: { m (mês absoluto), tipo, dados }
  NW.agendar = function (a) { var S_ = st(); if (S_ && a && a.m != null) S_.agenda.push(a); };
  var GERADORES = {}; // tipo -> função(dados) que devolve um fato (ou null)
  NW.gerador = function (tipo, fn) { GERADORES[tipo] = fn; };
  function acharFato(tit) {
    var S_ = st(); if (!S_) return null; var s = slug(tit); if (!s) return null;
    for (var i = 0; i < S_.fatos.length; i++) { var c = S_.fatos[i].chave; if (c === s.slice(0, 70) || (s.length > 24 && (c.indexOf(s.slice(0, 40)) >= 0 || s.indexOf(c.slice(0, 40)) >= 0))) return S_.fatos[i]; }
    return null;
  }
  NW.acharFato = acharFato;

  /* ---------------- 2) BRASIL VIVO: pauta mensal tirada dos dados */
  var COPOM = { 1: 1, 3: 1, 5: 1, 6: 1, 7: 1, 9: 1, 11: 1, 12: 1 };
  function fmt(n, c) { return Number(n).toFixed(c == null ? 2 : c).replace(".", ","); }
  function npcs(re) { return ok(function () { return bancoDeNPCs.filter(function (n) { return n && n.vivo && re.test(n.cargo || ""); }); }, []); }
  function pauta() {
    var S_ = st(); if (!S_) return; var m = agora(); if (S_.ultMes === m) return; S_.ultMes = m;
    var d = D(), me = ok(function () { return M().mercado; }, null), sn = S_.snap, cid = ok(function () { return cargoAtualId(); }, "");
    if (me && sn) {
      var ds = Math.round((me.selic - sn.selic) * 100) / 100;
      if (Math.abs(ds) >= 0.1) NW.fato({ tipo: "economia", sec: "Economia", kick: "Juros", tit: "Copom " + (ds > 0 ? "eleva" : "reduz") + " a Selic para " + fmt(me.selic) + "% ao ano", lead: "A taxa básica de juros estava em " + fmt(sn.selic) + "%. A decisão " + (ds > 0 ? "encarece o crédito" : "barateia o crédito") + " e mexe com as projeções de crescimento.", dados: { selic_anterior: fmt(sn.selic) + "%", selic_atual: fmt(me.selic) + "%", inflacao_12m: fmt(me.inflacao) + "%" }, veic: "valor", peso: 46, tipoM: "economia", thread: "selic", esfera: "federal" });
      else if (COPOM[d.mes] && Math.random() < 0.5) NW.fato({ tipo: "economia", sec: "Economia", kick: "Juros", tit: "Copom mantém a Selic em " + fmt(me.selic) + "% ao ano", lead: "Com a inflação em 12 meses em " + fmt(me.inflacao) + "%, o Banco Central preferiu não mexer nos juros nesta reunião.", dados: { selic: fmt(me.selic) + "%", inflacao_12m: fmt(me.inflacao) + "%" }, veic: "valor", peso: 32, tipoM: "economia", thread: "selic", esfera: "federal" });
      var di = Math.round((me.inflacao - sn.inflacao) * 100) / 100;
      if (Math.abs(di) >= 0.2) NW.fato({ tipo: "economia", sec: "Economia", kick: "Inflação", tit: "Inflação em 12 meses " + (di > 0 ? "sobe" : "recua") + " para " + fmt(me.inflacao) + "%", lead: "No mês anterior, o índice acumulado estava em " + fmt(sn.inflacao) + "%. " + (di > 0 ? "A alta pressiona o orçamento das famílias." : "O alívio abre espaço para corte de juros."), dados: { inflacao_anterior: fmt(sn.inflacao) + "%", inflacao_atual: fmt(me.inflacao) + "%" }, veic: di > 0 ? "g1" : "estadao", peso: 38, tipoM: "economia", thread: "inflacao", esfera: "federal" });
      var dd = sn.dolar ? (me.dolar / sn.dolar - 1) * 100 : 0;
      if (Math.abs(dd) >= 2.5) NW.fato({ tipo: "economia", sec: "Economia", kick: "Câmbio", tit: "Dólar " + (dd > 0 ? "sobe" : "cai") + " " + fmt(Math.abs(dd), 1) + "% no mês e fecha a R$ " + fmt(me.dolar), lead: "A moeda americana estava em R$ " + fmt(sn.dolar) + " no fechamento anterior.", dados: { dolar_anterior: "R$ " + fmt(sn.dolar), dolar_atual: "R$ " + fmt(me.dolar), variacao: fmt(dd, 1) + "%" }, veic: "valor", peso: 34, tipoM: "economia", thread: "cambio", esfera: "federal" });
      var db = sn.bolsa ? (me.bolsa / sn.bolsa - 1) * 100 : 0;
      if (Math.abs(db) >= 4) NW.fato({ tipo: "economia", sec: "Economia", kick: "Bolsa", tit: "Ibovespa " + (db > 0 ? "dispara" : "despenca") + " " + fmt(Math.abs(db), 1) + "% no mês", lead: "O índice foi de " + fmt(sn.bolsa, 1) + " mil para " + fmt(me.bolsa, 1) + " mil pontos.", dados: { ibovespa_anterior: fmt(sn.bolsa, 1) + " mil pontos", ibovespa_atual: fmt(me.bolsa, 1) + " mil pontos" }, veic: "valor", peso: 30, tipoM: "economia", thread: "bolsa", esfera: "federal" });
    }
    if (me) S_.snap = { selic: me.selic, inflacao: me.inflacao, dolar: me.dolar, bolsa: me.bolsa };
    // governos: pesquisa de aprovação (dados da simulação), um por mês, alternando esferas
    var alvo = [["PRES", /^Presidente da República$/, "Presidente", "o governo federal", "federal"], ["GOV", /^Governador de SP$/, "Governador(a) de SP", "o governo paulista", "estadual"], ["PREF", /^Prefeito de Mauá$/, "Prefeito(a) de Mauá", "a prefeitura de Mauá", "municipal"], ["OUT", /^Governador$/, "Governador(a)", "o governo estadual", "estadual"]];
    var a = alvo[m % alvo.length];
    if (a[0] !== cid) {
      var l = npcs(a[1]).sort(function (x, y) { return hash(x.id + m) - hash(y.id + m); }), n = l[0];
      if (n && n.popularidade != null) {
        var pc = Math.round(n.popularidade), uf = a[0] === "OUT" && n.uf ? " (" + n.uf + ")" : "", ant = S_.govVisto[n.id];
        var var_ = ant != null ? pc - ant : null; S_.govVisto[n.id] = pc;
        NW.fato({ tipo: "pesquisa", sec: a[0] === "PREF" ? "Grande ABC" : "Política", kick: "Pesquisa", tit: "Pesquisa: " + n.nome + uf + " tem " + pc + "% de aprovação" + (var_ != null && Math.abs(var_) >= 2 ? ", " + (var_ > 0 ? "alta" : "queda") + " de " + Math.abs(var_) + " pontos" : ""),
          lead: "O levantamento mede a avaliação de " + a[3] + ". " + (pc >= 50 ? "A maioria aprova a gestão." : pc >= 35 ? "A avaliação está dividida." : "A desaprovação domina."), atores: [n.nome], dados: { aprovacao: pc + "%", partido: n.partido, variacao: var_ != null ? (var_ > 0 ? "+" : "") + var_ + " pontos" : "primeira medição" }, veic: a[0] === "PREF" ? "dgabc" : "folha", peso: 33, tipoM: "agenda", thread: "aprov-" + n.id, esfera: a[4] });
      }
    }
    // desdobramentos agendados
    var vence = S_.agenda.filter(function (x) { return x.m <= m; });
    S_.agenda = S_.agenda.filter(function (x) { return x.m > m; });
    vence.forEach(function (x) { var g = GERADORES[x.tipo]; if (g) ok(function () { var f = g(x.dados || {}, x); if (f) NW.fato(f); }); });
  }
  NW.pauta = pauta;

  /* ---------------- 3) JORNAL: filtro de trivialidades, ligação com fatos e injeção */
  var TRIVIAL = /anivers[aá]rio|com (o|a|os|as) filh|com a fam[ií]lia|em fam[ií]lia|f[eé]rias|churrasco|almo[cç]o de domingo|jantar com|passeio|dia dos pais|dia das m[aã]es|casamento d[oa]s? filh|academia|futebol com amigos|pescaria/i;
  var PESO_POL = /esc[aâ]ndalo|investiga|pol[ií]cia|PF\b|MP\b|den[uú]ncia|pesquisa|vota|elei|cpi|stf|tse|caixa ?2|corrup/i;
  function trivial(m) { var t = (m.tit || "") + " " + (m.kick || ""); return TRIVIAL.test(t) && !PESO_POL.test(t); }
  NW.trivial = trivial;
  function processar(ed) {
    if (!ed || !ed.materias) return ed;
    var S_ = st(); if (!S_) return ed;
    if (!ed._v3triv) { var antes = ed.materias.length; var f = ed.materias.filter(function (x) { return !trivial(x); }); if (f.length) ed.materias = f; ed._v3triv = antes - ed.materias.length + 1; }
    var tem = {}; ed.materias.forEach(function (x) { tem[slug(x.tit).slice(0, 50)] = 1; if (!x.fid) { var fa = acharFato(x.tit); if (fa) { x.fid = fa.id; fa.ed = fa.ed || ed.key; } } if (!x._ctx) x._ctx = { ano: ed.ano, mes: ed.mes }; });
    var lim = (ed.mes != null ? ed.ano * 12 + ed.mes : 0) - 2;
    S_.fatos.filter(function (fa) { return !fa.ed && fa.peso >= 28 && (fa.ano * 12 + fa.mes) >= lim; }).slice(0, 6).forEach(function (fa) {
      var k = slug(fa.tit).slice(0, 50); fa.ed = ed.key; if (tem[k]) return; tem[k] = 1;
      ed.materias.push({ sec: fa.sec, kick: fa.kick || "", tit: fa.tit, lead: fa.lead || "", veic: veicId(fa.veic) || "folha", tom: fa.tom || "neu", jog: fa.jog, peso: fa.peso, fid: fa.id, _ctx: { ano: fa.ano, mes: fa.mes } });
    });
    if (ed.materias.length > 1) { var p0 = ed.materias[0]; var resto = ed.materias.slice(1).sort(function (a, b) { return (b.peso || 0) - (a.peso || 0); }); ed.materias = [p0].concat(resto).slice(0, 15); }
    return ed;
  }
  NW.processar = processar;

  /* ---------------- 4) MATÉRIA COMPLETA */
  var IDX_NPC = null;
  function entidades(txt) {
    var out = [], s = " " + String(txt || "") + " ";
    if (!IDX_NPC) IDX_NPC = ok(function () { return bancoDeNPCs.filter(function (n) { return n && n.nome && n.nome.length > 6; }).sort(function (a, b) { return b.nome.length - a.nome.length; }); }, []);
    for (var i = 0; i < IDX_NPC.length && out.length < 5; i++) { var n = IDX_NPC[i]; if (s.indexOf(n.nome) >= 0 && !out.some(function (o) { return o.nome.indexOf(n.nome) >= 0; })) out.push(n); }
    var jn = ok(function () { return J().nome; }, ""); if (jn && s.indexOf(jn) >= 0) out.unshift({ nome: jn, jogador: true });
    return out;
  }
  function cronologia(tit, fa, ents) {
    var chaves = ents.map(function (e) { return e.nome; }), q = (String(tit).match(/["“]([^"”]{6,})["”]/) || [])[1];
    if (q) chaves.push(q);
    var l = [], s0 = slug(tit), S_ = st();
    if (fa && fa.thread && S_) S_.fatos.forEach(function (x) { if (x.thread === fa.thread && x.id !== fa.id) l.push({ txt: x.tit, ano: x.ano, mes: x.mes }); });
    if (chaves.length) ok(function () { M().manchetes.forEach(function (x) { if (!x || !x.txt || slug(x.txt) === s0) return; if (chaves.some(function (c) { return x.txt.indexOf(c) >= 0; })) l.push({ txt: x.txt, ano: x.ano, mes: x.mes }); }); });
    var vistos = {}; l = l.filter(function (x) { var k = slug(x.txt).slice(0, 60); if (vistos[k]) return false; vistos[k] = 1; return true; });
    return l.slice(0, 8);
  }
  function infoNpc(n) { if (n.jogador) { var j = J(); return { nome: j.nome, papel: j.cargo_atual + " (" + j.partido_atual + ")", jogador: true, aprovacao: Math.round(j.popularidade || 0) + "%" }; } return { nome: n.nome, papel: (n.papel || n.cargo || "") + (n.partido ? " (" + n.partido + ")" : ""), uf: n.uf, idade: n.idade }; }
  function contextoPais() {
    return ok(function () {
      var pr = bancoDeNPCs.find(function (n) { return n.vivo && n.cargo === "Presidente da República"; }), gv = bancoDeNPCs.find(function (n) { return n.vivo && n.cargo === "Governador de SP"; }), pf = bancoDeNPCs.find(function (n) { return n.vivo && n.cargo === "Prefeito de Mauá"; }), j = J(), c = cargoAtualId();
      return { presidente: c === "PRES" ? j.nome : pr && pr.nome, governador_sp: c === "GOV" ? j.nome : gv && gv.nome, prefeito_maua: c === "PREF" ? j.nome : pf && pf.nome, mercado: M().mercado };
    }, {});
  }
  function chaveArt(m) { return slug((m.veic || "") + " " + m.tit).slice(0, 90); }
  function guardar(k, a) {
    var S_ = st(); if (!S_) return;
    S_.art[k] = a; S_.artOrd = (S_.artOrd || []).filter(function (x) { return x !== k; }); S_.artOrd.unshift(k);
    while (S_.artOrd.length > 40) { var v = S_.artOrd.pop(); delete S_.art[v]; }
  }
  var ART_SCHEMA = {
    type: "OBJECT",
    properties: {
      subtitulo: { type: "STRING" }, local: { type: "STRING" }, corpo: { type: "ARRAY", items: { type: "STRING" } },
      declaracoes: { type: "ARRAY", items: { type: "OBJECT", properties: { quem: { type: "STRING" }, fala: { type: "STRING" } }, required: ["quem", "fala"] } },
      numeros: { type: "ARRAY", items: { type: "OBJECT", properties: { rotulo: { type: "STRING" }, valor: { type: "STRING" } }, required: ["rotulo", "valor"] } },
      contexto: { type: "STRING" }, proximos_passos: { type: "STRING" }
    },
    required: ["subtitulo", "corpo"]
  };
  function dadosMateria(m) {
    var fa = m.fid ? (st().fatos.filter(function (x) { return x.id === m.fid; })[0] || null) : acharFato(m.tit);
    var ents = entidades(m.tit + " " + (m.lead || "") + " " + (fa ? (fa.atores || []).join(" ") : ""));
    var crono = cronologia(m.tit, fa, ents), dd = m._ctx || {};
    return { fa: fa, ents: ents, crono: crono, base: {
      manchete: m.tit, linha_fina: m.lead || "", editoria: m.sec + (m.kick ? " / " + m.kick : ""), data: (fa ? fa.mes + "/" + fa.ano : (dd.mes || D().mes) + "/" + (dd.ano || D().ano)),
      fato: fa ? { tipo: fa.tipo, local: fa.local, esfera: fa.esfera, dados: fa.dados || null, declaracoes: fa.declaracoes || [], atores: fa.atores || [], resumo: fa.resumo || "" } : null,
      personagens: ents.map(infoNpc), cronologia: crono.map(function (x) { return x.mes + "/" + x.ano + ": " + x.txt; }),
      jogador_envolvido: !!m.jog || ents.some(function (e) { return e.jogador; }), contexto_do_pais: contextoPais(), situacao_do_jogador: fa ? fa.ctx : null
    } };
  }
  function offline(m, X) {
    var fa = X.fa, b = X.base, c = [], V = veicNome(m.veic);
    c.push((m.lead ? m.lead : m.tit + ".") + (fa && fa.resumo ? " " + fa.resumo : ""));
    var pers = b.personagens.filter(function (p) { return !p.jogador; });
    if (b.jogador_envolvido) ok(function () { var j = J(); c.push(j.nome + ", " + (j.cargo_atual || "sem cargo") + " pelo " + j.partido_atual + ", tem hoje " + Math.round(j.popularidade || 0) + "% de aprovação nas pesquisas do jogo" + (j.escandalo > 20 ? " e convive com desgaste de imagem" : "") + "."); });
    if (pers.length) c.push("Estão citados no caso: " + pers.map(function (p) { return p.nome + (p.papel ? ", " + p.papel : ""); }).join("; ") + ".");
    if (/Econom/.test(m.sec)) ok(function () { var me = M().mercado; c.push("No cenário atual, a Selic está em " + fmt(me.selic) + "% ao ano, a inflação em 12 meses em " + fmt(me.inflacao) + "% e o dólar a R$ " + fmt(me.dolar) + "."); });
    if (X.crono.length) c.push("O episódio se soma a outros fatos recentes: " + X.crono.slice(0, 3).map(function (x) { return "em " + nomeMes(x.mes) + " de " + x.ano + ", " + x.txt.replace(/[.]$/, ""); }).join("; ") + ".");
    if (fa && fa.dados && !/Econom/.test(m.sec)) c.push("Detalhes divulgados: " + Object.keys(fa.dados).slice(0, 5).map(function (k) { return k.replace(/_/g, " ") + ": " + fa.dados[k]; }).join("; ") + ".");
    var prox = { Economia: "Os próximos indicadores e a reunião do Copom devem mostrar se a tendência se mantém.", "Grande ABC": "A Câmara Municipal e moradores devem acompanhar os desdobramentos nas próximas semanas.", Justiça: "O caso ainda pode ter novos capítulos nos tribunais." }[m.sec] || "Os desdobramentos devem ser acompanhados nas próximas semanas.";
    return { subtitulo: m.lead || "", local: (fa && fa.local) || (/ABC|Mauá/.test(m.sec + m.tit) ? "Mauá (SP)" : /Econom/.test(m.sec) ? "São Paulo" : "Brasília"), corpo: c, declaracoes: (fa && fa.declaracoes) || [], numeros: fa && fa.dados ? Object.keys(fa.dados).slice(0, 6).map(function (k) { return { rotulo: k.replace(/_/g, " "), valor: String(fa.dados[k]) }; }) : [], contexto: "", proximos_passos: prox, _off: true, veic: V };
  }
  function promptArt(m, X) {
    var vid = veicId(m.veic) || "folha";
    return [
      "Você é redator(a) de " + veicNome(vid) + " (linha editorial: " + (LINHA[vid] || "jornalismo geral") + ") num jogo de simulação política brasileiro.",
      "Escreva a MATÉRIA COMPLETA da manchete abaixo usando SOMENTE os DADOS fornecidos.",
      "REGRAS: 1) não invente fatos, números, datas, votos, resultados, cargos ou nomes que não estejam nos dados; 2) só use aspas (declaracoes) com falas que estejam nos dados; se não houver, devolva declaracoes []; 3) numeros só com valores presentes nos dados; 4) se faltar informação, diga que os detalhes não foram divulgados, sem especular como fato; 5) pirâmide invertida, 4 a 6 parágrafos curtos, português do Brasil; 6) o enquadramento pode seguir a linha do veículo, mas os fatos são os mesmos para qualquer jornal; 7) a cronologia serve para contextualizar desdobramentos.",
      "DADOS (JSON): " + JSON.stringify(X.base),
      "Devolva: subtitulo (linha fina), local (cidade da notícia), corpo (parágrafos), declaracoes, numeros, contexto (1 frase de pano de fundo), proximos_passos (1 frase)."
    ].join("\n");
  }
  function validar(a, X) {
    var fonte = JSON.stringify(X.base);
    a.declaracoes = (Array.isArray(a.declaracoes) ? a.declaracoes : []).filter(function (d) { return d && d.fala && fonte.indexOf(String(d.fala).slice(0, 40)) >= 0; });
    a.numeros = (Array.isArray(a.numeros) ? a.numeros : []).filter(function (n) { var dig = String(n && n.valor || "").replace(/[^\d]/g, ""); return dig && fonte.replace(/[^\d]/g, " ").indexOf(dig.slice(0, 4)) >= 0; });
    a.corpo = (Array.isArray(a.corpo) ? a.corpo : []).map(function (p) { return String(p).slice(0, 900); }).filter(Boolean).slice(0, 7);
    return a;
  }
  var aberta = null;
  NW.abrir = function (m) {
    if (!m || !m.tit) return;
    m.veic = veicId(m.veic) || m.veic || "folha";
    var k = chaveArt(m), S_ = st(), X = dadosMateria(m);
    aberta = { m: m, X: X, k: k, art: S_ && S_.art[k] || null, carregando: false, erro: "" };
    if (!aberta.art) {
      if (IA()) { aberta.carregando = true; IA().iaJSON(promptArt(m, X), ART_SCHEMA, 0.5).then(function (a) { a = validar(a, X); a._ia = a._ia || ""; guardar(k, a); if (aberta && aberta.k === k) { aberta.art = a; aberta.carregando = false; desenhar(); } })
        .catch(function (e) { var a = offline(m, X); guardar(k, a); if (aberta && aberta.k === k) { aberta.art = a; aberta.carregando = false; aberta.erro = "IA indisponível (" + ((e && e.amigavel) || "erro") + "); texto montado a partir dos dados."; desenhar(); } }); }
      else { aberta.art = offline(m, X); guardar(k, aberta.art); }
    }
    desenhar();
  };
  NW.fechar = function () { aberta = null; desenhar(); };
  function hora(k) { var h = hash(k); return String(6 + h % 15).padStart(2, "0") + "h" + String(h % 60).padStart(2, "0"); }
  function fotoDe(e) { if (e.jogador) return ok(function () { return J().foto || ""; }, ""); return ok(function () { return obterFotoPolitico(e); }, ""); }
  function desenhar() {
    var el = document.getElementById("v3news");
    if (!aberta) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "v3news"; document.body.appendChild(el); }
    var m = aberta.m, a = aberta.art, X = aberta.X, vid = veicId(m.veic) || "folha", V = VEIC()[vid] || { nome: veicNome(vid), cor: "#334155" }, lg = logo(vid);
    var data = X.base.data.split("/"), dia = 1 + hash(aberta.k) % 27, dtxt = data.length === 2 ? (dia === 1 ? "1º" : dia) + " de " + nomeMes(+data[0]) + " de " + data[1] : X.base.data;
    var h = '<div class="v3n-ov" data-v3n="fora"><article class="v3n-box" role="dialog" aria-label="Notícia"><header class="v3n-top" style="--cor:' + esc_(V.cor || "#334155") + '">' + (lg ? '<img src="' + esc_(lg) + '" alt="">' : "") + "<b>" + esc_(V.nome) + '</b><button type="button" data-v3n="fechar" aria-label="Fechar">✕</button></header>';
    h += '<div class="v3n-corpo"><div class="v3n-kick">' + esc_(m.sec || "") + (m.kick ? " · " + esc_(m.kick) : "") + "</div><h1>" + esc_(m.tit) + "</h1>";
    if (a && a.subtitulo) h += '<p class="v3n-sub">' + esc_(a.subtitulo) + "</p>";
    h += '<div class="v3n-meta">' + esc_((a && a.local) || "") + (a && a.local ? " · " : "") + esc_(dtxt) + " · " + hora(aberta.k) + " · Por Redação " + esc_(V.nome) + "</div>";
    if (aberta.carregando) h += '<div class="v3n-load"><span></span><span></span><span></span><small>A redação está apurando os fatos...</small></div>';
    else if (a) {
      if (aberta.erro) h += '<p class="v3n-aviso">' + esc_(aberta.erro) + "</p>";
      h += '<div class="v3n-texto">' + a.corpo.map(function (p) { return "<p>" + esc_(p) + "</p>"; }).join("") + "</div>";
      if (a.declaracoes && a.declaracoes.length) h += a.declaracoes.slice(0, 3).map(function (d) { return '<blockquote class="v3n-decl">“' + esc_(d.fala) + "”<cite>" + esc_(d.quem) + "</cite></blockquote>"; }).join("");
      if (a.contexto) h += '<p class="v3n-ctx"><b>Contexto.</b> ' + esc_(a.contexto) + "</p>";
      if (a.proximos_passos) h += '<p class="v3n-ctx"><b>Próximos passos.</b> ' + esc_(a.proximos_passos) + "</p>";
      var lat = "";
      if (a.numeros && a.numeros.length) lat += '<section class="v3n-box2"><h4>Em números</h4>' + a.numeros.slice(0, 6).map(function (n) { return "<div><b>" + esc_(n.valor) + "</b><small>" + esc_(n.rotulo) + "</small></div>"; }).join("") + "</section>";
      if (X.ents.length) lat += '<section class="v3n-box2"><h4>Personagens</h4>' + X.ents.map(function (e) { var f = fotoDe(e), i = infoNpc(e); return '<div class="v3n-pers">' + (f ? '<img src="' + esc_(f) + '" alt="" onerror="this.remove()">' : "<i>" + esc_(e.nome.charAt(0)) + "</i>") + "<span><b>" + esc_(i.nome) + "</b><small>" + esc_(i.papel || "") + "</small></span></div>"; }).join("") + "</section>";
      if (X.crono.length) lat += '<section class="v3n-box2"><h4>Desdobramentos</h4><ol class="v3n-crono">' + X.crono.map(function (x, i) { return '<li><button type="button" data-v3n="crono" data-i="' + i + '"><small>' + esc_(nomeMes(x.mes).slice(0, 3) + "/" + x.ano) + "</small>" + esc_(x.txt) + "</button></li>"; }).join("") + "</ol></section>";
      if (lat) h += '<div class="v3n-lat">' + lat + "</div>";
      if (a.versoes) h += '<section class="v3n-box2 v3n-vers"><h4>Como outros veículos noticiaram</h4>' + a.versoes.map(function (v) { return "<div><small>" + esc_(veicNome(v.veiculo)) + "</small><b>" + esc_(v.titulo) + "</b>" + (v.enquadramento ? "<span>" + esc_(v.enquadramento) + "</span>" : "") + "</div>"; }).join("") + "</section>";
      else h += '<button type="button" class="v3n-btn" data-v3n="versoes">Ver como outros veículos noticiaram</button>';
      h += '<p class="v3n-fonte">' + (a._off ? "Texto montado a partir dos dados da simulação." : "Redigido por IA (" + esc_(a._ia || "") + ") apenas com os dados da simulação.") + "</p>";
    }
    h += "</div></article></div>";
    el.innerHTML = h;
  }
  var VERS_SCHEMA = { type: "OBJECT", properties: { versoes: { type: "ARRAY", items: { type: "OBJECT", properties: { veiculo: { type: "STRING" }, titulo: { type: "STRING" }, enquadramento: { type: "STRING" } }, required: ["veiculo", "titulo"] } } }, required: ["versoes"] };
  function versoes() {
    if (!aberta || !aberta.art || aberta.art.versoes) return;
    var a = aberta.art, m = aberta.m, X = aberta.X, k = aberta.k, base = veicId(m.veic);
    var outros = Object.keys(VEIC()).filter(function (v) { return v !== base && LINHA[v] && !/flow|podpah|forbes/.test(v); });
    var esc3 = /Econom/.test(m.sec) ? ["valor", "icl", "oeste"] : m.sec === "Grande ABC" ? ["dgabc", "record", "folha"] : ["folha", "oeste", "icl"];
    esc3 = esc3.filter(function (v) { return v !== base && outros.indexOf(v) >= 0; }).concat(outros).slice(0, 3);
    function off() {
      var t = m.tit.replace(/[.]$/, "");
      return esc3.map(function (v, i) { return { veiculo: v, titulo: i === 0 ? t : i === 1 ? t + ": críticos apontam problemas" : t + "; aliados comemoram", enquadramento: LINHA[v] }; });
    }
    if (!IA()) { a.versoes = off(); guardar(k, a); desenhar(); return; }
    a.versoes = [{ veiculo: "…", titulo: "Consultando as redações..." }]; desenhar();
    IA().iaJSON(["Para o MESMO fato abaixo, escreva como 3 veículos diferentes dariam a manchete, cada um com sua linha editorial. Os fatos não mudam; muda o enquadramento e o destaque. Não invente números nem fatos.",
      "Veículos: " + esc3.map(function (v) { return v + " (" + veicNome(v) + ": " + LINHA[v] + ")"; }).join("; "), "FATO (JSON): " + JSON.stringify({ manchete: m.tit, linha_fina: m.lead, texto: a.corpo, dados: X.base.fato }),
      "Devolva versoes: [{veiculo (use o id), titulo (até 110 caracteres), enquadramento (1 frase dizendo o que o veículo destacou)}]."].join("\n"), VERS_SCHEMA, 0.7)
      .then(function (r) { a.versoes = (r.versoes || []).slice(0, 3).map(function (v) { return { veiculo: veicId(v.veiculo) || v.veiculo, titulo: String(v.titulo || "").slice(0, 140), enquadramento: String(v.enquadramento || "").slice(0, 200) }; }); if (!a.versoes.length) a.versoes = off(); guardar(k, a); desenhar(); })
      .catch(function () { a.versoes = off(); guardar(k, a); desenhar(); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3n]");
    if (b && aberta) {
      var k = b.getAttribute("data-v3n");
      if (k === "fora" && e.target !== b) return;
      e.preventDefault(); e.stopPropagation();
      if (k === "fechar" || k === "fora") NW.fechar();
      else if (k === "versoes") versoes();
      else if (k === "crono") { var x = aberta.X.crono[+b.getAttribute("data-i")]; if (x) NW.abrirManchete(x); }
      return;
    }
    // clique numa matéria do jornal
    var art = e.target.closest && e.target.closest(".v3m-jornal article.v3m-princ, .v3m-jornal article.v3m-mat");
    if (art && !e.target.closest("details, button, a")) {
      var lista = Array.prototype.slice.call(document.querySelectorAll(".v3m-jornal article.v3m-princ, .v3m-jornal article.v3m-mat")), i = lista.indexOf(art);
      var ed = ok(function () { return window.MIDIA3.edicao(S.v3ed); }, null), m = ed && ed.materias[i];
      if (m) { e.preventDefault(); e.stopPropagation(); NW.abrir({ sec: m.sec, kick: m.kick, tit: m.tit, lead: m.lead, veic: m.veic, tom: m.tom, jog: m.jog, fid: m.fid, _ctx: m._ctx || { ano: ed.ano, mes: ed.mes } }); }
      return;
    }
    // clique no arquivo de manchetes / notícias do mês
    var p = e.target.closest && e.target.closest("p.news");
    if (p) { var sm = p.querySelector("small"), txt = p.textContent.replace(sm ? sm.textContent : "", "").trim(); var x2 = ok(function () { return M().manchetes.filter(function (q) { return q.txt === txt; })[0]; }, null); e.preventDefault(); NW.abrirManchete(x2 || { txt: txt }); }
  }, true);
  var SEC_TIPO = { economia: "Economia", eleicao: "Eleições", leg: "Congresso", obras: "Cidades", diplomacia: "Mundo", saude: "Gente", imprensa: "Política", agenda: "Política", governo: "Governo", janela: "Partidos", partido: "Partidos", posse: "Política", pre: "Bastidores", convencao: "Partidos" };
  NW.abrirManchete = function (x) {
    if (!x || !x.txt) return;
    var t = String(x.txt).replace(/^\[[^\]]+\]\s*/, ""), fa = acharFato(t), kv = t.match(/^([^:]{3,40}):\s+(.+)$/), vid = kv ? veicId(kv[1]) : "";
    NW.abrir({ sec: fa ? fa.sec : SEC_TIPO[x.tipo] || "Política", kick: fa ? fa.kick : "", tit: vid ? kv[2] : t, lead: fa ? fa.lead : "", veic: vid || (fa && fa.veic) || (x.tipo === "economia" ? "valor" : /Mauá|ABC/.test(t) ? "dgabc" : "folha"), jog: fa ? fa.jog : ok(function () { return t.indexOf(J().nome) >= 0; }, false), fid: fa && fa.id, _ctx: { ano: x.ano, mes: x.mes } });
  };

  /* ---------------- instalação */
  function instalar() {
    var MID = window.MIDIA3;
    if (MID && MID.edicao && !MID.edicao.__v3n) {
      var o = MID.edicao;
      MID.edicao = function () { var ed = o.apply(this, arguments); try { processar(ed); } catch (e) { console.warn("v3news", e); } return ed; };
      MID.edicao.__v3n = true;
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3news) {
      var a = window.avancarMes;
      var n = function () { var mes0 = agora(); var r = a.apply(this, arguments); try { if (agora() !== mes0) { pauta(); var ed = ok(function () { return window.MIDIA3.edicao(); }, null); if (ed) processar(ed); } } catch (e) { console.warn("v3news pauta", e); } return r; };
      for (var k in a) { try { n[k] = a[k]; } catch (e2) {} }
      n.__v3news = true; window.avancarMes = n; try { avancarMes = n; } catch (e3) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 140); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
