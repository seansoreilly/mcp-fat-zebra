import { z } from "zod";
import fetch from "node-fetch";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraRefundTool');

// Define input interface
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

/**
 * Fat Zebra Refund Tool
 * Process a refund for a previous transaction using the Fat Zebra payment gateway
 */
const FatZebraRefundTool = {
  name: "fat_zebra_refund",
  description: "Process a refund for a previous transaction using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    transaction_id: z.string().describe("The ID of the original transaction to refund"),
    amount: z.number().positive().describe("The amount to refund in cents (e.g., 1000 for $10.00)"),
    reference: z.string().describe("A unique reference for this refund transaction"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ transaction_id, amount, reference }: FatZebraRefundInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Generate a unique reference if none was provided
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const refundReference = reference || `refund-${uniqueId}`;

      // Prepare the request body for the Fat Zebra API
      const requestBody: RefundRequestBody = {
        transaction_id: transaction_id,
        amount: amount,
        reference: refundReference,
      };

      // Log the request (redact sensitive data)
      logger.info({
        endpoint: `${baseUrl}/refunds`,
        transaction_id,
        amount,
        reference: refundReference
      }, 'Making refund request');

      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      // Log the response (redact sensitive data)
      logger.info({
        successful: data.successful,
        status: response.status
      }, 'Received refund response');
      
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
          refund_id: data.response.id,
          amount: data.response.amount,
          reference: data.response.reference,
          transaction_id: data.response.transaction_id,
          message: data.response.message,
          currency: data.response.currency,
          timestamp: data.response.created_at,
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
      logger.error({ err: error }, 'Error processing refund request');
      
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

export default FatZebraRefundTool;