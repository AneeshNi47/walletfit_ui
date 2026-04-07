import { useState, useRef } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { downloadTemplate, parseImportFile, flagDuplicates } from './importParser';

export default function ImportSection({ accounts, categories, onImport }) {
  const { auth } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { rows, warnings, filename, isFynBeeTemplate }
  const fileRef = useRef(null);

  async function fetchExistingEntries(minDate, maxDate) {
    if (!auth?.access) return [];
    const headers = { Authorization: `Bearer ${auth.access}` };
    const params = { page_size: 1000, start_date: minDate, end_date: maxDate };
    try {
      const [expRes, incRes] = await Promise.all([
        axios.get('expenses/', { headers, params }),
        axios.get('income/', { headers, params }),
      ]);
      const expenses = (expRes.data.results ?? expRes.data).map(e => ({ date: e.date, amount: e.amount }));
      const incomes = (incRes.data.results ?? incRes.data).map(e => ({ date: e.date, amount: e.amount }));
      return [...expenses, ...incomes];
    } catch {
      return [];
    }
  }

  async function handleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Please upload an .xlsx, .xls, or .csv file.');
      return;
    }

    setError(null);
    setParsing(true);
    setPreview(null);

    try {
      const result = await parseImportFile(file, accounts, categories);

      // Pre-apply selected account to all rows that don't already have one
      let rows = result.rows;
      if (selectedAccount) {
        rows = rows.map(r =>
          !r.account_id && !r.account_new
            ? { ...r, account_id: selectedAccount }
            : r
        );
      }

      // Duplicate detection — fetch existing entries for the date range in the file
      if (rows.length > 0) {
        const dates = rows.map(r => r.date).filter(Boolean).sort();
        const existing = await fetchExistingEntries(dates[0], dates[dates.length - 1]);
        rows = flagDuplicates(rows, existing);
      }

      setPreview({ ...result, rows, filename: file.name });
    } catch (e) {
      setError(e.message);
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleFileInput(e) {
    handleFile(e.target.files[0]);
    e.target.value = '';
  }

  function handleLoadIntoGrid() {
    if (!preview) return;
    onImport(preview.rows);
    setPreview(null);
  }

  function handleDiscard() {
    setPreview(null);
    setError(null);
  }

  const typeColors = {
    expense: 'bg-red-100 text-red-700',
    income: 'bg-green-100 text-green-700',
    transfer_in: 'bg-blue-100 text-blue-700',
    transfer_out: 'bg-orange-100 text-orange-700',
  };

  function removeDuplicates() {
    setPreview(prev => ({ ...prev, rows: prev.rows.filter(r => !r._isDuplicate) }));
  }

  const selectedAccountName = accounts.find(a => String(a.id) === selectedAccount)?.name;
  const duplicateCount = preview?.rows.filter(r => r._isDuplicate).length ?? 0;

  return (
    <div className="mb-6 bg-white border border-brand-sand rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-forest">Import from File</h2>
          <p className="text-xs text-gray-400 mt-0.5">Upload a bank statement or use the FynBee template</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-brand-emerald text-brand-emerald rounded-lg hover:bg-brand-emerald hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Template
        </button>
      </div>

      {/* Step 1 — Account selection (always visible) */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Step 1 — Select the account for this statement
        </label>
        <select
          className="border border-brand-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald bg-white w-full max-w-xs"
          value={selectedAccount}
          onChange={e => {
            setSelectedAccount(e.target.value);
            // Re-apply to existing preview rows if one is open
            if (preview) {
              const accId = e.target.value;
              setPreview(prev => ({
                ...prev,
                rows: prev.rows.map(r =>
                  !r.account_id && !r.account_new
                    ? { ...r, account_id: accId }
                    : r
                ),
              }));
            }
          }}
        >
          <option value="">— No account selected (set per row) —</option>
          {accounts.map(a => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
        </select>
        {selectedAccount && (
          <p className="mt-1 text-xs text-brand-emerald">
            All imported rows will be assigned to <strong>{selectedAccountName}</strong>.
          </p>
        )}
      </div>

      {/* Step 2 — File upload */}
      {!preview && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Step 2 — Upload your file
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={[
              'border-2 border-dashed rounded-lg px-6 py-8 text-center cursor-pointer transition-colors',
              dragging ? 'border-brand-emerald bg-green-50' : 'border-gray-200 hover:border-brand-emerald hover:bg-gray-50',
            ].join(' ')}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileInput}
            />
            {parsing ? (
              <p className="text-sm text-gray-400">Parsing file and checking for duplicates…</p>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500 font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv — bank statements or FynBee template</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      {/* Preview panel */}
      {preview && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-medium text-gray-600">{preview.filename}</span>
              <span className="ml-2 text-xs text-gray-400">— {preview.rows.length} rows detected</span>
              {!preview.isFynBeeTemplate && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">bank statement</span>
              )}
              {duplicateCount > 0 && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {duplicateCount} possible duplicate{duplicateCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button onClick={handleDiscard} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              Discard
            </button>
          </div>

          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 space-y-0.5">
              {preview.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
            </div>
          )}

          {/* Duplicate notice */}
          {duplicateCount > 0 && (
            <div className="mb-3 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
              <span>⚠ {duplicateCount} row{duplicateCount !== 1 ? 's' : ''} may already exist (same date &amp; amount found in your records). They are highlighted below.</span>
              <button
                onClick={removeDuplicates}
                className="shrink-0 px-2.5 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-semibold whitespace-nowrap"
              >
                Remove {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Row preview table */}
          <div className="overflow-x-auto rounded border border-gray-100 max-h-56 overflow-y-auto mb-3">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Description</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Amount</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Type</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Account</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Category</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => {
                  const accName = row.account_id
                    ? accounts.find(a => String(a.id) === String(row.account_id))?.name ?? '—'
                    : row.account_new?.name ?? '—';
                  const catName = row.category_id
                    ? categories.find(c => String(c.id) === String(row.category_id))?.name ?? '—'
                    : row.category_new || '—';

                  return (
                    <tr key={i} className={`border-t border-gray-50 ${row._isDuplicate ? 'bg-orange-50' : ''}`}>
                      <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-1.5 text-gray-700 max-w-[200px] truncate">{row.description || '—'}</td>
                      <td className="px-3 py-1.5 font-medium text-gray-700">{row.amount}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${typeColors[row.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-gray-500">{accName}</td>
                      <td className="px-3 py-1.5 text-gray-500">{catName}</td>
                      <td className="px-3 py-1.5">
                        {row._isDuplicate && (
                          <span title="Possible duplicate — same date and amount already in your records" className="text-orange-500 cursor-help">⚠</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Upload a different file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileInput}
            />
            <button
              onClick={handleLoadIntoGrid}
              className="px-4 py-2 bg-brand-emerald text-white text-sm font-semibold rounded-lg hover:bg-brand-forest transition-colors"
            >
              Load {preview.rows.length} rows into grid →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
