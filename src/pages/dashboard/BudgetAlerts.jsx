import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function BudgetAlerts() {
  const { auth, logout } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noBudgets, setNoBudgets] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('budgets/summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data.length === 0) {
          setNoBudgets(true);
        } else {
          setBudgets(data);
        }
      } catch (err) {
        console.error('Failed to fetch budget summary:', err);
        if (err?.response?.status === 404) {
          setNoBudgets(true);
        } else {
          setError('Failed to load budgets.');
        }
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (auth?.access) {
      fetchBudgets();
    }
  }, [auth, logout]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Budget Alerts</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Budget Alerts</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (noBudgets) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Budget Alerts</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">Set up budgets to track spending</p>
          <Link
            to="/budgets"
            className="text-sm font-medium text-brand-emerald hover:text-brand-forest underline"
          >
            Go to Budgets
          </Link>
        </div>
      </div>
    );
  }

  const alerts = budgets.filter((b) => {
    const spent = parseFloat(b.spent || b.total_spent || 0);
    const limit = parseFloat(b.budget || b.limit || b.amount || 0);
    return limit > 0 && (spent / limit) >= 0.8;
  });

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Budget Alerts</h2>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 py-4 justify-center">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-700">All budgets on track</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((b, idx) => {
            const spent = parseFloat(b.spent || b.total_spent || 0);
            const limit = parseFloat(b.budget || b.limit || b.amount || 0);
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = pct >= 100;

            return (
              <li key={b.id || b.category || idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {b.category_name || b.category || 'Unknown'}
                  </span>
                  <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-yellow-600'}`}>
                    {spent.toFixed(2)} / {limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-yellow-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
