using Microsoft.VisualBasic;

namespace WebApp;

public static class Bookings
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }

  public static object HandleCustomBooking(HttpContext context, JsonElement bodyJson)
  {
    try
    {
      var user = Session.Get(context, "user");

      // fetches the values individually as strings and then insert them in the variables
      string bookingReference = bodyJson.GetProperty("bookingId").GetString();
      string emailFromBody = bodyJson.GetProperty("email").GetString();
      string filmTitle = bodyJson.GetProperty("film").GetString();
      string viewingTime = bodyJson.GetProperty("viewing").GetString();
      string loungeName = bodyJson.GetProperty("lounges").GetString();

      // fetches seats from bodyJson
      // makes a list of strings to seatlist
      //loops trough all seatarrays
      // adds seat as a string into seatslist
      var seatsArray = bodyJson.GetProperty("seats");
      var seatsList = new List<string>();
      foreach (var seat in seatsArray.EnumerateArray())
      {
        seatsList.Add(seat.GetString());
      }

      // fetches counts from BodyJson and converts it to countsobj
      // every countobj such as adult senior or child gets saved in the variable counts
      var countsObj = bodyJson.GetProperty("counts");
      var counts = new
      {
        adult = countsObj.GetProperty("adult").GetInt32(),
        senior = countsObj.GetProperty("senior").GetInt32(),
        child = countsObj.GetProperty("child").GetInt32()
      };


      string email;
      int? userID = null;
      // if the user is not null, fetch email as string and ID as int
      if (user != null)
      {
        email = (string)user["email"];
        userID = (int)user["id"];
      }
      else
      // checks if string email from body is null, if it's not null fetch that email from body 
      {
        if (string.IsNullOrEmpty(emailFromBody))
        {
          return RestResult.Parse(context, new { error = "Email is required." });
        }
        email = emailFromBody;
      }

      // searches for a movie in db where the title matches filmTitle and fetches the id for that movie
      var movie = SQLQueryOne(
          "SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.Title') = @filmTitle",
          new { filmTitle }
      );
      if (movie == null)
      {
        return RestResult.Parse(context, new { error = "Movie not found" });
      }

      int movieId = (int)movie["id"];

      var lounge = SQLQueryOne(
          "SELECT id FROM lounges WHERE name = @loungeName",
          new { loungeName }
      );
      if (lounge == null)
      {
        return RestResult.Parse(context, new { error = "Lounge not found" });
      }
      int loungeId = (int)lounge["id"];

      // if we have a viewing
      var viewing = SQLQueryOne(
          @"SELECT * FROM viewings 
            WHERE movie = @movieId 
            AND lounge = @loungeId 
            AND start_time = @startTime",
          new { movieId, loungeId, startTime = viewingTime }
      );

      // if we don't have a viewing we make a new one
      int viewingId;
      if (viewing == null)
      {
        SQLQueryOne(
            @"INSERT INTO viewings (movie, lounge, start_time) 
              VALUES (@movieId, @loungeId, @startTime)",
            new { movieId, loungeId, startTime = viewingTime }
        );
        // fetch the new one we just created
        viewing = SQLQueryOne(
            @"SELECT * FROM viewings 
              WHERE movie = @movieId 
              AND lounge = @loungeId 
              AND start_time = @startTime",
            new { movieId, loungeId, startTime = viewingTime }
        );
      }

      viewingId = (int)viewing["id"];

      // when we've made sure everything with db is correct we can make an booking
      // then we make a booking with bookingqueries and createbooking from the bookingqueries-file
      var booking = BookingQueries.CreateBooking(
          bookingReference,
          userID,
          email,
          viewingId
      );

      int bookingId = (int)booking["id"];

      // creates an booking with the seats logic from creatbookingseats
      BookingQueries.CreateBookingSeats(bookingId, seatsList, loungeName, counts);

      var ticketPrices = SQLQuery("SELECT name, price FROM ticketTypes");

      //convert to dictionary for a more simple lookup
      // it can contain both the prices and names
      var priceMap = new Dictionary<string, int>();

      foreach (var ticket in ticketPrices)
      {
        priceMap[(string)ticket["name"]] = (int)ticket["price"];
      }

      //counts totalprice
      int totalPrice =
      (counts.adult * priceMap["Standard"]) +
      (counts.senior * priceMap["Senior"]) +
      (counts.child * priceMap["Child"]);


      //creates a dictionary where the key is the row and the second value is the number on that row
      var seatsByRow = new Dictionary<string, List<string>>();
      foreach (var seat in seatsList)
      {
        // splits the string at - so we can differ between row and seatnumber
        var parts = seat.Split('-');
        string row = parts[0];
        string number = parts[1];

        if (!seatsByRow.ContainsKey(row))
        {
          //creates an empty list for that row
          // first time we encounter "Rad 1 " we need to create a list for that row 
          //then we can start adding in the new row
          seatsByRow[row] = new List<string>();
        }
        seatsByRow[row].Add(number);
      }

      //build a new string
      // kvp = key, value pair
      var seatInfo = "";
      foreach (var kvp in seatsByRow)
      {
        // add all list elements to one string with , inbetween them
        // += === add to the end
        seatInfo += $"<li>Rad {kvp.Key}: Säte {string.Join(", ", kvp.Value)}</li>";
      }

      // this contains the info that is sent to the user when the booking is confirmed
      var response = new
      {
        success = true,
        bookingReference,
        email
      };

      //returns to frontend before email is sent
      var result = RestResult.Parse(context, response);

      //sends email after respnse (async in background)
      Task.Run(() =>
      {
        // makes sure the email exists before trying to send email
        if (string.IsNullOrEmpty(email))
        {
        }
        else
        {

          EmailService.SendEmail(
            email,
            "Bokningsbekräftelse - Kvartersbion",
            $@"<h1>Tack för din bokning!</h1>
                   <p>Hej!</p>
                   <p>Din bokning till {filmTitle} är bekräftad.</p>
    
                   <h2>Bokningsinformation</h2>
                   <p><strong>Bokningsnummer:</strong> {bookingReference}</p>
                  
                  <h3> Vi ses den {viewingTime.Replace("T", " ")}!<h3>

                   <p> Vänligen kom 15 minuter innan visningen börjar för betalning och köp av snacks.
    
                   <h3>Platser:</h3>
                   <ul>
                   {seatInfo}
                   </ul>
    
                    <h3>Biljetter:</h3>
           <ul>
             {(counts.adult > 0 ? $"<li>Vuxen: {counts.adult} x {priceMap["Standard"]} kr = {counts.adult * priceMap["Standard"]} kr</li>" : "")}
             {(counts.senior > 0 ? $"<li>Pensionär: {counts.senior} x {priceMap["Senior"]} kr = {counts.senior * priceMap["Senior"]} kr</li>" : "")}
             {(counts.child > 0 ? $"<li>Barn: {counts.child} x {priceMap["Child"]} kr = {counts.child * priceMap["Child"]} kr</li>" : "")}
           </ul>
    
           <p><strong>Totalpris: {totalPrice} kr</strong></p>
           <p>Vi ses på biografen!</p>"

          );
        }

      });

      return result;

    }
    catch (Exception ex)
    {
      return RestResult.Parse(context, new { error = "Booking failed: " + ex.Message });
    }
  }

  // register API route custombooking and forwards the call to handlecustombooking when someone posts to API/custombooking
  public static void Start()
  {
    App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
    {
      return Bookings.HandleCustomBooking(context, bodyJson);
    });

    App.MapGet("/api/viewings", (HttpContext context) =>
    {
      var movieIdParam = context.Request.Query["movieId"].ToString();
      if (string.IsNullOrEmpty(movieIdParam))
      {
        var allViewings = SQLQuery("SELECT * FROM viewings ORDER BY start_time");
        return RestResult.Parse(context, allViewings);
      }

      int movieId = int.Parse(movieIdParam);
      var viewings = SQLQuery(
        "SELECT * FROM viewings WHERE movie = @movieId ORDER BY start_time",
        new { movieId }
      );

      return RestResult.Parse(context, viewings);
    });

    App.MapGet("/api/viewing", (HttpContext context) =>
      {
        var viewingIdParam = context.Request.Query["viewingId"].ToString();
        if (string.IsNullOrEmpty(viewingIdParam))
        {
          var allViewings = SQLQuery("SELECT * FROM viewings ORDER BY start_time");
          return RestResult.Parse(context, allViewings);
        }

        int viewingId = int.Parse(viewingIdParam);
        var viewing = SQLQuery(
          "SELECT * FROM viewings WHERE id = @viewingId ORDER BY start_time",
          new { viewingId }
        );

        return RestResult.Parse(context, viewing);
      });

    App.MapGet("/api/bookingSeats/{viewingId}", (HttpContext context, string viewingId) =>
    {
      // API to fetch booked seats for a viewing
      int vId = int.Parse(viewingId);

      // fetches all booked seats(row and number) for the specifiv viewing with status confirmed
      var bookedSeats = SQLQuery(
        @"SELECT s.seatRow, s.number
        FROM bookingSeats bs
        INNER JOIN bookings b ON bs.booking = b.id
        INNER JOIN seats s ON bs.seat = s.id
        WHERE b.viewing = @viewingId
        AND b.status = 'Confirmed'",
        new { viewingId = vId }
      );

      // creates a list to format the seats to frontend-format (ex 1-1)
      var formattedSeats = new List<string>();

      // Loops through all booked seats and format into row-number
      foreach (var seat in bookedSeats)
      {
        string seatString = $"{seat["seatRow"]}-{seat["number"]}";
        formattedSeats.Add(seatString);
      }

      // Return seats as Json to frontend: { seats: ["1-1", "1-2", ...] }
      return RestResult.Parse(context, new { seats = formattedSeats });
    });

    // API endpoint for cancelling a booking
    App.MapDelete("/api/bookings/{reference}", (HttpContext context, string reference) =>
    {
      try
      {
        // checks if the booking with given referencenumber exists finns
        var booking = SQLQueryOne("SELECT * FROM bookings WHERE BookingReference = @reference", new { reference });
        if (booking == null)
        {
          // if not found return error message
          return RestResult.Parse(context, new { error = "Bokningen hittades inte." });
        }
        // uppdate status to cancelled
        BookingQueries.CancelBooking(reference);
        // return success message to frontend
        return RestResult.Parse(context, new { success = true, message = "Bokningen är nu avbokad" });
      }
      catch (Exception ex)
      {
        // if something goes wrong return error message
        return RestResult.Parse(context, new { error = ex.Message });
      }
    });

    App.MapGet("/api/bookings", (HttpContext context) =>
    {
      var email = context.Request.Query["where"].ToString().Replace("email=", "");

      if (string.IsNullOrEmpty(email))
      {
        return RestResult.Parse(context, new { error = "Email krävs." });
      }

      //fetch bookings with movie title and viewing time trough join
      var bookings = SQLQuery(@"SELECT b.BookingReference,
          b.status,
          b.email,
          v.start_time,
          JSON_UNQUOTE(JSON_EXTRACT(m.movies_raw, '$.Title')) AS film,
          GROUP_CONCAT(CONCAT(s.seatRow, '-', s.number) ORDER BY s.seatRow, s.number) AS seats
          FROM bookings b
          INNER JOIN viewings v ON b.viewing = v.id
          INNER JOIN movies m ON v.movie = m.id
          LEFT JOIN bookingSeats bs ON bs.booking = b.id
          LEFT JOIN seats s ON bs.seat = s.id
          WHERE b.email = @email
          GROUP BY b.id",
          new { email }, context
          );

      return RestResult.Parse(context, bookings);
    });
  }
}