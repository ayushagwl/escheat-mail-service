Looking at your existing `supabase-setup.sql` and the current codebase, here's my comprehensive plan for implementing the new workflow:

## 📋 **Analysis of Current State**

### **Existing Tables (Good to Keep):**
- ✅ `state_rules` - Perfect for escheatment rules
- ✅ `letter_jobs` - Good foundation for job tracking
- ✅ `unclaimed_property` - Core data storage
- ✅ `templates` - Basic template system
- ✅ `envelopes` - Service pricing
- ✅ `pricing_rules` - Cost calculation
- ✅ `webhook_logs` - Status tracking

### **Current Codebase Structure:**
- ✅ Modern dashboard design
- ✅ Authentication system
- ✅ Basic routing
- ✅ Supabase integration

---

## 🗂️ **Database Changes Required**

### **1. New Tables to Add:**
```sql
-- Rich template system
CREATE TABLE letter_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  html_content TEXT NOT NULL,
  css_styles TEXT,
  placeholders JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced mail jobs with more metadata
CREATE TABLE mail_jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  job_name TEXT NOT NULL,
  csv_file_url TEXT,
  template_id UUID REFERENCES letter_templates(id),
  status TEXT DEFAULT 'draft',
  total_letters INTEGER,
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual letter tracking with PDFs
CREATE TABLE job_letters (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES mail_jobs(id),
  recipient_data JSONB,
  generated_letter_url TEXT,
  mail_service TEXT,
  status TEXT DEFAULT 'pending',
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Tables to Modify:**

#### **`templates` table - Add user_id and rich content:**
```sql
ALTER TABLE templates ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE templates ADD COLUMN html_content TEXT;
ALTER TABLE templates ADD COLUMN css_styles TEXT;
ALTER TABLE templates ADD COLUMN placeholders JSONB;
```

#### **`letter_jobs` table - Enhance with new fields:**
```sql
ALTER TABLE letter_jobs ADD COLUMN csv_file_url TEXT;
ALTER TABLE letter_jobs ADD COLUMN template_id UUID REFERENCES letter_templates(id);
ALTER TABLE letter_jobs ADD COLUMN total_cost DECIMAL(10,2);
ALTER TABLE letter_jobs ADD COLUMN job_name TEXT;
```

### **3. Tables to Keep As-Is:**
- `state_rules` - Perfect for escheatment logic
- `envelopes` - Good pricing structure
- `pricing_rules` - Flexible cost system
- `webhook_logs` - Essential for tracking

---

## 🎨 **Frontend Changes Required**

### **1. Navigation Updates:**
```typescript
// Update Sidebar navigation
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Create Mail Job', href: '/create-job', icon: Plus }, // NEW
  { name: 'Job History', href: '/job-history', icon: FileText }, // RENAME from OrderHistory
  { name: 'Templates', href: '/templates', icon: Layout }, // NEW
  { name: 'Settings', href: '/settings', icon: Settings } // NEW
];
```

### **2. New Pages to Create:**

#### **`/create-job` - Multi-step job creation:**
```typescript
// Step 1: Job Setup
- JobNameForm
- CSVUploader
- CSVPreview

// Step 2: Template Selection
- TemplateGallery
- CreateNewTemplateButton

// Step 3: Template Editor (if creating new)
- CKEditor 5 Integration (with image upload)
- Simple placeholder buttons
- LivePreview

// Step 4: Review & Pricing
- LettersTable
- LetterPreview (PDF)
- PricingCalculator
- ConfirmationButton
```

#### **`/templates` - Template management:**
```typescript
- TemplateList
- TemplateEditor (CKEditor 5)
- TemplatePreview
- DeleteTemplate
```

#### **`/job-history` - Enhanced job tracking:**
```typescript
- JobList (with status, cost, letter count)
- JobDetail (with letters table)
- LetterPreview (PDF viewer)
- ExportJob
```

### **3. Pages to Modify:**

#### **`/escheatment-upload` - Delete this page**
- Replace with new `/create-job` flow

#### **`/job-tracking` - Enhance this page**
- Add PDF preview functionality
- Add cost breakdown
- Add export features

#### **`/create-letter` - Keep for single letters**
- Update to use new template system
- Add CKEditor 5 integration

#### **`/order-history` - Rename to `/job-history`**
- Update to show mail jobs instead of individual letters
- Add job-level details

---

## 🛠️ **Component Changes**

### **1. New Components to Create:**

#### **CKEditor 5 Template Editor:**
```typescript
// src/components/TemplateEditor.tsx
- CKEditor 5 Cloud CDN integration
- Built-in image upload and positioning
- Simple placeholder buttons
- CKEditor styling configuration
- Live preview
```

#### **CSV Processor:**
```typescript
// src/components/CSVProcessor.tsx
- Drag & drop upload
- Column mapping
- Data validation
- Preview table
- State rules application
```

#### **Letters Table:**
```typescript
// src/components/LettersTable.tsx
- Tabular format
- Service type indicators
- Cost breakdown
- PDF preview buttons
- Bulk actions
```

#### **PDF Preview:**
```typescript
// src/components/LetterPreview.tsx
- PDF generation from CKEditor HTML
- Iframe display
- Download option
- Print option
```

#### **Placeholder Toolbar:**
```typescript
// src/components/PlaceholderToolbar.tsx
- Simple buttons for {{recipient_name}}, {{amount}}, etc.
- Text insertion into CKEditor
- Visual placeholder indicators
```

### **2. Components to Modify:**

#### **`PricingCalculator` - Enhance:**
- Add job-level pricing
- Show per-letter breakdown
- Add bulk discounts

#### **`TemplateSelector` - Replace:**
- Use new CKEditor 5 template system
- Add template creation option

### **3. Components to Delete:**
- `RecipientForm` - Replace with CSV upload
- `EnvelopeSelector` - Integrate into pricing

---

## 🔄 **Service Layer Changes**

### **1. New Services:**

#### **CKEditor Service:**
```typescript
// src/services/ckeditorService.ts
- initializeCKEditor()
- configureImageUpload()
- generatePDFFromCKEditor()
- applyTemplateStyles()
```

#### **Template Service:**
```typescript
// src/services/templateService.ts
- createTemplate()
- updateTemplate()
- deleteTemplate()
- generatePDF()
- applyPlaceholders()
```

#### **Job Service:**
```typescript
// src/services/jobService.ts
- createJob()
- processCSV()
- generateLetters()
- calculatePricing()
- submitJob()
```

#### **PDF Service:**
```typescript
// src/services/pdfService.ts
- generateLetterPDFFromCKEditor() // Uses CKEditor HTML
- applyCKEditorStyles() // Maintains CKEditor formatting
- mergePDFs()
- uploadToStorage()
```

### **2. Services to Modify:**

#### **`escheatmentService.ts` - Enhance:**
- Add job-level processing
- Add PDF generation
- Add template support

#### **`mailingService.ts` - Keep as-is:**
- Good foundation for Lob integration

---

## 📁 **File Structure Changes**

### **New Files to Create:**
```
src/
├── pages/
│   ├── CreateJob.tsx (NEW)
│   ├── Templates.tsx (NEW)
│   ├── JobHistory.tsx (RENAME from OrderHistory)
│   └── Settings.tsx (NEW)
├── components/
│   ├── TemplateEditor.tsx (NEW - CKEditor 5)
│   ├── CSVProcessor.tsx (NEW)
│   ├── LettersTable.tsx (NEW)
│   ├── LetterPreview.tsx (NEW)
│   ├── JobSetup.tsx (NEW)
│   └── PlaceholderToolbar.tsx (NEW)
├── services/
│   ├── ckeditorService.ts (NEW)
│   ├── templateService.ts (NEW)
│   ├── jobService.ts (NEW)
│   └── pdfService.ts (NEW)
├── config/
│   └── ckeditor.ts (NEW)
└── types/
    └── job.ts (NEW)
```

### **Files to Delete:**
- `src/pages/EscheatmentUpload.tsx` (replace with CreateJob)
- `src/components/RecipientForm.tsx` (replace with CSVProcessor)

### **Files to Modify:**
- `src/pages/OrderHistory.tsx` → `JobHistory.tsx`
- `src/pages/JobTracking.tsx` (enhance)
- `src/lib/supabase.ts` (add new types)
- `src/App.tsx` (update routes)

---

## 🎨 **UI/UX Improvements**

### **1. Multi-step Form Design:**
```typescript
// Progress indicator
const steps = [
  { name: 'Job Setup', status: 'current' },
  { name: 'Template', status: 'upcoming' },
  { name: 'Review', status: 'upcoming' }
];
```

### **2. CKEditor 5 Template Editor:**
- Professional WYSIWYG editor
- Built-in image upload and positioning
- Simple placeholder buttons
- CKEditor styling configuration
- Live preview

### **3. Enhanced Tables:**
- Sortable columns
- Filtering
- Bulk actions
- PDF preview modals

---

## 🚀 **Implementation Priority**

### **Phase 1: Foundation (Week 1)**
1. Update database schema
2. Create basic job creation flow
3. Implement CSV upload
4. Basic template system

### **Phase 2: Rich Features (Week 2) with CKEditor 5**
1. CKEditor 5 integration and configuration
2. Simple placeholder button implementation
3. Image upload configuration
4. PDF generation from CKEditor HTML
5. Enhanced preview system
6. Job history page

### **Phase 3: Polish (Week 3)**
1. Advanced styling
2. Performance optimization
3. Error handling
4. User feedback

---

## 📦 **Dependencies to Add**

### **Package.json additions:**
```json
{
  "dependencies": {
    "@ckeditor/ckeditor5-react": "^6.0.0"
  }
}
```

### **Environment Variables:**
```env
REACT_APP_CKEDITOR_LICENSE_KEY=your_license_key_here
```

---

## ⚙️ **CKEditor 5 Configuration**

### **Configuration File:**
```typescript
// src/config/ckeditor.ts
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
```

---

## 💡 **Key Benefits of This Plan**

1. **Leverages Existing Infrastructure**: Uses your current tables and services
2. **Minimal Disruption**: Keeps working features intact
3. **Scalable Design**: Supports hundreds of letters efficiently
4. **Professional Templates**: CKEditor 5 provides Word-like editing experience
5. **Clear Workflow**: Step-by-step job creation process
6. **Cost Transparency**: Clear pricing before sending
7. **Superior Typography**: CKEditor 5 offers better text formatting and layout
8. **Simplified Implementation**: Single editor handles all content including images
9. **Easy Placeholder Management**: Simple buttons for quick insertion

This plan builds on your existing solid foundation while adding the rich features you need for professional escheatment mail service with CKEditor 5!