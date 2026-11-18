# Como a rolagem funciona no Pedro.fm

Abra uma capa, dê um pequeno giro no mouse e solte. A borda da próxima capa deve aparecer e permanecer ali. Inverta o gesto: ela recua. Dentro de um projeto, vá a “Por trás da forma / Galeria”: role para baixo para trazer a próxima imagem; role para cima para reencontrar a anterior. “Continuar leitura” pula todo esse percurso.

## Leia o código nesta ordem

| Arquivo | O que procurar | O que acontece na tela |
| --- | --- | --- |
| cover-motion.js | feed → tick → paint → arrive | O gesto altera um destino; a capa segue até ele. |
| app.js | coverMotion, labelCover, wheel, touchmove | A posição vira deslocamento visível. A informação e o link de contato correspondem ao projeto mais próximo do centro. Clicar diretamente numa capa visível abre aquela peça. |
| white.css | #track e --paper-lift | O trilho acompanha a posição sem segunda animação CSS. As letras da capa se levantam e inclinam durante a travessia. |
| project-gallery.js | sceneStart, draw, measure | A posição vertical da seção determina qual imagem flutua perto do centro. |
| experience.css | project-gallery-stage e project-gallery-window | O palco permanece na tela; cabeçalho e rodapé têm espaço próprio. O espaço restante é das imagens e legendas. |
| render-conteudo.js | projectVisualIndex | Monta a galeria a partir das imagens do projeto e explica o gesto. |
| index.html e codigo.html | cover-motion.js | O primeiro carrega o motor antes da navegação. O segundo permite abrir o código e baixá-lo. |

## A passagem das capas, linha por linha nas contas principais

`target = clamp(target + pixels / path)` — soma a contribuição daquele gesto. Em uma janela de 1.200 px, o percurso do mouse é 1.860 unidades: 100 unidades pedem aproximadamente 5,4% da largura da capa. Essa é a posição desejada; a imagem leva alguns quadros para chegar lá.

`const gap = target - position` — mede quanto falta percorrer, com sinal: positivo avança, negativo volta.

`const step = gap * (1 - Math.exp(-dt / 105))` — transforma essa distância em um passo. Longe do destino ele é maior; perto dele, menor. O tempo entre quadros entra no cálculo para o ritmo não depender apenas da frequência do monitor.

`const limit = dt / 1550` — limita a velocidade visual. No ritmo máximo, atravessar uma largura inteira leva cerca de 1,55 segundo; não é uma contagem regressiva nem uma espera obrigatória entre gestos.

`position += Math.sign(step) * Math.min(Math.abs(step), limit)` — aplica o menor entre o passo calculado e o limite, no sentido do gesto.

`paint(position)` — informa a posição ao trilho. Sem novo gesto, o trilho termina apenas o pequeno trecho já solicitado. Ao pedir 80% do caminho, o destino passa a ser a capa inteira; inverter durante esse encaixe retoma o controle a partir da posição visível.

`Math.sin(Math.PI * Math.abs(position))` — produz uma curva que começa em zero, atinge o máximo no meio e volta a zero. A mesma curva levanta o título até 18 px e inclina até 1,2°. Assim, o papel assenta quando a capa chega. O índice e a URL são confirmados ao terminar a passagem; o título visível e o contato mudam já no meio.

## A galeria inferior, passo a passo

1. O navegador rola o estudo normalmente. A seção tem uma altura extra para dar tempo ao percurso; o palco interno usa CSS sticky.
2. O código mede a distância horizontal real entre a primeira e a última posição. As margens inicial e final centralizam as peças das pontas.
3. `travel = Math.max(1, distance * 1.85)`: para andar 100 px na horizontal, a pessoa rola cerca de 185 px na vertical. Aumente 1.85 para desacelerar apenas a galeria.
4. `local = gallery.scrollTop - sceneStart()`: mede onde estamos em relação à seção naquele momento, inclusive depois que algum conteúdo anterior mudou de altura.
5. `p = clamp(local / travel)`: converte a posição em uma fração de 0 a 1. O trilho recebe `-distance * p`. A mesma posição, na ida ou na volta, produz o mesmo enquadramento.
6. `scale = .74 + focus * .26`: uma peça distante do centro fica menor; ao chegar, recupera seu tamanho natural. Inclinação e flutuação dependem da posição, e o espaço disponível limita o deslocamento para proteger a legenda.
7. `exitRun = Math.min(240, gallery.clientHeight * .30)`: reserva um último trecho de leitura antes de soltar o palco. Ao subir, o percurso recomeça pelo fim. O atalho “Continuar leitura” e o foco pelo teclado também funcionam.
8. O trackpad pode usar o eixo horizontal enquanto o palco está fixo. Fora dele, o site devolve o gesto ao navegador. Com preferência por movimento reduzido ou altura de até 280 px, as peças ficam em grade.

## Como o computador acompanha o gesto

O toque já tinha `touchmove`; no computador só havia roda, clique e teclado. O novo `mouse-drag.js` observa o botão principal. Até 7 px de deslocamento, o gesto pode ser um clique; ao passar desse limiar, o site captura o ponteiro e segue o eixo dominante até soltar. Um arrasto não pode abrir o projeto nem o zoom por engano. Os eventos de toque do celular continuam em seu próprio caminho.

- **Mapa:** o arrasto usa o mesmo ganho do toque. A roda do trackpad também aceita o eixo horizontal.
- **Capas:** `cover.feed(delta,true)` envia ao mesmo motor usado pelo dedo. O mouse pode parar entre capas ou inverter. Para a roda, a inversão usa a posição na tela se ainda havia avanço acumulado; deltas grandes são limitados em relação à largura. O limite de velocidade visual continua igual.
- **Galeria:** ao arrastar no eixo X, o código compensa a proporção vertical de 1,85. Por isso, um arrasto de 100 px pede aproximadamente 100 px horizontais; girar a roda continua mais cadenciado. O clique curto continua ampliando a peça.
- **Vento com p5.js:** no primeiro movimento do mouse, `wind.js` importa o módulo oficial `vendor/p5-2.4.0/noise.mjs`. O ruído mistura tempo e altura do ponteiro, e a energia do gesto regula a curvatura. O canvas existente desenha a onda num único ciclo. O funcionamento da navegação não depende desse carregamento.
- **Trabalho poupado:** durante o arrasto, o código deixa de montar os caminhos SVG do hover. A leitura das posições das letras acontece em lote antes de aplicar estilos. São reduções de trabalho observáveis no código; não representam uma medição de FPS.

## Ver as linhas exatas

No GitHub, abra o commit “Drive cover and project galleries progressively from scroll”. Em “Files changed”, linhas com + foram adicionadas e linhas com - foram retiradas. O diff inclui os testes e as alterações de carregamento; algumas linhas de HTML são longas porque os arquivos originais já estavam compactados. No VS Code, as mesmas alterações aparecem ao comparar essa revisão com a anterior.
