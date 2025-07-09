import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white/80 backdrop-blur shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2">
          <span role="img" aria-label="Wallet">💰</span> WalletFit
        </h1>
        <nav className="hidden md:flex gap-8 text-base font-medium">
          <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
          <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
        </nav>
        <div className="hidden md:flex gap-2">
          <Link to="/login" className="text-base px-5 py-2 border border-blue-600 rounded text-blue-600 hover:bg-blue-50 transition">Login</Link>
          <Link to="/register" className="text-base px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Sign Up</Link>
        </div>
        {/* Mobile Hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Open menu">
          <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow px-4 pb-4 animate-fade-in">
          <nav className="flex flex-col gap-3 mt-2">
            <a href="#home" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>Pricing</a>
            <a href="#about" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>About Us</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>Contact</a>
            <Link to="/login" className="text-base px-5 py-2 border border-blue-600 rounded text-blue-600 hover:bg-blue-50 transition" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" className="text-base px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => setOpen(false)}>Sign Up</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
