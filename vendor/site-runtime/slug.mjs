/**
 * Persian-safe slugs and the site's reserved routes.
 *
 * Payload's own `slugify` is `replace(/[^\w-]+/g, '')` — `\w` is ASCII, so every
 * Persian character is stripped and "درباره ما" becomes "-". Persian slugs are fine
 * in a URL — the browser percent-encodes them and shows the readable form back.
 */
export const slugify = (value) =>
  (value ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase()
    // Arabic yeh/kaf look identical to the Persian letters but are a different
    // codepoint; two keyboards would otherwise produce two different slugs.
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    // Persian-Indic and Arabic-Indic digits → ASCII, so a slug can be typed.
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    // ZWNJ carries meaning inside a Persian word but cannot survive a URL.
    .replace(/[\s_‌]+/g, '-')
    // Any script's letters, digits and combining marks stay; punctuation goes.
    // `\p{M}` matters here: the hamza in "صفحهٔ" is a mark, not a letter.
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

/** Shape `slugField({ slugify })` expects. */
export const slugifyField = ({ valueToSlugify }) =>
  slugify(typeof valueToSlugify === 'string' ? valueToSlugify : '')

/**
 * The reserved slug of every site's home page, in every locale.
 */
export const HOME_SLUG = 'home'

/**
 * A page slug as a site-relative path. The home page is `/`, never `/home` — two
 * URLs for one page splits its cache entry and its search ranking.
 */
export const pagePath = (slug) => (!slug || slug === HOME_SLUG ? '/' : `/${slug}`)

/**
 * The routes that exist whether an editor likes it or not — a CMS page saved as
 * `posts` would be unreachable with no error anywhere.
 */
export const POSTS_SEGMENT = 'posts'
export const SEARCH_SEGMENT = 'search'
export const CHECKOUT_SEGMENT = 'checkout'
export const PRODUCTS_SEGMENT = 'products'

export const POSTS_BASE = `/${POSTS_SEGMENT}`
export const SEARCH_PATH = `/${SEARCH_SEGMENT}`
export const CHECKOUT_BASE = `/${CHECKOUT_SEGMENT}`
export const PRODUCTS_BASE = `/${PRODUCTS_SEGMENT}`

export const RESERVED_PAGE_SLUGS = [POSTS_SEGMENT, SEARCH_SEGMENT, CHECKOUT_SEGMENT]

/** A post's site-relative path. No locale segment here — `localeHref` adds that. */
export const postPath = (slug) => (slug ? `${POSTS_BASE}/${slug}` : POSTS_BASE)

/** A product's site-relative path. No locale segment here — `localeHref` adds that. */
export const productPath = (slug) => (slug ? `${PRODUCTS_BASE}/${slug}` : PRODUCTS_BASE)
