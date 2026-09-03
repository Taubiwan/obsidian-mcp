import { scrapeUrl, toMarkdown, slugify } from '../lib/scraper.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VAULT_REPO = process.env.VAULT_REPO;
const VAULT_BRANCH = process.env.VAULT_BRANCH || 'main';

async function ghGet(path) {
  const url = `https://api.github.com/repos/${VAULT_REPO}/contents/${path}?ref=${VAULT_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function ghPut(path, content, sha) {
  const body = { message: `mcp: update ${path}`, content: Buffer.from(content).toString('base64'), branch: VAULT_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${VAULT_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function read_note(path) {
  const data = await ghGet(path);
  if (!data) return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

async function write_note(path, content) {
  const existing = await ghGet(path);
  await ghPut(path, content, existing?.sha);
  return 'OK';
}

async function append_note(path, content) {
  const existing = await ghGet(path);
  const currentContent = existing ? Buffer.from(existing.content, 'base64').toString('utf-8') : '';
  await ghPut(path, currentContent + content, existing?.sha);
  return 'OK';
}

async function list_folder(folder) {
  const url = `https://api.github.com/repos/${VAULT_REPO}/contents/${folder}?ref=${VAULT_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map((f) => ({ name: f.name, type: f.type })) : [];
}

async function get_daily_sessions(date) {
  const content = await read_note(`Sessions/${date}.md`);
  if (!content) return `Aucune session enregistrée pour le ${date}.`;
  return content;
}

async function scrape_url(url, maxChars) {
  const result = await scrapeUrl(url, { maxChars });
  return toMarkdown(result);
}

async function scrape_to_note(url, path, folder, maxChars) {
  const result = await scrapeUrl(url, { maxChars });
  const dir = (folder || 'Sources').replace(/^\/+|\/+$/g, '');
  const target = path || `${dir}/${new Date().toISOString().slice(0, 10)}-${slugify(result.title)}.md`;
  await write_note(target, toMarkdown(result));
  return [
    `Note créée : ${target}`,
    `Source : ${url}`,
    `Type : ${result.kind}`,
    result.truncated ? 'Contenu tronqué (augmente max_chars pour tout garder).' : null,
  ].filter(Boolean).join('\n');
}

const TOOLS = [
  { name: 'read_note', description: "Lire le contenu d'une note Obsidian", inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'write_note', description: "Écrire (ou écraser) une note Obsidian", inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
  { name: 'append_note', description: "Ajouter du contenu à la fin d'une note Obsidian", inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
  { name: 'list_folder', description: "Lister les fichiers d'un dossier du vault", inputSchema: { type: 'object', properties: { folder: { type: 'string' } }, required: ['folder'] } },
  { name: 'get_daily_sessions', description: "Résumés de sessions Claude Code du jour", inputSchema: { type: 'object', properties: { date: { type: 'string' } }, required: ['date'] } },
  { name: 'scrape_url', description: "Récupérer le contenu d'une URL (article, post X/Twitter, vidéo YouTube avec transcript) en Markdown propre", inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'URL http(s) à récupérer' }, max_chars: { type: 'number', description: 'Longueur max du contenu (défaut 20000)' } }, required: ['url'] } },
  { name: 'scrape_to_note', description: "Récupérer une URL et l'enregistrer directement comme note Obsidian (frontmatter source/auteur/date)", inputSchema: { type: 'object', properties: { url: { type: 'string' }, path: { type: 'string', description: 'Chemin exact de la note. Sinon généré depuis le titre.' }, folder: { type: 'string', description: 'Dossier cible si path absent (défaut : Sources)' }, max_chars: { type: 'number' } }, required: ['url'] } },
];

async function handleToolCall(name, args) {
  switch (name) {
    case 'read_note': return read_note(args.path);
    case 'write_note': return write_note(args.path, args.content);
    case 'append_note': return append_note(args.path, args.content);
    case 'list_folder': return list_folder(args.folder);
    case 'get_daily_sessions': return get_daily_sessions(args.date);
    case 'scrape_url': return scrape_url(args.url, args.max_chars);
    case 'scrape_to_note': return scrape_to_note(args.url, args.path, args.folder, args.max_chars);
    default: throw new Error(`Outil inconnu : ${name}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.json({ status: 'ok', server: 'obsidian-mcp', repo: VAULT_REPO });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { method, params, id } = req.body;
  try {
    let result;
    switch (method) {
      case 'initialize': result = { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'obsidian-mcp', version: '1.0.0' } }; break;
      case 'notifications/initialized': return res.status(200).end();
      case 'ping': result = {}; break;
      case 'tools/list': result = { tools: TOOLS }; break;
      case 'tools/call': {
        const toolResult = await handleToolCall(params.name, params.arguments || {});
        result = { content: [{ type: 'text', text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2) }] };
        break;
      }
      default: return res.status(200).json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Méthode inconnue : ${method}` } });
    }
    return res.status(200).json({ jsonrpc: '2.0', id, result });
  } catch (err) {
    return res.status(200).json({ jsonrpc: '2.0', id, error: { code: -32603, message: err.message } });
  }
}
