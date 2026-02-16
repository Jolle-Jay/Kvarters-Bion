import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';
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

  // activeDropdowns = Håller koll på vilka dropdowns som är öppna/stängda
  // setActiveDropdowns = Funktion för att öppna/stänga dropdowns
  const [activeDropdowns, setActiveDropdowns] = useState({
    history: false,
    cancellations: false,
  });

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

  const handleLogout = () => {
    localStorage.clear();
    // Ta bort isLoggedIn, userName, userEmail, etc.

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

  if (!isLoggedIn) {
    return (
      <main className="profile-container">
        <h2>Du är inte inloggad</h2>
        <Link to="/login">Logga in</Link>
        <Link to="/register">Registrera</Link>
      </main>
    );
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
