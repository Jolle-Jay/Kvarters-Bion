import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';
import type { JSX } from 'react';


// Typ för bokningsobjektet
interface Booking {
  bookingReference?: string;
  bookingId?: string;
  film?: string;
  movieTitle?: string;
  viewingTime?: string;
  start_time?: string;
  seats?: string[] | string;
  status?: string;
  [key: string]: any; // tillåter extra fält
}

function ProfilePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false); // är någon inloggad?
  const [isLoading, setIsLoading] = useState(true); //laddar vi data?
  const [userData, setUserData] = useState({
    // Startvärden = Standardvärden som visas innan vi laddat riktiga värden från localStorage

    name: 'Användare',
    email: 'user@example.com',
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // activeDropdowns = Håller koll på vilka dropdowns som är öppna/stängda
  // setActiveDropdowns = Funktion för att öppna/stänga dropdowns
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'användare';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    // localStorage sparar ALLT som text


    // Uppdatera state: Sätt inloggningsstatus till det vi hittade i localStorage
    setIsLoggedIn(loggedIn);
    // Uppdatera state: Sätt användardata till det vi hittade i localStorage
    // Skapar ett nytt objekt med name och email
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
      .catch(err => {
        setError('Kunde inte hämta bokningar');
        setIsBookingsLoading(false);
      });
  }, [isLoggedIn, userData.email]);

  const handleLogout = () => {
    localStorage.clear();
    // Ta bort isLoggedIn, userName, userEmail, etc.

    navigate('/');
  };




  const handleCancelBooking = async (bookingReference: string | undefined) => {
    if (!bookingReference || !window.confirm('Vill du verkligen avboka denna bokning?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingReference}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setBookings(prev => prev.map(b => // loopar igenom alla boknigar i listan
          b.bookingReference === bookingReference //kollar om denna bokning är den vi avbokade
            ? { ...b, status: 'Cancelled' }//om ja, kopiera allt från bokningen och byt status till cancelled
            : b // om nej returnera bokning oförändrad
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
      <p><strong>Namn:</strong> {userData.name}</p>
      <p><strong>E-post:</strong> {userData.email}</p>





      <button onClick={handleLogout}>Logga ut</button>

      <section className="bookings-section">
        <div onClick={() => setShowBookings(prev => !prev)} style={{ cursor: 'pointer' }}>
          <h3>Mina bokningar</h3>
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
                <li key={booking.bookingReference || booking.bookingId} className="booking-item">
                  <div>
                    <b>Bokningsnummer:</b> {booking.bookingReference || booking.bookingId}<br />
                    <b>Film:</b> {booking.film}<br />
                    <b>Tid:</b> {booking.start_time}<br />
                    <b>Platser:</b> {booking.seats}<br />
                    <b>Status:</b> {booking.status}
                  </div>
                  {booking.status === 'Confirmed' && (
                    <button onClick={() => handleCancelBooking(booking.bookingReference || booking.bookingId)}>
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