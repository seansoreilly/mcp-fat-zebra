import fetch from "node-fetch";

import { getLogger } from "../../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraWebhookUtils');
/**
 * Check if the webhooks API is available in the current Fat Zebra environment
 * @param baseUrl The base URL for the Fat Zebra API
 * @param username The Fat Zebra API username
 * @param token The Fat Zebra API token
 * @returns A boolean indicating whether the webhooks API is available
 */
export const checkWebhooksApiAvailability = async (
  baseUrl: string,
  username: string,
  token: string
): Promise<boolean> => {
  try {
    const url = `${baseUrl}/web_hooks`;
    logger.info('Checking webhooks API availability at ${url}');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
      },
    });

    if (response.status === 404) {
      console.log('[FatZebraWebhookUtils] Webhooks API is not available (404 Not Found)');
      return false;
    }

    return true;
  } catch (error) {
    logger.error({ err: error }, 'Error checking webhooks API availability:');
    return false;
  }
};

/**
 * Get a standardized error response for when the webhooks API is unavailable
 * @returns An error response object
 */
export const getWebhooksApiUnavailableError = () => {
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify({
        successful: false,
        status: 404,
        response: null,
        errors: [
          "Webhook functionality is not available in the current Fat Zebra environment (404 Not Found). " +
          "Based on the Fat Zebra documentation, the webhooks endpoint should be at /webhooks, but this " +
          "endpoint is not accessible in the current environment. " +
          "This may be because webhooks are not supported in the sandbox environment, " +
          "or because additional configuration is required. " +
          "Please refer to the Fat Zebra documentation at https://docs.fatzebra.com/reference/webhooks for more information."
        ]
      })
    }]
  };
};