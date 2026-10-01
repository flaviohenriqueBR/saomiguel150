/* =====================================================================
   SÃO MIGUEL 150+  |  DADOS DA PÁGINA DO ACERVO
   ---------------------------------------------------------------------
   COMO MARCAR AS PALAVRAS QUE VIRAM FILTRO
   Coloque a palavra entre chaves dentro da legenda ou do relato:
       'Todo sábado eu ia à {feira} com minha avó.'
   Se a palavra aparecer escrita de outro jeito (plural, diminutivo),
   use uma barra para dizer qual é o filtro:
       'As {feirinhas|feira} de antigamente...'
   Quem clicar na palavra verá todas as lembranças marcadas com ela.
   Para marcar uma palavra que não está escrita no texto, use "palavras":
       palavras: ['saudade']

   CAMPOS DE CADA LEMBRANÇA
   tipo:     'foto' ou 'texto'
   foto:     caminho da imagem (só para tipo 'foto')
   legenda:  legenda da foto (opcional)
   relato:   texto da lembrança (opcional na foto, obrigatório no texto)
   autor:    nome de quem enviou
   detalhe:  idade, bairro, onde mora hoje... (opcional)
   epoca:    quando aconteceu, ex.: 'Anos 1970' (opcional)
   ano:      ano da foto, aparece como data impressa na foto (opcional)

   As lembranças abaixo são EXEMPLOS para mostrar o funcionamento.
   As imagens são ilustrações do material do projeto. Substitua pelos
   envios reais da Campanha de Histórias.
   ===================================================================== */

window.PAGINA_ACAO = {
  eixo: 'memoria',                    // 'memoria' | 'identidade' | 'futuro'
  acao: 'Campanha de Histórias',
  nome: 'Acervo de Memórias',
  descricao: 'Fotografias, documentos e relatos de quem fez e faz São Miguel, reunidos na Campanha de Histórias.',
  ilustracao: 'assets/ilustra-cameras.webp'
};

window.LEMBRANCAS = [
  {
    tipo: 'foto',
    foto: 'assets/exemplo-rua.webp',
    legenda: 'Nossa {rua} no fim da tarde, quando ela era o parque de todo mundo.',
    relato: 'A gente jogava amarelinha e bola até a mãe chamar pra janta. Do lado tinha a {padaria}, e o cheiro de pão às cinco horas era o relógio da nossa {infância}.',
    autor: 'Antônia Lima',
    detalhe: '58 anos, mora no Centro',
    epoca: 'Anos 1970',
    ano: '1976'
  },
  {
    tipo: 'texto',
    relato: 'Todo {sábado} minha {avó} me acordava cedo pra ir à {feira}. Ela conhecia cada vendedor pelo nome e sempre voltava com uma tapioca pra mim.',
    autor: 'José Ribamar',
    detalhe: '64 anos, mora em Natal (RN)',
    epoca: 'Anos 1960'
  },
  {
    tipo: 'foto',
    foto: 'assets/exemplo-avo.webp',
    legenda: 'Minha {avó} mostrando o álbum da família na calçada de casa.',
    relato: 'Cada foto tinha uma história, e ela lembrava de todas. Gravei tudo no celular pra não perder nenhuma.',
    autor: 'Lucas Fernandes',
    detalhe: '17 anos, embaixador da Campanha',
    epoca: '2026',
    palavras: ['família']
  },
  {
    tipo: 'texto',
    relato: 'A {festa} do padroeiro era o acontecimento do ano. A {praça} ficava cheia, tinha parque, leilão e a procissão saindo da {igreja}.',
    autor: 'Francisca das Chagas',
    detalhe: '71 anos',
    epoca: 'Anos 1970'
  },
  {
    tipo: 'foto',
    foto: 'assets/exemplo-acude.webp',
    legenda: 'Domingo à tarde na beira do {açude}.',
    relato: 'Foi numa caminhada dessas que eu conheci meu marido. Até hoje a gente volta lá todo domingo.',
    autor: 'Maria José Alves',
    detalhe: '49 anos',
    epoca: 'Anos 1990'
  },
  {
    tipo: 'texto',
    relato: 'Saí de São Miguel com 19 anos pra trabalhar fora. Até hoje, quando cai {chuva}, lembro do cheiro de terra molhada na {rua} da casa da minha mãe.',
    autor: 'Raimundo Nonato',
    detalhe: '55 anos, mora em São Paulo (SP)',
    epoca: 'Anos 1980',
    palavras: ['saudade']
  },
  {
    tipo: 'texto',
    relato: 'Na {escola}, a professora fazia a gente decorar o hino da cidade. No recreio era {futebol} no barro até o sino tocar.',
    autor: 'Pedro Henrique Costa',
    detalhe: '40 anos',
    epoca: 'Anos 1990'
  },
  {
    tipo: 'foto',
    foto: 'assets/exemplo-praca.webp',
    legenda: 'As árvores da {praça} que viram minha {infância} inteira.',
    autor: 'Ana Cláudia Souza',
    detalhe: '36 anos',
    epoca: 'Anos 2000'
  },
  {
    tipo: 'texto',
    relato: 'O {futebol} de domingo parava a cidade. Meu pai nunca perdeu um jogo, e depois a turma se encontrava na {praça} pra comentar cada lance.',
    autor: 'Cícero Souza',
    detalhe: '68 anos',
    epoca: 'Anos 1980'
  },
  {
    tipo: 'texto',
    relato: 'Minha {avó} fazia bolo pra vender na {feira}. Eu ia junto carregando a bandeja e voltava com o bolso cheio de moedas. Hoje, longe, o que mais sinto é {saudade} daquelas manhãs.',
    autor: 'Josefa Martins',
    detalhe: '45 anos, mora em Mossoró (RN)',
    epoca: 'Anos 1980'
  }
];
