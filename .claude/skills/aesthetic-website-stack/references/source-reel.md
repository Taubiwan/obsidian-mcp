# Source: Instagram reel Dc2KI0HEqqk — "10/10 niche websites for vibe coders"

Scraped 2026-09-06. This file is the provenance record for the skill: the full content
of the reel, how it was extracted, and the original links. Read it when the user asks
for the source, the original list, or the context behind a recommendation.

## Post metadata

- URL: https://www.instagram.com/reel/Dc2KI0HEqqk/
- Author: Thane — @buildingwiththane (Manus partner account; main account: @itsthanemuntz)
- Author bio: "Building cool apps with @manus — Try Manus for FREE (+free credits)"
- Bio link (referral, free credits): https://manus.im/redeem?c=ogi2ytz
- Posted: 2026-09-03 (timestamp 1788483705)
- Stats at scrape time: 692 likes, 274 comments, 27.5 s video
- Caption: `Comment "CODE" and i'll send you the links` + hashtags
  `#websitebuilding #vibecoding #aesthetictech #manuspartner #ad`
- **Disclosure: the reel is a paid Manus partnership (#manuspartner #ad).** The Manus
  segment is sponsored content; the other three tools are presented as organic picks.
- Audio: trending music only (lyrics "I get the message. I learned my lesson… I'm a loser"),
  no voiceover — all information is in the on-screen text overlays and screen recordings.
- Comments: top comments are all "Code" (ManyChat-style DM automation trigger); no
  additional tool info in comments.

## Full overlay transcript (verbatim, chronological)

1. `10/10 niche websites for vibe coders` — hook, 0–3 s ("10/10" is a rating, not a count: 4 tools are shown)
2. `Refero Styles` + `2,000+ design files with the colours, fonts and spacing of real product sites` — 4–7 s
3. `Cult-ui` + `Landing page pieces like animated navbars and testimonial carousels` — 8–11 s
4. `Shader Gradient` + `Animated 3D gradient backgrounds you build in the browser, then copy the code out` — 12–17 s
5. `Manus.im` + `Build flawless backend powered apps and premium websites with AI` — 18–21 s
6. `Manus.im` + `Studio quality design so it never looks AI generated` — 21–23 s
7. `Manus.im` + `SEO tracking built into the dashboard` — 23–25 s
8. `Comment "CODE" and I'll send you the links` — CTA, 26–27.5 s

## What each segment shows on screen

### Refero Styles (styles.refero.design)
Browser on `styles.refero.design/style/…`. A grid of style cards (Notion, Wise, Linear,
Perk visible), then individual style pages for "ORYZO AI" (dark editorial, "Powered by AI"
hero) and "Wise" (deep forest green #163300 with lime voltage accents, near-black forest
floor, "massive blocky display type", tone described as "confident, slightly loud voice").
Each style page pairs screenshots with extracted tokens: Colors (named hexes: Forest, Lime
Voltage, Spruce, Linen Mist, Signal Blue, Alarm Red, Charcoal, Obsidian, Pebble, Slate,
Fog, Paper), Typography (Inter — weights, sizes, line-heights), and prose describing the
design philosophy.

### Cult UI (cult-ui.com)
Component registry with Preview/Code tabs. Shown: "Distorted Glass" (glassmorphism effect
component using SVG filters) and "DynamicIsland" ("Composable, animated Dynamic Island
primitives", cycling states demo). Install command visible:
`pnpm dlx shadcn@latest add https://cult-ui.com/r/dynamic-island.json`.

### ShaderGradient (shadergradient.co)
Preset gradients "01 Pensive" (teal/violet halo), "06 Universe" (violet/pink), "Mint"
(green/white), animated in-browser. The URL bar shows the whole config encoded as query
params (`?animate=on&bgColor1=%23...&bgColor2=%23...&brightness=...&azimuthAngle=...`),
which is what makes a chosen gradient reproducible; a "Try on web" button and share/export
controls are visible.

### Manus (manus.im/app)
The Manus agent workspace: sidebar with New task / Agent / Plugins / Scheduled, project
folders ("WEBSITES", "Roofing business demo site", a "PRD for Anti-Porn App…" task).
A build chat for "Rivera Roofing & Construction LLC": the agent researches visual
inspiration, brainstorms directions, then commits to one — "**Cinematic Noir — Dark Luxury
Editorial**: deep charcoal backgrounds with warm amber/gold accents, copper flashing and
sunset on rooftops; Playfair Display serif for headlines paired with DM Sans for body;
staggered asymmetric layouts, images and text offset for visual tension; full-viewport
cinematic hero with parallax; gold line accents and animated reveal-on-scroll blocks;
large serif number counters for stats" — then generates custom images and builds. Also
shown: a finished soda-brand site ("Pure Zero" / "Refreshingly Clean", studio-grade 3D
product shots) with overlay "Studio quality design so it never looks AI generated", and a
deployed app dashboard (`side_quest_app`) with Analytics — Page views 2.72K (+22.3%),
Visits 1.24K (+17.6%), Visitors 1.02K (+17.3%), most-viewed pages, and SEO tracking —
plus "Your website is now publicly available" deployment state. Final CTA frames show an
anime-style "Venture Past Our Sky Across the Universe" hero page.

## The links (as sent by the creator's DM automation)

- Refero Styles: https://styles.refero.design (main product: https://refero.design)
- Cult UI: https://cult-ui.com
- ShaderGradient: https://shadergradient.co (React: `@shadergradient/react`; Framer/Figma plugins)
- Manus: https://manus.im — creator referral with free credits: https://manus.im/redeem?c=ogi2ytz

## How this was scraped (for reproducibility)

Instagram/CDN domains were blocked from the sandbox, so: post metadata + caption via
TikHub `fetch_post_by_url_v2` (Monid); audio transcribed with ElevenLabs Scribe (music
only); the video was re-rendered through an ElevenLabs composition node to obtain an
accessible copy, then 28 frames were extracted at 1 fps with ffmpeg and read directly to
transcribe every on-screen overlay and UI detail. Comments and the author profile were
scraped the same way (TikHub via Monid) to confirm the sponsor context and bio links.
