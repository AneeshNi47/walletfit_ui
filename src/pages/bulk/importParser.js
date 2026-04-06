import * as XLSX from 'xlsx';
import { newRow } from './useBulkEntry';

// ─── Template generation ──────────────────────────────────────────────────────

export function downloadTemplate() {
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Account', 'Category', 'To Account'];
  const sample = [
    ['2026-04-01', 'Supermarket', '120.50', 'expense', 'Cash', 'Groceries', ''],
    ['2026-04-02', 'Salary April', '8000.00', 'income', 'Bank Account', '', ''],
    ['2026-04-03', 'Rent payment', '2500.00', 'transfer_out', 'Bank Account', '', 'Cash'],
    ['2026-04-04', 'ATM withdrawal', '500.00', 'transfer_in', 'Cash', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 14 },
    { wch: 18 }, { wch: 16 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, 'fynbee_bulk_entry_template.xlsx');
}

// ─── Column detection ─────────────────────────────────────────────────────────

const DATE_ALIASES = ['date', 'transaction date', 'trans date', 'txn date', 'value date', 'booking date', 'posted date'];
const DESC_ALIASES = ['description', 'narration', 'details', 'merchant', 'remarks', 'particulars', 'transaction details', 'memo', 'reference', 'narrative'];
const AMOUNT_ALIASES = ['amount', 'transaction amount', 'txn amount'];
const DEBIT_ALIASES = ['debit', 'dr', 'withdrawal', 'debit amount', 'withdrawals', 'debit(dr)'];
const CREDIT_ALIASES = ['credit', 'cr', 'deposit', 'credit amount', 'deposits', 'credit(cr)'];
const TYPE_ALIASES = ['type', 'transaction type', 'txn type'];
const CATEGORY_ALIASES = ['category', 'cat', 'expense category'];
const ACCOUNT_ALIASES = ['account', 'account name'];
const TO_ACCOUNT_ALIASES = ['to account', 'to_account', 'destination account', 'transfer to'];

function matchCol(headers, aliases) {
  const normalized = headers.map(h => String(h ?? '').trim().toLowerCase());
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  // partial match fallback
  for (const alias of aliases) {
    const idx = normalized.findIndex(h => h.includes(alias) || alias.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function detectColumns(headers) {
  return {
    date: matchCol(headers, DATE_ALIASES),
    description: matchCol(headers, DESC_ALIASES),
    amount: matchCol(headers, AMOUNT_ALIASES),
    debit: matchCol(headers, DEBIT_ALIASES),
    credit: matchCol(headers, CREDIT_ALIASES),
    type: matchCol(headers, TYPE_ALIASES),
    category: matchCol(headers, CATEGORY_ALIASES),
    account: matchCol(headers, ACCOUNT_ALIASES),
    toAccount: matchCol(headers, TO_ACCOUNT_ALIASES),
  };
}

// ─── Date normalisation ───────────────────────────────────────────────────────

function parseDate(val) {
  if (!val) return new Date().toISOString().slice(0, 10);

  // Excel serial date number
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const mm = String(d.m).padStart(2, '0');
      const dd = String(d.d).padStart(2, '0');
      return `${d.y}-${mm}-${dd}`;
    }
  }

  const s = String(val).trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try native Date parse as last resort
  const parsed = new Date(s);
  if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

// ─── Amount normalisation ─────────────────────────────────────────────────────

function parseAmount(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

// ─── Type mapping for FynBee template ────────────────────────────────────────

const TYPE_MAP = {
  expense: 'expense', expenses: 'expense',
  income: 'income',
  transfer_in: 'transfer_in', 'transfer in': 'transfer_in', transferin: 'transfer_in',
  transfer_out: 'transfer_out', 'transfer out': 'transfer_out', transferout: 'transfer_out',
};

function normalizeType(val) {
  if (!val) return null;
  return TYPE_MAP[String(val).trim().toLowerCase()] ?? null;
}

// ─── Main parse function ──────────────────────────────────────────────────────

/**
 * Parse an uploaded File (XLSX or CSV) into bulk entry rows.
 * Returns { rows, headers, columnMap, warnings }
 */
export async function parseImportFile(file, existingAccounts, existingCategories) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (raw.length < 2) {
    throw new Error('File appears to be empty or has only a header row.');
  }

  const headers = raw[0].map(h => String(h ?? '').trim());
  const dataRows = raw.slice(1).filter(r => r.some(cell => cell !== '' && cell !== null));
  const colMap = detectColumns(headers);
  const warnings = [];

  if (colMap.date === -1) warnings.push('Could not detect a Date column — today\'s date will be used.');
  if (colMap.description === -1) warnings.push('Could not detect a Description column.');
  if (colMap.amount === -1 && colMap.debit === -1 && colMap.credit === -1) {
    throw new Error('Could not detect an Amount, Debit, or Credit column. Please use the FynBee template.');
  }

  const isFynBeeTemplate = colMap.type !== -1;

  const rows = dataRows.map(raw => {
    const r = newRow();

    // Date
    r.date = parseDate(colMap.date !== -1 ? raw[colMap.date] : null);

    // Description
    r.description = colMap.description !== -1 ? String(raw[colMap.description] ?? '').trim() : '';

    // Amount & Type
    if (isFynBeeTemplate) {
      // ── FynBee template format ──
      const rawAmt = parseAmount(colMap.amount !== -1 ? raw[colMap.amount] : null);
      r.amount = rawAmt !== null ? Math.abs(rawAmt).toFixed(2) : '';

      const mappedType = normalizeType(colMap.type !== -1 ? raw[colMap.type] : null);
      r.type = mappedType ?? 'expense';

      // Category
      if (colMap.category !== -1 && raw[colMap.category]) {
        const catName = String(raw[colMap.category]).trim();
        const matched = existingCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (matched) r.category_id = String(matched.id);
        else if (catName) r.category_new = catName;
      }

      // To Account (transfer_out)
      if (colMap.toAccount !== -1 && raw[colMap.toAccount]) {
        const toName = String(raw[colMap.toAccount]).trim();
        const matched = existingAccounts.find(a => a.name.toLowerCase() === toName.toLowerCase());
        if (matched) r.to_account_id = String(matched.id);
        else if (toName) r.to_account_new = { name: toName, type: 'cash', currency: 'AED' };
      }

      // Account
      if (colMap.account !== -1 && raw[colMap.account]) {
        const accName = String(raw[colMap.account]).trim();
        const matched = existingAccounts.find(a => a.name.toLowerCase() === accName.toLowerCase());
        if (matched) r.account_id = String(matched.id);
        else if (accName) r.account_new = { name: accName, type: 'cash', currency: 'AED' };
      }

    } else {
      // ── Bank statement format ──
      const debit = parseAmount(colMap.debit !== -1 ? raw[colMap.debit] : null);
      const credit = parseAmount(colMap.credit !== -1 ? raw[colMap.credit] : null);
      const amount = parseAmount(colMap.amount !== -1 ? raw[colMap.amount] : null);

      const hasDebit = debit !== null && debit > 0;
      const hasCredit = credit !== null && credit > 0;

      if (hasDebit && !hasCredit) {
        r.type = 'expense';
        r.amount = Math.abs(debit).toFixed(2);
      } else if (hasCredit && !hasDebit) {
        r.type = 'income';
        r.amount = Math.abs(credit).toFixed(2);
      } else if (amount !== null) {
        r.type = amount < 0 ? 'expense' : 'income';
        r.amount = Math.abs(amount).toFixed(2);
      }
    }

    return r;
  }).filter(r => r.amount && parseFloat(r.amount) > 0);

  return { rows, headers, columnMap: colMap, warnings, isFynBeeTemplate };
}
