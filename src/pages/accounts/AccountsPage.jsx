import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
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
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/accounts/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setAccounts(response.data.results);
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
      setAccountActivities(response.data.results);
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
    setShowAddExpenseModal(false);
    setShowTopUpModal(false);
    fetchAccounts();
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
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
        <p>Error: {error}</p>
        <button onClick={fetchAccounts} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Accounts</h1>

        <button
          onClick={() => setShowAddAccountModal(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 w-full sm:w-auto"
        >
          ➕ Add New Account
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account List (Left/Top Section) */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4 space-y-3 h-full overflow-y-auto max-h-[80vh] md:max-h-[80vh] min-h-[200px] sm:min-h-[auto]">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Wallets & Banks</h2>
            {accounts.length === 0 ? (
              <p className="text-gray-500">No accounts found. Click "Add New Account" to get started!</p>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className={`p-4 rounded-lg cursor-pointer transition duration-200 ease-in-out
                              ${selectedAccount?.id === account.id
                                ? 'bg-blue-100 border-blue-500 border-2 shadow-lg'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}
                              flex flex-col sm:flex-row justify-between items-start sm:items-center`}
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="text-lg font-semibold text-gray-800">{account.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{account.type.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">
                    {parseFloat(account.balance).toFixed(2)} {account.currency}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Selected Account Details & Activities (Right/Bottom Section) */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-6">
            {selectedAccount ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAccount.name}</h2>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowTopUpModal(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      Top Up
                    </button>
                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      Add Expense
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-lg text-gray-600">Current Balance:</p>
                  <p className="text-3xl font-extrabold text-blue-800 mt-1">
                    {parseFloat(selectedAccount.balance).toFixed(2)} {selectedAccount.currency}
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Account Activities</h3>
                {loadingActivities ? (
                  <p className="text-center text-gray-500">Loading activities...</p>
                ) : activitiesError ? (
                  <p className="text-center text-red-500">Error: {activitiesError}</p>
                ) : accountActivities.length === 0 ? (
                  <p className="text-center text-gray-500">No activities recorded for this account.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {accountActivities.map((activity) => (
                      <div
                        key={`${activity.type}-${activity.id}-${activity.created_at}`}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                      >
                        <div>
                          <p className={`text-lg font-semibold ${
                                ['top_up', 'transfer_in'].includes(activity.type) ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {['top_up', 'transfer_in'].includes(activity.type) ? '+ ' : '- '}
                              {parseFloat(activity.amount).toFixed(2)} {activity.currency}
                            </p>
                          <p className="text-sm text-gray-700 capitalize">
                            {activity.category && ` ${activity.category}`}
                            {activity.counterparty_account && ` (${activity.counterparty_account})`}
                          </p>
                          {activity.note && (
                            <p className="text-xs text-gray-500 italic">{activity.note}</p>
                          )}
                          {activity.description && (
                            <p className="text-xs text-gray-500 italic">{activity.description}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 sm:mt-0">{formatDate(activity.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg">Select an account from the left to view its details and activities.</p>
                <p className="text-sm mt-2">Or add a new account to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
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