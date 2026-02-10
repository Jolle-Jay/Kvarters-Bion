import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';
import { UserData } from '../types/auth.types';
import productsLoader from '../utils/productsLoader';
import { getHelpers } from '../utils/productPageHelpers';

profilePage.route = {
  path: '/',
  menuLabel: 'profile',
  index: 7,
  parent: '/',
  loader: productsLoader
};

export default function profilePage() {

  interface UserData {
    name: string;
    email: string;
  }

  //make profile component
  const Profile: React.FC = () => {
    //get the page changer tool
    const navigate = useNavigate();
    //track login status
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    //store user info
    const [userData, setUserData] = useState<UserData>({
      name: 'Användare',
      email: 'user@example.com',
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeDropdowns, setActiveDropdowns] = useState<{
      history: Boolean;
      cancellations: Boolean;
    }>({
      history: false,
      cancellations: false,
    });

    useEffect(() => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userName = localStorage.getItem('userName') || 'användare';
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

      setIsLoggedIn(loggedIn);
      setUserData({
        name: userName,
        email: userEmail,
      });
      setIsLoading(false);
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      navigate('/');
    };

    const toggleDropdown = (dropdown: 'history' | 'cancellations') => {
      setActiveDropdowns((prev) => ({
        ...prev,
        [dropdown]: !prev[dropdown],
      }));
    };

    if (isLoading) {
      return (
        <main className="profile-container">
          <div id="profile-loading"> Laddar profil...</div>
        </main>
      );
    }

    if (!isLoggedIn) {
      return (
        <main className='profile-container'>
          <div className='"not-logged-in'>
            <h2>Du är inte inloggad</h2>
            <p>Vänligen logga in för att se din profil</p>
            <div className="profile-actions">
              <Link to="/login" className="btn btn-primary">
                Logga in
              </Link>
              <Link to="/" className='btn btn-secondary'>
                Gå till hem
              </Link>
            </div>
          </div>
        </main>
      );

    }

    return (
      <main className="profile-container">
        <h2>Min Profil</h2>

        <div className="profile-info">
          <strong>Namn:</strong>
          <p>{userData.name}</p>
        </div>

        <div className="profile-info">
          <strong>E-post:</strong>
          <p>{userData.email}</p>
        </div>

        <div className="profile-info">
          <strong>Efternamn:</strong>
          <p>{userData.name}</p>
        </div>

        <div className="profile-info">
          <strong>Biljettyp</strong>
          <p>Vuxen</p>
        </div>

        <div
          className={`profile-info-drop ${activeDropdowns.history ? 'active' : ''}`}
          onClick={() => toggleDropdown('history')}
        >
          <strong>Historik</strong>
          <p>Din historik</p>
        </div>

        <div
          className={`profile-info-drop ${activeDropdowns.cancellations ? 'active' : ''}`}
          onClick={() => toggleDropdown('cancellations')}
        >
          <strong>Avbokningar</strong>
          <p>Dina avbokningar</p>
        </div>

        <div className="profile-actions">
          <Link to="/" className="btn btn-secondary">
            Tillbaka till hem
          </Link>
          <button onClick={handleLogout} className="btn btn-logout">
            Logga ut
          </button>
        </div>
      </main>
    );

  };
};

