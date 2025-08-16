// Mailing service for integrating with external APIs like Lob
// This is a placeholder implementation - you'll need to add your actual API keys

interface MailingRequest {
  to: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  from: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  content: string;
  envelope_type: string;
}

interface MailingResponse {
  id: string;
  status: string;
  tracking_number?: string;
  expected_delivery_date?: string;
}

class MailingService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_LOB_API_KEY || '';
    this.baseUrl = 'https://api.lob.com/v1';
  }

  async sendLetter(request: MailingRequest): Promise<MailingResponse> {
    if (!this.apiKey) {
      // Mock response for development
      return this.mockSendLetter(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/letters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: request.to,
          from: request.from,
          file: this.convertContentToHTML(request.content),
          color: false,
          double_sided: false,
          address_placement: 'top_first_page',
          return_envelope: false,
          perforated_page: null,
          extra_service: null,
          mail_type: 'usps_first_class',
          billing_group_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mailing service error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        tracking_number: data.tracking_number,
        expected_delivery_date: data.expected_delivery_date,
      };
    } catch (error) {
      console.error('Error sending letter:', error);
      throw error;
    }
  }

  private convertContentToHTML(content: string): string {
    // Convert plain text content to HTML format
    const htmlContent = content
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Letter</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 1in;
            }
            p {
              margin: 0 0 1em 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
  }

  private mockSendLetter(request: MailingRequest): Promise<MailingResponse> {
    // Mock implementation for development/testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `mock_${Date.now()}`,
          status: 'submitted',
          tracking_number: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }, 1000);
    });
  }

  async getLetterStatus(letterId: string): Promise<{ status: string; tracking_number?: string }> {
    if (!this.apiKey) {
      // Mock response for development
      return this.mockGetLetterStatus(letterId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/letters/${letterId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get letter status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        tracking_number: data.tracking_number,
      };
    } catch (error) {
      console.error('Error getting letter status:', error);
      throw error;
    }
  }

  private mockGetLetterStatus(letterId: string): Promise<{ status: string; tracking_number?: string }> {
    // Mock implementation for development/testing
    const statuses = ['submitted', 'mailed', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: randomStatus,
          tracking_number: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
      }, 500);
    });
  }

  // Webhook handler for status updates (to be implemented on the backend)
  handleWebhook(payload: any): { letterId: string; status: string } {
    // This would typically be handled by a backend service
    // For now, we'll just return a mock response
    return {
      letterId: payload.data?.id || 'unknown',
      status: payload.data?.status || 'unknown',
    };
  }
}

export const mailingService = new MailingService();
export type { MailingRequest, MailingResponse };
