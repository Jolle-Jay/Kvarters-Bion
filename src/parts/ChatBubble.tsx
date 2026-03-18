// ChatBubble: Show a chatbubble in botom right corner 
import { useState } from "react";
import AiChatPage from "../pages/AiChatPage";
import '../css/AIChat.css';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="chat-bubble"
        onClick={() => setOpen(true)}
        title="Öppna chatten"
      >
        <span className="chat-bubble-icon">💬</span>
      </div>
      {open && (
        <div className="chat-popup">
          <div className="chat-popup-inner">
            <button
              onClick={() => setOpen(false)}
              className="chat-popup-close"
              title="Stäng chatten"
            >×</button>
            <AiChatPage />
          </div>
        </div>
      )}
    </>
  );
}
