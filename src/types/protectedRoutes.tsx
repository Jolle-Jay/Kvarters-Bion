import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;