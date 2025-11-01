
class MovieApp {

    // API Configuration - Private properties (# makes them private)
    #API_KEY = '2602c1bb2310dbebd7db9ad4ec320981';
    #BASE_URL = 'https://api.themoviedb.org/3';
    #IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
    #POSTER_SIZE = 'w500';
    #DEFAULT_MOVIE_URL = `${this.#BASE_URL}/movie/popular?api_key=${this.#API_KEY}&language=en-US&page=1`;


    // Constructor runs automatically when we create new MovieApp()
    constructor() {
        // Store references to all HTML elements we need
        this.DOM = {
            movieContainer: document.getElementById('movie-container'),
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            movieModal: document.getElementById('movie-modal'),
            modalContent: document.getElementById('modal-content'),
            sectionTitle: document.getElementById('section-title'),
            navLinks: document.getElementById('nav-links'),
            hero: document.getElementById('hero'),
            heroTitle: document.getElementById('hero-title'),
            heroInfo: document.getElementById('hero-info'),
            exploreBtn: document.getElementById('explore-btn'),
            menuIcon: document.getElementById('menu-icon'),
        };

        // Set up event listeners
        this.bindEvents();
        
        // Load initial content
        this.init();
    }


    // Initialize the app
    init() {
        // Load popular movies when page loads
        this.loadMovies(this.#DEFAULT_MOVIE_URL, 'Popular Movies');
        
        // Set a random movie as hero background
        this.setHeroBackground();
        
        // Make the "Popular" link active
        const popularLink = document.getElementById('popular-link');
        if (popularLink) {
            popularLink.classList.add('active');
        }
    }

    // Connect user actions to functions
    bindEvents() {
        // When someone clicks the search button
        this.DOM.searchBtn.addEventListener('click', () => this.handleSearch());
        
        // When someone presses Enter in the search box
        this.DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // When someone clicks navigation links (Popular, Top Rated, etc.)
        this.DOM.navLinks.addEventListener('click', (e) => this.handleNavigation(e));

        // When someone clicks the hamburger menu (mobile)
        if (this.DOM.menuIcon) {
            this.DOM.menuIcon.addEventListener('click', () => this.handleMenuToggle());
        }

        // When someone clicks the modal background or close button
        this.DOM.movieModal.addEventListener('click', (e) => {
            if (e.target === this.DOM.movieModal || e.target.classList.contains('close-btn')) {
                this.closeModal();
            }
        });

        // When someone clicks "Explore Movies" button
        if (this.DOM.exploreBtn) {
            this.DOM.exploreBtn.addEventListener('click', () => {
                this.DOM.movieContainer.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }


    // Fetch data from any URL
    async fetchData(url) {
        try {
            // Ask the server for data
            const response = await fetch(url);
            
            // Check if request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Convert response to JSON (JavaScript object)
            return await response.json();
            
        } catch (error) {
            // If something goes wrong, show error
            console.error('❌ Error fetching data:', error);
            this.DOM.movieContainer.innerHTML = `<p class="error-message">Could not fetch data. Please try again later.</p>`;
            return null;
        }
    }


    // Load movies and display them
    async loadMovies(url, title) {
        // Get data from API
        const data = await this.fetchData(url);
        
        // If we got data successfully
        if (data && data.results) {
            // Update the title (e.g., "Popular Movies")
            this.DOM.sectionTitle.textContent = title;
            
            // Display the movie cards
            this.renderMovieCards(data.results);
        }
        
        // Close mobile menu after navigation (if it's open)
        if (window.innerWidth <= 768 && this.DOM.navLinks.classList.contains('active')) {
            this.handleMenuToggle();
        }
    }

      async loadMovies(url, title) {
        // Get data from API
        const data = await this.fetchData(url);
        
        // If we got data successfully
        if (data && data.results) {
            // Update the title (e.g., "Popular Movies")
            this.DOM.sectionTitle.textContent = title;
            
            // Display the movie cards
            this.renderMovieCards(data.results);
        }
        
        // Close mobile menu after navigation (if it's open)
        if (window.innerWidth <= 768 && this.DOM.navLinks.classList.contains('active')) {
            this.handleMenuToggle();
        }
    }


    // Set a random movie as hero background
    async setHeroBackground() {
        try {
            // Get popular movies
            const response = await fetch(`${this.#BASE_URL}/movie/popular?api_key=${this.#API_KEY}&language=en-US&page=1`);
            const data = await response.json();
            
            // Pick a random movie from the list
            const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

            // If we got a movie with a backdrop image
            if (randomMovie && randomMovie.backdrop_path) {
                // Set it as the background
                this.DOM.hero.style.backgroundImage = `url(${this.#IMG_BASE_URL}original${randomMovie.backdrop_path})`;
                
                // Update the title and info
                this.DOM.heroTitle.textContent = randomMovie.title;
                this.DOM.heroInfo.textContent = `${randomMovie.release_date.split('-')[0]} • ⭐ ${randomMovie.vote_average.toFixed(1)}`;
            }
        } catch (error) {
            console.error('❌ Error loading hero background:', error);
        }
    }


    // Create a single movie card
    renderMovieCard(movie) {
        // Destructure - extract these properties from the movie object
        const { id, title, poster_path, vote_average } = movie;
        
        // Check if movie has a poster, if not use placeholder
        const posterUrl = poster_path
            ? `${this.#IMG_BASE_URL}${this.#POSTER_SIZE}${poster_path}`
            : 'https://via.placeholder.com/200x300?text=No+Poster';

        // Create a new div element
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.id = id;
        
        // Set the inner HTML (the content inside the div)
        movieCard.innerHTML = `
          <img src="${posterUrl}" alt="${title}">
          <div class="movie-info">
            <h3>${title}</h3>
            <span class="rating">⭐ ${vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        `;

        // When someone clicks this card, show movie details
        movieCard.addEventListener('click', () => this.getMovieDetails(id));
        
        return movieCard;
    }

    // Render all movie cards
    renderMovieCards(movies) {
        // Clear the container first
        this.DOM.movieContainer.innerHTML = '';
        
        // If no movies found
        if (movies.length === 0) {
            this.DOM.movieContainer.innerHTML = `<p class="error-message">No movies found for this search/category.</p>`;
            return;
        }
        
        // Loop through each movie and create a card
        movies.forEach((movie) => {
            const card = this.renderMovieCard(movie);
            this.DOM.movieContainer.appendChild(card);
        });
    }


    // Get detailed information about a movie
    async getMovieDetails(id) {
        // Build the URL for this specific movie
        const detailsURL = `${this.#BASE_URL}/movie/${id}?api_key=${this.#API_KEY}&language=en-US`;
        
        // Fetch the data
        const data = await this.fetchData(detailsURL);

        if (data) {
            // Render the modal with movie details
            this.renderModalContent(data);
            
            // Show the modal
            this.DOM.movieModal.style.display = 'flex';

            // After rendering, attach the trailer button event
            const trailerBtn = document.getElementById('trailer-btn');
            if (trailerBtn) {
                trailerBtn.addEventListener('click', () => this.getMovieTrailer(id));
            }
        }
    }

    // Render the content inside the modal
    renderModalContent(data) {
        // Get poster URL or use placeholder
        const posterUrl = data.poster_path
            ? `${this.#IMG_BASE_URL}w780${data.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';

        // Build the HTML for the modal
        this.DOM.modalContent.innerHTML = `
          <button class="close-btn">&times;</button>
          <div class="modal-poster">
              <img src="${posterUrl}" alt="${data.title}">
          </div>
          <div class="modal-details">
              <h2>${data.title}</h2>
              <div class="modal-info-bar">
                  <span class="info-item">⭐ ${data.vote_average.toFixed(1)}</span>
                  <span class="info-item">📅 ${data.release_date}</span>
                  <span class="info-item">🎬 ${data.runtime || 'N/A'} min</span>
              </div>
              <p class="tagline">${data.tagline || ''}</p>
              <p class="overview">${data.overview}</p>
              <div class="genres">
                  ${data.genres.map((g) => `<span class="genre-tag">${g.name}</span>`).join('')}
              </div>
              <button id="trailer-btn" class="btn-primary">▶ Watch Trailer</button>
          </div>
        `;
    }


    // Get and play the movie trailer
    async getMovieTrailer(id) {
        // Build URL to get videos for this movie
        const trailerURL = `${this.#BASE_URL}/movie/${id}/videos?api_key=${this.#API_KEY}&language=en-US`;
        
        // Fetch video data
        const data = await this.fetchData(trailerURL);

        if (data && data.results.length > 0) {
            // Find a trailer that's on YouTube
            const trailer = data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
            
            if (trailer) {
                // Open YouTube in a new tab
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            } else {
                alert('🚫 No official trailer found.');
            }
        } else {
            alert('🚫 Video data not available.');
        }
    }

    // Close the modal
    closeModal() {
        this.DOM.movieModal.style.display = 'none';
    }


    // Handle search functionality
    handleSearch() {
        // Get the search query and remove extra spaces
        const query = this.DOM.searchInput.value.trim();
        
        if (query) {
            // Build search URL
            const searchURL = `${this.#BASE_URL}/search/movie?api_key=${this.#API_KEY}&query=${encodeURIComponent(query)}`;
            
            // Load search results
            this.loadMovies(searchURL, `Search Results for: "${query}"`);
            
            // Clear the search box
            this.DOM.searchInput.value = '';
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
            
            // Close mobile menu if open
            if (window.innerWidth <= 768 && this.DOM.navLinks.classList.contains('active')) {
                this.handleMenuToggle();
            }
        }
    }

    // Handle navigation clicks (Popular, Top Rated, Upcoming)
    handleNavigation(e) {
        e.preventDefault(); // Stop the link from reloading the page
        
        // Find the clicked link
        const target = e.target.closest('a');
        if (!target) return; // If no link was clicked, stop

        let url = this.#DEFAULT_MOVIE_URL;
        let title = 'Popular Movies';

        // Determine which link was clicked and set appropriate URL
        switch (target.id) {
            case 'popular-link':
                url = `${this.#BASE_URL}/movie/popular?api_key=${this.#API_KEY}&language=en-US&page=1`;
                title = 'Popular Movies';
                break;
            case 'top-rated-link':
                url = `${this.#BASE_URL}/movie/top_rated?api_key=${this.#API_KEY}&language=en-US&page=1`;
                title = 'Top Rated Movies';
                break;
            case 'upcoming-link':
                url = `${this.#BASE_URL}/movie/upcoming?api_key=${this.#API_KEY}&language=en-US&page=1`;
                title = 'Upcoming Movies';
                break;
            case 'home-link':
                url = this.#DEFAULT_MOVIE_URL;
                title = 'Popular Movies';
                break;
            default:
                return; // Unknown link, do nothing
        }

        // Load the movies
        this.loadMovies(url, title);

        // Update visual feedback - highlight the clicked link
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        target.classList.add('active');

        // Smoothly scroll to the movie container
        this.DOM.movieContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Toggle mobile menu open/closed
    handleMenuToggle() {
        this.DOM.navLinks.classList.toggle('active');
        this.DOM.menuIcon.classList.toggle('open');
    }
}

// Start the app when the page loads
window.addEventListener('load', () => new MovieApp());