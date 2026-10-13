# Pedro.fm — análise de navegação, movimento e tecnologias

Data: 13/10/2026. Escopo: inspeção do código atual, documentação oficial e testes
automatizados. Não inclui medição Lighthouse, FPS em aparelho real ou teste
de usabilidade com clientes. A imagem enviada teve conteúdo textual extraído;
a composição em pixels não foi validada nesta execução.

## Objetivo para quem visita

Clientes e equipes precisam identificar o tipo de trabalho, ver as peças,
entender a participação de Pedro e conseguir entrar em contato. A linguagem
de vento e ondas deve orientar descoberta e preservar a leitura das imagens.

## Relações entre os códigos

| Código | Responsabilidade | Relação e risco |
| --- | --- | --- |
| conteudo.js | Textos, imagens, metadados | Fonte comum; conteúdo real ainda pendente |
| render-conteudo.js | HTML dos estudos | Monta a galeria a partir das imagens, sem duplicar cadastro |
| app.js | Mapa, capas, rotas e contêiner #gallery | A galeria externa converte wheel em troca de capa; a leitura interna usa scroll vertical |
| story.js | Transição da capa e blocos anteriores | Precisa permanecer separado dos elementos controlados por experience.js |
| sequence.js | Sequência de abertura | Usa posição de scroll e WebGL; sua longa duração atrasava a leitura |
| experience.js | Movimento dos blocos e atmosfera | Vários cálculos por frame; recursos são liberados quando ficam longe da tela |
| paper.js | Deformação da imagem | Exige GPU; imagem original deve permanecer como alternativa |
| tactile.js / wind.js | Interação sob o mouse e rastro | tactile exclui a experiência, evitando aplicar dois movimentos ao mesmo alvo |
| project-gallery.js | Novo índice visual | Botões navegam a capítulos; setas controlam apenas miniaturas |
| contact.js | Formulário e estados de envio | Independente da animação e da exploração de imagens |

## O que foi implementado

1. Galeria antes do segundo bloco, atualmente “Por trás da forma”, em cada estudo.
   As miniaturas vêm dos blocos com imagem após a abertura. Cada cartão mostra o
   título do bloco e “Ver no contexto”. Ao clicar, a página chega à peça com sua
   explicação, preservando o raciocínio junto do resultado.
2. Setas explícitas e deslize lateral nativo. A roda vertical continua movimentando
   a página. Não há bloqueio para obrigar a pessoa a ver todas as imagens.
3. Imagens inteiras com object-fit: contain, dimensões declaradas, carregamento
   lazy e decoding async. As miniaturas reutilizam os arquivos existentes; não
   geram novos contextos WebGL. Para imagens reais, preparar versões menores.
4. A abertura foi reduzida de 270svh para 220svh no desktop. Preserva o gesto de
   descoberta com menos distância de scroll antes do conteúdo. Essa duração é
   uma hipótese de design a validar com visitantes.
5. JavaScript passou a usar o mesmo limite de leitura simplificada do CSS:
   largura até 1100px ou altura até 700px. Ao entrar nesse modo, a malha da imagem
   é liberada e a imagem original volta a ser a referência de leitura.
6. Cada destino recebe foco programático sem um segundo salto. As miniaturas
   têm navegação por teclado; preferência de movimento reduzido é respeitada.

## Por que essas decisões de UX

- Reconhecimento: títulos e miniaturas ajudam a escolher sem memorizar posições.
- Controle: scroll continua vertical; setas deixam o deslocamento lateral explícito.
- Proximidade: explicação e imagem ficam juntas no capítulo de destino.
- Lei de Fitts: controles de 48px e espaços entre eles reduzem exigência de precisão.
- Hierarquia: explorar primeiro, aprofundar depois, contato disponível por atalho.

São critérios de projeto, não garantias de conversão. Não usamos a lei de Hick
como justificativa para esconder trabalhos: a organização e os nomes das opções
também importam, e devem ser testados com o público.

## Avaliação das tecnologias citadas

| Tecnologia | O que oferece | Decisão para este site |
| --- | --- | --- |
| HTML, CSS e JavaScript atuais | Execução direta e controle das interações existentes | Manter nesta alteração; a galeria não exige dependência nova |
| Astro | Páginas com HTML e ilhas interativas isoladas | Candidato para futura organização em páginas reais, quando houver conteúdo definitivo |
| Next.js | Componentes de servidor/cliente e estrutura de aplicação React | Não há requisito atual de aplicação que justifique a migração |
| GSAP + ScrollTrigger | Timeline, scrub, pin, eventos e scroller personalizado | Útil se consolidarmos as sequências; deve substituir controles concorrentes, não apenas se somar a eles |
| Motion para React | Animações de componentes React | Não há React nesta base; migração só por animação não se justifica |
| React Three Fiber | Renderização declarativa de Three.js em React | Reservar a cenas 3D reais, não à galeria de imagens e textos |

A frase “mais robusta do mundo” não é um critério técnico verificável. Também não
há garantia automática de desempenho ao escolher Next.js ou Astro. Carga de
JavaScript, mídia, GPU e implementação continuam determinantes.

## Próximas melhorias sugeridas, ainda não implementadas

1. Substituir material provisório por trabalhos autorizados, papel de Pedro e
   decisões verificáveis. Uma boa navegação não resolve ausência de evidência.
2. Criar índice por capítulos (contexto, processo, resultado) quando os textos
   estiverem definidos, evitando navegação ancorada a títulos provisórios.
3. Gerar miniaturas WebP/AVIF e srcset para não baixar a imagem de apresentação
   em resolução integral na galeria. Manter versão completa sob demanda.
4. Auditar getBoundingClientRect por letra em experience.js e sequence.js:
   medir caixas em lote e evitar leituras de layout intercaladas com escritas.
   Primeiro medir custo real para escolher onde otimizar.
5. Considerar páginas próprias por projeto em uma futura migração a Astro,
   preservando links, navegação por hash e publicação existente.
6. Testar um modo de leitura com movimento mínimo, além da preferência do sistema.
7. Medir carregamento, resposta e estabilidade em celular intermediário e rede móvel.

## Verificação

Testes locais: renderização e destinos da galeria, formulário/perfil, rotas de
contato, resposta AJAX, movimento e limpeza dos recursos da experiência.

Teste manual recomendado: abrir Endomarketing, descer até Explore o projeto,
usar as setas, selecionar uma peça e retornar por scroll. Repetir com teclado
e celular. Conferir texto legível a 200% de zoom e movimento reduzido.
Ainda não há evidência de FPS ou validação visual final nesta execução.

## Referências

- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://docs.astro.build/en/concepts/islands/
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://motion.dev/docs/react
- https://r3f.docs.pmnd.rs/getting-started/introduction
- https://www.nngroup.com/articles/recognition-and-recall/
- https://www.nngroup.com/articles/fitts-law/
