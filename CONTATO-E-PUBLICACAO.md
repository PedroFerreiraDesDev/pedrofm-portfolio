# Contato e publicação

O domínio principal é https://pedrofm.com. O projeto Cloudflare Pages é
`pedrofm-portfolio`, conectado à branch `main` do GitHub. Alterações enviadas
à branch de produção iniciam a publicação pelo Pages. O antigo endereço do
Sites possui publicação separada e não acompanha automaticamente o GitHub.

## Formulário

O formulário aparece apenas no final dos sete estudos, antes da navegação final.
`projectContact()` em `render-conteudo.js` define os campos e o destinatário
`oi@pedrofm.com`. `contact.css` controla o layout e `contact.js` controla o envio AJAX e evita submissões
duplicadas. Nenhuma senha ou chave fica no navegador.

O envio usa fetch com JSON para https://formsubmit.co/ajax/oi@pedrofm.com.
O visitante permanece no projeto. Um dialog nativo exibe ondas durante o envio,
confirma o aceite do serviço ou informa falha sem apagar os campos. Timeout de
20 segundos, bloqueio de envio duplicado e campo honeypot ajudam no fluxo.
O CAPTCHA está desativado neste fluxo AJAX; honeypot não elimina todo spam.
O aceite da API não comprova entrega na caixa postal: ativação e teste continuam
necessários. O encaminhamento ao Gmail permanece na configuração do domínio.

As oito opções de interesse são checkboxes nativos, em duas colunas, com
seleção múltipla obrigatória. Os interesses seguem juntos no e-mail. Animações
respeitam prefers-reduced-motion. Não há bibliotecas novas.

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
