import { z } from "zod";
import fetch from "node-fetch";

// Define input interface
interface FatZebraReconciliationReportInput {
  date: string; // YYYY-MM-DD
  format?: "json" | "csv";
}

/**
 * Fat Zebra Reconciliation Report Tool
 * Download or generate reconciliation reports for a given date using the Fat Zebra payment gateway.
 */
const FatZebraReconciliationReportTool = {
  name: "fat_zebra_reconciliation_report",
  description: "Download or generate reconciliation reports for a given date using the Fat Zebra payment gateway.",
  
  // Input schema using zod
  schema: {
    date: z.string().describe("The settlement date for the report (YYYY-MM-DD)"),
    format: z.enum(["json", "csv"]).optional().describe("The format of the report: json or csv (default: json)"),
  },
  
  // Execute function that will be called when the tool is used
  execute: async ({ date, format }: FatZebraReconciliationReportInput) => {
    try {
      // Fat Zebra API configuration
      const baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
      const username = process.env.FAT_ZEBRA_USERNAME || "TEST";
      const token = process.env.FAT_ZEBRA_TOKEN || "TEST";
      
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (format) params.append("format", format);
      const url = `${baseUrl}/settlements/${encodeURIComponent(date)}${params.toString() ? '?' + params.toString() : ''}`;
      
      // Log the request
      console.log(`[FatZebraReconciliationReportTool] Retrieving reconciliation report for date: ${date}, format: ${format || 'json'}`);
      
      // Make the request to the Fat Zebra API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        },
      });
      
      // Handle different response formats
      if (format === "csv") {
        // For CSV format, return as text
        const text = await response.text();
        
        // Log the response
        console.log(`[FatZebraReconciliationReportTool] Response: ${response.ok ? "Success" : "Failed"}`);
        
        if (!text || response.status >= 400) {
          return { 
            content: [{ 
              type: "text", 
              text: JSON.stringify({
                successful: false,
                status: response.status,
                response: null,
                errors: [text || "Unknown error from Fat Zebra API"]
              })
            }]
          };
        }
        
        // Return CSV content
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              successful: true,
              status: response.status,
              response: text,
              errors: undefined
            })
          }]
        };
      } else {
        // For JSON format, parse the response
        const data = await response.json() as any;
        
        // Log the response
        console.log(`[FatZebraReconciliationReportTool] Response: ${data.successful ? "Success" : "Failed"}`);
        
        if (!data.successful) {
          return { 
            content: [{ 
              type: "text", 
              text: JSON.stringify({
                successful: false,
                status: response.status,
                response: null,
                errors: data.errors || ["Unknown error from Fat Zebra API"]
              })
            }]
          };
        }
        
        // Return the JSON response
        const result = {
          successful: data.successful,
          status: response.status,
          response: data.response,
          errors: undefined
        };
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(result)
          }]
        };
      }
    } catch (error) {
      console.error('[FatZebraReconciliationReportTool] Error:', error);
      
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

export default FatZebraReconciliationReportTool;