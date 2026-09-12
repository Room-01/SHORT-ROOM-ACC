const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  // Deteksi semua jenis bot medsos dan preview scraper
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
          <meta property="og:url" content="${data.url}" />
          <meta property="og:type" content="website" />
          <meta http-equiv="refresh" content="0;url=${data.url}">
        </head>
        <body><p>Redirecting...</p></body>
      </html>
    `);
  }
