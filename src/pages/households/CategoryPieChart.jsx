import { useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function CategoryPieChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Expenses',
        data: data.map(item => item.total),
        backgroundColor: ['#1c3bb7', '#2281fe', '#FFD700', '#a64bee'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="h-64">
      <Pie ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
}