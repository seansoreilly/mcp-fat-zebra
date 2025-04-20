// Utility functions for Fat Zebra webhook tools

import fetch from "node-fetch";

/**
 * Check if the webhooks API is available in the current environment
 * @param baseUrl The Fat Zebra API base URL
 * @param username The Fat Zebra API username
 * @param token The Fat Zebra API token
 * @returns Promise<boolean> True if webhooks API is available, false otherwise
 */
export async function checkWebhooksApiAvailability(
  baseUrl: string,
  username: string,
  token: string
): Promise<boolean> {
  try {
    // Make a request to check if the webhooks endpoint exists
    const url = `${baseUrl}/webhooks`;
    console.log(`Checking webhooks API availability at ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
      },
    });
    
    if (response.status === 404) {
      console.log('Webhooks API is not available (404 Not Found)');
      return false;
    }
    
    // If we get a 200 response, or any other response that's not 404,
    // we assume the API is available
    return true;
  } catch (error) {
    console.error('Error checking webhooks API availability:', error);
    return false;
  }
}

/**
 * Generate a standard error response for webhook tools when the API is not available
 * @returns Object with error information
 */
export function getWebhooksApiUnavailableError() {
  return {
    successful: false,
    errors: [
      "Webhook functionality is not available in the current Fat Zebra environment (404 Not Found). " +
      "Based on the Fat Zebra documentation, the webhooks endpoint should be at /webhooks, but this " +
      "endpoint is not accessible in the current environment. " +
      "This may be because webhooks are not supported in the sandbox environment, " +
      "or because additional configuration is required. " +
      "Please refer to the Fat Zebra documentation at https://docs.fatzebra.com/reference/webhooks for more information."
    ]
  };
}
