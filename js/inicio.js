/* São Miguel 150+ | página inicial */
(function () {
  'use strict';

  var SM = window.SM;
  var SITE = SM.SITE;
  var esc = SM.escapar;
  var HOJE = new Date();
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var ICONE_SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICONE_CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var ICONE_LOCAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var ICONE_MAIS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  function cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

  /* ---------------- Destaque ---------------- */
  function montarDestaque() {
    var d = SITE.destaque || {};
    var secao = document.getElementById('destaque');
    if (!secao) return;
    var fundo = d.fundo || {};
    if (fundo.cor) secao.style.setProperty('--d-cor', fundo.cor);
    var camadaFundo = secao.querySelector('.destaque-fundo');
    if (fundo.imagem && camadaFundo) camadaFundo.style.backgroundImage = 'url("' + String(fundo.imagem).replace(/"/g, '%22') + '")';
    if (fundo.posicao) secao.style.setProperty('--d-pos', fundo.posicao);
    secao.setAttribute('data-tema', d.tema === 'claro' ? 'claro' : 'escuro');
    var grafismo = secao.querySelector('.destaque-grafismo');
    if (grafismo && d.grafismo === false) grafismo.hidden = true;

    var rotulo = secao.querySelector('[data-d="rotulo"]');
    if (rotulo) rotulo.textContent = d.rotulo || '';

    var titulo = secao.querySelector('[data-d="titulo"]');
    if (titulo && d.titulo) {
      titulo.innerHTML = esc(d.titulo).split(' ').map(function (palavra) {
        if (palavra.indexOf('[o]') < 0 && palavra.indexOf('[O]') < 0) return palavra;
        return '<span class="sem-quebra">' + palavra
          .replace(/\[O\]/g, '<span class="bola bola-g">O</span>')
          .replace(/\[o\]/g, '<span class="bola">o</span>') + '</span>';
      }).join(' ');
    }
    var texto = secao.querySelector('[data-d="texto"]');
    if (texto) texto.textContent = d.texto || '';

    var botoes = secao.querySelector('[data-d="botoes"]');
    if (botoes) {
      var html = '';
      var claro = d.tema === 'claro';
      if (d.botao && d.botao.texto) {
        html += '<a class="botao botao-vermelho" href="' + esc(SM.resolverLink(d.botao.link, d.botao.mensagem)) + '">' + esc(d.botao.texto) + '</a>';
      }
      if (d.botaoSecundario && d.botaoSecundario.texto) {
        html += '<a class="botao ' + (claro ? 'botao-contorno-claro' : 'botao-contorno-escuro') + '" href="' + esc(SM.resolverLink(d.botaoSecundario.link, d.botaoSecundario.mensagem)) + '">' + esc(d.botaoSecundario.texto) + '</a>';
      }
      botoes.innerHTML = html;
    }
  }

  /* ---------------- Jornada ---------------- */
  var PERIODOS = {
    memoria:    { inicio: new Date(2026, 9, 1), fim: new Date(2027, 1, 28, 23, 59), abre: 'out/26' },
    identidade: { inicio: new Date(2027, 2, 1), fim: new Date(2027, 5, 30, 23, 59), abre: 'mar/27' },
    futuro:     { inicio: new Date(2027, 6, 1), fim: new Date(2027, 11, 31, 23, 59), abre: 'jul/27' }
  };

  function eixoAtual() {
    var chaves = Object.keys(PERIODOS);
    for (var i = 0; i < chaves.length; i++) {
      var p = PERIODOS[chaves[i]];
      if (HOJE <= p.fim) return chaves[i];
    }
    return 'futuro';
  }

  function montarJornada() {
    var jornada = document.querySelector('[data-jornada]');
    if (!jornada) return;
    var etapas = Array.prototype.slice.call(jornada.querySelectorAll('.etapa'));
    var celular = window.matchMedia('(max-width: 760px)');

    etapas.forEach(function (etapa) {
      var eixo = etapa.getAttribute('data-eixo');
      var p = PERIODOS[eixo];
      var status = etapa.querySelector('[data-status]');
      if (!p || !status) return;
      if (HOJE > p.fim) status.textContent = 'Concluído';
      else if (HOJE >= p.inicio) status.textContent = 'Acontecendo agora';
      else if (eixo === eixoAtual()) status.textContent = 'Começa em ' + p.abre;
    });

    function abrir(etapa, rolar) {
      etapas.forEach(function (outra) {
        var painel = document.getElementById(outra.getAttribute('aria-controls'));
        var ativa = outra === etapa;
        outra.setAttribute('aria-expanded', ativa ? 'true' : 'false');
        if (painel) {
          painel.hidden = !ativa;
          if (ativa) {
            painel.classList.remove('entrando');
            void painel.offsetWidth;
            painel.classList.add('entrando');
          }
        }
      });
      if (rolar && celular.matches) {
        setTimeout(function () { etapa.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
      }
    }

    function fecharTodas() {
      etapas.forEach(function (e) {
        e.setAttribute('aria-expanded', 'false');
        var painel = document.getElementById(e.getAttribute('aria-controls'));
        if (painel) painel.hidden = true;
      });
    }

    etapas.forEach(function (etapa, i) {
      etapa.addEventListener('click', function () {
        var jaAberta = etapa.getAttribute('aria-expanded') === 'true';
        if (jaAberta && celular.matches) { fecharTodas(); return; }
        if (!jaAberta) abrir(etapa, true);
      });
      etapa.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var passo = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
        var alvo = etapas[(i + passo + etapas.length) % etapas.length];
        e.preventDefault();
        alvo.focus();
        abrir(alvo, false);
      });
    });

    var inicial = jornada.querySelector('.etapa[data-eixo="' + eixoAtual() + '"]') || etapas[0];
    abrir(inicial, false);
    jornada.querySelectorAll('.painel').forEach(function (p) { p.classList.remove('entrando'); });
  }

  /* ---------------- Botões das páginas das ações ---------------- */
  function montarAcoes() {
    var acoes = SITE.acoes || [];
    document.querySelectorAll('[data-acoes]').forEach(function (caixa) {
      var eixo = caixa.getAttribute('data-acoes');
      var lista = acoes.filter(function (a) { return a.eixo === eixo; });
      var html = lista.map(function (a) {
        if (a.liberada) {
          return '<a class="pagina-acao liberada" href="' + esc(SM.resolverLink(a.link || '#')) + '">' +
            '<span class="pagina-acao-icone">' + ICONE_SETA + '</span>' +
            '<span><strong>' + esc(a.nome) + '</strong><small>' + esc(a.chamada || 'Abrir página') + '</small></span></a>';
        }
        var quando = a.abre ? 'Abre em ' + a.abre : 'Em breve';
        return '<button type="button" class="pagina-acao bloqueada" aria-disabled="true" data-aviso="A página de ' + esc(a.nome) + (a.abre ? ' abre em ' + esc(a.abre) : ' abre em breve') + '. Acompanhe a agenda.">' +
          '<span class="pagina-acao-icone">' + ICONE_CADEADO + '</span>' +
          '<span><strong>' + esc(a.nome) + '</strong><small>' + esc(quando) + '</small></span></button>';
      }).join('');
      caixa.innerHTML = html;
      var aviso = document.createElement('p');
      aviso.className = 'aviso-acao';
      aviso.setAttribute('aria-live', 'polite');
      caixa.insertAdjacentElement('afterend', aviso);

      caixa.addEventListener('click', function (e) {
        var bloqueada = e.target.closest('.pagina-acao.bloqueada');
        if (!bloqueada) return;
        aviso.textContent = bloqueada.getAttribute('data-aviso');
        bloqueada.classList.remove('tremer');
        void bloqueada.offsetWidth;
        bloqueada.classList.add('tremer');
      });
    });
  }

  /* ---------------- Agenda ---------------- */
  function lerData(txt, fimDoPeriodo) {
    var partes = String(txt || '').split('-').map(Number);
    var a = partes[0], m = (partes[1] || 1) - 1, d = partes[2];
    if (!a) return null;
    if (fimDoPeriodo) {
      return d ? new Date(a, m, d, 23, 59, 59) : new Date(a, m + 1, 0, 23, 59, 59);
    }
    return new Date(a, m, d || 1);
  }

  function formatarQuando(ev) {
    var i = String(ev.inicio || '').split('-').map(Number);
    var f = ev.fim ? String(ev.fim).split('-').map(Number) : null;
    var temDia = !!i[2];
    var data, ano;
    if (!f || (f[0] === i[0] && f[1] === i[1] && f[2] === i[2])) {
      data = temDia ? i[2] + ' ' + MESES[i[1] - 1] : cap(MESES[i[1] - 1]);
      ano = String(i[0]);
    } else if (temDia && f[2]) {
      data = (f[1] === i[1]) ? i[2] + ' a ' + f[2] + ' ' + MESES[i[1] - 1] : i[2] + ' ' + MESES[i[1] - 1] + ' a ' + f[2] + ' ' + MESES[f[1] - 1];
      ano = f[0] === i[0] ? String(i[0]) : i[0] + ' a ' + f[0];
    } else {
      data = cap(MESES[i[1] - 1]) + ' a ' + MESES[f[1] - 1];
      ano = f[0] === i[0] ? String(i[0]) : i[0] + ' a ' + f[0];
    }
    if (ev.horario) ano += ', ' + ev.horario;
    return { data: data, ano: ano };
  }

  function montarAgenda() {
    var trilho = document.querySelector('[data-trilho]');
    if (!trilho) return;
    var carrossel = trilho.parentElement;
    var eventos = (SITE.eventos || []).map(function (ev, idx) {
      var inicio = lerData(ev.inicio, false);
      var fim = lerData(ev.fim || ev.inicio, true);
      var status = 'futuro';
      if (fim && HOJE > fim) status = 'passado';
      else if (inicio && HOJE >= inicio) status = 'agora';
      return { ev: ev, inicio: inicio, fim: fim, status: status, idx: idx };
    }).filter(function (e) { return e.inicio; });

    eventos.sort(function (a, b) { return (a.inicio - b.inicio) || (a.idx - b.idx); });
    var proximo = eventos.find(function (e) { return e.status === 'futuro'; });
    if (proximo) proximo.status = 'proximo';

    var rotulos = { passado: 'Aconteceu', agora: 'Acontecendo', proximo: 'Próximo', futuro: '' };

    trilho.innerHTML = eventos.map(function (e) {
      var ev = e.ev;
      var frente = SM.EIXOS[ev.frente] ? ev.frente : 'geral';
      var q = formatarQuando(ev);
      return '<li class="evento" data-eixo="' + frente + '" data-status="' + e.status + '">' +
        '<div class="evento-topo"><span class="evento-frente">' + esc(SM.EIXOS[frente].nome) + '</span>' +
        '<span class="evento-status">' + rotulos[e.status] + '</span></div>' +
        '<p class="evento-quando"><span class="evento-data">' + esc(q.data) + '</span><span class="evento-ano">' + esc(q.ano) + '</span></p>' +
        '<h3 class="evento-titulo">' + esc(ev.titulo) + '</h3>' +
        (ev.descricao ? '<p class="evento-desc">' + esc(ev.descricao) + '</p>' : '') +
        (ev.local ? '<p class="evento-local">' + ICONE_LOCAL + '<span>' + esc(ev.local) + '</span></p>' : '') +
        '</li>';
    }).join('');

    var anterior = document.querySelector('[data-carrossel="anterior"]');
    var seguinte = document.querySelector('[data-carrossel="proximo"]');
    function passo() {
      var card = trilho.querySelector('.evento');
      if (!card) return 300;
      var gap = parseFloat(getComputedStyle(trilho).columnGap) || 16;
      var visiveis = Math.max(1, Math.floor((carrossel.clientWidth - 40) / (card.offsetWidth + gap)));
      return (card.offsetWidth + gap) * visiveis;
    }
    function atualizarControles() {
      if (!anterior || !seguinte) return;
      anterior.disabled = carrossel.scrollLeft <= 4;
      seguinte.disabled = carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - 4;
    }
    if (anterior) anterior.addEventListener('click', function () { carrossel.scrollBy({ left: -passo(), behavior: 'smooth' }); });
    if (seguinte) seguinte.addEventListener('click', function () { carrossel.scrollBy({ left: passo(), behavior: 'smooth' }); });
    carrossel.addEventListener('scroll', function () { window.requestAnimationFrame(atualizarControles); }, { passive: true });
    window.addEventListener('resize', atualizarControles);

    /* Começa mostrando o primeiro evento que ainda não aconteceu */
    var primeiroAtual = trilho.querySelector('.evento:not([data-status="passado"])');
    if (primeiroAtual) {
      var margem = parseFloat(getComputedStyle(trilho).paddingLeft) || 0;
      var desloc = primeiroAtual.getBoundingClientRect().left - trilho.getBoundingClientRect().left - margem;
      carrossel.scrollLeft = Math.max(0, desloc);
    }
    atualizarControles();
  }

  /* ---------------- Parceiros ---------------- */
  function montarParceiros() {
    var lista = document.querySelector('[data-parceiros]');
    if (!lista) return;
    var parceiros = SITE.parceiros || [];
    if (!parceiros.length) {
      var vaga = '<li><a class="parceiro parceiro-vago" href="#apoiar">' + '<span>' + ICONE_MAIS + 'Sua marca pode estar aqui</span></a></li>';
      lista.innerHTML = vaga + vaga + vaga;
      return;
    }
    lista.innerHTML = parceiros.map(function (p) {
      var dentro = p.logo ? '<img src="' + esc(p.logo) + '" alt="' + esc(p.nome) + '" loading="lazy">' : '<span>' + esc(p.nome) + '</span>';
      return p.link
        ? '<li><a class="parceiro" href="' + esc(p.link) + '">' + dentro + '</a></li>'
        : '<li><div class="parceiro">' + dentro + '</div></li>';
    }).join('');
  }

  function montarApresentacao() {
    var botao = document.querySelector('[data-apresentacao]');
    if (botao && SITE.apresentacao) { botao.href = SITE.apresentacao; botao.hidden = false; }
  }

  SM.iniciarComum();
  montarDestaque();
  montarJornada();
  montarAcoes();
  montarAgenda();
  montarParceiros();
  montarApresentacao();
  SM.ajustarExternos();
})();
