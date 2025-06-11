// src/pages/transactions/AddTransactionForm.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CreatableSelect from 'react-select/creatable';

// Remove 'accounts' from props, as it will now fetch them internally
export default function AddTransactionForm({ onSuccess, onCancel }) {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    account: '', // This will hold the account ID
    amount: '',
    category: '', // This will hold the category ID
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState([]); // New state for accounts
  const [loadingAccounts, setLoadingAccounts] = useState(true); // New loading state for accounts

  const [categories, setCategories] = useState([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // useEffect to fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await axios.get('/accounts/', { // Assuming /accounts/ is your endpoint
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setAccounts(response.data);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load accounts for transactions.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (auth?.access) { // Only fetch if authenticated
      fetchAccounts();
    }
  }, [auth]); // Re-fetch accounts if auth token changes

  // useEffect to fetch categories (existing logic)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('/categories/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setCategories(response.data.map(cat => ({ value: cat.id, label: cat.name })));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    if (auth?.access) { // Only fetch if authenticated
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

    // Basic validation
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
        // Attempt to parse specific errors from Django backend
        for (const key in err.response.data) {
            errorMessage += ` ${key}: ${err.response.data[key][0]}`;
        }
      }
      setError(errorMessage);
    }
  };

  // Combine loading states
  if (loadingCategories || loadingAccounts) {
    return (
      <div className="text-center py-4">
        Loading Accounts and Categories...
      </div>
    );
  }

  // If after loading, there are no accounts, inform the user
  if (!accounts.length && !loadingAccounts) {
    return (
      <div className="text-center py-4 text-red-500">
        No accounts found. Please add an account first.
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

const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#d1d5db', // Equivalent to border class
      borderRadius: '0.25rem', // Equivalent to rounded class
      padding: '0.25rem', // Adjust padding as needed
      minHeight: '38px', // Standard height for inputs
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937', // Default text color
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#e5e7eb' : 'white', // bg-gray-200 on focus
      color: '#1f2937',
      '&:active': {
        backgroundColor: '#d1d5db', // bg-gray-300 on active
      },
    }),
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-500">{error}</p>}

      <select
        name="account"
        value={formData.account}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
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
        className="w-full p-2 border rounded"
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
        className="w-full"
        classNamePrefix="react-select"
        styles={selectStyles}
      />

      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description (optional)"
        className="w-full p-2 border rounded"
      />

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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isCreatingCategory || loadingAccounts || loadingCategories} // Disable if any async operation is in progress
        >
          Add Transaction
        </button>
      </div>
    </form>
  );
}