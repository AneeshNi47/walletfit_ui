import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import UserGreeting from './UserGreeting';
import AccountSummary from './AccountSummary';
import RecentTransactions from './RecentTransactions';
import SpendingTrends from './SpendingTrends';
import QuickActions from './QuickActions';
import AddAccountForm from '../accounts/AddAccountForm';
import AddTransactionForm from '../expenses/AddTransactionForm';


export default function Dashboard() {
  const { auth, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const refetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get('users/dashboard/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to refetch dashboard:', err);
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchDashboard();
  }, [auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Dashboard...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500 text-xl">
        Failed to load dashboard data.
      </div>
    );
  }

  const { user, profile, transactions = [] } = dashboardData;

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <UserGreeting user={user} />

        <div className="grid gap-6 md:grid-cols-2">
          <AccountSummary currency={profile.currency} />
          <QuickActions
            onAddAccount={() => setShowAccountForm(true)}
            onAddTransaction={() => setShowTransactionForm(true)}
          />
        </div>

        {showAccountForm && (
  <Modal title="➕ Add Account" onClose={() => setShowAccountForm(false)}>
    <AddAccountForm
      onSuccess={() => {
        setShowAccountForm(false);
        window.location.reload(); // or refetch
      }}
      onCancel={() => setShowAccountForm(false)}
    />
  </Modal>
)}

{showTransactionForm && (
  <Modal title="➖ Add Transaction" onClose={() => setShowTransactionForm(false)}>
    <AddTransactionForm
      onSuccess={() => {
        setShowTransactionForm(false);
        window.location.reload();
      }}
      onCancel={() => setShowTransactionForm(false)}
    />
  </Modal>
)}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentTransactions currency={profile.currency} />
          <SpendingTrends transactions={transactions} />
        </div>
      </main>
    </>
  );
}
