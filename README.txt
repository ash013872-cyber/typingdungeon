# TypeRank PWA

## Windows / Android
This is a Progressive Web App. A PWA must be served from a web address (HTTPS or localhost) for the browser's Install/Add to Home Screen feature to appear.

Files:
- index.html — app
- manifest.webmanifest — install metadata
- sw.js — offline cache
- icon.svg — app icon

### Easiest local test
Run a local web server in this folder, then open the shown localhost address in Chrome/Edge:
  python -m http.server 8000

Then visit:
  http://localhost:8000

For Android installation from the internet, upload this folder to an HTTPS host (for example GitHub Pages, Netlify, Vercel, or Cloudflare Pages), open the HTTPS URL in Chrome, and choose Add to Home screen / Install app.

The app stores level progress in browser localStorage and the service worker caches the app for offline use after the first successful load.
