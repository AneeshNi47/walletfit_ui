import '@testing-library/jest-dom';

// jsdom does not implement window.matchMedia, which useTheme()/useAccent() call on
// mount. Provide a minimal, inert polyfill so components that read the OS colour
// scheme can render in tests (defaults to light; no media changes are emitted).
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {}, // deprecated, kept for older consumers
    removeListener: () => {}, // deprecated
    dispatchEvent: () => false,
  });
}
