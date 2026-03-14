import {
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  UsersIcon,
  ChartBarIcon,
  WalletIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ScissorsIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  TagIcon,
} from '@heroicons/react/24/solid';

const features = [
  {
    icon: <CheckCircleIcon className="h-8 w-8 text-green-500" />,
    title: 'Expense Tracking',
    description: 'Log every expense with category, description, and date. Mark expenses as personal or shared with your household.',
  },
  {
    icon: <WalletIcon className="h-8 w-8 text-blue-500" />,
    title: 'Multi-Account Management',
    description: 'Manage wallets, bank accounts, tap cards, and cash — all in one place. Track balances and activity per account.',
  },
  {
    icon: <BanknotesIcon className="h-8 w-8 text-emerald-500" />,
    title: 'Income Tracking',
    description: 'Record income from multiple sources like salary, freelance, or investments. See monthly trends and summaries.',
  },
  {
    icon: <ChartBarIcon className="h-8 w-8 text-indigo-500" />,
    title: 'Budget Planning',
    description: 'Set weekly, monthly, or yearly budgets per category. Get alerts when you reach 80% of your limit.',
  },
  {
    icon: <UsersIcon className="h-8 w-8 text-pink-500" />,
    title: 'Household Management',
    description: 'Create a household, invite family or roommates, and share financial visibility. Manage roles and permissions.',
  },
  {
    icon: <ScissorsIcon className="h-8 w-8 text-orange-500" />,
    title: 'Expense Splitting',
    description: 'Split expenses equally or with custom amounts among household members. Track who paid and who owes.',
  },
  {
    icon: <CalendarDaysIcon className="h-8 w-8 text-purple-500" />,
    title: 'Recurring Transactions',
    description: 'Set up recurring bills and income. Get notified about upcoming payments due within the next 7 days.',
  },
  {
    icon: <DocumentChartBarIcon className="h-8 w-8 text-cyan-500" />,
    title: 'Reports & Exports',
    description: 'Generate detailed transaction reports with filters. Export to Excel or PDF for record-keeping.',
  },
  {
    icon: <TagIcon className="h-8 w-8 text-amber-500" />,
    title: 'Custom Categories',
    description: 'Create your own spending categories to organize expenses the way that makes sense for you.',
  },
  {
    icon: <ArrowPathIcon className="h-8 w-8 text-teal-500" />,
    title: 'Fund Transfers',
    description: 'Transfer money between your own accounts with automatic balance updates. Full transfer history tracked.',
  },
  {
    icon: <DevicePhoneMobileIcon className="h-8 w-8 text-yellow-500" />,
    title: 'Mobile Responsive',
    description: 'Access WalletFit from any device. The interface adapts seamlessly to desktop, tablet, and mobile screens.',
  },
  {
    icon: <LockClosedIcon className="h-8 w-8 text-gray-500" />,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with token rotation and blacklisting. Your financial data stays safe and private.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4">Everything You Need</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A complete suite of tools to manage personal and household finances, from daily tracking to long-term planning.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
