import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

const features = [
  {
    id: 'feature-courts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gold-500">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Premium Courts',
    desc: 'Multiple well-maintained Basketball, Badminton, and Pickleball courts with professional-grade surfaces and equipment.',
    delay: 'reveal-delay-1',
  },
  {
    id: 'feature-safety',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gold-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Safe & Clean Facility',
    desc: 'Enjoy a well-maintained, sanitized environment where you can focus on your game worry-free.',
    delay: 'reveal-delay-2',
  },
  {
    id: 'feature-family',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gold-500">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Perfect for Friends & Family',
    desc: 'Great for group outings, team building, birthday parties, and casual weeknight sessions.',
    delay: 'reveal-delay-3',
  },
  {
    id: 'feature-lighting',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gold-500">
        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
    title: 'Well-Lit Courts',
    desc: 'Bright LED lighting ensures perfect visibility for day and night play sessions.',
    delay: 'reveal-delay-4',
  },
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="about-section relative py-[100px] bg-navy-800" id="about">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="reveal text-center mb-16">
          <span className="section-label-line inline-flex items-center font-display text-[0.85rem] font-semibold text-gold-500 uppercase tracking-[0.15em] mb-3">
            About Us
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.1] mb-4">
            PREMIUM COURTS. GREAT GAME.<br />GOOD VIBES.
          </h2>
          <p className="text-[1.05rem] text-white/70 max-w-[600px] leading-[1.7] mx-auto">
            Step into a world where fun and fitness collide. Budz Sports Hub is your go-to destination for an exciting sports experience in Lilo-an, Cebu.
          </p>
        </div>

        {/* Intro */}
        <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <p className="text-white/70 leading-[1.8]">
            Whether you're looking to shoot hoops, play a set of badminton, or smash in pickleball, our premium indoor courts are designed to deliver the best possible experience. With well-maintained surfaces and professional-grade equipment, every game feels just right.
          </p>
          <p className="text-white/70 leading-[1.8]">
            Our facility is more than just courts — it's a community hub where friends and families come together. Enjoy a safe, clean environment with bright LED lighting that lets you play from early morning through the night. Book your court today and discover why everyone's talking about Budz!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ id, icon, title, desc, delay }) => (
            <div
              key={id}
              id={id}
              className={`reveal ${delay} feature-card-top relative bg-navy-700 border border-white/10 rounded-[20px] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/30 hover:shadow-glow overflow-hidden`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,197,24,0.15)]"
                style={{ background: 'rgba(245,197,24,0.1)' }}>
                {icon}
              </div>
              <h3 className="font-display text-[1.1rem] font-bold mb-2.5">{title}</h3>
              <p className="text-[0.9rem] text-white/70 leading-[1.6]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
