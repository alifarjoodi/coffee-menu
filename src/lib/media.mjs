/**
 * Media URLs, always same-origin.
 *
 * The bucket is private and `/api/media/file/*` is the only streaming route; it is
 * Host/key scoped and `proxiesApi: true` already forwards it from this origin. An
 * absolute CMS URL would send the browser to a foreign origin that refuses customer
 * domains, so an asset that is not that route is dropped rather than rendered.
 */

export function mediaPath(image) {
  if (!image) return null
  const url = typeof image === 'string' ? image : image.url
  if (typeof url !== 'string' || !url) return null

  let path = ''
  if (url.startsWith('/')) {
    path = url
  } else {
    try {
      path = new URL(url).pathname
    } catch {
      return null
    }
  }
  return path.startsWith('/api/media/file/') ? path : null
}
