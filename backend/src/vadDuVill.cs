namespace WebApp;

public static class vadDuVill
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }

  

  public static void Start()
  {
    App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
    {
      System.Console.WriteLine("Vi är inne i customBooking");
      var body = JSON.Parse(bodyJson.ToString());

      System.Console.WriteLine(body);


      return true;

    });
/* 
    if (table == "customBooking")
            {
                var user = Session.Get(context, "user");
                var body = JSON.Parse(bodyJson.ToString());

                string email;
                int? userID = null;

                if (user != null)
                {
                    email = (string)user.email;
                    userID = (int)user.id;
                }
                else
                {
                    if (body.email == null)
                    {
                        return RestResult.Parse(context, new { error = "Email is required."});
                    }
                    email = (string)body.email;
                }

                BookingQueries.CreateBooking(
                    (string)body.bookingId,
                    userID,
                    email,
                    (int)body.viewingId
                );

                var booking = BookingQueries.GetBooking((string)body.bookingId);
                int bookingId = (int)booking.id;

                BookingQueries.CreateSeats(bookingId, body.seats);
                BookingQueries.CreateTickets(bookingId, body.counts);

                return RestResult.Parse(context, new
                {
                    success = true,
                    bookingReference = (string)body.bookingId
                });
            }
 */
  }
}