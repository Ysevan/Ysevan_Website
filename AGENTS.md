# Repository Guidelines

## Project Structure & Module Organization

This repository is a static website. Root-level pages such as `index.html`, `404.html`, `atom.xml`, and `search.json` are published directly. Shared site assets live in `css/`, `js/`, `sass/`, `img/`, `background/`, `fonts/`, `font-awesome/`, and `fancybox/`. Blog pages and their local assets are under `Blog/`. Small standalone demos and games are under `game/`, while the custom 404 game source is in `404-game/`. Maintenance scripts belong in `tools/`.

## Build, Test, and Development Commands

- `python -m http.server 8000`: serve the repository locally at `http://localhost:8000/` for manual browser checks.
- `powershell -ExecutionPolicy Bypass -File tools/check-local-links.ps1`: scan HTML files for missing local `href`, `src`, `poster`, and similar references.
- `cd game/js-guitar && npm install && npm run start`: run the guitar demo with Parcel.
- `cd game/js-drumkit && npm install && npm run start`: run the drumkit demo with Parcel.

There is no root package manager configuration, so avoid adding root-level build tooling unless it is needed for the whole site.

## Coding Style & Naming Conventions

Use existing plain HTML, CSS, Sass, and browser JavaScript patterns. Keep indentation consistent with nearby code, generally two or four spaces depending on the file. Prefer lowercase, hyphenated names for new asset files and directories, for example `new-page.html` or `img/profile-card.png`. Keep third-party or minified files unchanged unless replacing the library intentionally.

## Testing Guidelines

No automated test suite is configured. For each change, run the local link checker and manually verify affected pages in a browser. For visual pages, test desktop and mobile widths, confirm images load, and check console errors. When editing a standalone npm demo, run its local `npm run start` or `npm run build` from that demo directory.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `Remove Lover page and assets`. Keep commit messages concise and action-oriented. Pull requests should describe the pages or assets changed, list manual checks performed, link related issues when available, and include screenshots or screen recordings for visible UI changes.

## Agent-Specific Instructions

Do not rewrite generated or vendor assets broadly. Keep changes scoped, preserve non-English file and path names, and verify relative links before finishing.
