import { MCPTool } from "mcp-framework";
import { z } from "zod";
import crypto from "crypto";

interface FatZebraWebhookInput {
  payload: string;
  signature: string;
  verify_signature?: boolean;
  secret_key?: string;
  event_type?: string;
}

// Define webhook payload interface
interface WebhookPayload {
  event: string;
  payload: {
    id: string;
    transaction_id?: string;
    reference?: string;
    amount?: number;
    card_token?: string;
    status?: string;
    successful?: boolean;
    message?: string;
    [key: string]: any;
  };
  webhook_id: string;
  timestamp: string;
  signature: string;
  test: boolean;
}

class FatZebraWebhookTool extends MCPTool<FatZebraWebhookInput> {
  name = "fat_zebra_webhook_handler";
  description = "Handle and verify Fat Zebra payment gateway webhooks";
  
  // Secret key for verifying webhook signatures
  private defaultSecretKey = process.env.FAT_ZEBRA_WEBHOOK_SECRET || "your-webhook-secret";
  
  schema = {
    payload: {
      type: z.string(),
      description: "The JSON payload received from Fat Zebra webhook",
    },
    signature: {
      type: z.string(),
      description: "The signature header received with the webhook",
    },
    verify_signature: {
      type: z.boolean().default(true),
      description: "Whether to verify the webhook signature (default: true)",
    },
    secret_key: {
      type: z.string().optional(),
      description: "The secret key used to verify the webhook signature (optional, uses environment variable by default)",
    },
    event_type: {
      type: z.string().optional(),
      description: "Filter processing to a specific event type only (optional)",
    }
  };

  // Verify webhook signature
  private verifySignature(payload: string, signature: string, secretKey: string): boolean {
    try {
      // Fat Zebra uses HMAC-SHA256 for signatures
      const calculatedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');
      
      // Compare signatures in a timing-safe manner
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  async execute(input: FatZebraWebhookInput) {
    try {
      // Parse the webhook payload
      const webhookData: WebhookPayload = JSON.parse(input.payload);
      
      // Verify signature if enabled
      if (input.verify_signature) {
        const secretKey = input.secret_key || this.defaultSecretKey;
        
        const isValidSignature = this.verifySignature(
          input.payload,
          input.signature,
          secretKey
        );
        
        if (!isValidSignature) {
          return {
            successful: false,
            verified: false,
            errors: ["Invalid webhook signature"]
          };
        }
      }
      
      // Check if we need to filter for a specific event type
      if (input.event_type && webhookData.event !== input.event_type) {
        return {
          successful: true,
          verified: true,
          processed: false,
          message: `Event type ${webhookData.event} does not match requested type ${input.event_type}`,
          event: webhookData.event
        };
      }
      
      // Process the webhook based on event type
      // In a real implementation, you would handle different events differently
      switch (webhookData.event) {
        case 'purchase.approved':
        case 'purchase.declined':
        case 'purchase.flagged':
          return {
            successful: true,
            verified: true,
            processed: true,
            event: webhookData.event,
            transaction_id: webhookData.payload.transaction_id,
            reference: webhookData.payload.reference,
            amount: webhookData.payload.amount,
            status: webhookData.payload.status || webhookData.event.split('.')[1],
            message: webhookData.payload.message || `Transaction ${webhookData.event.split('.')[1]}`,
            test: webhookData.test
          };
          
        case 'refund.approved':
        case 'refund.declined':
          return {
            successful: true,
            verified: true,
            processed: true,
            event: webhookData.event,
            transaction_id: webhookData.payload.transaction_id,
            reference: webhookData.payload.reference,
            amount: webhookData.payload.amount,
            status: webhookData.payload.status || webhookData.event.split('.')[1],
            message: webhookData.payload.message || `Refund ${webhookData.event.split('.')[1]}`,
            test: webhookData.test
          };
          
        case 'tokenization.successful':
        case 'tokenization.failed':
          return {
            successful: true,
            verified: true,
            processed: true,
            event: webhookData.event,
            card_token: webhookData.payload.card_token,
            message: webhookData.payload.message || `Card tokenization ${webhookData.event.split('.')[1]}`,
            test: webhookData.test
          };
          
        default:
          // Generic handler for any other event types
          return {
            successful: true,
            verified: true,
            processed: true,
            event: webhookData.event,
            data: webhookData.payload,
            test: webhookData.test,
            message: `Processed webhook event: ${webhookData.event}`
          };
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Return error as a response 
      return {
        successful: false,
        verified: false,
        processed: false,
        errors: [(error instanceof Error ? error.message : String(error))]
      };
    }
  }
}

export default FatZebraWebhookTool; 