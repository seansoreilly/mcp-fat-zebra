import { z } from "zod";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraStoreCardTool');
import fetch from "node-fetch";

// Input type for store card requests
interface FatZebraStoreCardInput {
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
  customer_id?: string;
}

/**
 * Fat Zebra Store Card Tool
 * Stores a card for future use (vault/tokenize) using the Fat Zebra payment gateway.
 * Creates a token by making a $0 purchase or authorization.
 */
const FatZebraStoreCardTool = {
  name: "fat_zebra_store_card",
  description: "Store a card for future use (vault/tokenize) using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    card_number: z.string().describe("The card number to tokenize."),
    card_expiry: z.string().describe("The card expiry date in the format MM/YYYY."),
    card_cvv: z.string().describe("The card verification value (CVV/CVC) code."),
    card_holder: z.string().describe("The name of the cardholder."),
    customer_id: z.string().optional().describe("Optional customer ID to associate with the card."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ card_number, card_expiry, card_cvv, card_holder, customer_id }: FatZebraStoreCardInput) => {
    try {
      // According to documentation, tokens are normally created as part of a purchase
      // We'll handle this by making a $0 purchase or authorization
      const requestBody: any = {
        card_number,
        card_expiry,
        card_cvv,
        card_holder,
        amount: 100, // Small amount for validation
        reference: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        currency: "AUD",
        capture: false, // Don't actually charge the card
      };
      
      if (customer_id) {
        requestBody.customer_id = customer_id;
      }
      
      // Build URL and auth
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Use the purchases endpoint which returns a token
      const url = `${baseUrl}/purchases`;
      logger.info(`Making tokenization request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;
      
      // Log the response (redact sensitive data)
      logger.info({ status: data.successful ? "Success" : "Failed" }, 'Response:');
      
      if (!data.successful) {
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              successful: false, 
              status: response.status,
              response: null,
              errors: data.errors || ["Unknown error from Fat Zebra API"] 
            })
          }]
        };
      }
      
      // Extract the card token from the response
      const cardToken = data.response?.card_token;
      const cardType = data.response?.card_type;
      const cardCategory = data.response?.card_category;
      const cardExpiry = data.response?.card_expiry;
      const maskedCardNumber = data.response?.card_number;
      
      // Return the tokenization results
      const result = {
        successful: true,
        status: response.status,
        response: {
          card_token: cardToken,
          card_type: cardType,
          card_category: cardCategory,
          card_expiry: cardExpiry,
          card_number: maskedCardNumber
        },
        errors: undefined
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      logger.error({ err: error }, 'Error:');
      
      const errorResult = { 
        successful: false, 
        status: 500, 
        response: null, 
        errors: [(error instanceof Error ? error.message : String(error))] 
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(errorResult)
        }]
      };
    }
  }
};

export default FatZebraStoreCardTool;