import App from '../App';
import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';
import { useState, useEffect } from 'react';
import "../css/MovieCards.css";
import "../css/Carousel.css";
import "../css/Stars.css";

export default function StartPage() {

    const [movies, setMovies] = useState<Movie[] | null>(null);

    useEffect(() => {
        (async () => {
            setMovies(mapMovieArray(await (await fetch('/api/movies')).json()));
        })();
    }, []);

    console.log(movies);
    // scroll to top when the route changes
    App();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    //map movie and add al the values wished to execute
    return <main>
        <section className='hero'>
            <div className='carousel'>
                <div className="carousel-track">
                    <div className="group">
                        {movies && movies.map(({Poster }) => <img src={Poster} alt="poster of" />)}
                    </div>
                </div>
            </div>
        
            <div className="hero-sub">
                <p>Premiärer • Klassiker • IMAX-känsla</p>
                <span className='stars'>★ ★ ★ ★ ★</span>
            </div>
        </section>
        <div className='filter'>

        </div>
        <div className="movie-list">
            {movies && movies.map(({ Title, id, Poster }) => <article key={id} className="movie-card">
                <h3>{Title}</h3>
                <img src={Poster} alt="poster of" />
            </article>)}
        </div>;
    </main>
};

StartPage.route = {
    path: '/',
    menuLabel: 'StartPage',
    index: 1
};
