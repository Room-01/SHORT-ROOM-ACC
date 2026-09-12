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
    const title = data.title || "Kunjungi Tautan";
    // Ambil deskripsi dari database, berikan fallback jika kosong
    const description = data.description || "Klik untuk mengunjungi tautan tujuan."; 
    const image = data.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = /bot|crawl|slifer|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|discordbot/i.test(userAgent);

    if (isBot) {
      // Halaman khusus untuk bot/debugger dengan Open Graph lengkap dan rapi
      const html = `
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <meta property="og:site_name" content="Shortener" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:url" content="https://${req.headers.host}/${id}" />
            <meta property="og:image" content="${image}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${image}" />
          </head>
          <body>
            <p>Mengarahkan ke tujuan...</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // Redirect langsung untuk pengguna biasa
    return res.redirect(302, targetUrl);

  } catch (err) {
    console.error('Redirect Server Error:', err);
    return res.status(500).send('Terjadi kesalahan pada server.');
  }
}
