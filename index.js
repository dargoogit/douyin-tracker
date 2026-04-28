// Vercel entrypoint - routes to api/index.js
// This file exists solely to satisfy Vercel's entrypoint detection
export default async function handler(req, res) {
  // Import and delegate to the actual handler
  const { handler: actualHandler } = await import('./api/index.js');
  return actualHandler(req, res);
}
