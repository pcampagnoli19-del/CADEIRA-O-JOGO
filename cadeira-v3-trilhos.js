/* =============================================================================
   CADEIRA v3 — Rede metropolitana de trilhos (metrô, CPTM e trens regionais)
   Mapa interativo da Grande São Paulo cujo estado vem das OBRAS do jogo:
   cada trecho novo, extensão, melhoria de linha ou equipamento de estação está
   ligado a um ou mais itens do catálogo de obras (OBRAS.DB) e muda de aparência
   conforme a instância da obra (M().obrasSys): planejado → em aprovação → em
   obras (com o avanço desenhado) → em operação; paralisado e cancelado também.
   Estrutura pensada para crescer sem refazer nada:
     ESTACOES  id → { n: nome, c: [lat, lon] }
     LINHAS    id → { num, nome, op, cor, modo }
     TRECHOS   [ { id, linha, est: [ids na ordem do traçado], paradas?: [ids],
                   base: "operacao" | "planejado", obras?: [ids do catálogo],
                   stub?: { de, dx, dy, rotulo } } ]
     MELHORIAS [ { linha, obras, rotulo } ]   (obras que mudam uma linha inteira)
     PONTOS    [ { est, obras, rotulo } ]      (equipamentos em estações)
   Coordenadas aproximadas (traçados de referência de projetos públicos; não é
   o mapa oficial do Metrô nem da CPTM).
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3TRILHOS) return;
  var TR = (window.V3TRILHOS = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }

  /* ================================================================ dados */
  var E = {}; // estações
  [["tucuruvi", "Tucuruvi", -23.4797, -46.6030], ["santana", "Santana", -23.5025, -46.6253], ["tiete", "Portuguesa-Tietê", -23.5164, -46.6252], ["luz", "Luz", -23.5350, -46.6350],
    ["saobento", "São Bento", -23.5440, -46.6340], ["se", "Sé", -23.5505, -46.6333], ["liberdade", "Liberdade", -23.5558, -46.6355], ["saojoaquim", "São Joaquim", -23.5617, -46.6383],
    ["paraiso", "Paraíso", -23.5754, -46.6410], ["anarosa", "Ana Rosa", -23.5810, -46.6380], ["santacruz", "Santa Cruz", -23.5990, -46.6370], ["saude", "Saúde", -23.6180, -46.6390], ["jabaquara", "Jabaquara", -23.6460, -46.6410],
    ["vilamadalena", "Vila Madalena", -23.5465, -46.6910], ["clinicas", "Clínicas", -23.5545, -46.6705], ["consolacao", "Consolação", -23.5575, -46.6605], ["trianon", "Trianon-Masp", -23.5615, -46.6560], ["brigadeiro", "Brigadeiro", -23.5685, -46.6490],
    ["chacaraklabin", "Chácara Klabin", -23.5925, -46.6290], ["altoipiranga", "Alto do Ipiranga", -23.6020, -46.6125], ["sacoma", "Sacomã", -23.6010, -46.6020], ["tamanduatei", "Tamanduateí", -23.5925, -46.5890], ["vilaprudente", "Vila Prudente", -23.5850, -46.5820],
    ["orfanato", "Orfanato", -23.5745, -46.5755], ["analiafranco", "Anália Franco", -23.5612, -46.5604], ["vilaformosa", "Vila Formosa", -23.5640, -46.5460], ["aricanduva", "Aricanduva", -23.5440, -46.5370], ["penha", "Penha", -23.5335, -46.5430], ["dutra", "Dutra", -23.5080, -46.5470],
    ["barrafunda", "Palmeiras-Barra Funda", -23.5255, -46.6670], ["santacecilia", "Santa Cecília", -23.5390, -46.6480], ["republica", "República", -23.5440, -46.6425], ["anhangabau", "Anhangabaú", -23.5475, -46.6390], ["pedroii", "Pedro II", -23.5500, -46.6250],
    ["bras", "Brás", -23.5470, -46.6160], ["bresser", "Bresser-Mooca", -23.5465, -46.6070], ["belem", "Belém", -23.5425, -46.5895], ["tatuape", "Tatuapé", -23.5400, -46.5765], ["carrao", "Carrão", -23.5380, -46.5640],
    ["vilamatilde", "Vila Matilde", -23.5320, -46.5310], ["patriarca", "Patriarca", -23.5310, -46.5015], ["arturalvim", "Artur Alvim", -23.5400, -46.4840], ["itaquera", "Corinthians-Itaquera", -23.5425, -46.4710],
    ["higienopolis", "Higienópolis-Mackenzie", -23.5480, -46.6520], ["paulista", "Paulista", -23.5555, -46.6625], ["oscarfreire", "Oscar Freire", -23.5600, -46.6720], ["farialima", "Faria Lima", -23.5670, -46.6935], ["pinheiros", "Pinheiros", -23.5670, -46.7020],
    ["butanta", "Butantã", -23.5720, -46.7085], ["morumbi4", "São Paulo-Morumbi", -23.5850, -46.7230], ["vilasonia", "Vila Sônia", -23.5880, -46.7350],
    ["capaoredondo", "Capão Redondo", -23.6600, -46.7790], ["campolimpo", "Campo Limpo", -23.6490, -46.7590], ["santoamaro", "Santo Amaro", -23.6550, -46.7195], ["largotreze", "Largo Treze", -23.6530, -46.7060], ["borbagato", "Borba Gato", -23.6400, -46.6935],
    ["brooklin", "Brooklin", -23.6265, -46.6880], ["campobelo", "Campo Belo", -23.6170, -46.6720], ["moema", "Moema", -23.6010, -46.6620], ["aacd", "AACD-Servidor", -23.5970, -46.6520], ["hsp", "Hospital São Paulo", -23.5985, -46.6440],
    ["oratorio15", "Oratório", -23.5900, -46.5600], ["saolucas", "São Lucas", -23.5950, -46.5470], ["vilauniao", "Vila União", -23.6000, -46.5070], ["sapopemba", "Sapopemba", -23.6080, -46.4850], ["saomateus", "São Mateus", -23.6120, -46.4770], ["jdcolonial", "Jardim Colonial", -23.6200, -46.4600],
    ["ipiranga", "Ipiranga", -23.5880, -46.6090], ["brasilandia", "Brasilândia", -23.4670, -46.6880], ["itaberaba", "Itaberaba", -23.4800, -46.6900], ["freguesia", "Freguesia do Ó", -23.5010, -46.6970], ["santamarina", "Santa Marina", -23.5130, -46.6990],
    ["aguabranca", "Água Branca", -23.5220, -46.6900], ["perdizes", "Perdizes", -23.5340, -46.6760], ["puc", "PUC-Cardoso de Almeida", -23.5390, -46.6680], ["faap", "FAAP-Pacaembu", -23.5440, -46.6610], ["bis14", "14 Bis-Saracura", -23.5550, -46.6455],
    ["lapa", "Lapa", -23.5205, -46.7040], ["vilaolimpia", "Vila Olímpia", -23.5930, -46.6920], ["berrini", "Berrini", -23.6070, -46.6970], ["cidadejardim", "Cidade Jardim", -23.5840, -46.6935],
    ["bosquemaia", "Bosque Maia", -23.4550, -46.5350], ["vilamaria", "Vila Maria", -23.5120, -46.5800], ["catumbi", "Catumbi", -23.5360, -46.6000],
    ["jundiai", "Jundiaí", -23.1900, -46.8830], ["fmorato", "Francisco Morato", -23.2810, -46.7450], ["francodarocha", "Franco da Rocha", -23.3230, -46.7270], ["caieiras", "Caieiras", -23.3640, -46.7400], ["perus", "Perus", -23.4050, -46.7540],
    ["jaragua", "Jaraguá", -23.4560, -46.7380], ["pirituba", "Pirituba", -23.4880, -46.7240], ["juliop", "Júlio Prestes", -23.5350, -46.6400], ["paltino", "Presidente Altino", -23.5310, -46.7630], ["osasco", "Osasco", -23.5280, -46.7780],
    ["carapicuiba", "Carapicuíba", -23.5230, -46.8360], ["barueri", "Barueri", -23.5110, -46.8760], ["jandira", "Jandira", -23.5280, -46.9020], ["itapevi", "Itapevi", -23.5490, -46.9340], ["amadorbueno", "Amador Bueno", -23.5420, -46.9800], ["ceasa", "Ceasa", -23.5410, -46.7400],
    ["socorro", "Socorro", -23.6670, -46.7110], ["jurubatuba", "Jurubatuba", -23.6830, -46.7050], ["grajau", "Grajaú", -23.7360, -46.6960],
    ["mooca", "Juventus-Mooca", -23.5580, -46.6070], ["saocaetano", "São Caetano do Sul", -23.6180, -46.5660], ["utinga", "Utinga", -23.6340, -46.5420], ["santoandre", "Santo André", -23.6570, -46.5310], ["capuava", "Capuava", -23.6660, -46.5000],
    ["maua", "Mauá", -23.6680, -46.4610], ["guapituba", "Guapituba", -23.6880, -46.4370], ["ribeiraopires", "Ribeirão Pires", -23.7110, -46.4130], ["rgs", "Rio Grande da Serra", -23.7430, -46.3980],
    ["guaianases", "Guaianases", -23.5420, -46.4150], ["ferraz", "Ferraz de Vasconcelos", -23.5420, -46.3690], ["poa", "Poá", -23.5250, -46.3460], ["calmonviana", "Calmon Viana", -23.5230, -46.3120], ["suzano", "Suzano", -23.5440, -46.3050],
    ["brascubas", "Brás Cubas", -23.5310, -46.2240], ["mogi", "Mogi das Cruzes", -23.5230, -46.1880], ["estudantes", "Estudantes", -23.5160, -46.1750],
    ["engoulart", "Engenheiro Goulart", -23.4930, -46.5190], ["uspleste", "USP Leste", -23.4870, -46.5000], ["saomiguel", "São Miguel Paulista", -23.4930, -46.4440], ["itaimpaulista", "Itaim Paulista", -23.5010, -46.3950], ["itaquaquecetuba", "Itaquaquecetuba", -23.4850, -46.3480],
    ["cecap", "Guarulhos-Cecap", -23.4580, -46.5100], ["aeroporto", "Aeroporto-Guarulhos", -23.4360, -46.4860], ["terminais", "Terminais 2 e 3", -23.4280, -46.4790], ["pqdpedro", "Parque Dom Pedro II", -23.5480, -46.6290]
  ].forEach(function (x) { E[x[0]] = { id: x[0], n: x[1], c: [x[2], x[3]] }; });

  var L = {
    L1: { num: "1", nome: "Azul", op: "Metrô", cor: "#0455A1", modo: "metro" }, L2: { num: "2", nome: "Verde", op: "Metrô", cor: "#007E5E", modo: "metro" },
    L3: { num: "3", nome: "Vermelha", op: "Metrô", cor: "#EE372F", modo: "metro" }, L4: { num: "4", nome: "Amarela", op: "ViaQuatro", cor: "#E8B400", modo: "metro" },
    L5: { num: "5", nome: "Lilás", op: "ViaMobilidade", cor: "#9B3894", modo: "metro" }, L6: { num: "6", nome: "Laranja", op: "Linha Uni", cor: "#F68B1F", modo: "metro" },
    L15: { num: "15", nome: "Prata", op: "Metrô (monotrilho)", cor: "#8E9AA6", modo: "metro" }, L19: { num: "19", nome: "Celeste", op: "Metrô", cor: "#3FA9F5", modo: "metro" },
    L20: { num: "20", nome: "Rosa", op: "Metrô", cor: "#E2558E", modo: "metro" },
    L7: { num: "7", nome: "Rubi", op: "TIC Trens", cor: "#CA016B", modo: "trem" }, L8: { num: "8", nome: "Diamante", op: "ViaMobilidade", cor: "#97A098", modo: "trem" },
    L9: { num: "9", nome: "Esmeralda", op: "ViaMobilidade", cor: "#01A9A7", modo: "trem" }, L10: { num: "10", nome: "Turquesa", op: "CPTM", cor: "#049FC3", modo: "trem" },
    L11: { num: "11", nome: "Coral", op: "CPTM", cor: "#F04E23", modo: "trem" }, L12: { num: "12", nome: "Safira", op: "CPTM", cor: "#083E89", modo: "trem" },
    L13: { num: "13", nome: "Jade", op: "CPTM", cor: "#00B352", modo: "trem" },
    ET: { num: "ET", nome: "Expresso Tiradentes", op: "SPTrans (BRT)", cor: "#6D6E71", modo: "brt" },
    TICN: { num: "TIC", nome: "Intercidades Norte", op: "TIC (Campinas)", cor: "#5B2C83", modo: "regional" },
    TICS: { num: "TIC", nome: "Intercidades Sul", op: "TIC (Santos)", cor: "#7A4FA3", modo: "regional" },
    TICO: { num: "TIM", nome: "Intermetropolitano Oeste", op: "TIM (Sorocaba)", cor: "#8C6BB1", modo: "regional" },
    TAV: { num: "TAV", nome: "Trem de Alta Velocidade", op: "Federal", cor: "#2B2B2B", modo: "regional" }
  };
  var L7 = ["jundiai", "fmorato", "francodarocha", "caieiras", "perus", "jaragua", "pirituba", "lapa", "aguabranca", "barrafunda"];
  var TRECHOS = [
    { id: "L1", linha: "L1", base: "operacao", est: ["tucuruvi", "santana", "tiete", "luz", "saobento", "se", "liberdade", "saojoaquim", "paraiso", "anarosa", "santacruz", "saude", "jabaquara"] },
    { id: "L2", linha: "L2", base: "operacao", est: ["vilamadalena", "clinicas", "consolacao", "trianon", "brigadeiro", "paraiso", "anarosa", "chacaraklabin", "altoipiranga", "sacoma", "tamanduatei", "vilaprudente"] },
    { id: "L2-leste", linha: "L2", base: "planejado", obras: ["OBR-GOV-023"], rotulo: "Extensão Vila Prudente–Dutra", est: ["vilaprudente", "orfanato", "analiafranco", "vilaformosa", "aricanduva", "penha", "dutra"] },
    { id: "L3", linha: "L3", base: "operacao", est: ["barrafunda", "santacecilia", "republica", "anhangabau", "se", "pedroii", "bras", "bresser", "belem", "tatuape", "carrao", "penha", "vilamatilde", "patriarca", "arturalvim", "itaquera"] },
    { id: "L4", linha: "L4", base: "operacao", est: ["luz", "republica", "higienopolis", "paulista", "oscarfreire", "farialima", "pinheiros", "butanta", "morumbi4", "vilasonia"] },
    { id: "L5", linha: "L5", base: "operacao", est: ["capaoredondo", "campolimpo", "santoamaro", "largotreze", "borbagato", "brooklin", "campobelo", "moema", "aacd", "hsp", "santacruz", "chacaraklabin"] },
    { id: "L6", linha: "L6", base: "planejado", obras: ["OBR-GOV-024"], rotulo: "Brasilândia–São Joaquim", est: ["brasilandia", "itaberaba", "freguesia", "santamarina", "aguabranca", "perdizes", "puc", "faap", "higienopolis", "bis14", "saojoaquim"] },
    { id: "L15", linha: "L15", base: "operacao", est: ["vilaprudente", "oratorio15", "saolucas", "vilauniao", "sapopemba", "saomateus"] },
    { id: "L15-ipiranga", linha: "L15", base: "planejado", obras: ["OBR-GOV-025"], rotulo: "Extensão até Ipiranga", est: ["ipiranga", "vilaprudente"] },
    { id: "L15-colonial", linha: "L15", base: "planejado", obras: ["OBR-GOV-025"], rotulo: "Extensão até Jardim Colonial", est: ["saomateus", "jdcolonial"] },
    { id: "L19", linha: "L19", base: "planejado", obras: ["OBR-GOV-027"], rotulo: "Guarulhos–Anhangabaú (referência)", est: ["bosquemaia", "vilamaria", "catumbi", "anhangabau"] },
    { id: "L20", linha: "L20", base: "planejado", obras: ["OBR-GOV-026"], rotulo: "Lapa–Santo Amaro (referência)", est: ["lapa", "pinheiros", "vilaolimpia", "brooklin", "santoamaro"] },
    { id: "L7", linha: "L7", base: "operacao", est: L7 },
    { id: "L8", linha: "L8", base: "operacao", est: ["juliop", "barrafunda", "lapa", "paltino", "osasco", "carapicuiba", "barueri", "jandira", "itapevi", "amadorbueno"] },
    { id: "L9", linha: "L9", base: "operacao", est: ["osasco", "paltino", "ceasa", "pinheiros", "cidadejardim", "vilaolimpia", "berrini", "santoamaro", "socorro", "jurubatuba", "grajau"] },
    { id: "L10", linha: "L10", base: "operacao", est: ["bras", "mooca", "ipiranga", "tamanduatei", "saocaetano", "utinga", "santoandre", "capuava", "maua", "guapituba", "ribeiraopires", "rgs"] },
    { id: "L11", linha: "L11", base: "operacao", est: ["luz", "bras", "tatuape", "itaquera", "guaianases", "ferraz", "poa", "calmonviana", "suzano", "brascubas", "mogi", "estudantes"] },
    { id: "L12", linha: "L12", base: "operacao", est: ["bras", "tatuape", "engoulart", "uspleste", "saomiguel", "itaimpaulista", "itaquaquecetuba", "calmonviana"] },
    { id: "L13", linha: "L13", base: "operacao", est: ["engoulart", "cecap", "aeroporto"] },
    { id: "L13-ext", linha: "L13", base: "planejado", obras: ["OBR-GOV-034"], rotulo: "Extensão aos terminais do aeroporto", est: ["aeroporto", "terminais"] },
    { id: "ET", linha: "ET", base: "operacao", est: ["pqdpedro", "ipiranga", "sacoma"] },
    { id: "ET-abc", linha: "ET", base: "planejado", obras: ["OBR-GOV-031"], rotulo: "Extensão ao ABC (referência)", est: ["sacoma", "saocaetano"] },
    { id: "TICN", linha: "TICN", base: "planejado", obras: ["OBR-GOV-028", "OBR-PRE-028"], rotulo: "Barra Funda–Jundiaí–Campinas", est: L7.slice().reverse(), paradas: ["barrafunda", "jundiai"], stub: { de: "jundiai", dx: -30, dy: -70, rotulo: "Campinas" } },
    { id: "TICS", linha: "TICS", base: "planejado", obras: ["OBR-GOV-029"], rotulo: "São Paulo–ABC–Baixada Santista (referência)", est: ["bras", "mooca", "ipiranga", "tamanduatei", "saocaetano", "santoandre"], paradas: ["bras", "santoandre"], stub: { de: "santoandre", dx: 10, dy: 90, rotulo: "Santos" } },
    { id: "TICO", linha: "TICO", base: "planejado", obras: ["OBR-GOV-030"], rotulo: "São Paulo–Sorocaba", est: ["barrafunda", "lapa", "paltino", "osasco", "carapicuiba", "barueri", "jandira", "itapevi", "amadorbueno"], paradas: ["barrafunda", "osasco", "amadorbueno"], stub: { de: "amadorbueno", dx: -70, dy: 20, rotulo: "Sorocaba" } },
    { id: "TAV", linha: "TAV", base: "planejado", obras: ["OBR-PRE-027"], rotulo: "Rio–São Paulo (alta velocidade)", est: ["barrafunda", "aeroporto"], stub: { de: "aeroporto", dx: 80, dy: -40, rotulo: "Rio de Janeiro" } }
  ];
  var MELHORIAS = [
    { linha: "L10", obras: ["OBR-GOV-032", "OBR-PRE-089"], rotulo: "Modernização de trens e estações (Mauá e ABC)" },
    { linha: "L11", obras: ["OBR-GOV-033"], rotulo: "Expresso Leste (trens expressos Guaianases–Mogi)" }
  ];
  var PONTOS = [{ est: "maua", obras: ["OBR-PRF-024"], rotulo: "Terminal Rodoviário Intermodal de Mauá" }];
  TR.dados = { ESTACOES: E, LINHAS: L, TRECHOS: TRECHOS, MELHORIAS: MELHORIAS, PONTOS: PONTOS };

  /* ================================================================ estado das obras */
  function instsDe(catId) { return ok(function () { var s = M().obrasSys; return Object.keys(s.instancias).map(function (k) { return s.instancias[k]; }).filter(function (i) { return i.catalogoId === catId; }); }, []); }
  var RANK = { operacao: 6, obras: 5, parado: 4, aprovacao: 3, planejado: 1, cancelado: 0 };
  function statusDeInst(i) {
    var e = i.estado;
    if (e === "Em manutenção" || e === "Concluída") return "operacao";
    if (e === "Em execução" || e === "Atrasada") return "obras";
    if (e === "Paralisada") return "parado";
    if (e === "Em negociação" || e === "Aprovada") return "aprovacao";
    if (e === "Abandonada" || e === "Recusada") return "cancelado";
    return "planejado";
  }
  // estado de um conjunto de obras ligadas a um elemento: o mais avançado vence
  function estadoObras(ids) {
    var melhor = null;
    (ids || []).forEach(function (id) { instsDe(id).forEach(function (i) { var s = statusDeInst(i), r = { s: s, inst: i, cat: id }; if (!melhor || RANK[s] > RANK[melhor.s] || (s === melhor.s && (i.progresso || 0) > (melhor.inst.progresso || 0))) melhor = r; }); });
    return melhor;
  }
  function estadoTrecho(t) {
    if (t.base === "operacao") return { s: "operacao" };
    var r = estadoObras(t.obras); if (!r) return { s: "planejado" };
    if (r.s === "cancelado") { var nova = (t.obras || []).some(function (id) { return instsDe(id).some(function (i) { return statusDeInst(i) !== "cancelado"; }); }); if (!nova) return { s: "cancelado", inst: r.inst, cat: r.cat }; }
    return r;
  }
  TR.estadoTrecho = estadoTrecho;
  var ROT = { operacao: "Em operação", obras: "Em obras", parado: "Obra paralisada", aprovacao: "Em aprovação / licitação", planejado: "Projeto planejado", cancelado: "Projeto cancelado" };

  /* ================================================================ geometria */
  var LAT0 = -23.18, LAT1 = -23.78, LON0 = -47.0, LON1 = -46.15, KX = Math.cos(23.5 * Math.PI / 180), W = 1000;
  var ESC = W / ((LON1 - LON0) * KX), H = Math.round((LAT0 - LAT1) * ESC);
  function xy(id) { var c = E[id].c; return [(c[1] - LON0) * KX * ESC, (LAT0 - c[0]) * ESC]; }
  // trechos que dividem o mesmo segmento são desenhados lado a lado
  var OFF = null;
  function offsets(lista) {
    var seg = {};
    lista.forEach(function (t) { for (var i = 0; i + 1 < t.est.length; i++) { var k = [t.est[i], t.est[i + 1]].sort().join("|"); (seg[k] = seg[k] || []); if (seg[k].indexOf(t.linha) < 0) seg[k].push(t.linha); } });
    return seg;
  }
  function segPath(a, b, idx, n, w) {
    var p = xy(a), q = xy(b), dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1, o = (idx - (n - 1) / 2) * w;
    var nx = -dy / len * o, ny = dx / len * o;
    return [p[0] + nx, p[1] + ny, q[0] + nx, q[1] + ny];
  }
  function trechoD(t, w) {
    var pts = [];
    for (var i = 0; i + 1 < t.est.length; i++) {
      var k = [t.est[i], t.est[i + 1]].sort().join("|"), ls = OFF[k] || [t.linha], s = segPath(t.est[i], t.est[i + 1], Math.max(0, ls.indexOf(t.linha)), ls.length, w);
      if (!pts.length) pts.push([s[0], s[1]]); else { var u = pts[pts.length - 1]; pts[pts.length - 1] = [(u[0] + s[0]) / 2, (u[1] + s[1]) / 2]; }
      pts.push([s[2], s[3]]);
    }
    return "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L");
  }

  /* ================================================================ desenho */
  var ui = { vb: [0, 0, W, H], sel: null, planos: true };
  var VISTAS = { rede: null, centro: ["luz", "pinheiros", "tatuape", "jabaquara"], abc: ["sacoma", "rgs", "santoandre", "maua", "tamanduatei"], leste: ["tatuape", "estudantes", "aeroporto", "saomateus"], norte: ["jundiai", "barrafunda", "brasilandia"] };
  function caixa(ids) {
    var a = [1e9, 1e9, -1e9, -1e9]; ids.forEach(function (id) { var p = xy(id); a[0] = Math.min(a[0], p[0]); a[1] = Math.min(a[1], p[1]); a[2] = Math.max(a[2], p[0]); a[3] = Math.max(a[3], p[1]); });
    var w = a[2] - a[0], h = a[3] - a[1], m = Math.max(w, h) * 0.12 + 20; w += 2 * m; h += 2 * m;
    var r = W / H; if (w / h < r) w = h * r; else h = w / r;
    return [(a[0] + a[2]) / 2 - w / 2, (a[1] + a[3]) / 2 - h / 2, w, h];
  }
  function svg() {
    var vis = TRECHOS.map(function (t) { return { t: t, e: estadoTrecho(t) }; }).filter(function (x) { return ui.planos || x.e.s === "operacao" || x.e.s === "obras" || x.e.s === "parado"; });
    OFF = offsets(vis.map(function (x) { return x.t; }));
    var w = 5.2, h = "";
    // linhas
    vis.forEach(function (x) {
      var t = x.t, l = L[t.linha], d = trechoD(t, w), s = x.e.s, sel = ui.sel === t.linha ? " sel" : "";
      var prog = x.e.inst ? Math.round(x.e.inst.progresso || 0) : 0;
      h += '<g class="v3t-tr st-' + s + sel + " modo-" + l.modo + '" data-v3t-linha="' + t.linha + '" style="--c:' + l.cor + '">';
      h += '<path class="v3t-hit" d="' + d + '"/>';
      if (s === "operacao") h += '<path class="v3t-ln" d="' + d + '"/>';
      else if (s === "obras" || s === "parado") h += '<path class="v3t-ln v3t-proj" d="' + d + '"/><path class="v3t-ln v3t-feito" pathLength="100" stroke-dasharray="' + prog + ' 100" d="' + d + '"/>';
      else h += '<path class="v3t-ln v3t-proj" d="' + d + '"/>';
      if (t.stub) { var p = xy(t.stub.de); h += '<path class="v3t-ln v3t-stub" d="M' + p[0].toFixed(1) + " " + p[1].toFixed(1) + "l" + t.stub.dx + " " + t.stub.dy + '"/><text class="v3t-stubt" x="' + (p[0] + t.stub.dx).toFixed(1) + '" y="' + (p[1] + t.stub.dy - 4).toFixed(1) + '">' + esc_(t.stub.rotulo) + " ›</text>"; }
      h += "</g>";
    });
    // melhorias (selo sobre a linha)
    MELHORIAS.forEach(function (m) { var r = estadoObras(m.obras); if (!r || r.s === "planejado" || r.s === "cancelado") return; var t = TRECHOS.filter(function (x) { return x.id === m.linha; })[0]; if (!t) return; h += '<path class="v3t-melhoria st-' + r.s + '" d="' + trechoD(t, w) + '" style="--c:' + L[m.linha].cor + '"/>'; });
    // estações (raio acompanha o zoom para não virar bolha ao aproximar)
    var RF = Math.max(0.3, Math.pow(ui.vb[2] / W, 0.85));
    var est = {}, linhasEst = {};
    vis.forEach(function (x) { var t = x.t, ps = t.paradas || t.est; ps.forEach(function (id) { var s = x.e.s; if (!est[id] || RANK[s] > RANK[est[id]]) est[id] = s; (linhasEst[id] = linhasEst[id] || {}); linhasEst[id][t.linha] = 1; }); });
    Object.keys(est).forEach(function (id) {
      var p = xy(id), n = Object.keys(linhasEst[id]).length, s = est[id], term = TRECHOS.some(function (t) { return (t.paradas || t.est)[0] === id || (t.paradas || t.est).slice(-1)[0] === id; });
      var pt = PONTOS.filter(function (x) { return x.est === id; })[0], ptS = pt ? estadoObras(pt.obras) : null;
      var cls = "v3t-est st-" + s + (n > 1 ? " int" : "") + (term || n > 1 || id === "maua" ? " pri" : "") + (ptS && ptS.s === "operacao" ? " eq" : "");
      h += '<g class="' + cls + '" data-v3t-est="' + id + '"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + ((n > 1 ? 4.6 : 3.2) * RF).toFixed(2) + '"/>' + (ptS && ptS.s !== "planejado" && ptS.s !== "cancelado" ? '<rect x="' + (p[0] + 4 * RF).toFixed(1) + '" y="' + (p[1] - 10 * RF).toFixed(1) + '" width="' + (7 * RF).toFixed(1) + '" height="' + (7 * RF).toFixed(1) + '" class="v3t-eq st-' + ptS.s + '"/>' : "") + '<text x="' + (p[0] + 6 * RF).toFixed(1) + '" y="' + (p[1] + 3 * RF).toFixed(1) + '">' + esc_(E[id].n) + "</text></g>";
    });
    var vb = ui.vb, zoom = vb[2] < 420 ? " z2" : vb[2] < 700 ? " z1" : "";
    return '<svg class="v3t-svg' + zoom + '" viewBox="' + vb.map(function (n) { return n.toFixed(1); }).join(" ") + '" style="--fs:' + (vb[2] / 70).toFixed(2) + 'px">' + h + "</svg>";
  }
  function legenda() {
    return '<div class="v3t-leg"><span><i class="lg op"></i>em operação</span><span><i class="lg ob"></i>em obras (trecho cheio = avanço)</span><span><i class="lg pa"></i>paralisada</span><span><i class="lg ap"></i>em aprovação</span><span><i class="lg pl"></i>projeto</span><span><i class="lg ca"></i>cancelado</span><span><i class="lg mo"></i>melhoria em curso</span></div>';
  }
  function chips() {
    var grupos = {}; TRECHOS.forEach(function (t) { (grupos[t.linha] = grupos[t.linha] || []).push(t); });
    return '<div class="v3t-chips">' + Object.keys(L).map(function (id) {
      var ts = grupos[id] || [], st = ts.map(function (t) { return estadoTrecho(t).s; }), novo = ts.every(function (t) { return t.base !== "operacao"; }) && st.every(function (s) { return s !== "operacao"; });
      var obras = st.some(function (s) { return s === "obras" || s === "parado"; });
      return '<button type="button" data-v3t-linha="' + id + '" class="' + (ui.sel === id ? "on " : "") + (novo ? "novo" : "") + '" style="--c:' + L[id].cor + '"><b>' + esc_(L[id].num) + "</b>" + esc_(L[id].nome) + (obras ? " 🚧" : "") + "</button>";
    }).join("") + "</div>";
  }
  function quem(inst) { return ok(function () { return inst.mem ? inst.mem.autor : null; }, null); }
  function painel() {
    var id = ui.sel; if (!id || !L[id]) return '<p class="v3t-dica">Toque numa linha (no mapa ou nos botões) para ver os trechos, as obras ligadas e o que dá para fazer. Arraste para mover o mapa; use os botões para aproximar.</p>';
    var l = L[id], ts = TRECHOS.filter(function (t) { return t.linha === id; }), cid = ok(function () { return cargoAtualId(); }, ""), esf = { PREF: "Prefeito", GOV: "Governador", PRES: "Presidente" }[cid];
    var h = '<div class="v3t-pl" style="--c:' + l.cor + '"><b>Linha ' + esc_(l.num) + " – " + esc_(l.nome) + "</b><small>" + esc_(l.op) + "</small></div>";
    function obraBox(cat) {
      var it = ok(function () { return OBRAS.item(cat); }, null); if (!it) return "";
      var is = instsDe(cat), i = is.filter(function (x) { return statusDeInst(x) !== "cancelado"; })[0] || is[0];
      var podeIniciar = !i || statusDeInst(i) === "cancelado";
      var acao = "";
      if (podeIniciar && esf && (it.esfera_executora === esf || (it.solicitantes || []).indexOf(esf) >= 0) && typeof btn === "function") acao = btn(it.esfera_executora === esf ? "Iniciar obra" : "Pedir ao " + it.esfera_executora, "obrasIniciar", [it.id], "mini confirma");
      return '<div class="v3t-obra"><b>' + esc_(it.nome) + "</b><small>" + esc_(it.esfera_executora) + " · R$ " + Math.round(it.custo_milhoes).toLocaleString("pt-BR") + " mi · " + it.prazo_meses + " meses</small>" +
        (i ? "<p>" + esc_(i.estado) + (["Em execução", "Atrasada", "Paralisada"].indexOf(i.estado) >= 0 ? " · " + Math.round(i.progresso || 0) + "%" : "") + (quem(i) ? " · iniciada por " + esc_(quem(i)) : "") + (i.inauguradorNome && i.estado === "Em manutenção" ? " · inaugurada por " + esc_(i.inauguradorNome) : "") + "</p>" : "<p>Ainda não saiu do papel.</p>") + (acao ? '<div class="row">' + acao + "</div>" : "") + "</div>";
    }
    ts.forEach(function (t) {
      var e = estadoTrecho(t), ps = (t.paradas || t.est).map(function (x) { return E[x].n; });
      h += '<div class="v3t-trecho"><div><em class="v3t-st st-' + e.s + '">' + ROT[e.s] + (e.inst && (e.s === "obras" || e.s === "parado") ? " · " + Math.round(e.inst.progresso || 0) + "%" : "") + "</em> <b>" + esc_(t.rotulo || (t.base === "operacao" ? "Linha em operação" : "Trecho")) + "</b></div><small>" + ps.length + " estações: " + esc_(ps.join(" · ")) + "</small>" + (t.obras || []).map(obraBox).join("") + "</div>";
    });
    MELHORIAS.filter(function (m) { return m.linha === id; }).forEach(function (m) { var r = estadoObras(m.obras); h += '<div class="v3t-trecho"><div><em class="v3t-st st-' + (r ? r.s : "planejado") + '">' + (r ? ROT[r.s] : "Projeto") + "</em> <b>" + esc_(m.rotulo) + "</b></div>" + m.obras.map(obraBox).join("") + "</div>"; });
    PONTOS.forEach(function (p) { if (!ts.some(function (t) { return t.est.indexOf(p.est) >= 0; })) return; var r = estadoObras(p.obras); h += '<div class="v3t-trecho"><div><em class="v3t-st st-' + (r ? r.s : "planejado") + '">' + (r ? ROT[r.s] : "Projeto") + "</em> <b>" + esc_(p.rotulo) + "</b> <small>estação " + esc_(E[p.est].n) + "</small></div>" + p.obras.map(obraBox).join("") + "</div>"; });
    return h;
  }
  function resumo() {
    var c = { operacao: 0, obras: 0, parado: 0, aprovacao: 0, planejado: 0, cancelado: 0 };
    TRECHOS.forEach(function (t) { if (t.base !== "operacao") c[estadoTrecho(t).s]++; });
    var est = {}; TRECHOS.forEach(function (t) { if (estadoTrecho(t).s === "operacao") (t.paradas || t.est).forEach(function (id) { est[id] = 1; }); });
    return '<p class="v3t-res"><b>' + Object.keys(est).length + "</b> estações no mapa em operação · projetos de expansão: <b>" + c.operacao + "</b> entregues, <b>" + (c.obras + c.parado) + "</b> em obras, <b>" + c.aprovacao + "</b> em aprovação, <b>" + c.planejado + "</b> no papel" + (c.cancelado ? ", " + c.cancelado + " cancelados" : "") + ".</p>";
  }
  function corpo() {
    return resumo() + '<div class="v3t-bar">' + Object.keys(VISTAS).map(function (k) { return '<button type="button" data-v3t-vista="' + k + '">' + { rede: "Rede inteira", centro: "Centro", abc: "ABC e Mauá", leste: "Zona Leste", norte: "Norte" }[k] + "</button>"; }).join("") +
      '<button type="button" data-v3t-zoom="0.7" aria-label="Aproximar">＋</button><button type="button" data-v3t-zoom="1.4" aria-label="Afastar">－</button><label><input type="checkbox" data-v3t-planos ' + (ui.planos ? "checked" : "") + "> projetos</label></div>" +
      '<div class="v3t-mapa">' + svg() + "</div>" + legenda() + chips() + '<div class="v3t-painel">' + painel() + "</div>";
  }
  function cardRede() {
    var txt = "<p class='txt'><small>O mapa mostra o que acontece no jogo: cada extensão, linha nova ou melhoria está ligada a uma obra do catálogo e muda de aparência conforme ela avança, para, é entregue ou cancelada, seja qual for o governante. Traçados de projetos são de referência.</small></p>";
    return typeof card === "function" ? card("Rede metropolitana de trilhos", txt + '<div class="v3t" data-v3t="1">' + corpo() + "</div>") : "";
  }
  TR.card = cardRede;
  function atualizar(parcial) {
    var box = document.querySelector('.v3t[data-v3t="1"]'); if (!box) return;
    if (parcial === "mapa") { var m = box.querySelector(".v3t-mapa"); if (m) m.innerHTML = svg(); return; }
    box.innerHTML = corpo();
  }

  /* ================================================================ interação */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest || !t.closest('.v3t[data-v3t="1"]')) return;
    var b;
    if ((b = t.closest("[data-v3t-vista]"))) { var k = b.getAttribute("data-v3t-vista"); ui.vb = VISTAS[k] ? caixa(VISTAS[k]) : [0, 0, W, H]; atualizar("mapa"); e.preventDefault(); return; }
    if ((b = t.closest("[data-v3t-zoom]"))) { var f = +b.getAttribute("data-v3t-zoom"), v = ui.vb, cx = v[0] + v[2] / 2, cy = v[1] + v[3] / 2, nw = Math.max(140, Math.min(W * 1.2, v[2] * f)), nh = nw * v[3] / v[2]; ui.vb = [cx - nw / 2, cy - nh / 2, nw, nh]; atualizar("mapa"); e.preventDefault(); return; }
    if (arrastou) return;
    if ((b = t.closest("[data-v3t-linha]"))) { var id = b.getAttribute("data-v3t-linha"); ui.sel = ui.sel === id ? null : id; atualizar(); e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener("change", function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute("data-v3t-planos")) { ui.planos = t.checked; atualizar(); } }, true);
  // arrastar o mapa
  var drag = null, arrastou = false;
  document.addEventListener("pointerdown", function (e) { var s = e.target.closest && e.target.closest(".v3t-mapa svg"); if (!s) return; drag = { x: e.clientX, y: e.clientY, vb: ui.vb.slice(), w: s.getBoundingClientRect().width, s: s }; arrastou = false; });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) arrastou = true; if (!arrastou) return;
    var k = drag.vb[2] / (drag.w || 1); ui.vb = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]]; drag.s.setAttribute("viewBox", ui.vb.map(function (n) { return n.toFixed(1); }).join(" "));
  });
  document.addEventListener("pointerup", function () { if (drag) { drag = null; setTimeout(function () { arrastou = false; }, 0); } });
  document.addEventListener("wheel", function (e) {
    var s = e.target.closest && e.target.closest(".v3t-mapa svg"); if (!s) return; e.preventDefault();
    var r = s.getBoundingClientRect(), v = ui.vb, f = e.deltaY > 0 ? 1.15 : 0.87, px = v[0] + (e.clientX - r.left) / r.width * v[2], py = v[1] + (e.clientY - r.top) / r.height * v[3];
    var nw = Math.max(140, Math.min(W * 1.2, v[2] * f)), nh = nw * v[3] / v[2]; ui.vb = [px - (px - v[0]) * nw / v[2], py - (py - v[1]) * nh / v[3], nw, nh]; atualizar("mapa");
  }, { passive: false });

  /* ================================================================ onde aparece: Poder (perto da Mobilidade) e Mapa */
  function instalar() {
    if (typeof VIEWS === "undefined") return;
    ["poder", "mapa"].forEach(function (v) {
      if (typeof VIEWS[v] !== "function" || VIEWS[v].__v3t) return;
      var o = VIEWS[v];
      var n = function () { var h = o.apply(this, arguments); try { if (String(h).indexOf('data-v3t="1"') < 0) h += cardRede(); } catch (e) { console.warn("v3trilhos", e); } return h; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3t = true; VIEWS[v] = n;
    });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 60); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 20) clearInterval(t0); }, 500);
})();
