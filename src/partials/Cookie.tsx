import { useEffect, useState } from "react";
import { getCookie, setCookie } from "typescript-cookie";
import "../css/Cookies.css";

export default function CookieBanner() {
  const [cookieConsent, setCookieConsent] = useState<string | null>(null);

  useEffect(() => {
    const consent = getCookie("cookieConsent");
    setCookieConsent(consent ?? null);
  }, []);

  const handleAccept = () => {
    setCookie("cookieConsent", "accepted", { expires: 7 });
    setCookieConsent("accepted");
  };

  const handleDecline = () => {
    setCookie("cookieConsent", "declined", { expires: 7 });
    setCookieConsent("declined");
  };

  if (cookieConsent) return null; // visa inget om redan valt

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>Vi använder cookies för att förbättra din upplevelse.</p>
        <div className="cookie-buttons">
          <button onClick={handleAccept} className="accept">Godkänn</button>
          <button onClick={handleDecline} className="decline">Avvisa</button>
        </div>
      </div>
    </div>
  );
}