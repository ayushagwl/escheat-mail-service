import React from 'react';

const LandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Escheat Mail Service has revolutionized our compliance process. We've reduced manual work by 90% and eliminated errors completely.",
      author: "Sarah Johnson",
      title: "Compliance Officer",
      company: "First National Bank",
      avatar: "SJ"
    },
    {
      quote: "The automated rule engine is a game-changer. It automatically determines the right mail service for each case, saving us hours of research.",
      author: "Michael Chen",
      title: "Legal Counsel",
      company: "ABC Insurance",
      avatar: "MC"
    },
    {
      quote: "Real-time tracking and analytics give us complete visibility into our escheatment campaigns. The ROI was immediate.",
      author: "Lisa Rodriguez",
      title: "Operations Manager",
      company: "XYZ Financial",
      avatar: "LR"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by compliance professionals nationwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how leading companies are transforming their escheatment compliance with our automated platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6">
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-8">Join these industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            <div className="text-gray-400 font-semibold text-lg">Financial Services</div>
            <div className="text-gray-400 font-semibold text-lg">Insurance</div>
            <div className="text-gray-400 font-semibold text-lg">Healthcare</div>
            <div className="text-gray-400 font-semibold text-lg">Real Estate</div>
            <div className="text-gray-400 font-semibold text-lg">Telecom</div>
            <div className="text-gray-400 font-semibold text-lg">Retail</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
