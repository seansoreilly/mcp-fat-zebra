import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraTokenizeInput {
  card_number: string;
  card_expiry: string;
  card_cvv?: string;
  card_holder?: string;
}

// Define request body interface with all possible properties
interface TokenizeRequestBody {
  card_number: string;
  card_expiry: string;
  card_cvv?: string;
  card_holder?: string;
}

// Define response interface
interface FatZebraTokenizeResponse {
  successful: boolean;
  errors?: string[];
  response: {
    token: string;
    card_type: string;
    card_category: string;
    card_expiry: string;
    card_number: string;
    created_at: string;
  };
}

class FatZebraTokenizeTool extends MCPTool<FatZebraTokenizeInput> {
  name = "fat_zebra_tokenize";
  description = "Tokenize a credit card using the Fat Zebra payment gateway";
  
  // Fat Zebra API configuration
  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME;
  private token = process.env.FAT_ZEBRA_TOKEN;
  
  schema = {
    card_number: {
      type: z.string(),
      description: "The customer's credit card number",
    },
    card_expiry: {
      type: z.string(),
      description: "The card expiry date in the format MM/YY (e.g., 12/25)",
    },
    card_cvv: {
      type: z.string().optional(),
      description: "The card verification value (CVV/CVC) code (optional)",
    },
    card_holder: {
      type: z.string().optional(),
      description: "The name of the cardholder (optional)",
    }
  };

  async execute(input: FatZebraTokenizeInput) {
    if (!this.username || !this.token) {
      throw new Error("Fat Zebra API credentials not configured. Please set FAT_ZEBRA_USERNAME and FAT_ZEBRA_TOKEN environment variables.");
    }

    try {
      // Prepare the request body for the Fat Zebra API
      const requestBody: TokenizeRequestBody = {
        card_number: input.card_number,
        card_expiry: input.card_expiry,
      };

      // Add optional fields if provided
      if (input.card_cvv) {
        requestBody.card_cvv = input.card_cvv;
      }

      if (input.card_holder) {
        requestBody.card_holder = input.card_holder;
      }

      // Make the request to the Fat Zebra API
      const response = await fetch(`${this.baseUrl}/credit_cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as FatZebraTokenizeResponse;

      // Check if the response was successful
      if (!data.successful) {
        throw new Error(`Fat Zebra API error: ${data.errors?.join(', ') || 'Unknown error'}`);
      }

      // Return the tokenized card information
      return {
        successful: data.successful,
        card_token: data.response.token,
        card_type: data.response.card_type,
        card_category: data.response.card_category,
        card_expiry: data.response.card_expiry,
        card_number: data.response.card_number, // This will be masked by Fat Zebra
        created_at: data.response.created_at,
      };
    } catch (error) {
      console.error('Error tokenizing card:', error);
      throw new Error(`Failed to tokenize card: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default FatZebraTokenizeTool; 