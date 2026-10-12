# Sequência representativa — Experiência

Este piloto substitui somente o primeiro par de texto/imagem do projeto `experiencia`. A imagem continua provisória. O restante dos projetos conserva o comportamento anterior para permitir comparação.

## Direção e referências

| Referência | Evidência consultada | Adaptação neste piloto |
| --- | --- | --- |
| https://unseen.co/projects/ | Página apresenta exploração por arraste, clicar/segurar e som opcional | Resposta do ambiente ao gesto, com energia e acomodação. Não copiamos esses controles ou a identidade. |
| https://blueyard.com/ | Narrativa organizada por territórios | Continuidade de uma matéria visual através de três momentos. |
| https://www.webgpu.com/showcase/blueyard-two-color-webgl-atlas/ | Relato externo descreve esfera fluida e cursor reativo | Referência conceitual de matéria responsiva. Nossa corrente é um shader procedural, não a simulação fluida descrita no relato. |
| https://stark-defence.com/en | Página com produtos, grandes chamadas e imagens | Hierarquia entre título, objeto e explicação. A animação exata não foi inspecionada visualmente. |

O acesso às referências nesta sessão foi textual. Não afirmamos ter reproduzido ou analisado quadro a quadro suas animações. A sequência implementada é uma interpretação autoral para vento, onda e papel na marca Pedro.fm.

## Três momentos

1. **Impulso:** título amplo e uma corrente translúcida no espaço branco.
2. **Forma:** o scroll desloca e reduz o título; a imagem chega da direita com rotação em três eixos. Depois se alinha e aparece o contexto.
3. **Passagem:** a folha sobe e inclina para conduzir à seção seguinte.

No desktop, a seção tem 300 alturas de viewport e seu palco permanece visível por parte desse percurso usando `position: sticky`. A rolagem pertence ao contêiner existente `#gallery`; não foi criado outro scroller. O botão Pular sequência leva diretamente ao conteúdo seguinte.

As margens combinam o espaçamento já existente do estudo e 7–9% internos na cena. O título e a imagem ocupam posições diferentes conforme o scroll. No celular e em telas baixas, o palco deixa de ser fixado: título, imagem e explicação se empilham com margens de 24px internas. Movimento reduzido oferece a composição estática.

## Código

- `render-conteudo.js`: cria o HTML apenas para o primeiro bloco de Experiência. Conserva a imagem, seu texto alternativo e o conteúdo original do bloco.
- `sequence.css`: composição, margens, perspectiva, planos e adaptações responsivas.
- `sequence.js`: progresso do scroll, transformação da imagem/título, resposta ao mouse e shader da corrente.
- `story.js`: exclui esse palco da animação geral, evitando duas transformações sobre a mesma seção.
- `tactile.js`: deixa a tipografia desse palco com o controlador próprio, evitando sobrepor a tinta antiga à nova resposta.

`pose(progress)` separa a coreografia da leitura do DOM. Recebe um número de 0 a 1 e devolve posições, rotações e opacidade. Sua função de aceleração é `x*x*(3-2*x)`, que suaviza as extremidades. Os mesmos valores de scroll produzem a mesma coreografia.

A imagem usa CSS `translate3d`, `rotateX`, `rotateY` e `rotateZ`. É um plano inteiro em perspectiva: não há fragmentação, curvatura real da fotografia ou malha 3D de um objeto nesta versão.

A corrente usa WebGL nativo com dois triângulos cobrindo o Canvas. O fragment shader calcula uma faixa com largura variável, contorno colorido e linhas internas. Combina ondas de frequências diferentes; o gesto altera a energia e a fase, que continuam brevemente após o mouse parar. É uma membrana gráfica translúcida, não refração real do conteúdo nem uma simulação física de fluidos.

Não adicionamos Three.js ou GSAP neste piloto: a cena usa um shader e a rolagem já existente. Essas bibliotecas continuam opções para uma etapa que exija malhas curvas, texturas deformáveis ou várias cenas coordenadas.

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
