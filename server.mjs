#!/usr/bin/env node
/**
 * Coffee Menu — an Eshobe CMS theme with no build step.
 *
 * The screen itself is the original dependency-free HTML/CSS/JS; this process only
 * puts a CMS behind it: the item list comes from `products`, prices and dates are
 * formatted by the shared runtime, the CMS's public `/api/*` reads are proxied
 * (`proxiesApi: true`), and `/api/health` + `/api/revalidate` stay local.
 *
 * Routes:
 *   GET  /                     the menu screen (theme tokens injected in <head>)
 *   GET  /styles.css /app.js   the original assets, unchanged
 *   GET  /api/menu             theme-owned: products → the item list (cached)
 *   GET  /api/site             proxied to the CMS (keyed)
 *   GET  /api/media/file/<f>   proxied to the CMS (keyed)
 *   GET  /api/health[?live]    local when ?live, otherwise tenant + CMS contract
 *   POST /api/revalidate       signed cache purge
 *   GET  /robots.txt /sitemap.xml
 */

import { readFile } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cmsOrigin, canonicalOrigin, port, publicOrigin, siteDomain } from './src/cms/env.mjs'
import { getMenu, invalidateMenu } from './src/cms/menu.mjs'
import { publicApiPath, proxyToCms } from './src/cms/proxy.mjs'
import { contractMatches, getSite, invalidateSite, isActive } from './src/cms/site.mjs'
import { json, readRawBody, send, sendAsset } from './src/lib/http.mjs'
import { renderShell } from './src/lib/shell.mjs'
import {
  parseRevalidateNotice,
  resourcesTouchMenu,
  toThemePath,
  verifyRevalidateSignature,
} from './src/lib/revalidate.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const THEME_KEY = 'coffee-menu'

/** Assets the theme owns; everything else is a 404, never a directory listing. */
const STATIC = new Map([
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'],
])

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

let shellPromise = null
const shell = () => (shellPromise ??= readFile(path.join(ROOT, 'index.html'), 'utf8'))

/** Suspended/archived sites serve a holding page — 200, noindex, no content. */
const holdingPage = (name) => `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${esc(name || 'در حال به‌روزرسانی')}</title>
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="app" style="min-height:100vh;display:grid;place-items:center;padding:24px">
    <section class="card" style="padding:40px 32px;text-align:center;max-width:420px">
      <h1 style="margin:0 0 10px;font-size:18px">این سایت موقتاً در دسترس نیست</h1>
      <p style="margin:0;color:var(--text-2);line-height:1.9">در حال به‌روزرسانی منو هستیم؛ لطفاً کمی بعد دوباره سر بزنید.</p>
    </section>
  </main>
</body>
</html>`

async function handleMenu(req, res) {
  try {
    const { menu, stale } = await getMenu()
    json(res, 200, menu, {
      // Revalidation is the authority: a browser must not hold a stale menu.
      'cache-control': 'no-store',
      ...(stale ? { 'x-eshobe-stale': '1' } : {}),
    })
  } catch (error) {
    json(res, error?.fatal ? 503 : 502, {
      error: 'menu-unavailable',
      message: "منو در دسترس نیست",
    })
  }
}

async function handleHealth(req, res, url) {
  const base = (body) =>
    json(res, 200, { theme: THEME_KEY, timestamp: new Date().toISOString(), renderer: 'ok', ...body })

  // Container health check: process only, no CMS, no database.
  if (url.searchParams.has('live')) return base({ status: 'live' })

  if (!cmsOrigin()) {
    return json(res, 503, {
      theme: THEME_KEY,
      renderer: 'ok',
      status: 'unconfigured',
      detail: 'ESHOBE_CMS_URL is not set',
    })
  }

  const { site, reason, stale } = await getSite()
  if (!site) {
    return json(res, 503, {
      theme: THEME_KEY,
      renderer: 'ok',
      tenant: siteDomain() || null,
      status: reason,
    })
  }
  if (!contractMatches(site)) {
    return json(res, 503, {
      theme: THEME_KEY,
      renderer: 'ok',
      tenant: site.domain,
      status: 'contract-mismatch',
      expected: 1,
      actual: site.contractVersion,
    })
  }
  if (!isActive(site)) {
    return json(res, 503, { theme: THEME_KEY, renderer: 'ok', tenant: site.domain, status: 'site-inactive', site: site.status })
  }

  return json(res, 200, {
    theme: THEME_KEY,
    timestamp: new Date().toISOString(),
    renderer: 'ok',
    status: 'ok',
    tenant: site.domain,
    cms: stale ? 'stale' : 'ok',
    site: site.status,
    siteType: site.type,
    locales: site.availableLocales,
    contractVersion: site.contractVersion,
  })
}

async function handleRevalidate(req, res) {
  let raw
  try {
    raw = await readRawBody(req)
  } catch (error) {
    return json(res, error?.status ?? 400, { error: 'Bad Request' })
  }

  // The HMAC covers the exact raw body bytes, before anything is parsed or purged.
  if (!verifyRevalidateSignature(raw, req.headers['x-eshobe-signature'])) {
    return json(res, 401, { error: 'Unauthorized' })
  }

  let notice
  try {
    notice = parseRevalidateNotice(raw)
  } catch {
    return json(res, 400, { error: 'Invalid JSON' })
  }

  // Answer inside the CMS's 3 second budget; the purge itself is in-process and
  // synchronous, so the next read is already fresh.
  invalidateSite()
  const menuTouched = resourcesTouchMenu(notice.resources) || notice.paths.length === 0
  if (menuTouched) invalidateMenu()

  const paths = [...new Set(notice.paths.map((entry) => toThemePath(entry)).concat('/'))]
  return json(res, 200, {
    revalidated: true,
    resources: notice.resources,
    tags: notice.tags,
    paths,
    menu: menuTouched,
  })
}

function robots(res, site) {
  const origin = canonicalOrigin()
  const lines = ['User-agent: *']
  if (!isActive(site)) lines.push('Disallow: /')
  else lines.push('Allow: /', 'Disallow: /api/')
  if (origin) lines.push('', `Sitemap: ${origin}/sitemap.xml`)
  send(res, 200, `${lines.join('\n')}\n`, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=300',
  })
}

function sitemap(res) {
  const origin = canonicalOrigin() || publicOrigin()
  if (!origin) {
    send(res, 404, '')
    return
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(origin)}/</loc></url>
</urlset>
`
  send(res, 200, body, {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=300',
  })
}

async function route(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const { pathname } = url
  const method = req.method ?? 'GET'

  if (pathname === '/robots.txt' && (method === 'GET' || method === 'HEAD')) {
    const { site } = await getSite()
    return robots(res, site)
  }
  if (pathname === '/sitemap.xml' && (method === 'GET' || method === 'HEAD')) {
    return sitemap(res)
  }

  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/revalidate') {
      if (method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' }, { allow: 'POST' })
      return handleRevalidate(req, res)
    }
    if (pathname === '/api/health' && (method === 'GET' || method === 'HEAD')) {
      return handleHealth(req, res, url)
    }
    if (pathname === '/api/menu' && (method === 'GET' || method === 'HEAD')) {
      return handleMenu(req, res)
    }

    const segments = pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
    const apiPath = publicApiPath(method, segments)
    if (!apiPath) return json(res, 404, { error: 'Not Found' })
    // Media keeps its cache-busting query; the descriptor takes none.
    return proxyToCms(req, res, apiPath, apiPath.startsWith('media/') ? url.search : '')
  }

  if (method !== 'GET' && method !== 'HEAD') {
    return json(res, 405, { error: 'Method Not Allowed' })
  }

  if (pathname === '/' || pathname === '/index.html') {
    const { site } = await getSite()
    if (site && !isActive(site)) {
      return send(res, 200, holdingPage(site.name), {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      })
    }
    const html = renderShell(await shell(), site)
    return send(res, 200, html, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      vary: 'Host',
    })
  }

  const asset = STATIC.get(pathname)
  if (asset) return sendAsset(req, res, ROOT, asset, { cacheControl: 'public, max-age=0, must-revalidate' })

  return json(res, 404, { error: 'Not Found' })
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    console.error('[coffee-menu] request failed', error)
    if (!res.headersSent) json(res, 500, { error: 'Internal Server Error' })
    else res.destroy()
  })
})

server.listen(port(), '0.0.0.0', () => {
  console.log(`[coffee-menu] listening on 0.0.0.0:${port()}`)
  if (!cmsOrigin()) console.warn('[coffee-menu] ESHOBE_CMS_URL is not set — /api/menu will be empty')
})

const shutdown = () => server.close(() => process.exit(0))
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export { server }
