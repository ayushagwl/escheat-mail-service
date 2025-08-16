import React from 'react';
import { placeholderOptions } from '../config/ckeditor';

interface PlaceholderToolbarProps {
  onInsertPlaceholder: (placeholder: string) => void;
}

const PlaceholderToolbar: React.FC<PlaceholderToolbarProps> = ({ onInsertPlaceholder }) => {
  return (
    <div className="placeholder-toolbar bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Insert Placeholders:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {placeholderOptions.map((placeholder) => (
          <button
            key={placeholder.value}
            onClick={() => onInsertPlaceholder(placeholder.value)}
            className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors duration-200 border border-blue-200"
            title={`Insert ${placeholder.label}`}
          >
            {placeholder.label}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Click any button above to insert the placeholder into your letter template
      </div>
    </div>
  );
};

export default PlaceholderToolbar;
