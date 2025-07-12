import React from 'react';

const APP_VERSION = '1.0.0'; // Keep in sync with package.json

export default function Footer() {
  return (
    <footer className="w-full py-4 bg-gray-100 text-center text-gray-500 text-sm mt-8 border-t">
      <span>WalletFit &copy; {new Date().getFullYear()} &mdash; v{APP_VERSION}</span>
    </footer>
  );
} 