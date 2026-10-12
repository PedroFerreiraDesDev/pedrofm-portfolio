# Padrões de conteúdo — Pedro.fm

Este é o contrato de conteúdo da primeira versão. Os valores abaixo são metas de produção do portfólio, não limites universais da web. Antes de publicar, use materiais reais e autorizados; os espaços atuais continuam provisórios.

## Organização e nomes

- Edite conteúdo em `conteudo.js`; mantenha animação e navegação nos arquivos próprios.
- Organize materiais em `assets/id-do-projeto/`.
- Nomes sem espaços ou acentos, em minúsculas: `identidade-aplicacao-01-1200.webp`.
- Use um `id` único como `identidade-cliente`. Não altere IDs já compartilhados sem manter seus links.
- Caminhos aceitos: `assets/...` ou HTTPS. Prefira arquivos locais para evitar links externos expirados, bloqueio de download e dependência de terceiros.
- Cada projeto deve informar contexto, desafio, participação de Pedro, decisões, resultado, ano, equipe e créditos. Marque intenção profissional e referências externas como tais.
- Não use documentos de formação como projetos realizados; não publique documentos internos, dados pessoais ou materiais de agência sem autorização.

## Imagens

| Uso | Proporção sugerida | Dimensão de exportação | Meta de peso |
| --- | --- | --- | --- |
| Imagem ao lado do texto | 4:5 ou 4:3 | 1200 × 1500 ou 1200 × 900 | até 300 KB |
| Imagem horizontal de resultado | 16:9 ou proporção original | até 1920 px de largura | até 500 KB |
| Versão para celular | mesma proporção da principal | 640–800 px de largura | até 150 KB |
| Poster de vídeo | mesma proporção do vídeo | 1280 × 720, para vídeo 16:9 | até 200 KB |

- Prefira WebP ou AVIF; JPEG para fotografia e PNG quando transparência justificar o peso. SVG para vetores confiáveis e previamente revisados.
- Exporte em sRGB. Evite imagens enormes reduzidas apenas pelo CSS e GIFs animados.
- Preencha `width` e `height` com as dimensões reais, como números positivos. Isso reserva espaço antes do carregamento.
- Preencha `alt` com o que a imagem comunica. Coloque créditos em `caption`; não repita a legenda no alt.
- Nos pares, a imagem usa `object-fit: cover`. Deixe respiro ao redor de elementos essenciais; logotipos ou textos perto das bordas podem ser cortados. Para peças que precisam aparecer inteiras, use um bloco `image` independente, que preserva a proporção.
- Texto essencial deve existir também como texto da página; não dependa de letras embutidas na imagem para explicar o projeto.
- Uma imagem não carrega o restante da página: seu estado de espera e erro fica no próprio espaço, com nova tentativa.

```js
{
  type: "pair",
  title: "A decisão de identidade",
  paragraphs: ["Explique a decisão e o efeito no resultado."],
  imageSide: "right",
  image: {
    src: "assets/meu-projeto/aplicacao-1200.webp",
    alt: "Aplicação da marca em embalagem e papelaria",
    caption: "Projeto e créditos a confirmar antes de publicar",
    width: 1200,
    height: 1500,
    srcset: [
      { src: "assets/meu-projeto/aplicacao-640.webp", width: 640 },
      { src: "assets/meu-projeto/aplicacao-1200.webp", width: 1200 }
    ]
  }
}
```

As versões de `srcset` devem mostrar a mesma imagem, com a mesma proporção e dimensões indicadas. O navegador escolhe a versão conforme o espaço e a tela. Não escreva HTML dentro dos campos.

## Textos

- `word`: preferencialmente até 12 caracteres por linha e no máximo duas linhas. Use `\n` para a quebra da capa. Revise em uma tela de 390 px.
- `title`: título descritivo, preferencialmente até 70 caracteres. Evite nomes excessivamente longos e caixa alta em parágrafos.
- `summary`: uma frase curta, idealmente até 100 caracteres. O resumo do mapa ocupa uma linha; detalhes pertencem ao estudo.
- `lead`: 1–3 frases que expliquem o projeto e sua participação.
- `paragraphs`: um parágrafo por item; prefira 40–90 palavras por parágrafo. Para mais conteúdo, acrescente itens ou blocos, em vez de inserir quebras ou HTML.
- `caption`: até duas frases, com crédito e contexto quando necessário.
- `imageSide`: `left` ou `right`; no celular o par vira uma coluna. Não use espaços, coordenadas ou margens para forçar o alinhamento.
- Separe resultados medidos de percepção pessoal. Não invente clientes, números, autoria ou depoimentos.

## Vídeos

- O bloco atual aceita MP4, preferencialmente H.264 com áudio AAC, e arquivos VTT de legenda.
- Use 720p ou 1080p, normalmente 24 ou 30 quadros por segundo. Exporte para reprodução progressiva, com os metadados no início do arquivo (fast start).
- Meta de clipes no estudo: 15–45 segundos e até 8 MB. Para vídeos extensos, use um link externo de visualização em vez de incluir um arquivo pesado no site.
- Inclua `poster`, `width`, `height`, descrição e legendas quando houver fala ou informação sonora essencial.
- O vídeo começa por ação do visitante; não há autoplay. O carregamento do vídeo fica no próprio bloco. O som ambiente do site respeita o botão de som e a saída da aba.
- Mantenha cores e proporção consistentes entre vídeo e poster. Evite flashes rápidos.

```js
{
  type: "video",
  video: {
    src: "assets/meu-projeto/apresentacao.mp4",
    poster: "assets/meu-projeto/apresentacao-poster.webp",
    captions: "assets/meu-projeto/apresentacao-pt-br.vtt",
    alt: "Apresentação das aplicações da identidade",
    caption: "Filme de apresentação. Créditos: equipe responsável.",
    width: 1280,
    height: 720
  }
}
```

## Arquivos para baixar

- Prefira PDF para apresentações finais: fontes incorporadas, texto selecionável, imagens comprimidas e sem conteúdo interno. Meta de peso: até 5 MB.
- Diga no rótulo o tipo e o peso, por exemplo: `Baixar apresentação — PDF, 2 MB`.
- Use arquivos do próprio site. Downloads externos precisam permitir acesso por CORS para o preparo do arquivo funcionar.
- O indicador acompanha o download até o navegador receber o arquivo. O site não consegue confirmar se o visitante salvou ou abriu o arquivo no dispositivo.

```js
{
  type: "file",
  file: {
    src: "assets/meu-projeto/apresentacao.pdf",
    name: "pedrofm-meu-projeto.pdf",
    label: "Baixar apresentação — PDF, 2 MB",
    description: "Seleção de aplicações e decisões do projeto."
  }
}
```

## Reutilizar o carregamento

Inclua `loading.css` e carregue `loading.js` antes dos scripts que o utilizam. Os modelos de página já fazem isso.

```js
await PedroLoading.run(async () => {
  const resposta = await fetch("assets/meu-projeto/dados.json");
  if (!resposta.ok) throw new Error("Falha no arquivo");
  return resposta.json();
}, {
  label: "Carregando material…",
  scope: document.getElementById("minha-area")
});
```

Para operações controladas manualmente, `PedroLoading.begin({label, scope, retry})` retorna `done()` e `fail(mensagem)`. Sempre encerre o estado, inclusive quando houver erro. Sem `scope`, usa o indicador geral. A operação define seu tempo limite e cancelamento; o indicador não cancela automaticamente tarefas próprias.

- Só use carregamento durante uma operação real. Não adicione espera artificial a transições já prontas.
- O indicador surge após 180 ms de espera; arquivos rápidos não provocam piscadas.
- Imagens e arquivos integrados têm tempo limite de 25 segundos e uma opção de tentar de novo. Uma troca de arquivo no leitor cancela a solicitação anterior.
- Não há porcentagem inventada. Quando o tamanho total não é conhecido, o estado é indeterminado.
- As ondas de sintonia e o ruído visual seguem a identidade. Um toque sonoro discreto só ocorre quando o som já foi ativado e a página está em foco.
- Movimento reduzido desativa a animação das ondas. Mensagens são anunciadas a leitores de tela.

## Antes de publicar

1. Execute `node verificar-conteudo.cjs` na pasta do site. Erros devem ser corrigidos; revise também os avisos.
2. Teste em desktop e celular, com teclado, movimento reduzido e rede lenta.
3. Confira as imagens até o final do estudo, vídeos, legendas, downloads e novas tentativas.
4. Revise cortes, alinhamento, nomes de arquivo, textos longos e os créditos.
5. Confirme que todo material exibido como trabalho tem autoria e participação documentadas.
6. Publique a pasta completa. Alterar o arquivo local não atualiza automaticamente a versão pública.

Os valores de peso e dimensão orientam a produção. Não substituem uma revisão visual; o validador não consegue avaliar legibilidade dentro de imagens, veracidade, autorização ou qualidade estética.
