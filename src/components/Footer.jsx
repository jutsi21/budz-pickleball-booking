import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/10 pt-16 pb-8" id="footer">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Budz Sports Hub" className="h-12 w-auto rounded-lg" />
              <span className="font-display text-[1.1rem] font-bold text-white">Budz Sports Hub</span>
            </div>
            <p className="text-[0.9rem] text-white/60 leading-[1.7]">
              Premium sports courts in Lilo-an, Cebu. Play. Smash. Repeat. Fun for everyone — from beginners to pros!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[0.95rem] uppercase tracking-[0.05em]">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: '#home', label: 'Home' },
                { href: '#about', label: 'About Us' },
                { href: '#rates', label: 'Rates' },
                { href: '#gallery', label: 'Gallery' },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-[0.9rem] text-white/50 hover:text-gold-500 transition-colors duration-200">{label}</a>
              ))}
              <Link to="/booking" className="text-[0.9rem] text-white/50 hover:text-gold-500 transition-colors duration-200">Book Now</Link>
            </div>
          </div>

          {/* Play Info */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[0.95rem] uppercase tracking-[0.05em]">Play Info</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: '#rates', label: 'Court Rates' },
                { href: '#about', label: 'Facilities' },
                { href: '#gallery', label: 'Photo Gallery' },
              ].map(({ href, label }) => (
                <a key={label} href={href} className="text-[0.9rem] text-white/50 hover:text-gold-500 transition-colors duration-200">{label}</a>
              ))}
              <Link to="/booking" className="text-[0.9rem] text-white/50 hover:text-gold-500 transition-colors duration-200">Reservations</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[0.95rem] uppercase tracking-[0.05em]">Contact Us</h4>
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 text-gold-500">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  text: '0977 786 8842',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 text-gold-500 mt-0.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  text: 'Purok Mangga Tayud, Lilo-an, Cebu',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 text-gold-500">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  text: 'Daily: 8AM – 2AM',
                },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  {icon}
                  <span className="text-[0.9rem] text-white/60">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.85rem] text-white/40">© 2026 Budz Sports Hub. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[
              { id: 'social-facebook', label: 'Facebook', path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
              { id: 'social-instagram', label: 'Instagram', path: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> },
              { id: 'social-tiktok', label: 'TikTok', path: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /> },
            ].map(({ id, label, path }) => (
              <a
                key={id}
                href="#"
                id={id}
                aria-label={label}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 border border-white/10 hover:text-gold-500 hover:border-gold-500/40 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  {path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
