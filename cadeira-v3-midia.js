/* =============================================================================
   CADEIRA v3 — Mídia: Jornal do mês + Rede social reativa
   - Cada virada de turno fecha uma EDIÇÃO montada com o que aconteceu de fato:
     decisão no evento, motivos da variação de aprovação, projeção de votos,
     carreira, economia, manchetes do mundo (agrupadas, sem spam) e coluna.
   - A rede social reage às matérias daquela edição: rivais, aliados, eleitores
     do seu bairro, imprensa e influenciadores. Seus posts ganham respostas.
   - Tudo fica salvo em M().v3midia (vai junto com o save); as edições não
     mudam a cada render e variam de um mês para o outro.
   Não remove nada: a aba Imprensa antiga vira "Assessoria" e continua igual.
   ============================================================================= */
(function () {
  "use strict";
  if (window.MIDIA3) return;
  var MID = (window.MIDIA3 = {});
  var MAX_EDICOES = 12;

  /* ------------------------------------------------------------------ utilidades */
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pj(a) { return esc_(JSON.stringify(a)); }
  function hash(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function entre(r, a, b) { return Math.round(a + r() * (b - a)); }
  function embaralha(r, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lc1(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
  function uc1(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function limpa(s) {
    return String(s || "").replace(/\[SIMULA[ÇC][ÃA]O\]\s*/gi, "").replace(/\[JANELA\]\s*/gi, "").replace(/\s*\(personagem fict[ií]cio\)/gi, "").replace(/\s+/g, " ").trim();
  }
  function semPonto(s) { return String(s || "").replace(/[.\s]+$/, ""); }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function tag(s) {
    var w = String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
    return "#" + w.slice(0, 4).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join("");
  }
  function fmtN(n) { try { return Math.round(n).toLocaleString("pt-BR"); } catch (e) { return String(Math.round(n)); } }
  function fmtK(n) { n = Math.round(n); if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " mi"; if (n >= 1e4) return Math.round(n / 1e3) + " mil"; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".", ",") + " mil"; return String(n); }
  function sinal(x, d) { var v = (Math.abs(x)).toFixed(d == null ? 1 : d).replace(".", ","); return (x >= 0 ? "+" : "−") + v; }
  function ok(f, def) { try { var v = f(); return v === undefined ? def : v; } catch (e) { return def; } }

  function J_() { return ok(function () { return J(); }, null); }
  function M_() { return ok(function () { return M(); }, null); }
  function D_() { return ok(function () { return dt(); }, { ano: 2026, mes: 1, turno_total: 0, semana: 0 }); }
  function nomeMes(m) { return ok(function () { return MESES[m]; }, String(m)); }
  function nomeTerr(id) { return ok(function () { var t = TERRITORIOS.find(function (x) { return x.id === id; }); return t ? t.nome : ""; }, ""); }
  function grupoTerr(id) { return ok(function () { var t = TERRITORIOS.find(function (x) { return x.id === id; }); return t ? t.grupo : ""; }, ""); }
  function espectro(p) { return ok(function () { return (PARTIDOS[p] || {}).e; }, "C"); }
  function siglaP(p) { return ok(function () { return (PARTIDOS[p] || {}).sigla || p; }, p); }

  /* ------------------------------------------------------------------ estado salvo */
  function estado() {
    var m = M_(); if (!m) return null;
    if (!m.v3midia || m.v3midia.v !== 1) m.v3midia = { v: 1, eds: {}, ordem: [], marcaMan: null, marcaDia: null, meus: [], acoes: {}, lido: null, usados: [] };
    return m.v3midia;
  }
  function chaveMan(x) { return x ? hash((x.txt || "") + "|" + x.ano + "|" + x.mes) : 0; }

  /* ------------------------------------------------------------------ veículos e contas */
  var VEIC = {
    folha: { nome: "Folha de S.Paulo", handle: "@folha", cor: "#1d4ed8" },
    estadao: { nome: "Estadão", handle: "@Estadao", cor: "#334155" },
    g1: { nome: "g1", handle: "@g1", cor: "#c4170c" },
    cnn: { nome: "CNN Brasil", handle: "@CNNBrasil", cor: "#cc0000" },
    dgabc: { nome: "Diário do Grande ABC", handle: "@diariodoabc", cor: "#0f766e" },
    uol: { nome: "UOL", handle: "@UOL", cor: "#d97706" },
    metropoles: { nome: "Metrópoles", handle: "@Metropoles", cor: "#7c3aed" },
    valor: { nome: "Valor Econômico", handle: "@valoreconomico", cor: "#065f46" },
    piaui: { nome: "piauí", handle: "@revistapiaui", cor: "#111827" },
    veja: { nome: "Veja", handle: "@VEJA", cor: "#b91c1c" },
    oeste: { nome: "Revista Oeste", handle: "@revistaoeste", cor: "#a16207" },
    icl: { nome: "ICL Notícias", handle: "@iclnoticias", cor: "#1e1b4b" },
    forbes: { nome: "Forbes Brasil", handle: "@forbesbr", cor: "#111111" },
    record: { nome: "Record", handle: "@recordtvoficial", cor: "#2563eb" },
    flow: { nome: "Flow News", handle: "@flownews", cor: "#0a0a0a" },
    podpah: { nome: "Podpah", handle: "@podpah", cor: "#facc15" }
  };
  window.V3M_VEIC = VEIC;
  function logoVeic(vid) { return ok(function () { return window.V3MARCAS ? window.V3MARCAS.logo(vid) : ""; }, ""); }
  // veículo citado no texto ("em entrevista à CNN Brasil...")
  function veicNoTexto(t) {
    t = String(t || ""); var achou = null;
    Object.keys(VEIC).forEach(function (k) { var n = VEIC[k].nome; if (!achou && n.length > 2 && t.indexOf(n) >= 0) achou = k; });
    return achou;
  }
  var INFLU = [
    { nome: "Felipe Neto", lado: "E", tipo: "Criador de conteúdo", seg: 16e6 },
    { nome: "Leonardo Sakamoto", lado: "E", tipo: "Jornalista", seg: 9e5 },
    { nome: "Luis Nassif", lado: "E", tipo: "Jornalista", seg: 6e5 },
    { nome: "Rodrigo Constantino", lado: "D", tipo: "Comentarista", seg: 1.4e6 },
    { nome: "Caio Coppola", lado: "D", tipo: "Comentarista", seg: 9e5 },
    { nome: "Augusto Nunes", lado: "D", tipo: "Jornalista", seg: 8e5 },
    { nome: "Monark", lado: "D", tipo: "Podcaster", seg: 2.1e6 },
    { nome: "Vera Magalhães", lado: "C", tipo: "Jornalista política", seg: 5.5e5 },
    { nome: "Reinaldo Azevedo", lado: "C", tipo: "Colunista", seg: 8.6e5 },
    { nome: "Guga Chacra", lado: "C", tipo: "Comentarista", seg: 1.1e6 },
    { nome: "José Luiz Datena", lado: "C", tipo: "Apresentador", seg: 2.4e6 }
  ];
  var NOMES = ["Marcos", "Renata", "Josi", "Edson", "Cláudia", "Dona Cida", "Tiago", "Luana", "Seu Zé", "Patrícia", "Wellington", "Bruna", "Rogério", "Kelly", "Anderson", "Simone", "Gabriel", "Vânia", "Diego", "Rose", "Fábio", "Jéssica", "Paulo", "Márcia"];
  var SOBRE = ["da quebrada", "Silva", "Souza", "Oliveira", "Santos", "Lima", "da padaria", "do bar", "Ferreira", "Costa", "Pereira", "Almeida", "do ponto", "da feira", "Rocha", "Nunes"];

  function npcFoto(n) { return ok(function () { return (typeof obterFotoPolitico === "function" ? obterFotoPolitico(n) : "") || n.foto || ""; }, ""); }
  function npcs() { return ok(function () { return bancoDeNPCs.filter(function (n) { return n && n.vivo && !n.jogador; }); }, []); }
  function politicos() { return npcs().filter(function (n) { return n.partido && n.cargo && /Vereador|Deputad|Senador|Prefeit|Governador|Presidente|Ministr|Secret/.test(n.cargo); }); }
  function contaNpc(n, papel) {
    return { nome: n.nome, handle: "@" + slug(n.nome).slice(0, 15), tipo: "politico", papel: papel,
      sub: (siglaP(n.partido) || "") + " · " + (n.cargo || ""), seg: Math.max(2e3, Math.round((n.popularidade || 20) * 9e3 + (n.base_votos || 0) / 40)), selo: !!n.real, id: n.id };
  }
  function contaInflu(r, lado) {
    var lista = INFLU.filter(function (x) { return !lado || x.lado === lado; });
    var x = pick(r, lista.length ? lista : INFLU);
    var n = npcs().find(function (k) { return k.nome === x.nome; });
    return { nome: x.nome, handle: "@" + slug(x.nome), tipo: "influencer", sub: x.tipo, seg: x.seg, selo: true, lado: x.lado };
  }
  function contaMidia(vid) { var v = VEIC[vid] || VEIC.g1; return { nome: v.nome, handle: v.handle, tipo: "midia", sub: "Veículo de imprensa", seg: 4e6, selo: true, cor: v.cor, logo: vid }; }
  function contaCidadao(r, bairro) {
    var n = pick(r, NOMES), s = pick(r, SOBRE);
    var nome = n + " " + s;
    return { nome: nome, handle: "@" + slug(n).slice(0, 8) + "_" + slug(bairro || "abc").slice(0, 8) + entre(r, 1, 99), tipo: "eleitor", sub: "Eleitor(a) · " + (bairro || "Grande ABC"), seg: entre(r, 80, 2400), selo: false };
  }

  /* ------------------------------------------------------------------ leitura do estado do jogo */
  function eventoAtual() {
    return ok(function () {
      var ev = M().evento; if (!ev || !EVENTOS[ev.id]) return null;
      var m = EVENTOS[ev.id].montar(ev.ctx || {});
      var esc = ev.resolvido && ev.escolha != null && m.opcoes[ev.escolha] ? m.opcoes[ev.escolha][0] : null;
      return { id: ev.id, titulo: m.titulo, texto: m.texto, escolha: esc, resolvido: !!ev.resolvido, cat: ev.ctx && ev.ctx.cat };
    }, null);
  }
  function fotoDoMomento() {
    var j = J_(), m = M_(); if (!j || !m) return null;
    var r = ok(function () { return redeInit(); }, null) || m.rede || {};
    var p = m.pesquisaAtual || null;
    return {
      pop: +j.popularidade || 0, esc: +j.escandalo || 0, cargo: j.cargo_atual, partido: j.partido_atual,
      dolar: ok(function () { return m.mercado.dolar; }, null), selic: ok(function () { return m.mercado.selic; }, null), infl: ok(function () { return m.mercado.inflacao; }, null),
      seg: r.seg || 0, pesq: p ? { tipo: p.tipo, jv: p.jv, pos: p.pos, vence: p.vence, cargo: p.cargo, pct: p.pct || p.jp || null } : null,
      ev: eventoAtual(), turno: D_().turno_total
    };
  }
  function manchetesNovas(st) {
    var l = ok(function () { return M().manchetes; }, []) || [];
    var out = [];
    for (var i = 0; i < l.length && i < 120; i++) {
      if (st.marcaMan != null && chaveMan(l[i]) === st.marcaMan) break;
      out.push(l[i]);
    }
    if (st.marcaMan == null) { var d = D_(); out = out.filter(function (x) { return x.ano === d.ano && Math.abs(x.mes - d.mes) <= 1; }).slice(0, 40); }
    return out;
  }
  function diarioNovo(st) {
    var l = ok(function () { return M().diario; }, []) || [];
    var out = [];
    for (var i = 0; i < l.length && i < 20; i++) { if (st.marcaDia != null && hash(l[i]) === st.marcaDia) break; out.push(l[i]); }
    if (st.marcaDia == null) out = out.slice(0, 3);
    return out.map(function (x) { return String(x).replace(/^[^:]{3,20}\/\d{4}:\s*/, ""); });
  }

  /* ------------------------------------------------------------------ redação */
  function escopoJogador(j) {
    var c = ok(function () { return cargoAtualId(); }, "CIDADAO");
    if (["CIDADAO", "VER", "PREF"].indexOf(c) >= 0) return "local";
    if (["DEPE", "GOV"].indexOf(c) >= 0) return "estadual";
    return "nacional";
  }
  function veicJogador(r, j, tom) {
    var e = escopoJogador(j);
    if (e === "local") return pick(r, ["dgabc", "dgabc", "g1", "folha"]);
    var lado = ok(function () { return espectro(j.partido_atual); }, "C");
    var hostil = lado === "E" ? ["oeste", "veja"] : lado === "D" ? ["icl", "piaui"] : ["piaui"];
    if (e === "estadual") return pick(r, tom === "crit" ? ["folha", "estadao", "uol"].concat(hostil) : ["estadao", "g1", "folha", "dgabc", "record"]);
    return pick(r, tom === "crit" ? ["folha", "metropoles", "uol"].concat(hostil) : ["cnn", "g1", "estadao", "metropoles", "record"]);
  }

  var LEAD_SEC = {
    "Brasília": ["A decisão repercutiu entre líderes da base e da oposição ao longo do dia.", "Interlocutores do Planalto avaliam o impacto na votação das próximas semanas.", "No Congresso, a leitura é que o episódio muda o humor das bancadas.", "Aliados minimizam o caso; opositores falam em sinal de fraqueza.", "O assunto dominou os corredores do Congresso e as conversas de cafezinho."],
    "Eleições": ["Estrategistas dizem que o movimento ainda pode mudar o desenho das alianças.", "Dirigentes partidários correm para refazer as contas de tempo de TV e fundo eleitoral.", "Nos bastidores, o episódio é lido como um recado para a disputa de outubro.", "A cúpula das legendas evita comentar, mas os números circulam nos grupos de WhatsApp."],
    "Partidos": ["Caciques passaram a semana ao telefone tentando conter a debandada.", "A troca redesenha comissões e o tempo de TV de cada sigla.", "Dirigentes falam em 'acomodação natural'; adversários, em fisiologismo."],
    "Economia": ["Analistas do mercado veem o número como termômetro da confiança no governo.", "Na Faria Lima, o humor oscila conforme avançam as votações fiscais.", "Para o eleitor, o efeito aparece primeiro no preço do mercado e da gasolina."],
    "Gente": ["Assessores pedem discrição; colegas mandaram mensagens de apoio.", "O episódio reabriu o debate sobre a renovação na política."],
    "Bastidores": ["A informação foi confirmada por três interlocutores sob reserva.", "O movimento é tratado como segredo de polichinelo em Brasília.", "Quem acompanha de perto diz que o jogo ainda está longe de terminar."],
    "Justiça": ["Advogados ouvidos pela reportagem divergem sobre os próximos passos.", "O caso deve se arrastar por meses nos tribunais."],
    "Grande ABC": ["Moradores cobram respostas e prometem lembrar disso na urna.", "Lideranças comunitárias dizem que o assunto é o mais comentado nos bairros."]
  };
  function secaoDoTipo(tipo, txt) {
    if (/stf|governo|vacancia|tcu|impeach|minist/.test(tipo)) return "Brasília";
    if (/janela|federacao|partido|parricidio/.test(tipo)) return "Partidos";
    if (/eleicao|pesquisa|convencao|doacao/.test(tipo)) return "Eleições";
    if (/economia|mercado/.test(tipo)) return "Economia";
    if (/saude|aposent|obit/.test(tipo)) return "Gente";
    if (/jur|cpi|operac|prisao|processo/.test(tipo)) return "Justiça";
    if (/Mauá|Santo André|São Bernardo|Diadema|ABC/.test(txt || "")) return "Grande ABC";
    return "Bastidores";
  }
  function quebraTitulo(txt) {
    txt = semPonto(limpa(txt));
    var m = txt.match(/^([^:]{4,42}):\s+(.{12,})$/);
    if (m) return { kick: m[1], tit: uc1(m[2]) };
    return { kick: "", tit: txt };
  }

  /* --- matérias sobre o jogador --- */
  function causaTxt(c) {
    c = String(c || "");
    var m = c.match(/^Evento:\s*(.+)$/i);
    if (m) return "a reação ao caso \u201C" + m[1] + "\u201D";
    return lc1(c);
  }
  function causasPop(rel) {
    var l = ok(function () { return rel.linhas.find(function (x) { return x.k === "pop"; }); }, null);
    return l || null;
  }
  function linhaRel(rel, k) { return ok(function () { return rel.linhas.find(function (x) { return x.k === k; }); }, null); }

  function materiasJogador(r, antes, agora, rel, j, st, novas, diario) {
    var out = [], nome = j.nome, pop = causasPop(rel);
    var dPopEv = 0;
    if (antes && antes.ev && pop && pop.itens) {
      var it = pop.itens.find(function (x) { return x.causa && x.causa.indexOf(antes.ev.titulo) >= 0; });
      if (it) dPopEv = it.delta || 0;
    }
    // 1) decisão no evento do mês
    if (antes && antes.ev && antes.ev.titulo) {
      var ev = antes.ev, tom = dPopEv > 0.3 ? "fav" : dPopEv < -0.3 ? "crit" : "neu", tit, lead;
      if (ev.resolvido && ev.escolha) {
        var temDois = ev.titulo.indexOf(":") >= 0;
        tit = temDois ? pick(r, [nome + " decide " + lc1(ev.escolha) + " no caso \u201C" + ev.titulo + "\u201D", "No caso \u201C" + ev.titulo + "\u201D, " + nome + " decide " + lc1(ev.escolha)]) : pick(r, [ev.titulo + ": " + nome + " decide " + lc1(ev.escolha), nome + " opta por " + lc1(ev.escolha) + " no caso \u201C" + ev.titulo + "\u201D", (temDois ? "No caso \u201C" + ev.titulo + "\u201D, " : ev.titulo + ": ") + "a escolha de " + nome + " foi " + lc1(ev.escolha)]);
        lead = semPonto(ev.texto) + ". " + (dPopEv > 0.3 ? "A decisão rendeu " + sinal(dPopEv) + " ponto(s) de aprovação." : dPopEv < -0.3 ? "O gesto custou " + sinal(dPopEv).replace("−", "") + " ponto(s) de aprovação." : "O efeito nas pesquisas ainda é discreto.");
      } else {
        tom = "crit";
        tit = pick(r, [nome + " se cala no caso \u201C" + ev.titulo + "\u201D", ev.titulo + ": cobrado, " + nome + " não se posiciona", "Silêncio de " + nome + " no caso \u201C" + ev.titulo + "\u201D incomoda a base"]);
        lead = semPonto(ev.texto) + ". Sem uma resposta do gabinete, adversários ocuparam o espaço.";
      }
      out.push({ sec: "Você", kick: "Decisão do mês", tit: tit, lead: lead, tom: tom, jog: true, peso: 120, tags: [tag(ev.titulo)], tipo: "evento", ev: ev, delta: dPopEv });
    }
    // 2) aprovação
    if (pop && Math.abs(pop.delta) >= 0.5) {
      var sobe = pop.delta > 0, itens = (pop.itens || []).slice().sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
      var c1 = itens[0], c2 = itens[1];
      var titA = sobe ? pick(r, ["Aprovação de " + nome + " sobe para " + Math.round(pop.para) + "%", nome + " ganha " + sinal(pop.delta).slice(1) + " ponto(s) e chega a " + Math.round(pop.para) + "%", "Em alta: " + nome + " vai a " + Math.round(pop.para) + "% de aprovação"])
        : pick(r, ["Aprovação de " + nome + " recua para " + Math.round(pop.para) + "%", nome + " perde " + sinal(pop.delta).slice(1) + " ponto(s) e cai a " + Math.round(pop.para) + "%", "Sinal amarelo: aprovação de " + nome + " vai a " + Math.round(pop.para) + "%"]);
      var leadA = c1 ? "O que mais pesou: " + causaTxt(c1.causa) + " (" + sinal(c1.delta) + ")" + (c2 ? "; depois, " + causaTxt(c2.causa) + " (" + sinal(c2.delta) + ")" : "") + "." : "A variação veio sem um motivo único.";
      out.push({ sec: "Pesquisa", kick: "Termômetro", tit: titA, lead: leadA, tom: sobe ? "fav" : "crit", jog: true, peso: 95 + Math.min(20, Math.abs(pop.delta) * 6), tags: ["#" + slug(nome).slice(0, 14)], tipo: "aprov", delta: pop.delta });
    }
    // 3) escândalo
    var le = linhaRel(rel, "esc");
    if ((le && le.delta > 0.5) || (antes && agora.esc - antes.esc >= 3)) {
      var de = le ? le.delta : agora.esc - antes.esc;
      var cau = le && le.itens && le.itens[0] ? causaTxt(le.itens[0].causa) : "denúncias que circulam nos bastidores";
      out.push({ sec: "Você", kick: "Desgaste", tit: pick(r, ["Escândalo cresce em torno de " + nome, "Pressão aumenta: " + nome + " vira alvo de " + cau, "Oposição explora " + cau + " contra " + nome]), lead: "O índice de escândalo subiu " + sinal(de, 0) + " e agora está em " + Math.round(agora.esc) + "%. " + pick(r, ["A assessoria fala em perseguição política.", "Aliados pedem que o gabinete se explique publicamente.", "Nos grupos de WhatsApp, o caso já circula com montagens."]), tom: "crit", jog: true, peso: 110, tags: ["#Explica" + slug(nome).slice(0, 10)], tipo: "escandalo" });
    }
    // 4) dinheiro
    var lc = linhaRel(rel, "cx1");
    if (lc && lc.delta < -40000) {
      var g = (lc.itens || []).filter(function (x) { return x.delta < 0; }).sort(function (a, b) { return a.delta - b.delta; })[0];
      out.push({ sec: "Bastidores", kick: "Contas", tit: pick(r, [nome + " gasta R$ " + fmtK(-lc.delta) + " no mês", "Caixa de " + nome + " encolhe R$ " + fmtK(-lc.delta)]), lead: (g ? "O maior gasto foi com " + causaTxt(g.causa) + " (R$ " + fmtK(-g.delta) + "). " : "") + "O caixa pessoal fechou em R$ " + fmtK(lc.para) + ".", tom: "neu", jog: true, peso: 55, tags: [], tipo: "caixa" });
    }
    // 5) carreira
    if (antes && agora.cargo && antes.cargo && antes.cargo !== agora.cargo) {
      out.push({ sec: "Você", kick: "Novo cargo", tit: nome + " assume como " + agora.cargo, lead: "Depois de deixar o posto de " + lc1(antes.cargo) + ", " + nome + " começa uma nova fase. A primeira semana deve definir a equipe e as alianças.", tom: "fav", jog: true, peso: 160, tags: ["#" + slug(nome).slice(0, 14)], tipo: "cargo" });
    }
    if (antes && agora.partido && antes.partido && antes.partido !== agora.partido) {
      out.push({ sec: "Partidos", kick: "Troca de sigla", tit: nome + " deixa o " + siglaP(antes.partido) + " e se filia ao " + siglaP(agora.partido), lead: "A mudança redesenha a base de apoio e o tempo de TV na próxima eleição.", tom: "neu", jog: true, peso: 130, tags: ["#" + slug(siglaP(agora.partido))], tipo: "partido" });
    }
    // 6) projeção eleitoral
    var p = agora.pesq, pa = antes && antes.pesq;
    if (p && p.jv != null && (!pa || pa.jv == null || Math.abs((p.jv - pa.jv) / Math.max(1, pa.jv)) > 0.06 || st.ordem.length % 3 === 0)) {
      var nomeC = ok(function () { return NOME_CARGO[p.cargo]; }, p.cargo || "o cargo");
      var trend = pa && pa.jv ? (p.jv > pa.jv ? "Subiu de " + fmtN(pa.jv) + " para " + fmtN(p.jv) + " votos. " : "Caiu de " + fmtN(pa.jv) + " para " + fmtN(p.jv) + " votos. ") : "";
      out.push({ sec: "Eleições", kick: "Projeção", tit: pick(r, [nome + " teria " + fmtN(p.jv) + " votos para " + nomeC, "Projeção coloca " + nome + " em " + fmtN(p.pos) + "º lugar na disputa para " + nomeC]), lead: trend + (p.vence ? "Pelas contas do quociente, a vaga viria." : "Ainda abaixo da linha de corte: faltam votos para entrar."), tom: pa && pa.jv ? (p.jv >= pa.jv ? "fav" : "crit") : "neu", jog: true, peso: 70, tags: [], tipo: "pesq" });
    }
    // 7) diário (fatos da carreira registrados pelo jogo)
    var escolhaEv = antes && antes.ev && antes.ev.escolha ? slug(antes.ev.escolha) : "";
    diario.slice(0, 4).forEach(function (txt) {
      if (/Completou \d+ anos|fict[ií]cio/i.test(txt)) return;
      if (txt.length < 40 || (escolhaEv && slug(txt).indexOf(escolhaEv) >= 0)) return;
      if (!/convenç|candidat|eleit|posse|assum|filia|cassa|pres[oa]\b|conden|absolv|nomea|fundo|padrinho|mandato|renúnc|denúnc|processo|cpi|ministério|secretari/i.test(txt)) return;
      var q = quebraTitulo(txt);
      out.push({ sec: "Você", kick: q.kick || "Agenda", tit: q.kick ? q.tit.slice(0, 120) : semPonto(txt).slice(0, 110), lead: q.kick ? "" : "", tom: "neu", jog: true, peso: 60, tags: [], tipo: "diario" });
    });
    // 8) manchetes que citam o jogador
    novas.forEach(function (x) {
      if (x.tipo === "imprensa" || x.tipo === "conquista") return;
      if (String(x.txt).indexOf(nome) < 0) return;
      var q = quebraTitulo(x.txt);
      out.push({ sec: "Você", kick: q.kick || "Destaque", tit: q.tit, lead: pick(r, LEAD_SEC[secaoDoTipo(x.tipo, x.txt)] || LEAD_SEC["Bastidores"]), tom: /acata|vence|aprova|eleit|conquista/i.test(x.txt) ? "fav" : /denúncia|cassa|investig|preso|multa/i.test(x.txt) ? "crit" : "neu", jog: true, peso: 100, tags: [], tipo: x.tipo, _usada: x });
    });
    // 9) seus posts do turno
    var meus = st.meus.filter(function (x) { return x.ed === "pend"; });
    if (meus.length) {
      var top = meus.slice().sort(function (a, b) { return b.likes - a.likes; })[0];
      out.push({ sec: "Rede", kick: "Repercussão", tit: pick(r, ["Post de " + nome + " " + (top.ok ? "viraliza" : "vira polêmica") + " com " + fmtK(top.likes) + " curtidas", nome + " " + (top.ok ? "acerta o tom" : "erra a mão") + " nas redes e " + (top.ok ? "ganha" : "perde") + " terreno"]), lead: "“" + top.texto.slice(0, 140) + "”", tom: top.ok ? "fav" : "crit", jog: true, peso: 75, tags: [], tipo: "post" });
    }
    return out;
  }

  /* --- mundo: manchetes do turno, agrupadas --- */
  function materiasMundo(r, novas, j, usadas) {
    var out = [], saude = [], obit = [], apos = [], janela = [], pesq = [];
    var partJ = j ? j.partido_atual : "";
    novas.forEach(function (x) {
      if (usadas.indexOf(x) >= 0) return;
      var t = limpa(x.txt), tipo = x.tipo || "info";
      if (tipo === "imprensa" || tipo === "conquista" || tipo === "info" && /Conquista/.test(t)) return;
      if (/internad/i.test(t)) return saude.push(t);
      if (/falece|morre|morte de/i.test(t)) return obit.push(t);
      if (tipo === "aposent" || /se aposenta/i.test(t)) return apos.push(t);
      if (tipo === "janela" || /migra do .* para o/i.test(t)) return janela.push(t);
      if (tipo === "pesquisa") return pesq.push(t);
      var q = quebraTitulo(t), sec = secaoDoTipo(tipo, t);
      var peso = { "Brasília": 50, "Eleições": 46, "Partidos": 40, "Economia": 38, "Justiça": 44, "Grande ABC": 58, "Bastidores": 30, "Gente": 25 }[sec] || 30;
      if (partJ && t.indexOf(partJ) >= 0) peso += 12;
      out.push({ sec: sec, kick: q.kick, tit: q.tit, lead: "", tom: "neu", jog: false, peso: peso + r() * 6, tags: [], tipo: tipo });
    });
    if (janela.length) {
      var saldo = {};
      janela.forEach(function (t) { var m = t.match(/migra do (.+?) para o (.+?)(?: \(|\.|$)/); if (m) { saldo[m[1]] = (saldo[m[1]] || 0) - 1; saldo[m[2]] = (saldo[m[2]] || 0) + 1; } });
      var ord = Object.keys(saldo).sort(function (a, b) { return saldo[b] - saldo[a]; });
      var ganha = ord[0], perde = ord[ord.length - 1];
      var meu = partJ && saldo[partJ] ? " O " + siglaP(partJ) + ", seu partido, " + (saldo[partJ] > 0 ? "ganhou " + saldo[partJ] : "perdeu " + (-saldo[partJ])) + "." : "";
      out.push({ sec: "Partidos", kick: "Janela partidária", tit: janela.length + " parlamentares trocam de partido" + (ganha && saldo[ganha] > 0 ? "; " + siglaP(ganha) + " é quem mais cresce" : ""), lead: (ganha ? "Maior saldo: " + siglaP(ganha) + " (" + sinal(saldo[ganha], 0) + "). " : "") + (perde && saldo[perde] < 0 ? "Maior perda: " + siglaP(perde) + " (" + sinal(saldo[perde], 0) + ")." : "") + meu, tom: "neu", jog: false, peso: 62, tags: ["#JanelaPartidaria"], tipo: "janela", lista: janela.slice(0, 8) });
    }
    if (saude.length) {
      var nomes = saude.map(function (t) { var m = t.match(/^(.+?) é internad/); return m ? m[1] : null; }).filter(Boolean);
      out.push({ sec: "Gente", kick: "Boletim médico", tit: saude.length === 1 ? saude[0].replace(/\s*\(saúde \d+%\)\.?/, "") : saude.length + " políticos são internados no mês", lead: saude.length > 1 ? "Entre eles, " + nomes.slice(0, 4).join(", ") + (nomes.length > 4 ? " e outros " + (nomes.length - 4) : "") + ". Assessorias falam em quadros sob controle." : "A assessoria diz que o quadro é estável.", tom: "neu", jog: false, peso: 18, tags: [], tipo: "saude" });
    }
    obit.forEach(function (t) { var q = quebraTitulo(t); out.push({ sec: "Gente", kick: q.kick || "Luto", tit: q.tit.replace(/\s*\(Causas.*$/, ""), lead: "Colegas de todos os partidos prestaram homenagens nas redes.", tom: "neu", jog: false, peso: 48, tags: [], tipo: "obit" }); });
    if (apos.length) {
      var ns = apos.map(function (t) { var m = t.match(/^(.+?) se aposenta/); return m ? m[1] : null; }).filter(Boolean);
      out.push({ sec: "Gente", kick: "Renovação", tit: apos.length === 1 ? apos[0] : apos.length + " políticos anunciam aposentadoria", lead: ns.length ? "Deixam a vida pública: " + ns.slice(0, 5).join(", ") + "." : "", tom: "neu", jog: false, peso: 22, tags: [], tipo: "aposent" });
    }
    pesq.slice(0, 2).forEach(function (t) { var q = quebraTitulo(t); out.push({ sec: "Eleições", kick: q.kick || "Pesquisa", tit: q.tit, lead: pick(r, LEAD_SEC["Eleições"]), tom: "neu", jog: false, peso: 44, tags: ["#Pesquisa"], tipo: "pesquisa" }); });
    if (pesq.length > 2) out.push({ sec: "Eleições", kick: "Pesquisas", tit: "Mais " + (pesq.length - 2) + " levantamentos estaduais saíram no mês", lead: pesq.slice(2, 4).map(function (t) { return quebraTitulo(t).tit; }).join(" · "), tom: "neu", jog: false, peso: 20, tags: [], tipo: "pesquisa" });
    return out;
  }

  function materiaEconomia(r, antes, agora) {
    if (!agora || agora.dolar == null) return null;
    var dd = antes && antes.dolar != null ? agora.dolar - antes.dolar : 0;
    var ds = antes && antes.selic != null ? agora.selic - antes.selic : 0;
    if (Math.abs(dd) < 0.06 && Math.abs(ds) < 0.2 && r() < 0.55) return null;
    var tit;
    if (Math.abs(ds) >= 0.2) tit = "Copom " + (ds > 0 ? "eleva" : "corta") + " a Selic para " + String(agora.selic).replace(".", ",") + "%";
    else if (Math.abs(dd) >= 0.06) tit = "Dólar " + (dd > 0 ? "sobe" : "cai") + " e fecha o mês a R$ " + agora.dolar.toFixed(2).replace(".", ",");
    else tit = "Mercado fecha o mês sem sustos; dólar a R$ " + agora.dolar.toFixed(2).replace(".", ",");
    var lead = "Inflação em " + String(agora.infl).replace(".", ",") + "% em 12 meses e Selic a " + String(agora.selic).replace(".", ",") + "%. " + pick(r, LEAD_SEC["Economia"]);
    return { sec: "Economia", kick: "Mercado", tit: tit, lead: lead, tom: "neu", jog: false, peso: 36 + Math.abs(dd) * 40, tags: [dd > 0.06 ? "#Dolar" : "#Economia"], tipo: "economia", veic: pick(r, ["valor", "estadao"]) };
  }

  function coluna(r, j, mats, antes, agora) {
    var autores = INFLU.filter(function (x) { return x.lado === "C"; }).concat(INFLU.filter(function (x) { return x.tipo === "Jornalista"; }));
    var a = pick(r, autores);
    var nome = j.nome, ev = mats.find(function (x) { return x.tipo === "evento"; }), ap = mats.find(function (x) { return x.tipo === "aprov"; }), esc = mats.find(function (x) { return x.tipo === "escandalo"; });
    var tom = (ap ? ap.delta : 0) + (ev ? ev.delta || 0 : 0) - (esc ? 2 : 0);
    var tit = tom > 0.8 ? pick(r, ["O mês em que " + nome + " acertou o passo", nome + " aprendeu a ler a rua?", "A sorte (e o cálculo) de " + nome]) : tom < -0.8 ? pick(r, ["O que deu errado para " + nome, nome + " precisa de um plano B", "Um mês para esquecer"]) : pick(r, [nome + " e a arte de não errar", "Morno, mas vivo", "O jogo de espera de " + nome]);
    var p1 = ev ? (ev.ev && ev.ev.escolha ? "Diante de " + lc1(ev.ev.titulo) + ", a opção por " + lc1(ev.ev.escolha) + " " + (ev.delta > 0.3 ? "mostrou faro político." : ev.delta < -0.3 ? "soou desconectada do eleitor." : "não mudou o jogo, mas também não queimou pontes.") : "O silêncio diante de " + lc1(ev.ev.titulo) + " foi a escolha mais arriscada do mês.") : "Sem grandes crises, o mês serviu para arrumar a casa.";
    var p2 = ap ? "Os números confirmam: " + (ap.delta > 0 ? "a aprovação subiu " : "a aprovação caiu ") + sinal(ap.delta).slice(1) + " ponto(s)." : "A aprovação, em " + Math.round(agora.pop) + "%, segue onde estava.";
    var p3 = esc ? "O problema é o desgaste que não sai das manchetes." : agora.pesq && agora.pesq.jv != null ? "A régua de verdade é a urna: hoje seriam " + fmtN(agora.pesq.jv) + " votos." : pick(r, ["Em política, quem não aparece é esquecido.", "A próxima decisão vai dizer mais do que esta.", "Falta uma marca própria."]);
    return { autor: a.nome, cargo: a.tipo, tit: tit, texto: p1 + " " + p2 + " " + p3 };
  }

  /* --- rede social --- */
  var T = {
    ataque: ["{@j} {verbo} {tema}. Típico de quem só aparece quando tem câmera.", "Alguém avisa {@j} que o caso {tema} não se resolve com post. O povo quer resultado.", "Curioso: {@j} {verbo} {tema} e o {partJ} finge que não viu.", "Mais um capítulo da novela {@j}. O caso {tema} merecia gente séria.", "Fica registrado: {@j} {verbo} {tema}. Em outubro a gente conversa.", "Errado do começo ao fim: {@j} {verbo} {tema}."],
    ironia: ["Parabéns a {@j} por descobrir {tema} só agora 👏", "{@j} comemorando {tema} como se fosse obra própria 😂", "Bonito o discurso de {@j} sobre {tema}. Agora mostra a planilha."],
    defesa: ["Orgulho de ver {@j} encarando o caso {tema} de frente. É assim que se faz política. 💪", "Quem critica {@j} no caso {tema} nunca pisou num bairro de verdade.", "{@j} acertou em cheio no caso {tema}. O {partJ} está junto!", "Enquanto uns gritam, {@j} trabalha. O caso {tema} é prova disso."],
    eleitorBom: ["Vi {@j} aqui no {bairro} essa semana. Pelo menos aparece! 👏", "Gostei da postura de {@j} no caso {tema}. Tem meu voto.", "Finalmente alguém que encara o caso {tema}. Segue assim, {@j}!"],
    eleitorCobra: ["{@j} e o {local} aqui no {bairro}? Até hoje nada. 😤", "Falar do caso {tema} é fácil, {@j}. Quero ver resolver o {local} do {bairro}.", "Votei em quem prometeu e o {local} continua igual. Tô de olho, {@j}.", "Alguém do gabinete de {@j} lê isso? O {local} no {bairro} tá um caos."],
    midia: ["AGORA: {tit}", "URGENTE: {tit}", "{tit}. Leia a reportagem completa.", "📌 {tit}"],
    opiniao: ["{tit} — e ninguém vai falar sobre isso?", "O que {tit_lc} diz sobre o momento do país: fio 🧵", "Sobre {tit_lc}: quem acompanha sabe que isso não é novo.", "{tit}. Guardem esse print."]
  };
  var LOCAIS = ["posto de saúde", "ônibus da linha 2", "buraco da avenida", "poste apagado da praça", "Cras", "policiamento", "alagamento", "lixão da esquina"];
  function preencher(tpl, v) {
    return tpl.replace(/\{(@j|verbo|tema|Tema|sig|partJ|bairro|local|tit|tit_lc|pct|d|jv)\}/g, function (_, k) { return v[k] != null ? v[k] : ""; });
  }
  var TP = {
    aprovUp: { riv: ["{pct}% e já tá se achando, {@j}? Quero ver no dia da eleição. 😂", "Subiu {d} ponto(s) e virou estadista. Calma, {@j}.", "Pesquisa boa a gente comemora; pesquisa ruim, {@j} chama de fake. Vamos lembrar disso."], ali: ["{pct}% e subindo! O trabalho de {@j} aparece. 🚀", "Quem duvidava de {@j} vai ter que engolir os números. +{d}!", "Rua, escuta e entrega: por isso {@j} cresce. Bora!"] },
    aprovDown: { riv: ["Caiu pra {pct}%. O povo cansou do discurso de {@j}.", "Nem a militância aguenta mais: {@j} despenca para {pct}%.", "{@j} perdendo {d} ponto(s) e ainda posando de favorito. 🤡"], ali: ["Pesquisa é retrato do momento. {@j} segue firme.", "Oscilação normal. O trabalho de {@j} fala por si.", "Quem tá na rua sabe: {@j} vai virar esse jogo."] },
    pesq: { riv: ["Projeção de {@j}: {jv} votos. Não elege nem síndico. 😂", "Com {jv} votos, {@j} vai precisar de muito santinho.", "{jv} votos? Meu primo teve mais pra vereador. Força, {@j}."], ali: ["{jv} votos e crescendo! Bora, militância, que dá pra {@j} chegar lá. 🗳️", "Cada voto conta. {@j} já soma {jv} na projeção!", "A campanha de {@j} nem começou de verdade e já são {jv} votos."] },
    post: { riv: ["Bonito o post de {@j}. Agora mostra a planilha.", "Post não resolve nada, {@j}. O {bairro} quer obra.", "{@j} descobriu a internet. Parabéns ao estagiário."], ali: ["Falou tudo, {@j}! 👏", "É isso! {@j} sem medo de dizer o que pensa.", "Compartilhando o post de {@j}. Tem que circular!"] },
    escandalo: { riv: ["{@j} vai ter que explicar muita coisa. Cadê a transparência?", "O que {@j} pregava não vale pra si mesmo, pelo visto.", "Já pedi as informações oficiais sobre o caso {@j}. Não vai ficar assim."], ali: ["Perseguição contra {@j} tem nome: medo das urnas.", "Cadê as provas? Tô com {@j}.", "Querem tirar {@j} do jogo no tapetão. Não vão conseguir."] },
    geral: { riv: ["Vamos falar sério sobre \u201C{tit}\u201D, {@j}?", "\u201C{tit}\u201D. E o povo do {bairro} com isso, {@j}?", "Muita manchete, pouca entrega. Né, {@j}?"], ali: ["Grande notícia: \u201C{tit}\u201D. Parabéns, {@j}!", "Orgulho do caminho de {@j}. Seguimos juntos!", "{@j} mostrando como se faz. O {partJ} está junto!"] }
  };
  function textosDe(m) {
    if (m.tipo === "evento") return { riv: T.ataque, ali: T.defesa };
    if (m.tipo === "aprov") return m.delta >= 0 ? TP.aprovUp : TP.aprovDown;
    if (m.tipo === "pesq") return TP.pesq;
    if (m.tipo === "post") return TP.post;
    if (m.tipo === "escandalo") return TP.escandalo;
    return TP.geral;
  }
  function temaDe(m) {
    if (m.tipo === "evento" && m.ev) return "\u201C" + m.ev.titulo + "\u201D";
    if (m.tipo === "aprov") return "a própria aprovação";
    if (m.tipo === "escandalo") return "o escândalo";
    if (m.tipo === "pesq") return "a projeção de votos";
    if (m.tipo === "post") return "o próprio post";
    return "\u201C" + m.tit.slice(0, 70) + "\u201D";
  }
  function verboDe(m) {
    if (m.tipo === "evento") return m.ev && m.ev.escolha ? "escolheu " + lc1(m.ev.escolha) + " no caso" : "fugiu do caso";
    if (m.tipo === "escandalo") return "tenta explicar";
    if (m.tipo === "aprov") return m.delta > 0 ? "comemora" : "ignora";
    return "fala de";
  }

  function gerarPosts(r, ed, j, edKey) {
    var posts = [], handleJ = "@" + slug(j.nome).slice(0, 15), partJ = j.partido_atual, ladoJ = espectro(partJ);
    var bairro = nomeTerr(j.bairro) || "Mauá";
    var pols = politicos();
    var rivais = embaralha(r, pols.filter(function (n) { return n.partido !== partJ && espectro(n.partido) !== ladoJ; }));
    if (rivais.length < 3) rivais = rivais.concat(embaralha(r, pols.filter(function (n) { return n.partido !== partJ; })));
    var aliados = embaralha(r, pols.filter(function (n) { return n.partido === partJ; }));
    var minuto = 3;
    function add(conta, texto, extra) {
      minuto += entre(r, 4, 55);
      var base = conta.tipo === "midia" ? entre(r, 1500, 14000) : conta.tipo === "influencer" ? entre(r, 2500, 42000) : conta.tipo === "politico" ? Math.round(entre(r, 200, 3000) * Math.min(6, Math.max(0.6, conta.seg / 2e5))) : entre(r, 3, 900);
      var p = { id: edKey + "_" + posts.length, conta: conta, texto: texto, min: minuto, likes: base, rts: Math.round(base * (0.08 + r() * 0.25)), resp: Math.round(base * (0.02 + r() * 0.08)), cita: texto.indexOf(handleJ) >= 0 };
      for (var k in extra || {}) p[k] = extra[k];
      posts.push(p);
      return p;
    }
    var vBase = { "@j": handleJ, partJ: siglaP(partJ), bairro: bairro, sig: slug(siglaP(partJ)).toUpperCase() || "Brasil" };
    var mj = ed.materias.filter(function (m) { return m.jog; }).slice(0, 3);
    var pesqJ = ok(function () { return M().pesquisaAtual; }, null) || {};
    mj.forEach(function (m, i) {
      var v = Object.assign({}, vBase, { tema: temaDe(m), Tema: uc1(temaDe(m)), verbo: verboDe(m), local: pick(r, LOCAIS), tit: m.tit.slice(0, 80),
        pct: Math.round(ed.numeros.pop), d: String(Math.abs(m.delta || 0).toFixed(1)).replace(".", ","), jv: fmtN(pesqJ.jv || 0) });
      var tx = textosDe(m);
      var riv = rivais[i];
      if (riv) add(contaNpc(riv, "rival"), preencher(pick(r, tx.riv), v), { tom: "ataque", proc: m.tom !== "fav" && (m.tipo === "evento" || m.tipo === "escandalo"), mat: m.tit });
      if (aliados[i] && (m.tom !== "crit" || r() < 0.5)) add(contaNpc(aliados[i], "aliado"), preencher(pick(r, tx.ali), v), { tom: "apoio", mat: m.tit });
      if (m.tipo === "evento" || i === 0) {
        var cid = contaCidadao(r, bairro);
        add(cid, preencher(pick(r, m.tom === "fav" ? T.eleitorBom : (r() < 0.65 ? T.eleitorCobra : T.eleitorBom)), v), { tom: m.tom === "fav" ? "apoio" : "cobranca", mat: m.tit });
      }
    });
    // eleitores do bairro falam do dia a dia, sem depender da pauta
    var cid2 = contaCidadao(r, bairro);
    add(cid2, preencher(pick(r, T.eleitorCobra.slice(0, 1).concat(["Alguém sabe se {@j} vem pro {bairro} esse mês? Queria falar do {local}.", "O {local} aqui no {bairro} piorou. Cadê os políticos? Marquei {@j}."])), Object.assign({}, vBase, { local: pick(r, LOCAIS), tema: "o bairro" })), { tom: "cobranca" });
    if (mj[0]) {
      var lado = mj[0].tom === "fav" ? ladoJ : (ladoJ === "E" ? "D" : "E");
      var inf = contaInflu(r, lado);
      var v2 = Object.assign({}, vBase, { tema: temaDe(mj[0]), Tema: uc1(temaDe(mj[0])), verbo: verboDe(mj[0]), local: pick(r, LOCAIS) });
      add(inf, preencher(pick(r, inf.lado === ladoJ ? T.defesa : T.ataque.concat(T.ironia)), v2), { tom: inf.lado === ladoJ ? "apoio" : "ataque", mat: mj[0].tit });
    }
    var mw = ed.materias.filter(function (m) { return !m.jog; }).slice(0, 4);
    mw.forEach(function (m, i) {
      var vid = m.veic || "g1";
      add(contaMidia(vid), preencher(pick(r, T.midia), { tit: m.tit }), { tom: "noticia", mat: m.tit });
      if (i < 2) {
        var inf2 = r() < 0.6 ? contaInflu(r) : (rivais[3 + i] ? contaNpc(rivais[3 + i], "politico") : contaInflu(r));
        add(inf2, preencher(pick(r, T.opiniao), { tit: m.tit, tit_lc: lc1(m.tit) }), { tom: "opiniao", mat: m.tit });
      }
    });
    posts.sort(function (a, b) { return a.min - b.min; });
    return posts;
  }

  function trending(r, ed) {
    var tags = [];
    ed.materias.forEach(function (m) { (m.tags || []).forEach(function (t) { if (t && t.length > 3 && tags.indexOf(t) < 0) tags.push(t); }); });
    var d = D_();
    var extra = [d.mes >= 8 && d.mes <= 10 ? "#Eleicoes" + d.ano : "#" + uc1(nomeMes(d.mes)).normalize("NFD").replace(/[̀-ͯ]/g, "") + d.ano, "#Congresso", "#BomDiaABC", "#Brasilia", "#STF", "#Maua"];
    embaralha(r, extra).forEach(function (t) { if (tags.length < 6 && tags.indexOf(t) < 0) tags.push(t); });
    return tags.slice(0, 6).map(function (t, i) { return { tag: t, vol: Math.round((220 - i * 30) * (0.6 + r() * 0.8)) * 1000 }; });
  }

  /* ------------------------------------------------------------------ montagem da edição */
  function montarEdicao(antes) {
    var st = estado(), j = J_(), m = M_(); if (!st || !j || !m) return null;
    var d = D_(), key = "t" + d.turno_total;
    if (st.eds[key]) return st.eds[key];
    var r = rng(hash(key + "|" + (m.sementePartida || 0) + "|" + j.nome));
    var agora = fotoDoMomento();
    var novas = manchetesNovas(st), diario = diarioNovo(st);
    var rel = m.relatorio || null;
    var mj = materiasJogador(r, antes, agora, rel, j, st, novas, diario);
    var usadas = mj.map(function (x) { return x._usada; }).filter(Boolean);
    var mw = materiasMundo(r, novas, j, usadas);
    var eco = materiaEconomia(r, antes, agora); if (eco) mw.push(eco);
    var todas = mj.concat(mw).sort(function (a, b) { return b.peso - a.peso; });
    if (!todas.length) {
      todas.push({ sec: "Você", kick: "Perfil", tit: j.nome + " começa a trajetória em " + (nomeTerr(j.bairro) || "Mauá"), lead: "Com " + Math.round(agora.pop) + "% de aprovação e o " + siglaP(j.partido_atual) + " ao lado, o primeiro desafio é sair do anonimato.", tom: "neu", jog: true, peso: 80, tags: ["#" + slug(j.nome).slice(0, 14)], tipo: "perfil" });
    }
    var vistos = {};
    todas = todas.filter(function (x) { var k = slug(x.tit).slice(0, 50); if (vistos[k]) return false; vistos[k] = 1; return true; }).slice(0, 12);
    var leadsUsados = {};
    todas.forEach(function (x) {
      if (!x.veic) x.veic = veicNoTexto(x.tit + " " + (x.lead || ""));
      if (!x.veic) x.veic = x.jog ? veicJogador(r, j, x.tom) : x.sec === "Grande ABC" ? "dgabc" : x.sec === "Economia" ? pick(r, ["valor", "valor", "forbes"]) :
        x.sec === "Justiça" ? pick(r, ["piaui", "folha", "g1", "veja"]) : x.sec === "Bastidores" ? pick(r, ["cnn", "veja", "metropoles", "oeste", "icl"]) :
        x.sec === "Gente" ? pick(r, ["g1", "uol", "record"]) : pick(r, ["folha", "estadao", "g1", "cnn", "metropoles", "uol"]);
      if (!x.lead) {
        var pool = (LEAD_SEC[x.sec] || LEAD_SEC["Bastidores"]).filter(function (l) { return !leadsUsados[l]; });
        x.lead = pick(r, pool.length ? pool : LEAD_SEC["Bastidores"]);
      }
      leadsUsados[x.lead] = 1;
      delete x._usada;
    });
    var ed = { key: key, ano: d.ano, mes: d.mes, semana: d.semana || 0, turno: d.turno_total, materias: todas, coluna: coluna(r, j, todas, antes, agora), numeros: { pop: agora.pop, popAntes: antes ? antes.pop : null, esc: agora.esc, seg: agora.seg } };
    ed.posts = gerarPosts(r, ed, j, key);
    ed.trending = trending(r, ed);
    // seus posts do turno passam a pertencer a esta edição
    st.meus.forEach(function (x) { if (x.ed === "pend") x.ed = key; });
    st.eds[key] = ed;
    if (antes) { st.ping = key; st.pingMin = false; }
    st.ordem.unshift(key);
    while (st.ordem.length > MAX_EDICOES) { var velho = st.ordem.pop(); delete st.eds[velho]; }
    st.meus = st.meus.filter(function (x) { return x.ed === "pend" || st.eds[x.ed]; }).slice(0, 60);
    var l = m.manchetes || []; st.marcaMan = l.length ? chaveMan(l[0]) : 0;
    var dl = m.diario || []; st.marcaDia = dl.length ? hash(dl[0]) : 0;
    return ed;
  }
  MID.edicao = function (key) {
    var st = estado(); if (!st) return null;
    if (!st.ordem.length) montarEdicao(null);
    return st.eds[key || st.ordem[0]] || st.eds[st.ordem[0]] || null;
  };
  MID.novidade = function () { var st = estado(); return !!(st && st.ordem.length && st.lido !== st.ordem[0]); };

  /* ------------------------------------------------------------------ interface */
  function rotuloEd(ed, st) {
    var mesmos = st.ordem.filter(function (k) { var e = st.eds[k]; return e && e.ano === ed.ano && e.mes === ed.mes; }).length;
    return uc1(nomeMes(ed.mes)) + " de " + ed.ano + (mesmos > 1 && ed.semana ? " · semana " + ed.semana : "");
  }
  function chipTom(t) { return t === "fav" ? '<span class="v3m-tom fav">a favor</span>' : t === "crit" ? '<span class="v3m-tom crit">crítica</span>' : ""; }
  function veicHtml(vid) {
    var v = VEIC[vid] || VEIC.g1, lg = logoVeic(vid);
    return '<span class="v3m-veic">' + (lg ? '<img class="v3m-veic-logo" src="' + lg + '" alt="">' : '<i style="background:' + v.cor + '"></i>') + esc_(v.nome) + "</span>";
  }
  function fotoConta(c) {
    if (c.tipo === "eu") return J_();
    if (c.tipo !== "politico" && c.tipo !== "influencer") return null;
    var n = npcs().find(function (k) { return k.nome === c.nome; });
    if (!n) return null;
    var f = npcFoto(n);
    return f ? { nome: n.nome, foto: f } : null;
  }
  function postHtml(p, st, compacto) {
    var c = p.conta, ac = st.acoes[p.id] || {};
    var foto = fotoConta(c);
    var lgc = c.logo ? logoVeic(c.logo) : "";
    var av = lgc ? '<img class="v3m-av-logo" src="' + lgc + '" alt="">' : foto && typeof window.fotoTag === "function" ? window.fotoTag(foto, 42, 42) : '<span class="v3m-av-ini" style="' + (c.cor ? "background:" + c.cor : "") + '">' + esc_(c.nome.charAt(0)) + "</span>";
    var txt = esc_(p.texto).replace(/(@[A-Za-z0-9_]+)/g, '<b class="v3m-men">$1</b>').replace(/(#[A-Za-zÀ-ú0-9_]+)/g, '<span class="v3m-hash">$1</span>');
    var tempo = p.min < 60 ? "há " + p.min + " min" : p.min < 1440 ? "há " + Math.floor(p.min / 60) + " h" : "há " + Math.floor(p.min / 1440) + " d";
    var h = '<article class="v3m-post' + (p.cita ? " cita" : "") + (p.meu ? " meu" : "") + " t-" + (p.tom || "") + '">' +
      '<div class="v3m-av">' + av + "</div><div class=\"v3m-pc\">" +
      '<div class="v3m-ph"><b>' + esc_(c.nome) + "</b>" + (c.selo ? '<span class="v3m-selo" title="verificado">✓</span>' : "") + '<span class="v3m-hd">' + esc_(c.handle) + " · " + tempo + "</span></div>" +
      '<div class="v3m-sub">' + esc_(c.sub || "") + "</div>" +
      '<p class="v3m-tx">' + txt + "</p>" +
      (p.mat && !compacto ? '<div class="v3m-ref">sobre: ' + esc_(p.mat) + "</div>" : "") +
      '<div class="v3m-met"><span>♥ ' + fmtK(p.likes + (ac.imp ? p.likes * 0.6 : 0)) + "</span><span>⟲ " + fmtK(p.rts + (ac.rt ? 1 : 0)) + "</span><span>💬 " + fmtK(p.resp + (ac.resp ? 1 : 0)) + "</span>";
    if (!compacto && !p.meu) {
      h += '<span class="v3m-acts">' +
        (ac.resp ? '<em>você respondeu</em>' : '<button type="button" class="v3m-act" data-a="socialResponderPost" data-p="' + pj([p.id]) + '">Responder</button>') +
        (ac.rt ? '<em>compartilhado</em>' : '<button type="button" class="v3m-act" data-a="socialRetweetarPost" data-p="' + pj([p.id]) + '">Compartilhar</button>') +
        (p.proc && !ac.proc ? '<button type="button" class="v3m-act crit" data-a="socialProcessarPost" data-p="' + pj([p.id]) + '">Acionar jurídico · R$ 15 mil</button>' : ac.proc ? "<em>no jurídico</em>" : "") +
        "</span>";
    }
    if (!compacto && p.meu) {
      h += '<span class="v3m-acts">' + (ac.imp ? "<em>impulsionado</em>" : '<button type="button" class="v3m-act" data-a="socialImpulsionarPost" data-p="' + pj([p.id]) + '">Impulsionar · R$ 25 mil</button>') + "</span>";
    }
    h += "</div>";
    if (ac.resp && ac.respTx && !compacto) h += '<div class="v3m-minha-resp"><b>Você</b> ' + esc_(ac.respTx) + "</div>";
    if (p.replies && !compacto) h += '<div class="v3m-replies">' + p.replies.map(function (rp) { return '<div class="v3m-reply"><b>' + esc_(rp.conta.nome) + "</b> <span>" + esc_(rp.conta.handle) + "</span><p>" + esc_(rp.texto) + "</p></div>"; }).join("") + "</div>";
    return h + "</div></article>";
  }

  function viewJornal() {
    var st = estado(), j = J_(); if (!st || !j) return "";
    var ed = MID.edicao(ok(function () { return S.v3ed; }, null)); if (!ed) return '<div class="v3m-vazio">Nenhuma edição ainda. Avance o mês.</div>';
    if (ed.key === st.ordem[0]) st.lido = ed.key;
    var idx = st.ordem.indexOf(ed.key);
    var ant = st.ordem[idx + 1], prox = idx > 0 ? st.ordem[idx - 1] : null;
    var mats = ed.materias, princ = mats[0], resto = mats.slice(1);
    var h = '<div class="v3m-jornal">';
    h += '<header class="v3m-mast"><div class="v3m-mast-l">' + (ant ? '<button type="button" class="v3m-nav" data-a="midiaEd" data-p="' + pj([ant]) + '">‹ ' + esc_(rotuloEd(st.eds[ant], st)) + "</button>" : "<span></span>") + "</div>" +
      '<div class="v3m-mast-c"><span class="v3m-nome">O Plenário</span><small>Edição de ' + esc_(rotuloEd(ed, st)) + (idx === 0 ? " · a mais recente" : "") + "</small></div>" +
      '<div class="v3m-mast-r">' + (prox ? '<button type="button" class="v3m-nav" data-a="midiaEd" data-p="' + pj([prox]) + '">' + esc_(rotuloEd(st.eds[prox], st)) + " ›</button>" : "<span></span>") + "</div></header>";
    // números do jogador
    var n = ed.numeros || {};
    var dp = n.popAntes != null ? n.pop - n.popAntes : null;
    h += '<div class="v3m-faixa"><span>Sua aprovação <b>' + Math.round(n.pop) + "%</b>" + (dp != null && Math.abs(dp) >= 0.1 ? ' <i class="' + (dp >= 0 ? "up" : "down") + '">' + sinal(dp) + "</i>" : "") + "</span><span>Escândalo <b>" + Math.round(n.esc || 0) + "%</b></span><span>Seguidores <b>" + fmtK(n.seg || 0) + "</b></span><span>" + mats.filter(function (x) { return x.jog; }).length + " matéria(s) sobre você</span></div>";
    h += '<div class="v3m-capa">';
    if (princ) {
      h += '<article class="v3m-princ' + (princ.jog ? " jog" : "") + '"><div class="v3m-kick">' + esc_(princ.sec) + (princ.kick ? " · " + esc_(princ.kick) : "") + " " + chipTom(princ.tom) + "</div>" +
        "<h2>" + esc_(princ.tit) + "</h2><p>" + esc_(princ.lead) + "</p>" + veicHtml(princ.veic) + "</article>";
    }
    var c = ed.coluna;
    if (c) h += '<aside class="v3m-coluna"><div class="v3m-kick">Opinião</div><h3>' + esc_(c.tit) + "</h3><p>" + esc_(c.texto) + '</p><div class="v3m-autor">' + esc_(c.autor) + " · " + esc_(c.cargo) + "</div></aside>";
    h += "</div>";
    h += '<div class="v3m-grade">';
    resto.forEach(function (m) {
      h += '<article class="v3m-mat' + (m.jog ? " jog" : "") + '"><div class="v3m-kick">' + esc_(m.sec) + (m.kick ? " · " + esc_(m.kick) : "") + " " + chipTom(m.tom) + "</div><h3>" + esc_(m.tit) + "</h3>" + (m.lead ? "<p>" + esc_(m.lead) + "</p>" : "") +
        (m.lista ? '<details class="v3m-lista"><summary>Ver lista</summary><ul>' + m.lista.map(function (t) { return "<li>" + esc_(t) + "</li>"; }).join("") + "</ul></details>" : "") + veicHtml(m.veic) + "</article>";
    });
    h += "</div>";
    // repercussão
    var top = (ed.posts || []).filter(function (p) { return p.cita; }).sort(function (a, b) { return b.likes - a.likes; }).slice(0, 3);
    h += '<section class="v3m-rep"><div class="v3m-rep-h"><div><div class="v3m-kick">Na rede</div><h3>A repercussão</h3></div><button type="button" class="b confirma" data-a="tab" data-p="' + pj(["feed"]) + '">Abrir rede social</button></div>' +
      '<div class="v3m-trend">' + (ed.trending || []).map(function (t) { return '<span><b>' + esc_(t.tag) + "</b><small>" + fmtK(t.vol) + " posts</small></span>"; }).join("") + "</div>" +
      '<div class="v3m-rep-posts">' + top.map(function (p) { return postHtml(p, st, true); }).join("") + "</div></section>";
    h += '<div class="v3m-rodape"><button type="button" class="b branco" data-a="tab" data-p="' + pj(["mang"]) + '">Arquivo de manchetes</button><button type="button" class="b branco" data-a="tab" data-p="' + pj(["imp"]) + '">Assessoria de imprensa</button></div>';
    return h + "</div>";
  }

  function viewFeed() {
    var st = estado(), j = J_(); if (!st || !j) return "";
    var ed0 = MID.edicao(); if (!ed0) return "";
    var f = ok(function () { return S.v3feed || "tudo"; }, "tudo");
    var r = ok(function () { return redeInit(); }, null) || { seg: 0, eng: 0 };
    var h = '<div class="v3m-feed"><div class="v3m-feed-main">';
    h += '<div class="v3m-perfil"><div class="v3m-perfil-av">' + (typeof window.fotoTag === "function" ? window.fotoTag(j, 56, 56) : "") + "</div><div><b>" + esc_(j.nome) + '</b><span class="v3m-hd">@' + esc_(slug(j.nome).slice(0, 15)) + "</span><small>" + esc_(j.cargo_atual) + " · " + esc_(siglaP(j.partido_atual)) + "</small></div>" +
      '<div class="v3m-perfil-n"><span><b>' + fmtK(r.seg || 0) + "</b>seguidores</span><span><b>" + Math.round(r.eng || 0) + "%</b>engajamento</span></div></div>";
    var tema = (ed0.materias.find(function (x) { return x.jog; }) || ed0.materias[0] || {}).tit || "";
    h += '<div class="v3m-compor"><div class="v3m-compor-h">O que você quer dizer' + (tema ? ' sobre <b>' + esc_(tema.slice(0, 80)) + "</b>" : "") + "?</div>" +
      '<div class="v3m-compor-b">' +
      '<button type="button" class="v3m-tomb" data-a="socialPublicarPost" data-p="' + pj(["institucional"]) + '"><b>Institucional</b><small>seguro, pouco alcance</small></button>' +
      '<button type="button" class="v3m-tomb" data-a="socialPublicarPost" data-p="' + pj(["popular"]) + '"><b>Popular</b><small>conversa com a rua</small></button>' +
      '<button type="button" class="v3m-tomb" data-a="socialPublicarPost" data-p="' + pj(["base"]) + '"><b>Para a base</b><small>agrada o partido</small></button>' +
      '<button type="button" class="v3m-tomb crit" data-a="socialPublicarPost" data-p="' + pj(["combate"]) + '"><b>Ataque</b><small>viraliza ou queima</small></button>' +
      "</div><small class=\"v3m-custo\">Cada post gasta energia. O resultado depende de carisma e retórica.</small></div>";
    var filtros = [["tudo", "Tudo"], ["mencoes", "Menções a você"], ["politicos", "Políticos"], ["imprensa", "Imprensa"], ["eleitores", "Eleitores"], ["meus", "Seus posts"]];
    h += '<div class="v3m-filtros">' + filtros.map(function (x) { return '<button type="button" class="' + (f === x[0] ? "on" : "") + '" data-a="midiaFiltro" data-p="' + pj([x[0]]) + '">' + x[1] + "</button>"; }).join("") + "</div>";
    var meus = st.meus.slice().reverse();
    var lista = [];
    meus.filter(function (p) { return p.ed === "pend"; }).forEach(function (p) { lista.push(p); });
    var nEd = ok(function () { return S.v3feedMais ? 6 : 2; }, 2);
    st.ordem.slice(0, nEd).forEach(function (k, i) {
      var ed = st.eds[k]; if (!ed) return;
      if (i > 0 || lista.length) lista.push({ sep: rotuloEd(ed, st) });
      meus.filter(function (p) { return p.ed === k; }).forEach(function (p) { lista.push(p); });
      (ed.posts || []).forEach(function (p) { lista.push(p); });
    });
    var filtra = function (p) {
      if (p.sep) return true;
      if (f === "mencoes") return p.cita;
      if (f === "politicos") return p.conta.tipo === "politico";
      if (f === "imprensa") return p.conta.tipo === "midia" || p.conta.tipo === "influencer";
      if (f === "eleitores") return p.conta.tipo === "eleitor";
      if (f === "meus") return p.meu;
      return true;
    };
    var vis = lista.filter(filtra).filter(function (p, i, arr) { return !p.sep || (arr[i + 1] && !arr[i + 1].sep); });
    h += '<div class="v3m-tl">' + (vis.length ? vis.map(function (p) { return p.sep ? '<div class="v3m-sep">' + esc_(p.sep) + "</div>" : postHtml(p, st, false); }).join("") : '<div class="v3m-vazio">Nada por aqui ainda.</div>') + "</div>";
    if (st.ordem.length > nEd) h += '<button type="button" class="b branco v3m-mais" data-a="midiaMais">Ver meses anteriores</button>';
    h += "</div>";
    h += '<aside class="v3m-feed-side"><div class="v3m-box"><div class="v3m-kick">Assuntos do momento</div>' + (ed0.trending || []).map(function (t, i) { return '<div class="v3m-tt"><small>' + (i + 1) + " · em alta</small><b>" + esc_(t.tag) + "</b><small>" + fmtK(t.vol) + " posts</small></div>"; }).join("") + "</div>" +
      '<div class="v3m-box"><div class="v3m-kick">No jornal</div>' + ed0.materias.slice(0, 4).map(function (m) { return '<div class="v3m-mini"><small>' + esc_(m.sec) + "</small><b>" + esc_(m.tit) + "</b></div>"; }).join("") + '<button type="button" class="b branco" data-a="tab" data-p="' + pj(["jornal"]) + '">Ler o jornal</button></div></aside>';
    return h + "</div>";
  }

  function capaHtml() {
    var st = estado(); if (!st) return "";
    var ed = MID.edicao(); if (!ed) return "";
    var mats = ed.materias.slice(0, 3);
    var top = (ed.posts || []).filter(function (p) { return p.cita; }).sort(function (a, b) { return b.likes - a.likes; })[0];
    var nova = MID.novidade();
    return '<section class="v3m-capa-mes"><div class="v3m-capa-h"><div><span class="pf-kicker">O PLENÁRIO · ' + esc_(rotuloEd(ed, st).toUpperCase()) + "</span><h2>O que estão dizendo" + (nova ? ' <i class="v3m-novo">nova edição</i>' : "") + "</h2></div>" +
      '<div class="v3m-capa-acts"><button type="button" class="b confirma mini" data-a="tab" data-p="' + pj(["jornal"]) + '">Ler o jornal</button><button type="button" class="b branco mini" data-a="tab" data-p="' + pj(["feed"]) + '">Rede social</button></div></div>' +
      '<div class="v3m-capa-g">' + mats.map(function (m, i) { return '<div class="v3m-capa-i' + (i === 0 ? " big" : "") + '"><small>' + esc_(m.sec) + " " + chipTom(m.tom) + "</small><b>" + esc_(m.tit) + "</b></div>"; }).join("") +
      (top ? '<div class="v3m-capa-post"><small>Mais comentado sobre você</small>' + postHtml(top, st, true) + "</div>" : "") + "</div></section>";
  }

  /* ------------------------------------------------------------------ ações do jogador na rede */
  var TX_MEU = {
    institucional: ["Sobre o caso {tema}: seguimos com responsabilidade, transparência e diálogo.", "Sobre o caso {tema}: nosso gabinete está à disposição e os dados são públicos.", "Compromisso firmado é compromisso cumprido. Seguimos acompanhando o caso {tema}."],
    popular: ["Bom dia, {bairro}! ☕ Hoje é dia de rua, ouvindo quem mais entende: vocês.", "Tem gente que comenta o caso {tema} de longe. Eu prefiro estar perto. 👊", "Passei no {bairro} e voltei com uma lista de pedidos. Bora resolver!"],
    base: ["O {partJ} tem lado e eu também. No caso {tema}, estamos firmes!", "Militância, obrigado! Sem vocês, a nossa voz não chegaria tão longe.", "Unidos somos mais fortes. #{sig}"],
    combate: ["Quem me critica no caso {tema} ficou calado por anos. Hipocrisia tem limite.", "Não vou aceitar mentira sobre {tema}. Os fatos estão aí. 🧾", "A oposição perdeu o rumo e quer arrastar todo mundo junto. Aqui não!"]
  };
  function instalarAcoes() {
    if (typeof A === "undefined" || A.__v3midia) return;
    A.__v3midia = true;
    A.midiaEd = function (k) { S.v3ed = k; S._top = true; };
    A.midiaFiltro = function (f) { S.v3feed = f; };
    A.midiaMais = function () { S.v3feedMais = !S.v3feedMais; };
    A.midiaPingAbrir = function () { var st = estado(); if (st) { st.lido = st.ping; S.v3ed = st.ping; } S.tab = "jornal"; S._top = true; S.sheet = false; };
    A.midiaPingRede = function () { var st = estado(); if (st) st.lido = st.ping; S.tab = "feed"; S.v3feed = "mencoes"; S._top = true; S.sheet = false; };
    A.midiaPingDepois = function () { var st = estado(); if (st) st.pingMin = true; };
    A.midiaPingPref = function () { try { localStorage.setItem("cadeira_ping_off", pingDesligado() ? "0" : "1"); } catch (e) {} var st = estado(); if (st && pingDesligado()) st.pingMin = true; var no = document.getElementById("v3m-ping"); if (no) no.removeAttribute("data-k"); };
    var energia = function () { return ok(function () { return J().energia; }, 0); };
    var caixa = function () { return ok(function () { return JSON.stringify(J().financas); }, ""); };
    var _pub = A.socialPublicarPost;
    if (_pub) A.socialPublicarPost = function (tom) {
      var e0 = energia(), p0 = ok(function () { return J().popularidade; }, 0);
      var res = _pub.apply(this, arguments);
      try {
        if (energia() === e0) return res;
        var st = estado(), j = J(), ed = MID.edicao(), r = rng(hash(tom + Date.now()));
        var dp = j.popularidade - p0, okk = dp >= 0;
        var m0 = ed && (ed.materias.find(function (x) { return x.jog; }) || ed.materias[0]);
        var tema = m0 ? temaDe(m0) : "o nosso trabalho";
        var v = { tema: tema, Tema: uc1(tema), bairro: nomeTerr(j.bairro) || "Mauá", partJ: siglaP(j.partido_atual), sig: slug(siglaP(j.partido_atual)).toUpperCase() };
        var seg = ok(function () { return redeInit().seg; }, 1500);
        var likes = Math.round(seg * (okk ? 0.04 + r() * 0.18 : 0.02 + r() * 0.06) * (tom === "combate" ? 2.2 : 1));
        var me = { nome: j.nome, handle: "@" + slug(j.nome).slice(0, 15), tipo: "eu", sub: j.cargo_atual + " · " + siglaP(j.partido_atual), selo: true };
        var pols = politicos(), riv = pick(r, pols.filter(function (n) { return n.partido !== j.partido_atual; })), bairro = v.bairro;
        var replies = [];
        replies.push({ conta: contaCidadao(r, bairro), texto: okk ? pick(r, ["Isso aí! 👏", "Falou tudo.", "Tamo junto!", "Agora sim, hein."]) : pick(r, ["Menos post e mais trabalho.", "Lacrou nada.", "Vai resolver o " + pick(r, LOCAIS) + " primeiro."]) });
        if (riv) replies.push({ conta: contaNpc(riv, "rival"), texto: pick(r, tom === "combate" ? ["Desespero bate forte, né?", "Quem fala o que quer ouve o que não quer.", "Vamos ver se repete isso no plenário."] : ["Discurso bonito. Cadê a entrega?", "Lembrando que o povo tem memória.", "Post não resolve " + tema + "."]) });
        st.meus.push({ id: "MEU_" + Date.now(), ed: "pend", meu: true, conta: me, texto: preencher(pick(r, TX_MEU[tom] || TX_MEU.institucional), v), min: 1, likes: likes, rts: Math.round(likes * 0.2), resp: Math.round(likes * 0.05) + replies.length, cita: false, ok: okk, tom: tom, replies: replies });
      } catch (e) { console.warn("midia post", e); }
      return res;
    };
    function marca(nomeA, campo, testa) {
      var orig = A[nomeA]; if (!orig) return;
      A[nomeA] = function (id) {
        var e0 = energia(), c0 = caixa();
        var res = orig.apply(this, arguments);
        try {
          if (energia() !== e0 || caixa() !== c0 || (testa && testa())) {
            var st = estado(); st.acoes[id] = st.acoes[id] || {}; st.acoes[id][campo] = true;
            if (campo === "resp") {
              var r = rng(hash(id + "r"));
              st.acoes[id].respTx = pick(r, ["Com respeito: os fatos mostram outra coisa. Estou à disposição para debater.", "Quem conhece o nosso trabalho sabe a verdade. Seguimos!", "Fake news não vai colar. Os dados estão no portal da transparência.", "Agradeço a crítica. Vamos conversar pessoalmente?"]);
            }
          }
        } catch (e) {}
        return res;
      };
    }
    marca("socialResponderPost", "resp");
    marca("socialRetweetarPost", "rt");
    marca("socialProcessarPost", "proc");
    marca("socialImpulsionarPost", "imp");
    var _tp = A.trocarPortalNoticias;
    if (_tp) A.trocarPortalNoticias = function (pid) { if (pid === "redes") { S.tab = "feed"; S._top = true; return; } return _tp.apply(this, arguments); };
  }

  /* ------------------------------------------------------------------ navegação */
  var ICO_JORNAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h13v14H6a2 2 0 0 1-2-2V5z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 17h4"/></svg>';
  function instalarNavegacao() {
    var N = window.NAVH; if (!N || !N.HUBS || N.__v3midia) return;
    N.__v3midia = true;
    N.HUBS.forEach(function (h) {
      if (h.id === "gabinete") h.subs = h.subs.filter(function (s) { return s[0] !== "mang"; });
      if (h.id === "influencia") h.subs = h.subs.filter(function (s) { return s[0] !== "imp"; });
    });
    var i = N.HUBS.findIndex(function (h) { return h.id === "influencia"; });
    N.HUBS.splice(i + 1, 0, { id: "midia", nome: "Mídia", subs: [["jornal", "Jornal do mês"], ["feed", "Rede social"], ["mang", "Arquivo de manchetes"], ["imp", "Assessoria de imprensa"]] });
    try { if (!TABS.some(function (t) { return t[0] === "jornal"; })) TABS.push(["jornal", "Jornal"], ["feed", "Rede social"]); } catch (e) {}
    try { ICONES.jornal = ICO_JORNAL; } catch (e) {}
    try { if (Array.isArray(NAV_PRINC)) { var k = NAV_PRINC.indexOf("inf"); if (k >= 0) NAV_PRINC[k] = "jornal"; else if (NAV_PRINC.indexOf("jornal") < 0) NAV_PRINC.push("jornal"); } } catch (e) {}
  }
  function instalarViews() {
    if (typeof VIEWS === "undefined" || VIEWS.jornal) return;
    VIEWS.jornal = function () { return viewJornal(); };
    VIEWS.feed = function () { return viewFeed(); };
  }
  function instalarTurno() {
    if (typeof window.avancarMes !== "function" || window.avancarMes.__v3midia) return;
    var orig = window.avancarMes;
    var novo = function () {
      var antes = null;
      try { estado(); if (!estado().ordem.length) montarEdicao(null); antes = fotoDoMomento(); } catch (e) {}
      var r = orig.apply(this, arguments);
      try { montarEdicao(antes); } catch (e) { console.warn("midia edicao", e); }
      return r;
    };
    for (var k in orig) { try { novo[k] = orig[k]; } catch (e) {} }
    novo.__v3midia = true;
    window.avancarMes = novo;
    try { avancarMes = novo; } catch (e) {}
  }
  /* ---------- "O jornal chegou": aviso na virada do mês ---------- */
  function pingDesligado() { try { return localStorage.getItem("cadeira_ping_off") === "1"; } catch (e) { return false; } }
  function bloqueado() {
    if (document.querySelector(".evping, .dip-modal, .sheet, #apurMapa, #pfCmd:not([hidden])")) return true;
    if (document.querySelector("#app .modal")) return true;
    return ok(function () { return !!S.modal; }, false);
  }
  function mencoesNovas(ed) { return (ed && ed.posts || []).filter(function (p) { return p.cita; }).length; }
  function pingHtml(ed, st, mini) {
    var n = mencoesNovas(ed);
    if (mini) return '<button type="button" class="v3m-pill" data-a="midiaPingAbrir"><span class="v3m-pill-i">📰</span><span><b>Jornal novo</b><small>' + esc_(rotuloEd(ed, st)) + (n ? " · " + n + " menções a você" : "") + '</small></span></button>';
    var m = ed.materias, p0 = m[0], top = (ed.posts || []).filter(function (p) { return p.cita; }).sort(function (a, b) { return b.likes - a.likes; })[0];
    return '<div class="v3m-ping-c" role="dialog" aria-label="Jornal do mês">' +
      '<div class="v3m-ping-top"><span class="v3m-ping-nome">O Plenário</span><span class="v3m-ping-ed">Edição de ' + esc_(rotuloEd(ed, st)) + '</span><button type="button" class="v3m-ping-x" data-a="midiaPingDepois" aria-label="Minimizar">✕</button></div>' +
      (p0 ? '<div class="v3m-ping-man"><div class="v3m-kick">' + esc_(p0.sec) + " " + chipTom(p0.tom) + "</div><h3>" + esc_(p0.tit) + "</h3>" + (p0.lead ? "<p>" + esc_(p0.lead) + "</p>" : "") + "</div>" : "") +
      '<ul class="v3m-ping-l">' + m.slice(1, 4).map(function (x) { return "<li><small>" + esc_(x.sec) + "</small>" + esc_(x.tit) + "</li>"; }).join("") + "</ul>" +
      (top ? '<div class="v3m-ping-post"><small>Na rede · ' + n + ' menções a você</small><p><b>' + esc_(top.conta.nome) + ":</b> " + esc_(top.texto.slice(0, 150)) + '</p><span>♥ ' + fmtK(top.likes) + "</span></div>" : "") +
      '<div class="v3m-ping-b"><button type="button" class="b confirma" data-a="midiaPingAbrir">Ler o jornal</button><button type="button" class="b branco" data-a="midiaPingRede">Ver a rede</button><button type="button" class="b link" data-a="midiaPingDepois">Depois</button></div>' +
      '<button type="button" class="v3m-ping-pref" data-a="midiaPingPref">' + (pingDesligado() ? "Voltar a abrir o jornal sozinho" : "Não abrir sozinho, só avisar") + "</button></div>";
  }
  function atualizarPing() {
    try {
      var no = document.getElementById("v3m-ping");
      var st = ok(function () { return gameState ? estado() : null; }, null);
      var ed = st && st.ping ? st.eds[st.ping] : null;
      var naTela = ok(function () { return S.tab === "jornal" || S.tab === "feed"; }, false);
      if (!st || !ed || st.lido === st.ping || naTela) { if (st && ed && naTela) st.lido = st.ping; if (no) no.remove(); return; }
      var mini = st.pingMin || pingDesligado();
      if (!mini && bloqueado()) { if (no && !no.classList.contains("mini")) no.remove(); return; }
      var chave = st.ping + (mini ? "m" : "g");
      if (no && no.getAttribute("data-k") === chave) return;
      if (!no) { no = document.createElement("div"); no.id = "v3m-ping"; document.body.appendChild(no); }
      no.className = mini ? "mini" : "grande";
      no.setAttribute("data-k", chave);
      no.innerHTML = pingHtml(ed, st, mini);
    } catch (e) { console.warn("midia ping", e); }
  }
  setInterval(atualizarPing, 1200);
  function aposRender() {
    atualizarPing();
    try { document.body.classList.toggle("v3m-novidade", MID.novidade()); } catch (e) {}
    try {
      if (!ok(function () { return !!gameState; }, false)) return;
      if (S.tab !== "mes") return;
      var main = document.getElementById("main"); if (!main || main.querySelector(".v3m-capa-mes")) return;
      var alvo = main.querySelector(".pf-news");
      var div = document.createElement("div"); div.innerHTML = capaHtml();
      var no = div.firstElementChild; if (!no) return;
      if (alvo) alvo.replaceWith(no);
      else { var plano = main.querySelector(".pf-plano"); if (plano) plano.insertAdjacentElement("afterend", no); }
    } catch (e) { console.warn("midia capa", e); }
  }
  // A barra de baixo (celular) troca Influência por Jornal; outra camada reescreve a lista no boot.
  function garantirBarra() {
    try { if (Array.isArray(NAV_PRINC)) { var k = NAV_PRINC.indexOf("inf"); if (k >= 0) NAV_PRINC[k] = "jornal"; } } catch (e) {}
  }
  function instalarRender() {
    if (typeof window.render !== "function" || window.render.__v3midia) return;
    var orig = window.render;
    var novo = function () { garantirBarra(); var r = orig.apply(this, arguments); aposRender(); return r; };
    for (var k in orig) { try { novo[k] = orig[k]; } catch (e) {} }
    novo.__v3midia = true;
    window.render = novo;
    try { render = novo; } catch (e) {}
  }
  function instalar() {
    try { instalarNavegacao(); } catch (e) { console.warn("midia nav", e); }
    try { instalarViews(); } catch (e) {}
    try { instalarAcoes(); } catch (e) {}
    try { instalarTurno(); } catch (e) {}
    try { instalarRender(); } catch (e) {}
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(function () { instalar(); }, 0); });
  window.addEventListener("load", function () { setTimeout(function () { instalar(); }, 0); });
})();
