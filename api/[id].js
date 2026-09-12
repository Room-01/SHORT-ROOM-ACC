import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  let { id } = req.query;

  if (Array.isArray(id)) {
    id = id[0];
  } else if (typeof id === 'object' && id !== null) {
    id = id.id || Object.values(id)[0];
  }

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(404).send('ID Link tidak ditemukan.');
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id.trim())
      .single();

    if (error || !data) {
      return res.status(404).send(`Link dengan ID "${id}" tidak ditemukan di database.`);
    }

    const targetUrl = data.url;
    
    // Lakukan redirect ke URL tujuan
    return res.redirect(302, targetUrl);

  } catch (err) {
    console.error('Redirect Server Error:', err);
    return res.status(500).send('Terjadi kesalahan pada server.');
  }
}
