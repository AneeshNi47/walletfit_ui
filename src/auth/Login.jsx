import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <LockClosedIcon className="h-12 w-12 text-blue-600 mb-2 animate-bounce" />
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 tracking-tight">Sign in to WalletFit</h1>
          <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4 text-center w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 w-full">
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Username or Email</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin@example.com"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="w-full flex items-center my-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600 mb-2">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full mt-2 bg-gray-100 text-blue-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
