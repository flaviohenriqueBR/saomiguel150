/* São Miguel 150+ | página inicial */
(function () {
  'use strict';
  var SM = window.SM;
  var esc = SM.esc;

  function montarDestaque(d) {
    var secao = document.getElementById('destaque');
    if (!secao || !d) return;
    if (d.cor) secao.style.setProperty('--d-cor', d.cor);
    var fundo = secao.querySelector('.destaque-fundo');
    if (d.imagem && fundo) fundo.style.backgroundImage = 'url("' + SM.url(d.imagem).replace(/"/g, '%22') + '")';
    secao.setAttribute('data-tema', d.tema === 'claro' ? 'claro' : 'escuro');
    secao.querySelector('[data-d="rotulo"]').textContent = d.rotulo || '';
    if (d.titulo) {
      /* [o] e [O] viram a bolinha da marca */
      secao.querySelector('[data-d="titulo"]').innerHTML = esc(d.titulo).split(' ').map(function (p) {
        if (p.indexOf('[o]') < 0 && p.indexOf('[O]') < 0) return p;
        return '<span class="sem-quebra">' + p.replace(/\[O\]/g, '<span class="bola bola-g">O</span>').replace(/\[o\]/g, '<span class="bola">o</span>') + '</span>';
      }).join(' ');
    }
    secao.querySelector('[data-d="texto"]').textContent = d.texto || '';
    secao.querySelector('[data-d="botoes"]').innerHTML =
      SM.botaoWhats(d.botao || 'Enviar pelo WhatsApp', d.mensagem || '', 'botao-vermelho') +
      '<a class="botao ' + (d.tema === 'claro' ? 'botao-contorno-claro' : 'botao-contorno-escuro') + '" href="acervo.html">Ver o acervo</a>';
  }

  function textoLimpo(t) { return String(t || '').replace(/\{([^{}|]+)(?:\|[^{}]+)?\}/g, '$1'); }
  var PAPEIS = ['var(--papel-rosa)', 'var(--papel-ocre)', 'var(--papel-oliva)', 'var(--papel-ceu)'];

  function montarPrevia(lembrancas) {
    var caixa = document.querySelector('[data-previa]');
    if (!caixa) return;
    caixa.classList.remove('carregando');
    var lista = (lembrancas || []).slice().reverse().slice(0, 4);
    var resumo = document.querySelector('[data-acervo-resumo]');
    if (resumo && lembrancas && lembrancas.length) {
      resumo.textContent += ' ' + lembrancas.length + (lembrancas.length === 1 ? ' lembrança até agora.' : ' lembranças até agora.');
    }
    if (!lista.length) {
      caixa.outerHTML = '<p class="ag-vazio">As primeiras lembranças vão aparecer aqui. Mande a sua pelo WhatsApp.</p>';
      return;
    }
    caixa.innerHTML = lista.map(function (l, i) {
      var autor = '<p class="previa-autor">' + esc(l.autor || '') + (l.epoca ? ', ' + esc(l.epoca) : '') + '</p>';
      if (l.tipo === 'foto' && l.foto) {
        var legenda = textoLimpo(l.legenda || l.relato);
        return '<a class="previa foto" href="acervo.html"><img src="' + esc(SM.url(l.foto)) + '" alt="' + esc(legenda) + '" loading="lazy">' +
          '<div class="previa-corpo"><p class="previa-texto">' + esc(legenda) + '</p>' + autor + '</div></a>';
      }
      return '<a class="previa texto" href="acervo.html" style="--papel:' + PAPEIS[i % PAPEIS.length] + '">' +
        '<div class="previa-corpo"><p class="previa-texto">' + esc(textoLimpo(l.relato || l.legenda)) + '</p>' + autor + '</div></a>';
    }).join('');
  }

  function montarProximos(agenda) {
    var caixa = document.querySelector('[data-proximos]');
    if (!caixa) return;
    caixa.classList.remove('carregando');
    var lista = SM.ordenarAgenda(agenda).filter(function (it) { return SM.situacao(it.inicio, it.fim) !== 'depois'; }).slice(0, 4);
    caixa.innerHTML = lista.length ? lista.map(function (it) { return SM.linhaAgenda(it); }).join('')
      : '<li class="ag-vazio">Novas datas serão divulgadas em breve.</li>';
  }

  function montarFases() {
    var caixa = document.querySelector('[data-fases]');
    if (!caixa) return;
    var atual = SM.faseAtual();
    caixa.innerHTML = SM.ORDEM.map(function (k) {
      var F = SM.FASES[k];
      var s = SM.situacao(F.inicio, F.fim);
      var selo = s === 'agora' ? '<span class="status-chip agora">Agora</span>' : s === 'depois' ? '<span class="status-chip concluida">Concluída</span>' : '';
      return '<li class="fase-linha' + (k === atual && s === 'agora' ? ' atual' : '') + '" data-eixo="' + k + '">' +
        '<span class="fase-ponto" aria-hidden="true"></span>' +
        '<div class="fase-linha-topo"><p class="fase-linha-nome">' + esc(F.nome) + '</p><span class="fase-linha-sub">' + esc(F.subtitulo) + '</span>' + selo + '</div>' +
        '<p class="fase-linha-datas">' + esc(SM.cap(SM.periodo(F.inicio, F.fim))) + '</p>' +
        (F.resumo ? '<p class="fase-linha-resumo">' + esc(F.resumo) + '</p>' : '') +
        '</li>';
    }).join('');
  }

  function montarMembros(membros) {
    var lista = document.querySelector('[data-membros]');
    var visor = document.querySelector('[data-membro-visor]');
    if (!lista) return;
    membros = membros || [];
    lista.innerHTML = membros.map(function (m, i) {
      return '<li><button class="membro" type="button" data-membro="' + i + '" aria-haspopup="dialog">' +
        '<img src="' + esc(SM.url(m.foto)) + '" alt="" width="253" height="327" loading="lazy">' +
        '<span class="membro-nome">' + esc(m.nome) + '</span><span class="membro-mais">Ver biografia</span></button></li>';
    }).join('');
    if (!visor || typeof visor.showModal !== 'function') return;
    lista.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-membro]');
      if (!b) return;
      var m = membros[Number(b.getAttribute('data-membro'))];
      var foto = visor.querySelector('[data-membro-foto]');
      foto.src = SM.url(m.foto);
      foto.alt = 'Foto de ' + m.nome;
      visor.querySelector('[data-membro-nome]').textContent = m.nome;
      var funcao = visor.querySelector('[data-membro-funcao]');
      funcao.textContent = m.funcao || '';
      funcao.hidden = !m.funcao;
      visor.querySelector('[data-membro-bio]').textContent = m.bio || 'Integrante da São Miguel da Gente.';
      var insta = String(m.instagram || '').replace('@', '');
      var links = visor.querySelector('[data-membro-links]');
      links.innerHTML = insta ? '<a href="https://instagram.com/' + esc(insta) + '" target="_blank" rel="noopener">@' + esc(insta) + '</a>' : '';
      links.hidden = !insta;
      visor.showModal();
    });
    visor.querySelector('[data-fechar]').addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (ev) { if (ev.target === visor) visor.close(); });
  }

  function montarApoio(site) {
    if (site.apresentacao) {
      document.querySelectorAll('[data-apresentacao]').forEach(function (a) {
        a.href = SM.url(site.apresentacao);
        a.target = '_blank';
        a.rel = 'noopener';
        a.hidden = false;
      });
    }
    var parceiros = (site.parceiros || []).filter(function (p) { return p && (p.nome || p.logo); });
    var lista = document.querySelector('[data-parceiros]');
    if (!lista) return;
    var html = parceiros.map(function (p) {
      var dentro = p.logo ? '<img src="' + esc(SM.url(p.logo)) + '" alt="' + esc(p.nome || 'Parceiro') + '" loading="lazy">' : '<span>' + esc(p.nome) + '</span>';
      return p.link ? '<li><a class="parceiro" href="' + esc(p.link) + '">' + dentro + '</a></li>' : '<li><div class="parceiro">' + dentro + '</div></li>';
    }).join('');
    /* Enquanto houver poucos apoiadores, mostra espaços convidando novos */
    var vagas = parceiros.length < 4 ? 4 - parceiros.length : parceiros.length % 2;
    for (var i = 0; i < vagas; i++) {
      html += '<li><a class="parceiro parceiro-vago" href="' + esc(SM.whats('Olá! Quero saber como apoiar o São Miguel 150+.')) + '">' +
        '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Sua marca pode estar aqui</span></a></li>';
    }
    lista.innerHTML = html;
  }

  /* Quem chega por um link com âncora (#apoiar, #sobre...) só pode ser levado
     até a seção depois que o conteúdo carregou; senão ela "foge" para baixo. */
  function irParaAncora() {
    if (!location.hash || location.hash.length < 2) return;
    var alvo = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!alvo) return;
    var ir = function () { alvo.scrollIntoView({ block: 'start' }); };
    ir();
    /* de novo quando as imagens terminarem de carregar */
    window.addEventListener('load', ir, { once: true });
    setTimeout(ir, 400);
  }

  SM.carregar(['agenda', 'lembrancas', 'membros']).then(function (d) {
    SM.agenda = d.agenda || [];
    montarDestaque(d.site.destaque);
    montarPrevia(d.lembrancas);
    montarProximos(d.agenda);
    montarFases();
    montarMembros(d.membros);
    montarApoio(d.site);
    SM.externos();
    irParaAncora();
  });
})();
