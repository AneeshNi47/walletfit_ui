import React from 'react';

export default function WelcomeHeader({ user }) {
  return (
    <div className="p-4 bg-blue-50 rounded shadow text-center">
      <h1 className="text-2xl font-bold text-blue-800">Hi, {user.first_name || user.username} 👋</h1>
      <p className="text-sm text-gray-600">Welcome to WalletFit – Manage your money smarter!</p>
    </div>
  );
}
