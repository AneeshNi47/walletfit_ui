import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import PayeeForm, { shortIban } from '../../components/PayeeForm';
import { fmt } from '../../components/charts/FilterCharts';

/** Named bank accounts (IBANs) + accounts seen in transactions that don't have a name yet. */
export default function PayeesPage() {
  const { auth } = useAuth();
  const headers = useMemo(() => ({ Authorization: `Bearer ${auth?.access}` }), [auth]);
  const [data, setData] = useState({ payees: [], unnamed: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {payee} | {iban, count}
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await axios.get('expenses/payees/', { headers });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load payees:', err);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { if (auth?.access) load(); }, [auth, load]);

  const onSaved = (res) => {
    setEditing(null);
    setNotice(res.recategorized ? `Saved. ${res.recategorized} transaction${res.recategorized !== 1 ? 's' : ''} re-categorized.` : 'Saved.');
    load();
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove the name “${p.name}”? Transactions keep their categories.`)) return;
    await axios.delete(`expenses/payees/${p.id}/`, { headers });
    load();
  };

  const Row = ({ iban, children, sent, received, count }) => (
    <li className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex-1 min-w-0">{children}<div className="font-mono text-[12px] text-text-dim">{iban}</div></div>
      <div className="text-[13px] text-text-muted sm:text-right shrink-0">
        {Number(sent) > 0 && <div>sent <span className="text-clay font-semibold">{fmt(sent)}</span></div>}
        {Number(received) > 0 && <div>received <span className="text-emerald font-semibold">{fmt(received)}</span></div>}
        <div className="text-text-dim">{count} transaction{count !== 1 ? 's' : ''}</div>
      </div>
    </li>
  );

  return (
    <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">Payees</h1>
          <p className="text-sm text-text-muted mt-1">
            Names for the bank accounts (IBANs) in your transfers. Any transaction with a named IBAN shows the name.
          </p>
        </div>
        <button onClick={() => setEditing({ iban: '' })}
          className="px-4 py-2 bg-emerald text-white rounded hover:bg-forest w-full sm:w-auto">
          + Add by IBAN
        </button>
      </div>

      {notice && <p className="text-[13px] text-emerald">{notice}</p>}

      {loading ? (
        <div className="py-10 text-center text-text-muted">Loading…</div>
      ) : (
        <>
          <section className="bg-surface rounded-lg border border-border-soft shadow-sm">
            <h2 className="px-4 py-3 border-b border-border-soft font-semibold text-text-strong">
              Named ({data.payees.length})
            </h2>
            {data.payees.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-text-dim">No names yet. Name an account below.</p>
            ) : (
              <ul className="divide-y divide-border-soft">
                {data.payees.map((p) => (
                  <Row key={p.id} iban={p.iban} sent={p.sent} received={p.received} count={p.count}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-strong">{p.kind === 'organization' ? '🏢' : '👤'} {p.name}</span>
                      {p.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-warm text-brand-forest">{p.category.name}</span>
                      )}
                      <button onClick={() => setEditing({ payee: p, count: p.count })} className="text-[12.5px] text-accent-deep underline">Edit</button>
                      <button onClick={() => remove(p)} className="text-[12.5px] text-text-dim hover:text-clay">Remove</button>
                    </div>
                  </Row>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-surface rounded-lg border border-border-soft shadow-sm">
            <h2 className="px-4 py-3 border-b border-border-soft font-semibold text-text-strong">
              Not named yet ({data.unnamed.length})
            </h2>
            {data.unnamed.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-text-dim">Every IBAN in your transactions has a name.</p>
            ) : (
              <ul className="divide-y divide-border-soft">
                {data.unnamed.map((u) => (
                  <Row key={u.iban} iban={u.iban} sent={u.sent} received={u.received} count={u.count}>
                    <button onClick={() => setEditing({ iban: u.iban, count: u.count })}
                      className="text-[13px] text-accent-deep underline hover:text-accent">
                      Name {shortIban(u.iban)}
                    </button>
                  </Row>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {editing && (
        <Modal title={editing.payee ? 'Edit payee' : 'Name this account'} onClose={() => setEditing(null)}>
          <PayeeForm payee={editing.payee} iban={editing.iban || undefined} txCount={editing.count}
            onSaved={onSaved} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </main>
  );
}
