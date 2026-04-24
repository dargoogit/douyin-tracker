const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const data = (await redis.get('ratings')) || {};
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { id, value } = req.body || {};
      const data = (await redis.get('ratings')) || {};

      if (value === null || value === undefined) {
        delete data[String(id)];
      } else {
        data[String(id)] = value;
      }

      await redis.set('ratings', data);
      return res.status(200).json({ ok: true, ratings: data });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
