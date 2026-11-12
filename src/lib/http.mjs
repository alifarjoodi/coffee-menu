/**
 * The few HTTP primitives this theme needs: JSON answers, a bounded body reader and
 * a static-file sender that answers conditional requests. No framework, no
 * dependencies.
 */

import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

export const contentTypeFor = (filePath) => MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'

export function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-length': Buffer.byteLength(body), ...headers })
  res.end(body)
}

export function json(res, status, payload, headers = {}) {
  send(res, status, JSON.stringify(payload), {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  })
}

/** A body bigger than `limit` is refused instead of buffered. */
export async function readRawBody(req, limit = 1_000_000) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) {
      const error = new Error('payload-too-large')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

const etagFor = (buffer) => `"${createHash('sha256').update(buffer).digest('base64url').slice(0, 27)}"`

/** Serve one in-repo asset from an allowlist, with ETag + conditional GET. */
export async function sendAsset(req, res, rootDir, relativePath, { cacheControl }) {
  const filePath = path.join(rootDir, relativePath)
  if (!filePath.startsWith(path.join(rootDir, path.sep))) {
    json(res, 404, { error: 'Not Found' })
    return
  }

  let info
  try {
    info = await stat(filePath)
  } catch {
    json(res, 404, { error: 'Not Found' })
    return
  }
  if (!info.isFile()) {
    json(res, 404, { error: 'Not Found' })
    return
  }

  const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`
  const headers = {
    'content-type': contentTypeFor(filePath),
    'cache-control': cacheControl,
    etag,
    'last-modified': info.mtime.toUTCString(),
    'content-length': info.size,
  }

  const inm = req.headers['if-none-match']
  if (typeof inm === 'string' && inm.split(',').some((tag) => tag.trim() === etag)) {
    res.writeHead(304, { etag, 'cache-control': cacheControl })
    res.end()
    return
  }

  res.writeHead(200, headers)
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(filePath).on('error', () => res.destroy()).pipe(res)
}

export { etagFor }
