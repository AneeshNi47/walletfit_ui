import { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function RecentTransactions({ currency }) {
  const { auth, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await axios.get('expenses/recent/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setTransactions(response.data);
      } catch (err) {
        console.error('Failed to fetch recent expenses:', err);
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [auth]);

  const recent = transactions;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">📄 Recent Transactions</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : recent.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions to show.</p>
      ) : (
        <ul className="divide-y divide-gray-200 text-sm">
          {recent.map((tx) => (
            <li key={tx.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tx.type === 'income' ? (
                  <ArrowDownIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.type}</p>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount} {currency}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
