import React from 'react';
import { Link } from 'react-router-dom';

const LandingHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your escheatment mail service?
            <span className="text-blue-600 block">Automated.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline compliance with AI-powered rule engine and certified mail automation. 
            Send thousands of escheatment letters with confidence.
          </p>
          
          {/* Trust Indicators */}
          <div className="mb-8">
            <p className="text-gray-500 mb-4">Trusted by compliance professionals nationwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-400 font-semibold">✓ SOC 2 Compliant</div>
              <div className="text-gray-400 font-semibold">✓ HIPAA Ready</div>
              <div className="text-gray-400 font-semibold">✓ 99.9% Uptime</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              to="/demo"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg border-2 border-blue-600"
            >
              Book Demo
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="mt-12">
            <p className="text-gray-500 mb-4">Join 500+ companies automating their escheatment process</p>
            <div className="flex justify-center items-center space-x-8 opacity-40">
              <div className="text-gray-400 font-medium">Financial Services</div>
              <div className="text-gray-400 font-medium">Insurance</div>
              <div className="text-gray-400 font-medium">Healthcare</div>
              <div className="text-gray-400 font-medium">Real Estate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
