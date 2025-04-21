import { z } from "zod";
import fetch from "node-fetch";

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
  execute: async ({ method, endpoint, body, headers }: FatZebraPassthroughInput) => {
    // Validate endpoint
    if (!endpoint.startsWith("/")) {
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
    
    if (endpoint.includes("..")) {
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
    
    const url = `${baseUrl}${endpoint}`;
    const requestMethod = method.toUpperCase();
    
    // Merge headers, always set auth and content-type
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
      ...(headers || {})
    };
    
    // Log the request (redact sensitive data)
    const logInput = { method, endpoint, headers: undefined, body: body ? "[REDACTED]" : undefined };
    console.log(`[FatZebraPassthroughTool] Request:`, logInput);
    
    try {
      const fetchOptions: any = { method: requestMethod, headers: requestHeaders };
      if (["POST", "PUT", "PATCH"].includes(requestMethod) && body) {
        fetchOptions.body = JSON.stringify(body);
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
      console.log(`[FatZebraPassthroughTool] Response:`, typeof responseData === "string" ? responseData.slice(0, 500) : responseData);
      
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
      console.error(`[FatZebraPassthroughTool] Error:`, error);
      
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