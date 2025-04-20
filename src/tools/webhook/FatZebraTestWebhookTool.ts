import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils";

interface FatZebraTestWebhookInput {
  id: string;
}

interface FatZebraTestWebhookResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraTestWebhookTool extends MCPTool<FatZebraTestWebhookInput> {
  name = "fat_zebra_test_webhook";
  description = "Trigger a test webhook event in Fat Zebra.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  // Note: Webhooks might not be available in the sandbox environment
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    id: {
      type: z.string(),
      description: "The ID of the webhook to test.",
    },
  };

  async execute(input: FatZebraTestWebhookInput) {
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
      const url = `${this.baseUrl}/webhooks/${encodeURIComponent(input.id)}/test`;
      console.log(`Making request to test webhook: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });
      
      const data = await response.json() as any;
      if (!data.successful) {
        return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
      }
      return { successful: true, response: data.response };
    } catch (error) {
      console.error('Error testing webhook:', error);
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraTestWebhookTool; 