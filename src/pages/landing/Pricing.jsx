import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for individuals getting started',
    features: [
      '1 Household',
      'Up to 3 Accounts',
      'Expense & Income Tracking',
      'Custom Categories',
      'Basic Monthly Summary',
      'Budget Alerts',
    ],
    highlight: false,
    cta: 'Start Free',
  },
  {
    name: 'Gold',
    price: 5,
    description: 'Best for families and shared households',
    features: [
      '3 Households',
      'Unlimited Accounts',
      'Expense Splitting',
      'Recurring Transactions',
      'Advanced Reports',
      'Excel & PDF Exports',
      'Household Analytics',
      'Priority Email Support',
    ],
    highlight: true,
    cta: 'Get Gold',
  },
  {
    name: 'Premium',
    price: 12,
    description: 'For power users who want it all',
    features: [
      'Unlimited Households',
      'Unlimited Everything',
      'All Gold Features',
      'Multi-currency Support',
      'API Access',
      'Mobile App Access',
      'Data Export & Backup',
      'Priority Support',
      'Early Access to New Features',
    ],
    highlight: false,
    cta: 'Get Premium',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 flex flex-col transition relative bg-white
                ${tier.highlight
                  ? 'border-2 border-blue-600 md:scale-105 z-10 shadow-2xl'
                  : 'border border-gray-200 shadow-lg'
                }
              `}
            >
              {tier.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-semibold shadow">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-600 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">${tier.price}</span>
                  <span className="text-lg text-gray-500">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`w-full py-3 rounded-lg font-semibold transition text-lg text-center block
                  ${tier.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-blue-700 hover:bg-blue-200'
                  }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
