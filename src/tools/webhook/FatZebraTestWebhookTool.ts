import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

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

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
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
      const url = `${this.baseUrl}/webhooks/${encodeURIComponent(input.id)}/test`;
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
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraTestWebhookTool; 