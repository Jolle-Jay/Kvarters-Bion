import { Row, Col } from 'react-bootstrap';

interface SelectProps {
  label: string;  // Title
  value: string;  // Current price
  changeHandler: Function;  // Function runns when user changes option
  options: string[];  // list of options thats in the menu
}
// Define what component need to work

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

// Reusable selector (dropdown menu) built with React and Bootstrap
// The layout changes depending on screen size

// xs={3} and {9} make the label and dropdown appear side by side on mobile
// md={12} makes the dropdown appear below the heading on larger screens

// The options map loops through all provided options and creates one <option> element for each string in the list
// onChange: when a user selects a new option, changeHandler is called with the new value (e.target.value)
// The selected value is sent back to the parent, which can update state and thus change the selected price