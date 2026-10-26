import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardEyebrow } from '../../components/ui/Card';

// Theme colours for the top categories of the window; 'Other' always gets the last one.
const SEGMENT_COLORS = ['var(--emerald)', 'var(--sage)', 'var(--gold)', 'var(--rose)', 'var(--mint)'];
const OTHER_COLOR = 'var(--border-mid)';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

export default function SpendingTrends() {
  const { auth, logout } = useAuth();
  const [data, setData] = useState({ categories: [], days: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('expenses/daily-summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
          params: { days: 14 },
        });
        setData(res.data || { categories: [], days: [] });
      } catch (err) {
        console.error('Error fetching spending trends:', err);
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetch();
  }, [auth, logout]);

  const { legend, maxTotal, periodTotal } = useMemo(() => {
    let colorIdx = 0;
    const lg = data.categories.map((c) => ({
      name: c,
      color: c === 'Other' ? OTHER_COLOR : SEGMENT_COLORS[colorIdx++ % SEGMENT_COLORS.length],
    }));
    return {
      legend: lg,
      maxTotal: data.days.reduce((m, d) => Math.max(m, d.total), 0) || 1,
      periodTotal: data.days.reduce((s, d) => s + d.total, 0),
    };
  }, [data]);

  const hasSpending = periodTotal > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardEyebrow>Last 14 days</CardEyebrow>
          {hasSpending && (
            <div className="font-serif tnum text-[20px] text-text-strong mt-1">{fmt(periodTotal)}</div>
          )}
        </div>
        <Link to="/reports" className="font-ui text-[11px] uppercase tracking-[0.12em] text-accent-deep hover:text-accent">
          Open report →
        </Link>
      </CardHeader>

      {loading ? (
        <div className="h-40 bg-surface-2 rounded animate-pulse" />
      ) : !hasSpending ? (
        <div className="py-8 text-center font-serif italic text-[14px] text-text-muted">
          No spending in the last 14 days.
        </div>
      ) : (
        <>
          <div className="flex items-end gap-1.5 h-44 mt-2">
            {data.days.map((day, i) => {
              const h = day.total > 0 ? Math.max((day.total / maxTotal) * 100, 4) : 0;
              const isToday = i === data.days.length - 1;
              const d = new Date(`${day.date}T00:00:00`);
              const tip = `${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}: ${fmt(day.total)}` +
                legend.filter((c) => day.by_category[c.name] > 0)
                  .map((c) => `\n  ${c.name}: ${fmt(day.by_category[c.name])}`).join('');
              return (
                <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5" title={tip}>
                  <div
                    className={`w-full rounded-t-md overflow-hidden flex flex-col-reverse ${
                      isToday ? 'ring-2 ring-accent' : ''
                    }`}
                    style={{ height: `${h}%` }}
                  >
                    {legend.map((c) => {
                      const v = day.by_category[c.name] || 0;
                      return v > 0 ? (
                        <div key={c.name} style={{ background: c.color, height: `${(v / day.total) * 100}%` }} />
                      ) : null;
                    })}
                  </div>
                  <div className={`font-ui text-[9px] tracking-[0.04em] ${isToday ? 'text-text-strong' : 'text-text-dim'}`}>
                    {String(d.getDate()).padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4">
            {legend.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 font-ui text-[11px] tracking-[0.02em] text-text-muted">
                <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
