import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
];

// Fade every element except the selected one (hex colour + alpha suffix).
const dim = (color, isSelected, anySelected) =>
  !anySelected || isSelected ? color : `${color}40`;

const pointerOnHover = (event, elements) => {
  if (event?.native?.target) {
    event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
  }
};

/**
 * Monthly bar chart + breakdown doughnut. Clicking a bar / slice reports it to the
 * parent so it can filter the list underneath; clicking the selected one again clears it.
 *
 * monthly: [{ key: 'YYYY-MM', month: 'Oct 2026', total }]
 * slices:  [{ id, label, total }]   (id null = not filterable, e.g. "Uncategorized")
 */
export default function FilterCharts({
  monthly = [],
  slices = [],
  barColor = '#ef4444',
  barTitle,
  sliceTitle,
  selectedMonth,
  selectedSlice,
  onSelectMonth,
  onSelectSlice,
}) {
  if (monthly.length === 0 && slices.length === 0) return null;

  const topSlices = slices.slice(0, 10);

  const barData = {
    labels: monthly.map((m) => m.month),
    datasets: [{
      label: barTitle,
      data: monthly.map((m) => Number(m.total)),
      backgroundColor: monthly.map((m) => dim(barColor, m.key === selectedMonth, !!selectedMonth)),
      borderRadius: 4,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 11 } } },
      x: { ticks: { font: { size: 11 } } },
    },
    onHover: pointerOnHover,
    onClick: (_evt, elements) => {
      if (!elements.length || !onSelectMonth) return;
      const m = monthly[elements[0].index];
      onSelectMonth(m.key === selectedMonth ? null : m.key);
    },
  };

  const doughnutData = {
    labels: topSlices.map((s) => s.label),
    datasets: [{
      data: topSlices.map((s) => Number(s.total)),
      backgroundColor: topSlices.map((s, i) =>
        dim(PALETTE[i % PALETTE.length], s.id === selectedSlice, selectedSlice != null)),
      borderWidth: 1,
    }],
  };

  const selectSlice = (index) => {
    const s = topSlices[index];
    if (!s || s.id == null || !onSelectSlice) return;
    onSelectSlice(s.id === selectedSlice ? null : s.id);
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 11 }, boxWidth: 12 },
        // Legend click filters too (instead of Chart.js' default hide-slice toggle)
        onClick: (_e, item) => selectSlice(item.index),
      },
    },
    onHover: pointerOnHover,
    onClick: (_evt, elements) => {
      if (elements.length) selectSlice(elements[0].index);
    },
  };

  return (
    <div className={`grid grid-cols-1 gap-4 mb-2 ${monthly.length > 0 && topSlices.length > 0 ? 'md:grid-cols-2' : ''}`}>
      {monthly.length > 0 && (
        <div className="bg-surface rounded-lg border border-border-soft shadow-sm p-4">
          <h3 className="text-sm font-semibold text-text-main mb-1">{barTitle}</h3>
          <p className="text-[11px] text-text-dim mb-2">Click a month to filter the list</p>
          <Bar data={barData} options={barOptions} />
        </div>
      )}
      {topSlices.length > 0 && (
        <div className="bg-surface rounded-lg border border-border-soft shadow-sm p-4">
          <h3 className="text-sm font-semibold text-text-main mb-1">{sliceTitle}</h3>
          <p className="text-[11px] text-text-dim mb-2">Click a slice to filter the list</p>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      )}
    </div>
  );
}

/** "YYYY-MM" -> { start_date, end_date } (inclusive, ISO dates) */
export function monthRange(key) {
  const [y, m] = key.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, '0');
  return { start_date: `${key}-01`, end_date: `${y}-${mm}-${String(last).padStart(2, '0')}` };
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Removable chips describing the active chart filters. */
export function FilterChips({ chips, onClearAll }) {
  const active = chips.filter((c) => c.label);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-ui uppercase tracking-[0.12em] text-text-dim">Filtered by</span>
      {active.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-soft text-text-strong text-[12px] border border-border-soft hover:border-border-mid"
          title="Remove filter"
        >
          {c.label} <span className="text-text-muted">✕</span>
        </button>
      ))}
      {active.length > 1 && (
        <button type="button" onClick={onClearAll} className="text-[12px] text-accent-deep underline hover:text-accent">
          Clear all
        </button>
      )}
    </div>
  );
}

/** Three headline summary cards (same look as the Income tab). */
export function SummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface rounded-lg border border-border-soft shadow-sm p-4">
          <p className="text-sm text-text-muted">{c.label}</p>
          <p className={`text-xl font-bold ${c.tone || 'text-text-strong'} truncate`}>{c.value}</p>
          {c.sub && <p className="text-sm text-text-dim truncate">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}

export const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
