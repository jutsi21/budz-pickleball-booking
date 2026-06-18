import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SuccessModal({ bookingNumber, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!bookingNumber) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-navy-700 border border-white/10 rounded-[24px] p-8 max-w-[440px] w-full text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: 'modalIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Check icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500"
          style={{ background: 'rgba(245,197,24,0.15)', border: '2px solid rgba(245,197,24,0.3)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="font-display text-[1.5rem] font-bold mb-1 text-white">Booking Submitted!</h3>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Pending Approval</span>
        </div>

        {/* Booking number */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)' }}
        >
          <div className="text-[0.75rem] text-white/50 uppercase tracking-[0.12em] mb-1">Your Booking Reference</div>
          <div className="font-display text-[1.5rem] font-extrabold text-gold-500 tracking-[0.08em]">{bookingNumber}</div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 mb-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-green-400">Copied to clipboard!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Booking Number
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="text-left bg-navy-900/50 rounded-xl p-4 mb-5 border border-white/5">
          <p className="text-[0.8rem] font-semibold text-white/60 uppercase tracking-wider mb-2">What happens next?</p>
          <ol className="flex flex-col gap-2">
            {[
              'Our team will review your request shortly.',
              'We\'ll contact you via phone or email to process payment.',
              'Once payment is received, your court will be assigned.',
              'Your booking will be confirmed — check status anytime.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.82rem] text-white/60 leading-snug">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gold-500/20 text-gold-500 text-[0.7rem] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="text-[0.78rem] text-white/35 mb-2">
          Keep this reference number to track your booking.
        </div>

        <div className="text-[0.75rem] text-white/30 mb-5">
          Contact us: <span className="text-white/50">0977 786 8842</span>
        </div>

        <div className="flex gap-2">
          <Link
            to="/status"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all text-center"
          >
            Check Status
          </Link>
          <button
            id="closeModal"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gold-500 text-navy-900 font-display font-bold text-[0.95rem] uppercase tracking-[0.05em] rounded-xl shadow-button transition-all duration-200 hover:bg-gold-400"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
