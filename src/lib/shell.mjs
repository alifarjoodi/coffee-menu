/**
 * The one HTML document this theme serves.
 *
 * `index.html` is the original screen and stays that way: the CMS only fills in the
 * theme's design tokens, the site's own logo in place of the default mark, the
 * breadcrumb title and the document title. With no branding and no settings saved,
 * every replacement is skipped and the document is byte-for-byte the original.
 */

import { mediaPath } from './media.mjs'
import { themeStyleTag } from './theme.mjs'

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const text = (value) => (typeof value === 'string' ? value.trim() : '')

const BREADCRUMB = '<a class="crumbs__link" href="#">Menu</a>'
const BADGE = /<span class="crumbs__badge" aria-hidden="true">[\s\S]*?<\/span>/
const TITLE = '<title>Item List · Coffee Menu</title>'

export function renderShell(html, site) {
  let out = html

  // The site's own mark replaces the default badge — an `<img>`, never inline SVG.
  const logo = mediaPath(site?.branding?.primaryLogo)
  if (logo) {
    out = out.replace(
      BADGE,
      `<span class="crumbs__badge crumbs__badge--logo" aria-hidden="true"><img class="crumbs__logo" src="${esc(logo)}" alt="" width="18" height="18" /></span>`,
    )
  }

  const menuTitle = text(site?.themeRuntime?.settings?.menuTitle)
  if (menuTitle) out = out.replace(BREADCRUMB, `<a class="crumbs__link" href="#">${esc(menuTitle)}</a>`)

  const siteName = text(site?.name)
  if (siteName) out = out.replace(TITLE, `<title>Item List · ${esc(siteName)}</title>`)

  const style = themeStyleTag(site?.theme)
  if (style) out = out.replace('</head>', `  ${style}\n</head>`)

  return out
}
