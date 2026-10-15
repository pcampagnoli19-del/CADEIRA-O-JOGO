/* =============================================================================
   CADEIRA — MODULO DE NEGOCIACAO COM EMPRESARIOS & CONGLOMERADOS
   Spec: CADEIRA_Spec_Empresarios.md

   MODULO ADITIVO. Nao remove nem simplifica nada do jogo: integra com
   Caixa 2 por candidatura, tres caixas (partido/candidato/personagem),
   orcamento oficial, compra do Judiciario, partido proprio, caminho Kassab,
   sucessao/legado, modulo do Executivo, eleicoes vivas, imprensa/redes e
   justica por fases (PF/MP/TCU/STF/TSE).

   Arquitetura: carregado apos o modulo ABC. Expoe window.EMP.
   ============================================================================= */
(function () {
  "use strict";

  var EMP = (window.EMP = window.EMP || {});
  EMP.versao = 1;

  /* ---------------------------------------------------------------------------
     3.4 — ENUM DE PAUTAS (ids exatos da spec)
     --------------------------------------------------------------------------- */
  EMP.PAUTAS = [
    "juros_selic", "credito_subsidiado", "plano_safra", "perdao_dividas_rurais",
    "reforma_tributaria", "desoneracao_folha", "escala_6x1", "sindicatos_clt",
    "reforma_administrativa", "reforma_previdenciaria", "meta_fiscal", "privatizacao",
    "concessao_infra", "leilao_infra", "ferrovia_porto", "hidrovia", "tarifa_energia",
    "subsidio_industrial", "lei_informatica", "tributacao_importacao", "iof_cambio",
    "isencao_lci_lca", "regulacao_big_tech", "criptografia", "data_center_ia",
    "ans_saude", "sus_orcamento", "concessao_radiodifusao", "publicidade_estatal",
    "costumes", "imunidade_templos", "ambiental_licenciamento", "terras_indigenas",
    "terras_estrangeiras", "habitacao_fgts", "zoneamento_urbano", "guerra_fiscal_icms",
    "geopolitica_eua_china", "defesa_bndes", "turismo_luxo", "lei_kandir",
    "seguranca_publica_tech", "credito_popular", "transporte_publico",
    "alvara_licenca", "isencao_municipal"
  ];

  EMP.PAUTA_LABEL = {
    juros_selic: "Juros / Selic", credito_subsidiado: "Credito subsidiado",
    plano_safra: "Plano Safra", perdao_dividas_rurais: "Perdao de dividas rurais",
    reforma_tributaria: "Reforma tributaria", desoneracao_folha: "Desoneracao da folha",
    escala_6x1: "Escala 6x1", sindicatos_clt: "Sindicatos / CLT",
    reforma_administrativa: "Reforma administrativa", reforma_previdenciaria: "Reforma previdenciaria",
    meta_fiscal: "Meta fiscal", privatizacao: "Privatizacao",
    concessao_infra: "Concessao de infraestrutura", leilao_infra: "Leilao de infraestrutura",
    ferrovia_porto: "Ferrovia e porto", hidrovia: "Hidrovia",
    tarifa_energia: "Tarifa de energia", subsidio_industrial: "Subsidio industrial",
    lei_informatica: "Lei de Informatica", tributacao_importacao: "Tributacao de importacao",
    iof_cambio: "IOF / cambio", isencao_lci_lca: "Isencao LCI/LCA",
    regulacao_big_tech: "Regulacao de big techs", criptografia: "Criptografia",
    data_center_ia: "Data centers e IA", ans_saude: "ANS / saude suplementar",
    sus_orcamento: "Orcamento do SUS", concessao_radiodifusao: "Concessao de radiodifusao",
    publicidade_estatal: "Publicidade estatal", costumes: "Pautas de costumes",
    imunidade_templos: "Imunidade de templos", ambiental_licenciamento: "Licenciamento ambiental",
    terras_indigenas: "Terras indigenas", terras_estrangeiras: "Terras a estrangeiros",
    habitacao_fgts: "Habitacao / FGTS", zoneamento_urbano: "Zoneamento urbano",
    guerra_fiscal_icms: "Guerra fiscal de ICMS", geopolitica_eua_china: "Geopolitica EUA x China",
    defesa_bndes: "Defesa / BNDES", turismo_luxo: "Turismo de luxo",
    lei_kandir: "Lei Kandir", seguranca_publica_tech: "Seguranca publica com tecnologia",
    credito_popular: "Credito popular", transporte_publico: "Transporte publico",
    alvara_licenca: "Alvara / licenca", isencao_municipal: "Isencao municipal"
  };

  /* ---------------------------------------------------------------------------
     4.3 — BLOCOS EMPRESARIAIS (indice de apoio 0-100 por bloco)
     --------------------------------------------------------------------------- */
  EMP.BLOCOS = {
    capital:   { nome: "Capital Financeiro", ic: "🏦", membros: ["lemann","esteves","setubal_moreira_salles","trabuco","velez_junqueira","benchimol","fink","pif_aramco","dimon"] },
    agro:      { nome: "Agronegocio",       ic: "🌾", membros: ["batista","maggi","suzano","glencore_cargill"] },
    industria: { nome: "Industria",         ic: "🏭", membros: ["gerdau","weg","embraer","wang_chuanfu"] },
    infra:     { nome: "Infraestrutura",    ic: "🚧", membros: ["ometto","menin","novonor","slim","ren_zhengfei","adani"] },
    midia:     { nome: "Midia",             ic: "📺", membros: ["marinho","frias_mesquita","macedo"] },
    bigtech:   { nome: "Big Tech",          ic: "💻", membros: ["musk","huang","cook","zuckerberg","pichai","bezos","galperin"] },
    varejo:    { nome: "Varejo & Consumo",  ic: "🛒", membros: ["trajano","azzas","diniz","multiplan_iguatemi","arnault"] },
    saude:     { nome: "Saude",             ic: "🏥", membros: ["moll"] },
    verde:     { nome: "Economia Verde",    ic: "🌱", membros: ["natura"] }
  };

  /* ---------------------------------------------------------------------------
     EIXOS GEOPOLITICOS
     --------------------------------------------------------------------------- */
  EMP.EIXOS_GEO = {
    nacional:   { nome: "Nacional",        ic: "🇧🇷" },
    ocidente:   { nome: "Ocidente",        ic: "🇺🇸" },
    china:      { nome: "China",           ic: "🇨🇳" },
    golfo:      { nome: "Golfo",           ic: "🕌" },
    sul_global: { nome: "Sul Global",      ic: "🌏" },
    latam:      { nome: "America Latina",  ic: "🌎" }
  };

  /* ---------------------------------------------------------------------------
     CARGOS — competencia, poder relativo e moedas de troca (5.1 / secao 7)
     --------------------------------------------------------------------------- */
  EMP.CARGOS = {
    vereador:        { nome: "Vereador",            poder: 0,  base_contato: 0.15, agenda: 4, teto_acordos: 4, teto_por_emp: 2, fator_emissario: 0.4 },
    prefeito:        { nome: "Prefeito",            poder: 3,  base_contato: 0.20, agenda: 6, teto_acordos: 5, teto_por_emp: 2, fator_emissario: 0.4 },
    dep_estadual:    { nome: "Deputado Estadual",   poder: 2,  base_contato: 0.18, agenda: 5, teto_acordos: 6, teto_por_emp: 3, fator_emissario: 0.5 },
    dep_federal:     { nome: "Deputado Federal",    poder: 4,  base_contato: 0.25, agenda: 6, teto_acordos: 8, teto_por_emp: 3, fator_emissario: 0.6 },
    senador:         { nome: "Senador",             poder: 6,  base_contato: 0.22, agenda: 6, teto_acordos: 8, teto_por_emp: 3, fator_emissario: 0.6 },
    governador:      { nome: "Governador",          poder: 7,  base_contato: 0.35, agenda: 8, teto_acordos: 10, teto_por_emp: 3, fator_emissario: 0.6 },
    presidente:      { nome: "Presidente",          poder: 10, base_contato: 0.50, agenda: 10, teto_acordos: 12, teto_por_emp: 4, fator_emissario: 0.6 }
  };

  /* Competencias reais por cargo (regra 5: pauta fora da competencia nao aparece) */
  EMP.COMPETENCIAS = {
    vereador:     ["alvara_licenca","isencao_municipal","zoneamento_urbano","transporte_publico","credito_popular","publicidade_estatal","costumes","imunidade_templos","habitacao_fgts","seguranca_publica_tech"],
    prefeito:     ["alvara_licenca","isencao_municipal","zoneamento_urbano","transporte_publico","credito_popular","publicidade_estatal","costumes","imunidade_templos","habitacao_fgts","seguranca_publica_tech","sus_orcamento","ans_saude","concessao_infra","leilao_infra","meio_ambiente_municipal"],
    dep_estadual: ["guerra_fiscal_icms","subsidio_industrial","tarifa_energia","desoneracao_folha","plano_safra","transporte_publico","ans_saude","sus_orcamento","seguranca_publica_tech","credito_popular","meio_ambiente_estadual"],
    dep_federal:  ["reforma_tributaria","reforma_administrativa","reforma_previdenciaria","meta_fiscal","privatizacao","concessao_infra","leilao_infra","ferrovia_porto","hidrovia","tarifa_energia","subsidio_industrial","lei_informatica","tributacao_importacao","iof_cambio","isencao_lci_lca","regulacao_big_tech","criptografia","data_center_ia","ans_saude","concessao_radiodifusao","publicidade_estatal","costumes","imunidade_templos","ambiental_licenciamento","terras_indigenas","terras_estrangeiras","habitacao_fgts","defesa_bndes","turismo_luxo","lei_kandir","seguranca_publica_tech","credito_popular","transporte_publico","escala_6x1","sindicatos_clt","plano_safra","perdao_dividas_rurais","juros_selic","credito_subsidiado","geopolitica_eua_china"],
    senador:      ["reforma_tributaria","reforma_administrativa","reforma_previdenciaria","meta_fiscal","privatizacao","concessao_infra","leilao_infra","ferrovia_porto","hidrovia","tarifa_energia","subsidio_industrial","lei_informatica","tributacao_importacao","iof_cambio","isencao_lci_lca","regulacao_big_tech","criptografia","data_center_ia","ans_saude","concessao_radiodifusao","publicidade_estatal","costumes","imunidade_templos","ambiental_licenciamento","terras_indigenas","terras_estrangeiras","defesa_bndes","turismo_luxo","lei_kandir","seguranca_publica_tech","credito_popular","transporte_publico","escala_6x1","sindicatos_clt","plano_safra","perdao_dividas_rurais","juros_selic","credito_subsidiado","geopolitica_eua_china","habitacao_fgts","sabatina_agencia","outorga_radio_tv","resolucao_senado"],
    governador:   ["guerra_fiscal_icms","subsidio_industrial","tarifa_energia","desoneracao_folha","plano_safra","transporte_publico","ans_saude","sus_orcamento","seguranca_publica_tech","credito_popular","concessao_infra","leilao_infra","ferrovia_porto","hidrovia","zoneamento_urbano","habitacao_fgts","tributacao_importacao","lei_informatica","data_center_ia","ambiental_licenciamento"],
    presidente:   ["reforma_tributaria","reforma_administrativa","reforma_previdenciaria","meta_fiscal","privatizacao","concessao_infra","leilao_infra","ferrovia_porto","hidrovia","tarifa_energia","subsidio_industrial","lei_informatica","tributacao_importacao","iof_cambio","isencao_lci_lca","regulacao_big_tech","criptografia","data_center_ia","ans_saude","concessao_radiodifusao","publicidade_estatal","costumes","imunidade_templos","ambiental_licenciamento","terras_indigenas","terras_estrangeiras","habitacao_fgts","defesa_bndes","turismo_luxo","lei_kandir","seguranca_publica_tech","credito_popular","transporte_publico","escala_6x1","sindicatos_clt","plano_safra","perdao_dividas_rurais","juros_selic","credito_subsidiado","geopolitica_eua_china","nomeacao_bc","nomeacao_agencia","decreto_mp","sabatina_agencia","outorga_radio_tv"]
  };

  /* ---------------------------------------------------------------------------
     4.1 — AS 40 FICHAS (campos originais + campos novos da secao 3.1)
     --------------------------------------------------------------------------- */
  var CATALOGO_EMPRESARIOS = [
    {
      id: "lemann", tipo: "titular", bloco: "capital", eixo: "nacional",
      nome: "Jorge Paulo Lemann",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal","governador"] },
      pautas: ["reforma_administrativa","concessao_infra","sindicatos_clt","meta_fiscal"],
      ideologia: { economica: 88, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 12, ganancia: 80, lealdade: 40 },
      empresas: "3G Capital (AB InBev / Ambev, Kraft Heinz, Burger King)",
      tag: "Bens de Consumo & Private Equity",
      frase: "Sonhar grande e sonhar pequeno da exatamente o mesmo trabalho.",
      descricao: "Maior investidor da historia empresarial brasileira, conhecido pelo metodo de Orcamento Base Zero (OBZ), meritocracia agressiva, corte implacavel de custos e consolidacao de monopolios globais.",
      vantagens: ["+25% eficiencia operacional e reducao de custos em concessoes publicas.", "Forte atracao de liquidez internacional e credito privado para o pais."],
      onus: ["Pressao severa contra sindicatos, encargos trabalhistas e estabilidade de servidores.", "Risco de desgaste na qualidade de servicos concedidos por excesso de cortes orcamentarios."],
      efeitos_oferta: [
        { id: "lemann_ef1", tipo: "bonus", variavel: "eficiencia_concessao", valor: 0.25, duracao_meses: 18, custo_pedido_id: "lemann_ped1" },
        { id: "lemann_ef2", tipo: "bonus", variavel: "credito_externo", valor: 0.15, duracao_meses: 12, custo_pedido_id: "lemann_ped1" }
      ],
      pedidos_tipicos: [
        { id: "lemann_ped1", pauta: "sindicatos_clt", descricao: "Apoiar flexibilizacao trabalhista e nao apoiar greve de servidores.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] },
        { id: "lemann_ped2", pauta: "concessao_infra", descricao: "Conceder servico publico com meta agressiva de reducao de custo.", gravidade: 2, prazo_meses: 12, cargos: ["governador","presidente"] }
      ],
      aliados: ["esteves","dimon","fink"],
      rivais: [],
      eventos_proprios: ["greve_geral","fuga_de_capital"]
    },
    {
      id: "trajano", tipo: "titular", bloco: "varejo", eixo: "nacional",
      nome: "Luiza Helena Trajano",
      acesso: { direto: ["dep_federal","senador","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["juros_selic","credito_popular","tributacao_importacao"],
      ideologia: { economica: 22, costumes: 5 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 9, ganancia: 45, lealdade: 60 },
      empresas: "Magazine Luiza (Magalu), Grupo Mulheres do Brasil",
      tag: "Varejo, E-commerce & Inclusao",
      frase: "Nao existe empresa forte em um pais fraco; o varejo e o termometro da vida real das familias.",
      descricao: "Empresaria de grande transito politico e social, defensora do estimulo ao consumo interno, da reducao de juros basicos e de politicas afirmativas corporativas.",
      vantagens: ["+30% simpatia popular e apoio de associacoes comerciais e microempreendedores.", "Capilaridade imediata para programas de credito popular e digitalizacao de pequenos negocios."],
      onus: ["Cobranca intensa por taxas de juros baixas, em conflito direto com um Banco Central ortodoxo.", "Exigencia de barreiras tributarias pesadas contra plataformas estrangeiras de importacao."],
      efeitos_oferta: [
        { id: "trajano_ef1", tipo: "bonus", variavel: "simpatia_popular", valor: 0.30, duracao_meses: 12, custo_pedido_id: "trajano_ped1" },
        { id: "trajano_ef2", tipo: "bonus", variavel: "alcance_microempreendedor", valor: 0.20, duracao_meses: 12, custo_pedido_id: "trajano_ped2" }
      ],
      pedidos_tipicos: [
        { id: "trajano_ped1", pauta: "juros_selic", descricao: "Pressionar o Banco Central por queda dos juros (P) ou votar contra elevacao (S/DF).", gravidade: 3, prazo_meses: 9, cargos: ["dep_federal","senador","presidente"] },
        { id: "trajano_ped2", pauta: "tributacao_importacao", descricao: "Aprovar ou editar taxacao de plataformas estrangeiras de importacao.", gravidade: 2, prazo_meses: 8, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["galperin"],
      rivais: ["esteves","dimon"],
      eventos_proprios: ["pacote_anti_inflacao"]
    },
    {
      id: "ometto", tipo: "titular", bloco: "infra", eixo: "nacional",
      nome: "Rubens Ometto",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_estadual","dep_federal"] },
      pautas: ["ferrovia_porto","concessao_infra","leilao_infra","tarifa_energia"],
      ideologia: { economica: 70, costumes: 0 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 12, ganancia: 75, lealdade: 45 },
      empresas: "Grupo Cosan (Raizen, Rumo Logistica, Comgas, Compass, Moove)",
      tag: "Etanol, Gas & Ferrovias",
      frase: "O Brasil so cresce de verdade quando destrava o trilho, o porto e a energia que move a industria.",
      descricao: "Conhecido pelo estilo franco e incisivo nos bastidores de Brasilia, comanda o maior conglomerado de infraestrutura energetica e logistica ferroviaria do pais.",
      vantagens: ["Destravamento rapido de malhas ferroviarias e corredores de exportacao do agronegocio.", "Lideranca global na transicao energetica via etanol de segunda geracao e biometano."],
      onus: ["Exigencia de renovacoes antecipadas de concessoes com tarifas blindadas contra inflacao.", "Atrito constante com caminhoneiros autonomos e agencias reguladoras, como ANTT e ANP."],
      efeitos_oferta: [
        { id: "ometto_ef1", tipo: "bonus", variavel: "velocidade_obra_logistica", valor: 0.25, duracao_meses: 18, custo_pedido_id: "ometto_ped1" },
        { id: "ometto_ef2", tipo: "bonus", variavel: "exportacao_agro", valor: 0.15, duracao_meses: 12, custo_pedido_id: "ometto_ped2" }
      ],
      pedidos_tipicos: [
        { id: "ometto_ped1", pauta: "concessao_infra", descricao: "Renovar concessao ferroviaria com tarifa blindada contra inflacao.", gravidade: 4, prazo_meses: 12, cargos: ["governador","presidente"] },
        { id: "ometto_ped2", pauta: "tarifa_energia", descricao: "Garantir tarifa energetica competitiva para o conglomerado.", gravidade: 3, prazo_meses: 12, cargos: ["governador","presidente"] }
      ],
      aliados: ["adani","glencore_cargill"],
      rivais: [],
      eventos_proprios: ["rodovia_ferrovia_emperrada","tcu_barra_obra"]
    },
    {
      id: "batista", tipo: "titular", bloco: "agro", eixo: "nacional",
      nome: "Joesley Batista",
      acesso: { direto: ["dep_federal","senador","presidente"], emissario: ["dep_estadual","governador"] },
      pautas: ["credito_subsidiado","ambiental_licenciamento","concessao_infra"],
      ideologia: { economica: 55, costumes: -10 },
      perfil: { exposicao_base: 95, vinganca: 80, paciencia_meses: 6, ganancia: 90, lealdade: 20 },
      empresas: "J&F Investimentos (JBS, Seara, Friboi, Eldorado Celulose, Ambar Energia, PicPay)",
      tag: "Frigorificos, Agroindustria & Energia",
      frase: "Quem alimenta o mundo tem assento garantido em qualquer mesa de decisao.",
      descricao: "Operadores de apetite agressivo que transformaram um acougue goiano na maior potencia de proteina animal do planeta, mantendo transito profundo em todos os poderes da Republica.",
      vantagens: ["Impulso imediato no superavit da balanca comercial e geracao de empregos no interior.", "Capacidade de socorrer setores eletricos e industriais em crise via aquisicoes rapidas."],
      onus: ["Altissima vulnerabilidade a escandalos de corrupcao, delacoes e crises no Judiciario.", "Pressao ferroz por financiamentos estatais e flexibilizacao de normas ambientais e sanitarias."],
      efeitos_oferta: [
        { id: "batista_ef1", tipo: "bonus", variavel: "balanca_comercial", valor: 0.25, duracao_meses: 12, custo_pedido_id: "batista_ped1" },
        { id: "batista_ef2", tipo: "bonus", variavel: "emprego_interior", valor: 0.15, duracao_meses: 12, custo_pedido_id: "batista_ped2" }
      ],
      pedidos_tipicos: [
        { id: "batista_ped1", pauta: "credito_subsidiado", descricao: "Liberar financiamento estatal subsidiado para o conglomerado.", gravidade: 4, prazo_meses: 6, cargos: ["presidente","senador","dep_federal"] },
        { id: "batista_ped2", pauta: "ambiental_licenciamento", descricao: "Flexibilizar normas ambientais e sanitarias do setor.", gravidade: 4, prazo_meses: 6, cargos: ["presidente","governador","dep_federal"] }
      ],
      aliados: ["maggi","suzano"],
      rivais: ["natura"],
      eventos_proprios: ["delação_premiada","pf_na_empresa_do_aliado"]
    },
    {
      id: "esteves", tipo: "titular", bloco: "capital", eixo: "nacional",
      nome: "Andre Esteves",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal","governador"] },
      pautas: ["meta_fiscal","privatizacao","reforma_previdenciaria","reforma_administrativa"],
      ideologia: { economica: 80, costumes: 5 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 18, ganancia: 85, lealdade: 50 },
      empresas: "BTG Pactual",
      tag: "Banco de Investimentos & Divida Publica",
      frase: "Estabilidade institucional e responsabilidade fiscal sao os melhores programas sociais que existem.",
      descricao: "Principal banqueiro de investimentos do pais e ponte direta entre o mercado financeiro e os chefes dos tres poderes em Brasilia, atuando em grandes privatizacoes, fusoes e rolagem da divida.",
      vantagens: ["+35% facilidade na emissao de titulos publicos e estruturacao de privatizacoes e PPPs.", "Acalma o cambio e reduz o risco-pais em momentos de turbulencia politica."],
      onus: ["Intolerancia absoluta do mercado a aumentos de gastos sociais sem contrapartida fiscal.", "Cobranca continua por reformas impopulares, como a previdenciaria e a administrativa."],
      efeitos_oferta: [
        { id: "esteves_ef1", tipo: "bonus", variavel: "emissao_titulos", valor: 0.35, duracao_meses: 18, custo_pedido_id: "esteves_ped1" },
        { id: "esteves_ef2", tipo: "bonus", variavel: "risco_pais", valor: -0.20, duracao_meses: 12, custo_pedido_id: "esteves_ped2" }
      ],
      pedidos_tipicos: [
        { id: "esteves_ped1", pauta: "privatizacao", descricao: "Apoiar pacote de privatizacoes e PPPs.", gravidade: 4, prazo_meses: 18, cargos: ["dep_federal","senador","presidente"] },
        { id: "esteves_ped2", pauta: "reforma_previdenciaria", descricao: "Votar a favor de reforma previdenciaria e administrativa.", gravidade: 4, prazo_meses: 18, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["dimon","fink","lemann"],
      rivais: ["trajano"],
      eventos_proprios: ["fuga_de_capital","aporte_bilionario","crise_bancaria_exterior"]
    },
    {
      id: "setubal_moreira_salles", tipo: "titular", bloco: "capital", eixo: "nacional",
      nome: "Roberto Setubal",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal"] },
      pautas: ["juros_selic","isencao_lci_lca","regulacao_big_tech"],
      ideologia: { economica: 78, costumes: 5 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 15, ganancia: 70, lealdade: 65 },
      empresas: "Itau Unibanco, Dexco, Alpargatas, CBMM (Niobio)",
      tag: "Banca Tradicional & Credito",
      frase: "Solidez bancaria nao e privilegio, e a infraestrutura invisivel que impede um pais de quebrar.",
      descricao: "Herdeiros e arquitetos da fusao que criou o maior banco privado da America Latina, alem do controle global do mercado de niobio, com perfil institucional e avesso a rupturas.",
      vantagens: ["Blindagem do sistema financeiro nacional contra crises bancarias internacionais.", "Apoio da elite financeira tradicional e financiamento de grandes obras de infraestrutura."],
      onus: ["Resistencia ferrenha a qualquer tentativa de tabelamento de juros ou taxacao de grandes lucros e dividendos.", "Lobby poderoso contra privilegios regulatorios para fintechs e bancos publicos."],
      efeitos_oferta: [
        { id: "setubal_ef1", tipo: "bonus", variavel: "estabilidade_bancaria", valor: 0.30, duracao_meses: 24, custo_pedido_id: "setubal_ped1" },
        { id: "setubal_ef2", tipo: "bonus", variavel: "financiamento_infra", valor: 0.20, duracao_meses: 18, custo_pedido_id: "setubal_ped2" }
      ],
      pedidos_tipicos: [
        { id: "setubal_ped1", pauta: "juros_selic", descricao: "Barrar tabelamento de juros e taxacao de grandes lucros.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] },
        { id: "setubal_ped2", pauta: "isencao_lci_lca", descricao: "Manter isencoes fiscais de titulos do agronegocio e imobiliario.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["trabuco","esteves","fink"],
      rivais: ["velez_junqueira"],
      eventos_proprios: ["crise_bancaria_exterior"]
    },
    {
      id: "trabuco", tipo: "titular", bloco: "capital", eixo: "nacional",
      nome: "Luiz Carlos Trabuco Cappi",
      acesso: { direto: ["dep_federal","senador","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["credito_popular","ans_saude","plano_safra"],
      ideologia: { economica: 65, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 12, ganancia: 55, lealdade: 70 },
      empresas: "Bradesco, Bradesco Seguros, Fleury, Odontoprev",
      tag: "Banca de Varejo & Seguros",
      frase: "O banco precisa estar onde o PIB nasce, na ponta da pequena cidade e na lavoura.",
      descricao: "Executivo de perfil conciliador e fala mansa, com acesso historico a governos de todos os espectros ideologicos, representando a capilaridade bancaria e o setor de saude suplementar.",
      vantagens: ["Expansao imediata de linhas de credito agricola, imobiliario e consignado pelo pais.", "Parcerias estrategicas para desafogar o sistema publico de saude via planos corporativos."],
      onus: ["Forte lobby contra o fortalecimento de planos de saude estatais ou a regulacao rigida da ANS.", "Exigencia de garantias do Tesouro Nacional para cobrir inadimplencia em programas de credito."],
      efeitos_oferta: [
        { id: "trabuco_ef1", tipo: "bonus", variavel: "credito_rural", valor: 0.25, duracao_meses: 12, custo_pedido_id: "trabuco_ped1" },
        { id: "trabuco_ef2", tipo: "bonus", variavel: "fila_sus", valor: -0.20, duracao_meses: 12, custo_pedido_id: "trabuco_ped2" }
      ],
      pedidos_tipicos: [
        { id: "trabuco_ped1", pauta: "credito_popular", descricao: "Garantir inadimplencia de programa de credito via Tesouro.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] },
        { id: "trabuco_ped2", pauta: "ans_saude", descricao: "Barrar regulacao rigida da ANS e planos de saude estatais.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente","governador"] }
      ],
      aliados: ["setubal_moreira_salles"],
      rivais: ["velez_junqueira"],
      eventos_proprios: ["reajuste_planos_saude"]
    },
    {
      id: "velez_junqueira", tipo: "titular", bloco: "capital", eixo: "latam",
      nome: "David Velez",
      acesso: { direto: ["dep_federal","senador","presidente"], emissario: ["dep_estadual"] },
      pautas: ["iof_cambio","regulacao_big_tech","credito_popular"],
      ideologia: { economica: 60, costumes: 20 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 6, ganancia: 50, lealdade: 35 },
      empresas: "Nubank",
      tag: "Banca Digital & Tecnologia Financeira",
      frase: "Acabar com a burocracia bancaria e devolver tempo e dinheiro para o bolso do cidadao comum.",
      descricao: "Fundadores do maior banco digital do mundo fora da Asia, simbolos da descentralizacao financeira, inclusao bancaria via smartphone e desafio direto ao oligopolio dos bancoes.",
      vantagens: ["+25% aprovacao entre eleitores jovens, autonomos e trabalhadores da economia digital.", "Modernizacao acelerada de sistemas de pagamentos governamentais e distribuicao de beneficios."],
      onus: ["Atrito severo com a Febraban e os grandes bancos tradicionais, com perda de apoio da velha Faria Lima.", "Ameaca de fuga de sede fiscal e investimentos tecnologicos caso haja aumento de IOF ou regulacao restritiva."],
      efeitos_oferta: [
        { id: "velez_ef1", tipo: "bonus", variavel: "aprovacao_jovem", valor: 0.25, duracao_meses: 12, custo_pedido_id: "velez_ped1" },
        { id: "velez_ef2", tipo: "bonus", variavel: "modernizacao_pagamentos", valor: 0.20, duracao_meses: 12, custo_pedido_id: "velez_ped2" }
      ],
      pedidos_tipicos: [
        { id: "velez_ped1", pauta: "iof_cambio", descricao: "Manter IOF baixo e sem regulacao restritiva as fintechs.", gravidade: 2, prazo_meses: 6, cargos: ["dep_federal","senador","presidente"] },
        { id: "velez_ped2", pauta: "regulacao_big_tech", descricao: "Barrar regulação que tratе fintechs como bancos tradicionais.", gravidade: 3, prazo_meses: 8, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["galperin","benchimol"],
      rivais: ["setubal_moreira_salles","trabuco"],
      eventos_proprios: ["fuga_de_capital"]
    },
    {
      id: "benchimol", tipo: "titular", bloco: "capital", eixo: "nacional",
      nome: "Guilherme Benchimol",
      acesso: { direto: ["dep_federal","senador","presidente"], emissario: ["dep_estadual"] },
      pautas: ["isencao_lci_lca","privatizacao","reforma_tributaria"],
      ideologia: { economica: 82, costumes: 12 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 6, ganancia: 50, lealdade: 45 },
      empresas: "XP Inc. (XP Investimentos, Rico, Clear)",
      tag: "Mercado de Capitais & Corretoras",
      frase: "Investir nao pode ser um clube fechado para milionarios; o mercado de capitais pertence a todos.",
      descricao: "Criador da maior plataforma de investimentos independentes do pais, responsavel por popularizar a Bolsa de Valores e o Tesouro Direto entre a classe media e alta.",
      vantagens: ["Mobilizacao de milhoes de investidores pessoa fisica para financiar debentures de infraestrutura.", "Forte apoio de formadores de opiniao economica e influenciadores de financas nas redes."],
      onus: ["Oposicao agressiva ao fim de isencoes fiscais em titulos do agro e imobiliarios, como LCI, LCA, CRI e CRA.", "Sensibilidade extrema da classe media alta a qualquer discurso intervencionista do governo."],
      efeitos_oferta: [
        { id: "benchimol_ef1", tipo: "bonus", variavel: "debentures_infra", valor: 0.20, duracao_meses: 18, custo_pedido_id: "benchimol_ped1" },
        { id: "benchimol_ef2", tipo: "bonus", variavel: "alcance_influencers", valor: 0.15, duracao_meses: 12, custo_pedido_id: "benchimol_ped2" }
      ],
      pedidos_tipicos: [
        { id: "benchimol_ped1", pauta: "isencao_lci_lca", descricao: "Manter isencoes de LCI, LCA, CRI e CRA.", gravidade: 2, prazo_meses: 6, cargos: ["dep_federal","senador","presidente"] },
        { id: "benchimol_ped2", pauta: "privatizacao", descricao: "Apoiar privatizacoes e reforma tributaria pró-mercado.", gravidade: 2, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["velez_junqueira","esteves"],
      rivais: [],
      eventos_proprios: ["influencers_viram_contra"]
    },
    {
      id: "maggi", tipo: "titular", bloco: "agro", eixo: "nacional",
      nome: "Blairo Maggi",
      acesso: { direto: ["dep_federal","senador","governador","presidente"], emissario: ["dep_estadual"] },
      pautas: ["plano_safra","perdao_dividas_rurais","hidrovia","terras_indigenas"],
      ideologia: { economica: 72, costumes: 15 },
      perfil: { exposicao_base: 50, vinganca: 80, paciencia_meses: 12, ganancia: 85, lealdade: 55 },
      empresas: "Grupo Amaggi",
      tag: "Agronegocio & Navegacao Fluvial",
      frase: "O agronegocio brasileiro nao pede favor; pede estrada, porto e seguranca juridica para produzir.",
      descricao: "Ex-governador, ex-senador e ex-ministro da Agricultura, personifica a fusao entre o grande capital exportador de graos do Centro-Oeste e o comando da bancada ruralista.",
      vantagens: ["+35% governabilidade e votos garantidos da Frente Parlamentar da Agropecuaria no Congresso.", "Investimento privado direto em hidrovias e terminais portuarios no Arco Norte."],
      onus: ["Conflito aberto com ONGs internacionais, Ministerio do Meio Ambiente e liderancas indigenas.", "Exigencia bilionaria anual de juros subsidiados no Plano Safra e perdao de dividas rurais."],
      efeitos_oferta: [
        { id: "maggi_ef1", tipo: "bonus", variavel: "governabilidade_fpa", valor: 0.35, duracao_meses: 18, custo_pedido_id: "maggi_ped1" },
        { id: "maggi_ef2", tipo: "bonus", variavel: "infra_portuaria", valor: 0.20, duracao_meses: 18, custo_pedido_id: "maggi_ped2" }
      ],
      pedidos_tipicos: [
        { id: "maggi_ped1", pauta: "plano_safra", descricao: "Aprovar Plano Safra com juros subsidiados bilionarios.", gravidade: 4, prazo_meses: 12, cargos: ["dep_federal","senador","presidente","governador"] },
        { id: "maggi_ped2", pauta: "perdao_dividas_rurais", descricao: "Perdoar dividas rurais e liberar hidrovias no Arco Norte.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","senador","dep_federal"] }
      ],
      aliados: ["batista","suzano","glencore_cargill"],
      rivais: ["natura"],
      eventos_proprios: ["seca_safra_recorde","escandalo_ambiental"]
    }
,

    {
      id: "gerdau", tipo: "titular", bloco: "industria", eixo: "nacional",
      nome: "Andre Gerdau Johannpeter",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_estadual","dep_federal"] },
      pautas: ["tributacao_importacao","tarifa_energia","desoneracao_folha"],
      ideologia: { economica: 74, costumes: 8 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 8, ganancia: 70, lealdade: 55 },
      empresas: "Grupo Gerdau",
      tag: "Siderurgia & Industria de Base",
      frase: "Sem industria de base forte e aco competitivo, nenhuma nacao constroi sua propria soberania.",
      descricao: "Representante da mais tradicional familia siderurgica do pais, com forte presenca na America do Norte e atuacao constante em defesa da competitividade industrial e reducao do Custo Brasil.",
      vantagens: ["Barateamento de insumos estrategicos para obras publicas de habitacao, pontes e infraestrutura.", "Apoio das federacoes industriais, como FIESP e CNI, e geracao de empregos metalurgicos qualificados."],
      onus: ["Exigencia de sobretaxas de importacao contra o aco estrangeiro, gerando tensao comercial com a China.", "Pressao por subsidios na tarifa de energia eletrica industrial e desoneracao da folha."],
      efeitos_oferta: [
        { id: "gerdau_ef1", tipo: "bonus", variavel: "custo_infra_obra_publica", valor: -0.15, duracao_meses: 18, custo_pedido_id: "gerdau_ped1" },
        { id: "gerdau_ef2", tipo: "bonus", variavel: "apoio_cni_fiesp", valor: 0.25, duracao_meses: 18, custo_pedido_id: "gerdau_ped2" }
      ],
      pedidos_tipicos: [
        { id: "gerdau_ped1", pauta: "tributacao_importacao", descricao: "Aprovar sobretaxa de importacao contra o aco estrangeiro.", gravidade: 3, prazo_meses: 8, cargos: ["dep_federal","senador","presidente","governador"] },
        { id: "gerdau_ped2", pauta: "desoneracao_folha", descricao: "Desonerar a folha e subsidiar a tarifa de energia industrial.", gravidade: 3, prazo_meses: 10, cargos: ["dep_federal","senador","presidente","governador"] }
      ],
      aliados: ["weg","embraer"],
      rivais: ["wang_chuanfu"],
      eventos_proprios: ["fuga_de_capital","greve_geral"]
    },
    {
      id: "weg", tipo: "titular", bloco: "industria", eixo: "nacional",
      nome: "Harry Schmelzer Jr.",
      acesso: { direto: ["governador","presidente"], emissario: ["dep_estadual","dep_federal"] },
      pautas: ["subsidio_industrial","sindicatos_clt","data_center_ia"],
      ideologia: { economica: 75, costumes: 5 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 12, ganancia: 55, lealdade: 60 },
      empresas: "WEG S.A.",
      tag: "Industria de Alta Tecnologia & Motores",
      frase: "Inovacao continua, disciplina fabril e visao global transformam uma oficina do interior em potencia mundial.",
      descricao: "Liderancas da multinacional catarinense conhecida como a fabrica de bilionarios, referencia mundial em motores eletricos, automacao industrial, geracao solar e eolica.",
      vantagens: ["+25% velocidade na modernizacao tecnologica do parque industrial e energetico nacional.", "Elevacao do prestigio do pais em cadeias globais de alto valor agregado e transicao verde."],
      onus: ["Resistencia ferrenha a sindicatos combativos e leis trabalhistas rigidas.", "Cobranca por incentivos fiscais de Pesquisa e Desenvolvimento, a Lei do Bem, e cambio competitivo."],
      efeitos_oferta: [
        { id: "weg_ef1", tipo: "bonus", variavel: "modernizacao_industrial", valor: 0.25, duracao_meses: 18, custo_pedido_id: "weg_ped1" },
        { id: "weg_ef2", tipo: "bonus", variavel: "prestigio_tech", valor: 0.15, duracao_meses: 12, custo_pedido_id: "weg_ped2" }
      ],
      pedidos_tipicos: [
        { id: "weg_ped1", pauta: "subsidio_industrial", descricao: "Conceder incentivos da Lei do Bem e cambio competitivo.", gravidade: 2, prazo_meses: 12, cargos: ["governador","presidente","dep_federal"] },
        { id: "weg_ped2", pauta: "sindicatos_clt", descricao: "Barrar avanco de leis trabalhistas rigidas no setor.", gravidade: 2, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["gerdau","embraer"],
      rivais: [],
      eventos_proprios: ["greve_geral"]
    },
    {
      id: "suzano", tipo: "titular", bloco: "agro", eixo: "nacional",
      nome: "Walter Schalka",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_estadual","dep_federal"] },
      pautas: ["terras_estrangeiras","ambiental_licenciamento","hidrovia"],
      ideologia: { economica: 70, costumes: 0 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 18, ganancia: 75, lealdade: 60 },
      empresas: "Suzano S.A.",
      tag: "Papel, Celulose & Bioeconomia",
      frase: "O futuro da bioeconomia global nasce nas florestas plantadas e na ciencia do eucalipto brasileiro.",
      descricao: "Comandantes da maior produtora de celulose de eucalipto do planeta, com imenso poder exportador, reservas territoriais gigantescas e forte discurso de creditos de carbono.",
      vantagens: ["Entrada massiva de dolares na economia e lideranca nas conferencias globais de clima, a COP.", "Desenvolvimento economico acelerado em regioes do interior, como Mato Grosso do Sul, Bahia e Maranhao."],
      onus: ["Disputas territoriais e criticas de movimentos agrarios contra o avanco da monocultura de eucalipto.", "Pressao pela desregulamentacao da compra de terras por grupos com capital estrangeiro."],
      efeitos_oferta: [
        { id: "suzano_ef1", tipo: "bonus", variavel: "entrada_dolares", valor: 0.30, duracao_meses: 24, custo_pedido_id: "suzano_ped1" },
        { id: "suzano_ef2", tipo: "bonus", variavel: "desenvolvimento_interior", valor: 0.20, duracao_meses: 18, custo_pedido_id: "suzano_ped2" }
      ],
      pedidos_tipicos: [
        { id: "suzano_ped1", pauta: "terras_estrangeiras", descricao: "Desregulamentar a compra de terras por capital estrangeiro.", gravidade: 3, prazo_meses: 18, cargos: ["dep_federal","senador","presidente"] },
        { id: "suzano_ped2", pauta: "ambiental_licenciamento", descricao: "Acelerar licenciamento ambiental de florestas plantadas.", gravidade: 3, prazo_meses: 12, cargos: ["governador","presidente","dep_federal"] }
      ],
      aliados: ["maggi","batista"],
      rivais: ["natura"],
      eventos_proprios: ["escandalo_ambiental"]
    },
    {
      id: "azzas", tipo: "titular", bloco: "varejo", eixo: "nacional",
      nome: "Alexandre Birman",
      acesso: { direto: ["dep_federal","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["guerra_fiscal_icms","escala_6x1","desoneracao_folha"],
      ideologia: { economica: 68, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 10, ganancia: 60, lealdade: 50 },
      empresas: "Azzas 2154 (Arezzo, Schutz, Reserva, Hering, Farm, Animale)",
      tag: "Industria Textil, Calcados & Varejo Premium",
      frase: "Criar marca forte e transformar o talento criativo brasileiro em valor economico duradouro.",
      descricao: "Lideres da megafusao que uniu as maiores marcas de vestuario e calcados do pais, representando a industria intensiva em mao de obra e o comercio de shopping centers.",
      vantagens: ["Geracao rapida de emprego formal feminino e jovem em polos calcadistas e texteis do Sul e Nordeste.", "Forte presenca midiatica e apoio do setor de servicos e shoppings."],
      onus: ["Lobby intenso pela manutencao de incentivos fiscais regionais, a guerra fiscal de ICMS e subvencoes.", "Oposicao ferrenha a reducoes da jornada de trabalho, como o fim da escala 6x1, sem corte de encargos."],
      efeitos_oferta: [
        { id: "azzas_ef1", tipo: "bonus", variavel: "emprego_jovem", valor: 0.25, duracao_meses: 12, custo_pedido_id: "azzas_ped1" },
        { id: "azzas_ef2", tipo: "bonus", variavel: "apoio_shoppings", valor: 0.15, duracao_meses: 12, custo_pedido_id: "azzas_ped2" }
      ],
      pedidos_tipicos: [
        { id: "azzas_ped1", pauta: "guerra_fiscal_icms", descricao: "Manter incentivos fiscais regionais de ICMS e subvencoes.", gravidade: 3, prazo_meses: 10, cargos: ["governador","dep_estadual","presidente","dep_federal"] },
        { id: "azzas_ped2", pauta: "escala_6x1", descricao: "Barrar o fim da escala 6x1 sem corte de encargos.", gravidade: 3, prazo_meses: 10, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["diniz","multiplan_iguatemi"],
      rivais: [],
      eventos_proprios: ["greve_geral","demissoes_em_massa"]
    },
    {
      id: "natura", tipo: "titular", bloco: "verde", eixo: "nacional",
      nome: "Guilherme Leal",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal","governador"] },
      pautas: ["ambiental_licenciamento","terras_indigenas"],
      ideologia: { economica: 30, costumes: -25 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 12, ganancia: 45, lealdade: 75 },
      empresas: "Natura &Co, Instituto Arapyau",
      tag: "Cosmeticos, Sustentabilidade & Terceiro Setor",
      frase: "Nao ha lucro legitimo se ele for construido sobre a destruicao da floresta e da biodiversidade.",
      descricao: "Fundadores da gigante de cosmeticos e financiadores de redes de sustentabilidade, com transito livre em foruns ambientais internacionais e aliancas com comunidades extrativistas da Amazonia.",
      vantagens: ["+30% prestigio diplomatico ambiental e facilidade para destravar fundos internacionais para a Amazonia.", "Apoio de movimentos ambientalistas, cientistas e setores progressistas da sociedade civil."],
      onus: ["Hostilidade imediata da bancada ruralista mais radical e de setores de mineracao e garimpo.", "Exigencia de metas rigidas de desmatamento zero que podem travar obras de infraestrutura na regiao Norte."],
      efeitos_oferta: [
        { id: "natura_ef1", tipo: "bonus", variavel: "prestigio_ambiental", valor: 0.30, duracao_meses: 18, custo_pedido_id: "natura_ped1" },
        { id: "natura_ef2", tipo: "bonus", variavel: "fundos_internacionais", valor: 0.20, duracao_meses: 12, custo_pedido_id: "natura_ped2" }
      ],
      pedidos_tipicos: [
        { id: "natura_ped1", pauta: "ambiental_licenciamento", descricao: "Adotar metas rigidas de desmatamento zero e licenciamento rigoroso.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","governador","dep_federal","senador"] },
        { id: "natura_ped2", pauta: "terras_indigenas", descricao: "Barrar avanco do agronegocio e da mineracao sobre terras indigenas.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","dep_federal","senador"] }
      ],
      aliados: [],
      rivais: ["maggi","batista","suzano"],
      eventos_proprios: ["escandalo_ambiental"]
    },
    {
      id: "menin", tipo: "titular", bloco: "infra", eixo: "nacional",
      nome: "Rubens Menin",
      acesso: { direto: ["dep_federal","senador","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["habitacao_fgts","juros_selic","zoneamento_urbano","publicidade_estatal"],
      ideologia: { economica: 62, costumes: 10 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 12, ganancia: 80, lealdade: 45 },
      empresas: "MRV Engenharia, Banco Inter, Log Commercial Properties, CNN Brasil, Radio Itatiaia",
      tag: "Construcao Civil, Bancos & Comunicacao",
      frase: "A casa propria e o maior alicerce de dignidade e estabilidade social de uma familia trabalhadora.",
      descricao: "Bilionario mineiro que ergueu a maior construtora de habitacao popular da America Latina e expandiu seus negocios para o setor bancario digital, logistica e imprensa televisiva.",
      vantagens: ["Boom imediato na construcao civil, geracao de empregos na base da piramide e reducao do deficit habitacional.", "Cobertura jornalistica favoravel e dialogo aberto em seus veiculos de comunicacao."],
      onus: ["Dependencia voraz de recursos do FGTS e subsidios bilionarios do orcamento federal para habitacao.", "Pressao contra o aumento da taxa Selic e contra regras mais duras de licenciamento urbano municipal."],
      efeitos_oferta: [
        { id: "menin_ef1", tipo: "bonus", variavel: "construcao_civil", valor: 0.30, duracao_meses: 18, custo_pedido_id: "menin_ped1" },
        { id: "menin_ef2", tipo: "bonus", variavel: "cobertura_midia", valor: 0.25, duracao_meses: 12, custo_pedido_id: "menin_ped2" }
      ],
      pedidos_tipicos: [
        { id: "menin_ped1", pauta: "habitacao_fgts", descricao: "Direcionar recursos do FGTS e subsidios para habitacao popular.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","dep_federal","senador","governador"] },
        { id: "menin_ped2", pauta: "zoneamento_urbano", descricao: "Flexibilizar licenciamento urbano municipal e conter a Selic.", gravidade: 2, prazo_meses: 12, cargos: ["vereador","prefeito","dep_estadual","presidente"] }
      ],
      aliados: ["novonor","multiplan_iguatemi"],
      rivais: [],
      eventos_proprios: ["fabrica_nova","obra_superfaturada"]
    },
    {
      id: "diniz", tipo: "titular", bloco: "varejo", eixo: "nacional",
      nome: "Abilio Diniz",
      acesso: { direto: ["governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["desoneracao_folha","sindicatos_clt","alvara_licenca"],
      ideologia: { economica: 66, costumes: 8 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 10, ganancia: 65, lealdade: 55 },
      empresas: "Peninsula Participacoes (acionista de Carrefour Brasil / Atacadao e BRF)",
      tag: "Supermercados, Gestao & Consumo",
      frase: "Disciplina, fe e foco em resultado superam qualquer crise economica.",
      descricao: "Simbolo maximo da modernizacao dos supermercados no Brasil e da governanca corporativa familiar, cuja holding continua ditando rumos na distribuicao de alimentos e inflacao na ponta.",
      vantagens: ["Capacidade de coordenar pactos nacionais de contencao de precos da cesta basica em momentos de inflacao.", "Grande influencia moral sobre o empresariado paulista e conselhos de administracao."],
      onus: ["Exigencia de desoneracao total sobre itens de supermercado e flexibilidade de trabalho aos domingos e feriados.", "Forte pressao contra fiscalizacoes trabalhistas e multas de orgaos de defesa do consumidor, como Procon e Senacon."],
      efeitos_oferta: [
        { id: "diniz_ef1", tipo: "bonus", variavel: "contencao_precos", valor: 0.30, duracao_meses: 12, custo_pedido_id: "diniz_ped1" },
        { id: "diniz_ef2", tipo: "bonus", variavel: "influencia_empresarial", valor: 0.20, duracao_meses: 18, custo_pedido_id: "diniz_ped2" }
      ],
      pedidos_tipicos: [
        { id: "diniz_ped1", pauta: "desoneracao_folha", descricao: "Desonerar itens de supermercado e flexibilizar trabalho em domingos e feriados.", gravidade: 2, prazo_meses: 10, cargos: ["dep_federal","senador","presidente","governador"] },
        { id: "diniz_ped2", pauta: "alvara_licenca", descricao: "Barrar fiscalizacoes trabalhistas e multas de Procon e Senacon.", gravidade: 2, prazo_meses: 8, cargos: ["vereador","prefeito","governador"] }
      ],
      aliados: ["azzas","multiplan_iguatemi"],
      rivais: [],
      eventos_proprios: ["pacote_anti_inflacao"]
    },
    {
      id: "moll", tipo: "titular", bloco: "saude", eixo: "nacional",
      nome: "Jorge Moll Filho",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["ans_saude","sus_orcamento"],
      ideologia: { economica: 55, costumes: 5 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 12, ganancia: 85, lealdade: 45 },
      empresas: "Rede D'Or Sao Luiz, SulAmerica Seguros",
      tag: "Saude Suplementar & Medicina Diagnostica",
      frase: "Excelencia medica exige escala, investimento pesado em tecnologia e gestao hospitalar eficiente.",
      descricao: "Cardiologista que construiu o maior imperio privado de hospitais e seguros de saude do Brasil, detendo poder de barganha decisivo sobre todo o setor medico-hospitalar.",
      vantagens: ["Expansao rapida de leitos de alta complexidade e parcerias publico-privadas para zerar filas de cirurgias.", "Apoio da classe medica de elite e de grandes operadoras de saude."],
      onus: ["Lobby poderoso na ANS para liberacao de reajustes elevados em planos de saude e desregulamentacao de coberturas.", "Enfraquecimento gradual do SUS caso o orcamento publico seja drenado para renuncias fiscais de saude privada."],
      efeitos_oferta: [
        { id: "moll_ef1", tipo: "bonus", variavel: "leitos_alta_complexidade", valor: 0.30, duracao_meses: 18, custo_pedido_id: "moll_ped1" },
        { id: "moll_ef2", tipo: "bonus", variavel: "fila_sus", valor: -0.25, duracao_meses: 12, custo_pedido_id: "moll_ped2" }
      ],
      pedidos_tipicos: [
        { id: "moll_ped1", pauta: "ans_saude", descricao: "Liberar reajustes elevados e desregulamentar coberturas de planos de saude.", gravidade: 3, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] },
        { id: "moll_ped2", pauta: "sus_orcamento", descricao: "Drenar orcamento publico para renuncias fiscais da saude privada.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","governador","vereador","prefeito"] }
      ],
      aliados: ["trabuco"],
      rivais: [],
      eventos_proprios: ["reajuste_planos_saude"]
    },
    {
      id: "marinho", tipo: "titular", bloco: "midia", eixo: "nacional",
      nome: "Joao Roberto Marinho",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal","dep_estadual","vereador"] },
      pautas: ["concessao_radiodifusao","publicidade_estatal","regulacao_big_tech"],
      ideologia: { economica: 55, costumes: -5 },
      perfil: { exposicao_base: 50, vinganca: 80, paciencia_meses: 12, ganancia: 80, lealdade: 40 },
      empresas: "Grupo Globo (TV Globo, Globoplay, O Globo, Valor Economico, CBN)",
      tag: "Televisao, Jornalismo & Entretenimento",
      frase: "O jornalismo profissional e a cultura nacional sao os espelhos onde o Brasil se reconhece todos os dias.",
      descricao: "Comandantes do maior conglomerado de midia da America Latina, capazes de pautar o debate publico nacional, moldar costumes e amplificar ou estancar crises politicas em questao de horas.",
      vantagens: ["+35% blindagem de imagem publica e amplo espaco para divulgar realizacoes governamentais em horario nobre.", "Apoio em campanhas de mobilizacao nacional, como vacinacao, reformas economicas e defesa institucional."],
      onus: ["Necessidade de manter verbas robustas de publicidade estatal e renovacao tranquila de concessoes de radiodifusao.", "Qualquer escandalo de corrupcao comprovado pode virar cobertura implacavel se o governo perder apoio popular."],
      efeitos_oferta: [
        { id: "marinho_ef1", tipo: "bonus", variavel: "blindagem_imprensa", valor: 0.35, duracao_meses: 12, custo_pedido_id: "marinho_ped1" },
        { id: "marinho_ef2", tipo: "bonus", variavel: "mobilizacao_nacional", valor: 0.25, duracao_meses: 12, custo_pedido_id: "marinho_ped2" }
      ],
      pedidos_tipicos: [
        { id: "marinho_ped1", pauta: "publicidade_estatal", descricao: "Manter verbas robustas de publicidade estatal para o grupo.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","governador","dep_federal","senador"] },
        { id: "marinho_ped2", pauta: "concessao_radiodifusao", descricao: "Renovar concessoes de radiodifusao sem sobressalto.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","senador"] }
      ],
      aliados: ["frias_mesquita"],
      rivais: ["macedo","zuckerberg","pichai"],
      eventos_proprios: ["cobertura_implacavel","blindagem_midiatica","remuneracao_jornalismo"]
    },
    {
      id: "frias_mesquita", tipo: "titular", bloco: "midia", eixo: "nacional",
      nome: "Familia Frias",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal","dep_estadual"] },
      pautas: ["regulacao_big_tech","publicidade_estatal"],
      ideologia: { economica: 60, costumes: 0 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 12, ganancia: 70, lealdade: 50 },
      empresas: "Grupo Folha (Folha de S.Paulo, UOL, PagBank) e Grupo Estado (Estadao, Broadcast)",
      tag: "Jornais Impressos & Portais de Noticias",
      frase: "Um poder sem imprensa livre e vigilante rapidamente se converte em arbitrio.",
      descricao: "Representantes das duas maiores dinastias do jornalismo paulista, formadores da opiniao da elite politica, juridica e financeira do pais, alem de donos de gigantes da internet e meios de pagamento.",
      vantagens: ["Boa vontade editorial nos principais cadernos de politica e economia que pautam Brasilia e a Faria Lima.", "Reducao de desgaste com o Judiciario e o Ministerio Publico."],
      onus: ["Critica severa nos editoriais a qualquer desvio da ortodoxia economica ou tentativa de regulacao da midia.", "Cobranca para que o Estado obrigue as Big Techs estrangeiras a remunerarem o jornalismo nacional."],
      efeitos_oferta: [
        { id: "frias_ef1", tipo: "bonus", variavel: "boa_vontade_editorial", valor: 0.30, duracao_meses: 12, custo_pedido_id: "frias_ped1" },
        { id: "frias_ef2", tipo: "bonus", variavel: "desgaste_judiciario", valor: -0.20, duracao_meses: 12, custo_pedido_id: "frias_ped2" }
      ],
      pedidos_tipicos: [
        { id: "frias_ped1", pauta: "regulacao_big_tech", descricao: "Obrigar Big Techs estrangeiras a remunerarem o jornalismo nacional.", gravidade: 2, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] },
        { id: "frias_ped2", pauta: "publicidade_estatal", descricao: "Barrar qualquer tentativa de regulacao da midia.", gravidade: 2, prazo_meses: 12, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["marinho"],
      rivais: ["zuckerberg","pichai"],
      eventos_proprios: ["editoriais_criticos","remuneracao_jornalismo"]
    }
,

    {
      id: "macedo", tipo: "titular", bloco: "midia", eixo: "nacional",
      nome: "Edir Macedo",
      acesso: { direto: ["dep_federal","senador","governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["costumes","imunidade_templos","concessao_radiodifusao"],
      ideologia: { economica: 40, costumes: 85 },
      perfil: { exposicao_base: 80, vinganca: 80, paciencia_meses: 6, ganancia: 75, lealdade: 65 },
      empresas: "Grupo Record (RecordTV, R7), Banco Digimais, Igreja Universal",
      tag: "Midia Televisiva, Religiao & Politica",
      frase: "A fe que transforma vidas tambem precisa ter voz ativa nas decisoes da nacao.",
      descricao: "Lider religioso e empresario de comunicacao com imensa penetracao nas periferias urbanas, dono da segunda maior rede de TV comercial do pais e padrinho de uma bancada parlamentar fiel.",
      vantagens: ["+30% apoio na bancada evangelica no Congresso e forte aprovacao no eleitorado conservador popular.", "Cobertura televisiva aliada e capilaridade social em comunidades vulneraveis."],
      onus: ["Vetos inegociaveis a qualquer pauta progressista de costumes, como aborto, drogas e questoes de genero.", "Exigencia de manutencao irrestrita da imunidade tributaria para templos e entidades ligadas."],
      efeitos_oferta: [
        { id: "macedo_ef1", tipo: "bonus", variavel: "bancada_evangelica", valor: 0.30, duracao_meses: 18, custo_pedido_id: "macedo_ped1" },
        { id: "macedo_ef2", tipo: "bonus", variavel: "cobertura_tv", valor: 0.25, duracao_meses: 12, custo_pedido_id: "macedo_ped2" }
      ],
      pedidos_tipicos: [
        { id: "macedo_ped1", pauta: "costumes", descricao: "Vetar pautas progressistas de costumes: aborto, drogas e genero.", gravidade: 4, prazo_meses: 6, cargos: ["dep_federal","senador","presidente","vereador","prefeito"] },
        { id: "macedo_ped2", pauta: "imunidade_templos", descricao: "Manter imunidade tributaria irrestrita para templos.", gravidade: 4, prazo_meses: 6, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: [],
      rivais: ["marinho"],
      eventos_proprios: ["cobertura_implacavel","blindagem_midiatica"]
    },
    {
      id: "multiplan_iguatemi", tipo: "titular", bloco: "varejo", eixo: "nacional",
      nome: "Jose Isaac Peres",
      acesso: { direto: ["governador","presidente"], emissario: ["dep_estadual","vereador"] },
      pautas: ["zoneamento_urbano","isencao_municipal","reforma_tributaria"],
      ideologia: { economica: 70, costumes: 5 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 8, ganancia: 55, lealdade: 55 },
      empresas: "Multiplan e Grupo Jereissati (Iguatemi)",
      tag: "Imobiliario Comercial, Varejo & Telecom",
      frase: "O shopping center no Brasil nao e apenas comercio; e o centro de convivencia, lazer e seguranca das cidades.",
      descricao: "Pioneiros e dominadores do mercado de shopping centers de alto padrao no pais, com forte transito politico, pois a familia Jereissati tem raizes historicas no Senado e no governo do Ceara.",
      vantagens: ["Revitalizacao urbana acelerada, geracao de empregos no setor de servicos e aumento na arrecadacao de ISS municipal.", "Forte articulacao politica com governadores e prefeitos das capitais."],
      onus: ["Pressao intensa contra fechamentos de comercio em crises sanitarias ou restricoes de horario de funcionamento.", "Lobby pesado contra o aumento de impostos sobre alugueis, dividendos imobiliarios e herancas."],
      efeitos_oferta: [
        { id: "multiplan_ef1", tipo: "bonus", variavel: "revitalizacao_urbana", valor: 0.25, duracao_meses: 18, custo_pedido_id: "multiplan_ped1" },
        { id: "multiplan_ef2", tipo: "bonus", variavel: "arrecadacao_iss", valor: 0.20, duracao_meses: 18, custo_pedido_id: "multiplan_ped2" }
      ],
      pedidos_tipicos: [
        { id: "multiplan_ped1", pauta: "zoneamento_urbano", descricao: "Barrar fechamentos de comercio e restricoes de horario.", gravidade: 2, prazo_meses: 8, cargos: ["vereador","prefeito","governador"] },
        { id: "multiplan_ped2", pauta: "isencao_municipal", descricao: "Barrar aumento de impostos sobre alugueis, dividendos e herancas.", gravidade: 2, prazo_meses: 8, cargos: ["vereador","prefeito","governador","dep_federal"] }
      ],
      aliados: ["menin","diniz","azzas"],
      rivais: [],
      eventos_proprios: []
    },
    {
      id: "novonor", tipo: "titular", bloco: "infra", eixo: "nacional",
      nome: "Marcelo Odebrecht",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal"] },
      pautas: ["concessao_infra","leilao_infra","defesa_bndes"],
      ideologia: { economica: 58, costumes: 0 },
      perfil: { exposicao_base: 95, vinganca: 80, paciencia_meses: 12, ganancia: 95, lealdade: 15 },
      empresas: "Novonor (antiga Odebrecht), Braskem, OEC e consorcios de infraestrutura pesada",
      tag: "Engenharia Pesada, Petroquimica & Concessoes",
      frase: "Ninguem constroi hidreletricas, metros e portos em um pais continental sem grandes empresas nacionais de engenharia.",
      descricao: "Simbolos do apogeu e queda das grandes empreiteiras nacionais, detentores de capacidade tecnica inigualavel para erguer megaprojetos, mas marcados historicamente pelas relacoes promiscuas de financiamento politico.",
      vantagens: ["+35% velocidade na conclusao de obras monumentais, como hidreletricas, metros, portos e refinarias, com alto impacto eleitoral.", "Facilidade, caso o jogador aceite o risco, de destravar apoio parlamentar fisiologico no Congresso."],
      onus: ["Altissimo risco de investigacoes da Policia Federal, do Tribunal de Contas e de escandalos de superfaturamento.", "Exigencia de aditivos contratuais bilionarios e perdao de multas de acordos de leniencia."],
      efeitos_oferta: [
        { id: "novonor_ef1", tipo: "bonus", variavel: "velocidade_obra_monumental", valor: 0.35, duracao_meses: 18, custo_pedido_id: "novonor_ped1" },
        { id: "novonor_ef2", tipo: "bonus", variavel: "apoio_fisiologico", valor: 0.30, duracao_meses: 12, custo_pedido_id: "novonor_ped2" }
      ],
      pedidos_tipicos: [
        { id: "novonor_ped1", pauta: "concessao_infra", descricao: "Liberar aditivos contratuais bilionarios e direcionar concessoes.", gravidade: 5, prazo_meses: 12, cargos: ["presidente","governador","senador"] },
        { id: "novonor_ped2", pauta: "leilao_infra", descricao: "Anistiar multas de acordos de leniencia e barrar investigacoes.", gravidade: 5, prazo_meses: 12, cargos: ["presidente","dep_federal","senador"] }
      ],
      aliados: ["menin","ometto","adani"],
      rivais: [],
      eventos_proprios: ["delação_premiada","tcu_barra_obra","obra_superfaturada","pf_na_empresa_do_aliado"]
    },
    {
      id: "embraer", tipo: "titular", bloco: "industria", eixo: "nacional",
      nome: "Francisco Gomes Neto",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal","governador"] },
      pautas: ["defesa_bndes","subsidio_industrial","geopolitica_eua_china"],
      ideologia: { economica: 60, costumes: 0 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 18, ganancia: 65, lealdade: 70 },
      empresas: "Embraer, Eve Air Mobility",
      tag: "Aeroespacial, Defesa & Alta Engenharia",
      frase: "Voar com tecnologia propria e provar que o Brasil pode competir de igual para igual com o primeiro mundo.",
      descricao: "Liderancas da terceira maior fabricante de jatos comerciais do planeta e pilar da base industrial de defesa brasileira, produzindo desde jatos executivos e regionais ate cargueiros militares e carros voadores.",
      vantagens: ["Fortalecimento das Forcas Armadas, soberania tecnologica e exportacoes bilionarias de altissimo valor agregado.", "Abertura de portas diplomaticas na OTAN, Oriente Medio, Asia e Estados Unidos."],
      onus: ["Exigencia de linhas de financiamento de longo prazo via BNDES Exim e compras governamentais de defesa.", "Risco constante de fuga de cerebros, com engenheiros deixando o pais em estagnacao economica."],
      efeitos_oferta: [
        { id: "embraer_ef1", tipo: "bonus", variavel: "soberania_tecnologica", valor: 0.30, duracao_meses: 24, custo_pedido_id: "embraer_ped1" },
        { id: "embraer_ef2", tipo: "bonus", variavel: "exportacao_alto_valor", valor: 0.25, duracao_meses: 18, custo_pedido_id: "embraer_ped2" }
      ],
      pedidos_tipicos: [
        { id: "embraer_ped1", pauta: "defesa_bndes", descricao: "Liberar linhas de longo prazo via BNDES Exim.", gravidade: 3, prazo_meses: 18, cargos: ["presidente","senador","dep_federal"] },
        { id: "embraer_ped2", pauta: "geopolitica_eua_china", descricao: "Garantir alinhamento diplomatico que preserve exportacoes de defesa.", gravidade: 2, prazo_meses: 12, cargos: ["presidente","senador"] }
      ],
      aliados: ["gerdau","weg"],
      rivais: [],
      eventos_proprios: ["fabrica_nova"]
    },
    {
      id: "musk", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Elon Musk",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal"] },
      pautas: ["regulacao_big_tech","tributacao_importacao","geopolitica_eua_china"],
      ideologia: { economica: 90, costumes: 30 },
      perfil: { exposicao_base: 80, vinganca: 80, paciencia_meses: 8, ganancia: 85, lealdade: 15 },
      empresas: "SpaceX, Starlink, Tesla, X (Twitter), xAI",
      tag: "Aeroespacial, Satelites, Eletricos & Redes Sociais",
      frase: "O futuro da civilizacao depende da liberdade irrestrita de expressao e da expansao tecnologica sem amarras burocraticas.",
      descricao: "Bilionario mais midiatico do planeta, controla a principal constelacao de satelites de baixa orbita do mundo e utiliza sua rede social para intervir diretamente na politica interna de diversos paises.",
      vantagens: ["Conectividade instantanea de internet via satelite em escolas rurais, Amazonia e fronteiras isoladas.", "Impulso massivo de popularidade entre bases digitais conservadoras e libertarias."],
      onus: ["Confronto aberto e crises institucionais graves com o Supremo Tribunal Federal e orgaos reguladores, como a Anatel.", "Exigencia de acesso a reservas de litio e isencao tarifaria para importacao de veiculos eletricos."],
      efeitos_oferta: [
        { id: "musk_ef1", tipo: "bonus", variavel: "conectividade_rural", valor: 0.25, duracao_meses: 18, custo_pedido_id: "musk_ped1" },
        { id: "musk_ef2", tipo: "bonus", variavel: "popularidade_digital", valor: 0.30, duracao_meses: 12, custo_pedido_id: "musk_ped2" }
      ],
      pedidos_tipicos: [
        { id: "musk_ped1", pauta: "tributacao_importacao", descricao: "Isentar tarifas de importacao de veiculos eletricos e garantir litio.", gravidade: 3, prazo_meses: 8, cargos: ["presidente","senador","dep_federal"] },
        { id: "musk_ped2", pauta: "regulacao_big_tech", descricao: "Barrar qualquer regulacao de plataformas digitais.", gravidade: 3, prazo_meses: 8, cargos: ["presidente","senador","dep_federal"] }
      ],
      aliados: ["zuckerberg"],
      rivais: [],
      eventos_proprios: ["musk_vs_stf","algoritmo_hostil"]
    },
    {
      id: "fink", tipo: "titular", bloco: "capital", eixo: "ocidente",
      nome: "Larry Fink",
      acesso: { direto: ["presidente"], emissario: ["senador"] },
      pautas: ["privatizacao","ambiental_licenciamento","meta_fiscal"],
      ideologia: { economica: 82, costumes: 15 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 18, ganancia: 80, lealdade: 45 },
      empresas: "BlackRock",
      tag: "Gestao Global de Ativos & Fundos Soberanos",
      frase: "O risco climatico e risco de investimento; o capital global so fluara para governos previsiveis e sustentaveis.",
      descricao: "Comandante da maior gestora de ativos da historia humana, com mais de 11 trilhoes de dolares sob gestao, cujas cartas anuais definem para onde vai o dinheiro dos fundos de pensao e bancos globais.",
      vantagens: ["Influxo imediato de dezenas de bilhoes de dolares na Bolsa, titulos verdes e privatizacoes.", "Reducao drastica dos juros da divida soberana e valorizacao da moeda nacional."],
      onus: ["Perda de soberania sobre politicas economicas heterodoxas e exigencia de metas ambientais rigorosas.", "Pressao para privatizar estatais estrategicas de agua, saneamento e energia."],
      efeitos_oferta: [
        { id: "fink_ef1", tipo: "bonus", variavel: "influxo_dolares", valor: 0.35, duracao_meses: 18, custo_pedido_id: "fink_ped1" },
        { id: "fink_ef2", tipo: "bonus", variavel: "juros_divida", valor: -0.30, duracao_meses: 18, custo_pedido_id: "fink_ped2" }
      ],
      pedidos_tipicos: [
        { id: "fink_ped1", pauta: "privatizacao", descricao: "Privatizar estatais estrategicas de agua, saneamento e energia.", gravidade: 4, prazo_meses: 18, cargos: ["presidente","senador"] },
        { id: "fink_ped2", pauta: "ambiental_licenciamento", descricao: "Adotar metas ambientais rigorosas exigidas pelo capital global.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","governador"] }
      ],
      aliados: ["esteves","dimon","lemann"],
      rivais: [],
      eventos_proprios: ["aporte_bilionario","fuga_de_capital"]
    },
    {
      id: "huang", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Jensen Huang",
      acesso: { direto: ["presidente"], emissario: ["senador","governador"] },
      pautas: ["data_center_ia","tarifa_energia","geopolitica_eua_china"],
      ideologia: { economica: 85, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 12, ganancia: 80, lealdade: 40 },
      empresas: "NVIDIA",
      tag: "Semicondutores, Supercomputadores & IA",
      frase: "A inteligencia artificial e a nova revolucao industrial, e as fabricas do futuro serao os data centers.",
      descricao: "Engenheiro taiwanes-americano que controla mais de 80% do mercado mundial de chips avancados de IA, tornando-se a figura mais cortejada por chefes de Estado na corrida tecnologica do seculo XXI.",
      vantagens: ["Transformacao do pais em um polo global de Data Centers verdes e criacao de uma IA Soberana para o Estado.", "Salto de produtividade na saude publica, seguranca, educacao e arrecadacao tributaria via IA."],
      onus: ["Consumo voraz da rede eletrica nacional e da agua para resfriamento de servidores, com risco de apagao energetico.", "Pressao geopolitica dos Estados Unidos para bloquear parcerias tecnologicas com a China."],
      efeitos_oferta: [
        { id: "huang_ef1", tipo: "bonus", variavel: "polo_data_centers", valor: 0.30, duracao_meses: 24, custo_pedido_id: "huang_ped1" },
        { id: "huang_ef2", tipo: "bonus", variavel: "produtividade_ia", valor: 0.25, duracao_meses: 18, custo_pedido_id: "huang_ped2" }
      ],
      pedidos_tipicos: [
        { id: "huang_ped1", pauta: "data_center_ia", descricao: "Garantir energia e agua para data centers, mesmo com risco de apagao.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","governador","senador"] },
        { id: "huang_ped2", pauta: "geopolitica_eua_china", descricao: "Bloquear parcerias tecnologicas do governo com a China.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","senador"] }
      ],
      aliados: ["cook","pichai","bezos","musk"],
      rivais: ["ren_zhengfei","wang_chuanfu"],
      eventos_proprios: ["crise_energetica","retaliacao_chinesa","pressao_dos_eua"]
    },
    {
      id: "cook", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Tim Cook",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal"] },
      pautas: ["lei_informatica","criptografia","regulacao_big_tech"],
      ideologia: { economica: 75, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 12, ganancia: 70, lealdade: 50 },
      empresas: "Apple",
      tag: "Hardware Premium, Ecossistema Digital & Privacidade",
      frase: "Tecnologia de ponta exige precisao logistica global, protecao de dados e energia 100% limpa.",
      descricao: "Executivo que transformou a Apple na empresa mais valiosa do mundo atraves do dominio magistral de cadeias de suprimentos asiaticas e da defesa intransigente de seu ecossistema fechado de softwares.",
      vantagens: ["Expansao de linhas de montagem locais e programas de formacao de desenvolvedores de aplicativos no pais.", "Prestigio internacional para a imagem de seguranca juridica e propriedade intelectual do governo."],
      onus: ["Exigencia de isencoes fiscais generosas, como a Lei de Informatica, para manter linhas de montagem no pais.", "Resistencia juridica ferrenha a ordens policiais de quebra de criptografia de celulares ou regulacao de lojas de aplicativos."],
      efeitos_oferta: [
        { id: "cook_ef1", tipo: "bonus", variavel: "linhas_montagem", valor: 0.25, duracao_meses: 18, custo_pedido_id: "cook_ped1" },
        { id: "cook_ef2", tipo: "bonus", variavel: "prestigio_juridico", valor: 0.20, duracao_meses: 12, custo_pedido_id: "cook_ped2" }
      ],
      pedidos_tipicos: [
        { id: "cook_ped1", pauta: "lei_informatica", descricao: "Conceder isencoes fiscais generosas da Lei de Informatica.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","dep_federal","senador"] },
        { id: "cook_ped2", pauta: "criptografia", descricao: "Barrar quebra de criptografia de celulares e regulacao de lojas de aplicativos.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","senador","dep_federal"] }
      ],
      aliados: ["huang","pichai"],
      rivais: ["ren_zhengfei","wang_chuanfu"],
      eventos_proprios: ["fabrica_nova"]
    },
    {
      id: "zuckerberg", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Mark Zuckerberg",
      acesso: { direto: ["dep_federal","senador","presidente"], emissario: ["dep_estadual"] },
      pautas: ["regulacao_big_tech","publicidade_estatal"],
      ideologia: { economica: 78, costumes: 20 },
      perfil: { exposicao_base: 50, vinganca: 80, paciencia_meses: 8, ganancia: 90, lealdade: 20 },
      empresas: "Meta (WhatsApp, Instagram, Facebook)",
      tag: "Redes Sociais, Mensageria & Publicidade Digital",
      frase: "Conectar bilhoes de pessoas instantaneamente mudou para sempre a forma como o comercio e a democracia funcionam.",
      descricao: "Controlador da infraestrutura de comunicacao diaria de quase toda a populacao brasileira, via WhatsApp e Instagram, detendo poder decisivo sobre o comercio digital e o alcance de campanhas politicas.",
      vantagens: ["Impulso para milhoes de pequenos comerciantes que vendem pelas redes e integracao de servicos publicos no WhatsApp.", "Alcance organico massivo para a comunicacao oficial do governo."],
      onus: ["Lobby agressivo contra qualquer regulacao das redes sociais ou responsabilizacao civil das plataformas por golpes e desinformacao.", "Risco de desestabilizacao eleitoral via algoritmos de engajamento polarizador."],
      efeitos_oferta: [
        { id: "zuckerberg_ef1", tipo: "bonus", variavel: "alcance_organico", valor: 0.35, duracao_meses: 12, custo_pedido_id: "zuckerberg_ped1" },
        { id: "zuckerberg_ef2", tipo: "bonus", variavel: "comercio_digital", valor: 0.20, duracao_meses: 12, custo_pedido_id: "zuckerberg_ped2" }
      ],
      pedidos_tipicos: [
        { id: "zuckerberg_ped1", pauta: "regulacao_big_tech", descricao: "Barrar qualquer regulacao de plataformas e responsabilizacao por golpes.", gravidade: 4, prazo_meses: 8, cargos: ["dep_federal","senador","presidente"] },
        { id: "zuckerberg_ped2", pauta: "publicidade_estatal", descricao: "Concentrar publicidade estatal em plataformas digitais.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","governador","prefeito"] }
      ],
      aliados: ["musk","pichai"],
      rivais: ["marinho","frias_mesquita","trajano"],
      eventos_proprios: ["algoritmo_hostil","remuneracao_jornalismo"]
    },
    {
      id: "pichai", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Sundar Pichai",
      acesso: { direto: ["senador","presidente"], emissario: ["dep_federal"] },
      pautas: ["regulacao_big_tech","data_center_ia"],
      ideologia: { economica: 76, costumes: 15 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 8, ganancia: 70, lealdade: 40 },
      empresas: "Alphabet / Google (Google Search, YouTube, Android, Google Cloud)",
      tag: "Buscadores, Nuvem, Video & Inteligencia Artificial",
      frase: "Organizar a informacao do mundo e torna-la acessivel e a base da economia digital moderna.",
      descricao: "Lider do conglomerado que controla o sistema operacional da maioria dos celulares do pais, a maior plataforma de video e a porta de entrada da internet mundial.",
      vantagens: ["Instalacao de cabos submarinos de fibra optica, nuvem governamental segura e digitalizacao da educacao publica.", "Parcerias estrategicas de monitoramento climatico e prevencao de desastres naturais via IA."],
      onus: ["Uso do proprio buscador e do YouTube para fazer campanha aberta contra leis de regulacao digital ou direitos autorais.", "Evasao de divisas publicitarias e esvaziamento financeiro da imprensa tradicional nacional."],
      efeitos_oferta: [
        { id: "pichai_ef1", tipo: "bonus", variavel: "nuvem_governamental", valor: 0.25, duracao_meses: 18, custo_pedido_id: "pichai_ped1" },
        { id: "pichai_ef2", tipo: "bonus", variavel: "monitoramento_climatico", valor: 0.15, duracao_meses: 12, custo_pedido_id: "pichai_ped2" }
      ],
      pedidos_tipicos: [
        { id: "pichai_ped1", pauta: "regulacao_big_tech", descricao: "Barrar leis de regulacao digital e de direitos autorais.", gravidade: 3, prazo_meses: 8, cargos: ["presidente","senador","dep_federal"] },
        { id: "pichai_ped2", pauta: "data_center_ia", descricao: "Autorizar data centers com consumo energetico dedicado.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","governador"] }
      ],
      aliados: ["cook","huang","zuckerberg"],
      rivais: ["marinho","frias_mesquita"],
      eventos_proprios: ["algoritmo_hostil","remuneracao_jornalismo","pressao_dos_eua"]
    }
,

    {
      id: "bezos", tipo: "titular", bloco: "bigtech", eixo: "ocidente",
      nome: "Jeff Bezos",
      acesso: { direto: ["governador","presidente"], emissario: ["senador","dep_federal","dep_estadual"] },
      pautas: ["tributacao_importacao","ambiental_licenciamento","data_center_ia"],
      ideologia: { economica: 80, costumes: 15 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 12, ganancia: 75, lealdade: 40 },
      empresas: "Amazon, AWS (Amazon Web Services), Blue Origin, Bezos Earth Fund",
      tag: "Logistica Global, Computacao em Nuvem & Espaco",
      frase: "A obsessao pelo cliente, precos baixos e entrega rapida sao imbativeis no longo prazo.",
      descricao: "Fundador do maior imperio de comercio eletronico e infraestrutura de servidores em nuvem do planeta, alem de investidor bilionario em fundos climaticos.",
      vantagens: ["Barateamento de produtos para o consumidor final e construcao de dezenas de centros de distribuicao logistica no pais.", "Doacoes bilionarias a fundo perdido para conservacao ambiental e bioeconomia na Amazonia."],
      onus: ["Esmagamento de redes de varejo locais e livrarias nacionais, gerando revolta de empresarios domesticos.", "Precarizacao de entregadores e operadores logisticos e dependencia critica do Estado em servidores da AWS."],
      efeitos_oferta: [
        { id: "bezos_ef1", tipo: "bonus", variavel: "centros_distribuicao", valor: 0.25, duracao_meses: 18, custo_pedido_id: "bezos_ped1" },
        { id: "bezos_ef2", tipo: "bonus", variavel: "doacao_ambiental", valor: 0.20, duracao_meses: 12, custo_pedido_id: "bezos_ped2" }
      ],
      pedidos_tipicos: [
        { id: "bezos_ped1", pauta: "tributacao_importacao", descricao: "Barrar regulacao sobre entregadores e encargos logisticos.", gravidade: 2, prazo_meses: 12, cargos: ["dep_federal","senador","presidente","governador"] },
        { id: "bezos_ped2", pauta: "ambiental_licenciamento", descricao: "Apoiar projetos de conservacao que rendam doacoes bilionarias.", gravidade: 2, prazo_meses: 12, cargos: ["presidente","governador"] }
      ],
      aliados: ["huang","cook","musk"],
      rivais: ["galperin","trajano"],
      eventos_proprios: ["entregadores_em_greve","fabrica_nova"]
    },
    {
      id: "arnault", tipo: "titular", bloco: "varejo", eixo: "ocidente",
      nome: "Bernard Arnault",
      acesso: { direto: ["presidente"], emissario: ["governador"] },
      pautas: ["turismo_luxo","tributacao_importacao"],
      ideologia: { economica: 85, costumes: 25 },
      perfil: { exposicao_base: 20, vinganca: 20, paciencia_meses: 12, ganancia: 65, lealdade: 45 },
      empresas: "LVMH (Louis Vuitton, Dior, Moet & Chandon, Tiffany & Co., Sephora, Copacabana Palace)",
      tag: "Alta Costura, Joalheria, Bebidas & Turismo de Elite",
      frase: "O luxo verdadeiro e a unica area capaz de criar desejo eterno e margens que desafiam o tempo.",
      descricao: "Homem mais rico da Europa, controla 75 marcas legendarias de luxo e hoteis iconicos, operando como um verdadeiro chanceler informal dos interesses comerciais franceses e europeus.",
      vantagens: ["Transformacao de capitais nacionais em polos de turismo internacional de altissima renda e eventos globais.", "Facilitacao diplomatica nos bastidores de Paris e Bruxelas para acordos comerciais, como Mercosul e Uniao Europeia."],
      onus: ["Pressao intensa pela reducao do Imposto de Importacao e do Imposto Seletivo sobre bebidas finas e artigos de luxo.", "Desgaste politico junto a bases de esquerda por conceder beneficios a marcas voltadas aos super-ricos."],
      efeitos_oferta: [
        { id: "arnault_ef1", tipo: "bonus", variavel: "turismo_alta_renda", valor: 0.30, duracao_meses: 24, custo_pedido_id: "arnault_ped1" },
        { id: "arnault_ef2", tipo: "bonus", variavel: "acordo_mercosul_ue", valor: 0.25, duracao_meses: 18, custo_pedido_id: "arnault_ped2" }
      ],
      pedidos_tipicos: [
        { id: "arnault_ped1", pauta: "turismo_luxo", descricao: "Reduzir Imposto de Importacao e Seletivo sobre artigos de luxo.", gravidade: 2, prazo_meses: 12, cargos: ["presidente","governador"] },
        { id: "arnault_ped2", pauta: "tributacao_importacao", descricao: "Facilitar o acordo Mercosul e Uniao Europeia.", gravidade: 2, prazo_meses: 12, cargos: ["presidente"] }
      ],
      aliados: ["fink","dimon"],
      rivais: [],
      eventos_proprios: ["acordo_mercosul_ue"]
    },
    {
      id: "galperin", tipo: "titular", bloco: "bigtech", eixo: "latam",
      nome: "Marcos Galperin",
      acesso: { direto: ["governador","presidente"], emissario: ["dep_federal","dep_estadual","vereador"] },
      pautas: ["tributacao_importacao","regulacao_big_tech","transporte_publico"],
      ideologia: { economica: 78, costumes: 10 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 8, ganancia: 70, lealdade: 40 },
      empresas: "Mercado Livre, Mercado Pago",
      tag: "Marketplace, Logistica & Fintech",
      frase: "A verdadeira integracao da America Latina nao foi feita pelos politicos, mas pelo comercio eletronico e pelos pacotes que cruzam nossas estradas.",
      descricao: "Empresario mais rico da Argentina, radicado no Uruguai, construiu no Brasil o principal mercado de sua empresa, empregando dezenas de milhares de pessoas e operando sua propria frota de avioes e caminhoes.",
      vantagens: ["Geracao massiva de empregos logisticos nas regioes metropolitanas e inclusao financeira de vendedores autonomos.", "Eficiencia logistica capaz de entregar mercadorias em qualquer municipio do pais em poucos dias."],
      onus: ["Guerra de lobby contra plataformas asiaticas, exigindo taxacao de compras internacionais, e atrito com o varejo fisico tradicional.", "Ameaca de transferir investimentos para paises vizinhos caso o governo crie encargos sobre trabalhadores de aplicativos."],
      efeitos_oferta: [
        { id: "galperin_ef1", tipo: "bonus", variavel: "emprego_logistico", valor: 0.25, duracao_meses: 18, custo_pedido_id: "galperin_ped1" },
        { id: "galperin_ef2", tipo: "bonus", variavel: "eficiencia_logistica", valor: 0.20, duracao_meses: 12, custo_pedido_id: "galperin_ped2" }
      ],
      pedidos_tipicos: [
        { id: "galperin_ped1", pauta: "tributacao_importacao", descricao: "Taxar compras internacionais em plataformas asiaticas.", gravidade: 3, prazo_meses: 8, cargos: ["dep_federal","senador","presidente","governador"] },
        { id: "galperin_ped2", pauta: "regulacao_big_tech", descricao: "Barrar encargos sobre trabalhadores de aplicativos.", gravidade: 2, prazo_meses: 8, cargos: ["dep_federal","senador","presidente"] }
      ],
      aliados: ["trajano","velez_junqueira"],
      rivais: ["bezos"],
      eventos_proprios: ["entregadores_em_greve"]
    },
    {
      id: "slim", tipo: "titular", bloco: "infra", eixo: "latam",
      nome: "Carlos Slim",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal"] },
      pautas: ["leilao_infra","concessao_infra","regulacao_big_tech"],
      ideologia: { economica: 72, costumes: 10 },
      perfil: { exposicao_base: 50, vinganca: 80, paciencia_meses: 12, ganancia: 90, lealdade: 45 },
      empresas: "America Movil (Claro, Embratel), Grupo Carso",
      tag: "Telecomunicacoes, Cabos, Satelites & Infraestrutura",
      frase: "Nas crises mais profundas e onde surgem as maiores oportunidades para quem tem caixa e visao de longo prazo.",
      descricao: "Magnata mexicano que domina as telecomunicacoes latino-americanas, tendo adquirido a historica estatal brasileira Embratel e consolidado uma das maiores redes de telefonia movel, TV a cabo e 5G do pais.",
      vantagens: ["Expansao acelerada do 5G em rodovias, agronegocio e periferias, alem de modernizacao de satelites de defesa e comunicacoes.", "Forte apetite para entrar em leiloes de rodovias, saneamento e energia mesmo em cenarios de instabilidade politica."],
      onus: ["Litigios bilionarios na Anatel e pressao para anular multas de universalizacao de telefonia fixa.", "Formacao de oligopolio nas telecomunicacoes com aumento de tarifas para o consumidor se nao houver regulacao firme."],
      efeitos_oferta: [
        { id: "slim_ef1", tipo: "bonus", variavel: "expansao_5g", valor: 0.30, duracao_meses: 24, custo_pedido_id: "slim_ped1" },
        { id: "slim_ef2", tipo: "bonus", variavel: "apetite_leiloes", valor: 0.25, duracao_meses: 18, custo_pedido_id: "slim_ped2" }
      ],
      pedidos_tipicos: [
        { id: "slim_ped1", pauta: "leilao_infra", descricao: "Anular multas da Anatel e garantir leiloes de rodovias e saneamento.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","senador","governador","dep_federal"] },
        { id: "slim_ped2", pauta: "concessao_infra", descricao: "Barrar regulacao firme que eleve tarifas ou quebre o oligopolio.", gravidade: 3, prazo_meses: 12, cargos: ["presidente","dep_federal","senador"] }
      ],
      aliados: ["ometto","adani","ren_zhengfei"],
      rivais: [],
      eventos_proprios: ["litigio_anatel"]
    },
    {
      id: "wang_chuanfu", tipo: "titular", bloco: "industria", eixo: "china",
      nome: "Wang Chuanfu",
      acesso: { direto: ["governador","presidente"], emissario: ["dep_federal","vereador"] },
      pautas: ["subsidio_industrial","lei_informatica","transporte_publico"],
      ideologia: { economica: 45, costumes: 0 },
      perfil: { exposicao_base: 50, vinganca: 50, paciencia_meses: 10, ganancia: 85, lealdade: 35 },
      empresas: "BYD (Build Your Dreams)",
      tag: "Automotivo Eletrico, Baterias, Trilhos & Energia Solar",
      frase: "A era do motor a combustao acabou; quem dominar a cadeia da bateria e do carro eletrico dominara a industria do seculo XXI.",
      descricao: "Quimico e bilionario chines que desbancou montadoras ocidentais centenarias, assumindo fabricas historicas no Brasil, como o polo de Camacari, e liderando o fornecimento de onibus eletricos e monotrilhos.",
      vantagens: ["Reindustrializacao rapida de polos automotivos abandonados por montadoras ocidentais e barateamento de carros eletricos.", "Estreitamento de lacos estrategicos com Pequim e modernizacao de frotas de onibus urbanos e metros."],
      onus: ["Revolta das montadoras tradicionais instaladas no pais e do setor de etanol contra a entrada de eletricos chineses.", "Denuncias trabalhistas em obras de terceirizadas e retaliacoes diplomaticas de Washington."],
      efeitos_oferta: [
        { id: "wang_ef1", tipo: "bonus", variavel: "reindustrializacao", valor: 0.35, duracao_meses: 24, custo_pedido_id: "wang_ped1" },
        { id: "wang_ef2", tipo: "bonus", variavel: "frota_eletrica", valor: 0.25, duracao_meses: 18, custo_pedido_id: "wang_ped2" }
      ],
      pedidos_tipicos: [
        { id: "wang_ped1", pauta: "subsidio_industrial", descricao: "Isentar veiculos eletricos e subsidiar a reindustrializacao.", gravidade: 3, prazo_meses: 10, cargos: ["governador","presidente","dep_federal"] },
        { id: "wang_ped2", pauta: "lei_informatica", descricao: "Garantir incentivos da Lei de Informatica para a fabrica.", gravidade: 2, prazo_meses: 10, cargos: ["presidente","dep_federal"] }
      ],
      aliados: ["ren_zhengfei"],
      rivais: ["gerdau","huang","cook"],
      eventos_proprios: ["pressao_dos_eua","retaliacao_chinesa","fabrica_nova"]
    },
    {
      id: "ren_zhengfei", tipo: "titular", bloco: "infra", eixo: "china",
      nome: "Ren Zhengfei",
      acesso: { direto: ["senador","governador","presidente"], emissario: ["dep_federal","vereador"] },
      pautas: ["seguranca_publica_tech","data_center_ia","geopolitica_eua_china"],
      ideologia: { economica: 40, costumes: -10 },
      perfil: { exposicao_base: 80, vinganca: 50, paciencia_meses: 12, ganancia: 85, lealdade: 40 },
      empresas: "Huawei",
      tag: "Infraestrutura de Telecomunicacoes, 5G & Cidades Inteligentes",
      frase: "Sobreviver sob pressao extrema exige investir tudo em ciencia basica e nunca depender de um unico fornecedor.",
      descricao: "Fundador da gigante tecnologica chinesa que fornece a espinha dorsal, com antenas e equipamentos de rede, para a maioria das operadoras de telefonia e provedores de internet regionais no Brasil.",
      vantagens: ["Implantacao de redes 5G e 6G ate 40% mais baratas e rapidas, alem de sistemas de cameras inteligentes para seguranca publica.", "Transferencia de tecnologia para universidades brasileiras e conectividade para o agronegocio de precisao."],
      onus: ["Crise diplomatica imediata com o Departamento de Estado dos Estados Unidos e agencias de inteligencia ocidentais, com acusacoes de espionagem.", "Dependencia tecnologica de equipamentos chineses na infraestrutura critica de comunicacoes do Estado."],
      efeitos_oferta: [
        { id: "ren_ef1", tipo: "bonus", variavel: "rede_5g", valor: 0.30, duracao_meses: 24, custo_pedido_id: "ren_ped1" },
        { id: "ren_ef2", tipo: "bonus", variavel: "cameras_seguranca", valor: 0.20, duracao_meses: 18, custo_pedido_id: "ren_ped2" }
      ],
      pedidos_tipicos: [
        { id: "ren_ped1", pauta: "seguranca_publica_tech", descricao: "Adotar cameras inteligentes e infraestrutura chinesa de seguranca.", gravidade: 3, prazo_meses: 12, cargos: ["governador","presidente","vereador","prefeito"] },
        { id: "ren_ped2", pauta: "geopolitica_eua_china", descricao: "Barrar veto americano a infraestrutura critica chinesa.", gravidade: 4, prazo_meses: 12, cargos: ["presidente","senador"] }
      ],
      aliados: ["slim","wang_chuanfu"],
      rivais: ["huang","cook"],
      eventos_proprios: ["pressao_dos_eua","retaliacao_chinesa"]
    },
    {
      id: "adani", tipo: "titular", bloco: "infra", eixo: "sul_global",
      nome: "Gautam Adani",
      acesso: { direto: ["governador","presidente"], emissario: ["senador"] },
      pautas: ["ferrovia_porto","leilao_infra","ambiental_licenciamento"],
      ideologia: { economica: 70, costumes: 10 },
      perfil: { exposicao_base: 80, vinganca: 50, paciencia_meses: 14, ganancia: 90, lealdade: 35 },
      empresas: "Adani Group",
      tag: "Portos, Aeroportos, Energia & Logistica",
      frase: "Paises emergentes nao crescem com discursos; crescem com portos profundos, aeroportos modernos e energia abundante.",
      descricao: "Magnata indiano da infraestrutura pesada, famoso pela capacidade de erguer os maiores portos, terminais de carga e parques solares do mundo em tempo recorde atraves de aliancas estreitas com governos.",
      vantagens: ["Execucao relampago de terminais portuarios, aeroportos regionais e megaparques de transmissao de energia.", "Fortalecimento comercial e geopolitico dentro do bloco dos BRICS, no eixo Brasil e India."],
      onus: ["Questionamentos internacionais sobre governanca corporativa, alavancagem financeira e acusacoes de capitalismo de lacos.", "Resistencia de comunidades costeiras e orgaos ambientais quanto ao impacto de grandes obras portuarias."],
      efeitos_oferta: [
        { id: "adani_ef1", tipo: "bonus", variavel: "execucao_infra", valor: 0.35, duracao_meses: 18, custo_pedido_id: "adani_ped1" },
        { id: "adani_ef2", tipo: "bonus", variavel: "eixo_brics", valor: 0.25, duracao_meses: 18, custo_pedido_id: "adani_ped2" }
      ],
      pedidos_tipicos: [
        { id: "adani_ped1", pauta: "leilao_infra", descricao: "Direcionar leiloes de portos e aeroportos com clausulas favoraveis.", gravidade: 4, prazo_meses: 14, cargos: ["governador","presidente","senador"] },
        { id: "adani_ped2", pauta: "ferrovia_porto", descricao: "Barrar questionamentos ambientais e de governanca as obras.", gravidade: 3, prazo_meses: 14, cargos: ["governador","presidente"] }
      ],
      aliados: ["ometto","novonor","pif_aramco"],
      rivais: [],
      eventos_proprios: ["cumbre_brics","obra_superfaturada"]
    },
    {
      id: "pif_aramco", tipo: "titular", bloco: "capital", eixo: "golfo",
      nome: "Yasir Al-Rumayyan",
      acesso: { direto: ["presidente"], emissario: ["senador"] },
      pautas: ["terras_estrangeiras","privatizacao","credito_subsidiado"],
      ideologia: { economica: 68, costumes: 30 },
      perfil: { exposicao_base: 50, vinganca: 20, paciencia_meses: 18, ganancia: 90, lealdade: 35 },
      empresas: "PIF (Fundo de Investimento Publico da Arabia Saudita) e Saudi Aramco",
      tag: "Fundo Soberano, Petroleo, Agro & Esportes",
      frase: "Estamos transformando a riqueza do petroleo em participacoes estrategicas nos setores que definirao o futuro da humanidade.",
      descricao: "Governador do fundo soberano saudita, com quase 1 trilhao de dolares em ativos, e presidente da maior petroleira do mundo, com apetite voraz por seguranca alimentar, mineracao e infraestrutura.",
      vantagens: ["Injecao direta de bilhoes de dolares a vista em obras do PAC, compra de participacoes em empresas nacionais e agronegocio.", "Nenhuma exigencia ideologica ou interferencia em pautas de direitos humanos e politica domestica."],
      onus: ["Criticas de setores progressistas e imprensa ocidental por alianca com monarquias absolutistas e lobby de combustiveis fosseis.", "Controle estrangeiro estatal sobre ativos estrategicos de producao de alimentos e terras brasileiras."],
      efeitos_oferta: [
        { id: "pif_ef1", tipo: "bonus", variavel: "injecao_dolares_vista", valor: 0.35, duracao_meses: 18, custo_pedido_id: "pif_ped1" },
        { id: "pif_ef2", tipo: "bonus", variavel: "zero_exigencia_ideologica", valor: 0.25, duracao_meses: 24, custo_pedido_id: "pif_ped2" }
      ],
      pedidos_tipicos: [
        { id: "pif_ped1", pauta: "terras_estrangeiras", descricao: "Liberar controle estrangeiro estatal sobre terras e frigorificos.", gravidade: 3, prazo_meses: 18, cargos: ["presidente","senador"] },
        { id: "pif_ped2", pauta: "privatizacao", descricao: "Privatizar ativos estrategicos para o fundo soberano.", gravidade: 3, prazo_meses: 18, cargos: ["presidente","senador"] }
      ],
      aliados: ["adani","fink","dimon"],
      rivais: [],
      eventos_proprios: ["aporte_bilionario","cumbre_brics"]
    },
    {
      id: "dimon", tipo: "titular", bloco: "capital", eixo: "ocidente",
      nome: "Jamie Dimon",
      acesso: { direto: ["presidente"], emissario: ["senador"] },
      pautas: ["meta_fiscal","iof_cambio","geopolitica_eua_china"],
      ideologia: { economica: 84, costumes: 5 },
      perfil: { exposicao_base: 20, vinganca: 50, paciencia_meses: 12, ganancia: 85, lealdade: 40 },
      empresas: "JPMorgan Chase",
      tag: "Banca Global, Tesouraria & Risco Soberano",
      frase: "Um pais que respeita contratos e mantem um balanco fortaleza atravessa qualquer tempestade global.",
      descricao: "O banqueiro mais poderoso dos Estados Unidos, lider do maior banco do mundo ocidental e criador do indice EMBI+, que mede o Risco-Brasil diariamente nos terminais financeiros.",
      vantagens: ["Queda imediata do Risco-Pais, atracao de bancos norte-americanos e financiamento barato para grandes corporacoes nacionais.", "Interlocucao direta com o Tesouro dos Estados Unidos e o Federal Reserve em momentos de crise cambial."],
      onus: ["Rebaixamento imediato da nota de risco do pais caso o governo abandone a meta de superavit primario.", "Oposicao a qualquer tentativa de criar moedas alternativas ao dolar no comercio internacional, como a moeda dos BRICS."],
      efeitos_oferta: [
        { id: "dimon_ef1", tipo: "bonus", variavel: "risco_pais", valor: -0.35, duracao_meses: 18, custo_pedido_id: "dimon_ped1" },
        { id: "dimon_ef2", tipo: "bonus", variavel: "financiamento_barato", valor: 0.30, duracao_meses: 18, custo_pedido_id: "dimon_ped2" }
      ],
      pedidos_tipicos: [
        { id: "dimon_ped1", pauta: "meta_fiscal", descricao: "Manter a meta de superavit primario sem expansao de gastos.", gravidade: 4, prazo_meses: 12, cargos: ["presidente"] },
        { id: "dimon_ped2", pauta: "geopolitica_eua_china", descricao: "Barrar moeda alternativa ao dolar no comercio dos BRICS.", gravidade: 3, prazo_meses: 12, cargos: ["presidente"] }
      ],
      aliados: ["esteves","fink","lemann"],
      rivais: ["trajano"],
      eventos_proprios: ["risco_pais_sobe","aporte_bilionario","cumbre_brics"]
    },
    {
      id: "glencore_cargill", tipo: "titular", bloco: "agro", eixo: "ocidente",
      nome: "Glencore (Gary Nagle)",
      acesso: { direto: ["governador","senador","presidente"], emissario: ["dep_federal"] },
      pautas: ["lei_kandir","hidrovia","ferrovia_porto","ambiental_licenciamento"],
      ideologia: { economica: 74, costumes: 5 },
      perfil: { exposicao_base: 80, vinganca: 50, paciencia_meses: 14, ganancia: 88, lealdade: 30 },
      empresas: "Glencore e Cargill (Familia Cargill-MacMillan)",
      tag: "Trading Global de Graos, Mineracao & Petroleo",
      frase: "Nos nao apenas vendemos materias-primas; nos conectamos quem produz em um continente a quem consome no outro.",
      descricao: "As duas maiores tradings de commodities agricolas e minerais do planeta, responsaveis por comprar, estocar e escoar boa parte da safra de soja, milho, minerio e combustiveis que saem dos portos brasileiros.",
      vantagens: ["Garantia de compra e liquidez imediata para toda a safra agricola e producao mineral do pais, mantendo o PIB do interior aquecido.", "Investimentos bilionarios em terminais portuarios privados e ferrovias de escoamento."],
      onus: ["Evasao fiscal via precos de transferencia e exportacao de materias-primas sem industrializacao local, pela Lei Kandir.", "Forte pressao por dragagem de rios na Amazonia, como a Hidrovia do Tapajos e Tocantins, gerando revolta indigena e ambiental."],
      efeitos_oferta: [
        { id: "glencore_ef1", tipo: "bonus", variavel: "liquidez_safra", valor: 0.35, duracao_meses: 18, custo_pedido_id: "glencore_ped1" },
        { id: "glencore_ef2", tipo: "bonus", variavel: "terminais_privados", valor: 0.25, duracao_meses: 18, custo_pedido_id: "glencore_ped2" }
      ],
      pedidos_tipicos: [
        { id: "glencore_ped1", pauta: "lei_kandir", descricao: "Manter a Lei Kandir e a exportacao sem industrializacao local.", gravidade: 4, prazo_meses: 14, cargos: ["dep_federal","senador","presidente"] },
        { id: "glencore_ped2", pauta: "hidrovia", descricao: "Autorizar dragagem de rios na Amazonia para escoamento.", gravidade: 4, prazo_meses: 14, cargos: ["presidente","governador","senador"] }
      ],
      aliados: ["maggi","ometto","adani","batista"],
      rivais: ["natura"],
      eventos_proprios: ["seca_safra_recorde","escandalo_ambiental","obra_superfaturada"]
    }
  ];

  EMP.catalogo = CATALOGO_EMPRESARIOS;
  window.CATALOGO_EMPRESARIOS = CATALOGO_EMPRESARIOS;

  EMP.porId = function (id) {
    for (var i = 0; i < CATALOGO_EMPRESARIOS.length; i++) {
      if (CATALOGO_EMPRESARIOS[i].id === id) return CATALOGO_EMPRESARIOS[i];
    }
    return null;
  };
  window.empPorId = EMP.porId;

  EMP.porNome = function (nome) {
    var n = String(nome || "").trim().toLowerCase();
    for (var i = 0; i < CATALOGO_EMPRESARIOS.length; i++) {
      var f = CATALOGO_EMPRESARIOS[i];
      if (String(f.nome || "").trim().toLowerCase() === n) return f;
    }
    return null;
  };
  window.empPorNome = EMP.porNome;

  /* ---------------------------------------------------------------------------
     REDE DE ALIADOS E RIVAIS (regra: afinidade com aliado/rival propaga -15%)
     --------------------------------------------------------------------------- */
  EMP.rivaisDe = function (id) { var e = EMP.porId(id); return (e && e.rivais) ? e.rivais.slice() : []; };
  EMP.aliadosDe = function (id) { var e = EMP.porId(id); return (e && e.aliados) ? e.aliados.slice() : []; };

  EMP.saoRivais = function (a, b) { return EMP.rivaisDe(a).indexOf(b) !== -1; };
  EMP.saoAliados = function (a, b) { return EMP.aliadosDe(a).indexOf(b) !== -1; };

  /* ---------------------------------------------------------------------------
     BLOCOS — indice de apoio 0-100 (media ponderada pela afinidade dos membros)
     --------------------------------------------------------------------------- */
  EMP.relevanciaNoBloco = function (empresarioId, bloco) {
    var e = EMP.porId(empresarioId);
    if (!e) return 1;
    // relevancia 1..3 conforme exposicao/vinganca/ganancia do perfil
    var p = e.perfil || {};
    var score = (p.exposicao_base || 0) * 0.4 + (p.vinganca || 0) * 0.3 + (p.ganancia || 0) * 0.3;
    if (score >= 70) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  // estado de relacao: relacoes[empresarioId] (3.2). Salvo so para ativos.
  EMP.relacoes = function () {
    if (typeof gameState === "undefined" || !gameState) return {};
    if (!gameState.empresarios) {
      gameState.empresarios = { versao: EMP.versao, relacoes: {}, acordos: [], compromissos: [], mes_atual: 0 };
    }
    if (!gameState.empresarios.relacoes) gameState.empresarios.relacoes = {};
    return gameState.empresarios.relacoes;
  };

  // indice de apoio de um bloco (0-100)
  EMP.indiceBloco = function (bloco) {
    var membros = (EMP.BLOCOS[bloco] || {}).membros || [];
    if (!membros.length) return 50;
    var rel = EMP.relacoes();
    var soma = 0, peso = 0;
    for (var i = 0; i < membros.length; i++) {
      var r = rel[membros[i]];
      var afin = r ? r.afinidade : 35; // neutro-frio para quem nao foi contatado
      var w = EMP.relevanciaNoBloco(membros[i], bloco);
      soma += afin * w; peso += w;
    }
    return peso ? Math.round(soma / peso) : 50;
  };

  EMP.indiceBlocos = function () {
    var out = {};
    for (var b in EMP.BLOCOS) out[b] = EMP.indiceBloco(b);
    return out;
  };

  /* ---------------------------------------------------------------------------
     INTEGRACAO COM A BASE DE PERSONAGENS (regra 1: ADITIVO)
     Converte as 40 fichas para o schema de CATALOGO_FIGURAS_PUBLICAS e injeta,
     preservando a TRAVA: candidato_ativo = false, tipo_ator = FIGURA_PUBLICA e
     probabilidade_de_entrar_na_politica BAIXA.
     --------------------------------------------------------------------------- */
  function figuraDeEmpresario(e) {
    var per = e.perfil || {};
    return {
      id: "EMP_" + e.id,
      nome: e.nome,
      profissao: (e.tag || "Empresario") + " — " + (e.empresas || ""),
      categoria: "Empresario",
      alcance: per.alcance || 70,
      popularidade: per.popularidade || 55,
      credibilidade: per.credibilidade || 60,
      influencia_politica: per.influencia_politica || 75,
      capacidade_de_mobilizacao: per.capacidade_de_mobilizacao || 30,
      audiencia: (e.empresas || "") + " (" + (e.tag || "") + ")",
      regiao_de_influencia: (EMP.EIXOS_GEO[e.eixo] || {}).nome || "Nacional",
      posicionamento_ideologico: {
        economico: (e.ideologia || {}).economica || 0,
        social: (e.ideologia || {}).costumes || 0,
        estado: -20, institucional: 60, ambiental: 30, seguranca: 0
      },
      temas_de_interesse: e.pautas || [],
      afinidades_partidarias: per.afinidades_partidarias || {},
      relacoes_com_partidos: per.relacoes_com_partidos || {},
      // ---- trava de elegibilidade ----
      probabilidade_de_entrar_na_politica: per.probabilidade_de_entrar_na_politica || 8,
      filiado: false,
      partido_atual: null,
      candidato_ativo: false,
      tipo_ator: "FIGURA_PUBLICA",
      // ---- campos do modulo de negociacao ----
      empresario_id: e.id,
      bloco: e.bloco,
      eixo_geo: e.eixo,
      setor: e.tag,
      empresas: e.empresas,
      frase: e.frase,
      vantagens: e.vantagens || [],
      desafios: e.onus || [],
      acesso: e.acesso,
      pedidos_tipicos: e.pedidos_tipicos || [],
      biografia: e.descricao
    };
  }

  function registrarNaBaseDePersonagens() {
    if (typeof CATALOGO_FIGURAS_PUBLICAS === "undefined" || !Array.isArray(CATALOGO_FIGURAS_PUBLICAS)) {
      window.CATALOGO_FIGURAS_PUBLICAS = window.CATALOGO_FIGURAS_PUBLICAS || [];
      return 0;
    }
    var base = (typeof window.CATALOGO_FIGURAS_PUBLICAS !== "undefined" && Array.isArray(window.CATALOGO_FIGURAS_PUBLICAS))
      ? window.CATALOGO_FIGURAS_PUBLICAS : CATALOGO_FIGURAS_PUBLICAS;
    var existentes = {};
    base.forEach(function (f) { if (f && f.empresario_id) existentes[f.empresario_id] = true; });

    var add = 0;
    CATALOGO_EMPRESARIOS.forEach(function (e) {
      if (existentes[e.id]) return;
      var fig = figuraDeEmpresario(e);
      if (base === CATALOGO_FIGURAS_PUBLICAS) CATALOGO_FIGURAS_PUBLICAS.push(fig);
      else base.push(fig);
      existentes[e.id] = true;
      add++;
    });
    try { window.CATALOGO_FIGURAS_PUBLICAS = base; } catch (_) {}
    return add;
  }
  EMP.registrarNaBaseDePersonagens = registrarNaBaseDePersonagens;
  window.empRegistrarNaBaseDePersonagens = registrarNaBaseDePersonagens;

  // Registro imediato (modulo carrega antes de garantirSistemaInfluencia())
  var _add = registrarNaBaseDePersonagens();
  EMP.registrados = _add;

  /* ---------------------------------------------------------------------------
     FOTOS — Wikimedia (Câmara/Senado/Wikipédia) + base64 fornecidas + logo
     Injeta em window._fotosEmbutidasMap, que tem precedencia sobre porNome.
     --------------------------------------------------------------------------- */
  EMP.FOTOS = {
    "Jorge Paulo Lemann": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Jorge_Paulo_Lemann_em_fevereiro_de_2012.png/250px-Jorge_Paulo_Lemann_em_fevereiro_de_2012.png",
    "Luiza Helena Trajano": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Magazine_Luiza_Luiza_Helena_Trajano_%2851387211323%29_%28cropped%29.jpg/250px-Magazine_Luiza_Luiza_Helena_Trajano_%2851387211323%29_%28cropped%29.jpg",
    "Joesley Batista": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Joesley_Batista_na_CPMI_da_JBS_1_%28cropped%29.jpg/250px-Joesley_Batista_na_CPMI_da_JBS_1_%28cropped%29.jpg",
    "Andre Esteves": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Andre_Esteves.jpg/250px-Andre_Esteves.jpg",
    "Roberto Setubal": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pedro_Moreira_Salles%2C_World_Economic_Forum_on_Latin_America_2009.jpg/250px-Pedro_Moreira_Salles%2C_World_Economic_Forum_on_Latin_America_2009.jpg",
    "Luiz Carlos Trabuco Cappi": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Luiz_Carlos_Trabuco_Cappi.jpg/250px-Luiz_Carlos_Trabuco_Cappi.jpg",
    "David Velez": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/SAM_5134_%28cropped%29.jpg/250px-SAM_5134_%28cropped%29.jpg",
    "Blairo Maggi": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Foto_oficial_de_Blairo_Maggi.jpg/250px-Foto_oficial_de_Blairo_Maggi.jpg",
    "Guilherme Leal": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Guilherme_Leal_Cropped.jpg/250px-Guilherme_Leal_Cropped.jpg",
    "Joao Roberto Marinho": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Jo%C3%A3o_Roberto_Marinho.jpg/250px-Jo%C3%A3o_Roberto_Marinho.jpg",
    "Familia Frias": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Otavio_frias_filho.jpg/250px-Otavio_frias_filho.jpg",
    "Edir Macedo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Edir_Macedo2007.jpg/250px-Edir_Macedo2007.jpg",
    "Jose Isaac Peres": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Jos%C3%A9_Isaac_Peres.jpg/250px-Jos%C3%A9_Isaac_Peres.jpg",
    "Marcelo Odebrecht": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Marcelo_Bahia_Odebrecht.jpg",
    "Francisco Gomes Neto": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ozires_Silva.jpg/250px-Ozires_Silva.jpg",
    "Elon Musk": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg/250px-Elon_Musk_-_54820081119_%28cropped%29.jpg",
    "Larry Fink": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Laurence_Douglas_Fink_%28cropped%29.jpg/250px-Laurence_Douglas_Fink_%28cropped%29.jpg",
    "Jensen Huang": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Jensen_Huang_20231109.jpg/250px-Jensen_Huang_20231109.jpg",
    "Tim Cook": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tim_Cook_in_New_York_City_-_2026_%28cropped%29.jpg/250px-Tim_Cook_in_New_York_City_-_2026_%28cropped%29.jpg",
    "Mark Zuckerberg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Mark_Zuckerberg_%282025%29.jpg/250px-Mark_Zuckerberg_%282025%29.jpg",
    "Sundar Pichai": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/250px-Sundar_Pichai_-_2023_%28cropped%29.jpg",
    "Jeff Bezos": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/250px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg",
    "Bernard Arnault": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bernard_Arnault_%282%29_-_2017_%28cropped%29.jpg/250px-Bernard_Arnault_%282%29_-_2017_%28cropped%29.jpg",
    "Marcos Galperin": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Marcos_Galperin_%28cropped%29.jpg/250px-Marcos_Galperin_%28cropped%29.jpg",
    "Carlos Slim": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Carlos_Slim_Hel%C3%BA.jpg/250px-Carlos_Slim_Hel%C3%BA.jpg",
    "Wang Chuanfu": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Wang_Chuanfu_IAA_2023_1X7A0154.jpg/250px-Wang_Chuanfu_IAA_2023_1X7A0154.jpg",
    "Ren Zhengfei": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Ren_Zhengfei_%282016%29.jpg/250px-Ren_Zhengfei_%282016%29.jpg",
    "Gautam Adani": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Gautam_Adani.jpg/250px-Gautam_Adani.jpg",
    "Yasir Al-Rumayyan": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Yasir_Al-Rumayyan_Argentina_v_Spain_19_July_2026-285.jpg/250px-Yasir_Al-Rumayyan_Argentina_v_Spain_19_July_2026-285.jpg",
    "Jamie Dimon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/The_Global_Financial_Context_James_Dimon_%28cropped%29.jpg/250px-The_Global_Financial_Context_James_Dimon_%28cropped%29.jpg",
    "Glencore (Gary Nagle)": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/CargillLogo.svg/250px-CargillLogo.svg.png",
    "Rubens Ometto": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Cosan.svg/250px-Cosan.svg.png",
    "Guilherme Benchimol": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Logotipo_da_XP_Investimentos.svg/250px-Logotipo_da_XP_Investimentos.svg.png",
    "Harry Schmelzer Jr.": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Weg_logo_blue_vector.svg/250px-Weg_logo_blue_vector.svg.png",
    "Walter Schalka": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/SZN-Logo_Preferencial_Vertical_Positivo_Preferential_Vertical_Positivo_RGB-01.png/250px-SZN-Logo_Preferencial_Vertical_Positivo_Preferential_Vertical_Positivo_RGB-01.png",
    "Alexandre Birman": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Logotipo_da_Azzas_2154.svg/250px-Logotipo_da_Azzas_2154.svg.png",
    "Jorge Moll Filho": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Logotipo_da_Rede_D%27Or_S%C3%A3o_Luiz.svg/250px-Logotipo_da_Rede_D%27Or_S%C3%A3o_Luiz.svg.png",
    "Abilio Diniz": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/GPA_logo_2013.svg/250px-GPA_logo_2013.svg.png",
    "Rubens Menin": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/CNN_Brasil_%28red_background%29.svg/250px-CNN_Brasil_%28red_background%29.svg.png"
  };
  window.EMPRESARIOS_FOTOS_URLS = EMP.FOTOS;


  EMP.FOTOS_B64 = {
    "Rubens Ometto":  "data:image/jpeg;base64,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",
    "Guilherme Benchimol":  "data:image/jpeg;base64,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",
    "Walter Schalka \u0026 David Feffer":  "data:image/jpeg;base64,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",
    "Alexandre Birman \u0026 Roberto Jatahy":  "data:image/jpeg;base64,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",
    "Jorge Moll Filho":  "data:image/jpeg;base64,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",
    "Rubens Menin":  "data:image/jpeg;base64,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",
    "André Gerdau Johannpeter":  "data:image/jpeg;base64,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",
    "Harry Schmelzer Jr. \u0026 Décio da Silva":  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQUFBAYFBQUHBgYHCQ8KCQgICRMNDgsPFhMXFxYTFRUYGyMeGBohGhUVHikfISQlJygnGB0rLismLiMmJyb/2wBDAQYHBwkICRIKChImGRUZJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJib/wAARCAEEAQQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6oZlRSzEBR1JrN1LXtH0yEz6hqENtGP4nOBVy9/49Jf8Adryf4uj/AIkDfhSk7RbJk+VXO1/4WF4J/wChksv++z/hUsHjrwhOwWHX7NyewY/4V8pRo0sgUA7q7zwppQRlllXPFcaxLZzKu2fQC+JNCYZXU4CPrUb+KvDqfe1a3H41wcVukdvjYMNxmse+sQr4x15oeIktkV7ZnqY8V+HD01e2/wC+qkHiXQSMjVIMfWvGJownIXpUL3YRGyaX1iXY0U2z2eTxd4aj+/rNsv1aq0nj3wbH9/xDZr9X/wDrV8+atqA3kKc1y2p3ZYEJ1Pep+tSvsVzH1K3xH8Cr18T2A/4H/wDWp8XxD8Ezf6rxJYv9HP8AhXyPBbSyuCc8nivTfA/gO5uFS91Mi1tW5TcPmb8PSr+sS7AnKTtFHvEPi7w1N/qtYtn+hNWIvEOiStti1GFz6KSa4VzpGgwHaFDp0jCgu3vjrWSvxB04TvCls0G3+Jo8n8cU/rD6nVDDze56pJrelRgs94igf7J/wrLuPHXhG3XdPrttGPVsj+ledXPxAsRGzfao3jwcNHIAwx1+WqZ8U2WowN5JMo7+bCJVbP0/+vR7eT6FvDtdT0U/E3wArbT4qsAfTef8KevxI8CN93xPYn/gZ/wrx3V7Wxuoc6jo4ijAyJraHafoMCsePw1DLaC704vMgGWidNsi/UVMsRNfZ0OapCcNdz3w/EbwMBk+JrH/AL6P+FMPxK8Bjr4osP8Avs/4V84TWUOWXABHWsy7s0A+7VLEN9DBVD6iPxL8BD/mabD/AL7P+FL/AMLJ8B4z/wAJRYf99n/Cvk5bUs+1UyKlewlIxxxVOu0Wpo+q/wDhZXgP/oaLD/vs/wCFB+JfgIdfFFh/32f8K+U4LGTd8wrSg0Qy4LAYNL6wHMj6cHxI8CEZHiewx/vn/CgfEjwKTj/hJ7D/AL7P+FfMF3pP2ePI/KsqGFvM560fWGJSbPrT/hY/gX/oZrH/AL7P+FSp4/8ABb/d8R2R/wCB/wD1q+SJ4ytWbeQqBTjXuNyZ9Yjx14QPI8QWZ/4HTh438JE4GvWh/wCBV8rxXJAIzU0N4VkXnGDVe1YuZn1hoviHRNcnu4NJ1KC9lsiouFiOTGWGVz9QDWrXh/7OEnm6143k9ZbP/wBFPXuFbp3RohDRSmimBDe/8ekv+7XlHxcONAY/SvV7z/j0k/3a8p+L6FvD7BevFRUV4NGVX4WeN6eVEoYrXb6LqEUW1H6HpXJaTbZUbhz71txxhenNeKk0efY9I01xPGBnIPSnX9rlDkVzGkamIAqyNtxXQJq0MqBSwYVtzBcxpoThmIzjrXG+KbhrUhkPytXpSxQyOzKRtPauL8YaKZonEfTrUXubQqWPN5Lh5HJ3E0kEBnlC4OO5pTay28xSRGAH8WK07u+s/DXhuTVrk77+4PlafAuCTIf4yPQf0qkruyOyMfaOyOp8N2ek6S6T35Wa7Ch/J3fJCM8F/UnsvWpPE3xCit5fIS6eNg2CsYBf6Hsn05NeG6l4y1K3t1tIbp97/NcXTN8xY9Qp/mw+gNc2k11PmSC1ublc5LKjbT75rdUmtz0oRjFWij3IeOFnDS28GTziMuGZm9+maz9b8S6lAEFziEygERQkDZn1Cjn6V5dY6hqdqGb7NLAMYLiE7gO+CRx9a6Gy1eS9gWG30a4kUDmUIWcn1z2FJxSOyKbWxtr4ijlmC/ZleQdZJWwVP54H61M3iCZXxFfwS7TwGRVJPocHkVX0rw295LsXRL4MR0lXAHuTXS2fw/uyc/YQSRgtJgAfhS54ov6tN6nOjxVfvIQzDDAqTbgAn9OBXQaF4oukYXSJNDGvJJn3hvbGKwfF3g290hYpE+eKX7yqTjjkgVjaY9xa3YZJfKKYZVJ+8PQVtGUZLQ5KlGUNz168jtfE9iNR0zat9GvzxKD++Hf/AIEP1rn1tiVxIp+pFZvhjVJ7LUAI5hGqkNmP7p5549Oa77xGtvNYx6nBF5Du5SeP0fGcj2Nc2JlKnHmieXiKNlzo5aO0jU8gUk8MYGFyT9KtRLvAzVnycnkVxKo5I4OZmbb24J+7WzbwhV4WmLGqjPQ1NHOijaTVJvqO7M3VhuBCrise1sN0pYjvXUXKRyYK4qBIQhyKbctiozsYV3pynkiqa26LJtIBFdLeIxTOOKxxbuZdxFX7SyNOdNlKe3EZyowKqSRP1Ga3rqE+WCRxVaNQVORW8JNlNno37L5Y33jQv1860/8ARb17zXhf7NIC6t42A6edZ/8Aot690r1I/CjZbAaKDRVDIbz/AI9ZP92vM/imoOhH8K9MvP8Aj1k+lecfFFN+hMPpUT+BmVX4WeP28ojXjqKsxzsx61mEbHAyeK1bCEuNzc141zzmSvM2ABzTra4mibcrHHoae0IGSOtRTJgAd653PUzbN3T9YdG2s3Wtdp47yIqepriYw27PStG1vGjbGa1jILlfX9OhVHJHvnFeLaolz4o1eSZpvs9jaJ5VvGzZJPp7ZJyT+Fe567Mp0e8n3bdkLHd6cV4XpcSxeVGgJ85htBb3/ma7aKV7nsYK8otnQWfgrSoXW5lla9n28vLjaOP4R7V6J4W0+C1tI4REqoxI2qorh7e623x3ksoADDPNeh6HLHNHuAK7AJEXrkj/AOtms6ruz6jDU0om9HaWsaMphQjgYZc9auRW9uInYQoqjA4UYpjq4tA+Ad8i4x+NPmkVHjhB+8MlR79KxOll60tY3w5QDd2PpWqtnCq4CD8DWfYDcm4A7cYXn860NxGAuCR6mhJGU7mJ4q8PxappzqSVkj+ZMfTFeIeJtAAl8m3QxSR4AJ/iK9Dn3r6KkfcgByQQevNeX+O4vs88jrEThSdu37wNaQ+IyqNuFmeeW+nzwXEM6BldQodT6NmvTdH8vVNDn0644nRCysRyCDx/UV574YuvNkmguH2nfgbuSAfun8D/ADrr/Cl5JMJ9w2zKZFIHGRjNbSV00zzqsIygzPtWZJNr9QcVroysvNczFchJGDtk579avw3nQbq86MLbHzdjRmcDjuKz53xlu9SvKJF681RuTlSO9b8rKQi6k6thu1XVvVZQQawGgnduuanVJ41HtV8uhpypm+tyrx7WqNwmPlrn5LiRccmpYr9tmCanluS4MuXT4GOtU0Y7TTHuVkJyaiM+xSBg59a0irFpM9V/Zp/5Cvjb/rtZ/wDot690rwn9mVt+peNW9ZrP/wBFvXu1erD4UdC2A0UGiqGQ3n/HrJ9K88+JZ/4khz7V6Hef8esn+7Xm/wATyTohx7VFT4GZVfhZ4/JGHfitO0YRw5zjFU0jJUYqdUPyoD9a+dlVUTzbEzXAZutMaQE+tMkiCE8Z96ii4YsfwFZX1MnuXwAFHqaljtiSAOSe4o0+ynnYMykL2rc8lLaLbxnuTXZCF0XGLZyHjRZF8JahtJ4Tn6Zrx/R5Q+twouSkf3d30r27xOgvNFvbGIF5JoiFVe57CvBfDCFbq+efIMaFSP7vBrthGyPawFuW3mdZBq+jWk7QvdLM2f3km3gnviun8IeKNPlu0lSUoBlCh9K8y0/wub4KbefEh56ce3410KeFNf0mDz4rczIBk+XyQPpSkon0FKVa22h73od1HeWdtkjqGGfTpmksX85JZ5Btk3yMQeo5I/wrzDwH4tjuLy0sbh2imTMbA9+c/nmvWbnTlkUXIyqkEk4wDnqa5mrbnbzaXM6bxXp9iscZjllJPVTgfXntUlx460+CMH7I8qkZ3Ljke1czeWlncyNFGWdlJDOvTFaGk6ValgUALAcc7sVScSJUqj1Z0ug+IdN1tWazdkYHEkUilGHvj/Co/GOlPeaY7xLmaNTtx1NLaWNuk6SrEgdT1BwQa6JF81MHnsaLdUZS0dmfMwnWPU7YGIo0cjK7Hg7Se4+teg6BFGt+5iO2K4jO3PPzkciub+IVgU8W3LRJsAO4qo/Wuq8B6Xc6q0Mv2kWywFWdhySBzjHuOK6eZWuzilBu8UcJKHW4kyc/MeQc1YglPHJyK3fG+hxaPeLPZzNPZXLNsLptaNx1Qj8QR7VzUUig5zWEUrnzlSnKnJxktUa8c+BQZMknFU45AR1qdOnNbcokTRzIpORzVlZIpE5wKy5F+brUiECPg1FizRNpFIvy4Oaz5bQBioFXdLlBUqx5FSTgCRSO5xWdtbAYs9iyjcODVCZJAp6mutmUGHBHasvyVZipFWkFz0P9lvP2zxnnr51p/wCi3r3uvDP2a4xFq/jdB2ms/wD0W9e516cPhRutgNFBoqhkN7/x6Sf7tea/E0gaKSfavSb3/j0l/wB2vJ/i/cfZ9AL5xgioqK8GjOoro85E6Ko5GaRLpd/ykH3rmYNQMrZzV+zYsc9z2r5ydB7s43Gxsz3DGLjkmtXQdNaZg8i59Paq2mWJkZWcV2enRRW8Occ9qOW0tTPkvqSOsNlb5P3scCuV1fUWdzGhxnrWzqs2VPzZNcPqtx5Ttjl8Vs6j5rIGU9TutxMO9huBUlTg8155Y2wjtdWuoYx5auqEnvk10Wo3Em8fWqelQpJpdzY7tga7JkKnAIAHFddKTdz1sv2Zj2X9pqJ2srho1iUsvlAcvjgc103hnV/Htjp8t3cS/aYkLFYLuFR5q8YCsOQevUY6VcggFgkEux0ilXKvHGCoGcY/MVX1e/mliEds0m3GDLIeB9BT576WPplRaV3Jo5rTrq7v/iBHqIsxZ+bKrGIHIB79K+n7mZ7zw7NbwfLI9uUU+hI4NfP/AIEtEm8TQIULqoJZ/wDaPevoOGEW5QFsgKAMdxWVTV6GkIpR1PLoYLm3jjguEd448Cb7M+CT3Gev5Vzeh+CfET+JHu7e8uYrfzg6yrdOjKu7JA7cjg5BFezX2hQzXBvLCQRyuf3kb/df/A06C3eBCGhaMj+6RilGbgrWLqRjV1vqUdItNftWZdSuI72AE7JkQKwHYMB1/wB4dfSustmOxc+n93bVLTQ7LuJBz2bvWkdoTg4IHI6fpRF9TCro7M8d+IMIbxg4G7LxbSB0JIOB9a7/AOHmgG2sReSHBkh+Vcdc1ka7pL3vijTZoot6yygTY6gD/wCtXXKH0i/MZdmhmAEZPbaMbauUvdRjCLcmlucT8XFT+wJXYBTFcwsPqysDXj0bktgGvTfjnqKJPZ6VG3LM1zKo7fwoP0JryuCT5jTpq0TxcfJTrNryNW1ch+a0g425FYsb8jmriy8VqpHnNFx2DL7inw4II9RVHzeuadDchTjNJsZat5DHKecVZM25l571TR1b5zTJnxgqe9Ty3dwN6fmPg9qrQqCCxGajScsgHtU9tny2+tTF9BM9B/Zx/wCQ344x/wA9rP8A9FNXt9eIfs4/8hzxx/12s/8A0U1e316kPhR0R2A0UGiqGQ3v/HpL/u14z8dQ3/CMsFHcV7Nef8esn+7XlfxZtjdaJ5Q7kUpfCyJ7HzrpjlW2t1712Ghwec+4/dHSs+bRGRxhcEdDWxo4e1UKw6d68yWu5yuR1duvkQggUst+6jGcAVSjvBIoUdBSTfNg4rixEHLVCIry8kdSQetc3fbi7M/Nb0qux2qp21l6jBJtbC0oR5VqS1qctfRlyCAODWTLEts0tnbyvJtlJZiu0k9Sf1xW/cW8oHzKax75vs1xJdTAtJJgAHjOBj+ldVM9XLpJTaZ1Gm3L3Wmx2jAiOMADNc/4u1FIAlnagefIcA+laGkzuNPadvTOfSvP7yaa7vZL0sSSf3eeeKqKvLQ+pqPkp3e7PRfhVNKmtNvw8aIA7epz1r35wSo2rtJAZT7Gvl74d+IZNP1OSG8UL5oHlsikZIPT617rFrJ1u2jexu3i2IqyFANxx/DyOKbi+YwjNOCZq6vrNzpUBuZoPOgjx521csi/3hjsK1NNvLPVYFns3SaNlByp9awrHzoY2NxM88bZDmUD7v0FchEZ/BOvE2zO+h3Db1I5NsT1U/7Poe1ZuLWp0R5JaLRnrMUIDHAAx2pl82wMc87ar2mqx3ECSK27cMhqS5lDxsWPPcUXVtDGUZJ+8M04BNThkycKrMeM9qt21vdXElxfah5Esgc/ZlUkLGmeC3v61nrqVpps0uo37rDbQxZkc9AOn8yK4n4j/EG0u9Nk0fQnkJl4nuQCuE/uD69z6VcY3OKtXjRTk9zz/wAf3v8Abvi7UL2GQvAHEUTeqqMZH1OT+NY0Vi56Gp4nXkBauwTID93pWux85Kq5NyZRSynDY3VKY5IxyDWxHLEWGRg1LcQI8ZIFQ2RznOvIy9QajScb+TWutoJOKifSsnOOKFqWpIijmAUDNL5oZgaZcWrQDgVQWciTB4o8ikrnRQzLgE4rQtpkEeCeprmkn6YqZJ2454pKJNj2P9nFg2t+NyP+e1n/AOimr2+vCv2Z236p41b1ls//AEW9e616UPhRstgNFBoqxkN5/wAesn+7XnHxDkVLBC3qK9Gvv+POX/dryn4qSFNPQg4+cVFR2g2ZVPhOPcwyryoBqE20We1ZaXmwfM1V7jVTyA2K8xc0jgbNvEcZ+8KhmvUQHLCuf+3SyHg1Hcb2GSx+lX7NdQTZ0MV7EeriiSeCR9hYVy0LspIz0qyJSHVs/WpcEirnQTW1u6dR+dcb46skXTobqPnypcH8RW+84EOScVzetXZuLG4tGbO4cfUHIpLc6cPPkqxkVhJ5fhCFmPN5dLbnjouMt/h+NczeslvqnlAoYx1Oa7Dwt5Oo6TY6bKQHhmluh/wEAY/ImuU8RWVhc3Ed1Fbj7O5IDHqDmqhofW1rzSO48HXmjKMTm3VuSOOfauv0E6fp9zNdHUYYkl+f5m+UGvOPD/hrw9fhbmWMxuPvvHIyr+QrttJ8D+FWkj+2Mt1uyVV2ZgB9DTbV9zeMFy3a/E7FvEGkuu6O/tZG6AqwOOO4rLPiK3muhZm2e4ym3JjO1kPB5I5FbunaNo1gnlWVjDCCAQUjHFWtUsklstqBfMAO1z1H0qXJmbhDoYnhCGaxvL3SpCWtoyJLYnkiNuQPwOR+FdOx/dj+6OPrVVI0ZLK7UDds8uT/AHc5H6/zpmqXLRhYw2Xc4AxjNY9TWXvJGT4sVrrw1qqr8o2Lz14VgT/KvH5eZGLHJYk5FeseNNQh0nwTqE0rfeCwD3ZiB/jXkbuGUMpyDyDXXBPlufNZnpUiOUBX+oqaBhu5qoZORTreUBzmhnlGlOwUq1a0UqPbg56isK5kBQY9KsWkjeSorCbsrjNG3A89sVYEjAGqtmCZGNWghOTVJ6ARSRC4TpzVA6Tls44zWoqFW6UpR1yQaSY07GVJpZUEgGqbwsmQO1dRAwaP5+SKoz2pdm2ii+pameg/svZ+3eNM9fOtP/Rb17zXhn7NUflat42j6Yms/wD0W9e516cPhR0LYDRQaKsZBff8ecv+7XjHxmuDDpiHOPnFezX/APx5S/7teF/HNsaXEPVxSl8LMqvwnmcF1vGM0OhZ81k2M21gCa3oMOoNcLdjz2MRdpzirJwUpWiGKTACY71m5AVHXa2c9aYxIPBp1wwyOahZ+eOeKm4yG+vtsZ55Fc1NdtJIc55Nb09pJMfkRnY9AozVE6JdeZmRUhA/56MBVQhKb0RpFMyor2bTrl/KJBeNgh9N3FdFodiLzQpIMCR1PIP865nxa9tpNisjz+dOWGxUGAPXmtPSry50LVDpmp7U8xFDENnaHXI5/GtZ0pQ3R9NhMR7RJS3Ou8OQwQ3SJBECrYDBj0+teg6TbxRyBQAM/MG715j4fuGS/wBku3duJLE8GvRor6BruC3Mq58sMHz1wc81zy3PZpqPKdZJlUxtDBR949qmRFkg/fEYYZI9KzY9RhNsgllj3qcEofvVia5rksmYbA43D5m7CluZNWNGa72TiCKVRCMsP9ke9RQh5ZvtUucn5YgfT1+prE8P2t5Ijy3zEpnJUcmQ9h9K9E8K+G59SkW+vRsth90DgsPRfb3/ACpRg5SsglUjSp80noeO/H+XyPDOh2e7Burp5QoP3kjXG4/8CbA+lec6JfRSwC3mk2vj5Gbp9DXR/tEa3HrHxMurO2I+x6LCtlEq9Aw5fH4nH4V5oGwff1r2oU1GHKfM4ibrS5mdnKpR8HimIx31m6Vqcezyr7cyqPldTyP8a0I2tJm3W14rZ/hcYP51yzoS6anC4NFuVm2AZq9ZSZRRnpWZOZFRSyHHr1FLZTnb1zzXFUi7WJsdZp7DLH1Aq7IVWP8AGsCyudozmrV3eAIoz2qFewjTjYMwHvUz4DfWsSyvAec8g1be53NnPaktGDNGOLdyO9D7VfGaz7a/2gqTUN5dZYMG61qI9S/Z2YNr3jgj/nrZf+imr22vCv2Zn8zU/Gr+s1n/AOi3r3WvRh8KOyOyA0UGirKK+of8eM3+7Xgvx1b/AIl0I/2xXvl3G0trJGmNzLgZryz4neAdf8SW0UWmm0BVgT50pX+SmiXwsyqJuOh82w7jIAK37OQxoNxrtbb4KeMo2DM2mH6XDf8AxFWW+DvjPbhW03/wIb/4ivPnCfRHJ7KT6HKJKHQVE5kZiI0LH2FdzF8JfGMUQAGms/vctj/0Cql58J/iJLGUjbSQD2F0w/8AZKuOGb1k7Fxot7nBXA8sk3VzFCR23bj+QrPk1vTbQEopnb1c8fkK6m9+BfxMnJ2nRQP+vx+f/HKy2/Z4+JrvueTRcf8AX4//AMbrqjRpx8zZUYo5e78V3UoKROI1/uINoH5VmJqrzz7Fn3Hue3vXdT/s8fE+RMJJoi/S8fgf9+6t2P7PPxAtrZlzoxkYY/4+3/8AiK6FJGiVjwzxVfNealFGzAomB+tegfEm2Meof2oAWjYLHMP7oA+Vv6fjWvc/szfEye4aYy6ICxzgXb//ABFepaz8G/FOoK0bf2c0bxhWVp254wf4aymuY2py5Xc+erK+ngeN1umC54YHkV22l6Xc6rJBPFq8nmfdGByBWiP2c/iLb3DxQzaPNaZ+QvduGA9/kr1z4efDLxBoGkNFqKWDXg4VopSwx9StcU4SS0R7FHEU38TPH57q50q48iZbhvmwJZSTuPsK7Lw7DNflGWB38zGAF5J9h3rrrn4Wa5qGqefeyWSQB8qqyMxA9TxXpXh3wzZaJGBBGGmIw0zcsfp6D6VMKUp/Foa1cXSpL3HdmP4Y8ICJY7nVVUkD5LYdF/3j3+la3j3xFb+EfB2qa9KFxZwExJ/fkPCL+LEV0IXAryX4++DfGXjiw03SPDrWMdhFIZ7o3Nw0ZdxwowFOQOT9a7YQjHRHiVKs6sryZ8hvPNdTTXd05luLiRpZXP8AEzHJP5moSMNXsI/Z7+IIXG/R/wDwLb/4ik/4Z6+IJOS+j/8AgW3/AMRXRdGZ48z/ACsB/dP8qo2l84UfMc17V/wzv8ROf3mjdP8An7f/AOIrPT9mv4kqOZNE/wDAx/8A43U3QHAWOu3Nvwk7D2zkVs23iCGQj7RaxP2yvyH8xXUr+zd8SQf9Zov/AIGP/wDG6lT9nT4lKeJNF/8AAx//AI3SdnoyXFMx7a8sJQPKuWiJ/hl5H5j/AAqe9WZ03JiRR/EhyBWyn7PfxJXrJox/7fH/APiK0LT4F/E22bKT6QP+3x//AIisZUKb20M3TXQ4m3mkj7960Ibludx7V38Hwa8duP8ATItIZv7yXbA/+gVI/wAFPGQ+5JppyO9w2f8A0GueeHa2JcGedrcgHrSTzgqOa7p/gh46Jysml/8AgS3/AMRQ3wR8eFcb9K/8Cm/+IrN0pW2FyM6T9llt114zb1mtP/Rb175XlPwJ8B6/4JbxA2uG0J1GSBofs0pfhFYHOVGOor1au2CtFG62A0UGiqGFYUuvOk8kX2ZSEcrnf1wfpW7XC3Lf6dc/9dW/maqKuZVJNbG8Ncc/8uy/99//AFqcNbb/AJ9x/wB9f/WrBRqeHquVGfPLuXr/AMTyWq7hZq/1kx/SsK++IdxbRGQaTG+O3nkf+y1X1lv3Zrjta/49Wp8qIdSV9zrNL+KNzfXIhOixID3FwT/7LXXweI3kjDm0UZ7b/wD61eGeGh/pyn3r1Sz/ANQtEYpopzlfc6P+3n/59l/77/8ArU7+3H/59l/77/8ArVhD3p4p8qD2kjb/ALcf/n2X/vv/AOtSjWnP/Luv/fX/ANasUUoNLlQ+eXc3V1Z2/wCWC/8AfVPGpSn/AJYL/wB9VixPgir8BDUmkUpMu/2hJ/zwH/fVB1CUf8sB/wB9U1QtKwHoKVkVdiHU5AMmAf8AfVeZ+KPjRb6Rr40az0kX02cEiYjn0ACmu08V3sWl+Hr/AFCQlRDCxGOuTwP1rxvwZ4c+zB9b1GLdqd58+H+Ywoei/XHJrlxFRwSUdzqw9J1Ja7Hbz/FPVooVd/DMaMwzta5P/wATRD8VtRaN2l8OpHtGQftBwf8Ax2qrQI6fMgYe4rN1GMBGAQAY7V5/1ir3PTWEpvoaE/xjv1jLw+G45QM8faiD/wCg1mj4+iOVYrvw8sBzhibkkD/x2ubujFF96Pg8jtWXrfhWHXNGubmKMboYjINnU4ranWqS6nPVw8YI968LePbPxHbmaxtz8v3gW4H41vf2s/8Az7j/AL6/+tXg3wBtns1iLTHZdRnajV7f5XtXpU3zRuzy5cydky0NWc/8sB/31/8AWpf7Vf8A54D/AL6qp5dIUAq7InmkXf7Ub/niP++qP7Uf/ngP++qohc0/ZRZBzMtf2q//ADwH/fVJ/azf88B/31VJ0qIjFFkLmZoHWGH/AC7j/vr/AOtU1jqbXNyITCFyCc7s1iPVnQ8/2kv+41DirApu9jpDRQaKzNwrz+7P+n3P/XVv5mvQK8+vSPt9z/11f+Zq4GFbZDkb1NP3Z4zVYMBTg49a0MLlLWDlDXJav/x7Gup1ZgQa5jWB/oxo6EdTH8Nj/Tl+pr1Gz/1C15l4cH+mD6mvTLUgQLSjsaPcsU8GoDIvrR5yjvVCuWhRmqouF9aUXKetAXRbBOaswS4rNFwPWnrcL60rFJ2N6OYEU/zaxY7oDvVqO4B71NjRTMTx/KJ7S1048rNKJJB6ovb8TisWBd2D69aseJbuO41xYF58qIDI9SeahtiqttLjd6V5OId6nkexhNKdyWRAuM9TWTqCglR1BPIFa12SqZrMnw8QbOMiueSPQg+pwvieeOGNwWxzwaj+HmueXczWsjo8Tg/LnBAI5/A1B47t55gTAjbQegFcVocd/a3xk8pwpzx3xWlHSRjibNWPVvBzRaNr9kkL7oVuSF6jYjE8Y/H9K92xzXzZBcuLdXjCm52iWPOfmIOcV9DaXqEd9YQXaumZEVmVTnaxHINepTeh4dRWkW2FRt9KHnUd6qyXS881sjJtFhakUjFZjXajvTkvFPeixNy89QPTRcK3ekZ1PehBcjerOiD/AImKn/YaqrsPWrOiODqSgf3GpvYF8SOkNFBorE6QrzW/kxqN2P8Aps//AKEa9Kry3UpANSuxn/lu/wD6Ea1prU5q7skPEhpfMNUjOBxmkN0oHUVtY5OYL5txNYesD/RjWm0wkPBzWfq4zbGk9hrUx9AO25B9zXcJeBYR81cHpreWS3vU19rPlDarVFPXQupKx1dxqar/AB1V/tYHgPXA3GrTyH72AaltrmRhlm/Wt7I53I7f+1Rn71ObVB/fFcgJj61BNeMGxuxSsHMzt11Zem+p01JSM7xXBJcE87v1qdbt1/iJo5Q52d0NVVf4xVu11hMj5xXmk17Nk/OaZHqNwh4kNLluNVGjsLOJhfXE8sjF5JpWVWbJCluMe1c/4k1XR7QTiSTU/taHDPYQO+32OBitfSIJri4tNSkI2NbNEeeSd+en0FbN9ZPNb7YLmS23jlkOK+cmrSafc+xpJShGS6pHCeGvFBvpI9Ojubi4aY7YzPEUYH0bPSqHxD8XTeE5UspVLzSDKMDkeldv4f0HT7CaWWO5kurnPzO7ZAPsK8o+OVpEPFltc3DEw+WuSP4cHmoik3rsay91NIwJte1C/Rrq61S6gHVESzcqfbdjFT+F9Ze5mgtb27Dq8pjSUj50OOhA5xXpOh2K32iK39t3X2cx8Km0j8yK4Wws4tK8USTW0Kz7W3SvIdzuPrWtOUb6IxnRko8zOi8dFtP0y0vbeQxy/wCpDIcHJ6/yrQ/Z6vrmO512Ca4kaNFjIVmyMknn61kfEQLN4Qn3o283MZtgDnJbOBU3weknsNBv2uEYXJkCOWHOQMkfhmuyCbrJHBVahh5NntV3rCR53OPzrMk12IsSJR+dcBqF7POTuYgfWswysBjcfzr01A+fdRs9EuvEcKDHm/SmweJImOPMxXnIkPc5PvSicqeDT5SednrlnrKSAYkBq+upIeN4rxqLU5oiCrsMe9aEPiKXGCTmlylqqz1OXUUH8dW/CWoLceII4Q2SYnOPyrx678RzBT8+BW78HdXlvviBDC7Fl+zTH9BSkvdZpCo3NH0CaKDRXMeiFeG67qSx6xfruHy3Mg6/7Rr3Kvm7xDYyvr+qMWIzdykD/gZrWnuceKeiLM2sIp5cfnUL6up+6w/OsCfSpS24ucVZt9LwB85J963ucOp0mjXRnOe2etXdW/49zVLQYPKULirurD9xUSehtA5+HiFyO1crqdwRdEV1kQzBJXHakv8ApjGpp6FVRiyljk1pW0wCjmsoYAqRZCDwa1uc9jZE2ehqCVZHORmo7TLHk8VpbRs6UwMwPKhweau27M4HBpyQhn6Vp2dqM9Km41FsqfZiwzioJ7faM4roXtflyKzryJlU5oUh8hpeE9SMlt/Z7KfMtgXVuxUnp9ag1nUNUvr5NIsphaZUNLct/ApPAHqx5xWPod0tnrcTPwkmY2Ppn/6+K63VNHsdXt1trmAODIrN2PH0rxsZT5ankz6bLqzlRs90XJ4ru109V0+72mGPH72PzN/uT1zXh3xIfxALyG5vYI3wm3cOQf8ACvaJNGS1g8iFXliij+VmvHWTOe+c5GO/WvJ/GWjaqoedpYIYs4Jurxnx16AAVzpK53O7TOd8IeJr2wD2hdjbv90H+A/4Utxqc8Orm8Ld8MvrVDwno011rnmzXfmRJkuBwhAHYUt+yz6jcFRlXkO0D0zVWSloRzScLSO+8RSS6xoFnBbIS8sifd6jGeTW7pYNjpUNo7+bIi/O/wDeY9TWR4LhmurW5KJuSzjXf7bjWw8UjDAFephoK3O9zwcfVlf2S2K075JxVVgTVmWCZedpNRLDKf4a7Lnl2K5jOM5qJgQavG3mx92q00MicsKLisVZGxUJbBpZ2wTVWSXFAh07lgQTXafAjH/Cx4Mf8+k38hXBuzv90Zru/gOkg+JFuWUgfZJufwFKXws0pfGj6aNFBorkPXCvCNaiZ9b1D5cf6TLz/wACNe714Lruoqmsaig6rdSjp/tGrgcuJeiKU0IVORSQ7NoyO1U59R45H4VmtqTEnBxW6OG6Ow0wjtUurf6isvw5MZkDHrmtXV+YfwpS2NYswIR+4euS1Nf9KY118X/Hu9chqpPnscVECqpS71IsfOahViT0xVkHjrWpzlmFgnerX2pQnWsl2PY01NxPNLUDds7lWet20kWuNicxMDWxp928kqxRI0kjdFQbifwpNMuLOsDgpVWaJZRyKv6bo2r3Sjfam2U9WnO39Otb9n4YtlIN5dNL/sxjaPzrPU6eVyRwD6X506JGpZ3YKoHXNdNDOtpdCJ5Fl8ttjOOmRwf1rrWtLCwtZJreziR4x8rkZbP1rzbSQ11e6xZBsTQTiZc91cZP/jwNceMfuo9DA03GUtTsrv7M8LGQjBGc15f4rstPnBM75j3Egt1Na2s3+oW9r5TxMRggOvOBXD6xdm5gCTbmVew4zXAlzHtxqxitVqZEsy29xImmr5duvy7yfvVjSSxWh+Vg83r/AHah1S/MSEqoAHA7AVa8FaLcazepfXyFbNCCqd5Pf6V0UqTm7I4a1ZRvJns3wlt/7P8ADslxcRh3vOXU90rYexhD7ojmFxujJ649PwqhHfRWmmCGHHmMMDHZa3tLubSWCO0ulxIq5Ei9VzzXrqChGyPFm/aO7M1rRO6ioRaxBj8oravrWWBPOX99Af8AlonOPr6Viy3C7vvCp1OeSSBraMg4Wsu9t1AIxWgbpF6tWffzow+Vs01cylaxymqwmNiR69KyWyWHNb+o/vOBWWIcOOK1uQX9MgRsAqDXpvwms4ofGkEqLg/Z5R/KvPtKQAjNen/DAKPFcOCM+RJx+VRJ6M1pL30exmig0VynqhXzN4huAPEOrKT0vJv/AEM19M18u6/AW8S6uT3vpv8A0M1pB2Zy4lXSMy8uWPypzVRDJnpWqbUAdKhkiC9BW61R570Ok8IZ8oZ9a3tVH7g1jeEh+7/GtzWBi3PHaokbQ2OeiXNvIKxJ7VXmIIzzW7CcQP8AWs4nNx7VMGXVI006LZ/qx09KpXViBwq4rpYwu0UxrcSZJFacxhY5D7EeeopEtnU5wT9a6R7coxJHFa3hjRl1W+HmL/osRzL7+i/jRcajd2KHhXwlJrCi5u90FmDxgfNL9PQe9elaVpGn6ZCIbG1SBe5UfMfqeprQhjWNAiKqqowFAwAKkA6mobO2FNRRH5YAyOooiAKuzghV5zUy9KqahBNJbuluwV2BA352j3xSRozyXUviVfp4yGg3cUMVhK2wybSCjH7pz6Zxn61mPf3Gg/EC0N6rQpqED20gboHVty/zNdXqPwvsdRtnl1C4efUQ25ZFO0MM9KveK/BNvruhWscMri5tCrwv1dXXsc+3FLFUo1Ie6a4ar7OauVrwmNGkliElu/qM4rzjXlTUNSS0sbfJY8BBxXomlTytC9jeJ/pFsmXUEAsPbP8AWs641CK0lke20hLaTo0rMGY/j0/KvKw+FqVNtLHqV8TSp76s5a5+G9tBarf6phl42QAffb/a9var1lpxhCJDGFjXsBisW88TalY6sZdNH2ve372GTmI/4H3r0PQ/EOi36Rm9t30yYjlJF3Ln2Yf1r26dFUo2R4tWq6srsy7HR7m4kMk2UhQbj9BU/hhp7+MvnHzH5gOvt+VdZqt7psfh2/uLS5hl2wOBsYHkjFc98M4nFpLuO47gFX04pvYhHV6bA1qvD4z+INV9U8MWepfvbZzZ3Pqo+RvqO34Vv29uFfB5bv6CrLqAD3xWRTimtTx7WtM1LSpfKvISoP3ZV5VvoawHdw5yT1r3aQxXCSQTxJPD0ZWGQa4nxP4LRkku9FyxHJtWOTj/AGT3+lUmcs6LWqPOmO40gjU0ku6N2VgVIOCD1BpFkGetNo50WI96H5Diu8+EE8r+N4Fdsj7NL/SuCVxjOa7f4OSBvHcC/wDTtL/Ss5bG1L40e/mig0VieoFfOmr2rf8ACQ6oxHW8lPX/AGzX0XXkOp+B/Es+q3tzDBbGKa4kdCZ8HBYkdquDsc9eLklY4+W2BTjH51n3Fm2OCK7r/hBPFJ4Nvbf+BH/1qafAHiZusFt/3/8A/rVtzpHG6M30MTwvF5aYYjNbGtbTb8elWrfwP4nh+7BbY/67/wD1qmufBvieaPaYLbP/AF3/APrVDkmaxpyXQ4uLmBvrWLcrcbiyDoa9Fh8A+JFjKtDbZP8A03/+tT4vAPiDJ3w22P8Art/9aoTsVOm2efWTX0jYIIAroIEkCAsK6yPwLq6f8sIM/wDXX/61T/8ACG61jHlQf9/f/rVXMR7GRxzwGXCquWY4Hua7fRLBNMsorZRl926RvViKdp3hHVYbkSyxwgLyAJM8/lW4NFv95O2PHX79O6NYU2tWVFwRxT1+7VtNHvgmCqZP+1Uv9lXn91P++qV0bWZSUdaCM1eGl3gH3U/76pRpd3/dT/vqi6CzKG3IwRVS+MdpDJds4jVBmQnoR/jW3/Zl3n7qf99Vm69oF/f2a2yIjIXBdfMxuA7fnTTVwadjzHxHrNjd3b6haadJuZfLMm0/P3x+YrE0vQtX8Q36m6R7WzB5GMHHoK9htPCU/lIbiKPMXEcQYFVH5VppotwgwkMS/Rq0VRJNIhxb1Z58vhCxiVYbS1RFUcvjk1pWfhu1iXaYhk9Sa7IaTeD+FP8Avql/sq8/up/31U8/mPkOGuvCGlyq4Ee0vw+3jP1qzoGgR6TvW2JxIc5btXWnR7z+6mf96nDSr1EO1ELdvmpOV+oKNjMYi3URr80jdakZdsDFucDNTwaLqHmmSZY8k9nq42l3RRl2oc/7VK6KszkYp1s4IIpAZLm53skffHUn6UyO6ZwsyKyhuQDxV+y8Ma0/iO+1K+jhEIiEFoglzhOrE8cZNUNZ8IeJLud2gkSOJomHlrNgBsfL2p3QrM5jx14bXU7aXVtNQfbYlzPEv/LVfX/e/nXlSyEHofyr3XRfB/ie2EMs6QxTgbXKXGePWjUPh1d3M5uFtrZHflwHwN3qPrRzI5qlFt3SPDDcAcciu5+B84f4hwKP+fWb+QrrH+GGoN0htv8Av5/9atrwN4EvNB8SR6nNFCqLE6ZR8nnH+FS5KwQpSUk2elGig0Vkd4maXNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFABmjNFFACUUUUAf//Z",
    "Abílio Diniz":  "data:image/jpeg;base64,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"
};

  // Fotos base64 fornecidas pelo usuario (injetadas na montagem)
  // Tambem registra alias sem acentos, pois as fichas usam nomes sem acento.
  for (var _k in EMP.FOTOS_B64) {
    if (EMP.FOTOS_B64[_k]) {
      EMP.FOTOS[_k] = EMP.FOTOS_B64[_k];
      try {
        var _sa = String(_k).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (_sa !== _k) EMP.FOTOS[_sa] = EMP.FOTOS_B64[_k];
      } catch (e) {}
    }
  }

  (function registrarFotosEmpresarios() {
    if (typeof window === "undefined") return;
    var mapa = window._fotosEmbutidasMap;
    if (!mapa) {
      mapa = {};
      try {
        var el = document.getElementById("fotos-embutidas");
        var raw = el ? JSON.parse(el.textContent) : {};
        mapa = raw.porNome || raw || {};
      } catch (e) { mapa = {}; }
    }
    for (var nome in EMP.FOTOS) {
      if (EMP.FOTOS[nome] && !mapa[nome]) mapa[nome] = EMP.FOTOS[nome];
    }
    window._fotosEmbutidasMap = mapa;
  })();

  /* ---------------------------------------------------------------------------
     EXPORTACAO / DIAGNOSTICO
     --------------------------------------------------------------------------- */
  EMP.resumo = function () {
    var blocos = {};
    var eixos = {};
    CATALOGO_EMPRESARIOS.forEach(function (e) {
      blocos[e.bloco] = (blocos[e.bloco] || 0) + 1;
      eixos[e.eixo] = (eixos[e.eixo] || 0) + 1;
    });
    var comFoto = 0;
    for (var n in EMP.FOTOS) { if (EMP.FOTOS[n]) comFoto++; }
    return {
      versao: EMP.versao,
      total: CATALOGO_EMPRESARIOS.length,
      titulares: CATALOGO_EMPRESARIOS.filter(function (e) { return e.tipo === "titular"; }).length,
      registradosNaBase: EMP.registrados,
      blocos: blocos,
      eixos: eixos,
      fotos: comFoto,
      pautas: EMP.PAUTAS.length,
      indicesBlocos: EMP.indiceBlocos()
    };
  };
  window.empResumo = EMP.resumo;

  // API placeholder para as fases seguintes (mecanica, cargos, eventos, UI)
  EMP.fase = 1;

})();

