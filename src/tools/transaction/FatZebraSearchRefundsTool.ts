import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraSearchRefundsInput {
  transaction_id?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  reference?: string;
  limit?: string;
  offset?: string;
}

// Define the interface for FatZebra API response
interface FatZebraApiResponse {
  successful: boolean;
  response: any;
  errors: string[];
  test: boolean;
  records: any[];
  total_records: number;
  page: number;
  total_pages: number;
}

class FatZebraSearchRefundsTool extends MCPTool<FatZebraSearchRefundsInput> {
  name = "fat_zebra_search_refunds";
  description = "Search for refunds by transaction or date using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    transaction_id: {
      type: z.string().optional(),
      description: "The ID of the transaction to search refunds for.",
    },
    from_date: {
      type: z.string().optional(),
      description: "Start date for filtering refunds (YYYY-MM-DD)",
    },
    to_date: {
      type: z.string().optional(),
      description: "End date for filtering refunds (YYYY-MM-DD)",
    },
    reference: {
      type: z.string().optional(),
      description: "Reference to filter refunds by.",
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

  async execute(input: FatZebraSearchRefundsInput) {
    try {
      // Build the endpoint with query parameters
      let endpoint = "/refunds";
      const queryParams = [];
      
      if (input.transaction_id) queryParams.push(`transaction_id=${input.transaction_id}`);
      if (input.from_date) queryParams.push(`from_date=${input.from_date}`);
      if (input.to_date) queryParams.push(`to_date=${input.to_date}`);
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

      const data = await response.json() as FatZebraApiResponse;
      
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
      console.error('Error searching refunds:', error);
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraSearchRefundsTool;