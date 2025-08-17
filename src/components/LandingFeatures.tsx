import React from 'react';
import { Brain, FileText, Mail, BarChart3, Shield, Zap } from 'lucide-react';

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Rule Engine",
      description: "Automatically determines the correct mail service based on state-specific compliance rules and amount thresholds.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: FileText,
      title: "Rich Text Templates",
      description: "Create professional letter templates with our advanced editor. Support for logos, formatting, and dynamic placeholders.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Mail,
      title: "Certified Mail Support",
      description: "Send both standard and certified mail with automatic tracking, delivery confirmation, and returned mail handling.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track delivery status, monitor campaign performance, and generate compliance reports with detailed analytics.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption, secure data handling, and comprehensive audit trails.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process thousands of records in minutes. Automated workflows reduce manual work by 90%.",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need for escheatment compliance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines automation, compliance, and ease of use to streamline your unclaimed property mail process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Companies Trust Us</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600">Letters Sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">States Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
