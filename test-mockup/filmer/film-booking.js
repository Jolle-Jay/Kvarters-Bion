// Fil: Justerar bokningslänk baserat på vald salong i query.
(function () {
    const params = new URLSearchParams(window.location.search);
    const salong = params.get('salong');

    if (!salong) return;

    const targetFile = salong === 'Lilla Salongen'
        ? 'booking-small.html'
        : salong === 'Stora Salongen'
            ? 'booking.html'
            : null;

    if (!targetFile) return;

    document.querySelectorAll('a.book-btn').forEach(link => {
        const href = link.getAttribute('href') || '';
        const updatedHref = href.replace(/booking(-small)?\.html/i, targetFile);
        link.setAttribute('href', updatedHref);
    });
})();
