import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-700">💰 WalletFit</Link>

        {/* Dynamic navigation */}
        <nav className="hidden md:flex gap-6 text-sm">
          {auth?.access ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">Home</Link>
              <Link to="/accounts" className="hover:text-blue-600">Accounts</Link>
              <Link to="/transactions" className="hover:text-blue-600">Transactions</Link>
              <Link to="/household" className="hover:text-blue-600">Household</Link>
            </>
          ) : (
            <>
              <a href="/#home" className="hover:text-blue-600">Home</a>
              <a href="/#features" className="hover:text-blue-600">Features</a>
              <a href="/#pricing" className="hover:text-blue-600">Pricing</a>
              <a href="/#about" className="hover:text-blue-600">About Us</a>
              <a href="/#contact" className="hover:text-blue-600">Contact</a>
            </>
          )}
        </nav>

        {/* Auth buttons */}
        {auth?.access ? (
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="text-sm px-4 py-1 border rounded text-blue-600 hover:bg-blue-50"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="text-sm px-4 py-1 border rounded text-blue-600 hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
