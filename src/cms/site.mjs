/**
 * `GET /api/site` — the one call before first paint.
 *
 * Held in memory and rebuilt only when a revalidation notice arrives or the timer
 * expires; called with a site key it answers `private, no-store` and re-runs several
 * queries, so fetching it per request would be a per-request DB cost.
 */

import { contractVersion } from '../../vendor/site-runtime/index.mjs'
import { TimedCache } from '../lib/cache.mjs'
import { CmsError, cmsJson } from './client.mjs'
import { localeOverride } from './env.mjs'

const cache = new TimedCache({ ttlMs: 30_000, staleMs: 24 * 60 * 60_000 })

/**
 * `{ site, stale, reason }`. `site` is `null` when the host is unknown or the CMS
 * is unreachable and nothing has been cached yet; `reason` says which.
 */
export async function getSite() {
  try {
    const { value, stale } = await cache.get('site', async () => {
      const site = await cmsJson('site')
      if (!site || typeof site !== 'object') throw new CmsError('cms-empty-site')
      return site
    })
    return { site: value, stale, reason: 'ok' }
  } catch (error) {
    const reason =
      error?.status === 404
        ? 'unknown-host'
        : error?.message === 'cms-unconfigured'
          ? 'unconfigured'
          : 'cms-unreachable'
    return { site: null, stale: false, reason }
  }
}

export function invalidateSite() {
  cache.clear()
}

/** The served locale: the platform's pin when it is a served locale, else the site's. */
export function localeFor(site) {
  const pinned = localeOverride()
  const served = Array.isArray(site?.availableLocales) ? site.availableLocales : []
  if (pinned && (served.length === 0 || served.includes(pinned))) return pinned
  return site?.defaultLocale || served[0] || pinned || 'fa'
}

export function dirFor(locale) {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

/** A site that is suspended or archived serves a holding page, never content. */
export function isActive(site) {
  return !site?.status || site.status === 'active'
}

export function contractMatches(site) {
  return typeof site?.contractVersion !== 'number' || site.contractVersion === contractVersion
}
