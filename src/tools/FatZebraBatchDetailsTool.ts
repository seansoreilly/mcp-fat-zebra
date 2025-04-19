import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraBatchDetailsInput {
  batch_id: string;
}

interface FatZebraBatchDetailsResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraBatchDetailsTool extends MCPTool<FatZebraBatchDetailsInput> {
  name = "fat_zebra_batch_details";
  description = "Retrieve details for a specific batch using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    batch_id: {
      type: z.string(),
      description: "The ID of the batch to retrieve details for.",
    },
  };

  async execute(input: FatZebraBatchDetailsInput) {
    try {
      const url = `${this.baseUrl}/batches/${encodeURIComponent(input.batch_id)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });
      const data = await response.json();
      if (!data.successful) {
        return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
      }
      return { successful: true, response: data.response };
    } catch (error) {
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraBatchDetailsTool; 