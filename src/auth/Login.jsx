import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-brand-warm to-brand-cream px-4">
      <Helmet>
        <title>Login - FynBee</title>
        <meta name="description" content="Sign in to your FynBee account to manage your household finances, track expenses, and monitor budgets." />
      </Helmet>
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <AnimatedLogo size={72} showWordmark={false} theme="light" className="mb-2" />
          <h1 className="text-3xl font-extrabold mb-2 text-brand-forest tracking-tight">Sign in to FynBee</h1>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-emerald text-white py-3 rounded-lg font-semibold text-lg hover:bg-brand-forest transition shadow-md disabled:opacity-60"
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
          <Link to="/register" className="text-brand-emerald hover:underline font-medium">
            Register here
          </Link>
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full mt-2 bg-gray-100 text-brand-forest py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
