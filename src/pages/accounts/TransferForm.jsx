import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass } from '../../components/ui/formStyles';

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
        setAccounts(response.data.results ?? response.data);
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
      <div className="text-center py-4 text-text-muted">
        Loading Accounts...
      </div>
    );
  }

  if (!accounts.length && !loadingAccounts) {
    return (
      <div className="text-center py-4 text-clay">
        No accounts found. Please add accounts to perform transfers.
        <div className="flex justify-center mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  const sourceBalance = getSourceAccountBalance();
  const transferAmount = parseFloat(formData.amount) || 0;
  const isAmountExceeded = transferAmount > sourceBalance && formData.amount !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-clay text-sm">{error}</p>}

      {/* From Account */}
      <label htmlFor="from_account" className={labelClass}>From Account:</label>
      <select
        id="from_account"
        name="from_account"
        value={formData.from_account}
        onChange={handleChange}
        className={fieldClass}
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
      <label htmlFor="to_account" className={labelClass}>To Account:</label>
      <select
        id="to_account"
        name="to_account"
        value={formData.to_account}
        onChange={handleChange}
        className={fieldClass}
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
        <label htmlFor="amount" className={labelClass}>Amount:</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount to Transfer"
          className={`${fieldClass} ${isAmountExceeded ? 'border-clay text-clay' : ''}`}
          required
          min="0.01"
          max={sourceBalance}
          step="0.01"
        />
        {formData.from_account && (
          <p className={`text-sm mt-1 ${isAmountExceeded ? 'text-clay' : 'text-text-main'}`}>
            Available balance: {sourceBalance.toFixed(2)} {accounts.find(acc => acc.id.toString() === formData.from_account.toString())?.currency}
            {isAmountExceeded && (
              <span className="block text-clay font-medium">
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
        className={fieldClass}
      />

      {/* Date */}
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className={fieldClass}
        required
      />

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={isAmountExceeded || loadingAccounts || loadingSubmission}>{loadingSubmission ? 'Transferring...' : 'Transfer Funds'}</Button>
      </div>
    </form>
  );
}