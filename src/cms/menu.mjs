/**
 * The menu the screen renders: CMS `products` → the item list this theme draws.
 *
 * Every price stays an integer minor unit of the *site's* currency; the browser
 * formats it with `currency` (code, minor digits, per-locale unit word) from this
 * payload, and nothing here converts between Toman and Rial. Dates go through
 * `formatDate` so `fa` renders Jalali, never a raw ISO string.
 */

import {
  currencies,
  formatDate,
  isCurrencyCode,
} from '../../vendor/site-runtime/index.mjs'
import { TimedCache } from '../lib/cache.mjs'
import { mediaPath } from '../lib/media.mjs'
import { toPlainText } from '../lib/richtext.mjs'
import { cmsJson, cmsList } from './client.mjs'
import { dirFor, getSite, localeFor } from './site.mjs'

// The screen is one continuous list (no pagination), so the catalogue is read in
// one go. Any limit is a cap: a café's menu is far below 200 items, and a score is
// averaged over the latest 1000 approved reviews rather than the entire history.
const PRODUCT_LIMIT = 200
const REVIEW_LIMIT = 1000

/**
 * Thumbnail art for products without an uploaded image. These are the original
 * theme's twelve emoji-on-gradient tiles, so a site that has not uploaded product
 * photos yet looks exactly like the shipped design.
 */
const TILES = [
  { emoji: '🍫', tint: '#f4e7d4' },
  { emoji: '🍪', tint: '#f6ecd8' },
  { emoji: '☕', tint: '#ede6dc' },
  { emoji: '🥛', tint: '#f3efe4' },
  { emoji: '🍌', tint: '#f8f0cf' },
  { emoji: '🌰', tint: '#f0e4d8' },
  { emoji: '🌿', tint: '#e4efe0' },
  { emoji: '🍮', tint: '#f7e8dc' },
  { emoji: '🍯', tint: '#f7eed8' },
  { emoji: '🫘', tint: '#eae4dc' },
  { emoji: '🧋', tint: '#f1e6d6' },
  { emoji: '🧁', tint: '#f6ece1' },
]

const cache = new TimedCache({ ttlMs: 30_000, staleMs: 24 * 60 * 60_000 })

const idOf = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && typeof value.id === 'string') return value.id
  return null
}

const idsOf = (value) => (Array.isArray(value) ? value.map(idOf).filter(Boolean) : [])

/** The active variations of a `variable` product, priced in minor units. */
const activeVariations = (product) =>
  Array.isArray(product?.variations)
    ? product.variations.filter(
        (variation) =>
          variation &&
          variation.active !== false &&
          Number.isFinite(Number(variation.price)),
      )
    : []

/**
 * `products.price` is catalogue metadata for a `variable` product; the purchasable
 * price is the selected variation, so the menu lists the cheapest active one.
 */
function priceOf(product) {
  if (product?.productType === 'variable') {
    const variations = activeVariations(product)
    if (variations.length) return Math.min(...variations.map((v) => Number(v.price)))
  }
  const price = Number(product?.price)
  return Number.isFinite(price) ? price : 0
}

function compareAtPriceOf(product) {
  if (product?.productType === 'variable') {
    const variations = activeVariations(product)
    const priced = variations
      .map((v) => Number(v.compareAtPrice))
      .filter((n) => Number.isFinite(n) && n > 0)
    if (!priced.length) return null
    return Math.min(...priced)
  }
  const compareAt = Number(product?.compareAtPrice)
  return Number.isFinite(compareAt) && compareAt > 0 ? compareAt : null
}

/** A term's label as the screen shows it: its ancestors joined by ` / `. */
function termLabel(term, byId) {
  const names = []
  let current = term
  for (let depth = 0; current && depth < 8; depth += 1) {
    const name = current.name ?? current.title
    if (typeof name === 'string' && name) names.unshift(name)
    current = byId.get(idOf(current.parent))
  }
  return names.join(' / ')
}

/**
 * Products file under taxonomy terms, and a term names its own taxonomy. The menu
 * uses the vocabulary that most of the catalogue is filed under — an explicit
 * setting would need the site owner to know a taxonomy id, and a hardcoded key
 * would break the first site that names it differently.
 */
function pickMenuTaxonomy(products, byId) {
  const tally = new Map()
  for (const product of products) {
    for (const termId of idsOf(product.terms)) {
      const term = byId.get(termId)
      const taxonomy = idOf(term?.taxonomy)
      if (taxonomy) tally.set(taxonomy, (tally.get(taxonomy) ?? 0) + 1)
    }
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

function categoryOf(product, byId, taxonomyId) {
  const terms = idsOf(product.terms)
    .map((id) => byId.get(id))
    .filter((term) => term && (!taxonomyId || idOf(term.taxonomy) === taxonomyId))
  if (!terms.length) return 'Other'
  return termLabel(terms[0], byId) || 'Other'
}

/** Approved review comments → average score and count per product. */
function ratingsByProduct(reviews) {
  const stats = new Map()
  for (const review of reviews) {
    const productId = idOf(review?.targetProduct)
    const rating = Number(review?.rating)
    if (!productId || !Number.isFinite(rating) || rating <= 0) continue
    const entry = stats.get(productId) ?? { sum: 0, count: 0 }
    entry.sum += Math.min(5, rating)
    entry.count += 1
    stats.set(productId, entry)
  }
  return stats
}

const reviewsQuery = (locale) =>
  [
    'comments?limit=' + REVIEW_LIMIT,
    'depth=0',
    `locale=${locale}`,
    'where[and][0][targetCollection][equals]=products',
    'where[and][1][commentType][equals]=review',
    // A site key can read the moderation queue, so this filter is not optional.
    'where[and][2][status][equals]=approved',
  ].join('&')

async function loadMenu() {
  const { site, reason } = await getSite()
  if (!site) {
    const error = new Error(reason)
    error.fatal = reason === 'unknown-host'
    throw error
  }

  const locale = localeFor(site)
  const currency = isCurrencyCode(site?.store?.currency) ? site.store.currency : 'IRT'

  const [products, terms, reviews] = await Promise.all([
    // A site key sees drafts too, so the published filter is this renderer's job.
    cmsJson(
      `products?limit=${PRODUCT_LIMIT}&depth=1&sort=-createdAt&locale=${locale}` +
        '&where[_status][equals]=published',
    ).then((data) => (Array.isArray(data?.docs) ? data.docs : [])),
    cmsList(`taxonomy-terms?limit=300&depth=0&locale=${locale}`, { label: 'taxonomy-terms' }),
    cmsList(reviewsQuery(locale), { label: 'comments' }),
  ])

  const termsById = new Map(terms.map((term) => [term.id, term]))
  const taxonomyId = pickMenuTaxonomy(products, termsById)
  const ratings = ratingsByProduct(reviews)

  const items = products.map((product, index) => {
    const tile = TILES[index % TILES.length]
    const stats = ratings.get(product.id)
    const rating = stats ? Math.round((stats.sum / stats.count) * 10) / 10 : 0
    const tracked = Boolean(product.trackInventory)
    const inventory = tracked ? Number(product.inventory ?? 0) : null
    const image = mediaPath(product.image)
    const description = toPlainText(product.body) || String(product.summary ?? '').trim()

    return {
      id: product.id,
      code: product.sku || `#${String(product.id).slice(0, 8).toUpperCase()}`,
      name: product.title ?? '',
      category: categoryOf(product, termsById, taxonomyId),
      rating,
      reviews: stats?.count ?? 0,
      price: priceOf(product),
      sellPrice: compareAtPriceOf(product),
      stock: tracked ? (Number.isFinite(inventory) ? inventory : 0) : null,
      status: tracked && !(inventory > 0) ? 'unavailable' : 'available',
      created: product.createdAt ?? null,
      createdLabel: formatDate(product.createdAt, locale),
      emoji: tile.emoji,
      tint: tile.tint,
      desc: description,
      image,
      imageAlt: product.image?.alt || product.title || '',
      // Kept so the list can mark a product the checkout cannot sell directly.
      productType: product.productType || 'simple',
    }
  })

  return {
    locale,
    dir: dirFor(locale),
    currency: currencies[currency],
    site: {
      name: site.name ?? '',
      domain: site.domain ?? '',
      logo: site.branding?.primaryLogo?.url ?? null,
    },
    items,
  }
}

/** `{ menu, stale }` — stale means the CMS is down and the last good menu is served. */
export async function getMenu() {
  const { value, stale } = await cache.get('menu', loadMenu)
  return { menu: value, stale }
}

export function invalidateMenu() {
  cache.clear()
}
