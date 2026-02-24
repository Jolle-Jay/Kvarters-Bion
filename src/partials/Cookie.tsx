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
        <p> 
            Denna webbplats använder nödvändiga tekniska cookies för att möjliggöra grundläggande funktioner, 
            såsom inloggning och säker användning av tjänsten. Inom kort kan vi även komma att använda 
            statistikcookies för att analysera hur webbplatsen används i syfte att förbättra användarupplevelsen. 
            Insamlad statistik kan även utgöra underlag för framtida marknadsföringsinsatser. Du har möjlighet 
            att själv välja om du vill samtycka till användningen av statistikcookies. 
        </p>
        <div className="cookie-buttons">
          <button onClick={handleAccept} className="accept">Godkänn</button>
          <button onClick={handleDecline} className="decline">Avvisa</button>
        </div>
      </div>
    </div>
  );
}