# memeRus

A small cyberpunk-themed meme browser (memeRus) that fetches trending GIFs and stills from GIPHY and displays them in a neon grid. Includes filters for content rating and media type (GIF vs PNG/still).

## Features
- Search memes by keyword
- Trending feed
- Filter by rating (`G`, `PG`, `PG-13`, `R`)
- Choose GIF (animated) or PNG / still images
- Modal viewer for larger preview

## Setup
1. Get a free API key from GIPHY: https://developers.giphy.com/
2. Open `app.js` and replace the placeholder `GIPHY_API_KEY` with your key.

## Run locally
You can open `index.html` directly in a browser, but for best results serve via a local static server.

Python 3 (quick):
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Notes
- The app uses GIPHY's `search` and `trending` endpoints and maps the `rating` parameter to filter content.
- If you want static PNGs from other sources (e.g., Reddit images), we can add a fallback API (Meme API / Reddit) and NSFW-safe filtering.
