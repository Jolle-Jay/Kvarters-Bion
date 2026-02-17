namespace WebApp;

public static class BookingQueries
{



    public static Obj CreateBooking(string bookingReference, int? userId, string email, int viewingId)
    {
        SQLQueryOne(
            @"INSERT INTO bookings (booking_reference, user, email, viewing, status)
            VALUES (@bookingReference, @user, @email, @viewing, 'Confirmed')",
            new { bookingReference, userId, email, viewingId }
        );

        return SQLQueryOne("SELECT * FROM bookings WHERE booking_reference = @bookingReference",
            new { bookingReference }
        );
    }

    public static void CreateSeats(int bookingId, List<string> seats)
    {
        foreach (string seat in seats)
        {
            var parts = seat.Split('-');
            int row = int.Parse(parts[0]);
            int seatNumber = int.Parse(parts[1]);

            SQLQuery(
                @"INSERT INTO seats (id, seatRow, number)
                VALUES (@id, @seatRow, @number)",
                new { bookingId, row, seatNumber }
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