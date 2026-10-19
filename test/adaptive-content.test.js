import test from 'node:test';
import assert from 'node:assert/strict';
import { GlobalWindow } from 'happy-dom';

function setupEnvironment() {
  const window = new GlobalWindow({ url: 'https://localhost' });
  const document = window.document;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.customElements = window.customElements;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.MutationObserver = window.MutationObserver;
  globalThis.ResizeObserver = window.ResizeObserver;
  globalThis.innerWidth = 1024;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  return { window, document };
}

test('AdaptiveContent unit test suite', async (t) => {
  const { window, document } = setupEnvironment();
  const { AdaptiveContent } = await import('../index.js');

  await t.test('picks the variant with the largest fitting data-min', () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p id="v0" data-name="small" data-min="0">Small</p>
      <p id="v400" data-name="medium" data-min="400">Medium</p>
      <p id="v800" data-name="large" data-min="800">Large</p>
    `;
    document.body.appendChild(el);

    // Mock width = 500
    el.getBoundingClientRect = () => ({ width: 500, height: 50, top: 0, left: 0, bottom: 50, right: 500 });
    el.update();

    const v0 = el.querySelector('#v0');
    const v400 = el.querySelector('#v400');
    const v800 = el.querySelector('#v800');

    assert.equal(v0.hidden, true);
    assert.equal(v0.style.display, 'none');
    assert.equal(v400.hidden, false);
    assert.equal(v400.style.display, '');
    assert.equal(v800.hidden, true);
    assert.equal(v800.style.display, 'none');
    assert.equal(el.current, v400);

    document.body.removeChild(el);
  });

  await t.test('falls back to the smallest variant when narrower than all data-min', () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p id="v300" data-min="300">Min 300</p>
      <p id="v600" data-min="600">Min 600</p>
    `;
    document.body.appendChild(el);

    el.getBoundingClientRect = () => ({ width: 150, height: 50, top: 0, left: 0, bottom: 50, right: 150 });
    el.update();

    const v300 = el.querySelector('#v300');
    const v600 = el.querySelector('#v600');

    assert.equal(v300.hidden, false);
    assert.equal(v600.hidden, true);
    assert.equal(el.current, v300);

    document.body.removeChild(el);
  });

  await t.test('supports data-max range constraints', () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p id="mobile" data-min="0" data-max="480">Mobile Only</p>
      <p id="tablet" data-min="481" data-max="768">Tablet Only</p>
      <p id="desktop" data-min="769">Desktop</p>
    `;
    document.body.appendChild(el);

    const mobile = el.querySelector('#mobile');
    const tablet = el.querySelector('#tablet');
    const desktop = el.querySelector('#desktop');

    // Test mobile width 320
    el.getBoundingClientRect = () => ({ width: 320, height: 50, top: 0, left: 0, bottom: 50, right: 320 });
    el.update();
    assert.equal(mobile.hidden, false);
    assert.equal(tablet.hidden, true);
    assert.equal(desktop.hidden, true);

    // Test tablet width 600
    el.getBoundingClientRect = () => ({ width: 600, height: 50, top: 0, left: 0, bottom: 50, right: 600 });
    el.update();
    assert.equal(mobile.hidden, true);
    assert.equal(tablet.hidden, false);
    assert.equal(desktop.hidden, true);

    // Test desktop width 1024
    el.getBoundingClientRect = () => ({ width: 1024, height: 50, top: 0, left: 0, bottom: 50, right: 1024 });
    el.update();
    assert.equal(mobile.hidden, true);
    assert.equal(tablet.hidden, true);
    assert.equal(desktop.hidden, false);

    document.body.removeChild(el);
  });

  await t.test('lazily renders template variants only when chosen', () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p id="short" data-min="0">Short</p>
      <template id="tpl" data-min="600">
        <span id="rendered-content">Heavy Interactive Diagram</span>
      </template>
    `;
    document.body.appendChild(el);

    el.getBoundingClientRect = () => ({ width: 300, height: 50, top: 0, left: 0, bottom: 50, right: 300 });
    el.update();

    // Template content should NOT be in document DOM yet
    assert.equal(el.querySelector('#rendered-content'), null);
    assert.equal(el.querySelector('[data-adaptive-rendered]'), null);

    // Resize past 600px
    el.getBoundingClientRect = () => ({ width: 700, height: 50, top: 0, left: 0, bottom: 50, right: 700 });
    el.update();

    const renderedHost = el.querySelector('[data-adaptive-rendered]');
    assert.notEqual(renderedHost, null);
    assert.equal(renderedHost.hidden, false);
    assert.notEqual(el.querySelector('#rendered-content'), null);

    // Shrink back to 300px
    el.getBoundingClientRect = () => ({ width: 300, height: 50, top: 0, left: 0, bottom: 50, right: 300 });
    el.update();
    assert.equal(renderedHost.hidden, true);
    assert.equal(renderedHost.style.display, 'none');

    document.body.removeChild(el);
  });

  await t.test('dispatches adaptive-change event with detail', () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p data-name="compact" data-min="0">Compact</p>
      <p data-name="spacious" data-min="500">Spacious</p>
    `;

    const events = [];
    el.addEventListener('adaptive-change', (e) => {
      events.push(e.detail);
    });

    el.getBoundingClientRect = () => ({ width: 250, height: 50, top: 0, left: 0, bottom: 50, right: 250 });
    document.body.appendChild(el);

    assert.equal(events.length, 1);
    assert.equal(events[0].variant, 'compact');
    assert.equal(events[0].width, 250);

    // Re-updating with same width shouldn't fire another change event
    el.update();
    assert.equal(events.length, 1);

    // Changing width to trigger new variant
    el.getBoundingClientRect = () => ({ width: 600, height: 50, top: 0, left: 0, bottom: 50, right: 600 });
    el.update();
    assert.equal(events.length, 2);
    assert.equal(events[1].variant, 'spacious');
    assert.equal(events[1].width, 600);

    document.body.removeChild(el);
  });

  await t.test('supports basis="viewport"', () => {
    const el = document.createElement('adaptive-content');
    el.setAttribute('basis', 'viewport');
    el.innerHTML = `
      <p id="v-small" data-min="0">Small</p>
      <p id="v-large" data-min="900">Large</p>
    `;

    // Container width is small, but viewport is large (1024)
    el.getBoundingClientRect = () => ({ width: 200, height: 50, top: 0, left: 0, bottom: 50, right: 200 });
    window.innerWidth = 1024;
    document.body.appendChild(el);

    assert.equal(el.querySelector('#v-large').hidden, false);

    // Change viewport width
    window.innerWidth = 500;
    el.update();
    assert.equal(el.querySelector('#v-small').hidden, false);

    document.body.removeChild(el);
  });

  await t.test('updates variant automatically when children are mutated', async () => {
    const el = document.createElement('adaptive-content');
    el.innerHTML = `
      <p id="first" data-name="first" data-min="0">First</p>
    `;
    el.getBoundingClientRect = () => ({ width: 600, height: 50, top: 0, left: 0, bottom: 50, right: 600 });
    document.body.appendChild(el);

    assert.equal(el.current.id, 'first');

    // Dynamically insert a better fitting variant
    const newVariant = document.createElement('p');
    newVariant.id = 'second';
    newVariant.dataset.min = '400';
    newVariant.dataset.name = 'second';
    newVariant.textContent = 'Second';
    el.appendChild(newVariant);

    // Wait for MutationObserver microtask to fire
    await new Promise(resolve => setTimeout(resolve, 50));

    assert.equal(el.current.id, 'second');
    assert.equal(newVariant.hidden, false);
    assert.equal(el.querySelector('#first').hidden, true);

    document.body.removeChild(el);
  });
});
