import { z } from "zod";
import { getLogger } from "../../utils/logger.js";
import { 
  fatZebraApi, 
  FIELD_NAMES, 
  TEST_DATA,
  ENDPOINTS,
  buildBasePaymentRequest,
  addCardDetails,
  validateRequest,
  handleFatZebraResponse,
  handleApiError
} from "../../utils/api/index.js";

// Create tool-specific logger
const logger = getLogger('FatZebraPaymentTool');

// Define input interface
interface FatZebraPaymentInput {
  amount: number;
  currency?: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  reference: string;
  card_holder?: string;
  customer_email?: string;
  customer_ip?: string;
  capture?: boolean;
}

/**
 * Fat Zebra Payment Tool
 * Process a credit card payment using the Fat Zebra payment gateway
 */
const FatZebraPaymentTool = {
  name: "fat_zebra_payment",
  description: "Process a credit card payment using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to charge in cents (e.g., 1000 for $10.00)"),
    currency: z.string().default("AUD").describe("The three-letter ISO currency code (default: AUD)"),
    card_number: z.string().describe("The customer's credit card number"),
    card_expiry: z.string().describe("The card expiry date in the format MM/YYYY (e.g., 05/2026)"),
    card_cvv: z.string().min(1, "Card verification code is required").describe("The card verification value (CVV/CVC) code"),
    reference: z.string().describe("A unique reference for this transaction. IMPORTANT: If you are generating this reference, ensure it is unique by appending 6 characters from a random GUID."),
    card_holder: z.string().optional().describe("The cardholder's name (optional)"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    customer_ip: z.string().optional().default("127.0.0.1").describe("The customer's IP address (optional, defaults to 127.0.0.1)"),
    capture: z.boolean().default(true).describe("Whether to capture the payment immediately (default: true)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ 
    amount, 
    currency, 
    card_number, 
    card_expiry, 
    card_cvv, 
    reference, 
    card_holder, 
    customer_email, 
    customer_ip, 
    capture 
  }: FatZebraPaymentInput) => {
    try {
      logger.info('Starting credit card payment processing');
      
      // Use the successful test card in test mode if no card is provided
      const isTestMode = fatZebraApi.isTestMode();
      const cardNumber = isTestMode && !card_number ? TEST_DATA.CARD_NUMBER : card_number;
      
      // Use the successful expiry date in test mode if using the default test card
      const cardExpiry = isTestMode && cardNumber === TEST_DATA.CARD_NUMBER && !card_expiry ? 
        TEST_DATA.CARD_EXPIRY : card_expiry;
      
      // Never use default CVV - always require it
      const cardCVV = card_cvv;
      
      // Always ensure card_holder is provided as Fat Zebra requires it
      const cardHolder = card_holder || TEST_DATA.CARD_HOLDER;
      
      // Build the base request body
      let requestBody = buildBasePaymentRequest({
        amount,
        currency,
        reference,
        customer_ip,
        customer_email,
        capture,
        card_holder: cardHolder
      });
      
      // Add card details to the request
      requestBody = addCardDetails(requestBody, {
        card_number: cardNumber,
        card_expiry: cardExpiry,
        card_cvv: cardCVV
      });
      
      // Validate required fields before making the request
      const requiredFields = [
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.REFERENCE,
        FIELD_NAMES.CARD_NUMBER,
        FIELD_NAMES.CARD_EXPIRY,
        FIELD_NAMES.CARD_CVV
      ];
      
      const validation = validateRequest(requestBody, requiredFields);
      if (!validation.isValid) {
        logger.warn({ errors: validation.errors }, 'Validation failed for payment request');
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

export default FatZebraPaymentTool;