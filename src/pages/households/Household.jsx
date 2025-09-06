import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function CreateHouseholdForm({ onSuccess, onCancel }) {
  const { auth } = useAuth();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingHousehold, setCheckingHousehold] = useState(true);
  const [alreadyInHousehold, setAlreadyInHousehold] = useState(false);
  const [household, setHousehold] = useState(null); // ✅ NEW

  // ✅ Check if user is already in a household
  useEffect(() => {
    const checkHousehold = async () => {
      try {
        const res = await axios.get('/users/households/view/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });

        if (res.data.household) {
          setAlreadyInHousehold(true);
          setHousehold(res.data.household); // ✅ Save household
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      } finally {
        setCheckingHousehold(false);
      }
    };

    checkHousehold();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Household name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(
        '/users/households/create/',
        { name },
        {
          headers: {
            Authorization: `Bearer ${auth?.access}`,
          },
        }
      );
      onSuccess(); // Refresh or navigate
    } catch (err) {
      console.error('Create household failed:', err);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.household ||
        'Failed to create household.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingHousehold) return <p className="p-6 text-lg">Checking household status...</p>;

  if (alreadyInHousehold && household) {
    return (
      <>
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">🏠 Household: {household.name}</h2>
          <p className="text-sm text-gray-600 mb-4">
            Created on {new Date(household.created_at).toLocaleString()}
          </p>
          <p className="font-medium text-gray-800">👑 Owner: {household.owner.username} ({household.owner.email})</p>
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-1">👥 Members:</h3>
            <ul className="list-disc list-inside">
              {household.members.map((member) => (
                <li key={member.id}>
                  {member.first_name} {member.last_name} ({member.username}) - {member.role}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          name="name"
          placeholder="Household Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </>
  );
}