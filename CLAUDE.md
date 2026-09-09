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

## Writing Style

**本文件约束 `content/posts/`（原创文章）的中文写作，目标是让 AI 协作产出「聚焦、不啰嗦、重点突出」。`content/reads/`（翻译）追求精准还原原文，不受本文件约束。**

- 脚手架过渡句：删掉「接下来我们将…」「综上所述」「值得一提的是」「需要注意的是」。
- 同义反复：同一结论不要在开头、正文、结尾各说一遍；只在一处完整陈述，其余用一句指代。
- 套话与免责：「在当今这个时代…」「众所周知…」及无信息的免责声明，删。
- 背景/趋势铺垫：仅当删掉后读者会读不懂时保留 1–2 句；与技术结论无关的行业口水务必砍。
- 名词堆砌：一句话超过三个并列术语且不加解释，拆分或砍掉一部分。
- 长度：能短则短，每一句都要有信息量。
- 开头：建议用 1–3 句点题（解决什么问题 / 给谁看），非强制。
- 标题层级、小结构、结尾措辞、署名格式：不作硬性规定，按内容灵活处理。
- 面向技术向中文读者；避开「本篇文章、我们公司」这类翻译腔。