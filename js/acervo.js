/* São Miguel 150+ | página da ação: Acervo de Memórias */
(function () {
  'use strict';

  var SM = window.SM;
  var esc = SM.escapar;
  var norm = SM.normalizar;
  var PAGINA = window.PAGINA_ACAO || {};
  var LEMBRANCAS = window.LEMBRANCAS || [];
  var POR_VEZ = 18;
  var PAPEIS = ['var(--papel-rosa)', 'var(--papel-ocre)', 'var(--papel-oliva)', 'var(--papel-ceu)', 'var(--papel-creme)'];
  var CORES_AVATAR = ['#B02E26', '#6E7B4E', '#A2691B', '#125F55', '#1D7396', '#965049'];
  var MARCA = /\{([^{}|]+)(?:\|([^{}]+))?\}/g;

  /* ---------- Preparação dos dados ---------- */
  function textoLimpo(txt) { return String(txt || '').replace(MARCA, '$1'); }

  function iniciais(nome) {
    var partes = String(nome || '?').trim().split(/\s+/);
    var a = partes[0] ? partes[0].charAt(0) : '?';
    var b = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (a + b).toUpperCase();
  }

  function corDoNome(nome) {
    var h = 0;
    String(nome || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return CORES_AVATAR[h % CORES_AVATAR.length];
  }

  var rotulos = {};   // chave normalizada -> como a palavra aparece no filtro

  var itens = LEMBRANCAS.map(function (l, i) {
    var chaves = {};
    function marcar(txt) {
      if (!txt) return '';
      var s = String(txt), saida = '', ultimo = 0, m;
      MARCA.lastIndex = 0;
      while ((m = MARCA.exec(s))) {
        var visivel = m[1].trim();
        var chave = (m[2] || m[1]).trim();
        var k = norm(chave);
        chaves[k] = true;
        if (!rotulos[k]) rotulos[k] = chave.toLowerCase();
        saida += esc(s.slice(ultimo, m.index)) +
          '<button type="button" class="palavra" data-palavra="' + esc(k) + '" aria-pressed="false" title="Ver lembranças com ' + esc(rotulos[k]) + '">' + esc(visivel) + '</button>';
        ultimo = MARCA.lastIndex;
      }
      return saida + esc(s.slice(ultimo));
    }
    var legendaHtml = marcar(l.legenda);
    var relatoHtml = marcar(l.relato);
    var extras = [];
    (l.palavras || []).forEach(function (p) {
      var k = norm(p);
      if (!k) return;
      if (!rotulos[k]) rotulos[k] = String(p).toLowerCase();
      if (!chaves[k]) extras.push(k);
      chaves[k] = true;
    });
    return {
      i: i,
      dado: l,
      tipo: (l.tipo === 'foto' && l.foto) ? 'foto' : 'texto',
      legendaHtml: legendaHtml,
      relatoHtml: relatoHtml,
      legenda: textoLimpo(l.legenda),
      relato: textoLimpo(l.relato),
      chaves: chaves,
      extras: extras,
      busca: norm([textoLimpo(l.legenda), textoLimpo(l.relato), l.autor, l.detalhe, l.epoca, l.ano].join(' '))
    };
  });

  var contagem = {};
  itens.forEach(function (it) { Object.keys(it.chaves).forEach(function (k) { contagem[k] = (contagem[k] || 0) + 1; }); });
  var palavrasOrdenadas = Object.keys(contagem).sort(function (a, b) {
    return (contagem[b] - contagem[a]) || rotulos[a].localeCompare(rotulos[b], 'pt-BR');
  });

  /* ---------- Estado (também guardado no endereço da página) ---------- */
  var estado = { palavra: '', tipo: 'todas', busca: '', limite: POR_VEZ };

  function lerEndereco() {
    var params = new URLSearchParams(location.hash.replace(/^#/, ''));
    var p = norm(params.get('palavra') || '');
    estado.palavra = contagem[p] ? p : '';
    var t = params.get('tipo');
    estado.tipo = (t === 'foto' || t === 'texto') ? t : 'todas';
    estado.busca = params.get('busca') || '';
  }

  function gravarEndereco() {
    var params = new URLSearchParams();
    if (estado.palavra) params.set('palavra', estado.palavra);
    if (estado.tipo !== 'todas') params.set('tipo', estado.tipo);
    if (estado.busca) params.set('busca', estado.busca);
    var hash = params.toString();
    try {
      history.replaceState(null, '', hash ? '#' + hash : location.pathname + location.search);
    } catch (e) { /* alguns visualizadores não permitem; o filtro continua funcionando */ }
  }

  function filtradas() {
    var b = norm(estado.busca);
    return itens.filter(function (it) {
      if (estado.palavra && !it.chaves[estado.palavra]) return false;
      if (estado.tipo !== 'todas' && it.tipo !== estado.tipo) return false;
      if (b && it.busca.indexOf(b) < 0) return false;
      return true;
    });
  }

  /* ---------- Elementos ---------- */
  var grade = document.querySelector('[data-grade]');
  var nuvem = document.querySelector('[data-nuvem]');
  var resultado = document.querySelector('[data-resultado]');
  var botaoLimpar = document.querySelector('[data-limpar]');
  var botaoMais = document.querySelector('[data-mais]');
  var campoBusca = document.getElementById('busca');
  var botoesTipo = document.querySelectorAll('[data-tipo]');
  var filtroAtivo = document.querySelector('[data-filtro-ativo]');
  var palavraAtiva = document.querySelector('[data-palavra-ativa]');
  var removerPalavra = document.querySelector('[data-remover-palavra]');
  var barra = document.querySelector('.explorar');
  var topo = document.querySelector('.topo');

  /* ---------- Cabeçalho da ação ---------- */
  function montarCabecalho() {
    var eixoId = SM.EIXOS[PAGINA.eixo] ? PAGINA.eixo : 'memoria';
    var eixo = SM.EIXOS[eixoId];
    document.body.setAttribute('data-eixo', eixoId);
    var definir = function (chave, valor) {
      var el = document.querySelector('[data-a="' + chave + '"]');
      if (el) el.textContent = valor;
      return el;
    };
    definir('eixo-nome', eixo.nome);
    definir('eixo-numero', eixo.numero);
    var rotuloEixo = document.querySelector('.acao-eixo p');
    if (rotuloEixo) {
      rotuloEixo.innerHTML = '<span class="sr">Eixo ' + esc(eixo.numero) + ': </span><strong>' + esc(eixo.nome) + '</strong><em>' + esc(eixo.pergunta || '') + '</em>';
    }
    definir('acao', PAGINA.acao ? 'Ação: ' + PAGINA.acao : '');
    definir('nome', PAGINA.nome || '');
    definir('descricao', PAGINA.descricao || '');
    if (PAGINA.nome) document.title = PAGINA.nome + ' | São Miguel 150+';
    var ilustra = document.querySelector('[data-a="ilustracao"]');
    if (ilustra) {
      if (PAGINA.ilustracao) ilustra.src = PAGINA.ilustracao; else ilustra.hidden = true;
    }

    var fotos = itens.filter(function (it) { return it.tipo === 'foto'; }).length;
    var numeros = document.querySelector('[data-a="numeros"]');
    if (numeros) {
      var plural = function (n, um, varios) { return n === 1 ? um : varios; };
      numeros.innerHTML =
        '<li><b>' + itens.length + '</b>' + plural(itens.length, 'lembrança', 'lembranças') + '</li>' +
        '<li><b>' + fotos + '</b>' + plural(fotos, 'foto', 'fotos') + '</li>' +
        '<li><b>' + (itens.length - fotos) + '</b>' + plural(itens.length - fotos, 'relato', 'relatos') + '</li>' +
        '<li><b>' + palavrasOrdenadas.length + '</b>' + plural(palavrasOrdenadas.length, 'palavra', 'palavras') + '</li>';
    }
  }

  /* ---------- Cartões ---------- */
  function htmlAutoria(l) {
    return '<footer class="autoria">' +
      '<span class="avatar" style="--av:' + corDoNome(l.autor) + '" aria-hidden="true">' + esc(iniciais(l.autor)) + '</span>' +
      '<span class="autoria-texto"><span class="sr">Enviada por </span><strong>' + esc(l.autor || 'Anônimo') + '</strong>' + esc(l.detalhe || '') + '</span>' +
      (l.epoca ? '<span class="autoria-epoca">' + esc(l.epoca) + '</span>' : '') +
      '</footer>';
  }

  function htmlTags(it) {
    if (!it.extras.length) return '';
    return '<ul class="lembranca-tags">' + it.extras.map(function (k) {
      return '<li><button type="button" class="palavra" data-palavra="' + esc(k) + '" aria-pressed="false">' + esc(rotulos[k]) + '</button></li>';
    }).join('') + '</ul>';
  }

  function cartao(it) {
    var l = it.dado;
    if (it.tipo === 'foto') {
      var carimbo = l.ano ? '<span class="carimbo" aria-hidden="true">\u2019' + esc(String(l.ano).slice(-2)) + '</span>' : '';
      return '<article class="lembranca lembranca-foto nova">' +
        '<button type="button" class="foto-botao" data-abrir="' + it.i + '" aria-label="Ampliar foto' + (it.legenda ? ': ' + esc(it.legenda) : '') + '">' +
        '<img src="' + esc(l.foto) + '" alt="' + esc(it.legenda || 'Foto enviada por ' + (l.autor || 'participante')) + '" loading="lazy">' + carimbo + '</button>' +
        '<div class="lembranca-corpo">' +
        (it.legendaHtml ? '<p class="lembranca-legenda">' + it.legendaHtml + '</p>' : '') +
        (it.relatoHtml ? '<p class="lembranca-relato">' + it.relatoHtml + '</p>' : '') +
        htmlTags(it) +
        '</div>' + htmlAutoria(l) + '</article>';
    }
    return '<article class="lembranca lembranca-texto nova" style="--papel:' + PAPEIS[it.i % PAPEIS.length] + '">' +
      '<span class="chave" aria-hidden="true">{</span>' +
      '<p class="lembranca-relato">' + (it.relatoHtml || it.legendaHtml) + '<span class="chave chave-fim" aria-hidden="true">}</span></p>' +
      htmlTags(it) + htmlAutoria(l) + '</article>';
  }

  /* ---------- Renderização ---------- */
  function montarNuvem() {
    if (!nuvem) return;
    if (!palavrasOrdenadas.length) { nuvem.closest('section').hidden = true; return; }
    nuvem.innerHTML = palavrasOrdenadas.map(function (k) {
      return '<li><button type="button" data-palavra="' + esc(k) + '" aria-pressed="false">' + esc(rotulos[k]) +
        '<span class="nuvem-qtd" aria-label="' + contagem[k] + (contagem[k] === 1 ? ' lembrança' : ' lembranças') + '">' + contagem[k] + '</span></button></li>';
    }).join('');
  }

  function descreverResultado(n) {
    if (!itens.length) return '';
    var partes = [];
    var tipoTxt = estado.tipo === 'foto' ? (n === 1 ? 'foto' : 'fotos') : estado.tipo === 'texto' ? (n === 1 ? 'relato' : 'relatos') : (n === 1 ? 'lembrança' : 'lembranças');
    partes.push('<strong>' + n + '</strong> ' + tipoTxt);
    if (estado.palavra) partes.push('com a palavra <strong>' + esc(rotulos[estado.palavra]) + '</strong>');
    if (estado.busca) partes.push('para <strong>\u201c' + esc(estado.busca) + '\u201d</strong>');
    var filtrando = estado.palavra || estado.busca || estado.tipo !== 'todas';
    return (filtrando ? 'Mostrando ' : '') + partes.join(' ') + (filtrando ? '' : ' no acervo');
  }

  function render(opcoes) {
    opcoes = opcoes || {};
    var lista = filtradas();
    var visiveis = lista.slice(0, estado.limite);

    if (!itens.length) {
      grade.innerHTML = '<div class="vazio"><h3>O acervo está começando</h3><p>As primeiras lembranças da Campanha de Histórias vão aparecer aqui.</p>' +
        '<a class="botao botao-vermelho" href="' + esc(SM.linkContato('Oi! Quero enviar uma lembrança para o São Miguel 150+.')) + '">Enviar a primeira lembrança</a></div>';
    } else if (!lista.length) {
      grade.innerHTML = '<div class="vazio"><h3>Nenhuma lembrança encontrada</h3><p>Tente outra palavra ou limpe os filtros. Se você tem uma história sobre isso, ela pode ser a primeira.</p>' +
        '<div class="botoes" style="justify-content:center"><button class="botao botao-contorno" type="button" data-limpar-vazio>Limpar filtros</button>' +
        '<a class="botao botao-vermelho" href="' + esc(SM.linkContato('Oi! Quero enviar uma lembrança para o São Miguel 150+.')) + '">Enviar minha lembrança</a></div></div>';
    } else {
      var anteriores = opcoes.acrescentar ? grade.querySelectorAll('.lembranca').length : 0;
      if (opcoes.acrescentar) {
        grade.insertAdjacentHTML('beforeend', visiveis.slice(anteriores).map(cartao).join(''));
      } else {
        grade.innerHTML = visiveis.map(cartao).join('');
      }
    }
    SM.ajustarExternos(grade);

    /* Estado visual das palavras */
    document.querySelectorAll('[data-palavra]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-palavra') === estado.palavra ? 'true' : 'false');
    });
    botoesTipo.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tipo') === estado.tipo ? 'true' : 'false'); });
    if (filtroAtivo) {
      filtroAtivo.hidden = !estado.palavra;
      if (estado.palavra) {
        palavraAtiva.textContent = rotulos[estado.palavra];
        removerPalavra.setAttribute('aria-label', 'Remover filtro da palavra ' + rotulos[estado.palavra]);
      }
    }
    if (campoBusca && campoBusca.value !== estado.busca) campoBusca.value = estado.busca;

    resultado.innerHTML = descreverResultado(lista.length);
    botaoLimpar.hidden = !(estado.palavra || estado.busca || estado.tipo !== 'todas');
    botaoMais.hidden = lista.length <= estado.limite;
    if (!botaoMais.hidden) botaoMais.textContent = 'Mostrar mais lembranças (' + (lista.length - estado.limite) + ')';
  }

  function irParaResultados() {
    var alvo = document.querySelector('.resultado');
    if (!alvo) return;
    var folga = (topo ? topo.offsetHeight : 0) + (barra ? barra.offsetHeight : 0) + 12;
    var y = alvo.getBoundingClientRect().top + window.pageYOffset - folga;
    if (Math.abs(window.pageYOffset - y) > 40) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  function escolherPalavra(k, rolar) {
    estado.palavra = (estado.palavra === k) ? '' : k;
    estado.limite = POR_VEZ;
    gravarEndereco();
    render();
    if (rolar) irParaResultados();
  }

  function limpar() {
    estado.palavra = ''; estado.tipo = 'todas'; estado.busca = ''; estado.limite = POR_VEZ;
    gravarEndereco();
    render();
  }

  /* ---------- Visor de fotos ---------- */
  var visor = document.querySelector('[data-visor]');
  var visorAtual = -1;
  var visorLista = [];

  function abrirVisor(indice) {
    if (!visor || typeof visor.showModal !== 'function') return;
    visorLista = filtradas().filter(function (it) { return it.tipo === 'foto'; });
    visorAtual = visorLista.findIndex(function (it) { return it.i === indice; });
    if (visorAtual < 0) return;
    preencherVisor();
    visor.showModal();
  }

  function preencherVisor() {
    var it = visorLista[visorAtual];
    if (!it) return;
    var l = it.dado;
    var img = visor.querySelector('[data-visor-img]');
    img.src = l.foto;
    img.alt = it.legenda || 'Foto enviada por ' + (l.autor || 'participante');
    visor.querySelector('[data-visor-texto]').innerHTML =
      (it.legendaHtml ? '<p class="lembranca-legenda">' + it.legendaHtml + '</p>' : '') +
      (it.relatoHtml ? '<p class="lembranca-relato">' + it.relatoHtml + '</p>' : '');
    var chaves = Object.keys(it.chaves);
    visor.querySelector('[data-visor-palavras]').innerHTML = chaves.length
      ? '<h3>Outras lembranças com estas palavras</h3><ul class="nuvem">' + chaves.map(function (k) {
          return '<li><button type="button" data-palavra="' + esc(k) + '" aria-pressed="' + (k === estado.palavra) + '">' + esc(rotulos[k]) + '<span class="nuvem-qtd">' + contagem[k] + '</span></button></li>';
        }).join('') + '</ul>'
      : '';
    visor.querySelector('[data-visor-autoria]').innerHTML = htmlAutoria(l);
    var contador = visor.querySelector('[data-visor-contador]');
    contador.textContent = visorLista.length > 1 ? (visorAtual + 1) + ' de ' + visorLista.length + ' fotos' : '';
    visor.querySelector('[data-visor-ant]').disabled = visorLista.length < 2;
    visor.querySelector('[data-visor-prox]').disabled = visorLista.length < 2;
  }

  function moverVisor(passo) {
    if (visorLista.length < 2) return;
    visorAtual = (visorAtual + passo + visorLista.length) % visorLista.length;
    preencherVisor();
  }

  if (visor) {
    visor.querySelector('[data-fechar]').addEventListener('click', function () { visor.close(); });
    visor.querySelector('[data-visor-ant]').addEventListener('click', function () { moverVisor(-1); });
    visor.querySelector('[data-visor-prox]').addEventListener('click', function () { moverVisor(1); });
    visor.addEventListener('click', function (e) {
      if (e.target === visor) { visor.close(); return; }
      var palavra = e.target.closest('[data-palavra]');
      if (palavra) { visor.close(); escolherPalavra(palavra.getAttribute('data-palavra'), true); }
    });
    visor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); moverVisor(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); moverVisor(1); }
    });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    if (visor && visor.contains(e.target)) return;
    var palavra = e.target.closest('[data-palavra]');
    if (palavra) {
      var naNuvem = !!palavra.closest('[data-nuvem]');
      escolherPalavra(palavra.getAttribute('data-palavra'), !naNuvem);
      return;
    }
    var abrir = e.target.closest('[data-abrir]');
    if (abrir) { abrirVisor(Number(abrir.getAttribute('data-abrir'))); return; }
    if (e.target.closest('[data-limpar-vazio]')) { limpar(); }
  });

  botoesTipo.forEach(function (b) {
    b.addEventListener('click', function () {
      estado.tipo = b.getAttribute('data-tipo');
      estado.limite = POR_VEZ;
      gravarEndereco();
      render();
    });
  });

  var espera;
  if (campoBusca) {
    campoBusca.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        estado.busca = campoBusca.value.trim();
        estado.limite = POR_VEZ;
        gravarEndereco();
        render();
      }, 180);
    });
  }
  if (removerPalavra) removerPalavra.addEventListener('click', function () { escolherPalavra(estado.palavra, false); });
  botaoLimpar.addEventListener('click', limpar);
  botaoMais.addEventListener('click', function () {
    estado.limite += POR_VEZ;
    render({ acrescentar: true });
  });
  window.addEventListener('hashchange', function () { lerEndereco(); estado.limite = POR_VEZ; render(); });

  /* ---------- Início ---------- */
  SM.iniciarComum();
  montarCabecalho();
  montarNuvem();
  lerEndereco();
  render();
  SM.ajustarExternos();
})();
