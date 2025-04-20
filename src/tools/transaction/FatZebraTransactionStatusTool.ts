import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraTransactionStatusInput {
  transaction_id?: string;
  reference?: string;
}

interface FatZebraTransactionStatusResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraTransactionStatusTool extends MCPTool<FatZebraTransactionStatusInput> {
  name = "fat_zebra_transaction_status";
  description = "Query the status/details of a transaction by ID or reference using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    transaction_id: {
      type: z.string().optional(),
      description: "The ID of the transaction to query.",
    },
    reference: {
      type: z.string().optional(),
      description: "The reference of the transaction to query.",
    },
  };

  async execute(input: FatZebraTransactionStatusInput) {
    try {
      if (!input.transaction_id && !input.reference) {
        return { successful: false, errors: ["Either transaction_id or reference is required."] };
      }
      let url = `${this.baseUrl}/purchases`;
      if (input.transaction_id) {
        url += `/${encodeURIComponent(input.transaction_id)}`;
      } else if (input.reference) {
        url += `?reference=${encodeURIComponent(input.reference)}`;
      }
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

export default FatZebraTransactionStatusTool; 