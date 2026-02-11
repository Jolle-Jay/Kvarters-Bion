import type { MovieJson } from '../interfaces/Movie.ts';
import { Row, Col } from 'react-bootstrap';
import { Link, useLoaderData } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import Image from '../parts/Image';
import MoviesLoader from '../utils/moviesLoader';

MovieDetailsPage.route = {
  path: '/Movies/:slug',
  parent: '/',
  loader: MoviesLoader
};

export default function MovieDetailsPage() {

  const Movie =
    useLoaderData().Movies[0] as MovieJson;

  // if no Movie found, show 404
  if (!Movie) {
    return <NotFoundPage />;
  }

  const { Poster, Title, Runtime, Year, Plot } = Movie;

  return <article className="Movie-details">
    <Row>
      <Col>
        <h2 className="text-primary">{Title}</h2>
        <Image
          src={Poster} // kan vara fel
          alt={'Movie image of the Movie ' + Poster + '.'}
        />
        {Plot.split('\n').map((x, i) => <p key={i}>{x}</p>)}
      </Col>
    </Row>
    <Row>
      <Col className="px-4 pb-4">
        <Row className="p-3 bg-primary-subtle rounded">
          <Col className="pe-4 pe-sm-5 border-end border-primary">
            <strong>Tid</strong>:
            <span
              className="d-block d-sm-inline float-sm-end"
            >
              {Runtime}
            </span>
          </Col>
          <Col className="ps-4 ps-sm-5 text-end text-sm-start">
            <strong>År</strong>:
            <span
              className="d-block d-sm-inline float-sm-end"
            >
              {Year.toFixed(2)}
            </span>
          </Col>
        </Row>
      </Col>
    </Row >
    <Row>
      <Col>
        <Link to="/" className="btn btn-primary float-end">
          Tillbaka till filmsidan
        </Link>
      </Col>
    </Row>
  </article >;
}