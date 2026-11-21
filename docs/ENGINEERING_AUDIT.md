# StyleTrip engineering audit and MVP architecture

**Assessment date:** 21 November 2026

**Scope:** Current repository and the stated StyleTrip product requirements, including worldwide destination coverage, weather intelligence, Explore recommendations and mapping.
**Status:** Assessment and engineering preparation only; no product features have been implemented as part of this audit.

## Executive summary

The repository is a small Vite and React visual prototype. It provides a polished marketing page and a single in-memory trip workspace, but it is not yet a connected travel-planning product. Trip creation, recommendations, itinerary generation and saving are illustrative client-side behavior. There is no authentication, backend, database, external data integration, routing, test/lint setup or deployment configuration.

The existing React/Vite stack is a reasonable base. The recommended direction is to add TypeScript incrementally, use Supabase Auth and Postgres with Row Level Security for account and trip data, and put AI and third-party API calls behind server-side functions. Keep destination, weather, places and routing data behind replaceable provider adapters. The UI should use structured provider data as evidence and AI for constrained ranking, explanation and itinerary composition.

The key product gap is the absence of a complete, persistent journey. The MVP should let a user register, create a dated trip to a searched worldwide destination, generate and edit a clearly sourced draft, save it, and reopen it. Global country lists, provider forecast horizons and the distinction between forecast, seasonal estimates and AI guidance should be designed into the data model from the start.

## Repository inventory

| Path | Contents |
|---|---|
| `src/App.jsx` | Landing page, trip input, all visible screens, local state, sample recommendations and itinerary |
| `src/style.css` | Entire design system, component styling and responsive breakpoints |
| `src/main.jsx` | React root and CSS import |
| `index.html` | Minimal Vite document shell |
| `package.json` / `package-lock.json` | Vite, React, React DOM and Lucide dependencies and scripts |
| `README.md` | Starter description and prototype limitations |

There are no additional source directories, environment examples, Supabase configuration, tests, CI workflows, router, or deployment configuration in the inspected workspace. Dependencies use `latest` ranges in `package.json`. The README and HTML title have visible character-encoding corruption in punctuation and currency text.

## Existing behavior: what works and what does not

### Working prototype interactions

- Landing page, destination cards, feature cards, trip form and trip workspace render.
- The destination text, duration, budget and interest chips are controlled by React state.
- “Plan my trip” opens the workspace using entered values; blank destination falls back to Paris.
- Workspace tabs switch between overview, itinerary and generic category placeholder content.
- “Explore itinerary” selects the itinerary tab.
- “Save trip” toggles its label in React state.
- CSS provides desktop, tablet and narrow-screen layout variants.

### Mocked or incomplete behavior

| Product area | Current implementation | Assessment |
|---|---|---|
| Home/discovery | Three hardcoded destination cards and inert “Explore destinations” button | Marketing sample only; no destination catalogue or search |
| Trip creation | Destination text, fixed duration options, numeric budget and interest chips | No dates, country/region selection, currency, travellers, validation or persistence |
| Destination selection | Free text and sample card click | No entity resolution, international search, country selector or coordinates |
| Overview | Static copy and a fixed 35/25/20/15/5 allocation | Percentages are illustrative; no actual expense data or forecast |
| Itinerary | Repeated sample time slots, capped to seven rendered days | Not generated from destination, dates, weather, distance, opening times or interests |
| Stay, Food, Style, Shopping, Explore | Shared generic “recommendations” placeholder | No category-specific data or actions |
| Places | Four hardcoded Paris examples, regardless of selected city | Incorrect for non-Paris destinations; prices are not verified or sourced |
| Weather | Guidance text and generic packing tips | No weather request, forecast, climatology, source, timestamp or uncertainty label |
| Maps/routes | No map or routing integration | No coordinates, distance, route or geographic clustering |
| Save/My Trips | Local toggle; My Trips opens a blank/default workspace | No user account, saved trip record, list, reopen or sync |

The README itself correctly identifies authentication, persistence, AI, maps, weather, live place/event data, booking and payments as unconnected. Nothing in the UI should currently be presented as live verified travel data.

## Product assessment against the vision

The landing page communicates the travel-lifestyle proposition and the workspace gives the intended sections a visual home. The user cannot yet plan a whole trip end to end. No dates means the app cannot responsibly personalize forecasts, events, opening hours or season-dependent activities. No structured destination identity means it cannot reliably distinguish cities with the same name or support worldwide localization. No persistence means the trip workspace is not a usable organizer.

For an MVP, make one complete journey reliable: create an account, set preferences, search and select a destination, set dates and budget, generate a structured draft, edit it, save it and reopen it. Add broad provider-backed destination search and basic forecast/context data before building many disconnected category screens.

## Engineering quality findings

### Organization and state

`App.jsx` owns data, navigation, form state and workspace views. The view is a local string rather than a URL, so refresh, browser history and direct trip links do not work. `TripView` owns its active tab and resets when unmounted. There is no domain model, data-fetching layer, reusable component boundary or user-facing loading/error state.

For the first implementation, a lightweight router, typed domain objects and ordinary React state/data hooks are sufficient. Avoid adding a global state framework until real cross-page workflows justify it.

### Accessibility and responsive behavior

- Clickable destination `<article>` elements are not keyboard-operable links or buttons.
- Mapped lists omit stable React `key` values.
- Visible form labels are not programmatically associated with their controls.
- There is no validation feedback, focus treatment strategy, live status announcement or semantic tab behavior.
- Destination/hero imagery is missing descriptive alt text in places.
- At the mobile breakpoint, primary navigation is hidden with no replacement menu.
- Ensure search results, country flags, scripts, long localized names, and map controls remain screen-reader and keyboard accessible.

### Performance, resilience and security

Images and Google Fonts load from external hosts. Images are not locally optimized or lazy-loaded, and external failures have no fallback. There are no API integrations today, so no secret key is currently visible. When providers are connected, never put OpenAI, Supabase service-role, or server provider secrets into browser code or `VITE_*` variables. Use server-side functions, per-provider restrictions where browser keys are designed to be public, usage quotas, rate limits, request validation and monitoring.

Enable Supabase Row Level Security for every user-owned row. Validate all trip inputs and AI output server-side. Keep provider content licensing and cache constraints in provider adapters; user-entered notes and StyleTrip-generated content should be stored separately from provider-owned fields.

### Build and maintenance

The project exposes `dev`, `build` and `preview` scripts. No lint, type-check, test, CI or deploy script is present. The production build is the only existing validation script. Pin compatible dependency versions rather than tracking `latest`; add type checking and tests once the first persistent flow is implemented. This audit does not introduce new frameworks.

## Recommended architecture

```text
React + TypeScript + Vite
  Pages/components ── typed trip/profile APIs ── loading/error/empty states
                           │
                    server-side functions
                     ├── Supabase Auth/Postgres (RLS)
                     ├── OpenAI itinerary generation
                     ├── destination/geocoding provider
                     ├── places provider
                     ├── weather provider
                     └── routing provider (later)
```

### Frontend

- Keep React and Vite. Introduce TypeScript incrementally by flow/component; do not rewrite the prototype wholesale.
- Add a small router for `/`, `/explore`, `/trips/:tripId` and account/profile routes.
- Split page composition, reusable UI, domain types, provider adapters and data access.
- Keep current CSS for the initial foundation. Tailwind is absent; adopt it only if the team chooses a deliberate consistent migration.
- Treat loading, empty, error, stale and partial-provider results as explicit UI states.

### Backend and core data model

Use Supabase Auth and Postgres for users, profiles and trips. Enforce Row Level Security from the first user-owned table. A practical initial model:

- `profiles`: preferences, language, home currency, style, dietary and accessibility preferences.
- `trips`: owner, selected destination reference, travel dates, timezone, budget amount/currency, traveller composition and lifecycle status.
- `itinerary_days`, `itinerary_items`: date/order, local time, category, coordinates/reference, estimated cost/currency, source, user edits and notes.
- `saved_places`: trip/user links and user-authored notes; keep third-party provider fields subject to their specific retention terms.
- `destination_catalog` (optional local reference tables): country/territory and selected normalized location identifiers, with source/version metadata. Do not try to curate every POI in StyleTrip’s database.

Store provenance alongside every volatile or generated field: `source`, `observed_at`/`retrieved_at`, `valid_from`/`valid_to`, `confidence` or estimate flag, and attribution where needed.

### AI and API boundary

The browser submits a validated trip request to a server-side function. That function retrieves only relevant, licensed destination/place/weather data, invokes OpenAI with a structured schema, validates the response, and returns a draft with source references and explicit estimates. The AI should not invent verified venue hours, prices, weather, availability, or coordinates. Persist user edits and generation metadata. Replanning should be a later feature based on changed user inputs and fresh provider evidence.

## Global destinations and geographic data

### Product/data design

Country selection must not be a hardcoded list of popular countries. Use ISO 3166-1 alpha-2/alpha-3 codes as stable identifiers where applicable; include territories the selected country source supports and make the coverage/version policy explicit. Use Unicode CLDR territory display names for localized labels and Unicode regional indicator flags where supported, with text names retained for accessibility and platforms without flag glyphs. A flag is a display aid, not a country identifier.

Destination search should accept country, city, region, town and named destination queries, including diacritics and alternate scripts. Store the provider/source ID, type, canonical name, localized display name, parent references, coordinates, country code and timezone when available. Keep currency and language as ISO-coded metadata with explicit source/version; destinations can have multiple languages and a country is not always a single-currency or single-timezone boundary.

Model places separately from administrative geography. Place records need a category, coordinates, provider ID, source timestamp, and optional fields for price level, visitor duration, opening hours and accessibility. Each optional field needs its own completeness/verification status because coverage varies by place and provider.

### Data source assessment

| Need | Candidate and fit | Constraints/cost considerations |
|---|---|---|
| Country/territory codes | ISO 3166 codes; use as identifiers and import from a maintained distribution | Validate territory policy, updates and licensing at implementation; codes are keys, not localized labels |
| Localized country names | Unicode CLDR territory names | Names are locale-dependent. Keep aliases/search normalization separate from canonical codes. [CLDR guidance](https://cldr.unicode.org/translation/displaynames/countryregion-territory-names) |
| City/town coordinates and hierarchy | GeoNames downloadable dump or web services | CC BY attribution, commercial use allowed, provided as-is without completeness/timeliness warranty; free service quota is 10,000 credits/day and 1,000/hour. Strong broad gazetteer candidate, but verify each dataset's update and coverage needs. [GeoNames terms](https://www.geonames.org/export/) |
| Search/geocoding | MapTiler Geocoding or another contracted provider behind an adapter | MapTiler Cloud lists Free for testing/noncommercial and Flex at $30/month; listed Flex includes 3,000 search sessions and 500k API requests with overage rates. Check current plan and data licensing before launch. [Pricing](https://www.maptiler.com/cloud/pricing/) |
| Open geocoding alternative | OpenStreetMap data via a hosted provider or self-managed Nominatim/Pelias | Public Nominatim is capped at 1 request/second, forbids client autocomplete, requires attribution/caching and can withdraw access; it is unsuitable as StyleTrip's general production autocomplete backend. OSM data is ODbL and requires attribution/share-alike obligations. [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/) |
| Weather | Open-Meteo for an initial adapter/prototype | Free endpoint is noncommercial, rate-limited and has no uptime commitment; paid subscription provides a commercial-use licence, customer endpoint and reserved capacity. Current published plans are 1M calls/month Standard, 5M Professional, 50M+ Enterprise; monthly price is shown in the provider checkout, so re-check before budgeting. Weather data is CC BY 4.0 and requires attribution. [Pricing](https://open-meteo.com/en/pricing/) |
| Rich POI data/hours | Evaluate Google Places API (New) as a paid pilot candidate against regional/OSM-based licensed providers | Pay-as-you-go by SKU, field masks control charges; published global Nearby Search/Text Search Pro first paid tier is $32 per 1,000 events after a 5,000 monthly free cap (confirm selected fields/SKU and region). Billing is required. Google restricts storage/caching of Places content; Place IDs can be stored, coordinates have limited caching exceptions. This conflicts with bulk local POI persistence and must shape the schema. [Pricing](https://developers.google.com/maps/billing-and-pricing/pricing), [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) |
| Interactive map display | MapLibre GL JS renderer plus a hosted tile provider such as MapTiler | Map renderer is separate from tile/data licensing. MapTiler’s listed Flex starts at $30/month with included sessions/API usage and paid overages; map sessions differ from third-party SDK tile-request billing. OSM tile servers are not a free production hosting SLA. [MapTiler pricing](https://www.maptiler.com/cloud/pricing/), [OSMF policies](https://operations.osmfoundation.org/policies/) |
| Time zones | IANA Time Zone Database via provider/timezone lookup | Store the IANA timezone identifier with the selected location; render itinerary times in that timezone and handle daylight-saving transitions. Refresh timezone data through managed dependency/provider updates. |
| Currency/languages | ISO 4217 currency codes and BCP 47 language tags, with CLDR display/formatting | A destination may have multiple supported languages or currencies. Trip budget must carry its currency; do not infer conversions without a dated exchange-rate source. |

These are candidates, not contracted decisions. Provider pricing and terms change. Recheck when selecting a provider and before launch. Google and MapTiler values above are current published USD list prices/quotas reviewed on 21 November 2026; they exclude taxes and do not predict StyleTrip usage. Cost should be modeled from expected searches, selected fields, map loads, weather refreshes and cached identifiers, then controlled with quotas, budget alerts and a spend limit.

## Weather intelligence

Use destination coordinates and IANA timezone to request the provider forecast for the trip dates. Normalize provider results to a provider-neutral daily/hourly schema with temperature, feels-like temperature, precipitation probability and amount, wind, humidity, condition codes, sunrise and sunset when supplied, source/model, issue/retrieval time and validity interval.

Open-Meteo’s documentation describes a standard forecast response for seven days and an optional horizon up to 16 days, but underlying model lengths vary (the cited models range from 2.5 days to 16 days). Do not imply equal reliability across the full horizon or all countries. [Forecast documentation](https://open-meteo.com/en/docs)

Define three separate information classes in API and UI:

1. **Forecast:** provider-sourced and within the provider/model horizon, with retrieval time and valid dates.
2. **Seasonal/historical context:** climate normals or historical averages with period/source labelled; never call these a forecast.
3. **AI guidance/estimate:** generated clothing, packing or activity advice, linked to the actual inputs used and labelled as guidance.

Weather can rank outdoor/indoor options and propose clothing/packing guidance. Do not use it to assert venue open status or promise conditions. If trip dates extend beyond forecast availability, use seasonal context only when available, mark the rest unknown, and refresh closer to travel. For changed plans, request updated weather and let the traveller accept itinerary suggestions rather than silently moving items.

## Explore recommendations and maps

### Destination-aware Explore

Explore should work without creating a trip and should also accept trip context when available. Search and filter by destination, category, interests, dates, budget, companions/age suitability where supplied, accessibility needs and distance from accommodation/itinerary anchors. Categories should include landmarks, museums, historical/cultural sites, parks/nature/beaches, neighborhoods, markets/shopping/fashion, restaurants/cafes/bars/nightlife, entertainment, family activities, architecture/religious tourism sites and local experiences.

For each result, show what it is, why it matches, its location, source/provider, verification/freshness state, and optional reliable price, visit-duration and hours fields. Clearly mark AI-written summaries and estimates separately from provider-sourced facts. Missing hours or price should remain unavailable, not be hallucinated.

Rank with explicit factors and explainable labels: destination/category relevance, preference match, date suitability and provider weather, budget fit, distance/travel time, opening-hours confidence, accessibility data and popularity/quality signal where licensed. Do not present ranking as objective quality or guarantee hours/availability. Save-to-trip should add a user-owned itinerary candidate with the source reference, then allow scheduling and editing.

### Map and routing boundaries

Design a provider-neutral map layer that can render destination center, place markers, accommodations and itinerary items; group/filter markers by category/day; and hand off to a route service for walking/transit/driving estimates. Store WGS84 coordinates where permitted and attach source/retention metadata. Cluster activities by geography and opening hours to reduce backtracking, but let the traveller override the result.

Map rendering, geocoding, place details and routes are distinct provider products. Avoid a general mapping abstraction that pretends one API covers all of them. Start with map display and markers; add route optimization only after the user has an editable itinerary and a chosen provider/license. Do not bulk-download third-party place datasets or store restricted content. Show required map/source attribution and make provider switching configurable server-side.

## MVP phases and feature boundaries

1. **Foundation:** pin dependencies; add TypeScript and routing incrementally; define profile/trip/destination/itinerary types; establish environment conventions, error states and Vercel deployment baseline.
2. **Identity and profile:** registration/login, preferences, language/home currency, dietary/accessibility needs, Supabase RLS.
3. **Global destination and trip creation:** searchable country/territory selector, searchable city/region destination resolution, dates, budget with currency, traveller count and interests. Store canonical source IDs, coordinates/timezone and trip draft. No hand-maintained popular-city list.
4. **Persistent editable trip:** save/reopen trips; itinerary days/items; explicit empty/loading/error states and user edits.
5. **Evidence-backed planning:** server-side OpenAI draft generation using structured trip inputs and provider data. Validate schema; label forecast vs climatology vs AI estimates; never claim unavailable live facts.
6. **Weather and Explore pilot:** forecast within provider horizon; seasonal guidance outside it; destination/category search and filtering for places; provenance and field-level availability. Evaluate data coverage and vendor terms in representative destinations across regions/scripts before release.
7. **Map and routing:** map display and itinerary/Explore markers; add distance and route estimates through a separately selected provider. Monitor spend before enabling high-volume route calls.
8. **Later expansion:** events, booking/affiliate integrations, richer wardrobe generation and change-aware replanning after core trip creation, editing and persistence are reliable.

Do not include payments, booking inventory, guaranteed pricing/opening hours or automatic replanning in the first MVP. Define interfaces so those capabilities can be added without overpromising them in the prototype.

## Immediate next engineering sequence

1. Correct README encoding and pin the current toolchain/dependency versions.
2. Extract typed trip/profile/destination domain contracts and split the current screen into page-level units while preserving the current look.
3. Add routes and implement Supabase Auth, profile, trip persistence and RLS.
4. Select one global destination/geocoding provider after evaluating multilingual search, territory coverage, licensing and cost. Keep the adapter replaceable.
5. Add dates and weather provenance/horizon handling, then a narrow Explore pilot and map display.
6. Add server-side AI generation only after structured trip data and source attribution are in place.

## Validation performed

The project provides only `npm run build` as a validation script. `npm run build` completed successfully on 21 November 2026. Vite/Rolldown emitted two non-fatal `MODULE_LEVEL_DIRECTIVE` warnings for `"use client"` directives in `lucide-react` (`Icon.mjs` and `context.mjs`). There are no configured test, lint, type-check or CI scripts, so those checks were not available to run. No product features were implemented in this task.
