# amandata.org — Clean Rebuild

A complete rebuild of [amandata.org](https://amandata.org) (Amanda Ta's professional research portfolio) with clean, semantic underlying code. The original site was built on Carrd.co; this version reproduces its appearance pixel-for-pixel using hand-written HTML, CSS, and vanilla JavaScript — no Carrd dependency, no build step.

**Visual fidelity verified:** Rebuild screenshots compared against the live Carrd site at desktop (1440px) and mobile (390px) viewports across all four views (Home, Background, Projects, Contact). Pixel differences: 1–5% desktop, 4.7–7.4% mobile — all attributable to sub-pixel text anti-aliasing and JPEG compression, not layout.

## Preview

```bash
cd amandata-org-rebuild
python3 -m http.server 8000
# open http://localhost:8000/
```

## Deploy

This is a static site. Deploy to GitHub Pages:

1. Copy the contents of this directory to the `mandyhoami-lab/amandata.org` repo root.
2. Enable Pages (Settings → Pages → Deploy from branch → `main` / root).

No build step, no dependencies.

## Structure

```
index.html          Semantic HTML — header, main views, footer, contact form
styles.css          All styling — design tokens, layout, responsive breakpoints
script.js           Vanilla JS — hash routing, entrance animations, form handling
assets/
  images/           5 JPEGs (profile, SDSU logo, research poster, background)
  fonts/            fonts.css + 9 self-hosted woff2 files
```

## Fonts

Fonts are self-hosted (same files Google Fonts serves for the original's font list), so the site renders deterministically without a CDN call:

- **Outfit** 700/900 — brand masthead (variable font, latin + latin-ext)
- **Open Sans** 400/600/700/800 + italics — body text (variable font)
- **Geo** 400 — "Research" / "Background" headings
- **Fira Mono** 700 — buttons, nav
- **Playfair Display** 500/700 — form labels, section headings

Source: `https://fonts.googleapis.com/css2?display=swap&family=Outfit:ital,wght@0,700;0,900;1,700;1,900&family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700;1,800&family=Geo:ital,wght@0,400;1,400&family=Fira+Mono:ital,wght@0,700;1,700&family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700`

## Contact form

The original Carrd site posted the contact form to Carrd's backend, which doesn't exist on static hosting. Per the site owner's choice, the rebuild keeps the exact same form appearance, but on submit it validates the fields and opens the visitor's email app with a prefilled message to `ata3958@sdsu.edu` (subject and body composed from the form fields). No backend needed.

## Notes

- The email icon links to `mailto:ata3958@sdsu.edu` (decoded from the original's Cloudflare-protected address). Appearance is identical.
- The `impact-site-verification` meta tag (`b47eb620-…`) from the original `<head>` is preserved.
- Carrd's deferred-image placeholders were replaced with direct `<img>` tags (same images, faster load).
- Entrance animations (fade/slide on scroll) are reproduced with IntersectionObserver.
- Hash routing (`#background`, `#projects`, `#contact`) switches views without reload, matching the original.
