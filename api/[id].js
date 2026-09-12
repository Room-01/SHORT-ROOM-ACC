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
    const image = data.image || "";

    // Cek User-Agent untuk mendeteksi apakah yang mengakses adalah Bot (Social Media / Debugger)
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = /bot|crawl|slifer|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|discordbot/i.test(userAgent);

    // Jika diakses oleh Bot atau alat Debugger, tampilkan halaman HTML dengan Meta Tag kustom
    if (isBot) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta property="og:title" content="${title}" />
            <meta property="og:url" content="${targetUrl}" />
            ${image ? `<meta property="og:image" content="${image}" />` : ''}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            ${image ? `<meta name="twitter:image" content="${image}" />` : ''}
            <meta http-equiv="refresh" content="0;url=${targetUrl}" />
          </head>
          <body>
            <p>Mengarahkan ke <a href="${targetUrl}">${targetUrl}</a>...</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // Jika diakses oleh manusia biasa, langsung redirect 302 ke URL tujuan secara instan
    return res.redirect(302, targetUrl);

  } catch (err) {
    console.error('Redirect Server Error:', err);
    return res.status(500).send('Terjadi kesalahan pada server.');
  }
}
