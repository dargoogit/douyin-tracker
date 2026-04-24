const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// Load accounts from local file
const accounts = require('./accounts.json');

// --- REST API ---
app.get('/api/accounts', async (req, res) => {
  res.json(accounts);
});

app.get('/api/ratings', async (req, res) => {
  try {
    const data = await redis.get('ratings');
    res.json(data || {});
  } catch (e) {
    console.error('Read ratings error:', e.message);
    res.json({});
  }
});

app.post('/api/ratings', async (req, res) => {
  try {
    const { id, value } = req.body;
    const data = (await redis.get('ratings')) || {};
    if (value === null || value === undefined) {
      delete data[String(id)];
    } else {
      data[String(id)] = value;
    }
    await redis.set('ratings', data);
    res.json({ ok: true, ratings: data });
  } catch (e) {
    console.error('Write rating error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ratings/batch', async (req, res) => {
  try {
    const batch = req.body;
    const data = (await redis.get('ratings')) || {};
    Object.assign(data, batch);
    await redis.set('ratings', data);
    res.json({ ok: true, ratings: data });
  } catch (e) {
    console.error('Batch write error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/ratings', async (req, res) => {
  try {
    await redis.del('ratings');
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete ratings error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
