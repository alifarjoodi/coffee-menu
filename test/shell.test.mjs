import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { renderShell } from '../src/lib/shell.mjs'
import { themeStyleTag } from '../src/lib/theme.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const original = await readFile(path.join(ROOT, 'index.html'), 'utf8')

test('with no site (or an empty one) the document is unchanged', () => {
  assert.equal(renderShell(original, null), original)
  assert.equal(renderShell(original, {}), original)
  assert.equal(renderShell(original, { theme: {} }), original)
})

test('the site palette is injected, and only as validated hex', () => {
  const html = renderShell(original, {
    theme: { primary: '#a9764b', accent: '#d9a441', background: '#faf5ef', foreground: '#3b2c22' },
  })
  assert.match(html, /<style id="eshobe-theme">/)
  assert.match(html, /body{--mint:#a9764b/)
  assert.match(html, /--gold:#d9a441/)
  // Everything else is the original document.
  assert.equal(html.replace(/ {2}<style id="eshobe-theme">.*<\/style>\n<\/head>/s, '</head>'), original)

  const hostile = themeStyleTag({ primary: '#fff;}</style><script>alert(1)</script>' })
  assert.doesNotMatch(hostile, /script/)
})

test('branding and the breadcrumb title fill in without touching the layout', () => {
  const html = renderShell(original, {
    name: 'کافه میلک',
    branding: { primaryLogo: { url: '/api/media/file/logo.svg' } },
    themeRuntime: { settings: { menuTitle: 'منو' } },
  })
  assert.match(html, /<img class="crumbs__logo" src="\/api\/media\/file\/logo.svg"/)
  assert.match(html, /<a class="crumbs__link" href="#">منو<\/a>/)
  assert.match(html, /<title>Item List · کافه میلک<\/title>/)
  // A logo outside the CMS file route is never rendered.
  const absolute = renderShell(original, { branding: { primaryLogo: { url: 'https://evil.example/x.svg' } } })
  assert.equal(absolute, original)
})
