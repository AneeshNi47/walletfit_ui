import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">💰 WalletFit</h1>
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#home" className="hover:text-blue-600">Home</a>
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#pricing" className="hover:text-blue-600">Pricing</a>
          <a href="#about" className="hover:text-blue-600">About Us</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>
        </nav>
        <div className="flex gap-2">
          <Link to="/login" className="text-sm px-4 py-1 border rounded text-blue-600 hover:bg-blue-50">Login</Link>
          <Link to="/register" className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
