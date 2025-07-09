import { UsersIcon } from '@heroicons/react/24/solid';

export default function AboutUs() {
  return (
    <section id="about" className="py-20 px-6 bg-gray-50 text-center">
      <div className="flex flex-col items-center">
        <UsersIcon className="h-10 w-10 text-blue-400 mb-3 animate-pulse" />
        <h3 className="text-3xl font-extrabold mb-4 text-blue-700">About Us</h3>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg">
          WalletFit is built by a passionate team focused on simplifying financial collaboration. Whether you're sharing bills with flatmates or budgeting as a family, our goal is to help you save more and stress less.
        </p>
      </div>
    </section>
  );
}
