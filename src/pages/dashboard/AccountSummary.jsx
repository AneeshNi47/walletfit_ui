// src/components/AccountSummary.jsx
import { useEffect, useState } from 'react';
import axios from '../../api/axios'; // Import axios
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Remove 'accounts' from props, as it will now fetch them internally
export default function AccountSummary({ currency }) {
  const { auth } = useAuth(); // Get auth context
  const [accounts, setAccounts] = useState([]); // State to hold fetched accounts
  const [loadingAccounts, setLoadingAccounts] = useState(true); // Loading state for accounts
  const [error, setError] = useState(''); // Error state for fetching accounts

  const [totalBalance, setTotalBalance] = useState(0);

  // useEffect to fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      setError(''); // Clear previous errors
      try {
        // Assuming your /api/accounts/ endpoint returns accounts for the authenticated user
        const response = await axios.get('/accounts/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setAccounts(response.data);
      } catch (err) {
        console.error('Failed to fetch accounts for summary:', err);
        setError('Failed to load accounts. Please try again.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (auth?.access) { // Only fetch if authenticated
      fetchAccounts();
    }
  }, [auth]); // Re-fetch accounts if auth token changes

  // useEffect to calculate total balance (depends on locally fetched accounts)
  useEffect(() => {
    const total = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    setTotalBalance(total);
  }, [accounts]); // Recalculate whenever accounts state changes

  if (loadingAccounts) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-4 rounded-lg shadow-md text-center">
        Loading Accounts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-md text-center">
        Error: {error}
      </div>
    );
  }

  if (!accounts.length && !loadingAccounts) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-4 rounded-lg shadow-md text-center">
        <h2 className="text-lg font-semibold">No Accounts Added Yet</h2>
        <p className="text-sm mt-2">Add your first account to see your balance.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Total Balance</h2>
      <p className="text-3xl font-bold mt-2">{totalBalance.toFixed(2)} {currency}</p>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white text-blue-700 rounded-lg p-3 shadow-sm">
            <p className="text-sm font-semibold">{acc.name}</p>
            {/* Make sure acc.balance is parsed to a float before toFixed() */}
            <p className="text-lg font-bold">{parseFloat(acc.balance).toFixed(2)} {currency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}