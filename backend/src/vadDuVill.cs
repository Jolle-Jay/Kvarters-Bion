namespace WebApp;

public static class vadDuVill
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }

  public static object HandleCustomBooking(HttpContext context, JsonElement bodyJson)
  {
    System.Console.WriteLine("entered handleCustomB");
    var user = Session.Get(context, "user");
    var body = JSON.Parse(bodyJson.ToString());

    System.Console.WriteLine("Body recieved");
    System.Console.WriteLine(body);
    string email;
    int? userID = null;

    if (user != null)
    {
      email = (string)user.Get("email");
      userID = (int)user.Get("id");
      System.Console.WriteLine("Loggein user" + email + "===");
    }
    else
    {
      System.Console.WriteLine("step 3 guest user");
      if (body.email == null)
      {
        System.Console.WriteLine("=== ERROR: No email provided ===");


        return RestResult.Parse(context, new { error = "Email is required." });
      }
      email = (string)body.email;
    }
    System.Console.WriteLine("=== STEP 4: Creating booking ===");

    var booking = BookingQueries.CreateBooking(
        (string)body.bookingId,
        userID,
        email,
        (int)body.viewingId
    );

    System.Console.WriteLine("=== STEP 5: Getting booking ===");
    int bookingId = (int)booking["id"];

    System.Console.WriteLine("=== STEP 6: Creating seats ===");
    var seatsList = new List<string>();
    foreach (var seat in body.seats)
    {
      seatsList.Add((string)seat);
    }

    BookingQueries.CreateBookingSeats((int)body.bookingId, seatsList, (string)body.lounges, (dynamic)body.counts);

    System.Console.WriteLine("=== STEP 7: Creating tickets ===");
    // BookingQueries.CreateTickets(bookingId, body.counts);

    System.Console.WriteLine("=== STEP 8: Success! ===");
    return RestResult.Parse(context, new
    {
      success = true,
      bookingReference = (string)body.bookingId
    });
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