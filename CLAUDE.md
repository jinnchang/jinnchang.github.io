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

### Copy-Code Feature (3 files, tightly coupled)

1. `layouts/_default/_markup/render-codeblock.html` — HTML structure with `.copy-button` and `data-copy-state`
2. `assets/css/copy-code.scss` — Button positioning, hover states, icon swap via `data-copy-state="copied"`, auto-wrap (`white-space: pre-wrap`) instead of horizontal scroll
3. `assets/js/copy-code.js` — Click handler: copies `pre code` text, sets `data-copy-state="copied"` for 1.5s

### Asset Pipeline

Hugo pipes files from `assets/` (not `static/`). Custom SCSS and JS are declared in `hugo.toml` under `params.customSCSS` and `params.customJS`. Fonts are overridden via `assets/css/fonts.scss`.

### Integrations

- **Pagefind** — Search index built post-Hugo (`npx pagefind --site public`). UI loaded from `/pagefind/` in the search shortcode.
- **Giscus** — Comments via GitHub Discussions, configured in `hugo.toml` `[params.giscus]`.
- **Umami** — Privacy-friendly analytics, configured in `hugo.toml` `[params.umami]`.
