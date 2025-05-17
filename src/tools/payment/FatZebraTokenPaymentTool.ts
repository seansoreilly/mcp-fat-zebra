import { z } from "zod";
import { getLogger } from "../../utils/logger.js";
import { 
  fatZebraApi, 
  FIELD_NAMES, 
  TEST_DATA,
  ENDPOINTS,
  buildBasePaymentRequest,
  addTokenDetails,
  validateRequest,
  handleFatZebraResponse,
  handleApiError
} from "../../utils/api/index.js";

// Create tool-specific logger
const logger = getLogger('FatZebraTokenPaymentTool');

// Define input interface with standardized naming
interface FatZebraTokenPaymentInput {
  amount: number;
  currency?: string;
  card_token: string;
  reference: string;
  card_cvv?: string;  // Primary field name for consistency
  cvv?: string;       // Secondary field name for backward compatibility
  card_holder: string;
  customer_email?: string;
  customer_ip?: string;
  capture?: boolean;
}

/**
 * Fat Zebra Token Payment Tool
 * Process a payment using a tokenized card with the Fat Zebra payment gateway
 */
const FatZebraTokenPaymentTool = {
  name: "fat_zebra_token_payment",
  description: "Process a payment using a tokenized card with the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to charge in cents (e.g., 1000 for $10.00)"),
    currency: z.string().optional().default("AUD").describe("The three-letter ISO currency code (default: AUD)"),
    card_token: z.string().describe("The tokenized card to charge"),
    reference: z.string().describe("A unique reference for this transaction"),
    // Accept both card_cvv (preferred) and cvv (legacy) but require one of them
    card_cvv: z.string().optional().describe("The card verification value (CVV/CVC) code"),
    cvv: z.string().optional().describe("Legacy field: use card_cvv instead when possible"),
    card_holder: z.string().describe("The cardholder's name (required)"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    customer_ip: z.string().optional().default("127.0.0.1").describe("The customer's IP address (optional, defaults to 127.0.0.1)"),
    capture: z.boolean().default(true).describe("Whether to capture the payment immediately (default: true)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ 
    amount, 
    currency, 
    card_token, 
    reference, 
    card_cvv,
    cvv, 
    card_holder, 
    customer_email, 
    customer_ip, 
    capture 
  }: FatZebraTokenPaymentInput) => {
    try {
      logger.info('Starting token payment processing');
      
      // If card_cvv is not provided but cvv is, warn about using the legacy field
      if (!card_cvv && cvv) {
        logger.warn('Using legacy "cvv" field. Please use "card_cvv" in the future for consistency.');
      } else if (!card_cvv && !cvv) {
        logger.warn('No CVV provided. This may fail if the Fat Zebra API requires it.');
      }
      
      // Build the base request body
      let requestBody = buildBasePaymentRequest({
        amount,
        currency,
        reference,
        customer_ip,
        customer_email,
        capture,
        card_holder
      });
      
      // Add token details to the request
      requestBody = addTokenDetails(requestBody, {
        card_token,
        card_cvv,
        cvv
      });
      
      // Validate required fields before making the request
      const requiredFields = [
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.REFERENCE,
        FIELD_NAMES.CARD_TOKEN,
        FIELD_NAMES.CARD_HOLDER
      ];

      // CVV is required by Fat Zebra API
      if (!card_cvv && !cvv) {
        logger.error('Card verification code is required but not provided');
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              successful: false,
              status: 400,
              response: null,
              errors: ["Card verification code (card_cvv) is required"]
            })
          }]
        };
      }
      
      const validation = validateRequest(requestBody, requiredFields);
      if (!validation.isValid) {
        logger.warn({ errors: validation.errors }, 'Validation failed for token payment request');
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              successful: false,
              status: 400,
              response: null,
              errors: validation.errors
            })
          }]
        };
      }
      
      // Make the API request
      const { response, data } = await fatZebraApi.makeRequest(ENDPOINTS.PURCHASES, 'POST', requestBody);
      
      // Process and return the response
      return handleFatZebraResponse(response, data);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default FatZebraTokenPaymentTool;