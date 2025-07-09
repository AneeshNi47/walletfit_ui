import { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function RecentTransactions({ currency }) {
  const { auth, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/accounts/recent_activity/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setActivities(response.data);
      } catch (err) {
        console.error('Failed to fetch recent activities:', err);
        setError('Failed to load recent activities.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (auth?.access) {
      fetchRecentActivities();
    }
  }, [auth, logout]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">📄 Recent Activities ({currency})</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">Error: {error}</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activities to show across your accounts.</p>
      ) : (
        <ul className="divide-y divide-gray-200 text-sm">
          {activities.map((activity) => (
            <li
              key={`${activity.type}-${activity.id}-${activity.created_at}`}
              className="py-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {/* Icon Logic based on activity.type */}
                {activity.type === 'top_up' || activity.type === 'transfer_in' ? (
                  <ArrowDownIcon className="h-5 w-5 text-green-500" />
                ) : activity.type === 'expense' ? (
                  <ArrowUpIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <ArrowsRightLeftIcon className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  {/* Main Description */}
                  <p className="font-medium">
                    {activity.description || activity.category_name}
                  </p>
                  {/* Sub-description with type and account info */}
                  <p className="text-xs text-gray-500 capitalize">
                    {activity.type.replace(/_/g, ' ')}
                    {activity.account_name && ` on ${activity.account_name}`}
                    {activity.type.includes('transfer') && activity.related_account_name && ` with ${activity.related_account_name}`}
                  </p>
                </div>
              </div>
              {/* Amount, Currency, and Created At Date/Time */}
              <div className="flex flex-col items-end">
                <span className={`font-bold ${
                  activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.amount > 0 ? '+' : ''}{parseFloat(activity.amount).toFixed(2)} {activity.currency}
                </span>
                {/* Display date and created_at */}
                <p className="text-xs text-gray-500">
                  {activity.date} {/* Transaction date */}
                  {activity.created_at && ` at ${new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}