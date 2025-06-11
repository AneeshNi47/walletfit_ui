import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required className="p-3 border rounded col-span-2" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-3 border rounded col-span-2" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-3 border rounded col-span-2" />
          <input name="first_name" type="text" placeholder="First Name" value={form.first_name} onChange={handleChange} className="p-3 border rounded" />
          <input name="last_name" type="text" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="p-3 border rounded" />
          <input name="household_name" type="text" placeholder="Household Name (Optional)" value={form.household_name} onChange={handleChange} className="p-3 border rounded col-span-2" />
          <input name="phone_number" type="text" placeholder="Phone Number" value={form.profile.phone_number} onChange={handleChange} className="p-3 border rounded" />
          <input name="address" type="text" placeholder="Address" value={form.profile.address} onChange={handleChange} className="p-3 border rounded" />
          <select name="gender" value={form.profile.gender} onChange={handleChange} className="p-3 border rounded">
            <option value="">Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <select name="currency" value={form.profile.currency} onChange={handleChange} className="p-3 border rounded">
            <option value="AED">AED</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <select name="theme" value={form.profile.theme} onChange={handleChange} className="p-3 border rounded">
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
