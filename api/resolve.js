import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  // Ambil ID langsung dari query Vercel
  const { id } = req.query;

  // Jika tidak ada ID atau membuka halaman utama
  if (!id || id === 'index.html' || id === 'api' || id === 'resolve') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>ROOM | Link Shortener</title>
          <meta property="og:title" content="ROOM | Link Shortener" />
          <meta property="og:image" content="https://i.imgur.com/8k3Ddag.jpeg" />
          <meta property="og:type" content="website" />
        </head>
        <body>
          <script>window.location.href = "https://short-room-acc.vercel.app";</script>
        </body>
      </html>
    `);
  }

  // Cari data link di Supabase
  const { data, error } = await supabase
    .from('links')
    .select('url, title, image')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).send("<h2 style='text-align:center; margin-top:20vh; font-family:sans-serif;'>Link tidak ditemukan atau sudah kadaluarsa.</h2>");
  }

  // Deteksi Bot
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = /facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|skypeuripreview|discordbot|slackbot/i.test(userAgent);

  if (isBot) {
    const title = data.title || 'ROOM Link Shortener';
    const image = data.image || 'https://i.imgur.com/8k3Ddag.jpeg';
    
    const botHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${data.url}" />
          <meta property="og:type" content="website" />
          <meta http-equiv="refresh" content="0;url=${data.url}">
        </head>
        <body>
          <p>Mengarahkan...</p>
        </body>
      </html>
    `;
    return res.setHeader('Content-Type', 'text/html').status(200).send(botHtml);
  }

  // Pengunjung biasa langsung di-redirect
  return res.redirect(302, data.url);
}
