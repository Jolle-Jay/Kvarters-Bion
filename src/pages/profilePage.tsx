import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/Profile.css';
import '../CSS/Login.css';
import type { Booking } from '../interfaces/History';
import type { JSX } from 'react';




function ProfilePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false); // är någon inloggad?
  const [isLoading, setIsLoading] = useState(true); //laddar vi data?
  const [userData, setUserData] = useState({
    // Startvärden = Standardvärden som visas innan vi laddat riktiga värden från localStorage

    name: 'Användare',
    email: 'user@example.com',
  });

  const [bookings, setBookings] = useState<Booking[]>([]); // State för historik
  const [loadingBookings, setLoadingBookings] = useState(false); // State för loading-status
  const [bookingError, setBookingError] = useState<string | null>(null); // State för fel vid hämtning

  // activeDropdowns = Håller koll på vilka dropdowns som är öppna/stängda
  // setActiveDropdowns = Funktion för att öppna/stänga dropdowns
  const [activeDropdowns, setActiveDropdowns] = useState({
    history: false,
    cancellations: false,
  });

  // Fetch bookings when history dropdown is opened
   const fetchBookings = async () => {
    if (bookings.length > 0) return;

    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      setBookingError("Ingen användare hittades");
      return;
    }

    setLoadingBookings(true);
    setBookingError(null);

    try {
      const url = `api/bookings/user?email=${userEmail}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setBookingError('Misslyckades att hämta bokningshistorik');
        setBookings([]);
        return;
      }

      if (data?.error) {
        setBookingError(data.error);
        setBookings([]);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }

    } catch (err) {
      setBookingError("Fel vid hämtning");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // verify backend session as well as localStorage in case of stale state
      try {
        const resp = await fetch('/api/login');
        const data = await resp.json();
        if (resp.ok && !data.error) {
          setIsLoggedIn(true);
          setUserData({
            name: data.name || localStorage.getItem('userName') || 'användare',
            email: data.email || localStorage.getItem('userEmail') || '',
          });
          // keep localStorage in sync
          localStorage.setItem('isLoggedIn', 'true');
          if (data.email) localStorage.setItem('userEmail', data.email);
          if (data.name) localStorage.setItem('userName', data.name);
        } else {
          // no user on server session, fall back to local storage or mark logged out
          const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
          const userName = localStorage.getItem('userName') || 'användare';
          const userEmail = localStorage.getItem('userEmail') || '';

          setIsLoggedIn(loggedIn);
          setUserData({ name: userName, email: userEmail });
        }
      } catch {
        // network error, just use whatever we have locally
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName') || 'användare';
        const userEmail = localStorage.getItem('userEmail') || '';

        setIsLoggedIn(loggedIn);
        setUserData({ name: userName, email: userEmail });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);


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

  // key = vilken dropdown som klickas på
  const toggleDropdown = (key: 'history' | 'cancellations') => {
    //prev = cad actideDrop var INNAN KLICK
    //...prev = kopiera ALLT från prev
    // key  = computed property, använd värdet key som history tex.
    if (key === 'history' && !activeDropdowns.history) {
      // Fetch bookings when opening history dropdown
      fetchBookings();
    }
    setActiveDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
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

      <div className="dropdown-section">
        <div onClick={() => toggleDropdown('history')} style={{ cursor: 'pointer', marginBottom: '10px' }}>
          <strong>Historik {activeDropdowns.history ? '▲' : '▼'}</strong>
        </div>
        
        {activeDropdowns.history && (
          <div className="history-list" style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
            {loadingBookings ? (
              <p>Laddar bokningshistorik...</p>
            ) : bookingError ? (
              <p style={{ color: 'red' }}>{bookingError}</p>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{booking.movieTitle}</p>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                    {new Date(booking.date).toLocaleDateString('sv-SE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                    Bokningsreferens: {booking.BookingReference}
                  </p>
                  {booking.seats && (
                    <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                      Platser: {booking.seats}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '0.85em', color: '#999' }}>
                    Status: {booking.status}
                  </p>
                </div>
              ))
            ) : (
              <p>Inga tidigare bokningar hittades.</p>
            )}
          </div>
        )}
      </div>

      <div onClick={() => toggleDropdown('cancellations')}>
        <strong>Avbokningar</strong>
      </div>

      <button onClick={handleLogout}>Logga ut</button>
    </main>
  );
}

ProfilePage.route = {
  path: '/profile',
  menuLabel: 'profile',
  index: 7,
};

export default ProfilePage;
