import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export default {
  async fetch(req: Request) {
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
      const { userId } = await req.json();
      if (!userId) {
        return Response.json({ error: 'Missing userId' }, { status: 400 });
      }

      // Check Stripe for completed checkout sessions with this user's metadata
      const params = new URLSearchParams();
      params.append('limit', '10');

      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          },
        }
      );
      const sessions = await stripeRes.json();

      // Find a completed session for this user
      const paid = sessions.data?.find(
        (s: any) => s.metadata?.user_id === userId && s.payment_status === 'paid'
      );

      if (!paid) {
        return Response.json({ paid: false, error: 'No completed payment found' });
      }

      // Mark dues as paid in profiles
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ dues_paid: true }),
        }
      );

      return Response.json({ paid: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  },
};
