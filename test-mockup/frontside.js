// Fil: Logik för startsidan (filter, karusell och UI-interaktioner).
// Carousel hover effect
const carouselImages = document.querySelectorAll('.carousel img');

carouselImages.forEach(img => {
    img.addEventListener('mouseenter', () => {
        // Pause animation
        const carouselTrack = img.closest('.carousel-track');
        carouselTrack.style.animationPlayState = 'paused';
        
        // Zoom in (scale up)
        img.style.transform = 'scale(1.15)';
        
        // Darken other images
        carouselImages.forEach(otherImg => {
            if (otherImg !== img) {
                otherImg.style.filter = 'brightness(0.3)';
            }
        });
    });

    img.addEventListener('mouseleave', () => {
        // Resume animation
        const carouselTrack = img.closest('.carousel-track');
        carouselTrack.style.animationPlayState = 'running';
        
        // Reset zoom
        img.style.transform = 'scale(1)';
        
        // Reset brightness on all images
        carouselImages.forEach(otherImg => {
            otherImg.style.filter = 'brightness(1)';
        });
    });
});

// Custom date picker for 2026 only
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('.filter-date');
    
    if (dateInput) {
        // Set default value to current month and date in 2026
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `2026-${month}-${day}`;
        
        dateInput.addEventListener('focus', function() {
            this.style.color = 'transparent';
        });
        
        dateInput.addEventListener('input', function() {
            // Show the selected date immediately
            if (this.value) {
                this.style.color = '#FFD700';
            }
            selectedDate = this.value || '';
            dateFilterActive = Boolean(this.value);
            applyFilters();
        });
        
        dateInput.addEventListener('blur', function() {
            if (this.value) {
                this.style.color = '#FFD700';
            }
        });
        
        // Validate input to only allow 2026
        dateInput.addEventListener('change', function() {
            const date = new Date(this.value);
            if (date.getFullYear() !== 2026) {
                this.value = '';
                this.style.color = 'transparent';
                alert('Endast datum från 2026 är tillåtna');
                selectedDate = '';
                dateFilterActive = false;
            } else {
                this.style.color = '#FFD700';
            }
            selectedDate = this.value || '';
            dateFilterActive = Boolean(this.value);
            applyFilters();
        });
    }
    applyFilters();
});

// Add smooth transition
const style = document.createElement('style');
style.textContent = `
    .carousel img {
        transition: transform 0.3s ease, filter 0.3s ease;
    }
`;
document.head.appendChild(style);

// Movie filters (genre + date)
let selectedGenre = 'alla';
let selectedDate = '';
let dateFilterActive = false;
let selectedsalong = 'alla';

const movieSchedule = {
    'Dune: Part Two': ['2026-02-03', '2026-02-04', '2026-02-08'],
    'Oppenheimer': ['2026-02-03', '2026-02-05', '2026-02-07'],
    'Inside Out 2': ['2026-02-08', '2026-02-09'],
    'The Matrix': ['2026-02-06', '2026-02-08'],
    'Inception': ['2026-02-05', '2026-02-07'],
    'Avatar': ['2026-02-04', '2026-02-06', '2026-02-09'],
    'Titanic': ['2026-02-03', '2026-02-05', '2026-02-09'],
    'Star Wars: A New Hope': ['2026-02-07', '2026-02-08'],
    'Avengers: Endgame': ['2026-02-06', '2026-02-08'],
    'The Shawshank Redemption': ['2026-02-03', '2026-02-05', '2026-02-09'],
    'Jurassic Park': ['2026-02-04', '2026-02-08'],
    'Dune: Part Two': ['2026-03-03', '2026-03-04', '2026-03-08'],
    'Oppenheimer': ['2026-03-03', '2026-03-05', '2026-03-07'],
    'Inside Out 2': ['2026-03-08', '2026-03-09'],
    'The Matrix': ['2026-03-06', '2026-03-08'],
    'Inception': ['2026-03-05', '2026-03-07'],
    'Avatar': ['2026-03-04', '2026-03-06', '2026-03-09'],
    'Titanic': ['2026-03-03', '2026-03-05', '2026-03-09'],
    'Star Wars: A New Hope': ['2026-03-07', '2026-03-08'],
    'Avengers: Endgame': ['2026-03-06', '2026-03-08'],
    'The Shawshank Redemption': ['2026-03-03', '2026-03-05', '2026-03-09'],
    'Jurassic Park': ['2026-03-04', '2026-03-08']

};

function applyFilters() {
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach(card => {
        const cardGenre = card.querySelector('p')?.textContent?.trim() || '';
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        const cardSalong = card.querySelector('.salong')?.textContent?.trim() || '';

        const dateMatches = !dateFilterActive || (movieSchedule[title] || []).includes(selectedDate);

        const genreMatches = selectedGenre === 'alla' || cardGenre === selectedGenre;

        const salongMatches = selectedsalong === 'alla' || cardSalong === selectedsalong;

        card.style.display = dateMatches && genreMatches && salongMatches ? 'block' : 'none';
    });

    updateMovieLinks();
}

function updateMovieLinks() {
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach(card => {
        if (!card.dataset.baseHref) {
            card.dataset.baseHref = card.getAttribute('href') || '';
        }

        const baseHref = card.dataset.baseHref;
        const cardSalong = card.querySelector('.salong')?.textContent?.trim() || '';
        const salongToUse = selectedsalong === 'alla' ? cardSalong : selectedsalong;

        const [path, query = ''] = baseHref.split('?');
        const params = new URLSearchParams(query);

        if (salongToUse && salongToUse !== 'alla') {
            params.set('salong', salongToUse);
        } else {
            params.delete('salong');
        }

        const queryString = params.toString();
        card.setAttribute('href', queryString ? `${path}?${queryString}` : path);
    });
}

window.filterMovies = function(genre) {
    selectedGenre = genre;
    applyFilters();
};

window.filterSalong = function (salong) {
    selectedsalong = salong;
    applyFilters();
};

// Toggle hamburger menu
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});


