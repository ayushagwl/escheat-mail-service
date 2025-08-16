import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Template, Envelope, PricingRule } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import TemplateSelector from '../components/TemplateSelector';
import EnvelopeSelector from '../components/EnvelopeSelector';
import RecipientForm from '../components/RecipientForm';
import PricingCalculator from '../components/PricingCalculator';

interface Recipient {
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

const CreateLetter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [letterContent, setLetterContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, envelopesRes, pricingRes] = await Promise.all([
        supabase.from('templates').select('*'),
        supabase.from('envelopes').select('*'),
        supabase.from('pricing_rules').select('*')
      ]);

      if (templatesRes.data) setTemplates(templatesRes.data);
      if (envelopesRes.data) setEnvelopes(envelopesRes.data);
      if (pricingRes.data) setPricingRules(pricingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load templates and pricing');
    }
  };

  const calculatePrice = () => {
    if (!selectedEnvelope) return 0;
    
    const envelopePrice = selectedEnvelope.price;
    const perPageCost = pricingRules.find(r => r.rule_type === 'per_page_cost')?.price || 0.25;
    const basePostage = pricingRules.find(r => r.rule_type === 'base_postage')?.price || 0.55;
    
    // Calculate pages based on content length (rough estimate)
    const estimatedPages = Math.max(1, Math.ceil(letterContent.length / 1000));
    const printingCost = estimatedPages * perPageCost;
    
    return envelopePrice + printingCost + basePostage;
  };

  const generateLetterContent = (recipient: Recipient) => {
    if (!selectedTemplate) return '';
    
    let content = selectedTemplate.content;
    content = content.replace(/{{recipient_name}}/g, recipient.name);
    content = content.replace(/{{sender_name}}/g, user?.email?.split('@')[0] || 'User');
    content = content.replace(/{{purpose}}/g, 'discuss important matters');
    content = content.replace(/{{reason}}/g, 'your support and cooperation');
    content = content.replace(/{{content}}/g, letterContent);
    
    return content;
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !selectedEnvelope || recipients.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const finalPrice = calculatePrice();
      
      // Create letters for each recipient
      const letterPromises = recipients.map(recipient => {
        const finalContent = generateLetterContent(recipient);
        
        return supabase.from('letters').insert({
          user_id: user?.id,
          template_id: selectedTemplate.id,
          recipient_address: recipient,
          letter_content: finalContent,
          status: 'submitted',
          final_price: finalPrice
        });
      });

      await Promise.all(letterPromises);
      
      toast.success(`Successfully submitted ${recipients.length} letter(s)!`);
      navigate('/order-history');
    } catch (error) {
      console.error('Error submitting letters:', error);
      toast.error('Failed to submit letters');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Letter</h1>
        <p className="text-gray-600">Follow the steps below to create and send your letter</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Template</span>
          <span>Envelope</span>
          <span>Recipients</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {currentStep === 1 && (
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        )}

        {currentStep === 2 && (
          <EnvelopeSelector
            envelopes={envelopes}
            selectedEnvelope={selectedEnvelope}
            onSelect={setSelectedEnvelope}
          />
        )}

        {currentStep === 3 && (
          <RecipientForm
            recipients={recipients}
            setRecipients={setRecipients}
            letterContent={letterContent}
            setLetterContent={setLetterContent}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review Your Order</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Selected Template</h4>
                <p className="text-gray-600">{selectedTemplate?.name}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Selected Envelope</h4>
                <p className="text-gray-600">{selectedEnvelope?.name}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recipients ({recipients.length})</h4>
              <div className="space-y-2">
                {recipients.map((recipient, index) => (
                  <div key={index} className="text-gray-600">
                    {recipient.name} - {recipient.address_line_1}, {recipient.city}
                  </div>
                ))}
              </div>
            </div>

            <PricingCalculator
              envelope={selectedEnvelope}
              recipients={recipients}
              letterContent={letterContent}
              pricingRules={pricingRules}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            className="btn-primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Order'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateLetter;
