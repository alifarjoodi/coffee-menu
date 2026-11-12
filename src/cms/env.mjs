/**
 * Platform contract env (THEME_API §17b), with the legacy aliases the reference
 * themes keep so older Coolify deployments (ESHOBE_API_URL / ESHOBE_SITE_API_KEY)
 * keep working.
 *
 * Every value is read per call, never at import time: the platform injects them at
 * deploy time, and a theme must not bake them into anything it renders.
 */

const first = (...values) => {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return ''
}

/** CMS origin this theme calls — platform: `ESHOBE_CMS_URL`. */
export function cmsOrigin() {
  return first(
    process.env.ESHOBE_CMS_URL,
    process.env.ESHOBE_API_URL,
    process.env.NEXT_PUBLIC_ESHOBE_API_URL,
  ).replace(/\/+$/, '')
}

/** Site API key — platform: `ESHOBE_API_KEY` (runtime-only, never logged). */
export function siteApiKey() {
  return first(process.env.ESHOBE_API_KEY, process.env.ESHOBE_SITE_API_KEY)
}

/** The site's CMS id (`ESHOBE_SITE_ID`), set by the platform on every deployment. */
export function siteId() {
  return first(process.env.ESHOBE_SITE_ID)
}

/** Canonical customer hostname (no scheme). */
export function siteDomain() {
  return first(process.env.ESHOBE_SITE_DOMAIN).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

/** Origin this deployment is reachable at (a preview host is not the customer domain). */
export function publicOrigin() {
  const fromPlatform = first(process.env.ESHOBE_PUBLIC_ORIGIN)
  if (fromPlatform) return fromPlatform.replace(/\/+$/, '')
  const legacy = first(process.env.NEXT_PUBLIC_SITE_URL)
  if (legacy) return legacy.replace(/\/+$/, '')
  const domain = siteDomain()
  return domain ? `https://${domain}` : ''
}

/** Canonical site origin for robots/sitemap/canonical tags when it is known. */
export function canonicalOrigin() {
  const domain = siteDomain()
  if (domain) return `https://${domain}`
  return publicOrigin()
}

export function revalidateSecret() {
  return first(process.env.ESHOBE_REVALIDATE_SECRET)
}

/** A locale the platform pinned for this deployment, if any. */
export function localeOverride() {
  return first(process.env.ESHOBE_DEFAULT_LOCALE)
}

export function port() {
  const value = Number(first(process.env.PORT))
  return Number.isInteger(value) && value > 0 ? value : 3000
}

/**
 * Headers for server→CMS REST.
 *
 * With a site API key the key names the tenant, and the request keeps the CMS's own
 * `Host`: `ESHOBE_CMS_URL` is the CMS's public address behind the same proxy that
 * serves this theme, and that proxy routes by `Host` — rewriting it to the customer
 * domain hands the request back to this very container, and every lookup times out.
 * `Host` is only sent as the tenant when there is no key (local dev against a
 * host-routed CMS).
 */
export function cmsRequestHeaders(extra = {}) {
  const headers = { Accept: 'application/json', ...extra }
  const key = siteApiKey()
  if (key) {
    headers.Authorization = `Bearer ${key}`
    return headers
  }
  const host = siteDomain()
  if (host) headers.Host = host
  return headers
}
