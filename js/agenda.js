/* São Miguel 150+ | agenda em linhas, por mês */
(function () {
  'use strict';
  var SM = window.SM;
  var esc = SM.esc;

  function grupo(titulo, itens, classe) {
    return '<div class="agenda-grupo"><h2 class="agenda-mes' + (classe ? ' ' + classe : '') + '">' + esc(titulo) + '</h2>' +
      '<ul class="agenda-lista">' + itens.map(function (it) { return SM.linhaAgenda(it); }).join('') + '</ul></div>';
  }

  function porMes(itens) {
    var grupos = [], atual = null;
    itens.forEach(function (it) {
      var p = SM.partes(it.inicio);
      var chave = p.a + '-' + p.m;
      if (!atual || atual.chave !== chave) { atual = { chave: chave, titulo: SM.cap(SM.mesLongo(it.inicio)), itens: [] }; grupos.push(atual); }
      atual.itens.push(it);
    });
    return grupos;
  }

  SM.carregar(['agenda']).then(function (d) {
    SM.agenda = d.agenda || [];
    var todos = SM.ordenarAgenda(d.agenda);
    var agora = todos.filter(function (it) { return SM.situacao(it.inicio, it.fim) === 'agora'; });
    var futuros = todos.filter(function (it) { return SM.situacao(it.inicio, it.fim) === 'antes'; });
    var passados = todos.filter(function (it) { return SM.situacao(it.inicio, it.fim) === 'depois'; });

    document.querySelector('[data-legenda]').innerHTML = SM.ORDEM.map(function (k) {
      return '<span data-eixo="' + k + '"><i aria-hidden="true"></i>' + esc(SM.FASES[k].nome) + '</span>';
    }).join('');

    var caixa = document.querySelector('[data-agenda]');
    caixa.classList.remove('carregando');
    var html = '';
    if (agora.length) html += grupo('Acontecendo agora', agora, 'agora');
    porMes(futuros).forEach(function (g) { html += grupo(g.titulo, g.itens); });
    caixa.innerHTML = html || '<p class="ag-vazio">Novas datas serão divulgadas em breve.</p>';

    if (passados.length) {
      var area = document.querySelector('[data-passados-area]');
      var botao = document.querySelector('[data-passados]');
      var lista = document.querySelector('[data-agenda-passados]');
      var rotulo = function (aberto) { return (aberto ? 'Esconder' : 'Ver') + ' o que já aconteceu (' + passados.length + ')'; };
      botao.textContent = rotulo(false);
      lista.innerHTML = porMes(passados).map(function (g) { return grupo(g.titulo, g.itens); }).join('');
      area.hidden = false;
      botao.addEventListener('click', function () {
        var abrir = lista.hidden;
        lista.hidden = !abrir;
        botao.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        botao.textContent = rotulo(abrir);
      });
    }
    SM.externos();
  });
})();
