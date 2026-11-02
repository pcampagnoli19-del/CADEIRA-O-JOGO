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
