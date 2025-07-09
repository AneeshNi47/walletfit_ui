import { EnvelopeIcon } from '@heroicons/react/24/solid';

export default function ContactUs() {
  return (
    <section id="contact" className="py-20 px-6 bg-white text-center">
      <div className="max-w-lg mx-auto bg-gray-50 rounded-xl shadow p-10 flex flex-col items-center">
        <EnvelopeIcon className="h-10 w-10 text-blue-400 mb-3 animate-pulse" />
        <h3 className="text-3xl font-extrabold mb-4 text-blue-700">Contact Us</h3>
        <p className="mb-6 text-gray-700 text-lg">Got a question or feedback? We’d love to hear from you.</p>
        <a href="mailto:support@walletfit.com" className="text-blue-600 underline text-lg font-medium hover:text-blue-800 transition">support@walletfit.com</a>
      </div>
    </section>
  );
}
