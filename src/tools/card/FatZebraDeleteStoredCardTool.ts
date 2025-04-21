import { z } from "zod";
import fetch from "node-fetch";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraDeleteStoredCardTool');


// Input type for delete stored card requests
interface FatZebraDeleteStoredCardInput {
  customer_id: string;
  card_token: string;
}

/**
 * Fat Zebra Delete Stored Card Tool
 * Removes a stored card using the Fat Zebra payment gateway.
 * Deletes the card token associated with the specified customer.
 */
const FatZebraDeleteStoredCardTool = {
  name: "fat_zebra_delete_stored_card",
  description: "Remove a stored card using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    customer_id: z.string().describe("The customer ID associated with the card."),
    card_token: z.string().describe("The token of the card to delete."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ customer_id, card_token }: FatZebraDeleteStoredCardInput) => {
    try {
      // Build URL and auth
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      const url = `${baseUrl}/customers/${encodeURIComponent(customer_id)}/cards/${encodeURIComponent(card_token)}`;
      logger.info(`Deleting card from: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
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
      
      // Return the deletion result
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

export default FatZebraDeleteStoredCardTool;