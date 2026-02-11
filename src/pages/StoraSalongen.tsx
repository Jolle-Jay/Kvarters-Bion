import type { JSX } from "react";
import '../css/Salong.css';

export default function StoraSalongen(): JSX.Element {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <img
          src="/images/liam-mcgarry-ebsrin6WqxQ-unsplash.jpg"
          alt="Stora Salongen"
          className="hero-image"
        />

        <div className="hero-overlay">
          <div className="hero-text">
            <h1>Stora Salongen</h1>
            <p>Filmupplevelse i storformat</p>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="section-header">
          <h2>Om Stora Salongen</h2>
          <span className="stars">★ ★ ★ ★ ★</span>
        </div>

        <div className="description-box">
          <p>
            Stora Salongen är hjärtat i KvartersBion och vår största biosalong. Med
            plats för 81 personer och utrustning i världsklass erbjuder vi en
            filmupplevelse utöver det vanliga. Den stora duken och avancerade
            ljudsystemet skapar en fullständigt uppslukande atmosfär.
          </p>
          <p>
            Här visar vi de senaste biopremiärerna, stora hollywoodproduktioner
            och särskilda evenemang. Salongen är byggd med optimal akustik och
            siktlinjer från varje plats, vilket garanterar en perfekt
            filmupplevelse oavsett var du sitter.
          </p>
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>Kapacitet</h3>
            <p>81 platser i amfiteateruppsättning</p>
          </div>

          <div className="feature-card">
            <h3>Komfort</h3>
            <p>Ergonomiska biosoffor med mugghållare</p>
          </div>

          <div className="feature-card">
            <h3>Ljud</h3>
            <p>Dolby Atmos surroundljudsystem</p>
          </div>

          <div className="feature-card">
            <h3>Bildkvalitet</h3>
            <p>4K laser projektor med HDR</p>
          </div>
        </div>
      </section>
    </main>
  );
}

StoraSalongen.route = {
  path: "/stora-salongen",
  menuLabel: "Stora Salongen"
};
