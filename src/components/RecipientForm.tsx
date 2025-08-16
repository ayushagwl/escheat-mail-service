import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, X } from 'lucide-react';

interface Recipient {
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface RecipientFormProps {
  recipients: Recipient[];
  setRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>;
  letterContent: string;
  setLetterContent: React.Dispatch<React.SetStateAction<string>>;
}

const RecipientForm: React.FC<RecipientFormProps> = ({
  recipients,
  setRecipients,
  letterContent,
  setLetterContent
}) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState<Recipient>({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA'
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const parsedRecipients: Recipient[] = [];
          
          // Skip header row if it exists
          const dataLines = lines.slice(1);
          
          dataLines.forEach(line => {
            const columns = line.split(',').map(col => col.trim());
            if (columns.length >= 6) {
              parsedRecipients.push({
                name: columns[0],
                address_line_1: columns[1],
                address_line_2: columns[2] || '',
                city: columns[3],
                state: columns[4],
                zip_code: columns[5],
                country: columns[6] || 'USA'
              });
            }
          });
          
          setRecipients(prev => [...prev, ...parsedRecipients]);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please ensure it has the correct format.');
        }
      };
      reader.readAsText(file);
    }
  }, [setRecipients]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const addManualRecipient = () => {
    if (newRecipient.name && newRecipient.address_line_1 && newRecipient.city && newRecipient.state && newRecipient.zip_code) {
      setRecipients(prev => [...prev, { ...newRecipient }]);
      setNewRecipient({
        name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA'
      });
      setShowManualForm(false);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Add Recipients</h3>
      
      {/* Letter Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Letter Content
        </label>
        <textarea
          value={letterContent}
          onChange={(e) => setLetterContent(e.target.value)}
          className="input-field h-32 resize-none"
          placeholder="Enter your letter content here..."
        />
      </div>

      {/* File Upload */}
      <div>
        <h4 className="font-medium mb-2">Upload Recipients (CSV)</h4>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary-600">Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop a CSV file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">
                Format: Name, Address Line 1, Address Line 2 (optional), City, State, ZIP Code, Country (optional)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Add Recipient Manually</h4>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showManualForm ? 'Cancel' : 'Add Recipient'}</span>
          </button>
        </div>

        {showManualForm && (
          <div className="card space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={newRecipient.address_line_1}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, address_line_1: e.target.value }))}
                  className="input-field"
                  placeholder="Street Address"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={newRecipient.address_line_2}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, address_line_2: e.target.value }))}
                className="input-field"
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newRecipient.city}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newRecipient.state}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, state: e.target.value }))}
                  className="input-field"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={newRecipient.zip_code}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, zip_code: e.target.value }))}
                  className="input-field"
                  placeholder="ZIP Code"
                />
              </div>
            </div>
            <button
              onClick={addManualRecipient}
              className="btn-primary w-full"
            >
              Add Recipient
            </button>
          </div>
        )}
      </div>

      {/* Recipients List */}
      {recipients.length > 0 && (
        <div>
          <h4 className="font-medium mb-4">Recipients ({recipients.length})</h4>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{recipient.name}</p>
                  <p className="text-sm text-gray-600">
                    {recipient.address_line_1}
                    {recipient.address_line_2 && `, ${recipient.address_line_2}`}
                    {`, ${recipient.city}, ${recipient.state} ${recipient.zip_code}`}
                  </p>
                </div>
                <button
                  onClick={() => removeRecipient(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientForm;
