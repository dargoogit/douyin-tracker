// Root handler - satisfies Vercel entrypoint detection (no express needed)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const url = new URL(req.url, 'http://' + req.headers.host);
  if (!url.pathname.startsWith('/api/')) {
    // Static index.html is served separately by Vercel
    return res.status(302).setHeader('Location', '/').end();
  }
  return res.status(200).json({ message: 'Douyin Tracker API', endpoints: ['/api/accounts', '/api/rate'] });
}
