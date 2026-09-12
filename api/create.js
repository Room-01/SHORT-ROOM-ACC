import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    let rawItems = [];

    // Jika body dikirim sebagai string mentah
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = parsed;
      } catch (e) {
        rawItems = body.split('\n');
      }
    }

    // Jika body berupa Array
    if (Array.isArray(body)) {
      rawItems = body;
    } 
    // Jika body berupa Object, ambil semua isi propertinya secara bebas
    else if (body && typeof body === 'object') {
      for (const key of Object.keys(body)) {
        const val = body[key];
        if (Array.isArray(val)) {
          rawItems.push(...val);
        } else if (typeof val === 'string') {
          rawItems.push(...val.split('\n'));
        } else if (val && typeof val === 'object') {
          rawItems.push(val);
        } else if (typeof val === 'number') {
          rawItems.push(String(val));
        }
      }
    }

    const rowsToInsert = [];

    for (const item of rawItems) {
      if (!item) continue;

      let payload = item;
      if (typeof item === 'string') {
        payload = { url: item };
      }

      let id = payload?.id || payload?.slug || payload?.customId;
      let title = payload?.title;
      let description = payload?.description || payload?.desc;
      let image = payload?.image;
      
      // Cari URL dari properti apa pun yang ada di dalam objek
      let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

      if (!finalUrl && payload && typeof payload === 'object') {
        for (const k of Object.keys(payload)) {
          const v = payload[k];
          if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))) {
            finalUrl = v;
            break;
          }
        }
      }

      if (!finalUrl && typeof payload === 'string' && (payload.startsWith('http://') || payload.startsWith('https://'))) {
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
        description: description ? description.trim() : "Klik untuk mengunjungi tautan tujuan.",
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
