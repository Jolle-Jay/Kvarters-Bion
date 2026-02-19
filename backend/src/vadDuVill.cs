// namespace WebApp;

// public static class vadDuVill
// {
//   private static Obj GetUser(HttpContext context)
//   {
//     return Session.Get(context, "user");
//   }



//   public static object HandleCustomBooking(HttpContext context, JsonElement bodyJson)
//   {
//     try
//     {
//       System.Console.WriteLine("=== STEP 1: Entered HandleCustomBooking ===");
//       var user = Session.Get(context, "user");
//       var body = JSON.Parse(bodyJson.ToString());

//       System.Console.WriteLine("=== STEP 2: Body received ===");
//       System.Console.WriteLine(body);

//       System.Console.WriteLine("=== Checking body properties ===");
//       System.Console.WriteLine("body is null? " + (body == null));
//       if (body != null)
//       {
//         System.Console.WriteLine("body.movie exists? " + (body.movie != null));
//         System.Console.WriteLine("body.viewing exists? " + (body.viewing != null));
//         System.Console.WriteLine("body.lounges exists? " + (body.lounges != null));
//       }

//       string email;
//       int? userID = null;

//       if (user != null)
//       {
//         email = (string)user["email"];
//         userID = (int)user["id"];
//         System.Console.WriteLine("=== STEP 3: Logged in user: " + email + " ===");
//       }
//       else
//       {
//         System.Console.WriteLine("=== STEP 3: Guest user ===");
//         if (body.email == null)
//         {
//           System.Console.WriteLine("=== ERROR: No email provided ===");
//           return RestResult.Parse(context, new { error = "Email is required." });
//         }
//         email = (string)body.email;
//       }

//       // STEP 4: Find movie ID
//       System.Console.WriteLine("=== STEP 4: Finding movie ID ===");
//       var movie = SQLQueryOne(
//           "SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.title') = @filmTitle",
//           new { filmTitle = (string)body.film }
//       );
//       if (movie == null)
//       {
//         return RestResult.Parse(context, new { error = "Movie not found" });
//       }
//       int movieId = (int)movie["id"];

//       // STEP 5: Find lounge ID
//       System.Console.WriteLine("=== STEP 5: Finding lounge ID ===");
//       var lounge = SQLQueryOne(
//           "SELECT id FROM lounges WHERE name = @loungeName",
//           new { loungeName = (string)body.lounges }
//       );
//       if (lounge == null)
//       {
//         return RestResult.Parse(context, new { error = "Lounge not found" });
//       }
//       int loungeId = (int)lounge["id"];

//       // STEP 6: Find or create viewing
//       System.Console.WriteLine("=== STEP 6: Finding/creating viewing ===");
//       var viewing = SQLQueryOne(
//           @"SELECT * FROM viewings 
//               WHERE movie = @movieId 
//               AND lounge = @loungeId 
//               AND start_time = @startTime",
//           new { movieId, loungeId, startTime = (string)body.viewing }
//       );

//       int viewingId;
//       if (viewing == null)
//       {
//         System.Console.WriteLine("=== Creating new viewing ===");
//         SQLQueryOne(
//             @"INSERT INTO viewings (movie, lounge, start_time) 
//                   VALUES (@movieId, @loungeId, @startTime)",
//             new { movieId, loungeId, startTime = (string)body.viewing }
//         );

//         viewing = SQLQueryOne(
//             @"SELECT * FROM viewings 
//                   WHERE movie = @movieId 
//                   AND lounge = @loungeId 
//                   AND start_time = @startTime",
//             new { movieId, loungeId, startTime = (string)body.viewing }
//         );
//       }

//       viewingId = (int)viewing["id"];
//       System.Console.WriteLine("=== Using viewing ID: " + viewingId + " ===");

//       // STEP 7: Create booking
//       System.Console.WriteLine("=== STEP 7: Creating booking ===");
//       var booking = BookingQueries.CreateBooking(
//           (string)body.bookingId,
//           userID,
//           email,
//           viewingId
//       );

//       System.Console.WriteLine("=== STEP 8: Getting booking ID ===");
//       int bookingId = (int)booking["id"];

//       // STEP 9: Create booking seats
//       System.Console.WriteLine("=== STEP 9: Creating booking seats ===");
//       var seatsList = new List<string>();
//       foreach (var seat in body.seats)
//       {
//         seatsList.Add((string)seat);
//       }

//       BookingQueries.CreateBookingSeats(bookingId, seatsList, (string)body.lounges, (dynamic)body.counts);

//       System.Console.WriteLine("=== STEP 10: Success! ===");
//       return RestResult.Parse(context, new
//       {
//         success = true,
//         bookingReference = (string)body.bookingId,
//         email = email  // ← Changed this
//       });
//     }
//     catch (Exception ex)
//     {
//       System.Console.WriteLine("=== ERROR: " + ex.Message + " ===");
//       System.Console.WriteLine("=== STACK TRACE: " + ex.StackTrace + " ===");
//       return RestResult.Parse(context, new { error = "Booking failed: " + ex.Message });
//     }
//   }




//   public static void Start()
//   {
//     App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
// {
//   System.Console.WriteLine("Vi är inne i customBooking");
//   return vadDuVill.HandleCustomBooking(context, bodyJson);  // ← Call the actual function!
// });

//   }
// }

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

      // Extract values directly from JsonElement (avoids circular reference)
      string bookingReference = bodyJson.GetProperty("bookingId").GetString();
      string emailFromBody = bodyJson.GetProperty("email").GetString();
      string filmTitle = bodyJson.GetProperty("film").GetString();
      string viewingTime = bodyJson.GetProperty("viewing").GetString();
      string loungeName = bodyJson.GetProperty("lounges").GetString();

      // Get seats array
      var seatsArray = bodyJson.GetProperty("seats");
      var seatsList = new List<string>();
      foreach (var seat in seatsArray.EnumerateArray())
      {
        seatsList.Add(seat.GetString());
      }

      // Get counts
      var countsObj = bodyJson.GetProperty("counts");
      var counts = new
      {
        adult = countsObj.GetProperty("adult").GetInt32(),
        senior = countsObj.GetProperty("senior").GetInt32(),
        child = countsObj.GetProperty("child").GetInt32()
      };

      System.Console.WriteLine($"=== STEP 2: Booking {bookingReference}, {seatsList.Count} seats ===");

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
        if (string.IsNullOrEmpty(emailFromBody))
        {
          System.Console.WriteLine("=== ERROR: No email provided ===");
          return RestResult.Parse(context, new { error = "Email is required." });
        }
        email = emailFromBody;
      }

      // STEP 4: Find movie ID
      System.Console.WriteLine("=== STEP 4: Finding movie ID ===");
      var movie = SQLQueryOne(
          "SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.title') = @filmTitle",
          new { filmTitle }
      );
      if (movie == null)
      {
        return RestResult.Parse(context, new { error = "Movie not found" });
      }
      int movieId = (int)movie["id"];

      // STEP 5: Find lounge ID
      System.Console.WriteLine("=== STEP 5: Finding lounge ID ===");
      var lounge = SQLQueryOne(
          "SELECT id FROM lounges WHERE name = @loungeName",
          new { loungeName }
      );
      if (lounge == null)
      {
        return RestResult.Parse(context, new { error = "Lounge not found" });
      }
      int loungeId = (int)lounge["id"];

      // STEP 6: Find or create viewing
      System.Console.WriteLine("=== STEP 6: Finding/creating viewing ===");
      var viewing = SQLQueryOne(
          @"SELECT * FROM viewings 
            WHERE movie = @movieId 
            AND lounge = @loungeId 
            AND start_time = @startTime",
          new { movieId, loungeId, startTime = viewingTime }
      );

      int viewingId;
      if (viewing == null)
      {
        System.Console.WriteLine("=== Creating new viewing ===");
        SQLQueryOne(
            @"INSERT INTO viewings (movie, lounge, start_time) 
              VALUES (@movieId, @loungeId, @startTime)",
            new { movieId, loungeId, startTime = viewingTime }
        );

        viewing = SQLQueryOne(
            @"SELECT * FROM viewings 
              WHERE movie = @movieId 
              AND lounge = @loungeId 
              AND start_time = @startTime",
            new { movieId, loungeId, startTime = viewingTime }
        );
      }

      viewingId = (int)viewing["id"];
      System.Console.WriteLine("=== Using viewing ID: " + viewingId + " ===");

      // STEP 7: Create booking
      System.Console.WriteLine("=== STEP 7: Creating booking ===");
      var booking = BookingQueries.CreateBooking(
          bookingReference,
          userID,
          email,
          viewingId
      );

      System.Console.WriteLine("=== STEP 8: Getting booking ID ===");
      int bookingId = (int)booking["id"];

      // STEP 9: Create booking seats
      System.Console.WriteLine("=== STEP 9: Creating booking seats ===");

      BookingQueries.CreateBookingSeats(bookingId, seatsList, loungeName, counts);

      System.Console.WriteLine("=== STEP 10: Success! ===");
      return RestResult.Parse(context, new
      {
        success = true,
        bookingReference,
        email
      });
    }
    catch (Exception ex)
    {
      System.Console.WriteLine("=== ERROR: " + ex.Message + " ===");
      return RestResult.Parse(context, new { error = "Booking failed: " + ex.Message });
    }
  }

  public static void Start()
  {
    App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
    {
      System.Console.WriteLine("Vi är inne i customBooking");
      return vadDuVill.HandleCustomBooking(context, bodyJson);
    });
  }
}