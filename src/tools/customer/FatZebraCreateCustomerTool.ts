import { z } from "zod";
import fetch from "node-fetch";
import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraCreateCustomerTool');


// Define input interface
interface FatZebraCreateCustomerInput {
  // Mandatory fields
  first_name: string;
  last_name: string;
  reference: string;
  card_token: string;
  
  // Optional fields
  email?: string;
  ip_address?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

/**
 * Fat Zebra Create Customer Tool
 * Create a new customer in Fat Zebra payment gateway using a card token only.
 */
const FatZebraCreateCustomerTool = {
  name: "fat_zebra_create_customer",
  description: "Create a new customer in Fat Zebra payment gateway using a card token only.",
  
  // Input schema using zod
  schema: {
    // Mandatory fields
    first_name: z.string().describe("The customer's first name (MANDATORY)."),
    last_name: z.string().describe("The customer's last name (MANDATORY)."),
    reference: z.string().describe("A unique reference for this customer, e.g. your internal customer ID (MANDATORY)."),
    card_token: z.string().describe("A token representing the customer's credit card (MANDATORY). Direct card details are not supported."),
    
    // Optional fields
    email: z.string().email().optional().describe("The customer's email address (optional)."),
    ip_address: z.string().optional().describe("The customer's IP address (optional)."),
    address: z.object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      postcode: z.string(),
      country: z.string(),
    }).optional().describe("The customer's address details (optional)."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ first_name, last_name, reference, card_token, email, ip_address, address }: FatZebraCreateCustomerInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Prepare the request body for the Fat Zebra API
      const requestBody: any = {
        first_name: first_name,
        last_name: last_name,
        reference: reference,
        // Always include the card object with card_token
        card: {
          card_token: card_token
        }
      };

      // Map email to email_address as expected by Fat Zebra API
      if (email) {
        requestBody.email_address = email;
      }
      
      if (ip_address) {
        requestBody.ip_address = ip_address;
      }
      
      if (address) {
        requestBody.address = address;
      }

      // Log the request (redact sensitive data)
      logger.info(`Creating customer with reference: ${reference}`);

      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/customers`, {
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

      // Return the response from Fat Zebra
      const result = {
        successful: data.successful,
        status: response.status,
        response: data.response,
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

export default FatZebraCreateCustomerTool;