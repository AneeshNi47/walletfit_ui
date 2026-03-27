import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import TelegramConnect from './TelegramConnect';

export default function Profile() {
  const { auth } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('users/profile/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setProfileData(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.put('users/profile/', formData, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setProfileData(res.data);
      setFormData(res.data);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center text-xl">
          Loading Profile...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 min-h-[44px] bg-brand-emerald text-white text-sm rounded hover:bg-brand-forest transition w-full sm:w-auto"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="px-4 py-2 min-h-[44px] border border-gray-300 text-sm rounded text-gray-600 hover:bg-gray-50 transition flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 min-h-[44px] bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50 flex-1 sm:flex-none"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {message.text && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Personal Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={formData.username || ''}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                disabled={!editing}
                rows={2}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Preferences
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Theme</label>
              <select
                name="theme"
                value={formData.theme || 'light'}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded ${
                  editing ? 'bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Telegram Integration */}
        <TelegramConnect />
      </main>
    </>
  );
}
