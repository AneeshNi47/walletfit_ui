import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function FinancialOverview() {
  const { auth, logout } = useAuth();
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          axios.get('income/summary/', {
            headers: { Authorization: `Bearer ${auth?.access}` },
          }),
          axios.get('expenses/monthly-summary/', {
            headers: { Authorization: `Bearer ${auth?.access}` },
          }),
        ]);

        const totalIncome = parseFloat(incomeRes.data?.total_income || incomeRes.data?.total || 0);
        setIncome(totalIncome);

        const expenseData = expenseRes.data;
        if (Array.isArray(expenseData) && expenseData.length > 0) {
          const latest = expenseData[expenseData.length - 1];
          setExpenses(parseFloat(latest.total || 0));
        } else if (typeof expenseData === 'object' && !Array.isArray(expenseData)) {
          setExpenses(parseFloat(expenseData.total_expenses || expenseData.total || 0));
        }
      } catch (err) {
        console.error('Failed to fetch financial overview:', err);
        setError('Failed to load financial data.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (auth?.access) {
      fetchData();
    }
  }, [auth, logout]);

  const net = income - expenses;

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-5 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading financial overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">This Month</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Income</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-green-600">+{income.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Expenses</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-red-600">-{expenses.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Net</span>
            <span className={`text-lg sm:text-xl font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {net >= 0 ? '+' : ''}{net.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
