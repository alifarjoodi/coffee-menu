/**
 * @eshobe/site-runtime — the contract a headless renderer can import instead of
 * re-implementing. Persian-first formatting, money, theming and the block allowlist.
 *
 * Importing this rather than copying `src/lib/format.ts` is how a second app avoids
 * an English date on a Persian homepage, a Latin digit on a price, or a palette that
 * ignores the site's brand.
 */

export * from './digits.mjs'
export * from './money.mjs'
export * from './format.mjs'
export * from './theme.mjs'
export * from './blocks.mjs'
export * from './slug.mjs'

export const contractVersion = 1
