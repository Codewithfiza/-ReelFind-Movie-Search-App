// ============ CONFIG ============
const API_KEY = "d2aec596f629abf31e2ebc5efe1be34b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w780";

// popularMovie: always holds the 20 popular movies (used by the deck + hero)
// currentMovies: whatever is CURRENTLY on screen in the grid (popular OR search
// results) — this is what clicking a grid card looks itself up against
let popularMovie = [];
let currentMovies = [];


// ============ LOOKUP HELPERS ============
function getMovieID(id) {
  return popularMovie.find((movie) => {
    return movie.id === id;
  });
}


// ============ HERO ============
function updateHero(movie) {
  const heroTitle = document.querySelector("[data-hero-title]");
  const heroOverview = document.querySelector("[data-hero-overview]");
  const heroRating = document.querySelector("[data-hero-rating]");
  const heroYear = document.querySelector("[data-hero-year]");

  heroTitle.textContent = movie.title;
  heroOverview.textContent = movie.overview;
  heroRating.textContent = "★ " + movie.vote_average.toFixed(1);
  heroYear.textContent = movie.release_date.slice(0, 4);

  // keep the hero buttons pointed at whichever movie is currently on screen
  document.querySelector("[data-play-trailer]").dataset.movieId = movie.id;
  document.querySelector("[data-more-info]").dataset.movieId = movie.id;
}


// ============ POPULAR MOVIES (page load) ============
async function getPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();

  popularMovie = data.results;
  currentMovies = data.results;

  renderMovies(popularMovie);

  // fill the stack card with real data
  const deckCards = document.querySelectorAll(".stack-card");
  deckCards.forEach((card, index) => {
    const movie = popularMovie[index];
    const poster = card.querySelector(".stack-card__poster");
    poster.src = IMG_URL + movie.poster_path;
    card.dataset.movieId = movie.id;
  });

  updateHero(popularMovie[0]);
}

getPopularMovies();


// ============ DECK: NEXT BUTTON ============
const nextBtn = document.querySelector("[data-next-btn]");

nextBtn.addEventListener("click", () => {
  const cards = Array.from(document.querySelectorAll(".stack-card"));

  const frontCard = cards.find((card) => {
    return card.dataset.position === "0";
  });

  frontCard.classList.add("is-leaving");

  cards.forEach((card) => {
    const currentPosition = Number(card.dataset.position);
    if (currentPosition === 0) {
      card.dataset.position = 4;
    } else {
      card.dataset.position = currentPosition - 1;
    }
  });

  setTimeout(() => {
    frontCard.classList.remove("is-leaving");
  }, 500);

  const newFrontCard = cards.find((card) => card.dataset.position === "0");
  const newMovieId = Number(newFrontCard.dataset.movieId);
  const newMovie = getMovieID(newMovieId);
  updateHero(newMovie);
});


// ============ DECK: PREV BUTTON ============
const prevBtn = document.querySelector("[data-prev-btn]");

prevBtn.addEventListener("click", () => {
  const cards = Array.from(document.querySelectorAll(".stack-card"));

  const frontCard = cards.find((card) => {
    return card.dataset.position === "0";
  });

  frontCard.classList.add("is-leaving-reverse");

  cards.forEach((card) => {
    const currentPosition = Number(card.dataset.position);
    if (currentPosition === 4) {
      card.dataset.position = 0;
    } else {
      card.dataset.position = currentPosition + 1;
    }
  });

  setTimeout(() => {
    frontCard.classList.remove("is-leaving-reverse");
  }, 500);

  const newFrontCard = cards.find((card) => card.dataset.position === "0");
  const newMovieId = Number(newFrontCard.dataset.movieId);
  const newMovie = getMovieID(newMovieId);
  updateHero(newMovie);
});


// ============ RENDER MOVIES (shared by popular + search) ============
function renderMovies(movies) {
  const template = document.querySelector("[data-movie-card-template]");
  const grid = document.querySelector("[data-results-grid]");

  // clear out any previously rendered cards, but keep the hidden template itself
  grid.querySelectorAll(".movie-card:not(.movie-card--template)").forEach((card) => {
    card.remove();
  });

  movies.forEach((movie) => {
    const card = template.cloneNode(true);

    const posterImage = card.querySelector('[data-field="poster"]');
    posterImage.src = IMG_URL + movie.poster_path;

    const title = card.querySelector('[data-field="title"]');
    title.textContent = movie.title;

    const rating = card.querySelector('[data-field="rating"]');
    rating.textContent = movie.vote_average.toFixed(1);

    const year = card.querySelector('[data-field="year"]');
    year.textContent = movie.release_date ? movie.release_date.slice(0, 4) : "—";

    // needed so clicking this card can look itself back up in currentMovies
    card.dataset.movieId = movie.id;

    card.classList.remove("movie-card--template");
    grid.appendChild(card);
  });
}


// ============ SEARCH ============
const searchForm = document.querySelector("[data-search-form]");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = document.querySelector("[data-search-input]").value;
  if (!query.trim()) return;

  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();

  currentMovies = data.results;
  renderMovies(data.results);
});


// ============ MODAL ============

// Fills the modal's fields from one movie object, reveals it, then fetches
// the trailer for it. Marked async because it awaits the trailer fetch below.
async function openModal(movie) {
  const modal = document.querySelector("[data-modal]");

  document.querySelector("[data-modal-title]").textContent = movie.title;
  document.querySelector("[data-modal-overview]").textContent = movie.overview;
  document.querySelector("[data-modal-rating]").textContent =
    "★ " + movie.vote_average.toFixed(1);
  document.querySelector("[data-modal-year]").textContent = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "—";

  const backdrop = document.querySelector("[data-modal-backdrop]");
  backdrop.style.backgroundImage = movie.backdrop_path
    ? `url(${BACKDROP_URL + movie.backdrop_path})`
    : "none";

  modal.classList.add("is-open");
  document.body.style.overflow = "hidden"; // stop the page scrolling behind the modal

  await loadTrailer(movie.id);
}

// Fetches /movie/{id}/videos, finds a YouTube trailer if one exists, and
// either plays it in the iframe or shows the "no trailer" placeholder.
async function loadTrailer(movieId) {
  const iframe = document.querySelector("[data-modal-trailer-iframe]");
  const noTrailer = document.querySelector("[data-modal-no-trailer]");

  // reset to a loading state first, in case a previous movie's trailer is still showing
  iframe.hidden = true;
  iframe.src = "";
  noTrailer.hidden = false;

  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await response.json();

  const trailer = data.results.find((video) => {
    return video.type === "Trailer" && video.site === "YouTube";
  });

  if (trailer) {
    iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&vq=hd1080&rel=0`;
    iframe.hidden = false;
    noTrailer.hidden = true;
  }
  // if no trailer was found, iframe stays hidden and noTrailer stays visible — already set above
}

function closeModal() {
  const modal = document.querySelector("[data-modal]");
  modal.classList.remove("is-open");
  document.body.style.overflow = ""; // let the page scroll normally again

  // stop any trailer audio/video immediately by clearing the iframe src
  document.querySelector("[data-modal-trailer-iframe]").src = "";
}

// Every element with data-modal-close (the dark overlay + the ✕ button)
// should close the modal when clicked.
document.querySelectorAll("[data-modal-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

// EVENT DELEGATION — one listener on the grid container catches clicks
// from every card inside it, even cards that don't exist yet (future
// search results). event.target.closest(".movie-card") walks up from
// whatever was actually clicked (an image? a title?) to find the
// surrounding card element.
const resultsGrid = document.querySelector("[data-results-grid]");

resultsGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".movie-card");
  if (!card) return; // click landed somewhere in the grid, but not on a card

  const movieId = Number(card.dataset.movieId);
  const movie = currentMovies.find((m) => m.id === movieId);
  if (movie) openModal(movie);
});

// Same pattern for the deck — one listener on the whole stack.
const stack = document.querySelector("[data-stack]");

stack.addEventListener("click", (event) => {
  const card = event.target.closest(".stack-card");
  if (!card) return;

  const movieId = Number(card.dataset.movieId);
  const movie = getMovieID(movieId);
  if (movie) openModal(movie);
});

// Hero's "Watch Trailer" and "More Info" buttons both open the same modal —
// their data-movie-id is kept in sync by updateHero(), so this always opens
// whichever movie is currently featured.
const playTrailerBtn = document.querySelector("[data-play-trailer]");
const moreInfoBtn = document.querySelector("[data-more-info]");

playTrailerBtn.addEventListener("click", () => {
  const movieId = Number(playTrailerBtn.dataset.movieId);
  const movie = getMovieID(movieId);
  if (movie) openModal(movie);
});

moreInfoBtn.addEventListener("click", () => {
  const movieId = Number(moreInfoBtn.dataset.movieId);
  const movie = getMovieID(movieId);
  if (movie) openModal(movie);
});