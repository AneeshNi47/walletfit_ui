import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fieldClass } from '../ui/formStyles';
import { monthRange } from '../charts/FilterCharts';

export const SORT_OPTIONS = [
  { value: '-date', label: 'Newest first' },
  { value: 'date', label: 'Oldest first' },
  { value: '-amount', label: 'Highest amount' },
  { value: 'amount', label: 'Lowest amount' },
];

export const EMPTY_FILTERS = {
  search: '',
  ordering: '-date',
  group: '',        // category id (expenses) / source id (income)
  start_date: '',
  end_date: '',
  min_amount: '',
  max_amount: '',
  is_savings: false,
};

const compact = 'px-3 py-2 bg-surface border border-border-soft rounded-lg text-[13px] text-text-main ' +
  'placeholder:text-text-dim focus:outline-none focus:border-border-mid';

/** Query params for the list endpoint (empty values dropped). `groupParam` = 'category' | 'source'. */
export function filtersToParams(f, groupParam) {
  const p = { ordering: f.ordering };
  if (f.search.trim()) p.search = f.search.trim();
  if (f.group) p[groupParam] = f.group;
  if (f.start_date) p.start_date = f.start_date;
  if (f.end_date) p.end_date = f.end_date;
  if (f.min_amount !== '') p.min_amount = f.min_amount;
  if (f.max_amount !== '') p.max_amount = f.max_amount;
  if (f.is_savings) p.is_savings = true;
  return p;
}

/** The month key whose full range exactly matches the date filter (for highlighting the bar chart). */
export function monthKeyOf(f) {
  if (!f.start_date || !f.end_date || !f.start_date.endsWith('-01')) return null;
  const key = f.start_date.slice(0, 7);
  return monthRange(key).end_date === f.end_date ? key : null;
}

/** Removable chips for whatever filters are active. */
export function activeFilterChips(f, setF, { groupLabel, monthLabel }) {
  const clear = (patch) => () => setF((prev) => ({ ...prev, ...patch }));
  const month = monthKeyOf(f);
  const chips = [];
  if (f.search.trim()) chips.push({ label: `“${f.search.trim()}”`, onClear: clear({ search: '' }) });
  if (f.group) chips.push({ label: groupLabel || 'Selected', onClear: clear({ group: '' }) });
  if (month) {
    chips.push({ label: monthLabel || month, onClear: clear({ start_date: '', end_date: '' }) });
  } else {
    if (f.start_date) chips.push({ label: `From ${f.start_date}`, onClear: clear({ start_date: '' }) });
    if (f.end_date) chips.push({ label: `To ${f.end_date}`, onClear: clear({ end_date: '' }) });
  }
  if (f.min_amount !== '') chips.push({ label: `≥ ${f.min_amount}`, onClear: clear({ min_amount: '' }) });
  if (f.max_amount !== '') chips.push({ label: `≤ ${f.max_amount}`, onClear: clear({ max_amount: '' }) });
  if (f.is_savings) chips.push({ label: 'Savings only', onClear: clear({ is_savings: false }) });
  return chips;
}

/**
 * Search + sort + filters bar. `filters`/`setFilters` hold the full state; search is
 * debounced so the list isn't refetched on every keystroke.
 */
export default function ListToolbar({
  filters, setFilters, groupOptions = [], groupLabel = 'Category', showSavings = false, searchPlaceholder,
}) {
  const [searchText, setSearchText] = useState(filters.search);
  const [showMore, setShowMore] = useState(false);

  // keep the box in sync when the search is cleared from a chip
  useEffect(() => { setSearchText(filters.search); }, [filters.search]);

  useEffect(() => {
    if (searchText === filters.search) return undefined;
    const t = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchText })), 300);
    return () => clearTimeout(t);
  }, [searchText, filters.search, setFilters]);

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters((prev) => ({ ...prev, [key]: v }));
  };

  const advancedCount = [filters.start_date, filters.end_date, filters.min_amount, filters.max_amount]
    .filter((v) => v !== '').length + (filters.is_savings ? 1 : 0);

  return (
    <div className="bg-surface rounded-lg border border-border-soft shadow-sm p-3 space-y-3">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={searchPlaceholder || 'Search description…'}
            className={`${fieldClass} pl-9`}
            aria-label="Search"
          />
        </div>
        <select value={filters.group} onChange={set('group')} className={`${compact} md:w-56`} aria-label={groupLabel}>
          <option value="">All {groupLabel.toLowerCase()}s</option>
          {groupOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={filters.ordering} onChange={set('ordering')} className={`${compact} md:w-44`} aria-label="Sort">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className={`${compact} inline-flex items-center justify-center gap-2 hover:border-border-mid`}
          aria-expanded={showMore}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters{advancedCount ? ` (${advancedCount})` : ''}
        </button>
      </div>

      {showMore && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
          <label className="text-[11px] text-text-muted space-y-1">
            <span className="block">From date</span>
            <input type="date" value={filters.start_date} onChange={set('start_date')} className={`${compact} w-full`} />
          </label>
          <label className="text-[11px] text-text-muted space-y-1">
            <span className="block">To date</span>
            <input type="date" value={filters.end_date} onChange={set('end_date')} className={`${compact} w-full`} />
          </label>
          <label className="text-[11px] text-text-muted space-y-1">
            <span className="block">Min amount</span>
            <input type="number" min="0" step="0.01" value={filters.min_amount} onChange={set('min_amount')} className={`${compact} w-full`} />
          </label>
          <label className="text-[11px] text-text-muted space-y-1">
            <span className="block">Max amount</span>
            <input type="number" min="0" step="0.01" value={filters.max_amount} onChange={set('max_amount')} className={`${compact} w-full`} />
          </label>
          {showSavings && (
            <label className="flex items-center gap-2 text-[13px] text-text-main py-2 cursor-pointer select-none">
              <input type="checkbox" checked={filters.is_savings} onChange={set('is_savings')} className="w-4 h-4 accent-[var(--emerald)]" />
              Savings only
            </label>
          )}
        </div>
      )}
    </div>
  );
}
