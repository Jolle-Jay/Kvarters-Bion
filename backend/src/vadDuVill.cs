namespace WebApp;

public static class vadDuVill
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }



  public static object HandleCustomBooking(HttpContext context, JsonElement bodyJson)
  {
    System.Console.WriteLine("=== STEP 1: Entered HandleCustomBooking ===");
    var user = Session.Get(context, "user");
    var body = JSON.Parse(bodyJson.ToString());

    System.Console.WriteLine("=== STEP 2: Body received ===");
    System.Console.WriteLine(body);

    string email;
    int? userID = null;

    if (user != null)
    {
      email = (string)user.Get("email");
      userID = (int)user.Get("id");
      System.Console.WriteLine("=== STEP 3: Logged in user: " + email + " ===");
    }
    else
    {
      System.Console.WriteLine("=== STEP 3: Guest user ===");
      if (body.email == null)
      {
        System.Console.WriteLine("=== ERROR: No email provided ===");
        return RestResult.Parse(context, new { error = "Email is required." });
      }
      email = (string)body.email;
    }

    // STEP 4: Find or create viewing
    System.Console.WriteLine("=== STEP 4: Finding/creating viewing ===");
    var viewing = SQLQueryOne(
        @"SELECT * FROM viewings 
          WHERE film = @film 
          AND viewing = @viewing 
          AND lounge = @lounges",
        new { film = (string)body.film, viewing = (string)body.viewing, lounges = (string)body.lounges }
    );

    int viewingId;
    if (viewing == null)
    {
      System.Console.WriteLine("=== Creating new viewing ===");
      SQLQueryOne(
          @"INSERT INTO viewings (film, viewing, lounge) 
              VALUES (@film, @viewing, @lounges)",
          new { film = (string)body.film, viewing = (string)body.viewing, lounges = (string)body.lounges }
      );

      viewing = SQLQueryOne(
          @"SELECT * FROM viewings 
              WHERE film = @film 
              AND viewing = @viewing 
              AND lounge = @lounges",
          new { film = (string)body.film, viewing = (string)body.viewing, lounges = (string)body.lounges }
      );
    }

    viewingId = (int)viewing.Get("id");
    System.Console.WriteLine("=== Using viewing ID: " + viewingId + " ===");

    // STEP 5: Create booking
    System.Console.WriteLine("=== STEP 5: Creating booking ===");
    var booking = BookingQueries.CreateBooking(
        (string)body.bookingId,
        userID,
        email,
        viewingId
    );

    System.Console.WriteLine("=== STEP 6: Getting booking ID ===");
    int bookingId = (int)booking["id"];

    // STEP 7: Create booking seats
    System.Console.WriteLine("=== STEP 7: Creating booking seats ===");
    var seatsList = new List<string>();
    foreach (var seat in body.seats)
    {
      seatsList.Add((string)seat);
    }

    BookingQueries.CreateBookingSeats(bookingId, seatsList, (string)body.lounges, (dynamic)body.counts);

    System.Console.WriteLine("=== STEP 8: Success! ===");
    return RestResult.Parse(context, new
    {
      success = true,
      bookingReference = (string)body.bookingId,
      email
    });
  }

  public static void Start()
  {
    App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
{
  System.Console.WriteLine("Vi är inne i customBooking");
  return vadDuVill.HandleCustomBooking(context, bodyJson);  // ← Call the actual function!
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