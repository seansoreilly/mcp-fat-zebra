import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListTransactionsInput {
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  status?: string;
  amount?: number;
  reference?: string;
  limit?: number;
  offset?: number;
}

interface FatZebraListTransactionsResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraListTransactionsTool extends MCPTool<FatZebraListTransactionsInput> {
  name = "fat_zebra_list_transactions";
  description = "List/search transactions with filters (date, status, amount, etc.) using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    from_date: {
      type: z.string().optional(),
      description: "Start date for filtering transactions (YYYY-MM-DD)",
    },
    to_date: {
      type: z.string().optional(),
      description: "End date for filtering transactions (YYYY-MM-DD)",
    },
    status: {
      type: z.string().optional(),
      description: "Transaction status to filter by (e.g., successful, failed)",
    },
    amount: {
      type: z.number().optional(),
      description: "Amount to filter by (in cents)",
    },
    reference: {
      type: z.string().optional(),
      description: "Reference to filter by",
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

  async execute(input: FatZebraListTransactionsInput) {
    try {
      const params = new URLSearchParams();
      if (input.from_date) params.append('from', input.from_date);
      if (input.to_date) params.append('to', input.to_date);
      if (input.status) params.append('status', input.status);
      if (input.amount) params.append('amount', input.amount.toString());
      if (input.reference) params.append('reference', input.reference);
      if (input.limit) params.append('limit', input.limit.toString());
      if (input.offset) params.append('offset', input.offset.toString());
      const url = `${this.baseUrl}/purchases?${params.toString()}`;
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

export default FatZebraListTransactionsTool; 