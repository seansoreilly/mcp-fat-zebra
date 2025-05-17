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
const logger = getLogger('FatZebra3DSecureTool');

// Define input interface
interface FatZebra3DSecureInput {
  amount: number;
  currency?: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
  reference: string;
  customer_ip: string;
  customer_email?: string;
  return_url: string;
  fraud_detection_enabled?: boolean;
}

/**
 * Fat Zebra 3D Secure Tool
 * Process a 3D Secure credit card payment using the Fat Zebra payment gateway
 */
const FatZebra3DSecureTool = {
  name: "fat_zebra_3d_secure",
  description: "Process a 3D Secure credit card payment using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    amount: z.number().positive().describe("The amount to charge in cents (e.g., 1000 for $10.00)"),
    currency: z.string().default("AUD").describe("The three-letter ISO currency code (default: AUD)"),
    card_number: z.string().describe("The customer's credit card number"),
    card_expiry: z.string().describe("The card expiry date in the format MM/YYYY (e.g., 05/2026)"),
    card_cvv: z.string().min(1, "Card verification code is required").describe("The card verification value (CVV/CVC) code"),
    card_holder: z.string().describe("The name of the cardholder"),
    reference: z.string().describe("A unique reference for this transaction"),
    customer_ip: z.string().describe("The customer's IP address"),
    customer_email: z.string().email().optional().describe("The customer's email address (optional)"),
    return_url: z.string().url().describe("The URL to return to after 3D Secure authentication"),
    fraud_detection_enabled: z.boolean().default(false).describe("Whether to enable fraud detection (default: false)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ 
    amount, 
    currency, 
    card_number, 
    card_expiry, 
    card_cvv, 
    card_holder, 
    reference, 
    customer_ip, 
    customer_email, 
    return_url, 
    fraud_detection_enabled 
  }: FatZebra3DSecureInput) => {
    try {
      logger.info('Starting 3D Secure payment processing');
      
      // Use the successful test card in test mode if no card is provided
      const isTestMode = fatZebraApi.isTestMode();
      const cardNumber = isTestMode && !card_number ? TEST_DATA.CARD_NUMBER : card_number;
      
      // Use the successful expiry date in test mode if using the default test card
      const cardExpiry = isTestMode && cardNumber === TEST_DATA.CARD_NUMBER && !card_expiry ? 
        TEST_DATA.CARD_EXPIRY : card_expiry;
      
      // Never use default CVV - always require it
      const cardCVV = card_cvv;
      
      // Always ensure card_holder is provided
      const cardHolder = card_holder || TEST_DATA.CARD_HOLDER;
      
      // Create a unique reference number
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const paymentReference = reference || `3DS-${uniqueId}`;
      
      // Build the base request body
      let requestBody = buildBasePaymentRequest({
        amount,
        currency,
        reference: paymentReference,
        customer_ip,
        customer_email,
        card_holder: cardHolder
      });
      
      // Add card details to the request
      requestBody = addCardDetails(requestBody, {
        card_number: cardNumber,
        card_expiry: cardExpiry,
        card_cvv: cardCVV
      });
      
      // Add 3D Secure specific fields
      requestBody.return_url = return_url;
      
      if (fraud_detection_enabled !== undefined) {
        requestBody.fraud_detection_enabled = fraud_detection_enabled;
      }
      
      // Add 3D Secure test parameters for sandbox
      if (isTestMode) {
        requestBody.extra = {
          // Default values for testing
          sli: "05",
          cavv: "MzM2OGI2ZjkwYjYwY2FjODQ3ZWU=",
          xid: "ZGUzNzgwYzQxM2ZlMWM0MzVkMjc=",
          par: "Y",
          ver: "Y",
          directory_server_txn_id: "5ddb4c13-2e30-4901-9854-5f0305097a25",
          threeds_version: "2.1.0"
        };
      }
      
      // Validate required fields before making the request
      const requiredFields = [
        FIELD_NAMES.AMOUNT,
        FIELD_NAMES.REFERENCE,
        FIELD_NAMES.CARD_NUMBER,
        FIELD_NAMES.CARD_EXPIRY,
        FIELD_NAMES.CARD_CVV,
        FIELD_NAMES.CARD_HOLDER,
        'return_url',
        FIELD_NAMES.CUSTOMER_IP
      ];
      
      const validation = validateRequest(requestBody, requiredFields);
      if (!validation.isValid) {
        logger.warn({ errors: validation.errors }, 'Validation failed for 3D Secure payment request');
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
      
      // Customize the response for 3DS to include the needed authentication URLs
      if (data.successful) {
        const result = {
          successful: data.successful,
          status: response.status,
          response: {
            transaction_id: data.response?.transaction_id || "",
            three_ds: data.response?.three_ds || null,
            amount: data.response?.amount || 0,
            reference: data.response?.reference || "",
            message: data.response?.message || "",
            currency: data.response?.currency || "",
            requires_action: !!data.response?.three_ds, // Boolean indicating if 3DS authentication is needed
            action_url: data.response?.three_ds?.authority_url || "",
            action_method: data.response?.three_ds?.authority_method || "",
            action_params: data.response?.three_ds?.params || {}
          },
          errors: undefined
        };
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(result)
          }]
        };
      }
      
      // Process and return the response
      return handleFatZebraResponse(response, data);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default FatZebra3DSecureTool;