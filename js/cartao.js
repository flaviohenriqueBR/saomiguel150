/* São Miguel 150+ | cartão para compartilhar uma lembrança
   Desenha a lembrança numa imagem (Stories 1080x1920 ou Post 1080x1350)
   no próprio navegador. No celular, abre o compartilhamento do aparelho
   (WhatsApp, Instagram Stories...). No computador, baixa a imagem. */
(function () {
  'use strict';
  var SM = window.SM;
  var FORMATOS = { stories: { w: 1080, h: 1920 }, post: { w: 1080, h: 1350 } };
  var VERMELHO = '#B02E26', CREME = '#F2EBDE', TINTA = '#3D3A34', CINZA = '#6B655B';
  var PAPEIS = ['#FBE3E0', '#F6E8CE', '#E7EADC', '#DDEFF7'];
  var AVATAR = ['#B02E26', '#6E7B4E', '#A2691B', '#125F55', '#1D7396', '#965049'];
  var ONDA = 'M0,0 L55,57 L61,67 L61,74 L57,81 L37,100 L28,112 L18,139 L18,166 L24,185 L33,200 L40,207 L131,210 L88,166 L82,156 L82,148 L84,144 L102,125 L104,125 L117,107 L125,82 L123,48 L115,30 L103,14 L91,3Z';
  var ONDA_CORES = ['#EC9F9A', '#798264', '#C59354', '#965049', '#4D7A93'];
  var ONDA_Y = [44, 0, 44, 0, 44];
  var FONTE = 'Poppins, "Segoe UI", Helvetica, Arial, sans-serif';
  var imagens = {};

  function carregar(src) {
    if (!imagens[src]) {
      imagens[src] = new Promise(function (ok, erro) {
        var i = new Image();
        i.onload = function () { ok(i); };
        i.onerror = erro;
        i.src = src;
      });
    }
    return imagens[src];
  }
  function fontes() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['800 60px Poppins', '700 40px Poppins', '600 40px Poppins', '500 40px Poppins', '400 40px Poppins']
      .map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }
  function limpo(t) { return String(t || '').replace(/\{([^{}|]+)(?:\|[^{}]+)?\}/g, '$1').replace(/\s+/g, ' ').trim(); }
  function iniciais(nome) {
    var p = String(nome || '?').trim().split(/\s+/);
    return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase();
  }
  function corDoNome(nome) {
    var h = 0;
    String(nome || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return AVATAR[h % AVATAR.length];
  }
  function fonte(ctx, peso, tam) { ctx.font = peso + ' ' + tam + 'px ' + FONTE; }
  /* WhatsApp do projeto no formato (84) 99145-4401 */
  function telefone() {
    var n = String(((SM.site || {}).contato || {}).whatsapp || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (n.length === 11) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
    if (n.length === 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
    return '';
  }
  /* Endereço do site: o do painel (Configurações > Contato > Endereço do site);
     se estiver vazio, o endereço da página, só quando ela está publicada */
  function enderecoPublico() {
    var fixo = String(((SM.site || {}).contato || {}).endereco || '').trim();
    if (fixo) return fixo.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
    var h = location.hostname || '';
    if (location.protocol.indexOf('http') !== 0 || /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|\[)/.test(h) || h.indexOf('.') < 0) return '';
    return location.host.replace(/^www\./, '');
  }

  /* Quebra o texto em linhas que cabem na largura */
  function quebrar(ctx, texto, largura) {
    var palavras = texto.split(' '), linhas = [], atual = '';
    palavras.forEach(function (p) {
      var teste = atual ? atual + ' ' + p : p;
      if (ctx.measureText(teste).width <= largura || !atual) atual = teste;
      else { linhas.push(atual); atual = p; }
    });
    if (atual) linhas.push(atual);
    return linhas;
  }
  /* Escolhe o maior tamanho de letra em que o texto cabe; se não couber, corta com reticências */
  function caber(ctx, texto, peso, maior, menor, largura, maxLinhas) {
    for (var t = maior; t >= menor; t -= 2) {
      fonte(ctx, peso, t);
      var l = quebrar(ctx, texto, largura);
      if (l.length <= maxLinhas) return { tam: t, linhas: l };
    }
    fonte(ctx, peso, menor);
    var ls = quebrar(ctx, texto, largura).slice(0, maxLinhas);
    var ult = ls[ls.length - 1] || '';
    while (ult && ctx.measureText(ult + '…').width > largura) ult = ult.replace(/\s*\S+$/, '');
    ls[ls.length - 1] = ult + '…';
    return { tam: menor, linhas: ls };
  }
  function retangulo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function escrever(ctx, linhas, x, y, alturaLinha, alinhar) {
    ctx.textAlign = alinhar || 'left';
    ctx.textBaseline = 'alphabetic';
    linhas.forEach(function (l, i) { ctx.fillText(l, x, y + i * alturaLinha); });
  }
  function ondas(ctx, y, w, altura, s) {
    ctx.save();
    ctx.fillStyle = CREME;
    ctx.fillRect(0, y, w, altura);
    ctx.beginPath(); ctx.rect(0, y, w, altura); ctx.clip();
    var p = new Path2D(ONDA);
    for (var i = 0, x = 10 * s; x < w + 150 * s; i++, x += 150 * s) {
      ctx.save();
      ctx.translate(x, y - 36 * s + ONDA_Y[i % 5] * s);
      ctx.scale(s, s);
      ctx.fillStyle = ONDA_CORES[i % 5];
      ctx.fill(p);
      ctx.restore();
    }
    ctx.restore();
  }

  /* Desenha o cartão e devolve o canvas */
  function desenhar(l, formato, indice) {
    var F = FORMATOS[formato] || FORMATOS.stories;
    var st = formato === 'stories';
    var W = F.w, H = F.h, M = st ? 84 : 72;
    var foto = l.tipo === 'foto' && l.foto ? SM.url(l.foto) : '';
    return Promise.all([fontes(), carregar('assets/logo-150-branco.webp').catch(function () { return null; }), foto ? carregar(foto).catch(function () { return null; }) : null])
      .then(function (res) {
        var logo = res[1], img = res[2];
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        var ctx = cv.getContext('2d');
        ctx.fillStyle = CREME; ctx.fillRect(0, 0, W, H);

        /* Cabeçalho vermelho com o logo */
        var cabH = st ? 330 : 240;
        ctx.fillStyle = VERMELHO; ctx.fillRect(0, 0, W, cabH);
        if (logo) {
          var lh = cabH - (st ? 100 : 70), lw = lh * logo.width / logo.height;
          ctx.drawImage(logo, M - 10, (cabH - lh) / 2, lw, lh);
        }
        ctx.fillStyle = '#fff';
        fonte(ctx, 800, st ? 66 : 54);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText('ACERVO DE', W - M, cabH / 2 - (st ? 38 : 31));
        ctx.fillText('MEMÓRIAS', W - M, cabH / 2 + (st ? 38 : 31));

        /* Rodapé: convite com o WhatsApp do projeto, endereço do site e ondas */
        var ondaH = st ? 150 : 104, rodH = st ? 240 : 180;
        ondas(ctx, H - ondaH, W, ondaH, st ? 0.95 : 0.7);
        var numero = telefone();
        var host = enderecoPublico();
        var yr = H - ondaH - rodH;
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = CINZA; fonte(ctx, 600, st ? 36 : 30);
        ctx.fillText(numero ? 'Mande a sua lembrança pelo WhatsApp' : 'Mande a sua lembrança', W / 2, yr + (st ? 70 : 52));
        ctx.fillStyle = VERMELHO; fonte(ctx, 800, st ? 54 : 44);
        ctx.fillText(numero || host || 'São Miguel 150+', W / 2, yr + (st ? 136 : 106));
        if (numero && host) {
          ctx.fillStyle = TINTA; fonte(ctx, 600, st ? 32 : 28);
          ctx.fillText(host, W / 2, yr + (st ? 188 : 148));
        }

        /* Área do conteúdo */
        var topo = cabH + (st ? 80 : 50);
        var base = H - ondaH - rodH - (st ? 20 : 10);
        var autorH = st ? 120 : 96;
        var conteudoFim = base - autorH - (st ? 50 : 34);
        var largura = W - 2 * M;

        if (img) {
          /* Foto em moldura branca, com legenda embaixo */
          var pad = st ? 26 : 22;
          var legenda = limpo(l.legenda || l.relato);
          var leg = legenda ? caber(ctx, legenda, 700, st ? 46 : 38, st ? 34 : 28, largura - 2 * pad, st ? 4 : 3) : { tam: 0, linhas: [] };
          var lAlt = Math.round(leg.tam * 1.32);
          var legH = leg.linhas.length ? pad + lAlt * leg.linhas.length : 0;
          var imgW = largura - 2 * pad;
          var maxImgH = conteudoFim - topo - 2 * pad - legH;
          var imgH = Math.min(maxImgH, Math.round(imgW * img.height / img.width));
          var molduraH = pad + imgH + pad + legH;
          var y0 = topo + Math.max(0, (conteudoFim - topo - molduraH) / 2);
          ctx.save();
          ctx.shadowColor = 'rgba(61, 58, 52, .22)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
          ctx.fillStyle = '#fff'; retangulo(ctx, M, y0, largura, molduraH, 30); ctx.fill();
          ctx.restore();
          /* imagem recortada para preencher (cover) */
          var escala = Math.max(imgW / img.width, imgH / img.height);
          var sw = imgW / escala, sh = imgH / escala;
          ctx.save();
          retangulo(ctx, M + pad, y0 + pad, imgW, imgH, 18); ctx.clip();
          ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, M + pad, y0 + pad, imgW, imgH);
          ctx.restore();
          if (l.ano) {
            ctx.save();
            fonte(ctx, 700, st ? 56 : 46);
            ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
            ctx.shadowColor = 'rgba(255, 120, 0, .9)'; ctx.shadowBlur = 16;
            ctx.fillStyle = '#FF9A2E';
            ctx.fillText('’' + String(l.ano).slice(-2), M + pad + imgW - 26, y0 + pad + imgH - 24);
            ctx.restore();
          }
          if (leg.linhas.length) {
            ctx.fillStyle = TINTA; fonte(ctx, 700, leg.tam);
            escrever(ctx, leg.linhas, M + pad, y0 + pad + imgH + pad + leg.tam, lAlt);
          }
        } else {
          /* Relato em papel colorido, com as chaves da marca */
          var texto = limpo(l.relato || l.legenda);
          var padT = st ? 64 : 52;
          var rel = caber(ctx, texto, 500, st ? 60 : 50, st ? 36 : 30, largura - 2 * padT - 20, st ? 13 : 9);
          var alt = Math.round(rel.tam * 1.42);
          var chave = st ? 150 : 120;
          var caixaH = Math.min(conteudoFim - topo, padT + chave * 0.75 + alt * rel.linhas.length + chave * 0.5 + padT);
          var y1 = topo + Math.max(0, (conteudoFim - topo - caixaH) / 2);
          ctx.fillStyle = PAPEIS[(indice || 0) % PAPEIS.length];
          retangulo(ctx, M, y1, largura, caixaH, 40); ctx.fill();
          ctx.fillStyle = VERMELHO; fonte(ctx, 400, chave);
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('{', M + padT - 16, y1 + padT - chave * 0.28);
          ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
          ctx.fillText('}', M + largura - padT + 16, y1 + caixaH - padT + chave * 0.3);
          ctx.fillStyle = TINTA; fonte(ctx, 500, rel.tam);
          escrever(ctx, rel.linhas, M + padT + 10, y1 + padT + chave * 0.75 + rel.tam, alt);
        }

        /* Quem enviou */
        var av = st ? 104 : 86;
        var ya = base - autorH + (autorH - av) / 2;
        ctx.fillStyle = corDoNome(l.autor);
        ctx.beginPath(); ctx.arc(M + av / 2, ya + av / 2, av / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; fonte(ctx, 700, st ? 40 : 34);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(iniciais(l.autor), M + av / 2, ya + av / 2 + 2);
        var xt = M + av + (st ? 30 : 24);
        var larguraTexto = W - M - xt;
        var epoca = String(l.epoca || '').trim();
        var chipW = 0;
        if (epoca) {
          fonte(ctx, 600, st ? 32 : 28);
          chipW = ctx.measureText(epoca).width + (st ? 48 : 40);
          var chipH = st ? 62 : 52;
          ctx.fillStyle = '#fff'; retangulo(ctx, W - M - chipW, ya + (av - chipH) / 2, chipW, chipH, chipH / 2); ctx.fill();
          ctx.fillStyle = CINZA; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(epoca, W - M - chipW / 2, ya + av / 2 + 1);
          larguraTexto -= chipW + 20;
        }
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        var nome = caber(ctx, String(l.autor || 'Anônimo'), 700, st ? 44 : 38, st ? 30 : 26, larguraTexto, 1);
        ctx.fillStyle = TINTA; fonte(ctx, 700, nome.tam);
        var detalhe = String(l.detalhe || '').trim();
        ctx.fillText(nome.linhas[0], xt, ya + av / 2 + (detalhe ? -4 : nome.tam * 0.35));
        if (detalhe) {
          var det = caber(ctx, detalhe, 400, st ? 32 : 28, st ? 24 : 22, larguraTexto, 1);
          ctx.fillStyle = CINZA; fonte(ctx, 400, det.tam);
          ctx.fillText(det.linhas[0], xt, ya + av / 2 + det.tam + 6);
        }
        return cv;
      });
  }

  /* ---------- Janela de compartilhar ---------- */
  var visor, estado = { l: null, indice: 0, formato: 'stories', blob: null, url: '' };
  var ICONE_BAIXAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICONE_ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M6 12H5v8h14v-8h-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICONE_LINK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  function podeCompartilharArquivo() {
    try {
      var f = new File([new Blob(['x'], { type: 'image/jpeg' })], 'teste.jpg', { type: 'image/jpeg' });
      return !!(navigator.canShare && navigator.share && navigator.canShare({ files: [f] }));
    } catch (e) { return false; }
  }
  function nomeArquivo() {
    var nome = SM.norm(estado.l.autor || 'lembranca').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'lembranca-sao-miguel-150-' + (nome || 'acervo') + '-' + estado.formato + '.jpg';
  }
  function linkLembranca() {
    return location.origin + location.pathname + '#lembranca=' + encodeURIComponent(estado.l.id || '');
  }
  function aviso(txt) { visor.querySelector('[data-cartao-aviso]').textContent = txt; }

  function gerar() {
    var previa = visor.querySelector('[data-cartao-img]');
    visor.querySelector('.cartao-previa').setAttribute('data-formato', estado.formato);
    previa.removeAttribute('src');
    visor.classList.add('gerando');
    estado.blob = null;
    return desenhar(estado.l, estado.formato, estado.indice).then(function (cv) {
      return new Promise(function (ok) { cv.toBlob(ok, 'image/jpeg', 0.92); });
    }).then(function (blob) {
      estado.blob = blob;
      if (estado.url) URL.revokeObjectURL(estado.url);
      estado.url = URL.createObjectURL(blob);
      previa.src = estado.url;
      visor.classList.remove('gerando');
    }).catch(function () {
      visor.classList.remove('gerando');
      aviso('Não foi possível montar a imagem. Tente de novo.');
    });
  }

  function montarVisor() {
    visor = document.createElement('dialog');
    visor.className = 'cartao-visor';
    visor.setAttribute('aria-labelledby', 'cartao-titulo');
    var compartilha = podeCompartilharArquivo();
    visor.innerHTML =
      '<button class="visor-fechar" type="button" data-fechar aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
      '<h2 class="cartao-titulo" id="cartao-titulo">Compartilhar lembrança</h2>' +
      '<div class="tipos cartao-formatos" role="group" aria-label="Formato da imagem">' +
      '<button type="button" data-formato="stories" aria-pressed="true">Stories</button>' +
      '<button type="button" data-formato="post" aria-pressed="false">Post</button></div>' +
      '<div class="cartao-previa" data-formato="stories"><img data-cartao-img alt="Prévia da imagem para compartilhar"><span class="cartao-carregando">Montando a imagem…</span></div>' +
      '<div class="cartao-botoes">' +
      (compartilha ? '<button type="button" class="botao botao-vermelho" data-cartao-compartilhar>' + ICONE_ENVIAR + 'Compartilhar</button>' : '') +
      '<button type="button" class="botao ' + (compartilha ? 'botao-contorno' : 'botao-vermelho') + '" data-cartao-baixar>' + ICONE_BAIXAR + 'Baixar imagem</button>' +
      '<button type="button" class="botao botao-contorno" data-cartao-link>' + ICONE_LINK + 'Copiar link</button>' +
      '</div>' +
      '<p class="cartao-dica">' + (compartilha ? 'Toque em Compartilhar e escolha o WhatsApp ou o Instagram (Stories).' : 'Baixe a imagem para postar no Instagram, no Facebook ou mandar no WhatsApp.') + '</p>' +
      '<p class="cartao-aviso" data-cartao-aviso aria-live="polite"></p>';
    document.body.appendChild(visor);

    visor.addEventListener('click', function (ev) {
      if (ev.target === visor || ev.target.closest('[data-fechar]')) { visor.close(); return; }
      var f = ev.target.closest('[data-formato]');
      if (f && f.tagName === 'BUTTON') {
        estado.formato = f.getAttribute('data-formato');
        visor.querySelectorAll('button[data-formato]').forEach(function (b) { b.setAttribute('aria-pressed', b === f ? 'true' : 'false'); });
        aviso('');
        gerar();
        return;
      }
      if (ev.target.closest('[data-cartao-baixar]')) {
        if (!estado.blob) return;
        var a = document.createElement('a');
        a.href = estado.url; a.download = nomeArquivo();
        document.body.appendChild(a); a.click(); a.remove();
        aviso('Imagem salva.');
        return;
      }
      if (ev.target.closest('[data-cartao-compartilhar]')) {
        if (!estado.blob) return;
        var arquivo = new File([estado.blob], nomeArquivo(), { type: 'image/jpeg' });
        navigator.share({ files: [arquivo], title: 'Acervo de Memórias | São Miguel 150+', text: 'Uma lembrança do Acervo de Memórias do São Miguel 150+: ' + linkLembranca() })
          .catch(function (e) { if (e && e.name !== 'AbortError') aviso('Não deu para compartilhar daqui. Baixe a imagem e envie pelo aplicativo.'); });
        return;
      }
      if (ev.target.closest('[data-cartao-link]')) {
        var link = linkLembranca();
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(link) : Promise.reject())
          .then(function () { aviso('Link copiado.'); })
          .catch(function () { window.prompt('Copie o link:', link); });
      }
    });
    visor.addEventListener('close', function () { aviso(''); });
  }

  SM.cartao = {
    desenhar: desenhar,
    abrir: function (l, indice) {
      if (!visor) montarVisor();
      estado.l = l; estado.indice = indice || 0;
      aviso('');
      if (typeof visor.showModal === 'function') visor.showModal();
      gerar();
    }
  };
})();
