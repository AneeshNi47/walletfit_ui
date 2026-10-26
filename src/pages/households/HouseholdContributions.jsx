import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HouseholdContributions() {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  const [month, setMonth] = useState(currentMonthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Declare-your-own form
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/users/households/contributions/?month=${month}`, { headers });
      setData(res.data);
      // Pre-fill the form with the caller's current declaration for this month.
      const mine = (res.data.contributions || []).find((c) => c.is_me);
      setAmount(mine && mine.declared ? String(mine.amount) : '');
      setNote(mine ? mine.note || '' : '');
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
      setError('Failed to load contributions.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.access, month]);

  useEffect(() => {
    if (auth?.access) fetchContributions();
  }, [auth?.access, month, fetchContributions]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg('');
    if (amount === '' || parseFloat(amount) < 0 || Number.isNaN(parseFloat(amount))) {
      setSaveMsg('Enter a valid amount (0 or more).');
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        '/users/households/contributions/',
        { month, amount, note },
        { headers }
      );
      setSaveMsg('Saved.');
      fetchContributions();
    } catch (err) {
      const d = err.response?.data;
      setSaveMsg((d && (d.amount || d.detail)) || 'Failed to save contribution.');
    } finally {
      setSaving(false);
    }
  };

  const rows = data?.contributions || [];
  const total = parseFloat(data?.total || 0);

  return (
    <div className="bg-surface rounded-lg shadow-md p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text-strong">Contributions</h3>
          <p className="text-sm text-text-muted">
            What each member declares toward the household this month.
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="p-2 border border-border-soft rounded-lg bg-surface text-text-strong text-sm focus:outline-none focus:border-border-mid"
        />
      </div>

      {/* Pool summary */}
      <div className="flex flex-wrap gap-6 items-end border-b border-border-soft pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-dim">Total pool</p>
          <p className="text-2xl font-bold text-emerald">{fmt(total)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-dim">Members</p>
          <p className="text-2xl font-bold text-text-strong">{data?.member_count ?? '—'}</p>
        </div>
      </div>

      {/* Declare your own */}
      <form onSubmit={handleSave} className="space-y-3">
        <p className="text-sm font-medium text-text-strong">Your contribution</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-2 border border-border-soft rounded-lg bg-surface text-text-strong text-sm focus:outline-none focus:border-border-mid"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full p-2 border border-border-soft rounded-lg bg-surface text-text-strong text-sm focus:outline-none focus:border-border-mid"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 min-h-[40px] bg-emerald text-white rounded-lg hover:bg-forest transition disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {saveMsg && (
          <p className={`text-sm ${saveMsg === 'Saved.' ? 'text-emerald' : 'text-clay'}`}>{saveMsg}</p>
        )}
      </form>

      {/* Members table */}
      {loading ? (
        <p className="text-text-muted text-sm py-4">Loading…</p>
      ) : error ? (
        <p className="text-clay text-sm py-4">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-text-muted text-sm py-4">No members yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.user}
              className={`p-3 rounded-lg border ${
                r.is_me ? 'border-border-mid bg-surface-2' : 'border-border-soft bg-bg'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-brand-warm rounded-full flex items-center justify-center text-brand-forest font-bold text-sm flex-shrink-0">
                    {(r.user_name?.[0] || r.username?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-strong truncate">
                      {r.user_name}
                      {r.is_me && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-accent-soft text-accent-deep px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    {r.note ? <p className="text-xs text-text-muted truncate">{r.note}</p> : null}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-text-strong tnum">{fmt(r.amount)}</p>
                  <p className="text-xs text-text-muted">{r.share_pct}%</p>
                </div>
              </div>
              {/* Share bar */}
              <div className="h-1.5 bg-surface-2 rounded-pill overflow-hidden mt-2">
                <div
                  className="h-full rounded-pill"
                  style={{ width: `${r.share_pct}%`, background: 'linear-gradient(90deg, var(--sage), var(--emerald))' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
