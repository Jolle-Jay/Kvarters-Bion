import App from '../App';
import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/MovieCards.css";

export default function StartPage() {

    const [movies, setMovies] = useState<Movie[] | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>('alla');

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSalon, setSelectedSalon] = useState<string>('alla');


    // Fetch movies
    useEffect(() => {
        (async () => {
            setMovies(mapMovieArray(await (await fetch('/api/movies')).json()));
        })();
    }, []);

    // Scroll to top
    useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
}, []);


    // Genre filtering only
//   const filteredMovies = movies.filter(movies =>
//     selectedGenre === 'alla' || movie.Genre.includes(selectedGenre)
// );

    return (
        <main>
            {/* HERO + CAROUSEL */}
            <section className="startpage-hero">

                <div className="carousel">
                    <div className="carousel-track">
                        <div className="group">
                           {movies && movies.map(({Poster }) => <img src={Poster} alt="poster of" />)}
                        </div>

                        {/* Duplicate group for infinite scroll animation */}
                        <div className="group" aria-hidden>
                           {movies && movies.map(({Poster }) => <img src={Poster} alt="poster of" />)}
                        </div>
                    </div>
                </div>

                <h2>Upplev film på riktigt</h2>
                <div className="hero-sub">
                    <p>Premiärer • Klassiker • IMAX-känsla</p>
                    <span className="stars">★ ★ ★ ★ ★</span>
                </div>
            </section>

            {/* FILTER */}
<section className="filter">

  <div className="filter-item">
    <h3>Filtrera film</h3>
  </div>

  <div className="filter-item">
    <select
      className="filter-dropdown"
      value={selectedGenre}
      onChange={(e) => setSelectedGenre(e.target.value)}
    >
      <option value="alla">Alla</option>
      <option value="Science Fiction">Sci-Fi</option>
      <option value="Drama">Drama</option>
      <option value="Animerat">Animerat</option>
      <option value="Thriller">Thriller</option>
      <option value="Action">Action</option>
      <option value="Romance">Romance</option>
      <option value="Adventure">Adventure</option>
    </select>
  </div>

  <div className="filter-item">
    <input
      type="date"
      className="filter-date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
    />
  </div>

  <div className="filter-item">
    <select
      className="filter-dropdown"
      value={selectedSalon}
      onChange={(e) => setSelectedSalon(e.target.value)}
    >
      <option value="alla">Alla salonger</option>
      <option value="1">Salong 1</option>
      <option value="2">Salong 2</option>
      <option value="IMAX">IMAX</option>
    </select>
  </div>

</section>

            {/* MOVIES */}
            <div className="movies">
                {movies && movies.map(movie => (
                    <Link
                        key={movie.id}
                        to={`/movie/${movie.id}`}
                        className="movie-card"
                    >
                        <div className="poster">
                            <img
                                src={movie.Poster}
                                alt={movie.Title}
                            />
                        </div>

                        <h3>{movie.Title}</h3>
                        <p>{movie.Genre}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}

StartPage.route = {
    path: '/',
    menuLabel: 'StartPage',
    index: 1
};
