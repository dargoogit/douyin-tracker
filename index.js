// Vercel root handler - satisfies entrypoint detection
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // For non-API paths, serve the HTML content
  const url = new URL(req.url, 'http://' + req.headers.host);
  if (!url.pathname.startsWith('/api/')) {
    // In Vercel, static files (index.html) are served before reaching handler,
    // so this only catches unmatched routes
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Loading...</body></html>');
  }
  
  return res.status(200).json({ message: 'Douyin Tracker - use /api/accounts or /api/rate' });
}
