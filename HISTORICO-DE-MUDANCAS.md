# Histórico explicado — Pedro.fm

Este documento acompanha o código no GitHub e pode ser lido no VS Code ou em
codigo.html, na opção “Histórico explicado”. Registra mudanças comprovadas no
repositório; não afirma que resultados visuais ou entrega de e-mail foram
verificados quando houve apenas teste automatizado.

## Como o projeto funciona

| Arquivo | Responsabilidade | Quando editar |
| --- | --- | --- |
| index.html | Carrega a estrutura, os estilos e os scripts | Para incluir um recurso na página |
| conteudo.js | Dados, textos e imagens dos projetos | Para atualizar o portfólio |
| render-conteudo.js | Transforma os dados em HTML; monta estudos e formulário | Para mudar a estrutura comum |
| app.js | Estados de navegação: início, galeria e estudo | Para mudar navegação |
| experience.js, sequence.js, paper.js | Movimento da página, sequência e deformação de imagem | Para ajustar interação |
| contact.css | Campos, opções selecionáveis, ondas e pop-up | Para ajustar aparência |
| contact.js | Validação, envio e resposta ao visitante | Para ajustar comportamento |
| sound-controls.js | Preferência de som e presença na aba | Para ajustar pausa e retomada |
| _headers | Instruções HTTP aplicadas pela Cloudflare Pages | Para ajustar cache |
| tests/ | Verificações automatizadas locais | Para conferir comportamento |

HTML define estrutura, CSS define apresentação, JavaScript define comportamento.
O projeto não precisa de um framework para executar essas interações.

## 13/10/2026 — Ativação do formulário e atualização sem limpeza recorrente de cache

### Problema

Pedro recebeu o e-mail de ativação do FormSubmit e relatou que precisava limpar
o cache para visualizar alterações. A inspeção HTTP mostrou:

- pedrofm.com/contact.js: public, max-age=14400, must-revalidate.
- pedrofm-portfolio.pages.dev/contact.js: public, max-age=0, must-revalidate.
- pedrofm.com/: public, max-age=0, must-revalidate.

14400 segundos correspondem a quatro horas. O navegador podia usar o JavaScript
guardado durante esse período. must-revalidate sozinho só exige validação após
o fim do tempo de validade. A diferença foi observada nas respostas; a regra
exata do painel da zona não foi inspecionada porque não há acesso autenticado.

### Alteração e motivo

1. Os endpoints de contact.js e render-conteudo.js agora usam o identificador
   público fornecido pelo FormSubmit, em vez do endereço de e-mail.
   O identificador serve para encaminhar a solicitação ao formulário correto;
   não substitui a ativação e não é senha. O contato mailto continua disponível.
2. Foi criado _headers com a regra:

       /*
         Cache-Control: public, no-cache, max-age=0, must-revalidate

   no-cache significa “valide antes de reutilizar”, não “nunca armazene”.
   Com validadores como ETag, arquivos inalterados podem ser reaproveitados
   após uma resposta 304. Arquivos que mudaram são baixados novamente.
   A regra abrange também imagens e JSON porque ainda têm nomes estáveis.
   Isso adiciona consultas de validação, mas evita conteúdo antigo. No futuro,
   mídia com nomes versionados por conteúdo poderá ter cache longo.
3. Scripts e estilos referenciados no HTML receberam ?v=20261013-cache1.
   O endereço novo contorna a cópia antiga já guardada antes da regra.
   Esta é uma migração pontual, não um horário aleatório a cada visita.
4. O histórico foi incluído no leitor de código e a documentação de contato
   passou a explicar a configuração de cache e a ativação.

### Fluxo de publicação

Editar no VS Code → salvar → testar → commit → enviar à main no GitHub →
Cloudflare publicar com sucesso → recarregar o site normalmente.

Salvar somente no computador não publica. A aba já aberta não substitui seu
JavaScript sozinha. Não foi adicionada recarga automática, para não interromper
leitura nem apagar uma solicitação que alguém esteja escrevendo.

Se regras do painel sobrescreverem a política da origem, será preciso corrigi-las
na Cloudflare. A documentação do Pages recomenda remover Cache Everything quando
essa regra causa conteúdo desatualizado no domínio personalizado.

### Verificação e pendências

- Atualizar testes para esperar o identificador nos dois endpoints.
- Executar tests/contact-ajax.cjs e tests/contact-sound.cjs.
- Após publicação, consultar os cabeçalhos de pedrofm.com e pages.dev.
- Pedro deve clicar em Activate Form e enviar uma nova solicitação de teste.
- Aceite da API não comprova chegada à caixa postal. Conferir o recebimento.
- Nenhum e-mail de teste foi enviado automaticamente por esta alteração.

## 13/10/2026 — Formulário com seleção de serviços e pop-up

Commit: 9e19efa — Add inline animated inquiry flow and service selection.

### Problema

O POST tradicional levava a pessoa para o site do FormSubmit. O formulário era
muito aberto e não orientava sobre quais serviços poderiam ser solicitados.

### Alteração

render-conteudo.js passou a criar oito opções com checkboxes nativos: redes
sociais, branding, identidade visual, editorial, cartazes e peças gráficas,
vídeos e motion, endomarketing e outro/orientação. É possível escolher várias.
Nome, e-mail e descrição continuam obrigatórios; empresa é opcional.

contact.js intercepta submit com preventDefault, valida os dados e usa fetch
para enviar JSON sem trocar de página. FormData coleta os campos. getAll
reúne todos os interesses, evitando perder seleções repetidas no mesmo nome.

O botão fica desativado durante a requisição. AbortController limita a espera
a 20 segundos. Apenas uma resposta HTTP válida com success positivo libera a
confirmação e limpa os campos. Em erro ou timeout, os dados permanecem.

O dialog nativo apresenta enviando, sucesso e falha. As ondas são CSS, sem
biblioteca adicional. O visitante pode fechar o pop-up enquanto aguarda.
prefers-reduced-motion desativa as animações para quem pede menos movimento.

O CAPTCHA foi desativado neste fluxo AJAX; há campo honeypot para filtrar
preenchimento automatizado básico. Isso não elimina todo spam.

### Testes

tests/contact-ajax.cjs simula sucesso, recusa, falha de rede, seleção obrigatória
e clique duplicado, sem enviar e-mails. tests/contact-sound.cjs verifica a
presença do formulário nos estudos e a continuidade do controle de som.
Ambos passaram. Arquivos novos foram confirmados no domínio publicado.
A aparência em navegador real e a entrega na caixa postal exigem teste próprio.

## 13/10/2026 — Contato, rodapé e controle de som

Commit: e5410a8 — Add project inquiries, responsive closing navigation and persistent audio preference.

- Formulário incluído no fim dos sete estudos; ausente no início e no perfil.
- Navegação final separada em “Voltar à capa” e “Próximo projeto”, com nome curto.
- Texto redundante “A seguir / Por trás da forma” removido.
- Composição adaptada para telas intermediárias e baixas.
- sound-controls.js separa desejo de ouvir, permissão do navegador e aba ativa.
- Pausa manual fica salva; sair da aba suspende o áudio; voltar tenta retomá-lo.
- Autoplay continua sujeito à permissão do navegador, com retomada por gesto.
- O envio tradicional desta versão foi substituído pelo AJAX no commit seguinte.

Motivo: melhorar leitura, fechamento dos estudos e previsibilidade do áudio.
Testes automatizados cobriram renderização e estados do som; não equivalem a
uma inspeção visual em vários dispositivos.

## Etapas anteriores confirmadas no Git

| Commit | Mudança registrada | Intenção |
| --- | --- | --- |
| 905dfc2 | Modelo de Experiência aplicado aos estudos | Padronizar as páginas em composição contínua |
| aefb85e | Vento e folhas estendidos à página de Experiência | Integrar o movimento ao conteúdo fora do quadro |
| 24f796c | Piloto com folha contínua, hover localizado e transição | Estabelecer a interação antes de replicá-la |

Essas entradas resumem os registros existentes. Datas e detalhes de testes não
foram reconstruídos sem evidência.

## Padrão para próximas mudanças

Antes de concluir uma alteração, acrescentar uma entrada com:

1. Pedido ou problema observado.
2. O que mudou e quais arquivos foram editados.
3. Como o código funciona e por que essa abordagem foi escolhida.
4. Testes realizados e limites da validação.
5. Commit, situação da publicação e qualquer ação pendente.

Nunca marcar como publicado apenas porque o arquivo foi salvo. Distinguir teste
local, envio ao GitHub, publicação na Cloudflare e conferência do domínio.

## Referências técnicas

- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/debugging-pages/
- https://formsubmit.co/
- https://formsubmit.co/ajax-documentation

### Conferência após a publicação aa1d664

Os testes automatizados passaram. A leitura HTTP confirmou o identificador novo
no código publicado e a regra no Pages. Porém o JavaScript no domínio personalizado
continuou com max-age=14400; portanto a correção de cache ainda depende do painel.

No painel Cloudflare, selecionar pedrofm.com → Caching → Configuration →
Browser Cache TTL → Respect Existing Headers. Se houver Cache Rule específica
sobrescrevendo o TTL do navegador, configurá-la para respeitar a origem também.
Não foi realizada alteração no painel por falta de acesso autenticado.

Referência: https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/set-browser-ttl/

Após o ajuste, confirmar novamente o cabeçalho de /contact.js. O resultado esperado
é public, no-cache, max-age=0, must-revalidate, como já observado no Pages.

## 13/10/2026 — Contato nas capas e no Sobre mim; download do histórico

### Pedido

Disponibilizar o histórico por um endereço que funcione fora do computador,
incluir o formulário no perfil e oferecer contato antes de entrar nos estudos.

### O que mudou e como funciona

- render-conteudo.js reutiliza projectContact também no Sobre mim. Há exatamente
  um formulário por página e o campo de origem identifica o projeto ou perfil.
  O perfil ganhou ainda um atalho de contato logo após sua apresentação.
- index.html ganhou Entrar em contato na barra superior das capas.
- app.js atualiza o endereço desse atalho ao trocar de capa. A rota
  #projeto/ID/contato abre o conteúdo e calcula o deslocamento até o formulário,
  usando a posição do elemento em relação ao contêiner que realmente rola.
  requestAnimationFrame espera a montagem antes da medição. A seção recebe foco
  sem outro salto, permitindo continuar pelo teclado. Movimento reduzido troca
  a rolagem suave por deslocamento imediato. Conteúdo já aberto é reutilizado,
  preservando campos preenchidos ao usar o atalho dentro do próprio perfil.
- contact.css dá ao atalho altura mínima de 48px, borda, contraste e foco.
  No perfil, o formulário ocupa a largura disponível e empilha no celular.
- _headers acrescenta Content-Disposition: attachment ao histórico.
  O link público /HISTORICO-DE-MUDANCAS.md passa a solicitar download, enquanto
  codigo.html ainda permite ler o documento via fetch.
- O sufixo dos scripts/estilos foi atualizado para evitar cópias antigas enquanto
  a configuração de cache do domínio ainda não tiver sido confirmada.

### Decisões de UX

Reconhecimento em vez de memorização: o rótulo Entrar em contato é explícito.
A pessoa não precisa descobrir que o formulário só aparece após uma longa leitura.

Lei de Fitts: uma área de clique maior reduz a precisão necessária para atingir
o controle. Os 48px são uma decisão de implementação, não uma medida prescrita
pela lei. O alvo fica estável, sem flutuar durante o clique.

Consistência: mesma posição e nome ao mudar de projeto. O formulário permanece
ligado à capa escolhida, evitando uma mudança inesperada para outra página.

Esses princípios orientam o desenho; não demonstram aumento de conversão.
Uma avaliação visual e testes com visitantes ainda são necessários.

Referências:
- https://www.nngroup.com/articles/recognition-and-recall/
- https://www.nngroup.com/articles/fitts-law/

### Verificação

Teste automatizado verifica exatamente um formulário em cada projeto e no
Sobre mim. Testes de sucesso, erro de envio, interesses e som continuam válidos.
Não foi enviado e-mail real nem realizada validação visual em vários dispositivos.
O link de download e os arquivos publicados devem ser conferidos após o deploy.

## 13/10/2026 — Galeria contextual e revisão da rolagem

Pedido: tornar a exploração interna funcional e avaliar as tecnologias sugeridas.

render-conteudo.js agora deriva miniaturas dos blocos existentes e identifica
cada capítulo. project-gallery.js controla setas, teclado e o deslocamento ao
conteúdo escolhido, sem interceptar a roda vertical. experience.css apresenta
a galeria, mantém as imagens inteiras e reduz a abertura de 270svh para 220svh.
sequence.js e experience.js usam os limites responsivos do CSS e liberam as
malhas ao entrar em leitura simplificada.

Não houve migração de framework nem inclusão de biblioteca de animação.
A análise dos relacionamentos, alternativas e limitações está em
ANALISE-UX-E-TECNOLOGIAS.md, também disponível no leitor de código.

Testes automatizados cobrem renderização, destinos, contato e recursos da
experiência. Composição visual, FPS e usabilidade com visitantes seguem pendentes.
