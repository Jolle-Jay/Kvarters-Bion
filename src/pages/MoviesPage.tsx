import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../interfaces/Movie";
import { mapMovieArray } from "../interfaces/Movie";
import "../css/MoviePage.css";

interface Viewing {
  id: number;
  movie: number;
  lounge: string;
  start_time: string;
}

export default function MoviePage() {
  const { id } = useParams(); // hämtar id från URL
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      const data = mapMovieArray(
        await (await fetch("/api/movies")).json()
      );

      const foundMovie = data.find(m => m.id.toString() === id);
      setMovie(foundMovie || null);
    })();
  }, [id]);

  // Hämta visningstider från databasen
  useEffect(() => {
    const fetchViewings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/viewings/all');
        if (response.ok) {
          const allViewings = await response.json();
          // Filtrera visningstider för denna film
          const filmViewings = allViewings.filter((v: Viewing) => 
            v.movie === parseInt(id || '0')
          );
          setViewings(filmViewings);
        }
      } catch (err) {
        console.error('Fel vid hämtning av visningstider:', err);
        setViewings([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchViewings();
    }
  }, [id]);

  if (!movie) return <p>Laddar film...</p>;

  const getEmbedUrl = (url: string) => {
  if (!url) return "";

  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
  );

  return videoIdMatch
    ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
    : url;
};

  return (
    <section className="movie-detail">

      {/* TRAILER (tillfällig placeholder om du ej har trailer i DB) */}
      <div className="movie-trailer">
        <iframe
          src={getEmbedUrl(movie.Trailer)}
          title={`${movie.Title} Trailer`}
          allowFullScreen
/>
      </div>

      {/* POSTER + SHOWTIMES */}
      <div className="movie-poster-column">
        <img src={movie.Poster} alt={movie.Title} />

        <div className="movie-times">
          <h3>Visningstider</h3>

          {/* Visa visningstider från databasen */}
          <div className="showtime-date">
            <h4>Idag</h4>

            {loading ? (
              <p>Laddar visningstider...</p>
            ) : viewings.length === 0 ? (
              <p>Inga visningstider tillgängliga för denna film.</p>
            ) : (
              viewings.map((viewing) => (
                <div key={viewing.id} className="showtime-card">
                  <div className="showtime-poster">
                    <img src={movie.Poster} alt={movie.Title} />
                  </div>

                  <div className="showtime-info">
                    <div className="showtime-time">{viewing.start_time}</div>
                    <div className="showtime-location">{viewing.lounge}</div>

                    <div className="showtime-meta">
                      <span className="meta-tag">{movie.Genre}</span>
                      <span className="meta-tag">{movie.Runtime}</span>
                      <span className="meta-tag">
                        {movie.id}
                      </span>
                    </div>
                  </div>

                  <Link to={`/booking?movieId=${movie.id}&showtime=${viewing.start_time}`} className="book-btn">
                    Boka biljett
                  </Link>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* MOVIE INFO */}
      <div className="movie-info">
        <h1>{movie.Title}</h1>

        <div className="movie-meta">
          <p><strong>Genre:</strong> {movie.Genre}</p>
          <p><strong>Längd:</strong> {movie.Runtime}</p>
          <p><strong>Årtal:</strong> {movie.Year}</p>
          <p><strong>Åldersgräns:</strong> {movie.Rated}</p>
        </div>

        <div className="movie-description">
          <div className="dropdown-section">

            <div
              className="dropdown-header"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="description-text">
                <h3>Om filmen</h3>
                <p>{movie.Plot}</p>
              </div>

              <span
                className={`dropdown-menu ${dropdownOpen ? "open" : ""
                  }`}
              >
                ⋯
              </span>
            </div>

            <div
              className={`dropdown-content ${dropdownOpen ? "show" : ""
                }`}
            >
              <div className="info-row">
                <span className="info-label">Regissör:</span>
                <span className="info-value">{movie.Director}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Skådespelare:</span>
                <span className="info-value">{movie.Actors}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Språk:</span>
                <span className="info-value">{movie.Language}</span>
              </div>

              <div className="info-row">
                <span className="info-label">IMDb:</span>
                <span className="info-value">
                  ⭐ {movie.imdbRating} ({movie.imdbVotes} röster)
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );

}

MoviePage.route = {
  path: "/movie/:id",
  menuLabel: "Movie",
  index: 2
};
