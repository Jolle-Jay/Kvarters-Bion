import App from '../App';
import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';
import { useState, useEffect } from 'react';
import "../css/MovieCard.css";
import "../css/Carusel.css";

export default function StartPage() {

    const [movies, setMovies] = useState<Movie[]>([]);
    const [genreFilter, setGenreFilter] = useState<string>('alla');
    const [salongFilter, setSalongFilter] = useState<string>('alla');

    useEffect(() => {
        (async () => {
            const data = await (await fetch('/api/movies')).json();
            setMovies(mapMovieArray(data));
        })();
    }, []);

    App();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // filtrering
    // const filteredMovies = movies.filter(movie => {
    //     const genreMatch = genreFilter === 'alla' || movie.Genre === genreFilter;
    //     const salongMatch = salongFilter === 'alla' || movie.Salong === salongFilter;
    //     return genreMatch && salongMatch;
    // });

    return (
        <main>

            {/* HERO + CAROUSEL */}
            <section className="hero">
                <div className="carousel">
                    <div className="carousel-track">
                        <div className="group">
                            {movies.map(movie => (
                                <img
                                    key={`carousel1-${movie.id}`}
                                    src={movie.Poster}
                                    alt={`${movie.Title} movie poster`}
                                />
                            ))}
                        </div>

                        {/* Duplicate group for infinite scroll */}
                        <div aria-hidden className="group">
                            {movies.map(movie => (
                                <img
                                    key={`carousel2-${movie.id}`}
                                    src={movie.Poster}
                                    alt=""
                                />
                            ))}
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
                    <select
                        className="filter-dropdown"
                        value={genreFilter}
                        onChange={(e) => setGenreFilter(e.target.value)}
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
                    <h3>Salong</h3>
                    <select
                        className="filter-dropdown"
                        value={salongFilter}
                        onChange={(e) => setSalongFilter(e.target.value)}
                    >
                        <option value="alla">Alla</option>
                        <option value="Lilla Salongen">Lilla Salongen</option>
                        <option value="Stora Salongen">Stora Salongen</option>
                    </select>
                </div>

            </section>

            {/* MOVIE GRID */}
            <section className="movies">
                {/* {filteredMovies.map(movie => (
                    <a
                        key={movie.id}
                        className="movie-card"
                        href={`/filmer/${movie.id}`}
                    >
                        <div className="poster">
                            <img
                                src={movie.Poster}
                                alt={`${movie.Title} Poster`}
                            />
                        </div>

                        <h3>{movie.Title}</h3>
                        <p>{movie.Genre}</p>
                        <p className="salong">{movie.Salong}</p>
                        <span>{movie.Time}</span>
                    </a>
                ))} */}
            </section>

        </main>
    );
}

StartPage.route = {
    path: '/',
    menuLabel: 'StartPage',
    index: 1
};
