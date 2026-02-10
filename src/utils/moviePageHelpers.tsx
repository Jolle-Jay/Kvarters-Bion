import type movie from '../interfaces/Movie.ts';

export interface SortOption {
  Genre: string;
  key: keyof movie,
  order: number;
}

export function getHelpers(moviesJson: any) {

  const movies = moviesJson as movie[];

  const Genre = [
    'All (' + movies.length + ')',
    ...movies
      // map to category arrays from each movie
      .map(x => x.Genre)
      // flatten to one array
      .flat()
      // add count of movies in to each category
      .map((x, _i, a) => x + ' ('
        + a.filter(y => x === y).length + ')')
      // remove duplicates
      .filter((x, i, a) => a.indexOf(x) === i)
      // sort (by Title)
      .sort()
  ];

  const sortOptions: SortOption[] = [
    { Genre: 'Runtime (low to high)', key: 'Runtime', order: 1 },
    { Genre: 'Runtime (high to low)', key: 'Runtime', order: -1 },
    { Genre: 'movie Title (a-z)', key: 'Title', order: 1 },
    { Genre: 'movie Title (z-a)', key: 'Title', order: -1 }
  ];

  const sortGenres = sortOptions
    .map(x => x.Genre);

  return {
    movies,
    Genre,
    sortOptions,
    sortGenres
  };
}