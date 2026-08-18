# Guaifinition Docs

Guaifinition Docs is a unified Chinese AI technology course and research knowledge base with an OpenAI Docs-inspired interface. Markdown files remain the knowledge layer and can be maintained in Obsidian; Next.js renders formulas, tables, code, figures, navigation, and themes; GitHub Actions publishes the static site to GitHub Pages.

## Online

<https://guaifinition.github.io/guaifition-docs/>

## Local development

```bash
npm ci
npm run dev -- --port 4173
```

Open <http://localhost:4173/>.

## Content architecture

- `content-library/` — article Markdown files and the generated content index.
- `public/content-assets/` — migrated images, SVG figures, and chart assets.
- `src/components/docs/` — the shared OpenAI Docs-style shell and Markdown renderer.
- `src/lib/content.ts` — course, article, section, and navigation data access.
- `scripts/import-content.mjs` — content and asset import/normalization pipeline.
- `scripts/check-content.mjs` — formula, table, content, and asset validation.

## Validation

```bash
npm run content:import
npm run check
```

GitHub Pages builds with `NEXT_PUBLIC_BASE_PATH=/guaifition-docs npm run build`, while local development uses the root path without that variable.

The public collection contains curated course and research content only. Handover notes, company materials, authentication records, raw workspace exports, local paths, and debugging logs are excluded.
