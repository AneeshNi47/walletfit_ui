// src/pages/expenses/TopUpForm.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { fieldClass } from '../../components/ui/formStyles';
// CreatableSelect is not strictly needed if category is removed, but keep import if other forms use it or for future
// import CreatableSelect from 'react-select/creatable';

export default function TopUpForm({ onSuccess, onCancel, initialAccountId = null }) {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    account: initialAccountId || '',
    amount: '',
    // Removed 'category' as it's not part of AccountTopUp model
    note: 'Top Up', // Changed from 'description' to 'note' to match backend model
    method: 'Cash', // Added 'method' field with a default value
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);



  const [error, setError] = useState('');

  // Fetch accounts (existing logic - no change needed here)
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await axios.get('/accounts/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
        setAccounts(data);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load accounts for top-up.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (auth?.access) {
      fetchAccounts();
    }
  }, [auth]);

  // Removed useEffect for fetching categories

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Removed handleCategoryChange and handleCreateCategory

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.account) {
      setError('Please select an account.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a positive amount for top-up.');
      return;
    }

    try {
      const amountToSend = Math.abs(parseFloat(formData.amount)); // Ensure amount is positive
      // No need to send category from TopUpForm
      const dataToPost = {
        account: formData.account,
        amount: amountToSend,
        method: formData.method, // Now sending method
        note: formData.note,     // Now sending note
        date: formData.date,
      };

      await axios.post('/accounts/topups/', dataToPost, { // Correct endpoint
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to top up account:', err.response?.data || err.message);
      let errorMessage = 'Failed to top up account. Please check your input and ensure all fields are valid.';
      if (err.response && err.response.data) {
        for (const key in err.response.data) {
            errorMessage += ` ${key}: ${err.response.data[key][0]}`;
        }
      }
      setError(errorMessage);
    }
  };

  // Simplified loading check (removed loadingCategories)
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
        No accounts found. Please add an account first.
        <div className="flex justify-center mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  // selectStyles for CreatableSelect are no longer needed if category is removed.
  // const selectStyles = { /* ... */ };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-clay text-sm">{error}</p>}

      <select
        name="account"
        value={formData.account}
        onChange={handleChange}
        className={fieldClass}
        required
        disabled={!!initialAccountId}
      >
        <option value="">Select Account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} – {acc.balance} {acc.currency}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="Amount"
        className={fieldClass}
        required
        min="0.01"
        step="0.01"
      />

      {/* Input for Method */}
      <input
        type="text"
        name="method"
        value={formData.method}
        onChange={handleChange}
        placeholder="Top-up Method (e.g., Cash, Bank Transfer)"
        className={fieldClass}
        required
      />

      {/* Input for Note (optional) */}
      <input
        type="text"
        name="note" // Changed name from 'description' to 'note'
        value={formData.note}
        onChange={handleChange}
        placeholder="Note (optional)"
        className={fieldClass}
      />

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
        <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loadingAccounts}>Top Up Account</Button>
      </div>
    </form>
  );
}