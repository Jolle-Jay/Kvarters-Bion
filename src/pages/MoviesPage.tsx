import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// ...existing code...
import type { Movie } from "../interfaces/Movie";
import { mapMovieArray } from "../interfaces/Movie";
import "../css/MoviePage.css";
import { mapToSwedishAge, mapToSwedishGenre } from "../utils/mapToSwedish";

export default function MoviePage() {
  const { id } = useParams(); // get id from url
  const location = useLocation(); 
  const queryParams = new URLSearchParams(location.search);
  const initialDate = queryParams.get("date");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());
  const [viewings, setViewings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = mapMovieArray(
        await (await fetch("/api/movies")).json()
      );

      const foundMovie = data.find(m => m.id.toString() === id);
      setMovie(foundMovie || null);


      // new get viewings for this movie
      if (id) {
        const viewingsRespone = await fetch(`/api/viewings?movieId=${id}`);
        const viewingsData = await viewingsRespone.json();
        setViewings(viewingsData);
      }
    })();
  }, [id]);

   const startDate = initialDate ? new Date(initialDate) : new Date();
  startDate.setHours(0, 0, 0, 0);

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

  console.log(movie?.Trailer);


  // new function for formating date and time 
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return time;
  };

  return (
    <section className="movie-detail">

      {/* TOP HERO SECTION */}
      <div className="movie-hero">
        <div className="movie-poster">
          <img src={movie.Poster} alt={movie.Title} />
        </div>

        <div className="movie-trailer">
          <iframe
            src={getEmbedUrl(movie.Trailer)}
            title={`${movie.Title} Trailer`}
            allowFullScreen
          />
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="movie-content">
        <div className="movie-info">
          <h1>{movie.Title}</h1>

          <div className="movie-meta">
            <p><strong>Genre:</strong> {mapToSwedishGenre(movie.Genre)}</p>
            <p><strong>Längd:</strong> {movie.Runtime}</p>
            <p><strong>Årtal:</strong> {movie.Year}</p>
            <p><strong>Åldersgräns:</strong> {mapToSwedishAge(movie.Rated)}</p>
          </div>

          <div className="movie-description">
            <div className="dropdown-section">
              <div
                className="dropdown-header"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="description-text">
                  <h3>Om filmen</h3>
                </div>

                <span className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                  ⋯
                </span>
              </div>

              <div className={`dropdown-content ${dropdownOpen ? "show" : ""}`}>
                <p>{movie.Plot}</p>

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
      </div>

      {/* Week view for viewings  */}
      <div className="movie-times">
        <h3>Visningstider</h3>
        {viewings.length === 0 ? (
          <p>Inga visningstider tillgängliga</p>
        ) : (
         <div className="week-view">
  {[...Array(7)].map((_, i) => {
    // Create date for every day based on startDate
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    const dayKey = dayDate.toDateString();

    // Weekday and day/mounth for viewings 
    const dayLabel = dayDate.toLocaleDateString('sv-SE', { weekday: 'long' });
    const dayNumber = dayDate.toLocaleDateString('sv-SE', { day: '2-digit', month: '2-digit' });

    // Filter viewings for this day 
    const dayViewings = viewings.filter(v => {
      const vDate = new Date(v.start_time);
      return vDate.toDateString() === dayKey;
    });

    return (
      <div key={dayKey} className="week-day">
        <div className="week-day-label">{dayLabel} ({dayNumber})</div>

        {dayViewings.length === 0 ? (
          <div className="showtime-box info">Inga tider</div>
        ) : (
          dayViewings.map(viewing => {
            // Chek if viewings matches initialDate from query-param
            const isSelected = initialDate && viewing.start_time.startsWith(initialDate);

            return (
              <div
                key={viewing.id}
                className={`showtime-box ${isSelected ? 'highlighted' : ''}`}
                onClick={() => window.location.href = `/booking/${movie.id}?showtime=${viewing.id}`}
                title={`Boka ${formatDateTime(viewing.start_time)} (${viewing.lounge === 1 ? 'Stora Salongen' : 'Lilla Salongen'})`}
              >
                <div className="salong">{viewing.lounge === 1 ? 'Stora Salongen' : 'Lilla Salongen'}</div>
                <div className="tid">{formatDateTime(viewing.start_time)}</div>
                <div className="info">{movie.Title} ({movie.Runtime})</div>
              </div>
            );
          })
        )}
      </div>
    );
  })}
</div>
        )}
      </div>
    </section>
  );
}

MoviePage.route = {
  path: "/movie/:id",
  menuLabel: "Movie",
  index: 2
};
