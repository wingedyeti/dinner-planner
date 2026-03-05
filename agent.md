# Dinner Planner Agent Context
## Project summary
Dinner Planner is a static single-page web app for tracking meal ideas and restaurants. It is designed for non-technical usage, mobile responsiveness, and easy GitHub Pages hosting.

## Stack
- HTML + CSS + vanilla JavaScript
- No build step, no framework, no external dependencies
- Browser `localStorage` for local persistence
- Optional Google Sheets sync through Google Apps Script web app (`Code.gs`)

## Core data model
### Meal
- `id`
- `name`
- `cookingMethod`
- `cuisine`
- `notes`
- `dateAdded`

### Restaurant
- `id`
- `name`
- `type` (`Sit-down`, `Fast Food`, `Carry Out`)
- `cuisine`
- `priceRange` (`$` to `$$$$`)
- `location`
- `rating` (0-5)
- `notes`
- `dateAdded`

## App behavior
- Two tabs: Meals and Restaurants
- CRUD operations via modal forms
- Search + filter + sort in each tab
- Meal quick-exclude toggles (uncheck `Chicken`, etc.)
- JSON import/export for backup
- Sync settings panel with Push/Pull buttons for Apps Script endpoint

## File responsibilities
- `index.html`: page layout, sections, forms, modals
- `styles.css`: mobile-first styling and responsive layout
- `app.js`: state management, rendering, events, storage, import/export, sync
- `Code.gs`: Apps Script API (`doGet`, `doPost`) for read/write with Google Sheets
- `README.md`: setup + deployment instructions
- `lot.md`: running implementation log

## Future changes guidance
- Keep app framework-free unless explicitly requested.
- Preserve localStorage compatibility keys in `app.js`:
  - `dinnerPlanner.data.v1`
  - `dinnerPlanner.settings.v1`
- Keep Google Sheets payload schema stable:
  - `{ meals: [...], restaurants: [...] }`
- If adding fields, update:
  1. forms in `index.html`
  2. normalization/render/filter in `app.js`
  3. headers in `Code.gs`
  4. documentation in `README.md` and this file
