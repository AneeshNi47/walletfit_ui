export function Eyebrow({ children, className = '', size = 'md' }) {
  const sizeClass =
    size === 'sm'
      ? 'text-[9.5px] tracking-[0.18em]'
      : size === 'lg'
        ? 'text-[11px] tracking-[0.12em]'
        : 'text-[10px] tracking-[0.12em]';
  return (
    <div className={`font-ui font-medium uppercase text-text-dim ${sizeClass} ${className}`}>
      {children}
    </div>
  );
}
