import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    
    // Jika frontend mengirim data sebagai array (batch), ambil item pertama
    if (Array.isArray(body) && body.length > 0) {
      body = body[0];
    }

    let { id, url, link, destination, originalUrl, targetUrl, title, image } = body || {};
    
    let finalUrl = url || link || destination || originalUrl || targetUrl;

    if (!finalUrl) {
      return res.status(400).json({ error: 'URL tujuan tidak boleh kosong' });
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
      .insert([{ 
        id, 
        url: finalUrl, 
        title: title || null, 
        image: image || null 
      }]);

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
