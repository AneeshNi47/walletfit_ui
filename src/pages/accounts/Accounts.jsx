import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AddAccountForm from './AddAccountForm';
import Navbar from '../../components/Navbar';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('wallet/accounts/'); // Adjust endpoint if needed
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async (newAccount) => {
    try {
      await axios.post('wallet/accounts/', newAccount);
      fetchAccounts(); // Refresh list
    } catch (err) {
      console.error('Failed to add account:', err);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📊 Your Accounts</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-full"
          title="Add Account"
        >
          +
        </button>
      </div>

      {loading ? (
        <p>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500">No accounts found. Add your first account.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white shadow rounded p-4 border border-gray-100"
            >
              <h2 className="text-lg font-semibold">{acc.name}</h2>
              <p className="text-sm text-gray-600">Type: {acc.type}</p>
              <p className="text-sm text-gray-600">Currency: {acc.currency}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddAccountForm onClose={() => setShowForm(false)} onSave={handleSave} />
      )}
    </div>
    </>
  );
}
