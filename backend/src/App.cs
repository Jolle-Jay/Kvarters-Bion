// Global settings
var defaultPort = "5000";
var defaultFrontend = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "public");
var portArg = args.Length > 0 ? args[0] : defaultPort;
var frontendArg = args.Length > 1 ? args[1] : defaultFrontend;

Globals = Obj(new
{
  debugOn = true,
  detailedAclDebug = false,
  aclOn = true,
  isSpa = true,
  port = portArg,
  serverName = "Minimal API Backend",
  frontendPath = frontendArg,
  sessionLifeTimeHours = 2
});

Server.Start();