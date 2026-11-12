import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createMockCms } from '../scripts/mock-cms.mjs'

let server
let getMenu
let invalidateMenu

before(async () => {
  server = createMockCms()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  process.env.ESHOBE_CMS_URL = `http://127.0.0.1:${server.address().port}`
  process.env.ESHOBE_API_KEY = 'test-site-key'
  process.env.ESHOBE_SITE_DOMAIN = 'coffee.localhost'
  delete process.env.ESHOBE_DEFAULT_LOCALE

  ;({ getMenu, invalidateMenu } = await import('../src/cms/menu.mjs'))
})

after(() => server?.close())

test('products become the item list the screen draws', async () => {
  const { menu } = await getMenu()

  assert.equal(menu.locale, 'fa')
  assert.equal(menu.dir, 'rtl')
  assert.equal(menu.currency.code, 'IRT')
  assert.equal(menu.currency.unit.fa, 'تومان')
  assert.equal(menu.items.length, 12)

  const first = menu.items[0]
  assert.equal(first.name, 'Choco Choco')
  // The taxonomy path is the category label, exactly as the shipped data had it.
  assert.equal(first.category, 'Coffee / Chocolate')
  // Prices stay integer minor units; the browser formats them.
  assert.equal(first.price, 250_000)
  assert.equal(first.sellPrice, 309_000)
  assert.equal(first.status, 'available')
  assert.match(first.createdLabel, /۱۴۰۵/)
  assert.equal(typeof first.image, 'object') // null when the catalogue has no photo
})

test('a tracked product with no stock is unavailable', async () => {
  const { menu } = await getMenu()
  const biscuit = menu.items.find((item) => item.name === 'Biscuit Cream')
  assert.equal(biscuit.status, 'unavailable')
  assert.equal(biscuit.stock, 0)
})

test('the score comes from approved review comments', async () => {
  const { menu } = await getMenu()
  const first = menu.items[0]
  assert.equal(first.rating, 4.9)
  assert.equal(first.reviews, 4)
})

test('a second read is served from the in-process cache', async () => {
  const first = await getMenu()
  invalidateMenu()
  const second = await getMenu()
  assert.equal(second.stale, false)
  assert.equal(second.menu.items.length, first.menu.items.length)
})
