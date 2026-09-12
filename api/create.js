import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Cetak isi req.body ke log Vercel untuk kita periksa
    console.log("REQUEST BODY DARI FRONTEND:", JSON.stringify(req.body));

    let { id, url, link, destination, originalUrl, targetUrl, title, image } = req.body;
    
    // Cek semua kemungkinan nama variabel URL
    let finalUrl = url || link || destination || originalUrl || targetUrl;

    // Jika masih kosong, coba ambil dari properti pertama yang ada di body
    if (!finalUrl && req.body) {
      const keys = Object.keys(req.body);
      if (keys.length > 0) {
        // Ambil nilai dari key pertama yang bukan id, title, atau image
        for (let k of keys) {
          if (!['id', 'title', 'image'].includes(k) && req.body[k]) {
            finalUrl = req.body[k];
            break;
          }
        }
      }
    }

    if (!finalUrl) {
      return res.status(400).json({ error: 'URL tujuan tidak boleh kosong (null). Data diterima: ' + JSON.stringify(req.body) });
    }

    if (!id || id.trim() === '') {
      id = Math.random().toString(36).substring(2, 8);
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from('links')
      .insert([{ id, url: finalUrl, title, image }]);

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id, data });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
