import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/profile.css';

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


};