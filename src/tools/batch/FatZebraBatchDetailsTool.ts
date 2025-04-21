import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraBatchDetailsInput {
  batch_id: string;
}

/**
 * Fat Zebra Batch Details Tool
 * Retrieve details for a specific batch using the Fat Zebra payment gateway.
 */
const FatZebraBatchDetailsTool = {
  name: "fat_zebra_batch_details",
  description: "Retrieve details for a specific batch using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    batch_id: z.string().describe("The ID of the batch to retrieve details for."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ batch_id }: FatZebraBatchDetailsInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";

      // Log the request
      console.log(`[FatZebraBatchDetailsTool] Fetching details for batch: ${batch_id}`);
      
      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/batches/${encodeURIComponent(batch_id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });

      const data = await response.json() as any;
      
      // Log the response status
      console.log(`[FatZebraBatchDetailsTool] Response status: ${response.status}, Success: ${data.successful}`);
      
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
      console.error('[FatZebraBatchDetailsTool] Error:', error);
      
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

export default FatZebraBatchDetailsTool;