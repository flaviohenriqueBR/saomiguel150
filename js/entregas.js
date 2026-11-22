/* São Miguel 150+ | entregas */
(function () {
  'use strict';
  var SM = window.SM;
  var esc = SM.esc;
  var ORDEM_STATUS = { entregue: 0, construcao: 1, prevista: 2 };
  var filtro = 'todas';
  var entregas = [];

  function status(e) { return ORDEM_STATUS[e.status] != null ? e.status : 'prevista'; }

  function cartao(e) {
    var fase = SM.FASES[e.fase] ? e.fase : 'geral';
    var link = e.link ? SM.url(e.link) : '';
    var visual = e.imagem
      ? '<img src="' + esc(SM.url(e.imagem)) + '" alt="" loading="lazy" style="object-position:' + esc(e.posicaoImagem || 'center') + '">'
      : '<span class="entrega-marca" aria-hidden="true">150+</span>';
    return '<article class="entrega entrega-' + status(e) + (link ? ' com-link' : '') + '" data-eixo="' + fase + '">' +
      '<div class="entrega-img' + (e.imagem ? '' : ' entrega-sem-img') + '">' + visual + SM.chipEntrega(e) + '</div>' +
      '<div class="entrega-corpo">' +
      (SM.FASES[fase] ? '<p class="entrega-eixo">' + esc(SM.FASES[fase].nome) + '</p>' : '') +
      '<h2 class="entrega-nome">' + (link ? '<a class="entrega-link" href="' + esc(link) + '">' + esc(e.nome) + '</a>' : esc(e.nome)) + '</h2>' +
      (e.descricao ? '<p class="entrega-desc">' + esc(e.descricao) + '</p>' : '') +
      (link ? '<span class="entrega-abrir" aria-hidden="true">Abrir</span>' : '') +
      '</div></article>';
  }

  function render() {
    var lista = entregas.map(function (e, i) { return { e: e, i: i }; })
      .filter(function (x) { return filtro === 'todas' || x.e.fase === filtro; })
      .sort(function (a, b) {
        return (ORDEM_STATUS[status(a.e)] - ORDEM_STATUS[status(b.e)]) ||
          (SM.ORDEM.indexOf(a.e.fase) - SM.ORDEM.indexOf(b.e.fase)) || (a.i - b.i);
      });
    document.querySelector('[data-entregas]').innerHTML = lista.map(function (x) { return cartao(x.e); }).join('') ||
      '<p class="ag-vazio">Nenhuma entrega nesta fase ainda.</p>';
    /* Resumo discreto, numa linha: "1 entregue, 1 em construção e 12 previstas" */
    var conta = { entregue: 0, construcao: 0, prevista: 0 };
    lista.forEach(function (x) { conta[status(x.e)]++; });
    var partes = [];
    if (conta.entregue) partes.push('<strong>' + conta.entregue + '</strong> ' + (conta.entregue === 1 ? 'entregue' : 'entregues'));
    if (conta.construcao) partes.push('<strong>' + conta.construcao + '</strong> em construção');
    if (conta.prevista) partes.push('<strong>' + conta.prevista + '</strong> ' + (conta.prevista === 1 ? 'prevista' : 'previstas'));
    var texto = partes.length > 1 ? partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1] : partes.join('');
    document.querySelector('[data-resumo]').innerHTML = texto;
    document.querySelectorAll('[data-filtro]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-filtro') === filtro ? 'true' : 'false');
    });
    SM.externos();
  }

  SM.carregar(['entregas']).then(function (d) {
    entregas = d.entregas || [];
    var h = new URLSearchParams(location.hash.replace(/^#/, '')).get('fase');
    if (SM.FASES[h]) filtro = h;
    var filtros = document.querySelector('[data-filtros]');
    filtros.innerHTML = '<button type="button" data-filtro="todas">Todas</button>' + SM.ORDEM.map(function (k) {
      return '<button type="button" data-filtro="' + k + '">' + esc(SM.FASES[k].nome) + '</button>';
    }).join('');
    filtros.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-filtro]');
      if (!b) return;
      filtro = b.getAttribute('data-filtro');
      try { history.replaceState(null, '', filtro === 'todas' ? location.pathname : '#fase=' + filtro); } catch (e) { /* ok */ }
      render();
    });
    render();
  });
})();
