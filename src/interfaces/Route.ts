import type { JSX } from 'react';

export default interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string; // behövs inte då vi inte har en under-meny
}

// för interface
// för man ska kunna visa homepage 
// sätter in komponenten som visar hemsidan
// URL adress till sidan
// funktion som hämtar data innan den laddas
// text som står för navigationsmenyn
// vilken ordning som ska läggas i menyn


// Bestämmer var man är på hemsidan