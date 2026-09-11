---
name: aesthetic-website-stack
description: Curated toolkit and workflow for making AI-built ("vibe-coded") websites look premium instead of AI-generated, sourced from @buildingwiththane's "10/10 niche websites for vibe coders" reel. Use this skill whenever the user is building or improving a website, landing page, or web app with AI (Manus, Lovable, Claude Code, Cursor, v0, Bolt...) and wants it to look premium, aesthetic, non-generic, or "not AI-generated" — and also when they ask for design inspiration from real products, real design systems or design tokens (colors, fonts, spacing), animated UI components (navbars, carousels, glassmorphism), animated gradient or shader backgrounds for a hero section, or which niche tools/websites to use for vibe coding. Trigger even if they only say things like "my landing page looks generic", "make my site look less AI", "trouve-moi un style pour mon site", or "quels outils pour un beau site".
---

# Aesthetic Website Stack

A four-tool stack plus workflow for shipping AI-built websites that pass the "does this look AI-generated?" test. Source: Instagram reel by Thane (@buildingwiththane), a Manus partner — full scraped content and provenance in `references/source-reel.md` (read it when the user asks where this comes from, or wants the original links/context).

## The stack

| Need | Tool | URL |
|---|---|---|
| Real-world design tokens (colors, fonts, spacing) | Refero Styles | https://styles.refero.design |
| Animated landing-page components (shadcn-compatible) | Cult UI | https://cult-ui.com |
| Animated 3D gradient backgrounds | ShaderGradient | https://shadergradient.co |
| Full-stack AI builder (backend, deploy, SEO/analytics) | Manus | https://manus.im |

### 1. Refero Styles — steal the style of real products
2,000+ style breakdowns extracted from real product sites (Wise, Linear, Notion...): exact colors, font pairings, spacing, and the design philosophy in words. Generic AI output happens when the model invents a style; it stops when you hand it a real one.

Use it at the **start** of every build: pick 1–2 styles matching the brand's mood, then copy the tokens (hex palette, type pairing, spacing scale, tone descriptions) into the build prompt, `tokens.css`, or the project's design brief. A style page reads like "deep forest green #163300, lime voltage accents, blocky display type, confident slightly loud voice" — paste that, don't paraphrase it.

### 2. Cult UI — replace generic blocks with crafted components
Open-source, shadcn/ui-compatible registry of animated landing-page pieces: dynamic islands, distorted-glass effects, animated navbars, testimonial carousels. Components install straight into any React + Tailwind + shadcn project:

```bash
npx shadcn@latest add https://cult-ui.com/r/<component>.json
# e.g. https://cult-ui.com/r/dynamic-island.json
```

Use it when a section feels like a template (hero, nav, testimonials, feature grid): swap the static block for one animated, characterful piece. One or two per page is enough — motion everywhere reads as gimmicky, motion in the right place reads as expensive.

### 3. ShaderGradient — depth instead of flat backgrounds
Animated 3D gradient backgrounds designed in the browser (presets like Pensive, Universe, Mint; every parameter lives in the URL), then exported as code — React package `@shadergradient/react`, plus Framer/Figma plugins. The full config is encoded in the shareable URL, so a chosen gradient is reproducible in code exactly.

Use it for hero sections and empty backgrounds — the places where AI builds default to a flat color or a stock purple-to-blue CSS gradient. Match the gradient's palette to the Refero tokens, slow the animation down, and keep text contrast readable on top (add an overlay if needed).

### 4. Manus — the build agent (sponsored in the source reel)
General AI agent that builds and deploys backend-powered apps and websites: PRD generation, an explicit design-direction step, hosting, and a dashboard with visit analytics and SEO tracking built in. The reel is a #manuspartner ad — treat Manus as one good option, not the only one; the rest of the stack works identically in Lovable, Claude Code, Cursor, v0 or Bolt projects.

If using it, do what the reel shows: make the agent commit to a **named design philosophy** before generating ("Cinematic Noir — dark luxury editorial: deep charcoal, warm amber/gold accents, Playfair Display + DM Sans, staggered asymmetric layouts, full-viewport hero with parallax"). A committed art direction is what separates "premium website" from "AI template".

## Workflow: from prompt to non-generic site

1. **Style first.** Pick the reference style on Refero Styles; extract palette, type pairing, spacing, and voice into the project brief before any generation.
2. **Direction, then build.** Give the builder (Manus or equivalent) the tokens plus a named design philosophy and 3–5 concrete design decisions. Refuse the first generic draft; regenerate against the direction.
3. **Craft the key sections.** Swap template-feeling blocks for Cult UI components (nav, testimonials, one signature interaction).
4. **Add depth.** ShaderGradient in the hero or section backgrounds, tuned to the palette.
5. **Run the smell test** (below). Fix what fails, then ship — and if the builder has analytics/SEO built in, wire them before handing over.

## The "looks AI-generated" smell test

A site fails when it shows several of: purple/blue gradient on white, Inter/system font everywhere with no display face, three-column feature grid with emoji icons, uniformly rounded cards with identical shadows, invented testimonials with stock avatars, perfectly symmetric sections. Fix with: tokens from a real product (Refero), an editorial type pairing, asymmetry and varied section rhythms, one signature animated element (Cult UI), depth in backgrounds (ShaderGradient), and real copy over lorem-style filler.

Pair this skill with `ui-ux-pro-max` (broad design-system choices) and `brand-analyst` (extracting an existing brand's DNA) when they are available: brand DNA → tokens → this stack for execution.
