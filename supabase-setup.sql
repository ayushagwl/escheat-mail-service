-- Enhanced Escheatment Mail Service Database Setup
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create state_rules table for escheatment requirements
CREATE TABLE state_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  min_amount_certified DECIMAL(10,2) NOT NULL,
  min_amount_standard DECIMAL(10,2) NOT NULL,
  certified_mail_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create letter_jobs table for bulk processing
CREATE TABLE letter_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER NOT NULL,
  processed_records INTEGER DEFAULT 0,
  mailed_records INTEGER DEFAULT 0,
  returned_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Processing' CHECK (status IN ('Processing', 'Mailed', 'Completed', 'Failed')),
  template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unclaimed_property table for individual records
CREATE TABLE unclaimed_property (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES letter_jobs(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  address JSONB NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date_of_last_contact DATE,
  state_of_property TEXT NOT NULL,
  required_service TEXT CHECK (required_service IN ('Standard', 'Certified', 'Not Required')),
  mail_status TEXT DEFAULT 'Pending' CHECK (mail_status IN ('Pending', 'Processing', 'In Transit', 'Delivered', 'Returned', 'Failed')),
  tracking_number TEXT,
  lob_letter_id TEXT,
  returned_scan_url TEXT,
  mailed_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  returned_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table for escheatment letters
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  preview_image TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create envelopes table
CREATE TABLE envelopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  service_type TEXT CHECK (service_type IN ('Standard', 'Certified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_rules table
CREATE TABLE pricing_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  service_type TEXT CHECK (service_type IN ('Standard', 'Certified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table for tracking webhook events
CREATE TABLE webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  lob_letter_id TEXT,
  tracking_number TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE state_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE unclaimed_property ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE envelopes ENABLE RLS;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- State rules: Read access for all authenticated users
CREATE POLICY "State rules are viewable by authenticated users" ON state_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Letter jobs: Users can only see their own jobs
CREATE POLICY "Users can view own letter jobs" ON letter_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own letter jobs" ON letter_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own letter jobs" ON letter_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Unclaimed property: Users can only see their own records
CREATE POLICY "Users can view own unclaimed property" ON unclaimed_property
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unclaimed property" ON unclaimed_property
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own unclaimed property" ON unclaimed_property
  FOR UPDATE USING (auth.uid() = user_id);

-- Templates: Read access for all authenticated users
CREATE POLICY "Templates are viewable by authenticated users" ON templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Envelopes: Read access for all authenticated users
CREATE POLICY "Envelopes are viewable by authenticated users" ON envelopes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Pricing rules: Read access for all authenticated users
CREATE POLICY "Pricing rules are viewable by authenticated users" ON pricing_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Webhook logs: Service role access (for webhook processing)
CREATE POLICY "Service role can manage webhook logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample state rules (based on common escheatment requirements)
INSERT INTO state_rules (state_code, state_name, min_amount_certified, min_amount_standard, certified_mail_required) VALUES
('CA', 'California', 1000.00, 50.00, true),
('NY', 'New York', 1000.00, 100.00, true),
('TX', 'Texas', 500.00, 25.00, false),
('FL', 'Florida', 1000.00, 50.00, true),
('IL', 'Illinois', 1000.00, 100.00, true),
('PA', 'Pennsylvania', 1000.00, 50.00, true),
('OH', 'Ohio', 1000.00, 50.00, true),
('GA', 'Georgia', 1000.00, 50.00, true),
('NC', 'North Carolina', 1000.00, 50.00, true),
('MI', 'Michigan', 1000.00, 50.00, true);

-- Insert escheatment-specific templates
INSERT INTO templates (name, content, is_default) VALUES
('Standard Escheatment Notice', 
'Dear {{recipient_name}},

This letter serves as official notice regarding unclaimed property in your name that has been reported to the State of {{state_of_property}}.

Property Details:
- Amount: ${{amount}}
- Last Contact Date: {{date_of_last_contact}}
- State: {{state_of_property}}

To claim this property, please contact the State Treasurer''s Office of {{state_of_property}} or visit their website within 30 days of receiving this notice.

If you have any questions, please contact us immediately.

Sincerely,
{{company_name}}', 
true),

('Certified Escheatment Notice', 
'CERTIFIED MAIL - RETURN RECEIPT REQUESTED

Dear {{recipient_name}},

This is an official certified notice regarding unclaimed property in your name that has been reported to the State of {{state_of_property}}.

Property Details:
- Amount: ${{amount}}
- Last Contact Date: {{date_of_last_contact}}
- State: {{state_of_property}}

This certified mail serves as legal notice of your obligation to claim this property within 30 days of receipt.

To claim this property, please contact the State Treasurer''s Office of {{state_of_property}} or visit their website.

If you have any questions, please contact us immediately.

Sincerely,
{{company_name}}', 
false);

-- Insert envelope types for different services
INSERT INTO envelopes (name, price, service_type) VALUES
('Standard Business Envelope', 0.50, 'Standard'),
('Certified Mail Envelope', 1.25, 'Certified'),
('Premium Certified Envelope', 2.00, 'Certified'),
('Express Certified Envelope', 3.50, 'Certified');

-- Insert pricing rules
INSERT INTO pricing_rules (rule_type, price, service_type) VALUES
('per_page_cost', 0.25, 'Standard'),
('per_page_cost', 0.35, 'Certified'),
('base_postage', 0.55, 'Standard'),
('certified_mail_fee', 3.50, 'Certified'),
('return_receipt_fee', 2.85, 'Certified'),
('rush_processing', 5.00, 'Standard'),
('rush_processing', 7.50, 'Certified');

-- Create indexes for better performance
CREATE INDEX idx_unclaimed_property_user_id ON unclaimed_property(user_id);
CREATE INDEX idx_unclaimed_property_job_id ON unclaimed_property(job_id);
CREATE INDEX idx_unclaimed_property_state ON unclaimed_property(state_of_property);
CREATE INDEX idx_unclaimed_property_status ON unclaimed_property(mail_status);
CREATE INDEX idx_letter_jobs_user_id ON letter_jobs(user_id);
CREATE INDEX idx_letter_jobs_status ON letter_jobs(status);
CREATE INDEX idx_webhook_logs_lob_letter_id ON webhook_logs(lob_letter_id);
CREATE INDEX idx_webhook_logs_tracking_number ON webhook_logs(tracking_number);
