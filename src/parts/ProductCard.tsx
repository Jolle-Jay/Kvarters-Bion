import type Product from '../interfaces/Product';  //Från products.tsx
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import Image from './Image';

export default function ProductCard(
  { id, name, quantity, price$, slug }: Product  // egenskaperna från filmerna
) {
  const navigate = useNavigate();
  return <Card
    className="mb-4 border-0"
    role="button" /*sets the cursor to pointer*/
    onClick={() => navigate('/products/' + slug)} // När man klickar på film kortet på hemsidan
    // körs maps('products/' + slug) och tar en till produktsidan
  >
    <Card.Body as={Row}>
      <Col>
        <Card.Title>{name}</Card.Title>
        <Card.Text className="mb-0">
          <strong className=" d-sm-none">Qty:</strong> /* visar texten kvalite på små skärmar */
          <strong className="d-none d-none d-sm-inline-block">Quantity:</strong>  /* visar texten på större skärmar*/ 
          <span className="float-end">{quantity}</span>  /* priset läggs till höger  */ 
        </Card.Text>
        <Card.Text>
          <strong>
            Price:
            <span className="float-end">${price$.toFixed(2)}</span>
          </strong>
        </Card.Text>
        <Button variant="primary">More info</Button>
      </Col>
      <Col>
        <Card.Img
          as={Image}
          src={'/images/products/' + id + '.jpg'}
          alt={'Product image of the product ' + name + '.'}
          className="h-100"
        />
      </Col>
    </Card.Body>
  </Card >;
}

// filmsidans movie cards

// Tar data från Product och skapar ett kort som användarna kan klicka
// finns bootstrap styling koder med react men vi ska inte ha det