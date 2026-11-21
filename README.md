# StyleTrip — Release 0.2 destination foundation

Responsive React/Vite starter for StyleTrip, a lifestyle-led trip planning product.

## Current functionality

- Search and select from a local list of 249 ISO 3166-1 alpha-2 countries and territories.
- Search ignores accents in country names; flags and names come from local browser internationalization data.
- Enter a city, town, region or destination as free text and associate it with a selected country.
- Set trip dates, a budget and currency, traveller count, travel style and interests.
- Validate required fields and create an in-session trip workspace from the submitted values.
- View the selected trip details in Overview and see explicit placeholders for features that are not connected.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the URL printed by Vite.

## Deployment

The current MVP is deployed on Vercel: **[styletrip-seven.vercel.app](https://styletrip-seven.vercel.app)**. The Vercel project is named `styletrip`. Production builds use `npm run build` and Vite's `dist` output. The workspace is not connected to a Git repository; deploy updates from the project directory with the Vercel CLI after authentication.

## Current limitations

Destination names are free text: the app does not verify locations or provide live city/region suggestions. Trip data is held in React state for the current browser session and is not saved across reloads. Authentication, AI planning, weather, places, maps, events, booking and payments are not connected. Inspiration cards are examples, not a complete destination catalogue. Do not rely on placeholder content as live, verified travel information.

## Engineering documentation

- [Task 1 engineering audit and MVP architecture](docs/ENGINEERING_AUDIT.md)
- [Task 2 destination foundation and trip creation](docs/DESTINATION_FOUNDATION.md)
