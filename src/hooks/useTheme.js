import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return (
      localStorage.getItem('fynbee-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fynbee-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, setTheme, toggle };
}

export function useAccent() {
  const [accent, setAccent] = useState(() => {
    if (typeof window === 'undefined') return 'gold';
    return localStorage.getItem('fynbee-accent') || 'gold';
  });

  useEffect(() => {
    if (accent === 'gold') {
      delete document.documentElement.dataset.accent;
    } else {
      document.documentElement.dataset.accent = accent;
    }
    localStorage.setItem('fynbee-accent', accent);
  }, [accent]);

  return { accent, setAccent };
}
