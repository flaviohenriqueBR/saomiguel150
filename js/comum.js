/* São Miguel 150+ | código comum a todas as páginas
   O conteúdo do site fica nos arquivos da pasta "dados" e é editado
   pelo painel (Pages CMS). Este arquivo só monta o que se repete. */
(function () {
  'use strict';

  var HOJE = new Date();
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var ORDEM = ['memoria', 'identidade', 'futuro'];
  var FASES_PADRAO = {
    memoria: { nome: 'Memória', subtitulo: 'São Miguel de Ontem', pergunta: 'De onde viemos?', inicio: '2026-10', fim: '2027-02' },
    identidade: { nome: 'Identidade', subtitulo: 'São Miguel de Hoje', pergunta: 'Quem somos?', inicio: '2027-03', fim: '2027-06' },
    futuro: { nome: 'Futuro', subtitulo: 'São Miguel do Amanhã', pergunta: 'O que queremos deixar?', inicio: '2027-07', fim: '2027-12' }
  };

  var SM = window.SM = { HOJE: HOJE, MESES: MESES, ORDEM: ORDEM, site: {}, FASES: FASES_PADRAO };

  /* ---------- Texto ---------- */
  SM.esc = function (txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  SM.norm = function (txt) {
    return String(txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  };
  SM.cap = function (t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; };
  /* Caminhos salvos pelo painel começam com "/"; o site usa caminhos relativos */
  SM.url = function (p) { p = String(p || '').trim(); return /^https?:|^mailto:|^#/.test(p) ? p : p.replace(/^\/+/, ''); };

  /* ---------- Datas ('AAAA-MM' ou 'AAAA-MM-DD') ---------- */
  function partes(txt) { var p = String(txt || '').split('-').map(Number); return { a: p[0] || 0, m: p[1] || 1, d: p[2] || 0 }; }
  SM.partes = partes;
  SM.data = function (txt, fimDoPeriodo) {
    var p = partes(txt);
    if (!p.a) return null;
    if (fimDoPeriodo) return p.d ? new Date(p.a, p.m - 1, p.d, 23, 59, 59) : new Date(p.a, p.m, 0, 23, 59, 59);
    return new Date(p.a, p.m - 1, p.d || 1);
  };
  SM.mes = function (txt) { var p = partes(txt); return p.a ? (p.d ? p.d + ' ' : '') + MESES[p.m - 1] + ' ' + p.a : ''; };
  SM.mesLongo = function (txt) { var p = partes(txt); return p.a ? MESES_LONGOS[p.m - 1] + ' de ' + p.a : ''; };
  SM.periodo = function (ini, fim) {
    if (!fim || fim === ini) return SM.mes(ini);
    var a = partes(ini), b = partes(fim);
    if (a.a === b.a && !a.d && !b.d) return MESES[a.m - 1] + ' a ' + MESES[b.m - 1] + ' ' + b.a;
    return SM.mes(ini) + ' a ' + SM.mes(fim);
  };
  /* 'antes' | 'agora' | 'depois' */
  SM.situacao = function (ini, fim) {
    var i = SM.data(ini), f = SM.data(fim || ini, true);
    if (!i) return 'antes';
    if (HOJE > f) return 'depois';
    if (HOJE >= i) return 'agora';
    return 'antes';
  };
  SM.faseAtual = function () {
    for (var k = 0; k < ORDEM.length; k++) {
      var F = SM.FASES[ORDEM[k]];
      if (HOJE <= SM.data(F.fim, true)) return ORDEM[k];
    }
    return 'futuro';
  };

  /* ---------- Dados ---------- */
  SM.carregar = function (nomes) {
    var lista = ['site'].concat((nomes || []).filter(function (n) { return n !== 'site'; }));
    return Promise.all(lista.map(function (n) {
      return fetch('dados/' + n + '.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error(n);
        return r.json();
      });
    })).then(function (res) {
      var dados = {};
      lista.forEach(function (n, i) { dados[n] = res[i]; });
      SM.site = dados.site || {};
      ORDEM.forEach(function (k) { SM.FASES[k] = Object.assign({}, FASES_PADRAO[k], (SM.site.fases || {})[k] || {}); });
      montarRodape();
      ajustarContatos();
      return dados;
    }).catch(function (erro) {
      var main = document.getElementById('conteudo');
      if (main) {
        main.insertAdjacentHTML('afterbegin', '<div class="recipiente" style="padding-block:2rem"><p class="aviso-local">Não foi possível carregar o conteúdo. ' +
          (location.protocol === 'file:' ? 'Para ver o site no computador, abra a pasta com o Live Server do VS Code.' : 'Tente recarregar a página.') + '</p></div>');
      }
      throw erro;
    });
  };

  /* ---------- WhatsApp ---------- */
  SM.contato = function () { return SM.site.contato || {}; };
  /* Link de convite da comunidade do WhatsApp (aceita o antigo campo "canal") */
  SM.comunidade = function () { var c = SM.contato(); return String(c.comunidade || c.canal || '').trim(); };
  SM.whats = function (mensagem) {
    var c = SM.contato();
    var numero = String(c.whatsapp || '').replace(/\D/g, '');
    if (numero) return 'https://wa.me/' + numero + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
    if (c.instagram) return 'https://ig.me/m/' + String(c.instagram).replace('@', '');
    return '#';
  };
  var ICONE_WHATS = '<svg class="whats" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.6 8.3c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2.1.4 0 .6l-.5.7c-.1.2-.1.3 0 .5.7 1.2 1.6 2 2.8 2.6.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .8-.6 1.7-1.5 1.9-1 .2-2.6 0-4.6-1.6-2-1.7-2.7-3.4-2.8-4.4 0-.8.3-1.5.6-2z" fill="currentColor"/></svg>';
  SM.ICONE_WHATS = ICONE_WHATS;
  SM.ICONE_LOCAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  SM.botaoWhats = function (texto, mensagem, classes) {
    return '<a class="botao ' + (classes || 'botao-whats') + '" href="' + SM.esc(SM.whats(mensagem)) + '">' + ICONE_WHATS + SM.esc(texto) + '</a>';
  };

  /* ---------- Agenda: links e botões ---------- */
  SM.temPagina = function (item) { return !!(item && item.id && String(item.detalhes || '').trim()); };
  SM.linkItem = function (item) {
    if (SM.temPagina(item)) return 'atividade.html?a=' + encodeURIComponent(item.id);
    if (item.link) return SM.url(item.link);
    return '';
  };
  SM.mensagemParticipar = function (item) {
    return item.mensagem || ('Oi! Quero participar: ' + item.titulo + ' (São Miguel 150+).');
  };
  SM.botaoItem = function (item, pequeno) {
    if (!item.participar) return '';
    var s = SM.situacao(item.inicio, item.fim);
    var tam = pequeno === false ? '' : ' botao-pequeno';
    if (s === 'agora') return '<a class="botao botao-eixo' + tam + '" href="' + SM.esc(SM.whats(SM.mensagemParticipar(item))) + '">' + ICONE_WHATS + 'Participar</a>';
    if (s === 'antes') {
      if (SM.comunidade()) return '<button type="button" class="botao botao-contorno' + tam + '" data-me-avise="' + SM.esc(item.id || item.titulo) + '" aria-haspopup="dialog">Me avise</button>';
      return '<a class="botao botao-contorno' + tam + '" href="' + SM.esc(SM.whats('Oi! Quero ser avisado quando abrir: ' + item.titulo + ' (São Miguel 150+).')) + '">Me avise</a>';
    }
    return '';
  };
  /* Linha da agenda (usada no início, na agenda e nas atividades) */
  SM.linhaAgenda = function (item, opc) {
    opc = opc || {};
    var s = SM.situacao(item.inicio, item.fim);
    var fase = SM.FASES[item.fase] ? item.fase : 'geral';
    var link = SM.linkItem(item);
    /* O que já está acontecendo mostra só até quando vai */
    var data = (s === 'agora' && item.fim && item.fim !== item.inicio) ? 'até ' + SM.mes(item.fim) : SM.periodo(item.inicio, item.fim);
    var selo = s === 'agora' ? '<span class="status-chip agora">' + (item.participar ? 'Aberto agora' : 'Acontecendo') + '</span>' : '';
    return '<li class="ag-item sit-' + s + '" data-eixo="' + fase + '">' +
      '<p class="ag-data" style="margin:0">' + SM.esc(data) + '</p>' +
      '<div class="ag-corpo"><h3 class="ag-titulo">' + (link ? '<a href="' + SM.esc(link) + '">' + SM.esc(item.titulo) + '</a>' : SM.esc(item.titulo)) + selo + '</h3>' +
      (item.texto ? '<p class="ag-texto">' + SM.esc(item.texto) + '</p>' : '') +
      (item.local ? '<p class="ag-local">' + SM.ICONE_LOCAL + SM.esc(item.local) + '</p>' : '') +
      '</div><div class="ag-acao">' + SM.botaoItem(item) + '</div></li>';
  };
  SM.ordenarAgenda = function (lista) {
    return (lista || []).map(function (it, i) { return { it: it, i: i }; })
      .filter(function (x) { return SM.data(x.it.inicio); })
      .sort(function (a, b) { return (SM.data(a.it.inicio) - SM.data(b.it.inicio)) || (a.i - b.i); })
      .map(function (x) { return x.it; });
  };

  /* ---------- Entregas ---------- */
  SM.chipEntrega = function (e) {
    if (e.status === 'entregue') return '<span class="status-chip entregue">Entregue</span>';
    if (e.status === 'construcao') return '<span class="status-chip construcao">Em construção</span>';
    return '<span class="status-chip prevista">' + (e.previsao ? 'Previsão: ' + SM.esc(e.previsao) : 'Prevista') + '</span>';
  };

  /* ---------- Janela do "Me avise" (comunidade do WhatsApp) ---------- */
  SM.agenda = [];
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-me-avise]');
    if (!b || !SM.comunidade()) return;
    ev.preventDefault();
    var chave = b.getAttribute('data-me-avise');
    var item = SM.agenda.filter(function (x) { return (x.id || x.titulo) === chave; })[0] || { titulo: chave };
    var visor = document.querySelector('.aviso-visor');
    if (!visor) {
      visor = document.createElement('dialog');
      visor.className = 'aviso-visor';
      visor.setAttribute('aria-labelledby', 'aviso-titulo');
      document.body.appendChild(visor);
      visor.addEventListener('click', function (e) { if (e.target === visor || e.target.closest('[data-fechar]')) visor.close(); });
    }
    visor.setAttribute('data-eixo', SM.FASES[item.fase] ? item.fase : 'geral');
    visor.innerHTML =
      '<button class="visor-fechar" type="button" data-fechar aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
      (item.inicio ? '<p class="aviso-quando">Começa em ' + SM.esc(SM.mesLongo(item.inicio)) + '</p>' : '') +
      '<h2 class="aviso-titulo" id="aviso-titulo">' + SM.esc(item.titulo) + '</h2>' +
      '<p class="aviso-texto">Entre na comunidade do São Miguel 150+ no WhatsApp. É por lá que avisamos quando cada atividade começa, além das novidades do projeto.</p>' +
      '<a class="botao botao-eixo" href="' + SM.esc(SM.comunidade()) + '" target="_blank" rel="noopener">' + ICONE_WHATS + 'Entrar na comunidade</a>' +
      '<p class="aviso-nota">É gratuito e você pode sair quando quiser.</p>';
    if (typeof visor.showModal === 'function') visor.showModal(); else window.open(SM.comunidade(), '_blank', 'noopener');
  });

  /* ---------- Topo ---------- */
  var DEFS = '<svg class="defs-svg" aria-hidden="true" focusable="false" width="0" height="0"><defs>' +
    '<path id="onda" d="M0,0 L55,57 L61,67 L61,74 L57,81 L37,100 L28,112 L18,139 L18,166 L24,185 L33,200 L40,207 L131,210 L88,166 L82,156 L82,148 L84,144 L102,125 L104,125 L117,107 L125,82 L123,48 L115,30 L103,14 L91,3Z"/>' +
    '<pattern id="ondas-cores" patternUnits="userSpaceOnUse" width="750" height="260" patternTransform="translate(0,-36) scale(.5)">' +
    '<use href="#onda" x="10" y="44" fill="#EC9F9A"/><use href="#onda" x="160" y="0" fill="#798264"/><use href="#onda" x="310" y="44" fill="#C59354"/><use href="#onda" x="460" y="0" fill="#965049"/><use href="#onda" x="610" y="44" fill="#4D7A93"/></pattern>' +
    '</defs></svg>';

  function montarTopo() {
    var lugar = document.querySelector('[data-topo]');
    if (!lugar) return;
    var pagina = document.body.getAttribute('data-pagina') || '';
    var ini = pagina === 'inicio' ? '' : 'index.html';
    var itens = [['Sobre', ini + '#sobre', 'sobre'], ['Agenda', 'agenda.html', 'agenda'], ['Entregas', 'entregas.html', 'entregas'], ['Apoiar', ini + '#apoiar', 'apoiar']];
    lugar.outerHTML = DEFS +
      '<a class="pular" href="#conteudo">Pular para o conteúdo</a>' +
      '<header class="topo" id="topo"><div class="recipiente topo-interno">' +
      '<a class="marca" href="' + (pagina === 'inicio' ? '#topo' : 'index.html') + '" aria-label="São Miguel 150+, página inicial">' +
      '<img src="assets/logo-sao-miguel-150.webp" alt="São Miguel 150+" width="682" height="306"></a>' +
      '<button class="botao-menu" type="button" aria-expanded="false" aria-controls="menu-principal"><span class="botao-menu-icone" aria-hidden="true"><span></span><span></span><span></span></span>Menu</button>' +
      '<nav class="navegacao" id="menu-principal" aria-label="Principal"><ul class="menu">' +
      itens.map(function (it) { return '<li><a href="' + it[1] + '"' + (it[2] === pagina ? ' aria-current="page"' : '') + '>' + it[0] + '</a></li>'; }).join('') +
      '<li class="menu-acao"><a class="botao botao-vermelho botao-pequeno" href="acervo.html"' + (pagina === 'acervo' ? ' aria-current="page"' : '') + '>Acervo de Memórias</a></li>' +
      '</ul></nav></div></header>';

    var topo = document.querySelector('.topo');
    var botaoMenu = topo.querySelector('.botao-menu');
    var fechar = function () { topo.removeAttribute('data-aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); };
    botaoMenu.addEventListener('click', function () {
      if (topo.hasAttribute('data-aberto')) fechar();
      else { topo.setAttribute('data-aberto', ''); botaoMenu.setAttribute('aria-expanded', 'true'); }
    });
    topo.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', fechar); });
    topo.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(); botaoMenu.focus(); } });
  }

  /* ---------- Rodapé ---------- */
  function montarRodape() {
    var lugar = document.querySelector('[data-rodape]');
    if (!lugar) return;
    var c = SM.contato();
    var insta = String(c.instagram || '').replace('@', '');
    var contatos = [];
    if (c.whatsapp) contatos.push('<li><a href="' + SM.esc(SM.whats('Oi! Vim pelo site do São Miguel 150+.')) + '">WhatsApp</a></li>');
    if (SM.comunidade()) contatos.push('<li><a href="' + SM.esc(SM.comunidade()) + '">Comunidade no WhatsApp</a></li>');
    if (insta) contatos.push('<li><a href="https://instagram.com/' + SM.esc(insta) + '">@' + SM.esc(insta) + '</a></li>');
    if (c.email) contatos.push('<li><a href="mailto:' + SM.esc(c.email) + '">' + SM.esc(c.email) + '</a></li>');
    if (c.site) contatos.push('<li><a href="' + SM.esc(c.site) + '">' + SM.esc(String(c.site).replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a></li>');
    lugar.outerHTML = '<footer class="rodape">' +
      '<div class="faixa-ondas faixa-ondas-cores" aria-hidden="true"><svg width="100%" height="100%"><rect width="100%" height="100%" fill="url(#ondas-cores)"/></svg></div>' +
      '<div class="recipiente rodape-grade">' +
      '<div class="rodape-marca"><img src="assets/logo-150-branco.webp" alt="São Miguel 150+" width="420" height="342" loading="lazy"><p>A cidade vive na gente.</p></div>' +
      '<nav class="rodape-nav" aria-label="Rodapé"><h2>Navegue</h2><ul>' +
      '<li><a href="index.html">Início</a></li><li><a href="index.html#sobre">Sobre</a></li><li><a href="acervo.html">Acervo de Memórias</a></li>' +
      '<li><a href="agenda.html">Agenda</a></li><li><a href="entregas.html">Entregas</a></li><li><a href="index.html#apoiar">Apoiar</a></li></ul></nav>' +
      '<div class="rodape-contato"><h2>Contato</h2><ul>' + contatos.join('') + '</ul></div>' +
      '<div class="rodape-realizacao"><h2>Realização</h2><img src="assets/smdg-branco.png" alt="São Miguel da Gente" width="534" height="131" loading="lazy"></div>' +
      '</div><div class="recipiente rodape-base"><p>© ' + HOJE.getFullYear() + ' São Miguel da Gente. São Miguel (RN).</p><a href="#topo">Voltar ao topo</a></div></footer>';
  }

  /* Botões fixos no HTML com data-whats="mensagem" */
  function ajustarContatos() {
    document.querySelectorAll('[data-whats]').forEach(function (a) { a.href = SM.whats(a.getAttribute('data-whats')); });
    SM.externos();
  }

  /* Links para outros sites abrem em nova aba */
  SM.externos = function (raiz) {
    (raiz || document).querySelectorAll('a[href^="http"], a[href^="mailto:"]').forEach(function (a) {
      try {
        var destino = new URL(a.href, location.href);
        if (destino.origin !== location.origin || a.href.indexOf('mailto:') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
      } catch (e) { /* ignora */ }
    });
  };

  montarTopo();
})();
