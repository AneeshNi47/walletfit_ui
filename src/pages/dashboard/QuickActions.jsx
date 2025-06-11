import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onAddAccount, onAddTransaction }) {
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
          onClick={onAddTransaction}
          className="flex flex-col items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded"
        >
          <span className="text-2xl">➖</span>
          Add Transaction
        </button>
        <button
          onClick={() => navigate('/transfers')}
          className="flex flex-col items-center justify-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded"
        >
          <span className="text-2xl">📤</span>
          Transfer
        </button>
        <button
          onClick={() => navigate('/report')}
          className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded"
        >
          <span className="text-2xl">🧾</span>
          View Report
        </button>
      </div>
    </div>
  );
}
