/* São Miguel 150+ | curtidas das lembranças (função do Vercel)
   Guarda as curtidas num banco Upstash Redis conectado ao projeto no Vercel.
   GET  /api/curtidas            -> { "<id>": total, ... }
   POST /api/curtidas {id, curtir} -> { id, total }
   Cada aparelho conta uma vez por lembrança (guardamos só um código
   embaralhado, nunca o IP). */
const crypto = require('crypto');

function credenciais() {
  const env = process.env;
  let url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  let token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) {
    /* O Vercel pode criar as variáveis com um prefixo (ex.: STORAGE_KV_REST_API_URL) */
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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const c = credenciais();
  if (!c) { res.status(503).json({ erro: 'banco não conectado' }); return; }

  try {
    if (req.method === 'GET') {
      const [lista] = await redis(c, [['HGETALL', 'curtidas']]);
      const totais = {};
      for (let i = 0; i + 1 < (lista || []).length; i += 2) totais[lista[i]] = Math.max(0, Number(lista[i + 1]) || 0);
      res.status(200).json(totais);
      return;
    }

    if (req.method === 'POST') {
      let corpo = req.body;
      if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
      const id = String((corpo && corpo.id) || '');
      const curtir = !(corpo && corpo.curtir === false);
      if (!/^[A-Za-z0-9-]{4,64}$/.test(id)) { res.status(400).json({ erro: 'id inválido' }); return; }

      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '');
      const quem = crypto.createHash('sha256').update(ip + '|' + (req.headers['user-agent'] || '') + '|sm150').digest('hex').slice(0, 24);

      const [mudou] = await redis(c, [[curtir ? 'SADD' : 'SREM', 'curtiu:' + id, quem]]);
      const [total] = mudou
        ? await redis(c, [['HINCRBY', 'curtidas', id, curtir ? 1 : -1]])
        : await redis(c, [['HGET', 'curtidas', id]]);
      res.status(200).json({ id, total: Math.max(0, Number(total) || 0) });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ erro: 'método não aceito' });
  } catch (e) {
    res.status(500).json({ erro: 'falha ao falar com o banco' });
  }
};
