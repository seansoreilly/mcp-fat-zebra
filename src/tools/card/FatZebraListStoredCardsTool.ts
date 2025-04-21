import { z } from "zod";
import fetch from "node-fetch";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraListStoredCardsTool');


// Input type for list stored cards requests
interface FatZebraListStoredCardsInput {
  customer_id: string;
}

/**
 * Fat Zebra List Stored Cards Tool
 * Lists stored cards for a customer using the Fat Zebra payment gateway.
 * Returns all cards associated with the specified customer ID.
 */
const FatZebraListStoredCardsTool = {
  name: "fat_zebra_list_stored_cards",
  description: "List stored cards for a customer using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    customer_id: z.string().describe("The customer ID to list stored cards for."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ customer_id }: FatZebraListStoredCardsInput) => {
    try {
      // Build URL and auth
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      const url = `${baseUrl}/customers/${encodeURIComponent(customer_id)}/cards`;
      logger.info(`Fetching cards from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });

      const data = await response.json() as any;
      
      // Log the response
      logger.info({ status: data.successful ? "Success" : "Failed" }, 'Response:');
      
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
      
      // Return the list of cards
      const result = {
        successful: true,
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

export default FatZebraListStoredCardsTool;