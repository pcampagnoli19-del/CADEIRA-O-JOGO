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
    L18: { num: "18", nome: "Bronze", op: "Metrô (monotrilho)", cor: "#B0703C", modo: "metro" },
    BRTABC: { num: "BRT", nome: "BRT-ABC", op: "Consórcio Next", cor: "#3D7A5A", modo: "brt" },
    ET: { num: "ET", nome: "Expresso Tiradentes", op: "SPTrans (BRT)", cor: "#6D6E71", modo: "brt" },
    TICN: { num: "TIC", nome: "Intercidades Norte", op: "TIC (Campinas)", cor: "#5B2C83", modo: "regional" },
    TICS: { num: "TIC", nome: "Intercidades Sul", op: "TIC (Santos)", cor: "#7A4FA3", modo: "regional" },
    TICO: { num: "TIM", nome: "Intermetropolitano Oeste", op: "TIM (Sorocaba)", cor: "#8C6BB1", modo: "regional" },
    TAV: { num: "TAV", nome: "Trem de Alta Velocidade", op: "Federal", cor: "#2B2B2B", modo: "regional" }
  };
  // seq(): monta o traçado com a lista completa de estações. Item = id já conhecido, [id, nome] (posição
  // interpolada entre as estações vizinhas com coordenada) ou [id, nome, lat, lon].
  function seq(arr) {
    var ids = arr.map(function (x) {
      if (typeof x === "string") return x;
      if (!E[x[0]]) E[x[0]] = { id: x[0], n: x[1], c: x.length > 2 ? [x[2], x[3]] : null };
      return x[0];
    });
    for (var k = 0; k < ids.length; k++) {
      if (E[ids[k]].c) continue;
      var a = k - 1; while (a >= 0 && !E[ids[a]].c) a--;
      var b = k + 1; while (b < ids.length && !E[ids[b]].c) b++;
      if (a < 0 || b >= ids.length) continue;
      var f = (k - a) / (b - a), ca = E[ids[a]].c, cb = E[ids[b]].c;
      E[ids[k]].c = [ca[0] + (cb[0] - ca[0]) * f, ca[1] + (cb[1] - ca[1]) * f];
    }
    return ids;
  }
  var L7 = seq(["jundiai", ["varzeapta", "Várzea Paulista"], ["campolimpopta", "Campo Limpo Paulista"], ["botujuru", "Botujuru"], "fmorato", ["baltazar", "Baltazar Fidélis"], "francodarocha", "caieiras", "perus",
    ["vilaaurora", "Vila Aurora"], "jaragua", ["vilaclarice", "Vila Clarice"], "pirituba", ["piqueri", "Piqueri"], "lapa", "aguabranca", "barrafunda"]);
  var TRECHOS = [
    { id: "L1", linha: "L1", base: "operacao", est: seq(["tucuruvi", ["paradainglesa", "Parada Inglesa"], ["jdsaopaulo", "Jardim São Paulo-Ayrton Senna"], "santana", ["carandiru", "Carandiru"], "tiete", ["armenia", "Armênia"], ["tiradentes", "Tiradentes"], "luz", "saobento", "se", "liberdade", "saojoaquim", ["vergueiro", "Vergueiro"], "paraiso", "anarosa", ["vilamariana", "Vila Mariana"], "santacruz", ["pracaarvore", "Praça da Árvore"], "saude", ["saojudas", "São Judas"], ["conceicao", "Conceição"], "jabaquara"]) },
    { id: "L2", linha: "L2", base: "operacao", est: seq(["vilamadalena", ["sumare", "Sumaré"], "clinicas", "consolacao", "trianon", "brigadeiro", "paraiso", "anarosa", "chacaraklabin", ["santosimigrantes", "Santos-Imigrantes"], "altoipiranga", "sacoma", "tamanduatei", "vilaprudente"]) },
    { id: "L2-leste", linha: "L2", base: "planejado", obras: ["OBR-GOV-023"], rotulo: "Extensão Vila Prudente–Dutra", est: seq(["vilaprudente", "orfanato", ["aguarasa", "Água Rasa"], "analiafranco", "vilaformosa", ["guilhermegiorgi", "Guilherme Giorgi"], ["novamanchester", "Nova Manchester"], "aricanduva", "penha", "dutra"]) },
    { id: "L3", linha: "L3", base: "operacao", est: seq(["barrafunda", ["marechal", "Marechal Deodoro"], "santacecilia", "republica", "anhangabau", "se", "pedroii", "bras", "bresser", "belem", "tatuape", "carrao", "penha", "vilamatilde", ["guilhermina", "Guilhermina-Esperança"], "patriarca", "arturalvim", "itaquera"]) },
    { id: "L4", linha: "L4", base: "operacao", est: seq(["luz", "republica", "higienopolis", "paulista", "oscarfreire", ["fradique", "Fradique Coutinho"], "farialima", "pinheiros", "butanta", "morumbi4", "vilasonia"]) },
    { id: "L5", linha: "L5", base: "operacao", est: seq(["capaoredondo", "campolimpo", ["vilabelezas", "Vila das Belezas"], ["gronchi", "Giovanni Gronchi"], "santoamaro", "largotreze", ["adolfopinheiro", "Adolfo Pinheiro"], ["altoboavista", "Alto da Boa Vista"], "borbagato", "brooklin", "campobelo", ["eucaliptos", "Eucaliptos"], "moema", "aacd", "hsp", "santacruz", "chacaraklabin"]) },
    { id: "L6", linha: "L6", base: "planejado", obras: ["OBR-GOV-024"], rotulo: "Brasilândia–São Joaquim", est: seq(["brasilandia", ["vilacardoso", "Vila Cardoso"], "itaberaba", ["joaopaulo", "João Paulo I"], "freguesia", "santamarina", "aguabranca", ["sescpompeia", "SESC-Pompeia"], "perdizes", "puc", "faap", "higienopolis", "bis14", ["belavista", "Bela Vista"], "saojoaquim"]) },
    { id: "L15", linha: "L15", base: "operacao", est: seq(["vilaprudente", "oratorio15", "saolucas", ["camilohaddad", "Camilo Haddad"], ["vilatolstoi", "Vila Tolstói"], "vilauniao", ["jdplanalto", "Jardim Planalto"], "sapopemba", ["fazendajuta", "Fazenda da Juta"], "saomateus"]) },
    { id: "L15-ipiranga", linha: "L15", base: "planejado", obras: ["OBR-GOV-025"], rotulo: "Extensão até Ipiranga", est: ["ipiranga", "vilaprudente"] },
    { id: "L15-colonial", linha: "L15", base: "planejado", obras: ["OBR-GOV-025"], rotulo: "Extensão até Jardim Colonial", est: ["saomateus", "jdcolonial"] },
    { id: "L19", linha: "L19", base: "planejado", obras: ["OBR-GOV-027"], rotulo: "Guarulhos–Anhangabaú (referência)", est: ["bosquemaia", "vilamaria", "catumbi", "anhangabau"] },
    { id: "L20", linha: "L20", base: "planejado", obras: ["OBR-GOV-026"], rotulo: "Lapa–Santo Amaro (referência)", est: ["lapa", "pinheiros", "vilaolimpia", "brooklin", "santoamaro"] },
    { id: "L18", linha: "L18", base: "planejado", obras: ["OBR-TRI-005"], rotulo: "Tamanduateí–São Bernardo (monotrilho do ABC)", est: seq(["tamanduatei", ["espacoceramica", "Espaço Cerâmica", -23.6230, -46.5590], ["praçaqb", "Praça Quarto Centenário"], ["paco_sa", "Paço Municipal de Santo André", -23.6560, -46.5370], ["afonsina", "Afonsina"], ["djalma", "Djalma Dutra (São Bernardo)", -23.6990, -46.5560]]) },
    { id: "BRTABC", linha: "BRTABC", base: "planejado", obras: ["OBR-TRI-006"], rotulo: "BRT-ABC: São Bernardo–Santo André–Tamanduateí", est: seq([["sbc_term", "Terminal São Bernardo", -23.7090, -46.5520], ["paco_sbc", "Paço de São Bernardo"], "paco_sa", ["sa_oeste", "Santo André Oeste"], "saocaetano", "tamanduatei"]) },
    { id: "L7", linha: "L7", base: "operacao", est: L7 },
    { id: "L8", linha: "L8", base: "operacao", est: seq(["juliop", "barrafunda", "lapa", ["domingos", "Domingos de Moraes"], ["imperatriz", "Imperatriz Leopoldina"], "paltino", "osasco", ["cmtsampaio", "Comandante Sampaio"], ["quitauna", "Quitaúna"], ["miguelcosta", "General Miguel Costa"], "carapicuiba", ["santaterezinha", "Santa Terezinha"], ["antoniojoao", "Antônio João"], "barueri", ["belval", "Jardim Belval"], ["silveira", "Jardim Silveira"], "jandira", ["sagrado", "Sagrado Coração"], ["engcardoso", "Engenheiro Cardoso"], "itapevi", ["santarita", "Santa Rita"], "amadorbueno"]) },
    { id: "L9", linha: "L9", base: "operacao", est: seq(["osasco", "paltino", "ceasa", ["villalobos", "Villa-Lobos-Jaguaré"], ["cidadeuniv", "Cidade Universitária"], "pinheiros", ["hebraica", "Hebraica-Rebouças"], "cidadejardim", "vilaolimpia", "berrini", ["morumbi9", "Morumbi"], ["granjajulieta", "Granja Julieta"], ["joaodias", "João Dias"], "santoamaro", "socorro", "jurubatuba", ["autodromo", "Autódromo"], ["interlagos", "Primavera-Interlagos"], "grajau", ["mendes", "Mendes-Vila Natal", -23.7520, -46.6950], ["varginha", "Varginha", -23.7680, -46.6940]]) },
    { id: "L10", linha: "L10", base: "operacao", est: seq(["bras", "mooca", "ipiranga", "tamanduatei", "saocaetano", "utinga", ["saladino", "Prefeito Saladino"], "santoandre", "capuava", "maua", "guapituba", "ribeiraopires", "rgs"]) },
    { id: "L10-itapark", linha: "L10", base: "planejado", obras: ["OBR-TRI-002"], rotulo: "Nova estação Itapark (Mauá)", est: seq(["capuava", ["itapark10", "Itapark", -23.6650, -46.4790], "maua"]) },
    { id: "L10-paranapiacaba", linha: "L10", base: "planejado", obras: ["OBR-TRI-003"], rotulo: "Prolongamento turístico até Paranapiacaba", est: seq(["rgs", ["paranapiacaba", "Paranapiacaba", -23.7780, -46.3030]]) },
    { id: "L11", linha: "L11", base: "operacao", est: seq(["luz", "bras", "tatuape", "itaquera", ["dombosco", "Dom Bosco"], ["josebonifacio", "José Bonifácio"], "guaianases", ["gianetti", "Antônio Gianetti Neto"], "ferraz", "poa", "calmonviana", "suzano", ["jundiapeba", "Jundiapeba"], "brascubas", "mogi", "estudantes"]) },
    { id: "L12", linha: "L12", base: "operacao", est: seq(["bras", "tatuape", "engoulart", "uspleste", ["ermelino", "Comendador Ermelino"], "saomiguel", ["jdhelena", "Jardim Helena-Vila Mara"], "itaimpaulista", ["jdromano", "Jardim Romano"], ["manoelfeio", "Engenheiro Manoel Feio"], "itaquaquecetuba", ["aracare", "Aracaré"], "calmonviana"]) },
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
  var PONTOS = [
    { est: "maua", obras: ["OBR-PRF-024"], rotulo: "Terminal Rodoviário Intermodal de Mauá" },
    { est: "maua", obras: ["OBR-TRI-001"], rotulo: "Reforma e acessibilidade da estação Mauá" },
    { est: "santoandre", obras: ["OBR-TRI-004"], rotulo: "Terminal metropolitano integrado de Santo André" }
  ];
  /* obras de trilhos que o catálogo original não tinha (ligadas ao mapa e jogáveis como qualquer obra) */
  var CATALOGO_EXTRA = [
    { id: "OBR-TRI-001", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "Estação Mauá: reforma e acessibilidade", descricao: "Reconstrução da estação da Linha 10 em Mauá, com elevadores, passarela nova e integração com os ônibus.", local: "Mauá (SP)", escopo: "Local", custo_milhoes: 180, prazo_meses: 24, manutencao_anual_milhoes: 4, solicitantes: ["Prefeito"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { mobilidade: 2, economia: 1 }, polemica: 1, base_real: "Inspirado em real" },
    { id: "OBR-TRI-002", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "Linha 10: nova estação Itapark (Mauá)", descricao: "Estação intermediária entre Capuava e Mauá para atender o Itapark e a zona industrial.", local: "Mauá (SP)", escopo: "Local", custo_milhoes: 260, prazo_meses: 30, manutencao_anual_milhoes: 5, solicitantes: ["Prefeito"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { mobilidade: 3, economia: 1 }, polemica: 1, base_real: "Fictício" },
    { id: "OBR-TRI-003", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "Linha 10: prolongamento turístico até Paranapiacaba", descricao: "Recupera o trecho da serra entre Rio Grande da Serra e a vila ferroviária, com trem turístico regular.", local: "Rio Grande da Serra e Santo André (SP)", escopo: "Regional", custo_milhoes: 420, prazo_meses: 36, manutencao_anual_milhoes: 8, solicitantes: ["Prefeito"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { economia: 2, mobilidade: 1, meio_ambiente: -1 }, polemica: 2, base_real: "Inspirado em real" },
    { id: "OBR-TRI-004", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "Estação Santo André: terminal metropolitano integrado", descricao: "Integra trem, ônibus metropolitanos e o futuro monotrilho do ABC num único terminal.", local: "Santo André (SP)", escopo: "Regional", custo_milhoes: 340, prazo_meses: 30, manutencao_anual_milhoes: 6, solicitantes: ["Prefeito"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { mobilidade: 3, economia: 1 }, polemica: 1, base_real: "Inspirado em real" },
    { id: "OBR-TRI-005", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "Linha 18-Bronze (monotrilho do ABC)", descricao: "Monotrilho entre Tamanduateí e São Bernardo do Campo, passando por São Caetano e Santo André. O projeto original foi cancelado em 2019.", local: "São Paulo, São Caetano, Santo André e São Bernardo", escopo: "Regional", custo_milhoes: 7800, prazo_meses: 72, manutencao_anual_milhoes: 90, solicitantes: ["Prefeito", "Presidente"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { mobilidade: 6, economia: 2 }, polemica: 2, base_real: "Real – planejado/proposto" },
    { id: "OBR-TRI-006", esfera_executora: "Governador", categoria: "Obra", area: "Mobilidade", nome: "BRT-ABC", descricao: "Corredor de ônibus rápido entre São Bernardo, Santo André, São Caetano e o Tamanduateí, que substituiu o monotrilho.", local: "Grande ABC (SP)", escopo: "Regional", custo_milhoes: 1100, prazo_meses: 36, manutencao_anual_milhoes: 20, solicitantes: ["Prefeito"], negociar_com: null, aprovacao_legislativa: null, contrapartida: null, efeitos: { mobilidade: 4 }, polemica: 2, base_real: "Real – existente/em andamento" }
  ];
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
      var ptS = null; PONTOS.filter(function (x) { return x.est === id; }).forEach(function (x) { var r = estadoObras(x.obras); if (r && (!ptS || RANK[r.s] > RANK[ptS.s])) ptS = r; });
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
  function obraBox(cat) {
    var cid = ok(function () { return cargoAtualId(); }, ""), esf = { PREF: "Prefeito", GOV: "Governador", PRES: "Presidente" }[cid];
      var it = ok(function () { return OBRAS.item(cat); }, null); if (!it) return "";
      var is = instsDe(cat), i = is.filter(function (x) { return statusDeInst(x) !== "cancelado"; })[0] || is[0];
      var podeIniciar = !i || statusDeInst(i) === "cancelado";
      var acao = "";
      if (podeIniciar && esf && (it.esfera_executora === esf || (it.solicitantes || []).indexOf(esf) >= 0) && typeof btn === "function") acao = btn(it.esfera_executora === esf ? "Iniciar obra" : "Pedir ao " + it.esfera_executora, "obrasIniciar", [it.id], "mini confirma");
      return '<div class="v3t-obra"><b>' + esc_(it.nome) + "</b><small>" + esc_(it.esfera_executora) + " · R$ " + Math.round(it.custo_milhoes).toLocaleString("pt-BR") + " mi · " + it.prazo_meses + " meses</small>" +
        (i ? "<p>" + esc_(i.estado) + (["Em execução", "Atrasada", "Paralisada"].indexOf(i.estado) >= 0 ? " · " + Math.round(i.progresso || 0) + "%" : "") + (quem(i) ? " · iniciada por " + esc_(quem(i)) : "") + (i.inauguradorNome && i.estado === "Em manutenção" ? " · inaugurada por " + esc_(i.inauguradorNome) : "") + "</p>" : "<p>Ainda não saiu do papel.</p>") + (acao ? '<div class="row">' + acao + "</div>" : "") + "</div>";
    }
  function painelEst(id) {
    var e = E[id], ls = {}; TRECHOS.forEach(function (t) { if ((t.paradas || t.est).indexOf(id) >= 0) (ls[t.linha] = ls[t.linha] || []).push(t); });
    var h = '<div class="v3t-pl" style="--c:#1f2937"><b>Estação ' + esc_(e.n) + "</b><small>" + Object.keys(ls).map(function (k) { return "Linha " + L[k].num + " " + L[k].nome; }).join(" · ") + "</small></div>";
    Object.keys(ls).forEach(function (k) { ls[k].forEach(function (t) { var st = estadoTrecho(t); h += '<div class="v3t-trecho"><div><em class="v3t-st st-' + st.s + '">' + ROT[st.s] + "</em> <b>Linha " + esc_(L[k].num) + " – " + esc_(t.rotulo || L[k].nome) + "</b></div>" + (t.base === "operacao" ? "" : (t.obras || []).map(obraBox).join("")) + "</div>"; }); });
    var pts = PONTOS.filter(function (p) { return p.est === id; });
    pts.forEach(function (p) { var r = estadoObras(p.obras); h += '<div class="v3t-trecho"><div><em class="v3t-st st-' + (r ? r.s : "planejado") + '">' + (r ? ROT[r.s] : "Projeto") + "</em> <b>" + esc_(p.rotulo) + "</b></div>" + p.obras.map(obraBox).join("") + "</div>"; });
    if (!pts.length) h += '<p class="v3t-dica">Nenhuma obra de estação cadastrada aqui ainda.</p>';
    return h;
  }
  function painel() {
    if (ui.selEst && E[ui.selEst]) return painelEst(ui.selEst);
    var id = ui.sel; if (!id || !L[id]) return '<p class="v3t-dica">Toque numa linha ou estação (no mapa ou nos botões) para ver os trechos, as obras ligadas e o que dá para fazer. Arraste para mover o mapa; use os botões para aproximar.</p>';
    var l = L[id], ts = TRECHOS.filter(function (t) { return t.linha === id; });
    var h = '<div class="v3t-pl" style="--c:' + l.cor + '"><b>Linha ' + esc_(l.num) + " – " + esc_(l.nome) + "</b><small>" + esc_(l.op) + "</small></div>";
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
    if ((b = t.closest("[data-v3t-est]"))) { ui.selEst = b.getAttribute("data-v3t-est"); ui.sel = null; atualizar(); e.preventDefault(); e.stopPropagation(); return; }
    if ((b = t.closest("[data-v3t-linha]"))) { var id = b.getAttribute("data-v3t-linha"); ui.sel = ui.sel === id ? null : id; ui.selEst = null; atualizar(); e.preventDefault(); e.stopPropagation(); }
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

  /* ================================================================ mundo vivo: catálogo, governos NPC e efeito regional */
  var ESF_ID = { Prefeito: "PREF", Governador: "GOV", Presidente: "PRES" };
  function catalogo() {
    var OB = window.OBRAS; if (!OB || !OB.DB || !OB.BY_ID) return false;
    CATALOGO_EXTRA.forEach(function (it) { if (!OB.BY_ID[it.id]) { OB.DB.push(it); OB.BY_ID[it.id] = it; } });
    return true;
  }
  function agoraM_() { return ok(function () { return agoraM(); }, 0); }
  function titularNome(adm) { var g = ok(function () { return V3MEM.gestaoAtual(adm); }, null); return g ? g.nome : null; }
  // cria a obra como se o governo da vez a tivesse iniciado (sem passar pelo jogador)
  function obraNPC(catId, prog, autor, adm) {
    var OB = window.OBRAS, sys = ok(function () { return OB.garantir(); }, null), it = ok(function () { return OB.item(catId); }, null); if (!sys || !it) return null;
    var prazo = Math.max(1, it.prazo_meses || 12), dec = Math.min(prazo - 1, Math.round(prazo * prog / 100)), m = agoraM_(), total = OB.reais(it.custo_milhoes);
    var g = ok(function () { return V3MEM.gestaoAtual(adm); }, null);
    var inst = { id: "ON_" + catId + "_" + m, catalogoId: catId, estado: "Em execução", progresso: Math.round(dec / prazo * 100), custoTotal: total, custoPago: Math.round(total * dec / prazo), prazoMeses: prazo, mesesDecorridos: dec,
      esferaExec: adm, solicitanteCargo: adm, inauguradorId: null, inauguradorNome: null, manutencaoNivel: 1, manutencaoPagaMes: 0, estouro: 0, efeitosParciais: 0, mesInicio: m - dec, meioEfeito: dec >= prazo / 2, plPauta: false,
      mem: { adm: adm, gIni: dec ? null : (g ? g.id : null), rede: false, autor: autor, autorJogador: false, autorCargo: adm, gSol: null, ultEstado: "Em execução", ev: [{ m: m - dec, t: "Iniciada por " + autor }] } };
    sys.instancias[inst.id] = inst;
    return inst;
  }
  function existe(catId) { return instsDe(catId).some(function (i) { return statusDeInst(i) !== "cancelado"; }); }
  // obras reais que já estavam em andamento quando o jogo começa (Linha 6, extensões, TIC, BRT-ABC, Rodoanel Norte)
  var EM_CURSO = [["OBR-GOV-024", 80], ["OBR-GOV-023", 30], ["OBR-GOV-025", 35], ["OBR-GOV-028", 8], ["OBR-TRI-006", 55], ["OBR-GOV-036", 85]];
  function semear() {
    var m = ok(function () { return M(); }, null); if (!m || !catalogo()) return;
    m.v3tri = m.v3tri || {};
    if (!m.v3tri.efeitoMarcado) { // obras já entregues antes deste módulo não dão bônus retroativo
      m.v3tri.efeitoMarcado = true;
      ok(function () { var s2 = m.obrasSys; Object.keys(s2.instancias).forEach(function (k) { if (s2.instancias[k].estado === "Em manutenção") s2.instancias[k]._v3triEf = true; }); });
    }
    if (m.v3tri.semeado) return;
    m.v3tri.semeado = true;
    if (ok(function () { return dt().ano; }, 2026) > 2027) return;
    EM_CURSO.forEach(function (x) { if (!existe(x[0])) obraNPC(x[0], x[1], "Governo de SP (gestões anteriores)", "GOV"); });
  }
  // governos NPC também tocam obras novas (raramente), escolhendo projetos reais do catálogo
  function iniciativasNPC() {
    var cid = ok(function () { return cargoAtualId(); }, "");
    [["GOV", 0.008, true], ["PRES", 0.006, true], ["PREF", 0.01, false]].forEach(function (x) {
      var adm = x[0]; if (cid === adm || Math.random() >= x[1]) return;
      var autor = titularNome(adm); if (!autor) return;
      var esf = { PREF: "Prefeito", GOV: "Governador", PRES: "Presidente" }[adm];
      var cands = ok(function () { return OBRAS.DB.filter(function (it) { return it.esfera_executora === esf && it.categoria === "Obra" && (!x[2] || it.area === "Mobilidade") && !existe(it.id); }); }, []);
      if (!cands.length) return;
      var pref = cands.filter(function (it) { return /^Real/.test(it.base_real || ""); }), pool = pref.length && Math.random() < 0.7 ? pref : cands;
      var it = pool[Math.floor(Math.random() * pool.length)], inst = obraNPC(it.id, 0, autor, adm);
      if (inst) ok(function () { manchete(autor + " anuncia o início de \"" + it.nome + "\".", "obras"); });
    });
  }
  // linha ou estação entregue mexe na aprovação de quem governa (ou iniciou) nas regiões atendidas
  var TERR = { maua: "MAUA", capuava: "MAUA", itapark10: "MAUA", guapituba: "MAUA", santoandre: "sa", saladino: "sa", utinga: "sa", paco_sa: "sa", sa_oeste: "sa", afonsina: "sa", paranapiacaba: "sa", saocaetano: "scs", espacoceramica: "scs", djalma: "sbc", sbc_term: "sbc", paco_sbc: "sbc", ribeiraopires: "rp", rgs: "rgs" };
  function estacoesDaObra(catId) {
    var ids = {};
    TRECHOS.forEach(function (t) { if ((t.obras || []).indexOf(catId) >= 0) (t.paradas || t.est).forEach(function (e) { ids[e] = 1; }); });
    MELHORIAS.forEach(function (mm) { if (mm.obras.indexOf(catId) >= 0) { var t = TRECHOS.filter(function (x) { return x.id === mm.linha; })[0]; if (t) t.est.forEach(function (e) { ids[e] = 1; }); } });
    PONTOS.forEach(function (p) { if (p.obras.indexOf(catId) >= 0) ids[p.est] = 1; });
    return Object.keys(ids);
  }
  function efeitosRegionais() {
    var sys = ok(function () { return M().obrasSys; }, null); if (!sys) return;
    var cid = ok(function () { return cargoAtualId(); }, "");
    Object.keys(sys.instancias).forEach(function (k) {
      var inst = sys.instancias[k]; if (inst.estado !== "Em manutenção" || inst._v3triEf) return;
      var ests = estacoesDaObra(inst.catalogoId); if (!ests.length) return;
      inst._v3triEf = true;
      var terr = {}; ests.forEach(function (e) { var t = TERR[e] || "capital"; if (t === "MAUA") ok(function () { TERRITORIOS.filter(function (x) { return x.grupo === "Mauá"; }).forEach(function (x) { terr[x.id] = 1; }); }); else terr[t] = 1; });
      var adm = inst.esferaExec, m = inst.mem || {}, k2 = adm === cid ? 3 : (m.autorJogador ? 2 : 0);
      if (k2) ok(function () { var ap = J().aprovacao; Object.keys(terr).forEach(function (t) { if (ap[t] != null) ap[t] = Math.max(0, Math.min(100, ap[t] + k2)); }); });
      var nomes = Object.keys(terr).map(function (t) { return ok(function () { return TERRITORIOS.find(function (x) { return x.id === t; }).nome; }, t); });
      var it = ok(function () { return OBRAS.item(inst.catalogoId); }, null);
      if (it) ok(function () { manchete('Em operação: "' + it.nome + '". Moradores de ' + (nomes.length > 3 ? nomes.slice(0, 3).join(", ") + " e região" : nomes.join(", ")) + " ganham novas opções de transporte.", "obras"); });
    });
  }
  function ganchos() {
    var OB = window.OBRAS; if (!OB || !OB.tickMensal || OB.tickMensal.__v3tri) return;
    var o = OB.tickMensal;
    OB.tickMensal = function () { var r = o.apply(this, arguments); try { semear(); iniciativasNPC(); efeitosRegionais(); } catch (e) { console.warn("v3trilhos tick", e); } return r; };
    for (var k in o) { try { OB.tickMensal[k] = o[k]; } catch (e) {} }
    OB.tickMensal.__v3tri = true;
  }
  TR.semear = semear; TR.obraNPC = obraNPC;

  /* ================================================================ obras viárias de Mauá (mapa da cidade) */
  var VIARIO = [
    { obras: ["OBR-PRF-022"], tipo: "linha", pts: [[95, 257], [153, 178], [187, 108]], rot: "Corredor exclusivo de ônibus (Zaíra–Centro–Vila Noêmia)", cls: "onibus" },
    { obras: ["OBR-PRF-023"], tipo: "linha", pts: [[56, 150], [90, 93], [187, 108], [265, 85], [240, 212], [153, 178], [95, 257], [56, 150]], rot: "Ciclovias interbairros", cls: "ciclo" },
    { obras: ["OBR-PRF-024"], tipo: "ponto", pt: [160, 168], rot: "Terminal rodoviário intermodal (estação Mauá)" },
    { obras: ["OBR-PRF-026"], tipo: "ponto", pt: [92, 200], rot: "Nova ponte sobre o Rio Tamanduateí" },
    { obras: ["OBR-PRF-027"], tipo: "ponto", pt: [176, 146], rot: "Viaduto da Avenida Barão de Mauá" },
    { obras: ["OBR-PRF-028"], tipo: "area", ids: ["zaira", "primavera", "oratorio"], rot: "Asfalto em ruas de terra (bairros da periferia)" },
    { obras: ["OBR-PRE-036"], tipo: "linha", pts: [[4, 205], [60, 292], [180, 318], [326, 255]], rot: "Contorno viário de Mauá e Rodoanel Sul", cls: "rod" },
    { obras: ["OBR-GOV-037"], tipo: "linha", pts: [[150, 326], [142, 280], [153, 182]], rot: "Túnel Imigrantes–Mauá", cls: "tunel" },
    { obras: ["OBR-TRI-002"], tipo: "ponto", pt: [108, 166], rot: "Linha 10: estação Itapark" }
  ];
  var uiV = { sel: null };
  function estadoV(v) { var r = estadoObras(v.obras); return r || { s: "planejado" }; }
  function svgViario() {
    var g = ok(function () { return GEO.maua; }, null); if (!g) return "<p class='txt'>Mapa de Mauá indisponível.</p>";
    var h = '<svg class="v3v-svg" viewBox="0 0 ' + g.w + " " + g.h + '">';
    var areas = {}; VIARIO.forEach(function (v) { if (v.tipo === "area") { var st = estadoV(v).s; v.ids.forEach(function (id) { areas[id] = st; }); } });
    Object.keys(g.p).forEach(function (id) { h += '<path class="v3v-bairro' + (areas[id] && areas[id] !== "planejado" ? " ar-" + areas[id] : "") + '" d="' + g.p[id] + '"/>'; });
    // Linha 10 atravessando a cidade (contexto)
    h += '<path class="v3v-trem" d="M0 160 L60 165 L160 170 L255 230 L330 282"/>';
    [[60, 165, "Capuava"], [160, 170, "Mauá"], [255, 230, "Guapituba"]].forEach(function (x) { h += '<circle class="v3v-est" cx="' + x[0] + '" cy="' + x[1] + '" r="3.2"/><text class="v3v-et" x="' + (x[0] + 5) + '" y="' + (x[1] + 11) + '">' + x[2] + "</text>"; });
    Object.keys(g.c || {}).forEach(function (id) { var c = g.c[id], nm = ok(function () { return TERRITORIOS.find(function (t) { return t.id === id; }).nome; }, id); h += '<text class="v3v-bt" x="' + c[0] + '" y="' + (c[1] - 6) + '">' + esc_(String(nm).replace("Jardim ", "Jd. ").replace("Vila ", "V. ").replace("Centro de Mauá", "Centro")) + "</text>"; });
    VIARIO.forEach(function (v, i) {
      var st = estadoV(v).s, sel = uiV.sel === i ? " sel" : "", prog = (estadoObras(v.obras) || {}).inst;
      if (v.tipo === "linha") { var d = "M" + v.pts.map(function (p) { return p.join(" "); }).join("L"); h += '<g class="v3v-el v3v-l ' + (v.cls || "") + " st-" + st + sel + '" data-v3v="' + i + '"><path class="v3v-hit" d="' + d + '"/><path class="v3v-ln" d="' + d + '"/>' + (prog && (st === "obras" || st === "parado") ? '<path class="v3v-ln v3v-feito" pathLength="100" stroke-dasharray="' + Math.round(prog.progresso || 0) + ' 100" d="' + d + '"/>' : "") + "</g>"; }
      else if (v.tipo === "ponto") h += '<g class="v3v-el v3v-p st-' + st + sel + '" data-v3v="' + i + '"><circle cx="' + v.pt[0] + '" cy="' + v.pt[1] + '" r="7"/><text x="' + v.pt[0] + '" y="' + (v.pt[1] + 3) + '">' + (i + 1) + "</text></g>";
    });
    return h + "</svg>";
  }
  function painelViario() {
    var lista = '<ol class="v3v-lista">' + VIARIO.map(function (v, i) { var st = estadoV(v).s; return '<li class="' + (uiV.sel === i ? "on" : "") + '"><button type="button" data-v3v="' + i + '"><em class="v3t-st st-' + st + '">' + ROT[st] + "</em> " + esc_(v.rot) + "</button></li>"; }).join("") + "</ol>";
    var v = VIARIO[uiV.sel];
    return lista + (v ? '<div class="v3t-trecho"><b>' + esc_(v.rot) + "</b>" + v.obras.map(obraBox).join("") + "</div>" : "");
  }
  function cardViario() {
    var txt = "<p class='txt'><small>Obras viárias e de transporte dentro de Mauá, de qualquer esfera (Prefeitura, Estado e União). O desenho é esquemático; o estado de cada obra é o do jogo.</small></p>";
    return typeof card === "function" ? card("Obras viárias de Mauá", txt + '<div class="v3v" data-v3v-box="1"><div class="v3v-mapa">' + svgViario() + '</div><div class="v3v-painel">' + painelViario() + "</div></div>") : "";
  }
  TR.cardViario = cardViario;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3v]"); if (!b || !b.closest('[data-v3v-box="1"]')) return;
    e.preventDefault(); e.stopPropagation();
    var i = +b.getAttribute("data-v3v"); uiV.sel = uiV.sel === i ? null : i;
    var box = document.querySelector('[data-v3v-box="1"]'); if (box) { box.querySelector(".v3v-mapa").innerHTML = svgViario(); box.querySelector(".v3v-painel").innerHTML = painelViario(); }
  }, true);

  /* ================================================================ onde aparece: Poder (perto da Mobilidade) e Mapa */
  function instalar() {
    catalogo(); ganchos();
    if (typeof VIEWS === "undefined") return;
    ["poder", "mapa"].forEach(function (v) {
      if (typeof VIEWS[v] !== "function" || VIEWS[v].__v3t) return;
      var o = VIEWS[v];
      var n = function () { var h = o.apply(this, arguments); try { semear(); if (String(h).indexOf('data-v3t="1"') < 0) h += cardRede(); if (String(h).indexOf('data-v3v-box="1"') < 0) h += cardViario(); } catch (e) { console.warn("v3trilhos", e); } return h; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3t = true; VIEWS[v] = n;
    });
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 60); });
  var n0 = 0, t0 = setInterval(function () { instalar(); if (++n0 > 20) clearInterval(t0); }, 500);
})();
