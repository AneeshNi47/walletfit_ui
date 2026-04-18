import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout>
      <Helmet>
        <title>Sign in — Fynbee</title>
      </Helmet>

      <Eyebrow>Welcome back</Eyebrow>
      <h1 className="font-serif font-normal text-[32px] leading-tight text-text-strong mt-2 mb-6">
        Good to see you <span className="italic text-accent-deep">again</span>.
      </h1>

      {error && (
        <div
          role="alert"
          className="bg-[rgba(196,122,90,0.12)] border border-[rgba(196,122,90,0.3)] text-clay text-[12.5px] px-3 py-2 rounded-md mb-4"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-ui uppercase text-[10px] tracking-[0.12em] text-text-dim mb-1.5">
            Email or username
          </label>
          <input
            type="text"
            className="w-full px-4 py-3.5 bg-surface border border-border-soft rounded-md text-[14px] font-sans text-text-main placeholder:text-text-dim focus:outline-none focus:border-border-mid focus-ring"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="you@example.com"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-ui uppercase text-[10px] tracking-[0.12em] text-text-dim">
              Password
            </label>
            <a href="#forgot" className="text-[12px] text-accent-deep hover:text-accent">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3.5 pr-12 bg-surface border border-border-soft rounded-md text-[14px] font-sans text-text-main placeholder:text-text-dim focus:outline-none focus:border-border-mid focus-ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-strong p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="flex items-center my-6 gap-3">
        <div className="flex-1 border-t border-border-soft" />
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-text-dim">or</span>
        <div className="flex-1 border-t border-border-soft" />
      </div>

      <p className="text-center font-sans text-[13px] text-text-muted">
        New to Fynbee?{' '}
        <Link to="/register" className="italic text-accent-deep hover:text-accent">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
