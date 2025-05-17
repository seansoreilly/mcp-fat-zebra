import { z } from "zod";
import fetch, { RequestInit } from "node-fetch";
import { getLogger } from "../utils/logger.js";

// Create tool-specific logger
const logger = getLogger('FatZebraPassthroughTool');

// List of known sensitive keys for redaction
const SENSITIVE_KEYS = [
  "token", "card_token", "card_number", "cvv", "card_holder", "expiry_date",
  "account_name", "account_number", "bsb", "password", "secret", "api_key",
  "email", "phone", "dob", "date_of_birth", "address", "customer_ip",
  // Add more keys as identified from API responses
];

// Recursive function to redact sensitive data from an object or array
function redactSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const redactedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        redactedObject[key] = "[REDACTED]";
      } else {
        redactedObject[key] = redactSensitiveData(data[key]);
      }
    }
  }
  return redactedObject;
}

// Input type for passthrough requests
interface FatZebraPassthroughInput {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string; // e.g. "/purchases", "/batches/123"
  body?: any; // JSON body for POST/PUT/PATCH
  headers?: Record<string, string>; // Optional extra headers
}

/**
 * General Fat Zebra Passthrough Tool
 * Allows sending any supported Fat Zebra API request and returns the raw response.
 * Strict input validation and logging for security.
 */
const FatZebraPassthroughTool = {
  name: "fat_zebra_passthrough",
  description: "Send any supported Fat Zebra API request (method, endpoint, body, headers) and receive the raw response. Strict input validation and logging for security.",
  
  // Input schema using zod
  schema: {
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    endpoint: z.string().regex(/^\//),
    body: z.any().optional(),
    headers: z.record(z.string(), z.string()).optional(),
  },
  
  // Execute function that will be called when the tool is used
  execute: async (input: FatZebraPassthroughInput) => {
    // Validate endpoint
    if (!input.endpoint.startsWith("/")) {
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            successful: false, 
            status: 400, 
            response: null, 
            errors: ["Endpoint must start with a slash."] 
          })
        }]
      };
    }
    
    if (input.endpoint.includes("..")) {
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            successful: false, 
            status: 400, 
            response: null, 
            errors: ["Endpoint must not contain '..'"] 
          })
        }]
      };
    }
    
    // Build URL and method
    const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
    const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
    const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
    
    const url = `${baseUrl}${input.endpoint}`;
    const requestMethod = input.method.toUpperCase();
    
    // Merge headers, always set auth and content-type
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
      ...(input.headers || {})
    };
    
    // Log the request (redact sensitive data)
    const logInput = { method: input.method, endpoint: input.endpoint, headers: undefined, body: input.body ? "[REDACTED]" : undefined };
    logger.info(logInput, 'Request');
    
    try {
      const fetchOptions: RequestInit = { method: requestMethod, headers: requestHeaders };
      if (["POST", "PUT", "PATCH"].includes(requestMethod) && input.body) {
        fetchOptions.body = JSON.stringify(input.body);
      }
      
      const response = await fetch(url, fetchOptions);
      let responseData: any;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Log the response (redact sensitive data)
      logger.info(
        {
          responsePreview: typeof responseData === "string"
            ? responseData.slice(0, 500)
            : redactSensitiveData(responseData)
        },
        'Response'
      );
      
      const result = {
        successful: response.ok,
        status: response.status,
        response: responseData,
        errors: response.ok ? undefined : [typeof responseData === "string" ? responseData : (responseData.errors || "Unknown error from Fat Zebra API")],
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      logger.error({ err: error }, 'Error');
      
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

export default FatZebraPassthroughTool;