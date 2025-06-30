const API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/original';
    let currentItem;

    async function fetchTrending(type) {
      const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
      const data = await res.json();
      return data.results;
    }

    async function fetchTrendingAnime() {
  let allResults = [];

  // Fetch from multiple pages to get more anime (max 3 pages for demo)
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }

  return allResults;
}


    function displayBanner(item) {
      document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
      document.getElementById('banner-title').textContent = item.title || item.name;
    }

    function displayList(items, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      items.forEach(item => {
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => showDetails(item);
        container.appendChild(img);
      });
    }

    function showDetails(item) {
      currentItem = item;
      document.getElementById('modal-title').textContent = item.title || item.name;
      document.getElementById('modal-description').textContent = item.overview;
      document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
      document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
      changeServer();
      document.getElementById('modal').style.display = 'flex';
    }

    function changeServer() {
      const server = document.getElementById('server').value;
      const type = currentItem.media_type === "movie" ? "movie" : "tv";
      let embedURL = "";

      if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
      } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
      } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
      }

      document.getElementById('modal-video').src = embedURL;
    }

    function closeModal() {
      document.getElementById('modal').style.display = 'none';
      document.getElementById('modal-video').src = '';
    }

    function openSearchModal() {
      document.getElementById('search-modal').style.display = 'flex';
      document.getElementById('search-input').focus();
    }

    function closeSearchModal() {
      document.getElementById('search-modal').style.display = 'none';
      document.getElementById('search-results').innerHTML = '';
    }
	
	
	//query movie
async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');

  if (!query) {
    container.innerHTML = '';
    container.classList.remove('show');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);

    if (!res.ok) {
      container.innerHTML = `<div style="color:#aaa;padding:18px;">Error: ${res.status} ${res.statusText}</div>`;
      container.classList.add('show');
      return;
    }

    const data = await res.json();

    // Filter out people, keep only movies and TV shows
    const filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

    if (filteredResults.length === 0) {
      container.innerHTML = '<div style="color:#aaa;padding:18px;">No results found.</div>';
      container.classList.add('show');
      return;
    }

    container.innerHTML = '';

    filteredResults.forEach(item => {
      const imgSrc = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : 'https://dummyimage.com/56x56/444/fff&text=?';

      const title = item.title || item.name || 'Untitled';

      // Compose subtitle and meta info depending on media type
      let sub = '';
      let meta = '';
      if (item.media_type === 'movie') {
        sub = 'Movie';
        meta = item.release_date ? `Year: ${new Date(item.release_date).getFullYear()}` : '';
      } else if (item.media_type === 'tv') {
        const episodes = item.number_of_episodes ? `${item.number_of_episodes} Episodes` : '';
        const status = item.status || '';
        sub = `TV${episodes ? ' - ' + episodes : ''}${status ? ' (' + status + ')' : ''}`;
        meta = item.first_air_date ? `Year: ${new Date(item.first_air_date).getFullYear()}` : '';
      }

      const div = document.createElement('div');
      div.className = 'search-list-item';
      div.innerHTML = `
        <img class="search-list-img" src="${imgSrc}" alt="${title}">
        <div class="search-list-details">
          <div class="search-list-title">${title}</div>
          <div class="search-list-sub">${sub}</div>
          <div class="search-list-meta">${meta}</div>
        </div>
      `;

      // Set media_type for showDetails to work correctly
      div.onclick = () => {
        showDetails(item);
        container.classList.remove('show');
        document.getElementById('search-input').value = '';
      };

      container.appendChild(div);
    });

    container.classList.add('show');

  } catch (error) {
    console.error('Search error:', error);
    container.innerHTML = '<div style="color:#aaa;padding:18px;">Network error. Please try again.</div>';
    container.classList.add('show');
  }
}

// Close results when clicking outside search area
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', function(event) {
    const searchArea = document.getElementById('search-area');
    const resultsContainer = document.getElementById('search-results');

    if (!searchArea.contains(event.target)) {
      resultsContainer.classList.remove('show');
    }
  });
});

// Optional: Close results on Escape key press
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    document.getElementById('search-results').classList.remove('show');
  }
});

    async function init() {
      const movies = await fetchTrending('movie');
      const tvShows = await fetchTrending('tv');
      const anime = await fetchTrendingAnime();

      displayBanner(movies[Math.floor(Math.random() * movies.length)]);
      displayList(movies, 'movies-list');
      displayList(tvShows, 'tvshows-list');
      displayList(anime, 'anime-list');
    }

    init();
