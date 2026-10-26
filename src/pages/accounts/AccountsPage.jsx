import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import AddAccountForm from './AddAccountForm';
import AddTransactionForm from '../expenses/AddTransactionForm';
import TopUpForm from '../expenses/TopUpForm';
import { formatDate } from '../../utils/utils';


export default function AccountsPage() {
  const { auth, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountActivities, setAccountActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');

  // Modal states
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/accounts/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setAccounts(response.data.results ?? response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load accounts. Please try again.');
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [auth, logout]);

  const fetchAccountActivities = useCallback(async (accountId) => {
    setLoadingActivities(true);
    setActivitiesError('');
    try {
      const response = await axios.get(`/accounts/${accountId}/activity/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      // activity endpoint returns a plain array (not paginated) — normalise defensively
      setAccountActivities(Array.isArray(response.data) ? response.data : (response.data?.results ?? []));
    } catch (err) {
      console.error('Failed to fetch account activities:', err);
      setActivitiesError('Failed to load activities for this account.');
    } finally {
      setLoadingActivities(false);
    }
  }, [auth]);

  // useEffect for initial fetch of accounts
  useEffect(() => {
    if (auth?.access) {
      fetchAccounts();
    }
  }, [auth, fetchAccounts]);

  // useEffect to handle re-selection of account after accounts data changes
  useEffect(() => {
    if (accounts.length > 0) {
      if (selectedAccount) {
        const updatedSelected = accounts.find(acc => acc.id === selectedAccount.id);
        if (updatedSelected && (updatedSelected.balance !== selectedAccount.balance || updatedSelected !== selectedAccount)) {
          setSelectedAccount(updatedSelected);
        } else if (!updatedSelected) {
          setSelectedAccount(null);
        }
      } else {
        // Optional: Automatically select the first account if none is selected and accounts are loaded
        // setSelectedAccount(accounts[0]);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [accounts, selectedAccount]);

  // When a specific account is selected, fetch its activities
  useEffect(() => {
    if (selectedAccount && auth?.access) {
      fetchAccountActivities(selectedAccount.id);
    } else {
      setAccountActivities([]);
    }
  }, [selectedAccount, auth, fetchAccountActivities]);

  const handleAccountActionSuccess = () => {
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    setShowAddExpenseModal(false);
    setShowTopUpModal(false);
    fetchAccounts();
    if (selectedAccount) fetchAccountActivities(selectedAccount.id);
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    if (!window.confirm(
      `Delete "${selectedAccount.name}"? Its top-ups and transfers will be removed; ` +
      `expenses and income logged to it are kept but unlinked. This cannot be undone.`
    )) return;
    try {
      await axios.delete(`/accounts/${selectedAccount.id}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setSelectedAccount(null);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Accounts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-clay text-xl">
        <p>Error: {error}</p>
        <button onClick={fetchAccounts} className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded hover:bg-brand-forest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-text-strong mb-6">Your Accounts</h1>

        <button
          onClick={() => setShowAddAccountModal(true)}
          className="px-6 py-3 bg-emerald text-white rounded-lg shadow-md hover:bg-forest transition duration-300 w-full sm:w-auto"
        >
          ➕ Add New Account
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account List (Left/Top Section) */}
          <div className="md:col-span-1 bg-surface rounded-lg shadow-md p-3 sm:p-4 space-y-3 h-full overflow-y-auto max-h-[40vh] md:max-h-[80vh] min-h-[200px] sm:min-h-[auto]">
            <h2 className="text-xl font-semibold text-text-strong mb-4">Your Wallets & Banks</h2>
            {accounts.length === 0 ? (
              <p className="text-text-muted">No accounts found. Click "Add New Account" to get started!</p>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className={`p-4 rounded-lg cursor-pointer transition duration-200 ease-in-out
                              ${selectedAccount?.id === account.id
                                ? 'bg-accent-soft border-accent border-2 shadow-lg'
                                : 'bg-bg hover:bg-surface-2 border border-border-soft'}
                              flex flex-col sm:flex-row justify-between items-start sm:items-center`}
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="text-lg font-semibold text-text-strong">{account.name}</p>
                    <p className="text-sm text-text-muted capitalize">{account.type.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-text-strong">
                    {parseFloat(account.balance).toFixed(2)} {account.currency}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Selected Account Details & Activities (Right/Bottom Section) */}
          <div className="md:col-span-2 bg-surface rounded-lg shadow-md p-6 space-y-6">
            {selectedAccount ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
                  <h2 className="text-2xl font-bold text-text-strong">{selectedAccount.name}</h2>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowTopUpModal(true)}
                      className="px-4 py-2 bg-emerald text-white rounded-md hover:bg-forest transition duration-300 flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      Top Up
                    </button>
                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="px-4 py-2 bg-clay text-white rounded-md hover:opacity-90 transition duration-300 flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowEditAccountModal(true)}
                      className="px-4 py-2 bg-surface-2 text-text-strong border border-border-soft rounded-md hover:bg-surface-tint transition duration-300 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 border border-red-500 text-clay rounded-md hover:bg-[rgba(196,122,90,0.12)] transition duration-300 w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="bg-bg p-4 rounded-lg border border-border-soft">
                  <p className="text-lg text-text-main">Current Balance:</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-text-strong mt-1">
                    {parseFloat(selectedAccount.balance).toFixed(2)} {selectedAccount.currency}
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-text-strong mt-6 mb-4">Account Activities</h3>
                {loadingActivities ? (
                  <p className="text-center text-text-muted">Loading activities...</p>
                ) : activitiesError ? (
                  <p className="text-center text-clay">Error: {activitiesError}</p>
                ) : accountActivities.length === 0 ? (
                  <p className="text-center text-text-muted">No activities recorded for this account.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {accountActivities.map((activity) => (
                      <div
                        key={`${activity.type}-${activity.id}-${activity.created_at}`}
                        className="bg-surface p-3 rounded-lg shadow-sm border border-border-soft flex flex-col sm:flex-row justify-between items-start sm:items-center"
                      >
                        <div>
                          <p className={`text-lg font-semibold ${
                                ['top_up', 'transfer_in'].includes(activity.type) ? 'text-emerald' : 'text-clay'
                              }`}
                            >
                              {['top_up', 'transfer_in'].includes(activity.type) ? '+ ' : '- '}
                              {parseFloat(activity.amount).toFixed(2)} {activity.currency}
                            </p>
                          <p className="text-sm text-text-strong capitalize">
                            {activity.category && ` ${activity.category}`}
                            {activity.counterparty_account && ` (${activity.counterparty_account})`}
                          </p>
                          {activity.note && (
                            <p className="text-xs text-text-muted italic">{activity.note}</p>
                          )}
                          {activity.description && (
                            <p className="text-xs text-text-muted italic">{activity.description}</p>
                          )}
                        </div>
                        <p className="text-sm text-text-muted mt-1 sm:mt-0">{formatDate(activity.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-text-muted">
                <p className="text-lg">Select an account from the left to view its details and activities.</p>
                <p className="text-sm mt-2">Or add a new account to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEditAccountModal && selectedAccount && (
        <Modal title="Edit Account" onClose={() => setShowEditAccountModal(false)}>
          <AddAccountForm
            account={selectedAccount}
            onSuccess={handleAccountActionSuccess}
            onCancel={() => setShowEditAccountModal(false)}
          />
        </Modal>
      )}

      {showAddAccountModal && (
        <Modal title="➕ Add New Account" onClose={() => setShowAddAccountModal(false)}>
          <AddAccountForm onSuccess={handleAccountActionSuccess} onCancel={() => setShowAddAccountModal(false)} />
        </Modal>
      )}

      {showAddExpenseModal && selectedAccount && (
        <Modal title="➖ Add Expense" onClose={() => setShowAddExpenseModal(false)}>
          <AddTransactionForm
            initialAccountId={selectedAccount.id}
            onSuccess={handleAccountActionSuccess}
            onCancel={() => setShowAddExpenseModal(false)}
          />
        </Modal>
      )}

      {showTopUpModal && selectedAccount && (
        <Modal title="⬆️ Top Up Account" onClose={() => setShowTopUpModal(false)}>
          <TopUpForm
            initialAccountId={selectedAccount.id}
            onSuccess={handleAccountActionSuccess}
            onCancel={() => setShowTopUpModal(false)}
          />
        </Modal>
      )}
    </>
  );
}