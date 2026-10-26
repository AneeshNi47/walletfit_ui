import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass, reactSelectTheme } from '../../components/ui/formStyles';
import { fmt } from '../../components/charts/FilterCharts';
import IbanSection from '../../components/IbanSection';

/** Edit an income entry's source + description. Amount, date and account stay read-only. */
export default function EditIncomeForm({ income, onSuccess, onCancel }) {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  const [sources, setSources] = useState([]);
  const [source, setSource] = useState(
    income.source ? { value: income.source, label: income.source_name } : null,
  );
  const [creating, setCreating] = useState(false);
  const [description, setDescription] = useState(income.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/income/sources/', { headers, params: { page_size: 1000 } })
      .then((res) => setSources((res.data.results ?? res.data).map((s) => ({ value: s.id, label: s.name }))))
      .catch(() => setError('Failed to load sources.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSource = async (name) => {
    setCreating(true);
    setError('');
    try {
      const res = await axios.post('/income/sources/', { name }, { headers });
      const opt = { value: res.data.id, label: res.data.name };
      setSources((prev) => [...prev, opt]);
      setSource(opt);
    } catch (err) {
      console.error('Failed to create source:', err.response?.data || err.message);
      setError('Could not create that source (it may already exist).');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await axios.patch(`/income/${income.id}/edit/`, {
        source: source ? source.value : null,
        description,
      }, { headers });
      onSuccess?.(res.data);
    } catch (err) {
      console.error('Failed to update income:', err.response?.data || err.message);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-surface-2 border border-border-soft p-3 text-[13px] flex justify-between gap-3">
        <span className="text-text-muted">
          {income.date}{income.account_name ? ` · ${income.account_name}` : ''}
        </span>
        <span className="font-semibold text-emerald shrink-0">+{fmt(income.amount)}</span>
      </div>
      <p className="text-[12px] text-text-dim -mt-2">Amount, date and account come from the bank and can’t be changed.</p>

      <IbanSection ibans={income.ibans} payee={income.payee} />

      <div>
        <span className={labelClass}>Source</span>
        <CreatableSelect
          options={sources}
          value={source}
          onChange={setSource}
          onCreateOption={createSource}
          isClearable
          isDisabled={creating}
          isLoading={creating}
          placeholder="Select, or type a new source…"
          formatCreateLabel={(v) => `Create source “${v}”`}
          classNamePrefix="react-select"
          styles={reactSelectTheme}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="edit-inc-desc">Description</label>
        <textarea id="edit-inc-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
      </div>

      {error && <p className="text-[13px] text-clay">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving || creating}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
