import { Search, Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconButton } from './ui/IconButton';

export default function TopBar() {
  const { auth } = useAuth();
  const userInitial = (auth?.user?.username || auth?.user?.email || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <header className="h-16 sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border-soft flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-[380px]">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
          />
          <input
            type="search"
            placeholder="Search transactions, budgets, people…"
            className="w-full pl-11 pr-16 py-2.5 bg-surface border border-border-soft rounded-pill text-[13px] font-sans text-text-main placeholder:text-text-dim focus:outline-none focus:border-border-mid focus-ring"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-block bg-surface-2 border border-border-soft rounded-sm px-1.5 py-0.5 text-[10px] font-ui text-text-dim">
            ⌘K
          </kbd>
        </label>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <IconButton aria-label="Help">
          <HelpCircle size={16} />
        </IconButton>
        <IconButton aria-label="Notifications" className="relative">
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-pill bg-honey animate-[tipPulse_2.2s_ease-in-out_infinite]"
            style={{ boxShadow: '0 0 8px var(--honey)' }}
          />
        </IconButton>
        <Link
          to="/profile"
          className="w-9 h-9 rounded-pill bg-accent text-forest-d font-ui font-bold flex items-center justify-center text-[13px] focus-ring"
          title="Profile"
        >
          {userInitial}
        </Link>
      </div>
    </header>
  );
}
