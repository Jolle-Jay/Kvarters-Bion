using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp;

public static class RestApi
{
    public static void Start()
    {
        App.MapPost("/api/{table}", (
            HttpContext context, string table, JsonElement bodyJson
        ) =>

            {
                var body = JSON.Parse(bodyJson.ToString());
                body.Delete("id");
                var parsed = ReqBodyParse(table, body);
                var columns = parsed.insertColumns;
                var values = parsed.insertValues;
                var sql = $"INSERT INTO {table}({columns}) VALUES({values})";
                var result = SQLQueryOne(sql, parsed.body, context);
                if (!result.HasKey("error"))
                {
                    // Get the insert id and add to our result
                    result.insertId = SQLQueryOne(
                        @$"SELECT id AS __insertId 
                       FROM {table} ORDER BY id DESC LIMIT 1"
                    ).__insertId;
                }
                return RestResult.Parse(context, result);


            });




        App.MapGet("/api/{table}", (
            HttpContext context, string table
        ) =>
        {
            var query = RestQuery.Parse(context.Request.Query);
            if (query.error != null)
            {
                return RestResult.Parse(context, Arr(Obj(new { error = query.error })));
            }
            var sql = $"SELECT * FROM {table}" + query.sql;
            return RestResult.Parse(context, SQLQuery(sql, query.parameters, context));
        });

        App.MapGet("/api/{table}/{id}", (
            HttpContext context, string table, string id
        ) =>
            RestResult.Parse(context, SQLQueryOne(
                $"SELECT * FROM {table} WHERE id = @id",
                ReqBodyParse(table, Obj(new { id })).body,
                context
            ))
        );

        App.MapPut("/api/{table}/{id}", (
            HttpContext context, string table, string id, JsonElement bodyJson
        ) =>
        {
            var body = JSON.Parse(bodyJson.ToString());
            body.id = id;
            var parsed = ReqBodyParse(table, body);
            var update = parsed.update;
            var sql = $"UPDATE {table} SET {update} WHERE id = @id";
            var result = SQLQueryOne(sql, parsed.body, context);
            return RestResult.Parse(context, result);
        });

        App.MapDelete("/api/{table}/{id}", (
             HttpContext context, string table, string id
        ) =>
            RestResult.Parse(context, SQLQueryOne(
                $"DELETE FROM {table} WHERE id = @id",
                ReqBodyParse(table, Obj(new { id })).body,
                context
            ))
        );
        // --- Lägg till viewings-specialroute här ---
        App.MapGet("/api/viewings/all", (HttpContext context) =>
        {
            var sql = "SELECT movie, start_time FROM viewings";
            var data = SQLQuery(sql, null, context);
            return RestResult.Parse(context, data);
        });


        // Get users booking history with movie details
        App.MapGet("/api/bookings/user", (HttpContext context) =>
        {
        var user = context.Request.Query["email"].ToString().Trim();

        if (string.IsNullOrEmpty(user))
        {
            return RestResult.Parse(context, new { error = "No email provided" });
        }

            var userEmail = (string)user;

            // Query bookings with movie and viewing details
            var sql = "SELECT b.id, b.BookingReference, b.email, b.status, v.start_time as date, GROUP_CONCAT(DISTINCT CONCAT(s.seatRow, s.number) SEPARATOR ', ') as seats, m.movies_raw as movieData FROM bookings b INNER JOIN viewings v ON b.viewing = v.id INNER JOIN movies m ON v.movie = m.id LEFT JOIN bookingSeats bs ON b.id = bs.booking LEFT JOIN seats s ON bs.seat = s.id WHERE b.email = @email GROUP BY b.id ORDER BY v.start_time DESC";

            var data = SQLQuery(sql, new { email = userEmail }, context);

            if (data is Arr)
            {
                var arr = (Arr)data;
                if (arr.Length > 0 && arr[0].error == null)
                {
                    var results = Arr();

                    foreach (var booking in arr)
                    {
                        var movieTitle = "Okänd film";

                        if (booking.movieData != null && !string.IsNullOrWhiteSpace(booking.movieData.ToString()))
                        {
                            try
                            {
                                var movieJson = booking.movieData.ToString();
                                var movieObj = JSON.Parse(movieJson);
                                movieTitle = movieObj.Title ?? movieObj.title ?? "Okänd film";
                            }
                            catch { movieTitle = "Okänd film"; }
                        }

                        var result = Obj(new
                        {
                            id = booking.id,
                            BookingReference = booking.BookingReference,
                            email = booking.email,
                            status = booking.status,
                            date = booking.date,
                            seats = booking.seats,
                            movieTitle = movieTitle
                        });

                        results.Push(result);
                    }

                    return RestResult.Parse(context, results);
                }
            }

            return RestResult.Parse(context, Arr());
        });
    }
}