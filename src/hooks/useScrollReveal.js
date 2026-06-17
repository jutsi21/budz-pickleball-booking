import { useEffect } from 'react';

/**
 * Attach an IntersectionObserver to all elements matching `selector`
 * inside `containerRef`. Adds the `visible` class when they enter view.
 */
export function useScrollReveal(containerRef) {
  useEffect(() => {
    const container = containerRef?.current ?? document;
    const elements = container.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}
