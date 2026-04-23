const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'ratings.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// Load initial data
const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'accounts.json'), 'utf8'));
let ratings = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    ratings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (e) { ratings = {}; }

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(ratings, null, 2));
}

// --- REST API ---
app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

app.get('/api/ratings', (req, res) => {
  res.json(ratings);
});

app.post('/api/ratings', (req, res) => {
  const { id, value } = req.body;
  if (value === null || value === undefined) {
    delete ratings[String(id)];
  } else {
    ratings[String(id)] = value;
  }
  save();
  res.json({ ok: true, ratings });
});

app.post('/api/ratings/batch', (req, res) => {
  const batch = req.body;
  Object.assign(ratings, batch);
  save();
  res.json({ ok: true, ratings });
});

app.delete('/api/ratings', (req, res) => {
  ratings = {};
  save();
  res.json({ ok: true });
});

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
