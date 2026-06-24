import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#facilities', label: 'Facilities' },
  { href: '#rates', label: 'Rates' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setScrolled(scrollY > 60);

    if (!isHomePage) return;
    const sections = document.querySelectorAll('section[id]');
    const offset = scrollY + 150;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (offset >= top && offset < top + height) {
        setActiveSection(section.getAttribute('id'));
      }
    });
  }, [isHomePage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const smoothScrollTo = (e, href) => {
    if (!isHomePage) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      setMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      document.body.style.overflow = prev ? '' : 'hidden';
      return !prev;
    });
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        scrolled || menuOpen
          ? 'bg-navy-900/95 backdrop-blur-xl py-[10px] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3" id="nav-brand">
          <img src="/images/logo.png" alt="Budz Sports Hub Logo" className="h-[50px] w-auto rounded-lg" />
          <div className="flex flex-col">
            <span className="font-display text-[1.3rem] font-extrabold text-white tracking-wide leading-none">BUDZ</span>
            <span className="font-display text-[0.7rem] font-semibold text-gold-500 tracking-[0.15em] uppercase">Sports Hub</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-9" id="navLinks">
          {navItems.map(({ href, label }) =>
            isHomePage ? (
              <a
                key={href}
                href={href}
                onClick={(e) => smoothScrollTo(e, href)}
                className={`nav-link-underline font-body text-[0.9rem] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
                  activeSection === href.slice(1) ? 'text-white active' : 'text-white/70 hover:text-white'
                }`}
              >
                {label}
              </a>
            ) : (
              <Link key={href} to={`/${href}`} className="nav-link-underline font-body text-[0.9rem] font-medium uppercase tracking-[0.08em] text-white/70 hover:text-white transition-colors duration-200">
                {label}
              </Link>
            )
          )}
        </div>

        {/* Book Now CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/status"
            id="nav-status-btn"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold text-[0.9rem] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            My Booking
          </Link>
          <Link
            to="/booking"
            id="nav-book-btn"
            className="inline-flex items-center gap-2 px-7 py-3 bg-gold-500 text-navy-900 font-display font-bold text-[0.95rem] uppercase tracking-[0.05em] border-2 border-gold-500 rounded-xl shadow-button transition-all duration-200 hover:bg-transparent hover:text-gold-500 hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(245,197,24,0.4)]"
          >
            <CalendarIcon />
            Book Now!
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="hamburger"
          onClick={toggleMenu}
          className={`md:hidden flex flex-col gap-[5px] cursor-pointer z-[1001] p-1 ${menuOpen ? 'hamburger-open' : ''}`}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-7 h-[3px] bg-white rounded-sm transition-all duration-200"
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          id="mobileNavLinks"
          className="md:hidden absolute top-full left-0 right-0 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 flex flex-col py-6 px-6 gap-5 z-[1000]"
        >
          {navItems.map(({ href, label }) =>
            isHomePage ? (
              <a
                key={href}
                href={href}
                onClick={(e) => smoothScrollTo(e, href)}
                className={`font-body text-sm font-medium uppercase tracking-[0.08em] ${
                  activeSection === href.slice(1) ? 'text-white' : 'text-white/70'
                }`}
              >
                {label}
              </a>
            ) : (
              <Link key={href} to={`/${href}`} onClick={closeMenu} className="font-body text-sm font-medium uppercase tracking-[0.08em] text-white/70">
                {label}
              </Link>
            )
          )}
          <Link
            to="/status"
            onClick={closeMenu}
            className="mt-1 inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/15 text-white/70 font-semibold text-[0.95rem]"
          >
            My Booking
          </Link>
          <Link
            to="/booking"
            onClick={closeMenu}
            className="mt-2 inline-flex items-center justify-center gap-2 px-7 py-3 bg-gold-500 text-navy-900 font-display font-bold text-[0.95rem] uppercase tracking-[0.05em] rounded-xl shadow-button"
          >
            <CalendarIcon />
            Book Now!
          </Link>
        </div>
      )}
    </nav>
  );
}
