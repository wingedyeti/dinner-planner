# Dinner Planner
A simple, responsive meal-and-restaurant planning app built with plain HTML, CSS, and JavaScript. It works on desktop and phone screens and can be hosted on GitHub Pages.

## Features
- Separate sections for **Meals** and **Restaurants**
- Add, edit, delete, and search items
- Meal fields: name, cooking method, cuisine type, notes
- Restaurant fields: name, type (sit-down/fast food/carry out), cuisine, price range, location, rating, notes
- Meal quick-exclude checkboxes (uncheck `Chicken`, etc. to hide matching meals)
- Filter + sort controls
- Local data persistence in browser (`localStorage`)
- Backup import/export as JSON
- Optional Google Sheets sync via Google Apps Script (`Code.gs`)

## Files
- `index.html` - app UI
- `styles.css` - responsive styling
- `app.js` - app logic and storage/sync behavior
- `Code.gs` - Google Apps Script backend for sheet sync
- `agent.md` - technical context for future AI sessions
- `lot.md` - project build log

## Run Locally
You can open `index.html` directly, but a tiny local server is better:

```sh
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Google Sheets Sync Setup (one-time)
This is the easiest secure approach for a static site:

1. Create a new Google Sheet.
2. In that sheet, open **Extensions → Apps Script**.
3. Replace the default code with the contents of `Code.gs`.
4. Click **Deploy → New deployment**.
5. Deployment type: **Web app**.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Deploy and authorize.
9. Copy the **Web app URL** (ends in `/exec`).
10. In the app, click **Settings**, paste URL, then **Save Settings**.
11. Use **Push to Sheets** to upload local data, or **Pull from Sheets** to download from sheet.

## Create GitHub Repo + Push Files
In the project folder:

```sh
git init
git add .
git commit -m "Initial Dinner Planner app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Enable GitHub Pages
1. Open your repo on GitHub.
2. Go to **Settings → Pages**.
3. Under "Build and deployment", set:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Save. GitHub will publish a Pages URL.

## Notes
- Data is stored in the browser unless you push to Sheets.
- If you clear browser storage, local-only data is removed.
- If you update `Code.gs`, redeploy a new Apps Script version and keep the latest URL in Settings.
