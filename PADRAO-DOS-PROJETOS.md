# Padrão dos estudos de caso — Pedro.fm

Os sete projetos usam o modelo aprovado em Experiência. A página Sobre preserva uma estrutura própria. O layout, o vento, as folhas, a resposta dos títulos e as regras responsivas são compartilhados; conteúdo e imagens pertencem a cada projeto.

## Estrutura editorial

1. **Resultado:** capa e primeira imagem do projeto.
2. **Contexto:** desafio, público, restrições e papel de Pedro, na introdução e no primeiro bloco.
3. **Ideia central:** uma pausa tipográfica que liga intenção e solução.
4. **Decisões:** texto e imagem relacionando escolhas a evidências.
5. **Aplicações:** imagem ampla e detalhes do trabalho em uso.
6. **Resultados e aprendizado:** somente fatos comprovados ou observações documentadas.
7. **Créditos e continuidade:** autoria, equipe, autorizações e acesso ao próximo projeto.

As composições atuais são provisórias. Redes sociais e endomarketing receberam espaços visuais próprios, sem publicar materiais internos da agência ou inventar clientes, campanhas realizadas ou desempenho.

## Onde editar

Edite `conteudo.js`. Cada projeto possui `id`, `title`, `category`, `lead`, `metadata`, `sequenceTitle` e `sections`.

`sequenceTitle` contém duas linhas curtas para a abertura animada, por exemplo:

```json
"sequenceTitle": ["Uma ideia,", "muitas formas."]
```

Prefira linhas curtas, especialmente no celular. A abertura usa o primeiro bloco `pair` com imagem válida. Se o projeto começar com outro tipo de bloco, o conteúdo é mostrado normalmente, sem forçar uma abertura vazia.

Blocos disponíveis:
- `text`: título e parágrafos.
- `pair`: título, parágrafos e uma imagem; `imageSide` define `left` ou `right`.
- `image`: imagem ampla com legenda.
- `video`: vídeo com controles nativos.
- `file`: arquivo para baixar.

Duplique e reordene os blocos dentro de `sections`. A página cresce com o conteúdo. Não é necessário copiar CSS ou criar uma animação separada por projeto. Para uma nova página de projeto, duplique um objeto de `projects`, use um ID único e mantenha o perfil Sobre por último.

O link Próximo projeto é calculado pela ordem dos projetos, excluindo Sobre; o último retorna ao primeiro.

## Arquitetura compartilhada

- `render-conteudo.js`: `projectCasePage()` monta todos os estudos.
- `experience.css`: composição editorial e margens compartilhadas.
- `experience.js`: atmosfera contínua, entradas, hover e ativação das imagens próximas da tela.
- `sequence.js`: abertura aprovada, com frase específica de cada projeto.
- `paper.js`: malha contínua para curvar as imagens sem fragmentação.

Os nomes `experience.js` e `experience.css` foram mantidos para preservar a continuidade do código; agora atendem todos os projetos.

Referências de direção e detalhes técnicos estão em `SEQUENCIA-REFERENCIAS.md`. O padrão replica uma implementação aprovada pelo usuário, não as identidades visuais dos sites de referência.

## Verificação

Execute `node verificar-conteudo.cjs`, `node tests/experience.cjs`, `node tests/sequence.cjs` e `node tests/paper.cjs`. Testes automatizados não substituem revisão visual no desktop e no celular.

Antes de retirar `provisional: true`, substitua as imagens e os textos de preparação, confira legendas e créditos e confirme a autorização para apresentar os materiais.
