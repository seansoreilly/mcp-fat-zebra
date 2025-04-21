import { z } from "zod";
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils.js";

// Define input interface
interface FatZebraCreateWebhookInput {
  address: string;
  name: string;
  mode: "Live" | "Test";
  events: string[];
}

/**
 * Fat Zebra Create Webhook Tool
 * Create a new webhook in the Fat Zebra payment gateway to receive notifications for specified events.
 */
const FatZebraCreateWebhookTool = {
  name: "fat_zebra_create_webhook",
  description: "Create a new webhook in the Fat Zebra payment gateway to receive notifications for specified events.",
  
  // Input schema using zod
  schema: {
    address: z.string().describe("The URL where webhook notifications will be sent"),
    name: z.string().describe("A name to identify this webhook"),
    mode: z.enum(["Live", "Test"]).describe("The mode of the webhook (Live or Test)"),
    events: z.array(z.string()).describe("Array of event types to subscribe to (e.g., 'purchase.successful', 'refund.successful')"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraCreateWebhookInput) => {
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
      console.log(`[FatZebraCreateWebhookTool] Creating webhook: ${input.name} at ${input.address}`);
      
      // Make the request to the Fat Zebra API
      const url = `${baseUrl}/web_hooks`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify({
          address: input.address,
          name: input.name,
          mode: input.mode,
          events: input.events.join(","),
        }),
      });
      
      // Parse the response
      const data = await response.json() as any;
      
      // Log the response
      console.log(`[FatZebraCreateWebhookTool] Response: ${data.successful ? "Success" : "Failed"}`);
      
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
      console.error('[FatZebraCreateWebhookTool] Error:', error);
      
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

export default FatZebraCreateWebhookTool;