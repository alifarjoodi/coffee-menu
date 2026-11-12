/**
 * Server→CMS REST client.
 *
 * The tenant is the site API key (or, keyless, the `Host` of `ESHOBE_SITE_DOMAIN`);
 * it is never a query parameter or a body field. Errors are typed so a cache layer
 * can tell "the CMS is unreachable, serve the last good response" from "this host
 * does not exist, fail now".
 */

import { cmsOrigin, cmsRequestHeaders } from './env.mjs'

const DEFAULT_TIMEOUT_MS = 8_000

export class CmsError extends Error {
  /** @param {string} message @param {{status?: number, fatal?: boolean}} [meta] */
  constructor(message, { status = 0, fatal = false } = {}) {
    super(message)
    this.name = 'CmsError'
    this.status = status
    this.fatal = fatal
  }
}

const timeoutMs = () => {
  const value = Number(process.env.ESHOBE_CMS_TIMEOUT_MS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS
}

/**
 * `path` is the part after `/api/` — `site`, `products?limit=12`, `media/file/x.png`.
 * Returns the parsed JSON body; throws `CmsError` on anything else.
 */
export async function cmsJson(path, { search = '', timeout = timeoutMs() } = {}) {
  const base = cmsOrigin()
  if (!base) throw new CmsError('cms-unconfigured', { status: 0, fatal: true })

  let target
  try {
    target = new URL(`/api/${String(path).replace(/^\/+/, '')}${search}`, base)
  } catch {
    throw new CmsError('cms-bad-url', { status: 0, fatal: true })
  }
  if (!target.pathname.startsWith('/api/')) {
    throw new CmsError('cms-bad-url', { status: 0, fatal: true })
  }

  let response
  try {
    response = await fetch(target, {
      headers: cmsRequestHeaders(),
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
    })
  } catch (error) {
    throw new CmsError(`cms-unreachable: ${error?.message ?? 'network'}`, { status: 0 })
  }

  if (!response.ok) {
    // An unknown host is a definitive answer about this tenant, not an outage.
    throw new CmsError(`cms-${response.status}`, {
      status: response.status,
      fatal: response.status === 404,
    })
  }

  try {
    return await response.json()
  } catch {
    throw new CmsError('cms-invalid-json', { status: response.status })
  }
}

/** Collection read that degrades to `[]` — a missing/older collection is not an outage. */
export async function cmsList(path, { label = path } = {}) {
  try {
    const data = await cmsJson(path)
    return Array.isArray(data?.docs) ? data.docs : []
  } catch (error) {
    if (process.env.ESHOBE_DEBUG) {
      console.warn(`[cms] ${label} unavailable: ${error?.message ?? error}`)
    }
    return []
  }
}
