/**
 * The only place dates and numbers are formatted.
 *
 * Persian pages get Shamsi (Jalali) dates and Persian-Indic digits; every other
 * locale gets its own calendar and digits from the same call site. Nothing else
 * may call `Intl` directly, use `toLocaleDateString()`, or interpolate a raw
 * `Date`.
 */

import { currencies, minorToMajor } from './money.mjs'

// Payload locale codes are short forms; Intl wants a BCP 47 tag.
const intlLocale = (locale) => (locale === 'fa' ? 'fa-IR' : locale)

// pony: one platform timezone, so a UTC timestamp near midnight doesn't render as
// the previous day.
const PLATFORM_TIME_ZONE = 'Asia/Tehran'

export const formatDate = (
  date,
  locale,
  options = { dateStyle: 'long' },
) => {
  if (date === null || date === undefined || date === '') return ''

  return new Intl.DateTimeFormat(intlLocale(locale), {
    // 'persian' *is* the Jalali calendar — Intl ships it, so no date library.
    calendar: locale === 'fa' ? 'persian' : undefined,
    timeZone: PLATFORM_TIME_ZONE,
    ...options,
  }).format(new Date(date))
}

export const formatNumber = (value, locale, options) =>
  new Intl.NumberFormat(intlLocale(locale), options).format(value)

/**
 * Digit substitution for strings that only look numeric — phone numbers, postal
 * codes, anything with a leading zero that `formatNumber` would eat.
 */
export { toLocaleDigits } from './digits.mjs'

/**
 * A price, in the site's currency, in the active locale's digits.
 *
 * `minor` is the stored integer. Renders `۱٬۲۰۰٬۰۰۰ تومان` on `fa` and
 * `1,200,000 Toman` on `en` for the same stored value.
 */
export const formatPrice = (
  minor,
  code,
  locale,
  options = {},
) => {
  if (typeof minor !== 'number' || !Number.isFinite(minor)) return ''

  const currency = currencies[code] ?? currencies.IRT
  const amount = formatNumber(minorToMajor(minor, currency.code), locale, {
    maximumFractionDigits: currency.minorDigits,
    minimumFractionDigits: currency.minorDigits,
  })

  if (options.hideUnit) return amount

  const unit = currency.unit[locale] ?? currency.unit.en

  return `${amount} ${unit}`
}
