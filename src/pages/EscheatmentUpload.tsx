import React, { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Will be used for navigation after processing
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Template } from '../lib/supabase';
import { escheatmentService, EscheatmentRecord } from '../services/escheatmentService';
import toast from 'react-hot-toast';
import { Upload, FileText, Play, Download, CheckCircle } from 'lucide-react';

const EscheatmentUpload: React.FC = () => {
  const { user } = useAuth();
  // const navigate = useNavigate(); // Will be used for navigation after processing
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<EscheatmentRecord[]>([]);
  const [processedRecords, setProcessedRecords] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [jobName, setJobName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Load templates on component mount
  React.useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      setSelectedTemplate(data?.find(t => t.is_default) || null);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      parseCSV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        const records: EscheatmentRecord[] = [];
        
        dataLines.forEach((line, index) => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length >= 6) {
            const record: EscheatmentRecord = {
              recipient_name: columns[0],
              street: columns[1],
              city: columns[2],
              state: columns[3],
              zip_code: columns[4],
              amount: parseFloat(columns[5]) || 0,
              date_of_last_contact: columns[6] || undefined
            };
            
            records.push(record);
          } else {
            console.warn(`Skipping invalid line ${index + 2}: insufficient columns`);
          }
        });
        
        setParsedRecords(records);
        toast.success(`Parsed ${records.length} records from CSV`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const processRecords = async () => {
    if (!user || !selectedTemplate || !jobName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Create letter job
      const { data: job, error: jobError } = await supabase
        .from('letter_jobs')
        .insert({
          user_id: user.id,
          job_name: jobName,
          total_records: parsedRecords.length,
          template_id: selectedTemplate.id
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Process records with escheatment rules
      const processed = await escheatmentService.processEscheatmentData(
        parsedRecords,
        job.id,
        user.id
      );

      // Store processed records
      await escheatmentService.storeProcessedRecords(processed, job.id, user.id);

      setProcessedRecords(processed);
      setCurrentStep(3);
      
      toast.success(`Job created successfully! ${processed.filter(p => p.required_service !== 'Not Required').length} letters will be sent.`);
      
    } catch (error) {
      console.error('Error processing records:', error);
      toast.error('Failed to process records');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `recipient_name,street,city,state,zip_code,amount,date_of_last_contact
"John Smith","123 Main St","New York","NY","10001",1500.00,"2023-01-15"
"Jane Doe","456 Oak Ave","Los Angeles","CA","90210",750.00,"2023-02-20"
"Bob Johnson","789 Pine Rd","Chicago","IL","60601",2500.00,"2023-03-10"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escheatment-sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getServiceBreakdown = () => {
    const breakdown = {
      certified: processedRecords.filter(r => r.required_service === 'Certified').length,
      standard: processedRecords.filter(r => r.required_service === 'Standard').length,
      notRequired: processedRecords.filter(r => r.required_service === 'Not Required').length
    };
    return breakdown;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Escheatment Mail Service</h1>
        <p className="text-gray-600">Upload unclaimed property data and automatically determine required mail services</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Upload Data</span>
          <span>Configure</span>
          <span>Review & Process</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Upload Unclaimed Property Data</h3>
              <p className="text-gray-600 mb-4">
                Upload a CSV file containing unclaimed property records. The system will automatically 
                determine the required mail service based on state rules and amounts.
              </p>
              
              <button
                onClick={downloadSampleCSV}
                className="btn-secondary flex items-center space-x-2 mb-4"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
                    Required columns: recipient_name, street, city, state, zip_code, amount, date_of_last_contact
                  </p>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">
                    {uploadedFile.name} - {parsedRecords.length} records parsed
                  </span>
                </div>
              </div>
            )}

            {parsedRecords.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Preview of Parsed Data:</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Address</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRecords.slice(0, 5).map((record, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{record.recipient_name}</td>
                          <td className="py-2">{record.street}, {record.city}</td>
                          <td className="py-2">${record.amount.toFixed(2)}</td>
                          <td className="py-2">{record.state}</td>
                        </tr>
                      ))}
                      {parsedRecords.length > 5 && (
                        <tr>
                          <td colSpan={4} className="py-2 text-gray-500 text-center">
                            ... and {parsedRecords.length - 5} more records
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsedRecords.length > 0 && (
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-primary w-full"
              >
                Continue to Configuration
              </button>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Configure Job Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Name *
              </label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="input-field"
                placeholder="e.g., Q1 2024 Unclaimed Property"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Template
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`card cursor-pointer transition-all duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {template.content.substring(0, 100)}...
                    </p>
                    {template.is_default && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
                disabled={!jobName.trim() || !selectedTemplate}
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review & Process</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Total Records</h4>
                <p className="text-2xl font-bold text-blue-600">{parsedRecords.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Letters to Send</h4>
                <p className="text-2xl font-bold text-green-600">
                  {parsedRecords.length - (processedRecords.filter(r => r.required_service === 'Not Required').length)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Job Name</h4>
                <p className="text-lg font-semibold text-gray-700">{jobName}</p>
              </div>
            </div>

            {processedRecords.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Service Breakdown:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-800">Certified Mail</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {getServiceBreakdown().certified}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">Standard Mail</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {getServiceBreakdown().standard}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Not Required</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {getServiceBreakdown().notRequired}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={processRecords}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Process & Send Letters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscheatmentUpload;
