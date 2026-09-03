# obsidian-mcp

Serveur MCP (JSON-RPC sur Vercel) qui expose un vault Obsidian stocké dans un dépôt
GitHub, plus un scraper de contenu web pour capturer des sources directement en notes.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `GITHUB_TOKEN` | Token avec accès en lecture/écriture au dépôt du vault |
| `VAULT_REPO` | `owner/repo` du vault |
| `VAULT_BRANCH` | Branche du vault (défaut : `main`) |

## Outils

### Vault

| Outil | Description |
| --- | --- |
| `read_note(path)` | Lire une note |
| `write_note(path, content)` | Écrire ou écraser une note |
| `append_note(path, content)` | Ajouter à la fin d'une note |
| `list_folder(folder)` | Lister un dossier du vault |
| `get_daily_sessions(date)` | Lire `Sessions/<date>.md` |

### Scraper

| Outil | Description |
| --- | --- |
| `scrape_url(url, max_chars?)` | Récupère une URL et renvoie du Markdown propre |
| `scrape_to_note(url, path?, folder?, max_chars?)` | Récupère une URL et l'enregistre comme note |

Sources gérées :

- **Posts X / Twitter** — API de syndication publique, repli sur `api.fxtwitter.com`.
  Renvoie le texte, l'auteur, la date et les URLs médias directes (mp4 inclus, donc
  transcriptibles ensuite).
- **Vidéos YouTube** — titre, chaîne, description et transcript quand des sous-titres
  sont exposés (français prioritaire, sinon anglais).
- **Pages HTML** — extraction de `<article>` ou `<main>` sinon `<body>`, conversion en
  Markdown (titres, listes, liens, images, citations, code) avec suppression des
  scripts, styles, navigation et pieds de page.

`scrape_to_note` écrit par défaut dans `Sources/AAAA-MM-JJ-<slug-du-titre>.md`, avec un
frontmatter `source / type / title / author / published / scraped / media`.

Le contenu est tronqué à 20 000 caractères par défaut — passer `max_chars` pour élargir.
Les URLs vers `localhost` et les plages IP privées sont refusées (garde-fou SSRF), et
chaque requête sortante a un timeout de 15 s.

## Tests

```bash
node --check api/mcp.js && node --check lib/scraper.js
```

## Déploiement

Vercel, fonction `api/mcp.js` (`maxDuration` 30 s). Endpoint MCP : `POST /api/mcp`.
`GET /api/mcp` renvoie un statut de santé.
