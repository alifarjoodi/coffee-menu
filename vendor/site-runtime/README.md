# `@eshobe/site-runtime` (vendored)

The theme contract helpers: `formatPrice`, `formatNumber`, `formatDate`,
`themeCss`, the block allowlist, the currency registry and the Persian-safe slug
utilities.

**Provenance.** This is `@eshobe/site-runtime@0.1.0` (MIT), the same package the
reference Eshobe themes depend on as `"@eshobe/site-runtime": "file:vendor/site-runtime"`
(see `hamidnoshady/arch-theme-cms`, `hamidnoshady/cms-corporation-theme`). It is
not published to npm, so it is vendored here.

**Why `.mjs` and not the upstream `.ts`.** This theme has no build step (the
original coffee menu is plain HTML/CSS/JS and stays that way), so the sources are
the upstream sources with **types stripped only** — no logic was rewritten. Node's
built-in type stripping rejects the upstream extensionless imports
(`from './digits'`), which is the single reason for the `.mjs` extension.

**Keeping it in sync.** When the CMS bumps `contractVersion`, drop in the newer
`vendor/site-runtime/src/*.ts` from a reference theme, strip types again, and keep
the file names/extensions as they are here. `test/runtime.test.mjs` pins the
behaviour this theme relies on (Toman minor units, Persian digits, Jalali dates).

License: MIT.
