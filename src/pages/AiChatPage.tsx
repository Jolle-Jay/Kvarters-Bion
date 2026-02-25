import { useState, useRef, useEffect } from "react";
import '../CSS/AIChat.css';

AiChatPage.route = {
  path: '/ai-chat',
  menuLabel: 'AI Chat',
  index: 4
};

interface Message {
  role: 'user' | 'bot';
  content: string;
  isHtml?: boolean;
}

function getBotReply(text: string) {

  const lower = text.toLowerCase();
  if (lower.includes("öppettider") ||
      lower.includes("öppet")
  ) {
    return "Vi har öppet måndag–fredag 16:00–23:00, lördag–söndag 13:00–00:00.";
  }
  if (lower.includes("pris") ||
      lower.includes("priset") ||
      lower.includes("priserna") ||
      lower.includes("biljett") || 
      lower.includes("biljetterna")
  ) {
    return "Biljettpriser: Ordinarie 140 kr, Pensionär 120 kr, Barn 80 kr.";
  }
  if (
    lower.includes("bistro") ||
    lower.includes("mat") ||
    lower.includes("drinkar") ||
    lower.includes("meny") ||
    lower.includes("erbjudande") ||
    lower.includes("utbud")
  ) {
    return "Bistro erbjuder popcorn, snacks, godis, läsk, kaffe, smörgåsar och varm korv. Vissa dagar har vi även specialerbjudanden på fika och mat! För mer info trycker du på Bistro som ligger högst upp.";
  }
  if (
    lower.includes("filmer") ||
    lower.includes("bio") ||
    lower.includes("visas") ||
    lower.includes("program") ||
    lower.includes("aktuella")
  ) {
    return "Just nu visar vi: Avatar, Phantom of the Opera, Ready Player One, Shrek, The Notebook, Grown Ups, Hamilton, Batman, Alien, Wicked, Star Trek, SpongeBob, Poor Things, Koops, Dark Crystal, New Kids Turbo och The Exorcist.";
  }
   if (
      lower.includes("logga in") ||
      lower.includes("inlogg") ||
      lower.includes("loggar in") ||
      lower.includes("registrera") ||
      lower.includes("hur registrerar") ||
      lower.includes("registrering") ||
      lower.includes("hur loggar")
    ) {
      return "För att logga in klickar du på profilknappen uppe till höger på sidan. Där fyller du i ditt användarnamn och lösenord och trycker på 'Logga in'. Om du inte har ett konto kan du välja 'Registrera' för att skapa ett nytt konto.";
    }
    if (
      lower.includes("boka") ||
      lower.includes("bokar") ||
      lower.includes("bokning") ||
      lower.includes("hur köper") ||
      lower.includes("köpa biljett")
    ) {
      return "För att boka biljett klickar du på filmen du vill se på startsidan eller under 'Filmer'. Välj sedan tid och plats, och följ stegen för att slutföra bokningen. Du får en bekräftelse på mejl när bokningen är klar!";
    }
    if (
      lower.includes("betala") ||
      lower.includes("betalning") ||
      lower.includes("hur betalar") ||
      lower.includes("qr") ||
      lower.includes("skanna")
    ) {
      return "När du har bokat en biljett får du en QR-kod. Du visar och skannar QR-koden på plats i bion och betalar din biljett i kassan innan föreställningen börjar.";
    }
    if (
      lower === "hej" ||
      lower === "hej!" ||
      lower === "hejsan" ||
      lower === "tjena" ||
      lower === "hallå" ||
      lower === "hello" ||
      lower === "hi"
    ) {
      return "Hej och välkommen till biografens BioBot! Hur kan jag hjälpa dig idag?";
    }
    if (
      lower === "tack" ||
      lower === "hejdå"
    ) {
      return "Tack själv! Ha en fantastisk dag och hoppas vi ses snart på bion!";
    }
    if (
      lower.includes("lilla salongen") ||
      lower.includes("lillasalongen") ||
      lower.includes("om lilla salongen") ||
      lower.includes("lilla salong") ||
      lower.includes("sittplatser")
    ) {
      return (
        "Lilla Salongen är en intim biosalong, perfekt för dig som söker en personlig och mysig filmupplevelse. " +
        "Salongen har totalt 8 rader med 10–12 platser per rad, vilket ger plats för 77 personer. " +
        "Här kan du njuta av film i lugn och ro, nära duken och med bekväma stolar. " +
        "Lilla Salongen passar utmärkt för både vanliga visningar, specialvisningar och privata evenemang."
      );
    }
  return ("Förlåt, jag förstår inte din fråga. Prova att fråga om våra öppettider, biljettpriser, aktuella filmer eller hur du loggar in och bokar biljetter!");
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages(prev => [...prev, { role: "bot", content: reply, isHtml: reply.startsWith('<div>') }]);
    }, 400);
  };

  return (
    <div className="aichat-container">
      <h2 className="aichat-title">Biografens AI-chat</h2>
      <div
        className="chat-messages"
        style={{ maxHeight: '300px', overflowY: 'auto' }}
        ref={chatMessagesRef}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`aichat-message ${msg.role}`}>
            <b>{msg.role === 'bot' ? 'BioBot' : 'Du'}:</b>{' '}
            {msg.isHtml
              ? <span dangerouslySetInnerHTML={{ __html: msg.content }} />
              : msg.content}
          </div>
        ))}
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
  );
}