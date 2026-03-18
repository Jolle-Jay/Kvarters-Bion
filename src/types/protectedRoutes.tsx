import { Navigate } from 'react-router-dom';
import type { JSX } from 'react';


const ProtectedRoute = ({ children }: { children: JSX.Element; }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;