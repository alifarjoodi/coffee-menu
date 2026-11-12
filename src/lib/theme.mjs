/**
 * Per-site design tokens → a `<style>` tag for the menu screen.
 *
 * The contract's tokens (`--primary`, `--accent`, `--background`, `--foreground`)
 * are emitted as-is, and the coffee palette's own names are pointed at them, so a
 * site that picks its brand colours in the CMS repaints the menu with no rebuild.
 * With the manifest's `design` defaults the four colours are the ones already in
 * `styles.css`, so the shipped design is unchanged.
 *
 * `themeCss()` from the runtime is deliberately not used here: it also emits
 * `--radius` and `--line-height`, and this stylesheet owns a radius scale of its
 * own (`--radius: 12px`, `--radius-lg`, …). A theme that reuses the contract's
 * Tailwind token names could take them straight from `themeCss()`; this one would
 * reshape every card by 2px, so it maps only the colours it actually consumes.
 */

import { isHexColor } from '../../vendor/site-runtime/index.mjs'

const TOKENS = [
  { token: 'primary', palette: '--mint' },
  { token: 'accent', palette: '--gold' },
  { token: 'background', palette: '--bg' },
  { token: 'foreground', palette: '--text' },
]

export function themeStyleTag(theme) {
  if (!theme || typeof theme !== 'object') return ''

  const contract = []
  const palette = []
  for (const { token, palette: name } of TOKENS) {
    const value = theme[token]
    // A value that is not a hex colour is dropped, never escaped into the page: a
    // stray `}` would rewrite the whole stylesheet.
    if (!isHexColor(value)) continue
    contract.push(`--${token}:${value}`)
    palette.push(`${name}:${value}`)
  }

  if (!contract.length) return ''
  return `<style id="eshobe-theme">:root{${contract.join(';')}}body{${palette.join(';')}}</style>`
}
