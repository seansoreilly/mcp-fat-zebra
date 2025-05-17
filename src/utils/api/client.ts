import fetch, { Response } from 'node-fetch';
import { getLogger } from '../logger.js';

interface FatZebraApiResponse {
  successful: boolean;
  errors?: any;
  response?: {
    id?: string;
    transaction_id?: string;
    three_ds?: {
      authority_url?: string;
      authority_method?: string;
      params?: Record<string, string>;
    };
    amount?: number;
    reference?: string;
    message?: string;
    currency?: string;
    created_at?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Fat Zebra API Client
 * Handles communication with the Fat Zebra API including authentication, request formatting, and error handling
 */
export class FatZebraApiClient {
  private baseUrl: string;
  private auth: string;
  private logger = getLogger('FatZebraApiClient');
  private username: string;

  constructor() {
    this.username = process.env.FAT_ZEBRA_USERNAME || "TEST";
    const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
    this.baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
    this.auth = `Basic ${Buffer.from(`${this.username}:${token}`).toString('base64')}`;
    
    this.logger.info(`Initialized Fat Zebra API client with username: ${this.username}`);
    this.logger.info(`API base URL: ${this.baseUrl}`);
  }

  /**
   * Makes a request to the Fat Zebra API
   * @param endpoint The API endpoint (e.g., /purchases)
   * @param method The HTTP method (e.g., POST, GET)
   * @param body Optional request body
   * @returns The API response and data
   */
  async makeRequest(endpoint: string, method: string, body?: any): Promise<{ response: Response; data: FatZebraApiResponse }> {
    try {
      // Sanitize the request body before logging (remove sensitive data)
      const sanitizedBody = body ? this.sanitizeRequestBody(body) : undefined;
      
      this.logger.info({
        method,
        endpoint,
        body: sanitizedBody
      }, 'Making API request');

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.auth,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json() as FatZebraApiResponse;
      
      // Sanitize the response data before logging
      const sanitizedResponse = this.sanitizeResponseData(data);
      
      this.logger.info({
        status: response.status,
        successful: data.successful,
        errors: data.errors,
        response: sanitizedResponse
      }, 'Received API response');
      
      return { response, data };
    } catch (error) {
      this.logger.error({ err: error }, 'API request failed');
      throw error;
    }
  }
  
  /**
   * Sanitizes the request body to remove sensitive information before logging
   * @param body The request body to sanitize
   * @returns Sanitized request body
   */
  private sanitizeRequestBody(body: any): any {
    const sanitized = { ...body };
    
    // Mask sensitive credit card information
    if (sanitized.card_number) {
      sanitized.card_number = this.maskCardNumber(sanitized.card_number);
    }
    
    if (sanitized.card_cvv) {
      sanitized.card_cvv = '***';
    }
    
    return sanitized;
  }
  
  /**
   * Sanitizes response data to remove sensitive information before logging
   * @param data The response data to sanitize
   * @returns Sanitized response data
   */
  private sanitizeResponseData(data: any): any {
    if (!data || !data.response) {
      return data;
    }
    
    const sanitized = { 
      transaction_id: data.response.transaction_id,
      reference: data.response.reference,
      amount: data.response.amount,
      message: data.response.message,
      response_code: data.response.response_code,
      // Don't include card_token or customer details in logs
    };
    
    return sanitized;
  }
  
  /**
   * Masks a card number for secure logging
   * @param cardNumber The card number to mask
   * @returns Masked card number
   */
  private maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 8) {
      return '******';
    }
    
    // Keep first 6 and last 4 digits, mask the rest
    return `${cardNumber.substring(0, 6)}...${cardNumber.substring(cardNumber.length - 4)}`;
  }
  
  /**
   * Checks if we're using test credentials
   * @returns True if using test credentials
   */
  isTestMode(): boolean {
    return this.username === 'TEST';
  }
}

// Export a singleton instance for shared use
export const fatZebraApi = new FatZebraApiClient();
