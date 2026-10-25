/* TELEJORNAL_V1 falas
   Blocos recombináveis em pt-BR. Arquétipos, sem veículo nem jornalista real.
   Nenhuma linha fora de "chamada" usa a palavra "eleito". */
(function (root) {
  "use strict";

  function trio(abertura, corpo, fecho) {
    return { abertura: abertura, corpo: corpo, fecho: fecho };
  }

  var F = {};

  F.abertura = {
    solene: trio(
      [
        "Boa noite. Encerrou-se a votação em {circunscricao}. Começa agora a apuração das eleições {ano}.",
        "Estamos no ar para acompanhar, ao vivo, a escolha de {vagas} {cargo}.",
        "Boa noite. As urnas fecharam e a Rede Horizonte abre a noite de {ano}.",
        "O país votou. A partir de agora, cada zona que entra muda o placar de {cargo}.",
        "Começa a cobertura das eleições {ano}. O que está em jogo: {vagas} {cargo}.",
        "Boa noite. Sem pressa e sem chute: a apuração de {circunscricao} entra no ar."
      ],
      [
        "O quociente, as sobras e a cláusula de desempenho explicam quem senta e quem fica na porta.",
        "A matemática eleitoral já está fechada nas urnas. A nossa tarefa é mostrar a conta na ordem em que ela chega.",
        "As primeiras seções costumam vir da capital. O interior entra depois e pesa.",
        "Há pesquisa de saída, com margem de erro, e há urna de verdade. As duas não se misturam nesta bancada.",
        "O placar que o senhor vê agora ainda é o começo. Ninguém atravessa a noite com o primeiro boletim.",
        "A transmissão é uma simulação satírica. Os votos que vamos ler são os votos desta partida."
      ],
      [
        "Fique conosco. O telão abre em instantes.",
        "Vamos aos números assim que a primeira zona fechar.",
        "A noite é longa. A conta, não.",
        "Seguimos ao vivo até a totalização."
      ]
    ),
    plantao: trio(
      [
        "Plantão: urnas fechadas em {circunscricao}. A apuração de {ano} começa agora.",
        "Atenção. {cargo} entra no ar com {vagas} vagas em disputa.",
        "Cabo 24h no ar. Sem vinheta longa: o primeiro número sai já.",
        "Interrompemos a grade. Eleições {ano}, apuração aberta.",
        "Ao vivo, sem intervalo de cortesia. {circunscricao} começou a contar.",
        "Plantão duplo: o que chega de urna e o que ainda é só expectativa."
      ],
      [
        "A regra da casa é simples: número na tela, fonte na tarja, chute nenhum.",
        "Se a liderança trocar, a tarja troca junto. Até lá, é parcial.",
        "Zona urbana primeiro, periferia em seguida, interior no fim da fila.",
        "O relógio de Brasília corre. A urna corre no ritmo dela.",
        "Metade do país ainda nem apareceu no boletim. Anote isso.",
        "Qualquer selo de vitória, aqui, espera a conta fechar."
      ],
      [
        "Não saia. O próximo bloco de urnas está a caminho.",
        "Voltamos aos números em segundos.",
        "Tarja ligada. Apuração ligada.",
        "Segura o controle. A noite virou."
      ]
    ),
    popular: trio(
      [
        "Boa noite, Brasil. A praça está cheia e a apuração de {ano} começou.",
        "Família, senta junto: hoje a gente acompanha {cargo} em {circunscricao}.",
        "A TV Aliança abre a noite com o povo na frente do telão.",
        "Acabou a votação. Agora é aquela espera que ninguém consegue disfarçar.",
        "Olha o ano de {ano}. {vagas} cadeiras e um país inteiro contando nos dedos.",
        "Boa noite. Aqui a apuração tem nome, bairro e gente na calçada."
      ],
      [
        "A Dona Cida da praça disse que votou pensando na rua dela. É esse o clima.",
        "Comitê ainda não solta fogos. Quem solta cedo passa vergonha.",
        "As primeiras urnas vêm de onde a fila andou mais depressa. O resto chega.",
        "A gente explica a conta devagar, porque cadeira não é achismo.",
        "Tem mãe com criança no colo esperando o número. A noite é deles também.",
        "Simulação, tá? Sátira de estúdio. O nervoso, esse, é de verdade."
      ],
      [
        "Fica com a gente, que o interior ainda vai falar.",
        "Já já a gente cruza com o comitê.",
        "Respira. A urna não corre no grito.",
        "Segue no ar. A praça não esvaziou."
      ]
    ),
    analitico: trio(
      [
        "Boa noite. A apuração de {ano} em {circunscricao} começa com uma ressalva: parcial não é resultado.",
        "Abrimos a noite para ler {cargo} pelo que a urna diz, não pelo que a pesquisa prometeu.",
        "Eleições {ano}. {vagas} vagas. O resto é narrativa, e a narrativa espera a conta.",
        "A cobertura independente entra no ar. Sem torcida de bancada.",
        "O mapa importa: de onde vem a urna muda quem aparece na frente.",
        "Boa noite. Vamos tratar quociente como quociente, não como enigma."
      ],
      [
        "Capital chega antes. Quem lidera agora pode ser só o perfil urbano da disputa.",
        "A cláusula de desempenho e o quociente decidem dinheiro de partido e cadeira. As duas contas cabem nesta noite.",
        "Não há milagre estatístico. Há votos, vagas e a ordem de chegada das zonas.",
        "Se a vantagem encolher, a gente diz que encolheu. Se virar, a gente mostra de qual região veio o voto.",
        "O financiamento e o horário de televisão ficam para depois do número. Primeiro, o número.",
        "Obra de ficção, método de apuração. As duas coisas ao mesmo tempo."
      ],
      [
        "Seguimos com o telão e com a conta ao lado.",
        "O próximo corte é geográfico. Vale olhar o mapa.",
        "Sem adjetivo antes do percentual.",
        "A noite segue. A dúvida também, até a matemática dizer o contrário."
      ]
    ),
    combativo: trio(
      [
        "Entrou no ar. Eleições {ano} e eu quero ver quem aguenta o placar.",
        "Boa noite. {cargo} em {circunscricao}. Chega de ensaio: a urna abriu.",
        "Opinião na mesa, número no telão. As duas coisas, sem pedir licença.",
        "{vagas} cadeiras. Alguém vai sair desta noite menor do que entrou.",
        "A votação encerrou. Agora ninguém controla a ordem das zonas.",
        "Começou. E quem prometeu vitória fácil vai ter que sentar e assistir."
      ],
      [
        "As primeiras urnas são um retrato torto. Eu digo torto agora para não engolir a frase depois.",
        "Pesquisa é pesquisa. Urna é urna. Quem misturar as duas aqui leva o corte.",
        "O interior ainda não falou. Quem comemorar na capital pode apagar o sorriso.",
        "Eu quero média, quociente e nome. Discurso fica para o fim.",
        "A bancada vai discordar. Faz parte. O voto não discordou de si mesmo.",
        "Sátira, sim. Moleza, não."
      ],
      [
        "Segura, porque a tarja hoje trabalha.",
        "Fica. O melhor pedaço da briga ainda não entrou.",
        "Vamos ao número antes da opinião. Desta vez, nessa ordem.",
        "Não pisca. A parcial muda."
      ]
    ),
    seco: trio(
      [
        "Apuração iniciada. {circunscricao}. Eleições {ano}. Cargo: {cargo}.",
        "Urnas encerradas. Total de vagas em disputa: {vagas}.",
        "Boletim factual. Sem comentário de abertura.",
        "Transmissão da Agência Fato. A contagem começou.",
        "Registro: votação encerrada, apuração em curso.",
        "Nota de abertura. Os percentuais a seguir são parciais."
      ],
      [
        "A ordem de chegada das zonas altera a liderança temporária. Não altera o total.",
        "Pesquisa de saída será identificada como pesquisa. Resultado, só com a regra matemática.",
        "Quociente eleitoral, quociente partidário e sobras serão lidos quando a base permitir.",
        "Não há projeção pessoal nesta bancada. Há conta.",
        "Margem, votos restantes e vantagem entram na mesma linha.",
        "Simulação satírica. Método explícito."
      ],
      [
        "Próximo boletim em seguida.",
        "Fim da abertura.",
        "Aguardando a primeira zona.",
        "Cobertura continua."
      ]
    ),
    mercado: trio(
      [
        "Good evening from the desk — em português, boa noite. Eleições {ano} em {circunscricao}.",
        "A mesa internacional acompanha {cargo}. O que o mercado lê é maioria, não discurso.",
        "Abertura curta. {vagas} cadeiras e uma pergunta: quem governa a conta amanhã.",
        "Correspondentes a postos. A apuração brasileira entrou no fio.",
        "Noites presidenciais movem câmbio na ficção desta mesa. O voto, porém, é o voto.",
        "Começamos. Sem adjetivo, com percentual."
      ],
      [
        "Investidor gosta de número redondo. A urna não deve esse favor.",
        "Primeiro as zonas urbanas. O interior corrige o viés. Anotem.",
        "Qualquer chamada antes da vantagem superar os votos restantes é rumor, não fato.",
        "A cláusula de desempenho interessa a quem financia legenda. Cabe no fim da noite.",
        "Esta é uma obra de ficção. Nenhum pregão real está do outro lado.",
        "O fio fica aberto até a totalização."
      ],
      [
        "Seguimos. O próximo dado é de urna, não de bolsa.",
        "Mesa de volta ao placar.",
        "Sem alarde. Com tabela.",
        "A cobertura internacional continua em português."
      ]
    )
  };

  F.boca_de_urna = {
    solene: trio(
      [
        "Antes das urnas, a pesquisa de saída. Margem de dois pontos. Não é resultado.",
        "O instituto da casa divulga a boca de urna de {cargo}. Tratamos como fotografia borrada.",
        "Pesquisa de saída na tela. {partido} aparece à frente, dentro da margem de erro.",
        "O comparativo entra agora: o que a saída mediu e o que a urna ainda vai dizer.",
        "Boca de urna com ressalva em letras grandes. {circunscricao}, eleições {ano}.",
        "O analista pede calma. A amostra não é a totalização."
      ],
      [
        "{partido} marca {pct}% nesta saída. {candidato2} vem em seguida, com {pct2}%.",
        "A diferença cabe na margem. Quem transformar isso em vitória está adiantado.",
        "O instituto acerta o bloco urbano com mais facilidade. O interior é o ponto cego.",
        "Se a urna divergir, a credibilidade de amanhã é de quem mediu, não de quem votou.",
        "Guardem este quadro. No fim da noite a gente coloca a pesquisa ao lado do resultado.",
        "Nenhum selo de eleição sai desta pesquisa. Selo é outra regra."
      ],
      [
        "Pesquisa lida. Agora a urna.",
        "Aviso registrado. Seguimos para as primeiras seções.",
        "O telão troca de pesquisa para apuração.",
        "Fim da saída. Começa a contagem."
      ]
    ),
    plantao: trio(
      [
        "Boca de urna no ar. Margem de dois pontos. Repito: não é a urna.",
        "Saiu a pesquisa de saída de {cargo}. {partido} na frente neste retrato.",
        "Plantão de instituto. Número fresco, confiança limitada.",
        "A tarja diz PESQUISA. Quem ler RESULTADO leu errado.",
        "Saída de urna em {circunscricao}. Ano {ano}.",
        "Dois pontos para cima, dois para baixo. É esse o tamanho do aviso."
      ],
      [
        "{partido} com {pct}%. {candidato2} com {pct2}%. A briga está dentro da margem.",
        "Se o interior vier diferente, esta pesquisa envelhece em uma hora.",
        "Amostra urbana pesa demais neste instituto. A gente avisa antes.",
        "Nada de discurso de vitória em cima de questionário.",
        "O erro, se vier, vira matéria. O acerto também.",
        "Próximo gráfico: urna de verdade."
      ],
      [
        "Pesquisa encerrada na tela.",
        "Trocamos o selo. Agora é apuração.",
        "Instituto avisado. Urna na fila.",
        "Segue o plantão."
      ]
    ),
    popular: trio(
      [
        "Saiu a pesquisa da saída. Calma na praça: isso ainda não é a urna.",
        "O povo pergunta quem ganhou. A resposta honesta é: ainda não dá para saber.",
        "Boca de urna na tela grande. {partido} aparece na frente, com asterisco.",
        "Explica para quem chegou agora: pesquisa de saída tem margem.",
        "A tia do comitê já quer soltar rojão. Ainda não, tia.",
        "Ano {ano}, {circunscricao}. O retrato da saída está no ar."
      ],
      [
        "{partido} tem {pct}% nessa conta. {candidato2} tem {pct2}%. Cabe os dois na margem.",
        "A fila do interior nem entrou na conversa do instituto.",
        "Quem votou cedo no centro não é o país inteiro.",
        "A gente mostra a pesquisa e já avisa o tamanho do erro.",
        "Se virar, ninguém aqui finge que previu.",
        "O telão da praça vai trocar para a urna."
      ],
      [
        "Pesquisa dada. Agora espera a seção.",
        "Guarda o rojão.",
        "Vamos para a urna, família.",
        "Fim da saída."
      ]
    ),
    analitico: trio(
      [
        "Pesquisa de saída, margem de dois pontos percentuais. Leitura crítica, não comemoração.",
        "O instituto coloca {partido} à frente. A diferença precisa sobreviver à margem.",
        "Boca de urna é hipótese. A urna é o teste.",
        "Publicamos o número e o viés conhecido da amostra.",
        "Sem transformar questionário em mandato.",
        "{circunscricao}, {ano}. Saída na mesa."
      ],
      [
        "{pct}% para {partido}, {pct2}% para {candidato2}. Estatisticamente, a briga segue aberta.",
        "Amostras urbanas erram quando o voto rural decide. Já vimos esse filme.",
        "Se a divergência passar da margem, o instituto perde crédito. A regra está dita.",
        "Compararemos esta saída com a parcial a partir dos 25%, não antes.",
        "O eleitorado não cabe numa amostra de fim de tarde.",
        "Segue o gráfico, com a etiqueta certa."
      ],
      [
        "Saída registrada.",
        "Próximo quadro: seções apuradas.",
        "A ressalva fica no ar.",
        "Trocamos de fonte."
      ]
    ),
    combativo: trio(
      [
        "Lá vem pesquisa. Eu já digo: eu não caso com instituto.",
        "Boca de urna de {cargo}. {partido} na foto. Foto não é filme.",
        "Margem de dois pontos e um país inteiro cansado de chute.",
        "Quem vender vitória com este número está vendendo fumaça.",
        "Olha a tela. PESQUISA, em caixa alta, para ninguém se fazer de sonso.",
        "Saída no ar. A briga de verdade ainda está na caixa."
      ],
      [
        "{partido} {pct}%, {candidato2} {pct2}%. Quer apostar a carreira nisso? Eu não aposto.",
        "Instituto erra, e quando erra a gente cobra. Hoje ainda é cedo para a cobrança.",
        "O interior ri dessa amostra. Espera sentado.",
        "Eu leio o número. Eu não leio o desejo de ninguém.",
        "Se bater com a urna, o instituto ganha a noite. Se não bater, perde o trimestre.",
        "Próximo: seção eleitoral, não call center."
      ],
      [
        "Pesquisa lida, desconfiança mantida.",
        "Agora a urna. Aí a conversa muda.",
        "Fim do questionário.",
        "Segue."
      ]
    ),
    seco: trio(
      [
        "Pesquisa de saída. Margem: 2 p.p. Natureza: estimativa.",
        "{partido}: {pct}%. Segundo colocado neste retrato: {candidato2}, {pct2}%.",
        "Fonte identificada como instituto. Não é totalização.",
        "Boca de urna publicada. {cargo}. {ano}.",
        "Registro de estimativa. Sem adjetivo.",
        "Comparação com a urna ficará para quando houver urna bastante."
      ],
      [
        "Diferença dentro ou na borda da margem. Sem declaração de tendência oficial.",
        "Cobertura geográfica da amostra: predominantemente urbana.",
        "Divergência superior à margem, se ocorrer, será registrada como erro de instituto.",
        "Nenhuma chamada de resultado decorre desta tabela.",
        "Série arquivada para o quadro pesquisa contra apuração.",
        "Fim dos números de saída."
      ],
      [
        "Estimativa encerrada.",
        "Retomada da apuração.",
        "Próximo dado: seção.",
        "Nota fechada."
      ]
    ),
    mercado: trio(
      [
        "Saída de urna na mesa. O pregão fictício não se mexe com margem de dois pontos.",
        "Pesquisa: {partido} à frente. Leitura de risco: baixa, até a urna confirmar.",
        "Boca de urna não precifica mandato. A gente repete isso para o correspondente.",
        "Estimativa de {cargo}, {ano}. Etiqueta de pesquisa visível.",
        "Dois pontos de margem. Abaixo disso, é ruído.",
        "O desk publica e segue."
      ],
      [
        "{pct}% e {pct2}%. Spread insuficiente para qualquer chamada.",
        "Viés urbano conhecido. O interior é o fator de correção.",
        "Se o instituto errar grosso, a credibilidade entra no fio de amanhã.",
        "Nenhum líder estrangeiro comenta estimativa. Isso fica para o resultado.",
        "Cenário ainda aberto. Sem seta de bolsa.",
        "Trocamos para a urna."
      ],
      [
        "Estimativa lida.",
        "De volta à contagem.",
        "Sem movimento de mercado nesta altura.",
        "Mesa segue."
      ]
    )
  };

  function estiloQuatro(base, trocas) {
    var o = { solene: base };
    ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
      o[k] = trocas[k] || base;
    });
    return o;
  }

  F.marco = estiloQuatro(
    trio(
      [
        "Com {pct_apurado}% das urnas apuradas, {partido} aparece na frente. Ainda é cedo: essas urnas vêm de {regiao}.",
        "Chegamos a {pct_apurado}%. {partido} lidera com {pct}%.",
        "Marco da noite: {pct_apurado}% contados em {circunscricao}.",
        "O boletim atravessa {pct_apurado}%. A liderança, neste instante, é de {partido}.",
        "Urnas em {pct_apurado}%. A diferença para {candidato2} é de {vantagem} ponto.",
        "Parcial oficial do estúdio: {pct_apurado}% . Nada além disso."
      ],
      [
        "{partido} soma {pct}% dos votos já contados. {candidato2} tem {pct2}%.",
        "A zona que entrou agora é {regiao}. O perfil dela puxa o placar.",
        "Ainda faltam {restante} votos na conta cheia. Cabe virada, até que a matemática diga o contrário.",
        "Quem lidera com pouco apurado lidera um pedaço do mapa, não o mapa.",
        "O ritmo de chegada acelerou. O próximo bloco pode mexer na ordem.",
        "Vantagem de {votos} votos nesta parcial. É foto, não filme."
      ],
      [
        "Seguimos contando.",
        "Próximo marco, próxima zona.",
        "O telão fica neste placar.",
        "Anotado. A noite continua."
      ]
    ),
    {
      plantao: trio(
        [
          "Plantão de marco: {pct_apurado}% apurados. {partido} na frente.",
          "{pct_apurado}%! Vamos aos números sem enrolar.",
          "Bateu {pct_apurado}%. Liderança momentânea: {partido}.",
          "Urnas: {pct_apurado}%. Diferença de {vantagem} ponto.",
          "Mais um corte. {regiao} entrou na soma.",
          "Marco rápido. {partido} com {pct}%."
        ],
        [
          "{candidato2} segue em {pct2}%. A briga não fechou.",
          "Essas urnas são de {regiao}. Não generalize.",
          "Restam {restante} votos fora da soma. É muito ou pouco? Depende da vantagem.",
          "A tarja não muda de cor por causa de marco redondo.",
          "Próxima fatia pode ser periferia ou interior. O placar sabe a diferença.",
          "Votos de vantagem agora: {votos}."
        ],
        ["Segue o plantão.", "Próximo corte já já.", "Marco lido.", "De volta ao telão."]
      ),
      popular: trio(
        [
          "Família, {pct_apurado}% das urnas. {partido} está na frente neste pedaço.",
          "Olha o telão da praça: {pct_apurado}%. Calma, veio de {regiao}.",
          "Mais um tanto contado. {partido} lidera com {pct}%.",
          "A rua pergunta se já acabou. Não acabou. Estamos em {pct_apurado}%.",
          "Chegou urna de {regiao}. O grito foi maior do que o número.",
          "{pct_apurado}% e o coração ainda na mão."
        ],
        [
          "{candidato2} não saiu da disputa: {pct2}%.",
          "Quem mora em {regiao} reconhece esse voto. O resto do mapa, ainda não.",
          "Faltam {restante} votos. Não é hora de fogos.",
          "A vantagem é de {vantagem} ponto. Dá para caber os dois no sofá.",
          "A fila de casa ainda não entrou. Espera.",
          "{votos} votos separam os dois neste boletim."
        ],
        ["Fica com a gente.", "Já já tem mais urna.", "Respira.", "A praça continua."]
      ),
      analitico: trio(
        [
          "{pct_apurado}% apurados. A liderança de {partido} precisa ser lida junto com a origem: {regiao}.",
          "Marco quantitativo. {partido} tem {pct}% do que já entrou.",
          "A série atravessa {pct_apurado}%. Sem extrapolar o que falta.",
          "Corte de {pct_apurado}%. Vantagem de {vantagem} ponto sobre {candidato2}.",
          "A zona {regiao} moveu a parcial. O viés geográfico está visível.",
          "Registro: {pct_apurado}% , liderança temporária de {partido}."
        ],
        [
          "Segundo colocado: {candidato2}, {pct2}%.",
          "Votos ainda de fora: {restante}. A vantagem em votos é {votos}.",
          "Enquanto a vantagem não superar o que falta, não há chamada.",
          "O perfil de {regiao} explica o número melhor do que qualquer adjetivo.",
          "Comparar esta parcial com a pesquisa de saída só faz sentido com mais urna na mesa.",
          "A ordem pode mudar. A série está aberta."
        ],
        ["Marco arquivado.", "Seguimos a série.", "Sem conclusão.", "Próximo ponto da curva."]
      ),
      combativo: trio(
        [
          "{pct_apurado}% e {partido} na frente. Aproveita, porque o mapa não acabou.",
          "Olha o número: {pct}%. Veio de {regiao}. Eu não compraria com esse endereço.",
          "Marco da noite, sem fogos. {pct_apurado}%.",
          "{partido} lidera. {candidato2} respira no cangote: {pct2}%.",
          "Chegou {regiao}. Quem torcia pelo contrário, senta.",
          "{pct_apurado}% apurados. A briga está feia do jeito certo."
        ],
        [
          "Vantagem de {vantagem} ponto. Isso vira e desvira.",
          "Faltam {restante} votos. Eu repito o número para ninguém se fazer de campeão.",
          "{votos} votos de diferença. Amanhã ninguém lembra de marco redondo. Lembra de quem ganhou.",
          "A zona explica. O comentarista que ignorar a zona está torcendo.",
          "Eu não chamo vitória. Eu chamo parcial.",
          "Próxima urna pode constranger alguém neste estúdio."
        ],
        ["Segue a briga.", "Não celebra.", "Número lido.", "Próximo round."]
      ),
      seco: trio(
        [
          "Apurado: {pct_apurado}%. Líder da parcial: {partido}, {pct}%.",
          "Origem do último bloco: {regiao}.",
          "Segundo: {candidato2}, {pct2}%. Vantagem: {vantagem} p.p.",
          "Votos restantes estimados: {restante}.",
          "Corte {pct_apurado}%. Sem qualificação.",
          "Boletim {pct_apurado}% publicado."
        ],
        [
          "Diferença em votos: {votos}.",
          "Regra de chamada ainda não atendida, salvo indicação em contrário neste boletim.",
          "Série geográfica coerente com a ordem capital, periferia, interior.",
          "Nenhuma projeção de cadeira neste marco, se o cargo for majoritário.",
          "Dado suficiente para o placar. Insuficiente para selo.",
          "Fim do quadro numérico deste corte."
        ],
        ["Próximo boletim.", "Registro feito.", "Cobertura segue.", "Corte encerrado."]
      ),
      mercado: trio(
        [
          "Corte de {pct_apurado}%. {partido} lidera a parcial. Sem impacto de mesa.",
          "{regiao} entrou. O viés é geográfico, não um choque.",
          "Vantagem de {vantagem} ponto. Abaixo do limiar de chamada.",
          "{partido} {pct}%, {candidato2} {pct2}%.",
          "Restante: {restante} votos. Risco de virada ainda na mesa.",
          "Marco lido para o fio internacional."
        ],
        [
          "Não há seta de câmbio nesta parcial.",
          "A liderança só vira fato quando a vantagem passar o que falta.",
          "Correspondente avisado: número parcial.",
          "Diferença de {votos} votos.",
          "O interior segue como fator de correção.",
          "Desk mantém o cenário aberto."
        ],
        ["De volta ao fio.", "Sem preço novo.", "Marco enviado.", "Mesa estável."]
      )
    }
  );

  F.analise_telao = {
    solene: trio(
      [
        "Olho no telão. Com {pct_apurado}% apurados, a curva de {partido} ainda não é destino.",
        "O analista assume o gráfico. A liderança é de {partido}, com {pct}%.",
        "Vamos ler a barra, não a torcida. {vantagem} ponto de vantagem.",
        "A zona {regiao} puxou este trecho. O desenho está na tela.",
        "Análise fria: {candidato2} segue a {pct2}%.",
        "O placar de {cargo} neste instante, e só neste instante."
      ],
      [
        "Se o bloco seguinte tiver outro perfil, a barra troca de lugar sem pedir licença.",
        "A vantagem em votos é {votos}. O que falta contar é {restante}.",
        "Enquanto esses dois números não se cruzarem a favor de quem lidera, a palavra de ordem é parcial.",
        "A pesquisa de saída fica no canto, menor, para ninguém confundir com a urna.",
        "O ritmo agora é o meio da apuração: nem o susto do começo, nem o silêncio do fim.",
        "Cada fatia que entra redesenha a curva. A curva é o que a gente comenta."
      ],
      [
        "Telão mantido. A bancada segue.",
        "Gráfico lido.",
        "Devolvemos a palavra ao estúdio.",
        "A análise fica de pé até o próximo bloco."
      ]
    ),
    plantao: trio(
      [
        "Telão agora. {partido} {pct}%, {pct_apurado}% das urnas.",
        "Lê comigo: vantagem {vantagem}, restante {restante}.",
        "Análise em trinta segundos. {regiao} foi o último endereço.",
        "Barras em movimento. {candidato2} não descolou.",
        "Corte visual. Sem texto demais.",
        "O número grande é {pct_apurado}%."
      ],
      [
        "{votos} votos separam. Isso cabe numa zona grande.",
        "Não é tendência de vitória. É barra.",
        "Se a barra cruzar, a tarja nasce. Ainda não cruzou.",
        "Comparativo no canto: pesquisa menor, urna maior.",
        "Meio de apuração. O gráfico acelera.",
        "Próxima leitura em seguida."
      ],
      ["Telão ok.", "Segue.", "Lido.", "De volta."]
    ),
    popular: trio(
      [
        "Olha a barra, pessoal. {partido} na frente com {pct}%.",
        "O telão da praça mostra {pct_apurado}%. {regiao} acabou de entrar.",
        "Explica a barra: o pedaço colorido é o que já foi contado.",
        "{candidato2} ainda está na disputa, com {pct2}%.",
        "Não é corrida de cavalo. É urna. Mas a barra ajuda a ver.",
        "A vantagem cabe na palma: {vantagem} ponto."
      ],
      [
        "Se entrar o interior, a cor da frente pode mudar. Já vimos isso.",
        "Faltam {restante} votos. Por isso ninguém sobe na cadeira.",
        "{votos} votos na frente. Dá para o comitê gritar, não dá para cravar.",
        "A pesquisa ficou pequenininha no canto, de propósito.",
        "A rua entende barra melhor do que tabela. A tabela está certa do mesmo jeito.",
        "Segue o desenho."
      ],
      ["Telão explicado.", "Fica de olho.", "A praça viu.", "Seguimos."]
    ),
    analitico: trio(
      [
        "Leitura do gráfico: liderança de {partido} com {pct}% em {pct_apurado}% apurados.",
        "A curva separa origem e volume. {regiao} é origem. {votos} é volume.",
        "Vantagem de {vantagem} ponto contra um restante de {restante} votos.",
        "O segundo, {candidato2}, mantém {pct2}%.",
        "Não há inflexão bastante para falar em tendência firme.",
        "O telão está rotulado como parcial."
      ],
      [
        "Uma zona de perfil oposto reduz esta vantagem sem contradizer o total final, seja ele qual for.",
        "A regra de ouro segue de pé: vantagem maior do que o restante, ou silêncio.",
        "A pesquisa de saída não entra nesta escala. Escalas diferentes, selos diferentes.",
        "Meio da apuração é onde a curva mente menos, e ainda mente.",
        "Quem lê só o líder perde o mapa.",
        "Atualizamos no próximo bloco."
      ],
      ["Análise encerrada.", "Série continua.", "Sem selo.", "Gráfico permanece."]
    ),
    combativo: trio(
      [
        "Olha a barra e me diz se isso é vitória. Não é. É {pct_apurado}%.",
        "{partido} está com {pct}%. Bonito. Frágil.",
        "{candidato2} não morreu: {pct2}%.",
        "Veio de {regiao}. Eu já disse que endereço importa.",
        "Vantagem de {vantagem}. Eu quero ver essa vantagem no fim.",
        "Telão honesto. Comentarista impaciente. Os dois cabem."
      ],
      [
        "{votos} votos. {restante} ainda fora. Faz a conta comigo.",
        "Quem pintar tendência aqui está pintando desejo.",
        "A curva vai entortar quando o perfil mudar. Eu espero sentado, mas eu espero.",
        "Pesquisa no canto, pequena, como deve ser.",
        "Meio de apuração é terra de ninguém. Eu gosto.",
        "Próxima barra, próxima briga."
      ],
      ["Gráfico lido, opinião guardada.", "Segue.", "Não cravem.", "De volta à mesa."]
    ),
    seco: trio(
      [
        "Placar. {partido} {pct}%. {candidato2} {pct2}%. Apurado {pct_apurado}%.",
        "Vantagem {vantagem} p.p. Votos {votos}. Restante {restante}.",
        "Última zona incorporada: {regiao}.",
        "Rótulo do gráfico: parcial.",
        "Sem projeção verbal neste quadro.",
        "Leitura de tela concluída nos campos acima."
      ],
      [
        "Condição de chamada matemática: não verificada neste instante, salvo tarja específica.",
        "Pesquisa de saída fora da escala principal.",
        "Série temporal disponível no gráfico de curva.",
        "Atualização no próximo incremento de zona.",
        "Nada a adicionar.",
        "Quadro numérico estável até novo bloco."
      ],
      ["Fim da leitura.", "Próximo.", "Registro ok.", "Tela mantida."]
    ),
    mercado: trio(
      [
        "Tela limpa. {partido} à frente por {vantagem} ponto. Apurado: {pct_apurado}%.",
        "Sem seta. O spread ainda é {votos} votos contra {restante} restantes.",
        "{candidato2} em {pct2}%. Cenário aberto.",
        "Origem: {regiao}. Fator geográfico, não fator de risco novo.",
        "O desk não renomeia parcial como tendência.",
        "Gráfico mínimo, de propósito."
      ],
      [
        "Chamada só com vantagem acima do restante. Ainda não.",
        "Correspondente seguro: número móvel.",
        "Pesquisa fora do preço.",
        "Interior segue como cauda do evento.",
        "Nada de adjetivo no fio.",
        "Próxima atualização no mesmo quadro."
      ],
      ["Mesa de volta.", "Sem preço.", "Lido.", "Fio aberto."]
    )
  };

  F.explicador_regras = trio(
    [
      "O professor entra para a conta, não para a torcida.",
      "Hora de explicar o quociente sem pressa. {pct_apurado}% das urnas já estão na mesa.",
      "Antes do próximo número, a regra. Ela não muda no meio da noite.",
      "Quem chegou agora: a cadeira proporcional não é dos mais votados, é da conta.",
      "Um minuto de aula. Depois voltamos ao placar de {partido}.",
      "A regra cabe em duas frases. A noite inteira cabe dentro dela."
    ],
    [
      "O quociente eleitoral é a conta que define quanto vale uma cadeira: votos válidos divididos pelas vagas. Aqui, {qe} votos.",
      "{partido} e os demais só garantem cadeira direta quando atravessam essa linha. Antes disso, é projeção.",
      "Vale lembrar: o candidato precisa ter pelo menos 10% do quociente para ocupar a vaga do partido. É a regra.",
      "As vagas que sobram não vão para o mais votado solto. Vão para as maiores médias.",
      "Federação, quando existe, conta como um partido só. Coligação eleitoral não entra nessa conta proporcional.",
      "Projeção é projeção. O selo de cadeira confirmada espera o pior caso dos votos que ainda faltam."
    ],
    [
      "Aula encerrada. De volta ao telão.",
      "A régua do quociente fica no gráfico.",
      "Regra dita. Número em seguida.",
      "Quem quiser rever, o botão Entenda a conta continua na tela."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.explicador_regras[k] = F.explicador_regras.solene;
  });

  F.virada = {
    solene: trio(
      [
        "Atenção. A liderança mudou. {partido} assume a frente com {pct_apurado}% apurados.",
        "O placar virou. {partido} passa à frente. As urnas novas são de {regiao}.",
        "Mudança de líder neste instante. {partido} chega a {pct}%.",
        "A bancada interrompe a análise. Há uma virada na parcial.",
        "Última hora: {partido} toma a liderança de {partido_ant}.",
        "Não é ruído de uma seção. A soma mudou de mãos."
      ],
      [
        "A virada se explica pela chegada de {regiao}, onde o perfil puxa {partido}.",
        "{candidato2} deixa a frente. A diferença agora é de {vantagem} ponto.",
        "Quem liderava cresceu nas zonas urbanas. Quem chega agora traz outro mapa.",
        "Ainda é parcial. Virada de liderança não é chamada de resultado.",
        "O gráfico de curva marca este ponto. Dá para ver o cruzamento.",
        "Votos de vantagem neste novo arranjo: {votos}."
      ],
      [
        "Tarja de última hora no ar.",
        "A curva fica na tela.",
        "Seguimos em cima deste cruzamento.",
        "A noite mudou de texto."
      ]
    ),
    plantao: trio(
      [
        "Última hora! {partido} assume a liderança agora.",
        "Virou. {partido} passa {partido_ant} com {pct_apurado}% apurado.",
        "Plantão de virada. Novo líder: {partido}, {pct}%.",
        "Interrompe tudo. A ordem mudou.",
        "Tarja vermelha. {regiao} entregou a virada.",
        "{partido} na frente. Repito: liderança nova, ainda parcial."
      ],
      [
        "Não é selo. É cruzamento de curva.",
        "{candidato2} cai para segundo, com {pct2}%.",
        "Vantagem curta: {vantagem} ponto. Cabe outra virada.",
        "A origem é {regiao}. Sem essa zona, o desenho era outro.",
        "{votos} votos. Anota.",
        "A gente não comemora cruzamento."
      ],
      ["Tarja fica.", "Ao vivo.", "Segue o cruzamento.", "Plantão mantido."]
    ),
    popular: trio(
      [
        "Virou, família! {partido} tomou a frente.",
        "O telão da praça mudou de cor. Agora é {partido}.",
        "Olha {regiao} entrando e levando a liderança junto.",
        "O grito trocou de comitê. {partido} está na frente.",
        "Calma no abraço: é liderança, não é o fim.",
        "{partido_ant} perdeu a ponta com {pct_apurado}% contados."
      ],
      [
        "{partido} marca {pct}%. {candidato2} fica com {pct2}%.",
        "A diferença é de {vantagem} ponto. Dá para voltar.",
        "Quem soltou fogos cedo está quieto agora.",
        "Veio de {regiao}. O bairro reconhece o próprio voto.",
        "{votos} votos na frente, neste instante.",
        "A praça entendeu. A urna ainda não acabou."
      ],
      ["Fica com a tarja.", "Segura o rojão.", "A noite virou.", "Continua ao vivo."]
    ),
    analitico: trio(
      [
        "A virada se explica pela chegada de {regiao}, onde {partido} historicamente, neste mapa, vai melhor.",
        "Cruzamento confirmado na série: {partido} ultrapassa {partido_ant}.",
        "Não é surpresa geográfica. É a ordem de chegada das zonas.",
        "Liderança nova com {pct_apurado}% apurados. {partido} a {pct}%.",
        "O gráfico marca o ponto. A parcial muda de nome.",
        "Leitura: virada de caminho, não de resultado final."
      ],
      [
        "O vencedor da noite continua sendo a soma inteira. Esta é só a soma até aqui.",
        "{candidato2} agora em segundo, {pct2}%.",
        "Vantagem de {vantagem} ponto, {votos} votos. Estreita o bastante para respeitar.",
        "Quem ignorou o interior não entendeu o cruzamento.",
        "Sem chamada. A regra matemática não foi atendida por este fato.",
        "A série segue aberta depois do cruzamento."
      ],
      ["Ponto marcado na curva.", "Análise reposicionada.", "Sem selo.", "Seguimos."]
    ),
    combativo: trio(
      [
        "ATENÇÃO! {partido} assume a liderança agora! Quem diria?",
        "Virou! {partido} passa {partido_ant} com {pct_apurado}% apurado.",
        "Eu avisei que {regiao} ia mexer. Mexeu.",
        "Troca de líder no meio da mesa. {partido} com {pct}%.",
        "Quem cravou cedo, engole. A curva cruzou.",
        "Última hora de verdade. Não é enfeite de tarja."
      ],
      [
        "{candidato2} vai explicar esta zona. Eu também quero ouvir.",
        "Vantagem de {vantagem} ponto. Não é almofada.",
        "{votos} votos. Cabe numa região, cabe numa retratação.",
        "Ainda não é resultado. É um tapa na parcial anterior.",
        "O mapa fez o trabalho. O comentarista só lê.",
        "Pode virar de novo. Eu não abaixo a guarda."
      ],
      ["Tarja no alto.", "A mesa inteira viu.", "Segue o pau.", "Não pisca."]
    ),
    seco: trio(
      [
        "Mudança de líder. Novo líder da parcial: {partido}.",
        "Apurado no cruzamento: {pct_apurado}%.",
        "Líder anterior: {partido_ant}.",
        "Zona associada: {regiao}.",
        "Evento: virada de liderança. Natureza: parcial.",
        "{partido} {pct}%. {candidato2} {pct2}%."
      ],
      [
        "Vantagem: {vantagem} p.p., {votos} votos.",
        "Chamada matemática: não.",
        "Restante estimado: {restante}.",
        "Causa descrita: composição geográfica do bloco recém-incorporado.",
        "Selo de vitória: não emitido.",
        "Fim do registro do cruzamento."
      ],
      ["Evento lançado.", "Série atualizada.", "Segue.", "Nota fechada."]
    ),
    mercado: trio(
      [
        "A curva cruzou. {partido} passa à frente. Evento geográfico, não ainda um fato de mandato.",
        "Virada com {pct_apurado}% . Origem: {regiao}.",
        "O fio registra a troca de líder. Sem adjetivo de vitória.",
        "{partido} {pct}%, à frente de {candidato2}.",
        "Spread de {vantagem} ponto. Insuficiente para chamada.",
        "Mesa atenta, não alarmada."
      ],
      [
        "O total final não foi reescrito. Só a ordem da leitura.",
        "{votos} votos de vantagem contra {restante} restantes.",
        "Correspondentes: parcial nova, mesma eleição.",
        "Nenhuma felicitação se dispara num cruzamento.",
        "Risco de novo cruzamento permanece.",
        "Preço fictício estável."
      ],
      ["Fio atualizado.", "Sem chamada.", "Mesa segue.", "Evento lido."]
    )
  };

  F.disputa_ultima_vaga = trio(
    [
      "A reta final aperta. {partido} e {candidato2} estão separados por {vantagem} ponto.",
      "Foto de chegada: com {pct_apurado}% apurados, a vantagem cabe numa zona.",
      "A última faixa de urnas decide o tom. Ainda não decide sozinha, se a conta não fechar.",
      "Disputa curta entre {partido} e {candidato2}.",
      "O telão entra em duelo. Dois nomes, uma diferença pequena.",
      "{regiao} ainda pesa neste fim."
    ],
    [
      "A diferença é de {votos} votos. O que falta é {restante}.",
      "Enquanto o segundo alcança com o que resta, não há selo.",
      "{partido} marca {pct}%. {candidato2} marca {pct2}%.",
      "É o tipo de noite em que uma seção muda a frase do âncora.",
      "Quem fala em vitória aqui fala cedo.",
      "O duelo fica no centro do telão até a totalização."
    ],
    [
      "Duelo mantido.",
      "Sem vencedor neste quadro.",
      "A reta final continua.",
      "Olho no restante."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.disputa_ultima_vaga[k] = F.disputa_ultima_vaga.solene;
  });

  F.projecao = trio(
    [
      "Há uma projeção, não uma chamada. {partido} reúne {projecao}% de chance neste modelo.",
      "O analista publica tendência. A palavra é tendência.",
      "Com {pct_apurado}% apurados, o modelo aponta {partido}. O modelo não é a urna.",
      "Projeção no ar, com o selo certo: ainda não é fechamento.",
      "O número de chance é {projecao}. A vantagem é {vantagem} ponto.",
      "Tendência de {partido}. Confirmação, só com a regra matemática."
    ],
    [
      "{candidato2} seguiria precisando de um bloco muito fora da curva para alcançar.",
      "Mesmo assim, o que falta são {restante} votos. A casa não queima a frase antes da hora.",
      "Canal rigoroso espera. Canal apressado tropeça. Esta bancada espera.",
      "A projeção usa a dispersão dos blocos que ainda não chegaram. É estimativa.",
      "{partido} está com {pct}% do contado. Isso alimenta o modelo, não o selo.",
      "Se a curva virar, a projeção cai. Ela já caiu em outras noites."
    ],
    [
      "Selo de projeção, não de resultado.",
      "A tarja diz PROJEÇÃO.",
      "Seguimos sem cravar.",
      "O modelo fica no canto do telão."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.projecao[k] = F.projecao.solene;
  });

  F.chamada = {
    solene: trio(
      [
        "{candidato} está eleito. Com {pct_apurado}% das urnas, a vantagem é matematicamente irreversível.",
        "Chamada da casa: {partido} venceu. Nem o restante inteiro alcança {candidato2}.",
        "Podemos dizer com a regra na mesa: {candidato} está eleito.",
        "A conta fechou antes de 100%. {partido} está eleito.",
        "Vantagem de {votos} votos, restante de {restante}. {candidato} está eleito.",
        "O selo entra agora, porque a matemática autoriza. {candidato} está eleito."
      ],
      [
        "{candidato2} não alcança mais, ainda que leve cada voto que falta.",
        "A parcial está em {pct}% para {partido}. O número que importa é a vantagem contra o restante.",
        "Não é tendência. Não é projeção. É a chamada matemática.",
        "O gráfico troca de cor com critério, não com pressa.",
        "A noite pode seguir até 100%, mas o vencedor desta disputa já não muda.",
        "Registramos a hora da chamada para o inspetor da cobertura."
      ],
      [
        "Chamada publicada.",
        "Selo no ar.",
        "A bancada confirma.",
        "Resultado matemático definido."
      ]
    ),
    plantao: trio(
      [
        "Chamada! {candidato} está eleito. A vantagem passou o que falta.",
        "{partido} está eleito. Plantão confirma pela conta, não pelo grito.",
        "Pode cravar: {candidato} está eleito com {pct_apurado}% apurados.",
        "Tarja de chamada. {candidato} está eleito.",
        "Fechou a conta. {partido} está eleito.",
        "{votos} votos na frente, {restante} fora. {candidato} está eleito."
      ],
      [
        "{candidato2} fica sem caminho matemático.",
        "{pct}% no contado. O selo não depende de chegar a 100%.",
        "Repetindo: chamada matemática, não palpite.",
        "A urna segue entrando. O vencedor, não.",
        "Hora registrada.",
        "O plantão mantém a tarja."
      ],
      ["Chamada no ar.", "Confirmado pela conta.", "Selo dado.", "Segue a totalização."]
    ),
    popular: trio(
      [
        "Pode soltar o rojão com critério: {candidato} está eleito.",
        "A praça ouviu. {partido} está eleito. A conta autoriza.",
        "{candidato} está eleito, família. Nem que o resto inteiro vire, não alcança.",
        "O telão trocou. {candidato} está eleito.",
        "Chegou a hora certa, não a hora cedo. {partido} está eleito.",
        "Abraço no comitê, agora sim. {candidato} está eleito."
      ],
      [
        "A vantagem é de {votos} votos. Faltam {restante}. Não dá mais.",
        "{candidato2} fica na história desta noite como segundo.",
        "A gente segurou a palavra a noite toda. Agora ela cabe.",
        "{pct}% do que já entrou, e o que falta não muda o nome.",
        "Simulação, tá? Mas a regra é a regra.",
        "A praça pode gritar o nome."
      ],
      ["Selo na tela.", "Chamada feita.", "Festa com licença da matemática.", "Seguimos até o fim da urna."]
    ),
    analitico: trio(
      [
        "Condição atendida: vantagem maior do que os votos restantes. {candidato} está eleito.",
        "Chamada conservadora. {partido} está eleito.",
        "O pior caso não tira {candidato} da vitória. Portanto, eleito.",
        "{candidato} está eleito. A série pode continuar; o resultado desta chave, não.",
        "Registramos p e a hora. O critério foi o da vantagem contra o restante.",
        "Sem eufemismo: {candidato} está eleito."
      ],
      [
        "{candidato2} somando tudo o que falta ainda permanece atrás.",
        "Apurado: {pct_apurado}%. Vantagem: {votos} votos. Restante: {restante}.",
        "Isto não é o modelo de 97%. Isto é desigualdade estrita.",
        "A totalização confirma o caminho. Não reabre a disputa.",
        "Outras corridas da noite seguem o próprio relógio.",
        "Nota metodológica arquivada."
      ],
      ["Chamada registrada.", "Critério explícito.", "Selo aplicado.", "Fim da disputa nesta chave."]
    ),
    combativo: trio(
      [
        "Agora pode. {candidato} está eleito. Eu esperei a conta.",
        "Crava. {partido} está eleito. Quem duvidou da regra, olha o restante.",
        "{candidato} está eleito e o segundo não tem de onde tirar voto.",
        "Eu recusei esta frase a noite inteira. {candidato} está eleito.",
        "Chamada no grito certo: {partido} está eleito.",
        "Acabou a discussão desta cadeira. {candidato} está eleito."
      ],
      [
        "{votos} na frente, {restante} no bolso de ninguém. Não alcança.",
        "{candidato2} luta até o fim da urna e não vira.",
        "{pct}% é o retrato. O selo é a desigualdade.",
        "Quem chamou antes, sem esta conta, chamou por conta própria.",
        "A mesa cala o adjetivo e deixa o verbo.",
        "Hora marcada."
      ],
      ["Chamei.", "Selo dado.", "Discussão encerrada nesta chave.", "A urna pode continuar."]
    ),
    seco: trio(
      [
        "Chamada matemática. {candidato} eleito. Critério: vantagem > restante.",
        "{partido} eleito. Vantagem {votos}. Restante {restante}.",
        "Condição verdadeira. {candidato} eleito.",
        "Selo emitido. {partido} eleito.",
        "Apurado {pct_apurado}%. Resultado desta disputa: {candidato} eleito.",
        "Registro de chamada. Confirmado: sim."
      ],
      [
        "O segundo colocado, {candidato2}, não atinge o líder no pior caso.",
        "Percentual parcial do líder: {pct}%.",
        "Eventos posteriores não reabrem esta chave.",
        "Totalização segue para arquivo, não para dúvida.",
        "Hora de tela associada ao selo.",
        "Fim da nota de chamada."
      ],
      ["Chamada lançada.", "Confirmado.", "Selo ok.", "Nota fechada."]
    ),
    mercado: trio(
      [
        "Fato, não rumor: {candidato} está eleito. A vantagem excedeu o restante.",
        "O fio pode usar o verbo. {partido} está eleito.",
        "Chamada limpa. {candidato} está eleito.",
        "Critério de mesa atendido. {partido} está eleito.",
        "Sem modelo probabilístico nesta frase. {candidato} está eleito pela desigualdade.",
        "Correspondentes liberados para o resultado. {partido} está eleito."
      ],
      [
        "{candidato2} sem caminho aritmético.",
        "Vantagem {votos}, restante {restante}, apurado {pct_apurado}%.",
        "Reação de mercado, nesta ficção, só depois do verbo correto.",
        "Nenhuma felicitação antes deste selo. Agora o selo existe.",
        "Outras praças seguem abertas.",
        "Arquivo da chamada disponível."
      ],
      ["Fio atualizado com o verbo.", "Chamada enviada.", "Selo no desk.", "Mesa segue para o resto da noite."]
    )
  };

  F.encerramento = trio(
    [
      "A totalização entra. O placar deixa de ser caminho e passa a ser soma.",
      "Cem por cento, ou o último passo até lá. {partido} fecha com {pct}%.",
      "Encerramos a leitura ao vivo de {cargo} em {circunscricao}.",
      "O que era projeção vira quadro. O que era chamada permanece chamada.",
      "Noite de {ano} chegando ao fim nesta chave.",
      "Último bloco. A bancada recolhe o adjetivo e deixa o número."
    ],
    [
      "{candidato2} termina com {pct2}%. A diferença final é o que a urna inteira produziu.",
      "As zonas contadas batem com o total. A soma por legenda fecha.",
      "Amanhã o noticiário lê esta noite com outros verbos. Aqui, o verbo foi o da urna.",
      "Simulação satírica, conta explícita. As duas frases cabem na despedida.",
      "Quem quiser a animação antiga, o modo Simples continua no botão.",
      "O destaque da noite fica guardado para rever, sem recontar voto."
    ],
    [
      "Boa noite. A cadeira desta disputa está definida.",
      "Encerramos. Obrigado por ficar até a soma.",
      "Fim da cobertura desta chave.",
      "A tela repousa no resultado."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.encerramento[k] = F.encerramento.solene;
  });

  F.comentarista_debate = trio(
    [
      "Passo a palavra à mesa. O número já está dado: {partido} com {pct}% em {pct_apurado}% apurados.",
      "Dois comentaristas, uma parcial. Sem inventar urna.",
      "A mesa comenta {regiao}. O voto novo veio de lá.",
      "Debate curto. {candidato} e {candidato2} são os nomes da hora.",
      "Opinião agora, com o percentual na frente.",
      "A bancada discorda do tom, não do algarismo."
    ],
    [
      "O campo de {partido} lê força. O outro campo lê que {pauta} ainda cobra a conta.",
      "Um diz que a zona urbana sempre abre assim. O outro aponta o interior como correção.",
      "Ninguém na mesa antecipa selo. Isso já é um acordo raro.",
      "A discussão é sobre {pauta}, mas o gráfico não vota pauta. O gráfico conta voto.",
      "Há quem veja recado e quem veja inércia. Os dois olham a mesma barra.",
      "O analista devolve a conversa para a vantagem de {vantagem} ponto."
    ],
    [
      "Mesa encerrada. Número intacto.",
      "Devolvemos ao telão.",
      "O debate fica. A urna segue.",
      "Opiniões dadas, parcial mantida."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.comentarista_debate[k] = F.comentarista_debate.solene;
  });

  F.ao_vivo_qg = trio(
    [
      "Ao vivo no comitê. O clima segue o percentual, não o desejo.",
      "Estamos no comitê. Com {pct_apurado}% apurados, ninguém quer a frase errada.",
      "O repórter está na sala onde {partido} acompanha a própria barra.",
      "QG de campanha. A tela aqui é a mesma do estúdio, o suor é outro.",
      "Da rua do comitê: {regiao} é o assunto de quem entra.",
      "Ligação com quem espera {candidato} no salão."
    ],
    [
      "A militância olha {pct}% e ainda não sobe na cadeira.",
      "Quando a barra ameaça cair, o silêncio chega antes do discurso.",
      "Há faixa enrolada no canto. Faixa pronta cedo envelhece mal.",
      "O nome {candidato2} também é acompanhado aqui. Adversário também é número.",
      "Pedem calma pelo telefone. A calma dura até o próximo boletim.",
      "O repórter não confirma vitória. Confirma presença e percentual."
    ],
    [
      "Devolvemos ao estúdio.",
      "O comitê continua no ar em segundo plano.",
      "Ligação encerrada.",
      "QG de volta à espera."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.ao_vivo_qg[k] = F.ao_vivo_qg.solene;
  });

  F.sobras_passo_a_passo = trio(
    [
      "Agora as sobras, rodada a rodada. O professor conduz a média.",
      "D'Hondt ao vivo, em frase curta. A vaga vai para a maior média.",
      "O quociente direto já foi distribuído. O que falta é sobra.",
      "Telão das médias. Quem pulsa, leva a cadeira desta rodada.",
      "Uma vaga por vez. Sem atropelar a conta.",
      "As sobras decidem o fim da lista. {qe} segue como referência do quociente."
    ],
    [
      "A média desta rodada favorece {partido}. A vaga desta conta vai para lá.",
      "Comparando as médias na tela: quem está na frente leva, quem fica atrás espera a próxima.",
      "{media}. É esse o tamanho da disputa pela cadeira que ainda não tem dono.",
      "Candidato muito votado em partido pequeno não fura a média sozinho. A legenda entra na divisão.",
      "A casa mostra a rodada e para. Duas frases, como combinado.",
      "Projeção de sobra não é selo. Selo só no pior caso, ou no fim."
    ],
    [
      "Rodada lida.",
      "Próxima média em seguida, se ainda houver vaga.",
      "O hemiciclo acende mais uma cadeira.",
      "Sobras continuam no telão."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.sobras_passo_a_passo[k] = F.sobras_passo_a_passo.solene;
  });

  F.curiosidade = trio(
    [
      "Um dado de respiro, enquanto {regiao} termina de entrar.",
      "Curiosidade da noite, sem mexer no placar: a ordem das zonas muda a história, não a soma.",
      "No intervalo do susto, um recorte. {pct_apurado}% já estão contados.",
      "A praça comenta {pauta}. A urna comenta outra coisa.",
      "Pequeno quadro. {partido} segue com {pct}% do contado.",
      "Nem toda fala é tarja. Esta é uma pausa."
    ],
    [
      "As primeiras urnas quase sempre urbanizam o vencedor aparente. O interior corrige sem pedir desculpa.",
      "Voto de legenda não tem rosto e mesmo assim elege lista. A proporcional vive disso.",
      "A cláusula de desempenho não dá cadeira hoje à noite em todo cargo, mas decide o ano seguinte do partido.",
      "Foto de urna no celular não é apuração. Apuração é a soma.",
      "O segundo colocado, {candidato2}, ainda está com {pct2}%.",
      "Simulação satírica: nenhum rosto desta bancada existe fora do estúdio."
    ],
    [
      "Pausa feita.",
      "De volta ao placar.",
      "Curiosidade encerrada.",
      "O número grande retoma."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.curiosidade[k] = F.curiosidade.solene;
  });

  F.destaque_candidato = trio(
    [
      "Destaque da parcial: {candidato}, puxado pela própria legenda neste momento.",
      "O telão isola um nome. {candidato}, de {partido}.",
      "Não é selo. É destaque. {pct}% ficam com {partido} nesta altura.",
      "O repórter separa {candidato} de {candidato2} para a leitura ficar clara.",
      "Nome em evidência com {pct_apurado}% apurados.",
      "A barra individual entra no centro."
    ],
    [
      "Na proporcional, o nome famoso não senta se a legenda não alcançar o quociente.",
      "Os 10% do quociente continuam valendo. Sem eles, o voto alto não vira cadeira direta.",
      "{candidato2} aparece logo atrás no recorte, com a legenda em {pct2}%.",
      "Puxador ajuda a lista. Não reescreve a vaga sozinho.",
      "A casa evita a palavra final. Este quadro é caminho.",
      "O gasto de campanha fica para o modo Simples, onde a ficha já existe."
    ],
    [
      "Destaque lido.",
      "De volta à legenda.",
      "Nome fora do centro.",
      "Placar retoma."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.destaque_candidato[k] = F.destaque_candidato.solene;
  });

  F.intervalo = trio(
    [
      "Voltamos já com a apuração. Fique com a gente.",
      "Um respiro de estúdio. A urna não para; a fala, sim.",
      "Intervalo curto. Do outro lado, {partido} segue no placar.",
      "Já voltamos. {pct_apurado}% não saem da tela.",
      "Pausa de programa, não de seção eleitoral.",
      "O patrocínio desta ficção é o próprio jogo. Sem marca de fora."
    ],
    [
      "Quando a gente voltar, o próximo bloco de {regiao} pode estar na soma.",
      "Nada de jingle alheio. Um silêncio curto basta.",
      "A tarja de última hora, se nascer agora, corta este intervalo.",
      "Áudio do estúdio segue desligado, salvo se você ligou.",
      "A conta não foi ao intervalo. Só a voz.",
      "Simulação satírica. Até daqui a pouco."
    ],
    [
      "Estamos de volta.",
      "Intervalo encerrado.",
      "Ao vivo de novo.",
      "O placar retoma a fala."
    ]
  );
  ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) {
    F.intervalo[k] = F.intervalo.solene;
  });

  /* Variantes extras por tom, reaproveitadas como corpos alternativos do marco solene.
     Aumentam a combinação sem repetir a mesma frase. */
  var EXTRAS = {
    informativo: [
      "Leitura informativa: {partido} permanece à frente neste corte de {pct_apurado}%.",
      "O boletim informativo registra {pct}% para {partido} e {pct2}% para {candidato2}.",
      "Sem adjetivo novo. {regiao} é a origem do último incremento.",
      "A vantagem informada é de {vantagem} ponto.",
      "Restam {restante} votos fora desta soma.",
      "O estúdio mantém o selo de parcial.",
      "Próxima atualização no mesmo critério.",
      "Nada de chamada neste tom."
    ],
    tenso: [
      "A sala fica mais quieta. {vantagem} ponto é pouco com {pct_apurado}% na mesa.",
      "Tensão real: {candidato2} ainda cabe no que falta.",
      "{regiao} pode alargar ou apertar. O gráfico espera.",
      "Ninguém pisca para a barra de {partido}.",
      "O restante, {restante} votos, ainda é personagem.",
      "A tarja não nasce de nervoso. Nasce de conta.",
      "Segura o fôlego até o próximo bloco.",
      "Clima de reta, mesmo no meio."
    ],
    didatico: [
      "Didática rápida: percentual é sobre o contado, não sobre o eleitorado inteiro.",
      "{pct_apurado}% apurados significa que o resto ainda pode mover {partido}.",
      "Vantagem em pontos e vantagem em votos não são a mesma frase. Aqui, {vantagem} e {votos}.",
      "A zona {regiao} tem perfil. Perfil não é fraude. É geografia.",
      "Projeção e chamada moram em gavetas diferentes.",
      "O quociente, quando houver, é outra gaveta. {qe}.",
      "Se a frase não cabe na gaveta, a frase não vai ao ar.",
      "Aula de um parágrafo, de volta ao placar."
    ],
    ironico: [
      "Que surpresa: quem está na frente gosta do número, e {candidato2} pede calma.",
      "O comitê de {partido} descobriu a prudência. Demorou {pct_apurado}% para isso.",
      "Ironia à parte, {vantagem} ponto não é muralha.",
      "{regiao} entrou e a torcida fingiu que sempre soube.",
      "Eu anoto o discurso de agora para cobrar no discurso de daqui a pouco.",
      "Nada contra a esperança. Contra a pressa, sim.",
      "O telão, esse, não tem ironia. Tem barra.",
      "Seguimos, com o sorriso do lado de fora da conta."
    ],
    emotivo: [
      "Tem gente segurando a mão do lado no comitê de {partido}.",
      "O número {pct}% não conta o silêncio da sala.",
      "{regiao} chegou e alguém chorou sem saber se era hora.",
      "A distância de {vantagem} ponto cabe num abraço apertado.",
      "A gente não ri de quem espera {candidato2}.",
      "A noite eleitoral é longa para quem pôs o nome na urna.",
      "Emoção na praça, régua no estúdio.",
      "Segue, com respeito pela espera."
    ],
    analitico: [
      "Recorte analítico: a liderança de {partido} coincide com o perfil de {regiao}.",
      "A série não mostra ruptura, mostra composição.",
      "{pct2}% de {candidato2} ainda são compatíveis com oscilação.",
      "Restante de {restante} votos é o intervalo de incerteza.",
      "Sem extrapolar além do bloco que entrou.",
      "A hipótese de virada segue quantificável, não garantida.",
      "Atualizaremos a leitura no próximo ponto.",
      "Fim do parágrafo analítico."
    ],
    grave: [
      "Tom grave, porque o número pede: {pct_apurado}% ainda não são o país.",
      "{partido} lidera, e a liderança nesta hora é um fardo, não uma festa.",
      "A diferença de {votos} votos será lida por muita gente como destino. Ainda não é.",
      "{regiao} não carrega sozinha o mandato.",
      "A bancada baixa a voz e mantém a régua.",
      "Gravidade não é pessimismo. É medida.",
      "Seguimos sóbrios.",
      "O próximo bloco entra sem fanfarra."
    ],
    alarmista: [
      "Alerta de estúdio, não de catástrofe: a parcial ainda cabe virada.",
      "{candidato2} não está fora. {pct2}% e um restante de {restante}.",
      "Quem desligar a televisão agora perde o pedaço em que {regiao} pesa.",
      "A vantagem de {vantagem} ponto é fina.",
      "A casa eleva a tarja de atenção, não a de resultado.",
      "Nada de pânico. Tudo de atenção.",
      "O gráfico pisca o cuidado, não a vitória.",
      "Fique. O número mexe."
    ],
    comemorativo: [
      "O comitê de {partido} sorri com {pct}%, e o estúdio ainda não sorri junto.",
      "Há alívio em {regiao}, do lado de quem se vê na frente.",
      "Comemoração, por enquanto, só na sala certa. Aqui é parcial.",
      "A barra de {partido} está bonita. Bonita não é definitiva.",
      "{vantagem} ponto deixam a sala mais leve, não mais certa.",
      "O abraço fica permitido. O selo, não.",
      "Alegria registrada como clima, não como chamada.",
      "Seguimos com o sorriso do lado de lá do vidro."
    ]
  };

  Object.keys(EXTRAS).forEach(function (tom) {
    F.marco.solene.corpo = F.marco.solene.corpo.concat(EXTRAS[tom]);
  });

  Object.keys(F).forEach(function (seg) {
    var bloco = F[seg];
    if (!bloco || typeof bloco !== "object" || !Array.isArray(bloco.abertura)) return;
    var base = { abertura: bloco.abertura, corpo: bloco.corpo, fecho: bloco.fecho };
    var o = { solene: base };
    ["plantao", "popular", "analitico", "combativo", "seco", "mercado"].forEach(function (k) { o[k] = base; });
    F[seg] = o;
  });

  function contar() {
    var n = 0;
    var chaves = [];
    Object.keys(F).forEach(function (seg) {
      Object.keys(F[seg]).forEach(function (est) {
        ["abertura", "corpo", "fecho"].forEach(function (parte) {
          var lista = F[seg][est][parte] || [];
          lista.forEach(function (_, i) {
            n++;
            chaves.push(seg + ":" + est + ":" + parte + ":" + i);
          });
        });
      });
    });
    return { blocos: n, ids: chaves };
  }

  F.contar = contar;
  root.TelejornalFalas = F;
  if (typeof module !== "undefined" && module.exports) module.exports = F;
})(typeof window !== "undefined" ? window : globalThis);
