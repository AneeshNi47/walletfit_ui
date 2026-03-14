import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import CategoryPieChart from './components/CategoryPieChart';
import AccountBarChart from './components/AccountBarChart';
import ExpenseTable from './components/ExpenseTable';
import Filters from './components/Filters';

export default function SummaryPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-blue-800">Household Expense Summary</h1>
      <SummaryCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart />
        <CategoryPieChart />
      </div>
      <AccountBarChart />
      <Filters />
      <ExpenseTable />
    </div>
  );
}