import { Row, Col } from 'react-bootstrap';

interface SelectProps {
  label: string;  // Rubriken
  value: string;  // Nuvarande valda priset
  changeHandler: Function;  // funktion körs när användaren byter val
  options: string[];  // lista av alternativ som finns i menyn
}
// Definierar vad komponenten behöver för att fungera

export default function Select(
  { label, value, changeHandler, options }: SelectProps
) { 
  return <label className="w-100">
    <Row>
      <Col xs={3} md={12}>
        <div className="mb-md-2 mt-2 mt-md-0">{label}:</div>
      </Col>
      <Col xs={9} md={12}>
        <select
          role="button"
          className="form-select bg-light mb-4 d-inline w-100"
          value={value}
          onChange={e => changeHandler(e.target.value)}
        >
          {options.map((x, i) => <option key={i}>{x}</option>)}
        </select>
      </Col>
    </Row>
  </label>;
}

// Återanvändbar väljare (dropdown-meny) med hjälp av react och bootstrap.
// Ser annorlundare ut beroende på vilken skräm man har

// xs={3} och {9} för mobilen och dropdown ligger sida vid sida på samma rad. 
// md={12} gör att på större skärmar så ligger dropdown under rubriken istället.

// Options map är en rad som loopar igenom alla alternativ som skickas in och skapar en option för varje sträg i listan.
// onChange när någon väljer ett nytt alt så anropas changeHandler med det nya värdet e.target.value. 
// Info skickas tillbaka till föräldern som kan uppdatera state och därmed ändra det valda priset.