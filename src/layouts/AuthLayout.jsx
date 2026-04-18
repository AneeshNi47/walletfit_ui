import { CoinBeeMark } from '../components/ui/CoinBeeMark';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 relative overflow-hidden">
      {/* Honeycomb motif background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, var(--accent), transparent 28%), radial-gradient(circle at 80% 70%, var(--sage), transparent 32%), radial-gradient(circle at 50% 50%, var(--honey), transparent 40%)',
        }}
      />

      <div className="relative w-full max-w-[460px] bg-surface border border-border-soft rounded-xl shadow-lg p-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <CoinBeeMark size={40} />
          <div className="font-serif font-normal text-[24px] leading-none text-text-strong">
            Fynbee
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
