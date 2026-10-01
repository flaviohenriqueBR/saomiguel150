/* =====================================================================
   SÃO MIGUEL 150+  |  CONFIGURAÇÃO DO SITE
   ---------------------------------------------------------------------
   Este é o único arquivo que você precisa editar no dia a dia.
   Troque os textos entre aspas, salve e recarregue a página.
   Dica: mantenha as vírgulas e as aspas no lugar.
   ===================================================================== */

window.SITE = {

  /* LOGO DO TOPO ------------------------------------------------------
     Caminho da imagem do logo. Para trocar, coloque o novo arquivo na
     pasta "assets" e altere o nome abaixo. */
  logo: 'assets/logo-sao-miguel-150.webp',

  /* PÁGINAS ------------------------------------------------------------ */
  paginas: {
    inicio: 'index.html',
    acervo: 'acervo.html'
  },

  /* CONTATO -----------------------------------------------------------
     whatsapp: só números, com 55 + DDD. Ex.: '5584999990000'
     Enquanto o WhatsApp estiver vazio, os botões de contato abrem o
     e-mail (se houver) ou o direct do Instagram. */
  contato: {
    whatsapp: '',
    email: '',
    instagram: 'saomigueldagente',
    site: 'https://agendadagente.com'
  },

  /* DESTAQUE (primeira dobra do site) ---------------------------------
     Troque sempre que quiser mudar a chamada principal.
     - titulo: use [o] para trocar a letra "o" pela bolinha da marca
       e [O] para a versão maiúscula.
     - fundo.imagem: caminho da imagem (ou deixe '' para usar só a cor).
     - fundo.cor: cor de fundo que aparece por trás e no degradê.
     - fundo.posicao: 'center bottom', 'center', 'left top'...
     - tema: 'escuro' = texto escuro (para fundos claros, como o céu);
             'claro'  = texto branco com sombreamento (para fotos).
     - grafismo: true mostra a linha da marca desenhada no céu.
     - botao.link: um endereço (https://...) ou 'contato' para abrir
       o WhatsApp/Instagram definido acima com a mensagem pronta. */
  destaque: {
    rotulo: 'Campanha de Histórias',
    titulo: '[O] que de Sã[o] Miguel vive em v[o]cê?',
    texto: 'Uma foto antiga, um causo de família, a lembrança de um lugar. Mande a sua memória e ajude a contar os 150 anos da cidade.',
    botao: {
      texto: 'Enviar minha lembrança',
      link: 'contato',
      mensagem: 'Oi! Quero enviar uma lembrança para o São Miguel 150+.'
    },
    botaoSecundario: {
      texto: 'Ver o acervo',
      link: 'acervo.html'
    },
    fundo: {
      imagem: 'assets/lago.jpg',
      cor: '#7CC7E4',
      posicao: 'center bottom'
    },
    tema: 'escuro',
    grafismo: true
  },

  /* PÁGINAS DAS AÇÕES (botões dentro de cada fase) --------------------
     liberada: true  -> botão ativo, leva para "link"
     liberada: false -> botão bloqueado, mostra "abre" (quando abre)
     eixo: 'memoria' | 'identidade' | 'futuro' */
  acoes: [
    { eixo: 'memoria',    nome: 'Campanha de Histórias',     chamada: 'Ver o acervo de memórias', liberada: true,  link: 'acervo.html' },
    { eixo: 'memoria',    nome: 'Recontando nossa história', abre: 'abr/27', liberada: false },
    { eixo: 'identidade', nome: 'É de São Miguel',           abre: 'dez/26', liberada: false },
    { eixo: 'identidade', nome: 'Mapa Afetivo',              abre: 'dez/26', liberada: false },
    { eixo: 'futuro',     nome: 'Escuta São Miguel',         abre: 'jul/27', liberada: false },
    { eixo: 'futuro',     nome: 'Rodas de Conversa',         abre: 'ago/27', liberada: false }
  ],

  /* AGENDA (carrossel de eventos) -------------------------------------
     frente: 'memoria' | 'identidade' | 'futuro' | 'geral'
     inicio / fim: 'AAAA-MM' (só o mês) ou 'AAAA-MM-DD' (dia exato).
     "fim" é opcional. Eventos com data já passada ficam mais claros
     e vão para trás no carrossel automaticamente.
     horario e local são opcionais. */
  eventos: [
    {
      // EXEMPLO de evento já realizado (apague quando tiver os reais)
      frente: 'geral',
      titulo: 'Apresentação do projeto',
      inicio: '2026-09',
      local: 'São Miguel (RN)',
      descricao: 'Apresentação do São Miguel 150+ para parceiros e comunidade.'
    },
    {
      frente: 'memoria',
      titulo: 'Lançamento do São Miguel 150+',
      inicio: '2026-10',
      local: 'Local a confirmar',
      descricao: 'Abertura da jornada de 15 meses e início da Campanha de Histórias.'
    },
    {
      frente: 'memoria',
      titulo: 'Campanha de Histórias',
      inicio: '2026-10',
      fim: '2026-12',
      local: 'WhatsApp, escolas e comunidades',
      descricao: 'Envie suas memórias por texto, áudio, foto ou vídeo. Embaixadores visitam famílias e comunidades.'
    },
    {
      frente: 'memoria',
      titulo: 'Entrega do Acervo de Memórias e do Mapa dos Micaelenses',
      inicio: '2026-12',
      local: 'Site do São Miguel 150+',
      descricao: 'As histórias reunidas ganham casa no site, e o mapa mostra onde vivem os micaelenses.'
    },
    {
      frente: 'identidade',
      titulo: 'É de São Miguel e Mapa Afetivo',
      inicio: '2026-12',
      local: 'Escolas, praças, feira e mercado',
      descricao: 'Coleta das palavras que representam a cidade e marcação dos lugares que importam no mapa afetivo.'
    },
    {
      frente: 'memoria',
      titulo: 'Pesquisa Recontando nossa história',
      inicio: '2027-04',
      fim: '2027-07',
      local: 'Pesquisa e entrevistas',
      descricao: 'Momentos marcantes da cidade, com destaque para a passagem da Coluna Prestes.'
    },
    {
      frente: 'identidade',
      titulo: 'Exposição Intermediária',
      inicio: '2027-07',
      local: 'Local a confirmar',
      descricao: '150 Histórias, Muro Afetivo, Dicionário Afetivo e Roteiro Urbano.'
    },
    {
      frente: 'futuro',
      titulo: 'Escuta São Miguel e 150 árvores',
      inicio: '2027-07',
      local: 'Praças e espaços públicos',
      descricao: 'Três perguntas sobre o futuro, registradas na árvore do futuro. Cada participante recebe uma muda.'
    },
    {
      frente: 'futuro',
      titulo: 'Rodas de Conversa',
      inicio: '2027-08',
      local: 'Encontros presenciais',
      descricao: 'Rodas por tema: infância, juventude, mulheres, educação, cultura, trabalho e meio ambiente.'
    },
    {
      frente: 'futuro',
      titulo: 'Grande Exposição Final',
      inicio: '2027-12',
      local: 'Local a confirmar',
      descricao: 'Resultados do processo, documentário, Cápsula do Futuro, Carta de São Miguel e assinatura dos compromissos.'
    }
  ],

  /* PARCEIROS ---------------------------------------------------------
     Adicione um item por parceiro. Enquanto a lista estiver vazia,
     o site mostra espaços convidando novos apoiadores.
     Exemplo:
     { nome: 'Nome da empresa', logo: 'assets/parceiro-empresa.png', link: 'https://...' }, */
  parceiros: [
  ],

  /* APRESENTAÇÃO PARA APOIADORES (opcional) ---------------------------
     Endereço de um PDF com a apresentação do projeto. Se ficar vazio,
     o botão não aparece. */
  apresentacao: ''
};
