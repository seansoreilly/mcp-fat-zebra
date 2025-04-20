import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

interface FatZebraCreateBatchInput {
  file: Buffer | string; // Buffer or file path
  batch_type: "purchase" | "refund" | "direct_debit";
  reference?: string; // Optional reference for the filename
  date?: string; // Optional date in YYYYMMDD format
  username?: string; // Optional override for merchant username
}

interface FatZebraCreateBatchResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraCreateBatchTool extends MCPTool<FatZebraCreateBatchInput> {
  name = "fat_zebra_create_batch";
  description = "Initiate a batch settlement by uploading a CSV file to Fat Zebra. Accepts batch_type (purchase, refund, direct_debit).";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.pmnts-sandbox.io/v1.0";
  private username = process.env.FAT_ZEBRA_USERNAME || "TEST";
  private token = process.env.FAT_ZEBRA_TOKEN || "TEST";

  schema = {
    file: {
      type: z.any(),
      description: "The CSV file to upload (Buffer or file path)",
    },
    batch_type: {
      type: z.enum(["purchase", "refund", "direct_debit"]),
      description: "The type of batch: purchase, refund, or direct_debit.",
    },
    reference: {
      type: z.string().optional(),
      description: "Optional reference for the batch filename.",
    },
    date: {
      type: z.string().optional(),
      description: "Optional date in YYYYMMDD format for the batch filename.",
    },
    username: {
      type: z.string().optional(),
      description: "Optional override for merchant username in the batch filename.",
    },
  };

  async execute(input: FatZebraCreateBatchInput) {
    try {
      const form = new FormData();
      let fileContent: Buffer;
      if (Buffer.isBuffer(input.file)) {
        fileContent = input.file;
      } else if (typeof input.file === "string") {
        fileContent = fs.readFileSync(input.file);
      } else {
        return { successful: false, errors: ["Invalid file input: must be Buffer or file path"] };
      }
      // Build filename according to convention
      const version = "v1";
      const typeMap: Record<string, string> = {
        purchase: "PURCHASE",
        refund: "REFUND",
        direct_debit: "DIRECTDEBIT",
      };
      const type = typeMap[input.batch_type];
      const username = input.username || this.username;
      // Date in YYYYMMDD
      let date = input.date;
      if (!date) {
        const now = new Date();
        date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      }
      // Reference: use input or random string
      let reference = input.reference;
      if (!reference) {
        reference = Math.random().toString(36).substring(2, 10);
      }
      const filename = `BATCH-${version}-${type}-${username}-${date}-${reference}.csv`;
      form.append("file", fileContent, { filename, contentType: "text/csv" });
      // Endpoint URL with filename
      const url = `${this.baseUrl}/batches/${filename}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...form.getHeaders(),
          "Authorization": `Basic ${Buffer.from(`${username}:${this.token}`).toString("base64")}`,
        },
        body: form,
      });
      // Try to parse JSON, fallback to text
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
      if (!response.ok) {
        return { successful: false, errors: [typeof data === "string" ? data : (data.errors || JSON.stringify(data))] };
      }
      return { successful: true, response: data };
    } catch (error) {
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraCreateBatchTool; 