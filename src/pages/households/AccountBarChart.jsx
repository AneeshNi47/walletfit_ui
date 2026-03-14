import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

export default function AccountBarChart() {
  const { auth } = useAuth();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/expenses/household/accounts/balances/', {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        const names = res.data.map(item => item.name);
        const balances = res.data.map(item => item.balance);

        setChartData({
          labels: names,
          datasets: [
            {
              label: 'Account Balances',
              data: balances,
              backgroundColor: '#1c3bb7',
            },
          ],
        });
      } catch (err) {
        console.error('Failed to fetch account balances:', err);
      }
    };

    fetchData();
  }, [auth]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#1c3bb7',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
        },
      },
      y: {
        ticks: {
          color: '#333',
        },
      },
    },
  };

  if (!chartData) return <div className="text-center py-4">Loading chart...</div>;

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}