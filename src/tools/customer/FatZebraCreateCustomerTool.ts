import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraCreateCustomerInput {
  first_name: string;
  last_name: string;
  reference: string;
  email_address: string;
  ip_address?: string;
  card: {
    card_holder: string;
    card_number: string;
    expiry_date: string;
    cvv: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
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
    first_name: {
      type: z.string(),
      description: "The customer's first name.",
    },
    last_name: {
      type: z.string(),
      description: "The customer's last name.",
    },
    reference: {
      type: z.string(),
      description: "A unique reference for the customer.",
    },
    email_address: {
      type: z.string().email(),
      description: "The customer's email address.",
    },
    ip_address: {
      type: z.string().optional(),
      description: "The customer's IP address.",
    },
    card: {
      type: z.object({
        card_holder: z.string(),
        card_number: z.string(),
        expiry_date: z.string(),
        cvv: z.string(),
      }),
      description: "The customer's card details.",
    },
    address: {
      type: z.object({
        address: z.string(),
        city: z.string(),
        state: z.string(),
        postcode: z.string(),
        country: z.string(),
      }),
      description: "The customer's address details.",
    },
  };

  async execute(input: FatZebraCreateCustomerInput) {
    try {
      const url = `${this.baseUrl}/customers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(input),
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