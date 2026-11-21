# Destination foundation and trip creation

**Implemented:** 21 November 2026

**Scope:** Task 2. This milestone provides local worldwide country selection and a functional, in-session trip creation flow. It does not connect a geocoding, mapping, weather or recommendation provider.

## Country selection

`src/data/isoCountries.js` contains all 249 currently assigned ISO 3166-1 alpha-2 country and territory codes as a compact local dataset. The country names are generated locally with `Intl.DisplayNames` (`type: "region"`), which uses the browser's CLDR locale data. Flags are derived from alpha-2 codes as Unicode regional-indicator sequences. No network request, paid provider, or additional runtime package is used to render the country selector.

The searchable selector sorts names alphabetically, matches codes, and removes combining diacritics for search. It supports keyboard navigation with arrow keys, Enter and Escape, and displays the country code alongside the name and flag. Country identity is stored as an ISO alpha-2 code; a flag is only a visual cue. Display names and flag glyph rendering depend on the browser/operating system internationalization and emoji support.

The code list is a checked-in snapshot. Keep it aligned to ISO 3166-1 changes as codes are assigned, withdrawn or updated. If country UI localization is added, use localized CLDR names and keep the stable code as the record key.

## Destination selection boundary

The user enters a city, town, region or named destination in free text and selects a country/territory. Both values are included in the created trip. The selected country provides geographic context but the application does not validate that the text is a real place or that it lies inside that country. There is no autocomplete or destination-result dataset in this milestone.

The UI explicitly describes the field as free text and states that live place suggestions are not connected. The three home-page examples remain inspiration cards only. This prevents them being mistaken for a global destination catalogue. A future provider should implement a typed destination-search interface returning provider ID, result type, canonical/display name, country code, coordinates and timezone; preserve the user's query when no match is returned.

## Trip form and object

The form collects country/territory, destination, start and end dates, budget and ISO currency, traveller count, travel style and a multi-select set of interests. It validates a selected country, non-empty destination and dates, end date not before start date, positive finite budget and a positive integer traveller count. Field errors are rendered next to controls and the first invalid control receives focus.

After successful validation, the app creates an in-memory object with this shape:

```js
{
  id,
  country,
  countryCode,
  countryFlag,
  destination,
  startDate,
  endDate,
  durationDays,       // inclusive calendar days
  budget,
  budgetCurrency,
  travellerCount,
  interests,
  travelStyle,
  createdAt
}
```

The workspace reads these submitted values. Budget formatting uses `Intl.NumberFormat`; currency options are generated from the browser's supported currency identifiers where available. The country/currency choice does not imply an exchange-rate conversion.

## Workspace status

Overview shows destination, country, date range, inclusive duration, budget, traveller count, travel style and interests. It explicitly identifies the destination as user-entered and unverified. The Paris-specific place list, generic repeated itinerary, and fixed budget allocation were removed from the trip workspace. Itinerary, Stay, Food, Style, Shopping and Explore tabs remain visible but state that their data is not connected.

Trips live only in React state. Reloading the page loses the current trip; the session note in the workspace and form copy set that expectation. This milestone does not implement account-based persistence or a saved-trip list.

## Validation performed

- `npm run build` succeeds.
- Directly imported the local data module with Node and verified 249 country entries, 249 unique codes, required examples (US, GB, FR, JP and AQ), and 162 currencies on the current Node ICU runtime.
- In the browser, searching `cote` returned Côte d’Ivoire, and keyboard selection was reflected in the form. Submitting the incomplete form displayed inline validation feedback and did not open a trip workspace.
- The build still reports the two pre-existing non-fatal Lucide `"use client"` module-directive warnings noted in the Task 1 audit.
- There is no automated test, lint or type-check script configured in this repository.
