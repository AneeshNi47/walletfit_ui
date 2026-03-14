import { useState } from 'react';

export default function Filters({ filters = {}, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState({
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
    amount_min: filters.amount_min || '',
    amount_max: filters.amount_max || '',
  });

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    if (onFilterChange) {
      onFilterChange(localFilters);
    }
  };

  const handleReset = () => {
    const cleared = { date_from: '', date_to: '', amount_min: '', amount_max: '' };
    setLocalFilters(cleared);
    if (onFilterChange) {
      onFilterChange(cleared);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="font-semibold text-blue-800">Filters</h3>
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={localFilters.date_from}
            onChange={(e) => handleChange('date_from', e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={localFilters.date_to}
            onChange={(e) => handleChange('date_to', e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
          <input
            type="number"
            value={localFilters.amount_min}
            onChange={(e) => handleChange('amount_min', e.target.value)}
            placeholder="0"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
          <input
            type="number"
            value={localFilters.amount_max}
            onChange={(e) => handleChange('amount_max', e.target.value)}
            placeholder="99999"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
