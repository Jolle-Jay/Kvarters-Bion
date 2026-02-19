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

    System.Console.WriteLine("=== Checking body properties ===");
    System.Console.WriteLine("body is null? " + (body == null));
    if (body != null)
    {
      System.Console.WriteLine("body.movie exists? " + (body.movie != null));
      System.Console.WriteLine("body.viewing exists? " + (body.viewing != null));
      System.Console.WriteLine("body.lounges exists? " + (body.lounges != null));
    }

    string email;
    int? userID = null;

    if (user != null)
    {
      email = (string)user["email"];
      userID = (int)user["id"];
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
    var movie = SQLQueryOne(
        @"SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.Title') = @filmTitle",
        new { filmTitle = "Alien"/* (string)body.film */ }
    );

    if (movie == null)
    {
      return RestResult.Parse(context, new { error = "Movie not Found"});
    }
    int movieId = (int)movie["id"];

    System.Console.WriteLine($"Movie ID: {movieId}");
    
    // STEP 5: Find Lounge ID
    System.Console.WriteLine("=== STEP 5: Finding lounge ID ===");
    var lounge = SQLQueryOne(
      "SELECT id FROM lounges WHERE name = @loungeName",
      new { loungeName = (string)body.lounges }
    );
    int loungeId = (int)lounge["id"];

    System.Console.WriteLine($"Lounge ID: {loungeId}");


    string viewingTest = "2026-03-07 22:00:00";
    // STEP 6: Find or create viewing
    System.Console.WriteLine("=== Step 6: Finding/Creating viewing ===");
    var viewing = SQLQueryOne(
      @"SELECT * FROM viewings
        WHERE movie = @movieId
        AND lounge = @loungeId
        AND start_time = @startTime",
      new { movieId, loungeId, startTime = viewingTest /* (string)body.viewing */ }
    );

    System.Console.WriteLine($"Viewing ID: {viewing}");

    if (viewing == null)
    {
      System.Console.WriteLine("=== Creating new viewing ===");
      SQLQueryOne(
        @"INSERT INTO viewing (movie, lounge, start_time)
          VALUES (@movieId, @loungeId, @startTime)",
        new {movieId, loungeId, startTime = viewingTest }
      );
    }
    viewing = SQLQueryOne(
      @"SELECT * FROM viewings
      WHERE movie = @movieId
      AND lounge = @loungeId
      AND start_time = @startTime",
      new { movieId, loungeId, startTime = viewingTest }
    );

    int viewingId = (int)viewing["id"];
    System.Console.WriteLine($"=== Using Viewing ID: {viewingId} ===");

    // STEP 7: Create booking
    System.Console.WriteLine("=== STEP 7: Creating booking ===");
    var booking = BookingQueries.CreateBooking(
        (string)body.bookingId,
        userID,
        email,
        movieId
    );

    System.Console.WriteLine("=== STEP 8: Getting booking ID ===");
    int bookingId = (int)booking["id"];

    // STEP 9: Create booking seats
    System.Console.WriteLine("=== STEP 9: Creating booking seats ===");
    var seatsList = new List<string>();
    foreach (var seat in body.seats)
    {
      seatsList.Add((string)seat);
    }

    BookingQueries.CreateBookingSeats(bookingId, seatsList, (string)body.lounges, (dynamic)body.counts);

    System.Console.WriteLine("=== STEP 10: Success! ===");
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