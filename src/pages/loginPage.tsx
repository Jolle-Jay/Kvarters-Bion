import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData } from '../types/auth.types';
import '../css/login.css';


function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validate inputs
    if (!formData.email || !formData.password) {
      setErrorMessage('Vänligen fyll i e-post och lösenord');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken');
      return;
    }

    try {
      // Send login request to API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      // Save user session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', data.email || formData.email);
      localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);

      setSuccessMessage('Inloggningen lyckades! Omdirigerar...');
      setTimeout(() => navigate('/profile'), 1500);
    } catch {
      setErrorMessage('Ett fel uppstod vid inloggning, försök igen.');
    }
  };

  return (
    <main className="login-container">
      <h2>Logga in</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleLogin}>
        <input
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder='E-post@hotmail.com'
          className="login-input"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder='Lösenord'
          className="login-input"
        />
        <button type="submit" className="btn-primary">Logga in</button>
        <button type="button" className="btn-primary" onClick={() => navigate('/registration')}>
          Registrera
        </button>
      </form>
    </main >
  );
}

LoginPage.route = {
  path: '/login',
  menuLabel: 'login',
  index: 8,
};

export default LoginPage;
