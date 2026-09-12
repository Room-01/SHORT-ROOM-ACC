import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Ambil path dari URL (misal: /abcde menjadi abcde)
  let id = req.query.id;
  
  if (!id && req.url) {
    const parts = req.url.split('?')[0].split('/').filter(Boolean);
    if (parts.length > 0) {
      id = parts[parts.length - 1];
    }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  // Jika tidak ada ID (artinya membuka domain utama langsung)
  if (!id || id === 'index.html') {
    const html = `
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
    `;
    return res.setHeader('Content-Type', 'text/html').status(200).send(html);
  }

  // Jika ada ID, cari ke database Supabase
  const { data, error } = await supabase
    .from('links')
    .select('url, title, image')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).send("<h2 style='text-align:center; margin-top:20vh; font-family:sans-serif;'>Link tidak ditemukan atau sudah kadaluarsa.</h2>");
  }

  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|SkypeUriPreview/i.test(userAgent);

  if (isBot) {
    const title = data.title || 'ROOM Link Shortener';
    const image = data.image || 'https://i.imgur.com/8k3Ddag.jpeg';
    
    const html = `
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
        <body>
          <p>Mengarahkan ke <a href="${data.url}">${data.url}</a>...</p>
        </body>
      </html>
    `;
    return res.setHeader('Content-Type', 'text/html').status(200).send(html);
  }

  // Jika manusia biasa, langsung arahkan ke URL tujuan
  return res.redirect(302, data.url);
}
