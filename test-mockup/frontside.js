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

// Add smooth transition
const style = document.createElement('style');
style.textContent = `
    .carousel img {
        transition: transform 0.3s ease, filter 0.3s ease;
    }
`;
document.head.appendChild(style);

