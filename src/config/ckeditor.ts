// CKEditor 5 Configuration for Escheatment Mail Service
export const ckeditorConfig = {
  cloud: {
    version: '46.0.1',
    licenseKey: process.env.REACT_APP_CKEDITOR_LICENSE_KEY
  },
  editor: {
    toolbar: [
      'heading', '|',
      'bold', 'italic', 'underline', '|',
      'image', '|', // Enable image upload
      'numberedList', 'bulletedList', '|',
      'undo', 'redo'
    ],
    plugins: [
      'Essentials',
      'Bold',
      'Italic',
      'Underline',
      'List',
      'Image',
      'ImageUpload'
    ],
    image: {
      upload: {
        types: ['jpeg', 'png', 'gif', 'webp']
      },
      styles: [
        'alignLeft',
        'alignCenter', 
        'alignRight'
      ]
    },
    placeholder: 'Write your escheatment letter template here...'
  }
};

// Placeholder options for escheatment letters
export const placeholderOptions = [
  { label: 'Recipient Name', value: '{{recipient_name}}' },
  { label: 'Amount', value: '{{amount}}' },
  { label: 'Address', value: '{{address}}' },
  { label: 'State', value: '{{state}}' },
  { label: 'Date', value: '{{date}}' },
  { label: 'Company Name', value: '{{company_name}}' },
  { label: 'Phone', value: '{{phone}}' },
  { label: 'Email', value: '{{email}}' }
];
