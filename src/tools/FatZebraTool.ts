import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraPaymentInput {
  amount: number;
  currency: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  reference: string;
  customer_name?: string;
  customer_email?: string;
  capture?: boolean;
}

// Define request body interface with all possible properties
interface PaymentRequestBody {
  amount: number;
  currency: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  reference: string;
  customer_ip: string;
  card_holder?: string;
  customer_email?: string;
  capture: boolean;
}

// Define response interface
interface FatZebraPaymentResponse {
  successful: boolean;
  errors?: string[];
  response: {
    id: string;
    card_token: string;
    amount: number;
    reference: string;
    message: string;
    authorization: string;
    currency: string;
    captured_at?: string;
    created_at: string;
  };
}

class FatZebraTool extends MCPTool<FatZebraPaymentInput> {
  name = "fat_zebra_payment";
  description = "Process a credit card payment using the Fat Zebra payment gateway";
  
  // Fat Zebra API configuration
  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME;
  private token = process.env.FAT_ZEBRA_TOKEN;
  
  schema = {
    amount: {
      type: z.number().positive(),
      description: "The amount to charge in cents (e.g., 1000 for $10.00)",
    },
    currency: {
      type: z.string(),
      description: "The three-letter ISO currency code (default: AUD)",
    },
    card_number: {
      type: z.string(),
      description: "The customer's credit card number",
    },
    card_expiry: {
      type: z.string(),
      description: "The card expiry date in the format MM/YY (e.g., 12/25)",
    },
    card_cvv: {
      type: z.string(),
      description: "The card verification value (CVV/CVC) code",
    },
    reference: {
      type: z.string(),
      description: "A unique reference for this transaction",
    },
    customer_name: {
      type: z.string().optional(),
      description: "The customer's name (optional)",
    },
    customer_email: {
      type: z.string().email().optional(),
      description: "The customer's email address (optional)",
    },
    capture: {
      type: z.boolean().default(true),
      description: "Whether to capture the payment immediately (default: true)",
    },
  };

  async execute(input: FatZebraPaymentInput) {
    if (!this.username || !this.token) {
      throw new Error("Fat Zebra API credentials not configured. Please set FAT_ZEBRA_USERNAME and FAT_ZEBRA_TOKEN environment variables.");
    }

    try {
      // Prepare the request body for the Fat Zebra API
      const requestBody: PaymentRequestBody = {
        amount: input.amount,
        currency: input.currency,
        card_number: input.card_number,
        card_expiry: input.card_expiry,
        card_cvv: input.card_cvv,
        reference: input.reference,
        customer_ip: "127.0.0.1", // This should ideally be the customer's actual IP
        capture: input.capture ?? true,
      };

      // Add optional fields if provided
      if (input.customer_name) {
        requestBody.card_holder = input.customer_name;
      }

      if (input.customer_email) {
        requestBody.customer_email = input.customer_email;
      }

      // Make the request to the Fat Zebra API
      const response = await fetch(`${this.baseUrl}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as FatZebraPaymentResponse;

      // Check if the response was successful
      if (!data.successful) {
        throw new Error(`Fat Zebra API error: ${data.errors?.join(', ') || 'Unknown error'}`);
      }

      // Return the response from Fat Zebra
      return {
        successful: data.successful,
        transaction_id: data.response.id,
        card_token: data.response.card_token,
        amount: data.response.amount,
        reference: data.response.reference,
        message: data.response.message,
        authorization: data.response.authorization,
        currency: data.response.currency,
        timestamp: data.response.captured_at || data.response.created_at,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default FatZebraTool; 