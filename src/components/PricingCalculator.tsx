import React from 'react';
import { Envelope, PricingRule } from '../lib/supabase';
import { DollarSign } from 'lucide-react';

interface Recipient {
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface PricingCalculatorProps {
  envelope: Envelope | null;
  recipients: Recipient[];
  letterContent: string;
  pricingRules: PricingRule[];
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  envelope,
  recipients,
  letterContent,
  pricingRules
}) => {
  const calculateBreakdown = () => {
    if (!envelope || recipients.length === 0) return null;

    const envelopePrice = envelope.price;
    const perPageCost = pricingRules.find(r => r.rule_type === 'per_page_cost')?.price || 0.25;
    const basePostage = pricingRules.find(r => r.rule_type === 'base_postage')?.price || 0.55;
    
    // Calculate pages based on content length (rough estimate)
    const estimatedPages = Math.max(1, Math.ceil(letterContent.length / 1000));
    const printingCost = estimatedPages * perPageCost;
    
    const costPerLetter = envelopePrice + printingCost + basePostage;
    const totalCost = costPerLetter * recipients.length;

    return {
      envelopePrice,
      printingCost,
      basePostage,
      costPerLetter,
      totalCost,
      estimatedPages
    };
  };

  const breakdown = calculateBreakdown();

  if (!breakdown) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please select an envelope and add recipients to see pricing
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-semibold text-lg mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2" />
        Pricing Breakdown
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Envelope ({envelope?.name})</span>
          <span>${breakdown.envelopePrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Printing ({breakdown.estimatedPages} page{breakdown.estimatedPages > 1 ? 's' : ''})</span>
          <span>${breakdown.printingCost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Postage</span>
          <span>${breakdown.basePostage.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-medium">
            <span>Cost per letter</span>
            <span>${breakdown.costPerLetter.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total ({recipients.length} recipient{recipients.length > 1 ? 's' : ''})</span>
            <span className="text-primary-600">${breakdown.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
