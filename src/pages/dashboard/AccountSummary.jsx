import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Eyebrow } from '../../components/ui/Eyebrow';

function formatWhole(n) {
  return Math.trunc(n).toLocaleString('en-US');
}
function formatCents(n) {
  return (Math.round(n * 100) / 100).toFixed(2).split('.')[1];
}

export default function AccountSummary({ currency = 'AED' }) {
  const { auth } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/accounts/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data?.results || []);
        setAccounts(data);
      } catch (err) {
        console.error('Failed to fetch accounts for summary:', err);
        setError('Failed to load accounts.');
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetchAccounts();
  }, [auth]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0),
    [accounts],
  );

  return (
    <div
      className="relative forest-gradient text-cream rounded-xl p-8 shadow-hero overflow-hidden"
      style={{ minHeight: 320 }}
    >
      {/* Ambient pulse dot */}
      <span
        className="absolute top-6 right-6 w-1.5 h-1.5 rounded-pill bg-honey"
        style={{
          boxShadow: '0 0 10px var(--honey), 0 0 20px rgba(245,200,66,0.35)',
          animation: 'tipPulse 2.2s ease-in-out infinite',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(245,200,66,0.5), transparent 45%), radial-gradient(circle at 80% 90%, rgba(168,212,188,0.4), transparent 50%)',
        }}
      />

      <div className="relative flex flex-col gap-6">
        <div className="space-y-2">
          <div className="font-ui uppercase text-[10px] tracking-[0.18em] text-foam/60">
            Total balance · all accounts
          </div>
          {loading ? (
            <div className="h-16 w-56 bg-white/5 rounded-md animate-pulse" />
          ) : error ? (
            <div className="text-[14px] text-foam/70">{error}</div>
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="font-serif font-light text-[64px] md:text-[72px] leading-none tnum text-cream">
                {currency} {formatWhole(totalBalance)}
              </span>
              <span className="font-serif font-light text-[32px] leading-none tnum text-mint/60">
                .{formatCents(totalBalance)}
              </span>
            </div>
          )}
          <span
            className="inline-flex items-center gap-1.5 font-ui font-medium text-[11px] px-3 py-1 rounded-pill mt-2"
            style={{
              background: 'rgba(245,200,66,0.12)',
              color: 'var(--honey)',
            }}
          >
            ▲ Balances synced
          </span>
        </div>

        {/* Account chips */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {accounts.slice(0, 4).map((acc) => (
              <div
                key={acc.id}
                className="rounded-md p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(168,212,188,0.15)',
                }}
              >
                <div className="font-ui uppercase text-[9px] tracking-[0.14em] text-foam/50 truncate">
                  {acc.name || 'Account'}
                </div>
                <div className="font-serif font-normal text-[16px] tnum text-cream mt-1">
                  {parseFloat(acc.balance || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="rounded-md p-3 flex items-center justify-center gap-1.5 transition-colors text-[11px] font-ui uppercase tracking-[0.14em] focus-ring"
              style={{
                border: '1px dashed rgba(168,212,188,0.25)',
                color: 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--honey)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')
              }
            >
              <Plus size={14} /> Add account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
