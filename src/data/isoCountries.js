// ISO 3166-1 alpha-2 assigned codes (countries and territories), reviewed 2026-11.
// Localized English labels come from the browser's Unicode CLDR-backed Intl data.
const ISO_ALPHA_2_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT
MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW
`.trim().split(/\s+/);

function flagFromAlpha2(code) {
  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)));
}

const englishTerritoryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryCollator = new Intl.Collator('en', { sensitivity: 'base' });

export const countries = ISO_ALPHA_2_CODES
  .map((code) => ({
    code,
    name: englishTerritoryNames.of(code) || code,
    flag: flagFromAlpha2(code),
  }))
  .sort((a, b) => countryCollator.compare(a.name, b.name));

export function normalizeSearchText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`]/g, "'")
    .toLocaleLowerCase();
}

export const currencies = (() => {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
  const codes = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('currency')
    : ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'INR', 'JPY', 'NZD', 'USD'];

  return codes
    .map((code) => ({ code, name: displayNames.of(code) || code }))
    .sort((a, b) => countryCollator.compare(a.name, b.name));
})();
