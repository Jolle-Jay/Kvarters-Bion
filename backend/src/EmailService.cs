using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebApp;

static class EmailService
{
  // skapar vår funktion som skickar email med 3 parametrar.
  public static void SendEmail(string to, string subject, string body)
  {
    //sätt path - för att hitta db config json filen.
    var configPath = Path.Combine(
      AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
    );
    //läser in filem "db- config json"
    var configJson = File.ReadAllText(configPath);
    // gör om inlästa filen db config json till json format
    var config = JSON.Parse(configJson);

    //plockar ut konfigurationen från db config json
    string smtpServer = config.smtpServer;
    int smtpPort = Convert.ToInt32(config.smtpPort);
    string emailUsername = config.emailUsername;
    string emailPassword = config.emailPassword;

    // sätter ihop ett meddelande ,ed rätt struktur genom att. använda
    //MimeMessafge, rekommendars av mailkit avv använda detta
    var message = new MimeMessage()
    {
      // from = avsändarens meial, ska vara vår email
      From = { MailboxAddress.Parse(emailUsername) },
      // To = motagerns email, den vi ska skicka mail till
      To = { MailboxAddress.Parse(to) },
      //subject = rubriken på mailet
      Subject = subject,
      // body = den meddelande text man vill ha i mailet
      // textpart ("html") = gör att vi kan använda html elementet för att strukturera meddelandet
      Body = new TextPart("html") { Text = body }
    };

    using (var client = new SmtpClient())
    {
      // öppnar en upkoppling till meial providerns server, i vårat fall gmail
      client.Connect(smtpServer, smtpPort, false);
      //skickar in verifiering för att konmtroller att vi har en giltig email med stöd fär SMTP
      client.Authenticate(emailUsername, emailPassword);
      //skickar meddelandet
      client.Send(message);
      // stänger uppkopplingen när vi är klara
      client.Disconnect(true);
    }
  }
}