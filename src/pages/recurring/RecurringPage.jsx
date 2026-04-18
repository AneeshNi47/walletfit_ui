import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const FREQUENCY_COLORS = {
  daily: 'bg-purple-100 text-purple-700',
  weekly: 'bg-brand-warm text-brand-forest',
  monthly: 'bg-indigo-100 text-indigo-700',
  yearly: 'bg-teal-100 text-teal-700',
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'income', label: 'Income' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const emptyForm = {
  name: '',
  type: 'expense',
  amount: '',
  account: '',
  category: '',
  frequency: 'monthly',
  next_due_date: '',
  description: '',
};

export default function RecurringPage() {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  const [recurring, setRecurring] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const buildFilterParams = useCallback((filter) => {
    const params = new URLSearchParams();
    if (filter === 'expenses') params.set('type', 'expense');
    if (filter === 'income') params.set('type', 'income');
    if (filter === 'active') params.set('is_active', 'true');
    if (filter === 'inactive') params.set('is_active', 'false');
    const qs = params.toString();
    return qs ? '?' + qs : '';
  }, []);

  const fetchRecurring = useCallback(async (filter) => {
    try {
      const qs = buildFilterParams(filter);
      const res = await axios.get('/recurring/' + qs, { headers });
      setRecurring(res.data.results !== undefined ? res.data.results : res.data);
    } catch (err) {
      console.error('Failed to fetch recurring transactions:', err);
      setError('Failed to load recurring transactions.');
    }
  }, [auth, buildFilterParams]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await axios.get('/recurring/upcoming/', { headers });
      setUpcoming(res.data.results !== undefined ? res.data.results : res.data);
    } catch (err) {
      console.error('Failed to fetch upcoming:', err);
    }
  }, [auth]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        axios.get('/accounts/', { headers }),
        axios.get('/categories/', { headers }),
      ]);
      setAccounts(accRes.data.results !== undefined ? accRes.data.results : accRes.data);
      setCategories(catRes.data.results !== undefined ? catRes.data.results : catRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdowns:', err);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.access) return;
    setLoading(true);
    Promise.all([fetchRecurring(activeFilter), fetchUpcoming(), fetchDropdowns()])
      .finally(() => setLoading(false));
  }, [auth]);

  useEffect(() => {
    if (!auth?.access) return;
    fetchRecurring(activeFilter);
  }, [activeFilter]);

  // --- Handlers ---

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      type: item.type || 'expense',
      amount: item.amount || '',
      account: item.account || '',
      category: item.category || '',
      frequency: item.frequency || 'monthly',
      next_due_date: item.next_due_date || '',
      description: item.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        amount: form.amount,
        account: form.account || null,
        category: form.category || null,
        frequency: form.frequency,
        next_due_date: form.next_due_date,
        description: form.description,
      };
      if (editingItem) {
        await axios.put('/recurring/' + editingItem.id + '/', payload, { headers });
      } else {
        await axios.post('/recurring/', payload, { headers });
      }
      closeModal();
      fetchRecurring(activeFilter);
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to save recurring transaction:', err);
      alert('Failed to save. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await axios.delete('/recurring/' + id + '/', { headers });
      fetchRecurring(activeFilter);
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete recurring transaction.');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.patch('/recurring/' + item.id + '/', { is_active: !item.is_active }, { headers });
      fetchRecurring(activeFilter);
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to toggle active:', err);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Recurring Transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
        <p>Error: {error}</p>
        <button
          onClick={() => { setError(''); fetchRecurring(activeFilter); fetchUpcoming(); }}
          className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded hover:bg-brand-forest"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Recurring Transactions</h1>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-brand-emerald text-white rounded-lg shadow-md hover:bg-brand-forest transition duration-300 w-full sm:w-auto"
          >
            + Add Recurring
          </button>
        </div>

        {/* Upcoming Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Upcoming This Week</h2>
          {upcoming.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              No upcoming transactions this week
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className={
                    'rounded-lg shadow-md p-4 border-l-4 ' +
                    (item.type === 'expense'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-green-50 border-green-500')
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.next_due_date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          'text-lg font-bold ' +
                          (item.type === 'expense' ? 'text-red-600' : 'text-green-600')
                        }
                      >
                        {item.type === 'expense' ? '-' : '+'}{parseFloat(item.amount).toFixed(2)}
                      </p>
                      <span
                        className={
                          'inline-block text-xs px-2 py-0.5 rounded-full mt-1 ' +
                          (item.type === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700')
                        }
                      >
                        {item.type === 'expense' ? 'Expense' : 'Income'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={
                'px-4 py-2 rounded-full text-sm font-medium transition duration-200 ' +
                (activeFilter === tab.key
                  ? 'bg-brand-emerald text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recurring List */}
        {recurring.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No recurring transactions found.</p>
            <p className="text-sm mt-2">Click &quot;+ Add Recurring&quot; to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurring.map((item) => (
              <div
                key={item.id}
                className={
                  'bg-white rounded-lg shadow-md p-5 border border-gray-100 ' +
                  (!item.is_active ? 'opacity-60' : '')
                }
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <p
                    className={
                      'text-xl font-bold ' +
                      (item.type === 'expense' ? 'text-red-600' : 'text-green-600')
                    }
                  >
                    {item.type === 'expense' ? '-' : '+'}{parseFloat(item.amount).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={
                      'inline-block text-xs px-2 py-1 rounded-full ' +
                      (item.type === 'expense'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700')
                    }
                  >
                    {item.type === 'expense' ? 'Expense' : 'Income'}
                  </span>
                  <span
                    className={
                      'inline-block text-xs px-2 py-1 rounded-full ' +
                      (FREQUENCY_COLORS[item.frequency] || 'bg-gray-100 text-gray-700')
                    }
                  >
                    {FREQUENCY_LABELS[item.frequency] || item.frequency}
                  </span>
                  {item.category_name && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      {item.category_name}
                    </span>
                  )}
                  {item.account_name && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {item.account_name}
                    </span>
                  )}
                  <span
                    className={
                      'inline-block text-xs px-2 py-1 rounded-full ' +
                      (item.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-500')
                    }
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <p className="text-sm text-gray-500">
                    Next due: <span className="font-medium text-gray-700">{item.next_due_date}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={
                        'px-3 py-2 min-h-[44px] text-xs rounded transition duration-200 ' +
                        (item.is_active
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600')
                      }
                    >
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-2 min-h-[44px] text-xs bg-brand-emerald text-white rounded hover:bg-brand-emerald transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 min-h-[44px] text-xs bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editingItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                placeholder="e.g. Netflix Subscription"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  name="account"
                  value={form.account}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="">-- None --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="">-- None --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                <input
                  type="date"
                  name="next_due_date"
                  value={form.next_due_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 min-h-[44px] text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 min-h-[44px] text-sm bg-brand-emerald text-white rounded hover:bg-brand-forest disabled:opacity-50 transition duration-200 w-full sm:w-auto"
              >
                {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
