// Vercel serverless function: proxies Gemini requests. Your API key comes from the browser and is never stored.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { model, key, prompt, json } = b;
    if (!key) throw new Error('Add your Gemini API key in settings');
    if (!prompt) throw new Error('Missing prompt');
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model || 'gemini-3.8-flash') + ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, ...(json ? { responseMimeType: 'application/json' } : {}) },
        }),
      }
    );
    const d = await r.json();
    if (d.error) throw new Error('Gemini: ' + d.error.message);
    const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
