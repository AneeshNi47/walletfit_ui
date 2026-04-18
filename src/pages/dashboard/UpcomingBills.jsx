import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardEyebrow, CardHeader } from '../../components/ui/Card';

function daysUntil(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

function formatDueLabel(date) {
  const delta = daysUntil(date);
  if (delta === 0) return 'due today';
  if (delta === 1) return 'due tomorrow';
  if (delta > 0) return `due in ${delta} days`;
  return 'overdue';
}

export default function UpcomingBills() {
  const { auth, logout } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noRecurring, setNoRecurring] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('recurring/upcoming/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data.length === 0) setNoRecurring(true);
        else setBills(data);
      } catch (err) {
        console.error('Failed to fetch upcoming bills:', err);
        if (err?.response?.status === 404) setNoRecurring(true);
        else setError('Failed to load upcoming bills.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetch();
  }, [auth, logout]);

  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 14);

  const upcoming = bills
    .map((b) => ({ ...b, _due: b.next_due_date || b.due_date || b.date }))
    .filter((b) => {
      const d = new Date(b._due);
      return d >= now && d <= weekFromNow;
    })
    .slice(0, 4);

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div>
          <CardEyebrow>Upcoming</CardEyebrow>
          <div className="font-serif font-normal text-[18px] text-text-strong mt-1">
            Next 14 days
          </div>
        </div>
        <Link
          to="/recurring"
          className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent"
        >
          Manage recurring →
        </Link>
      </CardHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-[13px] text-clay">{error}</div>
      ) : noRecurring || upcoming.length === 0 ? (
        <div className="py-6 text-center font-serif italic text-[14px] text-text-muted">
          Nothing due in the next two weeks.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {upcoming.map((b, idx) => {
            const d = new Date(b._due);
            const day = d.getDate();
            const month = d
              .toLocaleString('en-US', { month: 'short' })
              .toUpperCase();
            const dueLabel = formatDueLabel(b._due);
            const amount = parseFloat(b.amount || 0);

            return (
              <div
                key={b.id || idx}
                className="flex items-center gap-3 p-3.5 border border-border-soft rounded-lg hover:border-border-mid transition-colors"
              >
                <div className="w-11 h-11 shrink-0 bg-surface-2 rounded-md flex flex-col items-center justify-center">
                  <span className="font-serif font-medium text-[17px] leading-none text-text-strong tnum">
                    {day}
                  </span>
                  <span className="font-ui text-[9px] tracking-[0.14em] uppercase text-text-dim mt-0.5">
                    {month}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-[13px] text-text-strong truncate">
                    {b.name || b.description || 'Bill'}
                  </p>
                  <p className="font-ui text-[10.5px] text-text-dim tracking-[0.02em]">
                    <span className="text-amber">{dueLabel}</span>
                  </p>
                </div>
                <span className="font-serif text-[17px] tnum text-text-strong">
                  {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
