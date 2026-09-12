import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body;

    // Jika data dikirim dalam bentuk array (batch), ambil item pertama
    if (Array.isArray(payload) && payload.length > 0) {
      payload = payload[0];
    }

    // Ambil nilai dari properti apa saja yang mungkin dikirim frontend
    let id = payload?.id;
    let title = payload?.title;
    let image = payload?.image;

    // Cari teks URL dari properti mana pun yang tersedia di body
    let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

    // Jika masih tidak ketemu, ambil nilai dari key pertama yang bukan id/title/image
    if (!finalUrl && payload && typeof payload === 'object') {
      for (const key of Object.keys(payload)) {
        if (!['id', 'title', 'image'].includes(key) && payload[key]) {
          finalUrl = payload[key];
          break;
        }
      }
    }

    // Darurat: Jika payload berupa string mentah
    if (!finalUrl && typeof payload === 'string') {
      finalUrl = payload;
    }

    if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '') {
      return res.status(400).json({ error: 'URL tujuan tidak boleh kosong' });
    }

    // Auto-generate ID acak jika kosong
    if (!id || typeof id !== 'string' || id.trim() === '') {
      id = Math.random().toString(36).substring(2, 8);
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from('links')
      .insert([{ 
        id: id.trim(), 
        url: finalUrl.trim(), 
        title: title ? title.trim() : null, 
        image: image ? image.trim() : null 
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
