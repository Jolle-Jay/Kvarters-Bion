import { useEffect } from "react";
import "../css/Bistro.css";

// Routing-egenskap för Bistro-sidan
export const route = {
  path: '/bistro',
  parent: '/',
  menuLabel: 'Bistro'
};

Bistro.route = route;

export default function Bistro() {
  useEffect(() => {
    // Lägg till temat på body
    document.body.classList.add("bistro-theme");
    return () => {
      // Ta bort temat när vi lämnar sidan
      document.body.classList.remove("bistro-theme");
    };
  }, []);
  
  
  return (
    <>
      <section className="bistro-hero">
        <div className="brand-block">
          <h2 className="brand-title">KvartersBion</h2>
          <p className="brand-subtitle">Mat ᆞSnacks ᆞ Dryck</p>
        </div>
      </section>

      <section className="info-section">
        <h3>MAT OCH DRYCK PÅ BIOGRAFEN</h3>
        <p>
          Hos Kvarter Bion hittar du något för alla. Välj mellan snacks som popcorn, chips,
          godis och choklad, eller mättande favoriter som nachos, pizza, hamburgare,
          ostbricka och sandwich. För barn finns mindre menyval och för seniorer
          lättare alternativ.
          <br />
          Till dryck erbjuder vi läsk, vatten, kolsyrat vatten, energidryck samt öl och vin.
          Kombinera gärna med våra menyer för en smidig filmupplevelse.
        </p>
      </section>

      <main className="menu">
        <div className="menu-top-row">
          <div className="menu-child">
            <h3>MENY – Barn</h3>
            <ul className="menu-list">
              <li className="menu-item"><div><strong>Mini‑meny</strong><span>Popcorn + liten läsk</span></div><span className="menu-price">49 kr</span></li>
              <li className="menu-item"><div><strong>Godispåse</strong><span>Plockgodis</span></div><span className="menu-price">39 kr</span></li>
              <li className="menu-item"><div><strong>Frukt & vatten</strong><span>Äpple + vatten</span></div><span className="menu-price">35 kr</span></li>
            </ul>
          </div>
          <div className="menu-senior">
            <h3>MENY – Senior</h3>
            <ul className="menu-list">
              <li className="menu-item"><div><strong>Kaffe & kaka</strong><span>Bryggkaffe + småkaka</span></div><span className="menu-price">45 kr</span></li>
              <li className="menu-item"><div><strong>Lätt‑meny</strong><span>Liten popcorn + vatten</span></div><span className="menu-price">49 kr</span></li>
              <li className="menu-item"><div><strong>Te‑paket</strong><span>Te + chokladbit</span></div><span className="menu-price">39 kr</span></li>
            </ul>
          </div>
        </div>

        <div className="menu-board">
          <div className="menu-group">
            <h3>MENY – Dryck</h3>
            <ul className="menu-list">
              <li className="menu-item"><div><strong>Läsk</strong><span>Olika smaker</span></div><span className="menu-price">29 kr</span></li>
              <li className="menu-item"><div><strong>Vatten</strong></div><span className="menu-price">10 kr</span></li>
              <li className="menu-item"><div><strong>Kolsyrat Vatten</strong></div><span className="menu-price">12 kr</span></li>
              <li className="menu-item"><div><strong>Vin</strong><span>Rött eller vitt</span></div><span className="menu-price">59 kr</span></li>
              <li className="menu-item"><div><strong>Öl</strong></div><span className="menu-price">59 kr</span></li>
              <li className="menu-item"><div><strong>Energi dryck</strong><span>Olika smaker</span></div><span className="menu-price">29 kr</span></li>
            </ul>
          </div>
          <div className="menu-group">
            <h3>MENY – Mat</h3>
            <ul className="menu-list">
              <li className="menu-item"><div><strong>Nachos</strong><span>Med salsa & ost</span></div><span className="menu-price">79 kr</span></li>
              <li className="menu-item"><div><strong>Pizza</strong><span>Slice av margherita</span></div><span className="menu-price">85 kr</span></li>
              <li className="menu-item"><div><strong>Hamburgare</strong><span>Med ost & dressing</span></div><span className="menu-price">95 kr</span></li>
              <li className="menu-item"><div><strong>Ostbricka</strong><span>Utvald ost & kex</span></div><span className="menu-price">89 kr</span></li>
              <li className="menu-item"><div><strong>Sandwich</strong><span>Kyckling eller vego</span></div><span className="menu-price">75 kr</span></li>
            </ul>
          </div>
          <div className="menu-group">
            <h3>MENY – Snacks</h3>
            <ul className="menu-list">
              <li className="menu-item"><div><strong>Baconchips</strong><span>Krispiga baconchips</span></div><span className="menu-price">35 kr</span></li>
              <li className="menu-item"><div><strong>Popcorn</strong><span>Saltade</span></div><span className="menu-price">35 kr</span></li>
              <li className="menu-item"><div><strong>Smöriga popcorn</strong><span>Extra smör</span></div><span className="menu-price">45 kr</span></li>
              <li className="menu-item"><div><strong>Godis</strong><span>Plockgodis</span></div><span className="menu-price">29 kr</span></li>
              <li className="menu-item"><div><strong>Choklad</strong><span>Mjölk eller mörk</span></div><span className="menu-price">25 kr</span></li>
              <li className="menu-item"><div><strong>Klubbor</strong><span>Fruktmix</span></div><span className="menu-price">15 kr</span></li>
              <li className="menu-item"><div><strong>Chips</strong><span>Olika smaker</span></div><span className="menu-price">30 kr</span></li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
