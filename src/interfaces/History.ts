export interface Booking {
  id: string;
  userID?: number;
  userEmail?: string;
  movieTitle: string;
  date: string;
  seats?: string | string[];
  BookingReference: string;
  email: string;
  status: string;
}
