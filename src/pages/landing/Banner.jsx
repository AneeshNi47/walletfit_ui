export default function Banner() {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-400 via-blue-200 to-white py-28 text-center px-6 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-6 drop-shadow-lg leading-tight">
          Manage Household Finances <span className="text-blue-500">Smartly</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          WalletFit helps families and groups track expenses, split costs, and stay on top of spending across wallets and bank accounts.
        </p>
        <a href="#features" className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow hover:bg-blue-700 transition">
          Get Started Free
        </a>
      </div>
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-2xl -z-1 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-56 h-56 bg-blue-100 rounded-full opacity-40 blur-2xl -z-1 animate-pulse" />
    </section>
  );
}
