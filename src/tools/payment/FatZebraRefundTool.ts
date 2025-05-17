import { z } from "zod";
import { getLogger } from "../../utils/logger.js";
import { 
  fatZebraApi, 
  FIELD_NAMES, 
  ENDPOINTS,
  validateRequest,
  handleFatZebraResponse,
  handleApiError
} from "../../utils/api/index.js";

// Create tool-specific logger
const logger = getLogger('FatZebraRefundTool');

// Define input interface
interface FatZebraRefundInput {
  transaction_id: string;
  amount: number;
  reference: string;
}

/**
 * Fat Zebra Refund Tool
 * Process a refund for a previous transaction using the Fat Zebra payment gateway
 */
const FatZebraRefundTool = {
  name: "fat_zebra_refund",
  description: "Process a refund for a previous transaction using the Fat Zebra payment gateway",
  
  // Input schema using zod
  schema: {
    transaction_id: z.string().describe("The ID of the original transaction to refund"),
    amount: z.number().positive().describe("The amount to refund in cents (e.g., 1000 for $10.00)"),
    reference: z.string().describe("A unique reference for this refund transaction"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ transaction_id, amount, reference }: FatZebraRefundInput) => {
    try {
      logger.info('Starting refund processing');
      
      // Generate a unique reference if none was provided
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const refundReference = reference || `refund-${uniqueId}`;

      // Prepare the request body for the Fat Zebra API
      const requestBody = {
        transaction_id: transaction_id,
        amount: amount,
        reference: refundReference,
      };

      // Validate required fields before making the request
      const requiredFields = [
        'transaction_id',
        'amount',
        'reference'
      ];
      
      const validation = validateRequest(requestBody, requiredFields);
      if (!validation.isValid) {
        logger.warn({ errors: validation.errors }, 'Validation failed for refund request');
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
      const { response, data } = await fatZebraApi.makeRequest(ENDPOINTS.REFUNDS, 'POST', requestBody);
      
      // Handle successful response differently for refunds
      if (data.successful) {
        const result = {
          successful: data.successful,
          status: response.status,
          response: {
            refund_id: data.response?.id || "",
            amount: data.response?.amount || 0,
            reference: data.response?.reference || "",
            transaction_id: data.response?.transaction_id || "",
            message: data.response?.message || "",
            currency: data.response?.currency || "",
            timestamp: data.response?.created_at || "",
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
      
      // Process and return error response
      return handleFatZebraResponse(response, data);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default FatZebraRefundTool;