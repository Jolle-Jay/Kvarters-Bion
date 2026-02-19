import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/confirmStyles.css';

interface BookingData {
  film: string;
  viewing: string;
  seats: string[];
  counts: {
    adult: number;
    senior: number;
    child: number;
  };
  totalPrice: number;
  lounges: string;
}

function ConfirmationPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string>('');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);

  //kolla om användare är inloggad
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    //spara användarens val i bookingPage genom getItem och sparar det i storedData
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      //ingen booking data, omdirigera tillbaka
      navigate('/booking');
      return;
    }

    //konverterar JSON text till JS objekt och sparar resultet i variabeln data
    const data: BookingData = JSON.parse(storedData);
    // uppdaterar useState med objektet data
    setBookingData(data);

    //om inte inloggad visa gäst formulär där user måste skriva in email
    if (!loggedIn) {
      setShowGuestForm(true);
    } else {
      // om inloggad skapa bokning direkt med data från sessionstorage, vet redan email från inloggad användare
      const email = localStorage.getItem('userEmail');
      if (!email) {
        alert('Email saknas, logga in igen');
        return;
      }
      createBooking(data, email);
    }
  }, []);

  //generera unikt booking ID
  const generateBookingId = (): string => {
    return `KB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  //skicka bokining till backend
  const createBooking = async (data: BookingData, email: string) => {
    const id = generateBookingId();
    setBookingId(id);

    const payload = {
      bookingId: id,
      email,
      film: data.film,
      viewing: data.viewing,
      seats: data.seats,
      counts: data.counts,
      totalPrice: data.totalPrice,
      lounges: data.lounges
    };

    console.log('=== SENDING TO BACKEND ===');
    console.log(payload);
    console.log('=========================');
    
    try {
      const response = await fetch('/api/customBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        alert('Fel vid bokning: ' + (responseData.error || response.statusText));
        return;
      }

      if (responseData.error) {
        alert('Fel vid bokning: ' + responseData.error);
        return;
      }

      console.log('✅ Bokning skapad framgångsrikt:', {
        bookingId: id,
        email,
        ...data
      });

      // Visa success message - komponenten uppdateras automatiskt med bookingId
      alert(`✅ Bokning bekräftad! Bokningsnummer: ${id}\n\nBokningsbekräftelse skickad till: ${email}`);
    } catch (error) {
      console.error('❌ Fel vid sending av bokning:', error);
      alert('Fel vid sending av bokning: ' + error);
    }
  };

  // hantera inlämning av gäst bokningar
  // e inehåller information om formuläret
  //e.preventdefault gör att när vi klickar boka så försvinner inte all data i refresh
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestEmail || !guestEmail.includes('@')) {
      alert('Ange en giltig e-postadress');
      return;
    }

    // in bookingdata är null så stoppa functionen direkt
    if (!bookingData) return;

    //lägger in bookingData och gästemail i createBooking som skickas till backend/databas
    createBooking(bookingData, guestEmail);
    // göm formuläret igen och visar konfirmations formuläret istället
    setShowGuestForm(false);
  };

  // om gäst formuläret visas
  if (showGuestForm && bookingData) {
    return (
      <main className='confirm-container'>
        <div className='guest-form-container'>
          <h2>Slutför din bokning</h2>
          <p>Ange din e-post för att få bokningsbekräftelse</p>

          <div className="booking-summary">
            <h3>Sammanfattning</h3>
            <p><strong>Film:</strong> {bookingData.film}</p>
            <p><strong>Salong:</strong> {bookingData.lounges}</p>
            <p><strong>Tid:</strong> {bookingData.viewing}</p>
            <p><strong>Platser:</strong> {bookingData.seats.join(', ')}</p>
            <p><strong>Antal biljetter:</strong></p>
            {bookingData.counts.adult > 0 && <p>• Ordinarie: {bookingData.counts.adult}</p>}
            {bookingData.counts.senior > 0 && <p>• Pensionär: {bookingData.counts.senior}</p>}
            {bookingData.counts.child > 0 && <p>• Barn: {bookingData.counts.child}</p>}
            <p className="total-price"><strong>Totalt:</strong> {bookingData.totalPrice.toFixed(2).replace('.', ',')} kr</p>
          </div>

          <form onSubmit={handleGuestSubmit} className="guest-form">
            <label htmlFor="email">E-postadress</label>
            <input
              type="email"
              id="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="din@email.se"
              required
            />
            <button type="submit" className="confirm-btn">
              Bekräfta och betala {bookingData.totalPrice.toFixed(2).replace('.', ',')} kr
            </button>
          </form>
        </div>
      </main>
    );
  }

  //om ingen bokningsData
  if (!bookingData || !bookingId) {
    return (
      <main className='confirm-container'>
        <p>Laddar bokning...</p>
      </main>
    );
  }

  //Visa biljetter
  return (
    <main className="confirm-container">
      <div className="bookingMsg">
        <h1>Bokning Klar!</h1>
        <p className="booking-id">Bokningsnummer: {bookingId}</p>
      </div>



      {bookingData.seats.map((seat, index) => {
        const [row, col] = seat.split('-');
        return (
          <div key={seat} className="ticket">
            <h1 className="ticketTextTitle"><u>{bookingData.film}</u></h1>
            <p className="ticketTextSeat">{bookingData.lounges}, Rad {row}, Plats {col}</p>
            <p className="ticketTextTime">{bookingData.viewing}</p>
          </div>
        );
      })}
    </main>
  );
}

ConfirmationPage.route = {
  path: '/confirm',
  menuLabel: 'confirm',
  index: 10,

};

export default ConfirmationPage;


