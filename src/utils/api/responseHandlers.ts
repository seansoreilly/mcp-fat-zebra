import { getLogger } from '../logger.js';
import { FIELD_NAMES } from './constants.js';

// Create tool-specific logger
const logger = getLogger('responseHandlers');

/**
 * Standardizes and formats the API response for returning to the client
 * @param response HTTP response from fetch
 * @param data Parsed JSON data from the response
 * @returns Formatted response
 */
export function handleFatZebraResponse(response: any, data: any) {
  if (!data.successful) {
    return handleErrorResponse(response, data);
  }

  return handleSuccessResponse(response, data);
}

/**
 * Handles error responses from the Fat Zebra API
 * @param response HTTP response from fetch
 * @param data Parsed JSON data from the response
 * @returns Formatted error response
 */
function handleErrorResponse(response: any, data: any) {
  // Extract errors from the response
  const errors = data.errors || ['Unknown error from Fat Zebra API'];
  
  logger.warn({ 
    status: response.status, 
    errors 
  }, 'Fat Zebra API returned an error');
  
  return { 
    content: [{ 
      type: "text", 
      text: JSON.stringify({
        successful: false,
        status: response.status,
        response: null,
        errors
      })
    }]
  };
}

/**
 * Handles successful responses from the Fat Zebra API
 * @param response HTTP response from fetch
 * @param data Parsed JSON data from the response
 * @returns Formatted success response
 */
function handleSuccessResponse(response: any, data: any) {
  // Extract the relevant fields from the response
  const responseData = data.response || {};
  
  const result = {
    successful: data.successful,
    status: response.status,
    response: {
      transaction_id: responseData.transaction_id,
      card_token: responseData.card_token,
      amount: responseData.amount,
      reference: responseData.reference,
      message: responseData.message,
      authorization: responseData.response_code,
      currency: responseData.currency,
      timestamp: responseData.transaction_date,
    },
    errors: undefined
  };
  
  logger.info({
    successful: data.successful,
    transaction_id: responseData.transaction_id,
    reference: responseData.reference,
  }, 'Successfully processed Fat Zebra API response');
  
  return { 
    content: [{ 
      type: "text", 
      text: JSON.stringify(result)
    }]
  };
}

/**
 * Handles unexpected errors during API communication
 * @param error The error that occurred
 * @returns Formatted error response
 */
export function handleApiError(error: any) {
  logger.error({ err: error }, 'Error processing Fat Zebra API request');
  
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
