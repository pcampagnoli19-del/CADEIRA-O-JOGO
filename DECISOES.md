# Decisões — quociente eleitoral

Data: 2026-10-25. A spec está em `/cursor/stores/self/docs/quociente-eleitoral.md`. O que não estava nomeado no código foi assumido como abaixo e seguido.

## Nomes reais no código

| Papel | Nome no jogo |
|---|---|
| Apuração do ano | `apurarEleicao` |
| Lista proporcional de SP/Mauá | `projetarLegislativo` |
| Corte antigo (os N mais votados) | `aplicarResultadoLegislativo` |
| Deputados federais fora de SP | `eleicaoDepFed` |
| Assembleias fora de SP | `assembleiaUF` |
| Resultado guardado da noite | `M().eleicao._leg2[cargo]` |
| Noite antiga (fallback) | `legPainel`, `desenharLeg`, `atualizarLeg`, `montarNoite` |
| Noite que o jogador vê | mapa `#apurMapa`, função `telaDep` |
| Segundo turno | `apurarSegundoTurno`; em novembro o wrapper com `__blkApur` não reabre o 1º turno |
| Federações | `fedsInit`, `fedDe`, `formarFederacao`, `sairFederacao` |
| Fundo e TV | `fundoDoPartido`, `mult_tv`, `cotaFundoPartidario` |
| Pesquisa | `atualizarPesquisa`, `projecaoLeg`, `M().pesquisaAtual` |
| Campanha | `VIEWS.camp` (a função final, não o `vCamp` capturado no meio do arquivo) |
| Aba Eleições | `VIEWS.ele` |
| Vagas | `CADEIRAS` = `{VER:23, DEPE:94, DEPF:70}`; `UF_SEATS`; `UF_ALESP` |
| Save | `snapshot` / `carregarStr`, chave `cadeira_save_v1` |
| Aleatório do jogo | `R` usa `Math.random`. Já existe `mulberry32` |

O motor puro fica em `js/quociente.js` e é copiado para dentro dos dois HTML (`index.html` e `CADEIRA_O_Jogo_25.html`), marcador `QUOCIENTE_ELEITORAL_V1`. Os testes do Anexo B rodam com `node js/quociente.test.js`. A integração está em `js/integracao-quociente.js`, também embutida, para o jogo continuar abrindo como um arquivo só.

## O que passou a valer

- Vereador, deputado estadual e deputado federal usam quociente eleitoral, quociente partidário, barreira de 10% do QE nas cadeiras diretas e sobras. O padrão é `stf2024` (D'Hondt, sem barreira de partido na sobra).
- `REGRAS_ELEITORAIS.modo_sobras = "lei14211_80_20"` liga sozinho as barreiras 80% / 20% quando elas não vêm explícitas (`regrasEfetivas`). O botão da campanha só mostra a diferença; não grava por cima do resultado oficial.
- Prefeito, governador, presidente e senador continuam majoritários. O 2º turno continua só com os dois que passaram.
- O jogador candidato a cargo proporcional entra na urna mesmo com voto baixo (mínimo 1 voto nominal se tiver partido de verdade). Sem Partido não senta em lista proporcional.
- Federação conta como um partido só. Coligação (`coligacaoAtual`) não entra na proporcional (`coligacao_proporcional: false`). PT já nasce na Federação Brasil da Esperança.
- Save antigo carrega. `_leg2` sem `qe` ganha `sistema: "antigo"` e não é recalculado. A próxima eleição usa o motor novo. `schema_eleicoes_v2` marca a partida.

## Suposições

1. **Mauá continua com 23 vereadores.** A tabela municipal da Constituição (art. 29, IV) existe em `vagasCamaraMunicipal`, mas não troca `CADEIRAS.VER`. O eleitorado dos bairros de Mauá soma 258 mil, acima de 200 mil, então a prefeitura de Mauá segue com 2º turno. A trava dos 200 mil está no código para um município menor.
2. **Janela partidária não mudou.** O jogo já abre a janela em março e abril do ano eleitoral. `REGRAS_ELEITORAIS.calendario.janela_partidaria_dias` guarda 30 só como documentação da regra real.
3. **Cláusula de desempenho.** No ano, vale a faixa cuja chave é a maior ≤ ano (2026: 2,5% nacional e 1,5% em 9 UFs, ou 13 deputados em 9 UFs; 2030: 3% / 2% / 15). Antes de 2026 usa a faixa de 2026. Federação é avaliada junta. Efeito: `fundoDoPartido` devolve 0 e `mult_tv` devolve 1. Até a primeira eleição geral apurada, `clausula_ok` fica verdadeiro para não secar o fundão de um save antigo.
4. **Semente só na projeção proporcional.** `Math.random` global não foi trocado. Em volta de `projetarLegislativo` / `eleicaoDepFed` proporcional, o jogo usa `mulberry32` com `sementePartida` XOR do cargo, do ano e da UF. A repartição em si é pura: os mesmos votos dão as mesmas cadeiras.
5. **Cota de gênero.** Se a lista fica fora de 30/70, o diretório troca o sexo do candidato mais fraco que não é o jogador e grava isso no NPC. A candidatura do jogador não é cancelada por causa da cota.
6. **Limite de candidaturas** é vagas + 1 por legenda. O que sobra vira voto de legenda.
7. **Voto de legenda** fica entre 5% e 25%. Identidade do partido (fundo/18) sobe a fatia. O esforço do jogador (pouca / média / campanha forte) empurra o próprio partido. O número que aparece na noite é o voto nominal, depois dessa fatia.
8. **Puxador** multiplica os votos do escolhido por 2,4. Fundo “em mim” 1,18; “no puxador” reduz o jogador a 0,92 e sobe o puxador 1,35; “na chapa” 1,06.
9. **Anônimos e sem partido** na lista gerada recebem uma sigla real, sorteada pelo peso do fundo, para o voto não ser jogado fora. Ids `TMP|cargo|uf|i`.
10. **Assembleias fora de SP** passam pelo quociente com três candidatos sintéticos por partido. SP continua a Alesp de verdade (`assembleiaUF("SP")` não foi substituída).
11. **Cassação.** `recalcularCadeira(cargo, id)` zera o voto guardado na entrada da eleição, roda de novo e troca a cadeira do NPC quando o id existe no banco. O botão “Cassar um eleito e recalcular” usa o primeiro eleito que não é o jogador. Eleição `sistema: "antigo"` não entra de novo na urna.
12. **Estimativa da pesquisa** não chama `projetarLegislativo` (isso gastaria `Math.random` e mudaria a apuração de verdade). É uma conta à parte, rotulada como estimativa. `P.vence` passa a significar “eleito pelo quociente”, não “entre os N mais votados”.

## O que não foi mexido

CPI, fases legislativas, fotos, aspas do bloco `ap-who` (o fechamento continua `votos</small></div></div>";`) e o tamanho da Câmara de Mauá.

# Decisões — noite de apuração em telejornal

Data: 2026-10-25. A spec está em `/cursor/stores/self/docs/noite-apuracao-telejornal.md`.

## Nomes reais no código

| Papel na spec | Nome no jogo |
|---|---|
| Noite que o jogador vê hoje (modo Simples) | `#apurMapa`, `abrir` / `fechar` em `window._apMapa` |
| Noite anterior, ainda no arquivo | `#noite2`, `NOITE`, `montarNoite` |
| Resultado proporcional já calculado | `M().eleicao._leg2[cargo].qe` (`QE`, `por_partido`, `passos`, `eleitos`, `entrada`) |
| Presidente, governador, senado na noite | `M().eleicao._mapaNac` (`pres`, `spGov`, `spSen`, `elBR`, `elSP`, `presRun`) |
| 2º turno | `E.noite.turno === 2`; par fechado em `gravarSegundoTurno` / `fecharPar` |
| Semente da partida | `M().sementePartida` (a função `sementePartida` continua fechada no bloco do quociente) |
| Motor proporcional | `apurarProporcional` |
| Barramento de fatos | `emitirFato` / `IMPF.emitirFato` |
| Peles de canal | `IMPF` V4 Rede Horizonte, V3 Canal 24h Brasil, V5 TV Aliança, V8 Independente Investigativo, V7 Portal Direita Livre, V6 Agência Fato Brasil, V10 Global Markets Desk |
| Mapa do Brasil por UF | `mapaHTML` dentro do modo Simples. O telejornal não duplica esse SVG |
| Cheat que abre a noite | `A.exfEleicao` ("Ir para a eleição") |
| Vagas | `CADEIRAS`, `L.N` |

O motor puro fica em `js/telejornal.js` e `js/telejornal-falas.js`. A tela fica em `js/integracao-telejornal.js`. Os três entram nos dois HTML, no fim do `<body>`. Teste: `node js/telejornal.test.js`.

## O que passou a valer

- A cobertura abre por cima de `#apurMapa` e é o padrão. "Modo Simples" só esconde o estúdio e devolve o mapa. "Concluir" fecha os dois e marca `noiteVista`, como o botão antigo.
- A curva de urnas é o Anexo A (IPF). O vencedor final é o total que o jogo já gravou. A cobertura não chama de novo `apurarEleicao`.
- "Eleito" no Senado e no 2º turno (só os dois nomes) sai quando `vantagem > votos restantes`. Presidente, governador e prefeito no 1º turno exigem mais: o líder precisa passar de metade dos votos da corrida (`liderVotos > total / 2`). Quarenta por cento com folga sobre o segundo não chama ninguém. No proporcional, `chamadaEleito` devolve falso — partido não ganha a frase "está eleito". O selo de uma pessoa usa `confirmavel`: os votos que faltam vão para cada rival; se em algum cenário o nome sai, o selo não entra.
- Canal troca o texto (`estilo` da pele). A semente da curva não leva o canal.
- Áudio e voz nascem desligados. `prefers-reduced-motion` corta a marquee e o tremor.

## Suposições

1. **Zonas, não o mapa oficial por UF.** O choropleth de verdade continua no modo Simples. No estúdio, cinco zonas (capital, periferia, metropolitana, dois interiores) mostram de onde a parcial está vindo. Não inventei voto estadual.
2. **Voto absoluto da majoritária** é `eleitorado × 0,72 × share`. O share oficial não muda. O número serve para a vantagem e para o restante.
3. **2º turno** só entra na cobertura se a lista daquele cargo já tem exatamente dois nomes. Proporcional não reabre no 2º turno.
4. **Save antigo** não guarda o roteiro. No fim, `E._cobertura` guarda semente, canal e até 8 momentos. Save antigo sem esse campo continua válido.
5. **Fatos** usam o barramento que já existe (`apuracao_inicio`, `apuracao_chamada`, `apuracao_fim`, `discurso_vitoria`, `concessao`, `contestacao`). Não há barramento novo.
6. **Decisão do jogador** no fim (agradecer, conceder, contestar) emite fato e uma fala. Não mexe em voto, popularidade nem justiça. Entrevista, telefonema e vitória prematura ficaram de fora.
7. **Banco de falas** passa de 1.800 blocos recombináveis e segura a meta de repetição. O catálogo inteiro da seção 21 (diálogos por tribo, discursos por arquétipo, intervalos com empresário) não foi fechado.
8. **Chamada errada de canal sensacionalista** existe no motor (Opinião+ / TV Aliança, quando a projeção passa de 97% e o líder ainda não é o vencedor final). No vetor B2 com semente 7 ela não disparou; o texto continua sem a palavra "eleito" fora da chamada confirmada ou do flag `canal_chamou_errado`.
9. **Maioria absoluta no 1º turno.** O Anexo B mede a conta de quem já não pode ser alcançado (`situacaoMajoritaria.matematico`). No jogo, presidente, governador e prefeito ainda precisam de metade dos votos válidos para dispensar o 2º turno. `chamadaEleito` aplica esse portão quando `maioria` é verdadeiro e `turno !== 2`. O vetor B1 continua imprimindo `matematico: true` aos 99% com 48,0% — e, com o portão ligado, essa noite não diz "eleito".

## Fora desta leva

- Fase 4: entrevista com 8 tons, telefonemas, declarar vitória antes da conta, capa do dia seguinte, mercado, diplomacia, replay persistido além dos 8 momentos.
- Fase 5: TTS como trilha da noite, inspetor com "forçar evento" sintético, paleta daltônica em todo gráfico legado, banco no volume máximo da seção 21.
- O inspetor desta leva lista o roteiro e explica a fala corrente. O botão de daltonismo troca a paleta do estúdio. O PiP mostra outro canal da mesma apuração.
