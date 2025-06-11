const features = [
  "Real-time expense tracking",
  "Multiple wallet & account support",
  "Household-based reports",
  "Smart categorization",
  "Mobile & offline sync",
  "Secure login & data encryption",
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50 text-center">
      <h3 className="text-2xl font-bold mb-6">Features</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="p-4 bg-white rounded shadow hover:shadow-md transition">
            {feature}
          </div>
        ))}
      </div>
    </section>
  );
}
