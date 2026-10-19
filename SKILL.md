---
name: adaptive-content
description: Show only the content variant that fits the available width. Use for responsive one-liner vs paragraph vs interactive diagram from one source.
---

## When to use
Same information at multiple detail levels keyed to available width (cards, sidebars, phone one-liner to desktop full version).

## Pattern
```html
<adaptive-content>
  <p data-name="tiny" data-min="0">One-liner.</p>
  <p data-name="full" data-min="400">Full version…</p>
  <template data-name="rich" data-min="700"><p>Heavy DOM, cloned only when selected…</p></template>
</adaptive-content>
```

## Rules
- Every direct child needs `data-min` (px). Optional `data-max` for bounded ranges.
- `basis="container"` (default) measures element width; `basis="viewport"` measures window.
- Listen via `adaptive-change`: `e.detail = {variant, width, element}`.
- Force re-check with `el.update()` after manual width changes.
