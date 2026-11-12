/**
 * A tiny in-process cache with a time-based fallback.
 *
 * Revalidation from the CMS is best-effort, at-most-once, with a 3 second timeout
 * and no retry: a notice lost to a restart would leave stale content until
 * something else invalidated it. So every entry is also expired on a timer, and a
 * CMS outage serves the last good response instead of taking the storefront down.
 */

export class TimedCache {
  #ttlMs
  #staleMs
  #entries = new Map()
  #inflight = new Map()

  constructor({ ttlMs = 30_000, staleMs = 24 * 60 * 60_000 } = {}) {
    this.#ttlMs = ttlMs
    this.#staleMs = staleMs
  }

  /**
   * `{ value, stale, cached }`. `stale` means the CMS could not be reached and the
   * previous value is being served; `cached` means no upstream call was made.
   */
  async get(key, load) {
    const entry = this.#entries.get(key)
    if (entry && Date.now() - entry.at < this.#ttlMs) {
      return { value: entry.value, stale: false, cached: true }
    }

    const pending = this.#inflight.get(key)
    if (pending) return pending

    const promise = (async () => {
      try {
        const value = await load()
        this.#entries.set(key, { value, at: Date.now() })
        return { value, stale: false, cached: false }
      } catch (error) {
        // A fatal error (unknown host) must not be papered over with last-known-good.
        if (!error?.fatal && entry && Date.now() - entry.at < this.#staleMs) {
          return { value: entry.value, stale: true, cached: true, error }
        }
        throw error
      } finally {
        this.#inflight.delete(key)
      }
    })()

    this.#inflight.set(key, promise)
    return promise
  }

  clear() {
    this.#entries.clear()
  }
}
