import React from 'react';
import { Envelope } from '../lib/supabase';
import { DollarSign } from 'lucide-react';

interface EnvelopeSelectorProps {
  envelopes: Envelope[];
  selectedEnvelope: Envelope | null;
  onSelect: (envelope: Envelope) => void;
}

const EnvelopeSelector: React.FC<EnvelopeSelectorProps> = ({
  envelopes,
  selectedEnvelope,
  onSelect
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Choose an Envelope</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {envelopes.map((envelope) => (
          <div
            key={envelope.id}
            className={`card cursor-pointer transition-all duration-200 ${
              selectedEnvelope?.id === envelope.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => onSelect(envelope)}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">{envelope.name}</h4>
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                {envelope.price.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="w-16 h-10 bg-white border-2 border-gray-300 rounded mx-auto"></div>
            </div>
            
            {selectedEnvelope?.id === envelope.id && (
              <div className="flex items-center text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvelopeSelector;
