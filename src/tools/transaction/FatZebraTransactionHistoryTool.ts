import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraTransactionHistoryInput {
  transaction_id: string;
}

interface FatZebraTransactionHistoryResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraTransactionHistoryTool extends MCPTool<FatZebraTransactionHistoryInput> {
  name = "fat_zebra_transaction_history";
  description = "Retrieve the full history/events for a transaction using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    transaction_id: {
      type: z.string(),
      description: "The ID of the transaction to retrieve history for.",
    },
  };

  async execute(input: FatZebraTransactionHistoryInput) {
    try {
      const url = `${this.baseUrl}/purchases/${encodeURIComponent(input.transaction_id)}/history`;
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

export default FatZebraTransactionHistoryTool; 