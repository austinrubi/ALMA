import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function supabaseFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  return res.json();
}

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
      // Get the active season
      const seasons = await supabaseFetch('seasons?order=created_at.desc&limit=1');
      if (!seasons.length) return Response.json({ error: 'No active season' });
      const season = seasons[0];

      // Compute current week
      const start = new Date(season.start_date + 'T00:00:00Z');
      const now = new Date();
      const diffWeeks = Math.floor((now.getTime() - start.getTime()) / (7 * 86400000));
      const currentWeek = Math.max(1, Math.min(diffWeeks + 1, season.week_count));

      // Fetch matches, teams, team_members, push_tokens, profiles
      const [matches, teams, teamMembers, pushTokens, profiles] = await Promise.all([
        supabaseFetch(`matches?season_id=eq.${season.id}&select=*,result:match_results(*),plan:match_plans(*),seats:match_seats(*)`),
        supabaseFetch(`teams?season_id=eq.${season.id}`),
        supabaseFetch(`team_members?select=*,team:teams!inner(season_id)&team.season_id=eq.${season.id}`),
        supabaseFetch('push_tokens?select=*'),
        supabaseFetch('profiles?select=id,name,role'),
      ]);

      // Build team name lookup
      const teamName: Record<string, string> = {};
      for (const t of teams) teamName[t.id] = t.short_name;

      // Build user -> team mapping
      const userTeam: Record<string, string> = {};
      const teamCaptains: Record<string, string[]> = {};
      for (const tm of teamMembers) {
        userTeam[tm.user_id] = tm.team_id;
        if (tm.team_role === 'captain') {
          if (!teamCaptains[tm.team_id]) teamCaptains[tm.team_id] = [];
          teamCaptains[tm.team_id].push(tm.user_id);
        }
      }

      // Build token lookup: userId -> tokens[]
      const tokensByUser: Record<string, string[]> = {};
      for (const pt of pushTokens) {
        if (!tokensByUser[pt.user_id]) tokensByUser[pt.user_id] = [];
        tokensByUser[pt.user_id].push(pt.token);
      }

      // Analyze matches for the current week
      const weekMatches = matches.filter((m: any) => m.week === currentWeek);

      // Group by team matchup
      const matchupsByTeam: Record<string, { opp: string; isHome: boolean; tables: any[] }> = {};
      for (const m of weekMatches) {
        if (!matchupsByTeam[m.home_team_id]) matchupsByTeam[m.home_team_id] = { opp: m.away_team_id, isHome: true, tables: [] };
        if (!matchupsByTeam[m.away_team_id]) matchupsByTeam[m.away_team_id] = { opp: m.home_team_id, isHome: false, tables: [] };
        matchupsByTeam[m.home_team_id].tables.push(m);
        matchupsByTeam[m.away_team_id].tables.push(m);
      }

      // Build push messages
      const messages: { to: string; title: string; body: string }[] = [];
      const sent = new Set<string>();

      for (const userId of Object.keys(tokensByUser)) {
        const tokens = tokensByUser[userId];
        const myTeamId = userTeam[userId];
        if (!myTeamId || !tokens.length) continue;

        const matchup = matchupsByTeam[myTeamId];
        if (!matchup) continue;

        const oppName = teamName[matchup.opp] || 'TBD';
        const myTeamName = teamName[myTeamId] || 'Your team';
        const isCaptain = (teamCaptains[myTeamId] || []).includes(userId);
        const profile = profiles.find((p: any) => p.id === userId);
        const firstName = profile?.name?.split(' ')[0] || '';

        // Count outstanding items
        const totalTables = matchup.tables.length;
        const scored = matchup.tables.filter((t: any) => t.status === 'final').length;
        const withPlan = matchup.tables.filter((t: any) => {
          const plan = Array.isArray(t.plan) ? t.plan : (t.plan ? [t.plan] : []);
          return plan.length > 0 && plan[0].when_text;
        }).length;
        const seatedCount = matchup.tables.reduce((n: number, t: any) => {
          const seats = Array.isArray(t.seats) ? t.seats : (t.seats ? [t.seats] : []);
          const side = matchup.isHome ? 'home' : 'away';
          return n + seats.filter((s: any) => s.side === side && s.user_id).length;
        }, 0);
        const totalSeats = totalTables * 2;

        let title: string;
        let body: string;

        if (isCaptain) {
          // Captain message with outstanding items
          const issues: string[] = [];
          if (withPlan < totalTables) issues.push(`${totalTables - withPlan} table(s) need match details`);
          if (seatedCount < totalSeats) issues.push(`${totalSeats - seatedCount} seat(s) still open`);
          if (scored < totalTables) issues.push(`${totalTables - scored} score(s) to log`);

          title = `Captain: Week ${currentWeek} vs. ${oppName}`;
          if (issues.length) {
            body = `${firstName}, ${issues.join(', ')}. Open the app to address these.`;
          } else {
            body = `${firstName}, everything is set for this week! All tables have details, seats, and scores.`;
          }
        } else {
          // Player message
          title = `Week ${currentWeek}: ${myTeamName} vs. ${oppName}`;
          body = matchup.isHome
            ? `${firstName}, you're hosting this week. Check the app for your table assignment and match details.`
            : `${firstName}, you're away this week. Check the app to pick your table.`;
        }

        for (const token of tokens) {
          const key = `${token}-${currentWeek}`;
          if (sent.has(key)) continue;
          sent.add(key);
          messages.push({ to: token, title, body });
        }
      }

      // Send via Expo Push API
      if (messages.length > 0) {
        const chunks: any[][] = [];
        for (let i = 0; i < messages.length; i += 100) {
          chunks.push(messages.slice(i, i + 100));
        }

        for (const chunk of chunks) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chunk.map(m => ({
              to: m.to,
              sound: 'default',
              title: m.title,
              body: m.body,
            }))),
          });
        }
      }

      return Response.json({
        sent: messages.length,
        week: currentWeek,
      });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  },
};
