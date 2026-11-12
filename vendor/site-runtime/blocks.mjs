/**
 * Block library metadata for the headless runtime.
 *
 * This is the runtime's view of `src/blocks/index.ts` — the slugs and the
 * per-site-type allowlist, without the Payload `Block` objects. A builder that
 * imports this can decide whether `productGrid` is allowed on a `store` site, or
 * whether a saved layout contains a block it does not know how to render.
 */

const ALL = ['business', 'portfolio', 'store']

const library = [
  { slug: 'content', siteTypes: ALL },
  { slug: 'mediaBlock', siteTypes: ALL },
  { slug: 'cta', siteTypes: ALL },
  { slug: 'features', siteTypes: ALL },
  { slug: 'testimonials', siteTypes: ALL },
  { slug: 'faq', siteTypes: ALL },
  { slug: 'contact', siteTypes: ALL },
  { slug: 'formBlock', siteTypes: ALL },
  { slug: 'productGrid', siteTypes: ['store'] },
  { slug: 'gallery', siteTypes: ['portfolio', 'business'] },
  { slug: 'team', siteTypes: ['business', 'portfolio'] },
  { slug: 'pricing', siteTypes: ['business', 'store'] },
  { slug: 'logos', siteTypes: ['business', 'store'] },
  { slug: 'archive', siteTypes: ['business', 'portfolio'] },
]

export const siteBlocks = library.map(({ slug }) => slug)

export const blockSlugsForSiteType = (type) =>
  library.filter(({ siteTypes }) => !type || siteTypes.includes(type)).map(({ slug }) => slug)
