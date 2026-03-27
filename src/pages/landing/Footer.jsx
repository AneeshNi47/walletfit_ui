const footerLinks = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#about', label: 'About Us' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '#faq', label: 'Help Center' },
      { href: '#contact', label: 'Report a Bug' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mb-3">
              <span role="img" aria-label="Wallet">💰</span> FynBee
            </h3>
            <p className="text-sm leading-relaxed">
              Your personal and household finance companion. Track, budget, split, and save — all in one place.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} FynBee by Brocode Solutions. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
