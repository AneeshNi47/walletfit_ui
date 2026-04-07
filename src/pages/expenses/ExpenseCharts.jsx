import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
];

export default function ExpenseCharts() {
  const { auth } = useAuth();
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.access) return;
    const headers = { Authorization: `Bearer ${auth.access}` };

    Promise.all([
      axios.get('expenses/monthly-summary/', { headers }),
      axios.get('expenses/category-summary/', { headers }),
    ]).then(([mRes, cRes]) => {
      setMonthly(mRes.data);
      setByCategory(cRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  if (loading) return <div className="h-48 flex items-center justify-center text-sm text-gray-400">Loading charts…</div>;
  if (monthly.length === 0 && byCategory.length === 0) return null;

  const barData = {
    labels: monthly.map(m => m.month),
    datasets: [{
      label: 'Expenses',
      data: monthly.map(m => m.total),
      backgroundColor: '#ef4444',
      borderRadius: 4,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 11 } } },
      x: { ticks: { font: { size: 11 } } },
    },
  };

  const topCategories = byCategory.slice(0, 10);
  const doughnutData = {
    labels: topCategories.map(c => c.category),
    datasets: [{
      data: topCategories.map(c => c.total),
      backgroundColor: PALETTE.slice(0, topCategories.length),
      borderWidth: 1,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {monthly.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Monthly Spending</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      )}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">By Category</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      )}
    </div>
  );
}
