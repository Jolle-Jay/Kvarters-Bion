import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import '../css/Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

    // Klick utanför menyn stänger den
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="navbar">
      <Link className="logo" to="/">KvartersBion</Link>


      <button
        className="hamburger"
        aria-label="Meny"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <nav ref={navRef} className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link className="nav-item" to="/bistro">Bistro</Link>
        <Link className="nav-item" to="/lilla-salongen">Lilla Salongen</Link>
        <Link className="nav-item" to="/stora-salongen">Stora Salongen</Link>

        <Link className="nav-profile" to="/login">
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
