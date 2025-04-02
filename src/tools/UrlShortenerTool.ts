import { MCPTool } from "mcp-framework";
import { z } from "zod";
import crypto from "crypto";

interface UrlShortenerInput {
  action: string;
  url?: string;
  shortCode?: string;
}

class UrlShortenerTool extends MCPTool<UrlShortenerInput> {
  name = "url_shortener";
  description = "Create and resolve shortened URLs";

  private urlDatabase: Map<string, string> = new Map();

  schema = {
    action: {
      type: z.enum(["shorten", "resolve"]),
      description: "Action to perform (shorten a long URL or resolve a short code)",
    },
    url: {
      type: z.string().url().optional(),
      description: "The URL to shorten (required for 'shorten' action)",
    },
    shortCode: {
      type: z.string().optional(),
      description: "The short code to resolve (required for 'resolve' action)",
    },
  };

  async execute(input: UrlShortenerInput) {
    const { action, url, shortCode } = input;
    
    switch (action) {
      case "shorten": {
        if (!url) {
          throw new Error("URL is required for 'shorten' action");
        }
        
        // Generate a short code (6 characters)
        const generatedCode = crypto
          .createHash("md5")
          .update(url + Date.now().toString())
          .digest("hex")
          .substring(0, 6);
        
        this.urlDatabase.set(generatedCode, url);
        
        return {
          original: url,
          shortCode: generatedCode,
          shortUrl: `https://short.example.com/${generatedCode}`
        };
      }
      
      case "resolve": {
        if (!shortCode) {
          throw new Error("Short code is required for 'resolve' action");
        }
        
        const originalUrl = this.urlDatabase.get(shortCode);
        if (!originalUrl) {
          throw new Error(`No URL found for short code: ${shortCode}`);
        }
        
        return {
          shortCode,
          originalUrl
        };
      }
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }
}

export default UrlShortenerTool; 