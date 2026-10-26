import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { fieldClass, labelClass, reactSelectTheme } from '../../components/ui/formStyles';
import { fmt } from '../../components/charts/FilterCharts';
import IbanSection from '../../components/IbanSection';

/**
 * Edit an expense after the fact: category, description, savings flag + note.
 * Amount, date and account are intentionally read-only — they mirror the bank statement.
 */
export default function EditExpenseForm({ expense, onSuccess, onCancel, focusSavings = false }) {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(
    expense.category ? { value: expense.category.id, label: expense.category.name } : null,
  );
  const [creating, setCreating] = useState(false);
  const [description, setDescription] = useState(expense.description || '');
  const [isSavings, setIsSavings] = useState(focusSavings ? true : !!expense.is_savings);
  const [note, setNote] = useState(expense.savings_note || '');
  // regular | split | loan
  const initialKind = expense.is_loan ? 'loan' : (expense.splits?.length ? 'split' : 'regular');
  const [kind, setKind] = useState(initialKind);
  const [loanPerson, setLoanPerson] = useState(expense.loan_person || '');
  const [writtenOff, setWrittenOff] = useState(!!expense.loan_written_off);
  const [parts, setParts] = useState(
    expense.splits?.length
      ? expense.splits.map((p) => ({
        amount: p.amount, note: p.note,
        category: p.category ? { value: p.category.id, label: p.category.name } : null,
      }))
      : [{ amount: '', note: '', category: null }, { amount: '', note: '', category: null }],
  );
  const total = Number(expense.amount);
  const partsSum = parts.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const remaining = Math.round((total - partsSum) * 100) / 100;
  const setPart = (i, patch) => setParts((prev) => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/categories/', { headers })
      .then((res) => setCategories((res.data.results ?? res.data).map((c) => ({ value: c.id, label: c.name }))))
      .catch(() => setError('Failed to load categories.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCategory = async (name, onCreated = setCategory) => {
    setCreating(true);
    setError('');
    try {
      const res = await axios.post('/categories/', { name }, { headers });
      const opt = { value: res.data.id, label: res.data.name };
      setCategories((prev) => [...prev, opt]);
      onCreated(opt);
    } catch (err) {
      console.error('Failed to create category:', err.response?.data || err.message);
      setError('Could not create that category (it may already exist).');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (kind === 'split' && Math.abs(remaining) > 0.004) {
      setError(`The parts must add up to ${fmt(total)} (${remaining > 0 ? `${fmt(remaining)} left` : `${fmt(-remaining)} over`}).`);
      return;
    }
    if (kind === 'loan' && !loanPerson.trim()) {
      setError('Who did you lend this to?');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const hadSplits = !!expense.splits?.length;
      // a split has to go before the entry can become a loan
      if (hadSplits && kind !== 'split') {
        await axios.put(`/expenses/${expense.id}/splits/`, { splits: [] }, { headers });
      }
      let res = await axios.patch(`/expenses/${expense.id}/edit/`, {
        category: category ? category.value : null,
        description,
        is_savings: isSavings,
        savings_note: note,
        is_loan: kind === 'loan',
        loan_person: kind === 'loan' ? loanPerson.trim() : '',
        loan_written_off: kind === 'loan' && writtenOff,
      }, { headers });
      if (kind === 'split') {
        res = await axios.put(`/expenses/${expense.id}/splits/`, {
          splits: parts.map((p) => ({ amount: p.amount, note: p.note, category: p.category ? p.category.value : null })),
        }, { headers });
      }
      onSuccess?.(res.data);
    } catch (err) {
      console.error('Failed to update expense:', err.response?.data || err.message);
      const d = err.response?.data;
      setError((d && (d.splits || d.is_loan || d.loan_person)) ? String(d.splits || d.is_loan || d.loan_person) : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-surface-2 border border-border-soft p-3 text-[13px] flex justify-between gap-3">
        <span className="text-text-muted">
          {expense.date}{expense.account ? ` · ${expense.account.name}` : ''}
        </span>
        <span className="font-semibold text-clay shrink-0">- {fmt(expense.amount)}</span>
      </div>
      <p className="text-[12px] text-text-dim -mt-2">Amount, date and account come from the bank and can’t be changed.</p>

      <IbanSection ibans={expense.ibans} payee={expense.payee} />

      <div className={kind === 'split' ? 'hidden' : ''}>
        <span className={labelClass}>Category</span>
        <CreatableSelect
          options={categories}
          value={category}
          onChange={setCategory}
          onCreateOption={createCategory}
          isClearable
          isDisabled={creating}
          isLoading={creating}
          placeholder="Select, or type a new category (e.g. Rent)…"
          formatCreateLabel={(v) => `Create category “${v}”`}
          classNamePrefix="react-select"
          styles={reactSelectTheme}
        />
      </div>

      <div>
        <span className={labelClass}>Type</span>
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-2 rounded-lg border border-border-soft">
          {[['regular', 'Regular'], ['split', 'Split into parts'], ['loan', 'Loan to someone']].map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`px-2 py-1.5 rounded-md text-[12.5px] transition-colors ${kind === k ? 'bg-surface text-text-strong shadow-sm border border-border-soft' : 'text-text-muted hover:text-text-strong'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {kind === 'split' && (
        <div className="space-y-2">
          <p className="text-[12px] text-text-dim">Break this {fmt(total)} into parts. Category totals use the parts.</p>
          {parts.map((p, i) => (
            <div key={i} className="grid grid-cols-[90px_1fr_auto] gap-2 items-start">
              <input
                type="number" min="0.01" step="0.01" placeholder="Amount"
                value={p.amount}
                onChange={(e) => setPart(i, { amount: e.target.value })}
                className={fieldClass}
                aria-label={`Part ${i + 1} amount`}
              />
              <div className="space-y-1">
                <CreatableSelect
                  options={categories}
                  value={p.category}
                  onChange={(opt) => setPart(i, { category: opt })}
                  onCreateOption={(name) => createCategory(name, (opt) => setPart(i, { category: opt }))}
                  placeholder="Category (e.g. Maid Salary)…"
                  formatCreateLabel={(v) => `Create category “${v}”`}
                  classNamePrefix="react-select"
                  styles={reactSelectTheme}
                />
                <input
                  value={p.note}
                  onChange={(e) => setPart(i, { note: e.target.value })}
                  placeholder="Note (optional)"
                  className={`${fieldClass} py-1.5 text-[13px]`}
                />
              </div>
              <button
                type="button"
                onClick={() => setParts((prev) => prev.filter((_, j) => j !== i))}
                disabled={parts.length <= 2}
                className="px-2 py-2 text-text-dim hover:text-clay disabled:opacity-30"
                aria-label="Remove part"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between text-[12.5px]">
            <button
              type="button"
              onClick={() => setParts((prev) => [...prev, { amount: remaining > 0 ? remaining.toFixed(2) : '', note: '', category: null }])}
              className="text-accent-deep underline hover:text-accent"
            >
              + Add part
            </button>
            <span className={Math.abs(remaining) < 0.005 ? 'text-emerald' : 'text-clay'}>
              {Math.abs(remaining) < 0.005 ? 'Adds up ✓' : remaining > 0 ? `${fmt(remaining)} left to assign` : `${fmt(-remaining)} over`}
            </span>
          </div>
        </div>
      )}

      {kind === 'loan' && (
        <div className="space-y-2">
          <div>
            <label className={labelClass} htmlFor="loan-person">Lent to</label>
            <input id="loan-person" value={loanPerson} onChange={(e) => setLoanPerson(e.target.value)}
              placeholder="e.g. Rahul" className={fieldClass} />
          </div>
          <p className="text-[12px] text-text-dim">
            Not counted as spending while it’s owed back. Track repayments on the “Owed to me” tab.
          </p>
          {expense.is_loan && (
            <label className="flex items-center gap-2 text-[13px] text-text-main cursor-pointer select-none">
              <input type="checkbox" checked={writtenOff} onChange={(e) => setWrittenOff(e.target.checked)}
                className="w-4 h-4 accent-[var(--clay)]" />
              Write off: not coming back, count it as spending
            </label>
          )}
          {expense.is_loan && expense.loan_repaid && Number(expense.loan_repaid) > 0 && (
            <p className="text-[12px] text-text-muted">
              {fmt(expense.loan_repaid)} repaid so far. Changing this back to Regular unlinks those repayments.
            </p>
          )}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="edit-desc">Description</label>
        <textarea id="edit-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
      </div>

      <div className="border-t border-border-soft pt-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSavings}
            onChange={(e) => setIsSavings(e.target.checked)}
            className="w-4 h-4 accent-[var(--emerald)]"
          />
          <span className="text-[14px] text-text-strong">Count this as savings</span>
        </label>
        <p className="text-[12px] text-text-dim -mt-2">Still counts as spending; also shows on the Savings tab.</p>
        <div>
          <label className={labelClass} htmlFor="edit-note">Note</label>
          <textarea
            id="edit-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. October rent, paid in cash · 10g gold bar, kept in locker"
            className={fieldClass}
          />
        </div>
      </div>

      {error && <p className="text-[13px] text-clay">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving || creating}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
