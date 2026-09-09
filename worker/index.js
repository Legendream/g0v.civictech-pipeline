// 留言區的後端。只處理 /api/comments，其餘一律交給靜態資源（env.ASSETS）。
// 正文（五個內容頁）永遠是 Astro 建置出來的靜態 HTML，這支程式不碰、不攔截。
//
// 不記錄請求方 IP：整支程式沒有讀取 cf-connecting-ip 或任何 IP 相關欄位，
// 濫用防制交給 Turnstile 與 Cloudflare 自己的規則，不落地到這支程式或資料庫。

const MAX_BODY_LENGTH = 2000;
const MAX_AUTHOR_LENGTH = 60;

// 留言區目前只在 about 頁、只有中文（見站①驗收條件 B1、B7）。
// 白名單擋掉亂打的 page/locale，不然任何字串都能建出查不到、也清不掉的孤兒留言。
const ALLOWED_PAGES = ['about'];
const ALLOWED_LOCALES = ['zh'];

function isValidPageAndLocale(page, locale) {
  return ALLOWED_PAGES.includes(page) && ALLOWED_LOCALES.includes(locale);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

async function verifyTurnstile(token, secret) {
  if (!token || !secret) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  const result = await res.json();
  return result.success === true;
}

async function handleGet(url, env) {
  const page = url.searchParams.get('page');
  const locale = url.searchParams.get('locale');
  if (!isValidPageAndLocale(page, locale)) {
    return json({ error: 'page 或 locale 不是這個站支援的值' }, 400);
  }

  const { results } = await env.DB.prepare(
    `SELECT id, author, body, created_at FROM comments
     WHERE page = ?1 AND locale = ?2 AND status = 'visible'
     ORDER BY created_at ASC`
  ).bind(page, locale).all();

  return json({ comments: results });
}

async function handlePost(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: '請求格式錯誤' }, 400);
  }

  const { page, locale, author, body, turnstileToken } = payload ?? {};

  if (!isValidPageAndLocale(page, locale)) {
    return json({ error: 'page 或 locale 不是這個站支援的值' }, 400);
  }
  const trimmedBody = typeof body === 'string' ? body.trim() : '';
  if (trimmedBody === '') {
    return json({ error: '留言內容不能是空的' }, 400);
  }
  if (trimmedBody.length > MAX_BODY_LENGTH) {
    return json({ error: '留言內容過長' }, 400);
  }

  const passedTurnstile = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY);
  if (!passedTurnstile) {
    return json({ error: '機器人驗證未通過' }, 403);
  }

  const trimmedAuthor =
    typeof author === 'string' && author.trim() !== ''
      ? author.trim().slice(0, MAX_AUTHOR_LENGTH)
      : null;

  await env.DB.prepare(
    `INSERT INTO comments (page, locale, author, body) VALUES (?1, ?2, ?3, ?4)`
  ).bind(page, locale, trimmedAuthor, trimmedBody).run();

  return json({ ok: true }, 201);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/comments') {
      if (request.method === 'GET') return handleGet(url, env);
      if (request.method === 'POST') return handlePost(request, env);
      return json({ error: 'method not allowed' }, 405);
    }


    return env.ASSETS.fetch(request);
  },
};
