

export interface MovieJson {
  Title: string;
  Year: number;
  Rated: string;
  Released: string;
  Runtime: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Genre: string[];
}

export interface MovieDB {
  id: number;
  movies_raw: MovieJson;
}

export interface Movie extends MovieJson {
  id: number;
}

// creating a function that returns the mapping as an aray of movies_raw
// returns the id and movies raw format.  
// the <...> is for the spliting of the movie_raw structure. 
export function mapMovieArray(rawArray: MovieDB[]) {
  return rawArray.map(({ id, movies_raw }) => ({ id, ...movies_raw }));
}

/*export function mapMovie(dbMovie: MovieDB): Movie {
  return {
    id: dbMovie.id,
    Title: dbMovie.movies_raw.Title,
    Year: Number(dbMovie.movies_raw.Year),
    Rated: dbMovie.movies_raw.Rated,
    Released: dbMovie.movies_raw.Released,
    Runtime: dbMovie.movies_raw.Runtime,
    Director: dbMovie.movies_raw.Director,
    Actors: dbMovie.movies_raw.Actors,
    Plot: dbMovie.movies_raw.Plot,
    Poster: dbMovie.movies_raw.Poster,
    Genre: dbMovie.movies_raw.Genre.split(", ")
  };
}*/
