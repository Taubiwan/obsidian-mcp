# obsidian-mcp

MCP server (Vercel serverless) exposing an Obsidian vault stored in a GitHub repo.
Source: `api/mcp.js`. Config via env vars `GITHUB_TOKEN`, `VAULT_REPO`, `VAULT_BRANCH`.

## 🔑 Secrets & clés API — lire avant d'en demander une

**Règle :** les VALEURS des clés ne vivent jamais dans une note, un fichier, ou Git.
Elles vivent dans le **cloud environment** (variables / API credentials) ou un
gestionnaire de secrets (Doppler / Infisical). Ne jamais demander à l'utilisateur
de coller une clé dans le chat, et ne jamais committer de secret.

**L'index (quoi / rangé où / utilisé par quoi) est dans Notion :**
Registre des API & secrets → https://app.notion.com/p/2498d4484699421b859f6478562d0186

**Pour utiliser une clé dans une session :**
1. Lis-la depuis l'environnement (`process.env.NOM` en JS, `$NOM` au shell). Les
   variables posées dans le cloud environment sont injectées dans chaque session.
2. Si elle est absente (`env | grep NOM` ne renvoie rien), **ne demande pas de la
   coller ici** : dis à l'utilisateur de la poser une fois dans les réglages de son
   environnement (claude.ai/code → Environment variables, ou API credentials), puis
   de relancer. Doc : https://code.claude.com/docs/en/cloud-environments#set-environment-variables

**Noms de variables attendus** (valeurs au coffre, pas ici) :

| Service | Variable | Rangé dans |
|---|---|---|
| ScrapeCreators | `SCRAPECREATORS_API_KEY` | cloud env — domaine `api.scrapecreators.com` à autoriser dans la politique réseau |
| Manus | `MANUS_API_KEY` | cloud env |
| n8n | `N8N_API_KEY` | cloud env |

**Déjà gérés par des connecteurs Claude (aucune clé à manipuler)** : Monid,
ElevenLabs, Notion, Gmail, Google Drive/Calendar, Lovable, monday, Zernio,
Fireflies. Connectés une fois côté claude.ai → utilisables sans clé en session.

Tenir le registre Notion à jour quand une clé est ajoutée, déplacée ou régénérée.
