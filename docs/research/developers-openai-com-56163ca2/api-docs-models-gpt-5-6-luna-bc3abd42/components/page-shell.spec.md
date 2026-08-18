# PageShell Specification

## Overview

- Target file: `src/components/sites/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/PageShell.tsx`
- Screenshot: `docs/design-references/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42/original-desktop-1440.png`
- Interaction model: click-driven chrome plus ordinary document scrolling

## Required regions

- Fixed `64px` utility header.
- Fixed `48px` API section navigation rail below the header.
- Desktop sidebar with grouped links and independent scroll.
- Main article column with responsive left offset.
- Mobile drawer hidden above the `lg` breakpoint and opened with a transform transition below it.
- Floating Ask AI control at the lower-right edge.

## Exact visual direction

- Dark-first black surface, white primary text, muted gray navigation, thin neutral dividers.
- Use OpenAI Sans-compatible system fallbacks and SF Mono-compatible code fallback.
- Avoid marketing gradients, decorative cards, saturated colors, and heavy shadows.
