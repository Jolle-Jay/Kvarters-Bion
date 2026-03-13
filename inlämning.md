Hur våran produkt var tänkt att fungera?
Kvartersbion är ett fullstack-biografbokningssystem byggt med React och TS i frontend samt C# i backend, kopplat till en MySQL databas.

Systemet låter användaren bläddra bland filmer, skapa konto, läsa filminformation och boka biljetter. Antingen som gäst eller inloggad medlem.
Användare kan se sin bokningshistorik och avboka framtida visningar.

Vi har ägnat ganska mycket tid för att täppa igen dem flesta bristerna, det går inte att dubbelboka eftersom vi änvänder polling för att uppdatera varannan sekund så att om två användare klickar samtidigt är det endast en bokning som kommer igenom.
SQL injections har vi skyddat oss emot när vi har @email i SQL queries så att värdet stoppas in av databasen inte av mig som text.


Applikationens flöde är att det sammanstrålar i main.tsx, routes.ts och app.tsx.
I routes så exporterar vi alla sidor vi har samt att vi importerar TSX filerna, i app.tsx så har vi header, footer, cookies, AI chat bubbla som hänger med i route var vi än navigerar till.
Så i routes kan man säga att vi exporterar bodyn för den URL som användaren befinner sig på just då.
Och Main.tsx ger då den route användaren är på " /example".

UseState används för att hålla data som ändras över tid, till exempel valda säten, antal biljetter och inloggningsstatus. UseEffect hanterar sidoeffekter som API anrop och polling.

Hela boknings och konfirmations logiken flödar från bookingpage.tsx och confirmpage.tsx där det finns logik som är följande: När användaren väljer så sparas det först i sessionstorage som sparas i storedData variabel, därefter parsas från JSON och sparas i BookingData som är ett TS objekt.
Därefter läggs det i data som ändrar staten i setBookingData till (data) läggs i funktionen createbooking som då innehåller (data, email) gör till JSON igen med: stringify och en HTTP post och skickas till backend.

Något som vi stötte på ofta var att vi användr JSON.Parse() från Dyndata-biblioteket på inkommande data från frontend, det orsakade cirkulära referenser och sessions korruption.
Lösningen var att använda JsonElement.Getproperty() från System.Text.Json, då hämtar vi specifika värden utan att skapa objektreferenser som ger problem.

Konstrueringen ser väldigt gedigen ut och som mitt första projekt i denna skala tycker jag inte det är något mycket mer som jag skulle vilja göra annorlunda, är väldigt stolt över hur hela projektet och inlärnings processen har flödat.
Lärdom i kod var exponentiellt större i detta projekt, jag har börjat förstå, kunna förklara och hjälpa mina gruppmedlemar med frågor om kod.

En ny funktionalitet hade kunnat vara admin del och den nya del 25 av backlogen.
Det hade behövts implementera admin del i databasen, vilket vi redan har, ny logik i både backend och frontend.
Jag gillar att börja med databasen först så vi hade behövt göra en tabell för tema/klubb, väva samman detta med backend API anrop, logik för det som händer med frontend.
Inte riktigt säker om jag hade velat börja med backend eller front först, kanske lite i taget för att väva ihop det tråd för tråd.
Eller att göra hela mockupen i frontend först för att få en bild om hur det ska vara för att få lättare överblick i hur det ska knytas ihop.
Steg 1 hade varit som i början av projektet, sätta sig ner, skissa gå igenom snabbt.
Steg 2 databas.
Steg 3 mockup
Steg 4 bestämma att börja med backend eller frontend först
- Kanske dela upp teamet, göra databasen tillsammans (så att alla vet vad som är vad och hur den fungerar.)
- Om vi gör en snabb mockup som fungerar kanske det är lättare att göra anknytningar till backend för att vi kan se det som vi vill koppla ihopa det till.

Det finns så många olika vägar att gå, det är jag säker om. Jag ser det spåret vi tog som enklast framför mig, men det kan vara för att det är det enda som jag har tagit?
Vi hade en gedigen mockup som vi hade som ramverk när backend gjordes och API anropen kopplades.
För att våran mockup var JS och CSS rakt av och det var ganska enkelt 
Det fungerade faktiskt riktigt bra, för det fanns något att "ta på".

Vi planerade tillsammans mycket i början, vi var en grupp som hade en runda "på nacken" då den första rundan var rätt kämpig och sammarbetet var svårt.
I slutet av förra projektet hade vi alla klargjort vad det var som inte fungerade och i det här projektet så fick vi glöden att börja brinna!

Jag måste säga att jag var nära att byta till en annan grupp för detta projekt, jag sa det till gruppen för en vecka sedan och en annan medlem sa att hen tänkte detsamma.
Är så glad över att jag valde att stanna kvar och jobba, kämpa, utvecklas, istället för att springa iväg och tro att gräset är grönare på andra sidan.

Vi arbetade i par dem första veckorna och när allt stora och tuffa var klart bröt vi oss och körde på individuellt.
Vi delade så att varje vecka var det någon som var scrum master, körde daily standups och eftermiddagen berättade alla var dem var och var dem skulle.
Andan, kommunikationen, moralen, stämmningen var som helt förändrad, vi var verkligen som ett lag, alla hjälptes åt, förklarade, förstod varandra.
Det visades respekt och alla till och med dem som är lite blygare i gruppen fick blomstra, kom med förslag, perspektiv och synpunkter.
Ett riktigt häftigt skifte!!!
Vad att göra bättre tills nästa gång? Hålla backlogen mer uppdaterad och vara konsekventa, det var inte att vi struntade i den, men det hade kunnats tänkas på mer. Det är nog det enda jag har att säga vad vi hade kunnat göra bättre, eftersom det var ett så stort skifte sedan förra gången och vi hade gått igenom allting i retroperspektivet riktigt tydligt så hade vi så mycket att reflektera på.

Innerligt glad att jag valde att fortsätta med våran grupp.
PPP Forever (Power Puff Pinglorna)

/Jonathan


