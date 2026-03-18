namespace WebApp;

public static class BookingQueries
{
  public static Obj CreateBooking(string BookingReference, int? userId, string email, int viewingId)
  {
    SQLQueryOne(
        @"INSERT INTO bookings (BookingReference, user, email, viewing, status)
          VALUES (@BookingReference, @userId, @email, @viewingId, 'Confirmed')",
        //@ is to protect against SQL injection and fetch the values from new instead of writing them into values directly
        new { BookingReference, userId, email, viewingId }
    );

    return SQLQueryOne(
        "SELECT * FROM bookings WHERE BookingReference = @BookingReference",
        new { BookingReference }
    );
  }

  public static void CreateBookingSeats(int bookingId, List<string> seats, string lounge, dynamic counts)
  {
    var ticketTypes = new List<int>();

    // builds a list for different tickets, adult first
    for (int i = 0; i < (int)counts.adult; i++)
      ticketTypes.Add(1);
    for (int i = 0; i < (int)counts.senior; i++)
      ticketTypes.Add(2);
    for (int i = 0; i < (int)counts.child; i++)
      ticketTypes.Add(3);

    int loungeNumber = lounge == "Stora Salongen" ? 1 : 2;

    // it fetches viewing från bookings in order to know whom the viewing belongs to and checks if the seat is unavailable for the specific viewing. 
    var currentBooking = SQLQueryOne(
        "SELECT viewing FROM bookings WHERE id = @bookingId",
        new { bookingId }
    );
    int viewingId = (int)currentBooking["viewing"];


    for (int i = 0; i < seats.Count; i++)
    {
      var parts = seats[i].Split('-');
      int seatRow = int.Parse(parts[0]);
      int seatNum = int.Parse(parts[1]);
      int ticketType = ticketTypes[i];

      // kollar om sätena finns i seats och väljer dem istället för att försöka sätta in som vi gjorde i början
      var existingSeat = SQLQueryOne(
           @"SELECT * FROM seats
                WHERE lounge = @loungeNumber
                AND seatRow = @seatRow
                AND number = @seatNum",
           new { loungeNumber, seatRow, seatNum }
       );

      if (existingSeat == null)
      {
        continue;
      }

      // (int) = takes the ID values and parse to an int
      int seatId = (int)existingSeat["id"];

      // checks if the seat already is booked for the specific viewing
      var alreadyBooked = SQLQueryOne(
          @"SELECT * FROM bookingSeats bs
                INNER JOIN bookings b ON bs.booking = b.id
                WHERE bs.seat = @seatId
                AND b.viewing = @viewingId
                AND b.status = 'Confirmed'",

          new { seatId, viewingId }
      );

      if (alreadyBooked != null)
      {
        continue;
      }

      //  adds a row in bookingSeats in order to book the seat 
      SQLQuery(
          @"INSERT INTO bookingSeats (booking, seat, ticketType)
                VALUES (@bookingId, @seatId, @ticketType)",
          new { bookingId, seatId, ticketType }
      );

    }

  }

  // for canceling booking

  public static void CancelBooking(string bookingReference)
  {
    // Change booking status to 'Cancelled'
    SQLQuery(
        @"UPDATE bookings 
              SET status = 'Cancelled' 
              WHERE BookingReference = @bookingReference",
        new { bookingReference }
    );
  }
}