// Shared form-control styling so modal forms match the app's design language
// (themed surfaces, soft borders, muted placeholders) instead of a stark white box.

export const fieldClass =
  'w-full px-3.5 py-2.5 bg-surface border border-border-soft rounded-lg text-[14px] ' +
  'text-text-main placeholder:text-text-dim focus:outline-none focus:border-border-mid ' +
  'focus-ring transition-colors';

export const labelClass =
  'block text-[11px] font-ui uppercase tracking-[0.12em] text-text-muted mb-1.5';

// react-select styles bound to the theme's CSS variables so the control, menu and
// options adapt to light/dark automatically.
export const reactSelectTheme = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    borderColor: state.isFocused ? 'var(--border-mid)' : 'var(--border)',
    borderRadius: '0.5rem',
    minHeight: '42px',
    boxShadow: 'none',
    ':hover': { borderColor: 'var(--border-mid)' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-mid)',
    zIndex: 60,
  }),
  menuList: (base) => ({ ...base, backgroundColor: 'var(--surface)' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--surface-2)' : 'transparent',
    color: 'var(--text-strong)',
    cursor: 'pointer',
    ':active': { backgroundColor: 'var(--surface-2)' },
  }),
  singleValue: (base) => ({ ...base, color: 'var(--text-strong)' }),
  input: (base) => ({ ...base, color: 'var(--text-strong)' }),
  placeholder: (base) => ({ ...base, color: 'var(--text-dim)' }),
  dropdownIndicator: (base) => ({ ...base, color: 'var(--text-dim)' }),
  clearIndicator: (base) => ({ ...base, color: 'var(--text-dim)' }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: 'var(--border)' }),
};
