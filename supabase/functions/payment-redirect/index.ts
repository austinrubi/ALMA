import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// This Edge Function serves as the Stripe success/cancel redirect page.
// It shows a brief message and attempts to redirect back to the ALMA app
// via the custom URL scheme. The app's polling will pick up the payment.

export default {
  async fetch(req: Request) {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'complete';
    const cancelled = status === 'cancelled';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ALMA Mahjong</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #E8F0EC;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #0F2230; margin-bottom: 8px; }
    p { font-size: 15px; color: #6B7C85; line-height: 1.5; margin-bottom: 20px; }
    .btn {
      display: inline-block;
      background: #1B5E6B;
      color: white;
      font-size: 16px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 999px;
      text-decoration: none;
      margin-top: 8px;
    }
    .btn:hover { opacity: 0.9; }
    .sub { font-size: 13px; color: #9CA8AE; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${cancelled ? '↩️' : '✓'}</div>
    <h1>${cancelled ? 'Payment Cancelled' : 'Payment Complete!'}</h1>
    <p>${cancelled
      ? 'No charge was made. You can try again from the app.'
      : 'Your season dues have been received. Head back to the app to get started.'
    }</p>
    <a class="btn" href="alma://payment-${cancelled ? 'cancel' : 'success'}">Open ALMA App</a>
    <p class="sub">If the button doesn't work, just switch back to the ALMA app manually.</p>
  </div>
  ${!cancelled ? `<script>
    // Auto-attempt deep link after a short delay
    setTimeout(function() { window.location.href = 'alma://payment-success'; }, 1500);
  </script>` : ''}
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
