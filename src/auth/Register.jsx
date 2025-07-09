import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlusIcon } from '@heroicons/react/24/solid';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.profile) {
      setForm((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/users/register/', form);
      const { access, refresh, username, email } = res.data;

      login(null, null, {
        access,
        refresh,
        user: { username, email },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        'Registration failed. Please check your inputs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <UserPlusIcon className="h-12 w-12 text-blue-600 mb-2 animate-bounce" />
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 tracking-tight">Create Your WalletFit Account</h1>
          <p className="text-gray-500 text-sm">Join us and start managing your finances smarter.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4 text-center w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4 w-full">
          <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required className="p-3 border border-gray-300 rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-3 border border-gray-300 rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-3 border border-gray-300 rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="first_name" type="text" placeholder="First Name" value={form.first_name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="last_name" type="text" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="household_name" type="text" placeholder="Household Name (Optional)" value={form.household_name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="phone_number" type="text" placeholder="Phone Number" value={form.profile.phone_number} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input name="address" type="text" placeholder="Address" value={form.profile.address} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <select name="gender" value={form.profile.gender} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
            <option value="">Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <select name="currency" value={form.profile.currency} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
            <option value="AED">AED</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <select name="theme" value={form.profile.theme} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition shadow-md disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="w-full flex items-center my-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>
        <p className="text-center text-sm text-gray-600 mb-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
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
