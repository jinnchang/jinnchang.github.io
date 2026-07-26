# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Hugo (extended) using the hugo-coder theme (git submodule). Deployed to GitHub Pages at `https://jinnchang.github.io`. Content is primarily Simplified Chinese. Two content sections: **posts** (original articles) and **reads** (translated articles from English sources).

## Commands

```bash
npm run dev          # Local dev server (hugo server -D, includes drafts)
npm run lint         # Check formatting (prettier --check .)
npm run prepare      # Install husky git hooks
hugo build --gc --minify --baseURL <url>  # Production build
npx pagefind --site public                # Build search index (run after hugo build)
```

## Requirements

- **Hugo Extended** 0.163.0 (required for SCSS)
- **Node.js** 24.14.0 (see `.nvmrc`)
- **Dart Sass** 1.98.0 (CI installs this; needed locally if Hugo can't find sass)

## Architecture

### Content & Layouts

All content uses **Hugo page bundles** (`content/<section>/<slug>/index.md` + co-located images). The `reads/` section has custom layouts (`layouts/reads/`) that support `externalLink` and `canonicalUrl` frontmatter for translated articles. Theme layouts are overridden by placing files in `layouts/` — the theme itself lives in `themes/hugo-coder/` as a git submodule and should not be edited directly.

### Custom Assets

Three custom assets loaded via `hugo.toml` params:

- `assets/css/copy-code.scss` + `assets/js/copy-code.js` — clipboard copy button on code blocks (wired through `layouts/_default/_markup/render-codeblock.html`)
- `assets/css/fonts.scss` — custom font stack and base sizes

### Integrations

- **Pagefind**: static search; index built post-build with `npx pagefind --site public`, UI via `layouts/shortcodes/search.html`
- **Giscus**: comments on reads/posts, configured in `[params.giscus]`
- **Umami**: analytics, configured in `[params.umami]`

### Frontmatter (Archetypes)

Both `posts` and `reads` archetypes share the same TOML structure. Key fields beyond standard Hugo:

- `toc` (default true) — table of contents
- `externalLink` — for reads linking to original source
- `canonicalUrl` — original article URL for SEO
- `disableComments` — toggle Giscus

## Git Conventions

- **Commit style**: Conventional commits enforced by commitlint (`@commitlint/config-conventional`)
- **Pre-commit**: lint-staged runs prettier on `*.{html,toml,js,scss,json,yaml,yml,md}`
- **Theme submodule**: after cloning, run `git submodule update --init --recursive`
