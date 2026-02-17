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

    public static void CreateSeats(int bookingId, List<string> seats)
    {
        foreach (string seat in seats)
        {
            var parts = seat.Split('-');
            int seatRow = int.Parse(parts[0]);
            int number = int.Parse(parts[1]);

            SQLQuery(
                @"INSERT INTO seats (bookingId, seatRow, number, lounge)
                VALUES (@bookingId, @seatRow, @number)",
                new { bookingId, seatRow, number }
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