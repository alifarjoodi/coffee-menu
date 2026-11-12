/**
 * Money, in the currency a site actually sells in.
 *
 * Prices are stored as an **integer count of the currency's minor unit**
 * (`120000` = ۱۲۰٬۰۰۰ تومان for an Iranian site, `120000` = $1,200.00 for a USD
 * one). The unit a site sells in is a field on its `store` document; a product
 * carries only the number, so an editor cannot type a price in one unit and
 * label it in another. Every read of a stored price goes through `formatPrice()`.
 */

import { toAsciiDigits } from './digits.mjs'

/**
 * The registry. `IRT` is Toman, `IRR` is Rial — ۱ تومان = ۱۰ ریال.
 */
export const currencies = {
  EUR: { code: 'EUR', minorDigits: 2, unit: { en: '€', fa: 'یورو' } },
  IRR: { code: 'IRR', minorDigits: 0, unit: { en: 'IRR', fa: 'ریال' } },
  IRT: { code: 'IRT', minorDigits: 0, unit: { en: 'Toman', fa: 'تومان' } },
  USD: { code: 'USD', minorDigits: 2, unit: { en: '$', fa: 'دلار' } },
}

export const currencyCodes = Object.keys(currencies)

export const isCurrencyCode = (value) =>
  typeof value === 'string' && currencyCodes.includes(value)

/** `۱ تومان = ۱۰ ریال`, in minor units — the only conversion the platform does. */
export const tomanToRial = (tomanMinor) => tomanMinor * 10

export const rialToToman = (rialMinor) => {
  // A Rial figure that is not a whole Toman is a data-entry mistake, and rounding
  // it silently would hide the 10× error this module exists to prevent.
  if (rialMinor % 10 !== 0) {
    throw new RangeError('قیمت ریالی باید مضرب ۱۰ باشد (هر تومان ۱۰ ریال است).')
  }

  return rialMinor / 10
}

/** Minor units of `code` for a whole number of major units — `12` → `1200` for USD. */
export const majorToMinor = (major, code) => {
  const { minorDigits } = currencies[code]

  return Math.round(major * 10 ** minorDigits)
}

export const minorToMajor = (minor, code) => minor / 10 ** currencies[code].minorDigits

const HAS_DIGITS = /[۰-۹٠-٩0-9]/

/**
 * Any amount a human typed — Persian or Latin digits, with or without thousands
 * separators, with or without the unit word — into integer minor units.
 *
 * `null` means "not a number we can store": the admin and the checkout form both
 * surface that as a validation message rather than guessing. Fractional Toman is
 * rejected outright (there is no smaller coin), while `12.5` USD is 1250 cents and
 * accepted.
 */
export const parsePrice = (input, code) => {
  const text =
    typeof input === 'number'
      ? String(input)
      : typeof input === 'string'
        ? input
        : undefined

  if (text === undefined || !HAS_DIGITS.test(text)) return null

  const normalized = toAsciiDigits(text)
    // The decimal point is ٫ in Persian typography and . in Latin; both mean the
    // same thing and both have to survive, or `۱۲٫۵` reads as `۱۲۵`.
    .replace(/\u066b/g, '.')
    // The thousands separator is ٬ in Persian output and , in Latin; a thin or
    // non-breaking space is what a price copied out of a PDF tends to carry.
    .replace(/[٬،\s\u00a0\u202f]/g, '')
    .replace(/[^0-9.]/g, '')

  // One decimal point, nothing else. `Number('1.2.3')` is NaN, so a single check
  // on the shape is enough to keep the parse honest.
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null

  const minor = Number(normalized) * 10 ** currencies[code].minorDigits

  // No rounding: `۱۲٫۵ تومان` has no such coin, and `$12.345` would be a fraction
  // of a cent. Silently rounding either is how a price stops matching the money.
  return Number.isInteger(minor) ? minor : null
}

/** Field-validation shape: `true` or a Persian message, for a `number` price field. */
export const validatePriceMinor = (value) => {
  if (value === null || value === undefined || value === '') return true
  const n = Number(value)

  return Number.isInteger(n) && n >= 0
    ? true
    : 'قیمت باید عدد صحیح و غیرمنفی باشد (بر حسب واحد پول سایت، نه ریال).'
}
