import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(404).send('ID Link tidak ditemukan.');
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Mengambil data dari tabel links berdasarkan id
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).send(`Link dengan ID "${id}" tidak ditemukan di database.`);
    }

    const targetUrl = data.url;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    
    // Deteksi bot sosial media (Facebook, WhatsApp, dll)
    const isBot = /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|linkedinbot|skypeuripreview|discordbot|slackbot|pinterest|googlebot|bingbot/i.test(userAgent);

    if (isBot) {
      const title = data.title || 'ROOM Link Shortener';
      const image = data.image || 'https://i.imgur.com/8k3Ddag.jpeg';
      
      return res.setHeader('Content-Type', 'text/html').status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <meta property="og:title" content="${title}" />
            <meta property="og:image" content="${image}" />
            <meta property="og:url" content="${targetUrl}" />
            <meta property="og:type" content="website" />
            <meta http-equiv="refresh" content="0;url=${targetUrl}">
          </head>
          <body><p>Redirecting...</p></body>
        </html>
      `);
    }

    // Redirect murni 302 untuk pengguna biasa
    return res.redirect(302, targetUrl);

  } catch (err) {
    console.error('Redirect Error:', err);
    return res.status(500).send('Terjadi kesalahan server.');
  }
}
