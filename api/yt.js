// Vercel serverless function: fetches a YouTube transcript (captions) and the video title.
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x').searchParams.get('url') || '';
    const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
    if (!['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) throw new Error('Please paste a valid YouTube link');
    const { YoutubeTranscript } = require('youtube-transcript');
    const t = await YoutubeTranscript.fetchTranscript(url);
    let title = 'YouTube video';
    try {
      title = (await (await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(url))).json()).title || title;
    } catch {}
    res.status(200).json({ text: dec(t.map((x) => x.text).join(' ')), title });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
