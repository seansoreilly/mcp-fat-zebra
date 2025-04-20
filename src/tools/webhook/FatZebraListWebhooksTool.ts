import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListWebhooksInput {}

// Define interface for Fat Zebra API response
interface FatZebraApiResponse {
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
      // Try the documented webhooks endpoint
      let endpoint = "/webhooks";
      
      console.log(`Making request to: ${this.baseUrl}${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });
      
      if (response.status === 404) {
        return { 
          successful: false, 
          errors: ["Webhook endpoint not found. This feature may not be available in the sandbox environment."] 
        };
      }
      
      const data = await response.json() as FatZebraApiResponse;
      
      if (!data.successful) {
        return { 
          successful: false, 
          errors: data.errors || ["Unknown error from Fat Zebra API"] 
        };
      }
      
      return {
        successful: true,
        response: data.response
      };
    } catch (error) {
      console.error('Error listing webhooks:', error);
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraListWebhooksTool;