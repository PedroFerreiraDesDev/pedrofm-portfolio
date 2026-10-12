# Como editar Pedro.fm

## Comece aqui
- `conteudo.js`: títulos, projetos, textos e imagens. Este é o arquivo principal para editar.
- `render-conteudo.js`: transforma os blocos em páginas. Não precisa editar para adicionar conteúdo.
- `app.js`: navegação e looping.
- `story.js`: movimentos durante o scroll.
- `modelo-pagina.html`: modelo para uma página independente.
- `assets/`: coloque suas imagens aqui.

## Adicionar parágrafos
Em uma seção, acrescente frases à lista `paragraphs`. Cada item vira um parágrafo:
```js
paragraphs: [
  "Primeiro parágrafo.",
  "Mais texto abaixo do primeiro.",
  "Um terceiro parágrafo, sem alterar a animação."
]
```
Use aspas duplas; para uma aspa dentro do texto, escreva \". Mantenha vírgulas entre os itens. Não coloque HTML no texto: os caracteres são tratados como conteúdo.

## Adicionar outra seção
Copie um dos objetos de `sections` e cole abaixo, separado por vírgula:
```js
{
  type: "text",
  title: "Novo capítulo",
  paragraphs: ["Um parágrafo.", "Outro parágrafo."],
  pending: false
}
```
Pode inserir quantos blocos de texto quiser. O scroll recalcula as posições quando o conteúdo muda.

## Adicionar texto ao lado de imagem
```js
{
  type: "pair",
  title: "Uma decisão do projeto",
  paragraphs: ["Explique o que aparece na imagem."],
  pending: false,
  imageSide: "right",
  image: {
    src: "assets/minha-imagem.webp",
    alt: "Descrição do que a imagem mostra",
    caption: "Legenda ou crédito",
    width: 1200,
    height: 1500
  }
}
```
Use `imageSide: "left"` para inverter os lados. No celular vira uma coluna. Não altere números de movimento ou coordenadas para acrescentar texto.

## Imagem sozinha
```js
{ type: "image", image: { src: "assets/minha-imagem.webp", alt: "Descrição", caption: "Crédito", width: 1200, height: 800 } }
```
Coloque o arquivo dentro de `assets` e escreva o nome exato, respeitando maiúsculas/minúsculas. Prefira nomes sem espaços. Use imagens autorizadas e compactas; dimensões e proporção podem ser diferentes.

## Duplicar um projeto
1. Copie um objeto completo da lista `projects` em `conteudo.js`, desde a abertura `{` até seu fechamento.
2. Cole antes de `sobre`, com uma vírgula entre projetos.
3. Troque `id` por um identificador único, sem espaços ou acentos: `meu-novo-projeto`.
4. Edite `title`, `word`, `summary`, `category`, `color` e `sections`.
5. Use `\n` em `word` para quebrar a capa em duas linhas.
6. A página estará em `#projeto/meu-novo-projeto` e a capa em `#galeria/meu-novo-projeto`.
7. O mapa se redistribui quando há mais de quatro projetos. O perfil Sobre mim continua por último.
8. Só mude `provisional` para `false` depois de substituir os materiais pendentes e confirmar informações.

## Página independente
Duplique `modelo-pagina.html` e renomeie para `nova-pagina.html`. Troque título e conteúdo. Copie as seções ou os pares para adicionar mais conteúdo abaixo. Para um link, escreva:
```html
<a href="nova-pagina.html">Abrir nova página</a>
```
As páginas de projeto usam o scroll animado integrado. Páginas independentes têm leitura vertical convencional, com a mesma identidade e hover.

## Conferir antes de publicar
Abra o site com servidor HTTP; arquivos JS e áudio usam carregamento web. Para validar o conteúdo, execute `node verificar-conteudo.cjs` nesta pasta. Para testar alterações, atualize com Ctrl + F5. A publicação não se atualiza sozinha ao editar arquivos locais: envie novamente a pasta completa ou publique uma nova versão.

## Teste em outros dispositivos
O script `servir-rede.cjs` serve a pasta em `0.0.0.0:4174`, acessível na mesma rede Wi-Fi do computador. Execute `node servir-rede.cjs` e use o endereço que ele imprime. O computador precisa ficar ligado. Se o Windows solicitar permissão para rede privada, permita apenas se essa for sua rede de confiança. Esse endereço não é uma publicação na internet.

## Conteúdo provisório
As imagens atuais são espaços reservados, não trabalhos realizados. Preserve os créditos e não inclua material interno ou dados de clientes sem autorização.


## Imagens, vídeos, arquivos e carregamento
Leia `PADROES-DE-CONTEUDO.md` antes de inserir materiais. Os blocos `video` e `file` estão disponíveis. A página `codigo.html` permite ler e baixar o guia e o código de carregamento. `loading.js` deve vir antes dos outros scripts. O carregamento aparece durante esperas reais; não adicione pausas artificiais.


## Ressonância ao longo do estudo
A interação agora acompanha as imagens e os textos de todos os projetos durante o scroll vertical. Não existe mais o quadro separado de demonstração. Leia APRENDER-O-CODIGO.md para entender os arquivos, os parâmetros JSON e o fluxo VS Code → GitHub → publicação.
