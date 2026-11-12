/**
 * Just enough DOM to run `app.js` headlessly.
 *
 * The screen is vanilla JavaScript with no build step and no test framework, so the
 * way to keep its data path honest is to execute the real file against a document
 * stub and assert on what it rendered. This is not a browser: layout, events and
 * `innerHTML` parsing are out of scope — only the markup the script produces is.
 */

export function installDom() {
  const elements = new Map()

  const classList = () => ({ toggle() {}, add() {}, remove() {}, contains: () => false })

  const makeElement = (selector) => ({
    selector,
    innerHTML: '',
    textContent: '',
    hidden: false,
    dataset: {},
    style: {},
    offsetWidth: 0,
    classList: classList(),
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    getAttribute: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => ({ setAttribute() {}, removeAttribute() {}, classList: classList() }),
    focus() {},
    blur() {},
    select() {},
    scrollIntoView() {},
    appendChild() {},
    remove() {},
    contains: () => false,
  })

  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, makeElement(selector))
    return elements.get(selector)
  }

  const document = {
    querySelector: element,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => makeElement('div'),
    activeElement: { tagName: 'BODY' },
    body: { style: {} },
  }

  const window = { innerWidth: 1280, innerHeight: 900, scrollX: 0, scrollY: 0, addEventListener() {} }

  globalThis.document = document
  globalThis.window = window

  return { document, window, element }
}
