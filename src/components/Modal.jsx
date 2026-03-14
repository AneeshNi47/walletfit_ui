import { useEffect } from 'react';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  useEffect(function () {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return function () {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(function () {
    document.body.classList.add('overflow-hidden');
    return function () {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className={'bg-white rounded-xl shadow-lg w-full ' + sizeClasses[size] + ' p-6 relative max-h-[90vh] overflow-y-auto animate-slide-up'}
        onClick={function (e) { e.stopPropagation(); }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
