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

    // Cek apakah yang mengunjungi link adalah Bot/Crawler Sosmed
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|facebookcatalog|twitterbot|whatsapp|telegrambot|linkedinbot|pinterest/i.test(userAgent);

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <title>${metaTitle}</title>
        <meta property="og:title" content="${metaTitle}">
        <meta property="og:description" content="Klik untuk melihat tautan">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://virginiaroom.biz.id/go?d=${d}">
        ${metaImage ? `<meta property="og:image" content="${metaImage}">` : ''}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${metaTitle}">

        ${!isBot ? `<meta http-equiv="refresh" content="0; url=${targetUrl}">` : ''}
      </head>
      <body>
        <p>Mengarahkan ke halaman tujuan...</p>
        ${!isBot ? `
        <script>
          window.location.href = "${targetUrl}";
        </script>
        ` : ''}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (err) {
    return res.status(400).send("Link tidak valid atau telah rusak.");
  }
}
