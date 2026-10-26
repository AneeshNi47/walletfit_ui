import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CreatableSelect from 'react-select/creatable';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass, reactSelectTheme } from '../../components/ui/formStyles';

// Standalone income entry form — posts to /income/ (NOT /accounts/topups/).
// Extracted from IncomePage so the dashboard "Log income" action can reuse it.
export default function AddIncomeForm({ onSuccess, onCancel }) {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  const [formData, setFormData] = useState({
    account: '',
    source: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [accounts, setAccounts] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSourceOption, setSelectedSourceOption] = useState(null);
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('/accounts/', { headers });
        setAccounts(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      }
    };
    const fetchSources = async () => {
      try {
        const res = await axios.get('/income/sources/', { headers });
        const data = res.data.results || res.data;
        setSources(data.map((s) => ({ value: s.id, label: s.name })));
      } catch (err) {
        console.error('Failed to fetch income sources:', err);
      }
    };
    if (auth?.access) {
      fetchAccounts();
      fetchSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.access]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceChange = (selectedOption) => {
    setSelectedSourceOption(selectedOption);
    setFormData((prev) => ({ ...prev, source: selectedOption ? selectedOption.value : '' }));
  };

  const handleCreateSource = async (inputValue) => {
    setIsCreatingSource(true);
    setFormError('');
    try {
      const res = await axios.post('/income/sources/', { name: inputValue }, { headers });
      const newOption = { value: res.data.id, label: res.data.name };
      setSources((prev) => [...prev, newOption]);
      setSelectedSourceOption(newOption);
      setFormData((prev) => ({ ...prev, source: res.data.id }));
    } catch (err) {
      console.error('Failed to create source:', err.response?.data || err.message);
      setFormError('Failed to create new source. Please try again.');
      setSelectedSourceOption(null);
      setFormData((prev) => ({ ...prev, source: '' }));
    } finally {
      setIsCreatingSource(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      };
      if (formData.account) payload.account = formData.account;
      if (formData.source) payload.source = formData.source;
      await axios.post('/income/', payload, { headers });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add income:', err.response?.data || err.message);
      let msg = 'Failed to add income.';
      if (err.response && err.response.data) {
        for (const key in err.response.data) {
          msg += ' ' + key + ': ' + err.response.data[key];
        }
      }
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {formError && <p className="text-clay text-sm">{formError}</p>}

      <div>
        <label className={labelClass}>Source</label>
        <CreatableSelect
          options={sources}
          value={selectedSourceOption}
          onChange={handleSourceChange}
          onCreateOption={handleCreateSource}
          isDisabled={isCreatingSource}
          isLoading={isCreatingSource}
          placeholder="Select or type a source..."
          className="w-full text-sm"
          classNamePrefix="react-select"
          styles={reactSelectTheme}
        />
      </div>

      <div>
        <label className={labelClass}>Account (optional)</label>
        <select
          name="account"
          value={formData.account}
          onChange={handleChange}
          className={fieldClass}
        >
          <option value="">No Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} - {acc.balance} {acc.currency}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Amount</label>
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
      </div>

      <div>
        <label className={labelClass}>Description (optional)</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={fieldClass}
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={loading || isCreatingSource}
        >
          {loading ? 'Adding...' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
}
