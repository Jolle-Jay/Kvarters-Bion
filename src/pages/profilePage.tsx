import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';

interface Booking {
  BookingReference: string;
  status: string;
  email: string;
  start_time: string;
  film: string;
  seats: string;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Användare',
    email: 'user@example.com',
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'användare';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    setIsLoggedIn(loggedIn);
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
        setBookings(data);
        setIsBookingsLoading(false);
      })
      .catch(() => {
        setError('Kunde inte hämta bokningar');
        setIsBookingsLoading(false);
      });
  }, [isLoggedIn, userData.email]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCancelBooking = async (bookingReference: string | undefined) => {
    if (!bookingReference || !window.confirm('Vill du verkligen avboka denna bokning?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingReference}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setBookings(prev => prev.map(b =>
          b.BookingReference === bookingReference
            ? { ...b, status: 'Cancelled' }
            : b
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
        <div onClick={() => setShowBookings(prev => !prev)} style={{ cursor: 'pointer' }}>
          <h3>Mina bokningar {showBookings ? '▲' : '▼'}</h3>
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
              {bookings.map((booking) => (
                <li key={booking.BookingReference} className={`booking-item${booking.status === 'Cancelled' ? ' cancelled' : ''}${booking.status === 'Confirmed' ? ' confirmed' : ''}`}>
                  <div>
                    <div className="booking-row">
                      <span className="booking-label">Bokningsnummer:</span>
                      <span className="booking-value">
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

                    {/* Visa platser som Rad: X Sittplats: Y */}
                    {(() => {
                      let row = '', seat = '';
                      if (typeof booking.seats === 'string' && booking.seats.includes('-')) {
                        [row, seat] = booking.seats.split('-');
                      } else if (Array.isArray(booking.seats) && booking.seats.length >= 2) {
                        [row, seat] = booking.seats;
                      } else if (typeof booking.seats === 'string') {
                        row = booking.seats;
                      }
                      return (
                        <>
                          <div className="booking-row"><span className="booking-label">Rad:</span>
                            <span className="booking-value">{row}</span></div>
                          <div className="booking-row"><span className="booking-label">Sittplats:</span>
                            <span className="booking-value">{seat}</span></div>
                        </>
                      );
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
                  {booking.status === 'Confirmed' && (
                    <button onClick={() => handleCancelBooking(booking.BookingReference)}>
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