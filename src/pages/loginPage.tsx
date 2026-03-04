import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginFormData } from '../types/auth.types';
import '../CSS/Login.css';


function LoginPage() {
  // gör det möjligt att kunna navigera till /profile
  const navigate = useNavigate();

  // Loginformdata är typen/mallen som säger "måste ha email opch pass"
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });


  //låter error och successmessage vara tomma från början
  const [errorMessage, setErrorMessage] = useState('');
  const [succesMessage, setSuccessMessage] = useState('');

  //e har typen React.changevent e = parametern (eventet-objektet) e inehåller vad som skrevs
  // "detta är ett change event från ett input fält"
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //e = inehåller info om vad som hände
    // e.target det HTML element som användaren skrev i
    //e. target.name = vilket fält
    // e.target.value vad användaren skrev
    const { name, value } = e.target;
    //prev tar emot gamla värdet
    // ... sprider ut prev // kopiera allt från gamla objektet
    // [name]: value lägg till / uppdatera ändrafältet
    // })); returnera
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // async väntar på API anrop
  // event har typen FormEvent som triggas när formulär skickas in (submit) /enter
  // If user already has a session on the server, redirect immediately
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/login');
        const data = await resp.json();
        if (resp.ok && !data.error) {
          navigate('/profile');
        }
      } catch {
        // ignore network
      }
    })();
  }, [navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    // utan preventdefault formulär skickas, sidan laddar om, all data försvinner
    event.preventDefault();

    // rensa gamla meddelanden innan inloggning
    setErrorMessage('');
    setSuccessMessage('');
    // error om login & password är tomma
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
      // vänta på svar från backend skicka till /api/
      const response = await fetch('/api/login', {
        method: 'POST',
        //jag skickar JSON format som ett brev
        headers: { 'Content-Type': 'application/json' },
        //konverterar formdata (email & pass) till JSON så att server kan läsa
        body: JSON.stringify(formData),
      });

      //om response inte är ok hoppa direkt till catch
      if (!response.ok) throw new Error();
      //Väntar och läser in JSON som backend skickar och sparar det i data
      const data = await response.json();
      //eftersom response var ok, då sätter vi inloggad till true
      localStorage.setItem('isLoggedIn', 'true');
      // använd data.email från backend om det saknas använd formData (det som user skrev)
      localStorage.setItem('userEmail', data.email || formData.email);
      localStorage.setItem('userName', data.firstName + ' ' + data.lastName);


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
        <input name="email" value={formData.email} onChange={handleInputChange} className="login-input" />
        <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="login-input" />
        <button type="submit" className="btn-primary">Logga in</button>
        <Link to="/registration" className="btn-primary">Registrera</Link>
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
