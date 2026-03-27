import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function UpcomingBills() {
  const { auth, logout } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noRecurring, setNoRecurring] = useState(false);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('recurring/upcoming/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data.length === 0) {
          setNoRecurring(true);
        } else {
          setBills(data);
        }
      } catch (err) {
        console.error('Failed to fetch upcoming bills:', err);
        if (err?.response?.status === 404) {
          setNoRecurring(true);
        } else {
          setError('Failed to load upcoming bills.');
        }
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (auth?.access) {
      fetchUpcoming();
    }
  }, [auth, logout]);

  const formatDueDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Bills</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Bills</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (noRecurring) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Bills</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">Track recurring bills</p>
          <Link
            to="/recurring"
            className="text-sm font-medium text-brand-emerald hover:text-brand-forest underline"
          >
            Set Up Recurring
          </Link>
        </div>
      </div>
    );
  }

  // Filter to next 7 days
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);

  const upcoming = bills.filter((bill) => {
    const due = new Date(bill.next_due_date || bill.due_date || bill.date);
    return due >= now && due <= weekFromNow;
  });

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Bills</h2>
      {upcoming.length === 0 ? (
        <div className="flex items-center gap-2 py-4 justify-center">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-600">No bills due this week</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((bill, idx) => {
            const isExpense = (bill.type || bill.transaction_type || '').toLowerCase() === 'expense';
            const amount = parseFloat(bill.amount || 0);
            const dueDate = bill.next_due_date || bill.due_date || bill.date;

            return (
              <li
                key={bill.id || idx}
                className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isExpense ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {bill.name || bill.description || 'Unnamed'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDueDate(dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpense ? '-' : '+'}{amount.toFixed(2)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isExpense
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {isExpense ? 'Expense' : 'Income'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
