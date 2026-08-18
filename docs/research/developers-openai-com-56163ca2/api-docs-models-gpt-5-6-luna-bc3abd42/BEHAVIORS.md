# Behavior Bible

## Scroll sweep

- The page body is the primary vertical scroll container (`body` has `overflow: hidden auto`).
- At the captured top and after scrolling to `700px`, the header remains fixed at `64px` with the same dark surface and no shadow.
- The desktop sidebar is an independent `overflow-y: auto` container.
- No scroll snap or smooth-scroll library was observed in the captured page.

## Click sweep

- `Start searching` opens `#header-search-overlay` as a fixed modal layer. The overlay contains a search input with placeholder `Start searching` and suggested API queries.
- Pressing Escape closes the search overlay.
- `Toggle light and dark theme` removes/adds the `dark` class on `<html>` and switches the page surface between black and white.
- `header-drawer-button` is visible on mobile and toggles the drawer's `open` class. The closed drawer uses `translate-x-full`; the open state slides it into view.
- Compare, Try in Playground, dashboard, and navigation links are external or navigational actions. The local clone keeps them visually active without a real backend.

## Hover and focus

- Navigation links use quiet color changes and rounded ghost hover surfaces.
- Buttons use short approximately `150ms` color/background/border transitions with a standard ease curve.
- No large-scale hover transforms were observed in the primary article layout.

## Responsive sweep

- Desktop: `1440px` viewport with full utility navigation, API rail, sidebar, and five-column metrics.
- Tablet: `768px` is expected to be in the compact navigation regime; the source classes switch at `lg`.
- Mobile: `390px` has a compact header, hidden desktop rails, mobile drawer, stacked article header, and divider-separated metric rows.
