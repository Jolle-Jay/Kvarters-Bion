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

  }
}