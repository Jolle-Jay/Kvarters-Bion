import type { Movie } from './interfaces/Movie';
import { mapMovieArray } from './interfaces/Movie';
import { useLocation } from 'react-router-dom';
import Header from "./partials/Header";
import Main from './partials/Main';
import Footer from './partials/Footer';
import BootstrapBreakpoints from './parts/BootstrapBreakpoints';
import { useState, useEffect } from 'react';

// turn off when not needed for debugging
const showBootstrapBreakpoints = true;

export default function App() {

  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    (async () => {
      setMovies(mapMovieArray(await (await fetch('/api/movies')).json()));
    })();
  }, []);


  // scroll to top when the route changes
  useLocation();
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  return <>
    <Header />
    <Main />
    <Footer />
    {showBootstrapBreakpoints ? <BootstrapBreakpoints /> : null}

    map movie and add al the values wished to execute
    {movies && movies.map(({ Title, Year, id, Poster }) => <article key={id}>
      <h3>{Title} ({Year})</h3>
      <img src={Poster} alt="poster of" />
    </article>)}
  </>;
};