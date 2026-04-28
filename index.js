// Vercel entrypoint (for detection only)
// Actual handlers are in api/index.js
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Douyin Tracker API',
    endpoints: ['/api/accounts', '/api/rate']
  });
}
