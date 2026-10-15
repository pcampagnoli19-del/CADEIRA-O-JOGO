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
        { id: "santa_luzia", nome: "Jardim Caçula & Santa Luzia", el: 30, pautaPredom: "aux", tipo: "Periferia serrana", desc: "Região com relevo acentuado e forte atuação de associações locais." },
        { id: "oiti", nome: "Quarta Divisão & Represa", el: 25, pautaPredom: "eco", tipo: "Ambiental / Chácaras", desc: "Área de mananciais, turismo ecológico e chácaras de recreio." }
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
        { id: "oasis", nome: "Jardim Oasis & Pedreira", el: 8, pautaPredom: "eco", tipo: "Mananciais / Ambiental", desc: "Cercado por matas nativas, orla das represas e ecologia preservada." }
      ],
      programasGoverno: [
        { id: "eco_mananciais_rgs", nome: "Preservação das Águas & Saneamento Ecológico", custo: 250000, desc: "Drenagem sustentável sem agredir a Represa Billings.", impacto: { pop: 5 } },
        { id: "saude_itinerante_rgs", nome: "Carreta da Saúde nos Bairros Serranos", custo: 300000, desc: "Consultas com especialistas nos bairros afastados do Centro.", impacto: { pop: 6 } }
      ]
    }
  };
  window.DADOS_GRANDE_ABC = DADOS_GRANDE_ABC;

  // 3. CATÁLOGO COMPLETO DE ESCOLAS POLÍTICAS & INSPIRAÇÕES HISTÓRICAS
  // 3. CATÁLOGO COMPLETO DE ESCOLAS POLÍTICAS & INSPIRAÇÕES HISTÓRICAS
  // Eixos ideológicos usados para organizar e filtrar a galeria de inspirações.
  const EIXOS_INSPIRACAO = [
    { id: "todos",          nome: "Todas",                              ic: "✦" },
    { id: "estatista",      nome: "Estatuístas & Desenvolvimentistas",  ic: "🏛️" },
    { id: "trabalhista",    nome: "Trabalhistas & Esquerda Popular",    ic: "🧑‍🏭" },
    { id: "revolucionario", nome: "Revolucionários",                    ic: "✊" },
    { id: "republicano",    nome: "Republicanos & Conciliadores",       ic: "📜" },
    { id: "liberal",        nome: "Liberais & de Mercado",              ic: "📈" },
    { id: "nacionalista",   nome: "Nacionalistas & Soberanos",          ic: "🦅" },
    { id: "juridico",       nome: "Juristas & Legalistas",              ic: "⚖️" },
    { id: "humanista",      nome: "Educadores & Humanistas",            ic: "📚" },
    { id: "populista",      nome: "Populistas & Obras",                 ic: "🚧" },
    { id: "propria",        nome: "Identidade Própria",                 ic: "✨" }
  ];
  const EIXO_POR_ID = {};
  EIXOS_INSPIRACAO.forEach(e => { EIXO_POR_ID[e.id] = e; });

  const CATALOGO_INSPIRACOES = [
    {
      id: "getulio",
      nome: "Getúlio Vargas",
      alcunha: "O Arquiteto do Estado",
      eixo: "estatista",
      arquetipo: "Nacional-Estatista & Pai dos Pobres",
      citacao: "Trabalhadores do Brasil: nada receio, passo da história para entrar na eternidade.",
      descricao: "O mais influente estadista da era republicana, criador das bases da legislação trabalhista, da indústria de base nacional e da burocracia estatal moderna.",
      pros: ["+40% lealdade das centrais sindicais e da classe trabalhadora urbana.", "Eficiência ampliada em investimentos estatais e grandes indústrias de base."],
      contras: ["Oposição intransigente e polarização extrema com a elite financeira e o jornalismo liberal.", "Risco elevado de conspirações institucionais e motins militares em momentos de crise."]
    },
    {
      id: "jk",
      nome: "Juscelino Kubitschek",
      alcunha: "O Presidente do Desenvolvimento",
      eixo: "estatista",
      arquetipo: "Desenvolvimentista Arrojado & Otimista",
      citacao: "Cinquenta anos de progresso em cinco anos de governo.",
      descricao: "O mandatário da audácia construtora, do Plano de Metas e da fundação de Brasília, personificando o otimismo econômico e a atração de capital global.",
      pros: ["+50% velocidade na aprovação e entrega de grandes projetos de infraestrutura.", "Bônus no moral popular e atração expressiva de investimento externo direto."],
      contras: ["Pressão inflacionária severa e crescimento exponencial do endividamento público no médio prazo."]
    },
    {
      id: "jango",
      nome: "João Goulart",
      alcunha: "O Reformista Trabalhista",
      eixo: "trabalhista",
      arquetipo: "Trabalhismo Distributivo & Reformas de Base",
      citacao: "Não se pode admitir um país onde a maioria passa fome para que uma minoria viva na opulência.",
      descricao: "Defensor incansável das Reformas de Base (agrária, urbana e educacional), com foco absoluto na redistribuição de renda e soberania popular.",
      pros: ["+45% mobilização de camponeses, movimentos de moradia e ligas sindicais.", "Redução substancial de indicadores de desigualdade social na implementação de políticas públicas."],
      contras: ["Alerta máximo de desconfiança das Forças Armadas e de grandes conglomerados latifundiários.", "Fuga de capitais sob qualquer sinal de endurecimento retórico."]
    },
    {
      id: "janio",
      nome: "Jânio Quadros",
      alcunha: "O Fenômeno Eleitoral",
      eixo: "populista",
      arquetipo: "Moralista Carismático & Política Não Alinhada",
      citacao: "Varrer a corrupção deste país com a vassoura da decência e da soberania.",
      descricao: "Arrebatador de multidões e campeão das urnas impulsionado pelo combate à corrupção, personalismo teatral e diplomacia externa independente.",
      pros: ["+50% apelo com a classe média urbana e eleitorado independente em períodos de campanha.", "Habilidade diplomática única para negociar vantagens com blocos ideológicos opostos."],
      contras: ["Dificuldade crônica de sustentar coalizões de governo estáveis no Parlamento.", "Volatilidade nas crises: alto risco de isolamento político total."]
    },
    {
      id: "lacerda",
      nome: "Carlos Lacerda",
      alcunha: "O Tribuno da Oposição",
      eixo: "liberal",
      arquetipo: "Orador Incendiário & Cruzada Antiestadista",
      citacao: "Não pode ser candidato; se for, não pode ser eleito; se eleito, não pode tomar posse; se tomar posse, não pode governar.",
      descricao: "A mais temida voz da oposição brasileira, mestre da demolição retórica na imprensa e mobilizador ferrenho da classe média conservadora.",
      pros: ["Dano crítico ampliado a escândalos que atinjam governistas rivais na opinião pública.", "+40% cobertura de mídia espontânea e engajamento combativo da militância civil."],
      contras: ["Impossibilidade quase total de costurar pactos de governabilidade de centro-esquerda.", "Clima contínuo de confronto fratricida que deteriora a estabilidade institucional."]
    },
    {
      id: "arraes",
      nome: "Miguel Arraes",
      alcunha: "O Líder Popular Nordestino",
      eixo: "trabalhista",
      arquetipo: "Socialismo Democrático & Sertanejo Popular",
      citacao: "Nenhum homem é livre enquanto tiver fome; a dignidade começa com o chão para plantar.",
      descricao: "Símbolo da conscientização das massas rurais e das periferias do Nordeste, pioneiro do Acordo do Campo e das políticas de interiorização da cidadania.",
      pros: ["Domínio incontestável de lealdade eleitoral em zonas rurais e bolsões de vulnerabilidade.", "+30% eficácia em projetos comunitários de eletrificação, água e agricultura familiar."],
      contras: ["Resistência agressiva de oligarquias regionais tradicionais e cartéis do agronegócio."]
    },
    {
      id: "darcy",
      nome: "Darcy Ribeiro",
      alcunha: "O Educador dos Povos",
      eixo: "humanista",
      arquetipo: "Antropólogo Humanista & Intelectual Indigenista",
      citacao: "Se os governantes não construírem escolas hoje, faltará dinheiro para construir presídios amanhã.",
      descricao: "Intelectual apaixonado pelo povo brasileiro, idealizador de universidades, dos CIEPs de tempo integral e guardião incansável das causas indígenas.",
      pros: ["+40% prestígio em setores acadêmicos, culturais e conselhos de preservação ambiental/indígena.", "Rendimento dobrado na área de desenvolvimento humano ao construir escolas públicas."],
      contras: ["Conflito inevitável com a bancada ruralista e mineradoras em disputas territoriais.", "Despesas de manutenção orçamentária dos aparelhos educacionais exigem gestão fiscal refinada."]
    },
    {
      id: "ulysses",
      nome: "Ulysses Guimarães",
      alcunha: "O Senhor Diretas",
      eixo: "republicano",
      arquetipo: "Constitucionalista Cívico & Pacificador Republicano",
      citacao: "Traidor da pátria é traidor da Constituição: conhecemos o caminho do desterro, não temos medo de cara feia.",
      descricao: "Comandante civil da redemocratização, presidente da Constituinte de 1988 e a maior referência de coragem democrática contra o autoritarismo.",
      pros: ["Poder supremo de articulação multipartidária e blindagem quase absoluta à ordem constitucional.", "+35% apoio no plenário do Congresso em reformas de direitos cívicos."],
      contras: ["Gestão morosa decorrente da necessidade perpétua de construir amplos consensos parlamentares."]
    },
    {
      id: "tancredo",
      nome: "Tancredo Neves",
      alcunha: "O Mestre da Conciliação",
      eixo: "republicano",
      arquetipo: "Centrista Diplomático & Pacificador de Crises",
      citacao: "A primeira qualidade de um homem público é a paciência para ouvir e a arte de conciliar o inconciliável.",
      descricao: "O maior fiador de transições suaves da história nacional, capaz de dialogar com ditadores e revolucionários na mesma tarde sem perder a compostura.",
      pros: ["+45% tolerância e capacidade de acomodar partidos de espectros opostos na mesma base aliada.", "Neutralização eficaz de ameaças de golpes de Estado e fissuras institucionais."],
      contras: ["Cobrança pública de lentidão e ausência de reformas estruturais de choque."]
    },
    {
      id: "brizola",
      nome: "Leonel Brizola",
      alcunha: "O Caudilho da Legalidade",
      eixo: "trabalhista",
      arquetipo: "Trabalhista Combativo & Educação Integral",
      citacao: "A educação é a única revolução que não derrama sangue, mas liberta um povo.",
      descricao: "Líder histórico da Cadeia da Legalidade e defensor fervoroso da escola pública de tempo integral (CIEPs). Oratória arrebatadora e mobilização das massas populares.",
      pros: ["+35% entusiasmo em comícios de rua e palanques populares.", "Facilidade imensa na mobilização das bases operárias."],
      contras: ["Oposição figadal dos grandes conglomerados de mídia e sistema financeiro."]
    },
    {
      id: "montoro",
      nome: "Franco Montoro",
      alcunha: "O Municipalista Comunitário",
      eixo: "republicano",
      arquetipo: "Democrata-Cristão & Descentralizador Cívico",
      citacao: "As pessoas não vivem na União, nem nos Estados: as pessoas vivem nos Municípios.",
      descricao: "Governador da abertura democrática em São Paulo, pioneiro no fortalecimento das prefeituras, orçamentos participativos e conselhos de base comunitária.",
      pros: ["+35% lealdade e velocidade de entrega dos prefeitos e vereadores da base aliada.", "Redução substancial de custos burocráticos e corrupção em licitações descentralizadas."],
      contras: ["Menor poder de intervenção concentrada direta do executivo central em planos macrorregionais."]
    },
    {
      id: "mario_covas",
      nome: "Mário Covas",
      alcunha: "O Firme & Austero",
      eixo: "republicano",
      arquetipo: "Social-Democrata Firme & Austero",
      citacao: "Não há mal que dure para sempre, e nem há bem que não se possa conquistar com luta e coragem.",
      descricao: "Governador histórico de São Paulo conhecido pela austeridade fiscal intransigente, coragem cívica e enfrentamento direto de crises olho no olho.",
      pros: ["Imunidade sólida contra acusações de corrupção pessoal.", "+30% autoridade moral em momentos de calamidade e motins."],
      contras: ["Conflito frequente com setores fisiológicos que exigem balcão de negócios."]
    },
    {
      id: "fhc",
      nome: "Fernando Henrique Cardoso",
      alcunha: "O Construtor do Real",
      eixo: "liberal",
      arquetipo: "Social-Liberal Cosmopolita & Tecnoburocrata",
      citacao: "O Brasil precisa de rumo, de modernização institucional e de fim da fantasia inflacionária.",
      descricao: "Arquiteto do Plano Real, sociólogo de renome internacional e responsável pela ancoragem da moeda, privatizações e modernização do Estado brasileiro.",
      pros: ["Alta credibilidade imediata junto a investidores internacionais e agências de crédito.", "Eficiência ampliada em programas de controle inflacionário e estabilização de preços."],
      contras: ["Resistência crônica e mobilização permanente de sindicatos públicos contrários a concessões e privatizações."]
    },
    {
      id: "eneas",
      nome: "Enéas Carneiro",
      alcunha: "A Voz Nacionalista Soberana",
      eixo: "nacionalista",
      arquetipo: "Nacionalista Doutrinário & Conservador Patriótico",
      citacao: "O Brasil tem riqueza incomensurável, mas é submetido aos ditames do sistema financeiro internacional por covardia de suas elites!",
      descricao: "Médico, matemático e líder do PRONA, famoso pela retórica fulminante na televisão defendendo a posse das riquezas minerais, Forças Armadas e soberania científica.",
      pros: ["Bônus expressivo em engajamento espontâneo de militância nacionalista por minuto de propaganda.", "+40% eficiência em investimentos nas indústrias bélica, nuclear e de pesquisa mineral (como nióbio)."],
      contras: ["Dificuldade severa para costurar consensos no parlamento por aversão a acordos tradicionais."]
    },
    {
      id: "lula",
      nome: "Luiz Inácio Lula da Silva",
      alcunha: "O Filho de São Bernardo",
      eixo: "trabalhista",
      arquetipo: "Liderança Sindical & Negociador Popular",
      citacao: "A fome não é uma fatalidade da natureza, a fome é fruto da falta de vergonha na cara de quem governa este país.",
      descricao: "Maior líder de massas do movimento operário moderno, mestre na arte da negociação política de gabinete e criador de amplas políticas de transferência de renda.",
      pros: ["Carisma popular massivo com as camadas de menor renda da sociedade.", "Capacidade superior de conciliar interesses sindicais com grandes corporações empresariais."],
      contras: ["Desconfiança crônica e resistência permanente da classe média alta e de setores de imprensa tradicional."]
    },
    {
      id: "ruth",
      nome: "Ruth Cardoso",
      alcunha: "A Intelectual da Sociedade",
      eixo: "humanista",
      arquetipo: "Cientista Social & Inovadora de Redes Comunitárias",
      citacao: "O assistencialismo humilha; a comunidade mobilizada emancipa e transforma o cidadão.",
      descricao: "Antropóloga e líder social pioneira do Comunidade Solidária, criadora do conceito de parceria entre governo, ONGs e iniciativa privada sem clientelismo.",
      pros: ["+40% impacto e aprovação pública em projetos sociais com o terceiro setor e conselhos cidadãos.", "Facilidade de trânsito em fóruns científicos e organizações internacionais de fomento."],
      contras: ["Sofre sabotagem de caciques partidários habituados ao uso eleitoreiro de verbas sociais."]
    },
    {
      id: "teotonio",
      nome: "Teotônio Vilela",
      alcunha: "O Menestrel da Liberdade",
      eixo: "republicano",
      arquetipo: "Aristocrata Convertido à Causa Democrática",
      citacao: "Eu era um cego na política; abri meus olhos para o sofrimento do povo e nunca mais me calarei.",
      descricao: "Senador alagoano que rompeu com as elites dominantes para se tornar a voz mais comovente da Anistia e da defesa dos perseguidos políticos no Brasil.",
      pros: ["+35% poder de convencimento sobre opositores moderados e parlamentares indecisos.", "Alta respeitabilidade moral entre dissidentes, intelectuais e juristas."],
      contras: ["Rompimento traumático e rancor duradouro das oligarquias regionais das quais emergiu."]
    },
    {
      id: "dante",
      nome: "Dante de Oliveira",
      alcunha: "O Símbolo das Diretas",
      eixo: "republicano",
      arquetipo: "Jovem Parlamentar & Catalisador de Ruas",
      citacao: "Quando a vontade do povo ganha as ruas, o Parlamento não tem o direito de trancar a porta.",
      descricao: "Jovem deputado que colocou o regime militar contra a parede ao redigir a emenda constitucional que originou a maior mobilização cívica do país: as Diretas Já.",
      pros: ["Multiplicador elevado no comparecimento público em manifestações e protestos cívicos pacíficos.", "Bônus no apoio da juventude e de lideranças estudantis."],
      contras: ["Vulnerável a manobras regimentais e bloqueios processuais de caciques veteranos de plenário."]
    },
    {
      id: "afonso_arinos",
      nome: "Afonso Arinos",
      alcunha: "O Parlamentarista Liberal",
      eixo: "juridico",
      arquetipo: "Liberal-Constitucional & Pioneiro dos Direitos Civis",
      citacao: "A lei não pode ser omissa diante do preconceito; a igualdade perante o Estado é dever civil inegociável.",
      descricao: "Jurista de refinada erudição liberal, autor da primeira lei antidiscriminação racial no Brasil e paladino da separação de poderes equilibrada.",
      pros: ["Facilidade na aprovação de legislações com sólida consistência técnica perante tribunais superiores.", "Bônus de legitimidade republicana e estabilidade institucional nos códigos jurídicos."],
      contras: ["Discurso excessivamente formalista com pouca penetração emocional no eleitorado de massas."]
    },
    {
      id: "sobral",
      nome: "Sobral Pinto",
      alcunha: "O Jurista da Liberdade",
      eixo: "juridico",
      arquetipo: "Guerreiro Constitucional & Ética Católica Rígida",
      citacao: "A advocacia não é profissão de covardes; defenderei a lei mesmo para aqueles de quem discordo radicalmente.",
      descricao: "O mais reverenciado advogado da história brasileira, defensor tanto de comunistas quanto de conservadores nos períodos mais sombrios da repressão.",
      pros: ["+50% resistência a abusos institucionais, prisões arbitrárias ou estados de sítio.", "Imunidade máxima contra acusações de hipocrisia partidária ou casuísmo."],
      contras: ["Rigor ético inflexível: recusa completa a fazer concessões pragmáticas de bastidor."]
    },
    {
      id: "san_tiago",
      nome: "San Tiago Dantas",
      alcunha: "O Diplomata Reformista",
      eixo: "nacionalista",
      arquetipo: "Estrategista Parlamentar & Política Externa Independente",
      citacao: "Um país com a nossa grandeza não aceita alinhamentos subservientes; afirma sua própria voz no mundo.",
      descricao: "Ministro das Relações Exteriores e da Fazenda, arquiteto da Política Externa Independente (PEI) e formulador de reformas institucionais com rigor técnico.",
      pros: ["Capacidade superior de negociação de dívidas externas e abertura de novos polos de exportação.", "+30% eficiência legislativa na elaboração de reformas tributárias complexas."],
      contras: ["Pressão combinada de potências hegemônicas e setores conservadores desconfiados da multipolaridade."]
    },
    {
      id: "celso",
      nome: "Celso Furtado",
      alcunha: "O Estrategista do Desenvolvimento",
      eixo: "estatista",
      arquetipo: "Economista Estruturalista & Campeão Regional",
      citacao: "O subdesenvolvimento não é uma etapa do desenvolvimento; é uma criação estrutural que exige intervenção corajosa.",
      descricao: "O maior teórico da economia brasileira moderna, idealizador da SUDENE e formulador do Plano Trienal de combate às disparidades regionais.",
      pros: ["Redução sensível da desigualdade entre regiões do país com foco no Nordeste.", "Eficiência multiplicada no planejamento plurianual e em agências de desenvolvimento regional."],
      contras: ["Oposição aguerrida da ortodoxia financeira e do mercado de capitais a políticas intervencionistas."]
    },
    {
      id: "darcy_vargas",
      nome: "Darcy Vargas",
      alcunha: "A Construtora da Ação Social",
      eixo: "humanista",
      arquetipo: "Matriarca da Assistência & Solidariedade Voluntária",
      citacao: "Onde houver uma dor que o Estado não alcançou, ali deve estar a mão fraterna do voluntariado.",
      descricao: "Primeira-dama pioneira na criação de redes nacionais de assistência com a Legião Brasileira de Assistência (LBA), mobilizando mulheres e socorrendo famílias durante a Segunda Guerra.",
      pros: ["+40% mobilização da caridade civil, entidades religiosas e do voluntariado comunitário.", "Mitigação substancial do descontentamento civil em períodos de escassez e racionamento."],
      contras: ["Risco de paternalismo e dependência nas relações entre sociedade e poder executivo."]
    },
    {
      id: "roberto_campos",
      nome: "Roberto Campos",
      alcunha: "O Economista Liberal",
      eixo: "liberal",
      arquetipo: "Liberal Ortodoxo & Reformador de Mercado",
      citacao: "O atraso do Brasil é uma questão de escolha: teimamos em preferir a retórica mágica às leis universais da economia.",
      descricao: "Coautor do Plano de Ação Econômica do Governo (PAEG), fundador do Banco Central e principal polemista contra o estatismo burocrático no país.",
      pros: ["+35% velocidade na modernização financeira, desregulamentação e controle da dívida fiscal.", "Aprovação irrestrita das praças financeiras e do FMI para captação de recursos."],
      contras: ["Reação imediata de repúdio de corporações de servidores públicos e correntes nacionalistas."]
    },
    {
      id: "capanema",
      nome: "Gustavo Capanema",
      alcunha: "O Arquiteto Institucional",
      eixo: "humanista",
      arquetipo: "Modernizador da Educação & Mecenas do Estado Novo",
      citacao: "A educação e a cultura são as colunas de sustentação pelas quais se forja a alma de uma nacionalidade.",
      descricao: "O mais longevo Ministro da Educação do Brasil, formulador das Leis Orgânicas do Ensino, mecenas do modernismo arquitetônico e fundador do patrimônio histórico nacional.",
      pros: ["Estruturação rápida de Ministérios e órgãos culturais de alta durabilidade e eficiência burocrática.", "Apoio e protagonismo da vanguarda artística e intelectual na construção da imagem pública do governo."],
      contras: ["Tendência centralizadora excessiva: atritos com a autonomia das redes municipais de ensino."]
    },
    {
      id: "aureliano",
      nome: "Aureliano Chaves",
      alcunha: "O Mineiro da Moderação",
      eixo: "republicano",
      arquetipo: "Engenheiro Nacional & Conciliador Silencioso",
      citacao: "O poder deve ser exercido com sobriedade técnica e honradez cívica, sem fogos de artifício.",
      descricao: "Vice-presidente, governador de Minas Gerais e Ministro de Minas e Energia; o fiador de estabilidade que comandou a transição da Ditadura Militar para a Nova República sem rupturas violentas.",
      pros: ["Amplo respeito da corporação militar aliada a interlocução produtiva com o centro democrático.", "Avanço técnico sólido em projetos estratégicos de energia (como o Proálcool e usinas nucleares)."],
      contras: ["Estilo contido e avesso ao personalismo, limitando o apelo eleitoral direto em disputas de massa."]
    },
    {
      id: "magalhaes",
      nome: "Magalhães Pinto",
      alcunha: "O Articulador Mineiro",
      eixo: "liberal",
      arquetipo: "Banqueiro Maquinador & Estrategista de Bastidores",
      citacao: "Política é como nuvem: você olha e ela está de um jeito; olha de novo e ela já mudou.",
      descricao: "Governador de Minas Gerais, banqueiro fundador do Banco Nacional e mestre incomparável das manobras políticas ocultas e financiamento de campanhas.",
      pros: ["Capacidade superior de arrecadação financeira para campanhas e compra de fidelidade partidária.", "+40% antecipação e infiltração nos planos de facções adversárias."],
      contras: ["Desconfiança constante de aliados em relação à sua real fidelidade nos momentos de crise aguda."]
    },
    {
      id: "nereu",
      nome: "Nereu Ramos",
      alcunha: "O Homem da Transição",
      eixo: "republicano",
      arquetipo: "Garantidor Institucional & Estado de Defesa",
      citacao: "O dever maior do homem público não é cultivar aplausos, mas assegurar a entrega pacífica do poder.",
      descricao: "O presidente que assumiu a República no turbilhão de 1955, manteve o Estado de Sítio preventivo e assegurou, sob fogo cruzado, a posse legítima de JK.",
      pros: ["Estabilidade e bônus defensivo durante transições de mandato ou trocas repentinas de chefia de Estado.", "Neutralização ágil de quarteladas e conspirações de gabinete em semanas críticas."],
      contras: ["Custo político elevado por medidas duras de controle policial temporário da ordem pública."]
    },
    {
      id: "osvaldo_aranha",
      nome: "Osvaldo Aranha",
      alcunha: "O Estadista Diplomático",
      eixo: "nacionalista",
      arquetipo: "Diplomata Global & Orador Cosmopolita",
      citacao: "A justiça entre as nações é o único alicerce verdadeiro sobre o qual repousa a paz universal.",
      descricao: "Presidente da Assembleia Geral da ONU na votação que criou o Estado de Israel, articulador da Revolução de 1930 e fiador da aliança estratégica brasileira na Segunda Guerra.",
      pros: ["Projeção diplomática máxima do Brasil nas Nações Unidas e tribunais de arbitragem internacional.", "Habilidade excepcional na negociação de tarifas comerciais e cooperação estratégica com potências globais."],
      contras: ["Risco de desgaste na política interna provinciana por foco prioritário na arena internacional."]
    },
    {
      id: "bonifacio",
      nome: "José Bonifácio",
      alcunha: "O Patriarca da Independência",
      eixo: "estatista",
      arquetipo: "Estadista Iluminista & Fundador do Império",
      citacao: "A nação não se improvisa: requer leis severas, a redenção dos cativos e o domínio sobre nosso próprio solo.",
      descricao: "Cientista mineralogista e mente mestra por trás da Independência do Brasil; o primeiro pensador a propor a abolição da escravidão, a proteção indígena e a capital no interior.",
      pros: ["+50% firmeza de comando contra tentativas de secessão ou insurreição regional.", "Eficiência redobrada na consolidação de novas constituições e Códigos de Leis Fundamentais."],
      contras: ["Temperamento intempestivo e impaciência que geram inimigos mortais na corte legislativa."]
    },
    {
      id: "nabuco",
      nome: "Joaquim Nabuco",
      alcunha: "O Abolicionista Diplomata",
      eixo: "juridico",
      arquetipo: "Abolicionista Moral & Embaixador Cultural",
      citacao: "A escravidão permanecerá por muito tempo como a característica nacional do Brasil se não a expurgarmos pela raiz.",
      descricao: "O mais brilhante tribuno da causa abolicionista no Parlamento Imperial e embaixador em Washington, que provou que a justiça social é a única base viável para a civilização.",
      pros: ["Facilidade na aprovação de reformas humanitárias, inclusivas e de direitos fundamentais.", "+40% reputação do país perante chancelarias de nações democráticas ocidentais."],
      contras: ["Confronto direto e hostilidade ferrenha com setores agroexportadores tradicionais e conservadores."]
    },
    {
      id: "ruy_barbosa",
      nome: "Ruy Barbosa",
      alcunha: "O Águia de Haia",
      eixo: "juridico",
      arquetipo: "Jurista Imortal & Paladino da Legalidade",
      citacao: "De tanto ver triunfar as nulidades, o homem chega a desanimar-se da virtude, a rir-se da honra e a ter vergonha de ser honesto.",
      descricao: "A maior erudição jurídica da Primeira República, redator da Constituição de 1891, consagrado internacionalmente na Conferência de Haia defendendo a igualdade jurídica entre nações.",
      pros: ["+45% autoridade perante o Supremo Tribunal e colegiados de juristas.", "Habilidade sem igual de desmantelar acusações legais e pedidos de impeachment por meios retóricos."],
      contras: ["Vulnerável no plano prático a esquemas de compra de votos e coronelismo eleitoral de base."]
    },
    {
      id: "rio_branco",
      nome: "Barão do Rio Branco",
      alcunha: "O Diplomata das Fronteiras",
      eixo: "nacionalista",
      arquetipo: "Geopolítico Imutável & Patrono das Fronteiras",
      citacao: "Em todas as minhas ações, procurei unicamente servir ao Brasil com a verdade dos fatos e a honra das leis.",
      descricao: "O chanceler imortal que anexou centenas de milhares de quilômetros quadrados ao território nacional (incluindo o Acre) apenas com mapas históricos, perícia jurídica e diplomacia pacífica.",
      pros: ["Resolução de conflitos territoriais, litígios de recursos naturais e fronteiras sem disparo de um único tiro.", "Consenso suprapartidário: aprovação automática da política externa no Parlamento."],
      contras: ["Nenhuma aptidão ou interesse em interferir na política partidária doméstica e no dia a dia econômico."]
    },
    {
      id: "prestes",
      nome: "Luís Carlos Prestes",
      alcunha: "O Cavaleiro da Esperança",
      eixo: "revolucionario",
      arquetipo: "Comunista Revolucionário & Líder da Marcha",
      citacao: "A revolução não é obra de aventureiros, mas a necessidade imperiosa das massas que despertam.",
      descricao: "O lendário comandante da Coluna Prestes que marchou 25.000 quilômetros pelo interior do país e se transformou no secretário-geral histórico do Partido Comunista Brasileiro.",
      pros: ["Moral de ferro e dedicação inabalável das bases operárias e núcleos revolucionários.", "Resistência total a períodos prolongados de perseguição política, censura ou clandestinidade."],
      contras: ["Demonização constante por parte do establishment econômico, Forças Armadas e Igreja tradicional."]
    },
    {
      id: "marighella",
      nome: "Carlos Marighella",
      alcunha: "O Revolucionário da Resistência",
      eixo: "revolucionario",
      arquetipo: "Guerrilheiro de Ação Direta & Vanguarda Urbana",
      citacao: "Não tive tempo para ter medo; contra a tirania das armas, a única linguagem é o dever da rebeldia.",
      descricao: "Poeta, deputado constituinte e líder da Ação Libertadora Nacional (ALN), abandonou a via institucional para combater a ditadura militar pela luta armada urbana.",
      pros: ["Bônus máximo em operações clandestinas, sabotagem de estruturas autoritárias e propaganda de choque.", "Mobilização entusiasmada de juventudes radicais e correntes insurgentes."],
      contras: ["Retaliação letal dos aparatos de repressão do Estado e criminalização definitiva de suas siglas partidárias."]
    },
    {
      id: "joao_amazonas",
      nome: "João Amazonas",
      alcunha: "O Dirigente Comunista",
      eixo: "revolucionario",
      arquetipo: "Lênin-Maoísta Rígido & Organizador de Quadros",
      citacao: "A vitória do povo não se constrói em dias de ilusão parlamentar, mas na forja diária do partido e na guerrilha popular.",
      descricao: "O mais duradouro líder do Partido Comunista do Brasil (PCdoB), arquiteto da Guerrilha do Araguaia e mestre da disciplina partidária de quadros fechados.",
      pros: ["Disciplina partidária férrea: lealdade absoluta da bancada sob seu comando sem risco de deserção.", "Capacidade superior de estruturar núcleos de resistência armada e células em regiões isoladas."],
      contras: ["Setorismo inflexível com baixa capacidade de diálogo com correntes democrático-liberais."]
    },
    {
      id: "miguel_reale",
      nome: "Miguel Reale",
      alcunha: "O Jurista Institucional",
      eixo: "juridico",
      arquetipo: "Teórico Tridimensional & Pensador Conservador",
      citacao: "O Direito é fato, valor e norma: nenhuma sociedade sobrevive sem a autoridade que resguarda a ordem justa.",
      descricao: "Filósofo do direito criador da Teoria Tridimensional do Direito, principal jurista da redação do Código Civil de 2002 e expoente do pensamento conservador/institucional brasileiro.",
      pros: ["Elaboração de arcabouços jurídicos e códigos legais extremamente robustos contra anulações jurídicas.", "Forte interlocução e prestígio com tribunais, conselhos de magistratura e academias de letras."],
      contras: ["Resistência e atritos com a militância de esquerda e movimentos progressistas devido ao seu passado doutrinário."]
    },
    {
      id: "plinio",
      nome: "Plínio Salgado",
      alcunha: "O Líder Integralista",
      eixo: "nacionalista",
      arquetipo: "Nacionalista Corporativista & Doutrinador Cívico",
      citacao: "Deus, Pátria e Família: ergue-se a nação consciente contra o materialismo que destrói o espírito!",
      descricao: "Jornalista e escritor que fundou a Ação Integralista Brasileira (AIB), comandando o maior movimento de massas de matriz corporativista e nacionalista da história do país.",
      pros: ["+45% entusiasmo e capacidade de mobilização em paradas civis uniformizadas e passeatas públicas.", "Apoio consolidado de correntes católicas tradicionalistas e classes médias patriotas."],
      contras: ["Conflito simultâneo e irreconciliável tanto com a esquerda revolucionária quanto com os liberais republicanos."]
    },
    {
      id: "adhemar",
      nome: "Adhemar de Barros",
      alcunha: "O Populista Paulista",
      eixo: "populista",
      arquetipo: "Populista Clientelista & Mestre do Pragmatismo",
      citacao: "Ele rouba mas faz! O povo quer ver viaduto de pé, hospital funcionando e asfalto na porta da sua casa.",
      descricao: "Governador e prefeito de São Paulo, pioneiro do populismo de obras viárias, carisma desabrido e máquina de assistência rápida diretamente vinculada à lealdade política pessoal.",
      pros: ["+40% tolerância do eleitorado popular a denúncias de caixa dois e desvios administrativos.", "Bônus de satisfação imediata nas periferias com pavimentação e hospitais de campanha."],
      contras: ["Risco permanente de escândalos nas contas públicas, investigações do Tribunal de Contas e cassação de mandatos."]
    },
    {
      id: "maluf",
      nome: "Paulo Maluf",
      alcunha: "O Executor de Grandes Obras",
      eixo: "populista",
      arquetipo: "Tocador de Obras & Tecnocrata da Eficiência",
      citacao: "Eu não fico discutindo teoria na televisão: eu vou lá, cavo o chão e entrego o maior túnel da América Latina.",
      descricao: "Engenheiro e político icônico de São Paulo, personificação do \"tocador de obras\", construindo túneis, minhocões, rodovias e hospitais com velocidade espantosa e retórica agressiva de lei e ordem.",
      pros: ["+50% velocidade na execução física de obras de transporte pesado, viadutos e pontes.", "Bônus em políticas de endurecimento policial e investimento bélico nas forças de segurança civil."],
      contras: ["Geração colossal de precatórios, superfaturamento de contratos e vulnerabilidade perpétua a ordens judiciais de bloqueio de bens."]
    },
    {
      id: "propria",
      nome: "Identidade Própria",
      alcunha: "O Novo Caminho / Pragmatismo Puro",
      eixo: "propria",
      arquetipo: "Pragmatismo Adaptativo",
      citacao: "Não sigo cartilhas do passado; respondo às demandas reais do presente.",
      descricao: "Trajetória 100% pessoal, independente de ícones ou fórmulas antigas. Adaptabilidade aos cenários práticos da política contemporânea.",
      pros: ["Flexibilidade para construir qualquer aliança sem preconceitos partidários", "Sem rejeição herdada de figuras históricas do passado"],
      contras: ["Sem militância passional herdada no início da caminhada"]
    }
  ];
  window.CATALOGO_INSPIRACOES = CATALOGO_INSPIRACOES;
  window.EIXOS_INSPIRACAO = EIXOS_INSPIRACAO;

  // 4. GARANTIR TERRITÓRIOS DE TODOS OS MUNICÍPIOS NO ENGINE
  function garantirTerritoriosDoGrandeABC() {
    if (typeof TERRITORIOS === "undefined" || !Array.isArray(TERRITORIOS)) return;

    Object.keys(DADOS_GRANDE_ABC).forEach(cNome => {
      const cObj = DADOS_GRANDE_ABC[cNome];
      cObj.bairros.forEach(b => {
        let t = TERRITORIOS.find(x => x.id === b.id);
        // Garantir compatibilidade com saves legados
        if (b.id === "santa_luzia" && !TERRITORIOS.some(x => x.id === "jardim_caicara")) {
          TERRITORIOS.push(Object.assign({}, b, { id: "jardim_caicara", grupo: cNome, cidade: cNome, uf: "SP" }));
        }
        if (b.id === "oiti" && !TERRITORIOS.some(x => x.id === "quarta_divisao")) {
          TERRITORIOS.push(Object.assign({}, b, { id: "quarta_divisao", grupo: cNome, cidade: cNome, uf: "SP" }));
        }
        if (b.id === "oasis" && !TERRITORIOS.some(x => x.id === "pedreira")) {
          TERRITORIOS.push(Object.assign({}, b, { id: "pedreira", grupo: cNome, cidade: cNome, uf: "SP" }));
        }
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
          const SHORT_TERR_NOME = {
            "zaira": "Zaíra", "oratorio": "Oratório", "itapark": "Itapark", "noemia": "V. Noêmia",
            "capuava": "Capuava", "primavera": "Primavera", "centro": "Centro",
            "campestre": "Campestre", "parque_nacoes": "Pq. Nações", "capuava_sa": "Capuava", "centro_sa": "Centro",
            "humaita": "Humaitá", "vila_luzita": "V. Luzita", "paranapiacaba": "Paranapiacaba",
            "rudge_ramos": "Rudge Ramos", "centro_sbc": "Centro", "assuncao": "Assunção", "demarchi": "Demarchi",
            "ferrazopolis": "Ferrazópolis", "alvarenga": "Alvarenga", "riacho_grande": "Riacho Grande",
            "fundacao": "Fundação", "barcelona": "Barcelona", "santa_paula": "Sta. Paula", "ceramica": "Cerâmica", "olimpico": "Olímpico",
            "campanario": "Campanário", "centro_dia": "Centro", "piraporinha": "Piraporinha", "conceicao_inamar": "Conceição", "eldorado": "Eldorado",
            "centro_rp": "Centro", "ouro_fino": "Ouro Fino", "santa_luzia": "Sta. Luzia", "oiti": "Quarta Div.",
            "centro_rgs": "Centro", "vila_conde": "V. Conde", "santa_tereza": "Sta. Tereza", "oasis": "Jd. Oásis"
          };
          const cleanNome = SHORT_TERR_NOME[id] || t.nome.replace(/\s*\(.*\)/, "").replace("Jardim ", "Jd. ").replace("Vila ", "V. ").replace("Parque ", "Pq. ").replace("Bairro ", "B. ");
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
        <div class="map-nav-scroll" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${vistasABC.map(v => btn(v.rot, "mapvista", [v.id], "mini " + (vistaCur === v.id ? "confirma" : "branco"))).join("")}
          ${btn("Grande SP", "mapvista", ["gsp"], "mini " + (vistaCur === "gsp" ? "confirma" : "branco"))}
          ${btn("Estado de SP", "mapvista", ["sp"], "mini " + (vistaCur === "sp" ? "confirma" : "branco"))}
          ${btn("Brasil", "mapvista", ["br"], "mini " + (vistaCur === "br" ? "confirma" : "branco"))}
        </div>
      `;

      const modoBtns = `
        <div class="map-modo-scroll row" style="margin-bottom:8px">
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
  // 9. MESA DIRETORA COMPLETA (ALESP + DEMAIS CASAS) E LIDERANÇAS VIVAS NO CONGRESSO
  function renderMesaDiretoraCompleta(I, mem) {
    if (typeof mesaCargosGarantir === "function") {
      try { mesaCargosGarantir(I.cod); } catch(e) {}
    }
    const j = (typeof J === "function") ? J() : null;
    const pres = (typeof presidenteDaCasa === "function") ? presidenteDaCasa(I.cod) : null;
    const papPres = (typeof PAPEL_MESA !== "undefined" && PAPEL_MESA[I.cod]) || "Presidente";
    const mc = (M().mesaCargos && M().mesaCargos[I.cod]) || {};

    const rolesDef = [
      { role: papPres, npc: pres, isPres: true },
      { role: "1º Vice-Presidente", npc: (typeof npcPorId === "function" && mc["1º Vice-Presidente"]) ? npcPorId(mc["1º Vice-Presidente"]) : null },
      { role: "2º Vice-Presidente", npc: (typeof npcPorId === "function" && mc["2º Vice-Presidente"]) ? npcPorId(mc["2º Vice-Presidente"]) : null },
      { role: "1º Secretário", npc: (typeof npcPorId === "function" && mc["1º Secretário"]) ? npcPorId(mc["1º Secretário"]) : null },
      { role: "2º Secretário", npc: (typeof npcPorId === "function" && mc["2º Secretário"]) ? npcPorId(mc["2º Secretário"]) : null },
      { role: "3º Secretário", npc: (typeof npcPorId === "function" && mc["3º Secretário"]) ? npcPorId(mc["3º Secretário"]) : null },
      { role: "4º Secretário", npc: (typeof npcPorId === "function" && mc["4º Secretário"]) ? npcPorId(mc["4º Secretário"]) : null }
    ];

    const tilesHtml = rolesDef.map(c => {
      const n = c.npc;
      const isPlayer = (j && j.mesa === I.cod && c.isPres);
      const borderColor = c.isPres ? "#c9a227" : "var(--linha)";
      if (!n && !isPlayer) {
        return `<div class="pv-tile pv-p" style="border-left:4px solid ${borderColor};opacity:0.65;">
          <div style="width:40px;height:50px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:1.2rem;">🏛️</div>
          <div><small style="opacity:0.8">${esc(c.role)}</small><b>Vago</b><small>Aguardando eleição</small></div>
        </div>`;
      }
      const nome = isPlayer ? j.nome : n.nome;
      const partido = isPlayer ? j.partido_atual : (n.partido || n.partidoBase || "");
      const foto = isPlayer ? (typeof fotoTag === "function" ? fotoTag(j, 40, 50) : "") : (typeof fotoTag === "function" ? fotoTag(n, 40, 50) : "");
      return `<div class="pv-tile pv-p" style="border-left:4px solid ${borderColor}">
        ${foto}
        <div style="display:flex;flex-direction:column;min-width:0;">
          <small style="opacity:0.8">${esc(c.role)}</small>
          <b>${esc(nome)}${isPlayer ? " (você)" : ""}</b>
          <small style="display:flex;align-items:center;gap:4px;">
            ${typeof badgePartido === "function" ? badgePartido(partido) : esc(partido)}
          </small>
        </div>
      </div>`;
    }).join("");

    // Se o jogador é parlamentar desta Casa Legislativa
    const codCargo = (typeof casaCodDoCargo === "function") ? casaCodDoCargo() : null;
    let acoesMesa = "";

    if (codCargo === I.cod) {
      if (j && j.mesa === I.cod) {
        // Jogador preside a Casa
        const ms = (typeof MATERIAS !== "undefined") ? MATERIAS.filter(m => m.casa === (typeof casaLegCod === "function" ? casaLegCod() : I.cod)).slice(0, 6) : [];
        acoesMesa = `
          <div class="card" style="margin-top:14px;background:rgba(201,162,39,0.08);border:1px solid #c9a227;">
            <h4 style="margin:0 0 6px;color:#c9a227;">👑 Poderes da Presidência da Casa</h4>
            <p class="txt" style="margin-bottom:8px;"><small>Você preside a <b>${esc(I.k)}</b>. Seus poderes incluem pautar matérias, conceder regime de urgência, engavetar CPIs e nomear presidentes de comissões.</small></p>
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px;">
              ${btn("Distribuir Comissões aos Aliados", "mesaCom", [], "mini confirma")}
            </div>
            <h5 style="margin:8px 0 6px;">Pautar Matéria Prioritária no Plenário:</h5>
            ${ms.map(m => `
              <div class="row" style="margin-bottom:4px;gap:6px;">
                <span class="grow"><small><b>${esc(m.nome)}</b> ${typeof tag === "function" ? tag(m.tipo) : ""}</small></span>
                ${btn("Pautar", "mesaPautar", [m.id], "mini")}
              </div>
            `).join("")}
          </div>
        `;
      } else {
        // Candidatura à Presidência da Casa
        const mcCand = j && j.mesaCand && j.mesaCand.casa === I.cod ? j.mesaCand : null;
        if (mcCand) {
          acoesMesa = `
            <div class="card" style="margin-top:14px;background:rgba(52,152,219,0.08);border:1px solid #3498db;">
              <h4 style="margin:0 0 6px;color:#3498db;">🗳️ Sua Candidatura à Presidência da Casa</h4>
              <p class="txt"><small>Campanha ativa pela presidência da <b>${esc(I.k)}</b>. Promessas feitas: <b>${mcCand.promessas}/5</b> · Apoio político: <b>${mcCand.apoio.toFixed(1)}</b>.</small></p>
              <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px;">
                ${btn("Prometer comissão", "mesaCab", ["promessa"], "mini branco")}
                ${btn("Oferecer emendas e cargos (R$ 100 mil)", "mesaCab", ["emenda"], "mini corrige")}
                ${btn("Negociar com líderes de bancada", "mesaCab", ["lider"], "mini confirma")}
              </div>
              <p class="txt" style="margin-top:6px;"><small>A eleição ocorre em fevereiro dos anos ímpares. Ganha o candidato com mais prestígio, articulação e apoio dos pares.</small></p>
            </div>
          `;
        } else {
          acoesMesa = `
            <div class="card" style="margin-top:14px;border:1px solid var(--linha);">
              <div class="row" style="align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div>
                  <b>Disputar a Presidência da ${esc(I.k)}</b>
                  <div style="font-size:0.8rem;opacity:0.8;">Candidaturas abrem para a disputa da Mesa Diretora (eleição em fevereiro).</div>
                </div>
                ${btn("Lançar Candidatura à Presidência", "mesaCand", [], "confirma mini")}
              </div>
            </div>
          `;
        }
      }
    }

    return card("Mesa Diretora — " + esc(I.k), `
      <p class="txt"><small>Mesa Diretora oficial da <b>${esc(I.k)}</b>. Administra a Casa, define as votações em plenário e conduz as sessões legislativas.</small></p>
      <div class="pv-tiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;">
        ${tilesHtml}
      </div>
      ${acoesMesa}
    `);
  }

  function renderLiderancasVivas(I, mem) {
    const j = (typeof J === "function") ? J() : null;
    const isMember = (typeof casaCodDoCargo === "function" && casaCodDoCargo() === I.cod);

    M().liderancas = M().liderancas || {};
    const lids = M().liderancas[I.cod] = M().liderancas[I.cod] || {};

    const partidosMap = {};
    mem.forEach(n => {
      const p = n.partidoBase || n.partido || "Sem Partido";
      partidosMap[p] = (partidosMap[p] || 0) + 1;
    });
    const partidosList = Object.keys(partidosMap).sort((a,b) => partidosMap[b] - partidosMap[a]);

    lids.partidos = lids.partidos || {};
    partidosList.forEach(p => {
      if (!lids.partidos[p] || (lids.partidos[p] !== "JOGADOR" && !mem.some(n => n.id === lids.partidos[p] && n.vivo))) {
        const best = mem.filter(n => (n.partidoBase || n.partido) === p && n.id !== "JOGADOR")
                        .sort((a,b) => (b.popularidade || 0) + (b.carisma || 0) - ((a.popularidade || 0) + (a.carisma || 0)))[0];
        lids.partidos[p] = best ? best.id : null;
      }
    });

    if (!lids.governo || (lids.governo !== "JOGADOR" && !mem.some(n => n.id === lids.governo && n.vivo))) {
      const govMems = mem.filter(n => typeof classeGov === "function" && classeGov(n.partidoBase || n.partido) === "G" && n.id !== "JOGADOR");
      govMems.sort((a,b) => (b.popularidade || 0) - (a.popularidade || 0));
      lids.governo = govMems[0] ? govMems[0].id : (mem[0] ? mem[0].id : null);
    }
    if (!lids.oposicao || (lids.oposicao !== "JOGADOR" && !mem.some(n => n.id === lids.oposicao && n.vivo))) {
      const opMems = mem.filter(n => typeof classeGov === "function" && classeGov(n.partidoBase || n.partido) === "O" && n.id !== "JOGADOR");
      opMems.sort((a,b) => (b.popularidade || 0) - (a.popularidade || 0));
      lids.oposicao = opMems[0] ? opMems[0].id : (mem[1] ? mem[1].id : null);
    }

    lids.bancadas = lids.bancadas || {};
    const bancadasNomes = ["Boi (Agronegócio)", "Bíblia (Evangélica)", "Bala (Segurança Armada)", "Sindical / Servidores", "Faria Lima (Mercado Financeiro)", "Centrão Fisiológico Puro"];
    bancadasNomes.forEach(bNome => {
      if (!lids.bancadas[bNome] || (lids.bancadas[bNome] !== "JOGADOR" && !mem.some(n => n.id === lids.bancadas[bNome] && n.vivo))) {
        const bMems = mem.filter(n => n.bancadas && n.bancadas.includes(bNome) && n.id !== "JOGADOR");
        bMems.sort((a,b) => (b.popularidade || 0) - (a.popularidade || 0));
        lids.bancadas[bNome] = bMems[0] ? bMems[0].id : null;
      }
    });

    let painelLiderJogador = "";
    const ehLiderDoPartido = (isMember && j && lids.partidos[j.partido_atual] === "JOGADOR");
    const ehLiderGov = (isMember && j && lids.governo === "JOGADOR");
    const ehLiderOp = (isMember && j && lids.oposicao === "JOGADOR");
    const liderBancadaTem = isMember && j ? Object.keys(lids.bancadas).find(b => lids.bancadas[b] === "JOGADOR") : null;

    if (ehLiderDoPartido || ehLiderGov || ehLiderOp || liderBancadaTem) {
      const tituloLider = ehLiderGov ? "Líder do Governo" : (ehLiderOp ? "Líder da Oposição" : (ehLiderDoPartido ? `Líder da Bancada do ${j.partido_atual}` : `Líder da Bancada ${liderBancadaTem}`));
      const orientacaoAtual = (M().orientacaoVoto && M().orientacaoVoto[I.cod] && M().orientacaoVoto[I.cod][j.partido_atual]) || "LIVRE";
      painelLiderJogador = `
        <div class="card" style="margin-bottom:14px;background:rgba(46,204,113,0.08);border:1px solid #2ecc71;">
          <h4 style="margin:0 0 6px;color:#2ecc71;">👑 Gabinete da Liderança: ${esc(tituloLider)}</h4>
          <p class="txt"><small>Como líder nesta Casa, você conduz a bancada nas votações de plenário e tem voz de comando na tribuna.</small></p>
          <div style="margin:8px 0;">
            <b style="font-size:0.85rem;">Orientação Oficial de Voto no Plenário:</b>
            <div class="row" style="gap:6px;margin-top:4px;flex-wrap:wrap;">
              ${btn("✅ Sim", "orientarVotoBancada", [I.cod, "S"], "mini " + (orientacaoAtual === "S" ? "confirma" : "branco"))}
              ${btn("❌ Não", "orientarVotoBancada", [I.cod, "N"], "mini " + (orientacaoAtual === "N" ? "corrige" : "branco"))}
              ${btn("🛑 Obstrução", "orientarVotoBancada", [I.cod, "O"], "mini " + (orientacaoAtual === "O" ? "confirma" : "branco"))}
              ${btn("⚪ Voto Livre", "orientarVotoBancada", [I.cod, "LIVRE"], "mini " + (orientacaoAtual === "LIVRE" ? "confirma" : "branco"))}
            </div>
          </div>
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px;">
            ${btn("Convocar Reunião da Bancada (-10 energia)", "reunirBancada", [I.cod], "mini confirma")}
            ${btn("Articular Liberação de Emendas", "articularEmendasLider", [I.cod], "mini azul")}
          </div>
        </div>
      `;
    } else if (isMember && j) {
      painelLiderJogador = `
        <div class="card" style="margin-bottom:14px;border:1px solid var(--linha);">
          <div class="row" style="align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div>
              <b>Disputar Liderança da Bancada do ${esc(j.partido_atual)}</b>
              <div style="font-size:0.8rem;opacity:0.8;">Torne-se a voz oficial do seu partido nesta Casa e oriente os votos dos seus colegas.</div>
            </div>
            ${btn(`Disputar Liderança do ${esc(j.partido_atual)}`, "disputarLiderBancada", [I.cod, j.partido_atual], "confirma mini")}
          </div>
        </div>
      `;
    }

    const govN = lids.governo === "JOGADOR" ? j : (typeof npcPorId === "function" ? npcPorId(lids.governo) : null);
    const opN = lids.oposicao === "JOGADOR" ? j : (typeof npcPorId === "function" ? npcPorId(lids.oposicao) : null);

    const instTiles = [
      { papel: "Líder do Governo", n: govN, isPlayer: lids.governo === "JOGADOR", border: "#27ae60" },
      { papel: "Líder da Oposição", n: opN, isPlayer: lids.oposicao === "JOGADOR", border: "#e74c3c" }
    ].map(item => {
      if (!item.n) return "";
      const pNome = item.isPlayer ? j.nome : item.n.nome;
      const part = item.isPlayer ? j.partido_atual : (item.n.partido || item.n.partidoBase || "");
      const foto = item.isPlayer ? (typeof fotoTag === "function" ? fotoTag(j, 40, 50) : "") : (typeof fotoTag === "function" ? fotoTag(item.n, 40, 50) : "");
      return `<div class="pv-tile pv-p" style="border-left:4px solid ${item.border}">
        ${foto}
        <div style="display:flex;flex-direction:column;min-width:0;">
          <small style="opacity:0.8">${esc(item.papel)}</small>
          <b>${esc(pNome)}${item.isPlayer ? " (você)" : ""}</b>
          <small>${typeof badgePartido === "function" ? badgePartido(part) : esc(part)}</small>
        </div>
      </div>`;
    }).join("");

    const partTiles = partidosList.slice(0, 14).map(p => {
      const lidId = lids.partidos[p];
      const isPlayer = (lidId === "JOGADOR");
      const n = isPlayer ? j : (typeof npcPorId === "function" ? npcPorId(lidId) : null);
      if (!n) return "";
      const pNome = isPlayer ? j.nome : n.nome;
      const foto = isPlayer ? (typeof fotoTag === "function" ? fotoTag(j, 36, 46) : "") : (typeof fotoTag === "function" ? fotoTag(n, 36, 46) : "");
      return `<div class="pv-tile pv-p" style="border-left:4px solid ${typeof corP === "function" ? corP(p) : "#555"}">
        ${foto}
        <div style="display:flex;flex-direction:column;min-width:0;">
          <small style="opacity:0.8">Líder do ${esc(p)} (${partidosMap[p]} dep.)</small>
          <b>${esc(pNome)}${isPlayer ? " (você)" : ""}</b>
          <small>${typeof badgePartido === "function" ? badgePartido(p) : esc(p)}</small>
        </div>
      </div>`;
    }).join("");

    const bancadaTiles = bancadasNomes.map(bNome => {
      const lidId = lids.bancadas[bNome];
      const isPlayer = (lidId === "JOGADOR");
      const n = isPlayer ? j : (typeof npcPorId === "function" ? npcPorId(lidId) : null);
      if (!n) return "";
      const pNome = isPlayer ? j.nome : n.nome;
      const part = isPlayer ? j.partido_atual : (n.partido || n.partidoBase || "");
      const foto = isPlayer ? (typeof fotoTag === "function" ? fotoTag(j, 36, 46) : "") : (typeof fotoTag === "function" ? fotoTag(n, 36, 46) : "");
      return `<div class="pv-tile pv-p" style="border-left:4px solid #5b7db1">
        ${foto}
        <div style="display:flex;flex-direction:column;min-width:0;">
          <small style="opacity:0.8">${esc((typeof BANCADA_CURTA !== "undefined" && BANCADA_CURTA[bNome]) || bNome)}</small>
          <b>${esc(pNome)}${isPlayer ? " (você)" : ""}</b>
          <small>${typeof badgePartido === "function" ? badgePartido(part) : esc(part)}</small>
        </div>
      </div>`;
    }).join("");

    return card("Lideranças Parlamentares — " + esc(I.k), `
      ${painelLiderJogador}
      <h4 style="margin:12px 0 6px;">Lideranças Institucionais</h4>
      <div class="pv-tiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-bottom:14px;">
        ${instTiles}
      </div>
      <h4 style="margin:12px 0 6px;">Líderes de Bancadas Partidárias</h4>
      <div class="pv-tiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-bottom:14px;">
        ${partTiles}
      </div>
      <h4 style="margin:12px 0 6px;">Líderes de Frentes Temáticas</h4>
      <div class="pv-tiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;">
        ${bancadaTiles}
      </div>
    `);
  }

  // Interceptar conteudoSub para exibir Mesa Diretora Completa e Lideranças Vivas
  if (typeof conteudoSub === "function") {
    const _origConteudoSub = conteudoSub;
    window.conteudoSub = function(I, mem) {
      const sub = (typeof S !== "undefined" && S.cong && S.cong.sub) || "plen";
      if (sub === "mesa") {
        return renderMesaDiretoraCompleta(I, mem);
      }
      if (sub === "lid") {
        return renderLiderancasVivas(I, mem);
      }
      return _origConteudoSub(I, mem);
    };
    conteudoSub = window.conteudoSub;
  }

  // Ações de Liderança Parlamentar
  if (typeof A !== "undefined") {
    A.disputarLiderBancada = function(codCasa, partido) {
      const j = (typeof J === "function") ? J() : null;
      if (!j) return;
      if (typeof gastarEnergia === "function" && !gastarEnergia(15)) return;

      const mem = (typeof membrosDaCasa === "function") ? membrosDaCasa(codCasa) : [];
      const colegas = mem.filter(n => (n.partidoBase || n.partido) === partido && n.id !== "JOGADOR");
      const relMedia = colegas.length ? (colegas.reduce((s,x) => s + (x.relacao_com_jogador || 0), 0) / colegas.length) : 50;
      const score = ((j.atributos && j.atributos.influencia) || 30) * 0.4 + ((j.relacao_partido) || 50) * 0.4 + relMedia * 0.2 + (Math.random() * 20);

      if (score >= 42 || colegas.length <= 1) {
        M().liderancas = M().liderancas || {};
        M().liderancas[codCasa] = M().liderancas[codCasa] || {};
        M().liderancas[codCasa].partidos = M().liderancas[codCasa].partidos || {};
        M().liderancas[codCasa].partidos[partido] = "JOGADOR";
        
        if (typeof manchete === "function") manchete(`POLÍTICA: ${j.nome} é escolhido(a) novo Líder da Bancada do ${partido} na Casa!`, "cong");
        if (typeof toast === "function") toast(`Você foi eleito(a) Líder da Bancada do ${partido}!`, "ok");
        j.atributos = j.atributos || {};
        j.atributos.influencia = Math.min(100, (j.atributos.influencia || 30) + 4);
      } else {
        if (typeof toast === "function") toast(`A bancada preferiu manter o líder atual. Amplie sua relação interna no partido.`, "err");
      }
      if (typeof render === "function") render();
    };

    A.orientarVotoBancada = function(codCasa, orientacao) {
      M().orientacaoVoto = M().orientacaoVoto || {};
      M().orientacaoVoto[codCasa] = M().orientacaoVoto[codCasa] || {};
      const j = (typeof J === "function") ? J() : null;
      if (j && j.partido_atual) {
        M().orientacaoVoto[codCasa][j.partido_atual] = orientacao;
        const txt = orientacao === "S" ? "SIM" : orientacao === "N" ? "NÃO" : orientacao === "O" ? "OBSTRUÇÃO" : "VOTO LIVRE";
        if (typeof toast === "function") toast(`Orientação de bancada definida: ${txt}! Seus colegas seguirão a ordem.`, "ok");
        if (typeof render === "function") render();
      }
    };

    A.reunirBancada = function(codCasa) {
      const j = (typeof J === "function") ? J() : null;
      if (!j) return;
      if (typeof gastarEnergia === "function" && !gastarEnergia(10)) return;

      const mem = (typeof membrosDaCasa === "function") ? membrosDaCasa(codCasa) : [];
      const colegas = mem.filter(n => (n.partidoBase || n.partido) === j.partido_atual && n.id !== "JOGADOR");
      colegas.forEach(n => {
        if (typeof relNPC === "function") relNPC(n, 6);
      });
      j.relacao_partido = Math.min(100, (j.relacao_partido || 50) + 3);
      if (typeof toast === "function") toast(`Reunião de bancada produtiva! Coesão fortalecida (+relação com deputados aliados).`, "ok");
      if (typeof render === "function") render();
    };

    A.articularEmendasLider = function(codCasa) {
      const j = (typeof J === "function") ? J() : null;
      if (!j) return;
      if (typeof gastarEnergia === "function" && !gastarEnergia(12)) return;

      j.caixa1 = (j.caixa1 || 0) + 150000;
      if (typeof toast === "function") toast(`Negociação bem-sucedida! Como líder, você assegurou liberação de R$ 150 mil em cotas institucionais.`, "ok");
      if (typeof render === "function") render();
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
          <div class="urna-topo" style="position:relative;display:flex;flex-direction:column;align-items:center">
            <div style="width:100%;display:flex;justify-content:flex-end;margin-bottom:6px">
              <button class="b mini" data-a="toggleTema" title="Alternar Modo Escuro / Claro" style="border-radius:20px;padding:5px 12px;font-size:0.8rem;font-weight:bold;cursor:pointer;background:rgba(255,255,255,0.12);border:1px solid var(--linha);color:var(--tinta);display:inline-flex;align-items:center;gap:6px">
                ${(document.documentElement.getAttribute("data-theme") || (typeof localStorage !== "undefined" && localStorage.getItem("cadeira_tema"))) === "dark" ? "☀️ Modo Claro" : "🌙 Modo Noturno"}
              </button>
            </div>
            <div class="lcd lcd-big" style="width:100%">
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
          ${(() => {
            const eixoAtual = c.inspEixo || "todos";
            const listaInsp = CATALOGO_INSPIRACOES.filter(i => eixoAtual === "todos" || i.eixo === eixoAtual);
            const eiSel = EIXO_POR_ID[inspObj.eixo] || EIXO_POR_ID.propria;

            const corpo = `
              <div class="insp-ui">
                <p class="insp-hint">Sua inspiração define o arquétipo da carreira: ela aparece no seu crachá, na sua biografia pública e na associação de forças do seu primeiro mandato.</p>

                <div class="insp-busca-wrap">
                  <input type="search" id="insp-busca" class="insp-busca" placeholder="Buscar por nome, alcunha ou arquétipo…" autocomplete="off" aria-label="Buscar inspiração política">
                  <span class="insp-conta" id="insp-conta">${listaInsp.length} de ${CATALOGO_INSPIRACOES.length}</span>
                </div>

                <div class="insp-chips" id="insp-chips" role="group" aria-label="Filtrar por eixo ideológico">
                  ${EIXOS_INSPIRACAO.map(e => `<button type="button" class="b mini insp-chip ${eixoAtual === e.id ? "confirma" : "branco"}" data-a="cfgFiltroInspiracao" data-p='["${e.id}"]' aria-pressed="${eixoAtual === e.id}"><span class="insp-chip-ic" aria-hidden="true">${e.ic}</span>${e.nome}</button>`).join("")}
                </div>

                <!-- Painel detalhado da inspiração selecionada -->
                <div class="insp-detalhe" id="insp-detalhe">
                  <div class="insp-d-top">
                    <div class="insp-d-id">
                      <div class="insp-d-nome">${inspObj.nome}</div>
                      <div class="insp-d-alc">${inspObj.alcunha}</div>
                    </div>
                    <span class="insp-d-eixo"><span aria-hidden="true">${eiSel.ic}</span> ${eiSel.nome}</span>
                  </div>
                  <div class="insp-d-arq">${inspObj.arquetipo}</div>
                  <blockquote class="insp-d-cit">&ldquo;${inspObj.citacao}&rdquo;</blockquote>
                  <p class="insp-d-desc">${inspObj.descricao}</p>
                  <div class="insp-d-cols">
                    <div class="insp-col ok">
                      <div class="insp-col-t">Vantagens históricas</div>
                      <ul>${inspObj.pros.map(p => `<li>${p}</li>`).join("")}</ul>
                    </div>
                    <div class="insp-col bad">
                      <div class="insp-col-t">Desafios &amp; ônus</div>
                      <ul>${inspObj.contras.map(ct => `<li>${ct}</li>`).join("")}</ul>
                    </div>
                  </div>
                </div>

                <!-- Galeria de inspirações -->
                <div class="insp-grid-cards" id="insp-grid-cards" role="listbox" aria-label="Escolha sua inspiração política">
                  ${listaInsp.map(i => {
                    const ei = EIXO_POR_ID[i.eixo] || EIXO_POR_ID.propria;
                    const sel = c.inspiracao === i.id;
                    return `<button type="button" class="insp-card ${sel ? "on" : ""}" data-a="cfgEscolherInspiracao" data-p='["${i.id}"]' data-eixo="${i.eixo}" role="option" aria-selected="${sel}" title="${i.nome} — ${i.alcunha}">
                        <span class="insp-card-top">
                          <span class="insp-ic" aria-hidden="true">${ei.ic}</span>
                          ${sel ? '<span class="insp-check" aria-hidden="true">✓</span>' : ""}
                        </span>
                        <span class="insp-nome">${i.nome}</span>
                        <span class="insp-alc">${i.alcunha}</span>
                        <span class="insp-arq">${i.arquetipo}</span>
                      </button>`;
                  }).join("")}
                </div>
                <p class="insp-vazio" id="insp-vazio" hidden>Nenhuma inspiração encontrada com esse filtro. Tente outro termo ou volte para “Todas”.</p>
              </div>`;

            return card("4. Escola Política & Inspiração Histórica", corpo);
          })()}

          <!-- BOTÃO PRINCIPAL DE INÍCIO -->
          <div style="margin-top:20px;text-align:center">
            <button class="b confirma big" data-a="novo" style="font-size:1.1rem;padding:14px 20px;border-radius:12px;font-weight:bold;cursor:pointer;width:100%;max-width:440px;box-sizing:border-box">🏛️ Iniciar Carreira Política no Grande ABC</button>
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
      const btnTema = `<button class="b mini tema-header-btn" data-a="toggleTema" title="Alternar Modo Escuro / Claro" style="margin-left:auto;padding:3px 8px;border-radius:14px;font-size:0.75rem;font-weight:bold;cursor:pointer;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:var(--tinta,#f8fafc);display:inline-flex;align-items:center;gap:4px;flex-shrink:0">${isDark ? "☀️ <span class='tema-label'>Claro</span>" : "🌙 <span class='tema-label'>Noturno</span>"}</button>`;

      if (h.includes('<span class="badges">')) {
        h = h.replace('<span class="badges">', `<span class="badges">${crachaTerr}${crachaProf}${crachaInsp}`);
      }
      h = h.replace(/(<span class="dt">.*?<\/span>)/, `$1${btnTema}`);
      return h;
    };
  }

  // 11B. GALERIA DE ESCOLAS POLÍTICAS — ESTILOS, AÇÕES E BUSCA
  (function injetarEstilosInsp() {
    if (document.getElementById("css-insp")) return;
    const st = document.createElement("style");
    st.id = "css-insp";
    st.textContent = [
      ".insp-ui{margin-top:2px}",
      ".insp-hint{font-size:.82rem;color:var(--tinta2);margin:0 0 10px;line-height:1.45}",
      ".insp-busca-wrap{display:flex;align-items:center;gap:8px;margin:0 0 10px}",
      ".insp-busca{flex:1;min-width:0;padding:10px 15px;border:1px solid var(--linha);border-radius:99px;background:var(--superficie2);color:var(--tinta);font-size:.9rem;font-family:var(--font-ui);-webkit-appearance:none;appearance:none}",
      ".insp-busca::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}",
      ".insp-busca:focus{outline:none;border-color:var(--eu);box-shadow:0 0 0 3px rgba(37,99,235,.15)}",
      ".insp-conta{font-size:.72rem;font-weight:700;color:var(--tinta2);white-space:nowrap;font-variant-numeric:tabular-nums}",
      ".insp-chips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}",
      ".insp-chip{border-radius:99px}",
      ".insp-chip-ic{margin-right:5px;font-size:.9em}",
      ".insp-detalhe{margin:0 0 14px;border:1px solid var(--linha);border-radius:var(--radius-lg);background:var(--superficie2);padding:13px 15px}",
      ".insp-d-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}",
      ".insp-d-nome{font-weight:800;font-size:1.08rem;letter-spacing:-.015em;color:var(--tinta);line-height:1.2}",
      ".insp-d-alc{font-size:.8rem;color:var(--tinta2);font-style:italic;margin-top:2px}",
      ".insp-d-eixo{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(37,99,235,.13);border:1px solid rgba(37,99,235,.3);color:var(--eu);white-space:nowrap}",
      ".insp-d-arq{margin-top:7px;font-size:.74rem;font-weight:600;color:var(--tinta2);text-transform:uppercase;letter-spacing:.04em}",
      ".insp-d-cit{margin:9px 0 0;padding:8px 12px;border-left:3px solid var(--eu);background:var(--superficie);border-radius:0 var(--radius-sm) var(--radius-sm) 0;color:var(--tinta2);font-size:.83rem;font-style:italic;line-height:1.45}",
      ".insp-d-desc{font-size:.84rem;color:var(--tinta);margin:9px 0 0;line-height:1.5}",
      ".insp-d-cols{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}",
      ".insp-col{padding:9px 11px;border-radius:var(--radius-sm);border:1px solid var(--linha);background:var(--superficie)}",
      ".insp-col.ok{border-color:rgba(16,185,129,.42)}",
      ".insp-col.bad{border-color:rgba(239,68,68,.42)}",
      ".insp-col-t{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}",
      ".insp-col.ok .insp-col-t{color:var(--ok)}",
      ".insp-col.bad .insp-col-t{color:var(--bad)}",
      ".insp-col ul{margin:0;padding-left:15px}",
      ".insp-col li{font-size:.75rem;color:var(--tinta2);margin:3px 0;line-height:1.4}",
      ".insp-grid-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}",
      ".insp-card{display:flex;flex-direction:column;gap:3px;text-align:left;padding:10px 11px;border:1px solid var(--linha);border-radius:var(--radius-md);background:var(--superficie2);color:var(--tinta);cursor:pointer;position:relative;min-height:98px;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease,background .12s ease}",
      ".insp-card:hover{border-color:var(--eu);background:var(--superficie);transform:translateY(-2px);box-shadow:var(--shadow-md)}",
      ".insp-card:active{transform:translateY(0)}",
      ".insp-card.on{border-color:var(--eu);background:var(--eu);color:#fff;box-shadow:0 3px 12px rgba(37,99,235,.32)}",
      ".insp-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}",
      ".insp-ic{font-size:1.05rem;line-height:1}",
      ".insp-check{font-weight:800;font-size:.8rem}",
      ".insp-nome{font-weight:700;font-size:.86rem;line-height:1.25}",
      ".insp-alc{font-size:.73rem;color:var(--tinta2);font-style:italic;line-height:1.25}",
      ".insp-card.on .insp-alc{color:rgba(255,255,255,.85)}",
      ".insp-arq{font-size:.64rem;color:var(--tinta2);line-height:1.3;margin-top:auto}",
      ".insp-card.on .insp-arq{color:rgba(255,255,255,.72)}",
      ".insp-card.oculto{display:none!important}",
      ".insp-vazio{font-size:.84rem;color:var(--tinta2);text-align:center;padding:16px 8px;margin:0}",
      "@media (max-width:759px){.insp-grid-cards{grid-template-columns:1fr 1fr}.insp-d-cols{grid-template-columns:1fr}}",
      "@media (max-width:380px){.insp-grid-cards{grid-template-columns:1fr}}",
      "html[data-contraste=alto] .insp-card.on{color:#fff}",
      "html[data-contraste=alto] .insp-card{border-width:2px}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  })();

  if (typeof A !== "undefined") {
    // Seleciona inspiração (recarrega a tela e atualiza o painel de detalhe)
    A.cfgEscolherInspiracao = function (id) {
      if (!S || !S.cfg || !id) return;
      const achado = (typeof CATALOGO_INSPIRACOES !== "undefined")
        ? CATALOGO_INSPIRACOES.find(x => x.id === id)
        : null;
      S.cfg.inspiracao = id;
      if (typeof toast === "function" && achado) toast("Inspiração: " + achado.nome, "ok");
    };

    // Filtra a galeria por eixo ideológico
    A.cfgFiltroInspiracao = function (eixo) {
      if (!S || !S.cfg) return;
      S.cfg.inspEixo = eixo || "todos";
    };
  }

  // Busca textual: filtra a galeria direto no DOM (sem recarregar a tela,
  // preservando o foco e o texto digitado pelo jogador).
  document.addEventListener("input", function (e) {
    const t = e.target;
    if (!t || t.id !== "insp-busca") return;
    const grid = document.getElementById("insp-grid-cards");
    if (!grid) return;
    const q = (t.value || "").trim().toLowerCase();
    let vis = 0;
    grid.querySelectorAll(".insp-card").forEach(card => {
      const txt = (card.textContent || "").toLowerCase();
      const mostra = !q || txt.indexOf(q) !== -1;
      card.classList.toggle("oculto", !mostra);
      if (mostra) vis++;
    });
    const conta = document.getElementById("insp-conta");
    if (conta) {
      const total = grid.querySelectorAll(".insp-card").length;
      conta.textContent = q ? (vis + " de " + total) : (total + " de " + (typeof CATALOGO_INSPIRACOES !== "undefined" ? CATALOGO_INSPIRACOES.length : total));
    }
    const vazio = document.getElementById("insp-vazio");
    if (vazio) vazio.hidden = vis > 0;
  }, true);

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

  // 15. ESTILOS RESPONSIVOS MODERNOS PARA MOBILE (SMARTPHONES E TABLETS)
  (function injetarEstilosMobile() {
    if (document.getElementById("cadeira-mobile-responsive-css")) return;
    const st = document.createElement("style");
    st.id = "cadeira-mobile-responsive-css";
    st.textContent = `
      /* OTIMIZAÇÕES MOBILE GERAIS */
      * { -webkit-tap-highlight-color: transparent; }
      
      @media (max-width: 680px) {
        html, body {
          overflow-x: hidden !important;
          width: 100% !important;
        }
        #app {
          padding-left: 10px !important;
          padding-right: 10px !important;
          padding-bottom: calc(140px + env(safe-area-inset-bottom, 16px)) !important;
        }

        /* Prevenir zoom forçado no iOS Safari em inputs/selects */
        input[type="text"], input[type="search"], select, textarea {
          font-size: 16px !important;
        }

        /* Formulários e Seletores em coluna única para não truncar texto */
        .grid2 {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }

        /* Topo da Urna na Tela Inicial */
        .urna-topo {
          padding: 8px 6px 12px !important;
        }
        .lcd.lcd-big .lcd-linha {
          font-size: 1.85rem !important;
          letter-spacing: 0.08em !important;
        }
        .lcd.lcd-big .lcd-sub {
          font-size: 0.76rem !important;
          line-height: 1.3 !important;
        }

        /* Cards de Inspiração e Arquetipos em coluna única */
        .insp-grid {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }

        /* Cabeçalho In-Game (LCD) - Moderno e sem colisões */
        .lcd {
          padding: 8px 10px !important;
        }
        .lcd-top {
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 6px !important;
        }
        .lcd-top .who {
          font-size: 1.15rem !important;
          max-width: 55% !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .lcd-top .cg {
          font-size: 0.78rem !important;
          padding: 2px 6px !important;
          max-width: 42% !important;
        }
        .lcd-top .dt {
          font-size: 0.78rem !important;
          padding: 2px 6px !important;
          margin-left: auto !important;
        }
        .tema-header-btn {
          margin-left: 2px !important;
          padding: 2px 7px !important;
          font-size: 0.75rem !important;
          line-height: 1.2 !important;
        }
        .tema-header-btn .tema-label {
          display: none !important;
        }
        .lcd-top .badges {
          width: 100% !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          gap: 5px !important;
          padding: 3px 0 !important;
          scrollbar-width: none !important;
        }
        .lcd-top .badges::-webkit-scrollbar {
          display: none !important;
        }
        .lcd-top .badge {
          flex-shrink: 0 !important;
          font-size: 0.72rem !important;
          padding: 2px 7px !important;
          white-space: nowrap !important;
        }

        /* Barra de Métricas (Chips2) */
        .chips2 {
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 4px !important;
          margin-top: 6px !important;
        }
        .chip2 {
          padding: 4px 2px !important;
          min-width: 0 !important;
          text-align: center !important;
        }
        .chip2 small {
          font-size: 0.65rem !important;
          display: block !important;
        }
        .chip2 b {
          font-size: 0.82rem !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          display: block !important;
        }

        /* Seletor de Cidades do Mapa Territorial em Carrossel Horizontal */
        .map-nav-scroll {
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 6px !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 4px 2px 8px !important;
          scrollbar-width: thin !important;
          white-space: nowrap !important;
        }
        .map-nav-scroll::-webkit-scrollbar {
          height: 4px !important;
        }
        .map-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2) !important;
          border-radius: 4px !important;
        }
        .map-nav-scroll .b {
          flex-shrink: 0 !important;
          padding: 6px 12px !important;
          font-size: 0.8rem !important;
        }

        .map-modo-scroll {
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 6px !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 2px 0 6px !important;
          white-space: nowrap !important;
        }
        .map-modo-scroll .b {
          flex-shrink: 0 !important;
          padding: 5px 10px !important;
          font-size: 0.78rem !important;
        }

        /* Botão Flutuante de Avanço (FAB) */
        .fab {
          bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
          right: 12px !important;
          padding: 8px 14px !important;
          min-height: 44px !important;
        }
        .fab .fl {
          font-size: 0.78rem !important;
        }
        .fab b {
          font-size: 0.95rem !important;
        }

              /* Contraste e legibilidade impecável para o mapa municipal */
      .mapa-municipio {
        width: 100% !important;
        max-width: 580px !important;
        height: auto !important;
        display: block !important;
        margin: 12px auto !important;
      }
      .mapa-municipio text.ml {
        font-size: 10px !important;
        font-weight: 800 !important;
        paint-order: stroke fill !important;
        stroke: rgba(0, 0, 0, 0.88) !important;
        stroke-width: 2.8px !important;
        fill: #ffffff !important;
        stroke-linejoin: round !important;
        stroke-linecap: round !important;
      }
      .mapa-municipio text.mv {
        font-size: 9.5px !important;
        font-weight: 700 !important;
        paint-order: stroke fill !important;
        stroke: rgba(0, 0, 0, 0.88) !important;
        stroke-width: 2.2px !important;
        fill: #f1c40f !important;
      }

        /* Bottom Navigation Bar (.bnav) */
        .bnav {
          padding-bottom: max(6px, env(safe-area-inset-bottom, 0px)) !important;
        }

        /* Modais Bottom-sheet no celular */
        .modal {
          align-items: flex-end !important;
          padding: 0 !important;
        }
        .mbox {
          border-radius: 18px 18px 0 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          max-height: 88vh !important;
          padding: 16px 14px calc(24px + env(safe-area-inset-bottom, 0px)) !important;
        }
      }
    `;
    document.head.appendChild(st);
  })();

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
