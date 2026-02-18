// Global settings
Globals = Obj(new
{
    debugOn = true,
    detailedAclDebug = false,
    aclOn = false,
    isSpa = false,  // ← MUST be false
    port = args.Length > 0 ? args[0] : "5000",  // ← Add default
    serverName = "Minimal API Backend",
    frontendPath = args.Length > 1 ? args[1] : "../frontend/dist",  // ← Add default
    sessionLifeTimeHours = 2
});

Server.Start();