export default function SummaryCards({ totalExpense = 0, categoryData = [], expenses = [] }) {
  // Calculate monthly average from expenses
  const monthSet = new Set();
  expenses.forEach((exp) => {
    if (exp.date) {
      const month = exp.date.substring(0, 7); // "YYYY-MM"
      monthSet.add(month);
    }
  });
  const monthCount = monthSet.size || 1;
  const monthlyAverage = totalExpense / monthCount;

  // Find top category
  let topCategory = 'N/A';
  if (categoryData.length > 0) {
    const sorted = [...categoryData].sort((a, b) => b.total - a.total);
    topCategory = sorted[0].category || 'N/A';
  }

  const cards = [
    {
      title: 'Total Expense',
      value: `AED ${Number(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'Monthly Average',
      value: `AED ${Number(monthlyAverage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Top Category',
      value: topCategory,
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div key={i} className={`p-4 rounded shadow ${card.color}`}>
          <h4 className="text-sm font-semibold">{card.title}</h4>
          <p className="text-xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
