import React from 'react';
import { Link } from 'react-router-dom';

const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main CTA */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to automate your escheatment compliance?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of companies that have transformed their unclaimed property mail process with our automated platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Free Trial
          </Link>
          <Link
            to="/demo"
            className="bg-transparent text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg border-2 border-white"
          >
            Schedule Demo
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="text-blue-100">
            <div className="text-2xl font-bold mb-2">✓</div>
            <div className="text-sm">No Setup Fees</div>
          </div>
          <div className="text-blue-100">
            <div className="text-2xl font-bold mb-2">✓</div>
            <div className="text-sm">14-Day Free Trial</div>
          </div>
          <div className="text-blue-100">
            <div className="text-2xl font-bold mb-2">✓</div>
            <div className="text-sm">Cancel Anytime</div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-blue-500">
          <p className="text-blue-100 mb-4">
            Questions? Our compliance experts are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-blue-100">
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <span>support@escheatmail.com</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>1-800-ESCHEAT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
