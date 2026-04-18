import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardEyebrow } from '../../components/ui/Card';

const CATEGORY_COLORS = [
  { key: 'food',  label: 'Food',      color: 'var(--emerald)' },
  { key: 'home',  label: 'Home',      color: 'var(--sage)' },
  { key: 'trans', label: 'Transport', color: 'var(--gold)' },
  { key: 'fun',   label: 'Fun',       color: 'var(--rose)' },
  { key: 'misc',  label: 'Misc',      color: 'var(--mint)' },
];

export default function SpendingTrends() {
  const { auth, logout } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('expenses/monthly-summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setDays(data.slice(-14));
      } catch (err) {
        console.error('Error fetching spending trends:', err);
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetch();
  }, [auth, logout]);

  const { bars, maxTotal } = useMemo(() => {
    const prepped = days.map((d) => {
      const total = parseFloat(d.total || 0);
      const slice = total / CATEGORY_COLORS.length;
      return {
        label: d.month || d.date || '',
        total,
        segments: CATEGORY_COLORS.map((c) => ({ ...c, value: slice })),
      };
    });
    const maxT = prepped.reduce((m, x) => Math.max(m, x.total), 0) || 1;
    return { bars: prepped, maxTotal: maxT };
  }, [days]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardEyebrow>Last 14 days</CardEyebrow>
        <Link to="/reports" className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent">
          Open report →
        </Link>
      </CardHeader>

      {loading ? (
        <div className="h-40 bg-surface-2 rounded animate-pulse" />
      ) : bars.length === 0 ? (
        <div className="py-8 text-center font-serif italic text-[14px] text-text-muted">
          No spending yet this period.
        </div>
      ) : (
        <>
          <div className="flex items-end gap-1.5 h-44 mt-2">
            {bars.map((bar, i) => {
              const h = Math.max((bar.total / maxTotal) * 100, 4);
              const isToday = i === bars.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-t-md overflow-hidden flex flex-col justify-end ${
                      isToday ? 'ring-2 ring-accent' : ''
                    }`}
                    style={{ height: `${h}%`, minHeight: 6 }}
                  >
                    {bar.segments.map((s, j) => (
                      <div
                        key={j}
                        style={{
                          background: s.color,
                          height: `${100 / bar.segments.length}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="font-ui text-[9px] tracking-[0.04em] text-text-dim">
                    {i % 2 === 0 ? String(i + 1).padStart(2, '0') : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4">
            {CATEGORY_COLORS.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5 font-ui text-[11px] tracking-[0.02em] text-text-muted">
                <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />
                {c.label}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
