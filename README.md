# 🎬 ReelFind — Movie Search App

A cinematic movie search app built with **vanilla HTML, CSS, and JavaScript**, powered by [The Movie Database (TMDb) API](https://www.themoviedb.org/documentation/api). My second API-integration project after building a GitHub User Finder — this one goes further with a custom fanned "deck" carousel, live search, and a curtain-reveal detail modal with embedded trailers.

## ✨ Features

- **Live search** — search any movie by title using TMDb's search endpoint
- **Popular movies grid** — browse a Netflix-style grid of currently popular titles on load
- **Fanned card deck** — a hand-of-cards style carousel (not a typical horizontal scroller) showing featured titles, with custom prev/next slide animations
- **Curtain-reveal modal** — clicking any movie opens a themed modal with full details
- **Embedded YouTube trailers** — fetched live per movie, with a graceful fallback message when no trailer exists
- **Fully responsive** — works across desktop and mobile, including a reworked mobile header layout
- **Dark cinema aesthetic** — custom typography (Anton, Karla, Space Mono), ticket-stub search bar, and film-reel inspired styling throughout

## 🛠️ Built With

- HTML5
- CSS3 (Grid, Flexbox, custom properties, keyframe animations)
- Vanilla JavaScript (async/await, Fetch API, DOM manipulation, event delegation)
- [TMDb API](https://www.themoviedb.org/documentation/api)

## 🚀 Getting Started

1. Clone this repo
   ```bash
   git clone https://github.com/codewithfiza/reelfind.git
   ```
2. Get a free TMDb API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
3. Open `app.js` and replace the `API_KEY` value at the top with your own key
4. Open `index.html` with Live Server (or any local server) — that's it, no build step, no dependencies

> Note: TMDb's v3 API key is designed to be used client-side (see their [API docs](https://developer.themoviedb.org/docs)), so it's safe to keep inline in this kind of frontend-only project.

## 📚 What I Learned

- Working with async/await and the Fetch API to pull live data from a public REST API
- DOM manipulation at scale: cloning templates, event delegation for dynamically-created elements, and keeping UI state (like a card carousel's position) in sync with the data behind it
- Debugging real browser quirks — CSS specificity overriding the `hidden` attribute, flexbox `flex-basis` behaving differently once `flex-direction` changes, and DNS-level network errors vs. actual code bugs
- Structuring a vanilla JS app into small, reusable functions (`renderMovies`, `openModal`) instead of duplicating logic across multiple features

## 🔮 Possible Future Additions

- Genre filtering
- Pagination / infinite scroll for search results
- "Where to watch" streaming provider badges
- LocalStorage-based watchlist

---

Built by Maryam ([@codewithfiza](https://github.com/codewithfiza)) · Movie data and trailers courtesy of [TMDb](https://www.themoviedb.org/)
