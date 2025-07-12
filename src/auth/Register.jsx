import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
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
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name in form.profile) {
      setForm((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => {
        const updatedForm = { ...prev, [name]: value };
        
        // Auto-generate household name when first name is entered
        if (name === 'first_name' && value.trim() && !prev.household_name) {
          const householdName = `${value.trim()}'s Household`;
          updatedForm.household_name = householdName;
        }
        
        return updatedForm;
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
      const { access, refresh, username, email } = res.data;

      login(null, null, {
        access,
        refresh,
        user: { username, email },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      
      // Handle field-specific validation errors
      if (err?.response?.data && typeof err.response.data === 'object') {
        const backendErrors = err.response.data;
        const newFieldErrors = {};
        
        // Map backend field names to form field names
        Object.keys(backendErrors).forEach(key => {
          let fieldName = key;
          
          // Handle nested profile fields
          if (key.startsWith('profile.')) {
            fieldName = key.replace('profile.', '');
          }
          
          // Handle special cases
          if (key === 'household_name') {
            fieldName = 'household_name';
          }
          
          newFieldErrors[fieldName] = Array.isArray(backendErrors[key]) 
            ? backendErrors[key][0] 
            : backendErrors[key];
        });
        
        setFieldErrors(newFieldErrors);
        
        // Set general error message if no specific field errors
        if (Object.keys(newFieldErrors).length === 0) {
          setError('Registration failed. Please check your inputs.');
        }
      } else {
        // Fallback for network errors or other issues
        const message = err?.response?.data?.message || 'Registration failed. Please check your inputs.';
        setError(message);
      }
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
          <div className="col-span-2">
            <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required className={`p-3 border rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.username && <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>}
          </div>
          
          <div className="col-span-2">
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={`p-3 border rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>
          
          <div className="col-span-2">
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className={`p-3 border rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>
          
          <div>
            <input name="first_name" type="text" placeholder="First Name" value={form.first_name} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.first_name && <p className="text-red-500 text-sm mt-1">{fieldErrors.first_name}</p>}
          </div>
          
          <div>
            <input name="last_name" type="text" placeholder="Last Name" value={form.last_name} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.last_name && <p className="text-red-500 text-sm mt-1">{fieldErrors.last_name}</p>}
          </div>
          
                      <div className="col-span-2">
              <div className="relative group">
                <input name="household_name" type="text" placeholder="Household Name" value={form.household_name} onChange={handleChange} className={`p-3 pr-10 border rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.household_name ? 'border-red-500' : 'border-gray-300'}`} />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <p className="text-gray-300">A household name helps you organize your finances with family members or roommates. You can create shared accounts and track expenses together.</p>
                    <div className="absolute top-0 right-4 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </div>
              {fieldErrors.household_name && <p className="text-red-500 text-sm mt-1">{fieldErrors.household_name}</p>}
            </div>
          
          <div>
            <input name="phone_number" type="text" placeholder="Phone Number" value={form.profile.phone_number} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.phone_number ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.phone_number && <p className="text-red-500 text-sm mt-1">{fieldErrors.phone_number}</p>}
          </div>
          
          <div>
            <input name="address" type="text" placeholder="Address" value={form.profile.address} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`} />
            {fieldErrors.address && <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>}
          </div>
          
          <div>
            <select name="gender" value={form.profile.gender} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.gender ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            {fieldErrors.gender && <p className="text-red-500 text-sm mt-1">{fieldErrors.gender}</p>}
          </div>
          
          <div>
            <select name="currency" value={form.profile.currency} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.currency ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="AED">AED</option>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
            {fieldErrors.currency && <p className="text-red-500 text-sm mt-1">{fieldErrors.currency}</p>}
          </div>
          
          <div className="col-span-2">
            <select name="theme" value={form.profile.theme} onChange={handleChange} className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full ${fieldErrors.theme ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
            {fieldErrors.theme && <p className="text-red-500 text-sm mt-1">{fieldErrors.theme}</p>}
          </div>

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
