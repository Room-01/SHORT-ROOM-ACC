import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    let items = [];

    // Tangani jika data dikirim sebagai Array (banyak link) atau Object tunggal
    if (Array.isArray(body)) {
      items = body;
    } else if (body && typeof body === 'object') {
      if (Array.isArray(body.urls)) {
        items = body.urls;
      } else {
        items = [body];
      }
    }

    if (items.length === 0) {
      return res.status(400).json({ error: 'No URLs provided' });
    }

    const rowsToInsert = [];

    for (const item of items) {
      let payload = typeof item === 'string' ? { url: item } : item;

      let id = payload?.id || payload?.slug;
      let title = payload?.title;
      let image = payload?.image;
      let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

      if (!finalUrl && typeof payload === 'string') {
        finalUrl = payload;
      }

      if (!finalUrl) continue;

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

      rowsToInsert.push({
        id: id.trim(),
        url: finalUrl.trim(),
        title: title.trim(),
        image: image ? image.trim() : null
      });
    }

    if (rowsToInsert.length === 0) {
      return res.status(400).json({ error: 'Valid URLs not found' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // EKSEKUSI BULK INSERT KE SUPABASE
    const { data, error } = await supabase
      .from('links')
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server Catch Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
