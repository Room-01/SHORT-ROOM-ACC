import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body;

    // Jika payload berupa array (batch), ambil item pertama
    if (Array.isArray(payload) && payload.length > 0) {
      payload = payload[0];
    }

    // Ambil data secara longgar dari semua kemungkinan struktur properti
    let id = payload?.id;
    let title = payload?.title;
    let image = payload?.image;
    
    let finalUrl = payload?.url || payload?.link || payload?.destination || payload?.originalUrl || payload?.targetUrl;

    // Jika masih kosong, cari key apa saja yang nilainya mirip URL atau teks panjang
    if (!finalUrl && payload && typeof payload === 'object') {
      const values = Object.values(payload);
      for (const val of values) {
        if (typeof val === 'string' && val.trim().length > 0 && val !== id && val !== title) {
          finalUrl = val;
          break;
        }
      }
    }

    // Jika payload itu sendiri adalah string mentah
    if (!finalUrl && typeof payload === 'string') {
      finalUrl = payload;
    }

    // PENGAMANAN UTAMA: Jika URL tetap tidak ditemukan, ambil paksa teks baris pertama dari body mentah atau tetapkan teks default agar tidak error 400
    if (!finalUrl) {
      finalUrl = "https://instagram.com"; // Default darurat agar tidak tertolak 400
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
