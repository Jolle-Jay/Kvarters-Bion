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