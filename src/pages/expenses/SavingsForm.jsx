import { useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass } from '../../components/ui/formStyles';
import { fmt } from '../../components/charts/FilterCharts';

/** Mark / unmark an expense as savings and keep a note about it. */
export default function SavingsForm({ expense, onSuccess, onCancel }) {
  const { auth } = useAuth();
  const [isSavings, setIsSavings] = useState(expense.is_savings ?? true);
  const [note, setNote] = useState(expense.savings_note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await axios.patch(
        `/expenses/${expense.id}/savings/`,
        { is_savings: isSavings, savings_note: note },
        { headers: { Authorization: `Bearer ${auth?.access}` } },
      );
      onSuccess?.(res.data);
    } catch (err) {
      console.error('Failed to update savings:', err.response?.data || err.message);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-surface-2 border border-border-soft p-3 text-[13px]">
        <div className="flex justify-between gap-3">
          <span className="text-text-strong truncate">{expense.description || 'No description'}</span>
          <span className="font-semibold text-clay shrink-0">- {fmt(expense.amount)}</span>
        </div>
        <div className="text-text-muted mt-1">
          {expense.date}{expense.category ? ` · ${expense.category.name}` : ''}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isSavings}
          onChange={(e) => setIsSavings(e.target.checked)}
          className="w-4 h-4 accent-[var(--emerald)]"
        />
        <span className="text-[14px] text-text-strong">Count this as savings</span>
      </label>
      <p className="text-[12px] text-text-dim -mt-2">
        It still counts as spending; it will also show on the Savings tab.
      </p>

      <div>
        <label className={labelClass} htmlFor="savings-note">Note</label>
        <textarea
          id="savings-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. 10g gold bar, kept in locker · Sept transfer to India FD"
          className={fieldClass}
        />
      </div>

      {error && <p className="text-[13px] text-clay">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
