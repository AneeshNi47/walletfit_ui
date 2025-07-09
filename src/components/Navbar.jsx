import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react'; // Import useState

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-700">💰 WalletFit</Link>

        {/* Desktop navigation - Hidden on mobile */}
        <nav className="hidden md:flex gap-6 text-sm">
          {auth?.access ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">Home</Link>
              <Link to="/accounts" className="hover:text-blue-600">Accounts</Link>
              <Link to="/reports" className="hover:text-blue-600">Reports</Link>
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

        {/* Desktop Auth buttons - Hidden on mobile */}
        {auth?.access ? (
          <div className="hidden md:flex gap-2">
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
          <div className="hidden md:flex gap-2">
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

        {/* Hamburger menu button - Visible on mobile only */}
        <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> // X icon
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> // Hamburger icon
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu - Collapsible */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-200 py-2`}>
        <nav className="flex flex-col items-start px-4 gap-3 text-sm">
          {auth?.access ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Home</Link>
              <Link to="/accounts" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Accounts</Link>
              <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Reports</Link>
              <Link to="/household" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Household</Link>
            </>
          ) : (
            <>
              <a href="/#home" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Home</a>
              <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Features</a>
              <a href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Pricing</a>
              <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">About Us</a>
              <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-blue-600 w-full">Contact</a>
            </>
          )}
        </nav>

        {/* Mobile Auth buttons */}
        {auth?.access ? (
          <div className="flex flex-col items-start px-4 mt-3 gap-2">
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center text-sm px-4 py-2 border rounded text-blue-600 hover:bg-blue-50"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-center text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start px-4 mt-3 gap-2">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center text-sm px-4 py-2 border rounded text-blue-600 hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}