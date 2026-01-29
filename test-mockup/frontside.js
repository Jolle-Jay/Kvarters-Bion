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

// Custom date picker for 2025 only
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('.filter-date');
    
    if (dateInput) {
        // Set default value to current month and date in 2025
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `2025-${month}-${day}`;
        
        dateInput.addEventListener('focus', function() {
            this.style.color = 'transparent';
        });
        
        dateInput.addEventListener('input', function() {
            // Show the selected date immediately
            if (this.value) {
                this.style.color = '#FFD700';
            }
        });
        
        dateInput.addEventListener('blur', function() {
            if (this.value) {
                this.style.color = '#FFD700';
            }
        });
        
        // Validate input to only allow 2025
        dateInput.addEventListener('change', function() {
            const date = new Date(this.value);
            if (date.getFullYear() !== 2025) {
                this.value = '';
                this.style.color = 'transparent';
                alert('Endast datum från 2025 är tillåtna');
            } else {
                this.style.color = '#FFD700';
            }
        });
    }
});

// Add smooth transition
const style = document.createElement('style');
style.textContent = `
    .carousel img {
        transition: transform 0.3s ease, filter 0.3s ease;
    }
`;
document.head.appendChild(style);

