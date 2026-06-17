import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const sports = [
  {
    id: 'sport-basketball',
    title: 'Basketball',
    courts: '1 Court',
    hours: '8AM – 2AM',
    desc: 'Full-sized indoor basketball court with professional flooring, excellent lighting, and all the space you need for competitive or late-night play.',
    delay: 'reveal-delay-1',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
        <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /><path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'sport-badminton',
    title: 'Badminton',
    courts: '4 Courts',
    hours: '8AM – 11PM',
    desc: '4 dedicated badminton courts with premium flooring ideal for fast rallies, sharp footwork, and both casual matches and serious training sessions.',
    delay: 'reveal-delay-2',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
        <path d="M12 22V12" /><path d="M12 12 4 6" /><path d="M12 12l8-6" /><path d="M5 3h14" /><circle cx="12" cy="20" r="2" />
      </svg>
    ),
  },
  {
    id: 'sport-pickleball',
    title: 'Pickleball',
    courts: '4 Courts',
    hours: '8AM – 12AM',
    desc: '4 pickleball courts built for action and fun! Whether you\'re playing a friendly game or a competitive match, our courts offer the perfect setup for all skill levels.',
    delay: 'reveal-delay-3',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1" fill="currentColor" /><circle cx="16" cy="9" r="1" fill="currentColor" />
        <circle cx="8" cy="15" r="1" fill="currentColor" /><circle cx="16" cy="15" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'sport-billiards',
    title: 'Billiards',
    courts: '2 Tables',
    hours: '8AM – 2AM',
    desc: 'Two premium billiards tables for casual games and competitive play. Perfect for unwinding after your court session — open late until 2AM!',
    delay: 'reveal-delay-4',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <text x="12" y="14" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">8</text>
      </svg>
    ),
  },
];

const CourtIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function FacilitiesSection() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="facilities-section relative py-[100px] bg-navy-900 overflow-hidden" id="facilities">
      {/* Header */}
      <div className="reveal text-center mb-[60px] px-6">
        <span className="section-label-line inline-flex items-center font-display text-[0.85rem] font-semibold text-gold-500 uppercase tracking-[0.15em] mb-3">
          Facility Highlights
        </span>
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.1] mb-4">WHAT'S YOUR SPORT?</h2>
        <p className="text-[1.05rem] text-white/70 max-w-[600px] leading-[1.7] mx-auto">
          Choose your game. Our premium indoor courts are ready for you — fully lit, well-maintained, and packed with good vibes.
        </p>
      </div>

      {/* Sport Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto px-6">
        {sports.map(({ id, title, courts, hours, desc, delay, icon }) => (
          <div
            key={id}
            id={id}
            className={`reveal ${delay} relative bg-navy-700 border border-white/10 rounded-[20px] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/35 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(245,197,24,0.1)]`}
          >
            {/* Image area / fallback */}
            <div className="relative w-full aspect-[4/3] bg-navy-700 overflow-hidden flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-white/30">
                {icon}
                <span className="text-[0.9rem] font-medium text-white/50">{title} Court</span>
                <small className="text-[0.75rem] text-white/30">Image coming soon</small>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-700/80 to-transparent" />
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-3 flex-1">
              <h3 className="font-display text-[1.3rem] font-bold">{title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <CourtIcon /> {courts}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <ClockIcon /> {hours}
                </span>
              </div>
              <p className="text-[0.9rem] text-white/70 leading-[1.6] flex-1">{desc}</p>
              <Link
                to="/booking"
                className="mt-2 inline-flex items-center gap-1.5 text-gold-500 font-semibold text-[0.9rem] hover:gap-3 transition-all duration-200"
              >
                Book Now <ArrowIcon />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
