// Global settings
Globals = Obj(new
{
    debugOn = true,
    detailedAclDebug = false,
    aclOn = false,
    isSpa = false,  // ← Changed to false (was true)
    port = args.Length > 0 ? args[0] : "5000",  // ← Added default value
    serverName = "Minimal API Backend",
    frontendPath = args.Length > 1 ? args[1] : "../dist",
    sessionLifeTimeHours = 2
});

Server.Start();