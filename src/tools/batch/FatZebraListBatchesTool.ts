import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListBatchesInput {
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  batch_type?: "purchase" | "refund" | "direct_debit";
  status?: string;
  limit?: number;
  offset?: number;
}

interface FatZebraListBatchesResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraListBatchesTool extends MCPTool<FatZebraListBatchesInput> {
  name = "fat_zebra_list_batches";
  description = "List batches and their statuses using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    from_date: {
      type: z.string().optional(),
      description: "Start date for filtering batches (YYYY-MM-DD)",
    },
    to_date: {
      type: z.string().optional(),
      description: "End date for filtering batches (YYYY-MM-DD)",
    },
    batch_type: {
      type: z.enum(["purchase", "refund", "direct_debit"]).optional(),
      description: "Type of batch: purchase, refund, or direct_debit.",
    },
    status: {
      type: z.string().optional(),
      description: "Batch status to filter by (e.g., processed, pending, failed)",
    },
    limit: {
      type: z.number().optional().default(20),
      description: "Number of results to return (default: 20)",
    },
    offset: {
      type: z.number().optional().default(0),
      description: "Offset for pagination (default: 0)",
    },
  };

  async execute(input: FatZebraListBatchesInput) {
    try {
      const params = new URLSearchParams();
      if (input.from_date) params.append('from', input.from_date);
      if (input.to_date) params.append('to', input.to_date);
      if (input.batch_type) params.append('batch_type', input.batch_type);
      if (input.status) params.append('status', input.status);
      if (input.limit) params.append('limit', input.limit.toString());
      if (input.offset) params.append('offset', input.offset.toString());
      const url = `${this.baseUrl}/batches?${params.toString()}`;
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

export default FatZebraListBatchesTool; 