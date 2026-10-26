import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

export default function HouseholdBudgets() {
  const { auth } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', period: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const headers = { Authorization: `Bearer ${auth?.access}` };
  const isViewer = auth?.user?.role === 'viewer';

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        axios.get('/budgets/household/', { headers }),
        axios.get('/budgets/household/summary/', { headers }),
      ]);
      setBudgets(budgetsRes.data.results || budgetsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch household budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories/', { headers });
      setCategories(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.post('/budgets/household/', formData, { headers });
      setFormData({ category: '', amount: '', period: 'monthly' });
      setShowAddModal(false);
      setMessage({ type: 'success', text: 'Household budget created.' });
      fetchBudgets();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to create budget.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this household budget?')) return;
    try {
      await axios.delete(`/budgets/household/${id}/`, { headers });
      setMessage({ type: 'success', text: 'Budget deleted.' });
      fetchBudgets();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete budget.' });
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-strong mb-4">Household Budgets</h3>
        <p className="text-text-dim text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-text-strong">Household Budgets</h3>
        {!isViewer && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 min-h-[40px] bg-brand-emerald text-white text-sm rounded hover:bg-brand-forest transition w-full sm:w-auto"
          >
            Add Budget
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-3 rounded text-sm mb-4 ${
          message.type === 'success'
            ? 'bg-accent-soft text-emerald border border-green-300'
            : 'bg-[rgba(196,122,90,0.12)] text-clay border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      {summary && budgets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-brand-cream rounded-lg p-3">
            <p className="text-xs text-brand-emerald font-medium">Total Budget</p>
            <p className="text-lg font-bold text-brand-forest">
              {summary.total_budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-[rgba(196,122,90,0.12)] rounded-lg p-3">
            <p className="text-xs text-clay font-medium">Total Spent</p>
            <p className="text-lg font-bold text-clay">
              {summary.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-accent-soft rounded-lg p-3">
            <p className="text-xs text-emerald font-medium">Remaining</p>
            <p className="text-lg font-bold text-emerald">
              {summary.total_remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-accent-soft rounded-lg p-3">
            <p className="text-xs text-accent-deep font-medium">Alerts</p>
            <p className="text-lg font-bold text-accent-deep">{summary.alerts_count}</p>
          </div>
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          No household budgets yet. {!isViewer && 'Click "Add Budget" to create one.'}
        </p>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const pctColor = budget.percentage >= 100
              ? 'bg-red-500'
              : budget.percentage >= 80
              ? 'bg-yellow-500'
              : 'bg-green-500';

            return (
              <div key={budget.id} className="border border-border-soft rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-text-strong">{budget.category_name}</p>
                    <p className="text-xs text-text-muted">{budget.period} budget by {budget.created_by_username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-strong">
                      {budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {Number(budget.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium ${
                      budget.percentage >= 100 ? 'text-clay' : budget.percentage >= 80 ? 'text-accent-deep' : 'text-emerald'
                    }`}>
                      {budget.percentage}% used — {budget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} left
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-2 rounded-full h-2.5 mb-3">
                  <div
                    className={`h-2.5 rounded-full ${pctColor} transition-all duration-300`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>

                {/* Per member breakdown */}
                {budget.per_member?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {budget.per_member
                      .filter(m => m.spent > 0)
                      .map((m) => (
                        <span key={m.user_id} className="text-xs bg-surface-2 text-text-main px-2 py-1 rounded-full">
                          {m.username}: {m.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ))
                    }
                  </div>
                )}

                {/* Delete button */}
                {!isViewer && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-xs text-clay hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <Modal title="Add Household Budget" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-border-soft rounded focus:ring-2 focus:ring-brand-emerald focus:outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Budget Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-border-soft rounded focus:ring-2 focus:ring-brand-emerald focus:outline-none"
                placeholder="e.g. 3000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-border-soft rounded focus:ring-2 focus:ring-brand-emerald focus:outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 min-h-[44px] border border-border-soft rounded text-text-strong hover:bg-surface-2 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 min-h-[44px] bg-brand-emerald text-white rounded hover:bg-brand-forest transition disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Budget'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
