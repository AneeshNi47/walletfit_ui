import { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function ExpenseChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Expenses Over Time',
        data: data.map(item => item.amount),
        borderColor: '#a64bee',
        backgroundColor: 'rgba(166, 75, 238, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="h-64">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
}