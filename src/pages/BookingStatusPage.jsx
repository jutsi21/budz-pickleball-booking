import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Approval',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    dot: 'bg-amber-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    message: 'Your booking is under review. Our team will contact you for payment and confirmation.',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    dot: 'bg-green-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    message: 'Your booking is confirmed! Please arrive on time and bring your reference number.',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    dot: 'bg-red-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    message: 'Your booking request was not approved. Please contact us for more information.',
  },
  expired: {
    label: 'Expired',
    color: 'text-gray-400',
    bg: 'bg-gray-400/10 border-gray-400/30',
    dot: 'bg-gray-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
    message: 'This booking has expired. Please submit a new booking request.',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    dot: 'bg-blue-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    message: 'This booking has been completed. Thank you for playing with us!',
  },
};

const SPORT_EMOJI = {
  BADMINTON: '🏸',
  PICKLEBALL: '🏓',
  BASKETBALL: '🏀',
  BILLIARDS: '🎱',
};

export default function BookingStatusPage() {
  const [refInput, setRefInput] = useState('');
  const [booking, setBooking] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = refInput.trim().toUpperCase();
    if (!trimmed) return;

    setSearching(true);
    setError('');
    setBooking(null);

    try {
      const q = query(
        collection(db, 'bookings'),
        where('bookingNumber', '==', trimmed)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No booking found with that reference number. Please double-check and try again.');
      } else {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setBooking(data);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setBooking(null);
    setError('');
    setRefInput('');
  };

  const handleCopy = async () => {
    if (!booking) return;
    try {
      await navigator.clipboard.writeText(booking.bookingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const statusCfg = booking ? (STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending) : null;

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      {/* Back link */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 text-white/60 hover:text-gold-500 transition-colors text-[0.9rem] font-medium z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-[560px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Check Booking Status</h1>
          <p className="text-white/50 text-sm">Enter your booking reference number to view your reservation details.</p>
        </div>

        {/* Search Form */}
        {!booking && (
          <form onSubmit={handleSearch} className="bg-navy-800 border border-white/10 rounded-2xl p-8 shadow-card">
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[0.8rem] font-semibold text-white/60 uppercase tracking-wider">
                Booking Reference Number
              </label>
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                placeholder="BSH-XXXXXX"
                className="px-4 py-3 bg-navy-900 border border-white/20 rounded-xl text-white text-center text-lg font-bold tracking-widest placeholder:text-white/20 placeholder:font-normal placeholder:tracking-normal outline-none focus:border-gold-500 transition-colors"
                maxLength={10}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={searching || !refInput.trim()}
              className="w-full py-3 bg-gold-500 text-navy-900 font-display font-bold text-[1rem] uppercase rounded-xl hover:bg-gold-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin"/>
                  Searching…
                </>
              ) : 'Find Booking'}
            </button>
          </form>
        )}

        {/* Booking Result */}
        {booking && statusCfg && (
          <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden shadow-card animate-fade-in-up">
            {/* Status Banner */}
            <div className={`px-8 py-5 border-b ${statusCfg.bg} border-opacity-30`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${statusCfg.bg} ${statusCfg.color} border`}>
                  {statusCfg.icon}
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Booking Status</div>
                  <div className={`text-lg font-bold ${statusCfg.color}`}>{statusCfg.label}</div>
                </div>
              </div>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">{statusCfg.message}</p>
            </div>

            {/* Booking Details */}
            <div className="p-8">
              {/* Reference Number */}
              <div className="flex items-center justify-between mb-6 p-4 bg-navy-900 rounded-xl border border-white/10">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Reference Number</div>
                  <div className="font-display text-xl font-extrabold text-gold-500 tracking-widest">{booking.bookingNumber}</div>
                </div>
                <button
                  onClick={handleCopy}
                  title="Copy booking number"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <InfoRow label="Name" value={booking.name} />
                <InfoRow label="Sport" value={
                  <span className="flex items-center gap-1.5">
                    <span>{SPORT_EMOJI[booking.sport] || '🎯'}</span>
                    <span>{booking.sport}</span>
                  </span>
                } />
                <InfoRow label="Date" value={booking.date} />
                <InfoRow label="Time" value={booking.time} />
                <InfoRow label="Duration" value={booking.hours} />
                <InfoRow label="Rate" value={booking.rate ? `₱${booking.rate.toLocaleString()}` : '—'} />
              </div>

              {/* Assigned Courts (only if confirmed) */}
              {booking.status === 'confirmed' && booking.assignedCourts && booking.assignedCourts.length > 0 && (
                <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Assigned Courts</div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(booking.assignedCourts.map(ac => ac.court))].map(court => (
                      <span key={court} className="px-3 py-1 bg-green-500/15 text-green-400 font-bold text-sm rounded-lg border border-green-500/25">
                        {court}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    {booking.assignedCourts.map(ac => `${ac.time} → ${ac.court}`).join(' · ')}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-white/40 text-xs mb-1">Need help? Contact us at</p>
                <a href="tel:09777868842" className="text-gold-500 font-semibold text-sm hover:text-gold-400 transition-colors">
                  0977 786 8842
                </a>
              </div>

              <button
                onClick={handleReset}
                className="mt-5 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Check Another Booking
              </button>
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="text-center mt-6 flex items-center justify-center gap-4 text-sm text-white/40">
          <Link to="/booking" className="hover:text-gold-500 transition-colors">Make a Booking</Link>
          <span>·</span>
          <Link to="/" className="hover:text-gold-500 transition-colors">Go Home</Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
  );
}
