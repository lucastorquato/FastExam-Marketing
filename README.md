# FastExam marketing website

A responsive, bilingual marketing site for the FastExam iPhone and iPad app. English lives at `/`, Brazilian Portuguese at `/pt/`. Both languages have their own support and privacy information pages, native FAQ disclosure controls, and localized interactive app screenshots.

The app is **not yet released**, so the site uses “Coming soon” instead of a download link. Product claims and screenshots come from the companion FastExam app repository. All screenshot classroom records are fictional.

## Develop

Requires Node.js 22 or later. No external packages or install step.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. After editing, rebuild and refresh. `dist/` is generated and ignored by Git.

- `scripts/content.mjs`: English and Brazilian Portuguese copy.
- `scripts/build.mjs`: shared page templates and static generation.
- `assets/site.css`: responsive styles.
- `assets/site.js`: screenshot selector and mobile navigation.
- `assets/en/` and `assets/pt/`: actual simulator screenshots.
- `site.config.json`: canonical URL, release link, developer name, and optional support email.

All page content is rendered at build time. No JavaScript is needed to read the site, use the language links, or expand FAQs. The mobile menu and screenshot selector use a small local script. No external fonts, analytics, tracking cookies, forms, or third-party runtime requests are included.

## GitHub and hosting

Source repository: https://github.com/lucastorquato/FastExam-Marketing

The workflow builds and checks changes on `main` and pull requests, then uploads a downloadable `fastexam-website` artifact. GitHub Pages deployment is gated behind the repository variable `PAGES_ENABLED=true`.

**Hosting status:** Upload only, as requested by the owner. The repository remains private and no public website is deployed. GitHub Pages is unavailable for this private repository on the current account plan. The optional deployment job stays disabled until `PAGES_ENABLED` is explicitly set.

To enable GitHub Pages after choosing an eligible plan or repository visibility:

1. In repository Settings → Pages, choose GitHub Actions as the source.
2. Add the Actions repository variable `PAGES_ENABLED` with value `true`.
3. Run the **Build and deploy website** workflow.
4. The configured website URL is `https://lucastorquato.github.io/FastExam-Marketing/`.

Alternatively, upload the contents of `dist/` to any static host. Before building for a different host or custom domain, update `url` in `site.config.json`; this controls canonical links, language alternates, sitemap, and the 404 return link. Relative assets and navigation support hosting under a subdirectory.

## Launch configuration

- Add the verified App Store or TestFlight URL to `appStoreUrl` when available. The generator replaces the main CTA and coming-soon status with a release link.
- Add a monitored `supportEmail` to show contact sections on the support and privacy pages. No email address was provided, so no contact address is invented or displayed. Add this before using these pages as the final App Store support/privacy URLs.
- Confirm `developerName` (currently Lucas Torquato, matching the app metadata).
- Review product copy and the app’s data-handling information whenever app behavior changes. The privacy page describes the supplied implementation; it makes no legal-compliance claims.

## Checks

`npm run check` verifies all six generated localized pages, internal links and anchors, screenshot assets, HTML language metadata, image alternatives, unique IDs, and JavaScript syntax. The deployment workflow runs this after every build.

Browser QA also covers desktop/mobile layouts, screenshot selection, language navigation, FAQs, mobile menu, and the support/privacy routes. Images retain their original localized app content.
