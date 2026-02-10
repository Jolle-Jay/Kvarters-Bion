import type Product from '../interfaces/Movie';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import Movie from './Image';

export default function ProductCard(
  { id, Title, Runtime, Year, Plot }: Product
) {
  const navigate = useNavigate();
  return <Card
    className="mb-4 border-0"
    role="button" /*sets the cursor to pointer*/
    onClick={() => navigate('/products/' + Plot)}
  >
    <Card.Body as={Row}>
      <Col>
        <Card.Title>{Title}</Card.Title>
        <Card.Text className="mb-0">
          <strong className=" d-sm-none">Qty:</strong>
          <strong className="d-none d-none d-sm-inline-block">Runtime:</strong>
          <span className="float-end">{Runtime}</span>
        </Card.Text>
        <Card.Text>
          <strong>
            Price:
            <span className="float-end">${Year.toFixed(2)}</span>
          </strong>
        </Card.Text>
        <Button variant="primary">More info</Button>
      </Col>
      <Col>
        <Card.Img
          as={Movie}
          src={'/movies/' + id + '*.json'}
          alt={'Product image of the product ' + Title + '.'}
          className="h-100"
        />
      </Col>
    </Card.Body>
  </Card >;
}