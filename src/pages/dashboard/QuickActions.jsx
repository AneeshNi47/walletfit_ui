import { useNavigate } from 'react-router-dom';
// Import icons needed for new buttons if you want different ones
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

// Change prop names for clarity
export default function QuickActions({ onAddAccount, onAddExpense, onTopUp, onTransfer }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
        <button
          onClick={onAddAccount}
          className="flex flex-col items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded"
        >
          <span className="text-2xl">➕</span>
          Add Account
        </button>
        <button
          onClick={onAddExpense} // Use the new onAddExpense prop
          className="flex flex-col items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 p-4 rounded"
        >
          <ArrowUpIcon className="h-8 w-8" /> {/* Up arrow for expense */}
          Add Expense
        </button>
        <button
          onClick={onTopUp} // New Top Up button
          className="flex flex-col items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded"
        >
          <ArrowDownIcon className="h-8 w-8" /> {/* Down arrow for top-up */}
          Top Up
        </button>
        <button
          onClick={onTransfer} // New onTransfer prop to open modal
          className="flex flex-col items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-4 rounded"
        >
          <ArrowsRightLeftIcon className="h-8 w-8" /> {/* Two-sided arrow for transfer */}
          Transfer
        </button>
        <button
          onClick={() => navigate('/reports')} // This remains as navigation to a page
          className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded"
        >
          <DocumentTextIcon className="h-8 w-8" /> {/* Changed icon to doc icon */}
          View Report
        </button>
      </div>
    </div>
  );
}