

export interface MovieJson {
  Title: string;
  Year: number;
  Rated: string;
  Trailer: string;
  Released: string;
  Runtime: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Genre: string;
  Language: string;
  imdbRating: string;
  imdbVotes: string;
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