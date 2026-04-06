import { useState } from 'react';
import { ENTRY_TYPES } from './useBulkEntry';

const ACCOUNT_TYPES = ['wallet', 'bank', 'tap_card', 'cash', 'other'];

function NewAccountInline({ value, onChange }) {
  return (
    <div className="flex gap-1 mt-1">
      <input
        className="border border-brand-sand rounded px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-brand-emerald"
        placeholder="Account name"
        value={value?.name ?? ''}
        onChange={e => onChange({ ...value, name: e.target.value, type: value?.type ?? 'cash', currency: value?.currency ?? 'AED' })}
      />
      <select
        className="border border-brand-sand rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-emerald"
        value={value?.type ?? 'cash'}
        onChange={e => onChange({ ...value, type: e.target.value })}
      >
        {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}

export default function BulkEntryRow({ row, accounts, categories, localAccounts, localCategories, onUpdate, onDelete, rowIndex }) {
  const [showNewAccount, setShowNewAccount] = useState(!!row.account_new);
  const [showNewToAccount, setShowNewToAccount] = useState(!!row.to_account_new);
  const [showNewCategory, setShowNewCategory] = useState(!!row.category_new && !row.category_id);

  const statusColors = {
    created: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    rolled_back: 'bg-yellow-50 border-yellow-300',
  };

  const rowBg = row._status ? statusColors[row._status] ?? '' : '';

  // Pending accounts from other rows available to reuse.
  // Only exclude this row's own entry when it's actively being typed (text input open),
  // so the option stays in the list when this row has selected a pending category.
  const otherLocalAccounts = (localAccounts ?? []).filter(
    a => showNewAccount ? a.name !== row.account_new?.name : true
  );
  const otherLocalCategories = (localCategories ?? []).filter(
    name => showNewCategory ? name !== row.category_new : true
  );

  // Current dropdown value for account
  const accountDropdownValue = showNewAccount
    ? '__new__'
    : row.account_id
    ? String(row.account_id)
    : row.account_new?.name
    ? `__local__${row.account_new.name}`
    : '';

  const toAccountDropdownValue = showNewToAccount
    ? '__new__'
    : row.to_account_id
    ? String(row.to_account_id)
    : row.to_account_new?.name
    ? `__local__${row.to_account_new.name}`
    : '';

  function handleAccountChange(val) {
    if (val === '__new__') {
      setShowNewAccount(true);
      onUpdate(row._id, 'account_id', '');
      onUpdate(row._id, 'account_new', { name: '', type: 'cash', currency: 'AED' });
    } else if (val.startsWith('__local__')) {
      // Reuse a pending new account from another row
      const name = val.slice(9);
      const spec = (localAccounts ?? []).find(a => a.name === name);
      setShowNewAccount(false);
      onUpdate(row._id, 'account_id', '');
      onUpdate(row._id, 'account_new', spec ?? { name, type: 'cash', currency: 'AED' });
    } else {
      setShowNewAccount(false);
      onUpdate(row._id, 'account_new', null);
      onUpdate(row._id, 'account_id', val);
    }
  }

  function handleToAccountChange(val) {
    if (val === '__new__') {
      setShowNewToAccount(true);
      onUpdate(row._id, 'to_account_id', '');
      onUpdate(row._id, 'to_account_new', { name: '', type: 'cash', currency: 'AED' });
    } else if (val.startsWith('__local__')) {
      const name = val.slice(9);
      const spec = (localAccounts ?? []).find(a => a.name === name);
      setShowNewToAccount(false);
      onUpdate(row._id, 'to_account_id', '');
      onUpdate(row._id, 'to_account_new', spec ?? { name, type: 'cash', currency: 'AED' });
    } else {
      setShowNewToAccount(false);
      onUpdate(row._id, 'to_account_new', null);
      onUpdate(row._id, 'to_account_id', val);
    }
  }

  function handleCategoryChange(val) {
    if (val === '__new__') {
      setShowNewCategory(true);
      onUpdate(row._id, 'category_id', '');
      onUpdate(row._id, 'category_new', '');
    } else if (val.startsWith('__local__')) {
      // Reuse a pending new category from another row
      const name = val.slice(9);
      setShowNewCategory(false);
      onUpdate(row._id, 'category_id', '');
      onUpdate(row._id, 'category_new', name);
    } else {
      setShowNewCategory(false);
      onUpdate(row._id, 'category_new', '');
      onUpdate(row._id, 'category_id', val);
    }
  }

  const cellClass = 'px-1';
  const inputClass = 'w-full border border-brand-sand rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-emerald bg-white';
  const selectClass = 'w-full border border-brand-sand rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-emerald bg-white';

  return (
    <tr className={`border-b border-gray-100 ${rowBg} transition-colors`}>
      {/* Row number */}
      <td className="px-2 py-2 text-xs text-gray-400 text-center w-8">{rowIndex + 1}</td>

      {/* Type */}
      <td className={`${cellClass} py-2 w-36`}>
        <select
          className={selectClass}
          value={row.type}
          onChange={e => onUpdate(row._id, 'type', e.target.value)}
        >
          {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </td>

      {/* Account */}
      <td className={`${cellClass} py-2 w-44`}>
        <select
          className={selectClass}
          value={accountDropdownValue}
          onChange={e => handleAccountChange(e.target.value)}
        >
          <option value="">Select account</option>
          {accounts.map(a => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
          {otherLocalAccounts.length > 0 && (
            <optgroup label="Pending (unsaved)">
              {otherLocalAccounts.map(a => (
                <option key={`local_${a.name}`} value={`__local__${a.name}`}>
                  {a.name} (new)
                </option>
              ))}
            </optgroup>
          )}
          <option value="__new__">+ Create new</option>
        </select>
        {showNewAccount && (
          <NewAccountInline
            value={row.account_new}
            onChange={v => onUpdate(row._id, 'account_new', v)}
          />
        )}
        {!showNewAccount && row.account_new?.name && (
          <span className="text-xs text-blue-500 mt-0.5 block">
            new: {row.account_new.name}
          </span>
        )}
      </td>

      {/* Amount */}
      <td className={`${cellClass} py-2 w-28`}>
        <input
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          placeholder="0.00"
          value={row.amount}
          onChange={e => onUpdate(row._id, 'amount', e.target.value)}
        />
      </td>

      {/* Category (expense only) */}
      <td className={`${cellClass} py-2 w-40`}>
        {row.type === 'expense' ? (
          <>
            {!showNewCategory ? (
              <select
                className={selectClass}
                value={row.category_id ? String(row.category_id) : row.category_new ? `__local__${row.category_new}` : ''}
                onChange={e => handleCategoryChange(e.target.value)}
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
                {otherLocalCategories.length > 0 && (
                  <optgroup label="Pending (unsaved)">
                    {otherLocalCategories.map(name => (
                      <option key={`local_${name}`} value={`__local__${name}`}>
                        {name} (new)
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__new__">+ Create new</option>
              </select>
            ) : (
              <div className="flex gap-1">
                <input
                  className={inputClass}
                  placeholder="New category"
                  value={row.category_new}
                  onChange={e => onUpdate(row._id, 'category_new', e.target.value)}
                />
                <button
                  className="text-xs text-gray-400 hover:text-red-400"
                  onClick={() => { setShowNewCategory(false); onUpdate(row._id, 'category_new', ''); }}
                >✕</button>
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-300 px-2">—</span>
        )}
      </td>

      {/* To Account (transfer_out only) */}
      <td className={`${cellClass} py-2 w-44`}>
        {row.type === 'transfer_out' ? (
          <>
            <select
              className={selectClass}
              value={toAccountDropdownValue}
              onChange={e => handleToAccountChange(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={String(a.id)}>{a.name}</option>
              ))}
              {otherLocalAccounts.length > 0 && (
                <optgroup label="Pending (unsaved)">
                  {otherLocalAccounts.map(a => (
                    <option key={`local_to_${a.name}`} value={`__local__${a.name}`}>
                      {a.name} (new)
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__new__">+ Create new</option>
            </select>
            {showNewToAccount && (
              <NewAccountInline
                value={row.to_account_new}
                onChange={v => onUpdate(row._id, 'to_account_new', v)}
              />
            )}
            {!showNewToAccount && row.to_account_new?.name && (
              <span className="text-xs text-blue-500 mt-0.5 block">
                new: {row.to_account_new.name}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-300 px-2">—</span>
        )}
      </td>

      {/* Description */}
      <td className={`${cellClass} py-2`}>
        <input
          type="text"
          className={inputClass}
          placeholder="Description"
          value={row.description}
          onChange={e => onUpdate(row._id, 'description', e.target.value)}
        />
      </td>

      {/* Date */}
      <td className={`${cellClass} py-2 w-36`}>
        <input
          type="date"
          className={inputClass}
          value={row.date}
          onChange={e => onUpdate(row._id, 'date', e.target.value)}
        />
      </td>

      {/* Status */}
      <td className="px-2 py-2 w-10 text-center">
        {row._status === 'created' && (
          <span title="Created" className="text-green-500 text-lg">✓</span>
        )}
        {(row._status === 'error' || row._status === 'rolled_back') && (
          <span title={row._error ?? 'Error'} className="text-red-500 text-lg cursor-help">✕</span>
        )}
      </td>

      {/* Error message */}
      {row._status === 'error' && row._error && (
        <td colSpan={9} className="px-3 pb-1 text-xs text-red-600">
          {row._error}
        </td>
      )}

      {/* Delete */}
      <td className="px-2 py-2 w-8 text-center">
        <button
          onClick={() => onDelete(row._id)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
          title="Delete row"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
