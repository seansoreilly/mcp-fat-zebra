import { z } from "zod";
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils.js";

// Define input interface (empty for this tool)
interface FatZebraListWebhooksInput {}

/**
 * Fat Zebra List Webhooks Tool
 * List all webhooks configured in the Fat Zebra payment gateway.
 */
const FatZebraListWebhooksTool = {
  name: "fat_zebra_list_webhooks",
  description: "List all webhooks configured in the Fat Zebra payment gateway.",
  
  // Input schema using zod (empty for this tool)
  schema: {},
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraListWebhooksInput) => {
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
      console.log(`[FatZebraListWebhooksTool] Listing webhooks`);
      
      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/web_hooks`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });
      
      // Parse the response
      const data = await response.json() as any;
      
      // Log the response
      console.log(`[FatZebraListWebhooksTool] Response: ${data.successful ? "Success" : "Failed"}`);
      
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
      console.error('[FatZebraListWebhooksTool] Error:', error);
      
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

export default FatZebraListWebhooksTool;