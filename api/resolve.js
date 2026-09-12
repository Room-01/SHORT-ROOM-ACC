import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { data, error } = await supabase
    .from('links')
    .select('url, title, image')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Link tidak ditemukan' });
  }

  // Jika yang meminta adalah Bot Facebook / Twitter / WhatsApp, berikan tampilan HTML dengan Open Graph Meta
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

  // Jika diakses manusia biasa, langsung berikan JSON URL aslinya untuk direarahkan
  return res.status(200).json({ url: data.url });
}
