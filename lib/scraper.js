// Récupération de contenu web → Markdown propre.
// Gère : articles/pages HTML, posts X (Twitter), vidéos YouTube (+ transcript).

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const FETCH_TIMEOUT_MS = 15000;
const MAX_BYTES = 2_000_000;
export const DEFAULT_MAX_CHARS = 20000;

// --- garde-fou : pas de fetch vers du réseau interne (SSRF) ---
export function assertPublicUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error(`URL invalide : ${url}`);
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Seuls http(s) sont acceptés');
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const isPrivate =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.internal') ||
    host === '::1' ||
    host === '0.0.0.0' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^fe80:/i.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host);
  if (isPrivate) throw new Error(`Hôte privé ou local refusé : ${host}`);
  return u;
}

async function httpGet(url, { headers = {}, json = false, guard = true } = {}) {
  if (guard) assertPublicUrl(url);
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8', ...headers },
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  const text = (await res.text()).slice(0, MAX_BYTES);
  return json ? JSON.parse(text) : text;
}

// --- HTML → Markdown (sans dépendance) ---
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', eacute: 'é', egrave: 'è',
  ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â', ccedil: 'ç', ugrave: 'ù', ucirc: 'û', ocirc: 'ô',
  icirc: 'î', iuml: 'ï', deg: '°', euro: '€', middot: '·', bull: '•', copy: '©', reg: '®', trade: '™',
};

function safeChar(code) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+\d?);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

const stripTags = (s) => s.replace(/<[^>]+>/g, '');

export function htmlToMarkdown(html) {
  let h = html;
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(
    /<(script|style|noscript|svg|iframe|form|nav|footer|aside|template)\b[^>]*>[\s\S]*?<\/\1>/gi,
    ''
  );

  // isoler le contenu principal quand la page le balise
  const main =
    h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) || h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) h = main[1];
  else {
    const body = h.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    if (body) h = body[1];
  }

  h = h.replace(/<br\s*\/?>/gi, '\n');
  h = h.replace(/<h([1-6])\b[^>]*>/gi, (_, n) => `\n\n${'#'.repeat(Number(n))} `);
  h = h.replace(/<li\b[^>]*>/gi, '\n- ');
  h = h.replace(/<blockquote\b[^>]*>/gi, '\n> ');
  h = h.replace(/<\/(p|div|section|tr|h[1-6]|li|blockquote|pre|ul|ol)>/gi, '\n\n');
  h = h.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${stripTags(t).trim()}**`);
  h = h.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `_${stripTags(t).trim()}_`);
  h = h.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${stripTags(t)}\``);
  h = h.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
    const t = stripTags(label).trim();
    return t ? `[${t}](${href})` : '';
  });
  h = h.replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, '\n![]($1)\n');

  h = decodeEntities(stripTags(h));
  return h
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function metaTag(html, ...names) {
  for (const name of names) {
    const re = new RegExp(
      `<meta\\b[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    const alt = new RegExp(
      `<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`,
      'i'
    );
    const m = html.match(re) || html.match(alt);
    if (m?.[1]) return decodeEntities(m[1]).trim();
  }
  return null;
}

// --- X / Twitter ---
export function twitterStatusId(url) {
  const m = String(url).match(/(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/(\d+)/i);
  return m ? m[1] : null;
}

// jeton attendu par l'API de syndication publique de X
export function syndicationToken(id) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

function bestVideoUrl(variants = []) {
  const mp4 = variants.filter((v) => (v.type || v.content_type) === 'video/mp4');
  const sorted = mp4.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
  return (sorted[0] || mp4[0] || variants[0])?.src || (sorted[0] || variants[0])?.url || null;
}

async function scrapeTweet(id, url) {
  // 1) API de syndication (celle des tweets embarqués)
  try {
    const d = await httpGet(
      `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${syndicationToken(id)}&lang=en`,
      { json: true, headers: { Accept: 'application/json' } }
    );
    if (d?.text) {
      const media = [
        ...(d.photos || []).map((p) => p.url),
        ...(d.video ? [bestVideoUrl(d.video.variants)] : []),
      ].filter(Boolean);
      return {
        kind: 'tweet',
        url,
        title: `Post de @${d.user?.screen_name} (${id})`,
        author: d.user ? `${d.user.name} (@${d.user.screen_name})` : null,
        date: d.created_at || null,
        media,
        content: d.text,
      };
    }
  } catch {
    /* on bascule sur le miroir */
  }

  // 2) miroir fxtwitter
  const fx = await httpGet(`https://api.fxtwitter.com/i/status/${id}`, {
    json: true,
    headers: { Accept: 'application/json' },
  });
  const t = fx?.tweet;
  if (!t) throw new Error(`Tweet ${id} illisible (syndication + fxtwitter en échec)`);
  const media = [
    ...(t.media?.photos || []).map((p) => p.url),
    ...(t.media?.videos || []).map((v) => v.url),
  ].filter(Boolean);
  return {
    kind: 'tweet',
    url,
    title: `Post de @${t.author?.screen_name} (${id})`,
    author: t.author ? `${t.author.name} (@${t.author.screen_name})` : null,
    date: t.created_at || null,
    media,
    content: t.text || '',
  };
}

// --- YouTube ---
export function youtubeId(url) {
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

async function youtubeTranscript(page) {
  const m = page.match(/"captionTracks":(\[.*?\])/);
  if (!m) return null;
  let tracks;
  try {
    tracks = JSON.parse(m[1]);
  } catch {
    return null;
  }
  const track =
    tracks.find((t) => /^fr/.test(t.languageCode)) ||
    tracks.find((t) => /^en/.test(t.languageCode)) ||
    tracks[0];
  if (!track?.baseUrl) return null;
  const data = await httpGet(`${track.baseUrl}&fmt=json3`, { json: true });
  const text = (data.events || [])
    .flatMap((e) => (e.segs || []).map((s) => s.utf8 || ''))
    .join('')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return text || null;
}

async function scrapeYouTube(id, url) {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const meta = await httpGet(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    { json: true }
  ).catch(() => null);
  const page = await httpGet(`${watch}&hl=fr`).catch(() => '');
  const transcript = page ? await youtubeTranscript(page).catch(() => null) : null;
  const description = page ? metaTag(page, 'og:description', 'description') : null;

  const parts = [];
  if (description) parts.push(`## Description\n\n${description}`);
  parts.push(
    transcript
      ? `## Transcript\n\n${transcript}`
      : '## Transcript\n\n_Indisponible (pas de sous-titres exposés pour cette vidéo)._'
  );

  return {
    kind: 'youtube',
    url,
    title: meta?.title || (page ? metaTag(page, 'og:title') : null) || `Vidéo YouTube ${id}`,
    author: meta?.author_name || null,
    date: page ? metaTag(page, 'datePublished', 'uploadDate') : null,
    media: [watch],
    content: parts.join('\n\n'),
  };
}

// --- page générique ---
async function scrapeArticle(url) {
  const html = await httpGet(url, { headers: { Accept: 'text/html,application/xhtml+xml' } });
  const rawTitle = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return {
    kind: 'article',
    url,
    title: metaTag(html, 'og:title', 'twitter:title') || (rawTitle ? decodeEntities(rawTitle).trim() : url),
    author: metaTag(html, 'author', 'article:author', 'og:site_name'),
    date: metaTag(html, 'article:published_time', 'datePublished', 'date'),
    media: [metaTag(html, 'og:image')].filter(Boolean),
    content: htmlToMarkdown(html),
  };
}

/**
 * Récupère le contenu d'une URL et le renvoie normalisé.
 * @returns {Promise<{kind,url,title,author,date,media,content,truncated}>}
 */
export async function scrapeUrl(url, { maxChars = DEFAULT_MAX_CHARS } = {}) {
  assertPublicUrl(url);
  const tweetId = twitterStatusId(url);
  const ytId = youtubeId(url);
  const result = tweetId
    ? await scrapeTweet(tweetId, url)
    : ytId
      ? await scrapeYouTube(ytId, url)
      : await scrapeArticle(url);

  const limit = Math.max(500, Number(maxChars) || DEFAULT_MAX_CHARS);
  result.truncated = result.content.length > limit;
  if (result.truncated) result.content = `${result.content.slice(0, limit)}\n\n[… contenu tronqué]`;
  return result;
}

const yaml = (v) => `"${String(v).replace(/"/g, '\\"')}"`;

/** Formate un résultat de scrape en note Markdown (frontmatter + corps). */
export function toMarkdown(r) {
  const front = [
    '---',
    `source: ${yaml(r.url)}`,
    `type: ${r.kind}`,
    `title: ${yaml(r.title || '')}`,
    r.author ? `author: ${yaml(r.author)}` : null,
    r.date ? `published: ${yaml(r.date)}` : null,
    `scraped: ${yaml(new Date().toISOString())}`,
    r.media?.length ? `media:\n${r.media.map((m) => `  - ${yaml(m)}`).join('\n')}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');
  return `${front}\n\n# ${r.title || r.url}\n\n${r.content}\n`;
}

/** Nom de fichier sûr pour le vault, dérivé du titre. */
export function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'sans-titre';
}
