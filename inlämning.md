Hur våran produkt var tänkt att fungera?
Användare kan vara inne på sidan boka biljetter utan att vara medlem, kunna kolla på olika filmer, läsa information om filmen som tex, åldersgräns, beskrivning och gengre.
Användaren kan också skapa konto, då går det att avboka filmer, se historik och om användaren har bokat en film och sedan gör ett konto med samma mail kommer filmerna då visas även fast det var bokade innan kontot skapades.

Vi har ägnat ganska mycket tid för att täppa igen dem flesta bristerna, det går inte att dubbelboka eftersom vi änvänder polling för att uppdatera varannan sekund så att om två användare klickar samtidigt är det endast en bokning som kommer igenom.
SQL injections har vi skyddat oss emot när vi har @email i SQL queries så att värdet stoppas in av databasen inte av mig som text.

Applikationens flöde är att det sammanstrålar i main.tsx, routes.ts och app.tsx.
I routes så exporterar vi alla sidor vi har samt att vi importerar TSX filerna, i app.tsx så har vi header, footer, cookies, AI chat bubbla som hänger med i route var vi än navigerar till.
Så i routes kan man säga att vi exporterar bodyn för den URL som användaren befinner sig på just då.
Och Main.tsx ger då den route användaren är på " /example".

Hela boknings och konfirmations logiken flödar från bookingpage.tsx och confirmpage.tsx där det finns logik som när användaren väljer så sparas det först i sessionstorage med stringify, som parsas till BookingData för att läsa ut JSON filen - och sen parsa den igen till stringify för att skicka till backend, därefter skickar ett POST anrop till backend.
sessionstorage kanbara hålla text och HTTP request body är också text, därav stringify två gånger.
Backend validerar datan och skriver till databasen i SAMMA operation (jag har trott det varit separat).
Vid lyckat svar returneras bekräftelsen till frontend.

I vissa fall så hämtas inte bara data, det sparas sen skickas tillbaka.

Konstrueringen ser väldigt gedigen ut och som mitt första projekt i denna skala tycker jag inte det är något mycket mer som jag skulle vilja göra annorlunda, är väldigt stolt över hur hela projektet och inlärnings processen har flödat.

En ny funktionalitet hade kunnat vara admin del och den nya del 25 av backlogen.
Det hade behövts implementera admin del i databasen, vilket vi redan har, ny logik i både backend och frontend.
Jag gillar att börja med databasen först så vi hade behövt göra en tabell för tema/klubb, väva samman detta med backend API anrop, logik för det som händer med frontend.
Inte riktigt säker om jag hade velat börja med backend eller front först, kanske lite i taget för att väva ihop det tråd för tråd.
Eller att göra hela mockupen i frontend först för att få en bild om hur det ska vara för att få lättare överblick i hur det ska knytas ihop.