import { useRef } from 'react';
import BulkEntryRow from './BulkEntryRow';
import { newRow } from './useBulkEntry';

const HEADERS = [
  '#', 'Type', 'Account', 'Amount', 'Category', 'To Account', 'Description', 'Date', '', ''
];

export default function BulkEntryGrid({ rows, accounts, categories, onUpdate, onDelete, onAdd, onPasteRows }) {
  const tableRef = useRef(null);

  // Handle paste from Excel / Google Sheets
  function handlePaste(e) {
    const text = e.clipboardData.getData('text/plain');
    if (!text.includes('\t')) return; // not tabular data

    e.preventDefault();
    const lines = text.trim().split('\n');
    const parsed = lines.map(line => {
      const cols = line.split('\t');
      // Expected column order matching the grid: type, account_name, amount, category, description, date
      const [type, accountName, amount, category, description, date] = cols;
      const r = newRow();

      const typeMap = {
        expense: 'expense', income: 'income',
        'transfer in': 'transfer_in', 'transfer out': 'transfer_out',
        transfer_in: 'transfer_in', transfer_out: 'transfer_out',
      };
      if (type) r.type = typeMap[type.trim().toLowerCase()] ?? 'expense';
      if (amount) r.amount = amount.trim().replace(/[^0-9.]/g, '');
      if (description) r.description = description.trim();
      if (date) r.date = date.trim();

      // Try to match account by name
      if (accountName) {
        const matched = accounts.find(a => a.name.toLowerCase() === accountName.trim().toLowerCase());
        if (matched) {
          r.account_id = String(matched.id);
        } else {
          r.account_new = { name: accountName.trim(), type: 'cash', currency: 'AED' };
        }
      }

      // Try to match category by name
      if (category && r.type === 'expense') {
        const matchedCat = categories.find(c => c.name.toLowerCase() === category.trim().toLowerCase());
        if (matchedCat) {
          r.category_id = String(matchedCat.id);
        } else {
          r.category_new = category.trim();
        }
      }

      return r;
    });

    onPasteRows(parsed);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-sand" onPaste={handlePaste} ref={tableRef}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-brand-cream border-b border-brand-sand">
            {HEADERS.map((h, i) => (
              <th key={i} className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <BulkEntryRow
              key={row._id}
              row={row}
              rowIndex={idx}
              accounts={accounts}
              categories={categories}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>

      <div className="px-3 py-2 bg-gray-50 border-t border-brand-sand">
        <button
          onClick={onAdd}
          className="text-sm text-brand-emerald hover:text-brand-forest font-medium flex items-center gap-1 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add row
        </button>
      </div>
    </div>
  );
}
