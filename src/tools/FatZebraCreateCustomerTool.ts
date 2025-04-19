import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraCreateCustomerInput {
  email: string;
  name?: string;
  address?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

interface FatZebraCreateCustomerResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraCreateCustomerTool extends MCPTool<FatZebraCreateCustomerInput> {
  name = "fat_zebra_create_customer";
  description = "Create a customer in Fat Zebra.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    email: {
      type: z.string().email(),
      description: "The customer's email address.",
    },
    name: {
      type: z.string().optional(),
      description: "The customer's name.",
    },
    address: {
      type: z.string().optional(),
      description: "The customer's address.",
    },
    phone: {
      type: z.string().optional(),
      description: "The customer's phone number.",
    },
    metadata: {
      type: z.record(z.string()).optional(),
      description: "Additional metadata for the customer.",
    },
  };

  async execute(input: FatZebraCreateCustomerInput) {
    try {
      const requestBody: any = {
        email: input.email,
      };
      if (input.name) requestBody.name = input.name;
      if (input.address) requestBody.address = input.address;
      if (input.phone) requestBody.phone = input.phone;
      if (input.metadata) requestBody.metadata = input.metadata;
      const url = `${this.baseUrl}/customers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return { successful: false, errors: [text || 'Unsupported content type from Fat Zebra API'] };
      }
      if (!data.successful) {
        return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
      }
      return { successful: true, response: data.response };
    } catch (error) {
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraCreateCustomerTool; 