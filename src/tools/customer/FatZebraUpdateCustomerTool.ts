import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraUpdateCustomerInput {
  customer_id: string;
  email?: string;
  name?: string;
  address?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

/**
 * Fat Zebra Update Customer Tool
 * Update customer details in Fat Zebra payment gateway.
 */
const FatZebraUpdateCustomerTool = {
  name: "fat_zebra_update_customer",
  description: "Update customer details in Fat Zebra.",
  
  // Input schema using zod
  schema: {
    customer_id: z.string().describe("The ID of the customer to update."),
    email: z.string().email().optional().describe("The customer's email address."),
    name: z.string().optional().describe("The customer's name."),
    address: z.string().optional().describe("The customer's address."),
    phone: z.string().optional().describe("The customer's phone number."),
    metadata: z.record(z.string()).optional().describe("Additional metadata for the customer."),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ customer_id, email, name, address, phone, metadata }: FatZebraUpdateCustomerInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Prepare the request body for the Fat Zebra API
      const requestBody: any = {};
      
      // Only include fields that are provided
      if (email) requestBody.email = email;
      if (name) requestBody.name = name;
      if (address) requestBody.address = address;
      if (phone) requestBody.phone = phone;
      if (metadata) requestBody.metadata = metadata;
      
      // Log the request (redact sensitive data)
      console.log(`[FatZebraUpdateCustomerTool] Updating customer with ID: ${customer_id}`);
      
      // Construct the URL with the customer ID
      const url = `${baseUrl}/customers/${encodeURIComponent(customer_id)}`;
      
      // Make the request to the Fat Zebra API
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      // Log the response
      console.log(`[FatZebraUpdateCustomerTool] Response:`, data.successful ? "Success" : "Failed");
      
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
      console.error('[FatZebraUpdateCustomerTool] Error:', error);
      
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

export default FatZebraUpdateCustomerTool;