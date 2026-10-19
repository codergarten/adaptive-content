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
    if (!this.style.display && typeof getComputedStyle !== 'undefined' && getComputedStyle(this).display === 'inline') {
      this.style.display = 'block';
    }

    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.update());
      this._ro.observe(this);
    }

    if (typeof MutationObserver !== 'undefined') {
      this._mo = new MutationObserver(records => {
        const relevant = records.some(r => {
          if (r.type === 'attributes') return true;
          if (r.type === 'childList') {
            for (const node of [...r.addedNodes, ...r.removedNodes]) {
              if (node.nodeType === 1 && (node.hasAttribute('data-min') || node.hasAttribute('data-max'))) {
                return true;
              }
            }
          }
          return false;
        });
        if (relevant) this.update();
      });
      this._mo.observe(this, {
        childList: true,
        subtree: false,
        attributes: true,
        attributeFilter: ['data-min', 'data-max', 'data-name'],
      });
    }

    this._on = () => this.update();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._on);
    }
    this.update();
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._mo) this._mo.disconnect();
    if (this._on && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._on);
    }
  }

  attributeChangedCallback() { if (this.isConnected) this.update(); }

  update() {
    const width = this.getAttribute('basis') === 'viewport'
      ? (typeof window !== 'undefined' ? window.innerWidth : 0)
      : this.getBoundingClientRect().width;

    const variants = [...this.children].filter(el => el.hasAttribute('data-min') || el.hasAttribute('data-max'));
    if (!variants.length) return;

    const getMin = el => (el.hasAttribute('data-min') ? Number(el.getAttribute('data-min')) || 0 : 0);
    const getMax = el => (el.hasAttribute('data-max') ? Number(el.getAttribute('data-max')) || Infinity : Infinity);

    let best = null;
    for (const v of variants) {
      const min = getMin(v);
      const max = getMax(v);
      if (width >= min && width <= max) {
        if (!best) {
          best = v;
        } else {
          const bestMin = getMin(best);
          if (min > bestMin) {
            best = v;
          } else if (min === bestMin && max < getMax(best)) {
            best = v;
          }
        }
      }
    }

    // Container narrower than every variant or no range matched: fall back to the lowest min.
    if (!best) best = variants.reduce((a, b) => (getMin(b) < getMin(a) ? b : a));

    for (const v of variants) {
      const el = v.tagName === 'TEMPLATE' ? this._render(v, v === best) : v;
      if (el) {
        const isShown = v === best;
        el.hidden = !isShown;
        el.style.display = isShown ? '' : 'none';
      }
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
