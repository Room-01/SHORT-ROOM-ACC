export default function handler(req, res) {
  const { d } = req.query;

  if (!d) {
    return res.redirect(302, '/');
  }

  try {
    const decodedString = decodeURIComponent(atob(d));
    const data = JSON.parse(decodedString);

    const targetUrl = data.u;
    const metaTitle = data.t || "Link Preview";
    const metaImage = data.i || "";

    // Cek apakah pengunjung adalah Bot/Crawler Sosmed
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|facebookcatalog|twitterbot|whatsapp|telegrambot|linkedinbot|pinterest/i.test(userAgent);

    // Jika BUKAN bot (manusia/browser biasa), LANGSUNG REDIRECT tanpa landing page
    if (!isBot) {
      return res.redirect(302, targetUrl);
    }

    // Jika BOT sosmed, beri data HTML Meta Tags agar preview muncul
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${metaTitle}</title>
        <meta property="og:title" content="${metaTitle}">
        <meta property="og:description" content="Klik untuk melihat tautan">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://virginiaroom.biz.id/go?d=${d}">
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
    return res.status(400).send("Link tidak valid atau telah rusak.");
  }
}
