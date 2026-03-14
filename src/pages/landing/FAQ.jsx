import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const faqs = [
  {
    question: 'What is WalletFit?',
    answer: 'WalletFit is a personal and household finance management app. It helps you track expenses, manage multiple accounts, set budgets, split costs with household members, and generate detailed financial reports.',
  },
  {
    question: 'Is WalletFit free to use?',
    answer: 'Yes! You can start with our Free plan which includes expense tracking, income tracking, budget alerts, and basic reports. Upgrade to Gold or Premium for advanced features like expense splitting, recurring transactions, and Excel/PDF exports.',
  },
  {
    question: 'What is a Household?',
    answer: 'A Household is a group feature that lets you share financial visibility with family members, roommates, or partners. The household owner can invite members by email. Shared expenses are visible to all members, and you can split costs fairly.',
  },
  {
    question: 'How does expense splitting work?',
    answer: 'When you create an expense, you can split it among household members either equally or with custom amounts. Each member sees their share, and you can mark shares as paid. The balance summary shows who owes whom at a glance.',
  },
  {
    question: 'What account types are supported?',
    answer: 'WalletFit supports Wallets, Bank Accounts, Tap & Pay Cards, Cash, and a general Other category. Each account tracks its own balance, top-ups, transfers, and expenses independently.',
  },
  {
    question: 'Can I set budgets?',
    answer: 'Yes. You can create budgets per spending category with weekly, monthly, or yearly limits. WalletFit tracks your spending against each budget and sends alerts when you reach 80% of the limit, helping you avoid overspending.',
  },
  {
    question: 'How do recurring transactions work?',
    answer: 'You can set up recurring expenses (like subscriptions or rent) and recurring income (like salary). Choose a frequency (daily, weekly, monthly, yearly) and a next due date. WalletFit shows upcoming transactions due within the next 7 days on your dashboard.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes. The Reports page lets you filter transactions by account, type, category, amount, and date range. You can export the filtered results as an Excel spreadsheet (.xlsx) or a formatted PDF document.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Absolutely. WalletFit uses JWT authentication with token rotation and blacklisting. All data is transmitted over HTTPS, passwords are hashed, and each user can only access their own data. Household data is shared only with invited members.',
  },
  {
    question: 'Can I use WalletFit on my phone?',
    answer: 'The web app is fully responsive and works great on mobile browsers. A dedicated Flutter mobile app is also in development for an even better mobile experience.',
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-medium text-gray-800 pr-4">{faq.question}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about WalletFit. Can't find an answer? <a href="#contact" className="text-blue-600 hover:underline">Contact us</a>.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
