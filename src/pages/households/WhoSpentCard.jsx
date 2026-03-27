import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function WhoSpentCard() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  const headers = { Authorization: `Bearer ${auth?.access}` };

  useEffect(() => {
    fetchWhoSpent();
  }, [period]);

  const fetchWhoSpent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/budgets/whospent/?period=${period}`, { headers });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch who spent:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Who Spent What</h3>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data || !data.members?.length || data.total_household_expenses === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Who Spent What</h3>
        <p className="text-gray-500 text-sm">No household expenses this period.</p>
      </div>
    );
  }

  const colors = ['bg-brand-emerald', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  const lightColors = ['bg-brand-warm text-brand-forest', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-700">Who Spent What</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border rounded text-sm bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      </div>

      {/* Total bar */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">
          Total: <span className="font-semibold text-gray-800">
            {data.total_household_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </p>
        <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden">
          {data.members.map((member, i) => (
            <div
              key={member.user_id}
              className={`h-4 ${colors[i % colors.length]} transition-all duration-300`}
              style={{ width: `${member.percentage}%` }}
              title={`${member.username}: ${member.percentage}%`}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {data.members.map((member, i) => (
            <div key={member.user_id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
              {member.username} ({member.percentage}%)
            </div>
          ))}
        </div>
      </div>

      {/* Per member details */}
      <div className="space-y-3">
        {data.members.map((member, i) => (
          <div key={member.user_id} className="border border-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-warm rounded-full flex items-center justify-center text-brand-forest font-bold text-xs">
                  {member.username[0].toUpperCase()}
                </div>
                <p className="font-medium text-gray-800 text-sm">{member.username}</p>
              </div>
              <p className="font-bold text-gray-800">
                {member.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Top categories */}
            {member.top_categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {member.top_categories.map((cat, j) => (
                  <span
                    key={j}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${lightColors[(i + j) % lightColors.length]}`}
                  >
                    {cat.category}: {cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
