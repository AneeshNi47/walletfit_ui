import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import EditExpenseForm from '../expenses/EditExpenseForm';
import FilterCharts, {
  FilterChips, SummaryCards, monthRange, fmt,
} from '../../components/charts/FilterCharts';
import { formatDate } from '../../utils/utils.jsx';

const PAGE_SIZE = 20;

/** Expenses the user marked as savings: running total, monthly chart and the noted list. */
export default function SavingsPage() {
  const { auth } = useAuth();
  const [summary, setSummary] = useState({ total: 0, count: 0, this_month: 0, monthly: [] });
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(null);
  const [editing, setEditing] = useState(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${auth?.access}` }), [auth]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get('expenses/savings-summary/', { headers });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch savings summary:', err);
    }
  }, [headers]);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get('expenses/', {
        headers,
        params: {
          is_savings: true,
          page: p,
          page_size: PAGE_SIZE,
          ...(monthFilter ? monthRange(monthFilter) : {}),
        },
      });
      setItems(res.data.results);
      setCount(res.data.count);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch savings:', err);
    } finally {
      setLoading(false);
    }
  }, [headers, monthFilter]);

  useEffect(() => { if (auth?.access) fetchSummary(); }, [auth, fetchSummary]);
  useEffect(() => { if (auth?.access) fetchItems(1); }, [auth, fetchItems]);

  const handleSaved = () => {
    setEditing(null);
    fetchSummary();
    fetchItems(page);
  };

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const monthLabel = summary.monthly.find((m) => m.key === monthFilter)?.month || monthFilter;

  return (
    <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-strong">Savings</h1>
        <p className="text-sm text-text-muted mt-1">
          Expenses you marked as savings. They still count as spending on the Expenses tab.
        </p>
      </div>

      <SummaryCards cards={[
        { label: 'Total Saved (All Time)', value: fmt(summary.total), tone: 'text-emerald' },
        { label: 'Saved This Month', value: fmt(summary.this_month), tone: 'text-emerald' },
        { label: 'Savings Entries', value: summary.count },
      ]} />

      {summary.count === 0 && !loading ? (
        <div className="bg-surface rounded-lg border border-border-soft p-8 text-center">
          <p className="font-serif italic text-[16px] text-text-muted mb-2">Nothing marked as savings yet.</p>
          <p className="text-sm text-text-dim">
            On the <Link to="/expenses" className="text-accent-deep underline">Expenses</Link> tab, press
            “Savings” on an expense (like a gold purchase or a transfer to savings) and add a note.
          </p>
        </div>
      ) : (
        <>
          <div className="max-w-2xl">
            <FilterCharts
              monthly={summary.monthly}
              barColor="#10b981"
              barTitle="Saved per Month"
              selectedMonth={monthFilter}
              onSelectMonth={setMonthFilter}
            />
          </div>

          <FilterChips
            chips={[{ label: monthFilter && monthLabel, onClear: () => setMonthFilter(null) }]}
          />

          {loading ? (
            <div className="py-10 text-center text-text-muted">Loading savings…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-text-muted">No savings in this month.</div>
          ) : (
            <div className="space-y-3">
              {items.map((x) => (
                <div
                  key={x.id}
                  className="bg-surface rounded-lg border border-border-soft shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-text-muted">{formatDate(x.date)}</span>
                      {x.category && (
                        <span className="inline-block bg-surface-2 text-text-main text-xs px-2 py-0.5 rounded-full border border-border-soft">
                          {x.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[15px] text-text-strong mt-1 break-words">
                      {x.savings_note || <span className="text-text-dim italic">No note</span>}
                    </p>
                    <p className="text-[12px] text-text-dim mt-0.5 truncate">{x.description}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-lg font-bold text-emerald">{fmt(x.amount)}</span>
                    <button
                      onClick={() => setEditing(x)}
                      className="px-3 py-1 bg-surface-2 text-text-main border border-border-soft text-sm rounded hover:border-border-mid"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => fetchItems(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 min-h-[44px] rounded text-sm font-medium bg-surface-2 text-text-main disabled:text-text-dim disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">Page {page} of {pages}</span>
              <button
                onClick={() => fetchItems(page + 1)}
                disabled={page >= pages}
                className="px-4 py-2 min-h-[44px] rounded text-sm font-medium bg-surface-2 text-text-main disabled:text-text-dim disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(null)}>
          <EditExpenseForm expense={editing} onSuccess={handleSaved} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </main>
  );
}
