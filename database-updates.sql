-- Enhanced Escheatment Mail Service Database Updates
-- Run this in your Supabase SQL Editor

-- 1. Create new letter_templates table
CREATE TABLE letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  html_content TEXT NOT NULL,
  css_styles TEXT,
  placeholders JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create new mail_jobs table
CREATE TABLE mail_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  csv_file_url TEXT,
  template_id UUID REFERENCES letter_templates(id),
  status TEXT DEFAULT 'draft',
  total_letters INTEGER,
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create new job_letters table
CREATE TABLE job_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES mail_jobs(id) ON DELETE CASCADE,
  recipient_data JSONB,
  generated_letter_url TEXT,
  mail_service TEXT,
  status TEXT DEFAULT 'pending',
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Modify existing templates table
ALTER TABLE templates ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE templates ADD COLUMN html_content TEXT;
ALTER TABLE templates ADD COLUMN css_styles TEXT;
ALTER TABLE templates ADD COLUMN placeholders JSONB;

-- 5. Modify existing letter_jobs table
ALTER TABLE letter_jobs ADD COLUMN csv_file_url TEXT;
ALTER TABLE letter_jobs ADD COLUMN template_id UUID REFERENCES letter_templates(id);
ALTER TABLE letter_jobs ADD COLUMN total_cost DECIMAL(10,2);
ALTER TABLE letter_jobs ADD COLUMN job_name TEXT;

-- 6. Enable RLS on new tables
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_letters ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for letter_templates
CREATE POLICY "Users can view own letter templates" ON letter_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own letter templates" ON letter_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own letter templates" ON letter_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own letter templates" ON letter_templates
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for mail_jobs
CREATE POLICY "Users can view own mail jobs" ON mail_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mail jobs" ON mail_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mail jobs" ON mail_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mail jobs" ON mail_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for job_letters
CREATE POLICY "Users can view own job letters" ON job_letters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mail_jobs 
      WHERE mail_jobs.id = job_letters.job_id 
      AND mail_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own job letters" ON job_letters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mail_jobs 
      WHERE mail_jobs.id = job_letters.job_id 
      AND mail_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own job letters" ON job_letters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mail_jobs 
      WHERE mail_jobs.id = job_letters.job_id 
      AND mail_jobs.user_id = auth.uid()
    )
  );

-- 10. Create indexes for better performance
CREATE INDEX idx_letter_templates_user_id ON letter_templates(user_id);
CREATE INDEX idx_mail_jobs_user_id ON mail_jobs(user_id);
CREATE INDEX idx_mail_jobs_status ON mail_jobs(status);
CREATE INDEX idx_job_letters_job_id ON job_letters(job_id);
CREATE INDEX idx_job_letters_status ON job_letters(status);

-- 11. Insert sample letter templates
INSERT INTO letter_templates (user_id, name, html_content, placeholders, is_default) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'Standard Escheatment Notice',
  '<h2>Unclaimed Property Notice</h2><p>Dear {{recipient_name}},</p><p>This letter serves as official notice regarding unclaimed property in your name that has been reported to the State of {{state}}.</p><p><strong>Property Details:</strong></p><ul><li>Amount: ${{amount}}</li><li>Last Contact Date: {{date}}</li><li>State: {{state}}</li></ul><p>To claim this property, please contact the State Treasurer''s Office of {{state}} or visit their website within 30 days of receiving this notice.</p><p>Sincerely,<br>{{company_name}}</p>',
  '["recipient_name", "amount", "state", "date", "company_name"]',
  true
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Certified Escheatment Notice',
  '<h2>CERTIFIED MAIL - RETURN RECEIPT REQUESTED</h2><h3>Unclaimed Property Notice</h3><p>Dear {{recipient_name}},</p><p>This is an official certified notice regarding unclaimed property in your name that has been reported to the State of {{state}}.</p><p><strong>Property Details:</strong></p><ul><li>Amount: ${{amount}}</li><li>Last Contact Date: {{date}}</li><li>State: {{state}}</li></ul><p>This certified mail serves as legal notice of your obligation to claim this property within 30 days of receipt.</p><p>Sincerely,<br>{{company_name}}</p>',
  '["recipient_name", "amount", "state", "date", "company_name"]',
  false
);
