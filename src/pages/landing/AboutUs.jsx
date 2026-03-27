import { HeartIcon, LightBulbIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

const values = [
  {
    icon: <LightBulbIcon className="h-8 w-8 text-yellow-500" />,
    title: 'Simplicity First',
    description: 'We believe financial tools should be easy to use, not intimidating. FynBee is designed so anyone can start tracking in minutes.',
  },
  {
    icon: <HeartIcon className="h-8 w-8 text-red-400" />,
    title: 'Built for Families',
    description: 'From splitting rent with roommates to managing a family budget, FynBee is designed for people who share their financial lives.',
  },
  {
    icon: <GlobeAltIcon className="h-8 w-8 text-brand-sage" />,
    title: 'Privacy & Trust',
    description: 'Your financial data is yours. We use bank-level security, never sell your data, and give you full control over your information.',
  },
];

export default function AboutUs() {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-warm">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-forest mb-4">About FynBee</h2>
          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
            FynBee was born from a simple idea: managing shared finances shouldn't be stressful.
            Whether you're splitting bills with flatmates, budgeting as a family, or just trying to understand
            where your money goes, we built FynBee to make it effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-warm mb-5">
                {value.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Built with care by the <span className="font-semibold text-gray-700">Brocode Solutions</span> team.
          </p>
        </div>
      </div>
    </section>
  );
}
