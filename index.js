/* ============================================
   BUDZ PICKLEBALL COURT — Main JavaScript
   ============================================ */

import { saveBooking } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Preloader ----------
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    });

    // Fallback: hide preloader after 3s max
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);


    // ---------- Navbar Scroll Effect ----------
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        updateActiveNavLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call


    // ---------- Active Nav Link ----------
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollY = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }


    // ---------- Smooth Scrolling ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetEl = document.querySelector(targetId);

            if (targetEl) {
                const offset = 80;
                const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });


    // ---------- Back to Top ----------
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // ---------- Mobile Menu ----------
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }


    // ---------- Scroll Reveal Animations ----------
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ---------- Set min date on booking form ----------
    const bookDateInput = document.getElementById('bookDate');
    if (bookDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        bookDateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
    }


    // ---------- Booking Form Submission (Firebase) ----------
    const bookingForm           = document.getElementById('bookingForm');
    const standaloneBookingForm = document.getElementById('standaloneBookingForm');
    const successModal          = document.getElementById('successModal');
    const closeModal            = document.getElementById('closeModal');

    const handleFormSubmit = async (e, form) => {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        // Button loading state — show spinner
        const submitBtn = form.querySelector('[type="submit"]');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                Processing…
            `;
        }

        try {
            // 🔥 Save to Firestore
            const result = await saveBooking(data);

            // Inject booking number into success modal
            const bookingNumEl = document.getElementById('bookingNumberDisplay');
            if (bookingNumEl) {
                bookingNumEl.textContent = result.bookingNumber;
            }

            // Show success modal
            if (successModal) successModal.classList.add('active');

            // Reset form
            form.reset();
        } catch (err) {
            console.error('❌ Booking save failed:', err);
            alert('Sorry, something went wrong saving your booking. Please try again or call us at 0977 786 8842.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        }
    };

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => handleFormSubmit(e, bookingForm));
    }

    if (standaloneBookingForm) {
        standaloneBookingForm.addEventListener('submit', (e) => handleFormSubmit(e, standaloneBookingForm));
    }

    if (closeModal && successModal) {
        closeModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });

        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }


    // ---------- Animated Stats Counter ----------
    function animateCounter(element, target, suffix = '') {
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Observe hero stats for counter animation
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate visible stats
                    const courtStat = document.getElementById('stat-courts');
                    if (courtStat) {
                        courtStat.textContent = '4+';
                    }
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }


    // ---------- Gallery Lightbox Effect ----------
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) {
                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.style.cssText = `
                    position: fixed; inset: 0; z-index: 10001;
                    background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; animation: fadeIn 0.3s ease;
                    padding: 40px;
                `;

                const lightboxImg = document.createElement('img');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxImg.style.cssText = `
                    max-width: 90vw; max-height: 85vh;
                    object-fit: contain; border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                `;

                // Close button
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✕';
                closeBtn.style.cssText = `
                    position: absolute; top: 20px; right: 24px;
                    background: none; border: none; color: white;
                    font-size: 28px; cursor: pointer; z-index: 2;
                    width: 44px; height: 44px; display: flex;
                    align-items: center; justify-content: center;
                    border-radius: 50%; transition: background 0.2s;
                `;
                closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(255,255,255,0.1)'; };
                closeBtn.onmouseout = () => { closeBtn.style.background = 'none'; };

                lightbox.appendChild(closeBtn);
                lightbox.appendChild(lightboxImg);
                document.body.appendChild(lightbox);
                document.body.style.overflow = 'hidden';

                const closeLightbox = () => {
                    lightbox.style.opacity = '0';
                    lightbox.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                        document.body.style.overflow = '';
                    }, 300);
                };

                closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
                lightbox.addEventListener('click', closeLightbox);
                lightboxImg.addEventListener('click', (e) => e.stopPropagation());

                // ESC key
                const onKeyDown = (e) => {
                    if (e.key === 'Escape') { closeLightbox(); document.removeEventListener('keydown', onKeyDown); }
                };
                document.addEventListener('keydown', onKeyDown);
            }
        });
    });


    // ---------- Parallax effect on hero ----------
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
            }
        }, { passive: true });
    }

});
