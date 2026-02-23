namespace WebApp;

public static class BookingQueries
{



    public static Obj CreateBooking(string BookingReference, int? userId, string email, int viewingId)
    {
        SQLQueryOne(
            @"INSERT INTO bookings (BookingReference, user, email, viewing, status)
          VALUES (@BookingReference, @userId, @email, @viewingId, 'Confirmed')",
            //@ är för att skydda mot SQL injection och hämtar värdena från new istället för att skriva dem direkt i values
            new { BookingReference, userId, email, viewingId }
        );

        return SQLQueryOne(
            "SELECT * FROM bookings WHERE BookingReference = @BookingReference",
            new { BookingReference }
        );
    }

    public static void CreateBookingSeats(int bookingId, List<string> seats, string lounge, dynamic counts)
    {
        var ticketTypes = new List<string>();

        // bygger en lista för olika biljetter vuxen först.
        for (int i = 0; i < (int)counts.adult; i++)
            ticketTypes.Add("Adult");
        for (int i = 0; i < (int)counts.senior; i++)
            ticketTypes.Add("Senior");
        for (int i = 0; i < (int)counts.child; i++)
            ticketTypes.Add("Child");

        int loungeNumber = lounge == "Stora Salongen" ? 1 : 2;

        // den hämtar viewing från bookings för att veta vem visningen tillhör och kolla om ett säte är upptaget för den visningen
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
            string ticketType = ticketTypes[i];

            System.Console.WriteLine($"Looking for: lounge={loungeNumber}, row={seatRow}, number={seatNum}");
            //skriva ut i kojnsolen för debuggiong

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
                System.Console.WriteLine($"Seat not found: lounge {loungeNumber}, row {seatRow}, number {seatNum}");
                continue;
            }

            // (INT) = tar värdet och lagrar det som en siffta 
            // tar värder ID från exstingSeat och lagrar den som en siffra i seatID
            int seatId = (int)existingSeat["id"];
            System.Console.WriteLine($"Found seat ID: {seatId}");


            // using var transaction = connection.BeginTransaction();
            // // SELECT + INSERT här inne
            // transaction.Commit();
            // kolla om sätet redan är bokat för visningen, bokar sätet genom att lägga in rad i bookingseats
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
                System.Console.WriteLine($"Seat {seatId} is already booked for this viewing.");
                continue;
            }

            // här bokas sätet genom att lägga in raden i bookingSeats
            SQLQuery(
                @"INSERT INTO bookingSeats (booking, seat, ticketType)
                VALUES (@bookingId, @seatId, @ticketType)",
                new { bookingId, seatId, ticketType }
            );

            System.Console.WriteLine($"Successfully booked seat {seatId} with ticket type {ticketType}");
        }

    }






}