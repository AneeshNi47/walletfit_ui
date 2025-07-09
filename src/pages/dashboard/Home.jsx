import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import UserGreeting from './UserGreeting';
import AccountSummary from './AccountSummary';
import RecentTransactions from './RecentTransactions'; // Assuming this is correct path
import SpendingTrends from './SpendingTrends';
import QuickActions from './QuickActions'; // Assuming this is correct path
import AddAccountForm from '../accounts/AddAccountForm';
import AddTransactionForm from '../expenses/AddTransactionForm';
import TopUpForm from '../expenses/TopUpForm'; // Import TopUpForm
import TransferForm from '../accounts/TransferForm'; // Import TransferForm


export default function Dashboard() {
  const { auth, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false); // This is now 'Add Expense' modal
  const [showTopUpForm, setShowTopUpForm] = useState(false); // NEW: State for TopUp modal
  const [showTransferForm, setShowTransferForm] = useState(false); // NEW: State for Transfer modal


  const refetchDashboard = useCallback(async () => {
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
  }, [auth, logout]);

  useEffect(() => {
    refetchDashboard();
  }, [auth, refetchDashboard]);

  // Handler for successful form submissions in modals (consolidated)
  const handleActionSuccess = () => {
    setShowAccountForm(false);
    setShowTransactionForm(false); // For Add Expense
    setShowTopUpForm(false);      // For Top Up
    setShowTransferForm(false);   // For Transfer
    refetchDashboard(); // Re-fetch dashboard data to update summaries etc.
  };


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
            onAddExpense={() => setShowTransactionForm(true)} // Pass handler for Add Expense
            onTopUp={() => setShowTopUpForm(true)}             // Pass handler for TopUp
            onTransfer={() => setShowTransferForm(true)}       // Pass handler for Transfer
          />
        </div>

        {/* Add Account Modal */}
        {showAccountForm && (
          <Modal title="➕ Add New Account" onClose={() => setShowAccountForm(false)}>
            <AddAccountForm onSuccess={handleActionSuccess} onCancel={() => setShowAccountForm(false)} />
          </Modal>
        )}

        {/* Add Expense Modal (previously Add Transaction) */}
        {showTransactionForm && (
          <Modal title="➖ Add Expense" onClose={() => setShowTransactionForm(false)}>
            <AddTransactionForm onSuccess={handleActionSuccess} onCancel={() => setShowTransactionForm(false)} />
          </Modal>
        )}

        {/* NEW: Top Up Modal */}
        {showTopUpForm && (
          <Modal title="⬆️ Top Up Account" onClose={() => setShowTopUpForm(false)}>
            <TopUpForm onSuccess={handleActionSuccess} onCancel={() => setShowTopUpForm(false)} />
          </Modal>
        )}

        {/* NEW: Transfer Modal */}
        {showTransferForm && (
          <Modal title="🔄 Transfer Funds" onClose={() => setShowTransferForm(false)}>
            <TransferForm onSuccess={handleActionSuccess} onCancel={() => setShowTransferForm(false)} />
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