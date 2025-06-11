import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { auth } = useAuth();
  return auth?.access ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
