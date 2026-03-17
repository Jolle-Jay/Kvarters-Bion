import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../css/booking-styles.css';


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
  type: 'available';
  isSelected: boolean;
  isBooked: boolean;
  onClick: () => void;
}

// logic when you click on a seat and something will happen 
// all values in seatprops get added in seat 
// getClassName decides what css the seats will have , booked, selected or usual types
const Seat = ({ row, col, type, isSelected, isBooked, onClick }: SeatProps) => {
  const getClassName = () => {
    let className = 'seat';
    if (isBooked) return `${className} booked`;
    if (isSelected) return `${className} selected`;
    return `${className} ${type}`;
  };

  // return a button for each seat
  //with getClassName we add CSS class to the seats 
  return (
    <button
      className={getClassName()}
      data-row={row}
      data-col={col}
      onClick={onClick}
      // does so you cannot click on it its booked
      disabled={isBooked}
    >
      {col}
    </button>
  );
};

function BookingPage() {
  const navigate = useNavigate(); // use navigate to can navigate to the bookingpage URL
  const { id } = useParams(); // route looks after which id that is after /booking 
  const location = useLocation();

  // does so we can change what movie we want, as value null in the beginning  
  // any does that it can hold any datatype we want, because we dont know yet how datatype looks yet(or is)
  const [movie, setMovie] = useState<any>(null);
  // makes our showtime viewing 
  const [showtime, setShowtime] = useState('viewing');

  // gets the definition ticket counts above and declare the value to 0 to start with 
  const [counts, setCounts] = useState<TicketCounts>({
    adult: 0,
    senior: 0,
    child: 0
  });
  // ([]) = start value is a empty array
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  //  set that contains strings new set () = a Set datastructure, looks like a array but with own values 
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [availableViewigs, setavailableViewigs] = useState<any[]>([]);
  const [selectedViewing, setselectedViewing] = useState<any>(null);
  const [CurrentLounge, setCurrentLounge] = useState<any>(null);


  //  count: number - parametern tells us how many seats  that has to be found 
  // layout = defaultvalue on layout parametern if no layout is sent, use the actuall salongLayout 
  // :string [] function returns a array of string  (seat id "4-5")
  const getBestSeats = (count: number, layout = getCurrentSalongLayout()): string[] => {
    // NOTATION - enter the object and fetch this 
    // layout contains getCurrenTSal, fetch it in  Seatperrow and length how many rows does the saloon has?
    const totalRows = layout.seatsPerRow.length;
    // Math.ceil always rounds up to closest integer
    // split totalrows on 2 for arriving to the middle 
    const middleRow = Math.ceil(totalRows / 2) + 1;
    // a string array that starts empty
    const candidates: string[] = [];
    // looping outside from the middle row by row. rowOffset = 0 = middlerow, 1 = a row from the middle
    for (let rowOffset = 0; rowOffset < totalRows; rowOffset++) {
      // with offset 0: only check middlerow. Else check a row above and below ath the same time
      // .filter() make sure we dont go outside of the rows int the saloon <1 or > totalRows
      const rowsToCheck = rowOffset === 0
        ? [middleRow]
        : [middleRow - rowOffset, middleRow + rowOffset].filter(r => r >= 1 && r <= totalRows);

      for (const row of rowsToCheck) {
        // fetch amount of seats in this specific row. row-1 because arrays starts on 0
        const numSeats = layout.seatsPerRow[row - 1];
        // counts what seat that is in the middle of the row
        const middleCol = Math.ceil(numSeats / 2);
        console.log('numSeats:', numSeats, 'middleCol:', middleCol);
        // loops out from the middle row seat by seat
        for (let colOffset = 0; colOffset < numSeats; colOffset++) {
          //with offset 0: check middle place, else check RIGHT first ELSE left
          //+ before - = right prioritizes (seat 6 before seat 4 when middle is 6)
          //.filet() make sure we dont go outside the seats
          const colsToCheck = colOffset === 0
            ? [middleCol]
            : [middleCol + colOffset, middleCol - colOffset].filter(c => c >= 1 && c <= numSeats);
          for (const col of colsToCheck) {
            // builds seat-id as string  ex; row4, seat 6 = 4-5
            const seatId = `${row}-${col}`;
            // only add if: 1( seat is not booked) 2: (it doesnt already exist in candidates.)
            if (!bookedSeats.has(seatId) && !candidates.includes(seatId)) {
              candidates.push(seatId);
              console.log('lade till:', seatId);
            }
          }
        }
      }
      // break loop early if we already found enough seats
      if (candidates.length >= count) break;
    }
    // return exactly how many seats that was asked for ( count)
    return candidates.slice(0, count);
  };



  const getCurrentSalongLayout = () => {
    if (!selectedViewing) {
      return SALONG_LAYOUT['Stora Salongen'];
    }

    return selectedViewing.lounge === 1
      ? SALONG_LAYOUT['Stora Salongen']
      : SALONG_LAYOUT['Lilla Salongen'];
  };

  // recieves a number, returns a string 
  // tofixed 2 adds 2 decimals and converts . to , 
  const formatPrice = (value: number): string => {
    return `${value.toFixed(2).replace('.', ',')} kr`;
  };


  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // fetch data from server and gets back a response object with JSON text 
        const response = await fetch(`/api/movies/${id}`);
        // parse the text from response to a TS object '
        const data = await response.json();
        // save value in movie state 
        setMovie(data);

        // same process as above 
        const viewingREsponse = await fetch(`/api/viewings?movieId=${id}`);
        const viewingsData = await viewingREsponse.json();

        console.log("Visnings Tider: ", viewingsData);

        // data we recieved from the fetch if it is more than 0 
        // sets showtime to the first viewing starttime 
        if (viewingsData.length > 0) {
          setavailableViewigs(viewingsData);

          const searchParams = new URLSearchParams(location.search);
          const showtimeId = searchParams.get('showtime');

          let initialViewing = viewingsData[0];
          if (showtimeId) {
            const found = viewingsData.find((v: any) => v.id == showtimeId);
            if (found) initialViewing = found;
          }

          setselectedViewing(initialViewing);
          setShowtime(initialViewing.start_time);
        }
      } catch (error) {
        console.error('Failed to fetch movie:', error);
        alert('Kunde inte ladda filmen');
      }
    };
    // if we get to a URL with /ID (number) run this funnction 
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

          // checks if bookedData.seats is an array, if not make it default, make it to a empty array
          const bookedSeatsArray = Array.isArray(bookedData.seats) ? bookedData.seats : [];

          // Converts bookedseatsarray to a SEt for fast lookup instead having to loop through a whole array
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


    const interval = setInterval(() => {
      fetchBookedSeats();
    }, 3000);

    return () => clearInterval(interval);

  }, [selectedViewing]);

  useEffect(() => {
    const totalTickets = counts.adult + counts.senior + counts.child;
    if (totalTickets > 0) {
      const layout = getCurrentSalongLayout();
      setSelectedSeats(getBestSeats(totalTickets, layout));
    } else {
      setSelectedSeats([]);
    }
  }, [counts, selectedViewing]);


  //if someone has choose seats and books before I book and choose 
  useEffect(() => {
    setSelectedSeats(prev =>
      prev.filter(seat => !bookedSeats.has(seat))
    );
  }, [bookedSeats]);

  // put amount of tickets in totaltickets 
  const getTotalTickets = (): number => {
    return counts.adult + counts.senior + counts.child;
  };

  // the function revieves what ticket type 
  const updateCount = (type: keyof TicketCounts, delta: number) => {
    //setcounts updates the new value, prev is the previous value 
    setCounts(prev => ({
      ...prev,
      // uppdates only the chosen value type = key, mathmax makes sure it never surpasses 0 
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  // if i remove amount of people when I have seats chosen, then chosen seats also dissapear 
  useEffect(() => {
    const totalTickets = getTotalTickets();
    if (selectedSeats.length > totalTickets) {
      setSelectedSeats(prev => prev.slice(0, totalTickets));
    }
  }, [counts]);

  // Choose or swap place, but dont allow cancelling by clicking on a already choosen seat 
  const selectSeat = (row: number, col: number) => {
    const seatId = `${row}-${col}`;
    const totalTickets = getTotalTickets();

    if (totalTickets === 0) {
      alert('Välj antal biljetter först.');
      return;
    }

    if (!selectedSeats.includes(seatId)) {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats(prev => [...prev, seatId]);
      } else {
        // swap the oldest chosen seat to the new one 
        setSelectedSeats(prev => [...prev.slice(1), seatId]);
      }
    }
  };

  const confirmBooking = () => {
    // lägger in totala antalet biljetter vi har valt in i totaltickers
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      alert('Välj antal biljetter först.');
      return;
    }

    // age chheck, so that children cannot book by themself 
    const isHorror = movie?.movies_raw?.Rated?.includes('R');
    const adultTicket = counts.adult + counts.senior;

    if (isHorror && counts.child > 0 && adultTicket == 0) {
      alert("Barnbiljetter kräver minst en vuxen för denna filmen.");
      return;
    }
    if (selectedSeats.length !== totalTickets) {
      alert(`Välj ${totalTickets} platser innan du bekräftar.`);
      return;
    }

    const totalPrice = (counts.adult * PRICES.adult) +
      (counts.senior * PRICES.senior) +
      (counts.child * PRICES.child);


    // starts with movieTitle has the value  'okänd fillm'
    let movieTitle = 'Okänd film';
    // if movie.movie_raw.title exists
    if (movie?.movies_raw?.Title) {
      //then use it and add it in movieTitle
      movieTitle = movie.movies_raw.Title;
    } else if (movie?.Title) {
      // else if om movie.title does exists, put it in movie.Title
      movieTitle = movie.Title;
    }

    // saves all the values saved in bookingData that has to mattch with bookingData interface in confirmpage 
    const bookingData = {
      film: movieTitle,
      viewing: showtime,
      seats: selectedSeats,
      counts,
      totalPrice,
      lounges: getCurrentSalongLayout().name
    };


    // here we convert bookingdata to JSON and puts the value in sessionstorage to BookingData 
    // then we navigate to /confirm 
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/confirm');
  };

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
        <h2>Boka biljetter för: <span id="filmTitle">{movie?.movies_raw.Title || movie?.Title}</span></h2>
        <p className="p-tagg">Välj antal biljetter och platser</p>
        <div className="ticket-wrapper">
          <div className="ticket-layout">

            {/* Select number of tickets */}
            <div className="ticket-panel">
              <h3>Välj visning</h3>
              <select
                className="form-select-viewing"
                value={selectedViewing?.id || ''}
                onChange={(e) => {
                  const vId = Number(e.target.value);
                  const v = availableViewigs.find(x => x.id === vId);
                  if (v) {
                    setselectedViewing(v);
                    setShowtime(v.start_time);
                    setSelectedSeats([]); // clean seats chosen if you change booking
                  }
                }}
              >
                {availableViewigs.map(v => (
                  <option key={v.id} value={v.id}>
                    {new Date(v.start_time).toLocaleString('sv-SE', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {v.lounge === 1 ? 'Stora Salongen' : 'Lilla Salongen'}
                  </option>
                ))}
              </select>

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
                    -
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

            {/*  Summary */}
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
          { /*Loops thorugh the whole seatgrid */}
          {getCurrentSalongLayout().seatsPerRow.map((numSeats, index) => {
            const row = index + 1;
            return (
              <div key={`row-${row}`} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seat-row-inner" style={{ gridTemplateColumns: `repeat(${numSeats}, minmax(0, 100px))` }}>
                  { /*Creates a seat for every seat in column numseats (-i makes so the seats starts from right to left)  */}
                  {Array.from({ length: numSeats }, (_, i) => {
                    const col = numSeats - i;
                    const seatId = `${row}-${col}`;
                    let seatType: 'available' | 'unavailable' = 'available';

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
