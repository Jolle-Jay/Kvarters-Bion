// Fil: Justerar bokningslänk baserat på vald salong i query.
(function () {
    const params = new URLSearchParams(window.location.search);
    const salongFromQuery = params.get('salong');

    function getTargetFileFromSalongText(text) {
        if (!text) return null;
        const normalized = text.toLowerCase();
        if (normalized.includes('lilla')) return 'booking-small.html';
        if (normalized.includes('stora')) return 'booking.html';
        return null;
    }

    document.querySelectorAll('a.book-btn').forEach(link => {
        const href = link.getAttribute('href') || '';
        const card = link.closest('.showtime-card');
        const locationText = card?.querySelector('.showtime-location')?.textContent?.trim() || '';

        const targetFile = getTargetFileFromSalongText(locationText)
            || getTargetFileFromSalongText(salongFromQuery);

        if (!targetFile) return;

        const updatedHref = href.replace(/booking(-small)?\.html/i, targetFile);
        link.setAttribute('href', updatedHref);
    });
})();
