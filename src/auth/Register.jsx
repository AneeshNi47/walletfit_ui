import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import AuthLayout from '../layouts/AuthLayout';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';

const INPUT_CLASS =
  'w-full px-4 py-3 bg-surface border rounded-md text-[14px] font-sans text-text-main placeholder:text-text-dim focus:outline-none focus:border-border-mid focus-ring';

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

const STRENGTH_LABEL = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['var(--clay)', 'var(--clay)', 'var(--gold)', 'var(--sage)', 'var(--emerald)'];

function Field({ label, name, value, onChange, error, type = 'text', placeholder, as = 'input', children, className = '' }) {
  const border = error ? 'border-clay' : 'border-border-soft';
  if (as === 'select') {
    return (
      <div className={className}>
        <label className="block font-ui uppercase text-[10px] tracking-[0.12em] text-text-dim mb-1.5">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${INPUT_CLASS} ${border}`}
        >
          {children}
        </select>
        {error && <p className="text-clay text-[12px] mt-1">{error}</p>}
      </div>
    );
  }
  return (
    <div className={className}>
      <label className="block font-ui uppercase text-[10px] tracking-[0.12em] text-text-dim mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${INPUT_CLASS} ${border}`}
      />
      {error && <p className="text-clay text-[12px] mt-1">{error}</p>}
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    household_name: '',
    profile: {
      phone_number: '',
      gender: '',
      address: '',
      currency: 'AED',
      theme: 'light',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: '' }));

    if (name in form.profile) {
      setForm((p) => ({ ...p, profile: { ...p.profile, [name]: value } }));
    } else {
      setForm((p) => {
        const updated = { ...p, [name]: value };
        if (name === 'first_name' && value.trim() && !p.household_name) {
          updated.household_name = `${value.trim()}'s household`;
        }
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const res = await axios.post('/users/register/', form);
      const { access, refresh, username, email, id } = res.data;
      login(null, null, { access, refresh, user: { id, username, email } });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err?.response?.data && typeof err.response.data === 'object') {
        const errs = err.response.data;
        const mapped = {};
        Object.keys(errs).forEach((k) => {
          const key = k.startsWith('profile.') ? k.replace('profile.', '') : k;
          mapped[key] = Array.isArray(errs[k]) ? errs[k][0] : errs[k];
        });
        setFieldErrors(mapped);
        if (Object.keys(mapped).length === 0) setError('Registration failed.');
      } else {
        setError(err?.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Create account — Fynbee</title>
      </Helmet>

      <Eyebrow>Get started</Eyebrow>
      <h1 className="font-serif font-normal text-[32px] leading-tight text-text-strong mt-2 mb-6">
        Start your <span className="italic text-accent-deep">hive</span>.
      </h1>

      {error && (
        <div className="bg-[rgba(196,122,90,0.12)] border border-[rgba(196,122,90,0.3)] text-clay text-[12.5px] px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" name="first_name" value={form.first_name} onChange={handleChange} error={fieldErrors.first_name} placeholder="Aisha" />
          <Field label="Last name" name="last_name" value={form.last_name} onChange={handleChange} error={fieldErrors.last_name} placeholder="Khan" />
        </div>
        <Field label="Username" name="username" value={form.username} onChange={handleChange} error={fieldErrors.username} placeholder="aisha" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={fieldErrors.email} placeholder="you@example.com" />

        <div>
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={fieldErrors.password} placeholder="••••••••" />
          {form.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-pill transition-colors"
                    style={{
                      background: i < strength ? STRENGTH_COLOR[strength] : 'var(--surface-2)',
                    }}
                  />
                ))}
              </div>
              <div
                className="font-ui text-[10px] uppercase tracking-[0.12em]"
                style={{ color: STRENGTH_COLOR[strength] }}
              >
                {STRENGTH_LABEL[strength]}
              </div>
            </div>
          )}
        </div>

        <Field label="Household name" name="household_name" value={form.household_name} onChange={handleChange} error={fieldErrors.household_name} placeholder="The Khan hive" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Currency" name="currency" as="select" value={form.profile.currency} onChange={handleChange} error={fieldErrors.currency}>
            <option value="AED">AED</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </Field>
          <Field label="Gender" name="gender" as="select" value={form.profile.gender} onChange={handleChange} error={fieldErrors.gender}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Field>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-center font-sans text-[13px] text-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="italic text-accent-deep hover:text-accent">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
