import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraTokenizeInput {
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
}

/**
 * Fat Zebra Tokenize Tool
 * Tokenize a credit card using the Fat Zebra payment gateway
 */
const FatZebraTokenizeTool = {
  name: "fat_zebra_tokenize",
  description: "Tokenize a credit card using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    card_number: z.string().describe("The customer's credit card number"),
    card_expiry: z.string().describe("The card expiry date in the format MM/YYYY (e.g., 05/2026)"),
    card_cvv: z.string().describe("The card verification value (CVV/CVC) code (required)"),
    card_holder: z.string().describe("The name of the cardholder (required)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ card_number, card_expiry, card_cvv, card_holder }: FatZebraTokenizeInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Default test card that works with Fat Zebra - using the one reported to work consistently
      const defaultTestCard = "5123456789012346";
      const defaultExpiryDate = "05/2026";
      const defaultCVV = "123";
      const defaultCardHolder = "Test User";
      
      // Use the successful test card if we're in test mode and no card is provided
      const cardNumber = username === "TEST" && !card_number ?
        defaultTestCard : card_number;

      // Use the successful expiry date if we're in test mode and using the default test card
      const cardExpiry = username === "TEST" && cardNumber === defaultTestCard ?
        defaultExpiryDate : card_expiry;

      // Always ensure CVV is provided - now required by interface
      const cardCVV = card_cvv || defaultCVV;

      // Always provide a card holder name - now required by interface
      const cardHolder = card_holder || defaultCardHolder;

      // Log the request (redact sensitive data)
      console.log(`[FatZebraTokenizeTool] Making tokenization request to: ${baseUrl}/credit_cards`);
      console.log(`[FatZebraTokenizeTool] Card Holder: ${cardHolder}`);

      // Tokenization can be done directly using the /credit_cards endpoint
      // This creates a token without charging the card
      const requestBody = {
        card_number: cardNumber,
        card_expiry: cardExpiry,
        cvv: cardCVV, // API expects 'cvv' not 'card_cvv'
        card_holder: cardHolder
      };

      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/credit_cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      // Log the response (redact sensitive data)
      console.log(`[FatZebraTokenizeTool] Response:`, data.successful ? "Success" : "Failed");
      
      // Check if the response was successful
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

      // Return the tokenized card information
      const result = {
        successful: true,
        status: response.status,
        response: {
          card_token: data.response.card_token,
          card_type: data.response.card_type,
          card_category: data.response.card_category,
          card_expiry: data.response.card_expiry,
          card_number: data.response.card_number // This will be masked by Fat Zebra
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
      console.error('[FatZebraTokenizeTool] Error:', error);
      
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

export default FatZebraTokenizeTool;