import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/profile.css';
import type { JSX } from 'react';


// Type for booking objekt
interface Booking {
  bookingReference?: string;
  bookingId?: string;
  film?: string;
  movieTitle?: string;
  viewingTime?: string;
  start_time?: string;
  seats?: string[] | string;
  status?: string;
  [key: string]: any; // allows extra fields 
}

function ProfilePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false); // is someone logged in
  const [isLoading, setIsLoading] = useState(true); //is we loading data
  const [userData, setUserData] = useState({
    // StartValue = standardValue that shows before loading real value from localStorage

    name: 'Användare',
    email: 'user@example.com',
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // activeDropdowns = Keeps track on what deopdown is opened and closed
  // setActiveDropdowns = Function for open and closing dropdowns
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'användare';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    // localStorage saves EVERYTHING as text 


    // Uppdate state: Set logged in status to what we found in localStorage
    setIsLoggedIn(loggedIn);
    // Uppdate state: Set userData to what we found in localStorage
    // Create a new objekt with name and emial
    setUserData({ name: userName, email: userEmail });



    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userData.email) return;
    setIsBookingsLoading(true);
    fetch(`/api/bookings?where=email=${userData.email}`)
      .then(res => {
        if (!res.ok) throw new Error('Kunde inte hämta bokningar');
        return res.json();
      })
      .then(data => {
        const sortedBookings = data.sort(
          (a: Booking, b: Booking) =>
            new Date(b.start_time ?? '').getTime() - new Date(a.start_time ?? '').getTime()
        );

        setBookings(sortedBookings);
        setIsBookingsLoading(false);
      })
      .catch(err => {
        setError('Kunde inte hämta bokningar');
        setIsBookingsLoading(false);
      });
  }, [isLoggedIn, userData.email]);

  const handleLogout = async () => {
    // call backend to clear session
    try {
      await fetch('/api/login', { method: 'DELETE' });
    } catch {
      // ignore network errors, we'll clear local state anyway
    }

    // clear frontend state & localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);

    navigate('/');
  };




  const handleCancelBooking = async (bookingReference: string | undefined) => {
    if (!bookingReference || !window.confirm('Vill du verkligen avboka denna bokning?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingReference}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setBookings(prev => prev.map(b => // looping all bookings in the list
          b.BookingReference === bookingReference //Cheking if this booking is what we canceld 
            ? { ...b, status: 'Cancelled' }// if yes, copy all from the booking change the staus to cancelled
            : b // if no return booking unchanged
        ));
      } else {
        alert(result.error || 'Kunde inte avboka bokning');
      }
    } catch {
      alert('Kunde inte avboka bokning');
    }
  };

  if (isLoading) {
    return <main className="profile-container">Laddar profil...</main>;
  }

  if (!isLoggedIn) {
    return (
      <main className="profile-container">
        <h2>Du är inte inloggad</h2>
        <div className="login-register-row">
          <div className="login-register-box">
            <Link to="/login">Logga in</Link>
          </div>
          <div className="login-register-box">
            <Link to="/registration">Registrera</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-container">
      <h2>Min Profil</h2>
      <hr className="profile-divider" />
      <button className="logout-btn" onClick={handleLogout}>Logga ut</button>
      <p className="container-name"><strong>Namn:</strong> {userData.name}</p>
      <p className="container-name"><strong>E-post:</strong> {userData.email}</p>


      <section className="bookings-section">
        <div onClick={() => setShowBookings(prev => !prev)}
          className="bookings-toggle-row"
        >
          <div className="bookings-toggle-row">
            <h3 className="section-title">Mina bokningar</h3>

            <svg
              className={`toggle-icon ${showBookings ? "open" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        {showBookings && (
          isBookingsLoading ? (
            <p>Laddar bokningar...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : bookings.length === 0 ? (
            <p>Du har inga bokningar.</p>
          ) : (
            <ul className="bookings-list">
              {[...bookings]
                .sort((a, b) => new Date(b.start_time ?? '').getTime() - new Date(a.start_time ?? '').getTime())
                .map((booking) => (
                  <li key={booking.BookingReference} className={`booking-item${booking.status === 'Cancelled' ? ' cancelled' : ''}${booking.status === 'Confirmed' ? ' confirmed' : ''}`}>
                    <div>
                      <div className="booking-row">
                        <span className="booking-label">Bokningsnummer:</span>
                        <span className="booking-number">
                          {booking.BookingReference}
                        </span>
                      </div>
                      <div className="booking-row">
                        <span className="booking-label">Film:</span>
                        <span className="booking-value">
                          {booking.film}
                        </span>
                      </div>
                      <div className="booking-row">
                        <span className="booking-label">Datum:</span>
                        <span className="booking-value">
                          {booking.start_time?.split('T')[0]}
                        </span>
                      </div>
                      <div className="booking-row">
                        <span className="booking-label">Tid:</span>
                        <span className="booking-value">
                          {booking.start_time?.split('T')[1]}
                        </span>
                      </div>

                      {/* Show rows as: X seats as: Y */}
                      {(() => {
                        const seatsByRow: Record<string, string[]> = {};
                        (booking.seats as string)?.split(',').forEach((seat: string) => {
                          const [row, number] = seat.trim().split('-');
                          if (!seatsByRow[row]) seatsByRow[row] = [];
                          seatsByRow[row].push(number);
                        });
                        return Object.entries(seatsByRow).map(([row, numbers], index) => (
                          <React.Fragment key={index}>
                            <div className="booking-row">
                              <span className="booking-label">Rad:</span>
                              <span className="booking-value">{row}</span>
                            </div>
                            <div className="booking-row">
                              <span className="booking-label">Sittplats:</span>
                              <span className="booking-value">{numbers.join(', ')}</span>
                            </div>
                          </React.Fragment>
                        ));
                      })()}
                      <div className="booking-row">
                        <span className="booking-label">Status:</span>
                        <span className="booking-value">
                          {booking.status === "Confirmed"
                            ? "Bekräftad"
                            : booking.status === "Cancelled"
                              ? "Avbokad"
                              : booking.status}
                        </span>
                      </div>
                    </div>
                    {booking.status === 'Confirmed' && booking.start_time && new Date(booking.start_time) > new Date() && (
                      <button className="cancel-btn" onClick={() => handleCancelBooking(booking.BookingReference)}>
                        Avboka
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          )
        )}
      </section>
    </main>
  );
}

ProfilePage.route = {
  path: '/profile',
  menuLabel: 'profile',
  index: 7,
};

export default ProfilePage;