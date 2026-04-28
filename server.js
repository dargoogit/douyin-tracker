const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const ACCOUNTS = require('./accounts.json');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'https://' + req.headers.host);
  const path = url.pathname;

  try {
    // GET /api/accounts - 返回账号列表
    if (path === '/api/accounts' && req.method === 'GET') {
      const ratings = {};
      for (const acc of ACCOUNTS) {
        const key = 'rating:' + acc.id;
        const val = await redis.get(key);
        ratings[acc.id] = val || '';
      }
      return res.json({ accounts: ACCOUNTS, ratings });
    }

    // POST /api/rate - 保存评价
    if (path === '/api/rate' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { id, rating } = JSON.parse(body);
      if (!id || !rating) {
        return res.status(400).json({ error: 'Missing id or rating' });
      }
      await redis.set('rating:' + id, rating);
      return res.json({ success: true });
    }

    // GET / - 返回首页
    if (path === '/' && req.method === 'GET') {
      const fs = require('fs');
      const path = require('path');
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    // 404
    return res.status(404).json({ error: 'Not found' });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
};
