import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListWebhooksInput {}

interface FatZebraListWebhooksResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraListWebhooksTool extends MCPTool<FatZebraListWebhooksInput> {
  name = "fat_zebra_list_webhooks";
  description = "List configured webhooks in Fat Zebra.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {};

  async execute(input: FatZebraListWebhooksInput) {
    try {
      const url = `${this.baseUrl}/webhooks`;
      const response = await fetch(url, {
        method: 'GET',
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

export default FatZebraListWebhooksTool; 