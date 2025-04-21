import { z } from "zod";
import fetch from "node-fetch";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraTransactionStatusTool');


// Define input interface
interface FatZebraTransactionStatusInput {
  transaction_id?: string;
  reference?: string;
}

/**
 * Fat Zebra Transaction Status Tool
 * Check the status of a transaction by ID or reference using the Fat Zebra payment gateway.
 */
const FatZebraTransactionStatusTool = {
  name: "fat_zebra_transaction_status",
  description: "Check the status of a transaction by ID or reference using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    transaction_id: z.string().optional().describe("The ID of the transaction to check status for."),
    reference: z.string().optional().describe("The reference of the transaction to check status for."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraTransactionStatusInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Validate input
      if (!input.transaction_id && !input.reference) {
        const errorResult = { 
          successful: false, 
          status: 400, 
          response: null, 
          errors: ["Either transaction_id or reference is required."] 
        };
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(errorResult)
          }]
        };
      }
      
      // Build the URL
      let url = `${baseUrl}/purchases`;
      if (input.transaction_id) {
        url += `/${encodeURIComponent(input.transaction_id)}`;
      } else if (input.reference) {
        url += `?reference=${encodeURIComponent(input.reference)}`;
      }
      
      // Log the request
      logger.info('Checking status for transaction: ${input.transaction_id || input.reference}');
      
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

export default FatZebraTransactionStatusTool;