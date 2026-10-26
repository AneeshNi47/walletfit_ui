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
    <div className="bg-surface p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-text-strong mb-3">💹 Income vs Expenses</h2>
      {income === 0 && expense === 0 ? (
        <p className="text-text-muted text-sm">No transactions yet to visualize.</p>
      ) : (
        <Pie data={chartData} options={chartOptions} />
      )}
      <div className="flex justify-around mt-4 text-sm text-text-strong">
        <span>Income: <strong className="text-emerald">{income.toFixed(2)} {currency}</strong></span>
        <span>Expenses: <strong className="text-clay">{expense.toFixed(2)} {currency}</strong></span>
      </div>
    </div>
  );
}
