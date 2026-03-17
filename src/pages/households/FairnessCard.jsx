import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function FairnessCard() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  const headers = { Authorization: `Bearer ${auth?.access}` };

  useEffect(() => {
    fetchFairness();
  }, [period]);

  const fetchFairness = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/budgets/fairness/?period=${period}`, { headers });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch fairness:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Contribution Fairness</h3>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data || !data.members?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Contribution Fairness</h3>
        <p className="text-gray-500 text-sm">No data available for this period.</p>
      </div>
    );
  }

  const hasIncome = data.total_household_income > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-700">Contribution Fairness</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      </div>

      {!hasIncome && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-700 text-sm">
            No income recorded this period. Showing equal split. Add income entries for proportional fairness.
          </p>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Total Income</p>
          <p className="text-lg font-bold text-green-700">
            {data.total_household_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-600 font-medium">Total Expenses</p>
          <p className="text-lg font-bold text-red-700">
            {data.total_household_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Member Breakdown */}
      <div className="space-y-3">
        {data.members.map((member) => {
          const barWidth = data.total_household_expenses > 0
            ? Math.min((member.actual_spent / data.total_household_expenses) * 100, 100)
            : 0;
          const fairBarWidth = data.total_household_expenses > 0
            ? Math.min((member.fair_share / data.total_household_expenses) * 100, 100)
            : 0;

          return (
            <div key={member.user_id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{member.username}</p>
                    <p className="text-xs text-gray-500">
                      Income: {member.income.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({member.income_share_pct}%)
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  member.status === 'overpaying'
                    ? 'bg-green-100 text-green-700'
                    : member.status === 'underpaying'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {member.status === 'overpaying'
                    ? `+${member.difference.toLocaleString('en-US', { minimumFractionDigits: 2 })} over`
                    : member.status === 'underpaying'
                    ? `${member.difference.toLocaleString('en-US', { minimumFractionDigits: 2 })} under`
                    : 'Fair'}
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>Actual: {member.actual_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        member.status === 'overpaying' ? 'bg-green-500' : member.status === 'underpaying' ? 'bg-red-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>Fair share: {member.fair_share.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-300"
                      style={{ width: `${fairBarWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
