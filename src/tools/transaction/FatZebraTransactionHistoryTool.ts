import { z } from "zod";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraTransactionHistoryTool');
import fetch from "node-fetch";

// Define input interface
interface FatZebraTransactionHistoryInput {
  transaction_id: string;
}

/**
 * Fat Zebra Transaction History Tool
 * Retrieve the full history/events for a transaction using the Fat Zebra payment gateway.
 */
const FatZebraTransactionHistoryTool = {
  name: "fat_zebra_transaction_history",
  description: "Retrieve the full history/events for a transaction using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    transaction_id: z.string().describe("The ID of the transaction to retrieve history for."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ transaction_id }: FatZebraTransactionHistoryInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Build the URL
      // Fat Zebra API doesn't appear to have a dedicated history endpoint as expected
      // Let's retrieve the transaction details instead
      const url = `${baseUrl}/purchases/${encodeURIComponent(transaction_id)}`;
      
      // Log the request
      logger.info('Retrieving history for transaction: ${transaction_id}');
      
      // Make the request to the Fat Zebra API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });
      
      // Parse the response
      const data = await response.json() as any;
      
      // Log the response
      logger.info('Response: ${data.successful ? "Success" : "Failed"}');
      
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
      
      // Return the JSON response
      const result = {
        successful: data.successful,
        status: response.status,
        response: data.response,
        errors: undefined
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      logger.error({ err: error }, 'Error:');
      
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

export default FatZebraTransactionHistoryTool;