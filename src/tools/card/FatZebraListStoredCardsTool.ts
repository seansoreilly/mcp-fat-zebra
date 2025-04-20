import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListStoredCardsInput {
  customer_id: string;
}

interface FatZebraListStoredCardsResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraListStoredCardsTool extends MCPTool<FatZebraListStoredCardsInput> {
  name = "fat_zebra_list_stored_cards";
  description = "List stored cards for a customer using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    customer_id: {
      type: z.string(),
      description: "The customer ID to list stored cards for.",
    },
  };

  async execute(input: FatZebraListStoredCardsInput) {
    try {
      const url = `${this.baseUrl}/customers/${encodeURIComponent(input.customer_id)}/cards`;
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

export default FatZebraListStoredCardsTool; 