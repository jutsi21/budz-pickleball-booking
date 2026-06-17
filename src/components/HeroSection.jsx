import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const heroBgRef = useRef(null);
  const statCourtsRef = useRef(null);

  // Parallax
  useEffect(() => {
    const bg = heroBgRef.current;
    if (!bg || window.innerWidth <= 768) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        bg.style.transform = `translateY(${y * 0.3}px) scale(1.1)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stat counter
  useEffect(() => {
    const el = statCourtsRef.current;
    if (!el) return;
    const parent = el.closest('.hero-stats');
    if (!parent) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.textContent = '11';
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="home">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          ref={heroBgRef}
          src="/images/hero-bg.png"
          alt="Budz Sports Hub"
          className="hero-bg-img"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(135deg, rgba(6,14,30,0.92) 0%, rgba(10,22,40,0.75) 50%, rgba(6,14,30,0.60) 100%)' }}
      />

      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center pt-[100px]">
          {/* Text */}
          <div className="max-w-[580px]">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gold-500 text-[0.8rem] font-semibold uppercase tracking-[0.1em] mb-6"
              style={{ background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)', animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Premium Sports Courts • Lilo-an, Cebu
            </div>

            {/* Title */}
            <h1
              className="font-display text-[clamp(2.8rem,6vw,4.5rem)] font-black leading-[1.05] mb-5"
              style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}
            >
              PLAY.<br />
              <span className="text-gold-500 block" style={{ textShadow: '0 0 60px rgba(245,197,24,0.3)' }}>SMASH.</span>
              REPEAT.
            </h1>

            {/* Subtitle */}
            <p
              className="text-[1.15rem] text-white/70 leading-[1.7] mb-9 max-w-[480px]"
              style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both' }}
            >
              Fun for everyone! Experience premium indoor courts for Basketball, Badminton, and Pickleball
              with great lighting, clean facilities, and good vibes. Perfect for friends, family, and competitive play.
            </p>

            {/* Actions */}
            <div
              className="flex items-center gap-4 mb-12"
              style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
            >
              <Link
                to="/booking"
                id="hero-book-btn"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-gold-500 text-navy-900 font-display font-bold text-[1.05rem] uppercase tracking-[0.05em] rounded-xl shadow-button transition-all duration-200 hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-button-lg"
              >
                Book Now!
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a
                href="#rates"
                id="hero-rates-btn"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#rates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-transparent text-white font-display font-semibold text-[1.05rem] uppercase tracking-[0.05em] border-2 border-white/20 rounded-xl transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:-translate-y-0.5"
              >
                View Rates
              </a>
            </div>

            {/* Stats */}
            <div
              className="hero-stats flex gap-10"
              style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.6s both' }}
            >
              <div className="flex flex-col">
                <span ref={statCourtsRef} id="stat-courts" className="font-display text-[2rem] font-extrabold text-gold-500">11</span>
                <span className="text-[0.85rem] text-white/50 uppercase tracking-[0.05em]">Total Courts</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[2rem] font-extrabold text-gold-500">₱300</span>
                <span className="text-[0.85rem] text-white/50 uppercase tracking-[0.05em]">Starting Rate</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[2rem] font-extrabold text-gold-500">7 Days</span>
                <span className="text-[0.85rem] text-white/50 uppercase tracking-[0.05em]">Open Weekly</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="relative hidden lg:block"
            style={{ animation: 'fadeInRight 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both' }}
          >
            <img
              src="/images/player-action.png"
              alt="Pickleball player in action"
              className="rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            />
            <div className="hero-image-accent" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2"
        style={{ animation: 'fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 1s both' }}
      >
        <span className="text-[0.75rem] text-white/50 uppercase tracking-[0.15em]">Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
