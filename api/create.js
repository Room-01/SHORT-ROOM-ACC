import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body;

    if (Array.isArray(payload) && payload.length > 0) {
      payload = payload[0];
    }

    // Ambil data dari payload dengan berbagai kemungkinan nama key
    let id = payload?.id || payload?.slug;
    let title = payload?.title;
    let image = payload?.image;
    let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

    if (!finalUrl && payload && typeof payload === 'object') {
      const values = Object.values(payload);
      for (const val of values) {
        if (typeof val === 'string' && val.trim().length > 0 && val !== id && val !== title) {
          finalUrl = val;
          break;
        }
      }
    }

    if (!finalUrl && typeof payload === 'string') {
      finalUrl = payload;
    }

    if (!finalUrl) {
      finalUrl = "https://instagram.com";
    }

    // Buat ID random jika kosong
    if (!id || typeof id !== 'string' || id.trim() === '') {
      id = Math.random().toString(36).substring(2, 8);
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      try {
        const parsedUrl = new URL(finalUrl);
        title = `Kunjungi ${parsedUrl.hostname}`; 
      } catch (e) {
        title = "Klik Link Ini"; 
      }
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // EKSEKUSI INSERT KE SUPABASE
    const { data, error } = await supabase
      .from('links')
      .insert([{ 
        id: id.trim(), 
        url: finalUrl.trim(), 
        title: title.trim(), 
        image: image ? image.trim() : null 
      }])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id, data });
  } catch (err) {
    console.error('Server Catch Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
