import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, Split, PiggyBank, Users, LineChart, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { CoinBeeMark } from '../components/ui/CoinBeeMark';

const FEATURES = [
  { Icon: Wallet, title: 'Track every dirham', body: 'Every account, every transaction, one clear picture. Auto-categorized and sortable by household or person.' },
  { Icon: Split, title: 'Split without the spreadsheet', body: 'Share expenses with housemates or family. Fynbee keeps the tally — and quietly settles it up.' },
  { Icon: PiggyBank, title: 'Budgets that breathe', body: 'Monthly goals that adapt to real life. See at a glance when a category is nearing the line.' },
  { Icon: Users, title: 'Built for households', body: 'Parents, partners, roommates — invite anyone and assign roles. Shared visibility, private detail.' },
  { Icon: LineChart, title: 'Reports you understand', body: 'Weekly and monthly rollups in plain language. Export as PDF or CSV in one click.' },
  { Icon: Shield, title: 'Yours alone', body: 'Bank-grade encryption, no ads, no data sold. You own every transaction, exportable anytime.' },
];

const PLANS = [
  {
    name: 'Free', price: '0', cadence: '/ forever',
    perks: ['1 household', 'Up to 3 accounts', 'Budgets + expenses', 'Email support'],
    cta: 'Start free',
  },
  {
    name: 'Pro', price: '29', cadence: '/ month',
    perks: ['Unlimited households', 'Unlimited accounts', 'Recurring + splits', 'Reports + export', 'Priority support'],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Max', price: '49', cadence: '/ month',
    perks: ['All Pro features', 'Telegram integration', 'AI narratives', 'Custom categories', 'White-glove onboarding'],
    cta: 'Talk to us',
  },
];

const FAQS = [
  { q: 'Do I need to connect my bank?', a: 'No. Fynbee runs fine with manual entries, and you can import CSV or Excel at any time.' },
  { q: 'Can multiple people use one household?', a: 'Yes — invite anyone, and assign viewer or member roles. Owners can also create sub-accounts.' },
  { q: 'Is my data private?', a: 'Your data is yours. We never sell it, and you can export or delete your household at any time.' },
  { q: 'What currencies are supported?', a: 'Everything Fynbee stores is per-profile: AED, USD, INR, and more. Mixed-currency households work too.' },
];

export default function Landing() {
  return (
    <div className="bg-bg text-text-main">
      <Helmet>
        <title>Fynbee — Household finance for the whole hive</title>
        <meta name="description" content="Fynbee helps households track spending, split shared costs, and run budgets that adapt to real life. From Abu Dhabi, for your hive." />
        <link rel="canonical" href="https://fynbee.app/" />
      </Helmet>

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <CoinBeeMark size={26} />
            <span className="font-serif text-[20px] text-text-strong">Fynbee</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 ml-10 font-sans text-[13px] text-text-muted">
            <a href="#features" className="hover:text-text-strong">Features</a>
            <a href="#pricing" className="hover:text-text-strong">Pricing</a>
            <a href="#household" className="hover:text-text-strong">For households</a>
            <Link to="/login" className="hover:text-text-strong">Sign in</Link>
          </nav>
          <div className="flex-1" />
          <Button variant="gold" size="md" as={Link} to="/register">Get started</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 md:py-32">
        <div className="forest-gradient text-cream rounded-xl shadow-hero p-12 md:p-20 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 20%, var(--accent), transparent 30%), radial-gradient(circle at 80% 80%, var(--honey), transparent 40%)',
            }}
          />
          <div className="relative max-w-3xl">
            <div className="font-ui uppercase text-[11px] tracking-[0.18em] text-foam/60 mb-4">
              From Abu Dhabi · for your hive
            </div>
            <h1 className="font-serif font-light text-[48px] md:text-[72px] leading-[1.05] tracking-[-0.02em] text-cream">
              Household finance that{' '}
              <span className="italic text-honey">hums</span> in the background.
            </h1>
            <p className="font-sans text-[17px] md:text-[20px] text-mint mt-6 max-w-2xl">
              Track accounts, split shared costs, and run budgets that bend with real life. Fynbee gathers it all so you can just live.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <Button variant="gold" size="lg" as={Link} to="/register">
                Start free <ArrowRight size={16} />
              </Button>
              <Button variant="ghost" size="lg" as="a" href="#features" className="!bg-white/5 !text-cream !border-white/20 hover:!bg-white/10">
                See how it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Eyebrow size="lg">What it does</Eyebrow>
          <h2 className="font-serif text-[36px] md:text-[48px] leading-tight text-text-strong mt-3">
            Everything your hive{' '}
            <span className="italic text-accent-deep">needs</span>, nothing it doesn&apos;t.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="bg-surface border border-border-soft rounded-lg p-7 hover:border-border-mid hover:-translate-y-px transition-all">
              <div className="w-10 h-10 rounded-md bg-[rgba(232,168,48,0.14)] text-accent-deep flex items-center justify-center mb-4">
                <Icon size={18} />
              </div>
              <h3 className="font-serif text-[22px] text-text-strong mb-2">{title}</h3>
              <p className="font-sans text-[14.5px] text-text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Household callout */}
      <section id="household" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-square bg-surface-2 border border-border-soft rounded-xl flex items-center justify-center relative overflow-hidden">
            <CoinBeeMark size={180} animated className="opacity-80" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--honey), transparent 60%)' }}
            />
          </div>
          <div>
            <Eyebrow>For households</Eyebrow>
            <blockquote className="font-serif italic text-[28px] md:text-[36px] leading-tight text-text-strong mt-4">
              &ldquo;Three of us, one hive, and no more passive-aggressive spreadsheets at the end of the month.&rdquo;
            </blockquote>
            <p className="font-sans text-[14px] text-text-muted mt-4">
              — Meera, Fynbee user since 2025
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Eyebrow size="lg">Pricing</Eyebrow>
          <h2 className="font-serif text-[36px] md:text-[48px] leading-tight text-text-strong mt-3">
            Simple, <span className="italic text-accent-deep">honest</span> plans.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-surface rounded-xl p-8 flex flex-col ${
                plan.highlight
                  ? 'border-2 border-accent shadow-lg'
                  : 'border border-border-soft'
              }`}
            >
              {plan.highlight && <Eyebrow className="text-accent-deep mb-2">Most popular</Eyebrow>}
              <h3 className="font-serif text-[24px] text-text-strong">{plan.name}</h3>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-[48px] tnum text-text-strong">AED {plan.price}</span>
                <span className="font-ui text-[11px] tracking-[0.1em] uppercase text-text-dim">{plan.cadence}</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.perks.map((perk) => (
                  <li key={perk} className="font-sans text-[13.5px] text-text-main flex gap-2">
                    <span className="text-sage shrink-0">✓</span> {perk}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? 'gold' : 'ghost'}
                size="md"
                as={Link}
                to="/register"
                className="mt-8 w-full justify-center"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[900px] mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <Eyebrow size="lg">Questions</Eyebrow>
          <h2 className="font-serif text-[36px] md:text-[42px] leading-tight text-text-strong mt-3">
            Good to know.
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group bg-surface border border-border-soft rounded-lg p-6 hover:border-border-mid"
            >
              <summary className="cursor-pointer font-serif text-[18px] text-text-strong flex items-center justify-between">
                {f.q}
                <span className="font-ui text-accent-deep text-[18px] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="font-sans text-[14px] text-text-muted leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        <div className="forest-gradient text-cream rounded-xl p-12 md:p-20 text-center shadow-hero">
          <h2 className="font-serif font-light text-[36px] md:text-[48px] leading-tight text-cream max-w-2xl mx-auto">
            Ready to let your money <span className="italic text-honey">breathe</span>?
          </h2>
          <div className="mt-8">
            <Button variant="gold" size="lg" as={Link} to="/register">
              Create your hive <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-soft">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px] font-sans text-text-muted">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <CoinBeeMark size={22} />
              <span className="font-serif text-[18px] text-text-strong">Fynbee</span>
            </Link>
            <p className="text-[12.5px]">From Abu Dhabi, for your hive.</p>
          </div>
          <div>
            <div className="font-ui uppercase text-[10px] tracking-[0.14em] text-text-dim mb-3">Product</div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-text-strong">Features</a></li>
              <li><a href="#pricing" className="hover:text-text-strong">Pricing</a></li>
              <li><a href="#household" className="hover:text-text-strong">For households</a></li>
            </ul>
          </div>
          <div>
            <div className="font-ui uppercase text-[10px] tracking-[0.14em] text-text-dim mb-3">Account</div>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-text-strong">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-text-strong">Create account</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-ui uppercase text-[10px] tracking-[0.14em] text-text-dim mb-3">Company</div>
            <ul className="space-y-2">
              <li><a href="mailto:hello@fynbee.app" className="hover:text-text-strong">Contact</a></li>
              <li><a href="#" className="hover:text-text-strong">Privacy</a></li>
              <li><a href="#" className="hover:text-text-strong">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border-soft py-5 text-center font-ui text-[11px] tracking-[0.08em] uppercase text-text-dim">
          © {new Date().getFullYear()} Fynbee · All rights reserved
        </div>
      </footer>
    </div>
  );
}
