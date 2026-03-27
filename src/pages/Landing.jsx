import { Helmet } from 'react-helmet-async';
import Navbar from './landing/Navbar';
import Banner from './landing/Banner';
import HomeSection from './landing/HomeSection';
import Features from './landing/Features';
import HowItWorks from './landing/HowItWorks';
import Pricing from './landing/Pricing';
import FAQ from './landing/FAQ';
import AboutUs from './landing/AboutUs';
import ContactUs from './landing/ContactUs';
import Footer from './landing/Footer';

export default function Landing() {
  return (
    <div className="bg-white text-gray-800">
      <Helmet>
        <title>FynBee - Smart Household Finance Management | Track, Budget & Split Expenses</title>
        <meta name="description" content="FynBee helps families and households track expenses, manage budgets, split costs, and monitor income across multiple accounts. Free to start, no credit card required." />
        <link rel="canonical" href="https://fynbee.app/" />
      </Helmet>
      <Navbar />
      <Banner />
      <HomeSection />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <AboutUs />
      <ContactUs />
      <Footer />
    </div>
  );
}
