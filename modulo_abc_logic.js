/* =============================================================================
   CADEIRA — EXPANSÃO DEFINITIVA: O UNIVERSO COMPLETO DO GRANDE ABC
   + 7 MUNICÍPIOS COM MAPAS VETORIAIS REAIS (IBGE GEOJSON / SVG NATIVO)
   + SELEÇÃO PERFEITA MUNICÍPIO -> BAIRROS COM ATUALIZAÇÃO IMEDIATA
   + 4 CASAS LEGISLATIVAS NO CONGRESSO (CÂMARA FED, SENADO, ALESP, CÂMARA MUNICIPAL)
   + CATÁLOGO COMPLETO DE ESCOLAS POLÍTICAS & INSPIRAÇÕES HISTÓRICAS
   + COMPATIBILIDADE TOTAL COM SAVES EXISTENTES (SEM NaN, TRANSIÇÃO SUAVE DE MAPAS)
   + UPLOAD DE FOTO REAL DO COMPUTADOR (FILE PICKER + CANVAS 144x180)
   ============================================================================= */

(function(){
  "use strict";

  // 1. INJETAR MAPAS VETORIAIS NO GEO
  if (typeof GEO !== "undefined" && typeof GEO_ABC !== "undefined") {
    Object.assign(GEO, GEO_ABC);
    GEO.santo_andre = GEO.sa;
    GEO.sao_bernardo = GEO.sbc;
    GEO.sao_caetano = GEO.scs;
    GEO.diadema = GEO.dia;
    GEO.ribeirao_pires = GEO.rp;
    GEO.rio_grande_da_serra = GEO.rgs;
  }

  // 2. DADOS CANÔNICOS DOS 7 MUNICÍPIOS
  const DADOS_GRANDE_ABC = {
    "Mauá": {
      id: "maua", geoKey: "maua", nome: "Mauá", gentilico: "Mauaense",
      populacao: 418261, eleitorado: 329000, orcamentoAnual: 1850000000,
      cadeirasCamara: 23, temSegundoTurno: true, idh: 0.766,
      descricao: "Berço industrial do polo petroquímico e da resistência operária do ABC. Topografia de morros, bairros populosos como o Zaíra e desafios em drenagem, encostas e saúde pública.",
      prefeitoAtual: { nome: "Marcelo Oliveira", partido: "PT", vice: "Juarez Pereira" },
      presidenteCamara: "Juninho Getúlio",
      bairros: [
        { id: "zaira", nome: "Jardim Zaíra", el: 48, pautaPredom: "obras", tipo: "Periferia / Alta densidade", desc: "Maior e mais populoso complexo periférico de Mauá." },
        { id: "oratorio", nome: "Jardim Oratório", el: 38, pautaPredom: "aux", tipo: "Periferia operária", desc: "Bairro tradicional colado à divisa com Santo André e capital." },
        { id: "itapark", nome: "Itapark", el: 32, pautaPredom: "seg", tipo: "Residencial misto", desc: "Bairro residencial extenso com comércio forte." },
        { id: "noemia", nome: "Vila Noêmia", el: 35, pautaPredom: "seg", tipo: "Classe média", desc: "Região residencial valorizada, tradicional reduto de servidores." },
        { id: "capuava", nome: "Capuava & Sertãozinho", el: 30, pautaPredom: "obras", tipo: "Polo Petroquímico", desc: "Coração industrial e petroquímico de Mauá." },
        { id: "primavera", nome: "Jardim Primavera", el: 34, pautaPredom: "aux", tipo: "Comunitário popular", desc: "Berço de fortes lideranças comunitárias e igrejas." },
        { id: "centro", nome: "Centro de Mauá", el: 52, pautaPredom: "cost", tipo: "Comércio central", desc: "Eixo comercial da Estação Mauá da CPTM e Calçadão." }
      ],
      programasGoverno: [
        { id: "asfalto_zaira", nome: "Pavimentação & Contenção do Zaíra", custo: 800000, desc: "Muros de contenção de encostas e drenagem nas vielas do Zaíra.", impacto: { pop: 4 } },
        { id: "renova_nardini", nome: "Modernização do Hospital Nardini", custo: 1200000, desc: "Reforma de leitos de UTI e contratação de médicos especialistas.", impacto: { pop: 5 } }
      ]
    },
    "Santo André": {
      id: "santo_andre", geoKey: "sa", nome: "Santo André", gentilico: "Andreense",
      populacao: 748919, eleitorado: 583000, orcamentoAnual: 4600000000,
      cadeirasCamara: 27, temSegundoTurno: true, idh: 0.815,
      descricao: "Capital financeira e de serviços do ABC. Cidade cosmopolita que une patrimônio histórico ferroviário de Paranapiacaba, comércio pujante e bairros nobres.",
      prefeitoAtual: { nome: "Gilvan Junior", partido: "PSDB", vice: "Silvana Medeiros" },
      presidenteCamara: "Carlos Ferreira",
      bairros: [
        { id: "campestre", nome: "Bairro Campestre & Bairro Jardim", el: 58, pautaPredom: "cost", tipo: "Nobre / Serviços", desc: "Região nobre com alta gastronomia, bares e Parque Celso Daniel." },
        { id: "parque_nacoes", nome: "Parque das Nações & Segundo Subdistrito", el: 62, pautaPredom: "seg", tipo: "Tradicional comercial", desc: "Coração do 2º Subdistrito, eixo comercial da Igreja Bonfim." },
        { id: "capuava_sa", nome: "Capuava (Santo André)", el: 44, pautaPredom: "obras", tipo: "Industrial", desc: "Área industrial e divisa com Mauá e São Caetano." },
        { id: "centro_sa", nome: "Centro de Santo André & Oliveira Lima", el: 65, pautaPredom: "com", tipo: "Comércio central", desc: "Calçadão da Rua Coronel Oliveira Lima, Estação Celso Daniel." },
        { id: "humaita", nome: "Vila Humaitá & Homero Thon", el: 48, pautaPredom: "lazer", tipo: "Residencial misto", desc: "Região do Estádio Bruno José Daniel e Shopping Atrium." },
        { id: "vila_luzita", nome: "Vila Luzita & Complexo Pedroso", el: 72, pautaPredom: "transp", tipo: "Periferia populosa", desc: "Maior terminal de ônibus periférico do ABC e forte demanda social." },
        { id: "paranapiacaba", nome: "Paranapiacaba & Parque Andreense", el: 14, pautaPredom: "eco", tipo: "Turismo / Mananciais", desc: "Vila ferroviária inglesa histórica, serra do mar e ecoturismo." }
      ],
      programasGoverno: [
        { id: "qualisaude_sa", nome: "Qualisaúde nos Bairros", custo: 1500000, desc: "Modernização das Unidades Básicas de Saúde de Santo André.", impacto: { pop: 5 } },
        { id: "parque_paranapiacaba", nome: "Restauração do Patrimônio Ferroviário", custo: 1100000, desc: "Preservação da vila inglesa e fomento ao turismo sustentável.", impacto: { pop: 4 } }
      ]
    },
    "São Bernardo do Campo": {
      id: "sao_bernardo", geoKey: "sbc", nome: "São Bernardo do Campo", gentilico: "São-bernardense",
      populacao: 810729, eleitorado: 645000, orcamentoAnual: 6200000000,
      cadeirasCamara: 28, temSegundoTurno: true, idh: 0.805,
      descricao: "Berço do sindicalismo moderno brasileiro e maior parque automotivo do país. Cidade de grandes avenidas, montadoras e expansão imobiliária.",
      prefeitoAtual: { nome: "Marcelo Lima", partido: "Podemos", vice: "Jessica Cormick" },
      presidenteCamara: "Danilo Lima",
      bairros: [
        { id: "rudge_ramos", nome: "Rudge Ramos", el: 68, pautaPredom: "seg", tipo: "Tradicional nobre", desc: "Bairro nobre tradicional, polo universitário (Metodista/Mauá)." },
        { id: "centro_sbc", nome: "Centro & Rua Marechal Deodoro", el: 72, pautaPredom: "com", tipo: "Comércio central", desc: "Centro financeiro e comercial, Paço Municipal e Poupatempo." },
        { id: "assuncao", nome: "Bairro Assunção & Almirante Delamare", el: 56, pautaPredom: "obras", tipo: "Residencial tradicional", desc: "Bairro fabril e residencial que abrigou históricas autopeças." },
        { id: "demarchi", nome: "Demarchi & Rota dos Frangos", el: 50, pautaPredom: "lazer", tipo: "Gastronômico", desc: "Famoso pela tradição dos restaurantes italianos de São Bernardo." },
        { id: "ferrazopolis", nome: "Ferrazópolis & Silvina", el: 64, pautaPredom: "transp", tipo: "Periferia operária", desc: "Bairro periférico populoso com alta dependência do transporte público." },
        { id: "alvarenga", nome: "Alvarenga & Jardim Laura", el: 78, pautaPredom: "aux", tipo: "Extrema periferia", desc: "Maior densidade populacional periférica do município." },
        { id: "riacho_grande", nome: "Riacho Grande & Represa Billings", el: 32, pautaPredom: "eco", tipo: "Ecoturismo / Mananciais", desc: "Orla da Represa Billings, gastronomia náutica e área de preservação." }
      ],
      programasGoverno: [
        { id: "corredores_sbc", nome: "Corredores Rápidos de BRT", custo: 2500000, desc: "Faixas exclusivas ligando Alvarenga ao Rudge Ramos.", impacto: { pop: 6 } },
        { id: "hospital_urgencia_sbc", nome: "Novo Hospital de Urgência", custo: 3200000, desc: "Unidade hospitalar de ponta com mais de 250 leitos cirúrgicos.", impacto: { pop: 7 } }
      ]
    },
    "São Caetano do Sul": {
      id: "sao_caetano", geoKey: "scs", nome: "São Caetano do Sul", gentilico: "Sul-são-caetanense",
      populacao: 165655, eleitorado: 142000, orcamentoAnual: 2400000000,
      cadeirasCamara: 19, temSegundoTurno: false, idh: 0.862,
      descricao: "Campeã nacional de IDH do Brasil. 100% de área urbana sem favelas, modelo educacional integral e sede da General Motors.",
      prefeitoAtual: { nome: "Tite Campanella", partido: "PL", vice: "Regina Maura" },
      presidenteCamara: "Pio Mielo",
      bairros: [
        { id: "fundacao", nome: "Bairro Fundação", el: 20, pautaPredom: "obras", tipo: "Histórico / CPTM", desc: "Onde nasceu a cidade; divisa com a capital paulista." },
        { id: "barcelona", nome: "Bairro Barcelona", el: 24, pautaPredom: "seg", tipo: "Residencial tradicional", desc: "Bairro tradicional com forte comércio e proximidade da USCS." },
        { id: "santa_paula", nome: "Santa Paula", el: 28, pautaPredom: "cost", tipo: "Classe média alta", desc: "Eixo nobre com clínicas médicas e apartamentos de alto padrão." },
        { id: "olimpico", nome: "Olímpico & Cerâmica", el: 26, pautaPredom: "lazer", tipo: "Espaço Cerâmica & ParkShopping", desc: "Região moderna com o ParkShopping São Caetano e complexo esportivo." },
        { id: "prosperidade", nome: "Bairro Prosperidade", el: 18, pautaPredom: "obras", tipo: "Fabril / Divisa Leste", desc: "Bairro com forte vocação industrial e colado ao Ipiranga." },
        { id: "nova_gerty", nome: "Nova Gerty & Mauá (SCS)", el: 26, pautaPredom: "aux", tipo: "Comunitário denso", desc: "Bairro popular mais populoso e participativo de São Caetano." }
      ],
      programasGoverno: [
        { id: "terceira_idade_scs", nome: "Rede de Apoio à Terceira Idade", custo: 900000, desc: "Centros de convivência com hidroginástica, medicina preventiva e lazer.", impacto: { pop: 5 } },
        { id: "escola_tempo_integral_scs", nome: "São Caetano Escola Global", custo: 1400000, desc: "Ensino bilíngue e robótica em 100% das escolas municipais.", impacto: { pop: 6 } }
      ]
    },
    "Diadema": {
      id: "diadema", geoKey: "dia", nome: "Diadema", gentilico: "Diademense",
      populacao: 393237, eleitorado: 340000, orcamentoAnual: 1950000000,
      cadeirasCamara: 21, temSegundoTurno: true, idh: 0.757,
      descricao: "Pioneira em políticas sociais progressistas e orçamento participativo nos anos 80 e 90. Forte densidade demográfica e pólo de cosméticos e autopeças.",
      prefeitoAtual: { nome: "Taka Yamauchi", partido: "MDB", vice: "Rafael da Farmácia" },
      presidenteCamara: "Orlando Vitoriano",
      bairros: [
        { id: "centro_dia", nome: "Centro de Diadema", el: 54, pautaPredom: "com", tipo: "Comércio central", desc: "Praça da Moça, shopping e corredores de transporte centrais." },
        { id: "piraporinha", nome: "Piraporinha", el: 50, pautaPredom: "saude", tipo: "Polo de Saúde e CPTM", desc: "Região do Hospital Municipal e do Terminal Metropolitano." },
        { id: "conceicao_inamar", nome: "Conceição & Inamar", el: 42, pautaPredom: "transp", tipo: "Misto periférico", desc: "Grandes conjuntos habitacionais e áreas industriais." },
        { id: "eldorado", nome: "Eldorado & Serraria", el: 48, pautaPredom: "obras", tipo: "Periferia densa", desc: "Bairros com forte organização de movimentos de moradia." },
        { id: "campanario", nome: "Campanário & Taboão (Diadema)", el: 56, pautaPredom: "seg", tipo: "Divisa capital", desc: "Fronteira com Jabaquara e São Paulo, polo comercial e fabril." }
      ],
      programasGoverno: [
        { id: "diadema_segura", nome: "Iluminação de LED & Muralha Integrada", custo: 1000000, desc: "Câmeras de reconhecimento e patrulhamento comunitário nos bairros.", impacto: { pop: 5 } },
        { id: "hospital_diadema", nome: "Novo Pronto-Socorro Central", custo: 1600000, desc: "Reestruturação completa da rede de urgência e emergência municipal.", impacto: { pop: 6 } }
      ]
    },
    "Ribeirão Pires": {
      id: "ribeirao_pires", geoKey: "rp", nome: "Ribeirão Pires", gentilico: "Ribeirão-pirense",
      populacao: 115559, eleitorado: 95000, orcamentoAnual: 620000000,
      cadeirasCamara: 17, temSegundoTurno: false, idh: 0.784,
      descricao: "Estância Turística encravada na Serra do Mar e Mata Atlântica. Clima serrano, patrimônio histórico sacrossanto e tranquilidade residencial.",
      prefeitoAtual: { nome: "Guto Volpi", partido: "PL", vice: "Rubens Fernandes" },
      presidenteCamara: "Professor Paulo Cesar",
      bairros: [
        { id: "centro_rp", nome: "Centro & Vila Sueli", el: 28, pautaPredom: "cost", tipo: "Turismo & Comércio", desc: "Estação histórica da CPTM, Vila do Doce e centro comercial." },
        { id: "ouro_fino", nome: "Ouro Fino Paulista", el: 32, pautaPredom: "obras", tipo: "Distrito rural/residencial", desc: "Maior distrito de Ribeirão Pires, com perfil tranquilo e demandas de asfalto." },
        { id: "jardim_caicara", nome: "Jardim Caçula & Santa Luzia", el: 30, pautaPredom: "aux", tipo: "Periferia serrana", desc: "Região com relevo acentuado e forte atuação de associações locais." },
        { id: "quarta_divisao", nome: "Quarta Divisão & Represa", el: 25, pautaPredom: "eco", tipo: "Ambiental / Chácaras", desc: "Área de mananciais, turismo ecológico e chácaras de recreio." }
      ],
      programasGoverno: [
        { id: "festival_chocolate", nome: "Expansão da Estância Turística & Festival", custo: 450000, desc: "Fortalecimento do comércio gastronômico e turismo regional.", impacto: { pop: 4 } },
        { id: "drenagem_rp", nome: "Contenção de Enchentes do Córrego Ribeirão Pires", custo: 800000, desc: "Canalização e desassoreamento para blindar a área central.", impacto: { pop: 5 } }
      ]
    },
    "Rio Grande da Serra": {
      id: "rio_grande_da_serra", geoKey: "rgs", nome: "Rio Grande da Serra", gentilico: "Rio-grandense-da-serra",
      populacao: 44170, eleitorado: 38000, orcamentoAnual: 190000000,
      cadeirasCamara: 13, temSegundoTurno: false, idh: 0.749,
      descricao: "Município 100% inserido em área de proteção aos mananciais da Represa Billings. Charme bucólico e imensos desafios orçamentários e de infraestrutura.",
      prefeitoAtual: { nome: "Penha Fumagalli", partido: "PSD", vice: "Claudinho Monteiro" },
      presidenteCamara: "Elias Ramos",
      bairros: [
        { id: "centro_rgs", nome: "Centro de Rio Grande", el: 14, pautaPredom: "com", tipo: "Comércio & CPTM", desc: "Estação terminal da Linha 10-Turquesa e comércios de conveniência." },
        { id: "vila_conde", nome: "Vila Conde & Lavapés", el: 10, pautaPredom: "obras", tipo: "Residencial tradicional", desc: "Bairros tradicionais com demandas por melhorias de pavimentação." },
        { id: "santa_tereza", nome: "Santa Tereza & Parque América", el: 12, pautaPredom: "aux", tipo: "Popular comunitário", desc: "Comunidade acolhedora com atuação forte de líderes religiosos." },
        { id: "pedreira", nome: "Jardim Oasis & Pedreira", el: 8, pautaPredom: "eco", tipo: "Mananciais / Ambiental", desc: "Cercado por matas nativas, orla das represas e ecologia preservada." }
      ],
      programasGoverno: [
        { id: "eco_mananciais_rgs", nome: "Preservação das Águas & Saneamento Ecológico", custo: 250000, desc: "Drenagem sustentável sem agredir a Represa Billings.", impacto: { pop: 5 } },
        { id: "saude_itinerante_rgs", nome: "Carreta da Saúde nos Bairros Serranos", custo: 300000, desc: "Consultas com especialistas nos bairros afastados do Centro.", impacto: { pop: 6 } }
      ]
    }
  };
  window.DADOS_GRANDE_ABC = DADOS_GRANDE_ABC;

  // 3. CATÁLOGO COMPLETO DE ESCOLAS POLÍTICAS & INSPIRAÇÕES HISTÓRICAS
  const CATALOGO_INSPIRACOES = [
    {
      id: "ulysses",
      nome: "Ulysses Guimarães",
      alcunha: "O Senhor Diretas",
      arquetipo: "Constitucionalista Legalista & Coragem Moral",
      citacao: "Traidor da Constituição é traidor da Pátria. Conhecemos o caminho do cativeiro; queremos agora o caminho da liberdade.",
      descricao: "Presidente da Assembleia Nacional Constituinte de 1988 e líder histórico da oposição cívica à ditadura. Símbolo maior da transição democrática e da legalidade constitucional brasileira.",
      pros: ["+30% de autoridade moral na tramitação de PECs e Leis Orgânicas", "+25% de resistência passiva contra tentativas de suborno e escândalos"],
      contras: ["Intransigência regimental que dificulta negociações puramente fisiológicas"]
    },
    {
      id: "tancredo",
      nome: "Tancredo Neves",
      alcunha: "O Mestre da Conciliação",
      arquetipo: "Pragmatismo Conciliador & Engenharia Política",
      citacao: "Na política, o segredo não é derrotar o adversário até destruí-lo, mas deixá-lo com uma saída honrosa para o dia seguinte.",
      descricao: "Patrício de Minas Gerais, mestre incontestável na arte do diálogo, costura de bastidores e montagem de frentes amplas para viabilizar governabilidade sem ruptura institucional.",
      pros: ["+35% de sucesso em costuras de coalizão e acordos partidários difíceis", "+20% facilidade em acalmar a oposição e evitar CPIs"],
      contras: ["Cobrança constante de aliados mais radicais por posições mais incisivas"]
    },
    {
      id: "mario_covas",
      nome: "Mário Covas",
      alcunha: "O Firme & Austero",
      arquetipo: "Social-Democrata Firme & Austero",
      citacao: "Não há mal que dure para sempre, e nem há bem que não se possa conquistar com luta e coragem.",
      descricao: "Governador histórico de São Paulo conhecido pela austeridade fiscal intransigente, coragem cívica e enfrentamento direto de crises olho no olho.",
      pros: ["Imunidade sólida contra acusações de corrupção pessoal", "+30% autoridade moral em momentos de calamidade e motins"],
      contras: ["Conflito frequente com setores fisiológicos que exigem balcão de negócios"]
    },
    {
      id: "brizola",
      nome: "Leonel Brizola",
      alcunha: "O Caudilho da Legalidade",
      arquetipo: "Trabalhista Combativo & Educação Integral",
      citacao: "A educação é a única revolução que não derrama sangue, mas liberta um povo.",
      descricao: "Líder histórico da Cadeia da Legalidade e defensor fervoroso da escola pública de tempo integral (CIEPs). Oratória arrebatadora e mobilização das massas populares.",
      pros: ["+35% entusiasmo em comícios de rua e palanques populares", "Facilidade imensa na mobilização das bases operárias"],
      contras: ["Oposição figadal dos grandes conglomerados de mídia e sistema financeiro"]
    },
    {
      id: "montoro",
      nome: "Franco Montoro",
      alcunha: "O Municipalista Comunitário",
      arquetipo: "Descentralizador Comunitário",
      citacao: "As pessoas não vivem na União nem no Estado: as pessoas vivem no Município.",
      descricao: "Governador de São Paulo na abertura democrática. Símbolo do fortalecimento dos bairros, associações comunitárias e descentralização de recursos públicos.",
      pros: ["+30% apoio espontâneo de líderes comunitários e pastorais de bairro", "Excelente diálogo com prefeitos vizinhos"],
      contras: ["Estilo comedido, com menor tração em redes sociais agressivas"]
    },
    {
      id: "lula",
      nome: "Luiz Inácio Lula da Silva",
      alcunha: "O Filho de São Bernardo",
      arquetipo: "Líder Sindical Operário & Carisma de Massas",
      citacao: "A esperança venceu o medo.",
      descricao: "Nascido nas greves dos metalúrgicos de São Bernardo do Campo. Carisma inigualável, diálogo direto com o chão de fábrica e poder de conciliação política.",
      pros: ["+40% de apelo imediato nas periferias e movimentos sindicais do ABC", "+30% de eficácia em programas sociais e combate à pobreza"],
      contras: ["Forte resistência de setores da alta renda e da Faria Lima"]
    },
    {
      id: "fhc",
      nome: "Fernando Henrique Cardoso",
      alcunha: "O Construtor do Real",
      arquetipo: "Reformista Liberal & Diplomacia Internacional",
      citacao: "A estabilidade da moeda é a maior conquista social da história republicana recente.",
      descricao: "Arquiteto do Plano Real e da Lei de Responsabilidade Fiscal. Reformulou a economia, conteve a hiperinflação e abriu o país para o mercado global.",
      pros: ["+35% de confiança do empresariado, mercado financeiro e agências internacionais", "Rigor no controle da inflação e metas orçamentárias"],
      contras: ["Visto como tecnocrata e distante das camadas mais humildes"]
    },
    {
      id: "eneas",
      nome: "Enéas Carneiro",
      alcunha: "Voz Nacionalista Soberana",
      arquetipo: "Nacionalista Douto & Discurso de Choque",
      citacao: "Meu nome é Enéas! Um país sem projeto soberano é apenas uma colônia de outros.",
      descricao: "Médico cardiologista e tribuno de oratória eletrizante. Defensor apaixonado da soberania nacional, Forças Armadas equipadas, ciência e industrialização estratégica.",
      pros: ["+45% de atração de eleitores anti-sistema e nacionalistas", "Facilidade na aprovação de medidas rigorosas de segurança pública"],
      contras: ["Falta de paciência para alianças políticas tradicionais"]
    },
    {
      id: "darcy",
      nome: "Darcy Ribeiro",
      alcunha: "O Educador dos Povos",
      arquetipo: "Humanista Revolucionário da Educação",
      citacao: "Se os governantes não construírem escolas, em 20 anos faltará dinheiro para construir presídios.",
      descricao: "Antropólogo genial, fundador da UnB e pioneiro dos centros integrados de educação pública. Dedicou a vida à valorização da cultura e sabedoria brasileiras.",
      pros: ["Prestígio moral e cultural imenso entre educadores e estudantes", "Legado de educação que gera popularidade cumulativa perene"],
      contras: ["Considerado excessivamente sonhador pelos operadores do pragmatismo duro"]
    },
    {
      id: "propria",
      nome: "Identidade Própria",
      alcunha: "O Novo Caminho / Pragmatismo Puro",
      arquetipo: "Pragmatismo Adaptativo",
      citacao: "Não sigo cartilhas do passado; respondo às demandas reais do presente.",
      descricao: "Trajetória 100% pessoal, independente de ícones ou fórmulas antigas. Adaptabilidade aos cenários práticos da política contemporânea.",
      pros: ["Flexibilidade para construir qualquer aliança sem preconceitos partidários", "Sem rejeição herdada de figuras históricas do passado"],
      contras: ["Sem militância passional herdada no início da caminhada"]
    }
  ];
  window.CATALOGO_INSPIRACOES = CATALOGO_INSPIRACOES;

  // 4. GARANTIR TERRITÓRIOS DE TODOS OS MUNICÍPIOS NO ENGINE
  function garantirTerritoriosDoGrandeABC() {
    if (typeof TERRITORIOS === "undefined" || !Array.isArray(TERRITORIOS)) return;

    Object.keys(DADOS_GRANDE_ABC).forEach(cNome => {
      const cObj = DADOS_GRANDE_ABC[cNome];
      cObj.bairros.forEach(b => {
        let t = TERRITORIOS.find(x => x.id === b.id);
        if (!t) {
          t = {
            id: b.id,
            nome: `${b.nome}`,
            el: b.el || 25,
            pautaPredom: b.pautaPredom || "obras",
            renda: b.tipo.includes("nobre") ? 6 : (b.tipo.includes("méd") ? 4 : 2),
            tipo: b.tipo,
            grupo: cNome,
            cidade: cNome,
            uf: "SP"
          };
          TERRITORIOS.push(t);
        } else {
          t.grupo = cNome;
          t.cidade = cNome;
        }
      });
    });
  }
  try { garantirTerritoriosDoGrandeABC(); } catch(e) { console.warn(e); }

  // 5. COMPATIBILIDADE UNIVERSAL COM SAVES EXISTENTES
  function garantirCompatibilidadeSave() {
    try {
      garantirTerritoriosDoGrandeABC();
      const j = (typeof J === "function") ? J() : null;
      if (!j) return;

      if (!j.municipio_domicilio) {
        j.municipio_domicilio = "Mauá";
        j.cidade = "Mauá";
      }
      if (!j.bairro) {
        j.bairro = "centro";
        j.bairro_origem = "centro";
      }
      if (!j.aprovacao) j.aprovacao = {};
      if (!j.campanha) j.campanha = {};
      if (!j.campanha.trafego) j.campanha.trafego = {};

      if (typeof TERRITORIOS !== "undefined" && Array.isArray(TERRITORIOS)) {
        TERRITORIOS.forEach(t => {
          if (j.aprovacao[t.id] == null) {
            j.aprovacao[t.id] = (t.id === j.bairro) ? 52 : (t.grupo === j.municipio_domicilio) ? 35 : (Object.keys(DADOS_GRANDE_ABC).includes(t.grupo) ? 22 : 10);
          }
          if (j.campanha.trafego[t.id] == null) {
            j.campanha.trafego[t.id] = 0;
          }
        });
      }

      sincronizarCamaraMunicipalNoCongresso();
    } catch(err) {
      console.warn("Compatibilidade save:", err);
    }
  }

  // Interceptar carregamento de save
  if (typeof carregar === "function") {
    const _origCarregar = carregar;
    window.carregar = function() {
      const res = _origCarregar.apply(this, arguments);
      if (res) garantirCompatibilidadeSave();
      return res;
    };
  }
  if (typeof carregarStr === "function") {
    const _origCarregarStr = carregarStr;
    window.carregarStr = function(s) {
      const res = _origCarregarStr.apply(this, arguments);
      if (res) garantirCompatibilidadeSave();
      return res;
    };
  }
  if (typeof iniciarSessao === "function") {
    const _origIniciarSessao = iniciarSessao;
    window.iniciarSessao = function() {
      garantirCompatibilidadeSave();
      return _origIniciarSessao.apply(this, arguments);
    };
  }

  // 6. MAPAS VETORIAIS REAIS (svgMapa)
  if (typeof svgMapa === "function") {
    window.svgMapa = function() {
      const v = (S.map && S.map.vista) || "maua";
      const sel = (S.map && S.map.sel) || null;
      const modo = (S.map && S.map.modo) || "aprov";
      const j = (typeof J === "function") ? J() : null;

      if (typeof GEO === "undefined") return "<p class='txt'>Mapa indisponível.</p>";

      // 1. Estado de São Paulo
      if (v === "sp") {
        if (typeof svgSP === "function") return svgSP(modo);
        if (GEO.sp) {
          const g = GEO.sp;
          return `<svg viewBox="0 0 ${g.w} ${g.h}" class="mapa" role="group" aria-label="Mapa do estado de São Paulo">${Object.keys(g.p).map(id => {
            const t = TERRITORIOS.find(a => a.id === id) || { el: 100, nome: id };
            const val = modo === "aprov" ? (Math.round((j && j.aprovacao && j.aprovacao[id]) || 40) + "%") : modo === "traf" ? (typeof fmtK === "function" ? fmtK(((j && j.campanha && j.campanha.trafego && j.campanha.trafego[id]) || 0)) : "0") : ((typeof fmtV === "function" ? fmtV(t.el) : t.el) + " mil");
            const fill = (typeof corTerr === "function") ? corTerr(id) : "";
            return (typeof pathG === "function") ? pathG(g, id, fill, t.nome, val, sel) : "";
          }).join("")}</svg>`;
        }
      }

      // 2. Região Metropolitana / Grande SP
      if (v === "gsp" && GEO.gsp) {
        const g = GEO.gsp;
        return `<svg viewBox="0 0 ${g.w} ${g.h}" class="mapa" role="group" aria-label="Mapa da Grande São Paulo e do ABC">${["capital","sa","sbc","scs","dia","rp","rgs","maua"].map(id=>{
          const isM = id === "maua";
          const t = TERRITORIOS.find(a => a.id === id) || { el: 50, nome: id };
          const fill = isM ? ((typeof corMaua === "function") ? corMaua(modo) : "") : ((typeof corTerr === "function") ? corTerr(id) : "");
          const nome = isM ? "Mauá" : t.nome.replace("São Bernardo do Campo","S. Bernardo").replace("São Caetano do Sul","S. Caetano").replace("São Paulo (Capital)","Capital").replace("Santo André","S. André").replace("Ribeirão Pires","Rib. Pires").replace("Rio Grande da Serra","R. G. da Serra");
          const val = isM ? (modo === "aprov" ? Math.round(["zaira","oratorio","itapark","noemia","capuava","primavera","centro"].reduce((s,x)=>s+((j && j.aprovacao && j.aprovacao[x])||45),0)/7)+"%" : "") : (modo === "aprov" ? Math.round((j && j.aprovacao && j.aprovacao[id])||45)+"%" : modo === "traf" ? (typeof fmtK === "function" ? fmtK((j && j.campanha && j.campanha.trafego && j.campanha.trafego[id])||0) : "0") : ((typeof fmtV === "function" ? fmtV(t.el) : t.el) + " mil"));
          const pid = isM ? "maua_agr" : id;
          return (typeof pathG === "function") ? pathG(g, id, fill, nome, val, sel === pid || (isM && sel === "maua_agr") ? id : null, id === "rgs" || id === "rp") : "";
        }).join("").replace(/data-p='\["maua"\]'/,"data-p='[\"maua_agr\"]'")}</svg>`;
      }

      // 3. Brasil
      if (v === "br" && GEO.br) {
        const g = GEO.br;
        return `<svg viewBox="0 0 ${g.w} ${g.h}" class="mapa" role="group" aria-label="Mapa do Brasil por estado">${Object.keys(g.p).map(uf => (typeof pathG === "function" ? pathG(g, uf, (typeof fillUF === "function" ? fillUF(uf, modo) : ""), uf, "", sel, ["SE","AL","RN","PB","DF","ES","RJ"].includes(uf) && false) : "")).join("")}</svg>`;
      }

      // 4. Municípios individuais do Grande ABC
      const mapaKey = {
        "maua": "maua", "Mauá": "maua",
        "sa": "sa", "santo_andre": "sa", "Santo André": "sa",
        "sbc": "sbc", "sao_bernardo": "sbc", "São Bernardo do Campo": "sbc",
        "scs": "scs", "sao_caetano": "scs", "São Caetano do Sul": "scs",
        "dia": "dia", "diadema": "dia", "Diadema": "dia",
        "rp": "rp", "ribeirao_pires": "rp", "Ribeirão Pires": "rp",
        "rgs": "rgs", "rio_grande_da_serra": "rgs", "Rio Grande da Serra": "rgs"
      }[v];

      if (mapaKey && GEO[mapaKey]) {
        const g = GEO[mapaKey];
        const cidNome = {
          "maua": "Mauá", "sa": "Santo André", "sbc": "São Bernardo do Campo",
          "scs": "São Caetano do Sul", "dia": "Diadema", "rp": "Ribeirão Pires", "rgs": "Rio Grande da Serra"
        }[mapaKey] || v;

        const pathsHtml = Object.keys(g.p).map(id => {
          const t = TERRITORIOS.find(a => a.id === id) || { el: 30, nome: id };
          const val = modo === "aprov" ? (Math.round((j && j.aprovacao && j.aprovacao[id]) || 45) + "%") : modo === "traf" ? (typeof fmtK === "function" ? fmtK(((j && j.campanha && j.campanha.trafego && j.campanha.trafego[id]) || 0)) : "0") : ((typeof fmtV === "function" ? fmtV(t.el) : t.el) + " mil");
          const cleanNome = t.nome.replace(/\s*\(.*\)/, "").replace("Jardim ", "Jd. ").replace("Vila ", "V. ").replace("Parque ", "Pq. ").replace("Bairro ", "B. ");
          const fill = (typeof corTerr === "function") ? corTerr(id) : "fill:rgba(56,189,248,0.3);stroke:#38bdf8";
          return (typeof pathG === "function") ? pathG(g, id, fill, cleanNome, val, sel) : "";
        }).join("");

        return `<svg viewBox="0 0 ${g.w} ${g.h}" class="mapa" role="group" aria-label="Mapa de ${esc(cidNome)} com divisão em bairros">${pathsHtml}</svg>`;
      }

      return "<p class='txt'>Mapa indisponível.</p>";
    };
  }

  // 7. ABA MAPA COM SELETOR COMPLETO DOS 7 MUNICÍPIOS (vMapa)
  if (typeof vMapa === "function") {
    window.vMapa = function() {
      garantirCompatibilidadeSave();
      const mp = S.map = S.map || { vista: "maua", modo: "aprov", sel: null };
      const j = (typeof J === "function") ? J() : null;
      const cidPlayer = (j && j.municipio_domicilio) || "Mauá";

      if (!mp.vista || mp.vista === "maua" && cidPlayer !== "Mauá" && !S._jaDefiniuVista) {
        const keyMap = { "Mauá": "maua", "Santo André": "sa", "São Bernardo do Campo": "sbc", "São Caetano do Sul": "scs", "Diadema": "dia", "Ribeirão Pires": "rp", "Rio Grande da Serra": "rgs" };
        if (keyMap[cidPlayer]) mp.vista = keyMap[cidPlayer];
        S._jaDefiniuVista = true;
      }

      const vistasABC = [
        { id: "maua", rot: "Mauá" },
        { id: "sa", rot: "Santo André" },
        { id: "sbc", rot: "São Bernardo" },
        { id: "scs", rot: "São Caetano" },
        { id: "dia", rot: "Diadema" },
        { id: "rp", rot: "Rib. Pires" },
        { id: "rgs", rot: "Rio Grande da Serra" }
      ];

      const vistaCur = mp.vista || "maua";

      const navCidades = `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${vistasABC.map(v => btn(v.rot, "mapvista", [v.id], "mini " + (vistaCur === v.id ? "confirma" : "branco"))).join("")}
          ${btn("Grande SP", "mapvista", ["gsp"], "mini " + (vistaCur === "gsp" ? "confirma" : "branco"))}
          ${btn("Estado de SP", "mapvista", ["sp"], "mini " + (vistaCur === "sp" ? "confirma" : "branco"))}
          ${btn("Brasil", "mapvista", ["br"], "mini " + (vistaCur === "br" ? "confirma" : "branco"))}
        </div>
      `;

      const modoBtns = `
        <div class="row" style="margin-bottom:8px">
          ${btn("Minha Aprovação", "mapmodo", ["aprov"], "mini " + (mp.modo === "aprov" ? "corrige" : "branco"))}
          ${btn("Eleitorado", "mapmodo", ["el"], "mini " + (mp.modo === "el" ? "corrige" : "branco"))}
          ${btn("Tráfego Pago", "mapmodo", ["traf"], "mini " + (mp.modo === "traf" ? "corrige" : "branco"))}
          ${vistaCur === "br" ? btn("Governos", "mapmodo", ["gov"], "mini " + (mp.modo === "gov" ? "corrige" : "branco")) : ""}
        </div>
      `;

      const selCidObj = Object.values(DADOS_GRANDE_ABC).find(c => c.geoKey === vistaCur);

      const painelCid = selCidObj ? `
        <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:10px;padding:12px;margin-top:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <b style="font-size:1.1rem;color:#38bdf8">${selCidObj.nome}</b>
              <span style="font-size:0.8rem;color:#94a3b8;margin-left:8px">IDH: ${selCidObj.idh} · Pop: ${fmtV(selCidObj.populacao)} hab · Eleitores: ${fmtV(selCidObj.eleitorado)}</span>
            </div>
            <div>
              <span class="tag gray">${selCidObj.cadeirasCamara} Vereadores</span>
              <span class="tag blue">Orçamento: R$ ${(selCidObj.orcamentoAnual / 1e9).toFixed(1)} bi/ano</span>
            </div>
          </div>
          <p class="txt" style="font-size:0.82rem;color:#cbd5e1;margin:8px 0">${selCidObj.descricao}</p>
          <div style="display:flex;gap:12px;font-size:0.8rem;color:#94a3b8;border-top:1px solid #1e293b;padding-top:8px">
            <div>🏛️ <b>Prefeito:</b> ${selCidObj.prefeitoAtual.nome} (${selCidObj.prefeitoAtual.partido})</div>
            <div>⚖️ <b>Vice:</b> ${selCidObj.prefeitoAtual.vice}</div>
            <div>🏢 <b>Pres. da Câmara:</b> ${selCidObj.presidenteCamara}</div>
          </div>
        </div>
      ` : "";

      // Interação de seleção no mapa
      let selExtra = "";
      if (mp.sel) {
        if (TERRITORIOS.some(t => t.id === mp.sel)) {
          selExtra = painelTerr(mp.sel);
        } else if (mp.sel === "maua_agr" || mp.sel === "maua") {
          selExtra = card("Mauá", "<p class='txt'>Explore os bairros e a política local de Mauá.</p>" + btn("Abrir mapa detalhado de Mauá", "mapvista", ["maua"], "confirma mini"));
        } else if (["sa","sbc","scs","dia","rp","rgs"].includes(mp.sel)) {
          const mapNomes = { sa: "Santo André", sbc: "São Bernardo do Campo", scs: "São Caetano do Sul", dia: "Diadema", rp: "Ribeirão Pires", rgs: "Rio Grande da Serra" };
          selExtra = card(mapNomes[mp.sel], `<p class='txt'>Explore os bairros e a política local de ${mapNomes[mp.sel]}.</p>` + btn(`Abrir mapa detalhado de ${mapNomes[mp.sel]}`, "mapvista", [mp.sel], "confirma mini"));
        } else if (typeof TILE_BR !== "undefined" && TILE_BR[mp.sel]) {
          selExtra = painelUF(mp.sel);
        }
      }

      const leg = (typeof legendaMapa === "function") ? legendaMapa() : "";
      return card("Mapa Territorial", navCidades + modoBtns + svgMapa() + leg + selExtra + painelCid);
    };
  }

  // 8. SINCRONIZAR CÂMARA MUNICIPAL NO CONGRESSO
  function sincronizarCamaraMunicipalNoCongresso() {
    const j = (typeof J === "function") ? J() : null;
    const cidNome = (j && j.municipio_domicilio) || (typeof S !== "undefined" && S.cfg && S.cfg.municipio) || "Mauá";
    const cidObj = DADOS_GRANDE_ABC[cidNome] || DADOS_GRANDE_ABC["Mauá"];
    const qtdCadeiras = cidObj.cadeirasCamara || 23;

    if (typeof CASA_NOME !== "undefined") {
      CASA_NOME["M"] = `Câmara Municipal de ${cidNome}`;
    }
    if (typeof PAPEL_MESA !== "undefined") {
      PAPEL_MESA["M"] = `Pres. da Câmara de ${cidNome}`;
    }

    if (typeof window.INST !== "undefined" && Array.isArray(window.INST)) {
      const instM = window.INST.find(i => i.cod === "M");
      if (instM) {
        instM.k = `Câmara Municipal de ${cidNome}`;
        instM.casa = `Câmara de ${cidNome}`;
        instM.cap = qtdCadeiras;
      }
    }

    if (typeof S !== "undefined" && S.cong && S.cong.inst) {
      if (S.cong.inst.startsWith("Câmara Municipal") || S.cong.inst.startsWith("Câmara de")) {
        S.cong.inst = `Câmara Municipal de ${cidNome}`;
      }
    }
  }

  if (typeof membrosDaCasa === "function") {
    const _origMembrosDaCasa = membrosDaCasa;
    window.membrosDaCasa = function(cod) {
      const codNorm = { camara: "C", camara_maua: "M", alesp: "E", senado: "S", F: "C" }[cod] || cod;
      if (codNorm === "M") {
        const j = (typeof J === "function") ? J() : null;
        const cidNome = (j && j.municipio_domicilio) || (typeof S !== "undefined" && S.cfg && S.cfg.municipio) || "Mauá";
        const cidObj = DADOS_GRANDE_ABC[cidNome] || DADOS_GRANDE_ABC["Mauá"];
        const cap = cidObj.cadeirasCamara || 23;

        let vers = bancoDeNPCs.filter(n => n && n.vivo && !n.jogador && n.cargo && n.cargo.includes("Vereador") && (n.municipio === cidNome || (cidNome === "Mauá" && (!n.municipio || n.cargo.includes("Mauá"))) || n.cargo.includes(cidNome)));

        while (vers.length < cap) {
          const gen = (typeof gerarPoliticoProcedural === "function")
            ? gerarPoliticoProcedural(`Vereador de ${cidNome}`, "MUNICIPAL", null, { uf: "SP", municipio: cidNome, mandato_fim: 2028 })
            : { id: "ver_" + (cidObj.id||"abc") + "_" + (vers.length + 1), nome: `Vereador(a) ${vers.length + 1} de ${cidNome}`, partido: "PSD", cargo: `Vereador de ${cidNome}`, municipio: cidNome, vivo: true, popularidade: 45, relacao_com_jogador: 10, bancadas: ["Centrão Fisiológico Puro"], papel: `Vereador de ${cidNome}` };
          if (!bancoDeNPCs.some(x => x.id === gen.id || x.nome === gen.nome)) {
            bancoDeNPCs.push(gen);
          }
          vers.push(gen);
        }

        return vers.slice(0, cap);
      }
      return _origMembrosDaCasa(cod);
    };
  }

  if (typeof VIEWS !== "undefined" && VIEWS.cong) {
    const _origViewsCong = VIEWS.cong;
    VIEWS.cong = function() {
      sincronizarCamaraMunicipalNoCongresso();
      return _origViewsCong.apply(this, arguments);
    };
  }

  if (typeof cardQuemManda === "function") {
    const _origCardQuemManda = cardQuemManda;
    window.cardQuemManda = function() {
      try {
        const j = (typeof J === "function") ? J() : null;
        const cidNome = (j && j.municipio_domicilio) || "Mauá";
        const L = [];
        const add = (n, r) => { if (n && typeof pessoa === "function") L.push(pessoa(n, r)); };
        const noCargo = nome => (j && j.cargo_atual === nome) ? Object.assign({}, j, { jogador: true, partido: j.partido_atual }) : bancoDeNPCs.find(n => n.vivo && n.cargo === nome && !n.jogador);

        add(noCargo("Presidente da República"), "Presidente da República");
        add(noCargo("Governador de SP"), "Governador de SP");
        add(noCargo(`Prefeito de ${cidNome}`) || noCargo("Prefeito de Mauá"), `Prefeito de ${cidNome}`);

        ["C", "S", "E", "M"].forEach(cod => {
          try {
            const p = (typeof presidenteDaCasa === "function") ? presidenteDaCasa(cod) : null;
            const papel = (typeof PAPEL_MESA !== "undefined" && PAPEL_MESA[cod]) || "Presidente";
            if (p && !p.jogador) add(p, papel);
            else if (p && p.jogador && j) add(Object.assign({}, j, { jogador: true, partido: j.partido_atual }), papel);
          } catch(e) {}
        });
        return L.length ? card("Quem manda", L.join("")) : "";
      } catch(e) {
        return _origCardQuemManda ? _origCardQuemManda() : "";
      }
    };
  }

  // 9. TELA INICIAL COMPLETA COM UPLOAD DE FOTO REAL E AVATARES
  if (typeof telaInicial === "function") {
    window.telaInicial = function() {
      if (!S.cfg) S.cfg = novoCfg();
      const c = S.cfg;
      const sv = temSave();

      c.municipio = c.municipio || "Mauá";
      const cidObj = DADOS_GRANDE_ABC[c.municipio] || DADOS_GRANDE_ABC["Mauá"];
      const bairrosMun = cidObj.bairros || [];

      if (!bairrosMun.some(b => b.id === c.bairro)) {
        c.bairro = bairrosMun[0] ? bairrosMun[0].id : "zaira";
      }

      const listaMunicipios = Object.keys(DADOS_GRANDE_ABC);

      c.profissao = c.profissao || "advogado";
      const profObj = (typeof PROF_POR_ID !== "undefined" && PROF_POR_ID[c.profissao]) ? PROF_POR_ID[c.profissao] : ((typeof PROFISSOES !== "undefined" && PROFISSOES.find(p=>p.id===c.profissao)) || (typeof PROFISSOES !== "undefined" && PROFISSOES[0]) || { ic:"⚖️", titulo:"Advogado(a)", descr:"Formação jurídica e prática forense.", area:"Jurídica", mod:{} });
      const modTxt = Object.entries(profObj.mod || {}).map(([k,v]) => `${k[0].toUpperCase()+k.slice(1)} ${v>0?'+'+v:v}`).join(", ");
      const fotoCur = c.foto || ((typeof AVATARES_PRESET !== "undefined" && AVATARES_PRESET[0]) ? AVATARES_PRESET[0].svg : "");

      c.inspiracao = c.inspiracao || "ulysses";
      const inspObj = CATALOGO_INSPIRACOES.find(x => x.id === c.inspiracao) || CATALOGO_INSPIRACOES[0];

      return `
        <div class="inicio">
          <div class="urna-topo" style="position:relative">
            <button class="b mini" data-a="toggleTema" title="Alternar Modo Escuro / Claro" style="position:absolute;top:10px;right:12px;z-index:20;border-radius:20px;padding:6px 14px;font-size:0.8rem;font-weight:bold;cursor:pointer;background:rgba(255,255,255,0.12);border:1px solid var(--linha);color:var(--tinta);display:inline-flex;align-items:center;gap:6px">
              ${(document.documentElement.getAttribute("data-theme") || (typeof localStorage !== "undefined" && localStorage.getItem("cadeira_tema"))) === "dark" ? "☀️ Modo Claro" : "🌙 Modo Noturno"}
            </button>
            <div class="lcd lcd-big">
              <div class="lcd-linha">CADEIRA</div>
              <div class="lcd-sub">simulador de poder — universo do Grande ABC ao Planalto</div>
            </div>
          </div>
          ${sv ? card("Você já tem uma carreira em andamento", `<p>Continue de onde parou ou comece uma nova trajetória política.</p><button class="b confirma" data-a="continuar" style="cursor:pointer">Continuar carreira</button>`) : ""}
          
          <!-- ETAPA 1: ORIGEM TERRITORIAL NO GRANDE ABC -->
          ${card("1. Origem Territorial: Onde sua história começa?", `
            <div class="grid2">
              <label class="f">Município de Início (Grande ABC)
                <select data-i="cfg" data-k="municipio">
                  ${listaMunicipios.map(m => `<option value="${m}" ${c.municipio === m ? "selected" : ""}>${m}</option>`).join("")}
                </select>
              </label>

              <label class="f">Seu Bairro / Berço Político
                <select data-i="cfg" data-k="bairro">
                  ${bairrosMun.map(b => `<option value="${b.id}" ${c.bairro === b.id ? "selected" : ""}>${b.nome} (${b.tipo.split("/")[0]})</option>`).join("")}
                </select>
              </label>
            </div>
            <p class="txt" style="font-size:0.8rem;color:#94a3b8;margin-top:6px">
              Seu berço territorial define onde sua militância comunitária começa, sua primeira base de votos fiéis e seu histórico de raízes no Grande ABC.
            </p>
          `)}

          <!-- ETAPA 2: IDENTIDADE & FORMAÇÃO -->
          ${card("2. Identidade & Formação Profissional", `
            <label class="f">Nome Político / Como o povo vai te chamar?
              <input id="cfg-nome" type="text" maxlength="40" placeholder="Ex: Professor Carlos, Doutora Ana, Marcelo..." value="${esc(c.nome || "")}">
            </label>
            <div class="grid2">
              <label class="f">Gênero
                <select data-i="cfg" data-k="sexo">
                  <option value="M" ${c.sexo === "M" ? "selected" : ""}>Masculino</option>
                  <option value="F" ${c.sexo === "F" ? "selected" : ""}>Feminino</option>
                </select>
              </label>
              <label class="f">Idade Inicial
                <select data-i="cfg" data-k="idade">
                  ${[19, 22, 25, 28, 32, 36, 40, 45, 50, 55, 60, 65].map(i => `<option value="${i}" ${c.idade === i ? "selected" : ""}>${i} anos</option>`).join("")}
                </select>
              </label>
            </div>
            <div class="grid2">
              <label class="f">Partido Político ${(typeof renderLogoPartido === "function" && c.partido) ? `<span style="vertical-align:middle;margin-left:6px">${renderLogoPartido(c.partido, 20)}</span>` : ""}
                <select data-i="cfg" data-k="partido">
                  ${PARTIDOS_JOGAVEIS.map(p => `<option value="${p}" ${c.partido === p ? "selected" : ""}>${p}</option>`).join("")}
                </select>
              </label>
              <label class="f">Primeiro Alvo Eleitoral
                <select data-i="cfg" data-k="alvo">
                  ${[`Vereador de ${c.municipio}`, "Deputado Estadual (SP)", "Deputado Federal"].map(p => `<option value="${p}" ${c.alvo === p ? "selected" : ""}>${p}</option>`).join("")}
                </select>
              </label>
            </div>

            <!-- SELETOR DE PROFISSÃO -->
            <div style="margin-top:10px">
              <label class="f">Profissão & Formação Acadêmica (Impacto em Ministérios e Relações)
                <select data-i="cfg" data-k="profissao">
                  ${(typeof PROFISSOES !== "undefined" ? PROFISSOES : []).map(p => `<option value="${p.id}" ${c.profissao === p.id ? "selected" : ""}>${p.ic} ${p.titulo} (${p.area})</option>`).join("")}
                </select>
              </label>
              <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;margin-top:6px">
                <div style="color:#f59e0b;font-weight:bold;font-size:0.85rem">${profObj.ic} ${profObj.titulo}</div>
                <div style="color:#cbd5e1;font-size:0.8rem;margin:2px 0">${profObj.descr}</div>
                ${modTxt ? `<div style="color:#94a3b8;font-size:0.75rem"><b>Bônus passivo:</b> ${modTxt}</div>` : ""}
              </div>
            </div>
          `)}

          <!-- ETAPA 3: RETRATO OFICIAL (FOTO PRÓPRIA OU AVATAR) -->
          ${card("3. Retrato Oficial do Candidato (Foto ou Avatar)", `
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:rgba(0,0,0,0.25);padding:14px;border-radius:12px;border:1px solid var(--linha)">
              <div style="width:72px;height:90px;border-radius:10px;overflow:hidden;border:2px solid var(--destaque,#f1c40f);background:#0f172a;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <img id="cfg-avatar-preview" src="${fotoCur}" style="width:100%;height:100%;object-fit:cover" alt="Foto / Avatar">
              </div>
              <div style="flex:1;min-width:240px">
                <b style="display:block;font-size:0.95rem;margin-bottom:4px;color:#f8fafc">Sua Foto de Campanha</b>
                <p style="font-size:0.8rem;color:#94a3b8;margin:0 0 10px 0">
                  Carregue sua foto real (.png ou .jpg com corte automático) ou selecione um dos avatares estilizados:
                </p>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <label class="b mini confirma" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin:0">
                    📁 Carregar foto do computador
                    <input type="file" id="cfg-avatar-file" accept="image/*" style="display:none">
                  </label>
                  ${c.foto ? btn("❌ Remover foto", "cfgRemoverFoto", [], "mini branco") : ""}
                </div>
              </div>
            </div>

            <div style="margin-top:12px">
              <div style="font-size:0.8rem;font-weight:700;margin-bottom:6px;color:#cbd5e1">Ou escolha um avatar temático:</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${(typeof AVATARES_PRESET !== "undefined" ? AVATARES_PRESET : []).map(av => `
                  <button type="button" class="b mini ${c.foto === av.svg ? "confirma" : "branco"}" data-a="cfgEscolherAvatar" data-p='["${esc(av.id)}"]'>${av.rot}</button>
                `).join("")}
              </div>
            </div>
          `)}

          <!-- ETAPA 4: ESCOLA POLÍTICA & INSPIRAÇÃO HISTÓRICA -->
          ${card("4. Escola Política & Inspiração Histórica", `
            <label class="f">Em quem sua trajetória pública se inspira?
              <select data-i="cfg" data-k="inspiracao">
                ${CATALOGO_INSPIRACOES.map(i => `<option value="${i.id}" ${c.inspiracao === i.id ? "selected" : ""}>${i.nome} — ${i.alcunha}</option>`).join("")}
              </select>
            </label>

            <!-- Card Detalhado da Inspiração Selecionada -->
            <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:8px;padding:12px;margin-top:8px">
              <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px">
                <b style="color:#38bdf8;font-size:1.05rem">${inspObj.nome}</b>
                <span class="tag gray" style="font-size:0.75rem">${inspObj.arquetipo}</span>
              </div>
              <div style="font-size:0.8rem;color:#94a3b8;font-style:italic;margin-top:2px">${inspObj.alcunha}</div>
              <blockquote style="margin:8px 0;padding-left:10px;border-left:3px solid #38bdf8;color:#cbd5e1;font-size:0.85rem;font-style:italic">
                "${inspObj.citacao}"
              </blockquote>
              <p class="txt" style="font-size:0.8rem;color:#cbd5e1;margin:6px 0">${inspObj.descricao}</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
                <div style="background:rgba(34,197,94,0.1);padding:6px 8px;border-radius:6px;border:1px solid rgba(34,197,94,0.3)">
                  <div style="color:#22c55e;font-size:0.75rem;font-weight:bold">Vantagens Históricas:</div>
                  <ul style="margin:2px 0 0 14px;padding:0;font-size:0.72rem;color:#cbd5e1">
                    ${inspObj.pros.map(p => `<li>${p}</li>`).join("")}
                  </ul>
                </div>
                <div style="background:rgba(239,68,68,0.1);padding:6px 8px;border-radius:6px;border:1px solid rgba(239,68,68,0.3)">
                  <div style="color:#ef4444;font-size:0.75rem;font-weight:bold">Desafios & Ônus:</div>
                  <ul style="margin:2px 0 0 14px;padding:0;font-size:0.72rem;color:#cbd5e1">
                    ${inspObj.contras.map(ct => `<li>${ct}</li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
          `)}

          <!-- BOTÃO PRINCIPAL DE INÍCIO -->
          <div style="margin-top:20px;text-align:center">
            <button class="b confirma big" data-a="novo" style="font-size:1.15rem;padding:12px 24px;border-radius:10px;font-weight:bold;cursor:pointer">🏛️ Iniciar Carreira Política no Grande ABC</button>
          </div>
        </div>
      `;
    };
  }

  // 10. NOVO JOGO COM IDENTIDADE TERRITORIAL PERFEITA
  if (typeof novoJogo === "function") {
    const _origNovoJogoABC = novoJogo;
    window.novoJogo = function(cfg) {
      cfg = cfg || (typeof S !== "undefined" && S.cfg) || {};
      const res = _origNovoJogoABC.apply(this, arguments);
      const j = (typeof J === "function") ? J() : null;
      if (j) {
        j.municipio_domicilio = cfg.municipio || "Mauá";
        const cidNome = j.municipio_domicilio;
        const cidObj = DADOS_GRANDE_ABC[cidNome] || DADOS_GRANDE_ABC["Mauá"];

        j.bairro = cfg.bairro || (cidObj.bairros[0] && cidObj.bairros[0].id) || "zaira";
        j.bairro_origem = j.bairro;

        const tObj = TERRITORIOS.find(t => t.id === j.bairro);
        const bairroNome = tObj ? tObj.nome : j.bairro;
        j.naturalidade_completa = `${bairroNome}, ${cidNome} (Grande ABC)`;

        // Foto personalizada
        if (cfg.foto || (S.cfg && S.cfg.foto)) {
          j.foto = cfg.foto || S.cfg.foto;
        }

        // Profissão
        const profId = cfg.profissao || "advogado";
        const profObj = (typeof PROF_POR_ID !== "undefined" && PROF_POR_ID[profId]) ? PROF_POR_ID[profId] : { titulo: "Advogado(a)" };
        j.profissao = profObj.titulo || "Advogado(a)";
        j.profissao_origem = j.profissao;

        // Inspiração
        const inspId = cfg.inspiracao || "ulysses";
        const inspObj = CATALOGO_INSPIRACOES.find(x => x.id === inspId) || CATALOGO_INSPIRACOES[0];
        j.inspiracao = inspObj.nome;
        j.inspiracao_politica = {
          id: inspObj.id,
          nome: inspObj.nome,
          alcunha: inspObj.alcunha,
          arquetipo: inspObj.arquetipo
        };

        // Alvo eleitoral municipalizado
        if (!cfg.alvo || cfg.alvo.startsWith("Vereador")) {
          j.campanha.cargo_alvo = `Vereador de ${cidNome}`;
        }

        // Vista do mapa inicial da cidade
        const keyMap = { "Mauá": "maua", "Santo André": "sa", "São Bernardo do Campo": "sbc", "São Caetano do Sul": "scs", "Diadema": "dia", "Ribeirão Pires": "rp", "Rio Grande da Serra": "rgs" };
        if (typeof S !== "undefined" && S.map) {
          S.map.vista = keyMap[cidNome] || "maua";
          S.map.sel = j.bairro;
        }

        // S.cong.inst = null para que ao entrar no Congresso o jogador veja as 4 Casas Legislativas!
        if (typeof S !== "undefined" && S.cong) {
          S.cong.inst = null;
        }

        // Aprovação inicial
        if (j.aprovacao) {
          j.aprovacao[j.bairro] = 52;
          TERRITORIOS.filter(t => t.grupo === cidNome).forEach(t => {
            if (t.id !== j.bairro) j.aprovacao[t.id] = 28;
          });
        }
      }

      sincronizarCamaraMunicipalNoCongresso();
      return res;
    };
  }

  // 11. CABEÇALHO LCD EXPANDIDO COM ORIGEM, PROFISSÃO E INSPIRAÇÃO
  if (typeof header === "function") {
    const _origHeaderABC = header;
    window.header = function() {
      let h = _origHeaderABC();
      const j = (typeof J === "function") ? J() : null;
      if (!j) return h;

      const cid = j.municipio_domicilio || "Mauá";
      const bObj = TERRITORIOS.find(t => t.id === j.bairro);
      const bNome = bObj ? bObj.nome.replace(/\s*\(.*\)/, "") : (j.bairro || "Centro");
      const prof = j.profissao || "Advogado(a)";
      const insp = (j.inspiracao_politica && j.inspiracao_politica.nome) || j.inspiracao || "Ulysses Guimarães";

      const crachaTerr = `<span class="badge" title="Origem Eleitoral: ${esc(cid)} - ${esc(bNome)}" style="background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#34d399;font-weight:700">📍 ${esc(cid)} - ${esc(bNome)}</span>`;
      const crachaProf = `<span class="badge" title="Formação: ${esc(prof)}" style="background:rgba(245,158,11,0.15);border:1px solid #f59e0b;color:#fbbf24;font-weight:700">⚖️ ${esc(prof)}</span>`;
      const crachaInsp = `<span class="badge" title="Escola Política: ${esc(insp)}" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;font-weight:700">🏛️ ${esc(insp)}</span>`;

      const isDark = (document.documentElement.getAttribute("data-theme") || (typeof localStorage !== "undefined" && localStorage.getItem("cadeira_tema"))) === "dark";
      const btnTema = `<button class="b mini" data-a="toggleTema" title="Alternar Modo Escuro / Claro" style="margin-left:auto;padding:3px 10px;border-radius:14px;font-size:0.75rem;font-weight:bold;cursor:pointer;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:var(--tinta,#f8fafc);display:inline-flex;align-items:center;gap:4px;flex-shrink:0">${isDark ? "☀️ Claro" : "🌙 Noturno"}</button>`;

      if (h.includes('<span class="badges">')) {
        h = h.replace('<span class="badges">', `<span class="badges">${crachaTerr}${crachaProf}${crachaInsp}`);
      }
      h = h.replace(/(<\/div>\s*<div class="chips2">)/, `${btnTema}$1`);
      return h;
    };
  }

  // 12. AÇÕES DE MAPA E AVATAR
  if (typeof A !== "undefined") {
    // Ações de mapa (resilientes a mapvista e mapaVista)
    A.mapvista = function(v) {
      if (typeof S !== "undefined" && S.map) {
        S.map.vista = v;
        S.map.sel = null;
      }
      if (typeof render === "function") render();
    };
    A.mapaVista = A.mapvista;

    A.mapmodo = function(m) {
      if (typeof S !== "undefined" && S.map) {
        S.map.modo = m;
      }
      if (typeof render === "function") render();
    };
    A.mapaModo = A.mapmodo;

    A.mapsel = function(id) {
      if (typeof S !== "undefined" && S.map) {
        S.map.sel = (S.map.sel === id) ? null : id;
      }
      if (typeof render === "function") render();
    };

    // Ações de Avatar
    A.cfgEscolherAvatar = function(id) {
      const presets = (typeof AVATARES_PRESET !== "undefined") ? AVATARES_PRESET : [];
      const av = presets.find(x => x.id === id);
      if (av && S.cfg) {
        S.cfg.foto = av.svg;
        if (typeof toast === "function") toast(`Avatar selecionado: ${av.rot}`, "ok");
        if (typeof render === "function") render();
      }
    };

    A.cfgRemoverFoto = function() {
      if (S.cfg) {
        S.cfg.foto = "";
        if (typeof toast === "function") toast("Foto removida.", "ok");
        if (typeof render === "function") render();
      }
    };

    A.toggleTema = function() {
      const cur = document.documentElement.getAttribute("data-theme") || (typeof localStorage !== "undefined" && localStorage.getItem("cadeira_tema")) || "light";
      const novo = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", novo);
      try { localStorage.setItem("cadeira_tema", novo); } catch(e) {}
      if (typeof toast === "function") toast(novo === "dark" ? "🌙 Modo Noturno ativado." : "☀️ Modo Claro ativado.", "ok");
      if (typeof render === "function") render();
    };
  }

  // 13. LISTENERS DE FORMULÁRIO E UPLOAD DE FOTO
  document.addEventListener("change", function(e) {
    const t = e.target;
    if (!t) return;

    // Upload de foto do computador
    if (t.id === "cfg-avatar-file") {
      const f = t.files && t.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = function() {
        const im = new Image();
        im.onload = function() {
          try {
            const FW = 144, FH = 180;
            const cv = document.createElement("canvas");
            cv.width = FW; cv.height = FH;
            const x = cv.getContext("2d");
            const s = Math.max(FW / im.width, FH / im.height);
            const w = im.width * s, h = im.height * s;
            x.drawImage(im, (FW - w) / 2, (FH - h) / 2, w, h);
            if (typeof S !== "undefined" && S.cfg) {
              S.cfg.foto = cv.toDataURL("image/jpeg", 0.88);
              if (typeof toast === "function") toast("Foto de campanha carregada com sucesso!", "ok");
              if (typeof render === "function") render();
            }
          } catch(err) {
            console.error("Erro ao processar imagem", err);
            if (typeof toast === "function") toast("Erro ao processar foto.", "err");
          }
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
      return;
    }

    // Seletores do formulário de início
    const k = t.dataset && t.dataset.k;
    if (t.dataset && (t.dataset.i === "cfg" || t.dataset.i === "cfgMun" || t.dataset.i === "cfgInsp")) {
      if (typeof S !== "undefined" && S.cfg) {
        if (k === "municipio") {
          S.cfg.municipio = t.value;
          const cid = DADOS_GRANDE_ABC[t.value];
          if (cid && cid.bairros && cid.bairros[0]) {
            S.cfg.bairro = cid.bairros[0].id;
          }
          S.cfg.alvo = `Vereador de ${t.value}`;
          if (typeof render === "function") render();
        } else if (k === "bairro") {
          S.cfg.bairro = t.value;
          if (typeof render === "function") render();
        } else if (k === "profissao") {
          S.cfg.profissao = t.value;
          if (typeof render === "function") render();
        } else if (k === "inspiracao") {
          S.cfg.inspiracao = t.value;
          if (typeof render === "function") render();
        }
      }
    }
  }, true);

  // Preservar texto digitado no nome ao mudar opções
  document.addEventListener("input", function(e) {
    const t = e.target;
    if (t && t.id === "cfg-nome" && typeof S !== "undefined" && S.cfg) {
      S.cfg.nome = t.value;
    }
  }, true);

  // 14. HOOKS DE SEGURANÇA E RETROCOMPATIBILIDADE
  if (typeof painelTerr === "function") {
    const _origPainelTerr = painelTerr;
    window.painelTerr = function(tid) {
      const j = (typeof J === "function") ? J() : null;
      if (j && j.aprovacao && j.aprovacao[tid] == null) {
        j.aprovacao[tid] = 25;
      }
      if (j && j.campanha && j.campanha.trafego && j.campanha.trafego[tid] == null) {
        j.campanha.trafego[tid] = 0;
      }
      return _origPainelTerr(tid);
    };
  }

  if (typeof corTerr === "function") {
    const _origCorTerr = corTerr;
    window.corTerr = function(tid) {
      const t = TERRITORIOS.find(x => x.id === tid);
      if (!t) return "fill:rgba(56,189,248,0.3);stroke:#38bdf8";
      return _origCorTerr(tid);
    };
  }

  // 14. OTIMIZAÇÃO CRÍTICA DE DESEMPENHO NO AVANÇO DE TURNO (FAST SAVE & PRUNING)
  if (typeof snapshot === "function") {
    const _origSnapshotABC = snapshot;
    window.snapshot = function() {
      const fotosEmb = window._fotosEmbutidasMap || (function(){
        try {
          const el = document.getElementById("fotos-embutidas");
          const raw = el ? JSON.parse(el.textContent) : {};
          return raw.porNome || raw || {};
        } catch(e) { return {}; }
      })();

      // Desduplicar fotos estáticas embutidas para reduzir o snapshot de 4.3MB para < 800KB
      // As fotos continuam funcionando 100% via obterFotoPolitico() e fotoTag() que buscam em fotos-embutidas
      const npcsClean = (typeof bancoDeNPCs !== "undefined" && Array.isArray(bancoDeNPCs)) ? bancoDeNPCs.map(n => {
        if (n && n.foto && (fotosEmb[n.nome] || (n.real && !n.foto_customizada))) {
          const copy = Object.assign({}, n);
          delete copy.foto;
          return copy;
        }
        return n;
      }) : bancoDeNPCs;

      return JSON.stringify({ gameState, bancoDeNPCs: npcsClean, v: 1 });
    };
  }

  if (typeof salvar === "function") {
    window.salvar = function() {
      try { if (typeof podarMundo === "function") podarMundo(); } catch(e) {}
      const s = (typeof window.snapshot === "function") ? window.snapshot() : snapshot();
      _memSave = s;
      let ok = false;
      try {
        // Se o snapshot tiver menos de 1.8MB, salva direto em JSON instantâneo (economiza 2 a 4 segundos de CPU com LZString)
        let out = s;
        if (s.length > 1800000 && typeof LZString !== "undefined") {
          out = "LZ:" + LZString.compressToUTF16(s);
        }
        const sk = (typeof slotKey === "function" && typeof SLOT !== "undefined") ? slotKey(SLOT) : SAVE_KEY;
        localStorage.setItem(sk, out);
        if (typeof SLOT !== "undefined") {
          localStorage.setItem("cadeira_slot", String(SLOT));
          const meta = { n: (typeof J === "function" && J()) ? J().nome : "Candidato", a: dt().ano, m: dt().mes, c: (typeof J === "function" && J()) ? J().cargo_atual : "", g: gameState.geracao || 1, q: Date.now() };
          localStorage.setItem("cadeira_meta_" + SLOT, JSON.stringify(meta));
        }
        ok = true;
      } catch(e) {
        // Fallback com compressão caso exceda cota de localStorage
        try {
          if (typeof LZString !== "undefined") {
            const out = "LZ:" + LZString.compressToUTF16(s);
            const sk = (typeof slotKey === "function" && typeof SLOT !== "undefined") ? slotKey(SLOT) : SAVE_KEY;
            localStorage.setItem(sk, out);
            ok = true;
          }
        } catch(err2) { ok = false; }
      }
      window.__saveOK = ok;
      return ok;
    };
  }

  // Sincronização explícita de escopo global
  try {
    if (window.header) header = window.header;
    if (window.telaInicial) telaInicial = window.telaInicial;
    if (window.novoJogo) novoJogo = window.novoJogo;
    if (window.vMapa) { vMapa = window.vMapa; VIEWS.mapa = window.vMapa; }
    if (window.svgMapa) svgMapa = window.svgMapa;
    if (window.snapshot) snapshot = window.snapshot;
    if (window.salvar) salvar = window.salvar;
  } catch(e) { console.warn("Sync ABC error:", e); }

})();
