// src/pages/transactions/AddTransactionForm.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CreatableSelect from 'react-select/creatable';
import { Button } from '../../components/ui/Button';
import { fieldClass, reactSelectTheme } from '../../components/ui/formStyles';

// Add initialAccountId to props
export default function AddTransactionForm({ onSuccess, onCancel, initialAccountId = null }) {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    account: initialAccountId || '', // Set initial account ID if provided
    amount: '',
    category: '',
    description: '',
    is_personal: false, 
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await axios.get('/accounts/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setAccounts(response.data.results ?? response.data);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load accounts for transactions.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (auth?.access) {
      fetchAccounts();
    }
  }, [auth]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('/categories/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setCategories((response.data.results ?? response.data).map(cat => ({ value: cat.id, label: cat.name })));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    if (auth?.access) {
      fetchCategories();
    }
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategoryOption(selectedOption);
    setFormData((prev) => ({
      ...prev,
      category: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleCreateCategory = async (inputValue) => {
    setIsCreatingCategory(true);
    setError('');
    try {
      const response = await axios.post(
        '/categories/',
        { name: inputValue },
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      const newCategory = response.data;
      const newCategoryOption = { value: newCategory.id, label: newCategory.name };

      setCategories((prevCategories) => [...prevCategories, newCategoryOption]);
      setSelectedCategoryOption(newCategoryOption);
      setFormData((prev) => ({
        ...prev,
        category: newCategory.id,
      }));
    } catch (err) {
      console.error('Failed to create category:', err.response?.data || err.message);
      setError('Failed to create new category. Please try again.');
      setSelectedCategoryOption(null);
      setFormData((prev) => ({ ...prev, category: '' }));
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.account) {
      setError('Please select an account.');
      return;
    }
    if (!formData.category) {
      setError('Please select or create a category.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      await axios.post('/expenses/', formData, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to add transaction:', err.response?.data || err.message);
      let errorMessage = 'Failed to add transaction. Please check your input and ensure all fields are valid.';
      if (err.response && err.response.data) {
        for (const key in err.response.data) {
            errorMessage += ` ${key}: ${err.response.data[key][0]}`;
        }
      }
      setError(errorMessage);
    }
  };

  if (loadingCategories || loadingAccounts) {
    return (
      <div className="text-center py-4 text-text-muted">
        Loading Accounts and Categories...
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-clay text-sm">{error}</p>}

      <select
        name="account"
        value={formData.account}
        onChange={handleChange}
        className={fieldClass}
        required
        disabled={!!initialAccountId} // Disable if initialAccountId is provided
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

      <CreatableSelect
        name="category"
        options={categories}
        value={selectedCategoryOption}
        onChange={handleCategoryChange}
        onCreateOption={handleCreateCategory}
        isDisabled={isCreatingCategory}
        isLoading={isCreatingCategory}
        placeholder="Select or type a category..."
        className="w-full text-sm"
        classNamePrefix="react-select"
        styles={reactSelectTheme}
      />
    <label className="flex items-center gap-2 text-[14px] text-text-main">
      <input
        type="checkbox"
        name="is_personal"
        checked={formData.is_personal}
        onChange={(e) => setFormData(prev => ({ ...prev, is_personal: e.target.checked }))}
        className="accent-accent"
      />
      <span>Mark as Personal Expense</span>
    </label>
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description (optional)"
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
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={isCreatingCategory || loadingAccounts || loadingCategories}
        >
          Add Expense
        </Button>
      </div>
    </form>
  );
}