import type { JSX } from 'react';

export default interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;

}

<Route 
  path="/profile";
element = {
    < ProtectedRoute >
  <Profile />
  </ProtectedRoute>
  } 
/>;

function App() {
  return (
    <Router>
    <Routes>
    <Route path= "/login" element = {< Login />} />
      < Route path = "/profile" element = {< Profile />} />;
{/* Your other routes */ }
</Routes>
  </Router>
  );
}