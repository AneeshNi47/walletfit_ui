import { useTheme } from '../../hooks/useTheme';

export function CoinBeeMark({
  size = 28,
  variant = 'icon',
  animated = false,
  forceTheme,
  className = '',
}) {
  const { theme } = useTheme();
  const effective = forceTheme || theme;
  const suffix = effective === 'dark' ? 'dark' : 'light';
  const src = variant === 'lockup'
    ? `/brand/fynbee-lockup-${suffix}.svg`
    : `/brand/fynbee-icon-${suffix}.svg`;
  const height = variant === 'lockup' ? size * 0.64 : size;
  const width = variant === 'lockup' ? size * 3.6 : size;
  return (
    <img
      src={src}
      alt="Fynbee"
      width={width}
      height={height}
      className={`${animated ? 'animate-[float_6s_ease-in-out_infinite]' : ''} ${className}`}
      style={{ display: 'inline-block' }}
    />
  );
}
