/* =====================================================================
   SÃO MIGUEL 150+  |  APP /memoria (QR Code nas mesas)
   Conteúdo editável no painel: "App /memoria (mesas)" e, para a galeria,
   as lembranças do Acervo marcadas com "Mostrar no app /memoria".
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = SM.esc;
  var CFG = {}, INICIO = {}, PERGUNTAS = [], LUGARES = [], LEMBRANCAS = [];

  /* De onde a pessoa veio: link com ?de=Nome (opcional, ex.: um QR por restaurante) */
  var DE = '';
  try { DE = (new URLSearchParams(location.search).get('de') || '').trim().slice(0, 60); } catch (e) { /* ignora */ }
  function comOrigem(m) { return DE ? m + '\n\n(Vim pelo QR Code: ' + DE + ')' : m; }
  function whats(m) { return SM.whats(comOrigem(m)); }
  function mensagemGeral() { return INICIO.mensagem || 'Oi! Quero compartilhar uma lembrança de São Miguel para o São Miguel 150+.'; }

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function segmentos(alvo, total, feitos) {
    var h = '';
    for (var i = 0; i < total; i++) h += '<span' + (i < feitos ? ' class="feito"' : '') + '></span>';
    alvo.innerHTML = h;
  }
  /* Tira as marcações antigas do acervo: {palavra} e {texto|chave} */
  function limpar(t) { return String(t || '').replace(/\{([^}|]+)\|[^}]*\}/g, '$1').replace(/\{([^}]+)\}/g, '$1'); }
  function trecho(t, n) {
    t = limpar(t).replace(/\s+/g, ' ').trim();
    if (t.length <= n) return t;
    return t.slice(0, n).replace(/\s+\S*$/, '') + '…';
  }
  function guardar(chave, valor) { try { sessionStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* ignora */ } }
  function ler(chave) { try { return JSON.parse(sessionStorage.getItem(chave) || 'null'); } catch (e) { return null; } }

  /* ================= FICHA "QUEM É VOCÊ" (início e bate-bola) ================= */
  var ICONE_ESCREVER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
  function camposQuem() {
    return '<label class="campo"><span>Seu nome</span><input name="nome" autocomplete="name" enterkeyhint="next" placeholder="Ex.: Maria das Graças"></label>' +
      '<p class="erro" data-erro-nome hidden>Escreva seu nome para enviar.</p>' +
      '<fieldset class="campo"><legend>Você mora em São Miguel hoje?</legend>' +
        '<div class="escolhas">' +
          '<label><input type="radio" name="mora" value="sim"><span>Sim</span></label>' +
          '<label><input type="radio" name="mora" value="nao"><span>Não</span></label>' +
        '</div></fieldset>' +
      '<label class="campo" data-onde hidden><span>Onde você mora?</span><input name="onde" autocomplete="address-level2" enterkeyhint="done" placeholder="Ex.: Natal (RN)"></label>';
  }
  var FICHAS = [];
  function lerQuem(form) {
    return {
      nome: form.nome.value.trim(), onde: form.onde.value.trim(),
      mora: (form.querySelector('input[name="mora"]:checked') || {}).value || ''
    };
  }
  function preencherQuem(form) {
    var q = ler('sm150-quem') || {};
    if (document.activeElement && form.contains(document.activeElement)) return;
    form.nome.value = q.nome || '';
    form.onde.value = q.onde || '';
    $$('input[name="mora"]', form).forEach(function (r) { r.checked = r.value === q.mora; });
    $('[data-onde]', form).hidden = q.mora !== 'nao';
  }
  function linhasQuem(q) {
    return '*Nome:* ' + q.nome +
      (q.mora === 'sim' ? '\n*Mora em São Miguel:* sim' : q.mora === 'nao' ? '\n*Mora em São Miguel:* não' + (q.onde ? ', moro em ' + q.onde : '') : '');
  }
  function abrirWhats(msg, envio) {
    var url = whats(msg);
    /* marca o envio para agradecer quando a pessoa voltar do WhatsApp */
    if (envio) guardar('sm150-enviou', { nome: envio.nome, tipo: envio.tipo, url: url, t: Date.now() });
    var janela = window.open(url, '_blank');
    if (!janela) location.href = url;
  }

  /* ================= OBRIGADO (ao voltar do WhatsApp) ================= */
  var visorObrigado;
  function checarObrigado() {
    var f = ler('sm150-enviou');
    if (!f || document.hidden || Date.now() - f.t < 1200) return;
    try { sessionStorage.removeItem('sm150-enviou'); } catch (e) { /* ignora */ }
    if (f.tipo === 'lembranca') {
      var form = $('[data-form-lembranca]');
      form.lembranca.value = ''; guardar('sm150-lembranca', '');
    }
    if (!visorObrigado) {
      visorObrigado = document.createElement('dialog');
      visorObrigado.className = 'obrigado';
      document.body.appendChild(visorObrigado);
      visorObrigado.addEventListener('click', function (e) {
        if (e.target === visorObrigado || e.target.closest('[data-fechar]') || e.target.closest('a')) visorObrigado.close();
        var tentar = e.target.closest('[data-tentar]');
        if (tentar) location.href = tentar.getAttribute('data-tentar');
      });
    }
    var primeiro = String(f.nome || '').split(/\s+/)[0];
    visorObrigado.innerHTML =
      '<button class="obrigado-fechar" type="button" data-fechar aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<p class="obrigado-selo" aria-hidden="true">150+</p>' +
      '<h2>Valeu' + (primeiro ? ', ' + esc(primeiro) : '') + '!</h2>' +
      '<p>Sua lembrança vai ajudar a contar a história de São Miguel.</p>' +
      '<div class="fim-acoes">' +
        '<a class="botao botao-vermelho" href="#onde-e">Jogar enquanto a comida chega</a>' +
        '<a class="botao botao-leve" href="#enviar">Contar outra lembrança</a>' +
        '<button class="link-simples" type="button" data-tentar="' + esc(f.url) + '">O WhatsApp não abriu? Tentar de novo</button>' +
      '</div>';
    if (typeof visorObrigado.showModal === 'function') visorObrigado.showModal(); else visorObrigado.setAttribute('open', '');
    setTimeout(function () { confete(innerWidth / 2, innerHeight * 0.35, 110); }, 120);
  }
  document.addEventListener('visibilitychange', function () { setTimeout(checarObrigado, 300); });
  window.addEventListener('focus', function () { setTimeout(checarObrigado, 300); });
  window.addEventListener('pageshow', function () { setTimeout(checarObrigado, 300); });
  /* liga uma ficha: guarda o que a pessoa digita (vale para as duas fichas) e envia */
  function ligarFicha(form, montarMensagem, tipo) {
    FICHAS.push(form);
    preencherQuem(form);
    var mostrarOnde = function () { $('[data-onde]', form).hidden = lerQuem(form).mora !== 'nao'; };
    form.addEventListener('input', function (e) {
      if (e.target.name === 'nome') $('[data-erro-nome]', form).hidden = true;
      if (e.target.name === 'nome' || e.target.name === 'onde' || e.target.name === 'mora') guardar('sm150-quem', lerQuem(form));
      mostrarOnde();
    });
    form.addEventListener('change', mostrarOnde);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = lerQuem(form);
      if (!q.nome) { $('[data-erro-nome]', form).hidden = false; form.nome.focus(); return; }
      guardar('sm150-quem', q);
      abrirWhats(montarMensagem(q), { nome: q.nome, tipo: tipo });
    });
  }
  /* botões das outras telas levam ao formulário do início */
  function botaoEscrever(texto, comeco) {
    return '<a class="botao botao-vermelho" href="#enviar' + (comeco ? '/' + encodeURIComponent(comeco) : '') + '">' + ICONE_ESCREVER + esc(texto) + '</a>';
  }

  /* ================= FORMULÁRIO DA LEMBRANÇA (início) ================= */
  function montarFormulario() {
    var form = $('[data-form-lembranca]');
    $('[data-quem]', form).outerHTML = camposQuem();
    var texto = form.lembranca;
    texto.value = ler('sm150-lembranca') || '';
    if (texto.value.trim()) abrirQuem();
    texto.addEventListener('input', function () {
      guardar('sm150-lembranca', texto.value);
      if (texto.value.trim()) abrirQuem();
    });
    /* nome e cidade só aparecem depois que a pessoa começa a escrever (ou toca em enviar) */
    form.addEventListener('submit', function (e) {
      if ($('[data-quem-extra]').classList.contains('aberto')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      abrirQuem();
      setTimeout(function () { (texto.value.trim() ? form.nome : texto).focus(); }, 280);
    }, true);
    ligarFicha(form, function (q) {
      var t = texto.value.trim();
      return mensagemGeral() + '\n\n' + linhasQuem(q) + '\n\n*Minha lembrança:*\n' + (t || 'Vou mandar em áudio ou foto a seguir.');
    }, 'lembranca');
    $('[data-direto]').href = whats(mensagemGeral());
  }
  function abrirQuem() { $('[data-quem-extra]').classList.add('aberto'); }
  function irParaFormulario(comeco) {
    var form = $('[data-form-lembranca]'), texto = form.lembranca;
    if (comeco && !texto.value.trim()) { texto.value = comeco; guardar('sm150-lembranca', texto.value); }
    if (texto.value.trim()) abrirQuem();
    setTimeout(function () {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () {
        try { texto.focus({ preventScroll: true }); texto.setSelectionRange(texto.value.length, texto.value.length); } catch (e) { /* ignora */ }
      }, 450);
    }, 60);
  }

  /* ================= INÍCIO ================= */
  function montarInicio() {
    if (INICIO.rotulo) $('[data-rotulo]').textContent = INICIO.rotulo;
    if (INICIO.titulo) $('[data-titulo]').textContent = INICIO.titulo;
    if (INICIO.botao) $('[data-botao]').textContent = INICIO.botao;
    if (INICIO.nota) $('[data-nota]').textContent = INICIO.nota;
    if (INICIO.orientacao) $('[data-orienta]').textContent = INICIO.orientacao;
    if (INICIO.imagem) $('[data-capa-foto]').src = SM.url(INICIO.imagem);
    $$('[data-icone-whats]').forEach(function (s) { s.outerHTML = SM.ICONE_WHATS; });
    $$('[data-enviar]').forEach(function (a) { a.href = '#enviar'; });
    montarApoio();
  }

  /* Apoiadores: os mesmos de Configurações do site > Parceiros */
  function montarApoio() {
    var lista = ((SM.site || {}).parceiros || []).filter(function (p) { return p && (p.nome || p.logo); });
    if (!lista.length) return;
    $('[data-apoio]').hidden = false;
    $('[data-apoiadores]').innerHTML = lista.map(function (p) {
      var dentro = p.logo ? '<img src="' + esc(SM.url(p.logo)) + '" alt="' + esc(p.nome || '') + '" loading="lazy">' : '<span>' + esc(p.nome) + '</span>';
      return '<li>' + (p.link ? '<a href="' + esc(p.link) + '">' + dentro + '</a>' : dentro) + '</li>';
    }).join('');
  }

  /* ================= LEMBRANÇÔMETRO ================= */
  function montarMetro() {
    var m = CFG.lembrancometro || {};
    var n = Math.max(0, Math.round(Number(m.numero) || 0)), meta = Math.max(1, Math.round(Number(m.meta) || 150));
    if (!n) return;
    var caixa = $('[data-metro]'), alvo = $('[data-metro-numero]'), barra = $('[data-metro-barra]');
    caixa.hidden = false;
    if (m.texto) $('[data-metro-texto]').textContent = m.texto;
    var falta = meta - n;
    $('[data-metro-meta]').textContent = falta > 0
      ? 'Faltam ' + falta + ' para chegar às ' + meta + '. Mande a sua!'
      : 'Passamos das ' + meta + '! Continue mandando a sua.';
    barra.setAttribute('aria-valuemax', meta);
    barra.setAttribute('aria-valuenow', Math.min(n, meta));
    barra.setAttribute('aria-label', n + ' de ' + meta + ' lembranças');
    var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var formata = function (v) { return v.toLocaleString('pt-BR'); };
    if (calmo) { alvo.textContent = formata(n); $('[data-metro-enchimento]').style.width = Math.min(100, n / meta * 100) + '%'; return; }
    alvo.textContent = '0';
    setTimeout(function () {
      $('[data-metro-enchimento]').style.width = Math.min(100, n / meta * 100) + '%';
      var t0 = null, dur = 1100;
      (function passo(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        alvo.textContent = formata(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(passo);
      })(performance.now());
    }, 350);
  }

  /* ================= BATE-BOLA ================= */
  /* Uma pergunta por vez, sorteada do banco (painel). A pessoa responde e já vê
     o que outras pessoas responderam; ou pula. As respostas ficam guardadas no
     site, sem nome. */
  var bb = { atual: '', respondida: false, vistas: 0, carregando: false };

  /* código fixo de cada pergunta, tirado do texto (mudar o texto cria uma pergunta nova) */
  function idPergunta(t) {
    var s = SM.norm(t).replace(/[^a-z0-9]+/g, ' ').trim(), h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return 'q' + ('000000' + h.toString(36)).slice(-7);
  }
  /* baralho: passa por todas as perguntas antes de repetir */
  function tirarPergunta() {
    var fila = (ler('sm150-baralho') || []).filter(function (q) { return PERGUNTAS.indexOf(q) >= 0 && q !== bb.atual; });
    if (!fila.length) fila = embaralhar(PERGUNTAS.filter(function (q) { return q !== bb.atual; }));
    if (!fila.length) fila = PERGUNTAS.slice();
    var q = fila.shift();
    guardar('sm150-baralho', fila);
    return q;
  }
  function botoesBB() {
    $('[data-bb-pular]').hidden = bb.respondida;
    $('[data-bb-responder]').hidden = bb.respondida;
    $('[data-bb-proxima]').hidden = !bb.respondida;
  }
  function novaPerguntaBB() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    bb.atual = tirarPergunta();
    bb.respondida = false;
    bb.vistas++;
    $('[data-bb]').innerHTML =
      '<div class="cartao cartao-unico cor-' + (bb.vistas % 5) + ' virando">' +
        '<h2 class="cartao-pergunta" id="bb-pergunta">' + esc(bb.atual) + '</h2>' +
        '<div data-bb-campo>' +
          '<textarea data-bb-texto maxlength="300" aria-labelledby="bb-pergunta" placeholder="Sua resposta…"></textarea>' +
          '<p class="erro" data-bb-erro hidden>Escreva uma resposta ou toque em Pular.</p>' +
          '<p class="cartao-dica">Sua resposta aparece, sem nome, para quem jogar depois.</p>' +
        '</div>' +
      '</div>' +
      '<div class="bb-respostas" data-bb-respostas hidden></div>';
    $('[data-bb-conta]').textContent = 'Pergunta ' + bb.vistas;
    botoesBB();
    window.scrollTo(0, 0);
  }
  function responderBB() {
    if (bb.carregando) return;
    var campo = $('[data-bb-texto]'), texto = campo.value.replace(/\s+/g, ' ').trim();
    if (texto.length < 2) { $('[data-bb-erro]').hidden = false; campo.focus(); return; }
    campo.blur();
    bb.carregando = true;
    var q = bb.atual, id = idPergunta(q);
    $('[data-bb-campo]').innerHTML = '<p class="bolha bolha-minha"><small>Você</small>' + esc(texto) + '</p>';
    bb.respondida = true;
    botoesBB();
    var caixa = $('[data-bb-respostas]');
    caixa.hidden = false;
    caixa.innerHTML = '<p class="bb-carregando">Carregando o que outras pessoas responderam…</p>';
    fetch('api/batebola', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respostas: [{ q: id, pergunta: q, texto: texto }] })
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (salvo) {
        var meus = salvo && salvo.guardadas ? salvo.guardadas.map(function (g) { return g.id; }) : [];
        return fetch('api/batebola?q=' + id, { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
          .then(function (dados) { mostrarOutrasBB(dados && dados[id], meus, q); });
      })
      .then(function () { bb.carregando = false; });
  }
  function mostrarOutrasBB(info, meus, q) {
    if (q !== bb.atual) return;
    var caixa = $('[data-bb-respostas]');
    var h = '<h3>O que outras pessoas responderam</h3>';
    if (!info) {
      h += '<p class="bb-vazio">Não deu para carregar as respostas agora.</p>';
    } else {
      /* no máximo 10 respostas, as mais recentes */
      var outras = info.respostas.filter(function (r) { return meus.indexOf(r.id) < 0; }).slice(0, 10);
      if (!outras.length) h += '<p class="bb-vazio">Você foi uma das primeiras pessoas a responder!</p>';
      h += outras.map(function (r, k) {
        return '<p class="bolha cor-' + (k % 5) + '">' + esc(r.t) + '</p>';
      }).join('');
    }
    h += '<a class="bb-lembranca" href="#enviar">Essa conversa puxou uma história? <b>Conte sua lembrança</b></a>';
    caixa.innerHTML = h;
    setTimeout(function () { caixa.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }
  function montarBateBola() {
    $('[data-bb-pular]').addEventListener('click', novaPerguntaBB);
    $('[data-bb-proxima]').addEventListener('click', novaPerguntaBB);
    $('[data-bb-responder]').addEventListener('click', responderBB);
    $('[data-bb]').addEventListener('input', function (e) {
      if (e.target.hasAttribute('data-bb-texto')) $('[data-bb-erro]').hidden = true;
    });
  }
  function abrirBateBola() {
    if (!PERGUNTAS.length) {
      $('[data-bb]').innerHTML = '<p class="vazio">As perguntas aparecem aqui em breve.</p>';
      $('[data-bb-acoes]').hidden = true;
      return;
    }
    novaPerguntaBB();
  }

  /* ================= VOCÊ SABE ONDE É? ================= */
  var oe = { rodadas: [], i: 0, acertos: 0 };
  var ICONE_CERTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICONE_ERRADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function novoJogo() {
    var validos = LUGARES.filter(function (l) { return l && l.foto && l.lugar; });
    oe.rodadas = embaralhar(validos).slice(0, 5);
    oe.i = 0; oe.acertos = 0;
    if (!oe.rodadas.length) {
      $('[data-oe-jogo]').innerHTML = '<p class="vazio">O jogo aparece aqui em breve.</p>';
      $('[data-oe-conta]').textContent = '';
      $('[data-oe-progresso]').innerHTML = '';
      return;
    }
    mostrarRodada();
  }
  function mostrarRodada() {
    var r = oe.rodadas[oe.i], n = oe.rodadas.length;
    var opcoes = embaralhar([r.lugar].concat((r.outras || []).filter(function (o) { return String(o || '').trim(); }).slice(0, 2)));
    $('[data-oe-conta]').textContent = (oe.i + 1) + ' de ' + n;
    segmentos($('[data-oe-progresso]'), n, oe.i);
    $('[data-oe-jogo]').innerHTML =
      '<div class="jogo-foto"><img src="' + esc(SM.url(r.foto)) + '" alt="Foto de um lugar de São Miguel"></div>' +
      '<h2 class="jogo-pergunta">Você sabe onde é?</h2>' +
      '<div class="opcoes" data-opcoes>' + opcoes.map(function (o) {
        return '<button class="opcao" type="button" data-opcao="' + esc(o) + '"><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>' +
      '<div data-retorno></div>';
    var prox = oe.rodadas[oe.i + 1];
    if (prox) { var img = new Image(); img.src = SM.url(prox.foto); }
    window.scrollTo(0, 0);
  }
  function responder(botao) {
    var caixa = $('[data-opcoes]');
    if (caixa.classList.contains('respondido')) return;
    caixa.classList.add('respondido');
    var r = oe.rodadas[oe.i], escolha = botao.getAttribute('data-opcao'), acertou = escolha === r.lugar;
    if (acertou) {
      oe.acertos++;
      var r0 = botao.getBoundingClientRect();
      confete(r0.left + r0.width / 2, r0.top + r0.height / 2, 46);
    }
    $$('.opcao', caixa).forEach(function (b) {
      var o = b.getAttribute('data-opcao');
      b.setAttribute('aria-disabled', 'true');
      if (o === r.lugar) { b.classList.add('certa'); b.insertAdjacentHTML('beforeend', ICONE_CERTO); }
      else if (b === botao) { b.classList.add('errada'); b.insertAdjacentHTML('beforeend', ICONE_ERRADO); }
      else b.classList.add('apagada');
    });
    segmentos($('[data-oe-progresso]'), oe.rodadas.length, oe.i + 1);
    var ultima = oe.i === oe.rodadas.length - 1;
    var ret = $('[data-retorno]');
    ret.innerHTML = '<div class="retorno" role="status"><strong>' + (acertou ? 'Acertou!' : 'Quase! É ' + esc(r.lugar) + '.') + '</strong>' +
      (r.curiosidade ? '<p>' + esc(r.curiosidade) + '</p>' : '') + '</div>' +
      '<div class="fim-acoes" style="margin-top:1rem"><button class="botao botao-escuro" type="button" data-oe-seguir>' + (ultima ? 'Ver meu resultado' : 'Próximo lugar') + '</button></div>';
    setTimeout(function () { ret.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
  }
  function resultado() {
    var n = oe.rodadas.length, a = oe.acertos;
    var frase = a === n ? 'Você conhece cada canto de São Miguel!' :
      a >= Math.ceil(n * 0.6) ? 'Muito bem! Você conhece a cidade.' :
      a > 0 ? 'Boa! Cada lugar guarda uma história.' : 'Que tal descobrir esses lugares de perto?';
    $('[data-oe-conta]').textContent = 'Fim';
    segmentos($('[data-oe-progresso]'), n, n);
    $('[data-oe-jogo]').innerHTML = '<div class="resultado">' +
      '<div class="placar" role="img" aria-label="Você acertou ' + a + ' de ' + n + '"><b>' + a + '</b><span>de ' + n + ' lugares</span></div>' +
      '<h2>' + frase + '</h2>' +
      '<p>Algum desses lugares guarda uma lembrança sua? Toque nele e conte pra gente.</p>' +
      '<div class="lugares-lembrar">' + oe.rodadas.map(function (r) {
        return '<a class="lugar-lembrar" href="#enviar/' + encodeURIComponent(r.lugar + ': ') + '">' +
          '<img src="' + esc(SM.url(r.foto)) + '" alt="" loading="lazy"><span>' + ICONE_ESCREVER + esc(r.lugar) + '</span></a>';
      }).join('') + '</div>' +
      '<div class="fim-acoes">' + botaoEscrever('Escrever minha lembrança') +
      '<button class="botao botao-escuro" type="button" data-oe-desafiar><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l4-4 4 4M12 3v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>Desafiar alguém</button>' +
      '<button class="botao botao-leve" type="button" data-oe-denovo>Jogar de novo</button>' +
      '<a class="link-simples" href="#">Voltar ao início</a></div></div>';
    SM.externos($('[data-oe-jogo]'));
    window.scrollTo(0, 0);
    if (a > 0) setTimeout(function () { confete(innerWidth / 2, innerHeight * 0.28, a === n ? 160 : 90); }, 250);
  }
  /* Desafiar: manda o placar com o link do jogo (compartilhar do celular ou WhatsApp) */
  function linkApp() {
    var e = String(((SM.site || {}).contato || {}).endereco || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return (e ? 'https://' + e : location.origin) + '/memoria#onde-e';
  }
  function desafiar() {
    var n = oe.rodadas.length, a = oe.acertos;
    var texto = 'Acertei ' + a + ' de ' + n + ' lugares de São Miguel no jogo "Você sabe onde é?" do São Miguel 150+. Duvido você!';
    var url = linkApp();
    if (navigator.share) {
      navigator.share({ text: texto, url: url }).catch(function () { /* cancelou */ });
      return;
    }
    var w = window.open('https://wa.me/?text=' + encodeURIComponent(texto + ' ' + url), '_blank');
    if (!w) location.href = 'https://wa.me/?text=' + encodeURIComponent(texto + ' ' + url);
  }

  function montarOndeE() {
    $('[data-oe-jogo]').addEventListener('click', function (e) {
      var op = e.target.closest('[data-opcao]');
      if (op) return responder(op);
      if (e.target.closest('[data-oe-seguir]')) {
        if (oe.i < oe.rodadas.length - 1) { oe.i++; mostrarRodada(); } else resultado();
        return;
      }
      if (e.target.closest('[data-oe-denovo]')) novoJogo();
      if (e.target.closest('[data-oe-desafiar]')) desafiar();
    });
  }

  /* ================= CONFETE ================= */
  var CORES_CONFETE = ['#B02E26', '#F38B08', '#7CC7E4', '#125F55', '#EC9F9A', '#C98A2B'];
  function confete(x, y, qtd) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.className = 'confete'; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    var ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    var ps = [];
    for (var i = 0; i < qtd; i++) {
      var ang = Math.random() * Math.PI * 2, vel = 4 + Math.random() * 7;
      ps.push({ x: x, y: y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 5, r: Math.random() * 6.28,
        vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
        cor: CORES_CONFETE[i % CORES_CONFETE.length] });
    }
    var t0 = performance.now();
    (function quadro(t) {
      var dt = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(function (p) {
        p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - dt / 1700);
        ctx.fillStyle = p.cor; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (dt < 1700) requestAnimationFrame(quadro); else c.remove();
    })(t0);
  }

  /* ================= OUTRAS LEMBRANÇAS ================= */
  var gal = { tema: '' };
  function idDe(l, i) { return String(l.id || ('n' + i)); }
  function iniciais(nome) {
    var p = String(nome || '').trim().split(/\s+/);
    return ((p[0] || '').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase() || '?';
  }
  function montarTemas() {
    var vistos = {}, temas = [];
    LEMBRANCAS.forEach(function (l) {
      var t = String(l.tema || '').trim();
      if (t && !vistos[SM.norm(t)]) { vistos[SM.norm(t)] = 1; temas.push(t); }
    });
    var caixa = $('[data-temas]');
    if (temas.length < 2) { caixa.hidden = true; return; }
    temas.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
    caixa.innerHTML = ['<button class="tema" type="button" data-tema="" aria-pressed="true">Todas</button>'].concat(temas.map(function (t) {
      return '<button class="tema" type="button" data-tema="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>';
    })).join('');
    caixa.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tema]');
      if (!b) return;
      gal.tema = b.getAttribute('data-tema');
      $$('[data-tema]', caixa).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      montarGaleria();
    });
  }
  function filtradas() {
    if (!gal.tema) return LEMBRANCAS;
    return LEMBRANCAS.filter(function (l) { return SM.norm(l.tema || '') === SM.norm(gal.tema); });
  }
  function montarGaleria() {
    var lista = filtradas(), caixa = $('[data-galeria]');
    if (!lista.length) {
      caixa.innerHTML = '<p class="vazio" style="column-span:all">As lembranças aparecem aqui em breve. Que tal mandar a primeira?</p>';
      return;
    }
    caixa.innerHTML = lista.map(function (l, i) {
      var quem = l.autor ? '<span class="card-quem">' + esc(l.autor) + '</span>' : '';
      var tema = l.tema ? '<span class="card-tema">' + esc(l.tema) + '</span>' : '';
      var href = '#lembranca/' + encodeURIComponent(l._id);
      if (l.foto) {
        return '<a class="card" href="' + href + '"><img src="' + esc(SM.url(l.foto)) + '" alt="" loading="lazy">' +
          '<span class="card-corpo"><span class="card-titulo">' + esc(trecho(l.legenda || l.relato, 80)) + '</span>' + quem + tema + '</span></a>';
      }
      return '<a class="card cor-' + (i % 5) + '" href="' + href + '"><span class="card-corpo">' +
        '<span class="card-citacao">' + esc(trecho(l.relato, 120)) + '</span>' + quem + tema + '</span></a>';
    }).join('');
  }
  /* Faixa de inspiração na tela inicial: as lembranças mais novas */
  function montarInspira() {
    if (!LEMBRANCAS.length) return;
    var poucas = LEMBRANCAS.slice(0, 6);
    $('[data-inspira-trilho]').innerHTML = poucas.map(function (l, i) {
      var href = '#lembranca/' + encodeURIComponent(l._id);
      var quem = l.autor ? '<span class="mini-quem">' + esc(l.autor.split(' ')[0]) + '</span>' : '';
      if (l.foto) {
        return '<a class="mini" href="' + href + '"><img src="' + esc(SM.url(l.foto)) + '" alt="" loading="lazy">' +
          '<span class="mini-corpo"><span class="mini-texto">' + esc(trecho(l.legenda || l.relato, 60)) + '</span>' + quem + '</span></a>';
      }
      return '<a class="mini mini-papel cor-' + (i % 5) + '" href="' + href + '"><span class="mini-corpo">' +
        '<span class="mini-texto">“' + esc(trecho(l.relato, 70)) + '”</span>' + quem + '</span></a>';
    }).join('') + '<a class="mini mini-todas" href="#lembrancas"><span>Ver todas as lembranças</span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
    $('[data-inspira]').hidden = false;
  }

  function abrirLembranca(id) {
    var lista = filtradas(), pos = -1;
    lista.forEach(function (l, i) { if (l._id === id) pos = i; });
    if (pos < 0) { lista = LEMBRANCAS; lista.forEach(function (l, i) { if (l._id === id) pos = i; }); }
    var caixa = $('[data-historia]');
    if (pos < 0) {
      caixa.innerHTML = '<p class="vazio">Essa lembrança não está disponível.</p><a class="botao botao-leve" style="width:100%" href="#lembrancas">Ver outras lembranças</a>';
      return;
    }
    var l = lista[pos], prox = lista[(pos + 1) % lista.length];
    var sobre = [l.detalhe, l.epoca].filter(Boolean).join(' · ');
    var h = '';
    if (l.foto) {
      h += '<figure class="historia-foto" style="margin:0"><img src="' + esc(SM.url(l.foto)) + '" alt="' + esc(l.legenda || 'Foto da lembrança') + '"></figure>' +
        (l.legenda ? '<p class="historia-legenda">' + esc(limpar(l.legenda)) + '</p>' : '') +
        (l.tema ? '<span class="historia-tema">' + esc(l.tema) + '</span>' : '') +
        (l.relato ? '<p class="historia-texto">' + esc(limpar(l.relato)) + '</p>' : '');
    } else {
      h += (l.tema ? '<span class="historia-tema" style="margin:0 0 .8rem">' + esc(l.tema) + '</span>' : '') +
        '<div class="historia-papel cor-' + (pos % 5) + '"><p class="historia-texto">' + esc(limpar(l.relato)) + '</p></div>';
    }
    if (l.autor) {
      h += '<div class="historia-quem"><span class="avatar" aria-hidden="true">' + esc(iniciais(l.autor)) + '</span>' +
        '<span><strong>' + esc(l.autor) + '</strong>' + (sobre ? '<span>' + esc(sobre) + '</span>' : '') + '</span></div>';
    }
    h += '<div class="convite"><p>Essa lembrança fez você recordar de alguma coisa? Compartilhe a sua também!</p>' +
      botaoEscrever('Escrever minha lembrança') + '</div>';
    if (prox && prox !== l) h += '<a class="link-simples" href="#lembranca/' + encodeURIComponent(prox._id) + '">Ver outra lembrança</a>';
    caixa.innerHTML = h;
    SM.externos(caixa);
  }

  /* ================= NAVEGAÇÃO ================= */
  var anterior = '', voltarHistoria = '#lembrancas';
  function rota() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    var nome = 'inicio', arg = '';
    var paraFormulario = h === 'enviar' || h.indexOf('enviar/') === 0;
    if (h === 'bate-bola' || h === 'onde-e' || h === 'lembrancas') nome = h;
    else if (h.indexOf('lembranca/') === 0) { nome = 'lembranca'; arg = h.slice(10); }
    $$('[data-vista]').forEach(function (v) { v.hidden = v.getAttribute('data-vista') !== nome; });
    if (nome === 'bate-bola') abrirBateBola();
    if (nome === 'onde-e') novoJogo();
    if (nome === 'lembrancas' && anterior !== 'lembranca') montarGaleria();
    if (nome === 'lembranca') {
      /* a seta volta para onde a pessoa estava: início ou galeria */
      if (anterior !== 'lembranca') voltarHistoria = anterior === 'inicio' ? '#' : '#lembrancas';
      $('[data-vista="lembranca"] .voltar').setAttribute('href', voltarHistoria);
      abrirLembranca(arg);
    }
    FICHAS.forEach(preencherQuem);
    if (paraFormulario) irParaFormulario(h.indexOf('enviar/') === 0 ? h.slice(7) : '');
    else if (!(nome === 'lembrancas' && anterior === 'lembranca')) window.scrollTo(0, 0);
    document.title = (nome === 'inicio' ? (INICIO.titulo || 'Qual lembrança de São Miguel vive em você?') :
      $('[data-vista="' + nome + '"] .barra h1').textContent) + ' | São Miguel 150+';
    anterior = nome;
  }

  /* ================= CARREGAR ================= */
  SM.carregar(['memoria', 'lembrancas']).then(function (d) {
    CFG = d.memoria || {};
    INICIO = CFG.inicio || {};
    PERGUNTAS = (CFG.perguntas || []).map(function (p) { return String(p || '').trim(); }).filter(Boolean);
    LUGARES = CFG.lugares || [];
    LEMBRANCAS = (d.lembrancas || []).map(function (l, i) { l._id = idDe(l, i); return l; })
      .filter(function (l) { return l.app === true && (l.relato || l.foto); }).reverse();
    montarInicio();
    montarFormulario();
    $('[data-qtd-perguntas]').textContent = 'Responda e veja as outras';
    var nLugares = Math.min(5, LUGARES.filter(function (l) { return l && l.foto && l.lugar; }).length);
    $('[data-qtd-lugares]').textContent = nLugares + (nLugares === 1 ? ' lugar' : ' lugares');
    montarMetro();
    montarBateBola();
    montarOndeE();
    montarTemas();
    montarGaleria();
    montarInspira();
    SM.externos();
    window.addEventListener('hashchange', rota);
    rota();
    setTimeout(checarObrigado, 400);
  });
})();
