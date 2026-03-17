import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/MovieCards.css";
import "../css/Carousel.css";
import { mapToSwedishAge, mapToSwedishGenre } from '../utils/mapToSwedish';

export default function StartPage() {

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // månader börjar på 0
  const dd = String(today.getDate()).padStart(2, '0');

  const [selectedDate, setSelectedDate] = useState('');
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('alla');
  const [selectedAge, setSelectedAge] = useState<string>('alla');
  const [viewings, setViewings] = useState<{ movie: number; start_time: string; }[] | null>(null);

  // Fetch movies
  useEffect(() => {
    (async () => {
      setMovies(mapMovieArray(await (await fetch('/api/movies')).json()));
    })();
  }, []);

  // Fetch viewings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/viewings/all');
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const viewingsData = await res.json();
        console.log("Viewings fetched:", viewingsData); // <-- Felsökning
        setViewings(viewingsData);
      } catch (err) {
        console.error("Error fetching viewings:", err);
      }
    })();
  }, []);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Genre filtering only
  const filteredMovies = movies
    ? movies.filter(movie => {

      const matchGenre =
        selectedGenre === 'alla' ||
        mapToSwedishGenre(movie.Genre)
          .split(", ")
          .includes(selectedGenre);

      const matchAge =
        selectedAge === "alla" ||
        mapToSwedishAge(movie.Rated) === selectedAge;

      const matchDate =
        !selectedDate || //if no date is chosen -> view all
        viewings?.some(v => {
          if (!v.start_time) return false;
          const viewingDate = v.start_time.substring(0, 10);
          return v.movie === movie.id && viewingDate === selectedDate;
        });

      return matchGenre && matchAge && matchDate;
    }) : [];

  const ageOptions = movies
    ? ['alla', ...Array.from(new Set(movies.map(m => mapToSwedishAge(m.Rated))))] : ['alla'];
  
  const genreOptions = movies
  ? [
      'alla',
      ...Array.from(
        new Set(
          movies.flatMap(movie =>
            mapToSwedishGenre(movie.Genre).split(", ")
          )
        )
      )
    ]
  : ['alla'];


  return (
    <main>
      {/* HERO + CAROUSEL */}
      <section className="startpage-hero">

        <div className="carousel">
          <div className="carousel-track">
            <div className="group">
              {movies && movies.map(({ Poster }) => <img src={Poster} alt="poster of" />)}
            </div>

            {/* Duplicate group for infinite scroll animation */}
            <div className="group" aria-hidden>
              {movies && movies.map(({ Poster }) => <img src={Poster} alt="poster of" />)}
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

        {/* Genre */}
        <div className="filter-item">
          <h3>Genre</h3>
          <select
            className={`filter-dropdown ${selectedGenre !== 'alla' ? 'active' : ''}`}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genreOptions.map(genre => (
              <option key={genre} value={genre}>
                {genre === 'alla' ? 'Alla genrer' : genre}
              </option>
            ))}
          </select>
        </div>

        {/* Datum */}
        <div className="filter-item">
          <h3>Datum</h3>
          <input
            type="date"
            className={`filter-date ${selectedDate ? 'active' : ''}`}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Age limit */}
        <div className="filter-item">
          <h3>Åldersgräns</h3>
          <select
            className={`filter-dropdown ${selectedAge !== 'alla' ? 'active' : ''}`}
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
          >
            {ageOptions.map(age => (
              <option key={age} value={age}>
                {age === 'alla' ? 'Alla åldrar' : age}
              </option>
            ))}
          </select>
        </div>

      </section>

      {/* MOVIES */}
      <div className="movies">
        {filteredMovies.map(movie => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}?date=${selectedDate}`}
            className="movie-card"
          >
            <div className="poster">
              <img
                src={movie.Poster}
                alt={movie.Title}
              />
            </div>

            <h3>{movie.Title}</h3>
            <p>{mapToSwedishGenre(movie.Genre)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
};

StartPage.route = {
  path: '/',
  menuLabel: 'StartPage',
  index: 1
};
