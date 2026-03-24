import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import SummaryCards from './SummaryCards';
import FairnessCard from './FairnessCard';
import WhoSpentCard from './WhoSpentCard';
import HouseholdBudgets from './HouseholdBudgets';
import ExpenseChart from './ExpenseChart';
import CategoryPieChart from './CategoryPieChart';
import AccountBarChart from './AccountBarChart';
import ExpenseTable from './ExpenseTable';
import Filters from './Filters';

export default function HouseholdPage() {
  const { auth } = useAuth();
  const headers = { Authorization: `Bearer ${auth?.access}` };

  // Household state
  const [household, setHousehold] = useState(null);
  const [hasHousehold, setHasHousehold] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Create household
  const [householdName, setHouseholdName] = useState('');
  const [creating, setCreating] = useState(false);

  // Invite member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Pending invites (for users not in a household)
  const [pendingInvites, setPendingInvites] = useState([]);
  const [pendingInvitesLoading, setPendingInvitesLoading] = useState(false);

  // Sent invites (for owners)
  const [sentInvites, setSentInvites] = useState([]);

  // Transfer ownership modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUserId, setTransferUserId] = useState(null);
  const [transferAndLeave, setTransferAndLeave] = useState(false);

  // Analytics data
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
  });

  // Determine if current user is the owner
  const currentUserId = auth?.user?.id;
  const isOwner = household?.owner?.id === currentUserId;

  // Fetch household info
  const fetchHousehold = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/users/households/view/', { headers });
      if (res.data.household) {
        setHousehold(res.data.household);
        setHasHousehold(true);
      } else {
        setHousehold(null);
        setHasHousehold(false);
      }
    } catch (err) {
      console.error('Failed to fetch household:', err);
      setError('Failed to load household information.');
    } finally {
      setLoading(false);
    }
  }, [auth?.access]);

  // Fetch household expenses with filters
  const fetchExpenses = useCallback(async () => {
    if (!hasHousehold) return;
    setExpensesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.amount_min) params.append('amount_min', filters.amount_min);
      if (filters.amount_max) params.append('amount_max', filters.amount_max);

      const res = await axios.get(`/expenses/household/?${params.toString()}`, { headers });
      const data = res.data?.results || res.data;
      setExpenses(data.results || []);
      setTotalExpense(data.total_expense || 0);
    } catch (err) {
      console.error('Failed to fetch household expenses:', err);
    } finally {
      setExpensesLoading(false);
    }
  }, [auth?.access, hasHousehold, filters]);

  // Fetch category data
  const fetchCategoryData = useCallback(async () => {
    if (!hasHousehold) return;
    try {
      const res = await axios.get('/expenses/household/expenses/by-category/', { headers });
      setCategoryData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch category data:', err);
    }
  }, [auth?.access, hasHousehold]);

  // Fetch trend data
  const fetchTrendData = useCallback(async () => {
    if (!hasHousehold) return;
    try {
      const res = await axios.get('/expenses/household/expenses/trend/', { headers });
      setTrendData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    }
  }, [auth?.access, hasHousehold]);

  // Fetch pending invites for current user
  const fetchPendingInvites = useCallback(async () => {
    setPendingInvitesLoading(true);
    try {
      const res = await axios.get('/users/households/my-invites/', { headers });
      setPendingInvites(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending invites:', err);
    } finally {
      setPendingInvitesLoading(false);
    }
  }, [auth?.access]);

  // Fetch sent invites for household owners
  const fetchSentInvites = useCallback(async () => {
    if (!hasHousehold) return;
    try {
      const res = await axios.get('/users/households/sent-invites/', { headers });
      setSentInvites(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sent invites:', err);
    }
  }, [auth?.access, hasHousehold]);

  // Initial load
  useEffect(() => {
    if (auth?.access) {
      fetchHousehold();
      fetchPendingInvites();
    }
  }, [auth?.access, fetchHousehold, fetchPendingInvites]);

  // Load analytics and sent invites when household is available
  useEffect(() => {
    if (hasHousehold) {
      fetchExpenses();
      fetchCategoryData();
      fetchTrendData();
      fetchSentInvites();
    }
  }, [hasHousehold, fetchExpenses, fetchCategoryData, fetchTrendData, fetchSentInvites]);

  // Clear action messages after 4 seconds
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess('');
        setActionError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // Create household
  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    if (!householdName.trim()) return;
    setCreating(true);
    setActionError('');
    try {
      await axios.post('/users/households/create/', { name: householdName.trim() }, { headers });
      setHouseholdName('');
      setActionSuccess('Household created successfully!');
      fetchHousehold();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to create household.';
      setActionError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Invite member
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setActionError('');
    try {
      await axios.post('/users/households/invite/', { email: inviteEmail.trim() }, { headers });
      setInviteEmail('');
      setActionSuccess('Invitation sent successfully!');
      fetchHousehold();
      fetchSentInvites();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to send invitation.';
      setActionError(msg);
    } finally {
      setInviting(false);
    }
  };

  // Accept invite
  const handleAcceptInvite = async (inviteId, householdName) => {
    setActionError('');
    try {
      await axios.post('/users/households/accept-invite/', { invite_id: inviteId }, { headers });
      setActionSuccess(`You have joined ${householdName}!`);
      setPendingInvites([]);
      fetchHousehold();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to accept invite.';
      setActionError(msg);
    }
  };

  // Decline invite
  const handleDeclineInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to decline this invite?')) return;
    setActionError('');
    try {
      await axios.post('/users/households/decline-invite/', { invite_id: inviteId }, { headers });
      setActionSuccess('Invite declined.');
      fetchPendingInvites();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to decline invite.';
      setActionError(msg);
    }
  };

  // Cancel invite (owner)
  const handleCancelInvite = async (inviteId, email) => {
    if (!window.confirm(`Cancel the invite to ${email}?`)) return;
    setActionError('');
    try {
      await axios.post('/users/households/cancel-invite/', { invite_id: inviteId }, { headers });
      setActionSuccess(`Invite to ${email} cancelled.`);
      fetchSentInvites();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel invite.';
      setActionError(msg);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from the household?`)) return;
    setActionError('');
    try {
      await axios.post('/users/households/remove/', { user_id: userId }, { headers });
      setActionSuccess(`${username} has been removed from the household.`);
      fetchHousehold();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to remove member.';
      setActionError(msg);
    }
  };

  // Leave household
  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this household?')) return;
    setActionError('');
    try {
      await axios.post('/users/households/leave/', {}, { headers });
      setActionSuccess('You have left the household.');
      setHousehold(null);
      setHasHousehold(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to leave household.';
      setActionError(msg);
    }
  };

  // Transfer ownership
  const handleTransferOwnership = async () => {
    if (!transferUserId) return;
    setActionError('');
    try {
      await axios.post('/users/households/transfer-ownership/', {
        user_id: transferUserId,
        leave: transferAndLeave,
      }, { headers });
      setShowTransferModal(false);
      setTransferUserId(null);
      setTransferAndLeave(false);
      setActionSuccess('Ownership transferred successfully!');
      if (transferAndLeave) {
        setHousehold(null);
        setHasHousehold(false);
      } else {
        fetchHousehold();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to transfer ownership.';
      setActionError(msg);
    }
  };

  // Handle filter changes from Filters component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center text-xl">
          Loading Household...
        </div>
      </>
    );
  }

  if (error && !hasHousehold) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
          <p>Error: {error}</p>
          <button onClick={fetchHousehold} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Household</h1>

        {/* Action messages */}
        {actionSuccess && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {actionError}
          </div>
        )}

        {!hasHousehold ? (
          /* ======================== STATE 1: No Household ======================== */
          <div className="max-w-lg mx-auto mt-10 space-y-6">
            {/* Pending Invites */}
            {pendingInvitesLoading ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Checking for invites...
              </div>
            ) : pendingInvites.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Invites</h2>
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-4 rounded-lg border border-blue-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{invite.household}</p>
                        <p className="text-sm text-gray-500">
                          Invited by {invite.invited_by} &middot;{' '}
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleAcceptInvite(invite.id, invite.household)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInvite(invite.id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Household */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {pendingInvites.length > 0 ? 'Or create a new household' : 'You are not part of a household'}
              </h2>
              <p className="text-gray-500 mb-6">Create a new household to start tracking shared expenses with your family or roommates.</p>
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <div>
                  <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-1">
                    Household Name
                  </label>
                  <input
                    id="householdName"
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="e.g. The Smith Family"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Household'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ======================== STATE 2: Has Household ======================== */
          <div className="space-y-6">
            {/* Household Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">{household.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {new Date(household.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                {!isOwner && (
                  <button
                    onClick={handleLeave}
                    className="mt-3 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Leave Household
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Members</h3>
                <div className="space-y-2">
                  {household.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {(member.first_name?.[0] || member.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : member.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{member.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                          member.role === 'owner'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.role === 'owner' ? 'Owner' : 'Member'}
                        </span>
                      </div>
                      {isOwner && member.id !== currentUserId && (
                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setTransferUserId(member.id);
                              setShowTransferModal(true);
                            }}
                            className="px-3 py-2 min-h-[40px] text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                          >
                            Transfer Ownership
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.username)}
                            className="px-3 py-2 min-h-[40px] text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Form (Owner only) */}
              {isOwner && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Invite a Member</h3>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-6 py-2 min-h-[44px] bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 w-full sm:w-auto"
                    >
                      {inviting ? 'Inviting...' : 'Send Invite'}
                    </button>
                  </form>

                  {/* Sent Invites (pending) */}
                  {sentInvites.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Pending Invites</h4>
                      <div className="space-y-2">
                        {sentInvites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-yellow-50 p-3 rounded-lg border border-yellow-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">{invite.email}</p>
                              <p className="text-xs text-gray-500">
                                Sent by {invite.invited_by} &middot;{' '}
                                {new Date(invite.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelInvite(invite.id, invite.email)}
                              className="mt-2 sm:mt-0 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            >
                              Cancel Invite
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================== Household Expense Analytics ======================== */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-800">Household Expense Summary</h2>

              <SummaryCards
                totalExpense={totalExpense}
                categoryData={categoryData}
                expenses={expenses}
              />

              {/* Household Budgets, Fairness & Who Spent */}
              <HouseholdBudgets />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FairnessCard />
                <WhoSpentCard />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-blue-800 mb-2">Expense Trend</h3>
                  {trendData.length > 0 ? (
                    <ExpenseChart data={trendData} />
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No trend data available.</p>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-blue-800 mb-2">Expenses by Category</h3>
                  {categoryData.length > 0 ? (
                    <CategoryPieChart data={categoryData} />
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No category data available.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-blue-800 mb-2">Account Balances</h3>
                <AccountBarChart />
              </div>

              <Filters filters={filters} onFilterChange={handleFilterChange} />

              <ExpenseTable expenses={expenses} loading={expensesLoading} />
            </div>
          </div>
        )}
      </main>

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <Modal title="Transfer Ownership" onClose={() => {
          setShowTransferModal(false);
          setTransferUserId(null);
          setTransferAndLeave(false);
        }}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to transfer ownership to{' '}
              <span className="font-semibold">
                {household.members?.find(m => m.id === transferUserId)?.username || 'this member'}
              </span>?
            </p>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="transferAndLeave"
                checked={transferAndLeave}
                onChange={(e) => setTransferAndLeave(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="transferAndLeave" className="text-sm text-gray-700">
                Also leave the household after transferring
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferUserId(null);
                  setTransferAndLeave(false);
                }}
                className="px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferOwnership}
                className="px-4 py-2 min-h-[44px] bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition w-full sm:w-auto"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
