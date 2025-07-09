const tiers = [
  { name: 'Free', price: 0, features: ['1 Household', 'Basic Reports', 'Limited Accounts'], highlight: false },
  { name: 'Gold', price: 5, features: ['3 Households', 'Advanced Reports', 'Sync Across Devices'], highlight: true },
  { name: 'Premium', price: 12, features: ['Unlimited Households', 'All Features', 'Priority Support'], highlight: false },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-white text-center">
      <h3 className="text-3xl font-extrabold mb-10 text-blue-700">Pricing</h3>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`border rounded-2xl p-8 shadow-lg flex flex-col items-center transition relative bg-white
              ${tier.highlight ? 'border-blue-600 scale-105 z-10 shadow-2xl' : 'border-gray-200'}
            `}
          >
            {tier.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-semibold shadow">Most Popular</span>
            )}
            <h4 className="text-2xl font-bold text-blue-600 mb-2">{tier.name}</h4>
            <p className="text-4xl font-extrabold mb-4">${tier.price}<span className="text-lg font-medium text-gray-500">/mo</span></p>
            <ul className="text-base text-gray-700 space-y-2 mb-6">
              {tier.features.map((f, i) => <li key={i}>✅ {f}</li>)}
            </ul>
            <button
              className={`w-full py-3 rounded-lg font-semibold transition text-lg
                ${tier.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-blue-700 hover:bg-blue-200'}`}
            >
              {tier.price === 0 ? 'Start Free' : `Get ${tier.name}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
