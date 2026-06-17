import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

const contactDetails = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Call or Text',
    value: '0977 786 8842',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Location',
    value: 'Purok Mangga Tayud, Lilo-an, Cebu',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Operating Hours',
    value: 'Daily: 8:00 AM – 2:00 AM',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Booking Policy',
    value: 'Reserve at least 1 hour in advance. Walk-ins accepted subject to availability.',
  },
];

export default function ContactSection() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="contact-section relative py-[100px] bg-navy-900" id="contact">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Info */}
          <div className="reveal">
            <span className="section-label-line inline-flex items-center font-display text-[0.85rem] font-semibold text-gold-500 uppercase tracking-[0.15em] mb-3">Reservations</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.1] mb-4">BOOK YOUR COURT</h2>
            <p className="text-white/70 leading-[1.7] mb-8">
              Reserve your court in advance and guarantee your play time. Fill out the form or call us directly — we'll confirm your booking within minutes!
            </p>
            <div className="flex flex-col gap-5">
              {contactDetails.map(({ icon, title, value }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-gold-500" style={{ background: 'rgba(245,197,24,0.1)' }}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-[0.95rem] mb-0.5">{title}</h4>
                    <p className="text-[0.9rem] text-white/60">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="reveal bg-navy-700 border border-white/10 rounded-[20px] p-10 flex flex-col items-center justify-center text-center gap-5 shadow-card">
            <h3 className="font-display text-[1.6rem] font-bold">Ready to Play?</h3>
            <p className="text-white/70 text-[0.95rem] leading-[1.7]">
              Use our quick and easy online booking system to reserve your court for Basketball, Badminton, or Pickleball instantly.
            </p>
            <Link
              to="/booking"
              className="mt-2 inline-flex items-center gap-2.5 px-9 py-4 bg-gold-500 text-navy-900 font-display font-bold text-[1.05rem] uppercase tracking-[0.05em] rounded-xl shadow-button transition-all duration-200 hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-button-lg"
            >
              Book Online Now
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
