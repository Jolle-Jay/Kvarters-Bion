
import { useState } from "react";
import '../CSS/AIChat.css';

AiChatPage.route = {
  path: '/ai-chat',
  menuLabel: 'AI Chat',
  index: 4
};

interface Message {
  role: 'user' | 'bot';
  content: string;
}

function getBotReply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("öppettider") || lower.includes("öppet")) {
    return "Vi har öppet måndag–fredag 10–22, lördag–söndag 12–23.";
  }
  if (lower.includes("pris") || lower.includes("biljett")) {
    return "Biljettpriser: Ordinarie 140 kr, Pensionär 120 kr, Barn 80 kr.";
  }
  return "Jag är biografens chatbot! Fråga om öppettider eller biljettpriser.";
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages(prev => [...prev, { role: "bot", content: reply }]);
    }, 400);
  };

  return (
    <div className="aichat-container">
      <h2 className="aichat-title">Biografens AI-chat</h2>
      <div className="aichat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`aichat-message ${msg.role}`}>
            <b>{msg.role === 'bot' ? 'BiografBot' : 'Du'}:</b> {msg.content}
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