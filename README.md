# @codergarten/adaptive-content

Write several versions of the same information. Only the one that fits the space available is shown.

Useful for education: a concept can be a one-liner on a phone, a paragraph on a tablet and a full explanation on a desktop, all authored in one place.

- Zero dependencies, about 60 lines, standard web component
- Works in plain HTML, React, Vue, Svelte, Astro, etc.
- Reacts to the **container** width (so it works in sidebars) or the **viewport**
- `<template>` variants are rendered lazily, only when chosen

## Install

```bash
npm install @codergarten/adaptive-content
```

```js
import '@codergarten/adaptive-content';
```

Or without a build step:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@codergarten/adaptive-content@0.1.0/index.js"></script>
```

## Use

```html
<adaptive-content>
  <p data-name="tiny"   data-min="0">Plants turn light into food.</p>
  <p data-name="short"  data-min="240">Plants use sunlight, water and CO2 to make sugar.</p>
  <template data-name="long" data-min="520">
    <p>Full explanation, with diagrams, only rendered when there is room…</p>
  </template>
</adaptive-content>
```

`data-min` is the minimum width in px at which a variant may be shown. The component picks the variant with the largest `data-min` that fits. If the space is narrower than every variant, the smallest is shown.

| Attribute | Where | Meaning |
|---|---|---|
| `data-min` | each variant | minimum width (px) for that variant |
| `data-name` | each variant (optional) | label returned in the change event |
| `basis` | `<adaptive-content>` | `container` (default) or `viewport` |

The container needs a real width. It is `display: block` by default in most layouts; if you place it in a flex/grid cell, make sure the cell has a width.

## React

```jsx
import { AdaptiveContent } from '@codergarten/adaptive-content/react';

<AdaptiveContent basis="container" onChange={d => console.log(d.variant)}>
  <p data-name="tiny" data-min={0}>Plants turn light into food.</p>
  <p data-name="long" data-min={400}>Full explanation…</p>
</AdaptiveContent>
```

In React use normal elements as variants (not `<template>`); render conditionally inside them if you need laziness.

## Event

```js
el.addEventListener('adaptive-change', e => {
  console.log(e.detail.variant, e.detail.width);
});
```

## Before JavaScript loads

Until the element is defined, all variants are visible. To show only the first one meanwhile:

```css
adaptive-content:not(:defined) > :not(:first-child) { display: none; }
```

## TypeScript

Types are included (`AdaptiveContent`, `AdaptiveChangeDetail`, and the `HTMLElementTagNameMap` entry).

## Notes

- Hidden variants stay in the DOM (except unrendered `<template>`s), so search engines and screen readers may still see them. Use `<template>` for large or media-heavy variants.
- A pure-CSS alternative is `container-type: inline-size` with `@container (min-width: …)` rules toggling `display`. This package is for when you want events, lazy rendering or authoring that isn't tied to CSS.

## Publish (maintainers)

```bash
npm pack --dry-run   # check contents
npm publish          # scope is @codergarten, so you need the npm org "codergarten"
```

## Demo

Live demo: https://codergarten.github.io/adaptive-content/ (deployed by the GitHub Pages workflow in `.github/workflows/pages.yml`).

## License

MIT, Codergarten
