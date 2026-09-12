import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  // Vercel otomatis menangkap parameter dari nama file [id].js
  const { id } = req.query;

  if (!id || id === 'index.html') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ROOM | Link Shortener</title>
          <meta property="og:title" content="ROOM | Link Shortener" />
          <meta property="og:image" content="https://i.imgur.com/8k3Ddag.jpeg" />
        </head>
        <body>
          <script>window.location.href = "https://short-room-acc.vercel.app";</script>
        </body>
      </html>
    `);
  }

  // Cari data di Supabase
  const { data, error } = await supabase
    .from('links')
    .select('url, title, image')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).send("<h2>Link tidak ditemukan.</h2>");
  }

  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = /facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|skypeuripreview|discordbot/i.test(userAgent);

  if (isBot) {
    const title = data.title || 'ROOM Link Shortener';
    const image = data.image || 'https://i.imgur.com/8k3Ddag.jpeg';
    
    return res.setHeader('Content-Type', 'text/html').status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${data.url}" />
          <meta property="og:type" content="website" />
          <meta http-equiv="refresh" content="0;url=${data.url}">
        </head>
        <body><p>Redirecting...</p></body>
      </html>
    `);
  }

  return res.redirect(302, data.url);
}
