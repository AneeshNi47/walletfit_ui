export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-surface border border-border-soft rounded-lg shadow-sm p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardEyebrow({ children, className = '' }) {
  return (
    <div
      className={`font-ui uppercase text-[10px] tracking-[0.18em] text-text-dim ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`font-serif font-normal text-[24px] leading-tight text-text-strong ${className}`}>
      {children}
    </h3>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={className}>{children}</div>;
}
