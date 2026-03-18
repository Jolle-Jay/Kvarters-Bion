import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/confirmStyles.css';

// making a interface to have something to devide how bookingData should look so TS can check if right data is being sent 
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
  //  navigate to arrive in different pages in the react app 
  const navigate = useNavigate();
  // makes bookingId is a generic string and have a empty value to start with 
  const [bookingId, setBookingId] = useState<string>('');
  // does that bookingData is generic or null, starts with being null
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);

  // ref to hinder double calls in React.StrictMode 
  const effectRan = useRef(false);


  const hasBooked = useRef(false);
  // fetch the value from localstorage and checks if the string is True/false save is loggedIn and then change in usestate 
  useEffect(() => {
    // in strictmode this is run twice
    // this ref-control insures that the booking is only created once 
    if (effectRan.current === true) return;

    // bookingData and  session storage are the saved choices of the user in bookingPage 
    //its later saved it storedData
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      //no booking data? Be returned to /booking
      navigate('/booking');
      return;
    }

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    //converts JSON text to JS object and saves the result in the variabel data
    const data: BookingData = JSON.parse(storedData);
    // update useState with objektet data
    setBookingData(data);

    // if not signed in show guest formular where the user has to enter email 
    if (!loggedIn) {
      setShowGuestForm(true);
    } else {
      // if logged in already create booking directly with data from sessionstorage , email is knows from login 
      const email = localStorage.getItem('userEmail');
      if (!email) {
        alert('Email saknas, logga in igen');
        return;
      }
      if (!hasBooked.current) {
        hasBooked.current = true;
        createBooking(data, email);
      }
    }

    // Cleanup-function runs when the component "unmounts".
    // I StrictMode it means ref:en is put to true after first run 
    return () => { effectRan.current = true; };

  }, []);

  //genererate unique booking ID
  const generateBookingId = (): string => {
    return `KB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  //booking is being ready to post to backend 
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



    // send a post request to  api/custombooking 
    // await waits for answer from backend ex 200 or 500 etc 
    // remake body to JSON format with all data 
    const response = await fetch('/api/customBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: id,
        email,
        film: data.film,
        viewing: data.viewing,
        seats: data.seats,
        counts: data.counts,
        totalPrice: data.totalPrice,
        lounges: data.lounges
      })
    });

    //used for debugging
    console.log('Bokning skapad:', {
      bookingId: id,
      email,
      ...data
    });
  };

  // handle guest bookings 
  // e contains information of the formular 
  // e.preventdefault makes so when we klick book then everything doesnt dissapear in refresh 
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestEmail || !guestEmail.includes('@')) {
      alert('Ange en giltig e-postadress');
      return;
    }

    // if bookingdata is null then stop everything
    if (!bookingData) return;

    // populate createbooking with bookingdata and guest email and is sent to backend 
    createBooking(bookingData, guestEmail);
    // hide formular and show the confirmation formular instead 
    setShowGuestForm(false);
  };

  // if the guest formula is shown
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

  // if no bookingdata return
  if (!bookingData || !bookingId) {
    return (
      <main className='confirm-container'>
        <p>Laddar bokning...</p>
      </main>
    );
  }

  //show tickets
  return (
    <main className="confirm-container">
      <div className="bookingMsg">
        <h1 className="booking-title">Tack för din bokning!</h1>
        <p>Din bokning är nu bekräftad. Ta med ditt boknings-Id till kassan minst 15 minuter innan bion börjar för betalning och köp av snacks.</p>
        <p>Vi ses på kvartersbion. Njut av filmen!</p>
        <p className="booking-id">Bokningsnummer: {bookingId}</p>
      </div>



      {bookingData.seats.map((seat, index) => {
        const [row, col] = seat.split('-');
        return (
          <div key={seat} className="ticket">
            <div className="ticketTextArea">
              <h1 className="ticketTextTitle"><u>{bookingData.film}</u></h1>
              <p className="ticketTextSeat">{bookingData.lounges}, Rad {row}, Plats {col}</p>
              <p className="ticketTextTime">{bookingData.viewing}</p>
            </div>
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
