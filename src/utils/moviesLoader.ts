export default async function moviesLoader({ params }: any) {
  let url = '/api/movies';
  if (params.slug) { url += '?slug=' + params.slug; }
  return {
    movies:
      await (await fetch(url)).json()
  };
};