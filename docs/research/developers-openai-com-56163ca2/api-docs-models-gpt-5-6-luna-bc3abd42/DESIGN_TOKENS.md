# Extracted Design Tokens

## Global

- Surface: `rgb(0, 0, 0)` in the captured default dark state
- Primary text: `rgb(255, 255, 255)`
- Secondary text: `rgb(185, 185, 185)`
- Tertiary text: `rgb(143, 143, 143)`
- Strong secondary text: `rgb(220, 220, 220)`
- Hairline border: approximately `rgba(255, 255, 255, 0.08)`
- Raised surface: `rgb(33, 33, 33)`
- Primary button surface: `rgb(255, 255, 255)` with black text
- Base font: `OpenAI Sans`, fallback `sans-serif`
- Code font: `SF Mono`, `SFMono-Regular`, `ui-monospace`, `Consolas`, monospace
- Body size: `16px`
- Body line height: `24px`
- Body letter spacing: `-0.16px`

## Layout

- Header: fixed, `64px` high, `z-index: 50`
- API section rail: fixed below header, `48px` high, `z-index: 40`
- Desktop sidebar: approximately `240px` reserved width, independently scrollable
- Main content begins after the sidebar with a desktop left offset of `240px`
- Main readable content width: approximately `904px` at the captured desktop width
- Desktop page padding: approximately `24px` around the article frame
- Mobile content gutter: `40px` in the captured `390px` viewport
- Mobile breakpoint: the source uses the `lg` breakpoint for desktop navigation and drawer behavior

## Components

- Quiet navigation links: `14px / 20px`, medium weight, rounded hover surfaces
- Search control: `208px × 38px`, `14px / 20px`, `12px` gap, `16px` horizontal padding, fully rounded
- Secondary outline action: approximately `40px` tall, `9999px` radius
- Primary action: white pill, black text, approximately `40px` tall
- Metric panel: black surface, thin border, `5` equal visual groups on desktop; rows on mobile
- Content dividers: thin neutral rules, no heavy card shadows

## Responsive observations

- At `390px`, the utility header is reduced to the OpenAI Developers wordmark and a mobile drawer trigger.
- The API section rail and desktop sidebar are hidden from the main flow.
- The model header stacks vertically; action buttons remain in a horizontal row that can overflow the captured viewport like the source.
- The five metric groups become full-width divider-separated rows.
