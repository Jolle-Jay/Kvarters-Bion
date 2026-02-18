namespace WebApp;

public static class BookingQueries
{



    public static Obj CreateBooking(string BookingReference, int? userId, string email, int viewingId, string lounges)
    {
        SQLQueryOne(
            @"INSERT INTO bookings (BookingReference, user, email, viewing, status)
            VALUES (@BookingReference, @user, @email, @viewing, 'Confirmed'),
            INSERT INTO lounges (name)",
            new { BookingReference, userId, email, viewingId, lounges }
        );

        return SQLQueryOne("SELECT * FROM bookings WHERE booking_reference = @bookingReference",
            new { BookingReference }
        );
    }

    public static void CreateBookingSeats(int bookingId, List<string> seats, string lounge, dynamic counts)
    {
        var ticketTypes = new List<string>();

        // Build list of ticket types in order: Adult first, then Senior, then Child
        for (int i = 0; i < (int)counts.adult; i++)
            ticketTypes.Add("Adult");
        for (int i = 0; i < (int)counts.senior; i++)
            ticketTypes.Add("Senior");
        for (int i = 0; i < (int)counts.child; i++)
            ticketTypes.Add("Child");

        int loungeNumber = lounge == "Stora Salongen" ? 1 : 2;

        //get the viewingId from the current booking (need to check availability)
        var currentBooking = SQLQueryOne(
            "SELECT viewing FROM bookings WHERE id = @bookingId",
            new { bookingId }
        );
        int viewingId = (int)currentBooking.Get("viewing");

        for (int i = 0; i < seats.Count; i++)
        {
            var parts = seats[i].Split('-');
            int seatRow = int.Parse(parts[0]);
            int seatNum = int.Parse(parts[1]);
            string ticketType = ticketTypes[i];

            System.Console.WriteLine($"Looking for: lounge={loungeNumber}, row={seatRow}, number={seatNum}");
            // Find existing seat in seats table

            var existingSeat = SQLQueryOne(
                 @"SELECT * FROM seats
                WHERE lounge = @loungeNumber
                AND seatRow = @seatRow
                AND number = @seatNum",
                 new { loungeNumber, seatRow, seatNum }
             );

            if (existingSeat == null)
            {
                System.Console.WriteLine($"Seat not found: lounge {loungeNumber}, row {seatRow}, number {seatNum}");
                continue;
            }

            int seatId = (int)existingSeat.Get("id");
            System.Console.WriteLine($"Found seat ID: {seatId}");

            //Check if seat is already booked for THIS viewing
            var alreadyBooked = SQLQueryOne(
                @"SELECT * FROM bookingSeats bs
                INNER JOIN bookings b ON bs.booking = b.id
                WHERE bs.seat = @seatId
                AND b.viewing = @viewingId
                AND b.status = 'Confirmed'",

                new { seatId, viewingId }
            );
        }

    }

    public static void CreateTickets(int bookingId, dynamic counts)
    {
        var prices = new { adult = 140, senior = 120, child = 80 };

        for (int i = 0; i < (int)counts.adult; i++)
        {
            SQLQuery(
                @"INSERT INTO ticketTypes (id, name, price)
                VALUES (@id, 'Adult', @price)",
                new { bookingId, price = prices.adult }
            );
        }

        for (int i = 0; i < (int)counts.senior; i++)
        {
            SQLQuery(
                @"INSERT INTO ticketTypes (id, name, price)
                VALUES (@id, 'Senior', @price)",
                new { bookingId, price = prices.senior }
            );
        }

        for (int i = 0; i < (int)counts.child; i++)
        {
            SQLQuery(
                @"INSERT INTO ticketTypes (id, name, price)
                VALUES (@id, 'Child', @price)",
                new { bookingId, price = prices.child }
            );
        }
    }




}