import { z } from "zod";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraListTransactionsTool');
import fetch from "node-fetch";

// Define input interface
interface FatZebraListTransactionsInput {
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  status?: string;
  amount?: string;
  reference?: string;
  limit?: string;
  offset?: string;
}

/**
 * Fat Zebra List Transactions Tool
 * List/search transactions with filters (date, status, amount, etc.) using the Fat Zebra payment gateway.
 */
const FatZebraListTransactionsTool = {
  name: "fat_zebra_list_transactions",
  description: "List/search transactions with filters (date, status, amount, etc.) using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    from_date: z.string().optional().describe("Start date for filtering transactions (YYYY-MM-DD)"),
    to_date: z.string().optional().describe("End date for filtering transactions (YYYY-MM-DD)"),
    status: z.string().optional().describe("Transaction status to filter by (e.g., successful, failed)"),
    amount: z.string().optional().describe("Amount to filter by (in cents)"),
    reference: z.string().optional().describe("Reference to filter by"),
    limit: z.string().optional().describe("Number of results to return (default: 20)"),
    offset: z.string().optional().describe("Offset for pagination (default: 0)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraListTransactionsInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Build the endpoint with query parameters
      let endpoint = "/purchases";
      const queryParams = [];

      if (input.from_date) queryParams.push(`from_date=${input.from_date}`);
      if (input.to_date) queryParams.push(`to_date=${input.to_date}`);
      if (input.status) queryParams.push(`status=${input.status}`);
      if (input.amount) queryParams.push(`amount=${input.amount}`);
      if (input.reference) queryParams.push(`reference=${input.reference}`);
      if (input.limit) queryParams.push(`limit=${input.limit}`);
      if (input.offset) queryParams.push(`offset=${input.offset}`);

      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }
      
      // Log the request
      logger.info('Listing transactions with filters: ${JSON.stringify(input)}');
      
      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}${endpoint}`, {
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
      
      // Return the JSON response with all returned data
      const result = {
        successful: data.successful,
        status: response.status,
        response: data.response || [],
        records: data.records,
        total_records: data.total_records,
        page: data.page,
        total_pages: data.total_pages,
        errors: undefined
      };
      
      // Include a more detailed log for debugging
      logger.info('Complete response data: ${JSON.stringify(data)}');

      
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

export default FatZebraListTransactionsTool;