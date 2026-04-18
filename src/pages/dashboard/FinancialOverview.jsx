import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardEyebrow, CardTitle } from '../../components/ui/Card';

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
        setIncome(parseFloat(incomeRes.data?.total_income || incomeRes.data?.total || 0));

        const ed = expenseRes.data;
        if (Array.isArray(ed) && ed.length > 0) {
          setExpenses(parseFloat(ed[ed.length - 1]?.total || 0));
        } else if (ed && typeof ed === 'object') {
          setExpenses(parseFloat(ed.total_expenses || ed.total || 0));
        }
      } catch (err) {
        console.error('Failed to fetch financial overview:', err);
        setError('Failed to load financial data.');
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    if (auth?.access) fetchData();
  }, [auth, logout]);

  const net = income - expenses;
  const total = Math.max(income + expenses, 1);
  const incomePct = (income / total) * 100;

  const month = new Date()
    .toLocaleString('en-US', { month: 'long' })
    .toUpperCase();

  return (
    <Card>
      <CardEyebrow>{month} in a glance</CardEyebrow>
      <CardTitle className="mt-2 mb-5">Income vs expenses</CardTitle>

      {loading ? (
        <div className="space-y-3">
          <div className="h-6 bg-surface-2 rounded animate-pulse" />
          <div className="h-6 bg-surface-2 rounded animate-pulse" />
          <div className="h-2 bg-surface-2 rounded-pill animate-pulse" />
        </div>
      ) : error ? (
        <div className="text-[13px] text-clay">{error}</div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-pill bg-emerald" />
                <span className="font-ui uppercase text-[10px] tracking-[0.12em] text-text-muted">
                  Income
                </span>
              </div>
              <span className="font-serif font-normal text-[20px] tnum text-emerald">
                +{income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-pill bg-clay" />
                <span className="font-ui uppercase text-[10px] tracking-[0.12em] text-text-muted">
                  Expenses
                </span>
              </div>
              <span className="font-serif font-normal text-[20px] tnum text-clay">
                -{expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Gradient split bar */}
          <div className="mt-5 h-2 bg-surface-2 rounded-pill overflow-hidden flex">
            <div
              style={{
                width: `${incomePct}%`,
                background:
                  'linear-gradient(90deg, var(--emerald), var(--sage))',
              }}
            />
            <div
              style={{
                flex: 1,
                background:
                  'linear-gradient(90deg, var(--clay), #a8573d)',
              }}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-border-soft flex items-center justify-between">
            <span className="font-ui uppercase text-[10px] tracking-[0.18em] text-text-dim">
              Net this month
            </span>
            <span
              className={`font-serif italic text-[26px] tnum ${
                net >= 0 ? 'text-emerald' : 'text-clay'
              }`}
            >
              {net >= 0 ? '+' : ''}
              {net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
