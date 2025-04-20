# Plan for Expanding Fat Zebra-Specific MCP Tools

## Overview

This plan focuses on expanding the set of MCP tools that interact directly with the Fat Zebra gateway, enabling richer and more flexible integration for MCP clients. The goal is to expose more of the Fat Zebra API surface, support advanced payment operations, and provide a general-purpose passthrough tool for custom requests.

## Current Fat Zebra Tools

- FatZebraPaymentTool: Credit card payments
- FatZebraDirectDebitTool: Direct debit payments
- FatZebraTokenPaymentTool: Token-based payments
- FatZebraTokenizeTool: Card tokenization
- FatZebraRefundTool: Refunds
- FatZebra3DSecureTool: 3D Secure authentication

## Prioritized Fat Zebra Tool Additions

### 1. Transaction & Query Tools

- **transaction_status**: Query the status/details of a transaction by ID or reference
- **list_transactions**: List/search transactions with filters (date, status, amount, etc.)
- **transaction_history**: Retrieve the full history/events for a transaction
- **search_refunds**: Search for refunds by transaction or date

### 2. Batch & Reconciliation Tools

- **create_batch**: Initiate a batch settlement
- **list_batches**: List batches and their statuses
- **batch_details**: Retrieve details for a specific batch
- **reconciliation_report**: Download or generate reconciliation reports

### 3. Card & Customer Management Tools

- **store_card**: Store a card for future use (vault/tokenize)
- **list_stored_cards**: List stored cards for a customer
- **delete_stored_card**: Remove a stored card
- **update_customer**: Update customer details in Fat Zebra

### 4. Webhook & Notification Tools

- **list_webhooks**: List configured webhooks
- **create_webhook**: Register a new webhook endpoint
- **delete_webhook**: Remove a webhook
- **test_webhook**: Trigger a test webhook event

### 5. General Fat Zebra Passthrough Tool

- **fatzebra_passthrough**: Allows the MCP client to send any supported Fat Zebra API request (method, endpoint, body, headers) and receive the raw response. This enables advanced or future use cases without waiting for a dedicated tool implementation.

**Implementation Details:**

- Inherits from `MCPTool` and uses `zod` for input validation.
- Accepts the following input fields:
  - `method`: One of `GET`, `POST`, `PUT`, `DELETE`, `PATCH` (required)
  - `endpoint`: The Fat Zebra API endpoint (must start with `/`, e.g. `/purchases`) (required)
  - `body`: JSON object for POST/PUT/PATCH requests (optional)
  - `headers`: Additional headers to include (optional)
- Merges user headers with required authentication and content-type headers.
- Logs requests and responses with sensitive data redacted.
- Returns the raw response and HTTP status code.
- Strictly validates input to prevent directory traversal and other unsafe patterns.
- Handles and reports errors robustly.

**Example Usage:**

```json
{
  "method": "POST",
  "endpoint": "/purchases",
  "body": {
    "amount": 1000,
    "currency": "AUD",
    "card_number": "5123456789012346",
    "card_expiry": "05/2026",
    "card_cvv": "123",
    "reference": "ref-123456"
  }
}
```

**Security Notes:**

- Only allows requests to the configured Fat Zebra API base URL.
- All inputs are validated and sanitized.
- Sensitive data is redacted in logs and responses.
- Intended for advanced use cases; prefer dedicated tools for common operations when possible.

## Best Practices for Fat Zebra Tool Implementation

- Use clear, descriptive names and descriptions
- Define input schemas with zod/JSON Schema, matching Fat Zebra API docs
- Validate and sanitize all inputs, especially for passthrough tool
- Implement proper error handling and reporting
- Use tool annotations (readOnlyHint, destructiveHint, etc.)
- Document expected return values and provide examples
- Log tool usage for debugging and monitoring
- Implement access control and rate limiting where needed
- Ensure sensitive data is redacted in logs and responses

## Next Steps

1. Review and approve this plan
2. Implement the highest-priority Fat Zebra tools (transaction queries, passthrough)
3. Add batch, card, webhook, and customer tools as needed
4. Continuously review, test, and document all Fat Zebra tools

---

_Last updated: 2024-06-11_
