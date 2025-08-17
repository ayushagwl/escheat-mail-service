import React from 'react';
import { Upload, Settings, Mail, BarChart3 } from 'lucide-react';

const LandingProcess: React.FC = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload CSV",
      description: "Connect your data with a simple CSV upload. Our system automatically validates and processes your unclaimed property records.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Settings,
      title: "Apply Rules",
      description: "Our AI-powered rule engine automatically determines the required mail service (Standard vs Certified) based on state-specific compliance rules.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Mail,
      title: "Send & Track",
      description: "Generate personalized letters with rich text templates and send certified mail with real-time tracking and delivery confirmation.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From data upload to mail delivery, our automated platform handles every step of your escheatment compliance process.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step Number */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-8 h-8" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Automated Compliance Engine
              </h3>
              <p className="text-gray-600 mb-6">
                Our intelligent system automatically applies state-specific rules to determine the correct mail service for each recipient, ensuring full compliance with escheatment regulations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  State-specific rule engine
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Automatic service determination
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Compliance validation
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Audit trail generation
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-32 h-32 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingProcess;
