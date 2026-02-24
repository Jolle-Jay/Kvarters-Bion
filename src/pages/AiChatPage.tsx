import { useState, useEffect, useRef } from "react";
import '../CSS/AIChat.css';
import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';


AiChatPage.route = {
  path: '/ai-chat',
  menuLabel: 'AI Chat',
  index: 4
};

interface Lounge {
  id: number;
  name: string;
  capacity: number;
}

interface Viewing {
  id: number;
  movie: number;
  lounge: number;
  start_time: string;
  loungeName?: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
  isHtml?: boolean;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [lounges, setLounges] = useState<Lounge[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [moviesRes, viewingsRes, loungesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/viewings'),
          fetch('/api/lounges')
        ]);

        if (!moviesRes.ok || !viewingsRes.ok || !loungesRes.ok) {
          throw new Error('Kunde inte hämta all data för chatten.');
        }

        const moviesData = await moviesRes.json();
        const viewingsData: Viewing[] = await viewingsRes.json();
        const loungesData: Lounge[] = await loungesRes.json();

        const loungeMap = loungesData.reduce((acc: Record<number, string>, lounge) => {
          acc[lounge.id] = lounge.name;
          return acc;
        }, {});

        setMovies(mapMovieArray(moviesData));
        setLounges(loungesData);
        setViewings(viewingsData.map((v: Viewing) => ({
          ...v,
          loungeName: loungeMap[v.lounge] || 'Okänd salong'
        })));

      } catch (error) {
        console.error("Fel vid hämtning av data för AI Chat:", error);
      }
    };

    fetchInitialData();

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setUserEmail(localStorage.getItem('userEmail'));
    }
  }, []);

  // Skrolla till botten när nya meddelanden kommer
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const getBotReply = async (text: string): Promise<string> => {
    const lower = text.toLowerCase();

    if (lower.includes("historik") || lower.includes("mina bokningar") || (lower.includes("bokningar") && !lower.includes("avbokning"))) {
      if (!isLoggedIn || !userEmail) {
        return "Du måste vara inloggad för att se din bokningshistorik. Vänligen logga in och försök igen.";
      }
      try {
        const response = await fetch(`/api/bookings?where=email=${userEmail}&orderby=-id&limit=5`);
        if (!response.ok) throw new Error('Kunde inte hämta bokningar');
        const userBookings = await response.json();

        if (userBookings.length === 0) {
          return "Du har inga tidigare bokningar.";
        }

        let reply = "Här är dina senaste bokningar:<div><ul>";
        for (const booking of userBookings) {
          const viewingInfo = viewings.find(v => v.id === booking.viewing);
          if (!viewingInfo) continue;

          const movieInfo = movies.find(m => m.id === viewingInfo.movie);
          if (!movieInfo) continue;

          const seats = Array.isArray(booking.seats) ? booking.seats.join(', ') : (typeof booking.seats === 'string' ? booking.seats.replace(/[\[\]"]+/g, '') : 'Okänt');
          const viewingTime = new Date(viewingInfo.start_time).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });

          reply += `<li><b>${movieInfo.Title}</b> (${viewingTime}) - Bokn.nr: ${booking.bookingId}. Platser: ${seats}.</li>`;
        }
        reply += "</ul></div>";
        return reply;
      } catch (error) {
        console.error("Kunde inte hämta bokningshistorik:", error);
        return "Jag kunde tyvärr inte hämta din bokningshistorik just nu. Försök igen senare.";
      }
    }

    const mentionedMovie = movies.find(movie => lower.includes(movie.Title.toLowerCase()));
    if (mentionedMovie) {
      if (lower.includes("tid") || lower.includes("visas") || lower.includes("spelas") || lower.includes("när")) {
        const movieViewings = viewings.filter(v => v.movie === mentionedMovie.id);
        if (movieViewings.length === 0) {
          return `Tyvärr har vi inga planerade visningar för ${mentionedMovie.Title} just nu.`;
        }
        let reply = `Visst! Här är kommande visningstider för ${mentionedMovie.Title}:<div><ul>`;
        movieViewings.forEach(viewing => {
          const time = new Date(viewing.start_time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
          const date = new Date(viewing.start_time).toLocaleDateString('sv-SE');
          reply += `<li>${date} kl. ${time} i ${viewing.loungeName}</li>`;
        });
        reply += "</ul></div>";
        return reply;
      }
      return `Här kommer information om ${mentionedMovie.Title}! 
      <div>
        <ul>
        <li><p><b>${mentionedMovie.Title}</b></p></li>
        <li><b>Genre:</b> ${mentionedMovie.Genre}</li>
        <li><b>År:</b> ${mentionedMovie.Year}</li>
        <li><b>Handling:</b> ${mentionedMovie.Plot}</li>
        <li><b>IMDb:</b> ${mentionedMovie.imdbRating}/10</li>
        </ul>
      </div>`;
    }

    // Ny logik för att svara på frågor om kapacitet
    if (lower.includes("kapacitet") || lower.includes("platser") || lower.includes("stolar")) {
      const mentionedLounge = lounges.find(l => lower.includes(l.name.toLowerCase()));

      if (mentionedLounge) {
        return `${mentionedLounge.name} har en kapacitet på ${mentionedLounge.capacity} platser.`;
      }

      if (lounges.length > 0) {
        let reply = "Här är kapaciteten för våra salonger:<div><ul>";
        lounges.forEach(lounge => {
          reply += `<li><b>${lounge.name}:</b> ${lounge.capacity} platser</li>`;
        });
        reply += "</ul></div>";
        return reply;
      }

      return "Jag kunde inte hitta information om salongernas kapacitet just nu.";
    }

    if (lower.includes("öppettider") || lower.includes("öppet")) 
      
      return `Vi har öppet 
      <div>
      <ul>
        <li><b>måndag–fredag:</b> 10–22</li> <li><b>lördag–söndag:</b> 12–23</li>
      </ul>
      </div>`;

    if (lower.includes("pris") || lower.includes("biljett")) 
      return `Biljettpriser: 
      <div>
      <ul>
        <li><b>Ordinarie:</b> 140 kr</li>
        <li><b>Pensionär:</b> 120 kr</li>
        <li><b>Barn:</b> 80 kr</li>
      </ul>
      </div>`;
    
    if (lower.includes("bistro") || lower.includes("mat") || lower.includes("meny")) 
      return `Bistro erbjuder:
    <div>
      <ul>
        <li><b>popcorn snacks</b></li>
        <li><b>godis</b></li>
        <li><b>läsk</b></li>
        <li><b>kaffe</b></li>
        <li><b>smörgåsar</b></li>
        <li><b>varm korv</b></li>
        <li>För mer info klicka på <a href='/bistro'> Bistro </a> i menyn.
        </ul>
        </div>
        `;
    
    if (lower.includes("filmer") || lower.includes("program") || lower.includes("aktuella")) {
      const allMovieTitles = movies.map(m => m.Title).join(', ');
      return `Just nu visar vi: ${allMovieTitles || 'laddar filmer...'}. Fråga mig om en specifik film för att få veta mer!`;
    }
    if (lower.includes("logga in") || lower.includes("registrera")) return "För att logga in eller registrera dig, klicka på profilikonen uppe till höger på sidan.";
    if (lower.includes("boka") || lower.includes("köpa biljett")) return "För att boka, hitta filmen du vill se på startsidan och klicka på den för att se tider och göra din bokning.";
    if (lower.includes("betala") || lower.includes("betalning")) return "När du har bokat en biljett får du en QR-kod. Du visar och skannar QR-koden på plats i bion och betalar din biljett i kassan.";
    if (["hej", "hej!", "hejsan", "tjena", "hallå", "hello", "hi"].includes(lower)) return "Hej och välkommen till BioBoten! Hur kan jag hjälpa dig idag?";
    if (["tack", "tack så mycket", "hejdå"].includes(lower)) return "Tack själv! Ha en fantastisk dag och hoppas vi ses på bion!";

    return "Förlåt, jag förstår inte din fråga. Prova att fråga om våra öppettider, biljettpriser, en specifik film eller din bokningshistorik.";
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    const reply = await getBotReply(text);
    setMessages(prev => [...prev, { role: "bot", content: reply, isHtml: reply.includes('<div>') }]);
  };

  return (
    <>
      {/* Chattbubbla för att öppna/stänga */}
      <div className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        <span className="chat-bubble-icon">💬</span>
      </div>

      {/* Chattfönstret (visas bara om isOpen är true) */}
      {isOpen && (
        <div className="chat-popup">
          <div className="aichat-container">
            <h2 className="aichat-title">Biografens AI-chat</h2>
            <div className="aichat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`aichat-message ${msg.role}`}>
                  <b>{msg.role === 'bot' ? 'BioBot' : 'Du'}:</b>{' '}
                  {msg.isHtml
                    ? <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                    : msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ställ en fråga..."
              className="aichat-input"
            />
            <button onClick={sendMessage} className="aichat-button">Skicka</button>
          </div>
        </div>
      )}
    </>
  );
}