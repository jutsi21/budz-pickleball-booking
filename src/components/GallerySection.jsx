import { useState, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

const galleryImages = [
  { id: 'gallery-1', src: '/images/gallery-1.png', alt: 'Budz Sports Hub - Indoor courts', wide: true },
  { id: 'gallery-2', src: '/images/gallery-2.png', alt: 'Friends playing pickleball', wide: false },
  { id: 'gallery-3', src: '/images/gallery-3.png', alt: 'Pickleball paddle and ball', wide: false },
  { id: 'gallery-4', src: '/images/gallery-4.png', alt: 'Budz Sports Hub exterior', wide: true },
  { id: 'gallery-5', src: '/images/hero-bg.png', alt: 'Court overview', wide: false },
  { id: 'gallery-6', src: '/images/player-action.png', alt: 'Player action shot', wide: false },
];

export default function GallerySection() {
  const [lightbox, setLightbox] = useState(null);
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const openLightbox = (img) => {
    setLightbox(img);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = '';
  };

  // ESC key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <section ref={sectionRef} className="py-[100px] bg-navy-900" id="gallery">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="reveal text-center mb-12">
          <span className="section-label-line inline-flex items-center font-display text-[0.85rem] font-semibold text-gold-500 uppercase tracking-[0.15em] mb-3">Gallery</span>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.1] mb-4">GALLERY</h2>
          <p className="text-[1.05rem] text-white/70 max-w-[600px] leading-[1.7] mx-auto">
            Action-packed shots and moments that capture the spirit of the game at Budz Sports Hub.
          </p>
        </div>

        {/* Grid */}
        <div className="reveal grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px]">
          {galleryImages.map(({ id, src, alt, wide }) => (
            <div
              key={id}
              id={id}
              onClick={() => openLightbox({ src, alt })}
              className={`relative overflow-hidden rounded-[16px] cursor-pointer group ${wide ? 'col-span-2' : 'col-span-1'}`}
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/30 transition-all duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-5 right-6 w-11 h-11 rounded-full flex items-center justify-center text-white text-[28px] transition-colors duration-200 hover:bg-white/10 z-10"
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
