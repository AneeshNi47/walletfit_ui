import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TelegramConnect() {
  const { auth } = useAuth();
  const [status, setStatus] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  const headers = { Authorization: `Bearer ${auth?.access}` };

  useEffect(() => {
    fetchStatus();
    fetchAccounts();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('telegram/status/', { headers });
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch Telegram status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('accounts/', { headers });
      setAccounts(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('telegram/generate-code/', {}, { headers });
      setLinkCode(res.data);
      setMessage({ type: 'success', text: 'Code generated! Send it to the bot within 10 minutes.' });
    } catch (err) {
      console.error('Failed to generate code:', err);
      setMessage({ type: 'error', text: 'Failed to generate code. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const unlinkTelegram = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram?')) return;
    setUnlinking(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.post('telegram/unlink/', {}, { headers });
      setStatus({ linked: false });
      setLinkCode(null);
      setMessage({ type: 'success', text: 'Telegram disconnected.' });
    } catch (err) {
      console.error('Failed to unlink:', err);
      setMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' });
    } finally {
      setUnlinking(false);
    }
  };

  const setDefaultAccount = async (accountId) => {
    try {
      await axios.post(
        'telegram/set-default-account/',
        { account_id: accountId || null },
        { headers }
      );
      await fetchStatus();
      setMessage({ type: 'success', text: 'Default account updated.' });
    } catch (err) {
      console.error('Failed to set default account:', err);
      setMessage({ type: 'error', text: 'Failed to update default account.' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Telegram Integration
        </h2>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
        Telegram Integration
      </h2>

      {message.text && (
        <div
          className={`p-3 rounded text-sm mb-4 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {status?.linked ? (
        /* --- Connected State --- */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium text-green-700">Connected</span>
          </div>

          <p className="text-sm text-gray-600">
            Your Telegram account is linked. You can log expenses and income directly from Telegram.
          </p>

          {/* Default Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Default Account for Telegram Entries
            </label>
            <select
              value={status.default_account || ''}
              onChange={(e) => setDefaultAccount(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border rounded bg-white focus:ring-2 focus:ring-brand-emerald focus:outline-none"
            >
              <option value="">No default (manual selection)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency} {Number(acc.balance).toLocaleString()})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Expenses and income sent via Telegram will be added to this account.
            </p>
          </div>

          {/* Quick Reference */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Commands</h3>
            <div className="grid gap-1 text-xs text-gray-600">
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">lunch 45</code> — log an expense</div>
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">income salary 5000</code> — log income</div>
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">/balance</code> — check balances</div>
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">/budget</code> — budget status</div>
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">/spent</code> — today's spending</div>
              <div><code className="bg-gray-200 px-1.5 py-0.5 rounded">/owe</code> — split balances</div>
            </div>
          </div>

          <button
            onClick={unlinkTelegram}
            disabled={unlinking}
            className="px-4 py-2 min-h-[44px] text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
          >
            {unlinking ? 'Disconnecting...' : 'Disconnect Telegram'}
          </button>
        </div>
      ) : (
        /* --- Not Connected State --- */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
            <span className="text-sm font-medium text-gray-500">Not Connected</span>
          </div>

          <p className="text-sm text-gray-600">
            Connect your Telegram account to log expenses, check balances, and manage your finances
            directly from Telegram — no need to open the app.
          </p>

          {/* Steps */}
          <div className="bg-brand-cream rounded-lg p-4">
            <h3 className="text-sm font-medium text-brand-forest mb-3">How to connect:</h3>
            <ol className="space-y-2 text-sm text-brand-forest">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Click "Generate Code" below</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>
                  Open Telegram and search for{' '}
                  <span className="font-semibold">@FynBeeBot</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Send the code to the bot</span>
              </li>
            </ol>
          </div>

          {linkCode ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-600">Send this message to the bot:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-300 rounded px-4 py-3 text-lg font-mono font-bold text-center text-gray-800">
                  /start {linkCode.code}
                </code>
                <button
                  onClick={() => copyToClipboard(`/start ${linkCode.code}`)}
                  className="px-3 py-3 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Code expires at {new Date(linkCode.expires_at).toLocaleTimeString()}
              </p>
              <button
                onClick={generateCode}
                disabled={generating}
                className="text-sm text-brand-emerald hover:underline disabled:opacity-50"
              >
                Generate new code
              </button>
            </div>
          ) : (
            <button
              onClick={generateCode}
              disabled={generating}
              className="px-4 py-2 min-h-[44px] bg-brand-emerald text-white text-sm rounded hover:bg-brand-forest transition disabled:opacity-50 w-full sm:w-auto"
            >
              {generating ? 'Generating...' : 'Generate Code'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
