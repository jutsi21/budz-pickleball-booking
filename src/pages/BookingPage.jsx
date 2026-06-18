import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, saveBooking } from '../lib/firebase.js';
import SuccessModal from '../components/SuccessModal.jsx';

const timeOptions = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
  '06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM',
  '11:00 PM','12:00 AM','01:00 AM',
];

const sportCapacities = {
  BADMINTON: 4,
  PICKLEBALL: 4,
  BASKETBALL: 1,
  BILLIARDS: 2,
};

const SPORT_EMOJI = {
  BADMINTON: '🏸',
  PICKLEBALL: '🏓',
  BASKETBALL: '🏀',
  BILLIARDS: '🎱',
};

const timeToHour24 = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours] = time.split(':');
  hours = parseInt(hours, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours;
};

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [bookingNumber, setBookingNumber] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSport, setSelectedSport] = useState('BADMINTON');
  const [selectedHours, setSelectedHours] = useState('1 Hour');
  const [isCustomHours, setIsCustomHours] = useState(false);
  const [customHours, setCustomHours] = useState('9');
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  
  const [occupiedSlots, setOccupiedSlots] = useState({});
  const [ratesConfig, setRatesConfig] = useState(null);
  const [calculatedRate, setCalculatedRate] = useState(0);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const getHoursNum = () => {
    if (isCustomHours) return parseInt(customHours, 10) || 1;
    return parseInt(selectedHours.split(' ')[0], 10) || 1;
  };

  // Fetch Rates Configuration on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const docRef = await getDoc(doc(db, 'settings', 'rates'));
        if (docRef.exists()) {
          setRatesConfig(docRef.data());
        }
      } catch (err) {
        console.error('Failed to fetch rates config:', err);
      }
    };
    fetchRates();
  }, []);

  // Fetch availability when date/sport changes
  useEffect(() => {
    if (!selectedDate || !selectedSport) return;

    const fetchAvailability = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('date', '==', selectedDate),
          where('sport', '==', selectedSport),
          where('status', '==', 'confirmed')
        );
        const snap = await getDocs(q);
        
        const slotCounts = {};
        snap.docs.forEach((docSnap) => {
          const b = docSnap.data();
          const startIdx = timeOptions.indexOf(b.time);
          const hours = parseInt(b.hours.split(' ')[0], 10) || 1;
          
          if (startIdx !== -1) {
            for (let i = 0; i < hours; i++) {
              const t = timeOptions[startIdx + i];
              if (t) slotCounts[t] = (slotCounts[t] || 0) + 1;
            }
          }
        });
        
        setOccupiedSlots(slotCounts);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedSport]);

  // Calculate Dynamic Rate
  useEffect(() => {
    if (!ratesConfig) return;
    
    let baseRate = Number(ratesConfig[selectedSport]) || 0;
    const hoursNum = getHoursNum();
    const startHour = timeToHour24(selectedTime);
    
    const pStart = Number(ratesConfig.primeStartHour) || 17;
    const pEnd = Number(ratesConfig.primeEndHour) || 22;

    if (startHour >= pStart && startHour < pEnd) {
      if (ratesConfig.primeRates && ratesConfig.primeRates[selectedSport]) {
        baseRate = Number(ratesConfig.primeRates[selectedSport]);
      }
    }

    setCalculatedRate(baseRate * hoursNum);
  }, [selectedSport, selectedHours, selectedTime, ratesConfig, isCustomHours, customHours]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    
    // Explicitly attach the calculated rate, overriding any tampered input
    data.rate = calculatedRate;
    
    if (isCustomHours) {
      data.hours = `${customHours} Hours`;
    }

    try {
      const result = await saveBooking(data);
      setBookingNumber(result.bookingNumber);
      form.reset();
      setSelectedDate('');
      setOccupiedSlots({});
      setIsCustomHours(false);
      setSelectedHours('1 Hour');
      setCustomHours('9');
    } catch (err) {
      console.error('❌ Booking save failed:', err);
      alert('Sorry, something went wrong saving your booking.');
    } finally {
      setLoading(false);
    }
  };

  const maxCapacity = sportCapacities[selectedSport];

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <Link to="/" className="fixed top-6 left-6 inline-flex items-center gap-2 text-white/60 hover:text-gold-500 transition-colors text-[0.9rem] font-medium z-50">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-[580px] bg-navy-700 border border-white/10 rounded-[24px] overflow-hidden shadow-lg mt-12">
        <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gold-500/10 border border-gold-500/20">
            {SPORT_EMOJI[selectedSport] || '🏀'}
          </div>
          <div>
            <h2 className="font-display text-[1.4rem] font-bold text-white">Book a Court</h2>
            <p className="text-[0.85rem] text-white/50 mt-0.5">Fill in the details to reserve your spot</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="widget-form p-8 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-date" className="text-[0.8rem] font-semibold text-white/60 uppercase">Date</label>
              <input type="date" id="w-date" name="date" min={minDate} required 
                     className="[color-scheme:dark]"
                     value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-sport" className="text-[0.8rem] font-semibold text-white/60 uppercase">Sport</label>
              <select id="w-sport" name="sport" required 
                      value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}>
                <option value="BADMINTON">BADMINTON</option>
                <option value="PICKLEBALL">PICKLEBALL</option>
                <option value="BASKETBALL">BASKETBALL</option>
                <option value="BILLIARDS">BILLIARDS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-hours" className="text-[0.8rem] font-semibold text-white/60 uppercase">Hours</label>
              {!isCustomHours ? (
                <select id="w-hours" name="hours" required
                        value={selectedHours} 
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setIsCustomHours(true);
                          } else {
                            setSelectedHours(e.target.value);
                          }
                        }}>
                  {['1 Hour','2 Hours','3 Hours','4 Hours','5 Hours','6 Hours','7 Hours','8 Hours'].map((h) => <option key={h} value={h}>{h}</option>)}
                  <option value="custom">More than 8 Hours...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    id="w-hours" 
                    required 
                    min="9" 
                    max="24"
                    value={customHours} 
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="w-full"
                  />
                  <button 
                    type="button" 
                    onClick={() => { 
                      setIsCustomHours(false); 
                      setSelectedHours('1 Hour'); 
                    }} 
                    className="px-3 bg-red-500 text-white rounded-md font-bold"
                  >
                    X
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-time" className="text-[0.8rem] font-semibold text-white/60 uppercase">Play Time</label>
              <select id="w-time" name="time" required
                      value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                {timeOptions.map((t) => {
                  const count = occupiedSlots[t] || 0;
                  const isFull = count >= maxCapacity;
                  const isLimited = count > 0 && count < maxCapacity;
                  const label = isFull ? ' (Full)' : isLimited ? ' (Limited)' : '';
                  return (
                    <option key={t} value={t} disabled={isFull}>
                      {t}{label}
                    </option>
                  );
                })}
              </select>
              {/* Availability Legend */}
              {selectedDate && (
                <div className="flex gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[0.72rem] text-white/50">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>
                    Available
                  </span>
                  <span className="flex items-center gap-1 text-[0.72rem] text-white/50">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>
                    Limited
                  </span>
                  <span className="flex items-center gap-1 text-[0.72rem] text-white/50">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>
                    Fully Booked
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-rate" className="text-[0.8rem] font-semibold text-white/60 uppercase">Rate (₱)</label>
              <input 
                type="number" 
                id="w-rate" 
                name="rate" 
                readOnly 
                value={calculatedRate}
                className="bg-navy-900/50 cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="w-name" className="text-[0.8rem] font-semibold text-white/60 uppercase">Name</label>
            <input type="text" id="w-name" name="name" placeholder="Your full name" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="w-email" className="text-[0.8rem] font-semibold text-white/60 uppercase">Email</label>
            <input type="email" id="w-email" name="email" placeholder="your@email.com" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="w-mobile" className="text-[0.8rem] font-semibold text-white/60 uppercase">Mobile Number</label>
            <input type="tel" id="w-mobile" name="mobile" placeholder="09XX XXX XXXX" required />
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" id="w-waiver" name="waiver" required className="mt-0.5 w-4 h-4 accent-yellow-400 cursor-pointer flex-shrink-0" />
            <label htmlFor="w-waiver" className="text-[0.85rem] text-white/60 leading-[1.5] cursor-pointer">
              I have read the <a href="#" className="text-gold-500 underline hover:text-gold-400">Team Waiver of Liability.</a>
            </label>
          </div>

          <button type="submit" disabled={loading} className="mt-1 w-full py-4 bg-gold-500 text-navy-900 font-display font-bold text-[1rem] uppercase rounded-xl hover:bg-gold-400 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors">
            {loading ? 'Processing…' : 'Book Now'}
          </button>
        </form>
      </div>

      <SuccessModal bookingNumber={bookingNumber} onClose={() => setBookingNumber(null)} />
    </div>
  );
}
