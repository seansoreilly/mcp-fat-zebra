import { getLogger } from '../logger.js';
import { FIELD_NAMES, TEST_DATA } from './constants.js';

// Create tool-specific logger
const logger = getLogger('requestHelpers');

/**
 * Builds a basic payment request body with common fields
 * @param params Payment parameters
 * @returns Prepared request body
 */
export function buildBasePaymentRequest(params: any) {
  const { 
    amount, 
    currency, 
    reference, 
    customer_ip, 
    customer_email, 
    capture,
    card_holder,
  } = params;
  
  // Generate a unique reference with timestamp AND random string if not provided
  const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  const paymentReference = reference || `ref-${uniqueId}`;
  
  const requestBody: Record<string, any> = {
    [FIELD_NAMES.AMOUNT]: amount,
    [FIELD_NAMES.REFERENCE]: paymentReference,
    [FIELD_NAMES.CURRENCY]: currency || TEST_DATA.CURRENCY,
  };
  
  // Add card holder if provided
  if (card_holder) {
    requestBody[FIELD_NAMES.CARD_HOLDER] = card_holder;
  }
  
  // Add optional fields only if provided
  if (customer_ip) {
    requestBody[FIELD_NAMES.CUSTOMER_IP] = customer_ip;
  }
  
  if (customer_email) {
    requestBody[FIELD_NAMES.CUSTOMER_EMAIL] = customer_email;
  }
  
  if (capture !== undefined) {
    requestBody[FIELD_NAMES.CAPTURE] = capture;
  }
  
  return requestBody;
}

/**
 * Validates that required fields are present in the request
 * @param requestBody The request body to validate
 * @param requiredFields Array of required field names
 * @returns Object with isValid flag and error messages
 */
export function validateRequest(requestBody: any, requiredFields: string[]) {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = requestBody[field];
    
    // Check for undefined, null, empty string
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: missingFields.map(field => `${field} is required`)
    };
  }
  
  return { isValid: true, errors: [] };
}

/**
 * Adds credit card details to a payment request
 * @param requestBody Existing request body
 * @param params Card parameters
 * @returns Updated request body
 */
export function addCardDetails(requestBody: any, params: any) {
  const { card_number, card_expiry, card_cvv, card_holder } = params;
  
  // Add card details to the request
  if (card_number) {
    requestBody[FIELD_NAMES.CARD_NUMBER] = card_number;
  }
  
  if (card_expiry) {
    requestBody[FIELD_NAMES.CARD_EXPIRY] = card_expiry;
  }
  
  if (card_cvv) {
    requestBody[FIELD_NAMES.CARD_CVV] = card_cvv;
  }
  
  if (card_holder) {
    requestBody[FIELD_NAMES.CARD_HOLDER] = card_holder;
  }
  
  return requestBody;
}

/**
 * Adds card token details to a payment request
 * @param requestBody Existing request body
 * @param params Token parameters
 * @returns Updated request body
 */
export function addTokenDetails(requestBody: any, params: any) {
  const { card_token, cvv, card_cvv } = params;
  
  // Add token to the request
  if (card_token) {
    requestBody[FIELD_NAMES.CARD_TOKEN] = card_token;
  }
  
  // Handle CVV - use card_cvv if provided, fall back to cvv for backwards compatibility
  const verificationCode = card_cvv || cvv;
  if (verificationCode) {
    // Always use the CARD_CVV field name for consistency
    requestBody[FIELD_NAMES.CARD_CVV] = verificationCode;
  }
  
  return requestBody;
}
