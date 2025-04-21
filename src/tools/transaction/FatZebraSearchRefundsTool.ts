import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraSearchRefundsInput {
  transaction_id?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  reference?: string;
  limit?: string;
  offset?: string;
}

/**
 * Fat Zebra Search Refunds Tool
 * Search for refunds by transaction or date using the Fat Zebra payment gateway.
 */
const FatZebraSearchRefundsTool = {
  name: "fat_zebra_search_refunds",
  description: "Search for refunds by transaction or date using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    transaction_id: z.string().optional().describe("The ID of the transaction to search refunds for."),
    from_date: z.string().optional().describe("Start date for filtering refunds (YYYY-MM-DD)"),
    to_date: z.string().optional().describe("End date for filtering refunds (YYYY-MM-DD)"),
    reference: z.string().optional().describe("Reference to filter refunds by."),
    limit: z.string().optional().describe("Number of results to return (default: 20)"),
    offset: z.string().optional().describe("Offset for pagination (default: 0)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraSearchRefundsInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Build the endpoint with query parameters
      let endpoint = "/refunds";
      const queryParams = [];

      if (input.transaction_id) queryParams.push(`transaction_id=${input.transaction_id}`);
      if (input.from_date) queryParams.push(`from_date=${input.from_date}`);
      if (input.to_date) queryParams.push(`to_date=${input.to_date}`);
      if (input.reference) queryParams.push(`reference=${input.reference}`);
      if (input.limit) queryParams.push(`limit=${input.limit}`);
      if (input.offset) queryParams.push(`offset=${input.offset}`);

      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }
      
      // Log the request
      console.log(`[FatZebraSearchRefundsTool] Searching refunds with filters: ${JSON.stringify(input)}`);
      
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
      console.log(`[FatZebraSearchRefundsTool] Response: ${data.successful ? "Success" : "Failed"}`);
      
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
        records: data.records,
        total_records: data.total_records,
        page: data.page,
        total_pages: data.total_pages,
        errors: undefined
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      console.error('[FatZebraSearchRefundsTool] Error:', error);
      
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

export default FatZebraSearchRefundsTool;