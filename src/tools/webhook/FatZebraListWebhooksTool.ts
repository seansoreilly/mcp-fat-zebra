import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";
import { checkWebhooksApiAvailability, getWebhooksApiUnavailableError } from "./FatZebraWebhookUtils";

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
  // Note: Webhooks might not be available in the sandbox environment
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {};

  async execute(input: FatZebraListWebhooksInput) {
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
      console.log(`Making request to list webhooks: ${this.baseUrl}/webhooks`);
      
      const response = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });
      
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