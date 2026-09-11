export default function handler(req, res) {
  const { url, title, image } = req.query;

  if (!url) {
    return res.redirect(302, '/');
  }

  const metaTitle = title || "Link Preview";
  const metaImage = image || "";
  const targetUrl = decodeURIComponent(url);

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <title>${metaTitle}</title>
      <meta property="og:title" content="${metaTitle}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="${targetUrl}">
      ${metaImage ? `<meta property="og:image" content="${metaImage}">` : ''}

      <meta http-equiv="refresh" content="0; url=${targetUrl}">
    </head>
    <body>
      <p>Mengarahkan ke halaman tujuan...</p>
      <script>
        window.location.href = "${targetUrl}";
      </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
