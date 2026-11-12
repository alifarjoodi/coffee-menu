import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { beforeEach, test } from 'node:test'

import {
  parseRevalidateNotice,
  resourcesTouchMenu,
  toThemePath,
  verifyRevalidateSignature,
} from '../src/lib/revalidate.mjs'

const SECRET = 'test-revalidate-secret'
const body = JSON.stringify({ paths: ['/coffee.localhost/fa/menu'], resources: ['products'] })
const sign = (raw, secret = SECRET) => `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`

beforeEach(() => {
  process.env.ESHOBE_REVALIDATE_SECRET = SECRET
  process.env.ESHOBE_SITE_DOMAIN = 'coffee.localhost'
})

test('the signature covers the raw body bytes only', () => {
  assert.equal(verifyRevalidateSignature(body, sign(body)), true)
  assert.equal(verifyRevalidateSignature(`${body} `, sign(body)), false)
  assert.equal(verifyRevalidateSignature(body, sign(body, 'another-secret')), false)
  // `x-eshobe-timestamp` is informational; signing `<timestamp>.<body>` is v2.
  assert.equal(verifyRevalidateSignature(`2026-11-12T10:00:00.000Z.${body}`, sign(body)), false)
  assert.equal(verifyRevalidateSignature(body, null), false)
})

test('no secret configured means no notice is accepted', () => {
  delete process.env.ESHOBE_REVALIDATE_SECRET
  assert.equal(verifyRevalidateSignature(body, sign(body)), false)
})

test('CMS paths lose their domain segment', () => {
  assert.equal(toThemePath('/coffee.localhost/fa/menu'), '/fa/menu')
  assert.equal(toThemePath('/coffee.localhost'), '/')
  assert.equal(toThemePath('/menu'), '/menu')
  assert.equal(toThemePath(''), '/')
})

test('a notice names what it invalidates', () => {
  assert.equal(resourcesTouchMenu(['products']), true)
  assert.equal(resourcesTouchMenu(['media']), true)
  assert.equal(resourcesTouchMenu(['posts']), false)

  const notice = parseRevalidateNotice(body)
  assert.deepEqual(notice.resources, ['products'])
  assert.deepEqual(notice.paths, ['/coffee.localhost/fa/menu'])
  assert.equal(parseRevalidateNotice('{"paths":[1,"/a"]}').paths.length, 1)
})
