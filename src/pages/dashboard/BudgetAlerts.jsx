import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardEyebrow } from '../../components/ui/Card';

const CATEGORY_DOTS = ['var(--emerald)', 'var(--sage)', 'var(--gold)', 'var(--rose)', 'var(--mint)'];

function stateFor(pct) {
  if (pct >= 100) return 'over';
  if (pct >= 80) return 'warn';
  return 'ok';
}

const FILL_GRADIENT = {
  ok:   'linear-gradient(90deg, var(--sage), var(--emerald))',
  warn: 'linear-gradient(90deg, var(--gold), var(--amber))',
  over: 'linear-gradient(90deg, var(--clay), #8f3e28)',
};

const STATUS_TEXT = {
  ok:   { label: 'OK',          color: 'var(--sage)' },
  warn: { label: 'NEAR LIMIT',  color: 'var(--amber)' },
  over: { label: 'OVER',        color: 'var(--clay)' },
};

export default function BudgetAlerts() {
  const { auth, logout } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noBudgets, setNoBudgets] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('budgets/summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data.length === 0) setNoBudgets(true);
        else setBudgets(data);
      } catch (err) {
        console.error('Failed to fetch budgets:', err);
        if (err?.response?.status === 404) setNoBudgets(true);
        else setError('Failed to load budgets.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetch();
  }, [auth, logout]);

  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Budgets</CardEyebrow>
        <Link to="/budgets" className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent">
          View all →
        </Link>
      </CardHeader>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 bg-surface-2 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-[13px] text-clay">{error}</div>
      ) : noBudgets ? (
        <div className="py-6 text-center">
          <p className="font-serif italic text-[15px] text-text-muted mb-2">
            No budgets yet.
          </p>
          <Link to="/budgets" className="text-[12px] text-accent-deep underline hover:text-accent">
            Set up budgets
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {budgets.slice(0, 3).map((b, idx) => {
            const spent = parseFloat(b.spent || b.total_spent || 0);
            const limit = parseFloat(b.budget || b.limit || b.amount || 0);
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const state = stateFor(pct);
            const status = STATUS_TEXT[state];
            const dot = CATEGORY_DOTS[idx % CATEGORY_DOTS.length];

            return (
              <li key={b.id || b.category || idx} className="space-y-2">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-pill" style={{ background: dot }} />
                    <span className="font-sans font-medium text-text-strong">
                      {b.category_name || b.category || 'Unknown'}
                    </span>
                  </div>
                  <span className="font-serif tnum text-[13.5px]">
                    <span className="text-text-strong font-medium">
                      {spent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-text-muted"> / {limit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-pill overflow-hidden">
                  <div
                    className="h-full rounded-pill transition-all"
                    style={{ width: `${pct}%`, background: FILL_GRADIENT[state] }}
                  />
                </div>
                <div className="flex items-center justify-between font-ui text-[10px] uppercase tracking-[0.06em]">
                  <span className="text-text-dim">{Math.round(pct)}% used</span>
                  <span style={{ color: status.color }}>{status.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
