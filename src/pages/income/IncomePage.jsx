import { useState, useEffect, useMemo } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import CreatableSelect from 'react-select/creatable';
import FilterCharts, { FilterChips, monthRange } from '../../components/charts/FilterCharts';
import ListToolbar, {
  EMPTY_FILTERS, filtersToParams, monthKeyOf, activeFilterChips,
} from '../../components/lists/ListToolbar';
import EditIncomeForm from './EditIncomeForm';

export default function IncomePage() {
  const { auth } = useAuth();

  // Summary state
  const [summary, setSummary] = useState({
    total_income: 0,
    monthly_income: 0,
    income_by_source: [],
    monthly_trend: [],
  });

  // Income list state
  const [incomes, setIncomes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Click-to-filter from the charts
  // Search/sort/filter state; the charts write into the same filters
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const filterParams = useMemo(() => filtersToParams(filters, 'source'), [filters]);
  const monthFilter = monthKeyOf(filters);
  const sourceFilter = filters.group ? Number(filters.group) : null;
  const setMonthFilter = (key) => setFilters((prev) => ({
    ...prev, ...(key ? monthRange(key) : { start_date: '', end_date: '' }),
  }));
  const setSourceFilter = (id) => setFilters((prev) => ({ ...prev, group: id ? String(id) : '' }));
  const [editingIncome, setEditingIncome] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    account: '',
    source: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [accounts, setAccounts] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSourceOption, setSelectedSourceOption] = useState(null);
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [formError, setFormError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const headers = { Authorization: `Bearer ${auth?.access}` };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get('/income/summary/', { headers });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch income summary:', err);
    }
  };

  // Fetch income list
  const fetchIncomes = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get('/income/', {
        headers,
        params: { page: p, ...filterParams },
      });
      setIncomes(res.data.results);
      setTotalCount(res.data.count ?? res.data.results.length);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch incomes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/accounts/', { headers });
      setAccounts(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  // Fetch sources
  const fetchSources = async () => {
    try {
      const res = await axios.get('/income/sources/', { headers });
      const data = res.data.results || res.data;
      setSources(data.map((s) => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error('Failed to fetch income sources:', err);
    }
  };

  useEffect(() => {
    if (auth?.access) fetchSummary();
  }, [auth]);

  useEffect(() => {
    if (auth?.access) fetchIncomes(1);
  }, [auth, filterParams]);

  // Open modal and load form data
  const openModal = () => {
    setFormData({
      account: '',
      source: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedSourceOption(null);
    setFormError('');
    fetchAccounts();
    fetchSources();
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceChange = (selectedOption) => {
    setSelectedSourceOption(selectedOption);
    setFormData((prev) => ({
      ...prev,
      source: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleCreateSource = async (inputValue) => {
    setIsCreatingSource(true);
    setFormError('');
    try {
      const res = await axios.post(
        '/income/sources/',
        { name: inputValue },
        { headers }
      );
      const newSource = res.data;
      const newOption = { value: newSource.id, label: newSource.name };
      setSources((prev) => [...prev, newOption]);
      setSelectedSourceOption(newOption);
      setFormData((prev) => ({ ...prev, source: newSource.id }));
    } catch (err) {
      console.error('Failed to create source:', err.response?.data || err.message);
      setFormError('Failed to create new source. Please try again.');
      setSelectedSourceOption(null);
      setFormData((prev) => ({ ...prev, source: '' }));
    } finally {
      setIsCreatingSource(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    setLoadingForm(true);
    try {
      const payload = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      };
      if (formData.account) payload.account = formData.account;
      if (formData.source) payload.source = formData.source;

      await axios.post('/income/', payload, { headers });
      setShowModal(false);
      fetchIncomes(1);
      fetchSummary();
    } catch (err) {
      console.error('Failed to add income:', err.response?.data || err.message);
      let errorMessage = 'Failed to add income.';
      if (err.response && err.response.data) {
        for (const key in err.response.data) {
          errorMessage += ' ' + key + ': ' + err.response.data[key];
        }
      }
      setFormError(errorMessage);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await axios.delete('/income/' + id + '/', { headers });
      fetchIncomes(page);
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete income:', err);
    }
  };

  // Find top source
  const topSource =
    summary.income_by_source && summary.income_by_source.length > 0
      ? summary.income_by_source[0]
      : null;

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: 'var(--border-mid)',
      borderRadius: '0.25rem',
      padding: '0.25rem',
      minHeight: '38px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-strong)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'var(--surface-2)' : 'var(--surface)',
      color: 'var(--text-strong)',
    }),
  };

  const chips = activeFilterChips(filters, setFilters, {
    groupLabel: (summary.income_by_source || []).find((x) => x.source__id === sourceFilter)?.source__name,
    monthLabel: (summary.monthly_trend || []).find((m) => m.key === monthFilter)?.month,
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-text-strong">Income</h1>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-emerald text-white rounded hover:bg-forest transition w-full sm:w-auto"
          >
            + Add Income
          </button>
        </div>

        <div className="mb-6">
          <ListToolbar
            filters={filters}
            setFilters={setFilters}
            groupOptions={(summary.income_by_source || [])
              .map((x) => ({ value: String(x.source__id), label: x.source__name }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            groupLabel="Source"
            searchPlaceholder="Search description or source…"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded shadow p-4">
            <p className="text-sm text-text-muted">Total Income (All Time)</p>
            <p className="text-xl font-bold text-emerald">
              {Number(summary.total_income).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-surface rounded shadow p-4">
            <p className="text-sm text-text-muted">This Month</p>
            <p className="text-xl font-bold text-emerald">
              {Number(summary.monthly_income).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-surface rounded shadow p-4">
            <p className="text-sm text-text-muted">Top Source</p>
            <p className="text-xl font-bold text-emerald">
              {topSource ? topSource.source__name : 'N/A'}
            </p>
            {topSource && (
              <p className="text-sm text-text-dim">
                {Number(topSource.total).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>

        {/* Charts */}
        <FilterCharts
          monthly={summary.monthly_trend || []}
          slices={(summary.income_by_source || []).map((x) => ({
            id: x.source__id, label: x.source__name ?? 'Unknown', total: x.total,
          }))}
          barColor="#10b981"
          barTitle="Monthly Income"
          sliceTitle="By Source"
          selectedMonth={monthFilter}
          selectedSlice={sourceFilter}
          onSelectMonth={setMonthFilter}
          onSelectSlice={setSourceFilter}
        />

        <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            chips={chips}
            onClearAll={() => setFilters((prev) => ({ ...EMPTY_FILTERS, ordering: prev.ordering }))}
          />
          <p className="text-sm text-text-muted ml-auto">
            {totalCount} entr{totalCount !== 1 ? 'ies' : 'y'}{chips.length ? ' matching' : ' total'}
          </p>
        </div>

        {/* Income List */}
        {loading ? (
          <p className="text-center text-text-muted py-8">Loading...</p>
        ) : incomes.length === 0 ? (
          <p className="text-center text-text-muted py-8">
            {chips.length
              ? 'No income matches these filters.'
              : <>No income entries yet. Click &quot;+ Add Income&quot; to get started.</>}
          </p>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="bg-surface rounded shadow p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <span className="text-xs sm:text-sm text-text-muted">{income.date}</span>
                    <span className="font-semibold text-text-strong text-sm sm:text-base truncate">
                      {income.source_name || 'Unknown Source'}
                    </span>
                  </div>
                  {income.description && (
                    <p className="text-sm text-text-muted">{income.description}</p>
                  )}
                  {income.repays_loan && (
                    <span className="inline-block mt-1 bg-[rgba(30,107,74,0.14)] text-emerald text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      Repayment of loan to {income.repays_loan.person}, not counted as income
                    </span>
                  )}
                  {income.account_name && (
                    <p className="text-xs text-text-dim mt-1">
                      Account: {income.account_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-base sm:text-lg font-bold text-emerald">
                    +{Number(income.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => setEditingIncome(income)}
                    className="text-text-main hover:text-text-strong text-sm"
                    title="Change source or description"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-clay hover:text-clay text-sm"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(hasPrev || hasNext) && (
          <div className="flex justify-center gap-3 sm:gap-4 mt-6">
            <button
              onClick={() => fetchIncomes(page - 1)}
              disabled={!hasPrev}
              className={
                'px-4 py-2 min-h-[44px] rounded ' +
                (hasPrev
                  ? 'bg-surface-2 hover:bg-surface-tint text-text-strong'
                  : 'bg-surface-2 text-text-dim cursor-not-allowed')
              }
            >
              Previous
            </button>
            <span className="px-4 py-2 min-h-[44px] flex items-center text-text-main">Page {page}</span>
            <button
              onClick={() => fetchIncomes(page + 1)}
              disabled={!hasNext}
              className={
                'px-4 py-2 min-h-[44px] rounded ' +
                (hasNext
                  ? 'bg-surface-2 hover:bg-surface-tint text-text-strong'
                  : 'bg-surface-2 text-text-dim cursor-not-allowed')
              }
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Income Modal */}
      {editingIncome && (
          <Modal title="Edit income" onClose={() => setEditingIncome(null)}>
            <EditIncomeForm
              income={editingIncome}
              onSuccess={(updated) => {
                setEditingIncome(null);
                setIncomes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                fetchSummary();
              }}
              onCancel={() => setEditingIncome(null)}
            />
          </Modal>
        )}

        {showModal && (
        <Modal title="Add Income" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && <p className="text-clay text-sm">{formError}</p>}

            <div>
              <label className="block text-sm font-medium text-text-strong mb-1">
                Source
              </label>
              <CreatableSelect
                options={sources}
                value={selectedSourceOption}
                onChange={handleSourceChange}
                onCreateOption={handleCreateSource}
                isDisabled={isCreatingSource}
                isLoading={isCreatingSource}
                placeholder="Select or type a source..."
                className="w-full text-sm"
                classNamePrefix="react-select"
                styles={selectStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-strong mb-1">
                Account (optional)
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                className="w-full p-2 border border-border-soft rounded"
              >
                <option value="">No Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} - {acc.balance} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-strong mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="w-full p-2 border border-border-soft rounded"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-strong mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-2 border border-border-soft rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-strong mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-border-soft rounded"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-surface-2 text-text-strong border border-border-soft rounded hover:bg-surface-tint w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingForm || isCreatingSource}
                className="px-4 py-2 bg-emerald text-white rounded hover:bg-forest disabled:opacity-50 w-full sm:w-auto"
              >
                {loadingForm ? 'Adding...' : 'Add Income'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
