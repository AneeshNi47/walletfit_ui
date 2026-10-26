import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { fieldClass, labelClass, reactSelectTheme } from './ui/formStyles';

export const shortIban = (iban) => (iban ? `${iban.slice(0, 4)} … ${iban.slice(-6)}` : '');

/**
 * Name a bank account (IBAN). Rendered as a <div> (not a <form>) so it can sit inside other
 * forms such as the Edit expense box. `payee` = existing payee to edit, else creates for `iban`.
 */
export default function PayeeForm({ iban, payee, txCount, onSaved, onCancel, compact = false }) {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };
  const [ibanText, setIbanText] = useState(payee?.iban || iban || '');
  const [name, setName] = useState(payee?.name || '');
  const [kind, setKind] = useState(payee?.kind || 'person');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(
    payee?.category ? { value: payee.category.id, label: payee.category.name } : null,
  );
  const [applyCategory, setApplyCategory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/categories/', { headers })
      .then((res) => setCategories((res.data.results ?? res.data).map((c) => ({ value: c.id, label: c.name }))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCategory = async (n) => {
    try {
      const res = await axios.post('/categories/', { name: n }, { headers });
      const opt = { value: res.data.id, label: res.data.name };
      setCategories((prev) => [...prev, opt]);
      setCategory(opt);
    } catch {
      setError('Could not create that category (it may already exist).');
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const body = {
      name, kind,
      category: category ? category.value : null,
      apply_category: !!category && applyCategory,
    };
    try {
      const res = payee
        ? await axios.patch(`expenses/payees/${payee.id}/`, body, { headers })
        : await axios.post('expenses/payees/', { ...body, iban: ibanText }, { headers });
      onSaved?.(res.data);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? String(d.name || d.iban || d.category || 'Could not save.') : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-3 ${compact ? 'rounded-lg border border-border-soft bg-surface-2 p-3' : ''}`}>
      <div>
        <label className={labelClass} htmlFor="payee-iban">Account (IBAN)</label>
        <input
          id="payee-iban" value={ibanText} onChange={(e) => setIbanText(e.target.value)}
          readOnly={!!(payee || iban)} placeholder="AE.."
          className={`${fieldClass} font-mono text-[13px] ${payee || iban ? 'opacity-80' : ''}`}
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <div>
          <label className={labelClass} htmlFor="payee-name">Name</label>
          <input id="payee-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Landlord – Ahmed" className={fieldClass} autoFocus={!compact} />
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${fieldClass} w-auto`} aria-label="Type">
          <option value="person">Person</option>
          <option value="organization">Organization</option>
        </select>
      </div>
      <div>
        <span className={labelClass}>Category (optional)</span>
        <CreatableSelect
          options={categories} value={category} onChange={setCategory} onCreateOption={createCategory}
          isClearable placeholder="e.g. Rent"
          formatCreateLabel={(v) => `Create category “${v}”`}
          classNamePrefix="react-select" styles={reactSelectTheme}
        />
        {category && (
          <label className="mt-2 flex items-center gap-2 text-[13px] text-text-main cursor-pointer select-none">
            <input type="checkbox" checked={applyCategory} onChange={(e) => setApplyCategory(e.target.checked)}
              className="w-4 h-4 accent-[var(--emerald)]" />
            Set “{category.label}” on all past transfers to this account{txCount ? ` (${txCount})` : ''}
          </label>
        )}
        <p className="text-[12px] text-text-dim mt-1">
          Future imports from this IBAN get this name{category ? ' and category' : ''} automatically.
        </p>
      </div>
      {error && <p className="text-[13px] text-clay">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="button" onClick={save} disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : payee ? 'Save' : 'Save name'}
        </Button>
      </div>
    </div>
  );
}

/** Small badge naming the counterparty of a transaction. */
export function PayeeBadge({ payee }) {
  if (!payee) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-surface-2 border border-border-soft text-text-strong text-[11px] font-semibold px-2 py-0.5 rounded-full"
      title={payee.iban}>
      {payee.kind === 'organization' ? '🏢' : '👤'} {payee.name}
    </span>
  );
}
