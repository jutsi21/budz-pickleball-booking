export default function SuccessModal({ bookingNumber, onClose }) {
  if (!bookingNumber) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-navy-700 border border-white/10 rounded-[24px] p-10 max-w-[420px] w-full text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: 'modalIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Check icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-gold-500"
          style={{ background: 'rgba(245,197,24,0.15)', border: '2px solid rgba(245,197,24,0.3)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="font-display text-[1.5rem] font-bold mb-3">Booking Confirmed!</h3>
        <p className="text-white/70 text-[0.9rem] leading-[1.6] mb-5">
          Your court reservation has been submitted. We'll confirm it shortly. You can also call us at <strong className="text-white">0977 786 8842</strong>.
        </p>

        {/* Booking number */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)' }}
        >
          <div className="text-[0.75rem] text-white/50 uppercase tracking-[0.12em] mb-1">Your Booking #</div>
          <div className="font-display text-[1.5rem] font-extrabold text-gold-500 tracking-[0.08em]">{bookingNumber}</div>
        </div>

        <p className="text-[0.8rem] text-white/40 mb-6">Screenshot or note this number for reference.</p>

        <button
          id="closeModal"
          onClick={onClose}
          className="w-full py-3 bg-gold-500 text-navy-900 font-display font-bold text-[1rem] uppercase tracking-[0.05em] rounded-xl shadow-button transition-all duration-200 hover:bg-gold-400"
        >
          Got It!
        </button>
      </div>
    </div>
  );
}
