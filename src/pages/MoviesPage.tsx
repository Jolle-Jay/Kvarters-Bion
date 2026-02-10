import type { SortOption } from '../utils/moviePageHelpers';
import { useLoaderData } from 'react-router-dom';
import { Row, Col, Form } from 'react-bootstrap';
import { useStateContext } from '../utils/useStateObject';
import Select from '../parts/Select';
import ProductCard from '../parts/MovieCard';
import movieLoader from '../utils/moviesLoader';
import { getHelpers } from '../utils/moviePageHelpers';

moviePage.route = {
  path: '/',
  menuLabel: 'movie',
  index: 1,
  parent: '/',
  loader: movieLoader
};

export default function moviePage() {

  let {
    movies,
    Genre,
    sortOptions,
    sortGenres
  } = getHelpers(useLoaderData().movie);

  // get state object and setter from the outlet context
  const [
    { categoryChoice, sortChoice, bwImages },
    setState
  ] = useStateContext();

  // get the chosen category without the product count part
  const category = categoryChoice.split(' (')[0];
  // get the key and order to from the chosen sort option
  const { key: sortKey, order: sortOrder } =
    sortOptions.find(x => x.Genre === sortChoice) ?? {key:'Title', order: 1};

  return <>
    <Row>
      <Col>
        <h2 className="text-primary">Our movie</h2>
        <p>
          Our movie are fantastic, organic and fresh.
          They are also very reasonably priced, considering
          they are all harvested with the greatest care.
        </p>
      </Col>
    </Row>
    <Row>
      <Col className="px-4 pt-1 pb-4">
        <Row className="bg-primary-subtle pt-3 rounded">
          <Col md="4">
            <label className="d-block">
              <div className="d-none d-md-block">
                Color images:
              </div>
              <div
                className={'form-switch-text position-absolute' +
                  ' d-md-none px-5' + (bwImages ? '' : ' text-white')}
              >
                B/W Images
                <span className="float-end">Color Images</span>
              </div>
              <Form.Switch
                className="mt-2 mb-4 mb-md-2"
                defaultChecked={!bwImages}
                onChange={e => setState('bwImages', !e.target.checked)}
              />
            </label>
          </Col>
          <Col md="4">
            <Select
              label="Category"
              value={categoryChoice}
              changeHandler={(x: string) => setState('categoryChoice', x)}
              options={Genre}
            />
          </Col>
          <Col md="4">
            <Select
              label="Sort by"
              value={sortChoice}
              changeHandler={(x: string) => setState('sortChoice', x)}
              options={sortGenres}
            />
          </Col>
        </Row>
      </Col >
    </Row >
    <Row className="mt-1 mb-n3">
      {movies
        // filter by the chosen category
        .filter(x => category === 'All' || x.Genre.includes(category))
        // sort by the chosen choice for sorting
        .sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortOrder)
        // map to product cards
        .map(product => <Col xs={12} lg={6} key={product.id}>
          <ProductCard {...product} />
        </Col>)
      }
    </Row>
  </>;
};