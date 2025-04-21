import { z } from "zod";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraListBatchesTool');
import fetch from "node-fetch";

interface FatZebraListBatchesInput {
  batch_type?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: string;
  offset?: string;
}

/**
 * Fat Zebra List Batches Tool
 * List batches and their statuses using the Fat Zebra payment gateway.
 */
const FatZebraListBatchesTool = {
  name: "fat_zebra_list_batches",
  description: "List batches and their statuses using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    batch_type: z.string().optional().describe("Type of batch: purchase, refund, or direct_debit."),
    status: z.string().optional().describe("Batch status to filter by (e.g., processed, pending, failed)"),
    from_date: z.string().optional().describe("Start date for filtering batches (YYYY-MM-DD)"),
    to_date: z.string().optional().describe("End date for filtering batches (YYYY-MM-DD)"),
    limit: z.string().optional().describe("Number of results to return (default: 20)"),
    offset: z.string().optional().describe("Offset for pagination (default: 0)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraListBatchesInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (input.batch_type) queryParams.append('batch_type', input.batch_type);
      if (input.status) queryParams.append('status', input.status);
      if (input.from_date) queryParams.append('from_date', input.from_date);
      if (input.to_date) queryParams.append('to_date', input.to_date);
      if (input.limit) queryParams.append('limit', input.limit);
      if (input.offset) queryParams.append('offset', input.offset);
      
      // Construct the URL with query parameters
      const url = `${baseUrl}/batches${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      // Log the request
      logger.info(`Listing batches with filters: ${queryParams.toString() || 'none'}`);
      
      // Make the request to the Fat Zebra API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });

      const data = await response.json() as any;
      
      // Log the response status
      logger.info(`Response status: ${response.status}, Success: ${data.successful}`);
      
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

export default FatZebraListBatchesTool;