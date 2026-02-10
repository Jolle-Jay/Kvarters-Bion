import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';
import productsLoader from '../utils/productsLoader';

function ProfilePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Användare',
    email: 'user@example.com',
  });

  const [activeDropdowns, setActiveDropdowns] = useState({
    history: false,
    cancellations: false,
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'användare';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

    setIsLoggedIn(loggedIn);
    setUserData({ name: userName, email: userEmail });
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleDropdown = (key: 'history' | 'cancellations') => {
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
  loader: productsLoader,
};

export default ProfilePage;
