import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraCreateCustomerInput {
  first_name: string;
  last_name: string;
  reference: string;
  email: string;
  card_holder?: string;
  card_number?: string;
  card_expiry?: string;
  cvv?: string;
  card_token?: string;
  address: {
    line1: string;
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
    email: {
      type: z.string().email(),
      description: "The customer's email address.",
    },
    card_holder: {
      type: z.string().optional(),
      description: "The name on the customer's card.",
    },
    card_number: {
      type: z.string().optional(),
      description: "The customer's card number.",
    },
    card_expiry: {
      type: z.string().optional(),
      description: "The expiry date of the card in MM/YYYY format.",
    },
    cvv: {
      type: z.string().optional(),
      description: "The card's CVV.",
    },
    card_token: {
      type: z.string().optional(),
      description: "A card token can be sent in lieu of card details.",
    },
    address: {
      type: z.object({
        line1: z.string(),
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
      const requestBody: any = {
        first_name: input.first_name,
        last_name: input.last_name,
        reference: input.reference,
        email: input.email,
        address: input.address,
      };
      if (input.card_token) {
        requestBody.card_token = input.card_token;
      } else {
        requestBody.card_holder = input.card_holder;
        requestBody.card_number = input.card_number;
        requestBody.card_expiry = input.card_expiry;
        requestBody.cvv = input.cvv;
      }
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