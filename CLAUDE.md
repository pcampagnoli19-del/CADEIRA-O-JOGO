# Instruções para o Claude

## Protocolo de publicação (pedido do dono do repositório)

**Sempre publicar no GitHub Pages ao terminar uma mudança.** Não perguntar antes.

1. Commitar e dar push no branch de trabalho.
2. Abrir um pull request para `main` e fazer o merge.
3. Acompanhar o workflow "Deploy to GitHub Pages" até concluir com sucesso.
4. Passar o link do site: https://pcampagnoli19-del.github.io/CADEIRA-O-JOGO/

Se os testes falharem ou o jogo quebrar, não publicar: avisar o dono primeiro.

## Antes de publicar

- `index.html` e `CADEIRA_O_Jogo_25.html` precisam ser idênticos. Depois de editar
  `cadeira-v3*.css` / `cadeira-v3*.js`, rodar `python3 tools/aplicar_tema.py`.
- `node js/quociente.test.js` deve imprimir `ANEXO_B_OK`.
- Abrir o jogo no navegador (Playwright) e avançar alguns meses sem erros de página.
