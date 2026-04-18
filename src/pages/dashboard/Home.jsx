import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import UserGreeting from './UserGreeting';
import AccountSummary from './AccountSummary';
import FinancialOverview from './FinancialOverview';
import RecentTransactions from './RecentTransactions';
import SpendingTrends from './SpendingTrends';
import QuickActions from './QuickActions';
import BudgetAlerts from './BudgetAlerts';
import UpcomingBills from './UpcomingBills';
import AddAccountForm from '../accounts/AddAccountForm';
import AddTransactionForm from '../expenses/AddTransactionForm';
import TopUpForm from '../expenses/TopUpForm';
import TransferForm from '../accounts/TransferForm';

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

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

  const handleActionSuccess = () => {
    setShowAccountForm(false);
    setShowTransactionForm(false);
    setShowTopUpForm(false);
    setShowTransferForm(false);
    refetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-serif italic text-text-muted text-lg">
        Loading dashboard…
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-clay">
        Failed to load dashboard data.
      </div>
    );
  }

  const { user, profile } = dashboardData;
  const currency = profile?.currency || 'AED';

  return (
    <div className="space-y-6">
      {/* Greeting row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <UserGreeting user={user} />
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => setShowTransactionForm(true)}>Add expense</Button>
          <Button variant="ghost" onClick={() => setShowTopUpForm(true)}>
            Log income
          </Button>
        </div>
      </div>

      {/* Row: balance (2/3) + monthly flow (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountSummary currency={currency} />
        </div>
        <FinancialOverview />
      </div>

      {/* Row: budgets + 14-day spending (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BudgetAlerts />
        <SpendingTrends />
      </div>

      {/* Row: quick actions (2 cols) + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions
          onAddAccount={() => setShowAccountForm(true)}
          onAddExpense={() => setShowTransactionForm(true)}
          onTopUp={() => setShowTopUpForm(true)}
          onTransfer={() => setShowTransferForm(true)}
        />
        <RecentTransactions currency={currency} />
      </div>

      {/* Row: upcoming bills full-width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingBills />
      </div>

      {showAccountForm && (
        <Modal title="Add account" onClose={() => setShowAccountForm(false)}>
          <AddAccountForm onSuccess={handleActionSuccess} onCancel={() => setShowAccountForm(false)} />
        </Modal>
      )}
      {showTransactionForm && (
        <Modal title="Add expense" onClose={() => setShowTransactionForm(false)}>
          <AddTransactionForm onSuccess={handleActionSuccess} onCancel={() => setShowTransactionForm(false)} />
        </Modal>
      )}
      {showTopUpForm && (
        <Modal title="Top up account" onClose={() => setShowTopUpForm(false)}>
          <TopUpForm onSuccess={handleActionSuccess} onCancel={() => setShowTopUpForm(false)} />
        </Modal>
      )}
      {showTransferForm && (
        <Modal title="Transfer funds" onClose={() => setShowTransferForm(false)}>
          <TransferForm onSuccess={handleActionSuccess} onCancel={() => setShowTransferForm(false)} />
        </Modal>
      )}
    </div>
  );
}
