# Aprender com o Pedro.fm

## O que mudou nesta versão

A ressonância faz parte dos sete estudos de caso. Removemos o quadro de demonstração, seus três botões e o controle de intensidade da interface. As imagens das seções passam a se deformar em faixas durante a rolagem da própria página. Textos acompanham a onda com deslocamentos menores, preservando a leitura. A página Sobre mantém sua apresentação anterior.

Há mais espaço entre texto e imagem e entre seções. Esse vazio permite perceber a transformação sem sobrepor conteúdo. O efeito usa a posição do scroll: voltar ao mesmo ponto, com o ponteiro na mesma posição, produz a mesma composição. Parar de interagir deixa o conteúdo em repouso.

## Como os arquivos se conectam

| Arquivo | Responsabilidade | O que você pode editar |
| --- | --- | --- |
| `conteudo.js` | Lista de projetos e blocos de conteúdo | Títulos, parágrafos, imagens, vídeos e ordem das seções |
| `render-conteudo.js` | Converte os dados em HTML | Estrutura dos blocos e faixas das imagens |
| `app.js` | Navegação entre mapa, capa e estudo | Estados e rotas `#galeria/…` e `#projeto/…` |
| `story.js` | Movimento coordenado pelo scroll | Distâncias, curvas e ressonância |
| `discovery.js` | Busca e valida a configuração | Limites e valores de fallback |
| `interacoes.json` | Configuração por projeto | Amplitude, profundidade, frequência e intensidade |
| `discovery.css` | Respiro e superfície das imagens | Margens, distância entre colunas e perspectiva |
| `white.css` | Composição editorial branca | Tipografia e layout base |
| `tactile.js` / `wind.js` | Cor localizada e rastro do ponteiro | Relação entre vento, texto e imagem |
| `audio.js` | Som sintetizado, ativado pelo visitante | Beat e filtros; a ressonância visual não depende do áudio |
| `codigo.html` / `codigo.js` | Leitor de arquivos no navegador | Abas e explicações do código |

O projeto usa HTML, CSS e JavaScript sem um motor 3D adicional. `JSON` guarda dados: ele não executa animações e este arquivo não é uma animação Lottie. A profundidade atual é feita com transformações CSS em planos; não há modelos GLB nesta versão.

## Da imagem à folha sonora

1. `renderProjectContent()` identifica um estudo pelo atributo `data-resonance-project`.
2. `imageContent(image, true)` conserva a imagem original com seu texto alternativo, dimensões e legenda. Acrescenta sete cópias decorativas da mesma imagem.
3. O CSS `clip-path` mostra somente uma faixa vertical de cada cópia. As sete faixas recompõem a imagem inteira.
4. `story.js` espera todas essas imagens carregarem antes de mostrar as faixas. Até lá, a imagem original continua visível. Se alguma falhar, a original permanece como alternativa.
5. O scroll determina uma fase de onda; cada faixa recebe uma fase ligeiramente diferente. Uma sobe enquanto a vizinha começa a descer, criando a sensação de superfície flexível.

As cópias usam a mesma URL e podem reutilizar o cache do navegador. Ainda há custo de composição gráfica: por isso são sete faixas, com carregamento `lazy`, sem uma biblioteca WebGL e sem animação infinita em repouso. As cópias estão ocultas para leitores de tela, evitando repetir a descrição sete vezes.

## A matemática, em linguagem simples

Trechos de `story.js`:

```js
const phase = gallery.scrollTop / height * (tuning.frequency || 3)
  + i * .55 + pointer * .4;
```

`scrollTop` é a distância já rolada, em pixels. Dividir pela altura da tela torna a velocidade mais consistente entre telas. `frequency` controla quanto a fase muda; `i` introduz uma diferença entre blocos, e o ponteiro acrescenta uma pequena influência.

```js
const envelope = Math.sin(travel * Math.PI) ** 2;
```

`travel` varia de zero a um enquanto o bloco atravessa a tela. A envoltória começa em zero, cresce e volta a zero. Isso evita uma deformação que apareça abruptamente na borda da tela.

```js
const a = (tuning.amplitude ?? 30) * strength * envelope;
const angle = phase + index * .68;
```

`a` é a amplitude efetiva. `index` identifica a faixa. O deslocamento usa `Math.sin(angle)`; a profundidade usa `Math.cos(angle)`. Seno e cosseno descrevem movimentos ondulatórios complementares.

```css
transform: translate3d(0, 12px, 8px) rotateX(2deg);
```

Esse exemplo move uma faixa 12 pixels verticalmente, 8 pixels em profundidade e a inclina 2 graus. O JavaScript calcula valores diferentes a cada atualização. A propriedade `perspective` do CSS permite perceber a profundidade. O layout não é recalculado por alterações de `top`, `width` ou `height` durante o efeito.

`requestAnimationFrame()` agrupa a atualização no próximo quadro do navegador. Scroll e ponteiro pedem uma atualização; o código evita agendar duas ao mesmo tempo. Depois da breve acomodação do ponteiro, para de solicitar quadros. Não adicionamos outro Canvas ou outro ciclo contínuo para esta ressonância.

## Ajustar pelo JSON

Exemplo de configuração para colar na entrada `identidade`, dentro de `projects`:

```json
"identidade": {
  "amplitude": 30,
  "depth": 90,
  "frequency": 3,
  "intensity": 0.65
}
```

| Parâmetro | Faixa aceita | Resultado |
| --- | --- | --- |
| `amplitude` | 0 a 60 | Deslocamento máximo das faixas antes dos multiplicadores de intensidade e posição |
| `depth` | 0 a 150 | Quanto a onda se projeta em profundidade |
| `frequency` | 1 a 8 | Quanto a onda varia conforme o scroll; não representa a frequência do áudio |
| `intensity` | 0 a 1 | Força geral da ressonância; zero desativa essa camada de movimento |

Os valores em `defaults` valem para projetos sem uma configuração própria. Valores em `projects` substituem os padrões daquele projeto. Preserve `version: 1`. Não coloque comentários nem vírgula depois do último campo em JSON. Recarregue a página após editar: os dados são reutilizados em memória durante a visita.

Experimento: reduza `intensity` para `0.35`, salve, recarregue e compare com `0.65`. Depois altere somente `frequency`. Mudar uma variável por vez ajuda a entender o resultado. No celular o código usa 45% da intensidade de desktop. Quem solicita movimento reduzido no sistema vê imagens e conteúdo estáticos.

## Espaço e conteúdo novo

Em `discovery.css`, `.story-pair` controla o respiro dos pares texto/imagem. No desktop usa pelo menos `105svh` e um espaçamento entre colunas de `56px` a `120px`. No celular, as colunas ficam empilhadas com `80px` entre os elementos. Não há quadro de altura fixa escondendo conteúdo.

Para acrescentar mais texto, adicione outro bloco `text` em `sections` no `conteudo.js`. Para texto ao lado de uma imagem, use `pair`; `imageSide: "left"` troca o lado da imagem. Continue usando dimensões reais, `alt` descritivo e legendas. Vídeos mantêm controles nativos; não os dividimos em sete players.

Os materiais provisórios continuam provisórios. Esta versão demonstra a interação, não comprova resultados ou clientes que ainda não foram informados.

## Seu fluxo no VS Code e no GitHub

1. Abra no VS Code a pasta `mapa-portfolio`, dentro da pasta deste trabalho. É a pasta que contém `conteudo.js` e `.vscode`.
2. Abra `interacoes.json` numa coluna e `story.js` ao lado: clique com o botão direito na aba e escolha abrir ao lado. Use `Ctrl+P` para localizar arquivos.
3. Em **Terminal → Executar Tarefa**, escolha a tarefa de prévia do portfólio. Ela usa `servir-rede.cjs`. Abra `http://127.0.0.1:4174/` no navegador. Se a porta estiver ocupada pela mesma prévia, reutilize-a.
4. Edite um parâmetro, salve e atualize o navegador. Este servidor simples não tem recarga automática.
5. No painel **Controle do Código-Fonte**, clique no arquivo alterado para comparar antes/depois. Confira o diff antes de registrar um commit.
6. Um commit registra uma versão no Git local. O envio ao GitHub compartilha esse histórico. Se o VS Code pedir autenticação, use sua própria conta do GitHub; a autorização do conector desta conversa é separada da autorização local.
7. Publicar no Sites é outra etapa. Salvar no VS Code ou enviar ao GitHub não atualiza automaticamente o endereço `chatgpt.site`. Nesta conversa, sincronizamos o código e publicamos a versão pelo fluxo do Sites.

Para rodar os testes desta interação, com Node disponível no terminal:

```sh
node tests/ressonancia.cjs
node verificar-conteudo.cjs
```

Você também pode ler este guia e os arquivos em `codigo.html` no site. O leitor permite consultar e baixar; ele não edita o projeto.

## Interações que podemos explorar depois

- **Antes / decisão / resultado:** a onda revela versões de uma identidade, com uma explicação concreta de cada mudança. Precisamos das versões reais para que o efeito conte o processo.
- **Composição tipográfica variável:** letras mudam de largura ou peso ao sintonizar; depende de uma fonte variável licenciada e deve manter leitura e seleção do texto.
- **Objeto 3D sob demanda:** um mockup GLB aparece somente ao abrir uma seção específica. Exige modelo e texturas otimizados; imagem estática como alternativa.
- **Partitura do processo:** marcos da rolagem revelam pesquisa, escolha e aplicação, usando o mesmo motor de posição atual.

O VS Code permite inspecionar e experimentar essas ideias. O GitHub permite comparar versões, criar uma branch de experiência e revisar antes de incorporar. Nenhuma dessas ferramentas exige que cada ideia seja publicada imediatamente.

No VS Code, a tarefa **Pedro.fm: testar ressonância** executa o teste sem depender de Node configurado no PATH.
