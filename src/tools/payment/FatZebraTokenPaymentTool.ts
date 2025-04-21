import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraTokenPaymentInput {
  amount: number;
  currency?: string;
  card_token: string;
  reference: string;
  cvv: string;
  card_holder: string;
  customer_email?: string;
  customer_ip?: string;
  capture?: boolean;
}

// Define request body interface with all possible properties
interface TokenPaymentRequestBody {
  amount: number;
  currency?: string;
  card_token: string;
  reference: string;
  customer_ip?: string;
  cvv: string;
  card_holder: string;
  customer_email?: string;
  capture?: boolean;
}

/**
 * Fat Zebra Token Payment Tool
 * Process a payment using a tokenized card with the Fat Zebra payment gateway
 */
const FatZebraTokenPaymentTool = {
  name: "fat_zebra_token_payment",
  description: "Process a payment using a tokenized card with the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to charge in cents (e.g., 1000 for $10.00)"),
    currency: z.string().optional().default("AUD").describe("The three-letter ISO currency code (default: AUD)"),
    card_token: z.string().describe("The tokenized card to charge"),
    reference: z.string().describe("A unique reference for this transaction"),
    cvv: z.string().describe("The card verification value (CVV/CVC) code (required)"),
    card_holder: z.string().describe("The cardholder's name (required)"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    customer_ip: z.string().optional().default("127.0.0.1").describe("The customer's IP address (optional, defaults to 127.0.0.1)"),
    capture: z.boolean().default(true).describe("Whether to capture the payment immediately (default: true)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ amount, currency, card_token, reference, cvv, card_holder, customer_email, customer_ip, capture }: FatZebraTokenPaymentInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Default values to ensure API acceptance
      const defaultCardHolder = "Test User";
      const defaultCVV = "123";
      
      // Always ensure CVV is provided - now required by interface
      const cardCVV = cvv || defaultCVV;

      // Always ensure card_holder is provided - now required by interface
      const cardHolder = card_holder || defaultCardHolder;

      // Create a unique reference with timestamp AND random string to ensure uniqueness
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const paymentReference = reference || `token-${uniqueId}`;

      // Prepare the request body for the Fat Zebra API
      const requestBody: TokenPaymentRequestBody = {
        amount: amount,
        card_token: card_token,
        reference: paymentReference,
        cvv: cardCVV,
        card_holder: cardHolder,
        currency: currency || "AUD", // Always include currency
      };

      // Add optional fields only if provided
      if (customer_ip) {
        requestBody.customer_ip = customer_ip;
      }

      if (customer_email) {
        requestBody.customer_email = customer_email;
      }

      if (capture !== undefined) {
        requestBody.capture = capture;
      }

      // Log the request (redact sensitive data)
      console.log(`[FatZebraTokenPaymentTool] Making token payment request to: ${baseUrl}/purchases`);
      console.log(`[FatZebraTokenPaymentTool] Amount: ${amount}, Currency: ${currency || "AUD"}, Reference: ${paymentReference}`);

      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      // Log the response (redact sensitive data)
      console.log(`[FatZebraTokenPaymentTool] Response:`, data.successful ? "Success" : "Failed");
      
      // Check if the response was successful
      if (!data.successful) {
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              successful: false,
              status: response.status,
              response: null,
              errors: data.errors || ["Unknown error from Fat Zebra API"]
            })
          }]
        };
      }

      // Return the response from Fat Zebra
      const result = {
        successful: data.successful,
        status: response.status,
        response: {
          transaction_id: data.response.transaction_id,
          amount: data.response.amount,
          reference: data.response.reference,
          message: data.response.message,
          authorization: data.response.response_code,
          currency: data.response.currency,
          timestamp: data.response.transaction_date,
        },
        errors: undefined
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      console.error('[FatZebraTokenPaymentTool] Error:', error);
      
      const errorResult = { 
        successful: false, 
        status: 500, 
        response: null, 
        errors: [(error instanceof Error ? error.message : String(error))] 
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(errorResult)
        }]
      };
    }
  }
};

export default FatZebraTokenPaymentTool;