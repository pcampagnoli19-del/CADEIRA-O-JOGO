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

## Piso de cinco candidatos a governador (2026-10-27)

- Toda disputa estadual de governo passa a ter **pelo menos 5 candidatos** depois de aplicados os filtros de federação, prévia e exclusividade de registro. A ordem é: políticos reais elegíveis primeiro; só depois entram figurantes gerados.
- São Paulo usa `candidatosMajoritarios("GOV")`; os outros estados usam `montarDisputaUF`/`filtrarDisputa`. O piso é aplicado nos dois caminhos e também no envelope final de chapa, para o caso de uma prévia derrubar um nome depois da montagem.
- O registro oficial (`tentarRegistrar`) passou a contar a **federação** como uma só legenda em todos os cargos majoritários, não apenas no Senado. Assim, um aliado da mesma federação do jogador não ocupa uma vaga que depois seria removida pelo `colapsar`/`filtrarChapa` e deixaria a urna com 2 nomes.
- O registro ganhou versão (`r.v = 2`): saves antigos que já tinham uma lista curta são reconstruídos uma vez ao abrir/atualizar a pesquisa, sem precisar começar uma carreira nova.
- A pesquisa publicada passou a mostrar até 6 nomes por instituto (antes 4), garantindo que o jogador e os cinco candidatos de governo apareçam no card "Pesquisas publicadas".

## Obras: lista completa e mobilidade separada (2026-10-27)

- O card "Em andamento / rede" não usa mais `slice(0, 40)`. O corte escondia obras novas depois de 40 instâncias ativas (as manutenções automáticas já ocupavam boa parte do limite). Agora todas aparecem, ordenadas por estado (execução/atraso/paralisada/aprovada/negociação/manutenção) e, dentro do grupo, pela mais recente.
- A área **Mobilidade** saiu do card geral e ganhou o card próprio **"Mobilidade Urbana"**. Ele tem lista ativa, catálogo, filtros de categoria e pedidos independentes; o card "Obras e Programas" passou a excluir essa área.
- O estado dos filtros fica em `S.obras` (geral) e `S.obrasMob` (mobilidade), para trocar a categoria de um card não afetar o outro.
- A mudança vale para saves existentes: não há migração, pois a separação é feita na leitura das instâncias e do catálogo.

## Verba de emendas separada do caixa de obras (2026-10-27)

- Obras e manutenções usam o caixa de investimento calculado em `ORC_BASE` (`OBRAS._caixaObras()`), não a verba mensal de emendas (`GOVCFG.orc`). O espelhamento antigo que somava cada parcela de obra em `M().gab.orcamento_gasto` foi removido de `_avancarExecucao` e `_tickManutencao`.
- Com o espelhamento, qualquer obra ativa consumia todo o orçamento livre do mês e o card "Emendas do mês" ficava em R$ 0, obrigando o jogador a usar caixa 2 para governabilidade.
- A verba mensal continua sendo consumida apenas por emendas, ações de Executivo (`pagar`) e crises.
- Saves existentes recebem uma correção única (`m.verbaEmendasV1`): `orcamento_gasto` volta a ser a soma das emendas do mês. Isso remove o valor antigo que tinha sido espelhado pelas obras sem exigir carreira nova.
- A regra vale para os dois cards de obras: o geral e o de Mobilidade Urbana.

## O que não foi mexido

CPI, fases legislativas, fotos, aspas do bloco `ap-who` (o fechamento continua `votos</small></div></div>";`) e o tamanho da Câmara de Mauá.
