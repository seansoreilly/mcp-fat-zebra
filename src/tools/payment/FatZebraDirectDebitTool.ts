import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraDirectDebitInput {
  amount: number;
  description: string;
  reference: string;
  account_name: string;
  bsb: string;
  account_number: string;
  customer_name?: string;
  customer_email?: string;
  customer_ip?: string;
  metadata?: Record<string, string>;
}

// Define request body interface
interface DirectDebitRequestBody {
  amount: number;
  description: string;
  reference: string;
  account_name: string;
  bsb: string;
  account_number: string;
  customer_ip?: string;
  customer_name?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

/**
 * Fat Zebra Direct Debit Tool
 * Create a direct debit payment using the Fat Zebra payment gateway
 */
const FatZebraDirectDebitTool = {
  name: "fat_zebra_direct_debit",
  description: "Create a direct debit payment using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to debit in cents (e.g., 1000 for $10.00)"),
    description: z.string().max(18).describe("A description of the direct debit transaction (maximum 18 characters)"),
    reference: z.string().describe("A unique reference for this transaction"),
    account_name: z.string().describe("The name of the account to debit"),
    bsb: z.string().describe("The BSB number of the account (format: XXX-XXX)"),
    account_number: z.string().describe("The account number to debit"),
    customer_name: z.string().optional().describe("The customer's name (optional)"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    customer_ip: z.string().optional().describe("The customer's IP address (optional)"),
    metadata: z.record(z.string()).optional().describe("Additional metadata to store with the transaction (optional)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ amount, description, reference, account_name, bsb, account_number, customer_name, customer_email, customer_ip, metadata }: FatZebraDirectDebitInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Default test bank account details
      const defaultAccountName = "Test Account";
      const defaultBSB = "123-456"; // Test BSB
      const defaultAccountNumber = "12345678"; // Test account number
      
      // Use test account details if we're in test mode and no details are provided
      const accountName = username === "TEST" && !account_name ? 
        defaultAccountName : account_name;
      
      // Format BSB correctly if needed (ensure XXX-XXX format)
      let formattedBsb = bsb || defaultBSB;
      // If BSB doesn't contain a hyphen, format it as XXX-XXX
      if (formattedBsb && !formattedBsb.includes('-')) {
        formattedBsb = formattedBsb.length === 6 ? `${formattedBsb.substring(0, 3)}-${formattedBsb.substring(3)}` : formattedBsb;
      }
      
      const accountNumber = username === "TEST" && !account_number ? 
        defaultAccountNumber : account_number;
      
      // Create a unique reference with timestamp AND random string to ensure uniqueness
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const debitReference = reference || `dd-${uniqueId}`;
      
      // Truncate description to 18 characters if it's longer
      const truncatedDescription = description.length > 18 ? 
        description.substring(0, 18) : 
        description;
      
      // Prepare the request body for the Fat Zebra API
      const requestBody: DirectDebitRequestBody = {
        amount: amount,
        description: truncatedDescription,
        reference: debitReference,
        account_name: accountName,
        bsb: formattedBsb,
        account_number: accountNumber
      };

      // Add optional fields only if provided
      if (customer_ip) {
        requestBody.customer_ip = customer_ip;
      }
      
      if (customer_name) {
        requestBody.customer_name = customer_name;
      }
      
      if (customer_email) {
        requestBody.customer_email = customer_email;
      }
      
      if (metadata) {
        requestBody.metadata = metadata;
      }

      // Log the request (redact sensitive data)
      console.log(`[FatZebraDirectDebitTool] Making direct debit request to: ${baseUrl}/direct_debits`);
      console.log(`[FatZebraDirectDebitTool] Amount: ${amount}, Reference: ${debitReference}, Account Name: ${accountName}`);

      // Make the request to the Fat Zebra API
      const response = await fetch(`${baseUrl}/direct_debits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      // Log the response (redact sensitive data)
      console.log(`[FatZebraDirectDebitTool] Response:`, data.successful ? "Success" : "Failed");
      
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

      // Return the direct debit information
      const result = {
        successful: data.successful,
        status: response.status,
        response: {
          transaction_id: data.response?.id || "",
          amount: data.response?.amount || 0,
          reference: data.response?.reference || "",
          message: data.response?.message || "",
          status: data.response?.status || "",
          settlement_date: data.response?.settlement_date || "",
          transaction_date: data.response?.transaction_date || "",
          account_name: data.response?.account_name || "",
          // Mask the account number for security
          account_number: data.response?.account_number?.replace(/\d(?=\d{4})/g, "*") || "",
          account_routing: data.response?.account_routing || "",
          test: data.test
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
      console.error('[FatZebraDirectDebitTool] Error:', error);
      
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

export default FatZebraDirectDebitTool;