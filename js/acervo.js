/* São Miguel 150+ | Acervo de Memórias
   As lembranças vêm de dados/lembrancas.json (editado pelo painel).
   As palavras da lista "palavras" de cada lembrança são destacadas
   sozinhas no texto e viram filtro. Quem preferir, ainda pode marcar
   a palavra no texto com chaves: {feira} ou {feirinhas|feira}. */
(function () {
  'use strict';

  var SM = window.SM;
  var esc = SM.esc;
  var norm = SM.norm;
  var POR_VEZ = 18;
  var PAPEIS = ['var(--papel-rosa)', 'var(--papel-ocre)', 'var(--papel-oliva)', 'var(--papel-ceu)', 'var(--papel-creme)'];
  var CORES_AVATAR = ['#B02E26', '#6E7B4E', '#A2691B', '#125F55', '#1D7396', '#965049'];
  var MARCA = /\{([^{}|]+)(?:\|([^{}]+))?\}/g;
  var PALAVRA = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:-[0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;

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

  /* A palavra do texto corresponde à palavra-filtro? (sem acento, com plural simples) */
  function bate(tokenNorm, chave) {
    return tokenNorm === chave || tokenNorm === chave + 's' || tokenNorm === chave + 'es' ||
      (chave.slice(-1) === 'l' && tokenNorm === chave.slice(0, -1) + 'is') ||
      (chave.slice(-2) === 'ao' && (tokenNorm === chave.slice(0, -2) + 'oes' || tokenNorm === chave.slice(0, -2) + 'aes'));
  }

  /* Código da lembrança: vem do painel; se faltar, é calculado pelo conteúdo */
  function idDe(l) {
    if (l.id && /^[A-Za-z0-9-]{4,64}$/.test(l.id)) return l.id;
    var base = [l.autor, l.relato, l.legenda, l.foto].join('|'), h = 5381;
    for (var k = 0; k < base.length; k++) h = ((h * 33) ^ base.charCodeAt(k)) >>> 0;
    return 'l' + h.toString(36);
  }

  /* ---------- Curtidas ---------- */
  var ICONE_CORACAO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-9.3-9.4C1.6 7.6 3.6 4.4 7 4.4c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.4 3.2 4.3 6.5-1.7 4.8-9.3 9.4-9.3 9.4z" fill="var(--preenchido, none)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  var ICONE_COMPARTILHAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M6 12H5v8h14v-8h-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHAVE_LOCAL = 'sm150-curtidas';
  var totais = {}, servidorOk = false;
  var minhas = (function () { try { return JSON.parse(localStorage.getItem(CHAVE_LOCAL) || '[]'); } catch (e) { return []; } })();
  function salvarMinhas() { try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(minhas)); } catch (e) { /* sem armazenamento */ } }
  function curtiu(id) { return minhas.indexOf(id) >= 0; }
  function htmlAcoes(it) {
    var c = curtiu(it.id), n = totais[it.id] || 0;
    return '<div class="lembranca-acoes">' +
      '<button type="button" class="acao-curtir" data-curtir="' + esc(it.id) + '" aria-pressed="' + c + '" aria-label="Curtir' + (servidorOk ? ' (' + n + ')' : '') + '">' + ICONE_CORACAO +
      '<span data-total>' + (servidorOk && n ? n : (c ? 'Curtiu' : 'Curtir')) + '</span></button>' +
      '<button type="button" class="acao-compartilhar" data-compartilhar="' + it.i + '">' + ICONE_COMPARTILHAR + 'Compartilhar</button></div>';
  }
  function atualizarCurtir(id) {
    document.querySelectorAll('[data-curtir="' + id + '"]').forEach(function (b) {
      var c = curtiu(id), n = totais[id] || 0;
      b.setAttribute('aria-pressed', c ? 'true' : 'false');
      b.setAttribute('aria-label', 'Curtir' + (servidorOk ? ' (' + n + ')' : ''));
      b.querySelector('[data-total]').textContent = servidorOk && n ? n : (c ? 'Curtiu' : 'Curtir');
    });
  }
  function alternarCurtida(id) {
    var c = !curtiu(id);
    if (c) minhas.push(id); else minhas = minhas.filter(function (x) { return x !== id; });
    salvarMinhas();
    if (servidorOk) totais[id] = Math.max(0, (totais[id] || 0) + (c ? 1 : -1));
    atualizarCurtir(id);
    fetch('api/curtidas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, curtir: c }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && typeof j.total === 'number') { servidorOk = true; totais[id] = j.total; atualizarCurtir(id); } })
      .catch(function () { /* sem servidor: a curtida fica só neste aparelho */ });
  }
  function buscarTotais() {
    return fetch('api/curtidas', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && typeof j === 'object') { servidorOk = true; totais = j; } })
      .catch(function () {});
  }

  function iniciar(LEMBRANCAS) {
  var rotulos = {};   // chave normalizada -> como a palavra aparece no filtro

  var itens = LEMBRANCAS.map(function (l, i) {
    var chaves = {};
    /* Palavras e expressões da lista (ex.: feira, Frei Damião), da mais longa
       para a mais curta, para destacar no texto */
    var frases = [];
    (l.palavras || []).forEach(function (p) {
      var k = norm(p);
      if (!k) return;
      if (!rotulos[k]) rotulos[k] = String(p).trim().replace(/\s+/g, ' ');
      var partes = k.match(/[0-9a-z]+(?:-[0-9a-z]+)*/g);
      if (partes) frases.push({ k: k, partes: partes });
    });
    frases.sort(function (a, b) { return b.partes.length - a.partes.length; });
    function botao(visivel, k) {
      chaves[k] = true;
      return '<button type="button" class="palavra" data-palavra="' + esc(k) + '" aria-pressed="false" title="Ver lembranças com ' + esc(rotulos[k]) + '">' + esc(visivel) + '</button>';
    }
    function destacar(trecho) {
      if (!frases.length) return esc(trecho);
      var toks = [], m;
      PALAVRA.lastIndex = 0;
      while ((m = PALAVRA.exec(trecho))) toks.push({ ini: m.index, fim: m.index + m[0].length, n: norm(m[0]) });
      var saida = '', ultimo = 0, i = 0;
      while (i < toks.length) {
        var achou = null;
        for (var f = 0; f < frases.length && !achou; f++) {
          var partes = frases[f].partes, n = partes.length;
          if (i + n > toks.length) continue;
          var ok = true;
          for (var j = 0; j < n && ok; j++) {
            /* a última palavra aceita plural (feira/feiras); as outras têm de ser iguais */
            ok = j === n - 1 ? bate(toks[i + j].n, partes[j]) : toks[i + j].n === partes[j];
          }
          if (ok) achou = frases[f];
        }
        if (achou) {
          var fim = toks[i + achou.partes.length - 1].fim;
          saida += esc(trecho.slice(ultimo, toks[i].ini)) + botao(trecho.slice(toks[i].ini, fim), achou.k);
          ultimo = fim;
          i += achou.partes.length;
        } else {
          i++;
        }
      }
      return saida + esc(trecho.slice(ultimo));
    }
    function marcar(txt) {
      if (!txt) return '';
      var s = String(txt), saida = '', ultimo = 0, m;
      MARCA.lastIndex = 0;
      while ((m = MARCA.exec(s))) {
        var chave = (m[2] || m[1]).trim();
        var k = norm(chave);
        if (!rotulos[k]) rotulos[k] = chave;
        saida += destacar(s.slice(ultimo, m.index)) + botao(m[1].trim(), k);
        ultimo = MARCA.lastIndex;
      }
      return saida + destacar(s.slice(ultimo));
    }
    var legendaHtml = marcar(l.legenda);
    var relatoHtml = marcar(l.relato);
    var extras = [];
    (l.palavras || []).forEach(function (p) {
      var k = norm(p);
      if (!k) return;
      if (!chaves[k]) extras.push(k);
      chaves[k] = true;
    });
    return {
      i: i,
      id: idDe(l),
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
    estado.alvo = params.get('lembranca') || '';
  }

  /* Abre a página já mostrando a lembrança do link compartilhado */
  function irParaAlvo() {
    if (!estado.alvo) return;
    var pos = filtradas().findIndex(function (it) { return it.id === estado.alvo; });
    if (pos < 0) return;
    if (pos >= estado.limite) { estado.limite = pos + 1; render(); }
    var el = document.querySelector('.lembranca[data-id="' + estado.alvo + '"]');
    if (!el) return;
    el.classList.add('alvo');
    setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
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

  /* ---------- Números do topo ---------- */
  function montarCabecalho() {
    var fotos = itens.filter(function (it) { return it.tipo === 'foto'; }).length;
    var numeros = document.querySelector('[data-numeros]');
    if (!numeros) return;
    var plural = function (n, um, varios) { return n === 1 ? um : varios; };
    numeros.innerHTML =
      '<li><b>' + itens.length + '</b>' + plural(itens.length, 'lembrança', 'lembranças') + '</li>' +
      '<li><b>' + fotos + '</b>' + plural(fotos, 'foto', 'fotos') + '</li>' +
      '<li><b>' + (itens.length - fotos) + '</b>' + plural(itens.length - fotos, 'relato', 'relatos') + '</li>';
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
      return '<article class="lembranca lembranca-foto nova" data-id="' + esc(it.id) + '">' +
        '<button type="button" class="foto-botao" data-abrir="' + it.i + '" aria-label="Ampliar foto' + (it.legenda ? ': ' + esc(it.legenda) : '') + '">' +
        '<img src="' + esc(SM.url(l.foto)) + '" alt="' + esc(it.legenda || 'Foto enviada por ' + (l.autor || 'participante')) + '" loading="lazy">' + carimbo + '</button>' +
        '<div class="lembranca-corpo">' +
        (it.legendaHtml ? '<p class="lembranca-legenda">' + it.legendaHtml + '</p>' : '') +
        (it.relatoHtml ? '<p class="lembranca-relato">' + it.relatoHtml + '</p>' : '') +
        htmlTags(it) +
        '</div>' + htmlAutoria(l) + htmlAcoes(it) + '</article>';
    }
    return '<article class="lembranca lembranca-texto nova" data-id="' + esc(it.id) + '" style="--papel:' + PAPEIS[it.i % PAPEIS.length] + '">' +
      '<span class="chave" aria-hidden="true">{</span>' +
      '<p class="lembranca-relato">' + (it.relatoHtml || it.legendaHtml) + '<span class="chave chave-fim" aria-hidden="true">}</span></p>' +
      htmlTags(it) + htmlAutoria(l) + htmlAcoes(it) + '</article>';
  }

  /* ---------- Relatos longos: mostram o começo e um "Ler mais" ---------- */
  function recolherLongos() {
    grade.querySelectorAll('.lembranca-relato:not([data-medido])').forEach(function (p) {
      p.setAttribute('data-medido', '');
      var livre = p.getBoundingClientRect().height;
      p.classList.add('recolhido');
      var preso = p.getBoundingClientRect().height;
      /* só recolhe se esconder pelo menos uma linha inteira */
      if (livre - preso > parseFloat(getComputedStyle(p).lineHeight || 24) * 0.9) {
        if (!p.id) p.id = 'relato-' + Math.random().toString(36).slice(2, 9);
        p.insertAdjacentHTML('afterend', '<button type="button" class="ler-mais" aria-expanded="false" aria-controls="' + p.id + '">Ler mais</button>');
      } else {
        p.classList.remove('recolhido');
      }
    });
  }
  /* As medidas dependem da fonte e da largura: confere de novo quando elas mudam */
  function remedir() {
    grade.querySelectorAll('.lembranca-relato[data-medido]').forEach(function (p) {
      var botao = p.nextElementSibling && p.nextElementSibling.classList.contains('ler-mais') ? p.nextElementSibling : null;
      if (botao && botao.getAttribute('aria-expanded') === 'true') return;
      if (botao) botao.remove();
      p.classList.remove('recolhido');
      p.removeAttribute('data-medido');
    });
    recolherLongos();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
  var esperaMedida;
  window.addEventListener('resize', function () { clearTimeout(esperaMedida); esperaMedida = setTimeout(remedir, 250); });

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
        '<a class="botao botao-vermelho" href="' + esc(SM.whats('Oi! Quero enviar uma lembrança para o São Miguel 150+.')) + '">Enviar a primeira lembrança</a></div>';
    } else if (!lista.length) {
      grade.innerHTML = '<div class="vazio"><h3>Nenhuma lembrança encontrada</h3><p>Tente outra palavra ou limpe os filtros. Se você tem uma história sobre isso, ela pode ser a primeira.</p>' +
        '<div class="botoes" style="justify-content:center"><button class="botao botao-contorno" type="button" data-limpar-vazio>Limpar filtros</button>' +
        '<a class="botao botao-vermelho" href="' + esc(SM.whats('Oi! Quero enviar uma lembrança para o São Miguel 150+.')) + '">Enviar minha lembrança</a></div></div>';
    } else {
      var anteriores = opcoes.acrescentar ? grade.querySelectorAll('.lembranca').length : 0;
      if (opcoes.acrescentar) {
        grade.insertAdjacentHTML('beforeend', visiveis.slice(anteriores).map(cartao).join(''));
      } else {
        grade.innerHTML = visiveis.map(cartao).join('');
      }
    }
    SM.externos(grade);
    recolherLongos();

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
    img.src = SM.url(l.foto);
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
    visor.querySelector('[data-visor-autoria]').innerHTML = htmlAutoria(l) + htmlAcoes(it);
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
    var lm = e.target.closest('.ler-mais');
    if (lm) {
      var texto = lm.previousElementSibling;
      var abrir = lm.getAttribute('aria-expanded') !== 'true';
      texto.classList.toggle('recolhido', !abrir);
      lm.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      lm.textContent = abrir ? 'Ler menos' : 'Ler mais';
      if (!abrir) { var card = lm.closest('.lembranca'); if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: 'start' }); }
      return;
    }
    var bc = e.target.closest('[data-curtir]');
    if (bc) { alternarCurtida(bc.getAttribute('data-curtir')); return; }
    var bs = e.target.closest('[data-compartilhar]');
    if (bs && SM.cartao) {
      var item = itens[Number(bs.getAttribute('data-compartilhar'))];
      if (visor && visor.open) visor.close();
      SM.cartao.abrir(Object.assign({}, item.dado, { id: item.id }), item.i);
      return;
    }
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
  window.addEventListener('hashchange', function () { lerEndereco(); estado.limite = POR_VEZ; render(); irParaAlvo(); });

  /* ---------- Início ---------- */
  montarCabecalho();
  montarNuvem();
  lerEndereco();
  render();
  irParaAlvo();
  SM.externos();
  }

  /* A lembrança mais nova (a última da lista no painel) aparece primeiro */
  Promise.all([SM.carregar(['lembrancas']), buscarTotais()]).then(function (res) {
    iniciar((res[0].lembrancas || []).slice().reverse());
  });
})();
