import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterFormData } from '../interfaces/Register';
import '../css/login.css';


function RegistreraPage() {
    const navigate = useNavigate();

    // Registerformdata är typen/mallen som säger "måste ha email, password, name och lastname"
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
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
    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        // utan preventdefault formulär skickas, sidan laddar om, all data försvinner
        event.preventDefault();

        // rensa gamla meddelanden innan inloggning
        setErrorMessage('');
        setSuccessMessage('');
        // error om något fält är tomt
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            setErrorMessage('Vänligen fyll i alla fält!');
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage('Lösenordet måste vara minst 6 tecken');
            return;
        }
        // try = frsök göra detta om mysslickas hoppa till catch
        try {
            // vänta på svar från backend skicka till /api/
            const response = await fetch('/api/users', {
                method: 'POST',
                //jag skickar JSON format som ett brev
                headers: { 'Content-Type': 'application/json' },
                //konverterar hela formData-objektet till JSON så att servern kan läsa det
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                }),
            });

            //om response inte är ok hoppa direkt till catch
            if (!response.ok) throw new Error();
            //Väntar och läser in JSON som backend skickar och sparar det i data
            const data = await response.json();
            //eftersom response var ok, då sätter vi inloggad till true
            //local storage inbyggt objeklt i alla moderna webbläsare lagara data till cache rensad
            //setItem inbyggs metod på local storage, sparar data som nyckel värde par
            localStorage.setItem('isLoggedIn', 'true');
            // använd data.email från backend om det saknas använd formData (det som user skrev)
            localStorage.setItem('userEmail', data.email || formData.email);
            localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);

            setSuccessMessage('Registrering lyckades! Omdirigerar...');
            setTimeout(() => navigate('/profile'), 1500);
        } catch {
            setErrorMessage('Ett fel uppstod vid registrering, försök igen.');
        }
    };

    return (
        <main className="login-container">
            <h2>Registrering</h2>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {succesMessage && <div className="success-message">{succesMessage}</div>}

            <form onSubmit={handleRegister}>
                <p>E-post:</p>
                <input name="email" value={formData.email} onChange={handleInputChange} placeholder='Epost@hotmail.com' className="login-input" />
                <p>Lösenord:</p>
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder='Lösenord' className="login-input" />
                <p>Namn:</p>
                <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder='Karl' className="login-input" />
                <p>Efternamn:</p>
                <input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder='Karlsson' className="login-input" />
                <button type="submit" className="btn-primary">Registrera</button>
                <Link to="/" className="btn-primary">Avbryt</Link>
            </form>
        </main >
    );
}

RegistreraPage.route = {
    path: '/registration',
    menuLabel: 'registration',
    index: 9,
};

export default RegistreraPage;
