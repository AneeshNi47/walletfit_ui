import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import AddTransactionForm from './AddTransactionForm';
import ExpenseCharts from './ExpenseCharts';
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

  const fetchExpenses = useCallback(async (url = '/expenses/') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setExpenses(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setTotalCount(response.data.count);
      setCurrentUrl(url);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (auth?.access) {
      fetchExpenses();
    }
  }, [auth, fetchExpenses]);

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`/expenses/${expenseId}/delete/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      fetchExpenses(currentUrl);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleAddExpenseSuccess = () => {
    setShowAddExpenseModal(false);
    fetchExpenses(currentUrl);
  };

  const handleNextPage = () => {
    if (nextPage) {
      // Extract relative URL from full URL if needed
      const url = nextPage.includes('http') ? new URL(nextPage).pathname + new URL(nextPage).search : nextPage;
      fetchExpenses(url);
    }
  };

  const handlePrevPage = () => {
    if (prevPage) {
      const url = prevPage.includes('http') ? new URL(prevPage).pathname + new URL(prevPage).search : prevPage;
      fetchExpenses(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Expenses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
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
          <h1 className="text-3xl font-bold text-gray-800">Your Expenses</h1>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 w-full sm:w-auto"
          >
            + Add New Expense
          </button>
        </div>

        <p className="text-sm text-gray-500">{totalCount} expense{totalCount !== 1 ? 's' : ''} total</p>

        <ExpenseCharts />

        {expenses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No expenses found.</p>
            <p className="text-sm mt-2">Click "Add New Expense" to get started!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Personal</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.category ? (
                          <span className="inline-block bg-brand-warm text-brand-forest text-xs px-2 py-1 rounded-full">
                            {expense.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        - {parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.is_personal ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
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
                <div key={expense.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-semibold text-red-600">
                        - {parseFloat(expense.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-700">
                        {expense.description || <span className="text-gray-400 italic">No description</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                    <span>{formatDate(expense.date)}</span>
                    {expense.category && (
                      <span className="inline-block bg-brand-warm text-brand-forest text-xs px-2 py-1 rounded-full">
                        {expense.category.name}
                      </span>
                    )}
                    {expense.is_personal && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
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
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

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
