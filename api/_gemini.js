// Shared Gemini helper (underscore prefix = not exposed as a Vercel route).
module.exports = async function gemini({ model, key, prompt, json, search }) {
  if (!key) throw new Error('Add your Gemini API key in settings');
  if (!prompt) throw new Error('Missing prompt');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model || 'gemini-3.5-flash-lite') + ':generateContent';
  const call = async (useSearch) => {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, ...(json && !useSearch ? { responseMimeType: 'application/json' } : {}) },
    };
    if (useSearch) body.tools = [{ google_search: {} }];
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.error) throw new Error('Gemini: ' + d.error.message);
    return (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  };
  if (search) {
    // Web-grounded research; fall back to a normal call if grounding is unavailable.
    try {
      const t = await call(true);
      if (t.trim()) return t;
    } catch (e) {
      if (/API key|not found|quota|exhausted|429/i.test(e.message)) throw e;
    }
  }
  return call(false);
};
