import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraStoreCardInput {
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
  customer_id?: string;
}

class FatZebraStoreCardTool extends MCPTool<FatZebraStoreCardInput> {
  name = "fat_zebra_store_card";
  description = "Store a card for future use (vault/tokenize) using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    card_number: {
      type: z.string(),
      description: "The card number to tokenize.",
    },
    card_expiry: {
      type: z.string(),
      description: "The card expiry date in the format MM/YYYY.",
    },
    card_cvv: {
      type: z.string(),
      description: "The card verification value (CVV/CVC) code.",
    },
    card_holder: {
      type: z.string(),
      description: "The name of the cardholder.",
    },
    customer_id: {
      type: z.string().optional(),
      description: "Optional customer ID to associate with the card.",
    },
  };

  async execute(input: FatZebraStoreCardInput) {
    try {
      // According to documentation, tokens are normally created as part of a purchase
      // We'll handle this by making a $0 purchase or authorization
      const requestBody: any = {
        card_number: input.card_number,
        card_expiry: input.card_expiry,
        card_cvv: input.card_cvv,
        card_holder: input.card_holder,
        amount: 100, // Small amount for validation
        reference: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        currency: "AUD",
        capture: false, // Don't actually charge the card
      };
      
      if (input.customer_id) {
        requestBody.customer_id = input.customer_id;
      }
      
      // Use the purchases endpoint which returns a token
      const url = `${this.baseUrl}/purchases`;
      console.log(`Making tokenization request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!data.successful) {
        return { 
          successful: false, 
          errors: data.errors || ["Unknown error from Fat Zebra API"] 
        };
      }
      
      // Extract the card token from the response
      const cardToken = data.response?.card_token;
      const cardType = data.response?.card_type;
      const cardCategory = data.response?.card_category;
      const cardExpiry = data.response?.card_expiry;
      const maskedCardNumber = data.response?.card_number;
      
      // Return the tokenization results
      return {
        successful: true,
        card_token: cardToken,
        card_type: cardType,
        card_category: cardCategory,
        card_expiry: cardExpiry,
        card_number: maskedCardNumber
      };
    } catch (error) {
      console.error('Error storing card:', error);
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraStoreCardTool;