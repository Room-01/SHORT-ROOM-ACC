export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect(302, '/');
  }

  const SUPABASE_URL = 'https://wpamzjjnrbazrrirojmu.supabase.co'; 
  const SUPABASE_KEY = 'sb_publishable_LNIl6ubeO_MOe9JxyLl2TQ_H_MwuqoJ';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/links?id=eq.${id}&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const dataList = await response.json();

    if (!dataList || dataList.length === 0) {
      return res.status(404).send("Link tidak ditemukan atau telah dihapus.");
    }

    const data = dataList[0];
    const targetUrl = data.url;
    const metaTitle = data.title || "Link Preview";
    const metaImage = data.image || "";

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|facebookcatalog|twitterbot|whatsapp|telegrambot|linkedinbot|pinterest/i.test(userAgent);

    if (!isBot) {
      return res.redirect(302, targetUrl);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${metaTitle}</title>
        <meta property="og:title" content="${metaTitle}">
        <meta property="og:description" content="Klik untuk melihat tautan">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://virginiaroom.biz.id/go?id=${id}">
        ${metaImage ? `<meta property="og:image" content="${metaImage}">` : ''}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${metaTitle}">
      </head>
      <body></body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (err) {
    return res.status(500).send("Terjadi kesalahan server.");
  }
}
