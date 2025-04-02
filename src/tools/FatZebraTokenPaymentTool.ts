import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraTokenPaymentInput {
  amount: number;
  currency: string;
  card_token: string;
  reference: string;
  cvv?: string;
  customer_name?: string;
  customer_email?: string;
  customer_ip?: string;
  capture?: boolean;
}

// Define request body interface with all possible properties
interface TokenPaymentRequestBody {
  amount: number;
  currency: string;
  card_token: string;
  reference: string;
  customer_ip: string;
  cvv?: string;
  customer_name?: string;
  customer_email?: string;
  capture?: boolean;
}

// Define response interface
interface FatZebraPaymentResponse {
  successful: boolean;
  errors?: string[];
  response: {
    id: string;
    card_number: string;
    card_holder: string;
    card_expiry: string;
    card_token: string;
    card_type: string;
    card_category: string;
    card_subcategory: string;
    amount: number;
    decimal_amount: number;
    successful: boolean;
    message: string;
    reference: string;
    currency: string;
    transaction_id: string;
    settlement_date: string;
    transaction_date: string;
    response_code: string;
    captured: boolean;
    captured_amount: number;
    rrn: string;
    cvv_match: string;
    metadata: Record<string, string>;
    addendum_data: Record<string, any>;
  };
  test: boolean;
}

class FatZebraTokenPaymentTool extends MCPTool<FatZebraTokenPaymentInput> {
  name = "fat_zebra_token_payment";
  description = "Process a payment using a tokenized card with the Fat Zebra payment gateway";
  
  // Fat Zebra API configuration
  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";
  
  schema = {
    amount: {
      type: z.number().positive(),
      description: "The amount to charge in cents (e.g., 1000 for $10.00)",
    },
    currency: {
      // Use fixed string instead of default
      type: z.string(),
      description: "The three-letter ISO currency code (default: AUD)",
    },
    card_token: {
      type: z.string(),
      description: "The tokenized card to charge",
    },
    reference: {
      type: z.string(),
      description: "A unique reference for this transaction",
    },
    cvv: {
      type: z.string().optional(),
      description: "The card verification value (CVV/CVC) code (optional)",
    },
    customer_name: {
      type: z.string().optional(),
      description: "The customer's name (optional)",
    },
    customer_email: {
      type: z.string().email().optional(),
      description: "The customer's email address (optional)",
    },
    customer_ip: {
      type: z.string().optional().default("127.0.0.1"),
      description: "The customer's IP address (optional, defaults to 127.0.0.1)",
    },
    capture: {
      type: z.boolean().default(true),
      description: "Whether to capture the payment immediately (default: true)",
    },
  };

  async execute(input: FatZebraTokenPaymentInput) {
    try {
      // Prepare the request body for the Fat Zebra API
      const requestBody: TokenPaymentRequestBody = {
        amount: input.amount,
        currency: input.currency || "AUD", // Provide default if somehow not set
        card_token: input.card_token,
        reference: input.reference,
        customer_ip: input.customer_ip || "127.0.0.1",
        capture: input.capture ?? true,
      };

      // Add optional fields if provided
      if (input.cvv) {
        requestBody.cvv = input.cvv;
      }

      if (input.customer_name) {
        requestBody.customer_name = input.customer_name;
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
        // Return the error response directly instead of throwing
        return {
          successful: false,
          errors: data.errors || ["Unknown error from Fat Zebra API"]
        };
      }

      // Return the response from Fat Zebra
      return {
        successful: data.successful,
        transaction_id: data.response.transaction_id,
        amount: data.response.amount,
        reference: data.response.reference,
        message: data.response.message,
        authorization: data.response.response_code,
        currency: data.response.currency,
        timestamp: data.response.transaction_date,
      };
    } catch (error) {
      console.error('Error processing token payment:', error);
      // Return error as a response instead of throwing
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraTokenPaymentTool; 