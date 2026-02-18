import React, { useState, useEffect } from 'react';
import { data, redirect, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../CSS/profile.css';
import type { LoginFormData } from '../interfaces/Authentication';



function ProfilePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  
  const handleLogout = () => {
    // Tell server to clear session, then clear local state
    (async () => {
      try {
        await fetch('/api/login', { method: 'DELETE' });
      } catch {
        // ignore network errors
      }
      localStorage.clear();
      navigate('/login');
    })();
  };

  return (
    <main className="profile-container">
      <h2>Min Profil</h2>

      <p><strong>E-post:</strong> {email}</p>

      <button onClick={handleLogout} className="btn-primary">
        Logga ut
      </button>
    </main>
  );
}

ProfilePage.route = {
  path: '/profile',
  menuLabel: 'profile',
  index: 7,
};

export default ProfilePage;
