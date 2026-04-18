const VARIANTS = {
  personal: 'bg-[rgba(74,140,106,0.14)] text-sage',
  shared:   'bg-accent-soft text-amber',
  income:   'bg-[rgba(30,107,74,0.12)] text-emerald',
  expense:  'bg-[rgba(196,122,90,0.14)] text-clay',
  neutral:  'bg-surface-2 text-text-muted',
  warn:     'bg-[rgba(232,168,48,0.14)] text-amber',
  gold:     'bg-[rgba(232,168,48,0.14)] text-accent-deep',
};

export function Chip({ variant = 'neutral', children, className = '' }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 font-ui font-medium text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-pill ${v} ${className}`}
    >
      {children}
    </span>
  );
}
