import type {JSX} from 'react';
import{createElement} from 'react';
// page components
import StartPage from './pages/StartPage.tsx';
import AiChatPage from './pages/AiChatPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import OurVisionPage from './pages/OurVisionPage.tsx';
import Bistro from './pages/Bistro.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import LillaSalongen from './pages/LillaSalongen.tsx';
import StoraSalongen from './pages/StoraSalongen.tsx';
import BookingPage from './pages/BookingPages.tsx';

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
  StartPage,
  AiChatPage,
  NotFoundPage,
  OurVisionPage,
  ProductsPage,
  LillaSalongen,
  StoraSalongen,
  Bistro,
  ProductsPage,
  BookingPage
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));