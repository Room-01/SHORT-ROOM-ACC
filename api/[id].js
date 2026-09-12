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
    const title = data.title || "Private Video";
    const description = data.description || "Klik untuk mengunjungi tautan tujuan."; 
    const image = data.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
    
    // ==========================================
    // MASUKKAN URL VIDEO ANDA DI SINI (MANUAL)
    // ==========================================
    const videoUrl = "https://res.cloudinary.com/fflg0fvq/video/upload/XNXX_geile_nachbarin_und_jungspund_machen_es_sich_zusammen_und_filmen_mit_dem_handy_SD_online-video-cutter.com.mp4"; 

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = /bot|crawl|slifer|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|discordbot/i.test(userAgent);

    if (isBot) {
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

    // LANDING PAGE HANYA VIDEO FULLSCREEN
    const landingHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          .bg-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
          }
        </style>
      </head>
      <body>

        <!-- Video Background Fullscreen Tanpa Teks/Tombol -->
        <video id="landingVideo" class="bg-video" autoplay muted playsinline loop>
          <source src="${videoUrl}" type="video/mp4">
          Browser Anda tidak mendukung pemutaran video.
        </video>

        <script>
          let timeLeft = 4;
          const targetUrl = "${targetUrl}";
          const landingVideo = document.getElementById('landingVideo');

          // Klik di mana saja pada video akan langsung melompat ke target URL
          landingVideo.addEventListener('click', () => {
            window.location.href = targetUrl;
          });

          // Redirect otomatis setelah 4 detik
          const timer = setInterval(() => {
            timeLeft--;
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
