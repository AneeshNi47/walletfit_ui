import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { IconButton } from './IconButton';

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <IconButton
      onClick={toggle}
      className={className}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </IconButton>
  );
}
