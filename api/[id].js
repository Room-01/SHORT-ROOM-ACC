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
    const description = data.description || "Klik untuk mengunjungi tautan tujuan."; 
    const image = data.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
    const videoUrl = data.video || "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-lights-31954-large.mp4"; // Dinamis dari database

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = /bot|crawl|slifer|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|discordbot/i.test(userAgent);

    if (isBot) {
      // Halaman khusus untuk bot/debugger agar preview tetap rapi
      const html = `
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <meta property="og:site_name" content="Shortener" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:url" content="https://${req.headers.host}/${id}" />
            <meta property="og:image" content="${image}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${image}" />
          </head>
          <body>
            <p>Mengarahkan ke tujuan...</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // LANDING PAGE VIDEO UNTUK PENGGUNA BIASA (Durasi 4 Detik)
    const landingHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .container {
            width: 90%;
            max-width: 600px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          }
          h1 {
            font-size: 1.1rem;
            margin-bottom: 15px;
            font-weight: 700;
          }
          .video-wrapper {
            position: relative;
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            background: #000;
            margin-bottom: 15px;
          }
          video {
            width: 100%;
            max-height: 300px;
            display: block;
            object-fit: cover;
          }
          .timer-text {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-bottom: 15px;
          }
          .btn-skip {
            background: #10b981;
            color: #000;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 0.9rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.2s;
          }
          .btn-skip:hover {
            background: #059669;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <div class="video-wrapper">
            <video id="landingVideo" autoplay muted playsinline>
              <source src="${videoUrl}" type="video/mp4">
              Browser Anda tidak mendukung pemutaran video.
            </video>
          </div>
          <div class="timer-text" id="timerText">Mengarahkan otomatis dalam <span id="countdown">4</span> detik...</div>
          <a href="${targetUrl}" class="btn-skip" id="skipBtn">Lanjutkan Sekarang</a>
        </div>

        <script>
          let timeLeft = 4;
          const countdownEl = document.getElementById('countdown');
          const targetUrl = "${targetUrl}";

          const timer = setInterval(() => {
            timeLeft--;
            countdownEl.innerText = timeLeft;
            if (timeLeft <= 0) {
              clearInterval(timer);
              window.location.replace(targetUrl);
            }
          }, 1000);
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(landingHtml);

  } catch (err) {
    console.error('Redirect Server Error:', err);
    return res.status(500).send('Terjadi kesalahan pada server.');
  }
}
