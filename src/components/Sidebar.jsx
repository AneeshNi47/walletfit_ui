import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Repeat,
  Users,
  Split,
  Mail,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { CoinBeeMark } from './ui/CoinBeeMark';
import { Eyebrow } from './ui/Eyebrow';

const SECTIONS = [
  {
    heading: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/reports', label: 'Reports', icon: LineChart },
    ],
  },
  {
    heading: 'Money',
    items: [
      { to: '/accounts', label: 'Accounts', icon: Wallet },
      { to: '/expenses', label: 'Expenses', icon: ArrowLeftRight },
      { to: '/income', label: 'Income', icon: PiggyBank },
      { to: '/budgets', label: 'Budgets', icon: PiggyBank },
      { to: '/recurring', label: 'Recurring', icon: Repeat },
    ],
  },
  {
    heading: 'Household',
    items: [
      { to: '/household', label: 'Households', icon: Users },
      { to: '/splits', label: 'Split expenses', icon: Split },
      { to: '/categories', label: 'Categories', icon: Mail },
    ],
  },
];

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 py-2 px-3 rounded-md text-[13.5px] font-sans font-medium transition-colors',
          isActive
            ? 'bg-surface text-text-strong border border-border-soft shadow-sm'
            : 'text-text-muted hover:text-text-strong hover:bg-surface-tint border border-transparent',
        ].join(' ')
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span className="bg-accent text-forest-d font-ui font-bold text-[10px] px-1.5 py-0.5 rounded-pill">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = (auth?.user?.username || auth?.user?.email || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 bg-bg-soft border-r border-border-soft h-screen sticky top-0">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2.5 px-5 pt-6 pb-5 focus-ring rounded-md mx-2">
        <CoinBeeMark size={28} />
        <div>
          <div className="font-serif font-normal text-[20px] leading-none text-text-strong">
            Fynbee
          </div>
          <Eyebrow size="sm" className="mt-1">Your hive</Eyebrow>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="px-3 pb-2">
              <Eyebrow size="sm">{section.heading}</Eyebrow>
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Household switcher */}
      <div className="px-3 pb-3">
        <button
          type="button"
          className="w-full flex items-center gap-3 p-3 bg-surface border border-border-soft rounded-md hover:border-border-mid transition-colors focus-ring"
        >
          <span
            className="w-7 h-7 rounded-pill shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e6b4a, #4a8c6a)' }}
          />
          <div className="flex-1 text-left min-w-0">
            <Eyebrow size="sm">Household</Eyebrow>
            <div className="text-[13px] font-sans font-medium text-text-strong truncate">
              {auth?.user?.household_name || 'My hive'}
            </div>
          </div>
          <ChevronDown size={14} className="text-text-dim" />
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-border-soft px-3 py-3 flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/profile"
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
  );
}
