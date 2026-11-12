/**
 * `npm run dev:mock` — the theme against the fixture CMS in `mock-cms.mjs`.
 *
 * Sets the same platform variables a managed deployment receives, so the local
 * preview runs the production code path (keyed reads, `/api/menu`, `/api/health`,
 * signed revalidation) instead of a special one.
 */

const MOCK_PORT = Number(process.env.MOCK_CMS_PORT ?? 4010)

process.env.ESHOBE_CMS_URL ||= `http://127.0.0.1:${MOCK_PORT}`
process.env.ESHOBE_API_KEY ||= 'eshobe_mock_site_key'
process.env.ESHOBE_SITE_DOMAIN ||= 'coffee.localhost'
process.env.ESHOBE_SITE_ID ||= 'site-coffee'
process.env.ESHOBE_REVALIDATE_SECRET ||= 'mock-revalidate-secret'
process.env.PORT ||= '3000'

const { startMockCms } = await import('./mock-cms.mjs')

try {
  await startMockCms(MOCK_PORT)
  console.log(`[dev] mock CMS on http://127.0.0.1:${MOCK_PORT}`)
} catch (error) {
  if (error?.code === 'EADDRINUSE') {
    console.log(`[dev] reusing the CMS already on :${MOCK_PORT}`)
  } else {
    throw error
  }
}

await import('../server.mjs')
