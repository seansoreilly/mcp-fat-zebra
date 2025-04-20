import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraTokenizeInput {
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
}

// Define interface for Fat Zebra API response
interface FatZebraApiResponse {
  successful: boolean;
  errors?: string[];
  response: {
    card_token: string;
    card_type: string;
    card_category: string;
    card_expiry: string;
    card_number: string;
  };
}

class FatZebraTokenizeTool extends MCPTool<FatZebraTokenizeInput> {
  name = "fat_zebra_tokenize";
  description = "Tokenize a credit card using the Fat Zebra payment gateway";

  // Fat Zebra API configuration
  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  // Default test card that works with Fat Zebra - using the one reported to work consistently
  private defaultTestCard = "5123456789012346";
  private defaultExpiryDate = "05/2026";
  private defaultCVV = "123";
  private defaultCardHolder = "Test User";

  schema = {
    card_number: {
      type: z.string(),
      description: "The customer's credit card number",
    },
    card_expiry: {
      type: z.string(),
      description: "The card expiry date in the format MM/YYYY (e.g., 05/2026)",
    },
    card_cvv: {
      type: z.string(),
      description: "The card verification value (CVV/CVC) code (required)",
    },
    card_holder: {
      type: z.string(),
      description: "The name of the cardholder (required)",
    }
  };

  async execute(input: FatZebraTokenizeInput) {
    try {
      // Use the successful test card if we're in test mode and no card is provided
      const cardNumber = this.username === "TEST" && !input.card_number ?
        this.defaultTestCard : input.card_number;

      // Use the successful expiry date if we're in test mode and using the default test card
      const cardExpiry = this.username === "TEST" && cardNumber === this.defaultTestCard ?
        this.defaultExpiryDate : input.card_expiry;

      // Always ensure CVV is provided - now required by interface
      const cardCVV = input.card_cvv || this.defaultCVV;

      // Always provide a card holder name - now required by interface
      const cardHolder = input.card_holder || this.defaultCardHolder;

      // Based on documentation, tokenization is done through purchases
      // We'll create a $0 authorization to get a token
      const requestBody = {
        card_number: cardNumber,
        card_expiry: cardExpiry,
        card_cvv: cardCVV,
        card_holder: cardHolder,
        amount: 100, // Small amount for validation
        reference: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        currency: "AUD",
        capture: false, // Don't actually charge the card
        customer_ip: "127.0.0.1"
      };

      // Make the request to the Fat Zebra API
      const response = await fetch(`${this.baseUrl}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as FatZebraApiResponse;

      // Check if the response was successful
      if (!data.successful) {
        // Return the error response directly instead of throwing
        return {
          successful: false,
          errors: data.errors || ["Unknown error from Fat Zebra API"]
        };
      }

      // Return the tokenized card information
      return {
        successful: true,
        card_token: data.response.card_token,
        card_type: data.response.card_type,
        card_category: data.response.card_category,
        card_expiry: data.response.card_expiry,
        card_number: data.response.card_number // This will be masked by Fat Zebra
      };
    } catch (error) {
      console.error('Error tokenizing card:', error);
      // Return error as a response instead of throwing
      return {
        successful: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraTokenizeTool;