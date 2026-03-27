import React from 'react';

export default function WelcomeHeader({ user }) {
  return (
    <div className="p-4 bg-brand-cream rounded shadow text-center">
      <h1 className="text-2xl font-bold text-brand-forest">Hi, {user.first_name || user.username} 👋</h1>
      <p className="text-sm text-gray-600">Welcome to FynBee – Manage your money smarter!</p>
    </div>
  );
}
