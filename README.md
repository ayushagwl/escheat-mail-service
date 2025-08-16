# Escheatment Mail Service

A professional web application for managing and sending escheatment letters with automated state rules, template management, and PDF generation.

## 🚀 Features

- **Professional Letter Templates** - Rich text editor with A4 formatting
- **Placeholder System** - Dynamic content replacement ({{recipient_name}}, {{amount}}, etc.)
- **PDF Generation** - Download letters as PDF with proper formatting
- **Template Management** - Create, edit, and manage letter templates
- **User Authentication** - Secure login with Supabase
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Rich Text Editor**: CKEditor 5
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **PDF Generation**: Browser print functionality
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd escheat-mail-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_CKEDITOR_LICENSE_KEY=your_ckeditor_license_key
   ```

4. **Database Setup**
   Run the SQL script in `supabase-setup.sql` in your Supabase SQL editor to create the necessary tables.

5. **Start the development server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── TemplateEditor.tsx
│   ├── PlaceholderToolbar.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── pages/              # Page components
│   ├── Templates.tsx
│   ├── Home.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utility libraries
│   └── supabase.ts
├── config/            # Configuration files
│   └── ckeditor.ts
└── types/             # TypeScript type definitions
```

## 🎯 Usage

### Creating Templates
1. Navigate to "Templates" in the sidebar
2. Click "New Template"
3. Use the rich text editor to create your letter
4. Insert placeholders using the toolbar buttons
5. Save the template

### Using Placeholders
Available placeholders:
- `{{company_name}}` - Company name
- `{{date}}` - Current date
- `{{recipient_name}}` - Recipient's name
- `{{address}}` - Recipient's address
- `{{amount}}` - Unclaimed amount
- `{{state}}` - State of property

### PDF Generation
1. Preview your template
2. Click "Download PDF" button
3. Use browser print dialog to save as PDF

## 🔧 Configuration

### CKEditor Configuration
The rich text editor is configured with:
- A4 page formatting
- Professional typography
- Image upload support
- Placeholder insertion tools

### Supabase Setup
Required tables:
- `letter_templates` - Template storage
- `mail_jobs` - Job tracking
- `job_letters` - Individual letter records
- `users` - User authentication (auto-created)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
