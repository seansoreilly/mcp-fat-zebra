import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";

interface FatZebraReconciliationReportInput {
  date: string; // YYYY-MM-DD
  format?: "json" | "csv";
}

interface FatZebraReconciliationReportResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraReconciliationReportTool extends MCPTool<FatZebraReconciliationReportInput> {
  name = "fat_zebra_reconciliation_report";
  description = "Download or generate reconciliation reports for a given date using the Fat Zebra payment gateway.";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    date: {
      type: z.string(),
      description: "The settlement date for the report (YYYY-MM-DD)",
    },
    format: {
      type: z.enum(["json", "csv"]).optional(),
      description: "The format of the report: json or csv (default: json)",
    },
  };

  async execute(input: FatZebraReconciliationReportInput) {
    try {
      const params = new URLSearchParams();
      if (input.format) params.append("format", input.format);
      const url = `${this.baseUrl}/settlements/${encodeURIComponent(input.date)}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`,
        },
      });
      // If CSV, return as text, else as JSON
      if (input.format === "csv") {
        const text = await response.text();
        if (!text || response.status >= 400) {
          return { successful: false, errors: [text || "Unknown error from Fat Zebra API"] };
        }
        return { successful: true, response: text };
      } else {
        const data = await response.json() as any;
        if (!data.successful) {
          return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
        }
        return { successful: true, response: data.response };
      }
    } catch (error) {
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraReconciliationReportTool; 