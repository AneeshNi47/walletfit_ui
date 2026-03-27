export default function ExpenseTable({ expenses = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        Loading expenses...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold text-brand-forest mb-2">Expenses</h3>
      {expenses.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No expenses found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Account</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-right">Amount (AED)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.category_name || item.category || '-'}</td>
                  <td className="p-2">{item.account_name || item.account || '-'}</td>
                  <td className="p-2 text-gray-600">{item.description || '-'}</td>
                  <td className="p-2 text-right text-red-600">
                    - {Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
