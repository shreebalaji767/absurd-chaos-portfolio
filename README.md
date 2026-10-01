# Absurd Portfolio

A procedural portfolio generator that creates a new professional portfolio, fictional universe, characters, projects, lore, and visual interface every time the page is loaded or regenerated.

The project remains deliberately **static, dependency-light, and browser-memory-only**.

## v7 upgrades
- Installable PWA support with updated manifest metadata.
- Offline-first service worker for the generated static site.
- SVG browser/app icon.
- Runtime SEO metadata updates for every generated portfolio.
- Open Graph and Twitter metadata.
- Print-optimized portfolio output.
- Copy-current-portfolio snapshot utility.
- Install button when supported by the browser.
- Keyboard shortcuts: G = generate, P = print, L = copy share link, ? = shortcuts.
- Responsive utility controls and reduced-motion support.
- Production build script that copies runtime assets into generated/.
- Deterministic shareable seeds via `?seed=...`; no database, authentication, cookies, localStorage, sessionStorage, or IndexedDB.
- Responsive mobile navigation with keyboard and screen-reader friendly controls.
- Generated portfolio branding now uses the installed SVG logo in the app header.
- Social preview image resolves to an absolute runtime URL.
- **BLSSNVJ21** branding added to the page title, generated header/footer, PWA name, favicon identity, and SEO metadata.
- Extended metadata with keywords, author, referrer policy, and Schema.org WebSite structured data.
- Responsive hardening for very small phones, touch devices, tablets, ultrawide displays, and safe-area insets.

## Build
Requires Python 3.9+ and no third-party Python packages.

Run:

    python3 build.py

Then serve generated/ over HTTP:

    cd generated
    python3 -m http.server 8000

Open http://localhost:8000/. PWA features require HTTPS or localhost.

## Upgrade notes

- v7 focuses on installability, device responsiveness, mobile navigation, and consistent branding.

- Shareable deterministic portfolio URLs use the `seed` query parameter.
- PWA metadata, crawler controls, cache versioning, and social preview metadata are maintained as part of the build.

## Architecture
Python -> generator.py -> generated/index.html -> build.py -> static hosting -> browser RAM generation.

## Runtime model
Every page load creates a new portfolio in memory. The Generate button creates another without a network request.

The portfolio contains a professional identity, education, specialties, career history, projects, technical stacks, fictional world, factions, contacts, incidents, quests, timeline, archive metadata, and randomized visual system. A seed in the URL reproduces the same generated record without storing anything in the browser.

The service worker caches only the generated static site assets for offline loading; it does not create application data storage.

## Structure

    generator.py
    build.py
    render.yaml
    templates/index.html
    static/app.js
    static/style.css
    static/pwa.css
    static/pwa.js
    static/sw.js
    static/icon.svg
    static/manifest.webmanifest
    generated/  (build output)

## License
MIT
