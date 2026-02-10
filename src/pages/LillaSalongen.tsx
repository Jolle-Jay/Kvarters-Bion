// src/pages/LillaSalongen.tsx
import type { JSX } from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import '../css/Salong.css';

export default function LillaSalongen(): JSX.Element {
  return (
      <main>
        <section className="hero">
          <img
            src="/images/karen-zhao-jLRIsfkWRGo-unsplash.jpg"
            alt="Lilla Salongen"
            className="hero-image"
          />
          <div className="hero-overlay">
            <div className="hero-text">
              <h1>Lilla Salongen</h1>
              <p>En intim filmupplevelse</p>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="section-header">
            <h2>Om Lilla Salongen</h2>
            <span className="stars">★ ★ ★ ★ ★</span>
          </div>

          <div className="description-box">
            <p> Lilla Salongen är vår mest intima biosalong, perfekt för de som söker
            en personlig och mysig filmupplevelse. Med plats för endast 55 personer
            erbjuder vi en exklusiv atmosfär där varje besökare kan njuta av filmen
            i lugn och ro.
            </p>
            <p>Här visar vi ofta specialvisningar, dokumentärer och klassiska filmer.
            Salongen är också populär för privatvisningar och företagsevenemang.
            De bekväma stolarna och det intima avståndet till duken ger en unik
            känsla av närhet till filmen.
            </p>
          </div>

          <div className="features">
            <div className="feature-card">
              <h3>Kapacitet</h3>
              <p>55 bekväma platser i intimt format</p>
            </div>
            <div className="feature-card">
              <h3>Komfort</h3>
              <p>Premiumstolar med extra benutrymme</p>
            </div>
            <div className="feature-card">
              <h3>Ljud</h3>
              <p>Dolby Digital surroundljud</p>
            </div>
            <div className="feature-card">
              <h3>Bildkvalitet</h3>
              <p>Digital 4K projektor</p>
            </div>
          </div>
        </section>
      </main>
  );
}

// Lägg till path property för routes.ts
LillaSalongen.route = {
  path: '/lilla-salongen',
  menuLabel: 'Lilla Salongen'
};
