import React, { use, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginFormData } from '../interfaces/Authentication';
import '../CSS/Login.css';

export default function LoginPage(){

    const [formData, setFormData] = useState<LoginFormData>({
      email: '',
      password: ''
    });

    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [succesMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setErrorMessage('');
      setSuccessMessage('');
      if (!formData.email || !formData.password) {
        setErrorMessage('Vänligen fyll i alla fält!');
        return;
      }
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) throw new Error();
        const data = await response.json();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.firstName + ' ' + data.lastName);

        setSuccessMessage('Inloggning lyckades! Omdirigerar...');
        setTimeout(() => navigate('/profile'), 1500);
      } catch {
        setErrorMessage('Ett fel uppstod vid inloggning, försök igen.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };

   if (succesMessage) {
    return <div className="success-message">{succesMessage}</div>;
  }

  return (
    <main className="login-container">
      <h2>Logga in</h2>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <form onSubmit={handleLogin}>
        <label htmlFor="email">E-post:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Epost@hotmail.com"
          autoComplete="email"
        />

        <label htmlFor="password">Lösenord:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Lösenord"
          autoComplete="current-password"
        />

        <button type="submit" className="btn-primary">
          Logga in
        </button>

        <Link to="/registration" className="btn-primary">
          Registrera
        </Link>
      </form>
    </main>
  );
}

  LoginPage.route = {
  path: '/login',
  menuLabel: 'login',
  index: 8,

}
