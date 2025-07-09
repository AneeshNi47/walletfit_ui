import { CheckCircleIcon, DevicePhoneMobileIcon, LockClosedIcon, UsersIcon, ChartBarIcon, WalletIcon } from '@heroicons/react/24/solid';

const features = [
  { icon: <CheckCircleIcon className="h-8 w-8 text-green-500 mb-2" />, text: "Real-time expense tracking" },
  { icon: <WalletIcon className="h-8 w-8 text-blue-500 mb-2" />, text: "Multiple wallet & account support" },
  { icon: <ChartBarIcon className="h-8 w-8 text-indigo-500 mb-2" />, text: "Household-based reports" },
  { icon: <UsersIcon className="h-8 w-8 text-pink-500 mb-2" />, text: "Smart categorization" },
  { icon: <DevicePhoneMobileIcon className="h-8 w-8 text-yellow-500 mb-2" />, text: "Mobile & offline sync" },
  { icon: <LockClosedIcon className="h-8 w-8 text-gray-500 mb-2" />, text: "Secure login & data encryption" },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50 text-center">
      <h3 className="text-3xl font-extrabold mb-8 text-blue-700">Features</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="p-6 bg-white rounded-xl shadow hover:shadow-xl transition group border border-blue-50 flex flex-col items-center">
            {feature.icon}
            <span className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition">{feature.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
