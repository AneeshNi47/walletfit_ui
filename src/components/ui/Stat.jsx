export function Stat({
  value,
  prefix,
  suffix,
  delta,
  deltaDirection = 'up',
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'text-[20px]',
    md: 'text-[28px]',
    lg: 'text-[40px]',
    xl: 'text-[56px]',
    hero: 'text-[72px]',
  };
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={`font-serif font-light tnum text-text-strong leading-none ${sizeClass}`}>
        {prefix && <span className="text-text-muted text-[0.5em] mr-2 font-ui tracking-wider uppercase">{prefix}</span>}
        {value}
        {suffix && <span className="text-text-dim text-[0.52em] ml-1">{suffix}</span>}
      </div>
      {delta && (
        <span
          className={`inline-flex items-center gap-1 font-ui font-medium text-[11px] px-3 py-1 rounded-pill w-fit ${
            deltaDirection === 'down'
              ? 'bg-[rgba(196,122,90,0.12)] text-clay'
              : 'bg-[rgba(245,200,66,0.12)] text-honey'
          }`}
        >
          {deltaDirection === 'down' ? '▼' : '▲'} {delta}
        </span>
      )}
    </div>
  );
}
