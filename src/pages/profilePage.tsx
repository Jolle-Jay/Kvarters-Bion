import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';



function ProfilePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false); // är någon inloggad?
  const [isLoading, setIsLoading] = useState(true); //laddar vi data?
  const [userData, setUserData] = useState({
    // Startvärden = Standardvärden som visas innan vi laddat riktiga värden från localStorage

    name: 'Användare',
    email: 'user@example.com',
  });

  // activeDropdowns = Håller koll på vilka dropdowns som är öppna/stängda
  // setActiveDropdowns = Funktion för att öppna/stänga dropdowns
  const [activeDropdowns, setActiveDropdowns] = useState({
    history: false,
    cancellations: false,
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/login');
        if (response.ok) {
          const user = await response.json();
          setIsLoggedIn(true);
          setUserData({ name: `${user.firstName} ${user.lastName}`, email: user.email });
          // Uppdatera localStorage för att vara synkad med backend
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
          localStorage.setItem('userEmail', user.email);
        } else {
          // Inte inloggad på backend, rensa och omdirigera till login
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      } catch (error) {
        console.error('Kunde inte kontrollera inloggningsstatus:', error);
        // Vid fel, anta utloggad och omdirigera
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/login', { method: 'DELETE' });
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
    setActiveDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return <main className="profile-container">Laddar profil...</main>;
  }


  return (
    <main className="profile-container">
      <h2>Min Profil</h2>

      <p><strong>Namn:</strong> {userData.name}</p>
      <p><strong>E-post:</strong> {userData.email}</p>

      <div onClick={() => toggleDropdown('history')}>
        <strong>Historik</strong>
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
