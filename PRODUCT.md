# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Frontend devs evaluating the npm package (primary), content/education authors writing multi-level variants (secondary). Both use the GitHub Pages demo to decide.

## Product Purpose

`@codergartenau/adaptive-content` shows only the content variant that fits the available width. Write once, adapt everywhere: one-liner on phone, paragraph on tablet, interactive diagram on desktop. Success = dev copies install snippet and variant markup in under a minute.

## Positioning

Unlike pure CSS `@container`, no CSS setup, lazy `<template>` cloning only when selected, and `adaptive-change` events for telemetry.

## Operating Context

Demo at `codergarten.github.io/adaptive-content/` doubles as docs. Deployed via `pages.yml`: `demo/index.html` + `index.js` assembled to `_site/` with `sed` rewrite of `../index.js` to `./index.js`. Must stay single static file, zero deps, no build. CI: `node --check`, `npm test`, `npm pack --dry-run`.

## Capabilities and Constraints

- Variants: `data-min` / `data-max` / `data-name`; host `basis="container"|"viewport"`.
- Selection: largest fitting `data-min`, fallback smallest. Template clones once.
- React wrapper at `./react`, SSR `not(:defined)` CSS, `~1KB` zero-deps.
- Demo must include: npm install + CDN snippets, live width playground, API table, React snippet, 2–3 use cases.

## Brand Commitments

Name `adaptive-content`, Codergarten MIT. No logo/type commitments. Keep existing demo copy facts (photosynthesis variants, 0/240/360/520 breakpoints).

## Evidence on Hand

`demo/index.html` playground, `README.md` docs, 7 tests in `test/adaptive-content.test.js`. No testimonials, benchmarks, or analytics to fabricate.

## Product Principles

1. Copy-paste first: snippets must work verbatim.
2. Prove fit live: every claim has an interactive variant beside it.
3. Zero setup: no build, no CSS config, no framework lock-in.
