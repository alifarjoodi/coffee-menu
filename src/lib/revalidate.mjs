/**
 * The CMS revalidation contract (`POST /api/revalidate`).
 *
 * The signature is an HMAC-SHA256 of the **exact raw request body bytes**, sent as
 * `x-eshobe-signature: sha256=<hex>`. `x-eshobe-timestamp` is informational and is
 * not signed in this v1 renderer contract — prepending it would reject every
 * notice the CMS sends.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidateSecret, siteDomain } from '../cms/env.mjs'

export function verifyRevalidateSignature(rawBody, header) {
  const secret = revalidateSecret()
  if (!secret || typeof header !== 'string') return false

  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const a = Buffer.from(expected)
  const b = Buffer.from(header.trim())
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * The CMS sends `/{domain}/{locale}/…` paths (the built-in renderer's shape). This
 * theme serves one screen, so the domain segment is stripped when present.
 */
export function toThemePath(cmsPath, domain = siteDomain()) {
  const raw = String(cmsPath ?? '').trim()
  if (!raw) return '/'
  let path = raw.startsWith('/') ? raw : `/${raw}`
  if (domain) {
    const prefix = `/${domain}`
    if (path === prefix) return '/'
    if (path.startsWith(`${prefix}/`)) path = path.slice(prefix.length) || '/'
  }
  return path
}

/**
 * Semantic hints (`resources`) may name collections; the whole menu is one screen,
 * so any product/taxonomy/media change re-renders `/`.
 */
const MENU_RESOURCES = new Set([
  'products',
  'product',
  'taxonomy-terms',
  'taxonomy-definitions',
  'terms',
  'media',
  'comments',
  'site',
  'store',
  'theme',
  'branding',
  'navigation',
  'header',
  'footer',
  'runtime-settings',
  'runtimeSettings',
])

export function resourcesTouchMenu(resources) {
  return resources.some((resource) => MENU_RESOURCES.has(String(resource).trim().toLowerCase()))
}

/** Parse the notice body; anything malformed is a 400, never a purge. */
export function parseRevalidateNotice(rawBody) {
  const body = JSON.parse(rawBody)
  const strings = (value) =>
    Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : []
  return {
    paths: strings(body?.paths),
    tags: strings(body?.tags),
    resources: strings(body?.resources),
    siteId: typeof body?.siteId === 'string' ? body.siteId : null,
  }
}
