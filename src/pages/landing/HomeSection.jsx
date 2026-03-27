import { SparklesIcon } from '@heroicons/react/24/solid';

const stats = [
  { value: '5+', label: 'Account Types', description: 'Wallets, banks, cards & more' },
  { value: '10+', label: 'Features', description: 'Budgets, splits, recurring & more' },
  { value: '100%', label: 'Free to Start', description: 'No credit card required' },
  { value: '24/7', label: 'Access', description: 'Your data, anytime, anywhere' },
];

export default function HomeSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SparklesIcon className="h-10 w-10 text-brand-sage mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-brand-forest">Why FynBee?</h2>
          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
            Designed for modern families and shared households, FynBee brings clarity to group spending and budgeting.
            From daily groceries to monthly bills, track everything with ease, split expenses fairly, set budgets, and get
            real insight into where your money goes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-brand-cream border border-brand-sand">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-emerald mb-2">{stat.value}</div>
              <div className="text-base font-semibold text-gray-800 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
