import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function SpendingTrends() {
  const { auth, logout } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlySpending = async () => {
      try {
        const res = await axios.get('expenses/monthly-summary/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setMonthlyData(res.data);
      } catch (err) {
        console.error('Error fetching spending trends:', err);
        if (err?.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySpending();
  }, [auth, logout]);

  if (loading) return <div className="p-4 text-gray-600">Loading chart...</div>;

  const labels = monthlyData.map((item) => item.month);
  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: monthlyData.map((item) => item.total),
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white shadow rounded p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">📊 Spending Trends</h2>
      <Line data={data} />
    </div>
  );
}
