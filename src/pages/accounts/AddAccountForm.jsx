import { useState } from 'react';
import axios from '../../api/axios'; // Make sure this path is correct
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { Button } from '../../components/ui/Button';
import { fieldClass } from '../../components/ui/formStyles';

export default function AddAccountForm({ onSuccess, onCancel, account = null }) {
  const { auth } = useAuth();
  const isEdit = !!account;
  const [form, setForm] = useState({
    name: account?.name ?? '',
    type: account?.type ?? 'wallet',
    balance: account?.balance ?? 0.0,
    currency: account?.currency ?? 'AED',
    account_number: account?.account_number ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'balance' ? parseFloat(value) || 0 : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // On edit, balance is server-read-only — don't send it.
    const payload = isEdit
      ? { name: form.name, type: form.type, currency: form.currency, account_number: form.account_number }
      : form;
    try {
      if (isEdit) {
        await axios.patch(`/accounts/${account.id}/`, payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
      } else {
        await axios.post('/accounts/', payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
      }
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      const msg = data && typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : `Failed to ${isEdit ? 'update' : 'add'} account. Please try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Remove the fixed inset-0 modal wrapper from here.
    // This component will be rendered inside the Modal from Home.jsx.
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-clay text-sm">{error}</p>}
      <input
        name="name"
        type="text"
        placeholder="Account Name"
        value={form.name}
        onChange={handleChange}
        className={fieldClass}
        required
      />
      {!isEdit && (
        <input
          name="balance"
          type="number"
          step="0.01"
          placeholder="Opening balance"
          value={form.balance}
          onChange={handleChange}
          className={fieldClass}
          required
        />
      )}
      <input
        name="account_number"
        type="text"
        placeholder="Account / card number (optional)"
        value={form.account_number}
        onChange={handleChange}
        className={fieldClass}
      />
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className={fieldClass}
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
        className={fieldClass}
      >
        <option value="AED">AED</option>
        <option value="USD">USD</option>
        <option value="INR">INR</option>
      </select>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}