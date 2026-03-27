import { Link } from 'react-router-dom';
import { ShieldCheckIcon, CreditCardIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import AnimatedLogo from '../../components/AnimatedLogo';

export default function Banner() {
  return (
    <section id="home" className="bg-gradient-to-br from-brand-forest via-brand-emerald to-brand-cream py-20 sm:py-32 text-center px-4 sm:px-6 relative overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <AnimatedLogo size={120} className="mb-8" />
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-brand-cream mb-6 drop-shadow-lg leading-tight">
          Manage Household Finances <span className="text-brand-gold">Smartly</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          FynBee helps families and groups track expenses, split costs, manage budgets, and stay on top of spending across wallets and bank accounts — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-brand-gold text-brand-forest-dark text-lg font-semibold rounded-full shadow-lg hover:bg-brand-amber hover:shadow-xl transition-all"
          >
            Get Started Free
          </Link>
          <a
            href="#how-it-works"
            className="inline-block px-8 py-4 bg-brand-cream text-brand-emerald text-lg font-semibold rounded-full shadow hover:bg-brand-cream transition-all border border-brand-sand"
          >
            See How It Works
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            <span>Bank-level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-brand-sage" />
            <span>Multi-account Support</span>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-indigo-500" />
            <span>Household Collaboration</span>
          </div>
        </div>
      </div>

      <div className="absolute top-10 left-10 w-48 h-48 bg-brand-mint rounded-full opacity-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-sage rounded-full opacity-30 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-mint rounded-full opacity-20 blur-3xl" />
    </section>
  );
}
