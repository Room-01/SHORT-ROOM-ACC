import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    let items = [];

    // Tangani berbagai kemungkinan bentuk data dari frontend
    if (Array.isArray(body)) {
      items = body;
    } else if (body && typeof body === 'object') {
      // Cek apakah ada key seperti urls, data, links, atau items
      const possibleArray = body.urls || body.data || body.links || body.items;
      if (Array.isArray(possibleArray)) {
        items = possibleArray;
      } else {
        items = [body];
      }
    } else if (typeof body === 'string') {
      // Jika dikirim sebagai string biasa atau baris-baris teks
      items = body.split('\n').map(line => line.trim()).filter(Boolean);
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Valid URLs not found' });
    }

    const rowsToInsert = [];

    for (const item of items) {
      let payload = item;

      // Jika item berupa string mentah (URL langsung)
      if (typeof item === 'string') {
        payload = { url: item };
      }

      let id = payload?.id || payload?.slug || payload?.customId;
      let title = payload?.title;
      let image = payload?.image;
      
      // Cari URL dari berbagai kemungkinan nama properti
      let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

      // Jika masih kosong, cari nilai string apa pun di dalam objek yang mirip URL
      if (!finalUrl && payload && typeof payload === 'object') {
        const values = Object.values(payload);
        for (const val of values) {
          if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
            finalUrl = val;
            break;
          }
        }
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

    // EKSEKUSI INSERT KE SUPABASE
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
