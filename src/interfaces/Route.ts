import type { JSX } from 'react';

export default interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string; // Dont need it because we dont have a sub-menu
}

// for interface
// for showing homepage 
// Putting in compontentes that shows homepage 
// URL adress for page
// Functions that collects data before it loads
// Text that is in navmenu
// What order for the menu