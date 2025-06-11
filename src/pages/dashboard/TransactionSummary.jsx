import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TransactionSummary({ transactions, currency }) {
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const expense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">💹 Income vs Expenses</h2>
      {income === 0 && expense === 0 ? (
        <p className="text-gray-500 text-sm">No transactions yet to visualize.</p>
      ) : (
        <Pie data={chartData} options={chartOptions} />
      )}
      <div className="flex justify-around mt-4 text-sm text-gray-700">
        <span>Income: <strong className="text-green-600">{income.toFixed(2)} {currency}</strong></span>
        <span>Expenses: <strong className="text-red-600">{expense.toFixed(2)} {currency}</strong></span>
      </div>
    </div>
  );
}
