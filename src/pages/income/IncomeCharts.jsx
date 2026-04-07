import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16', '#ec4899', '#14b8a6', '#ef4444',
];

export default function IncomeCharts({ monthlyTrend, incomeBySource }) {
  if (!monthlyTrend?.length && !incomeBySource?.length) return null;

  const barData = {
    labels: monthlyTrend.map(m => m.month),
    datasets: [{
      label: 'Income',
      data: monthlyTrend.map(m => m.total),
      backgroundColor: '#10b981',
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

  const topSources = incomeBySource.slice(0, 10);
  const doughnutData = {
    labels: topSources.map(s => s.source__name ?? 'Unknown'),
    datasets: [{
      data: topSources.map(s => s.total),
      backgroundColor: PALETTE.slice(0, topSources.length),
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
      {monthlyTrend.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Monthly Income (last 6 months)</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      )}
      {topSources.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">By Source</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      )}
    </div>
  );
}
