import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

export default function SplitExpensesPage() {
  const { auth } = useAuth();
  const [splits, setSplits] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasHousehold, setHasHousehold] = useState(true);

  // Create form state
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customShares, setCustomShares] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const headers = { Authorization: `Bearer ${auth?.access}` };

  const fetchSplits = useCallback(async () => {
    try {
      const res = await axios.get('/splits/', { headers });
      setSplits(res.data);
    } catch (err) {
      console.error('Failed to fetch splits:', err);
      setError('Failed to load splits.');
    }
  }, [auth]);

  const fetchBalances = useCallback(async () => {
    try {
      const res = await axios.get('/splits/balances/', { headers });
      if (res.data.detail && res.data.detail.includes('not part of a household')) {
        setHasHousehold(false);
        setBalances([]);
      } else {
        setBalances(Array.isArray(res.data) ? res.data : []);
        setHasHousehold(true);
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setHasHousehold(false);
      }
    }
  }, [auth]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchSplits(), fetchBalances()]);
    setLoading(false);
  }, [fetchSplits, fetchBalances]);

  useEffect(() => {
    if (auth?.access) {
      fetchData();
    }
  }, [auth, fetchData]);

  const openCreateModal = async () => {
    setCreateError('');
    setSelectedExpense('');
    setSplitType('equal');
    setCustomShares([]);
    try {
      const [expRes, memRes] = await Promise.all([
        axios.get('/expenses/', { headers }),
        axios.get('/users/households/members/', { headers }),
      ]);
      const expenseList = expRes.data.results || expRes.data;
      setExpenses(Array.isArray(expenseList) ? expenseList : []);
      const memberList = memRes.data.results || memRes.data;
      setMembers(Array.isArray(memberList) ? memberList : []);
      setShowCreateModal(true);
    } catch (err) {
      console.error('Failed to load form data:', err);
      setError('Failed to load expenses or household members.');
    }
  };

  const handleExpenseChange = (expenseId) => {
    setSelectedExpense(expenseId);
    if (!expenseId) return;
    const expense = expenses.find((e) => e.id === parseInt(expenseId));
    if (!expense || members.length === 0) return;

    if (splitType === 'equal') {
      computeEqualShares(expense, members);
    } else {
      setCustomShares(members.map((m) => ({ user_id: m.id, username: m.username, amount: '' })));
    }
  };

  const computeEqualShares = (expense, memberList) => {
    if (!expense || memberList.length === 0) return;
    const perPerson = (parseFloat(expense.amount) / memberList.length).toFixed(2);
    const shares = memberList.map((m, idx) => {
      let amt = parseFloat(perPerson);
      // Give remainder to last person
      if (idx === memberList.length - 1) {
        const othersTotal = parseFloat(perPerson) * (memberList.length - 1);
        amt = parseFloat((parseFloat(expense.amount) - othersTotal).toFixed(2));
      }
      return { user_id: m.id, username: m.username, amount: amt };
    });
    setCustomShares(shares);
  };

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    if (!selectedExpense) return;
    const expense = expenses.find((e) => e.id === parseInt(selectedExpense));
    if (!expense) return;

    if (type === 'equal') {
      computeEqualShares(expense, members);
    } else {
      setCustomShares(members.map((m) => ({ user_id: m.id, username: m.username, amount: '' })));
    }
  };

  const handleShareAmountChange = (index, value) => {
    const updated = [...customShares];
    updated[index] = { ...updated[index], amount: value };
    setCustomShares(updated);
  };

  const handleCreateSplit = async () => {
    if (!selectedExpense) {
      setCreateError('Please select an expense.');
      return;
    }
    const shares = customShares
      .filter((s) => s.amount !== '' && parseFloat(s.amount) > 0)
      .map((s) => ({ user_id: s.user_id, amount: parseFloat(s.amount) }));

    if (shares.length === 0) {
      setCreateError('Please assign amounts to at least one member.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    try {
      await axios.post(
        '/splits/',
        {
          expense_id: parseInt(selectedExpense),
          split_type: splitType,
          shares: shares,
        },
        { headers }
      );
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create split:', err);
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const messages = Object.values(errData).flat();
        setCreateError(messages.join(' '));
      } else {
        setCreateError('Failed to create split. Please try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleMarkPaid = async (shareId) => {
    try {
      await axios.post(`/splits/shares/${shareId}/pay/`, {}, { headers });
      fetchData();
    } catch (err) {
      console.error('Failed to mark share as paid:', err);
      alert('Failed to mark as paid.');
    }
  };

  const handleDeleteSplit = async (splitId) => {
    if (!window.confirm('Are you sure you want to delete this split?')) return;
    try {
      await axios.delete(`/splits/${splitId}/`, { headers });
      fetchData();
    } catch (err) {
      console.error('Failed to delete split:', err);
      alert(err.response?.data?.detail || 'Failed to delete split.');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const currentUsername = auth?.user?.username;

  // Separate balances into what user owes and what is owed to user
  const youOwe = balances.filter(
    (b) => b.from_username === currentUsername
  );
  const owedToYou = balances.filter(
    (b) => b.to_username === currentUsername
  );

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Split Expenses</h1>
          {hasHousehold && (
            <button
              onClick={openCreateModal}
              className="bg-brand-emerald text-white px-4 py-2 min-h-[44px] rounded hover:bg-brand-forest transition text-sm w-full sm:w-auto"
            >
              + New Split
            </button>
          )}
        </div>

        {/* No household message */}
        {!hasHousehold && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
            <p className="text-yellow-700 text-lg font-medium">
              Join a household to split expenses
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              Go to the Household page to create or join one.
            </p>
          </div>
        )}

        {/* Balance Summary */}
        {hasHousehold && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Balance Summary</h2>
            {balances.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-medium">All settled up!</p>
                <p className="text-green-600 text-sm">No outstanding balances in your household.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {youOwe.map((b, idx) => (
                  <div
                    key={'owe-' + idx}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-sm">
                      {getInitial(b.to_username)}
                    </div>
                    <div>
                      <p className="text-red-700 font-medium">
                        You owe {b.to_username}
                      </p>
                      <p className="text-red-600 text-lg font-bold">{b.amount} AED</p>
                    </div>
                  </div>
                ))}
                {owedToYou.map((b, idx) => (
                  <div
                    key={'owed-' + idx}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                      {getInitial(b.from_username)}
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">
                        {b.from_username} owes you
                      </p>
                      <p className="text-green-600 text-lg font-bold">{b.amount} AED</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading splits...</p>
          </div>
        )}

        {/* Split List */}
        {!loading && hasHousehold && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Splits</h2>
            {splits.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">No splits yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {splits.map((split) => (
                  <div
                    key={split.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {split.expense_description || 'Expense #' + split.expense}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-gray-500">
                          <span>{split.expense_date}</span>
                          {split.expense_category && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {split.expense_category}
                            </span>
                          )}
                          <span
                            className={
                              'px-2 py-0.5 rounded text-xs font-medium ' +
                              (split.split_type === 'equal'
                                ? 'bg-brand-warm text-brand-forest'
                                : 'bg-purple-100 text-purple-700')
                            }
                          >
                            {split.split_type === 'equal' ? 'Equal' : 'Custom'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {split.expense_amount} AED
                        </p>
                        <p className="text-xs text-gray-400">
                          by {split.created_by_username}
                        </p>
                      </div>
                    </div>

                    {/* Shares */}
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      {split.shares.map((share) => (
                        <div
                          key={share.id}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' +
                                (share.is_paid
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700')
                              }
                            >
                              {getInitial(share.username)}
                            </div>
                            <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">{share.username}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-sm font-medium text-gray-800">
                              {share.amount} AED
                            </span>
                            {share.is_paid ? (
                              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 min-h-[36px] flex items-center rounded font-medium">
                                Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkPaid(share.id)}
                                className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 min-h-[36px] rounded font-medium transition"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delete button for creator */}
                    {split.created_by_username === currentUsername && (
                      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-end">
                        <button
                          onClick={() => handleDeleteSplit(split.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition"
                        >
                          Delete Split
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Split Modal */}
        {showCreateModal && (
          <Modal title="Create Split" onClose={() => setShowCreateModal(false)}>
            <div className="space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm">
                  {createError}
                </div>
              )}

              {/* Expense selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Expense
                </label>
                <select
                  value={selectedExpense}
                  onChange={(e) => handleExpenseChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="">-- Choose an expense --</option>
                  {expenses.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.description || 'Expense #' + exp.id} - {exp.amount} AED ({exp.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Split type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Split Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 min-h-[44px] rounded border border-gray-200 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="splitType"
                      value="equal"
                      checked={splitType === 'equal'}
                      onChange={() => handleSplitTypeChange('equal')}
                      className="w-4 h-4"
                    />
                    Equal
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 min-h-[44px] rounded border border-gray-200 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="splitType"
                      value="custom"
                      checked={splitType === 'custom'}
                      onChange={() => handleSplitTypeChange('custom')}
                      className="w-4 h-4"
                    />
                    Custom
                  </label>
                </div>
              </div>

              {/* Share assignments */}
              {selectedExpense && customShares.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Amounts
                  </label>
                  <div className="space-y-2">
                    {customShares.map((share, idx) => (
                      <div key={share.user_id} className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-warm flex items-center justify-center text-brand-forest font-bold text-xs flex-shrink-0">
                          {getInitial(share.username)}
                        </div>
                        <span className="text-sm text-gray-700 w-20 sm:w-24 truncate">
                          {share.username}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={share.amount}
                          onChange={(e) => handleShareAmountChange(idx, e.target.value)}
                          disabled={splitType === 'equal'}
                          className={
                            'flex-1 min-w-[80px] border border-gray-300 rounded px-3 py-2 min-h-[40px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald' +
                            (splitType === 'equal' ? ' bg-gray-50' : '')
                          }
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-500">AED</span>
                      </div>
                    ))}
                  </div>
                  {splitType === 'custom' && selectedExpense && (
                    <p className="text-xs text-gray-500 mt-2">
                      Total:{' '}
                      {customShares
                        .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
                        .toFixed(2)}{' '}
                      / {expenses.find((e) => e.id === parseInt(selectedExpense))?.amount || '0'} AED
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 min-h-[44px] text-sm border border-gray-300 rounded hover:bg-gray-50 transition w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSplit}
                  disabled={createLoading}
                  className="px-4 py-2 min-h-[44px] text-sm bg-brand-emerald text-white rounded hover:bg-brand-forest transition disabled:opacity-50 w-full sm:w-auto"
                >
                  {createLoading ? 'Creating...' : 'Create Split'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
