import { useAuth } from '../../context/AuthContext';
import { useBulkEntry } from './useBulkEntry';
import BulkEntryGrid from './BulkEntryGrid';
import ImportSection from './ImportSection';

export default function BulkEntryPage() {
  const { auth } = useAuth();
  const {
    rows, accounts, categories, localAccounts, localCategories,
    submitting, submittingRowId, submitSummary, mode,
    setMode, addRow, deleteRow, updateRow, submit, submitRow, clearResults, pasteRows,
  } = useBulkEntry(auth);

  const hasResults = rows.some(r => r._status !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-forest">Bulk Entry</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter multiple transactions at once. Paste from Excel using the same column order.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 font-medium">Submit mode:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio" name="mode" value="partial"
                checked={mode === 'partial'}
                onChange={() => setMode('partial')}
                className="accent-brand-emerald"
              />
              <span className="text-gray-700">Partial <span className="text-gray-400">(skip errors)</span></span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio" name="mode" value="atomic"
                checked={mode === 'atomic'}
                onChange={() => setMode('atomic')}
                className="accent-brand-emerald"
              />
              <span className="text-gray-700">Atomic <span className="text-gray-400">(all or nothing)</span></span>
            </label>
          </div>
        </div>

        {/* Import section */}
        <ImportSection
          accounts={accounts}
          categories={categories}
          onImport={pasteRows}
        />

        {/* Paste hint */}
        <div className="mb-3 text-xs text-gray-400 bg-white border border-dashed border-gray-200 rounded px-3 py-2">
          Tip: Copy rows from Excel with columns in order —{' '}
          <span className="font-mono text-gray-500">Type · Account · Amount · Category · Description · Date</span>
          {' '}— then paste anywhere on the table.
        </div>

        {/* Grid */}
        <BulkEntryGrid
          rows={rows}
          accounts={accounts}
          categories={categories}
          localAccounts={localAccounts}
          localCategories={localCategories}
          onUpdate={updateRow}
          onDelete={deleteRow}
          onAdd={addRow}
          onPasteRows={pasteRows}
          onSubmitRow={submitRow}
          submittingRowId={submittingRowId}
        />

        {/* Submit bar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-400">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>

          <div className="flex items-center gap-3">
            {hasResults && (
              <button
                onClick={clearResults}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear results
              </button>
            )}
            <button
              onClick={submit}
              disabled={submitting || rows.length === 0}
              className="px-6 py-2 bg-brand-emerald text-white text-sm font-semibold rounded-lg hover:bg-brand-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : `Submit ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        {/* Summary banner */}
        {submitSummary && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            submitSummary.failed === 0
              ? 'bg-green-50 text-green-800 border border-green-200'
              : submitSummary.created === 0
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {submitSummary.error ? (
              submitSummary.error
            ) : (
              <>
                {submitSummary.created > 0 && (
                  <span className="mr-3">✓ {submitSummary.created} created</span>
                )}
                {submitSummary.failed > 0 && (
                  <span>✕ {submitSummary.failed} failed — check highlighted rows</span>
                )}
              </>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block"></span> Created
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block"></span> Error
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300 inline-block"></span> Rolled back
          </span>
        </div>
      </div>
    </div>
  );
}
