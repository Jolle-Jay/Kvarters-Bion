import type { JSX } from 'react';
import { createElement } from 'react';
// page components
import StartPage from './pages/StartPage.tsx';
import AiChatPage from './pages/AiChatPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import MoviesPage from './pages/MoviesPage.tsx';
import Bistro from './pages/Bistro.tsx';
import LoginPage from './pages/loginPage.tsx';
import RegPage from './pages/Registrera.tsx';
import ProfilePage from './pages/profilePage.tsx';
import LillaSalongen from './pages/LillaSalongen.tsx';
import StoraSalongen from './pages/StoraSalongen.tsx';
import BookingPage from './pages/BookingPage.tsx';
import ConfirmationPage from './pages/ConfirmPage.tsx';

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
  MoviesPage,
  LillaSalongen,
  StoraSalongen,
  Bistro,
  BookingPage,
  ConfirmationPage,
  ProfilePage,
  LoginPage,
  RegPage
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));