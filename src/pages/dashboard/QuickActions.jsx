import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, FileText } from 'lucide-react';
import { Card, CardEyebrow, CardHeader } from '../../components/ui/Card';

export default function QuickActions({ onAddAccount, onAddExpense, onTopUp, onTransfer }) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add expense',
      onClick: onAddExpense,
      icon: ArrowUpRight,
      tile: 'bg-[rgba(196,122,90,0.14)] text-clay',
      shortcut: 'E',
    },
    {
      label: 'Log income',
      onClick: onTopUp,
      icon: ArrowDownLeft,
      tile: 'bg-[rgba(30,107,74,0.14)] text-emerald',
      shortcut: 'I',
    },
    {
      label: 'Top up',
      onClick: onTopUp,
      icon: Plus,
      tile: 'bg-[rgba(232,168,48,0.18)] text-accent-deep',
      shortcut: 'T',
    },
    {
      label: 'Transfer',
      onClick: onTransfer,
      icon: ArrowLeftRight,
      tile: 'bg-[rgba(74,140,106,0.18)] text-sage',
      shortcut: 'R',
    },
    {
      label: 'Report',
      onClick: () => navigate('/reports'),
      icon: FileText,
      tile: 'bg-surface-2 text-text-muted',
      shortcut: 'V',
    },
  ];

  return (
    <Card className="relative overflow-hidden lg:col-span-2">
      {/* Honeycomb motif */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, var(--accent), transparent 28%), radial-gradient(circle at 80% 70%, var(--sage), transparent 32%)',
        }}
      />

      <CardHeader className="relative">
        <div className="flex flex-col gap-1">
          <CardEyebrow>Quick actions</CardEyebrow>
          <h3 className="font-serif font-normal text-[24px] leading-tight text-text-strong">
            What would you like to{' '}
            <span className="italic text-accent-deep">do</span>?
          </h3>
        </div>
        <button
          type="button"
          onClick={onAddAccount}
          className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent"
        >
          + Add account
        </button>
      </CardHeader>

      <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
        {actions.map(({ label, onClick, icon: Icon, tile, shortcut }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="group flex flex-col items-start gap-2.5 p-4 bg-surface border border-border-soft rounded-md hover:border-border-mid hover:-translate-y-px transition-all focus-ring text-left"
          >
            <span className={`w-10 h-10 rounded-md flex items-center justify-center ${tile}`}>
              <Icon size={18} />
            </span>
            <span className="font-sans font-medium text-[13px] text-text-strong">
              {label}
            </span>
            <kbd className="font-ui text-[9px] tracking-[0.08em] text-text-dim bg-surface-2 border border-border-soft rounded-sm px-1.5 py-0.5 uppercase">
              ⌘{shortcut}
            </kbd>
          </button>
        ))}
      </div>
    </Card>
  );
}
