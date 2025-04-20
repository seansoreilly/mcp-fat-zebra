import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils";

interface FatZebraCreateWebhookInput {
  address: string;
  name: string;
  mode: "Live" | "Test";
  events: string[];
}

interface FatZebraCreateWebhookResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraCreateWebhookTool extends MCPTool<FatZebraCreateWebhookInput> {
  name = "fat_zebra_create_webhook";
  description = "Register a new webhook endpoint in Fat Zebra.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  // Note: Webhooks might not be available in the sandbox environment
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    address: {
      type: z.string().url(),
      description: "URL that the webhook payload will be sent to.",
    },
    name: {
      type: z.string(),
      description: "A name for the webhook.",
    },
    mode: {
      type: z.enum(["Live", "Test"]),
      description: "The webhook mode - Live or Test.",
    },
    events: {
      type: z.array(z.string()),
      description: "The events a webhook target should receive.",
    },
  };

  async execute(input: FatZebraCreateWebhookInput) {
    try {
      // First check if the webhooks API is available
      const webhooksAvailable = await checkWebhooksApiAvailability(
        this.baseUrl,
        this.username,
        this.token
      );
      
      if (!webhooksAvailable) {
        return getWebhooksApiUnavailableError();
      }
      
      // If we get here, the webhooks API is available
      const url = `${this.baseUrl}/webhooks`;
      console.log(`Making request to create webhook: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify({
          address: input.address,
          name: input.name,
          mode: input.mode,
          events: input.events.join(","),
        }),
      });
      
      const data = await response.json() as any;
      if (!data.successful) {
        return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
      }
      return { successful: true, response: data.response };
    } catch (error) {
      console.error('Error creating webhook:', error);
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraCreateWebhookTool; 