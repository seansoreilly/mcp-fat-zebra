/**
 * Fat Zebra API field name constants
 * Use these constants to ensure consistency across all tool implementations
 */

export const FIELD_NAMES = {
  // Card details
  CARD_NUMBER: 'card_number',
  CARD_EXPIRY: 'card_expiry',
  CARD_CVV: 'card_cvv',
  CARD_HOLDER: 'card_holder',
  CARD_TOKEN: 'card_token',
  
  // Transaction details
  AMOUNT: 'amount',
  CURRENCY: 'currency',
  REFERENCE: 'reference',
  CUSTOMER_IP: 'customer_ip',
  CUSTOMER_EMAIL: 'customer_email',
  CAPTURE: 'capture',
  
  // Response fields
  TRANSACTION_ID: 'transaction_id', 
  AUTHORIZATION: 'response_code',
  MESSAGE: 'message',
  TIMESTAMP: 'transaction_date',
  
  // Error fields
  ERRORS: 'errors',
  SUCCESSFUL: 'successful',
};

// API response codes
export const RESPONSE_CODES = {
  APPROVED: '00',
  DECLINED: '05',
};

// Default sandbox test data
export const TEST_DATA = {
  CARD_NUMBER: '5123456789012346',  // Mastercard test card that returns APPROVED
  CARD_EXPIRY: '05/2026',
  CARD_CVV: '123',
  CARD_HOLDER: 'Test User',
  CURRENCY: 'AUD',
};

// API endpoints
export const ENDPOINTS = {
  PURCHASES: '/purchases',
  TOKENS: '/tokens',
  REFUNDS: '/refunds',
  DIRECT_DEBITS: '/direct_debits',
  CUSTOMERS: '/customers',
  WEBHOOKS: '/webhooks',
  BATCHES: '/batches',
  CARDS: '/credit_cards',
  RECONCILIATION: '/reconciliation',
};
