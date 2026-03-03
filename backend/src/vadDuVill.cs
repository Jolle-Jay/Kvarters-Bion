using Microsoft.VisualBasic;

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

      // hämtar värdena individuellt som strängar och sen för in dem i variablerna
      string bookingReference = bodyJson.GetProperty("bookingId").GetString();
      string emailFromBody = bodyJson.GetProperty("email").GetString();
      string filmTitle = bodyJson.GetProperty("film").GetString();
      string viewingTime = bodyJson.GetProperty("viewing").GetString();
      string loungeName = bodyJson.GetProperty("lounges").GetString();

      // hämtar seats från bodyJson
      // gör en lista av strängar till seatslist
      //loopar igenom alla seatarray
      // lägger till seat som en sträng i seatslist
      var seatsArray = bodyJson.GetProperty("seats");
      var seatsList = new List<string>();
      foreach (var seat in seatsArray.EnumerateArray())
      {
        seatsList.Add(seat.GetString());
      }

      // hämtar counts från BodyJson och gör det till countsobj
      // så varje countobj som är adult, senior eller child säts in i variablen counts
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
      // om användaren inte är null så ska man hämta email från user som är sträng
      //och Id från user som är id?=
      if (user != null)
      {
        email = (string)user["email"];
        userID = (int)user["id"];
        System.Console.WriteLine("=== STEP 3: Logged in user: " + email + " ===");
      }
      else
      // kollar om string emailfrom body är null om den inte är null hämtar den email från body
      {
        System.Console.WriteLine("=== STEP 3: Guest user ===");
        if (string.IsNullOrEmpty(emailFromBody))
        {
          System.Console.WriteLine("=== ERROR: No email provided ===");
          return RestResult.Parse(context, new { error = "Email is required." });
        }
        email = emailFromBody;
      }

      // letar efter en film i databasen som titeln matchar filmTitle och hämtar tillbaka id
      System.Console.WriteLine("=== STEP 4: Finding movie ID ===");
      var movie = SQLQueryOne(
          "SELECT id FROM movies WHERE JSON_EXTRACT(movies_raw, '$.Title') = @filmTitle",
          new { filmTitle }
      );
      if (movie == null)
      {
        return RestResult.Parse(context, new { error = "Movie not found" });
      }
      // vi hämtar id från movie och gör om värde till en int
      int movieId = (int)movie["id"];

      // letar efter en lounge i databasen och om det matchar så har vi ett loungeId
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

      // vi har en viewing, och om detta stämmer så hänmtar vi en ny visning längre ner
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
        // eftersom det redan finns i databasen så hämtar vi tiderna, lounge och movie id från viewings
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

      // när vi har kollat att allting stämmer med databasen då kan vi göra en bokning
      // då gör vi en bokning med bookingqueries och createbooking från bookingqueries filen
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
      // skapar en bookning med sätena i logiken från createbookingseats
      BookingQueries.CreateBookingSeats(bookingId, seatsList, loungeName, counts);

      System.Console.WriteLine("=== STEP 9.5 Få biljett priser");
      var ticketPrices = SQLQuery("SELECT name, price FROM ticketTypes");

      //gör om till dictionary för enkel lookup
      // den kommer kunna innehålla priser och namnen
      var priceMap = new Dictionary<string, int>();
      //hämtar ticketrpices från databasen
      foreach (var ticket in ticketPrices)
      {// kastar om värdet till sträng och int
        priceMap[(string)ticket["name"]] = (int)ticket["price"];
      }

      //räkna ut totalpris
      int totalPrice =
      (counts.adult * priceMap["Standard"]) +
      (counts.senior * priceMap["Senior"]) +
      (counts.child * priceMap["Child"]);

      System.Console.WriteLine($"Total price: {totalPrice} SEK");

      //skapar en Dictionary där nyckeln är en sträng (radnummer)
      // row = nyckeln
      // llista med säten = värdet (intehåller i lådan)
      var seatsByRow = new Dictionary<string, List<string>>();
      foreach (var seat in seatsList)
      {
        // splittrar strängen seat vid - så det går att skilja mellan row & seat
        var parts = seat.Split('-');
        string row = parts[0];
        string number = parts[1];

        if (!seatsByRow.ContainsKey(row))
        {
          //skapar en tom lista för den raden
          // första gången vi ser "rad 1" måste vi skapa en lista för den raden
          //sen kan vi börja lägga till i den nya raden
          seatsByRow[row] = new List<string>();
        }
        seatsByRow[row].Add(number);
      }

      //bygg en ny sträng
      // kvp = key, value pair
      var seatInfo = "";
      foreach (var kvp in seatsByRow)
      {
        // slår samman alla element i listan till EN sträng med , mellan varje element
        // += === lägg till på slutet 
        seatInfo += $"<li>Rad {kvp.Key}: Säte {string.Join(", ", kvp.Value)}</li>";
      }


      // det är detta vi får i meddelandet till användaren efter vi har slutfört bokningen skickas till frontend
      System.Console.WriteLine("=== STEP 10: Success! ===");

      System.Console.WriteLine("=== STEP 10: Success! ===");

      var response = new
      {
        success = true,
        bookingReference,
        email
      };

      //returnera till frontend INNAN email skickas
      var result = RestResult.Parse(context, response);

      //skicka EMAIL EFTER response (async i bakgrunden)
      Task.Run(() =>
      {
        try
        {
          EmailService.SendEmail(
            email,
            "Bokningsbekräftelse - Kvarterbion",
            $@"<h1>Tack för din bokning!</h1>
               <p>Hej {email}!</p>
               <p>Din bokning till {filmTitle} är bekräftad!.</p>

               <p>Bokingsinformation.</p>
               <p><strong>Bokningsnummer:</strong> {bookingReference}</p>

               <p><strong>Antal platser:</strong></p>
               <ul>
               {seatInfo}
               </ul>

                <h3>Biljetter:</h3>
       <ul>
         {(counts.adult > 0 ? $"<li>Vuxen: {counts.adult} x {priceMap["Standard"]} SEK = {counts.adult * priceMap["Standard"]} SEK</li>" : "")}
         {(counts.senior > 0 ? $"<li>Pensionär: {counts.senior} x {priceMap["Senior"]} SEK = {counts.senior * priceMap["Senior"]} SEK</li>" : "")}
         {(counts.child > 0 ? $"<li>Barn: {counts.child} x {priceMap["Child"]} SEK = {counts.child * priceMap["Child"]} SEK</li>" : "")}
       </ul>

       <p><strong>Totalpris: {totalPrice} SEK</strong></p>
       <p>Vi ses på biografen!</p>"

        );
          System.Console.WriteLine("=== Bokningsmail skickat! ===");
        }
        catch (Exception ex)

        {
          System.Console.WriteLine($"=== Mail misslyckades: {ex.Message} ===");

        }

      });

      return result;

    }
    catch (Exception ex)
    {
      System.Console.WriteLine("=== ERROR: " + ex.Message + " ===");
      return RestResult.Parse(context, new { error = "Booking failed: " + ex.Message });
    }
  }






  // registrar API route custombooking och skickar vidare anropet till handlecustombooking när någon postar till API/custombooking
  public static void Start()
  {
    App.MapPost("/api/customBooking", (HttpContext context, JsonElement bodyJson) =>
    {
      System.Console.WriteLine("Vi är inne i customBooking");
      return vadDuVill.HandleCustomBooking(context, bodyJson);
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

    App.MapGet("/api/bookingSeats/{viewingId}", (HttpContext context, string viewingId) =>
    {
      // --- API för att hämta bokade platser för en visning ---
      // Loggar vilken visning som efterfrågas
      System.Console.WriteLine("Hämtar bokade platser för viewing: " + viewingId);
      int vId = int.Parse(viewingId);
      System.Console.WriteLine("Hämtar bokade platser för viewing: " + vId);

      // Hämtar alla platser (rad och nummer) som är bokade för denna visning och har status 'Confirmed'
      var bookedSeats = SQLQuery(
        @"SELECT s.seatRow, s.number
        FROM bookingSeats bs
        INNER JOIN bookings b ON bs.booking = b.id
        INNER JOIN seats s ON bs.seat = s.id
        WHERE b.viewing = @viewingId
        AND b.status = 'Confirmed'",
        new { viewingId = vId }
      );

      // Skapar en lista för att formatera platserna till frontend-format (t.ex. "1-1")
      var formattedSeats = new List<string>();
      System.Console.Write("Seats: ");

      // Loopar igenom alla bokade platser och formaterar dem till "rad-nummer"
      foreach (var seat in bookedSeats)
      {
        string seatString = $"{seat["seatRow"]}-{seat["number"]}";
        System.Console.Write(seatString + ", ");
        formattedSeats.Add(seatString);
      }

      // Loggar antal bokade platser
      System.Console.WriteLine("");
      System.Console.WriteLine($"Hittade {formattedSeats.Count} bokade plater för viewing: {vId}");

      // Returnerar platserna som JSON till frontend: { seats: ["1-1", "1-2", ...] }
      return RestResult.Parse(context, new { seats = formattedSeats });
    });

    // API endpoint for cancelling a booking
    App.MapDelete("/api/bookings/{reference}", (HttpContext context, string reference) =>
    {
      // --- API för att avboka en bokning ---
      try
      {
        // Kollar om bokningen med angivet referensnummer finns
        var booking = SQLQueryOne("SELECT * FROM bookings WHERE BookingReference = @reference", new { reference });
        if (booking == null)
        {
          // Om bokningen inte hittas, returnera felmeddelande
          return RestResult.Parse(context, new { error = "Bokningen hittades inte." });
        }
        // Avboka bokningen genom att uppdatera status till 'Cancelled'
        BookingQueries.CancelBooking(reference);
        // Returnerar lyckat svar till frontend
        return RestResult.Parse(context, new { success = true, message = "Bokningen är nu avbokad" });
      }
      catch (Exception ex)
      {
        // Om något går fel, returnera felmeddelande
        return RestResult.Parse(context, new { error = ex.Message });
      }
    });

    App.MapGet("/api/bookings", (HttpContext context) =>
    {
      var email = context.Request.Query["where"].ToString().Replace("email=", "");
      System.Console.WriteLine($"=== GET /api/bookings, email: '{email}' ==="); // ← lägg till

      if (string.IsNullOrEmpty(email))
      {
        return RestResult.Parse(context, new { error = "Email krävs." });
      }

      //Hämtar bokningar med film titel och visningstid via Join
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
      System.Console.WriteLine($"=== Bookings count: {bookings.Length} ==="); // ← lägg till
      System.Console.WriteLine($"=== Bookings data: {JSON.Stringify(bookings)} ===");

      return RestResult.Parse(context, bookings);
    });
  }
}