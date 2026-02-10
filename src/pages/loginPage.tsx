import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/Login.css';


interface LoginFormData {
  email: string;
  password: string;
  name: string;
  lastName: string;
  role: string;
}

//create a componenet called Login
const Login: React.FC = () => {
  //make a hook so I can navigate
  const navigate = useNavigate();
  //update what the user inputs
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    name: '',
    lastName: '',
    role: '',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [succesMessage, setSuccessMessage] = useState<string>('');

  // handle input changes every time user tpes in an input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        throw new Error('Login failed!');
      }
      const data = await response.json();

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', data.email || formData.email);
      localStorage.setItem('userName', data.name || formData.name);

      setSuccessMessage('Inloggningen lyckades! Omdirigerar...');



      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setErrorMessage('Ett fel uppstod vid inloggning, försök igen.');
      console.error('Login error:', error);
    }
  };

  return (
    <main className="login-container">
      <h2>Logga in</h2>

      {errorMessage && (
        <div className="error-message" style={{ display: 'block' }}>
          {errorMessage}
        </div>
      )}

      {succesMessage && (
        <div className="success-message" style={{ display: 'block' }}>
          {succesMessage}
        </div>
      )}

      <form id="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">E-post</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder='din@epost.com'
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor="password">Lösenord:</label>
          <input
            type="password"
            id='password'
            name='password'
            placeholder='Ange ditt lösenord'
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="login-actions">
          <button type="submit" className="btn btn-primary">
            Logga in
          </button>
          <Link to="/profile" className="btn btn-secondary">
            Avbryt
          </Link>
        </div>
      </form>
    </main>
  );





};

export default Login;