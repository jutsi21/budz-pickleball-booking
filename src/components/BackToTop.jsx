import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      id="backToTop"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`back-to-top fixed bottom-8 right-8 z-[999] w-12 h-12 bg-gold-500 text-navy-900 rounded-xl flex items-center justify-center shadow-button hover:bg-gold-400 hover:-translate-y-1 transition-all duration-300 ${
        visible ? 'visible' : ''
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
