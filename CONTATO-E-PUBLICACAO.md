# Contato e publicação

O domínio principal é https://pedrofm.com. O projeto Cloudflare Pages é
`pedrofm-portfolio`, conectado à branch `main` do GitHub. Alterações enviadas
à branch de produção iniciam a publicação pelo Pages. O antigo endereço do
Sites possui publicação separada e não acompanha automaticamente o GitHub.

## Formulário

O formulário aparece apenas no final dos sete estudos, antes da navegação final.
`projectContact()` em `render-conteudo.js` define os campos e o destinatário
`oi@pedrofm.com`. `contact.css` controla o layout e `contact.js` evita submissões
duplicadas durante o encaminhamento. Nenhuma senha ou chave fica no navegador.

O POST vai ao FormSubmit; esse serviço processa os dados e a verificação antispam.
O navegador sai temporariamente do portfólio para concluir a verificação e retorna
a `contato-enviado.html`. O encaminhamento do e-mail para o Gmail continua sendo
administrado pela configuração que Pedro criou no domínio.

### Ativação necessária pelo titular

1. No site publicado, envie uma solicitação de teste identificada como teste.
2. Verifique a caixa que recebe `oi@pedrofm.com`, inclusive spam.
3. Confirme o e-mail de ativação do FormSubmit.
4. Envie outro teste e confira chegada, texto, projeto de origem e resposta ao
   e-mail informado pelo visitante. A primeira solicitação pode servir apenas
   para ativar o endereço: não presumir que foi entregue.

O código pode ser validado sem essa confirmação, mas a entrega final depende dela.
O link direto `mailto:oi@pedrofm.com` é uma alternativa visível no formulário.
Documentação: https://formsubmit.co/

## Áudio

`sound-controls.js` separa a preferência do visitante, o estado da aba e a
permissão de reprodução do navegador. O som é desejado por padrão. Se autoplay
for bloqueado, tenta iniciar no primeiro toque, clique ou tecla. Não promete
reprodução antes de uma interação quando o navegador a proíbe.

Pausar grava `pedrofm.sound=off` no armazenamento local; essa escolha é respeitada
em outras visitas. Ocultar/sair da aba suspende o áudio sem mudar a preferência.
Ao voltar, retoma se o visitante não tiver pausado. O filtro abafado nos estudos
permanece em `audio.js`. Nenhum arquivo de música externa foi acrescentado.

## Layout

A indicação redundante “A seguir / Por trás da forma” foi removida. Em telas
intermediárias ou baixas, a abertura passa ao fluxo natural para não sobrepor
texto e imagem. O rodapé usa dois controles separados, com o nome curto do próximo
projeto e empilhamento no celular.

Validação local: `node tests/contact-sound.cjs`. Ainda é necessário conferir a
composição visual em navegadores reais e concluir a ativação/entrega do e-mail.
