import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { auth } = useAuth();
  return auth?.access ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicRoute;
