import type { Movie } from '../interfaces/Movie';
import { mapMovieArray } from '../interfaces/Movie';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/MovieCards.css";
import "../css/Carousel.css";
import { mapToSwedishAge } from '../utils/ageLimit';

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
      // Dela upp genrerna i en array: "Horror, Sci-Fi" -> ["horror", "sci-fi"]
      const genres = movie.Genre.split(',').map(g => g.trim().toLowerCase());

      const matchGenre =
        selectedGenre === 'alla' ||
        genres.includes(selectedGenre.toLowerCase());

      const matchAge =
        selectedAge === "alla" ||
        mapToSwedishAge(movie.Rated) === selectedAge;

      const matchDate =
        !selectedDate || // om inget datum är valt -> visa alla
        viewings?.some(v => {
          if (!v.start_time) return false;
          const viewingDate = v.start_time.substring(0, 10);
          return v.movie === movie.id && viewingDate === selectedDate;
        });

      return matchGenre && matchAge && matchDate;
    }) : [];

  const ageOptions = movies
    ? ['alla', ...Array.from(new Set(movies.map(m => mapToSwedishAge(m.Rated))))] : ['alla'];


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
          <h3>Filtrera genre</h3>
          <select
            className={`filter-dropdown ${selectedGenre !== 'alla' ? 'active' : ''}`}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >

            <option value="alla">Alla</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Drama">Drama</option>
            <option value="Animation">Animation</option>
            <option value="Thriller">Thriller</option>
            <option value="Action">Action</option>
            <option value="Romance">Romance</option>
            <option value="Adventure">Adventure</option>
          </select>
        </div>

        {/* Datum */}
        <div className="filter-item">
          <h3>Välj datum</h3>
          <input
            type="date"
            className={`filter-date ${selectedDate ? 'active' : ''}`}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Åldersgräns */}
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
};

StartPage.route = {
  path: '/',
  menuLabel: 'StartPage',
  index: 1
};
