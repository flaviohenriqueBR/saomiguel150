/* São Miguel 150+ | funções usadas pelas duas páginas */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var contato = SITE.contato || {};

  /* Os três eixos do projeto */
  var EIXOS = {
    memoria:    { numero: '01', nome: 'Memória',    tempo: 'São Miguel de Ontem',  pergunta: 'De onde viemos?' },
    identidade: { numero: '02', nome: 'Identidade', tempo: 'São Miguel de Hoje',   pergunta: 'Quem somos?' },
    futuro:     { numero: '03', nome: 'Futuro',     tempo: 'São Miguel do Amanhã', pergunta: 'O que queremos deixar?' },
    geral:      { numero: '',   nome: 'São Miguel 150+' }
  };

  function escapar(txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function normalizar(txt) {
    return String(txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  /* Link de contato: WhatsApp > e-mail > direct do Instagram */
  function linkContato(mensagem) {
    var numero = String(contato.whatsapp || '').replace(/\D/g, '');
    if (numero) return 'https://wa.me/' + numero + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
    if (contato.email) return 'mailto:' + contato.email + (mensagem ? '?subject=' + encodeURIComponent('São Miguel 150+') + '&body=' + encodeURIComponent(mensagem) : '');
    if (contato.instagram) return 'https://ig.me/m/' + contato.instagram.replace('@', '');
    return '#';
  }

  function resolverLink(link, mensagem) {
    if (!link || link === 'contato') return linkContato(mensagem);
    if (link === 'acervo.html' && SITE.paginas && SITE.paginas.acervo) return SITE.paginas.acervo;
    if (link === 'index.html' && SITE.paginas && SITE.paginas.inicio) return SITE.paginas.inicio;
    return link;
  }

  /* Links para outros sites abrem em nova aba */
  function ajustarExternos(raiz) {
    (raiz || document).querySelectorAll('a[href^="http"], a[href^="mailto:"]').forEach(function (a) {
      try {
        var destino = new URL(a.href, location.href);
        if (destino.origin !== location.origin || a.href.indexOf('mailto:') === 0) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      } catch (e) { /* ignora */ }
    });
  }

  function iniciarComum() {
    /* Logo do topo */
    if (SITE.logo) document.querySelectorAll('[data-logo]').forEach(function (img) { img.src = SITE.logo; });

    /* Botões de contato */
    document.querySelectorAll('[data-contato]').forEach(function (a) {
      a.href = linkContato(a.getAttribute('data-contato'));
    });

    /* Links entre páginas */
    var paginas = SITE.paginas || {};
    document.querySelectorAll('[data-link-acervo]').forEach(function (a) { if (paginas.acervo) a.href = paginas.acervo; });
    document.querySelectorAll('[data-link-inicio]').forEach(function (a) {
      var ancora = a.getAttribute('data-link-inicio') || '';
      if (paginas.inicio) a.href = paginas.inicio + ancora;
    });

    /* Instagram e site */
    document.querySelectorAll('[data-instagram]').forEach(function (a) {
      if (contato.instagram) { a.href = 'https://instagram.com/' + contato.instagram.replace('@', ''); }
    });
    document.querySelectorAll('[data-site]').forEach(function (a) {
      if (contato.site) { a.href = contato.site; }
    });

    /* Lista de contato do rodapé */
    var lista = document.querySelector('[data-lista-contato]');
    if (lista) {
      var itens = [];
      if (contato.whatsapp) itens.push('<li><a href="' + escapar(linkContato('')) + '">WhatsApp</a></li>');
      if (contato.email) itens.push('<li><a href="mailto:' + escapar(contato.email) + '">' + escapar(contato.email) + '</a></li>');
      if (contato.instagram) itens.push('<li><a href="https://instagram.com/' + escapar(contato.instagram.replace('@', '')) + '">@' + escapar(contato.instagram.replace('@', '')) + '</a></li>');
      if (contato.site) itens.push('<li><a href="' + escapar(contato.site) + '">' + escapar(contato.site.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a></li>');
      lista.innerHTML = itens.join('');
    }

    /* Ano no rodapé */
    document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* Menu no celular */
    var topo = document.querySelector('.topo');
    var botaoMenu = document.querySelector('.botao-menu');
    if (topo && botaoMenu) {
      var fechar = function () { topo.removeAttribute('data-aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); };
      botaoMenu.addEventListener('click', function () {
        var aberto = topo.hasAttribute('data-aberto');
        if (aberto) { fechar(); } else { topo.setAttribute('data-aberto', ''); botaoMenu.setAttribute('aria-expanded', 'true'); }
      });
      topo.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', fechar); });
      topo.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(); botaoMenu.focus(); } });
    }
  }

  window.SM = {
    SITE: SITE,
    EIXOS: EIXOS,
    escapar: escapar,
    normalizar: normalizar,
    linkContato: linkContato,
    resolverLink: resolverLink,
    ajustarExternos: ajustarExternos,
    iniciarComum: iniciarComum
  };
})();
