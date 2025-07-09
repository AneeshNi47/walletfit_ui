import { SparklesIcon } from '@heroicons/react/24/solid';

export default function HomeSection() {
  return (
    <section className="py-20 px-6 bg-white text-center">
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <SparklesIcon className="h-10 w-10 text-blue-400 mx-auto animate-bounce" />
        </div>
        <h3 className="text-3xl font-extrabold mb-4 text-blue-700">Why WalletFit?</h3>
        <p className="max-w-2xl mx-auto text-gray-700 text-lg">
          Designed for modern families, WalletFit brings clarity to group spending and budgeting. From cab rides to grocery runs, track everything with ease and get insight into your spending habits.
        </p>
      </div>
    </section>
  );
}
