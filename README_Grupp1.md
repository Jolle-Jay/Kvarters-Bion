https://github.com/Jolle-Jay/Kvarters-Bion - GitHub Repo

Gruppmedlemar i Grupp1/PPP: 
Gustav Fransson -- Chim-Cham
Jenjira Phayakhruea -- jenjira185
Lina Hallergren -- LinaHalle
David Puscas -- Piexgear
Jonathan Lopez -- Jolle-Jay

Systemet Kvartesbion biografbokningssystem byggt med React och TS i frontend, C# i backend, kopplat till en MySQL databas.
Användaren kan navigera och kolla på olika filmer som visas, kolla trailer, läsa information om filmen, boka bioplatser, skapa inloggning, logga in och vid inloggning se bokningshistorik samt avboka bokade filmer.

{
  "host": "",
  "port": ,
  "username": "",
  "password": "",
  "database": "",
  "createTablesIfNotExist": true,
  "seedDataIfEmpty": true,
  "resetDb": false,
  "aiAccessToken": "",
  "smtpServer": "",
  "smtpPort": ,
  "emailUsername": "",
  "emailPassword": ""
}

Användarnamn som går att logga in till är;
davidpuscas@live.se - password123
j.lopezzz@hotmail.com - 123123

Vi har endast användare, ingen Admin.
Thomas admin konto finns fortfarande sedan starten.


Teknisk skuld:
Vi har försökt använda oss av dry men det har inte hållt sig överallt. Vi har på många platser i css komponenterna där vi använt oss av kod som gör samma sak.
Kan strukturera upp kod bättre och kanske även bryta ut mer i komponenter med allt vi har gjort.


Lösningarkitektur:
Systemet är uppbyggt enligt en klient-server-arkitektur där frontend och backend är separerade. Frontend ansvarar för användargränssnittet medan backend hanterar affärslogik och datahantering. Kommunikation sker via ett REST API över HTTP.

Teknologier

Frontend: React (Vite) med TypeScript

Backend: C# (.NET)

Databas: MySQL (molnbaserad)

Komponenter 
Frontend 
Frontend-applikationen är byggd med React och Vite samt använder TypeScript för typkontroll. 

Den ansvarar för: 
Rendering av användargränssnittet 
Hantering av användarinteraktioner 
Kommunikation med backend via API-anrop 
Backend 

Backend är utvecklad i C# med .NET och ansvarar för:
Affärslogik 
API-endpoints 
Validering av inkommande data 
Kommunikation med databasen 
Databas 

En molnbaserad MySQL-databas används för lagring av: 
Filmer 
Visningstider 
Bokningar 
Användardata 
Dataflöde 

Användaren öppnar webbapplikationen i webbläsaren: 
Frontend skickar HTTP-förfrågningar till backend 
Backend bearbetar förfrågan 
Backend hämtar eller sparar data i databasen 
Ett svar skickas tillbaka till frontend 
Frontend uppdaterar användargränssnittet 
Arkitekturval 
Separation mellan frontend och backend förbättrar skalbarhet och underhållbarhet 
TypeScript minskar risken för typrelaterade buggar 
.NET valdes för stabilitet och prestanda 
Molnbaserad databas möjliggör hög tillgänglighet 

Begränsningar: 
Begränsad säkerhet (t.ex. ingen fullständig autentisering) 
Ingen caching implementerad 
Begränsad felhantering i vissa delar av systemet 



Planerat men ej genomfört arbete:
Vi valde att fokusera på grund kraven och uppnå alla krav fullständigt innan vi går in på fler punkter i projektet. 
Detta gjorde att vi fick ett mer komplett projekt istället för att ha fler funktioner som inte är hela.

Framtida förbättringar: 
Implementera autentisering och auktorisering 
Förbättra felhantering och loggning 
Införa caching för bättre prestanda 
Optimera databasfrågor 











-================================ Cloning the repo ====================================-

1.
Starting of to get the repo to your local machine you need to clone it. 

Open this link: https://github.com/Jolle-Jay/Kvarters-Bion
press the green button that says code
copy the link ether http link or ssh link. 

2.
then open your terminal and run this command: 

git clone <http/ssh link> 

You should now see that the repo is downloaded so now you can navigate into the project.

-=============================== Seting up the project ==================================-

1.
When you have entered the directory for the projekt type: 
npm install 

You should now see a folder named node_modules and package-lock.json

2.
Next step is to change the content of file named: db-configTemplate.json
this file should match your database connection. 

3.
After changing the content you need to change the name of that file so it's named: 
db-config.json

-================================ Ready to start ========================================-

1.
To run the frontend you need to open the terminal and run the command: 
npm run dev

2.
After waiting a while so the terminal stands still with some oragne text you can open the local host
in your web browser.

3.
Now your ready to browse the website and make some bookings for the films listed. 
talk to the AI agent to help you find what your looking for. 

-=============================== is something wrong? =====================================-

To get started you need to check for your dotnet version downloaded on your pc. 

To check your version on dotnet open up your perfered terminal. 
________________________________________________________________________________________

dotnet --version
You should have at least version 10.x.xx

If your dotnet version is lower than 10 you need to install it first and restar your pc. 
________________________________________________________________________________________

We can see later if the react and vite is correct version by typing:
npm list react     <-- should say at least 19.x.x 
npm list vite      <-- should say at least 7.x.x
________________________________________________________________________________________

sometimes you need to write: 
npm audit fix


If the database is corrupted or something else in the database is acting up, you can change 
the false to a true, or make it not commentetd in the file DbQuery.cs 

after you have done this the database will be reseted and seeded with the default information.

-============================================================================================-