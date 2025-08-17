import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingHero from '../components/LandingHero';
import LandingProcess from '../components/LandingProcess';
import LandingFeatures from '../components/LandingFeatures';
import LandingTestimonials from '../components/LandingTestimonials';
import LandingCTA from '../components/LandingCTA';

const Landing: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <LandingHero />
      
      {/* How It Works */}
      <LandingProcess />
      
      {/* Features */}
      <LandingFeatures />
      
      {/* Testimonials */}
      <LandingTestimonials />
      
      {/* Final CTA */}
      <LandingCTA />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Escheat Mail Service</h3>
              <p className="text-gray-400">
                Automated compliance mail service for unclaimed property management.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Escheat Mail Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
