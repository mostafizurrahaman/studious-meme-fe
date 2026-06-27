const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0f172a" />
  <title>Malamal | Offline</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #020617;
      --panel: rgba(15, 23, 42, 0.86);
      --panel-soft: rgba(255, 255, 255, 0.06);
      --border: rgba(255, 255, 255, 0.1);
      --text: rgba(255, 255, 255, 0.92);
      --muted: rgba(255, 255, 255, 0.68);
      --accent: #f97316;
      --accent-2: #38bdf8;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 28%),
        radial-gradient(circle at 18% 82%, rgba(249, 115, 22, 0.14), transparent 24%),
        linear-gradient(180deg, #07111f 0%, var(--bg) 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 24px;
      -webkit-overflow-scrolling: touch;
    }

    .wrap {
      width: min(900px, 100%);
      position: relative;
    }

    .glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.85;
    }

    .glow::before,
    .glow::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      filter: blur(60px);
    }

    .glow::before {
      top: -40px;
      right: 8%;
      width: 220px;
      height: 220px;
      background: rgba(56, 189, 248, 0.18);
    }

    .glow::after {
      bottom: -80px;
      left: 12%;
      width: 280px;
      height: 280px;
      background: rgba(249, 115, 22, 0.14);
    }

    .card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 32px;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(24px);
      box-shadow: 0 30px 90px -54px rgba(15, 23, 42, 0.95);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px;
    }

    .panel {
      position: relative;
      overflow: hidden;
      border-radius: 28px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(8, 15, 27, 0.98));
      padding: 22px;
    }

    .panel.alt {
      background: linear-gradient(180deg, rgba(2, 6, 23, 0.84), rgba(8, 15, 27, 0.98));
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.82);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #f87171;
      box-shadow: 0 0 0 7px rgba(248, 113, 113, 0.14);
    }

    h1 {
      margin: 12px 0 0;
      font-size: clamp(2rem, 4vw, 3.2rem);
      line-height: 0.95;
      letter-spacing: -0.04em;
      font-weight: 900;
    }

    .eyebrow {
      margin-top: 14px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.36em;
      text-transform: uppercase;
      color: rgba(191, 219, 254, 0.82);
    }

    .desc {
      max-width: 56ch;
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.7;
    }

    .checklist {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 22px;
    }

    .chip {
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      padding: 12px;
      color: rgba(255, 255, 255, 0.82);
      font-size: 12px;
      line-height: 1.5;
    }

    .status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      border-radius: 28px;
      padding: 16px;
    }

    .status strong {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .status span {
      display: block;
      margin-top: 4px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      line-height: 1.6;
    }

    .signal {
      width: 58px;
      height: 58px;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background:
        radial-gradient(circle at 35% 30%, rgba(56, 189, 248, 0.24), transparent 36%),
        linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(14, 165, 233, 0.06));
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      box-shadow: 0 18px 50px -24px rgba(56, 189, 248, 0.75);
      position: relative;
    }

    .signal::before {
      content: "";
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid rgba(186, 230, 253, 0.95);
      border-top-color: transparent;
      border-left-color: transparent;
      transform: rotate(-45deg);
      opacity: 0.95;
    }

    .signal::after {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .actions {
      margin-top: 22px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .btn {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn.primary {
      color: #020617;
      background: linear-gradient(135deg, #ffffff, #e2e8f0);
      box-shadow: 0 14px 30px -20px rgba(255, 255, 255, 0.55);
    }

    .btn.secondary {
      color: rgba(255, 255, 255, 0.92);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .offline-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.68);
      font-size: 12px;
      font-weight: 700;
    }

    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
      }
    }

    @media (max-width: 900px) {
      body {
        align-items: flex-start;
        padding: 16px;
      }

      .card {
        grid-template-columns: 1fr;
        gap: 10px;
        padding: 10px;
      }

      .checklist {
        grid-template-columns: 1fr;
      }

      .panel {
        padding: 18px;
      }

      h1 {
        font-size: clamp(2.1rem, 9vw, 3rem);
      }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="glow"></div>
    <section class="card" aria-labelledby="offline-title">
      <article class="panel">
        <div class="badge"><span class="dot"></span> Connection lost</div>
        <div class="eyebrow">Malamal offline mode</div>
        <h1 id="offline-title">You&apos;re offline</h1>
        <p class="desc">
          We need an internet connection to load live products, orders, dashboard data, and updates.
        </p>
        <div class="offline-tag"><span class="pulse"></span> Browser connection unavailable</div>
        <div class="checklist">
          <div class="chip">Check Wi-Fi or mobile data</div>
          <div class="chip">Turn off airplane mode</div>
          <div class="chip">Tap reload when connected</div>
        </div>
      </article>

      <article class="panel alt">
        <div class="status">
          <div class="signal" aria-hidden="true"></div>
          <div>
            <strong>No internet connection</strong>
            <span>Malamal will come back once your network is restored.</span>
          </div>
        </div>

        <div style="height: 18px"></div>

        <div class="status">
          <div>
            <strong>What to do</strong>
            <span>Reconnect to Wi-Fi, hotspot, or mobile data.</span>
          </div>
        </div>

        <div style="height: 12px"></div>

        <div class="status">
          <div>
            <strong>Then</strong>
            <span>Refresh the page to resume browsing.</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn primary" onclick="location.reload()">Try again</button>
          <a class="btn secondary" href="/">Go home</a>
        </div>
      </article>
    </section>
  </main>
</body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(request).catch(
      () =>
        new Response(OFFLINE_HTML, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }),
    ),
  );
});
