import { useEffect, useState } from 'react';

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hide = () => setTimeout(() => setHidden(true), 800);
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
    }
    // Fallback
    const fallback = setTimeout(() => setHidden(true), 3000);
    return () => {
      window.removeEventListener('load', hide);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-navy-900 flex items-center justify-center z-[99999] transition-all duration-700 ease-out ${
        hidden ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      <div className="text-center">
        <div
          className="w-[50px] h-[50px] rounded-full bg-gold-500 relative preloader-ball"
          style={{ animation: 'bounceBall 0.8s ease-in-out infinite alternate' }}
        />
      </div>
    </div>
  );
}
