# AGENTS.md

Tiny web component. `index.js` (~140 lines) owns all logic. `react.js` is a thin wrapper. No build.

## Commands
- `npm test` — `node --test`, happy-dom, 7 tests in `test/adaptive-content.test.js`
- `npm pack --dry-run` — verify publish files

## Invariants
- Pick largest `data-min` where `width >= min && width <= max`. Fallback: smallest `min`.
- `width` = `getBoundingClientRect().width`, or `window.innerWidth` if `basis="viewport"`.
- `<template>` clones once into `div[data-adaptive-rendered]`, then toggle `hidden` + `display`.
- Fire `adaptive-change {variant,width,element}` only on variant change.
- Observers: `ResizeObserver` on host, `MutationObserver` on `childList` + `data-min/max/name`, `window resize`.

## Change rules
- Edit `index.js` + `index.d.ts` together. Keep `~1KB`, zero deps.
- Keep SSR CSS in `README.md` in sync.
