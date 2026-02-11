export default interface Product {
  id: number;
  name: string;
  quantity: string;
  price$: number;
  slug: string; //behövs den för att förtydliga priset?
  description: string;
  categories: string[];
}

// Bestämmer vad som visas på just den sidan

// ID nummer för produkten (filmer)
// Filmernas namn
// lagerstatus eller mängder filmer som visas
// priserna för biljetterna
// url frtydliga valutan men datatypen är ett nummer
// beskrvinign på filmerna
// lista av arrays som filmerna tillhör