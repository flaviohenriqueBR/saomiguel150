/* São Miguel 150+ | página de uma atividade da agenda (atividade.html?a=ID) */
(function () {
  'use strict';
  var SM = window.SM;
  var esc = SM.esc;
  var main = document.querySelector('[data-atividade]');
  var id = new URLSearchParams(location.search).get('a') || '';

  function naoEncontrada() {
    main.innerHTML = '<section class="pagina-cab"><div class="recipiente">' +
      '<nav aria-label="Você está em"><ol class="migalhas"><li><a href="index.html">Início</a></li><li><a href="agenda.html">Agenda</a></li></ol></nav>' +
      '<h1>Atividade não encontrada</h1><p class="intro">Confira o endereço ou veja todas as atividades na agenda.</p>' +
      '<div class="botoes"><a class="botao botao-vermelho" href="agenda.html">Ver a agenda</a></div></div></section>';
  }

  SM.carregar(['agenda', 'entregas']).then(function (d) {
    SM.agenda = d.agenda || [];
    var it = SM.agenda.filter(function (x) { return x.id === id; })[0];
    if (!it) { naoEncontrada(); return; }

    var fase = SM.FASES[it.fase] ? it.fase : 'memoria';
    var F = SM.FASES[fase];
    var s = SM.situacao(it.inicio, it.fim);
    document.body.setAttribute('data-eixo', fase);
    document.title = it.titulo + ' | São Miguel 150+';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && it.texto) meta.setAttribute('content', it.texto);

    var selo = s === 'agora' ? '<span class="status-chip agora">' + (it.participar ? 'Aberto agora' : 'Acontecendo') + '</span>'
      : s === 'depois' ? '<span class="status-chip concluida">Encerrado</span>' : '<span class="status-chip">Começa em ' + esc(SM.mes(it.inicio)) + '</span>';
    var botao = SM.botaoItem(it, false);
    if (botao) botao = botao.replace('botao-eixo', 'botao-branco').replace('botao-contorno', 'botao-contorno-claro');

    var gera = (d.entregas || []).filter(function (e) { return e.atividade === id; });
    var perguntas = (it.perguntas || []).filter(Boolean);

    main.innerHTML =
      '<section class="atividade-topo" aria-labelledby="atividade-titulo"><div class="recipiente atividade-topo-grade"><div>' +
      '<nav aria-label="Você está em"><ol class="migalhas"><li><a href="index.html">Início</a></li><li><a href="agenda.html">Agenda</a></li></ol></nav>' +
      '<p class="atividade-fase">' + esc(F.nome) + ': ' + esc(F.subtitulo) + '</p>' +
      '<h1 id="atividade-titulo">' + esc(it.titulo) + '</h1>' +
      '<p class="atividade-quando">' + selo + '<span>' + esc(SM.cap(SM.periodo(it.inicio, it.fim))) + '</span></p>' +
      (botao ? '<div class="botoes">' + botao + '</div>' : '') +
      '</div>' + (it.imagem ? '<img src="' + esc(SM.url(it.imagem)) + '" alt="">' : '') + '</div></section>' +

      '<section class="atividade-corpo"><div class="recipiente atividade-corpo-grade"><div>' +
      '<p class="atividade-texto">' + esc(it.detalhes || it.texto || '') + '</p>' +
      (it.local ? '<p class="atividade-local">' + SM.ICONE_LOCAL + esc(it.local) + '</p>' : '') +
      (perguntas.length ? '<div class="atividade-perguntas"><h2>' + (perguntas.length > 1 ? 'As perguntas' : 'A pergunta') + '</h2>' +
        (perguntas.length > 1 ? '<ol>' : '<ul>') + perguntas.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + (perguntas.length > 1 ? '</ol>' : '</ul>') + '</div>' : '') +
      '<p class="atividade-voltar"><a class="link-forte" href="agenda.html">Ver toda a agenda</a></p>' +
      '</div>' +
      (gera.length ? '<aside class="atividade-lado"><h2>O que fica para a cidade</h2><ul>' + gera.map(function (e) {
        var link = e.link ? SM.url(e.link) : '';
        var prev = e.status === 'entregue' ? 'entregue' : e.status === 'construcao' ? 'em construção' : (e.previsao ? 'previsão ' + e.previsao : 'prevista');
        return '<li>' + (link ? '<a href="' + esc(link) + '">' + esc(e.nome) + '</a>' : '<span>' + esc(e.nome) + '</span>') + '<small>' + esc(prev) + '</small></li>';
      }).join('') + '</ul><p style="margin-top:1rem"><a class="link-forte" href="entregas.html">Todas as entregas</a></p></aside>' : '') +
      '</div></section>';
    SM.externos();
  });
})();
