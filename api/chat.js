// Vercel serverless function: proxies Gemini requests. Your API key comes from the browser and is never stored.
const gemini = require('./_gemini');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    res.status(200).json({ text: await gemini(b) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
