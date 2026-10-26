import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SECTIONS } from './Sidebar';
import { CoinBeeMark } from './ui/CoinBeeMark';
import { Eyebrow } from './ui/Eyebrow';
import { ThemeToggle } from './ui/ThemeToggle';

function MobileNavItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 py-2.5 px-3 rounded-md text-[14px] font-sans font-medium transition-colors',
          isActive
            ? 'bg-surface text-text-strong border border-border-soft shadow-sm'
            : 'text-text-muted hover:text-text-strong hover:bg-surface-tint border border-transparent',
        ].join(' ')
      }
    >
      <Icon size={17} className="shrink-0" />
      <span className="flex-1 truncate">{label}</span>
    </NavLink>
  );
}

export default function MobileNav() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const close = () => setOpen(false);

  const userInitial = (auth?.user?.username || auth?.user?.email || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* Hamburger — only on < lg where the sidebar is hidden */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-strong hover:bg-surface-2 transition-colors focus-ring"
      >
        <Menu size={20} />
      </button>

      {/* Drawer + backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-bg-soft border-r border-border-soft flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <Link to="/dashboard" onClick={close} className="flex items-center gap-2.5">
                <CoinBeeMark size={26} />
                <div>
                  <div className="font-serif font-normal text-[19px] leading-none text-text-strong">
                    Fynbee
                  </div>
                  <Eyebrow size="sm" className="mt-1">Your hive</Eyebrow>
                </div>
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-strong hover:bg-surface-2 transition-colors focus-ring"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
              {SECTIONS.map((section) => (
                <div key={section.heading}>
                  <div className="px-3 pb-2">
                    <Eyebrow size="sm">{section.heading}</Eyebrow>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
                      <MobileNavItem key={item.to} {...item} onNavigate={close} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-border-soft px-3 py-3 flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/profile"
                onClick={close}
                className="w-9 h-9 rounded-pill bg-accent text-forest-d font-ui font-bold flex items-center justify-center text-[13px] focus-ring"
                title="Profile"
              >
                {userInitial}
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 font-ui text-[12px] font-medium px-3 py-2 text-text-muted hover:text-clay hover:bg-surface-2 rounded-md transition-colors focus-ring"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
