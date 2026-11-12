/**
 * The visitor-facing `/api/*` surface, as an allowlist (`proxiesApi: true`).
 *
 * A browser on this site needs the public site descriptor and media files — nothing
 * else. Every other path, and every other method, is a 404 here: the CMS keeps
 * `/api/*` closed on customer domains by design, and this proxy must not reopen it
 * (no login, no staff endpoints, no `..` walk out of `/api`).
 */

import http from 'node:http'
import https from 'node:https'

import { json } from '../lib/http.mjs'
import { cmsOrigin, cmsRequestHeaders, siteApiKey } from './env.mjs'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'trailers',
  'transfer-encoding',
  'upgrade',
])

/** Visitor credentials are never forwarded: this is anonymous traffic. */
const STRIP = new Set(['authorization', 'cookie', 'x-api-key', 'host', 'content-length'])

const PASS_BACK = [
  'content-type',
  'content-length',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
  'accept-ranges',
  'content-range',
  'retry-after',
  'vary',
  'location',
]

/** One path segment: no separators, no dot segments, no control characters. */
const fileSegment = (segment) =>
  typeof segment === 'string' &&
  segment.length > 0 &&
  segment.length <= 255 &&
  segment !== '.' &&
  segment !== '..' &&
  !/[/\\\u0000-\u001f\u007f]/.test(segment)

/** The canonical CMS path for an allowlisted read, or `null`. */
export function publicApiPath(method, segments) {
  if (method !== 'GET' && method !== 'HEAD') return null
  if (segments.length === 1 && segments[0] === 'site') return 'site'
  if (segments.length === 3 && segments[0] === 'media' && segments[1] === 'file' && fileSegment(segments[2])) {
    return `media/file/${encodeURIComponent(segments[2])}`
  }
  return null
}

function proxyHeaders(incoming) {
  const out = {}
  for (const [key, value] of Object.entries(incoming)) {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP.has(lower) || STRIP.has(lower) || typeof value !== 'string') continue
    out[lower] = value
  }
  // Tenant: the site key when there is one (the CMS keeps its own Host), else the
  // customer domain as Host — the same rule the server→CMS client follows.
  // Lower-cased so `Accept` in the client defaults cannot arrive twice.
  for (const [key, value] of Object.entries(cmsRequestHeaders())) out[key.toLowerCase()] = value
  return out
}

/** Forward an allowlisted read to the CMS and stream the answer back. */
export function proxyToCms(req, res, apiPath, search = '') {
  const base = cmsOrigin()
  if (!base) {
    json(res, 503, { error: 'CMS is not configured' })
    return
  }

  let target
  try {
    target = new URL(`${base}/api/${apiPath}${search}`)
  } catch {
    json(res, 404, { error: 'Not Found' })
    return
  }
  if (!target.pathname.startsWith('/api/')) {
    json(res, 404, { error: 'Not Found' })
    return
  }

  const secure = target.protocol === 'https:'
  const client = secure ? https : http

  const upstream = client.request(
    target,
    {
      method: req.method,
      headers: proxyHeaders(req.headers),
      servername: secure ? target.hostname : undefined,
      timeout: 20_000,
    },
    (answer) => {
      const headers = {}
      for (const name of PASS_BACK) {
        const value = answer.headers[name]
        if (typeof value === 'string') headers[name] = value
      }
      // The descriptor is key-resolved (`private, no-store`) — never shared-cache it.
      if (apiPath === 'site' && !siteApiKey()) headers['vary'] = 'Host'

      res.writeHead(answer.statusCode ?? 502, headers)
      if (req.method === 'HEAD') {
        answer.resume()
        res.end()
        return
      }
      answer.pipe(res)
    },
  )

  upstream.on('timeout', () => upstream.destroy(new Error('timeout')))
  upstream.on('error', () => {
    if (!res.headersSent) json(res, 502, { error: 'CMS unreachable' })
    else res.destroy()
  })
  upstream.end()
}
