import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginFormData } from '../types/auth.types';
import productsLoader from '../utils/productsLoader';
import '../CSS/Login.css';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

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
      setErrorMessage('Vänligen fyll i e-post och lösenord');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', data.email || formData.email);

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
      {succesMessage && <div className="success-message">{succesMessage}</div>}

      <form onSubmit={handleLogin}>
        <input name="email" value={formData.email} onChange={handleInputChange} />
        <input name="password" type="password" value={formData.password} onChange={handleInputChange} />
        <button type="submit">Logga in</button>
        <Link to="/profile">Avbryt</Link>
      </form>
    </main>
  );
}

LoginPage.route = {
  path: '/login',
  menuLabel: 'login',
  index: 8,
  loader: productsLoader,
};

export default LoginPage;
