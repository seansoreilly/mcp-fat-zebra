import { z } from "zod";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraDeleteWebhookTool');
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils.js";

// Define input interface
interface FatZebraDeleteWebhookInput {
  id: string;
}

/**
 * Fat Zebra Delete Webhook Tool
 * Delete a webhook from the Fat Zebra payment gateway by its ID.
 */
const FatZebraDeleteWebhookTool = {
  name: "fat_zebra_delete_webhook",
  description: "Delete a webhook from the Fat Zebra payment gateway by its ID.",
  
  // Input schema using zod
  schema: {
    id: z.string().describe("The ID of the webhook to delete"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraDeleteWebhookInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Check if webhooks API is available
      const webhooksAvailable = await checkWebhooksApiAvailability(
        baseUrl,
        username,
        token
      );
      
      if (!webhooksAvailable) {
        return getWebhooksApiUnavailableError();
      }
      
      // Log the request
      logger.info('Deleting webhook with ID: ${input.id}');
      
      // Make the request to the Fat Zebra API
      const url = `${baseUrl}/web_hooks/${encodeURIComponent(input.id)}`;
      const response = await fetch(url, {
        method: 'DELETE',
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
      
      // Return the successful response
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            successful: true,
            status: response.status,
            response: data.response,
            errors: undefined
          })
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

export default FatZebraDeleteWebhookTool;