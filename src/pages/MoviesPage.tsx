import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Movie } from "../interfaces/Movie";
import { mapMovieArray } from "../interfaces/Movie";

export default function MoviePage() {
    const { id } = useParams(); // hämtar id från URL
    const [movie, setMovie] = useState<Movie | null>(null);

    useEffect(() => {
        (async () => {
            const data = mapMovieArray(
                await (await fetch("/api/movies")).json()
            );

            const foundMovie = data.find(m => m.id.toString() === id);
            setMovie(foundMovie || null);
        })();
    }, [id]);

    if (!movie) return <p>Laddar film...</p>;

    return (
        <main className="movie-page">
            <section className="movie-hero">
                <img src={movie.Poster} alt={movie.Title} />
                <div className="movie-info">
                    <h1>{movie.Title}</h1>
                    <p><strong>Genre:</strong> {movie.Genre}</p>
                    <p><strong>Längd:</strong> {movie.Runtime}</p>
                    <p><strong>Beskrivning:</strong> {movie.Description}</p>
                </div>
            </section>
        </main>
    );
}

MoviePage.route = {
    path: "/movie/:id",
    menuLabel: "Movie",
    index: 2
};
