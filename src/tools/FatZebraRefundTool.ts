import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraRefundInput {
  transaction_id: string;
  amount: number;
  reference: string;
}

// Define request body interface
interface RefundRequestBody {
  transaction_id: string;
  amount: number;
  reference: string;
}

// Define response interface
interface FatZebraResponse {
  successful: boolean;
  errors?: string[];
  response: {
    id: string;
    amount: number;
    reference: string;
    transaction_id: string;
    message: string;
    currency: string;
    created_at: string;
  };
}

class FatZebraRefundTool extends MCPTool<FatZebraRefundInput> {
  name = "fat_zebra_refund";
  description = "Process a refund for a previous transaction using the Fat Zebra payment gateway";
  
  // Fat Zebra API configuration
  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME;
  private token = process.env.FAT_ZEBRA_TOKEN;
  
  schema = {
    transaction_id: {
      type: z.string(),
      description: "The ID of the original transaction to refund",
    },
    amount: {
      type: z.number().positive(),
      description: "The amount to refund in cents (e.g., 1000 for $10.00)",
    },
    reference: {
      type: z.string(),
      description: "A unique reference for this refund transaction",
    }
  };

  async execute(input: FatZebraRefundInput) {
    if (!this.username || !this.token) {
      throw new Error("Fat Zebra API credentials not configured. Please set FAT_ZEBRA_USERNAME and FAT_ZEBRA_TOKEN environment variables.");
    }

    try {
      // Prepare the request body for the Fat Zebra API
      const requestBody: RefundRequestBody = {
        transaction_id: input.transaction_id,
        amount: input.amount,
        reference: input.reference,
      };

      // Make the request to the Fat Zebra API
      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as FatZebraResponse;

      // Check if the response was successful
      if (!data.successful) {
        throw new Error(`Fat Zebra API error: ${data.errors?.join(', ') || 'Unknown error'}`);
      }

      // Return the response from Fat Zebra
      return {
        successful: data.successful,
        refund_id: data.response.id,
        amount: data.response.amount,
        reference: data.response.reference,
        transaction_id: data.response.transaction_id,
        message: data.response.message,
        currency: data.response.currency,
        timestamp: data.response.created_at,
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default FatZebraRefundTool; 