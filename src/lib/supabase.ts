import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder_key'

// Check if we have valid Supabase credentials
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not found. Please create a .env file with your Supabase project URL and anon key.')
  console.warn('📝 See env.example for the required format.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Escheatment Mail Service
export interface User {
  id: string
  email: string
  created_at: string
}

export interface StateRule {
  id: string
  state_code: string
  state_name: string
  min_amount_certified: number
  min_amount_standard: number
  certified_mail_required: boolean
  created_at: string
}

export interface LetterJob {
  id: string
  user_id: string
  job_name: string
  upload_date: string
  total_records: number
  processed_records: number
  mailed_records: number
  returned_records: number
  status: 'Processing' | 'Mailed' | 'Completed' | 'Failed'
  template_id?: string
  csv_file_url?: string
  total_cost?: number
  created_at: string
}

export interface UnclaimedProperty {
  id: string
  user_id: string
  job_id: string
  recipient_name: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
    country?: string
  }
  amount: number
  date_of_last_contact?: string
  state_of_property: string
  required_service: 'Standard' | 'Certified' | 'Not Required'
  mail_status: 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Returned' | 'Failed'
  tracking_number?: string
  lob_letter_id?: string
  returned_scan_url?: string
  mailed_date?: string
  delivered_date?: string
  returned_date?: string
  created_at: string
}

export interface Template {
  id: string
  name: string
  content: string
  preview_image?: string
  is_default: boolean
  user_id?: string
  html_content?: string
  css_styles?: string
  placeholders?: string[]
  created_at: string
}

export interface LetterTemplate {
  id: string
  user_id: string
  name: string
  html_content: string
  css_styles?: string
  placeholders?: string[]
  is_default: boolean
  created_at: string
}

export interface MailJob {
  id: string
  user_id: string
  job_name: string
  csv_file_url?: string
  template_id?: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  total_letters?: number
  total_cost?: number
  created_at: string
}

export interface JobLetter {
  id: string
  job_id: string
  recipient_data: any
  generated_letter_url?: string
  mail_service: 'Standard' | 'Certified'
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'returned' | 'failed'
  cost?: number
  created_at: string
}

export interface Envelope {
  id: string
  name: string
  price: number
  service_type: 'Standard' | 'Certified'
  created_at: string
}

export interface PricingRule {
  id: string
  rule_type: string
  price: number
  service_type: 'Standard' | 'Certified'
  created_at: string
}

export interface WebhookLog {
  id: string
  event_type: string
  lob_letter_id?: string
  tracking_number?: string
  payload: any
  processed: boolean
  created_at: string
}
