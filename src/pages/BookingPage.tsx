import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'; // får film ID och URL från bokingen
import '../CSS/booking-styles.css';
import { Prev } from 'react-bootstrap/esm/PageItem';

// pris per kategori för biljetter
const PRICES = {
  adult: 140,
  senior: 120,
  child: 80
};

// Stora Salongen layout
const SALONG_LAYOUT = {
  'Stora Salongen': {
    name: "Stora Salongen",
    loungeId: 1,
    seatsPerRow: [8, 9, 10, 10, 10, 10, 12, 12]
  },
  'Lilla Salongen': {
    name: "Lilla Salongen",
    loungeId: 2,
    seatsPerRow: [6, 8, 9, 10, 10, 12]
  }
};

interface TicketCounts {
  adult: number;
  senior: number;
  child: number;
}

interface SeatProps {
  row: number;
  col: number;
  type: 'available' | 'vip' | 'elder';
  isSelected: boolean;
  isBooked: boolean;
  onClick: () => void;
}

// logiken för att när man klickar på ett säte ska något hända
// alla värden i seatprops läggs in i seat
// getClassName bestämmer vilken css sätena ska ha, booked, selected eller vanliga typer
const Seat = ({ row, col, type, isSelected, isBooked, onClick }: SeatProps) => {
  const getClassName = () => {
    let className = 'seat';
    if (isBooked) return `${className} booked`;
    if (isSelected) return `${className} selected`;
    return `${className} ${type}`;
  };

  //returnerar en knapp för varje säte
  //med getClassName sätter CSS klassen på sätet
  return (
    <button
      className={getClassName()}
      data-row={row}
      data-col={col}
      onClick={onClick}
      // gör att man inte kan klicka på den om den är bokad
      disabled={isBooked}
    >
      {col}
    </button>
  );
};

function BookingPage() {
  const navigate = useNavigate(); // use navigate to can navigate to the bookingpage URL
  const { id } = useParams(); // routen letar efter vilket id som är efter /booking

  // gör att vi kan ändra till vilken film vi vill ha, sätter den till null i början
  // any gör att den kan hålla vilken datatyp som helst för vi vet inte hur filmen datatyp ser ut ännu
  const [movie, setMovie] = useState<any>(null);
  // gör att våran showtime är viewing
  const [showtime, setShowtime] = useState('viewing');

  const [searchParams] = useSearchParams();
  const viewingId = searchParams.get("showtime");

  // hämtar definitionen ticket counts ovanför och ger dem alla värdet 0 till att börja med 
  const [counts, setCounts] = useState<TicketCounts>({
    adult: 0,
    senior: 0,
    child: 0
  });
  // ([]) = startvärdet är en tom array
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  //  set som inehåller stärnger new set () = en Set datastruktur, liknar array fast med egna värden.
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [availableViewigs, setavailableViewigs] = useState<any[]>([]);
  const [selectedViewing, setselectedViewing] = useState<any>(null);
  const [CurrentLounge, setCurrentLounge] = useState<any>(null);

  const getCurrentSalongLayout = () => {
    if (!selectedViewing) {
      return SALONG_LAYOUT['Stora Salongen']; // Default
    }

    return selectedViewing.lounge === 1
      ? SALONG_LAYOUT['Stora Salongen']
      : SALONG_LAYOUT['Lilla Salongen'];
  };


  // tar emot ett nummer, returnerar en sträng
  // tofixed 2 lägger till 2 decimaler och gör om . till ,
  const formatPrice = (value: number): string => {
    return `${value.toFixed(2).replace('.', ',')} kr`;
  };



  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // hämtar data från servern (får tillbaka response objekt med JSON text )
        const response = await fetch(`/api/movies/${id}`);
        // parsar texten från response till TS objekt
        const data = await response.json();
        // sparar värdet i movie state
        setMovie(data);

        // samma process som ovan
        const viewingREsponse = await fetch(`/api/viewing?viewingId=${viewingId}`);
        const viewingsData = await viewingREsponse.json();

        console.log("Visnings Tider: ", viewingsData);

        // data vi har fått från fetchen om den är mer än 0
        // sätter showtime till första visningens starttid
        if (viewingsData.length > 0) {
          setavailableViewigs(viewingsData[0]);
          setselectedViewing(viewingsData[0]);
          setShowtime(viewingsData[0].start_time);
        }

        console.log("Selected Viewing: ", viewingsData[0].id);
        console.log("Selected ShowTime: ", viewingsData[0].start_time);

      } catch (error) {
        console.error('Failed to fetch movie:', error);
        alert('Kunde inte ladda filmen');
      }
    };
    // om vi kommer till en URL med ID så kör denna funktionen
    if (id) {
      fetchMovie();
    }
  }, [id]);
  
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!selectedViewing || !selectedViewing.id) {
        return;
      }

      console.log('Hämtar bokade platser för viewing:', selectedViewing.id);

      setCurrentLounge(selectedViewing.lounge);

      try {
        const bookedResponse = await fetch(`/api/bookingSeats/${selectedViewing.id}`);

        if (bookedResponse.ok) {
          const bookedData = await bookedResponse.json();

          // Made unnessecary after adding the .seat object to bookedRespone when returning
          // values from SQL query.
          /*if (bookedData && typeof bookedData === `object` && !Array.isArray(bookedData)) {
            if ('data' in bookedData && Array.isArray(bookedData.data)) {
              bookedData = bookedData.data;
            }
          } */

          // Takes the Json object seats what we return with our fetch and checks if it's an
          // array and then assigns it to bookedSeatsArray.
          const bookedSeatsArray = Array.isArray(bookedData.seats) ? bookedData.seats : [];

          // Goes through the array and maps them in bookedSeatsSet so they can then be used to
          // set seats on our webpage to booked, makes them unavailable to other users to book.
          const bookedSeatsSet = new Set<string>(
            bookedSeatsArray.map((seat: string) => seat)
          );

          console.log("Bokade Platser: ", Array.from(bookedSeatsSet));
          setBookedSeats(bookedSeatsSet);
        }
        else {
          console.log('Inga bokade platser');
          setBookedSeats(new Set());
        }
      } catch (error) {
        console.error('Kunde inte hitta bokade platser', error);
        setBookedSeats(new Set());
      }
    };

    fetchBookedSeats();
  }, [selectedViewing]);

  // lägger antalet biljetter i totaltickets
  const getTotalTickets = (): number => {
    return counts.adult + counts.senior + counts.child;
  };

  // funktionen tar emot vilken biljetttyp
  const updateCount = (type: keyof TicketCounts, delta: number) => {
    //setcounts uppdaterar värdet, prev är det tidigare värdet
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
      // uppdaterar endast valda värdet type = nyckeln , mathmax ser till att den aldrig går under 0
    }));
  };

  // om jag tar bort antal personer när jag har säten valda så försvinner valda säten med 
  useEffect(() => {
    const totalTickets = getTotalTickets();
    if (selectedSeats.length > totalTickets) {
      setSelectedSeats(prev => prev.slice(0, totalTickets));
    }
  }, [counts]);

  // Visar rekommenderade säten
  const selectSeat = (row: number, col: number) => {
    const seatId = `${row}-${col}`;
    if (getTotalTickets() === 0) {
      alert('Välj antal biljetter först.');
      return;
    }
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      setSelectedSeats(prev => [...prev.slice(1), seatId]);
    }
  };

// Funktionen tar emot count = hur många platser som ska väljas.
// Returnerar en lista av seat‑ID (t.ex. "5-7").
  const getBestSeats = (count: number): string[] => {
    const layout = getCurrentSalongLayout();    // Hämtar aktuell salongs‑layout (antal rader och antal stolar per rad).
    const totalRows = layout.seatsPerRow.length;    // Räknar hur många rader salongen har.
    const middleRow = Math.ceil(totalRows / 2);     // Hittar mittenraden (den bästa raden att sitta på).
    const candidates: string[] = [];     // Skapar en tom lista där alla potentiella bra platser ska läggas in.


// rowOffset styr hur långt från mitten vi ska leta.
// Först offset 0 = mittenraden.
// Sedan offset 1 = en rad ovanför och en rad under.
// Fortsätter tills alla rader är testade.
    for (let rowOffset = 0; rowOffset < totalRows; rowOffset++) {
      const rowsToCheck = rowOffset === 0   // Om offset = 0 = bara mittenraden.
      ? [middleRow]      // Annars = en rad ovanför och en rad under mittenraden, så vi kollar båda samtidigt.
      : [middleRow - rowOffset, middleRow + rowOffset].filter    // Filtrerar bort rader som inte finns (t.ex. rad 0 eller rad 11 i en salong med 10 rader).
      (r => r >= 1 && r <= totalRows);

      // Går igenom varje rad som ska kontrolleras.
      for (const row of rowsToCheck) {
        const numSeats = layout.seatsPerRow[row - 1];   // Hämtar antal stolar i den aktuella raden.
        const middleCol = Math.ceil(numSeats / 2);      // Hittar mittenkolumnen i den raden (den bästa platsen i raden).

        // colOffset styr hur långt från mitten i raden vi ska leta.
        for (let colOffset = 0; colOffset < numSeats; colOffset++) {
          const colsToCheck = colOffset === 0   // Om colOffset = 0 = bara mittenplatsen i raden.
          ? [middleCol]
          : [middleCol - colOffset, middleCol + colOffset].filter(c => c >= 1 && c <= numSeats);   // Annars = en plats till vänster och en plats till höger om mittenplatsen, så vi kollar båda samtidigt.

          // Skapar ett seat‑ID i formatet "rad-kolumn".
          for (const col of colsToCheck) {
            const seatId = `${row}-${col}`;
            if (!bookedSeats.has(seatId) && !candidates.includes(seatId)) {
              candidates.push(seatId);   // Lägger till stolen om den inte är bokad eller den inte redan finns i listan.
            }
          }
        }
      }   // Om vi redan har hittat tillräckligt många platser, bryt ut ur loopen tidigt för att inte lägga till onödiga platser.
      if (candidates.length >= count) break;
    }   // Returnerar de bästa platserna upp till det antal som efterfrågats.
    return candidates.slice(0, count);
  }


  const confirmBooking = () => {
    // lägger in totala antalet biljetter vi har valt in i totaltickers
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      alert('Välj antal biljetter först.');
      return;
    }
    if (selectedSeats.length !== totalTickets) {
      alert(`Välj ${totalTickets} platser innan du bekräftar.`);
      return;
    }

    const totalPrice = (counts.adult * PRICES.adult) +
      (counts.senior * PRICES.senior) +
      (counts.child * PRICES.child);

    // DEBUG
    // console.log('=== FULL MOVIE OBJECT:', JSON.stringify(movie, null, 2));
    // console.log('=== movie.movies_raw:', movie?.movies_raw);
    // console.log('=== typeof movie.movies_raw:', typeof movie?.movies_raw);

    // börjar med att movieTitle har värdet 'okänd fillm'
    let movieTitle = 'Okänd film';
    // om movie.movie_raw.title finns
    if (movie?.movies_raw?.Title) {
      // använd det då isåfall och lägg in det i movieTitle
      movieTitle = movie.movies_raw.Title;
      console.log('=== GOT TITLE FROM movies_raw.Title:', movieTitle);
    } else if (movie?.Title) {
      // annars om movie.title finns läggin det i movie.Title
      movieTitle = movie.Title;
      console.log('=== GOT TITLE FROM movie.Title:', movieTitle);
    } else {
      console.log('=== NO TITLE FOUND, using default');
    }

    // sparar alla värden i bookingData som måste matcha med bookindata i confirm page
    const bookingData = {
      film: movieTitle,
      viewing: showtime,
      seats: selectedSeats,
      counts,
      totalPrice,
      lounges: getCurrentSalongLayout().name
    };

    console.log('=== BOOKING DATA TO SAVE:', bookingData);

    // här så gör vi om bookingdata till JSON och sätter värder i sessionstorage till bookingdata
    // sen navigerar vi till / confirm
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/confirm');
  };
  // const confirmBooking = () => {
  //   const totalTickets = getTotalTickets();
  //   if (totalTickets === 0) {
  //     alert('Välj antal biljetter först.');
  //     return;
  //   }
  //   if (selectedSeats.length !== totalTickets) {
  //     alert(`Välj ${totalTickets} platser innan du bekräftar.`);
  //     return;
  //   }

  //   const totalPrice = (counts.adult * PRICES.adult) +
  //     (counts.senior * PRICES.senior) +
  //     (counts.child * PRICES.child);

  //   const bookingData = {
  //     film: movie?.Title || 'okänd film',
  //     viewing: showtime,
  //     seats: selectedSeats,
  //     counts,
  //     totalPrice,
  //     lounges: SALONG_LAYOUT.name
  //   };
  //   //sparar användarens data av bokningen
  //   sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

  //   navigate('/confirm');

  // }; 

  if (!movie) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Laddar film...</p>
      </div>
    );
  }

  const totalPrice = (counts.adult * PRICES.adult) +
    (counts.senior * PRICES.senior) +
    (counts.child * PRICES.child);

  return (
    <>
      {/* Ticket selector + summary */}
      <section className="booking-hero">
        {/* ÄNDRAD KOD */}
        <h2>Boka biljetter för: <span id="filmTitle">{movie?.movies_raw.Title || movie?.Title}</span></h2>
        <p className="p-tagg">Välj antal biljetter och platser</p>
        <div className="ticket-wrapper">
        <div className="ticket-layout">
          
          {/* Panel: Select number of tickets */}
          <div className="ticket-panel">
            <h3>Välj antal biljetter</h3>

          

              <div className="ticket-row">
                <div className="ticket-label">
                  <strong>Ordinarie</strong>
                  <span className="ticket-note">Standard</span>
                </div>
                <div className="ticket-controls">
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('adult', -1)}
                    disabled={counts.adult === 0}
                  >
                    −
                  </button>
                  <span className="ticket-count">{counts.adult}</span>
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('adult', 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="ticket-row">
                <div className="ticket-label">
                  <strong>Pensionär</strong>
                  <span className="ticket-note">10% rabatt</span>
                </div>
                <div className="ticket-controls">
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('senior', -1)}
                    disabled={counts.senior === 0}
                  >
                    −
                  </button>
                  <span className="ticket-count">{counts.senior}</span>
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('senior', 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="ticket-row">
                <div className="ticket-label">
                  <strong>Barn (t.o.m 11 år)</strong>
                  <span className="ticket-note">20% rabatt</span>
                </div>
                <div className="ticket-controls">
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('child', -1)}
                    disabled={counts.child === 0}
                  >
                    −
                  </button>
                  <span className="ticket-count">{counts.child}</span>
                  <button
                    className="ticket-btn"
                    onClick={() => updateCount('child', 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Panel: Summary */}
            <aside className="ticket-summary">
              <h4>Sammanfattning</h4>
              <div className="summary-row">
                <span>Ordinarie</span>
                <span>{counts.adult} × {formatPrice(PRICES.adult)}</span>
              </div>
              <div className="summary-row">
                <span>Pensionär</span>
                <span>{counts.senior} × {formatPrice(PRICES.senior)}</span>
              </div>
              <div className="summary-row">
                <span>Barn</span>
                <span>{counts.child} × {formatPrice(PRICES.child)}</span>
              </div>
              <div className="summary-total">
                <span>Summa</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </aside>

          </div>
        </div>
    </section>

      {/* Seat map */}
      <section className="cinema">
        <div className="cinema-header">
          <h3>Salong - Skärm</h3>
          <div className="seat-legend">
            <div className="legend-item">
              <span className="legend-color available"></span>
              <span className="legend-text">Lediga platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color elder"></span>
              <span className="legend-text">Äldre platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color vip"></span>
              <span className="legend-text">VIP platser</span>
            </div>
            <div className="legend-item">
              <span className="legend-color unavailable"></span>
              <span className="legend-text">Ej tillgängliga</span>
            </div>
          </div>
        </div>
        <div className='screen-wrapper'>
          <div className="screen">Bio Skärm</div>
        </div>
        <div
          id="seats"
          className="seats-grid"
        >
          {getCurrentSalongLayout().seatsPerRow.map((numSeats, index) => {
            const row = index + 1;
            return (
              <div key={`row-${row}`} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seat-row-inner" style={{ gridTemplateColumns: `repeat(${numSeats}, minmax(0, 100px))` }}>
                  {Array.from({ length: numSeats }, (_, i) => {
                    const col = i + 1;
                    const seatId = `${row}-${col}`;
                    let seatType: 'available'| 'unavailable' = 'available';

                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={seatType}
                        isSelected={selectedSeats.includes(seatId)}
                        isBooked={bookedSeats.has(seatId)}
                        onClick={() => selectSeat(row, col)}
                      />
                    );
                  })}
                </div>
                <div className="row-label">{row}</div>
              </div>
            );
          })}
          </div>
        <button className="confirm-button" onClick={confirmBooking}>
          Bekräfta bokning
        </button>
      </section>
    </>
  );
};

BookingPage.route = {
  path: '/booking/:id',
  menuLabel: 'booking',
  index: 8,
};

export default BookingPage;
