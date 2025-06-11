const tiers = [
  { name: 'Free', price: 0, features: ['1 Household', 'Basic Reports', 'Limited Accounts'] },
  { name: 'Gold', price: 5, features: ['3 Households', 'Advanced Reports', 'Sync Across Devices'] },
  { name: 'Premium', price: 12, features: ['Unlimited Households', 'All Features', 'Priority Support'] },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-white text-center">
      <h3 className="text-2xl font-bold mb-8">Pricing</h3>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <div key={tier.name} className="border rounded-lg p-6 shadow hover:shadow-lg transition">
            <h4 className="text-xl font-bold text-blue-600 mb-2">{tier.name}</h4>
            <p className="text-3xl font-semibold mb-4">${tier.price}/mo</p>
            <ul className="text-sm text-gray-700 space-y-2">
              {tier.features.map((f, i) => <li key={i}>✅ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
