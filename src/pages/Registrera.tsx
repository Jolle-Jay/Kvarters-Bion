import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterFormData } from '../interfaces/Register';
import '../css/login.css';


function RegistreraPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    // State for error and success messages
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Clear previous messages
        setErrorMessage('');
        setSuccessMessage('');

        // Validate inputs
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            setErrorMessage('Vänligen fyll i alla fält!');
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage('Lösenordet måste vara minst 6 tecken');
            return;
        }

        try {
            // Send registration request
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error();

            const data = await response.json();

            // Save user session
            localStorage.setItem('isLoggedIn', 'true');
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
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleRegister}>
                <p>E-post:</p>
                <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Epost@hotmail.com'
                    className="login-input"
                />
                <p>Lösenord:</p>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder='Lösenord'
                    className="login-input"
                />
                <p>Namn:</p>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder='Karl'
                    className="login-input"
                />
                <p>Efternamn:</p>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Karlsson'
                    className="login-input"
                />
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
