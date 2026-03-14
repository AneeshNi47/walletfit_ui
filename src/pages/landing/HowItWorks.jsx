import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  WalletIcon,
  PencilSquareIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/solid';

const steps = [
  {
    number: '01',
    icon: <UserPlusIcon className="h-8 w-8 text-blue-600" />,
    title: 'Create Your Account',
    description: 'Sign up for free in under a minute. Set up your profile, choose your currency, and optionally create a household to share with family or roommates.',
  },
  {
    number: '02',
    icon: <WalletIcon className="h-8 w-8 text-blue-600" />,
    title: 'Add Your Accounts',
    description: 'Add your wallets, bank accounts, cards, and cash accounts. Set starting balances. Top up or transfer funds between accounts anytime.',
  },
  {
    number: '03',
    icon: <PencilSquareIcon className="h-8 w-8 text-blue-600" />,
    title: 'Track Everything',
    description: 'Log expenses, income, and recurring transactions. Categorize spending, set budgets, and split shared expenses with household members.',
  },
  {
    number: '04',
    icon: <ChartBarSquareIcon className="h-8 w-8 text-blue-600" />,
    title: 'Get Insights',
    description: 'View spending trends, budget alerts, monthly summaries, and household analytics. Export reports to Excel or PDF for deeper analysis.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get started in four simple steps. No complex setup, no credit card required.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 mb-5 group-hover:bg-blue-100 transition-colors">
                {step.icon}
              </div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Step {step.number}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Start Your Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}
