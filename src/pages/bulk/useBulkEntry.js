import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from '../../api/axios';

const ENTRY_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer_in', label: 'Transfer In' },
  { value: 'transfer_out', label: 'Transfer Out' },
];

let rowIdCounter = 1;

function newRow() {
  return {
    _id: rowIdCounter++,
    type: 'expense',
    account_id: '',
    account_new: null,
    amount: '',
    category_id: '',
    category_new: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    to_account_id: '',
    to_account_new: null,
    _status: null,   // null | 'created' | 'error' | 'rolled_back'
    _error: null,
  };
}

export { ENTRY_TYPES, newRow };

// ─── Build a single row's API payload ────────────────────────────────────────

function buildRowPayload(r) {
  const row = {
    type: r.type,
    amount: r.amount,
    date: r.date,
    description: r.description,
  };

  if (r.account_new) {
    row.account_new = r.account_new;
  } else if (r.account_id) {
    row.account_id = Number(r.account_id);
  }

  if (r.type === 'expense') {
    if (r.category_new) row.category_new = r.category_new;
    else if (r.category_id) row.category_id = Number(r.category_id);
  }

  if (r.type === 'transfer_out') {
    if (r.to_account_new) row.to_account_new = r.to_account_new;
    else if (r.to_account_id) row.to_account_id = Number(r.to_account_id);
  }

  return row;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkEntry(auth) {
  const [rows, setRows] = useState([newRow()]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittingRowId, setSubmittingRowId] = useState(null);
  const [submitSummary, setSubmitSummary] = useState(null);
  const [mode, setMode] = useState('partial');

  useEffect(() => {
    if (!auth?.access) return;
    const headers = { Authorization: `Bearer ${auth.access}` };

    axios.get('accounts/', { headers })
      .then(r => setAccounts(r.data.results ?? r.data))
      .catch(() => {});

    axios.get('categories/', { headers })
      .then(r => setCategories(r.data.results ?? r.data))
      .catch(() => {});
  }, [auth]);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, newRow()]);
  }, []);

  const deleteRow = useCallback((id) => {
    setRows(prev => prev.filter(r => r._id !== id));
  }, []);

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r =>
      r._id === id ? { ...r, [field]: value, _status: null, _error: null } : r
    ));
  }, []);

  const clearResults = useCallback(() => {
    setRows(prev => prev.map(r => ({ ...r, _status: null, _error: null })));
    setSubmitSummary(null);
  }, []);

  // ── Submit all rows ──────────────────────────────────────────────────────────
  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitSummary(null);
    setRows(prev => prev.map(r => ({ ...r, _status: null, _error: null })));

    const payload = rows.map(buildRowPayload);

    try {
      const res = await axios.post(
        'sync/bulk-entry/',
        { rows: payload, mode },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );

      const data = res.data;
      setSubmitSummary({ total: data.total, created: data.created, failed: data.failed, mode: data.mode });

      setRows(prev => prev.map((r, i) => {
        const result = data.results.find(res => res.row === i + 1);
        if (!result) return r;
        return { ...r, _status: result.status, _error: result.error || (result.errors ? JSON.stringify(result.errors) : null) };
      }));
    } catch (err) {
      const data = err.response?.data;
      if (data?.results) {
        setRows(prev => prev.map((r, i) => {
          const result = data.results.find(res => res.row === i + 1);
          if (!result) return r;
          return { ...r, _status: result.status, _error: result.error || (result.errors ? JSON.stringify(result.errors) : null) };
        }));
        setSubmitSummary({ total: data.total, created: data.created ?? 0, failed: data.failed ?? rows.length, mode: data.mode });
      } else {
        setSubmitSummary({ total: rows.length, created: 0, failed: rows.length, error: 'Submission failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }, [rows, mode, auth]);

  // ── Submit a single row ──────────────────────────────────────────────────────
  const submitRow = useCallback(async (id) => {
    const row = rows.find(r => r._id === id);
    if (!row || row._status === 'created') return;

    setSubmittingRowId(id);
    setRows(prev => prev.map(r => r._id === id ? { ...r, _status: null, _error: null } : r));

    try {
      const res = await axios.post(
        'sync/bulk-entry/',
        { rows: [buildRowPayload(row)], mode: 'atomic' },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );

      const result = res.data.results[0];
      setRows(prev => prev.map(r =>
        r._id === id
          ? { ...r, _status: result.status, _error: result.error || null }
          : r
      ));

      // Refresh accounts after each submit so balances are up to date
      axios.get('accounts/', { headers: { Authorization: `Bearer ${auth.access}` } })
        .then(r => setAccounts(r.data.results ?? r.data))
        .catch(() => {});

    } catch (err) {
      const data = err.response?.data;
      const result = data?.results?.[0];
      setRows(prev => prev.map(r =>
        r._id === id
          ? { ...r, _status: 'error', _error: result?.error || result?.errors ? JSON.stringify(result.errors) : 'Submission failed.' }
          : r
      ));
    } finally {
      setSubmittingRowId(null);
    }
  }, [rows, auth]);

  // ── Shared pending new accounts/categories across rows ───────────────────────
  const localAccounts = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const row of rows) {
      for (const spec of [row.account_new, row.to_account_new]) {
        if (spec?.name && !seen.has(spec.name)) {
          seen.add(spec.name);
          result.push(spec);
        }
      }
    }
    return result;
  }, [rows]);

  const localCategories = useMemo(() => {
    const seen = new Set();
    return rows
      .map(r => r.category_new)
      .filter(name => name && !seen.has(name) && seen.add(name));
  }, [rows]);

  // ── Paste / import rows — sorted oldest first ────────────────────────────────
  const pasteRows = useCallback((parsed) => {
    const sorted = [...parsed].sort((a, b) => new Date(a.date) - new Date(b.date));
    const hasData = rows.some(r => r.amount || r.description || r.account_id || r.account_new);
    if (hasData) {
      setRows(prev => [...prev, ...sorted]);
    } else {
      setRows(sorted.length > 0 ? sorted : [newRow()]);
    }
  }, [rows]);

  return {
    rows, accounts, categories, localAccounts, localCategories,
    submitting, submittingRowId, submitSummary, mode,
    setMode, addRow, deleteRow, updateRow, submit, submitRow, clearResults, pasteRows,
  };
}
