# Experiência — página contínua

A linguagem do piloto aprovado foi estendida à página inteira de Experiência. A abertura continua com sua sequência; o restante usa rolagem vertical contínua, uma atmosfera WebGL compartilhada e quatro imagens adicionais com malha de papel. O conteúdo e as cinco imagens são provisórios. Os demais projetos não foram alterados.

Arquivos principais: `experience.js` (atmosfera, entradas, hover e ciclo de vida das malhas), `experience.css` (margens e composições), `conteudo.js` (textos e mídias editáveis), `paper.js` (superfície contínua) e `sequence.js` (abertura aprovada).

O sistema libera as malhas dos trechos distantes da tela. Somente a abertura mantém um trecho fixado pelo scroll; os blocos seguintes não criam rolagem independente. No celular, as imagens ficam inteiras em leitura vertical e a atmosfera acompanha o percurso.

Teste adicional: `node tests/experience.cjs`. Não houve inspeção visual em navegador nem medição em GPU real nesta sessão.

---

## Histórico do piloto e referências

# Sequência representativa — Experiência

Este piloto transforma o primeiro par de texto/imagem e coordena a chegada do segundo par do projeto `experiencia`. A imagem continua provisória. O restante dos projetos conserva o comportamento anterior para permitir comparação.

## Direção e referências

| Referência | Evidência consultada | Adaptação neste piloto |
| --- | --- | --- |
| https://unseen.co/projects/ | Página apresenta exploração por arraste, clicar/segurar e som opcional | Resposta do ambiente ao gesto, com energia e acomodação. Não copiamos esses controles ou a identidade. |
| https://blueyard.com/ | Narrativa organizada por territórios | Continuidade de uma matéria visual através de três momentos. |
| https://www.webgpu.com/showcase/blueyard-two-color-webgl-atlas/ | Relato externo descreve esfera fluida e cursor reativo | Referência conceitual de matéria responsiva. Nossa corrente é um shader procedural, não a simulação fluida descrita no relato. |
| https://stark-defence.com/en | Página com produtos, grandes chamadas e imagens | Hierarquia entre título, objeto e explicação. A animação exata não foi inspecionada visualmente. |

O acesso às referências nesta sessão foi textual. Não afirmamos ter reproduzido ou analisado quadro a quadro suas animações. A sequência implementada é uma interpretação autoral para vento, onda e papel na marca Pedro.fm.

## Cinco momentos

1. **Presença:** título amplo e corrente translúcida no espaço branco.
2. **Aproximação:** a imagem chega da direita em perspectiva, com bordas curvas.
3. **Observação:** a fotografia se alinha e a curvatura recua para zero em repouso. O texto de contexto aparece ao lado.
4. **Descoberta:** a margem apresenta o anúncio da próxima seção de processo, ainda com conteúdo provisório.
5. **Continuidade:** a folha sobe e inclina; o segundo par entra com posições coordenadas pela mesma rolagem.

No desktop, a seção tem 300 alturas de viewport e seu palco permanece visível por parte desse percurso usando `position: sticky`. A rolagem pertence ao contêiner existente `#gallery`; não foi criado outro scroller. O botão Pular sequência leva diretamente ao conteúdo seguinte.

As margens combinam o espaçamento já existente do estudo e 7–9% internos na cena. O título e a imagem ocupam posições diferentes conforme o scroll. No celular e em telas baixas, o palco deixa de ser fixado: título, imagem e explicação se empilham com margens de 24px internas. Movimento reduzido oferece a composição estática.

## Código

- `render-conteudo.js`: cria o HTML apenas para o primeiro bloco de Experiência. Conserva a imagem, seu texto alternativo e o conteúdo original do bloco.
- `sequence.css`: composição, margens, perspectiva, planos e adaptações responsivas.
- `sequence.js`: progresso do scroll, transformação da imagem/título, resposta ao mouse e shader da corrente.
- `story.js`: exclui esse palco da animação geral, evitando duas transformações sobre a mesma seção.
- `tactile.js`: deixa a tipografia desse palco com o controlador próprio, evitando sobrepor a tinta antiga à nova resposta.

`pose(progress)` separa a coreografia da leitura do DOM. Recebe um número de 0 a 1 e devolve posições, rotações e opacidade. Sua função de aceleração é `x*x*(3-2*x)`, que suaviza as extremidades. Os mesmos valores de scroll produzem a mesma coreografia.

A imagem usa CSS `translate3d`, `rotateX`, `rotateY` e `rotateZ`. Dentro desse plano, paper.js desenha uma malha contínua de 32 × 40 células em WebGL. A mesma fotografia é aplicada como uma única textura. O shader de vértices curva as bordas durante a aproximação e a saída, sem dividir a imagem em faixas. No momento de observação, a curvatura se anula em repouso. A imagem HTML original reaparece se WebGL falhar, no celular ou com movimento reduzido. Não há modelo 3D de um objeto; há uma superfície de papel deformável.

A corrente usa WebGL nativo com dois triângulos cobrindo o Canvas. O fragment shader calcula uma faixa com largura variável, contorno colorido e linhas internas. Combina ondas de frequências diferentes; o gesto altera a energia e a fase, que continuam brevemente após o mouse parar. É uma membrana gráfica translúcida, não refração real do conteúdo nem uma simulação física de fluidos.

Não adicionamos Three.js ou GSAP neste piloto: a cena usa shaders nativos e a rolagem já existente. Essas bibliotecas continuam opções para uma etapa que exija modelos tridimensionais mais complexos ou várias cenas coordenadas.

Referências técnicas:
- WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
- Transformações CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- Animação por quadro: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Conceito de shader personalizado: https://threejs.org/docs/pages/ShaderMaterial.html
- Alternativa para timelines de scroll: https://www.gsap.com/docs/v3/Plugins/ScrollTrigger/

## Desempenho e alternativas

O WebGL é inicializado quando a cena entra em vista. A densidade do Canvas é limitada a 1,25. O ciclo para fora da cena, com a aba oculta ou depois da acomodação. Eventos são removidos e recursos WebGL liberados ao mudar de rota. Se o contexto gráfico falhar, aparece uma forma CSS translúcida; imagem e texto continuam disponíveis. A preferência por movimento reduzido oculta a corrente.

## Roteiro de avaliação visual

Abra `#projeto/experiencia` e role até o título “O invisível move a forma.”.

1. Role devagar e depois rápido; volte ao começo. Confira a relação entre título e imagem.
2. Pare quando a imagem se alinhar: ela deve estar inteira, com legenda e espaço lateral.
3. Mova o mouse em várias direções: a corrente deve guardar energia e o plano inclinar.
4. Confira Pular sequência e a continuidade da seção seguinte.
5. Teste celular, teclado e movimento reduzido.

Teste funcional: `node tests/sequence.cjs`. Ele verifica a integração, a reversibilidade dos cálculos, o comportamento sem WebGL e a remoção dos eventos. Esses testes não comprovam o acabamento visual nem o desempenho em uma GPU real.

## Atualização do piloto

A reação das letras agora usa a distância do ponteiro ao retângulo real de cada glifo. O glifo possui um invólucro estável para medir a posição e uma camada interna para animar, evitando que o próprio movimento altere a referência do hover.

Testes: `node tests/sequence.cjs`, `node tests/paper.cjs` e `node tests/ressonancia.cjs`. O teste de WebGL verifica geometria, chamadas e recuperação por meio de uma API simulada; não compila os shaders numa GPU real e não substitui inspeção visual.
