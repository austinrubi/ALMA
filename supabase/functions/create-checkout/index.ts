import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const { userId, email, name } = await req.json();

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'Missing userId or email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create Stripe Checkout Session via REST API (no npm needed in Deno)
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    // Stripe requires https:// URLs — redirect to our Edge Function which shows
    // a "return to app" page and auto-attempts the alma:// deep link.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    params.append('success_url', `${supabaseUrl}/functions/v1/payment-redirect?status=complete`);
    params.append('cancel_url', `${supabaseUrl}/functions/v1/payment-redirect?status=cancelled`);
    params.append('customer_email', email);
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', 'ALMA Season Dues');
    params.append('line_items[0][price_data][product_data][description]', 'Season registration fee');
    params.append('line_items[0][price_data][unit_amount]', '50'); // $0.50 in cents (Stripe minimum)
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[user_id]', userId);
    params.append('metadata[type]', 'season_dues');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
