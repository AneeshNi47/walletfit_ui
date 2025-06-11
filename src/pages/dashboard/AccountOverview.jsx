import React from 'react';

export default function AccountOverview({ accounts, currency, onAdd }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">💼 Accounts</h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
          title="Add Account"
        >
          +
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-gray-500 text-sm">No accounts found. Add one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="border border-gray-200 rounded p-3 shadow-sm bg-gray-50"
            >
              <h3 className="font-medium text-gray-700">{acc.name}</h3>
              <p className="text-xl font-bold text-blue-600">
                {acc.balance} {currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
