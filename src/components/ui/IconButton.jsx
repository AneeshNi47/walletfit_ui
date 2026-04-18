export function IconButton({
  as: Tag = 'button',
  className = '',
  size = 36,
  children,
  ...rest
}) {
  return (
    <Tag
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center bg-surface border border-border-soft text-text-muted hover:text-text-strong hover:border-border-mid hover:bg-surface-2 transition-all rounded-md focus-ring ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
