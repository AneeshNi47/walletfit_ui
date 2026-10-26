import React from 'react';

export default function AccountOverview({ accounts, currency, onAdd }) {
  return (
    <div className="bg-surface p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-text-strong">💼 Accounts</h2>
        <button
          onClick={onAdd}
          className="bg-brand-emerald text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-brand-forest"
          title="Add Account"
        >
          +
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-text-muted text-sm">No accounts found. Add one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="border border-border-soft rounded p-3 shadow-sm bg-bg"
            >
              <h3 className="font-medium text-text-strong">{acc.name}</h3>
              <p className="text-xl font-bold text-brand-emerald">
                {acc.balance} {currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
