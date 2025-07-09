import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TransferForm({ onSuccess, onCancel, initialAccountId = null }) {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    from_account: initialAccountId || '', // Pre-fill if coming from a specific account's page
    to_account: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [loadingSubmission, setLoadingSubmission] = useState(false); // To prevent double submission

  // Fetch accounts for dropdowns
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await axios.get('/accounts/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setAccounts(response.data.results);
      } catch (err) {
        console.error('Failed to fetch accounts for transfer:', err);
        setError('Failed to load accounts. Please try again.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (auth?.access) {
      fetchAccounts();
    }
  }, [auth]);

  // Get the selected source account's balance
  const getSourceAccountBalance = () => {
    if (!formData.from_account) return 0;
    const sourceAccount = accounts.find(acc => acc.id.toString() === formData.from_account.toString());
    return sourceAccount ? parseFloat(sourceAccount.balance) : 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmission(true);

    // Frontend validation
    if (!formData.from_account || !formData.to_account || !formData.amount) {
      setError('Please fill in all required fields.');
      setLoadingSubmission(false);
      return;
    }
    if (formData.from_account === formData.to_account) {
      setError('Source and destination accounts cannot be the same.');
      setLoadingSubmission(false);
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError('Transfer amount must be positive.');
      setLoadingSubmission(false);
      return;
    }

    // Check if transfer amount exceeds source account balance
    const sourceBalance = getSourceAccountBalance();
    const transferAmount = parseFloat(formData.amount);
    if (transferAmount > sourceBalance) {
      setError(`Transfer amount (${transferAmount.toFixed(2)}) exceeds available balance (${sourceBalance.toFixed(2)}).`);
      setLoadingSubmission(false);
      return;
    }

    try {
      // Send data to the backend transfer endpoint
      await axios.post('/accounts/transfers/', {
        from_account: formData.from_account,
        to_account: formData.to_account,
        amount: parseFloat(formData.amount), // Ensure amount is a number
        note: formData.note,
        date: formData.date,
      }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      onSuccess(); // Call onSuccess callback from parent (AccountsPage or Home)
    } catch (err) {
      console.error('Failed to perform transfer:', err.response?.data || err.message);
      let errorMessage = 'Failed to perform transfer. Please check your input.';
      if (err.response && err.response.data) {
        // Parse specific errors from Django backend
        for (const key in err.response.data) {
          errorMessage += ` ${key}: ${err.response.data[key][0]}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoadingSubmission(false);
    }
  };

  if (loadingAccounts) {
    return (
      <div className="text-center py-4">
        Loading Accounts...
      </div>
    );
  }

  if (!accounts.length && !loadingAccounts) {
    return (
      <div className="text-center py-4 text-red-500">
        No accounts found. Please add accounts to perform transfers.
        <div className="flex justify-center mt-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                Close
            </button>
        </div>
      </div>
    );
  }

  const sourceBalance = getSourceAccountBalance();
  const transferAmount = parseFloat(formData.amount) || 0;
  const isAmountExceeded = transferAmount > sourceBalance && formData.amount !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-500">{error}</p>}

      {/* From Account */}
      <label htmlFor="from_account" className="block text-sm font-medium text-gray-700">From Account:</label>
      <select
        id="from_account"
        name="from_account"
        value={formData.from_account}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
        disabled={!!initialAccountId} // Disable if pre-filled by parent (e.g., from AccountsPage)
      >
        <option value="">Select Source Account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} – {parseFloat(acc.balance).toFixed(2)} {acc.currency}
          </option>
        ))}
      </select>

      {/* To Account */}
      <label htmlFor="to_account" className="block text-sm font-medium text-gray-700">To Account:</label>
      <select
        id="to_account"
        name="to_account"
        value={formData.to_account}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Destination Account</option>
        {accounts
          .filter(acc => acc.id.toString() !== formData.from_account.toString())
          .map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} – {parseFloat(acc.balance).toFixed(2)} {acc.currency}
            </option>
        ))}
      </select>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount:</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount to Transfer"
          className={`w-full p-2 border rounded ${isAmountExceeded ? 'border-red-500 text-red-600' : ''}`}
          required
          min="0.01"
          max={sourceBalance}
          step="0.01"
        />
        {formData.from_account && (
          <p className={`text-sm mt-1 ${isAmountExceeded ? 'text-red-600' : 'text-gray-600'}`}>
            Available balance: {sourceBalance.toFixed(2)} {accounts.find(acc => acc.id.toString() === formData.from_account.toString())?.currency}
            {isAmountExceeded && (
              <span className="block text-red-500 font-medium">
                ⚠️ Amount exceeds available balance by {(transferAmount - sourceBalance).toFixed(2)}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Note (optional) */}
      <input
        type="text"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Note (optional)"
        className="w-full p-2 border rounded"
      />

      {/* Date */}
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded ${
            isAmountExceeded || loadingAccounts || loadingSubmission
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          disabled={isAmountExceeded || loadingAccounts || loadingSubmission}
        >
          {loadingSubmission ? 'Transferring...' : 'Transfer Funds'}
        </button>
      </div>
    </form>
  );
}