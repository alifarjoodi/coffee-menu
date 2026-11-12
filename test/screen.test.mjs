import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

import { installDom } from './fake-dom.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const code = await readFile(path.join(ROOT, 'app.js'), 'utf8')

const MENU = {
  locale: 'fa',
  currency: { code: 'IRT', minorDigits: 0, unit: { fa: 'تومان', en: 'Toman' } },
  items: [
    {
      id: 'a',
      code: '#CFE0F9I93',
      name: 'Choco Choco',
      category: 'Coffee / Chocolate',
      rating: 4.9,
      reviews: 1284,
      price: 250_000,
      sellPrice: 309_000,
      stock: 10,
      status: 'available',
      emoji: '🍫',
      tint: '#f4e7d4',
      desc: 'Double cocoa espresso.',
      image: null,
      imageAlt: '',
    },
    {
      id: 'b',
      code: '#CFFE8427F1',
      name: 'Biscuit Cream',
      category: 'Coffee / Cappuccino',
      rating: 4.2,
      reviews: 356,
      price: 150_000,
      sellPrice: null,
      stock: 0,
      status: 'unavailable',
      emoji: '🍪',
      tint: '#f6ecd8',
      desc: 'Biscuit cream cappuccino.',
      image: '/api/media/file/biscuit.svg',
      imageAlt: 'Biscuit Cream',
    },
  ],
}

async function renderScreen(menu = MENU, { ok = true } = {}) {
  const dom = installDom()
  globalThis.fetch = async () => ({ ok, json: async () => menu })

  vm.runInThisContext(code, { filename: 'app.js' })
  // `loadMenu()` is async: let its fetch/JSON microtasks settle.
  await new Promise((resolve) => setTimeout(resolve, 25))

  return dom.element('#rows').innerHTML
}

test('the list is drawn from the menu the CMS supplies', async () => {
  const html = await renderScreen()
  assert.equal((html.match(/<tr /g) || []).length, 2)
  assert.match(html, /Choco Choco/)
  assert.match(html, /Coffee \/ Chocolate/)
  assert.match(html, /chip--available">موجود/)
  assert.match(html, /chip--unavailable">ناموجود/)
})

test('prices carry the site currency and Persian digits', async () => {
  const html = await renderScreen()
  assert.match(html, /۲۵۰٬۰۰۰ تومان/)
  assert.match(html, /<div class="price-old">Sell Price <span>۳۰۹٬۰۰۰ تومان<\/span><\/div>/)
  // No compare-at price, no "Sell Price" line — and no `null` leaking into the row.
  assert.equal((html.match(/price-old/g) || []).length, 1)
  assert.doesNotMatch(html, /undefined|null/)
})

test('a product photo replaces the emoji tile, a product without one keeps it', async () => {
  const html = await renderScreen()
  assert.match(html, /<span class="thumb"[^>]*><img src="\/api\/media\/file\/biscuit\.svg" alt="Biscuit Cream"/)
  assert.match(html, /<span class="thumb"[^>]*>🍫<\/span>/)
})

test('numbers follow the locale, not the browser default', async () => {
  const html = await renderScreen()
  assert.match(html, /rating__score">۴٫۹/)
  assert.match(html, /rating__count">۱٬۲۸۴ reviews/)
})

test('an unreachable menu leaves an empty list instead of throwing', async () => {
  const html = await renderScreen(MENU, { ok: false })
  assert.equal((html.match(/<tr /g) || []).length, 0)
  assert.match(html, /<tr><td colspan="4">/)
  assert.match(html, /No items match your filters/)
})
