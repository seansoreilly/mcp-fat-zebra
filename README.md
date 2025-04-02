# MCP Fat Zebra Integration

This is an MCP (Multi-Channel Payments) server that provides integration with the [Fat Zebra](https://docs.fatzebra.com/) payment gateway.

## Features

- **Credit Card Payments**: Process direct credit card payments
- **Tokenization**: Securely tokenize cards for future payments
- **Token Payments**: Process payments using tokenized cards
- **Refunds**: Process refunds for previous transactions

## Setup

### Prerequisites

- Node.js 18.19.0 or higher
- Fat Zebra merchant account and API credentials

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Configuration

Set the following environment variables before starting the server:

- `FAT_ZEBRA_USERNAME`: Your Fat Zebra username (defaults to "TEST" for sandbox testing)
- `FAT_ZEBRA_TOKEN`: Your Fat Zebra API token (defaults to "TEST" for sandbox testing)
- `FAT_ZEBRA_API_URL` (optional): Fat Zebra API URL (defaults to sandbox: https://gateway.sandbox.fatzebra.com.au/v1.0)

Example:

```bash
export FAT_ZEBRA_USERNAME=your-username
export FAT_ZEBRA_TOKEN=your-token
```

For production:

```bash
export FAT_ZEBRA_API_URL=https://gateway.fatzebra.com/v1.0
export FAT_ZEBRA_USERNAME=your-production-username
export FAT_ZEBRA_TOKEN=your-production-token
```

### Running the server

```bash
npm start
```

## Available Tools

### 1. Credit Card Payment

Process a direct credit card payment.

```typescript
// Example usage
const result = await client.call("fat_zebra_payment", {
  amount: 1000, // $10.00
  currency: "AUD", // Optional, defaults to "AUD" if not specified
  card_number: "4111111111111111",
  card_expiry: "12/2025",
  card_cvv: "123",
  reference: "ORDER-123",
  customer_name: "John Smith", // Optional
  customer_email: "john@example.com", // Optional
  customer_ip: "127.0.0.1", // Optional, defaults to "127.0.0.1"
});
```

### 2. Tokenize Card

Tokenize a credit card for future use.

```typescript
// Example usage
const result = await client.call("fat_zebra_tokenize", {
  card_number: "4111111111111111",
  card_expiry: "12/2025",
  card_cvv: "123",
  card_holder: "John Smith",
});
```

### 3. Token Payment

Process a payment using a tokenized card.

```typescript
// Example usage
const result = await client.call("fat_zebra_token_payment", {
  amount: 1000, // $10.00
  currency: "AUD",
  card_token: "card-token-from-tokenization",
  reference: "ORDER-124",
  cvv: "123", // Optional for token payments
  customer_name: "John Smith", // Optional
  customer_email: "john@example.com", // Optional
  customer_ip: "127.0.0.1", // Optional, defaults to "127.0.0.1"
});
```

### 4. Process Refund

Refund a previous transaction.

```typescript
// Example usage
const result = await client.call("fat_zebra_refund", {
  transaction_id: "transaction-id-from-payment",
  amount: 1000, // $10.00
  reference: "REFUND-123",
});
```

## Testing

Fat Zebra provides a sandbox environment and test cards for development:

- Test Card: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/2025)
- CVV: Any 3-digit number (e.g., 123)

For more test cases, refer to the [Fat Zebra documentation](https://docs.fatzebra.com/).

## License

MIT
