let selectedSeats = [];
const urlParams = new URLSearchParams(window.location.search);
const film = urlParams.get('film') || 'Okänd film';

function generateSeats() {
  const seatsDiv = document.getElementById('seats');
  seatsDiv.innerHTML = '';

  // 1. Här definierar vi vilken salong som ska ritas ut
  const currentSalong = {
    "name": "Stora Salongen",
    "seatsPerRow": [8, 9, 10, 10, 10, 10, 12, 12]
  };

  // Hitta det största antalet säten för att veta hur bred gridden ska vara
  const maxSeats = Math.max(...currentSalong.seatsPerRow);
  seatsDiv.style.setProperty('--max-cols', maxSeats + 2);

  // Dynamisk Grid: Max antal säten + 2 kolumner för radnummer på sidorna
  seatsDiv.style.display = 'grid';

  // 2. Loopa igenom listan 'seatsPerRow'
  currentSalong.seatsPerRow.forEach((numSeats, index) => {
    const row = index + 1;

    // --- Vänster radnummer ---
    const leftLabel = document.createElement('div');
    leftLabel.className = 'row-label';
    leftLabel.textContent = row;
    seatsDiv.appendChild(leftLabel);

    // Beräkna padding för att centrera rader som har färre säten än maxSeats
    const padding = (maxSeats - numSeats) / 2;

    // --- Skapa säten för raden ---
    for (let col = 1; col <= numSeats; col++) {
      const seat = document.createElement('button');

      // Din befintliga logik för VIP/Elder
      if (row === 5 && col >= 4 && col <= 7) {
        seat.className = 'seat vip';
      } else if (row === 3 && col >= 1 && col <= 3) {
        seat.className = 'seat elder';
      } else {
        seat.className = 'seat available';
      }

      // CENTRERINGSLOGIK: 
      // Om det är första sätet i raden, hoppa fram så många steg som 'padding' anger
      if (col === 1) {
        seat.style.gridColumnStart = Math.floor(padding) + 2;
      }

      seat.textContent = col;
      seat.setAttribute('data-row', row);
      seat.setAttribute('data-col', col);
      seat.onclick = () => selectSeat(seat, `${row}-${col}`);
      seatsDiv.appendChild(seat);
    }

    // --- Höger radnummer ---
    const rightLabel = document.createElement('div');
    rightLabel.className = 'row-label';
    rightLabel.textContent = row;

    // Tvinga alltid ut höger label till sista kolumnen i gridden
    rightLabel.style.gridColumnStart = maxSeats + 2;
    seatsDiv.appendChild(rightLabel);
  });
}

function selectSeat(button, seatId) {
  const numPeople = parseInt(document.getElementById('numPeople').value);
  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else if (selectedSeats.length < numPeople) {
    button.classList.add('selected');
    selectedSeats.push(seatId);
  } else {
    alert('Du har redan valt max antal platser.');
  }
}

function confirmBooking() {
  if (selectedSeats.length === 0) {
    alert('Välj minst en plats.');
    return;
  }
  // Mark selected seats as booked
  const seatButtons = document.querySelectorAll('.seat.selected');
  seatButtons.forEach(seat => {
    seat.classList.remove('selected');
    seat.classList.add('booked');
  });
  alert(`Bokning bekräftad för ${film}: ${selectedSeats.join(', ')}`);
  selectedSeats = [];
}

// Navbar active link styling
function initializeNavbar() {
  const navbarLinks = document.querySelectorAll('.navbar nav a, .navbar .nav-links a');
  navbarLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbarLinks.forEach(item => item.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  generateSeats();
  initializeNavbar();

  // Set film title
  const filmTitle = document.getElementById('filmTitle');
  if (filmTitle) {
    filmTitle.textContent = film;
  }
});
