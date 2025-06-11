import Navbar from './landing/Navbar';
import Banner from './landing/Banner';
import HomeSection from './landing/HomeSection';
import Features from './landing/Features';
import Pricing from './landing/Pricing';
import AboutUs from './landing/AboutUs';
import ContactUs from './landing/ContactUs';
import Footer from './landing/Footer';

export default function Landing() {
  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <Banner />
      <HomeSection />
      <Features />
      <Pricing />
      <AboutUs />
      <ContactUs />
      <Footer />
    </div>
  );
}
