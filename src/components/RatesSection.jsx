import { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

/* ---- Icons ---- */
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/* ---- Data ---- */
const tabs = [
  {
    id: 'badminton',
    label: 'Badminton',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 22V12" /><path d="M12 12 4 6" /><path d="M12 12l8-6" /><path d="M5 3h14" /><circle cx="12" cy="20" r="2" />
      </svg>
    ),
    courts: '4 Courts', hours: '8AM – 11PM', days: 'Mon – Sun',
    tagline: 'Affordable hourly rates for everyone!',
    description: 'Morning rally or late-night session — our 4 badminton courts are ready. Book ahead to secure your slot!',
    tableHeader: 'Court Rate',
    note: 'Walk-ins accepted subject to availability. Book in advance for guaranteed slots.',
  },
  {
    id: 'pickleball',
    label: 'Pickleball',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1" fill="currentColor" /><circle cx="16" cy="9" r="1" fill="currentColor" />
        <circle cx="8" cy="15" r="1" fill="currentColor" /><circle cx="16" cy="15" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    courts: '4 Courts', hours: '8AM – 12AM', days: 'Mon – Sun',
    tagline: 'Affordable hourly rates for everyone!',
    description: 'Play all day and into midnight! Our 4 pickleball courts offer great rates for friendly games and competitive matches alike.',
    tableHeader: 'Court Rate',
    note: 'Walk-ins accepted subject to availability. Book in advance for guaranteed slots.',
  },
  {
    id: 'basketball',
    label: 'Basketball',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /><path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    courts: '1 Court', hours: '8AM – 2AM', days: 'Mon – Sun',
    tagline: 'Affordable hourly rates for everyone!',
    description: 'Full-sized indoor court open until 2AM. Shoot hoops all day or enjoy a late-night game under the lights!',
    tableHeader: 'Court Rate',
    note: 'Walk-ins accepted subject to availability. Book in advance for guaranteed slots.',
  },
  {
    id: 'billiards',
    label: 'Billiards',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    courts: '2 Tables', hours: '8AM – 2AM', days: 'Mon – Sun',
    tagline: 'Affordable hourly rates for everyone!',
    description: 'Two premium billiards tables for casual games and competitive play. Perfect for unwinding after your court session — open late until 2AM!',
    tableHeader: 'Table Rate',
    note: 'Walk-ins accepted subject to availability. Book in advance for guaranteed table slots.',
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
const CalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1">
      {icon} {text}
    </span>
  );
}

function RateCard({ icon, schedule, price, unit }) {
  return (
    <div className="bg-navy-800 border border-white/10 rounded-[14px] p-5 flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-gold-500" style={{ background: 'rgba(245,197,24,0.1)' }}>
        {icon}
      </div>
      <div className="text-[0.8rem] text-white/50">{schedule}</div>
      <div className="font-display text-[1.8rem] font-extrabold text-gold-500">
        <span className="text-[1rem]">₱</span>{price}
      </div>
      <div className="text-[0.75rem] text-white/40">{unit}</div>
    </div>
  );
}

export default function RatesSection() {
  const [activeTab, setActiveTab] = useState('badminton');
  const [ratesConfig, setRatesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const docRef = await getDoc(doc(db, 'settings', 'rates'));
        if (docRef.exists()) {
          setRatesConfig(docRef.data());
        }
      } catch (err) {
        console.error('Failed to fetch rates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const current = tabs.find((t) => t.id === activeTab);

  const sportKey = current.id.toUpperCase();
  const dayRate = ratesConfig?.[sportKey] || 300;
  const nightRate = ratesConfig?.primeRates?.[sportKey] || 350;

  const formatHour = (hour24) => {
    const h = hour24 % 12 || 12;
    const ampm = hour24 >= 12 && hour24 < 24 ? 'PM' : 'AM';
    return `${h}:00 ${ampm}`;
  };

  const pStartStr = ratesConfig ? formatHour(ratesConfig.primeStartHour) : '5:00 PM';
  const pEndStr = ratesConfig ? formatHour(ratesConfig.primeEndHour) : '12:00 AM';

  return (
    <section ref={sectionRef} className="rates-section relative py-[100px] bg-navy-800" id="rates">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="reveal text-center mb-10">
          <span className="section-label-line inline-flex items-center font-display text-[0.85rem] font-semibold text-gold-500 uppercase tracking-[0.15em] mb-3">Pricing</span>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.1] mb-4">COURT RATES</h2>
          <p className="text-[1.05rem] text-white/70 max-w-[600px] leading-[1.7] mx-auto">
            Select your sport below to view specific rates, schedules, and available hours.
          </p>
        </div>

        {/* Tabs */}
        <div className="reveal flex flex-wrap gap-2 justify-center mb-8" id="ratesTabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display font-semibold text-[0.9rem] uppercase tracking-[0.05em] border transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-navy-900 border-gold-500 shadow-button'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-navy-700 border border-white/10 rounded-[20px] overflow-hidden min-h-[400px] relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-navy-700 z-10">
               <div className="text-gold-500 font-display font-bold text-xl animate-pulse">Loading Rates...</div>
             </div>
          ) : null}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Info */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge icon={<CourtIcon />} text={current.courts} />
                <Badge icon={<ClockIcon />} text={current.hours} />
                <Badge icon={<CalIcon />} text={current.days} />
              </div>
              <p className="font-display text-[1.1rem] font-semibold text-gold-500 mb-2">{current.tagline}</p>
              <p className="text-[0.9rem] text-white/70 leading-[1.6] mb-6">{current.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <RateCard icon={<SunIcon />} schedule={`8:00 AM – ${pStartStr}`} price={dayRate} unit="per hour / per court" />
                <RateCard icon={<MoonIcon />} schedule={`${pStartStr} – ${pEndStr}`} price={nightRate} unit="per hour / per court" />
              </div>
            </div>

            {/* Table */}
            <div>
              <table className="rates-table">
                <thead>
                  <tr>
                    <th>{current.tableHeader}</th>
                    <th>Schedule</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="rate-highlight">₱{dayRate} PHP</td>
                    <td>Monday to Sunday</td>
                    <td>8:00 AM to {pStartStr}</td>
                  </tr>
                  <tr>
                    <td className="rate-highlight">₱{nightRate} PHP</td>
                    <td>Monday to Sunday</td>
                    <td>{pStartStr} to {pEndStr}</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 border-t border-white/10">
                <p className="text-[0.85rem] text-white/50 leading-[1.6]">
                  <strong className="text-gold-500">Note:</strong> {current.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
