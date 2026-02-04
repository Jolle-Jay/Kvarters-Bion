let selectedSeats = [];
const urlParams = new URLSearchParams(window.location.search);
const film = urlParams.get('film') || 'Okänd film';

function generateSeats() {
  const seatsDiv = document.getElementById('seats');
  seatsDiv.innerHTML = '';

  const currentSalong = {
    "name": "Stora Salongen",
    "seatsPerRow": [8, 9, 10, 10, 10, 10, 12, 12]
  };

  const maxSeats = Math.max(...currentSalong.seatsPerRow);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  seatsDiv.style.display = 'grid';
  // Don't set gridTemplateColumns - let CSS media queries handle it

  if (isMobile) {
    seatsDiv.style.setProperty('gap', '3px', 'important');
    seatsDiv.style.setProperty('padding', '5px', 'important');
  } else {
    seatsDiv.style.gap = '0.5rem';
    seatsDiv.style.padding = '0';
  }

  currentSalong.seatsPerRow.forEach((numSeats, index) => {
    const row = index + 1;

    const leftLabel = document.createElement('div');
    leftLabel.className = 'row-label';
    leftLabel.textContent = row;

    seatsDiv.appendChild(leftLabel);

    const padding = (maxSeats - numSeats) / 2;

    for (let col = 1; col <= numSeats; col++) {
      const seat = document.createElement('button');

      if (row === 5 && col >= 4 && col <= 7) {
        seat.className = 'seat vip';
      } else if (row === 3 && col >= 1 && col <= 3) {
        seat.className = 'seat elder';
      } else {
        seat.className = 'seat available';
      }

      // Let CSS media queries handle responsive sizing
      if (col === 1) {
        seat.style.gridColumnStart = Math.floor(padding) + 2;
      }

      seat.textContent = col;
      seat.setAttribute('data-row', row);
      seat.setAttribute('data-col', col);
      seat.onclick = () => selectSeat(seat, `${row}-${col}`);
      seatsDiv.appendChild(seat);
    }

    const rightLabel = document.createElement('div');
    rightLabel.className = 'row-label';
    rightLabel.textContent = row;

    rightLabel.style.gridColumnStart = maxSeats + 2;
    seatsDiv.appendChild(rightLabel);
  });
}

// Re-generate seats when window is resized
window.addEventListener('resize', generateSeats);

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

// Re-generate seats when window is resized
window.addEventListener('resize', generateSeats);
