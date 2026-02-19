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
                if (table == "customBooking")
                {
                    return vadDuVill.HandleCustomBooking(context, bodyJson);
                }
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
            // Extrahera bara tidssdelen från start_time (HH:MM:SS) och join med lounges för att få namn
            var sql = "SELECT v.id, v.movie, l.name as lounge, TIME_FORMAT(v.start_time, '%H:%i:%s') as start_time FROM viewings v JOIN lounges l ON v.lounge = l.id";
            var data = SQLQuery(sql, null, context);
            System.Console.WriteLine($"=== Alla visningar från DB ===");
            System.Console.WriteLine(JSON.Stringify(data));
            return RestResult.Parse(context, data);
        });

        // --- Hämta bokade platser för en visning ---
        App.MapGet("/api/booked-seats/{viewingId}", (HttpContext context, string viewingId) =>
        {
            System.Console.WriteLine($"=== Hämtar bokade platser för visning {viewingId} ===");
            var sql = "SELECT CONCAT(s.seatRow, '-', s.number) as seat FROM bookingSeats bs JOIN bookings b ON bs.booking = b.id JOIN seats s ON bs.seat = s.id WHERE b.viewing = @viewingId AND b.status = 'Confirmed'";
            var data = SQLQuery(sql, new { viewingId }, context);
            System.Console.WriteLine($"Bokade platser från DB: {JSON.Stringify(data)}");
            return RestResult.Parse(context, data);
        });
    }


}