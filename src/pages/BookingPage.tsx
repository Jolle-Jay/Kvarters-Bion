import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../CSS/booking-styles.css';


// Price per ticket category
const PRICES = {
  adult: 140,
  senior: 120,
  child: 80
};

// Stora Salongen layout
const SALONG_LAYOUT = {
  name: "Stora Salongen",
  seatsPerRow: [8, 9, 10, 10, 10, 10, 12, 12]
};

interface TicketCounts {
  adult: number;
  senior: number;
  child: number;
}

interface SeatProps {
  row: number;
  col: number;
  type: 'available' | 'vip' | 'elder';
  isSelected: boolean;
  isBooked: boolean;
  onClick: () => void;
}

const Seat = ({ row, col, type, isSelected, isBooked, onClick }: SeatProps) => {
  const getClassName = () => {
    let className = 'seat';
    if (isBooked) return `${className} booked`;
    if (isSelected) return `${className} selected`;
    return `${className} ${type}`;
  };

  return (
    <button
      className={getClassName()}
      data-row={row}
      data-col={col}
      onClick={onClick}
      disabled={isBooked}
    >
      {col}
    </button>
  );
};

function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const film = searchParams.get('movie') || 'Okänd film';
  const showtime = searchParams.get('showtime');

  const [counts, setCounts] = useState<TicketCounts>({
    adult: 0,
    senior: 0,
    child: 0
  });

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());

  // Format price to "123,00 kr"
  const formatPrice = (value: number): string => {
    return `${value.toFixed(2).replace('.', ',')} kr`;
  };

  // Get total number of tickets
  const getTotalTickets = (): number => {
    return counts.adult + counts.senior + counts.child;
  };

  // Update ticket count
  const updateCount = (type: keyof TicketCounts, delta: number) => {
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  // Trim selected seats when ticket count decreases
  useEffect(() => {
    const totalTickets = getTotalTickets();
    if (selectedSeats.length > totalTickets) {
      setSelectedSeats(prev => prev.slice(0, totalTickets));
    }
  }, [counts]);

  // Handle seat selection
  const selectSeat = (row: number, col: number) => {
    const seatId = `${row}-${col}`;
    const totalTickets = getTotalTickets();

    if (totalTickets === 0) {
      alert('Välj antal biljetter först.');
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else if (selectedSeats.length < totalTickets) {
      setSelectedSeats(prev => [...prev, seatId]);
    } else {
      alert('Du har redan valt max antal platser.');
    }
  };

  // Confirm booking
  const confirmBooking = () => {
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      alert('Välj antal biljetter först.');
      return;
    }
    if (selectedSeats.length !== totalTickets) {
      alert(`Välj ${totalTickets} platser innan du bekräftar.`);
      return;
    }

    const totalPrice = (counts.adult * PRICES.adult) +
      (counts.senior * PRICES.senior) +
      (counts.child * PRICES.child);

    const bookingData = {
      film,
      showtime,
      seats: selectedSeats,
      counts,
      totalPrice,
      salgon: SALONG_LAYOUT.name
    };

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    navigate('/confirm');

  };

  const totalPrice = (counts.adult * PRICES.adult) +
    (counts.senior * PRICES.senior) +
    (counts.child * PRICES.child);

  return (
    <>
      {/* Ticket selector + summary */}
      <section className="hero">
        <h2>Boka biljetter för: <span id="filmTitle">{film}</span></h2>
        <p>Välj antal biljetter och platser.</p>
        <div className="ticket-layout">
          {/* Panel: Select number of tickets */}
          <div className="ticket-panel">
            <h3>Välj antal biljetter</h3>

            <div className="ticket-row">
              <div className="ticket-label">
                <strong>Ordinarie</strong>
                <span className="ticket-note">Standard</span>
              </div>
              <div className="ticket-controls">
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('adult', -1)}
                  disabled={counts.adult === 0}
                >
                  −
                </button>
                <span className="ticket-count">{counts.adult}</span>
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('adult', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="ticket-row">
              <div className="ticket-label">
                <strong>Pensionär</strong>
                <span className="ticket-note">10% rabatt</span>
              </div>
              <div className="ticket-controls">
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('senior', -1)}
                  disabled={counts.senior === 0}
                >
                  −
                </button>
                <span className="ticket-count">{counts.senior}</span>
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('senior', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="ticket-row">
              <div className="ticket-label">
                <strong>Barn (t.o.m 11 år)</strong>
                <span className="ticket-note">20% rabatt</span>
              </div>
              <div className="ticket-controls">
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('child', -1)}
                  disabled={counts.child === 0}
                >
                  −
                </button>
                <span className="ticket-count">{counts.child}</span>
                <button
                  className="ticket-btn"
                  onClick={() => updateCount('child', 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Panel: Summary */}
          <aside className="ticket-summary">
            <h4>Sammanfattning</h4>
            <div className="summary-row">
              <span>Ordinarie</span>
              <span>{counts.adult} × {formatPrice(PRICES.adult)}</span>
            </div>
            <div className="summary-row">
              <span>Pensionär</span>
              <span>{counts.senior} × {formatPrice(PRICES.senior)}</span>
            </div>
            <div className="summary-row">
              <span>Barn</span>
              <span>{counts.child} × {formatPrice(PRICES.child)}</span>
            </div>
            <div className="summary-total">
              <span>Summa</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </aside>
        </div>
      </section>

      {/* Seat map */}
      <section className="cinema">
        <div className="cinema-header">
          <h3>Salong - Skärm</h3>
          <div className="seat-legend">
            <div className="legend-item">
              <span className="legend-color available"></span>
              <span className="legend-text">Lediga platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color elder"></span>
              <span className="legend-text">Äldre platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color vip"></span>
              <span className="legend-text">VIP platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color unavailable"></span>
              <span className="legend-text">Ej tillgängliga</span>
            </div>
          </div>
        </div>
        <div className="screen">Bio Skärm</div>
        <div
          id="seats"
          className="seats-grid"
        >
          {SALONG_LAYOUT.seatsPerRow.map((numSeats, index) => {
            const row = index + 1;
            return (
              <div key={`row-${row}`} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seat-row-inner">
                  {Array.from({ length: numSeats }, (_, i) => {
                    const col = i + 1;
                    const seatId = `${row}-${col}`;
                    let seatType: 'available' | 'vip' | 'elder' = 'available';

                    if (row === 5 && col >= 4 && col <= 7) {
                      seatType = 'vip';
                    } else if (row === 3 && col >= 1 && col <= 3) {
                      seatType = 'elder';
                    }

                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={seatType}
                        isSelected={selectedSeats.includes(seatId)}
                        isBooked={bookedSeats.has(seatId)}
                        onClick={() => selectSeat(row, col)}
                      />
                    );
                  })}
                </div>
                <div className="row-label">{row}</div>
              </div>
            );
          })}
        </div>
        <button onClick={confirmBooking}>
          Bekräfta bokning
        </button>
      </section>
    </>
  );
};

BookingPage.route = {
  path: '/booking',
  menuLabel: 'booking',
  index: 8,
};

export default BookingPage;
