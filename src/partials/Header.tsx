import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <span className="logo">KvartersBion</span>

      <button
        className="hamburger"
        aria-label="Meny"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link className="nav-item" to="/bistro">Bistro</Link>
        <Link className="nav-item" to="/lilla-salongen">Lilla Salongen</Link>
        <Link className="nav-item" to="/stora-salongen">Stora Salongen</Link>

        <Link className="nav-profile" to="/profile">
          <img
            src="/images/profile-gold.svg"
            alt="Profil"
            className="profile-icon"
          />
        </Link>
      </nav>
    </header>
  );
}
