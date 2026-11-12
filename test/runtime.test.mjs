import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  contractVersion,
  formatDate,
  formatNumber,
  formatPrice,
  isHexColor,
  themeCss,
} from '../vendor/site-runtime/index.mjs'

test('contract version is the one this theme was written for', () => {
  assert.equal(contractVersion, 1)
})

test('a price is integer minor units of the site currency', () => {
  assert.equal(formatPrice(180_000, 'IRT', 'fa'), '۱۸۰٬۰۰۰ تومان')
  assert.equal(formatPrice(180_000, 'IRT', 'en'), '180,000 Toman')
  assert.equal(formatPrice(1250, 'USD', 'en'), '12.50 $')
  assert.equal(formatPrice(null, 'IRT', 'fa'), '')
})

test('numbers and dates follow the locale, not the browser', () => {
  assert.equal(formatNumber(1234, 'fa'), '۱٬۲۳۴')
  assert.equal(formatNumber(1234, 'en'), '1,234')
  // Shamsi on fa: 2024-05-02 is Ordibehesht 1403.
  assert.match(formatDate('2024-05-02T12:00:00.000Z', 'fa'), /۱۴۰۳/)
  assert.match(formatDate('2024-05-02T12:00:00.000Z', 'en'), /2024/)
})

test('theme tokens are emitted only for validated hex colours', () => {
  assert.equal(isHexColor('#fff'), true)
  assert.equal(isHexColor('#faf5ef'), true)
  assert.equal(isHexColor('red; } body{display:none}'), false)

  const css = themeCss({ primary: '#a9764b', background: '#faf5ef', lineHeight: 1.5 })
  assert.match(css, /--primary:#a9764b;/)
  assert.match(css, /--line-height:1.5;/)
  assert.match(css, /html:not\(\[data-theme='dark'\]\) body\{--background:#faf5ef;\}/)
  assert.equal(themeCss(null), '')
})
