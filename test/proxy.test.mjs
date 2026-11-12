import assert from 'node:assert/strict'
import { test } from 'node:test'

import { publicApiPath } from '../src/cms/proxy.mjs'

test('the visitor-facing /api surface is an allowlist', () => {
  assert.equal(publicApiPath('GET', ['site']), 'site')
  assert.equal(publicApiPath('HEAD', ['site']), 'site')
  assert.equal(publicApiPath('GET', ['media', 'file', 'logo.svg']), 'media/file/logo.svg')
  assert.equal(publicApiPath('GET', ['media', 'file', 'a b.png']), 'media/file/a%20b.png')

  // Nothing else is forwarded: no staff endpoints, no writes, no traversal.
  assert.equal(publicApiPath('POST', ['site']), null)
  assert.equal(publicApiPath('GET', ['products']), null)
  assert.equal(publicApiPath('GET', ['users', 'me']), null)
  assert.equal(publicApiPath('GET', ['media', 'file', '..']), null)
  assert.equal(publicApiPath('GET', ['media', 'file', 'a/b']), null)
  assert.equal(publicApiPath('GET', ['media', 'file']), null)
})
