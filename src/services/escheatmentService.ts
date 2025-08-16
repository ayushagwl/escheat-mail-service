import { supabase, StateRule, UnclaimedProperty } from '../lib/supabase';
import { mailingService, MailingRequest } from './mailingService';

export interface EscheatmentRecord {
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  amount: number;
  date_of_last_contact?: string;
}

export interface ProcessedRecord extends EscheatmentRecord {
  required_service: 'Standard' | 'Certified' | 'Not Required';
  state_rule?: StateRule;
}

export class EscheatmentService {
  // Process uploaded CSV data and determine required mail service
  async processEscheatmentData(
    records: EscheatmentRecord[],
    jobId: string,
    userId: string
  ): Promise<ProcessedRecord[]> {
    const processedRecords: ProcessedRecord[] = [];
    
    // Get all state rules for efficient lookup
    const { data: stateRules } = await supabase
      .from('state_rules')
      .select('*');
    
    const stateRulesMap = new Map(stateRules?.map(rule => [rule.state_code, rule]) || []);
    
    for (const record of records) {
      const stateRule = stateRulesMap.get(record.state);
      const requiredService = this.determineRequiredService(record.amount, stateRule);
      
      processedRecords.push({
        ...record,
        required_service: requiredService,
        state_rule: stateRule
      });
    }
    
    return processedRecords;
  }
  
  // Determine required mail service based on amount and state rules
  private determineRequiredService(amount: number, stateRule?: StateRule): 'Standard' | 'Certified' | 'Not Required' {
    if (!stateRule) {
      // Default to standard if no state rule found
      return amount >= 50 ? 'Standard' : 'Not Required';
    }
    
    if (amount >= stateRule.min_amount_certified) {
      return 'Certified';
    } else if (amount >= stateRule.min_amount_standard) {
      return 'Standard';
    } else {
      return 'Not Required';
    }
  }
  
  // Store processed records in database
  async storeProcessedRecords(
    records: ProcessedRecord[],
    jobId: string,
    userId: string
  ): Promise<void> {
    const unclaimedProperties = records
      .filter(record => record.required_service !== 'Not Required')
      .map(record => ({
        user_id: userId,
        job_id: jobId,
        recipient_name: record.recipient_name,
        address: {
          street: record.street,
          city: record.city,
          state: record.state,
          zip_code: record.zip_code,
          country: 'USA'
        },
        amount: record.amount,
        date_of_last_contact: record.date_of_last_contact,
        state_of_property: record.state,
        required_service: record.required_service,
        mail_status: 'Pending' as const
      }));
    
    if (unclaimedProperties.length > 0) {
      const { error } = await supabase
        .from('unclaimed_property')
        .insert(unclaimedProperties);
      
      if (error) {
        throw new Error(`Failed to store unclaimed property records: ${error.message}`);
      }
    }
  }
  
  // Send letters for a specific job
  async sendLettersForJob(jobId: string): Promise<void> {
    // Get all pending records for this job
    const { data: records, error } = await supabase
      .from('unclaimed_property')
      .select('*')
      .eq('job_id', jobId)
      .eq('mail_status', 'Pending');
    
    if (error) {
      throw new Error(`Failed to fetch pending records: ${error.message}`);
    }
    
    if (!records || records.length === 0) {
      return;
    }
    
    // Get templates
    const { data: templates } = await supabase
      .from('templates')
      .select('*');
    
    const defaultTemplate = templates?.find(t => t.is_default);
    const certifiedTemplate = templates?.find(t => t.name.includes('Certified'));
    
    // Process each record
    for (const record of records) {
      try {
        // Update status to Processing
        await supabase
          .from('unclaimed_property')
          .update({ mail_status: 'Processing' })
          .eq('id', record.id);
        
        // Select appropriate template
        const template = record.required_service === 'Certified' 
          ? certifiedTemplate 
          : defaultTemplate;
        
        if (!template) {
          throw new Error('No template found for required service');
        }
        
        // Generate letter content
        const letterContent = this.generateLetterContent(template.content, record);
        
        // Send letter via mailing service
        const mailingRequest: MailingRequest = {
          to: {
            name: record.recipient_name,
            address_line1: record.address.street,
            city: record.address.city,
            state: record.address.state,
            zip_code: record.address.zip_code,
            country: record.address.country || 'USA'
          },
          from: {
            name: 'Escheatment Service',
            address_line1: '123 Business St',
            city: 'Business City',
            state: 'CA',
            zip_code: '90210',
            country: 'USA'
          },
          content: letterContent,
          envelope_type: record.required_service
        };
        
        const mailingResponse = await mailingService.sendLetter(mailingRequest);
        
        // Update record with mailing details
        await supabase
          .from('unclaimed_property')
          .update({
            mail_status: 'In Transit',
            tracking_number: mailingResponse.tracking_number,
            lob_letter_id: mailingResponse.id,
            mailed_date: new Date().toISOString()
          })
          .eq('id', record.id);
        
      } catch (error) {
        console.error(`Failed to send letter for record ${record.id}:`, error);
        
        // Update status to Failed
        await supabase
          .from('unclaimed_property')
          .update({ mail_status: 'Failed' })
          .eq('id', record.id);
      }
    }
    
    // Update job status
    await supabase
      .from('letter_jobs')
      .update({ 
        status: 'Mailed',
        mailed_records: records.length
      })
      .eq('id', jobId);
  }
  
  // Generate letter content from template
  private generateLetterContent(templateContent: string, record: UnclaimedProperty): string {
    let content = templateContent;
    
    // Replace placeholders
    content = content.replace(/{{recipient_name}}/g, record.recipient_name);
    content = content.replace(/{{amount}}/g, record.amount.toFixed(2));
    content = content.replace(/{{state_of_property}}/g, record.state_of_property);
    content = content.replace(/{{date_of_last_contact}}/g, record.date_of_last_contact || 'Unknown');
    content = content.replace(/{{company_name}}/g, 'Your Company Name');
    
    return content;
  }
  
  // Get job statistics
  async getJobStatistics(jobId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    inTransit: number;
    delivered: number;
    returned: number;
    failed: number;
  }> {
    const { data: records } = await supabase
      .from('unclaimed_property')
      .select('mail_status')
      .eq('job_id', jobId);
    
    if (!records) return {
      total: 0, pending: 0, processing: 0, inTransit: 0, delivered: 0, returned: 0, failed: 0
    };
    
    const stats = {
      total: records.length,
      pending: records.filter(r => r.mail_status === 'Pending').length,
      processing: records.filter(r => r.mail_status === 'Processing').length,
      inTransit: records.filter(r => r.mail_status === 'In Transit').length,
      delivered: records.filter(r => r.mail_status === 'Delivered').length,
      returned: records.filter(r => r.mail_status === 'Returned').length,
      failed: records.filter(r => r.mail_status === 'Failed').length
    };
    
    return stats;
  }
  
  // Handle webhook events from mailing service
  async handleWebhookEvent(eventData: any): Promise<void> {
    const { lob_letter_id, tracking_number, status } = eventData;
    
    // Find the record by tracking number or lob letter id
    const { data: record } = await supabase
      .from('unclaimed_property')
      .select('*')
      .or(`tracking_number.eq.${tracking_number},lob_letter_id.eq.${lob_letter_id}`)
      .single();
    
    if (!record) {
      console.warn('No record found for webhook event:', eventData);
      return;
    }
    
    // Update record status
    const updateData: any = { mail_status: status };
    
    switch (status) {
      case 'delivered':
        updateData.delivered_date = new Date().toISOString();
        break;
      case 'returned_to_sender':
        updateData.mail_status = 'Returned';
        updateData.returned_date = new Date().toISOString();
        updateData.returned_scan_url = eventData.returned_scan_url;
        break;
    }
    
    await supabase
      .from('unclaimed_property')
      .update(updateData)
      .eq('id', record.id);
    
    // Log webhook event
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: status,
        lob_letter_id,
        tracking_number,
        payload: eventData,
        processed: true
      });
  }
}

export const escheatmentService = new EscheatmentService();
