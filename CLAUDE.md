# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Hugo (extended 0.163.0) using the `hugo-coder` theme (git submodule), deployed to GitHub Pages at `https://jinnchang.github.io`. Content is primarily in Chinese.

## Commands

```bash
npm run dev          # Hugo dev server with drafts (hugo server -D)
npm run build        # Build + minify + Pagefind index (hugo build --gc --minify && npx pagefind)
npm run preview      # Serve built site locally
npm run index        # Run Pagefind indexing only
npm run lint         # Format check + markdown lint
npm run lint:md      # Markdown lint only
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

## Architecture

- **Theme**: `themes/hugo-coder/` is a git submodule — never edit theme files directly. Override via `layouts/`, `assets/`, or Hugo config.
- **Content**: `content/posts/` for blog posts, `content/translations/` for translated articles, `content/links/` for curated links. Posts use subdirectories (e.g., `content/posts/git/`) that may contain images.
- **Custom layouts**: `layouts/` overrides theme templates — currently has code-block copy button (`_default/_markup/render-codeblock.html`), Pagefind search shortcode, and translations section layouts.
- **Custom assets**: `assets/css/copy-code.scss` and `assets/js/copy-code.js` for the copy-code feature. Hugo pipes these through its asset pipeline.
- **Search**: Pagefind indexes the built site. The search page uses a custom shortcode (`layouts/shortcodes/search.html`).
- **Config**: Single `hugo.toml` file. Integrations (Umami analytics, Giscus comments) are configured there.

## Conventions

- **Commits**: Conventional commits enforced by commitlint + husky commit-msg hook.
- **Formatting**: Prettier with plugins for Go templates, TOML, and markdown. Run via lint-staged on commit.
- **Markdown**: markdownlint with MD013, MD033, MD036, MD041 disabled.
- **Node version**: 24.14.0 (see `.nvmrc`).
- **New content**: Always use `hugo new content <path>` (matches archetype by section: `posts/` → `archetypes/posts.md`, `translations/` → `archetypes/translations.md`).

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`): lint → build (with Dart Sass 1.98.0 + Hugo extended 0.163.0 + Pagefind) → deploy to GitHub Pages on push to main.

## Working with the Theme Submodule

After cloning: `git submodule update --init --recursive`

To update the theme: `git submodule update --remote themes/hugo-coder`
