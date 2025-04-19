import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

interface FatZebraCreateBatchInput {
  file: Buffer | string; // Buffer or file path
  batch_type: "purchase" | "refund" | "direct_debit";
  metadata?: Record<string, string>;
}

interface FatZebraCreateBatchResponse {
  successful: boolean;
  errors?: string[];
  response?: any;
}

class FatZebraCreateBatchTool extends MCPTool<FatZebraCreateBatchInput> {
  name = "fat_zebra_create_batch";
  description = "Initiate a batch settlement by uploading a CSV file to Fat Zebra. Accepts batch_type (purchase, refund, direct_debit).";

  private baseUrl = process.env.FAT_ZEBRA_API_URL || "https://gateway.sandbox.fatzebra.com.au/v1.0";
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
    metadata: {
      type: z.record(z.string()).optional(),
      description: "Optional metadata to include with the batch.",
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
      form.append("file", fileContent, { filename: `batch.csv`, contentType: "text/csv" });
      form.append("batch_type", input.batch_type);
      if (input.metadata) {
        form.append("metadata", JSON.stringify(input.metadata));
      }
      const url = `${this.baseUrl}/batches`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...form.getHeaders(),
          "Authorization": `Basic ${Buffer.from(`${this.username}:${this.token}`).toString("base64")}`,
        },
        body: form,
      });
      const data = await response.json();
      if (!data.successful) {
        return { successful: false, errors: data.errors || ["Unknown error from Fat Zebra API"] };
      }
      return { successful: true, response: data.response };
    } catch (error) {
      return { successful: false, errors: [(error instanceof Error ? error.message : String(error))] };
    }
  }
}

export default FatZebraCreateBatchTool; 