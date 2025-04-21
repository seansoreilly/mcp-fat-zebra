import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraPaymentInput {
  amount: number;
  currency?: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  reference: string;
  card_holder?: string;
  customer_email?: string;
  customer_ip?: string;
  capture?: boolean;
}

// Define request body interface with all possible properties
interface PaymentRequestBody {
  amount: number;
  currency?: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  reference: string;
  customer_ip?: string;
  card_holder?: string;
  customer_email?: string;
  capture?: boolean;
}

/**
 * Fat Zebra Payment Tool
 * Process a credit card payment using the Fat Zebra payment gateway
 */
const FatZebraPaymentTool = {
  name: "fat_zebra_payment",
  description: "Process a credit card payment using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to charge in cents (e.g., 1000 for $10.00)"),
    currency: z.string().default("AUD").describe("The three-letter ISO currency code (default: AUD)"),
    card_number: z.string().describe("The customer's credit card number"),
    card_expiry: z.string().describe("The card expiry date in the format MM/YYYY (e.g., 05/2026)"),
    card_cvv: z.string().describe("The card verification value (CVV/CVC) code"),
    reference: z.string().describe("A unique reference for this transaction. If you are generating this reference, ensure it is unique by including 6 characters from a random GUID."),
    card_holder: z.string().optional().describe("The cardholder's name (optional)"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    customer_ip: z.string().optional().default("127.0.0.1").describe("The customer's IP address (optional, defaults to 127.0.0.1)"),
    capture: z.boolean().default(true).describe("Whether to capture the payment immediately (default: true)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ amount, currency, card_number, card_expiry, card_cvv, reference, card_holder, customer_email, customer_ip, capture }: FatZebraPaymentInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Default test card that works with Fat Zebra - using the one reported to work consistently
      const defaultTestCard = "5123456789012346";
      const defaultExpiryDate = "05/2026";
      const defaultCVV = "123";
      const defaultCardHolder = "Test User";
      
      // Use the successful test card if we're in test mode and no card is provided
      const cardNumber = username === "TEST" && !card_number ? 
        defaultTestCard : card_number;
      
      // Use the successful expiry date if we're in test mode and using the default test card
      const cardExpiry = username === "TEST" && cardNumber === defaultTestCard ? 
        defaultExpiryDate : card_expiry;
      
      // Always ensure CVV is provided - required by Fat Zebra
      const cardCVV = card_cvv || defaultCVV;
      
      // Always ensure card_holder is provided as Fat Zebra requires it
      const cardHolder = card_holder || defaultCardHolder;
      
      // Create a simple reference if none provided
      const paymentReference = reference || `ref-${Date.now()}`;
      
      // Prepare the request body for the Fat Zebra API
      const requestBody: PaymentRequestBody = {
        amount: amount,
        card_number: cardNumber,
        card_expiry: cardExpiry,
        card_cvv: cardCVV,
        reference: paymentReference,
        card_holder: cardHolder,
        currency: currency || "AUD",
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
      console.log(`[FatZebraPaymentTool] Making payment request to: ${baseUrl}/purchases`);
      console.log(`[FatZebraPaymentTool] Amount: ${amount}, Currency: ${currency || "AUD"}, Reference: ${paymentReference}`);

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
      console.log(`[FatZebraPaymentTool] Response:`, data.successful ? "Success" : "Failed");
      
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
          card_token: data.response.card_token,
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
      console.error('[FatZebraPaymentTool] Error:', error);
      
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

export default FatZebraPaymentTool;