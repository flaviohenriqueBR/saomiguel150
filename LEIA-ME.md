# Site São Miguel 150+ | passo a passo

## Parte 1. Colocar os arquivos no GitHub

1. Extraia o zip: clique com o botão direito em `sao-miguel-150-final.zip` > **Extrair tudo**.
2. Abra no Explorador de Arquivos a pasta do repositório (a que tem a pasta `.git`).
   Para ver a `.git`: menu **Exibir > Mostrar > Itens ocultos**.
   Dica: no terminal do VS Code, `git rev-parse --show-toplevel` mostra qual é a pasta certa.
3. Nessa pasta, apague tudo, **menos a pasta `.git`**.
4. Copie todo o conteúdo da pasta extraída (Ctrl+A, Ctrl+C) e cole na pasta do repositório (Ctrl+V).
   Confira: `index.html`, `.pages.yml` e as pastas `api`, `assets`, `css`, `dados`, `js` e `midia`
   ficam soltos na pasta, ao lado da `.git`, e não dentro de outra pasta.
5. No terminal do VS Code, dentro dessa pasta:

   ```
   git add -A
   git commit -m "Versão final do site"
   git push
   ```

6. Abra o repositório no GitHub e confira que `index.html` aparece na lista principal.

## Parte 2. Conferir o Vercel

1. Em vercel.com, abra o projeto. Em alguns segundos aparece um novo deploy com status **Ready**.
2. Se for a primeira vez: **Settings > Build and Deployment > Framework Preset: Other**,
   sem comando de build e com Root Directory `./`.
3. Abra o endereço do site e teste: menu, Acervo, Agenda, Entregas e um botão do WhatsApp.

## Parte 3. Ligar as curtidas (uma vez)

1. No projeto do Vercel, aba **Storage** > **Create Database** > **Upstash for Redis**.
2. Plano **Free**, dê um nome (ex.: `curtidas`) e conecte ao projeto (marque Production, Preview e Development).
3. Em **Deployments**, no último deploy, clique em **...** > **Redeploy**.
4. Teste: curta uma lembrança, recarregue a página e veja o número.

Enquanto o banco não estiver ligado, o Curtir funciona só no aparelho de cada pessoa.

## Parte 4. Ligar o painel de edição (Pages CMS)

1. Entre em https://app.pagescms.org e clique em **Sign in with GitHub**.
2. Autorize e instale o aplicativo do Pages CMS no repositório `saomiguel150`.
3. Escolha o repositório. Aparecem os formulários: Acervo de Memórias, Agenda, Entregas,
   Membros e Configurações do site.
4. Faça um teste: mude uma palavra em Configurações do site > Chamada principal, salve
   e veja o site atualizar em cerca de 1 minuto.
5. Para a equipe: convide pelo e-mail na área de colaboradores (Collaborators).
   A pessoa não precisa de conta no GitHub.

## Parte 5. Antes de divulgar

- **Membros:** troque as fotos e escreva as biografias.
- **Acervo:** apague as 10 lembranças de exemplo e inclua as reais.
- **Configurações do site:** confira o WhatsApp, o endereço do site (aparece no cartão de compartilhar) e, se houver, cole o link de convite da comunidade do WhatsApp.
- **Agenda:** confira datas e locais.
- **Parceiros:** inclua os logos de quem já apoia.
- **Celular:** teste o Compartilhar de uma lembrança (Stories e WhatsApp).

## Parte 6. Endereço próprio (opcional)

No Vercel: **Settings > Domains > Add** e digite o endereço (ex.: `saomiguel150.com.br`).
O Vercel mostra o registro de DNS para criar onde o domínio foi comprado.
Depois, no painel, confira **Configurações do site > Contato > Endereço do site**:
é o endereço impresso no cartão de compartilhar lembranças.

---

## Como incluir uma lembrança no dia a dia

No painel, abra **Acervo de Memórias**, adicione uma nova e preencha:

- **Tipo:** Foto ou Só texto.
- **Foto**, **legenda** e **relato**.
- **Quem enviou**, **sobre quem enviou** (idade, bairro) e **época**.
- **Palavras-filtro:** uma por linha, palavras ou nomes que aparecem no texto (ex.: feira,
  praça, Frei Damião). Ficam destacados sozinhos, com ou sem acento, e levam a outras
  lembranças com a mesma palavra.

Salve. A mais nova aparece primeiro no site.

## Sinônimos das palavras-filtro

No painel, em **Acervo: sinônimos**, escreva a palavra principal e as que valem como ela.
Ex.: principal `avó`, também vale para `vovó` e `vó`. Assim:

- numa lembrança marcada com "avó", as palavras "vovó" e "vó" também ficam destacadas;
- o filtro "avó" mostra todas essas lembranças juntas;
- quem busca "vovó" encontra as lembranças marcadas com "avó".

Já vem com dois exemplos (avó e praça). Pode apagar ou mudar.

## Datas da agenda

Use ano-mês (`2026-12`) ou ano-mês-dia (`2026-12-05`). O que já passou sai da lista
principal sozinho; o que está acontecendo aparece no topo.

## Ver o site no computador

Abra a pasta no VS Code e use a extensão Live Server (Go Live). Abrindo o arquivo com
duplo clique, o conteúdo não carrega, e as curtidas só funcionam no site publicado.

## App das mesas: saomiguel150.com.br/memoria

Página de celular para o QR Code: botão grande para enviar a lembrança pelo WhatsApp,
Bate-bola da memória, Você sabe onde é? e Ver outras lembranças.

- **Textos, perguntas e lugares do jogo:** no painel, em **App /memoria (mesas)**.
  No jogo, cada lugar tem foto, nome certo, duas opções erradas e uma curiosidade.
  Cada partida sorteia 5 lugares (pode cadastrar mais).
- **Lembrançômetro:** em **App /memoria (mesas) > Lembrançômetro**, atualize o número de lembranças
  recebidas no WhatsApp algumas vezes por dia. Com 0, o contador some.
- **Brinque na mesa:** os dois jogos aparecem logo abaixo do formulário. No Você sabe onde é?,
  cada acerto solta confete.
- **Obrigado:** quando a pessoa volta do WhatsApp depois de enviar, aparece "Valeu, Nome!" com
  confete e convite para jogar.
- **Desafiar alguém:** no fim do Você sabe onde é?, manda o placar com o link do app.
- **Faixa "Veja o que outras pessoas lembraram"** (logo abaixo do botão): mostra as 6 lembranças mais novas da galeria.
- **Galeria:** usa o Acervo de Memórias. Só aparecem as lembranças com
  **Mostrar no app /memoria** marcado. O campo **Tema** cria os filtros (Festas, Família...).
- **Saber de onde a pessoa veio (opcional):** use o link com `?de=` no final, ex.:
  `saomiguel150.com.br/memoria?de=Restaurante Sabor`. A mensagem do WhatsApp termina com
  "(Vim pelo QR Code: Restaurante Sabor)".
- **Formulário da tela inicial:** primeiro aparece só o campo da lembrança; quando a pessoa começa a
  escrever, surgem o nome e se mora em São Miguel (e onde, se não). Ao tocar em **Enviar minha lembrança**, o WhatsApp abre com tudo pronto.
  Quem prefere áudio ou foto tem o link "Abra o WhatsApp direto". Os botões das outras telas
  (galeria, jogos) levam para esse formulário.
- **Frase de orientação** e **início da mensagem**: editáveis em **App /memoria (mesas) > Tela inicial**.
- **Apoiadores no fim da tela:** os mesmos de **Configurações do site > Parceiros**.
- **Bate-bola:** uma pergunta por vez, sorteada do banco (painel: **Bate-bola: banco de perguntas**).
  A pessoa responde e já vê o que outras pessoas responderam, ou toca em **Pular**. As respostas
  ficam guardadas no site, sem nome. Não vai nada para o WhatsApp.
- **Respostas do Bate-bola para a equipe:** abra `saomiguel150.com.br/moderar.html`, digite a senha e
  veja todas as respostas, esconda as que não devem aparecer e baixe a planilha. Respostas com
  palavrão já chegam escondidas.
  Para criar a senha: no Vercel, **Settings > Environment Variables > Add**, nome `BATEBOLA_SENHA`,
  valor = a senha que a equipe vai usar. Depois, **Deployments > ... > Redeploy**.
  O Bate-bola usa o mesmo banco das curtidas (Parte 3): sem ele, o jogo funciona, mas não guarda
  nem mostra respostas de outras pessoas.
