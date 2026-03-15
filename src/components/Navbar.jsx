import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const financeRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsFinanceOpen(false);
  };

  // Close finance dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (financeRef.current && !financeRef.current.contains(event.target)) {
        setIsFinanceOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close finance dropdown on route change
  useEffect(() => {
    setIsFinanceOpen(false);
  }, [location.pathname]);

  const financeRoutes = ['/expenses', '/income', '/budgets', '/recurring'];
  const isFinanceActive = financeRoutes.includes(location.pathname);

  function isActive(path) {
    return location.pathname === path;
  }

  const baseLinkClass =
    'font-medium transition-all duration-200 hover:text-blue-600';

  function desktopLinkClass(path) {
    return [
      baseLinkClass,
      isActive(path)
        ? 'text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5'
        : 'text-gray-700',
    ].join(' ');
  }

  function mobileLinkClass(path) {
    return [
      'py-2 w-full font-medium transition-all duration-200 hover:text-blue-600',
      isActive(path) ? 'text-blue-700 font-semibold' : 'text-gray-700',
    ].join(' ');
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-700">WalletFit</Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {auth?.access ? (
            <>
              <Link to="/dashboard" className={desktopLinkClass('/dashboard')}>Home</Link>
              <Link to="/accounts" className={desktopLinkClass('/accounts')}>Accounts</Link>

              {/* Finance dropdown */}
              <div
                ref={financeRef}
                className="relative"
                onMouseEnter={() => setIsFinanceOpen(true)}
                onMouseLeave={() => setIsFinanceOpen(false)}
              >
                <button
                  onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                  className={[
                    baseLinkClass,
                    'flex items-center gap-1 bg-transparent border-none cursor-pointer text-sm',
                    isFinanceActive
                      ? 'text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5'
                      : 'text-gray-700',
                  ].join(' ')}
                >
                  Finance
                  <svg
                    className={[
                      'w-4 h-4 transition-transform duration-200',
                      isFinanceOpen ? 'rotate-180' : '',
                    ].join(' ')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={[
                    'absolute top-full left-0 pt-2 w-44',
                    'transition-all duration-200 origin-top',
                    isFinanceOpen
                      ? 'opacity-100 scale-y-100 pointer-events-auto'
                      : 'opacity-0 scale-y-95 pointer-events-none',
                  ].join(' ')}
                >
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <Link
                    to="/expenses"
                    className={[
                      'block px-4 py-2 text-sm transition-all duration-150 hover:bg-blue-50 hover:text-blue-600',
                      isActive('/expenses') ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700',
                    ].join(' ')}
                  >
                    Expenses
                  </Link>
                  <Link
                    to="/income"
                    className={[
                      'block px-4 py-2 text-sm transition-all duration-150 hover:bg-blue-50 hover:text-blue-600',
                      isActive('/income') ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700',
                    ].join(' ')}
                  >
                    Income
                  </Link>
                  <Link
                    to="/budgets"
                    className={[
                      'block px-4 py-2 text-sm transition-all duration-150 hover:bg-blue-50 hover:text-blue-600',
                      isActive('/budgets') ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700',
                    ].join(' ')}
                  >
                    Budgets
                  </Link>
                  <Link
                    to="/recurring"
                    className={[
                      'block px-4 py-2 text-sm transition-all duration-150 hover:bg-blue-50 hover:text-blue-600',
                      isActive('/recurring') ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700',
                    ].join(' ')}
                  >
                    Recurring
                  </Link>
                </div>
                </div>
              </div>

              <Link to="/splits" className={desktopLinkClass('/splits')}>Splits</Link>
              <Link to="/reports" className={desktopLinkClass('/reports')}>Reports</Link>
              <Link to="/household" className={desktopLinkClass('/household')}>Household</Link>
            </>
          ) : (
            <>
              <a href="/#home" className={baseLinkClass + ' text-gray-700'}>Home</a>
              <a href="/#features" className={baseLinkClass + ' text-gray-700'}>Features</a>
              <a href="/#pricing" className={baseLinkClass + ' text-gray-700'}>Pricing</a>
              <a href="/#about" className={baseLinkClass + ' text-gray-700'}>About Us</a>
              <a href="/#contact" className={baseLinkClass + ' text-gray-700'}>Contact</a>
            </>
          )}
        </nav>

        {/* Desktop Auth buttons */}
        {auth?.access ? (
          <div className="hidden md:flex gap-2">
            <Link
              to="/profile"
              className="text-sm font-medium px-4 py-1 border rounded text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-1 border rounded text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Hamburger menu button - mobile only */}
        <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu - Collapsible */}
      <div className={['md:hidden bg-white border-t border-gray-200 py-2 transition-all duration-200', isMobileMenuOpen ? 'block' : 'hidden'].join(' ')}>
        <nav className="flex flex-col items-start px-4 gap-1 text-sm">
          {auth?.access ? (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu} className={mobileLinkClass('/dashboard')}>Home</Link>
              <Link to="/accounts" onClick={closeMobileMenu} className={mobileLinkClass('/accounts')}>Accounts</Link>

              {/* Finance expandable section (mobile) */}
              <button
                onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                className={[
                  'py-2 w-full text-left font-medium flex items-center justify-between transition-all duration-200 hover:text-blue-600',
                  isFinanceActive ? 'text-blue-700 font-semibold' : 'text-gray-700',
                ].join(' ')}
              >
                Finance
                <svg
                  className={[
                    'w-4 h-4 transition-transform duration-200',
                    isFinanceOpen ? 'rotate-180' : '',
                  ].join(' ')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={[
                  'w-full pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-200',
                  isFinanceOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
              >
                <Link to="/expenses" onClick={closeMobileMenu} className={mobileLinkClass('/expenses')}>Expenses</Link>
                <Link to="/income" onClick={closeMobileMenu} className={mobileLinkClass('/income')}>Income</Link>
                <Link to="/budgets" onClick={closeMobileMenu} className={mobileLinkClass('/budgets')}>Budgets</Link>
                <Link to="/recurring" onClick={closeMobileMenu} className={mobileLinkClass('/recurring')}>Recurring</Link>
              </div>

              <Link to="/splits" onClick={closeMobileMenu} className={mobileLinkClass('/splits')}>Splits</Link>
              <Link to="/reports" onClick={closeMobileMenu} className={mobileLinkClass('/reports')}>Reports</Link>
              <Link to="/household" onClick={closeMobileMenu} className={mobileLinkClass('/household')}>Household</Link>
            </>
          ) : (
            <>
              <a href="/#home" onClick={closeMobileMenu} className="py-2 w-full font-medium text-gray-700 transition-all duration-200 hover:text-blue-600">Home</a>
              <a href="/#features" onClick={closeMobileMenu} className="py-2 w-full font-medium text-gray-700 transition-all duration-200 hover:text-blue-600">Features</a>
              <a href="/#pricing" onClick={closeMobileMenu} className="py-2 w-full font-medium text-gray-700 transition-all duration-200 hover:text-blue-600">Pricing</a>
              <a href="/#about" onClick={closeMobileMenu} className="py-2 w-full font-medium text-gray-700 transition-all duration-200 hover:text-blue-600">About Us</a>
              <a href="/#contact" onClick={closeMobileMenu} className="py-2 w-full font-medium text-gray-700 transition-all duration-200 hover:text-blue-600">Contact</a>
            </>
          )}
        </nav>

        {/* Mobile Auth buttons */}
        {auth?.access ? (
          <div className="flex flex-col items-start px-4 mt-3 gap-2">
            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="w-full text-center text-sm font-medium px-4 py-2 border rounded text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-center text-sm font-medium px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start px-4 mt-3 gap-2">
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="w-full text-center text-sm font-medium px-4 py-2 border rounded text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={closeMobileMenu}
              className="w-full text-center text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
