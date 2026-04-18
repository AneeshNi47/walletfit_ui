const VARIANTS = {
  primary:
    'bg-forest text-cream hover:bg-forest-d active:translate-y-0 shadow-sm hover:shadow-md border border-transparent',
  ghost:
    'bg-surface text-text-main border border-border-soft hover:border-border-mid hover:bg-surface-2',
  gold:
    'bg-accent text-forest-d hover:bg-accent-deep hover:text-cream border border-transparent shadow-sm hover:shadow-md',
  subtle:
    'bg-transparent text-text-muted hover:text-text-strong hover:bg-surface-tint border border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[12px] rounded-md',
  md: 'px-4 py-2.5 text-[13px] rounded-md',
  lg: 'px-5 py-3 text-[14px] rounded-md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
