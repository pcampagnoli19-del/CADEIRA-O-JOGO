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
