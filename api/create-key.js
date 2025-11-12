import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end();

  const keysPath = path.join(process.cwd(), 'api', 'apikey.json');
  const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

  // generate key baru
  const key = Math.random().toString(36).substring(2,10).toUpperCase();
  keys.push(key);

  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

  res.status(200).json({ ok: true, key });
}
