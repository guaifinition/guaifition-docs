# Page Topology

## Fixed chrome

1. Utility header: OpenAI Developers wordmark, primary product navigation, search trigger, API Dashboard action, and theme toggle.
2. API section rail: Overview, Models, Agents, Tools, Voice & Audio, Production, API reference.
3. Desktop documentation sidebar: model catalog and grouped API guide links. It has its own vertical scroll container.
4. Mobile drawer: the desktop navigation collapses into a fixed off-canvas panel below the `lg` breakpoint.

## Main article order

1. Breadcrumb back-link to Models.
2. Model identity row: local model icon, `GPT-5.6 Luna`, Default selector, copy action, description, Compare, Try in Playground.
3. Five-column capability strip: Reasoning, Speed, Price, Input, Output.
4. Intro copy with four fact rows: context window, max output tokens, knowledge cutoff, reasoning token support.
5. Pricing section with explanatory copy and token pricing table.
6. Modalities section.
7. Endpoints section.
8. Features section.
9. Tools section.
10. Snapshots section with model icon and alias rows.
11. Rate limits section with a bordered data table.

## Layering

- Header and API rail remain fixed while the body scrolls.
- The sidebar is sticky/fixed in the desktop layout and scrolls independently.
- The article itself is ordinary flow content.
- A floating Ask AI control sits at the lower-right edge of the document.

## Interaction model

- Search: click-driven overlay, closes with Escape.
- Theme: click-driven toggle between `html.dark` and light mode.
- Mobile navigation: click-driven drawer with a transform transition.
- Article navigation: native anchor links.
- Model selector and action buttons: presentation/demo controls; no backend behavior is required for this clone.
