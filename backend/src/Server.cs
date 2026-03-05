using System.Net.WebSockets;

namespace WebApp;

public static class Server
{
    public static WebApplication App;
    private static List<WebSocket> connectedSockets = new List<WebSocket>();

    public static void Start()
    {
        var builder = WebApplication.CreateBuilder();
        App = builder.Build();

        Middleware();

        DebugLog.Start();
        Acl.Start();
        ErrorHandler.Start();
        FileServer.Start();
        LoginRoutes.Start();
        AiChatRoutes.Start();
        RestApi.Start();
        Session.Start();
        vadDuVill.Start();

        var runUrl = "http://localhost:" + Globals.port;
        Log("Server running on:", runUrl);
        Log("With these settings:", Globals);

        App.Run(runUrl);
    }

    public static void Middleware()
    {
        App.UseWebSockets();

        App.Map("/ws", async context =>
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            var socket = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine("WebSocket connected!");
            connectedSockets.Add(socket);

            try
            {
                var buffer = new byte[1024 * 4];
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                while (!result.CloseStatus.HasValue)
                {
                    var msg = new ArraySegment<byte>(buffer, 0, result.Count);

                    foreach (var s in connectedSockets.ToList())
                    {
                        if (s.State == WebSocketState.Open)
                            await s.SendAsync(msg, result.MessageType, result.EndOfMessage, CancellationToken.None);
                    }

                    result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("WebSocket error: " + ex.Message);
            }
            finally
            {
                connectedSockets.Remove(socket);
                if (socket.State == WebSocketState.Open)
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
            }
        });
    }
}