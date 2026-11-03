# CADEIRA — O Jogo

Jogo político brasileiro (vanilla HTML/JS). Abra `index.html` ou rode:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Depois acesse http://127.0.0.1:8765/

## Visual

Tema **República (v3)** em `cadeira-v3.css`: base escura grafite com acento dourado, modo claro em papel, Fraunces (títulos) + Source Sans 3 (texto) + IBM Plex Mono (números). É a última folha de estilo do documento e vence as camadas antigas (Executive, House of Cards e módulos) sem mexer na lógica do jogo. As cores fixas escritas no HTML são puxadas para a paleta.

Para mudar o visual, edite `cadeira-v3.css` e rode:

```bash
python3 tools/aplicar_tema.py            # embute o CSS nos dois HTML (idempotente)
python3 tools/aplicar_tema.py --imagens  # também recomprime fotos e logos embutidos para WebP
```

O script edita `index.html` e copia o resultado para `CADEIRA_O_Jogo_25.html`, mantendo os dois idênticos.

### Navegação (mapa do jogo)

`cadeira-v3-nav.js` + `cadeira-v3-nav.css` reorganizam onde as coisas aparecem, sem remover nada:

- **Desktop (≥1080 px):** menu lateral fixo com as 6 áreas (cada uma com uma linha dizendo para que serve) e as seções da área atual; busca, guia, salvar, editor, tema e console no rodapé do menu.
- **Cabeçalho de página:** área › seção, título e descrição.
- **Índice "Nesta tela":** uma linha rolável com os blocos da aba, que destaca o bloco visível e leva até ele (abrindo se estiver recolhido). Substitui a barra de filtros de várias linhas e a barra de modo compacto.
- **Blocos recolhidos** abrem clicando no título (sanfona).
- **Celular/tablet:** o botão "Mais" abre o mapa completo do jogo, agrupado por área.
- **Criação de personagem** em 4 passos (Origem, Identidade, Retrato, Inspiração) com resumo da ficha.

O script `tools/aplicar_tema.py` embute os dois arquivos junto com o tema.

### Mídia (jornal e rede social)

`cadeira-v3-midia.js` + `cadeira-v3-midia.css` trocam o noticiário fixo por conteúdo montado a cada turno:

- **Jornal do mês ("O Plenário"):** uma edição por turno com a sua decisão no evento e o efeito na aprovação, os motivos da variação (do relatório do mês), projeção de votos, troca de cargo/partido, escândalo, gastos, economia (dólar/Selic) e as manchetes do mundo agrupadas (janela partidária vira um placar por partido; internações e aposentadorias viram boletins). Tem coluna de opinião e dá para folhear as edições anteriores.
- **Rede social:** os posts reagem às matérias da edição: rival de outro partido ataca, aliado defende, eleitor do seu bairro cobra ou elogia, imprensa e influenciadores comentam. Seus posts entram na linha do tempo com respostas; responder, compartilhar, acionar o jurídico e impulsionar ficam marcados.
- **O jornal chega sozinho:** quando o mês vira (e depois que o evento do mês é decidido), a edição nova aparece na tela com a manchete, as principais notícias e o post mais comentado sobre você. "Depois" vira um aviso flutuante até você ler; dá para trocar por "só avisar". Bolinha de novidade no menu e na barra do celular.
- **Acesso:** área **Mídia** no menu (Jornal do mês, Rede social, Arquivo de manchetes, Assessoria de imprensa) com aviso de edição nova; "Capa do mês" no Plano do mês; Jornal na barra de baixo do celular.
- As edições ficam salvas em `M().v3midia` (até 12, sem fotos dentro do save). A aba Imprensa antiga continua como "Assessoria de imprensa".

### Diplomacia (líderes mundiais, negociação e voo)

`cadeira-v3-diplomacia.js` + `.css` (com o mapa em `cadeira-v3-geo.js`) corrigem e ampliam o módulo de Relações Exteriores (`window.DIP`):

- **Relógio mundial:** o tick mensal da diplomacia nunca rodava (guarda `typeof` sempre verdadeira). Agora roda a cada mês.
- **Sucessão:** cada país/organismo tem mês de eleição e de posse, limite de mandatos e candidatos reais (EUA 2028: Vance, Newsom, Rubio…; França 2027: Bardella, Philippe…; ONU 2026: Grynspan, Bachelet, Grossi…). Há pesquisas no ano da eleição, resultado e posse no jornal, e o calendário mundial aparece no mapa da diplomacia. Esgotados os nomes reais, entram sucessores com nomes do próprio país. A relação com o novo líder recomeça, pesando a afinidade ideológica.
- **Negociação:** mesa com o que você leva e o que já cedeu, disposição do líder com a linha mínima para assinar, e quatro jogadas (ceder, pedir mais, jogada pessoal, endurecer) com chance visível quando você conhece o perfil. O acordo mexe no jogo (dólar, inflação, commodities, tarifa, PIB, aprovação, relação com blocos) e sai no jornal.
- **Voo:** mapa-múndi real (Natural Earth 1:110m via world-atlas, domínio público), saída de Brasília (Presidente) ou de São Paulo (Governador), câmera que aproxima, acompanha e pousa, avião orientado pela rota. Governador agora pode viajar.

### Pré-candidaturas (corrida dentro dos partidos)

`cadeira-v3-pre.js` + `.css`: durante o ciclo inteiro, cada partido tem até 5 nomes disputando a indicação para Presidente, Governador, Senador (eleições gerais) e Prefeito de Mauá (municipais).

- **Força que muda todo mês:** volta para a base do político (aprovação, cargo, carisma, ambição, titular), reage à variação de aprovação e à troca de cargo, e sofre bastidores sorteados (apoio do cacique, evento com prefeitos, pesquisa interna, acordo com bancada, discurso que viraliza, polêmica, investigação, briga com a direção, perda de aliado). Nomes novos despontam e nomes sem chance desistem e apoiam o líder.
- **Manchetes:** até dois lances por mês (um do partido do jogador, um dos demais) entram no jornal como "Bastidores".
- **Prévias:** no ano da eleição, os grupos de `M().previas.atual` são montados a partir da corrida (até 4 por partido; titular com direito à reeleição vai sozinho; quem aparece em duas corridas vai à do cargo em que é mais forte), e a força vira apoio interno até a decisão em agosto. Saves com prévias já montadas pelo motor antigo são convertidos enquanto ninguém venceu.
- **Jogador:** entra na corrida quando o cargo-alvo bate; ações de agenda de pré-campanha, conversa com a direção e lançamento público.
- **Tela:** Partido › Pré-candidaturas, com fase do ciclo, contagem até as prévias, favoritos, força com tendência e o último fato de cada nome. Estado em `M().v3pre`.

## Build / fonte de verdade

O **HTML compilado é a fonte de verdade**. `index.html` e `CADEIRA_O_Jogo_25.html` devem ser idênticos: edite um e rode o script para sincronizar.

`build_clean_html.ps1` (modo padrão) **não reconstrói** nada: apenas verifica/sincroniza os dois HTML. Se eles divergirem, o script **aborta** para não destruir trabalho.

```powershell
.\build_clean_html.ps1          # verifica/sincroniza (aborta se divergir)
.\build_clean_html.ps1 -Force   # adota o mais recente como fonte
```

O pipeline antigo (base `.bak_abc` + módulos) continua disponível em `-Legacy -Force`, mas está **defasado em ~9.200 linhas** (falta tema escuro, fontes, apuração no mapa e fases do legislativo) e **apaga mudanças recentes**. Use só para referência.

Os arquivos `modulo_*.js`, `geo_abc_data.js` e `CADEIRA_O_Jogo_25.html.bak_abc` permanecem no repositório como histórico, mas **não são mais a fonte do build**.

## Trapaças úteis

No **Console do operador**: bloco **Virar cargo** (Prefeito, Governador, Presidente, etc.).
