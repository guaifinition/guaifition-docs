# Clone Output Plan

## Target

- Source URL: `https://developers.openai.com/api/docs/models/gpt-5.6-luna`
- Source origin: `https://developers.openai.com`
- Fidelity: pixel-oriented visual and interaction emulation for the visible page
- App root: repository root (`.`)
- Destination route: `/`

## Collision and preservation check

- The template contains only the untouched scaffold route `src/app/page.tsx`.
- No existing cloned route, component namespace, research artifact, screenshot, or public asset namespace exists.
- Replacing the scaffold root page is allowed by the current `clone-website` workflow.

## Namespaced outputs

- Site key: `developers-openai-com-56163ca2`
- Page key: `api-docs-models-gpt-5-6-luna-bc3abd42`
- Research: `docs/research/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/`
- Screenshots: `docs/design-references/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/`
- Components: `src/components/sites/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/`
- Assets: `public/sites/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/`

## Shared foundation changes

- `src/app/layout.tsx`: use the extracted OpenAI Sans / SF Mono-compatible stacks and target metadata.
- `src/app/globals.css`: replace scaffold light tokens with the extracted dark-first documentation tokens and responsive layout utilities.
- `src/app/page.tsx`: assemble the cloned documentation page at `/`.

## Verification targets

- Build: `npm run check`
- Local route: `http://localhost:<port>/`
- Viewports: `1440x900`, `768px`, and `390x844`
- Reference screenshots: `original-desktop-1440.png`, `original-mobile-390.png`
