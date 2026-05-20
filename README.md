# smart_metro

Smart Metro — a frontend demo for Bengaluru Namma Metro: route finder, fare calculator, live-status simulation, and a browser-stored smart card.

**Setup**
- **Open locally:** open `index.html` in a modern browser (no build step required).
- **Recommended:** if a browser blocks clipboard access or local file navigation, serve the folder with a simple local web server such as VS Code Live Server or `python -m http.server`.
- **Pages:** main app pages live in the root HTML files (`home.html`, `route-finder.html`, `fare-calculator.html`, `journey-history.html`, `profile.html`, `live-map.html`, `live-status.html`, `smartcard.html`).

**Local AI heuristics only**
- The app uses browser-side heuristics and Open-Meteo weather context only.
- No Gemini API key is required or supported in this project.

**New / Enhanced features**
- **Route favorites:** Save frequent trips in Route Finder and access favorites quickly from the dashboard.
- **Share route links:** Route Finder can copy a shareable route URL to the clipboard.
- **Station popovers:** Route results show station details on hover for richer navigation context.
- **Journey export & QR preview:** Journey History supports CSV export and ticket QR previews.
- **Top destination suggestions:** Dashboard now surfaces the top 3 destinations based on travel history.
- **Localization toggle:** Profile includes a Kannada/English switch for key UI labels.
- **Export/import LocalStorage JSON:** Profile page lets you backup or restore browser-local application data.
- **Clear demo data:** Profile page clears journeys, transactions, accounts, theme, favorites, and locale settings.
- **Peak-hour hint:** Fare Calculator shows a peak-hour warning in the AI hint during typical commute windows.

**Security & notes**
- This is a client-side demo: no backend, all data lives in your browser LocalStorage.
- Never commit real API keys to the repo. For production, use a server-side secret store or proxy (not included here).

If you'd like, I can add a short CONTRIBUTING section or tweak the UI wording further.

