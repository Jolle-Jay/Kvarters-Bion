using Microsoft.Net.Http.Headers;

namespace WebApp;


public static class StartSSE
{
    public static void SSE()
    {
        App.MapGet("/events", async (HttpContext context) =>
        {
            context.Response.ContentType = "text/event-stream" ;
            context.Response.Headers["Content-Type"] = "text/event-stream";
            context.Response.Headers["Cache-Control"] = "no-cache";
            context.Response.Headers["Connection"] = "keep-alive";

            await context.Response.WriteAsync($"data : test\n\n");
            await context.Response.Body.FlushAsync();


          /*   var cancellationToken = context.RequestAborted; */

/*             while (!cancellationToken.IsCancellationRequested)
            {
                var json = System.Text.Json.JsonSerializer.Serialize(new
                {
                    Message = "Hello",
                    time = DateTime.Now,
                    status = "shipped"
                });

                await context.Response.WriteAsync($"data : {json}\n\n", cancellationToken);
                await context.Response.Body.FlushAsync(cancellationToken);

                await Task.Delay(5000, cancellationToken);   
            } */

        });
    }
}