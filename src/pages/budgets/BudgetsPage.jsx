import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

export default function BudgetsPage() {
  const { auth, logout } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ category: '', amount: '', period: 'monthly' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [editForm, setEditForm] = useState({ category: '', amount: '', period: 'monthly' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBudget, setDeleteBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [budgetsRes, summaryRes, categoriesRes] = await Promise.all([
        axios.get('/budgets/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        }),
        axios.get('/budgets/summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        }),
        axios.get('/categories/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        }),
      ]);
      setBudgets(budgetsRes.data.results || budgetsRes.data);
      setSummary(summaryRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to load budgets. Please try again.');
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [auth, logout]);

  useEffect(() => {
    if (auth?.access) {
      fetchBudgets();
    }
  }, [auth, fetchBudgets]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      await axios.post('/budgets/', {
        category: addForm.category,
        amount: addForm.amount,
        period: addForm.period,
      }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setAddForm({ category: '', amount: '', period: 'monthly' });
      setShowAddModal(false);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to add budget:', err);
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const messages = Object.values(detail).flat().join(' ');
        setAddError(messages || 'Failed to add budget.');
      } else {
        setAddError('Failed to add budget. Please try again.');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (budget) => {
    setEditBudget(budget);
    setEditForm({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await axios.put(`/budgets/${editBudget.id}/`, {
        category: editForm.category,
        amount: editForm.amount,
        period: editForm.period,
      }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setShowEditModal(false);
      setEditBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to update budget:', err);
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const messages = Object.values(detail).flat().join(' ');
        setEditError(messages || 'Failed to update budget.');
      } else {
        setEditError('Failed to update budget. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (budget) => {
    setDeleteBudget(budget);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await axios.delete(`/budgets/${deleteBudget.id}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setShowDeleteModal(false);
      setDeleteBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
      setDeleteError('Failed to delete budget. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 60) return 'bg-emerald';
    if (percentage < 80) return 'bg-accent-deep';
    return 'bg-clay';
  };

  const getProgressBgColor = (percentage) => {
    if (percentage < 60) return 'bg-accent-soft';
    if (percentage < 80) return 'bg-accent-soft';
    return 'bg-[rgba(196,122,90,0.12)]';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Budgets...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-clay text-xl">
        <p>Error: {error}</p>
        <button onClick={fetchBudgets} className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded hover:bg-brand-forest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-text-strong">Your Budgets</h1>
          <button
            onClick={() => { setAddForm({ category: '', amount: '', period: 'monthly' }); setAddError(''); setShowAddModal(true); }}
            className="px-6 py-3 bg-emerald text-white rounded-lg shadow-md hover:bg-forest transition duration-300 w-full sm:w-auto"
          >
            + Add Budget
          </button>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg shadow-md p-5 border border-border-soft">
              <p className="text-sm text-text-muted">Total Budget</p>
              <p className="text-2xl font-bold text-brand-forest">{Number(summary.total_budget).toFixed(2)}</p>
            </div>
            <div className="bg-surface rounded-lg shadow-md p-5 border border-border-soft">
              <p className="text-sm text-text-muted">Total Spent</p>
              <p className="text-2xl font-bold text-text-strong">{Number(summary.total_spent).toFixed(2)}</p>
            </div>
            <div className="bg-surface rounded-lg shadow-md p-5 border border-border-soft">
              <p className="text-sm text-text-muted">Over Budget Alerts</p>
              <p className={`text-2xl font-bold ${summary.alerts_count > 0 ? 'text-clay' : 'text-emerald'}`}>
                {summary.alerts_count} {summary.alerts_count === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
        )}

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <p className="text-lg">No budgets found.</p>
            <p className="text-sm mt-2">Click "Add Budget" to create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="bg-surface rounded-lg shadow-md p-5 border border-border-soft hover:shadow-lg transition duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-lg font-semibold text-text-strong">{budget.category_name}</p>
                    <p className="text-xs text-text-dim capitalize">{budget.period}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(budget)}
                      className="px-3 py-1 min-h-[40px] text-sm bg-brand-warm text-brand-forest rounded hover:bg-brand-warm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDelete(budget)}
                      className="px-3 py-1 min-h-[40px] text-sm bg-[rgba(196,122,90,0.12)] text-clay rounded hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`w-full rounded-full h-3 ${getProgressBgColor(budget.percentage)} mb-2`}>
                  <div
                    className={`h-3 rounded-full ${getProgressColor(budget.percentage)} transition-all duration-300`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-text-main truncate mr-2">
                    Spent: {Number(budget.spent).toFixed(2)}
                  </span>
                  <span className="text-text-main truncate">
                    Budget: {Number(budget.amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-right mt-1">
                  <span className={`text-sm font-semibold ${budget.percentage >= 80 ? 'text-clay' : budget.percentage >= 60 ? 'text-accent-deep' : 'text-emerald'}`}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Budget Modal */}
      {showAddModal && (
        <Modal title="Add New Budget" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {addError && (
              <p className="text-sm text-clay bg-[rgba(196,122,90,0.12)] p-2 rounded">{addError}</p>
            )}
            <div>
              <label htmlFor="add-category" className="block text-sm font-medium text-text-strong mb-1">Category</label>
              <select
                id="add-category"
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-amount" className="block text-sm font-medium text-text-strong mb-1">Budget Amount</label>
              <input
                id="add-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                required
                placeholder="e.g. 500.00"
                className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="add-period" className="block text-sm font-medium text-text-strong mb-1">Period</label>
              <select
                id="add-period"
                value={addForm.period}
                onChange={(e) => setAddForm({ ...addForm, period: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-border-soft rounded-lg text-text-main hover:bg-surface-2 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-brand-emerald text-white rounded-lg hover:bg-brand-forest transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {addLoading ? 'Adding...' : 'Add Budget'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && editBudget && (
        <Modal title="Edit Budget" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {editError && (
              <p className="text-sm text-clay bg-[rgba(196,122,90,0.12)] p-2 rounded">{editError}</p>
            )}
            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-text-strong mb-1">Category</label>
              <select
                id="edit-category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                required
                className="w-full px-4 py-2 min-h-[40px] border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-amount" className="block text-sm font-medium text-text-strong mb-1">Budget Amount</label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                required
                placeholder="e.g. 500.00"
                className="w-full px-4 py-2 min-h-[40px] border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="edit-period" className="block text-sm font-medium text-text-strong mb-1">Period</label>
              <select
                id="edit-period"
                value={editForm.period}
                onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                required
                className="w-full px-4 py-2 min-h-[40px] border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-border-soft rounded-lg text-text-main hover:bg-surface-2 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-brand-emerald text-white rounded-lg hover:bg-brand-forest transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteBudget && (
        <Modal title="Delete Budget" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            {deleteError && (
              <p className="text-sm text-clay bg-[rgba(196,122,90,0.12)] p-2 rounded">{deleteError}</p>
            )}
            <p className="text-text-strong">
              Are you sure you want to delete the budget for <span className="font-semibold">"{deleteBudget.category_name}"</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 min-h-[40px] text-sm border border-border-soft rounded-lg text-text-main hover:bg-surface-2 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 min-h-[40px] text-sm bg-clay text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
