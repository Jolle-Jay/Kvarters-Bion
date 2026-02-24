import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../interfaces/Movie";
import { mapMovieArray } from "../interfaces/Movie";
import "../css/MoviePage.css";

export default function MoviePage() {
  const { id } = useParams(); // hämtar id från URL
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [viewings, setViewings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = mapMovieArray(
        await (await fetch("/api/movies")).json()
      );

      const foundMovie = data.find(m => m.id.toString() === id);
      setMovie(foundMovie || null);


      // nytt hämta visningstider för denna film
      if (id) {
        const viewingsRespone = await fetch(`/api/viewings?movieId=${id}`);
        const viewingsData = await viewingsRespone.json();
        setViewings(viewingsData);
        console.log('VisningTider:', viewingsData);
      }
    })();
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

  console.log(movie?.Trailer);


  //Ny funktion för att formatera datum /tid
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return time;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Idag';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Imorgon';
    } else {
      return date.toLocaleDateString('sv - SE', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  //gruppera visningstider per datum
  const groupedViewings = viewings.reduce((acc: any, viewing: any) => {
    const date = new Date(viewing.start_time).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(viewing);
    return acc;
  }, {});




  return (
    <section className="movie-detail">

      {/* TOP HERO SECTION */}
      <div className="movie-hero">

        {/* POSTER */}
        <div className="movie-poster">
          <img src={movie.Poster} alt={movie.Title} />
        </div>

        {/* TRAILER */}
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
            <p><strong>Genre:</strong> {movie.Genre}</p>
            <p><strong>Längd:</strong> {movie.Runtime}</p>
            <p><strong>Årtal:</strong> {movie.Year}</p>
            <p><strong>Åldersgräns:</strong> {movie.Rated}</p>
          </div>


          {/* hela dropdown-section här */}
          <div className="movie-description">
            <div className="dropdown-section">

              <div
                className="dropdown-header"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="description-text">
                  <h3>Om filmen</h3>
                </div>

                <span
                  className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}
                > ⋯
                </span>
              </div>

              <div
                className={`dropdown-content ${dropdownOpen ? "show" : ""}`}
              >
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

      {/* SHOWTIMES */}
      <div className="movie-times">
        <h3>Visningstider</h3>

        <div className="showtime-date">
          <h4>Idag</h4>

          <div className="showtime-card">
            <div className="showtime-poster">
              <img src={movie.Poster} alt={movie.Title} />
            </div>

            <div className="showtime-info">
              <div className="showtime-time">19:00</div>
              <div className="showtime-location">Stora Salongen</div>

              <div className="showtime-meta">
                <span className="meta-tag">{movie.Genre}</span>
                <span className="meta-tag">{movie.Runtime}</span>
                <span className="meta-tag">{movie.id}</span>
              </div>
            </div>

            <Link to={`/booking/${movie.id}`} className="book-btn">
              Boka biljett
            </Link>
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
