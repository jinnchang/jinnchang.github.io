# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Hugo (extended ≥ 0.163.0) using the [hugo-coder](https://github.com/luizdepra/hugo-coder) theme (git submodule). Deployed to GitHub Pages at `https://jinnchang.github.io`. Content is written in Chinese.

## Commands

```bash
# Local development
hugo server -D                     # Serve with drafts visible at localhost:1313

# Production build (two-step: Hugo then Pagefind search index)
hugo build --gc --minify --baseURL https://jinnchang.github.io
npx pagefind --site public

# Create new content
hugo new content posts/<slug>/index.md
hugo new content reads/<slug>/index.md

# Theme submodule (required after clone)
git submodule update --init --recursive
```

## Architecture

### Content Sections

- **`content/posts/`** — Original articles. Page bundles: `<slug>/index.md` + co-located images.
- **`content/reads/`** — Translated/sourced articles. Same page-bundle structure. Supports `externalLink` (routes clicks to the original source) and `canonicalUrl` (SEO). `disableComments: true` suppresses Giscus on link-only entries.

Both sections share the same archetype frontmatter (TOML `+++` delimiters) with fields: `title`, `date`, `description`, `categories`, `series`, `authors`, `toc`, `externalLink`, `canonicalUrl`, `disableComments`.

### Layout Overrides

Custom layouts in `layouts/` override the theme and are the primary way to customize — never edit `themes/hugo-coder/` directly.

- **`layouts/_default/_markup/render-codeblock.html`** — Replaces theme's code block rendering. Wraps every fenced code block in a `<div class="code-block">` with a copy button (SVG icons). This is the hook that enables the copy-code feature.
- **`layouts/reads/`** — Custom list/li/single templates for the reads section. `li.html` links to `externalLink` when present, otherwise `RelPermalink`.
- **`layouts/shortcodes/search.html`** — Pagefind search UI with light/dark theme CSS variables.
- **`layouts/shortcodes/diagram.html`** — Inlines a co-located SVG/HTML diagram into the page, namespaces its SVG `id`s, and enables dark-mode re-skinning (see Diagram Shortcode below).

### Copy-Code Feature (3 files, tightly coupled)

1. `layouts/_default/_markup/render-codeblock.html` — HTML structure with `.copy-button` and `data-copy-state`
2. `assets/css/copy-code.scss` — Button positioning, hover states, icon swap via `data-copy-state="copied"`, auto-wrap (`white-space: pre-wrap`) instead of horizontal scroll
3. `assets/js/copy-code.js` — Click handler: copies `pre code` text, sets `data-copy-state="copied"` for 1.5s

### Diagram Shortcode (3 files, tightly coupled)

1. `layouts/shortcodes/diagram.html` — `{{< diagram <file>.svg >}}` reads a file path-joined to `content/<page-dir>/` via `os.ReadFile`, extracts the first `<svg>`, prefixes every `id` and `url(#…)` with a per-file slug (so multiple diagrams on one page don't collide), rewires `aria-labelledby` to the prefixed title/desc ids, and wraps it in `<div class="diagram">`. Missing file or no `<svg>` triggers an `errorf` (build fails).
2. `assets/css/diagram.scss` — Dark-mode re-skin scoped to `.diagram`: remaps each exact fill/stroke value (paper, ink, muted, accent, link, plus rgba hairlines) to its designed dark counterpart instead of a whole-SVG `filter: invert`, matching the blog palette under both `body.colorscheme-dark` and `body.colorscheme-auto` (follows OS).
3. `hugo.toml` — registered under `params.customSCSS` as `css/diagram.scss`.

### Asset Pipeline

Hugo pipes files from `assets/` (not `static/`). Custom SCSS and JS are declared in `hugo.toml` under `params.customSCSS` and `params.customJS`. Fonts are overridden via `assets/css/fonts.scss`.

### Integrations

- **Pagefind** — Search index built post-Hugo (`npx pagefind --site public`). UI loaded from `/pagefind/` in the search shortcode.
- **Giscus** — Comments via GitHub Discussions, configured in `hugo.toml` `[params.giscus]`.
- **Umami** — Privacy-friendly analytics, configured in `hugo.toml` `[params.umami]`.

## Writing Style

**This section governs Chinese writing in `content/posts/` (original articles). The goal is to help AI collaborators produce focused, concise, high-signal writing. `content/reads/` (translations) instead aim to faithfully reproduce the source and are not bound by this section.**

- Scaffolding transitions: delete "接下来我们将…", "综上所述", "值得一提的是", "需要注意的是".
- Redundancy: don't repeat the same conclusion in the intro, body, and outro; state it fully once, then refer to it with a single pointer elsewhere.
- Filler and disclaimers: delete "在当今这个时代…", "众所周知…", and uninformative disclaimers.
- Background/trend setup: keep 1–2 sentences only if removing them leaves the reader unable to understand; cut industry chatter unrelated to the technical point.
- Noun pile-ups: if a sentence strings together more than three parallel terms without explanation, split or trim it.
- Length: as short as possible; every sentence must carry information.
- Opening: 1–3 sentences naming the problem or audience is recommended, not required.
- Heading levels, section structure, closing wording, and signature format: no hard rules; adapt to the content.
- Written for a technical Chinese audience; avoid translationese like "本篇文章" or "我们公司".