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

    // Om det inte är en fråga om historik, skicka till AI-backend
    try {
      // Förbered meddelandelistan för API:et
      // Vi mappar om 'bot' till 'assistant' som är standard för AI-API:er
      const apiMessages = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Lägg till det nya meddelandet
      apiMessages.push({ role: 'user', content: text });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) throw new Error('Kunde inte nå AI-servern');

      const data = await response.json();

      // Antar att svaret följer OpenAI-formatet som backend verkar använda
      return data.choices?.[0]?.message?.content || "Jag fick tyvärr inget svar från AI:n.";
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "Ursäkta, jag har lite problem med uppkopplingen just nu. Försök igen senare.";
    }
  };

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