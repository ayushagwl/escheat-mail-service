import React, { useState, useRef } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import PlaceholderToolbar from './PlaceholderToolbar';
import { supabase } from '../lib/supabase';
import { Eye, X, Download } from 'lucide-react';

interface TemplateEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialContent = '',
  onContentChange,
  placeholder = 'Write your escheatment letter template here...'
}) => {
  const [content, setContent] = useState(initialContent || getDefaultTemplate());
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const editorRef = useRef<any>(null);

  // Default professional letter template with placeholders
  // eslint-disable-next-line no-template-curly-in-string
  function getDefaultTemplate() {
    return '<div style="font-family: \'Times New Roman\', serif; font-size: 12pt; line-height: 1.1;">' +
      '<div style="margin-bottom: 1em;">' +
        '<div style="font-weight: bold; font-size: 14pt; margin-bottom: 0.1em;">{{company_name}}</div>' +
        '<div style="color: #666; font-size: 10pt; margin-bottom: 0.05em;">123 Business Street</div>' +
        '<div style="color: #666; font-size: 10pt; margin-bottom: 0.05em;">New York, NY 10001</div>' +
        '<div style="color: #666; font-size: 10pt; margin-bottom: 0.05em;">Phone: (555) 123-4567</div>' +
      '</div>' +
      '<div style="margin-bottom: 1em;">' +
        '<div style="margin-bottom: 0.1em;">{{date}}</div>' +
        '<div style="margin-bottom: 0.1em;">{{recipient_name}}</div>' +
        '<div style="margin-bottom: 0.1em;">{{address}}</div>' +
      '</div>' +
      '<div style="margin-bottom: 0.5em;">Dear {{recipient_name}},</div>' +
      '<div style="text-align: justify; margin-bottom: 0.5em;">' +
        'We are writing to inform you that we have identified unclaimed property in your name. According to our records, you have an outstanding amount of <strong>${{amount}}</strong> that has been held by our company.' +
      '</div>' +
      '<div style="text-align: justify; margin-bottom: 0.5em;">' +
        'This property is currently being held in accordance with the escheatment laws of {{state}}. To claim your property, please complete the enclosed claim form and return it to our office within 30 days of the date of this letter.' +
      '</div>' +
      '<div style="text-align: justify; margin-bottom: 0.5em;">' +
        'If you have any questions regarding this matter, please do not hesitate to contact our office. We are committed to helping you recover your unclaimed property.' +
      '</div>' +
      '<div style="margin-bottom: 0.5em;">Sincerely,</div>' +
      '<div style="margin-bottom: 0.1em;">{{company_name}}</div>' +
      '<div style="color: #666; font-size: 10pt;">Unclaimed Property Department</div>' +
    '</div>';
  }

  // Function to replace placeholders with sample data
  function getPreviewContent() {
    return content
      .replace(/\{\{company_name\}\}/g, 'ABC Corporation')
      .replace(/\{\{date\}\}/g, 'January 15, 2024')
      .replace(/\{\{recipient_name\}\}/g, 'John Smith')
      .replace(/\{\{address\}\}/g, '456 Main Street, Apt 2B<br>Los Angeles, CA 90210')
      .replace(/\{\{amount\}\}/g, '1,250.00')
      .replace(/\{\{state\}\}/g, 'California');
  }

  // Function to print/save as PDF
  const downloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    // Add print styles
    const printStyles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 2.54cm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          .print-content {
            width: 100%;
            max-width: none;
          }
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          margin: 0;
          padding: 2.54cm;
          background: white;
        }
        .print-content {
          width: 21cm;
          min-height: 29.7cm;
          margin: 0 auto;
        }
      </style>
    `;

    // Set the content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Escheatment Letter</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-content">
            ${getPreviewContent()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  };



  // Initialize CKEditor Cloud
  const cloud = useCKEditorCloud({
    version: '46.0.1'
  });

  // Handle placeholder insertion
  const handleInsertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const model = editor.model;
      const doc = model.document;
      const selection = doc.selection;
      
      model.change((writer: any) => {
        const insertPosition = selection.getFirstPosition();
        writer.insertText(placeholder, insertPosition);
      });
    }
  };

  // Handle content change
  const handleContentChange = (event: any, editor: any) => {
    const data = editor.getData();
    setContent(data);
    if (onContentChange) {
      onContentChange(data);
    }
  };

  // Handle editor ready
  const handleEditorReady = (editor: any) => {
    editorRef.current = editor;
    console.log('CKEditor is ready!', editor);
    
    // Configure image upload
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return {
        upload: async () => {
          const file = await loader.file;
          const fileName = `${Date.now()}-${file.name}`;
          
          try {
            // First, check if the bucket exists and create it if needed
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some(bucket => bucket.name === 'letter-images');
            
            if (!bucketExists) {
              console.log('Creating letter-images bucket...');
              const { error: createError } = await supabase.storage.createBucket('letter-images', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
              });
              if (createError) {
                console.error('Error creating bucket:', createError);
                throw createError;
              }
            }
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
              .from('letter-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (error) {
              console.error('Upload error:', error);
              throw error;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('letter-images')
              .getPublicUrl(fileName);
            
            console.log('Image uploaded successfully:', publicUrl);
            return {
              default: publicUrl
            };
          } catch (error) {
            console.error('Image upload error:', error);
            // Fallback to base64 for demo
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  default: reader.result
                });
              };
              reader.readAsDataURL(file);
            });
          }
        }
      };
    };
  };



  // Handle loading and error states
  if (cloud.status === 'error') {
    console.error(cloud);
    return <div className="text-red-500">Error loading CKEditor!</div>;
  }

  if (cloud.status === 'loading') {
    return <div className="text-gray-500">Loading CKEditor...</div>;
  }

  // Extract editor and plugins from cloud
  const {
    ClassicEditor,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    FontFamily,
    FontSize,
    FontColor,
    FontBackgroundColor,
    Alignment,
    List,
    Indent,
    Link,
    BlockQuote,
    Table,
    TableToolbar,
    MediaEmbed,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageResize,
    ImageResizeEditing,
    ImageResizeHandles,
    ImageUpload,
    Undo
  } = cloud.CKEditor;

  return (
    <div className="template-editor">
      {/* Placeholder Toolbar */}
      <PlaceholderToolbar onInsertPlaceholder={handleInsertPlaceholder} />
      
      {/* CKEditor */}
      <div className="border border-gray-200 rounded-lg">
        <style>
          {`
            .ck-editor__editable {
              min-height: 600px !important;
              padding: 2.54cm !important;
              background: white !important;
              box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
              border: 1px solid #e5e7eb !important;
              font-family: 'Times New Roman', serif !important;
              font-size: 12pt !important;
              line-height: 1.1 !important;
              color: #000 !important;
            }
            .ck-editor__editable:focus {
              outline: none !important;
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.3) !important;
            }
            .ck.ck-editor__main > .ck-editor__editable {
              background-image: 
                linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
              background-size: 20px 20px;
            }
          `}
        </style>
        <CKEditor
          editor={ClassicEditor}
          config={{
            licenseKey: process.env.REACT_APP_CKEDITOR_LICENSE_KEY || '',
            placeholder: placeholder,
            plugins: [
              Essentials,
              Paragraph,
              Heading,
              Bold,
              Italic,
              Underline,
              Strikethrough,
              FontFamily,
              FontSize,
              FontColor,
              FontBackgroundColor,
              Alignment,
              List,
              Indent,
              Link,
              BlockQuote,
              Table,
              TableToolbar,
              MediaEmbed,
              Image,
              ImageCaption,
              ImageStyle,
              ImageToolbar,
              ImageResize,
              ImageResizeEditing,
              ImageResizeHandles,
              ImageUpload,
              Undo
            ],
            toolbar: [
              'heading',
              '|',
              'fontFamily',
              'fontSize',
              '|',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'alignment',
              '|',
              'numberedList',
              'bulletedList',
              '|',
              'indent',
              'outdent',
              '|',
              'link',
              'blockQuote',
              'insertTable',
              'mediaEmbed',
              '|',
              'imageUpload',
              '|',
              'undo'
            ],
            image: {
              upload: {
                types: ['jpeg', 'png', 'gif', 'webp', 'svg']
              },
              resizeOptions: [
                {
                  name: 'resizeImage:original',
                  value: null,
                  label: 'Original'
                },
                {
                  name: 'resizeImage:50',
                  value: '50',
                  label: '50%'
                },
                {
                  name: 'resizeImage:75',
                  value: '75',
                  label: '75%'
                }
              ],
              toolbar: [
                'imageStyle:alignLeft',
                'imageStyle:alignCenter',
                'imageStyle:alignRight',
                '|',
                'imageResize',
                '|',
                'imageTextAlternative',
                'linkImage'
              ]
            },
            table: {
              contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableProperties',
                'tableCellProperties'
              ]
            },
            fontFamily: {
              options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Courier New, Courier, monospace',
                'Georgia, serif',
                'Lucida Sans Unicode, Lucida Grande, sans-serif',
                'Tahoma, Geneva, sans-serif',
                'Times New Roman, Times, serif',
                'Trebuchet MS, Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif'
              ]
            },
            fontSize: {
              options: [
                10,
                12,
                14,
                'default',
                18,
                20,
                22
              ]
            }
          }}
          data={content}
          onChange={handleContentChange}
          onReady={handleEditorReady}
        />
      </div>

      {/* PDF Preview Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowPdfPreview(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Preview PDF</span>
        </button>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">PDF Preview</h3>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <style>
                {`
                  .image-style-align-center {
                    text-align: center !important;
                  }
                  .image-style-align-center img {
                    margin: 0 auto !important;
                    display: block !important;
                  }
                  .image-style-align-left {
                    text-align: left !important;
                  }
                  .image-style-align-right {
                    text-align: right !important;
                  }
                  .image-style-align-left img,
                  .image-style-align-right img {
                    display: inline-block !important;
                  }
                `}
              </style>
              <div 
                className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto"
                style={{
                  width: '21cm',
                  minHeight: '29.7cm',
                  padding: '2.54cm',
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '12pt',
                  lineHeight: 1.1,
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
                dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={downloadPDF}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
