/**
 * <adaptive-content>: show only the one variant that fits the space available.
 *
 *   <adaptive-content>
 *     <p data-min="0">Short</p>
 *     <p data-min="400">Longer</p>
 *     <template data-min="700"><p>Lazily rendered, only when chosen</p></template>
 *   </adaptive-content>
 *
 * Attributes: basis="container" (default) | "viewport"
 * Event:      "adaptive-change" -> detail { variant, width, element }
 */
export class AdaptiveContent extends HTMLElement {
  static get observedAttributes() { return ['basis']; }

  get basis() { return this.getAttribute('basis') || 'container'; }
  set basis(val) {
    if (val) this.setAttribute('basis', val);
    else this.removeAttribute('basis');
  }

  /** The currently shown variant element (the <template> itself for templates). */
  get current() { return this._cur || null; }

  connectedCallback() {
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.update());
      this._ro.observe(this);
    }
    this._on = () => this.update();
    addEventListener('resize', this._on);
    this.update();
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._on) removeEventListener('resize', this._on);
  }

  attributeChangedCallback() { if (this.isConnected) this.update(); }

  update() {
    const width = this.getAttribute('basis') === 'viewport'
      ? innerWidth
      : this.getBoundingClientRect().width;

    const variants = [...this.children].filter(el => el.hasAttribute('data-min'));
    if (!variants.length) return;

    const min = el => Number(el.getAttribute('data-min')) || 0;
    let best = null;
    for (const v of variants) {
      if (min(v) <= width && (!best || min(v) >= min(best))) best = v;
    }
    // Container narrower than every variant: fall back to the smallest one.
    if (!best) best = variants.reduce((a, b) => (min(b) < min(a) ? b : a));

    for (const v of variants) {
      const el = v.tagName === 'TEMPLATE' ? this._render(v, v === best) : v;
      if (el) el.hidden = v !== best;
    }

    if (best !== this._cur) {
      this._cur = best;
      this.dispatchEvent(new CustomEvent('adaptive-change', {
        detail: { variant: best.getAttribute('data-name') || null, width: Math.round(width), element: best },
      }));
    }
  }

  // <template> variants are only cloned into the DOM the first time they are chosen.
  _render(tpl, wanted) {
    let host = tpl._host;
    if (!host && wanted) {
      host = document.createElement('div');
      host.setAttribute('data-adaptive-rendered', '');
      host.appendChild(tpl.content.cloneNode(true));
      tpl.after(host);
      tpl._host = host;
    }
    return host || null;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('adaptive-content')) {
  customElements.define('adaptive-content', AdaptiveContent);
}
