export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // GET → 获取排行榜
  if (request.method === 'GET') {
    try {
      const { results } = await DB.prepare(
        'SELECT nickname, duration, deaths, created_at FROM leaderboard ORDER BY duration ASC LIMIT 50'
      ).all();
      return new Response(JSON.stringify(results), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  // POST → 提交记录
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { nickname, duration, deaths } = body;
      if (!nickname || duration == null || deaths == null) {
        return new Response(JSON.stringify({ error: '缺少参数' }), { status: 400, headers });
      }
      await DB.prepare(
        'INSERT INTO leaderboard (nickname, duration, deaths) VALUES (?, ?, ?)'
      ).bind(nickname, duration, deaths).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
