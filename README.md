# CADEIRA — O Jogo

Jogo político brasileiro (vanilla HTML/JS). Abra `index.html` ou rode:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Depois acesse http://127.0.0.1:8765/

## Visual

Tema **House of Cards** (thriller) + menu em 6 hubs em `cadeira-theme.css` (também embutido no HTML). Tipografia Fraunces + DM Sans; atmosfera institucional satírica. Não altera a lógica do jogo.

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

No **Console do operador**: bloco **Virar cargo** (Prefeito, Governador, Presidente, etc.). O botão **Ir para a eleição** abre a noite.

## Noite de apuração

O padrão é a cobertura em telejornal (estúdio, telão, tarja, ticker). **Modo Simples** devolve o mapa antigo. Áudio nasce desligado.

```bash
node js/telejornal.test.js
```
