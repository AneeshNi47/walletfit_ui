import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import AddTransactionForm from './AddTransactionForm';
import EditExpenseForm from './EditExpenseForm';
import ListToolbar, {
  EMPTY_FILTERS, filtersToParams, monthKeyOf, activeFilterChips,
} from '../../components/lists/ListToolbar';
import FilterCharts, {
  FilterChips, SummaryCards, monthRange, currentMonthKey, fmt,
} from '../../components/charts/FilterCharts';
import { formatDate } from '../../utils/utils.jsx';

export default function ListExpenses() {
  const { auth } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('/expenses/');
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Chart data + search/sort/filter state (charts write into the same filters)
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filterParams = useMemo(() => filtersToParams(filters, 'category'), [filters]);
  const monthFilter = monthKeyOf(filters);
  const categoryFilter = filters.group ? Number(filters.group) : null;
  const setMonthFilter = (key) => setFilters((prev) => ({
    ...prev, ...(key ? monthRange(key) : { start_date: '', end_date: '' }),
  }));
  const setCategoryFilter = (id) => setFilters((prev) => ({ ...prev, group: id ? String(id) : '' }));

  const fetchSummary = useCallback(async () => {
    const headers = { Authorization: `Bearer ${auth?.access}` };
    try {
      const [mRes, cRes] = await Promise.all([
        axios.get('expenses/monthly-summary/', { headers }),
        axios.get('expenses/category-summary/', { headers }),
      ]);
      setMonthly(mRes.data);
      setByCategory(cRes.data);
    } catch (err) {
      console.error('Failed to fetch expense summary:', err);
    }
  }, [auth]);

  // `params` only applies to the first page; DRF's next/previous URLs already carry the filters.
  const fetchExpenses = useCallback(async (url = '/expenses/', params) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth?.access}` },
        params,
      });
      setExpenses(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setTotalCount(response.data.count);
      setCurrentUrl(params ? axios.getUri({ url, params }) : url);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (auth?.access) fetchSummary();
  }, [auth, fetchSummary]);

  useEffect(() => {
    if (auth?.access) fetchExpenses('/expenses/', filterParams);
  }, [auth, fetchExpenses, filterParams]);

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`/expenses/${expenseId}/delete/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      fetchExpenses(toApiRelative(currentUrl));
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleAddExpenseSuccess = () => {
    setShowAddExpenseModal(false);
    fetchExpenses(toApiRelative(currentUrl));
    fetchSummary();
  };

  const handleEditSuccess = (updated) => {
    setEditingExpense(null);
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    fetchSummary(); // category totals may have moved
  };

  // DRF returns absolute "next"/"previous" URLs like https://api.fynbee.app/api/expenses/?page=2.
  // axios baseURL already ends in /api, so strip a leading /api from the path to avoid /api/api/...
  const toApiRelative = (fullUrl) => {
    try {
      const u = new URL(fullUrl, window.location.origin);
      return u.pathname.replace(/^\/api(?=\/)/, '') + u.search;
    } catch {
      return fullUrl;
    }
  };

  const handleNextPage = () => {
    if (nextPage) fetchExpenses(toApiRelative(nextPage));
  };

  const handlePrevPage = () => {
    if (prevPage) fetchExpenses(toApiRelative(prevPage));
  };

  const thisMonth = monthly.find((m) => m.key === currentMonthKey());
  const allTime = monthly.reduce((sum, m) => sum + Number(m.total), 0);
  const topCategory = byCategory[0];
  const slices = byCategory.map((c) => ({ id: c.id, label: c.category, total: c.total }));
  const monthLabel = monthly.find((m) => m.key === monthFilter)?.month || monthFilter;
  const categoryLabel = byCategory.find((c) => c.id === categoryFilter)?.category;
  const categoryOptions = byCategory.filter((c) => c.id != null).map((c) => ({ value: String(c.id), label: c.category }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const chips = activeFilterChips(filters, setFilters, { groupLabel: categoryLabel, monthLabel });
  const isFiltered = chips.length > 0;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-clay text-xl">
        <p>Error: {error}</p>
        <button onClick={() => fetchExpenses()} className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded hover:bg-brand-forest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-text-strong">Your Expenses</h1>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-6 py-3 bg-emerald text-white rounded-lg shadow-md hover:bg-forest transition duration-300 w-full sm:w-auto"
          >
            + Add New Expense
          </button>
        </div>

        <ListToolbar
          filters={filters}
          setFilters={setFilters}
          groupOptions={categoryOptions}
          groupLabel="Category"
          showSavings
          searchPlaceholder="Search description or savings note…"
        />

        <SummaryCards cards={[
          { label: 'Total Spent (All Time)', value: fmt(allTime), tone: 'text-clay' },
          { label: 'This Month', value: fmt(thisMonth?.total), tone: 'text-clay' },
          {
            label: 'Top Category',
            value: topCategory ? topCategory.category : 'N/A',
            sub: topCategory ? fmt(topCategory.total) : null,
          },
        ]} />

        <FilterCharts
          monthly={monthly}
          slices={slices}
          barColor="#ef4444"
          barTitle="Monthly Spending"
          sliceTitle="By Category"
          selectedMonth={monthFilter}
          selectedSlice={categoryFilter}
          onSelectMonth={setMonthFilter}
          onSelectSlice={setCategoryFilter}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            chips={chips}
            onClearAll={() => setFilters((prev) => ({ ...EMPTY_FILTERS, ordering: prev.ordering }))}
          />
          <p className="text-sm text-text-muted ml-auto">
            {totalCount} expense{totalCount !== 1 ? 's' : ''}{isFiltered ? ' matching' : ' total'}
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-text-muted">Loading expenses…</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <p className="text-lg">No expenses found.</p>
            <p className="text-sm mt-2">
              {isFiltered ? 'Try clearing a filter.' : 'Click "Add New Expense" to get started!'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-surface rounded-lg shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-bg border-b border-border-soft">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main">Date</th>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main">Description</th>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main">Category</th>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main">Amount</th>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main">Personal</th>
                    <th className="px-6 py-3 text-sm font-semibold text-text-main text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-surface-2 transition duration-150">
                      <td className="px-6 py-4 text-sm text-text-strong">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4 text-sm text-text-strong">
                        {expense.description || <span className="text-text-dim italic">No description</span>}
                        <SavingsTag expense={expense} />
                      </td>
                      <td className="px-6 py-4 text-sm text-text-strong">
                        {expense.splits?.length ? (
                          <span className="text-xs text-text-muted">
                            Split: {expense.splits.map((p) => p.category?.name || 'Uncategorized').join(' + ')}
                          </span>
                        ) : expense.category ? (
                          <span className="inline-block bg-brand-warm text-brand-forest text-xs px-2 py-1 rounded-full">
                            {expense.category.name}
                          </span>
                        ) : (
                          <span className="text-text-dim italic">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-clay">
                        - {parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-strong">
                        {expense.is_personal ? (
                          <span className="text-emerald font-medium">Yes</span>
                        ) : (
                          <span className="text-text-dim">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="px-3 py-1 mr-2 bg-surface-2 text-text-main border border-border-soft text-sm rounded hover:border-border-mid transition duration-200"
                          title="Change category, description or savings"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-3 py-1 bg-clay text-white text-sm rounded hover:opacity-90 transition duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-surface rounded-lg shadow-md p-4 border border-border-soft">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-semibold text-clay">
                        - {parseFloat(expense.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-text-strong">
                        {expense.description || <span className="text-text-dim italic">No description</span>}
                      </p>
                      <SavingsTag expense={expense} />
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="px-3 py-1 bg-surface-2 text-text-main border border-border-soft text-sm rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-3 py-1 bg-clay text-white text-sm rounded hover:opacity-90 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-text-muted">
                    <span>{formatDate(expense.date)}</span>
                    {expense.category && (
                      <span className="inline-block bg-brand-warm text-brand-forest text-xs px-2 py-1 rounded-full">
                        {expense.category.name}
                      </span>
                    )}
                    {expense.is_personal && (
                      <span className="inline-block bg-accent-soft text-emerald text-xs px-2 py-1 rounded-full">
                        Personal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePrevPage}
                disabled={!prevPage}
                className={`px-4 py-2 min-h-[44px] rounded text-sm font-medium transition duration-200 ${
                  prevPage
                    ? 'bg-brand-emerald text-white hover:bg-brand-forest'
                    : 'bg-surface-2 text-text-dim cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!nextPage}
                className={`px-4 py-2 min-h-[44px] rounded text-sm font-medium transition duration-200 ${
                  nextPage
                    ? 'bg-brand-emerald text-white hover:bg-brand-forest'
                    : 'bg-surface-2 text-text-dim cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      {editingExpense && (
        <Modal title="Edit expense" onClose={() => setEditingExpense(null)}>
          <EditExpenseForm
            expense={editingExpense}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingExpense(null)}
          />
        </Modal>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowAddExpenseModal(false)}>
          <AddTransactionForm
            onSuccess={handleAddExpenseSuccess}
            onCancel={() => setShowAddExpenseModal(false)}
          />
        </Modal>
      )}
    </>
  );
}

function SavingsTag({ expense }) {
  const loan = expense.is_loan && (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span className="inline-block bg-[rgba(196,122,90,0.14)] text-clay text-[11px] font-semibold px-2 py-0.5 rounded-full">
        {expense.loan_written_off ? 'Loan written off' : 'Loan'} · {expense.loan_person}
      </span>
      {!expense.loan_written_off && (
        <span className="text-[12px] text-text-muted">
          {Number(expense.loan_outstanding) > 0 ? `${Number(expense.loan_outstanding).toFixed(2)} still owed` : 'fully repaid'}
        </span>
      )}
    </div>
  );
  const split = expense.splits?.length > 0 && (
    <ul className="mt-1 text-[12px] text-text-muted space-y-0.5">
      {expense.splits.map((p) => (
        <li key={p.id}>
          {Number(p.amount).toFixed(2)} · {p.category?.name || 'Uncategorized'}{p.note ? ` · ${p.note}` : ''}
        </li>
      ))}
    </ul>
  );
  if (!expense.is_savings) return (loan || split) ? <>{loan}{split}</> : null;
  return (
    <>
    {loan}{split}
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span className="inline-block bg-accent-soft text-accent-deep text-[11px] font-semibold px-2 py-0.5 rounded-full">
        Savings
      </span>
      {expense.savings_note && (
        <span className="text-[12px] text-text-muted italic">{expense.savings_note}</span>
      )}
    </div>
    </>
  );
}
