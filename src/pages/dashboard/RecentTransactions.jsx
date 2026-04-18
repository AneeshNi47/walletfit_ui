import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardEyebrow, CardHeader } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { formatDate } from '../../utils/utils';

const ICON_FOR = {
  top_up:       { Icon: ArrowDownLeft, tile: 'bg-[rgba(30,107,74,0.12)] text-emerald' },
  transfer_in:  { Icon: ArrowDownLeft, tile: 'bg-[rgba(30,107,74,0.12)] text-emerald' },
  expense:      { Icon: ArrowUpRight,  tile: 'bg-[rgba(196,122,90,0.14)] text-clay' },
  transfer_out: { Icon: ArrowLeftRight, tile: 'bg-[rgba(74,140,106,0.14)] text-sage' },
};

export default function RecentTransactions({ currency = 'AED' }) {
  const { auth, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/accounts/recent_activity/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setActivities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch recent activities:', err);
        setError('Failed to load recent activities.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetch();
  }, [auth, logout]);

  const shown = activities
    .filter((a) => {
      if (filter === 'personal') return !a.is_shared;
      if (filter === 'shared') return a.is_shared;
      return true;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardEyebrow>Recent</CardEyebrow>
          <div className="flex gap-1 mt-2 bg-surface-2 p-1 rounded-pill">
            {['all', 'personal', 'shared'].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1 text-[11px] font-ui uppercase tracking-[0.08em] rounded-pill transition-colors ${
                  filter === k
                    ? 'bg-surface text-text-strong shadow-sm'
                    : 'text-text-muted hover:text-text-strong'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <a href="/expenses" className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent self-start">
          All transactions →
        </a>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-surface-2 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-[13px] text-clay">{error}</div>
      ) : shown.length === 0 ? (
        <div className="py-6 text-center font-serif italic text-[14px] text-text-muted">
          No activity yet.
        </div>
      ) : (
        <ul className="divide-y divide-border-soft">
          {shown.map((a) => {
            const cfg = ICON_FOR[a.type] || { Icon: ArrowLeftRight, tile: 'bg-surface-2 text-text-muted' };
            const { Icon, tile } = cfg;
            const isCredit = ['top_up', 'transfer_in'].includes(a.type);
            return (
              <li
                key={`${a.type}-${a.id}-${a.created_at || ''}`}
                className="py-3 flex items-center gap-3"
              >
                <span className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${tile}`}>
                  <Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-sans font-medium text-[13.5px] text-text-strong truncate">
                      {a.description || a.category_name || 'Transaction'}
                    </p>
                    {a.is_shared ? <Chip variant="shared">Shared</Chip> : null}
                  </div>
                  <div className="font-ui text-[11px] tracking-[0.02em] text-text-dim mt-0.5 capitalize">
                    {String(a.type).replace(/_/g, ' ')}
                    {a.account_name && ` · ${a.account_name}`}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`font-serif text-[16px] tnum ${isCredit ? 'text-emerald' : 'text-clay'}`}>
                    {isCredit ? '+' : '-'}
                    {parseFloat(a.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-text-dim text-[11px] ml-1">{a.currency || currency}</span>
                  </span>
                  <span className="font-ui text-[10.5px] tracking-[0.04em] text-text-dim mt-0.5">
                    {formatDate(a.date)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
