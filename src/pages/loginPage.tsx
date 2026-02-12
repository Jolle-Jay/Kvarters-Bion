import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginFormData } from '../types/auth.types';
import productsLoader from '../utils/productsLoader';
import '../CSS/Login.css';


function LoginPage() {
  // gör det möjligt att kunna navigera till /profile
  const navigate = useNavigate();

  // Loginformdata TS typ som säger att deft är mail och pass
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });


  //låter error och successmessage vara tomma från början
  const [errorMessage, setErrorMessage] = useState('');
  const [succesMessage, setSuccessMessage] = useState('');

  // funktion som körs VARJE tanget använder skriver i input
  // e = "event objektet" inehåller info om vad som hände
  //e.target det specifika input fält som ändrades
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //DESTRUCURING plockar ut name och value från unput fältet
    const { name, value } = e.target;
    // prev = formdata som det var innan ändring
    // ...prev = kopiera allt från prev (spread operator)
    //[name]: value = uppdata bara det fält som ändrades
    //returnera nya objektet
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // async väntar på API anrop
  // event = info om formulär inlämingen
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    // STOPPA standard beteende (inge omladdning sida) gör allt med JS istället
    event.preventDefault();

    // rensa gamla meddelanden innan inloggning
    setErrorMessage('');
    setSuccessMessage('');
    // error om det inte stämmer med login & password
    if (!formData.email || !formData.password) {
      setErrorMessage('Vänligen fyll i e-post och lösenord');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken');
      return;
    }
    // try = frsök göra detta om mysslickas hoppa till catch
    try {
      const response = await fetch('/api/login', { //HTTP anrop till servern
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();
      // konvertera servernes svar från JSON till JS objekt
      const data = await response.json();
      // localstorage = webbläsarens lagring borta när fliken är
      localStorage.setItem('isLoggedIn', 'true'); // = spara data
      //Data.email email från servern Fdata, email som användaren skrev in
      //om användaren inte skickar tillbaka email använd det användaren skrev
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
        <button type="submit" className="btn-primary">Logga in</button>
        <Link to="/profile" className="btn-primary">Avbryt
        </Link>
      </form>
    </main >
  );
}

LoginPage.route = {
  path: '/login',
  menuLabel: 'login',
  index: 8,
  loader: productsLoader,
};

export default LoginPage;
