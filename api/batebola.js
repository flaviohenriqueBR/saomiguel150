/* São Miguel 150+ | respostas do Bate-bola da memória (função do Vercel)
   Usa o mesmo banco Upstash Redis das curtidas.

   GET  /api/batebola?q=id1,id2        -> { id: { total, respostas: [{ id, t }] } }
   POST /api/batebola { respostas: [{ q, pergunta, texto }] } -> { ok: true }

   Moderação (página moderar.html), com a senha da variável BATEBOLA_SENHA
   enviada no cabeçalho "x-senha":
   GET  /api/batebola?moderar=1        -> { perguntas: [{ q, pergunta, respostas: [{ id, t, d, oculta }] }] }
   POST /api/batebola { acao: "ocultar" | "mostrar", id }

   As respostas não guardam nome nem IP. Respostas com palavrões entram
   já escondidas, para a equipe decidir. */
const crypto = require('crypto');

function credenciais() {
  const env = process.env;
  let url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  let token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) {
    const chave = Object.keys(env).find((k) => /(KV_REST_API_URL|REDIS_REST_URL)$/.test(k));
    if (chave) {
      url = env[chave];
      token = env[chave.replace(/URL$/, 'TOKEN')];
    }
  }
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function redis(c, comandos) {
  const r = await fetch(c.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(comandos)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map((x) => x.result);
}

const ID_PERGUNTA = /^q[a-z0-9]{3,16}$/;
const MAX_LISTA = 1000;     /* respostas guardadas por pergunta */
const MOSTRAR = 20;         /* respostas devolvidas por pergunta no jogo */

function norm(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
/* Palavrões mais comuns: a resposta entra escondida para a equipe revisar */
const PALAVROES = ['porra', 'caralho', 'krl', 'merda', 'bosta', 'puta', 'puto', 'putaria', 'buceta', 'boceta',
  'cacete', 'foder', 'fode', 'fodase', 'foda-se', 'fdp', 'pqp', 'vsf', 'tnc', 'viado', 'cu', 'cuzao', 'arrombado',
  'arrombada', 'corno', 'otario', 'vagabundo', 'vagabunda', 'piranha', 'rapariga', 'babaca', 'idiota', 'imbecil'];
function temPalavrao(t) {
  const palavras = norm(t).split(/[^a-z0-9-]+/);
  return palavras.some((p) => PALAVROES.indexOf(p) >= 0);
}
function lerCorpo(req) {
  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  return corpo || {};
}
function senhaOk(req) {
  const senha = process.env.BATEBOLA_SENHA || '';
  const enviada = String(req.headers['x-senha'] || '');
  if (!senha || !enviada) return false;
  const a = crypto.createHash('sha256').update(senha).digest();
  const b = crypto.createHash('sha256').update(enviada).digest();
  return crypto.timingSafeEqual(a, b);
}
function lerItem(txt) { try { return JSON.parse(txt); } catch (e) { return null; } }

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const c = credenciais();
  if (!c) { res.status(503).json({ erro: 'banco não conectado' }); return; }

  try {
    const query = req.query || {};

    /* ---------- Moderação ---------- */
    if (req.method === 'GET' && query.moderar) {
      if (!process.env.BATEBOLA_SENHA) { res.status(403).json({ erro: 'Defina a variável BATEBOLA_SENHA no Vercel.' }); return; }
      if (!senhaOk(req)) { res.status(401).json({ erro: 'Senha incorreta.' }); return; }
      const [mapa, ocultas] = await redis(c, [['HGETALL', 'bbq'], ['SMEMBERS', 'bb:ocultas']]);
      const ids = [], textos = {};
      for (let i = 0; i + 1 < (mapa || []).length; i += 2) { ids.push(mapa[i]); textos[mapa[i]] = mapa[i + 1]; }
      const listas = ids.length ? await redis(c, ids.map((q) => ['LRANGE', 'bb:' + q, 0, MAX_LISTA - 1])) : [];
      const esc = new Set(ocultas || []);
      const perguntas = ids.map((q, i) => ({
        q, pergunta: textos[q],
        respostas: (listas[i] || []).map(lerItem).filter(Boolean).map((r) => ({ id: r.id, t: r.t, d: r.d, oculta: esc.has(r.id) }))
      }));
      res.status(200).json({ perguntas });
      return;
    }

    if (req.method === 'POST') {
      const corpo = lerCorpo(req);

      if (corpo.acao === 'ocultar' || corpo.acao === 'mostrar') {
        if (!senhaOk(req)) { res.status(401).json({ erro: 'Senha incorreta.' }); return; }
        const id = String(corpo.id || '');
        if (!/^[a-z0-9]{6,20}$/.test(id)) { res.status(400).json({ erro: 'id inválido' }); return; }
        await redis(c, [[corpo.acao === 'ocultar' ? 'SADD' : 'SREM', 'bb:ocultas', id]]);
        res.status(200).json({ ok: true });
        return;
      }

      /* ---------- Novas respostas do jogo ---------- */
      const lista = Array.isArray(corpo.respostas) ? corpo.respostas.slice(0, 12) : [];
      const validas = lista.map((r) => ({
        q: String((r && r.q) || ''),
        pergunta: String((r && r.pergunta) || '').trim().slice(0, 220),
        texto: String((r && r.texto) || '').replace(/\s+/g, ' ').trim().slice(0, 300)
      })).filter((r) => ID_PERGUNTA.test(r.q) && r.pergunta && r.texto.length >= 2);
      if (!validas.length) { res.status(400).json({ erro: 'nada para guardar' }); return; }

      /* limite simples por aparelho: 60 respostas por hora */
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '');
      const quem = crypto.createHash('sha256').update(ip + '|' + (req.headers['user-agent'] || '') + '|sm150bb').digest('hex').slice(0, 24);
      const [usadas] = await redis(c, [['INCRBY', 'bbrl:' + quem, validas.length], ['EXPIRE', 'bbrl:' + quem, 3600]]);
      if (Number(usadas) > 60) { res.status(429).json({ erro: 'muitas respostas, tente mais tarde' }); return; }

      const comandos = [];
      const guardadas = [];
      validas.forEach((r) => {
        const id = crypto.randomBytes(6).toString('hex');
        comandos.push(['HSET', 'bbq', r.q, r.pergunta]);
        comandos.push(['LPUSH', 'bb:' + r.q, JSON.stringify({ id, t: r.texto, d: Date.now() })]);
        comandos.push(['LTRIM', 'bb:' + r.q, 0, MAX_LISTA - 1]);
        if (temPalavrao(r.texto)) comandos.push(['SADD', 'bb:ocultas', id]);
        guardadas.push({ q: r.q, id });
      });
      await redis(c, comandos);
      res.status(200).json({ ok: true, guardadas });
      return;
    }

    /* ---------- Respostas de outras pessoas ---------- */
    if (req.method === 'GET') {
      const ids = String(query.q || '').split(',').map((s) => s.trim()).filter((s) => ID_PERGUNTA.test(s)).slice(0, 12);
      if (!ids.length) { res.status(200).json({}); return; }
      const comandos = [['SMEMBERS', 'bb:ocultas']];
      ids.forEach((q) => { comandos.push(['LRANGE', 'bb:' + q, 0, 79]); comandos.push(['LLEN', 'bb:' + q]); });
      const r = await redis(c, comandos);
      const ocultas = new Set(r[0] || []);
      const saida = {};
      ids.forEach((q, i) => {
        const itens = (r[1 + i * 2] || []).map(lerItem).filter((x) => x && !ocultas.has(x.id));
        saida[q] = { total: Math.max(0, Number(r[2 + i * 2]) || 0), respostas: itens.slice(0, MOSTRAR).map((x) => ({ id: x.id, t: x.t })) };
      });
      res.status(200).json(saida);
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ erro: 'método não aceito' });
  } catch (e) {
    res.status(500).json({ erro: 'falha ao falar com o banco' });
  }
};
