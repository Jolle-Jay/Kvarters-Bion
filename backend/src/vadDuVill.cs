namespace WebApp;

public static class vadDuVill
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }



  public static object HandleCustomBooking(HttpContext context, JsonElement bodyJson)
  {
    try
    {
      System.Console.WriteLine("=== STEP 1: Entered HandleCustomBooking ===");
      var user = Session.Get(context, "user");
      var body = JSON.Parse(bodyJson.ToString());

      System.Console.WriteLine("=== STEP 2: Body received ===");
      System.Console.WriteLine(JSON.Stringify(body));

      // Validera alla required fields
      System.Console.WriteLine("=== Validating required fields ===");
      if (body == null)
      {
        return RestResult.Parse(context, new { error = "Body is null" });
      }
      
      if (body.film == null) return RestResult.Parse(context, new { error = "film is required" });
      if (body.viewing == null) return RestResult.Parse(context, new { error = "viewing is required" });
      if (body.seats == null) return RestResult.Parse(context, new { error = "seats is required" });
      if (body.lounges == null) return RestResult.Parse(context, new { error = "lounges is required" });
      if (body.counts == null) return RestResult.Parse(context, new { error = "counts is required" });
      if (body.bookingId == null) return RestResult.Parse(context, new { error = "bookingId is required" });
      if (body.email == null && user == null) return RestResult.Parse(context, new { error = "email is required for guests" });
      if (body.totalPrice == null) return RestResult.Parse(context, new { error = "totalPrice is required" });
      
      System.Console.WriteLine("✅ All required fields present");
      
      try { System.Console.WriteLine("body.film: " + body.film.ToString()); } catch (Exception e) { System.Console.WriteLine("ERROR: body.film - " + e.Message); }
      try { System.Console.WriteLine("body.viewing: " + body.viewing.ToString()); } catch (Exception e) { System.Console.WriteLine("ERROR: body.viewing - " + e.Message); }
      try { System.Console.WriteLine("body.lounges: " + body.lounges.ToString()); } catch (Exception e) { System.Console.WriteLine("ERROR: body.lounges - " + e.Message); }
      try { System.Console.WriteLine("body.bookingId: " + body.bookingId.ToString()); } catch (Exception e) { System.Console.WriteLine("ERROR: body.bookingId - " + e.Message); }
      try { System.Console.WriteLine("body.seats: " + JSON.Stringify(body.seats)); } catch (Exception e) { System.Console.WriteLine("ERROR: body.seats - " + e.Message); }
      try { System.Console.WriteLine("body.counts: " + JSON.Stringify(body.counts)); } catch (Exception e) { System.Console.WriteLine("ERROR: body.counts - " + e.Message); }
      try { System.Console.WriteLine("body.email: " + (body.email == null ? "null (will use logged in user)" : body.email.ToString())); } catch (Exception e) { System.Console.WriteLine("ERROR: body.email - " + e.Message); }

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
        email = body.email.ToString();
        System.Console.WriteLine("Guest email: " + email);
      }

      // STEP 4: Find or create viewing
      System.Console.WriteLine("=== STEP 4: Finding/creating viewing ===");
      string filmTitle = null;
      try
      {
        filmTitle = body.film.ToString();
        System.Console.WriteLine("Film title to search: " + filmTitle);
      }
      catch (Exception ex)
      {
        System.Console.WriteLine("ERROR converting film title: " + ex.Message);
        return RestResult.Parse(context, new { error = "Invalid film value: " + ex.Message });
      }
      
      var movie = SQLQueryOne(
          @"SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.Title') = @filmTitle",
          new { filmTitle }
      );

      if (movie == null)
      {
        System.Console.WriteLine($"Movie not found with title: {body.film}");
        return RestResult.Parse(context, new { error = "Movie not Found"});
      }
      int movieId = (int)movie["id"];
      System.Console.WriteLine($"Found movie with ID: {movieId}");
      
      // STEP 5: Find Lounge ID
      System.Console.WriteLine("=== STEP 5: Finding lounge ID ===");
      string loungeName = null;
      try
      {
        loungeName = body.lounges.ToString();
        System.Console.WriteLine("Lounge name to search: " + loungeName);
      }
      catch (Exception ex)
      {
        System.Console.WriteLine("ERROR converting lounge name: " + ex.Message);
        return RestResult.Parse(context, new { error = "Invalid lounges value: " + ex.Message });
      }
      
      var lounge = SQLQueryOne(
        "SELECT id FROM lounges WHERE name = @loungeName",
        new { loungeName }
      );
      if (lounge == null)
      {
        System.Console.WriteLine($"Lounge not found: {loungeName}");
        return RestResult.Parse(context, new { error = "Lounge not found: " + loungeName });
      }
      int loungeId = (int)lounge["id"];

      // STEP 6: Find or create viewing
      System.Console.WriteLine("=== Step 6: Finding/Creating viewing ===");
      string startTimeOnly = null;
      try
      {
        startTimeOnly = body.viewing.ToString();
        System.Console.WriteLine($"Looking for viewing with time: {startTimeOnly}");
      }
      catch (Exception ex)
      {
        System.Console.WriteLine("ERROR converting viewing time: " + ex.Message);
        return RestResult.Parse(context, new { error = "Invalid viewing value: " + ex.Message });
      }
      
      var viewing = SQLQueryOne(
        @"SELECT * FROM viewings
          WHERE movie = @movieId
          AND lounge = @loungeId
          AND TIME_FORMAT(start_time, '%H:%i:%s') = @startTime",
        new { movieId, loungeId, startTime = startTimeOnly }
      );

      int viewingId;
      if (viewing == null)
      {
        System.Console.WriteLine("=== Creating new viewing ===");
        // Format with today's date
        var fullDateTime = DateTime.Now.ToString("yyyy-MM-dd") + " " + startTimeOnly;
        SQLQueryOne(
          @"INSERT INTO viewings (movie, lounge, start_time)
            VALUES (@movieId, @loungeId, @startTime)",
          new {movieId, loungeId, startTime = fullDateTime}
        );
      }
      viewing = SQLQueryOne(
        @"SELECT * FROM viewings
        WHERE movie = @movieId
        AND lounge = @loungeId
        AND TIME_FORMAT(start_time, '%H:%i:%s') = @startTime",
        new { movieId, loungeId, startTime = startTimeOnly }
      );

      viewingId = (int)viewing["id"];
      System.Console.WriteLine($"=== Using Viewing ID: {viewingId} ===");

      // STEP 7: Create booking
      System.Console.WriteLine("=== STEP 7: Creating booking ===");
      string bookingRefId = null;
      try
      {
        bookingRefId = body.bookingId.ToString();
        System.Console.WriteLine("Booking reference ID: " + bookingRefId);
      }
      catch (Exception ex)
      {
        System.Console.WriteLine("ERROR converting bookingId: " + ex.Message);
        return RestResult.Parse(context, new { error = "Invalid bookingId value: " + ex.Message });
      }
      
      var booking = BookingQueries.CreateBooking(
          bookingRefId,
          userID,
          email,
          viewingId
      );

      System.Console.WriteLine("=== STEP 8: Getting booking ID ===");
      int bookingId = (int)booking["id"];

      // STEP 9: Create booking seats
      System.Console.WriteLine("=== STEP 9: Creating booking seats ===");
      try
      {
        var seatsList = new List<string>();
        System.Console.WriteLine("body.seats: " + JSON.Stringify(body.seats));
        
        foreach (var seat in body.seats)
        {
          seatsList.Add(seat.ToString());
        }
        
        System.Console.WriteLine("Seats list created with " + seatsList.Count + " seats");
        System.Console.WriteLine("body.counts: " + JSON.Stringify(body.counts));
        
        BookingQueries.CreateBookingSeats(bookingId, seatsList, loungeName, (dynamic)body.counts);
        System.Console.WriteLine("✅ Booking seats created successfully");
      }
      catch (Exception ex)
      {
        System.Console.WriteLine("❌ Error creating booking seats: " + ex.Message);
        System.Console.WriteLine("Stack trace: " + ex.StackTrace);
        return RestResult.Parse(context, new { error = "Error creating booking seats: " + ex.Message });
      }

      System.Console.WriteLine("=== STEP 10: Success! ===");
      return RestResult.Parse(context, new
      {
        success = true,
        bookingReference = bookingRefId,
        email
      });
    }
    catch (Exception ex)
    {
      System.Console.WriteLine("❌ ERROR in HandleCustomBooking: " + ex.Message);
      System.Console.WriteLine("Stack trace: " + ex.StackTrace);
      return RestResult.Parse(context, new { error = "Booking failed: " + ex.Message });
    }
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