import React from 'react';
import { Template } from '../lib/supabase';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelect
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Choose a Template</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`card cursor-pointer transition-all duration-200 ${
              selectedTemplate?.id === template.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => onSelect(template)}
          >
            {template.preview_image && (
              <img
                src={template.preview_image}
                alt={template.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
            <p className="text-gray-600 text-sm line-clamp-3">
              {template.content.substring(0, 100)}...
            </p>
            {selectedTemplate?.id === template.id && (
              <div className="mt-4 flex items-center text-primary-600">
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

export default TemplateSelector;
