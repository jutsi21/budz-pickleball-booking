import Preloader from '../components/Preloader.jsx';
import Navbar from '../components/Navbar.jsx';
import HeroSection from '../components/HeroSection.jsx';
import AboutSection from '../components/AboutSection.jsx';
import FacilitiesSection from '../components/FacilitiesSection.jsx';
import RatesSection from '../components/RatesSection.jsx';
import GallerySection from '../components/GallerySection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import Footer from '../components/Footer.jsx';
import BackToTop from '../components/BackToTop.jsx';

export default function HomePage() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FacilitiesSection />
        <RatesSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
