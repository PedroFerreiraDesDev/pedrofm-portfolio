# Pedro.fm — Portfólio

Resultado e raciocínio em uma experiência autoral de capas e estudos.

## Visual Studio Code

Abra a pasta `mapa-portfolio`. Em **Terminal → Executar Tarefa**, escolha **Pedro.fm: iniciar site local**. Acesse http://127.0.0.1:4174/. Para validar o conteúdo, escolha **Pedro.fm: verificar conteúdo**.

As tarefas usam o Node instalado neste computador. Em outro computador, instale o Node.js e altere `command` em `.vscode/tasks.json` para `node`.

## Editar

- `conteudo.js`: projetos, títulos, textos e materiais.
- `COMO-EDITAR.md`: duplicação de projetos e páginas.
- `PADROES-DE-CONTEUDO.md`: imagens, vídeos, arquivos e créditos.
- `app.js`, `zoom.js` e `story.js`: navegação e movimento.

## GitHub

A conexão da conta e o repositório remoto precisam ser confirmados antes do primeiro envio. Não coloque senhas ou tokens no projeto. No VS Code, a aba Controle do Código-Fonte apresenta os arquivos e as alterações do Git.

## Publicação

Site: https://pedrofm-portfolio.admped.chatgpt.site/

O GitHub versiona o código. Enviar alterações ao GitHub não atualiza automaticamente esse endereço: ele utiliza a publicação do Sites. O checkout de publicação permanece separado em `../publicacao-portfolio-original`.

## Conteúdo

Os projetos provisórios continuam identificados. Confirme autoria, participação, resultados e autorização dos materiais antes de apresentá-los como trabalhos realizados.

## Se o Git sinalizar propriedade da pasta

A pasta foi criada pelo ambiente isolado do Codex. Caso o VS Code mostre dubious ownership, abra o terminal do próprio VS Code com sua conta Windows e execute esta exceção somente para este projeto:

```powershell
git config --global --add safe.directory C:/Users/Pedro/Documents/Codex/2026-10-04/fa-a-estas-altera-es-em-2/mapa-portfolio
```

O Git local já está inicializado na branch main. A configuração global não pôde ser alterada por este ambiente, que não tem permissão de gravação no arquivo da sua conta. A sincronização com GitHub depende de confirmar a conta e o repositório remoto.
