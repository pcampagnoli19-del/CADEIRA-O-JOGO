/* =============================================================================
   CADEIRA v3 — Obras e programas no território (Poder > Obras e programas)
   Usa o motor de obras existente (OBRAS / M().obrasSys) e a memória
   administrativa (V3MEM). Acrescenta:
   - mapa por esfera: Mauá por bairros (Prefeitura), Estado de SP por regiões
     (Governo) e Brasil por UF (Presidência);
   - categorias adaptadas ao cargo (as áreas do catálogo daquela esfera);
   - localização de cada intervenção: o jogador escolhe o bairro/região/UF nas
     obras locais; obras com lugar definido no catálogo vão para lá; obras com
     várias unidades (ex.: "AME Express em 40 Cidades") distribuem as unidades
     pelo território, proporcional à população;
   - formas de representação: ponto/unidades (equipamentos), abrangência
     (obras de rede no território todo) e programas (painel de indicadores);
   - ciclo de vida: anúncio, início das obras, metade da execução, entregas
     parciais de unidades, conclusão; tudo vira notícia (manchete);
   - cerimônia de inauguração (quando o jogador chefia a administração):
     convidados entre aliados e tom do discurso, com consequências;
   - resultados medidos (unidades, vagas/atendimentos, investimento, tempo,
     regiões) calculados a partir dos dados da obra;
   - agenda de entregas previstas.
   Dados por obra: inst.v3u = { n, un, metr, porUn, locs[], ordem[], marcos[], ent[] ... }
   Dados gerais:   M().v3obras = { cerim: [...] }
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3OBRAS) return;
  var VO = (window.V3OBRAS = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function agora() { return ok(function () { return agoraM(); }, 0); }
  function cid() { return ok(function () { return cargoAtualId(); }, "CIDADAO"); }
  function OB() { return window.OBRAS; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed) { var a = hash(seed); return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function quando(m) { var d = ok(function () { return dt(); }, null); if (!d) return ""; var tot = d.ano * 12 + ((d.mes || 1) - 1) - (agora() - m); return MESES[((tot % 12) + 12) % 12] + "/" + Math.floor(tot / 12); }
  function fmtMi(v) { v = Number(v) || 0; return v >= 1000 ? "R$ " + (v / 1000).toFixed(1).replace(".", ",") + " bi" : "R$ " + Math.round(v).toLocaleString("pt-BR") + " mi"; }
  function fmtR(n) { return fmtMi((Number(n) || 0) / 1e6); }
  function nInt(n) { return Math.round(n || 0).toLocaleString("pt-BR"); }

  /* ================================================================ esferas e territórios */
  var UF_EL = { AC: 600, AL: 2300, AM: 2700, AP: 560, BA: 11300, CE: 6700, DF: 2200, ES: 2900, GO: 4900, MA: 5100, MG: 16000, MS: 2000, MT: 2600, PA: 6100, PB: 3100, PE: 7000, PI: 2500, PR: 8400, RJ: 12900, RN: 2500, RO: 1200, RR: 400, RS: 8500, SC: 5500, SE: 1700, SP: 34600, TO: 1100 };
  var UF_NOME = { AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul", MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco", PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo", TO: "Tocantins" };
  var UF_REG = { AC: "norte", AM: "norte", AP: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte", AL: "ne", BA: "ne", CE: "ne", MA: "ne", PB: "ne", PE: "ne", PI: "ne", RN: "ne", SE: "ne", DF: "co", GO: "co", MT: "co", MS: "co", ES: "sudeste", MG: "sudeste", RJ: "sudeste", PR: "sul", RS: "sul", SC: "sul", SP: "capital" };
  var ESF = {
    PREF: { esf: "Prefeito", geo: "maua", adm: "Prefeitura de Mauá", lugar: "bairro", lugares: "bairros" },
    GOV: { esf: "Governador", geo: "sp", adm: "Governo do Estado de São Paulo", lugar: "região", lugares: "regiões" },
    PRES: { esf: "Presidente", geo: "br", adm: "Governo Federal", lugar: "estado", lugares: "estados" }
  };
  VO.ESF = ESF;
  function geo(adm) { return ok(function () { return GEO[ESF[adm].geo]; }, null); }
  function regioes(adm) { var g = geo(adm); return g ? Object.keys(g.p) : []; }
  function nomeReg(adm, id) {
    if (adm === "PRES") return UF_NOME[id] || id;
    var t = ok(function () { return TERRITORIOS.find(function (x) { return x.id === id; }); }, null);
    if (adm === "GOV" && id === "capital") return "Grande São Paulo";
    return t ? t.nome : id;
  }
  function pesoReg(adm, id) {
    if (adm === "PRES") return UF_EL[id] || 500;
    var t = ok(function () { return TERRITORIOS.find(function (x) { return x.id === id; }); }, null);
    return t ? (t.el || 1) : 1;
  }
  function territoriosDe(adm, ids) { // ids do mapa -> territórios de aprovação
    if (adm !== "PRES") return ids.slice();
    var o = {}; ids.forEach(function (u) { o[UF_REG[u] || "sudeste"] = 1; }); return Object.keys(o);
  }

  /* ================================================================ categorias */
  var CAT = {
    "Saúde": ["🏥", "Saúde"], "Educação": ["🎓", "Educação"], "Mobilidade": ["🚇", "Mobilidade urbana"], "Segurança Pública": ["🛡️", "Segurança pública"],
    "Habitação": ["🏘️", "Habitação"], "Saneamento": ["💧", "Saneamento"], "Meio Ambiente": ["🌳", "Meio ambiente"], "Assistência Social": ["🤝", "Assistência social"],
    "Economia": ["📈", "Desenvolvimento econômico"], "Cultura": ["🎭", "Cultura"], "Esporte": ["⚽", "Esporte"], "Cultura e Esporte": ["🎭", "Cultura e esporte"],
    "Energia": ["⚡", "Energia"], "Agricultura": ["🌾", "Agricultura"], "Tecnologia": ["📡", "Tecnologia"], "Trabalho": ["🧰", "Trabalho e renda"], "Administração": ["🏛️", "Administração"]
  };
  function ico(a) { return (CAT[a] || ["•"])[0]; }
  function nomeCat(a) { return (CAT[a] || [0, a])[1]; }
  function itensEsfera(adm) { var e = ESF[adm].esf; return ok(function () { return OB().DB.filter(function (it) { return it.esfera_executora === e || (it.solicitantes || []).indexOf(e) >= 0; }); }, []); }
  function categorias(adm) {
    var e = ESF[adm].esf, a = {};
    itensEsfera(adm).forEach(function (it) { if (it.esfera_executora === e) a[it.area] = 1; });
    return Object.keys(a).sort(function (x, y) { return nomeCat(x).localeCompare(nomeCat(y), "pt"); });
  }

  /* ================================================================ unidades e métricas */
  // obras com várias unidades (catálogo). [n, rótulo da unidade, métrica, por unidade]
  var UNID = {
    "OBR-PRF-001": [7, "UBS", "pessoas atendidas", 18000], "OBR-PRF-012": [6, "creches", "vagas em creche", 150], "OBR-PRF-013": [5, "escolas", "alunos em tempo integral", 600],
    "OBR-PRF-017": [12, "quadras cobertas", "alunos beneficiados", 450], "OBR-PRF-036": [7, "ecopontos", "toneladas recicladas/ano", 900], "OBR-PRF-061": [14, "academias e quadras", "frequentadores/mês", 1200],
    "OBR-PRF-043": [4, "conjuntos habitacionais", "moradias", 200], "OBR-PRF-065": [20, "pontos de Wi-Fi", "acessos/dia", 600], "OBR-PRF-049": [3, "bases da Guarda", "bairros cobertos", 2],
    "OBR-GOV-004": [60, "Fatecs e Etecs", "vagas de ensino técnico", 1200], "OBR-GOV-006": [120, "escolas em tempo integral", "alunos", 900], "OBR-GOV-014": [40, "AMEs Express", "consultas/ano", 60000],
    "OBR-GOV-016": [30, "UPAs 24h", "atendimentos/ano", 90000], "OBR-GOV-017": [20, "ambulatórios da mulher", "consultas/ano", 40000], "OBR-GOV-048": [40, "batalhões e delegacias", "policiais lotados", 120],
    "OBR-GOV-052": [30, "Delegacias da Mulher 24h", "atendimentos/ano", 6000], "OBR-GOV-061": [50, "conjuntos CDHU", "moradias", 400], "OBR-GOV-066": [8, "parques estaduais", "hectares protegidos", 1500],
    "OBR-GOV-072": [12, "teatros e centros culturais", "lugares", 600], "OBR-GOV-073": [15, "arenas esportivas", "frequentadores/mês", 8000], "OBR-GOV-051": [6, "unidades prisionais", "vagas", 800],
    "OBR-GOV-069": [10, "centros de abastecimento", "toneladas/mês", 3000], "OBR-GOV-058": [12, "piscinões", "milhões de litros de reservação", 300],
    "OBR-PRE-006": [100, "campi de Institutos Federais", "vagas", 1200], "OBR-PRE-007": [27, "hospitais universitários", "leitos", 250], "OBR-PRE-017": [50, "policlínicas", "consultas/ano", 80000],
    "OBR-PRE-018": [12, "hospitais do câncer", "leitos oncológicos", 180], "OBR-PRE-051": [30, "núcleos de moradia rural", "moradias", 300], "OBR-PRE-075": [5, "centros de treinamento olímpico", "atletas", 400]
  };
  var SING = { "UBS": "UBS", "creches": "creche", "escolas": "escola", "quadras cobertas": "quadra coberta", "ecopontos": "ecoponto", "academias e quadras": "academia ao ar livre", "conjuntos habitacionais": "conjunto habitacional", "pontos de Wi-Fi": "ponto de Wi-Fi", "bases da Guarda": "base da Guarda",
    "Fatecs e Etecs": "Fatec/Etec", "escolas em tempo integral": "escola em tempo integral", "AMEs Express": "AME Express", "UPAs 24h": "UPA 24h", "ambulatórios da mulher": "ambulatório da mulher", "batalhões e delegacias": "batalhão ou delegacia", "Delegacias da Mulher 24h": "Delegacia da Mulher 24h",
    "conjuntos CDHU": "conjunto CDHU", "parques estaduais": "parque estadual", "teatros e centros culturais": "teatro ou centro cultural", "arenas esportivas": "arena esportiva", "unidades prisionais": "unidade prisional", "centros de abastecimento": "centro de abastecimento", "piscinões": "piscinão",
    "campi de Institutos Federais": "campus de Instituto Federal", "hospitais universitários": "hospital universitário", "policlínicas": "policlínica", "hospitais do câncer": "hospital do câncer", "núcleos de moradia rural": "núcleo de moradia rural", "centros de treinamento olímpico": "centro de treinamento olímpico", "unidades": "unidade", "obra": "obra" };
  function unTxt(u, n) { return n === 1 ? (SING[u] || u) : u; }
  function jogFem() { return ok(function () { return J().sexo === "F"; }, false); }
  // lugares fixos citados no catálogo (por esfera)
  function lugaresFixos(adm, it) {
    var l = (it.local || "") + " " + (it.nome || "");
    if (adm === "PRES") {
      var ufs = [];
      Object.keys(UF_NOME).forEach(function (u) { if (new RegExp("\\(" + u + "\\)|\\b" + UF_NOME[u] + "\\b").test(l)) ufs.push(u); });
      if (/Mauá|ABC|São Paulo|Campinas|Registro|Vale do Ribeira|Paulista/.test(l) && ufs.indexOf("SP") < 0) ufs.push("SP");
      if (/Brasília/.test(l)) ufs.push("DF");
      if (/Rondônia/.test(l)) ufs.push("RO"); if (/Roraima/.test(l)) ufs.push("RR");
      if (/Nordeste/.test(l)) ufs = ufs.concat(["BA", "PE", "CE", "MA", "PB", "RN", "AL", "PI", "SE"]);
      if (/Amazônia/.test(l)) ufs = ufs.concat(["AM", "PA", "AC", "RO", "RR", "AP"]);
      if (/Centro-Oeste/.test(l)) ufs = ufs.concat(["GO", "MT", "MS"]);
      if (/Pecém/.test(l)) ufs.push("CE"); if (/Suape/.test(l)) ufs.push("PE"); if (/Angra/.test(l)) ufs.push("RJ");
      var u2 = {}; ufs.forEach(function (x) { u2[x] = 1; }); return Object.keys(u2);
    }
    if (adm === "GOV") {
      var r = [];
      if (/Mauá|ABC|Grande São Paulo|Região Metropolitana|capital|Zona Leste/.test(l)) r.push("capital");
      if (/Vale do Ribeira|Registro|Litoral Sul/.test(l)) r.push("ribeira"); if (/Litoral Norte|Vale do Paraíba/.test(l)) r.push("vale");
      if (/Baixada|Santos/.test(l)) r.push("baixada"); if (/Oeste Paulista/.test(l)) r.push("oeste"); if (/Campinas/.test(l)) r.push("campinas"); if (/Sorocaba/.test(l)) r.push("sorocaba");
      return r;
    }
    return [];
  }
  // como a intervenção aparece: "unidades" (pontos), "local" (um ponto escolhido), "abrangencia" (rede no território), "programa"
  function tipoRep(adm, it) {
    if (it.categoria === "Programa") return "programa";
    if (it.categoria === "Manutenção") return "abrangencia";
    if (UNID[it.id]) return "unidades";
    if (lugaresFixos(adm, it).length) return "fixo";
    if (it.escopo === "Local" || (adm === "PREF")) return "local";
    return "abrangencia";
  }
  VO.tipoRep = tipoRep;
  function metricaPadrao(it) {
    var c = Number(it.custo_milhoes) || 10, a = it.area;
    if (a === "Saúde") return ["pessoas atendidas/ano", Math.round(c * 900)];
    if (a === "Educação") return ["vagas", Math.round(Math.max(120, c * 10))];
    if (a === "Habitação") return ["moradias", Math.round(Math.max(50, c * 4))];
    if (a === "Segurança Pública") return ["moradores na área de cobertura", Math.round(c * 2500)];
    if (a === "Saneamento") return ["moradores beneficiados", Math.round(c * 1200)];
    if (a === "Meio Ambiente") return ["moradores beneficiados", Math.round(c * 1500)];
    if (a === "Assistência Social") return ["atendimentos/mês", Math.round(c * 120)];
    if (a === "Economia" || a === "Trabalho") return ["empregos estimados", Math.round(c * 15)];
    if (a === "Cultura" || a === "Esporte" || a === "Cultura e Esporte") return ["frequentadores/mês", Math.round(c * 300)];
    if (a === "Mobilidade") return ["passageiros/dia", Math.round(c * 40)];
    return ["pessoas beneficiadas", Math.round(c * 500)];
  }
  function admDe(inst) { return (inst.mem && inst.mem.adm) || inst.esferaExec || "PREF"; }
  // distribui n unidades pelo território, proporcional ao peso (maiores restos)
  function distribuir(adm, n, seed) {
    var ids = regioes(adm), pesos = ids.map(function (id) { return pesoReg(adm, id); }), tot = pesos.reduce(function (a, b) { return a + b; }, 0) || 1;
    var base = ids.map(function (id, i) { return { id: id, q: n * pesos[i] / tot }; }), out = [];
    base.forEach(function (b) { b.k = Math.floor(b.q); b.r = b.q - b.k; for (var i = 0; i < b.k; i++) out.push(b.id); });
    base.sort(function (a, b) { return b.r - a.r; }).slice(0, n - out.length).forEach(function (b) { out.push(b.id); });
    var r = rnd(seed); for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  // prepara a obra para o território (uma vez por obra)
  function preparar(inst) {
    if (inst.v3u) return inst.v3u;
    var it = ok(function () { return OB().item(inst.catalogoId); }, null); if (!it) return null;
    var adm = admDe(inst); if (!ESF[adm]) return null;
    var tipo = tipoRep(adm, it), u = UNID[it.id], m = u ? [u[2], u[3]] : metricaPadrao(it), locs;
    if (tipo === "unidades") locs = distribuir(adm, u[0], inst.id);
    else if (tipo === "fixo") locs = lugaresFixos(adm, it);
    else if (tipo === "local") { var ids = regioes(adm); locs = [inst.v3loc || ids[hash(inst.id) % Math.max(1, ids.length)]]; }
    else locs = regioes(adm);
    var n = tipo === "unidades" ? u[0] : (tipo === "fixo" ? locs.length : 1), r = rnd(inst.id + "|m"), marcos = [];
    for (var k = 0; k < n; k++) marcos.push(n === 1 ? 100 : Math.min(99, Math.round(18 + 80 * (k + 1) / n + (r() - 0.5) * 60 / n)));
    marcos.sort(function (a, b) { return a - b; });
    var antigo = inst.estado === "Em manutenção";
    inst.v3u = { tipo: tipo, n: n, un: u ? u[1] : (n > 1 ? "unidades" : "obra"), metr: m[0], porUn: tipo === "unidades" || n > 1 ? m[1] : m[1], locs: locs, marcos: marcos,
      ent: marcos.map(function () { return antigo ? -1 : null; }), anunc: antigo || inst.mesInicio < agora() - 1, iniAnunc: antigo || inst.mesInicio < agora() - 1, meioAnunc: antigo || (inst.progresso || 0) >= 50, fimReg: antigo };
    if (tipo === "local" && !inst.v3loc) inst.v3loc = locs[0];
    return inst.v3u;
  }
  VO.preparar = preparar;
  function entregues(inst) { var u = inst.v3u; return u ? u.ent.filter(function (x) { return x != null; }).length : 0; }
  function resultado(inst) {
    var u = preparar(inst) || { n: 1, porUn: 0, locs: [] }, e = inst.estado === "Em manutenção" ? u.n : entregues(inst);
    var regs = {}; u.ent.forEach(function (x, k) { if (x != null || inst.estado === "Em manutenção") regs[u.locs[k] || u.locs[0]] = 1; });
    var fim = inst.mem && inst.mem.mFim != null ? inst.mem.mFim : agora();
    return { anunciadas: u.n, construidas: e, funcionando: inst.estado === "Em manutenção" ? Math.round(e * (inst.manutencaoNivel == null ? 1 : Math.min(1, inst.manutencaoNivel))) : e, beneficio: e * u.porUn, metr: u.metr,
      investido: inst.custoPago || 0, previsto: inst.custoTotal || 0, meses: Math.max(0, fim - (inst.mesInicio || fim)), regioes: Object.keys(regs) };
  }
  VO.resultado = resultado;

  /* ================================================================ ciclo de vida: notícias, entregas e cerimônias */
  function st() { var m = ok(function () { return M(); }, null); if (!m) return null; if (!m.v3obras) m.v3obras = { cerim: [] }; return m.v3obras; }
  function insts() { return ok(function () { var s = OB().garantir(); return Object.keys(s.instancias).map(function (k) { return s.instancias[k]; }); }, []); }
  function itemDe(inst) { return ok(function () { return OB().item(inst.catalogoId); }, null); }
  function titular(adm) { var g = ok(function () { return V3MEM.gestaoAtual(adm); }, null); return g ? g.nome : ok(function () { return J().nome; }, "o governo"); }
  function nota(txt) { ok(function () { manchete(txt, "obras"); }); }
  function listaLocais(adm, ids) { var n = ids.map(function (id) { return nomeReg(adm, id); }); return n.length > 4 ? n.slice(0, 3).join(", ") + " e mais " + (n.length - 3) : n.join(", ").replace(/, ([^,]*)$/, " e $1"); }
  function ehRede(inst) { return (inst.mem && inst.mem.rede) || String(inst.id).indexOf("OM_") === 0; }
  function ciclo() {
    var S2 = st(); if (!S2) return;
    insts().forEach(function (inst) {
      if (ehRede(inst)) return;
      var it = itemDe(inst), u = preparar(inst); if (!it || !u) return;
      var adm = admDe(inst), quem = titular(adm), jog = cid() === adm;
      if (!u.anunc) {
        u.anunc = true;
        nota((inst.mem && inst.mem.autor ? inst.mem.autor : quem) + ' anuncia "' + it.nome + '": ' + fmtMi(it.custo_milhoes) + (u.tipo === "programa" ? "" : " em " + (u.tipo === "abrangencia" ? ESF[adm].lugares + " de todo o território" : listaLocais(adm, u.locs))) + ", com " + nInt(u.n * u.porUn) + " " + u.metr + " previstos.");
      }
      if (!u.iniAnunc && inst.estado === "Em execução") {
        u.iniAnunc = true;
        var prev = (inst.mesInicio || agora()) + (inst.prazoMeses || it.prazo_meses || 12);
        nota('Começam as obras de "' + it.nome + '" (' + fmtMi(it.custo_milhoes) + "). Previsão de entrega: " + quando(prev) + ".");
      }
      if (!u.meioAnunc && (inst.progresso || 0) >= 50 && (Number(it.custo_milhoes) >= 300 || u.n >= 10) && inst.estado !== "Em manutenção") { u.meioAnunc = true; nota('"' + it.nome + '" chega a ' + Math.round(inst.progresso) + "% de execução" + (u.n > 1 ? ", com " + entregues(inst) + " de " + u.n + " " + u.un + " entregues" : "") + "."); }
      // entregas parciais conforme o cronograma de cada unidade
      var novas = [];
      u.marcos.forEach(function (mk, k) { if (u.ent[k] == null && ((inst.progresso || 0) >= mk || inst.estado === "Em manutenção")) { u.ent[k] = agora(); novas.push(k); } });
      if (novas.length && u.n > 1 && inst.estado !== "Em manutenção") {
        var ls = novas.map(function (k) { return u.locs[k]; });
        nota((jog ? ok(function () { return J().nome; }, quem) : quem) + " entrega " + novas.length + " " + unTxt(u.un, novas.length) + " de \"" + it.nome + '" (' + listaLocais(adm, ls) + "). Já são " + entregues(inst) + " de " + u.n + ".");
        ok(function () { OB()._aplicarEfeitos(inst, 0.25 * novas.length / u.n); });
        if (jog) { var pend = S2.cerim.filter(function (c) { return c.inst === inst.id && c.tipo === "parcial"; })[0];
          if (pend) { pend.unid = pend.unid.concat(novas); pend.m = agora(); } else S2.cerim.push({ id: "C" + inst.id + "_" + agora() + "_" + novas[0], inst: inst.id, tipo: "parcial", unid: novas, m: agora() }); }
        else ls.forEach(function () {});
      }
      if (inst.estado === "Em manutenção" && !u.fimReg) {
        u.fimReg = true; u.res = resultado(inst);
        if (jog) { S2.cerim = S2.cerim.filter(function (c) { return c.inst !== inst.id; }); S2.cerim.push({ id: "C" + inst.id + "_fim", inst: inst.id, tipo: "final", unid: novas, m: agora() }); }
        else nota(quem + ' inaugura "' + it.nome + '": ' + nInt(u.res.beneficio) + " " + u.metr + (u.n > 1 ? " em " + u.n + " " + u.un : "") + ".");
      }
    });
    // cerimônias não realizadas em 3 meses viram entrega discreta
    S2.cerim = S2.cerim.filter(function (c) {
      if (agora() - c.m < 3) return true;
      var inst = insts().filter(function (i) { return i.id === c.inst; })[0], it = inst && itemDe(inst);
      if (it) nota('"' + it.nome + '" é entregue sem cerimônia. A oposição diz que o governo "esconde" a obra.');
      return false;
    });
  }
  VO.ciclo = ciclo;

  /* ---------------- cerimônia de inauguração */
  var TONS = [
    ["tecnico", "Técnico", "Números, investimento e resultados. Pouco brilho, pouco risco."],
    ["politico", "Político", "Destaca o governo e os aliados. Agrada a base, irrita a oposição."],
    ["popular", "Popular", "Fala com os moradores atendidos. Rende mais na região, mas promessa demais cobra depois."],
    ["dividir", "Dividir os créditos", "Reconhece parceiros e outras esferas. Fortalece alianças."],
    ["protagonismo", "Reivindicar protagonismo", "A obra é da sua gestão. Pode render, mas parceiros podem se ressentir."]
  ];
  function convidaveis(inst) {
    var adm = admDe(inst), u = inst.v3u || { locs: [] };
    var alvo = { PREF: /Vereador|Secretário|Deputado/, GOV: /Prefeito|Deputado|Secretário|Senador/, PRES: /Ministro|Governador|Senador|Deputado Federal|Prefeito/ }[adm];
    return ok(function () {
      return bancoDeNPCs.filter(function (n) { return n.vivo && !n.jogador && alvo.test(n.cargo || "") && (n.relacao_com_jogador || 0) >= 5; })
        .sort(function (a, b) { return ((b.relacao_com_jogador || 0) + (b.popularidade || 0) / 4) - ((a.relacao_com_jogador || 0) + (a.popularidade || 0) / 4); }).slice(0, 8);
    }, []);
  }
  var cer = { id: null, conv: {}, tom: "tecnico" };
  function overlayCerimonia() {
    var S2 = st(); if (!S2) return;
    var c = S2.cerim.filter(function (x) { return x.id === cer.id; })[0], el = document.getElementById("v3o-cer");
    if (!c) { if (el) el.remove(); return; }
    var inst = insts().filter(function (i) { return i.id === c.inst; })[0], it = inst && itemDe(inst); if (!it) return;
    var adm = admDe(inst), u = preparar(inst), res = resultado(inst), locs = c.tipo === "final" ? u.locs : c.unid.map(function (k) { return u.locs[k]; });
    var cv = convidaveis(inst);
    var h = '<div class="v3o-cer"><div class="v3o-cer-box"><small>' + (c.tipo === "final" ? "Inauguração oficial" : "Entrega parcial") + " · " + esc_(ESF[adm].adm) + "</small><h2>" + esc_(it.nome) + "</h2>" +
      "<p>" + (c.tipo === "final" ? "Obra concluída" : c.unid.length + " " + unTxt(u.un, c.unid.length) + " prontas") + " em " + esc_(listaLocais(adm, locs)) + ".</p>" +
      '<div class="v3o-res">' + blocoResultado(inst, res) + "</div>" +
      "<h4>Quem você convida (até 3)</h4>" + (cv.length ? '<div class="v3o-conv">' + cv.map(function (n) { return '<label class="' + (cer.conv[n.id] ? "on" : "") + '"><input type="checkbox" data-v3o-conv="' + esc_(n.id) + '" ' + (cer.conv[n.id] ? "checked" : "") + "><b>" + esc_(n.nome) + "</b><small>" + esc_(n.cargo) + " · " + esc_(n.partidoBase || n.partido || "") + "</small></label>"; }).join("") + "</div>" : "<p class='v3o-nota'>Nenhum aliado disponível para convidar agora.</p>") +
      "<h4>Tom do discurso</h4><div class='v3o-tons'>" + TONS.map(function (t) { return '<button type="button" data-v3o-tom="' + t[0] + '" class="' + (cer.tom === t[0] ? "on" : "") + '"><b>' + t[1] + "</b><small>" + t[2] + "</small></button>"; }).join("") + "</div>" +
      '<div class="v3o-acoes"><button type="button" class="v3o-ok" data-v3o-cer="fazer">Realizar a inauguração (−8 energia)</button><button type="button" data-v3o-cer="discreta">Entrega discreta</button><button type="button" data-v3o-cer="depois">Decidir depois</button></div></div></div>';
    if (!el) { el = document.createElement("div"); el.id = "v3o-cer"; document.body.appendChild(el); }
    el.innerHTML = h;
  }
  function realizar(c, modo) {
    var S2 = st(), inst = insts().filter(function (i) { return i.id === c.inst; })[0], it = inst && itemDe(inst); if (!it) return;
    var adm = admDe(inst), u = preparar(inst), locs = c.tipo === "final" ? u.locs : c.unid.map(function (k) { return u.locs[k]; });
    var terrs = territoriosDe(adm, (function () { var o = {}; locs.forEach(function (x) { o[x] = 1; }); return Object.keys(o); })());
    var peso = c.tipo === "final" ? 1 : Math.max(0.25, Math.min(0.6, c.unid.length / Math.max(1, u.n) * 3));
    var atraso = (inst.prazoMeses || 0) > (it.prazo_meses || 0) + 2 || (inst.estouro || 0) > 0.1;
    var base = (it.polemica === 1 ? 1.3 : it.polemica >= 3 ? 0.6 : 1) * peso * (0.75 + Math.random() * 0.5) * (atraso ? 0.7 : 1);
    var conv = Object.keys(cer.conv).filter(function (k) { return cer.conv[k]; }).map(function (id) { return ok(function () { return bancoDeNPCs.find(function (n) { return n.id === id; }); }, null); }).filter(Boolean);
    var nome = ok(function () { return J().nome; }, "O governo"), msgs = [], reg = 0, geral = 0, esc = 0, relConv = 0;
    if (modo === "discreta") { reg = 0.6 * base; msgs.push(nome + ' entrega "' + it.nome + '" sem cerimônia, em ' + listaLocais(adm, locs) + "."); }
    else {
      if (!ok(function () { return gastarEnergia(8); }, true)) return;
      var t = cer.tom;
      if (t === "tecnico") { reg = 1.6 * base; geral = 0.15 * base; msgs.push(nome + ' inaugura "' + it.nome + '" com discurso técnico: ' + nInt(resultado(inst).beneficio) + " " + u.metr + " e " + fmtR(inst.custoPago) + " investidos. A imprensa destaca os números."); }
      else if (t === "politico") { reg = 1.2 * base; geral = 0.3 * base; relConv = 4; if (Math.random() < 0.45) { esc = 1; msgs.push("Oposição acusa " + nome + ' de transformar a inauguração de "' + it.nome + '" em ato de campanha.'); } else msgs.push(nome + ' inaugura "' + it.nome + '" em clima de comício e exalta os aliados.'); }
      else if (t === "popular") { reg = 2.6 * base; geral = 0.1 * base; if (atraso && Math.random() < 0.5) { reg -= 1.2; msgs.push('Moradores cobram ' + nome + ' na inauguração de "' + it.nome + '": "atrasou e ficou mais cara".'); } else msgs.push(nome + ' inaugura "' + it.nome + '" no meio dos moradores e é ' + (jogFem() ? "aplaudida" : "aplaudido") + '.'); }
      else if (t === "dividir") { reg = 1.3 * base; relConv = 8; msgs.push(nome + ' divide os créditos de "' + it.nome + '" com os parceiros' + (conv.length ? " (" + conv.map(function (n) { return n.nome; }).join(", ") + ")" : "") + "."); if (inst.solicitanteCargo && inst.solicitanteCargo !== adm) ok(function () { var g = V3MEM.gestaoAtual(inst.solicitanteCargo); var n = g && bancoDeNPCs.find(function (x) { return x.id === g.tid; }); if (n) n.relacao_com_jogador = Math.min(100, (n.relacao_com_jogador || 0) + 10); }); }
      else { reg = 2.0 * base; geral = 0.25 * base; relConv = -4; msgs.push(nome + ' reivindica "' + it.nome + '" como marca da gestão.'); if (conv.length && Math.random() < 0.4) msgs.push(conv[0].nome + " reclama nos bastidores de ter sido apagado na inauguração."); }
      conv.forEach(function (n) { n.relacao_com_jogador = Math.max(-100, Math.min(100, (n.relacao_com_jogador || 0) + relConv + 3)); if ((n.popularidade || 0) > 60) reg += 0.2; });
    }
    ok(function () { terrs.forEach(function (tid) { mudarAprov(tid, reg); }); });
    if (geral) ok(function () { aprovCargo(adm, geral); });
    if (esc) ok(function () { addEscandalo(esc); });
    msgs.forEach(nota);
    ok(function () { inst.mem.ev.push({ m: agora(), t: (modo === "discreta" ? "Entrega discreta" : "Cerimônia (" + (TONS.filter(function (x) { return x[0] === cer.tom; })[0] || [0, ""])[1] + ")") + (conv.length ? " com " + conv.map(function (n) { return n.nome; }).join(", ") : "") }); });
    S2.cerim = S2.cerim.filter(function (x) { return x.id !== c.id; });
    ok(function () { toast("Inauguração registrada. Aprovação na região: " + (reg >= 0 ? "+" : "") + reg.toFixed(1).replace(".", ",") + " pt.", reg >= 0 ? "ok" : "err"); });
    cer = { id: null, conv: {}, tom: "tecnico" };
  }
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest) return;
    var b = t.closest("[data-v3o-tom]"); if (b) { cer.tom = b.getAttribute("data-v3o-tom"); overlayCerimonia(); e.preventDefault(); return; }
    b = t.closest("[data-v3o-abrir]"); if (b) { cer = { id: b.getAttribute("data-v3o-abrir"), conv: {}, tom: "tecnico" }; overlayCerimonia(); e.preventDefault(); e.stopPropagation(); return; }
    b = t.closest("[data-v3o-cer]"); if (b) {
      e.preventDefault(); var k = b.getAttribute("data-v3o-cer"), S2 = st(), c = S2 && S2.cerim.filter(function (x) { return x.id === cer.id; })[0];
      if (k !== "depois" && c) realizar(c, k === "discreta" ? "discreta" : "fazer");
      cer.id = null; var el = document.getElementById("v3o-cer"); if (el) el.remove(); ok(function () { render(); }); return;
    }
  }, true);
  document.addEventListener("change", function (e) {
    var t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute("data-v3o-conv")) return;
    var id = t.getAttribute("data-v3o-conv"), n = Object.keys(cer.conv).filter(function (k) { return cer.conv[k]; }).length;
    if (t.checked && n >= 3) { t.checked = false; ok(function () { toast("Até 3 convidados.", "err"); }); return; }
    cer.conv[id] = t.checked; overlayCerimonia();
  }, true);

  /* ================================================================ tela: Poder > Obras e programas */
  var ui = { cat: null, sel: null, reg: null, pick: null, filtros: {}, mostrarProg: true };
  function admAtual() { var c = cid(); return ESF[c] ? c : (ui.admConsulta || "PREF"); }
  function instsAdm(adm) { return insts().filter(function (i) { return !ehRede(i) && admDe(i) === adm && itemDe(i); }); }
  function statusCls(inst) { var e = inst.estado; return e === "Em manutenção" ? "ok" : e === "Em execução" ? "and" : e === "Atrasada" ? "atr" : e === "Paralisada" ? "par" : e === "Abandonada" || e === "Recusada" ? "int" : "pla"; }
  function visiveis(adm) {
    return instsAdm(adm).filter(function (i) { var it = itemDe(i); if (ui.cat && it.area !== ui.cat) return false; if (!ui.cat && ui.filtros[it.area] === false) return false; return true; });
  }
  function svgMapa(adm) {
    var g = geo(adm); if (!g) return "<p>Mapa indisponível.</p>";
    var vis = visiveis(adm), porReg = {}, abr = {};
    vis.forEach(function (i) { var u = preparar(i); if (!u) return; if (u.tipo === "abrangencia" || u.tipo === "programa") { u.locs.forEach(function (r) { abr[r] = (abr[r] || 0) + 1; }); return; } u.locs.forEach(function (r, k) { var o = porReg[r] = porReg[r] || { n: 0, ent: 0, cats: {} }; o.n++; if (u.ent[k] != null) o.ent++; o.cats[itemDe(i).area] = 1; }); });
    var max = 1; Object.keys(porReg).forEach(function (r) { max = Math.max(max, porReg[r].n); });
    var h = '<svg class="v3o-svg" viewBox="0 0 ' + g.w + " " + g.h + '">';
    Object.keys(g.p).forEach(function (id) {
      var o = porReg[id], f = o ? 0.25 + 0.6 * o.n / max : 0, cls = (ui.reg === id ? " sel" : "") + (ui.pick ? " pick" : "") + (abr[id] ? " abr" : "");
      h += '<path class="v3o-reg' + cls + '" data-v3o-reg="' + id + '" d="' + g.p[id] + '" style="--f:' + f.toFixed(2) + '"><title>' + esc_(nomeReg(adm, id)) + "</title></path>";
    });
    var fs = g.w / (adm === "PRES" ? 44 : 34);
    Object.keys(g.c || {}).forEach(function (id) {
      var c = g.c[id], o = porReg[id];
      if (adm !== "PRES" || o) h += '<text class="v3o-lbl" x="' + c[0] + '" y="' + (c[1] + (o ? fs * 1.9 : 0)) + '" style="font-size:' + (adm === "PRES" ? fs * 0.8 : fs) + 'px">' + esc_(adm === "PRES" ? id : nomeReg(adm, id).replace("Jardim ", "Jd. ").replace("Vila ", "V. ").replace("Centro de Mauá", "Centro").replace(" e região", "")) + "</text>";
      if (o) { var ic = Object.keys(o.cats).slice(0, 3).map(ico).join(""); h += '<g class="v3o-pin" data-v3o-reg="' + id + '"><rect x="' + (c[0] - fs * 1.7) + '" y="' + (c[1] - fs * 0.9) + '" rx="' + fs * 0.6 + '" width="' + fs * 3.4 + '" height="' + fs * 1.6 + '"/><text x="' + c[0] + '" y="' + (c[1] + fs * 0.35) + '" style="font-size:' + fs * 0.85 + 'px">' + ic + " " + o.ent + "/" + o.n + "</text></g>"; }
    });
    return h + "</svg>";
  }
  function blocoResultado(inst, r) {
    var u = inst.v3u || {};
    return '<div class="v3o-kpis"><div><b>' + r.construidas + "/" + r.anunciadas + "</b><small>" + esc_(u.un || "unidades") + " entregues</small></div><div><b>" + r.funcionando + "</b><small>em funcionamento</small></div><div><b>" + nInt(r.beneficio) + "</b><small>" + esc_(r.metr) + "</small></div><div><b>" + fmtR(r.investido) + "</b><small>investidos de " + fmtR(r.previsto) + "</small></div><div><b>" + r.meses + "</b><small>meses de execução</small></div></div>" +
      (r.regioes.length ? "<p class='v3o-nota'>Beneficiados: " + esc_(listaLocais(admDe(inst), r.regioes)) + ".</p>" : "");
  }
  function painelObra(inst) {
    var it = itemDe(inst), u = preparar(inst), adm = admDe(inst), m = inst.mem || {}, r = resultado(inst);
    var prev = (inst.mesInicio || agora()) + (inst.prazoMeses || it.prazo_meses);
    var h = '<div class="v3o-det"><button type="button" class="v3o-voltar" data-v3o-sel="">‹ voltar</button><small>' + ico(it.area) + " " + esc_(nomeCat(it.area)) + " · " + esc_(it.categoria) + "</small><h3>" + esc_(it.nome) + "</h3>" +
      '<em class="v3o-st ' + statusCls(inst) + '">' + esc_(inst.estado) + "</em>" + (["Em execução", "Atrasada", "Paralisada"].indexOf(inst.estado) >= 0 ? '<div class="v3o-bar"><i style="width:' + Math.round(inst.progresso || 0) + '%"></i></div>' : "") +
      '<dl class="v3o-dl"><dt>Localização</dt><dd>' + esc_(u.tipo === "abrangencia" ? "Todo o território (" + ESF[adm].lugares + ")" : u.tipo === "programa" ? "Programa em todo o território" : listaLocais(adm, u.locs)) + "</dd>" +
      "<dt>Investimento</dt><dd>" + fmtR(inst.custoTotal) + " (pago " + fmtR(inst.custoPago) + ")</dd><dt>Prazo</dt><dd>" + (inst.prazoMeses || it.prazo_meses) + " meses · previsão " + quando(prev) + "</dd>" +
      "<dt>Progresso</dt><dd>" + Math.round(inst.progresso || 0) + "%" + (u.n > 1 ? " · " + entregues(inst) + " de " + u.n + " " + esc_(u.un) + " entregues" : "") + "</dd>" +
      "<dt>Responsável</dt><dd>" + esc_(ESF[adm].adm) + " · iniciada por " + esc_(m.autor || "—") + (inst.inauguradorNome ? " · inaugurada por " + esc_(inst.inauguradorNome) : "") + "</dd></dl>" +
      blocoResultado(inst, r);
    if (u.n > 1) h += "<h4>Unidades</h4><div class='v3o-unid'>" + u.locs.map(function (l, k) { return '<span class="' + (u.ent[k] != null ? "ok" : "") + '" title="' + esc_(nomeReg(adm, l)) + '">' + esc_(adm === "PRES" ? l : nomeReg(adm, l).split(" ")[0]) + "</span>"; }).join("") + "</div>";
    h += "<h4>Histórico</h4><ul class='v3o-ev'>" + (m.ev || []).slice().reverse().slice(0, 10).map(function (e) { return "<li><span>" + quando(e.m) + "</span>" + esc_(e.t) + "</li>"; }).join("") + "</ul></div>";
    return h;
  }
  function linhaInst(inst) {
    var it = itemDe(inst), u = preparar(inst);
    return '<button type="button" class="v3o-item" data-v3o-sel="' + esc_(inst.id) + '"><span>' + ico(it.area) + '</span><span class="t"><b>' + esc_(it.nome) + "</b><small>" + esc_(inst.estado) + " · " + Math.round(inst.progresso || 0) + "%" + (u && u.n > 1 ? " · " + entregues(inst) + "/" + u.n + " " + esc_(u.un) : "") + '</small></span><em class="v3o-st ' + statusCls(inst) + '"></em></button>';
  }
  function catalogoCat(adm) {
    var esf = ESF[adm].esf, c = cid() === adm;
    var its = itensEsfera(adm).filter(function (it) { return it.area === ui.cat && it.categoria !== "Manutenção"; });
    var ativo = function (id) { return insts().some(function (i) { return i.catalogoId === id && ["Abandonada", "Recusada"].indexOf(i.estado) < 0; }); };
    return its.map(function (it) {
      var rep = tipoRep(adm, it), ja = ativo(it.id), proprio = it.esfera_executora === esf;
      var acao = !c ? "" : ja ? '<span class="v3o-nota">já em curso</span>' : rep === "local" && proprio ? '<button type="button" class="v3o-btn" data-v3o-pick="' + it.id + '">' + (ui.pick === it.id ? "Toque num " + ESF[adm].lugar + " no mapa" : "Escolher local") + "</button>" : '<button type="button" class="v3o-btn" data-v3o-ini="' + it.id + '">' + (proprio ? "Iniciar" : "Pedir ao " + it.esfera_executora) + "</button>";
      var u = UNID[it.id], rot = rep === "unidades" ? u[0] + " " + u[1] : rep === "programa" ? "programa" : rep === "abrangencia" ? "rede no território" : rep === "fixo" ? listaLocais(adm, lugaresFixos(adm, it)) : "1 " + ESF[adm].lugar + " à escolha";
      return '<div class="v3o-cat"><div><b>' + esc_(it.nome) + "</b><small>" + esc_(it.categoria) + " · " + fmtMi(it.custo_milhoes) + " · " + it.prazo_meses + " meses · " + esc_(rot) + "</small></div>" + acao + "</div>";
    }).join("") || "<p class='v3o-nota'>Nada desta área no catálogo da sua esfera.</p>";
  }
  function programasCat(adm) {
    var foco = { "Saúde": /Saúde/, "Educação": /Educação/, "Habitação": /Habitação/, "Assistência Social": /Assistência|alimentar/, "Trabalho": /qualificação|Trabalho|renda/i, "Economia": /Econom|crédito/i, "Segurança Pública": /Segurança/ }[ui.cat];
    if (!foco) return "";
    var ps = ok(function () { return Object.values(M().prog.lista).filter(function (p) { return p.esf === adm && foco.test(p.foco || ""); }); }, []);
    if (!ps.length) return "";
    return "<h4>Programas em funcionamento</h4>" + ps.map(function (p) { var cob = p.ativo ? Math.min(1, p.orc / (p.pub * p.custo)) : 0; return '<div class="v3o-prog"><b>' + esc_(p.nome) + "</b><small>" + esc_(p.publico) + " · " + nInt(p.pub * cob) + " " + esc_(p.un) + " atendidos · alcance " + Math.round(cob * 100) + "% · eficácia " + Math.round(p.efi) + (p.ativo ? "" : " · SUSPENSO") + '</small><div class="v3o-bar"><i style="width:' + Math.round(cob * 100) + '%"></i></div></div>'; }).join("") + "<p class='v3o-nota'>Orçamento e cobertura dos programas são geridos no card \"Programas públicos\", na tela Executivo.</p>";
  }
  function agenda(adm) {
    var prox = [];
    instsAdm(adm).forEach(function (i) {
      var u = preparar(i); if (!u || ["Em execução", "Atrasada"].indexOf(i.estado) < 0) return;
      var restante = Math.max(1, (i.prazoMeses || 12) - (i.mesesDecorridos || 0));
      u.marcos.forEach(function (mk, k) { if (u.ent[k] != null) return; var falta = Math.max(0, mk - (i.progresso || 0)) / 100 * (i.prazoMeses || 12); prox.push({ m: agora() + Math.round(Math.min(restante, falta)), inst: i, k: k }); });
    });
    var grp = {}; prox.forEach(function (p) { var key = p.m + "|" + p.inst.id; (grp[key] = grp[key] || { m: p.m, inst: p.inst, n: 0, locs: [] }).n++; grp[key].locs.push(p.inst.v3u.locs[p.k]); });
    var l = Object.keys(grp).map(function (k) { return grp[k]; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 8);
    if (!l.length) return "";
    return "<h4>Agenda de entregas previstas</h4><ul class='v3o-ag'>" + l.map(function (g) { var it = itemDe(g.inst), u = g.inst.v3u; return "<li><span>" + quando(g.m) + "</span><b>" + esc_(it.nome) + "</b><small>" + (u.n > 1 ? g.n + " " + esc_(unTxt(u.un, g.n)) + " · " : "") + esc_(listaLocais(admDe(g.inst), g.locs)) + "</small></li>"; }).join("") + "</ul>";
  }
  function painelLateral(adm) {
    if (ui.sel) { var inst = insts().filter(function (i) { return i.id === ui.sel; })[0]; if (inst) return painelObra(inst); }
    var h = "";
    if (ui.pick) {
      var it = ok(function () { return OB().item(ui.pick); }, null);
      h += '<div class="v3o-pickbox"><b>' + esc_(it ? it.nome : "") + "</b><p>" + (ui.reg ? "Local escolhido: <b>" + esc_(nomeReg(adm, ui.reg)) + "</b>" : "Toque num " + ESF[adm].lugar + " no mapa para escolher onde construir.") + "</p>" + (ui.reg ? '<button type="button" class="v3o-btn ok" data-v3o-conf="1">Iniciar em ' + esc_(nomeReg(adm, ui.reg)) + "</button>" : "") + '<button type="button" class="v3o-btn" data-v3o-pick="">Cancelar</button></div>';
    }
    var vis = visiveis(adm);
    if (ui.reg && !ui.pick) { vis = vis.filter(function (i) { var u = preparar(i); return u && u.locs.indexOf(ui.reg) >= 0; }); h += "<h4>" + esc_(nomeReg(adm, ui.reg)) + ' <button type="button" class="v3o-link" data-v3o-reg="">ver tudo</button></h4>'; }
    var andam = vis.filter(function (i) { return i.estado !== "Em manutenção"; }), conc = vis.filter(function (i) { return i.estado === "Em manutenção"; });
    h += (andam.length ? "<h4>Em andamento (" + andam.length + ")</h4>" + andam.map(linhaInst).join("") : "") + (conc.length ? "<h4>Entregues (" + conc.length + ")</h4>" + conc.map(linhaInst).join("") : "");
    if (!andam.length && !conc.length) h += "<p class='v3o-nota'>Nenhuma intervenção " + (ui.cat ? "desta área " : "") + (ui.reg ? "neste " + ESF[adm].lugar + " " : "") + "ainda.</p>";
    if (ui.cat === "Mobilidade") h += '<p><button type="button" class="b confirma" data-a="tab" data-p="' + esc_(JSON.stringify(["mob"])) + '">Abrir o mapa da Mobilidade urbana</button></p>';
    if (ui.cat) h += "<h4>Propor nesta área</h4>" + catalogoCat(adm) + programasCat(adm);
    return h;
  }
  function pendentes() {
    var S2 = st(); if (!S2 || !S2.cerim.length) return "";
    return '<div class="v3o-pend"><b>🎗️ Inaugurações à sua espera</b>' + S2.cerim.map(function (c) { var inst = insts().filter(function (i) { return i.id === c.inst; })[0], it = inst && itemDe(inst); if (!it) return ""; var u = inst.v3u; return '<button type="button" data-v3o-abrir="' + esc_(c.id) + '">' + (c.tipo === "final" ? "Inauguração oficial: " : "Entrega de " + c.unid.length + " " + esc_(unTxt(u.un, c.unid.length)) + ": ") + esc_(it.nome) + " <small>até " + quando(c.m + 3) + "</small></button>"; }).join("") + "</div>";
  }
  function heroi(adm) {
    var l = instsAdm(adm), and = l.filter(function (i) { return ["Em execução", "Atrasada", "Paralisada"].indexOf(i.estado) >= 0; }).length, conc = l.filter(function (i) { return i.estado === "Em manutenção"; }).length;
    var un = l.reduce(function (s, i) { preparar(i); return s + (i.estado === "Em manutenção" ? (i.v3u ? i.v3u.n : 1) : entregues(i)); }, 0), inv = l.reduce(function (s, i) { return s + (i.custoPago || 0); }, 0);
    var papel = cid() === adm ? "Você chefia esta administração: escolha uma área, veja o território e proponha intervenções." : "Consulta: só quem chefia a administração inicia obras aqui.";
    return '<section class="v3o-hero"><div><small>Obras e programas</small><h2>' + esc_(ESF[adm].adm) + "</h2><p>" + papel + '</p></div><div class="v3o-hkpi"><div><b>' + and + "</b><small>em andamento</small></div><div><b>" + conc + "</b><small>concluídas</small></div><div><b>" + un + "</b><small>unidades entregues</small></div><div><b>" + fmtR(inv) + "</b><small>investidos</small></div></div></section>";
  }
  function corpo() {
    var adm = admAtual(), cats = categorias(adm);
    if (ui.lastAdm !== adm) { ui.lastAdm = adm; ui.sel = null; ui.reg = null; ui.pick = null; ui.cat = null; }
    if (ui.cat && cats.indexOf(ui.cat) < 0) ui.cat = null;
    var chips = '<div class="v3o-cats"><button type="button" data-v3o-cat="" class="' + (!ui.cat ? "on" : "") + '">🗺️ Visão geral</button>' + cats.map(function (a) { var n = instsAdm(adm).filter(function (i) { return itemDe(i).area === a && i.estado !== "Em manutenção"; }).length; return '<button type="button" data-v3o-cat="' + esc_(a) + '" class="' + (ui.cat === a ? "on" : "") + '">' + ico(a) + " " + esc_(nomeCat(a)) + (n ? " <i>" + n + "</i>" : "") + "</button>"; }).join("") + "</div>";
    var filtros = !ui.cat ? '<div class="v3o-filtros"><small>Mostrar no mapa:</small>' + cats.map(function (a) { return '<label><input type="checkbox" data-v3o-filtro="' + esc_(a) + '" ' + (ui.filtros[a] === false ? "" : "checked") + ">" + ico(a) + "</label>"; }).join("") + "</div>" : "";
    var consulta = ESF[cid()] ? "" : '<div class="v3o-cons"><small>Consultar:</small>' + Object.keys(ESF).map(function (k) { return '<button type="button" data-v3o-adm="' + k + '" class="' + (adm === k ? "on" : "") + '">' + esc_(ESF[k].adm) + "</button>"; }).join("") + "</div>";
    return heroi(adm) + consulta + pendentes() + chips + '<div class="v3o-duo"><div class="v3o-esq"><div class="v3o-mapa">' + svgMapa(adm) + "</div>" + filtros + '<p class="v3o-leg"><span class="lg1"></span> mais intervenções no ' + ESF[adm].lugar + ' <span class="lg2"></span> rede ou programa em todo o território · selo = entregues/total</p>' + agenda(adm) + '</div><div class="v3o-dir">' + painelLateral(adm) + "</div></div>";
  }
  function view() {
    ok(ciclo);
    return '<div class="v3o" data-v3o="1">' + corpo() + "</div>" + '<details class="v3o-antigo"><summary>Lista completa no formato antigo</summary>' + ok(function () { return OB()._cardCatalogo(false); }, "") + "</details>";
  }
  VO.view = view;
  function atualizar() { var b = document.querySelector('.v3o[data-v3o="1"]'); if (b) b.innerHTML = corpo(); }
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest || !t.closest('.v3o[data-v3o="1"]')) return;
    var b;
    if ((b = t.closest("[data-v3o-cat]"))) { ui.cat = b.getAttribute("data-v3o-cat") || null; ui.sel = null; ui.reg = null; ui.pick = null; }
    else if ((b = t.closest("[data-v3o-adm]"))) { ui.admConsulta = b.getAttribute("data-v3o-adm"); ui.sel = null; ui.reg = null; ui.cat = null; }
    else if ((b = t.closest("[data-v3o-sel]"))) { ui.sel = b.getAttribute("data-v3o-sel") || null; }
    else if ((b = t.closest("[data-v3o-pick]"))) { ui.pick = b.getAttribute("data-v3o-pick") || null; ui.reg = null; ui.sel = null; }
    else if ((b = t.closest("[data-v3o-reg]"))) { var r = b.getAttribute("data-v3o-reg") || null; ui.reg = ui.reg === r ? null : r; ui.sel = null; }
    else if ((b = t.closest("[data-v3o-ini]"))) { iniciar(b.getAttribute("data-v3o-ini"), null); }
    else if ((b = t.closest("[data-v3o-conf]"))) { if (ui.pick && ui.reg) iniciar(ui.pick, ui.reg); ui.pick = null; }
    else return;
    e.preventDefault(); e.stopPropagation(); atualizar();
  }, true);
  document.addEventListener("change", function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute("data-v3o-filtro")) { ui.filtros[t.getAttribute("data-v3o-filtro")] = t.checked; atualizar(); } }, true);
  function iniciar(catId, reg) {
    var antes = {}; insts().forEach(function (i) { antes[i.id] = 1; });
    ok(function () { OB().iniciar(catId); });
    var nova = insts().filter(function (i) { return !antes[i.id] && i.catalogoId === catId; })[0];
    if (nova) { if (reg) { nova.v3loc = reg; nova.v3u = null; } ok(function () { V3MEM.registrar(); }); preparar(nova); ciclo(); ui.sel = nova.id; }
  }

  /* ================================================================ instalação */
  function atalho() {
    var b1 = typeof btn === "function" ? btn("Abrir Obras e programas", "tab", ["obras"], "confirma") : "", b2 = typeof btn === "function" ? btn("Abrir Mobilidade urbana", "tab", ["mob"], "") : "";
    return typeof card === "function" ? card("Obras e Programas", "<p class='txt'>Obras, equipamentos e programas agora ficam no mapa do território, por área, em Poder › Obras e programas. A mobilidade tem área própria.</p><div class='row'>" + b1 + b2 + "</div>") : "";
  }
  function instalar() {
    if (typeof VIEWS === "undefined") return;
    if (!VIEWS.obras) VIEWS.obras = function () { return view(); };
    ok(function () { if (!TABS.some(function (t) { return t[0] === "obras"; })) TABS.push(["obras", "Obras e programas"]); });
    var N = window.NAVH;
    if (N && N.HUBS) N.HUBS.forEach(function (h) { if (h.id === "poder" && !h.subs.some(function (s) { return s[0] === "obras"; })) h.subs.push(["obras", "Obras e programas"]); });
    var O_ = OB();
    if (O_ && O_._cardCatalogo && !O_.__v3obrasTab) { O_.__v3obrasTab = true; O_.__v3mobTab = true; O_.cardCatalogo = function () { return atalho(); }; }
    if (O_ && O_.tickMensal && !O_.tickMensal.__v3o) {
      var o = O_.tickMensal;
      O_.tickMensal = function () { var r = o.apply(this, arguments); try { ciclo(); } catch (e) { console.warn("v3obras", e); } return r; };
      for (var k in o) { try { O_.tickMensal[k] = o[k]; } catch (e) {} }
      O_.tickMensal.__v3o = true;
    }
    if (typeof VIEWS.mes === "function" && !VIEWS.mes.__v3o) {
      var vm = VIEWS.mes;
      var n = function () { var h = vm.apply(this, arguments); try { var p = pendentes(); if (p && String(h).indexOf("v3o-pend") < 0) h = (typeof card === "function" ? card("Inaugurações", '<div class="v3o v3o-mini">' + p + "</div>") : p) + h; } catch (e) {} return h; };
      for (var k2 in vm) { try { n[k2] = vm[k2]; } catch (e) {} }
      n.__v3o = true; VIEWS.mes = n;
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 80); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 24) clearInterval(t0); }, 500);
})();
