import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraListTransactionsInput {
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  status?: string;
  amount?: string;
  reference?: string;
  limit?: string;
  offset?: string;
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
      type: z.string().optional(),
      description: "Amount to filter by (in cents)",
    },
    reference: {
      type: z.string().optional(),
      description: "Reference to filter by",
    },
    limit: {
      type: z.string().optional(),
      description: "Number of results to return (default: 20)",
    },
    offset: {
      type: z.string().optional(),
      description: "Offset for pagination (default: 0)",
    },
  };

  async execute(input: FatZebraListTransactionsInput) {
    try {
      // Build the endpoint with query parameters
      let endpoint = "/purchases";
      const queryParams = [];
      
      if (input.from_date) queryParams.push(`from_date=${input.from_date}`);
      if (input.to_date) queryParams.push(`to_date=${input.to_date}`);
      if (input.status) queryParams.push(`status=${input.status}`);
      if (input.amount) queryParams.push(`amount=${input.amount}`);
      if (input.reference) queryParams.push(`reference=${input.reference}`);
      if (input.limit) queryParams.push(`limit=${input.limit}`);
      if (input.offset) queryParams.push(`offset=${input.offset}`);
      
      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }
      
      // Make the request
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });

      const data = await response.json();
      
      // Return the response
      return {
        successful: data.successful,
        response: data.response,
        errors: data.errors,
        test: data.test,
        records: data.records,
        total_records: data.total_records,
        page: data.page,
        total_pages: data.total_pages
      };
    } catch (error) {
      console.error('Error listing transactions:', error);
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraListTransactionsTool;