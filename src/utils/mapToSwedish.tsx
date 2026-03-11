  // översätter imdb åldersgräns till svensk standard
export const mapToSwedishAge = (rating: string) => {
    switch (rating) {
      case "G":
      case "Approved":
        return "Barntillåten";

      case "TV-Y7":
      case "PG":
        return "7+";

      case "PG-13":
        return "11+";

      case "R":
        return "15+";

      case "N/A":
        return "Ingen åldersgräns";

      default:
        return "Ingen åldersgräns";
    }
};
  
export const mapToSwedishGenre = (GenreString: string) => {
  const genres = GenreString.split(",").map(g => g.trim());

  const translated = genres.map(g => {
    switch (g) {
      case "Comedy":
        return "Komedi";
      case "Musical":
        return "Musikal";
      case "Family":
        return "Familj";
      case "Biography":
        return "Biografi";
      case "History":
        return "Historia";
      case "Horror":
        return "Skräck";
      case "Animation":
        return "Animerat";
      case "Crime":
        return "Deckare";
      case "Romance":
        return "Romantik";
      case "Adventure":
        return "Äventyr";
      default:
        return g;
    }
  });
  return translated.join(", ");
};