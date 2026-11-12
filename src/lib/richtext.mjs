/**
 * Lexical → plain text.
 *
 * The menu screen is a list of cards and a drawer paragraph, not a document
 * renderer: product `body` (a Lexical rich text) is reduced to its words, and the
 * browser escapes them on the way back out (`esc()` in `app.js`). Nothing here ever
 * emits markup, so an editor's paste cannot become script.
 */

export function plainText(node, out = '', depth = 0) {
  if (!node || depth > 30) return out
  if (Array.isArray(node)) {
    for (const child of node) out = plainText(child, out, depth + 1)
    return out
  }
  if (typeof node !== 'object') return out

  if (typeof node.text === 'string') out += node.text
  if (node.children) out = plainText(node.children, out, depth + 1)
  // Every block ends a line, so the words of two paragraphs do not run together.
  if (typeof node.type === 'string' && node.type !== 'root' && node.type !== 'text') out += ' '
  return out
}

export function toPlainText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
  return plainText(value).replace(/\s+/g, ' ').trim()
}
