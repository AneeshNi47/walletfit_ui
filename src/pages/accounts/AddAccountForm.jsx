import { useState } from 'react';
import axios from '../../api/axios'; // Make sure this path is correct
import { useAuth } from '../../context/AuthContext'; // Import useAuth

export default function AddAccountForm({ onSuccess, onCancel }) {
  const { auth } = useAuth(); // Get auth context
  const [form, setForm] = useState({
    name: '',
    type: 'wallet',
    balance: 0.0,
    currency: 'AED',
    account_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      await axios.post('/accounts/', form, { // Assuming your endpoint for accounts is /accounts/
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      onSuccess(); // Call onSuccess after successful API call
    } catch (err) {
      console.error('Failed to add account:', err);
      setError('Failed to add account. Please try again.'); // User-friendly error
    } finally {
      setLoading(false);
    }
  };

  return (
    // Remove the fixed inset-0 modal wrapper from here.
    // This component will be rendered inside the Modal from Home.jsx.
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        name="name"
        type="text"
        placeholder="Account Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="balance"
        type="decimal"
        placeholder="Account Balance"
        value={form.balance}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="wallet">Wallet</option>
        <option value="bank">Bank</option>
        <option value="tap_card">Tap Card</option>
        <option value="cash">Cash</option>
        <option value="other">Other</option>
      </select>
      <select
        name="currency"
        value={form.currency}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="AED">AED</option>
        <option value="USD">USD</option>
        <option value="INR">INR</option>
      </select>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={loading} // Disable during loading
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading} // Disable during loading
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}