import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

// Input type for passthrough requests
interface FatZebraPassthroughInput {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string; // e.g. "/purchases", "/batches/123"
  body?: any; // JSON body for POST/PUT/PATCH
  headers?: Record<string, string>; // Optional extra headers
}

// Output type for passthrough responses
interface FatZebraPassthroughResponse {
  successful: boolean;
  status: number;
  response: any;
  errors?: string[];
}

/**
 * General Fat Zebra Passthrough Tool
 * Allows sending any supported Fat Zebra API request and returns the raw response.
 * Strict input validation and logging for security.
 */
class FatZebraPassthroughTool extends MCPTool<FatZebraPassthroughInput> {
  name = "fat_zebra_passthrough";
  description = "Send any supported Fat Zebra API request (method, endpoint, body, headers) and receive the raw response. Strict input validation and logging for security.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  // Input schema using zod
  schema = {
    method: {
      type: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
      description: "HTTP method to use for the Fat Zebra API request.",
    },
    endpoint: {
      type: z.string().regex(/^\//),
      description: "Fat Zebra API endpoint (must start with a slash, e.g. /purchases)",
    },
    body: {
      type: z.any().optional(),
      description: "Request body for POST/PUT/PATCH requests (JSON object)",
    },
    headers: {
      type: z.record(z.string(), z.string()).optional(),
      description: "Additional headers to include (optional)",
    },
  };

  async execute(input: FatZebraPassthroughInput): Promise<FatZebraPassthroughResponse> {
    // Validate endpoint
    if (!input.endpoint.startsWith("/")) {
      return { successful: false, status: 400, response: null, errors: ["Endpoint must start with a slash."] };
    }
    if (input.endpoint.includes("..")) {
      return { successful: false, status: 400, response: null, errors: ["Endpoint must not contain '..'"] };
    }
    // Build URL and method
    const url = `${this.baseUrl}${input.endpoint}`;
    const method = input.method.toUpperCase();
    // Merge headers, always set auth and content-type
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
      ...(input.headers || {})
    };
    // Log the request (redact sensitive data)
    const logInput = { ...input, headers: undefined, body: input.body ? "[REDACTED]" : undefined };
    console.log(`[FatZebraPassthroughTool] Request:`, logInput);
    try {
      const fetchOptions: any = { method, headers };
      if (["POST", "PUT", "PATCH"].includes(method) && input.body) {
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
      console.log(`[FatZebraPassthroughTool] Response:`, typeof responseData === "string" ? responseData.slice(0, 500) : responseData);
      return {
        successful: response.ok,
        status: response.status,
        response: responseData,
        errors: response.ok ? undefined : [typeof responseData === "string" ? responseData : (responseData.errors || "Unknown error from Fat Zebra API")],
      };
    } catch (error) {
      console.error(`[FatZebraPassthroughTool] Error:`, error);
      return { successful: false, status: 500, response: null, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraPassthroughTool; 