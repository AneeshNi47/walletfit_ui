import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass } from '../../components/ui/formStyles';
import { SummaryCards, fmt } from '../../components/charts/FilterCharts';
import { formatDate } from '../../utils/utils.jsx';

const STATUS = {
  open: { label: 'Open', cls: 'bg-[rgba(196,122,90,0.14)] text-clay' },
  partial: { label: 'Partly repaid', cls: 'bg-accent-soft text-accent-deep' },
  repaid: { label: 'Repaid', cls: 'bg-[rgba(30,107,74,0.14)] text-emerald' },
  written_off: { label: 'Written off', cls: 'bg-surface-2 text-text-dim' },
};

/** Money lent to people (expenses marked as loans) and what has come back. */
export default function OwedPage() {
  const { auth } = useAuth();
  const headers = useMemo(() => ({ Authorization: `Bearer ${auth?.access}` }), [auth]);
  const [data, setData] = useState({ loans: [], total_outstanding: 0, total_lent: 0, total_repaid: 0 });
  const [loading, setLoading] = useState(true);
  const [showSettled, setShowSettled] = useState(false);
  const [repayFor, setRepayFor] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await axios.get('expenses/loans/', { headers });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { if (auth?.access) load(); }, [auth, load]);

  const removeRepayment = async (rid) => {
    if (!window.confirm('Unlink this repayment?')) return;
    await axios.delete(`expenses/repayments/${rid}/`, { headers });
    load();
  };

  const people = useMemo(() => {
    const byPerson = new Map();
    data.loans
      .filter((l) => showSettled || l.status === 'open' || l.status === 'partial')
      .forEach((l) => {
        const p = byPerson.get(l.person) || { person: l.person, outstanding: 0, loans: [] };
        p.outstanding += Number(l.outstanding);
        p.loans.push(l);
        byPerson.set(l.person, p);
      });
    return [...byPerson.values()].sort((a, b) => b.outstanding - a.outstanding);
  }, [data, showSettled]);

  const openCount = data.loans.filter((l) => l.status === 'open' || l.status === 'partial').length;

  return (
    <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-strong">Owed to me</h1>
        <p className="text-sm text-text-muted mt-1">
          Money you lent. Loans don’t count as spending, and repayments linked here don’t count as income.
        </p>
      </div>

      <SummaryCards cards={[
        { label: 'Outstanding', value: fmt(data.total_outstanding), tone: 'text-clay' },
        { label: 'Total Lent', value: fmt(data.total_lent) },
        { label: 'Repaid So Far', value: fmt(data.total_repaid), tone: 'text-emerald' },
      ]} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{openCount} open loan{openCount !== 1 ? 's' : ''}</p>
        <label className="flex items-center gap-2 text-[13px] text-text-main cursor-pointer select-none">
          <input type="checkbox" checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)}
            className="w-4 h-4 accent-[var(--emerald)]" />
          Show repaid &amp; written off
        </label>
      </div>

      {loading ? (
        <div className="py-10 text-center text-text-muted">Loading…</div>
      ) : data.loans.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border-soft p-8 text-center">
          <p className="font-serif italic text-[16px] text-text-muted mb-2">No loans recorded.</p>
          <p className="text-sm text-text-dim">
            On the <Link to="/expenses" className="text-accent-deep underline">Expenses</Link> tab, press Edit on a
            payment you lent someone and choose “Loan to someone”.
          </p>
        </div>
      ) : people.length === 0 ? (
        <div className="py-10 text-center text-text-muted">Everything has been repaid. 🎉</div>
      ) : (
        <div className="space-y-5">
          {people.map((p) => (
            <section key={p.person} className="bg-surface rounded-lg border border-border-soft shadow-sm">
              <header className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
                <h2 className="text-lg font-semibold text-text-strong">{p.person}</h2>
                <span className="text-sm text-text-muted">
                  owes <span className="font-semibold text-clay">{fmt(p.outstanding)}</span>
                </span>
              </header>
              <ul className="divide-y divide-border-soft">
                {p.loans.map((l) => {
                  const pct = Number(l.amount) ? Math.min(100, (Number(l.repaid) / Number(l.amount)) * 100) : 0;
                  return (
                    <li key={l.id} className="px-4 py-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-text-muted">{formatDate(l.date)}</span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS[l.status].cls}`}>
                              {STATUS[l.status].label}
                            </span>
                          </div>
                          <p className="text-[12px] text-text-dim truncate">{l.description}</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-text-strong font-semibold">{fmt(l.amount)} lent</div>
                          <div className="text-text-muted">{fmt(l.repaid)} back · <span className="text-clay">{fmt(l.outstanding)} left</span></div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-pill overflow-hidden">
                        <div className="h-full rounded-pill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--sage), var(--emerald))' }} />
                      </div>
                      {l.repayments.length > 0 && (
                        <ul className="text-[12.5px] space-y-1">
                          {l.repayments.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-2 text-text-muted">
                              <span className="truncate">
                                {formatDate(r.date)} · <span className="text-emerald">+{fmt(r.amount)}</span>{' '}
                                {r.income ? `bank credit${r.income_description ? `: ${r.income_description.slice(0, 50)}` : ''}` : (r.note || 'cash')}
                              </span>
                              <button onClick={() => removeRepayment(r.id)} className="text-text-dim hover:text-clay shrink-0" title="Unlink">✕</button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {(l.status === 'open' || l.status === 'partial') && (
                        <button onClick={() => setRepayFor(l)} className="text-[12.5px] text-accent-deep underline hover:text-accent">
                          + Record repayment
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {repayFor && (
        <Modal title={`Repayment from ${repayFor.person}`} onClose={() => setRepayFor(null)}>
          <RepaymentForm loan={repayFor} headers={headers}
            onDone={() => { setRepayFor(null); load(); }} onCancel={() => setRepayFor(null)} />
        </Modal>
      )}
    </main>
  );
}

/** Link incoming bank credit(s), or record a cash repayment. */
function RepaymentForm({ loan, headers, onDone, onCancel }) {
  const [mode, setMode] = useState('bank');
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [picked, setPicked] = useState([]);
  const [amount, setAmount] = useState(loan.outstanding);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'bank') return undefined;
    const t = setTimeout(() => {
      axios.get('income/', {
        headers,
        params: { available_for_repayment: true, start_date: loan.date, search: search || undefined, page_size: 50 },
      }).then((res) => setCandidates(res.data.results || []))
        .catch(() => setError('Could not load incoming payments.'));
    }, 250);
    return () => clearTimeout(t);
  }, [mode, search, headers, loan.date]);

  const toggle = (id) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const pickedTotal = candidates.filter((c) => picked.includes(c.id)).reduce((s, c) => s + Number(c.amount), 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (mode === 'bank') {
        if (!picked.length) { setError('Pick at least one incoming payment.'); setSaving(false); return; }
        for (const id of picked) {
          await axios.post(`expenses/${loan.id}/repayments/`, { income: id }, { headers });
        }
      } else {
        await axios.post(`expenses/${loan.id}/repayments/`, { amount, date, note }, { headers });
      }
      onDone();
    } catch (err) {
      const d = err.response?.data;
      setError((d && (d.income || d.amount)) ? String(d.income || d.amount) : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg bg-surface-2 border border-border-soft p-3 text-[13px] flex justify-between">
        <span className="text-text-muted">Lent {formatDate(loan.date)}: {fmt(loan.amount)}</span>
        <span className="text-clay font-semibold">{fmt(loan.outstanding)} outstanding</span>
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 bg-surface-2 rounded-lg border border-border-soft">
        {[['bank', 'Incoming bank payment'], ['cash', 'Cash / other']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setMode(k)}
            className={`px-2 py-1.5 rounded-md text-[12.5px] ${mode === k ? 'bg-surface text-text-strong shadow-sm border border-border-soft' : 'text-text-muted'}`}>
            {l}
          </button>
        ))}
      </div>

      {mode === 'bank' ? (
        <div className="space-y-2">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incoming payments (name, description)…" className={fieldClass} />
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border-soft divide-y divide-border-soft">
            {candidates.length === 0 ? (
              <p className="p-3 text-[13px] text-text-dim">No unlinked incoming payments since {loan.date}.</p>
            ) : candidates.map((c) => (
              <label key={c.id} className="flex items-start gap-3 p-2.5 cursor-pointer hover:bg-surface-2">
                <input type="checkbox" checked={picked.includes(c.id)} onChange={() => toggle(c.id)}
                  className="mt-1 w-4 h-4 accent-[var(--emerald)]" />
                <span className="flex-1 min-w-0 text-[13px]">
                  <span className="flex justify-between gap-2">
                    <span className="text-text-muted">{c.date} · {c.source_name || 'Income'}</span>
                    <span className="text-emerald font-semibold">+{fmt(c.amount)}</span>
                  </span>
                  <span className="block text-text-dim truncate">{c.description}</span>
                </span>
              </label>
            ))}
          </div>
          {picked.length > 0 && (
            <p className="text-[12.5px] text-text-muted">
              {picked.length} selected · {fmt(pickedTotal)}
              {pickedTotal > Number(loan.outstanding) + 0.004 && <span className="text-clay"> (more than outstanding)</span>}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="rp-amt">Amount</label>
            <input id="rp-amt" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="rp-date">Date</label>
            <input id="rp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="rp-note">Note</label>
            <input id="rp-note" value={note} onChange={(e) => setNote(e.target.value)} className={fieldClass} />
          </div>
        </div>
      )}

      {error && <p className="text-[13px] text-clay">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save repayment'}</Button>
      </div>
    </form>
  );
}
