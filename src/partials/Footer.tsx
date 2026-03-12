import { Link } from "react-router-dom";
import '../css/Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">

        <div className="footer-section">
          <h4>KvartersBion</h4>
          <p>
            Din lokala kvartersbio med premiärer, klassiker och äkta biokänsla.
            Filmupplevelser – precis som de ska vara.
          </p>
        </div>

        <div className="footer-section">
          <h4>Kontakt</h4>
          <p>📍 Storgatan 12, 123 45 kvartersbion</p>
          <p>📞 +467-0123456</p>
          <p>✉️ KvartersbionMalmo@outlook.com</p>
        </div>

        <div className="footer-section">
          <h4>Öppettider</h4>
          <p>Mån–Sön: 19:00 – 00:00</p>
        </div>

        <div className="footer-section">
          <h4>Snabblänkar</h4>
          <Link to="/">Start</Link>
          <Link to="/bistro">Bistro</Link>
          <Link to="/lilla-salongen">Lilla Salongen</Link>
          <Link to="/stora-salongen">Stora Salongen</Link>
          <Link to="/profile">Profil</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 KvartersBion · Alla rättigheter förbehållna</p>
      </div>
    </footer>
  );
}
