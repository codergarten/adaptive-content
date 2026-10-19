# @codergarten/adaptive-content

[![npm version](https://img.shields.io/npm/v/@codergarten/adaptive-content.svg)](https://www.npmjs.com/package/@codergarten/adaptive-content)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@codergarten/adaptive-content)](https://bundlephobia.com/package/@codergarten/adaptive-content)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://codergarten.github.io/adaptive-content/)

Write several versions of the same information. Only the one that fits the space available is shown.

Useful for education and editorial apps: a concept can be a one-liner on a phone, a paragraph on a tablet, and an interactive diagram on a desktop, all authored in one place.

- **Zero runtime dependencies**, ~1KB minified + gzipped, standard web component
- Works seamlessly in plain HTML, React, Vue, Svelte, Astro, Next.js, and HTMX
- Reacts to the **container** width (so it adapts perfectly in sidebars and cards) or the **viewport**
- `<template>` variants are rendered **lazily**, only cloned into the DOM when selected
- Dynamic reactivity via `MutationObserver` and `ResizeObserver`

[**Explore the Interactive Demo →**](https://codergarten.github.io/adaptive-content/)

---

## Install

```bash
npm install @codergarten/adaptive-content
```

```js
import '@codergarten/adaptive-content';
```

Or without a build step directly in the browser:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@codergarten/adaptive-content@0.1.0/index.js"></script>
```

---

## Usage

```html
<adaptive-content>
  <p data-name="tiny" data-min="0">Plants turn light into food.</p>
  <p data-name="short" data-min="240">Plants use sunlight, water and CO2 to make sugar.</p>
  <template data-name="long" data-min="520">
    <p>Full explanation, with diagrams, only rendered when there is room…</p>
  </template>
</adaptive-content>
```

### Attributes & API

| Attribute | Target | Default | Meaning |
|---|---|---|---|
| `data-min` | Variant element | `0` | Minimum width in px required for this variant |
| `data-max` | Variant element | `Infinity` | Optional maximum width in px for range targeting |
| `data-name` | Variant element | `null` | Label passed in `adaptive-change` event details |
| `basis` | `<adaptive-content>` | `container` | Measurement basis: `container` or `viewport` |

The component picks the variant that satisfies `width >= data-min` and `width <= data-max`, prioritizing the largest matching `data-min`. If the container is narrower than every variant, it safely falls back to the smallest variant.

---

## Range Matching (`data-min` & `data-max`)

You can create bounded variants designed exclusively for specific display intervals:

```html
<adaptive-content>
  <span data-name="mobile-pill" data-min="0" data-max="480">📱 App</span>
  <span data-name="tablet-pill" data-min="481" data-max="768">📱 Tablet</span>
  <span data-name="desktop-pill" data-min="769">💻 Full Dashboard</span>
</adaptive-content>
```

---

## React

A dedicated React wrapper with `forwardRef` and full TypeScript typings is included:

```jsx
import { useRef } from 'react';
import { AdaptiveContent } from '@codergarten/adaptive-content/react';

function Header() {
  const ref = useRef(null);

  return (
    <AdaptiveContent ref={ref} basis="container" onChange={d => console.log('Active:', d.variant)}>
      <p data-name="tiny" data-min={0}>Plants turn light into food.</p>
      <p data-name="long" data-min={400}>Full interactive explanation…</p>
    </AdaptiveContent>
  );
}
```

*In React, use standard elements as variants; render conditionally inside them if you need lazy tree evaluation.*

---

## Events & Telemetry

Listen for variant changes to trigger analytics or synchronize sibling UI:

```js
const ac = document.querySelector('adaptive-content');

ac.addEventListener('adaptive-change', e => {
  console.log('Variant active:', e.detail.variant); // e.g. "long"
  console.log('Container width:', e.detail.width);   // e.g. 560
  console.log('DOM Element:', e.detail.element);     // variant element or <template>
});
```

---

## SSR & Hydration (Preventing FOUC)

Until custom elements initialize in SSR frameworks (Next.js, Astro, Remix, Nuxt), all variants are in the initial HTML. To keep only the first variant visible while loading:

```css
/* Show only the first variant until JavaScript defines the custom element */
adaptive-content:not(:defined) > :not(:first-child),
adaptive-content:not(:defined) > template {
  display: none !important;
}
```

---

## Comparison: `<adaptive-content>` vs Pure CSS `@container`

| Feature | `<adaptive-content>` | CSS `@container` |
|---|---|---|
| **Authoring** | Plain HTML / Markdown / CMS friendly | Requires writing custom CSS media/container queries |
| **Lazy Evaluation** | ✅ Clones `<template>` elements only when space exists | ❌ Entire DOM subtree is rendered and evaluated |
| **Events / Analytics** | ✅ Emits `adaptive-change` events for telemetry | ❌ No native resize or active-rule JavaScript event |
| **Setup** | Zero CSS required; works out of the box | Requires setting `container-type: inline-size` on parent |

---

## TypeScript

TypeScript declarations are bundled for both the web component and React wrapper:

```ts
import type { AdaptiveContent, AdaptiveChangeDetail } from '@codergarten/adaptive-content';
import type { AdaptiveContentProps } from '@codergarten/adaptive-content/react';
```

---

## Development & Testing

Run unit tests via Node's native test runner:

```bash
npm test
```

Dry-run package contents:

```bash
npm pack --dry-run
```

---

## License

MIT © [Codergarten](https://github.com/codergarten)
